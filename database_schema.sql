create database rbac;

use rbac;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'User', 'Moderator') NOT NULL
);

show tables;

select * from users;
