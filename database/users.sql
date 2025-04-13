CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20),
    role VARCHAR(50),
    password VARCHAR(255) NOT NULL,   -- store hashed password
    login_id VARCHAR(100) NOT NULL UNIQUE
);
