# Robohub - Robot Management System

A full-stack robot management system designed to track robots, their components, and maintenance logs. Built with FastAPI and PostgreSQL, Robohub is ideal for robotics labs, automation companies, or anyone needing a structured way to manage multiple robots and their parts.

## Features

- **Robot Management**: Create, update, delete, and list robots
- **Parts Tracking**: Add, update, delete, and retrieve parts for each robot
- **Maintenance Logs**: Record and retrieve maintenance history
- **RESTful API**: API-based integration with frontend or external clients
- **CORS-Enabled**: Ready for local frontend testing
- **Secure Configuration**: Environment-based database credentials

## Tech Stack

- **Backend**: Python 3.12, FastAPI, SQLModel, SQLAlchemy
- **Database**: PostgreSQL
- **Frontend**: HTML, CSS, JavaScript
- **Environment**: Python virtualenv, python-dotenv

## Project Structure

```
ROBOHUB/
├── frontend/              # Frontend files
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── api.js
│   ├── utils.js
│   └── config.js
├── main.py                # FastAPI backend application
├── DB_schema.sql          # Database schema
├── .env.example           # Example environment variables
├── .gitignore             # Git ignore file
├── requirements.txt       # Python dependencies
└── README.md              # This file
```

## Setup Instructions

### Prerequisites

- Python 3.12 or higher
- PostgreSQL database
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Robohub.git
cd Robohub
```

### 2. Create and Activate Virtual Environment

**Windows:**
```bash
python -m venv venv
.\venv\Scripts\activate
```

**Linux/macOS:**
```bash
python -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Copy the example environment file:

**Windows:**
```bash
copy .env.example .env
```

**Linux/macOS:**
```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:

```env
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=exercise
```

### 5. Setup Database

Create the database and run the schema:

```bash
psql -U your_user -d your_database -f DB_schema.sql
```

## Running the Application

### Start the Backend

```bash
uvicorn main:app --reload
```

The backend will run at `http://127.0.0.1:8000`

### Access the Frontend

1. Open `frontend/index.html` in your browser
2. Ensure `frontend/config.js` has the correct backend URL:

```javascript
const BASE_URL = "http://127.0.0.1:8000/ROBOHUB";
```

## API Endpoints

### Robots

| Endpoint       | Method | Description                              |
|----------------|--------|------------------------------------------|
| `/robots`      | GET    | List all robots                          |
| `/robots/{id}` | GET    | Get a specific robot                     |
| `/robots`      | POST   | Add a new robot                          |
| `/robots/{id}` | PATCH  | Update robot information                 |
| `/robots/{id}` | DELETE | Delete robot and associated parts & logs |

### Parts

| Endpoint                        | Method | Description              |
|---------------------------------|--------|--------------------------|
| `/robots/{robot_id}/parts`      | GET    | Get all parts of a robot |
| `/robots/{robot_id}/parts/{id}` | GET    | Get a specific part      |
| `/robots/{robot_id}/parts`      | POST   | Add a part to a robot    |
| `/robots/{robot_id}/parts/{id}` | PATCH  | Update a part            |
| `/robots/{robot_id}/parts/{id}` | DELETE | Delete a part            |

### Maintenance Logs

| Endpoint                              | Method | Description                                       |
|---------------------------------------|--------|---------------------------------------------------|
| `/maintenance_logs`                   | GET    | List all maintenance logs                         |
| `/maintenance_logs/{id}`              | GET    | Get a specific maintenance log                    |
| `/robots/{robot_id}/maintenance_logs` | GET    | Get logs for a robot (with optional parts filter) |
| `/robots/{robot_id}/maintenance_logs` | POST   | Add a maintenance log                             |

## Development Notes

- **Security**: Never commit `.env` file; use `.env.example` as a template
- **Python Cache**: `__pycache__/` is automatically ignored by Git
- **Dependencies**: Update `requirements.txt` when adding new packages:
  ```bash
  pip freeze > requirements.txt
  ```

## Best Practices

- Keep credentials and secrets out of version control
- Use environment variables for configuration
- Provide clear setup instructions for collaborators
- Include example/dummy data for easy testing
- Commit only tracked, clean files

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Contact

Yacine Zougar - zougaryacine9@gmail.com

Project Link: [https://github.com/YacineZougar/Robohub](https://github.com/YacineZougar/Robohub)

## Acknowledgments

- FastAPI for the excellent web framework
- PostgreSQL for robust database management
- SQLModel for simplified database operations

