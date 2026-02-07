


from contextlib import asynccontextmanager
from datetime import date
from typing import Annotated
from fastapi import Depends, FastAPI, HTTPException, Response
from sqlalchemy import ForeignKey, ForeignKeyConstraint, PrimaryKeyConstraint
from sqlmodel import VARCHAR, Column, Field, SQLModel, Session, create_engine, select
from fastapi.middleware.cors import CORSMiddleware
import os 
from dotenv import load_dotenv


class robots(SQLModel , table=True) :
    id : int = Field(primary_key=True)
    name : str = Field(sa_column=Column(VARCHAR(50) , unique=True))
    type : str = Field(sa_column=Column(VARCHAR(50)))
    created_at : date = Field(default_factory=lambda : date.today())

class parts(SQLModel , table=True) :
    robot_id : int = Field(sa_column=Column(ForeignKey("robots.id")))
    id : int | None = Field(default=None)
    name : str = Field(sa_column=Column(VARCHAR(50)))
    quantity : int = Field(default=1)
    last_checked : date = Field(default_factory=lambda : date.today())
    __table_args__ = (
        PrimaryKeyConstraint("robot_id" , "id") ,
    )

class maintenance_logs(SQLModel , table=True) :
    id : int = Field(primary_key=True) 
    robot_id : int 
    parts_id : int | None = None 
    description : str = Field(sa_column=Column(VARCHAR(200)))
    log_date : date = Field(default_factory=lambda : date.today()) # type: ignore
    done_by : str = Field(sa_column=Column(VARCHAR(50)))
    __table_args__ = (
        ForeignKeyConstraint(["robot_id"] , ["robots.id"]) ,
        ForeignKeyConstraint(["robot_id" , "parts_id"] , ["parts.robot_id" , "parts.id"])
        )
    
class create_update_robots(SQLModel) :
    name: str | None = None
    type: str | None = None
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "name": "...",
                    "type": "..."
                }
            ]
        }
    }

class create_update_parts(SQLModel) :
    name: str | None = None
    quantity: int | None = None
    last_checked: date | None = None
    model_config = {
        "json_schema_extra" : {
            "examples": [
                {
                    "name": "..." ,
                    "quantity": 1
                }
            ]
        } 
    }
    
class create_maintenance_log(SQLModel) :
    parts_id : int | None = None
    description : str
    done_by : str
    model_config = {
        "json_schema_extra" : {
            "examples": [
                {
                    "description" : "..." ,
                    "done_by" : "..."
                }
            ]
        } 
    }

load_dotenv()
 
USERNAME = os.environ.get("DB_USER")
PORT = os.environ.get("DB_PORT")
DATABASE = os.environ.get("DB_NAME")
PASSWORD = os.environ.get("DB_PASSWORD")
HOST = os.environ.get("DB_HOST")

DATABAS_URL = f"postgresql://{USERNAME}:{PASSWORD}@{HOST}:{PORT}/{DATABASE}"
engine = create_engine(DATABAS_URL)

def sessions() :
    with Session(engine) as sessions :
        yield sessions

SessionDep = Annotated[Session , Depends(sessions)]

@asynccontextmanager 
async def lifespan(app : FastAPI) :
    yield

app = FastAPI(root_path="/ROBOHUB" , lifespan=lifespan)

@app.get("/robots")
async def get_all_robots(session: SessionDep) :
    data = session.exec(select(robots)).all()
    return data 

@app.get("/robots/{id}")
async def get_specific_robot(id: int , session:  SessionDep) :
    data = session.get(robots , id)
    if not data :
        return HTTPException(status_code=404)
    return data 

@app.post("/robots")
async def add_robot(body: create_update_robots , session: SessionDep):
    new_robot = robots(**body.model_dump())
    session.add(new_robot)
    session.commit()
    session.refresh(new_robot)
    return {"new_robot" : new_robot}

@app.patch("/robots/{id}")
async def update_robot(id: int , body: create_update_robots , session: SessionDep):
    data = session.get(robots , id)
    if not data :
        raise HTTPException(status_code=404)
    updates = body.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400,detail="No fields provided for update")
    for field , values in updates.items() :
        setattr(data , field , values)
    try : 
        session.commit()
    except Exception:
        session.rollback() 

    session.refresh(data)
    return {"updated version" : data}

@app.delete("/robots/{id}")
async def delete_robot(id: int , session: SessionDep):
    data = session.get(robots , id)
    if not data :
        return HTTPException(status_code=404)
    maintenance_logs_data = session.exec(select(maintenance_logs).where(maintenance_logs.robot_id == id)).all()
    for logs in maintenance_logs_data :
        session.delete(logs)
    parts_data = session.exec(select(parts).where(parts.robot_id == id)).all()
    for part in parts_data :
        session.delete(part)
    session.delete(data)
    session.commit()
    return Response(status_code=204)

@app.get("/robots/{robot_id}/parts")
async def get_robot_parts(robot_id: int , session: SessionDep): # type: ignore
    robot_data = session.get(robots , robot_id)
    if not robot_data :
        raise HTTPException(status_code=404 , detail="robot doesn't exist")
    results = session.exec(select(parts.id , parts.name , parts.quantity , parts.last_checked).where(parts.robot_id == robot_id)).all() # type: ignore
    data = [ # type: ignore
        {
            "id": row[0],
            "name": row[1],
            "quantity": row[2],
            "last_checked": row[3]
        }
        for row in results # type: ignore
    ]
    return {"robot's id" : robot_id , "robot's parts" : data} # type: ignore

@app.get("/robots/{robot_id}/parts/{id}")
async def get_part_of_robot(robot_id: int , id: int , session: SessionDep): # type: ignore
    robot_data = session.get(robots , robot_id)
    if not robot_data :
        raise HTTPException(status_code=404 , detail="robot doesn't exist")
    data = session.get(parts , (robot_id , id))
    if not data :
        raise HTTPException(status_code=404 , detail="part doesn't exist")
    part_data = { # type: ignore
        "id" : data.id ,
        "name" : data.name ,
        "quantity" : data.quantity ,
        "last_checked" : data.last_checked
    }
    return {"robot's id" : robot_id , "part" : part_data} # type: ignore

@app.post("/robots/{robot_id}/parts")
async def add_part_in_a_robot(robot_id: int , body:  create_update_parts,session: SessionDep): # type: ignore
    data = session.get(robots , robot_id)
    if not data : 
        raise HTTPException(status_code=404 , detail="robot doesn't exist")
    new_part = parts(robot_id=robot_id,**body.model_dump())
    session.add(new_part)
    session.flush()
    
    data = { # type: ignore
        "name": new_part.name ,
        "quantity": new_part.quantity ,
        "last_checked": new_part.last_checked
        }
    
    session.commit()

    return { "message" : "part successfully added" , "part" : data } # type: ignore

@app.patch("/robots/{robot_id}/parts/{id}")
async def update_part(robot_id: int , id: int , body: create_update_parts , session: SessionDep ):
    data = session.get(parts , (robot_id , id))
    if not data :
        raise HTTPException(status_code=404 , detail="part or robot doesn't exist")
    update = body.model_dump(exclude_unset=True)
    if not update :
        raise HTTPException(status_code=404 , detail="no field provided")
    for field , value in update.items() :
        setattr(data , field , value) 
    try : 
        session.commit()
    except Exception :
        session.rollback()
    session.refresh(data)
    return {"updated version of part" : data}

@app.delete("/robots/{robot_id}/parts/{id}")
async def delete_part(robot_id: int , id: int , session: SessionDep):
    robot_data = session.get(robots , robot_id)
    if not robot_data :
        raise HTTPException(status_code=404 , detail="robot doesn't exist")
    part_data = session.get(parts , (robot_id , id))
    if not part_data :
        raise HTTPException(status_code=404 , detail="part doesn't exist")
    session.delete(part_data)
    session.commit()
    return Response(status_code=204)

@app.get("/maintenance_logs")
async def get_maintenance_logs(session: SessionDep):
    data = session.exec(select(maintenance_logs)).all()
    return {"all maintenance logs" : data}

@app.get("/maintenance_logs/{id}")
async def get_maintenance_log(id: int , session: SessionDep):
    data = session.get(maintenance_logs , id)
    return {"robot's maintenance logs" : data}

@app.get("/robots/{robot_id}/maintenance_logs")
async def get_maintenance_logs_of_a_robot(robot_id: int, session: SessionDep , parts: bool): # type: ignore
    if parts is True :
        results = session.exec(select(maintenance_logs.parts_id , maintenance_logs.id , maintenance_logs.description , maintenance_logs.log_date , maintenance_logs.done_by).where(maintenance_logs.robot_id == robot_id)).all() # type: ignore
    if parts is False :
        results = session.exec(select(maintenance_logs.parts_id , maintenance_logs.id , maintenance_logs.description , maintenance_logs.log_date , maintenance_logs.done_by).where(maintenance_logs.robot_id == robot_id , maintenance_logs.parts_id == None)).all() # type: ignore
    data = [ # type: ignore
        {
            "parts_id" : row[0] ,
            "id" : row[1] ,
            "description" : row[2] ,
            "log_date" : row[3] ,
            "done_by" : row[4] ,
        } for row in results # type: ignore
    ] 
    return {"robot's maintenance logs" : data} # type: ignore

@app.post("/robots/{robot_id}/maintenance_logs")
async def add_maintenance_log(robot_id: int , body: create_maintenance_log , session: SessionDep) :
    new_maintenance_log = maintenance_logs(robot_id=robot_id , **body.model_dump())
    session.add(new_maintenance_log)
    session.commit()
    session.refresh(new_maintenance_log)
    return {"logs" : new_maintenance_log}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:8080" , "http://localhost:8080"],      
    allow_credentials=True,
    allow_methods=["*"],         
    allow_headers=["*"],          
)
