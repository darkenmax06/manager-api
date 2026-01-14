DROP DATABASE IF EXISTS Mails_test;
CREATE DATABASE Mails_test;

USE Mails_test;

CREATE TABLE Users (
	user_id BINARY(16) PRIMARY KEY DEFAULT ( UUID_TO_BIN( UUID() ) ),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    comment_title_name VARCHAR(30) NOT NULL DEFAULT ("nombre"), 
    role ENUM ("user","admin") DEFAULT ("user") NOT NULL,
    creation_date TIMESTAMP DEFAULT (CURRENT_TIMESTAMP())
);

CREATE TABLE Day_appoiment_config (
	dac_id INT AUTO_INCREMENT PRIMARY KEY,
    day ENUM("lun","mar","mie","jue","vie","sab","dom") NOT NULL,
    day_index INT NOT NULL,
    work BOOLEAN DEFAULT (true) not null,
    begin_hour VARCHAR(8) NOT NULL,
    finish_hour VARCHAR(8) NOT NULL,
    user_id BINARY(16) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Comments (
	comment_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    reply_to VARCHAR(100) NOT NULL,
    comment VARCHAR(500) NOT NULL,
    user_id BINARY(16) NOT NULL,
    creation_date TIMESTAMP DEFAULT (CURRENT_TIMESTAMP()),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Appoiments (
	appoiment_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL ,
    date DATE NOT NULL,
    begin_hour TIME NOT NULL,
    finish_hour TIME NOT NULL,
    comment VARCHAR(300),
    persons INT NOT NULL DEFAULT(1),
    user_id BINARY(16) NOT NULL,
    creation_date TIMESTAMP DEFAULT (CURRENT_TIMESTAMP())
);

CREATE TRIGGER Day_appoiment_user
AFTER INSERT ON Users
FOR EACH ROW
BEGIN
	INSERT INTO Day_appoiment_config (day,work,begin_hour,finish_hour,user_id,day_index) VALUES 
    ("lun",TRUE,8,17,NEW.user_id,1),
    ("mar",TRUE,8,17,NEW.user_id,2),
    ("mie",TRUE,8,17,NEW.user_id,3),
    ("jue",TRUE,8,17,NEW.user_id,4),
    ("vie",TRUE,8,17,NEW.user_id,5),
    ("sab",TRUE,8,12,NEW.user_id,6),
    ("dom",FALSE,0,0,NEW.user_id,0);
END;

CREATE VIEW Parsed_user AS SELECT BIN_TO_UUID(user_id) user_id, name, email, role, creation_date,comment_title_name FROM Users;
CREATE VIEW Parsed_comment AS SELECT title, reply_to,comment, comment_id,creation_date, BIN_TO_UUID(user_id) user_id FROM Comments;
CREATE VIEW Parsed_appoiment AS SELECT appoiment_id, name, phone, date , begin_hour, finish_hour, comment, persons, BIN_TO_UUID(user_id) user_id, creation_date  FROM Appoiments;

CREATE UNIQUE INDEX Appoiment_date_and_hours ON Appoiments (date,begin_hour,user_id);

INSERT INTO Users (name,email,password,role) VALUES ("RAMSES GONZALEZ","ramsesgonzalez20066@gmail.com", "$2b$10$HzUIQBdi44evn7IWk8sPju13Z0WvRFngz.6w63CipL9PJKCvv.NJC","admin");

SELECT * FROM Day_appoiment_config