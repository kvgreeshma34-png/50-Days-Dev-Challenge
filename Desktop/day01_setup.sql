-- Step 1: Create and select the database
CREATE DATABASE IF NOT EXISTS synexus_db;
USE synexus_db;

-- Step 2: Create the members table
CREATE TABLE IF NOT EXISTS members (
    member_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) NOT NULL UNIQUE,
    designation VARCHAR(50),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Create the events table
CREATE TABLE IF NOT EXISTS events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(150) NOT NULL,
    event_date DATE,
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE
);