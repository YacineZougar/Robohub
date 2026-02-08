
-- ---------------- --
-- ROBOHUB DATABASE --
-- ---------------- --

-- Table: robots
CREATE TABLE robots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    created_at DATE DEFAULT CURRENT_DATE
);

-- Table: parts
CREATE TABLE parts (
    robot_id INT NOT NULL,
    id SERIAL NOT NULL,
    name VARCHAR(50) NOT NULL,
    quantity INT DEFAULT 1,
    last_checked DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (robot_id, id),
    FOREIGN KEY (robot_id) REFERENCES robots(id)
);

-- Table: maintenance_logs
CREATE TABLE maintenance_logs (
    id SERIAL PRIMARY KEY,
    robot_id INT NOT NULL,
    parts_id INT,
    description VARCHAR(200) NOT NULL,
    log_date DATE DEFAULT CURRENT_DATE,
    done_by VARCHAR(50) NOT NULL,
    FOREIGN KEY (robot_id) REFERENCES robots(id),
    FOREIGN KEY (robot_id, parts_id) REFERENCES parts(robot_id, id)
);
