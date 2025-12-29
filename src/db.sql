DROP DATABASE IF EXISTS Mails;
CREATE DATABASE Mails;

USE Mails;

CREATE TABLE Users (
	user_id BINARY(16) PRIMARY KEY DEFAULT ( UUID_TO_BIN( UUID() ) ),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password TEXT NOT NULL,
    comment_title_name VARCHAR(30) NOT NULL DEFAULT ("nombre"), 
    role ENUM ("user","admin") DEFAULT ("user") NOT NULL,
    creation_date TIMESTAMP DEFAULT (CURRENT_TIMESTAMP())
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
	appoiment_id INT PRIMARY KEY NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    date DATE NOT NULL,
    hour TIME NOT NULL,
    comment VARCHAR(300),
    persons INT NOT NULL DEFAULT (1),
    user_id BINARY(16) NOT NULL,
    creation_date TIMESTAMP DEFAULT (CURRENT_TIMESTAMP())
);


CREATE VIEW Parsed_user AS (SELECT BIN_TO_UUID(user_id) user_id, name, email,role,creation_date,comment_title_name FROM Users);
CREATE VIEW Parsed_comment AS (SELECT title, reply_to,comment, comment_id,creation_date FROM Comments);


INSERT INTO Users (name,email,password,role) VALUES ("RAMSES GONZALEZ","ramsesgonzalez20066@gmail.com", "$2b$10$HzUIQBdi44evn7IWk8sPju13Z0WvRFngz.6w63CipL9PJKCvv.NJC","admin");
-- set @id = (SELECT user_id FROM Users LIMIT 1 );

-- INSERT INTO Comments (subject,reply_to,user_id,comment) VALUES ("EL mejor email", "rgonzalez@gmail.com",@id,"EL mejor web");
-- SELECT * FROM Comments_user_config

SELECT * FROM Users