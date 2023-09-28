CREATE DATABASE tgiapi;

use tgiapi;

CREATE TABLE accounts (
    Username VARCHAR(255) NOT NULL,
    Email VARCHAR(255),
    Password VARCHAR(255) NOT NULL,
    Id varchar(8) NOT NULL
);

select * from accounts;