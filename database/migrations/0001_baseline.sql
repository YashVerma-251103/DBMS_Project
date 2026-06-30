-- Baseline schema for the restructured Airport Management System.
-- Source of truth going forward — applied via `npm run migrate` (backend/scripts/migrate.js).
-- Replaces database/DDL_schema.sql, Triggers.sql, and users.sql (all deleted, folded in here).
-- Destructive on purpose: this is a one-time reset, not the template for future migrations,
-- which should be additive (new database/migrations/000N_*.sql files).

DROP TABLE IF EXISTS users, Incident, Communication, Staff_Schedule, Inventory, Revenue, Feedback, Booking, Flight, Customer, Facility, Employee CASCADE;
DROP FUNCTION IF EXISTS check_manager_role() CASCADE;

-- 1. Employee — staff/internal people. Role covers the full hierarchy from Schema.md;
-- Department is the top-level grouping (Management > Department > Role).
CREATE TABLE Employee (
    Employee_Id SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Role VARCHAR(100) NOT NULL CHECK (Role IN (
        'Manager','Staff','Technician','Cleaner','Security','Authority',
        'Counter Staff','Checkin and Boarding Staff','Cargo Moving Staff','Pilot','Air Hostess/Steward',
        'Finance and Accounts Staff',
        'Air Traffic Control Employee','Runway Management','Hangar Management','Planes and Flights Management',
        'Air Marshal','Runway Patrol',
        'Store Staff','Hygiene Staff','Lounge Staff','Airline Cook'
    )),
    Department VARCHAR(50) CHECK (Department IN ('Airport and Airline Staff','Finance and Accounts','ATC Staff','Military','General Staff')),
    Shift_Timings VARCHAR(50) NOT NULL
);

-- 2. Facility — linked to Employee as Manager. Description covers Lounge "benefits" copy.
CREATE TABLE Facility (
    Facility_Id SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Type VARCHAR(100) NOT NULL CHECK (Type IN ('Gym','Lounge','Restaurant','Shop','Other')),
    Location TEXT NOT NULL,
    Description TEXT,
    Contact_No VARCHAR(15) NOT NULL CHECK (Contact_No ~ '^[0-9]+$'),
    Opening_Hours VARCHAR(50) NOT NULL,
    Manager_Id INT NOT NULL,
    CONSTRAINT fk_manager FOREIGN KEY (Manager_Id) REFERENCES Employee(Employee_Id) ON DELETE SET NULL
);

-- 3. Customer — the public. Surrogate Customer_Id replaces Aadhaar entirely.
CREATE TABLE Customer (
    Customer_Id SERIAL PRIMARY KEY,
    Customer_Name VARCHAR(255) NOT NULL,
    Age INT NOT NULL CHECK (Age >= 0),
    Sex VARCHAR(10) CHECK (Sex IN ('Male','Female','Other')),
    Nationality VARCHAR(100),
    Contact_No VARCHAR(15) NOT NULL CHECK (Contact_No ~ '^[0-9]+$')
);

-- 4. Flight — Origin/Destination added (needed for search/travel-planning, didn't exist before).
CREATE TABLE Flight (
    Flight_Id SERIAL PRIMARY KEY,
    Flight_Number VARCHAR(20) NOT NULL,
    Airline VARCHAR(255) NOT NULL,
    Origin VARCHAR(100),
    Destination VARCHAR(100),
    Departure_Time TIMESTAMP NOT NULL,
    Arrival_Time TIMESTAMP NOT NULL,
    Status VARCHAR(50) CHECK (Status IN ('On Time','Delayed','Cancelled','Departed','Arrived')),
    Gate VARCHAR(10),
    Terminal VARCHAR(10)
);

-- 5. Booking — single surrogate PK (the old composite key added no real integrity;
-- Booking_Id was already unique on its own). Facility_Id/Flight_Id are an exclusive
-- arc: exactly one is set, covering both lounge bookings and flight bookings in one
-- table. Employee_Id is nullable: NULL = self-service online booking, set = staff-
-- assisted booking (today's flow).
CREATE TABLE Booking (
    Booking_Id SERIAL PRIMARY KEY,
    Facility_Id INT,
    Flight_Id INT,
    Customer_Id INT NOT NULL,
    Employee_Id INT,
    Date_Time TIMESTAMP NOT NULL DEFAULT NOW(),
    Payment_Status VARCHAR(20) CHECK (Payment_Status IN ('Pending','Completed','Cancelled')),
    Checked_In BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_booking_target CHECK ((Facility_Id IS NOT NULL AND Flight_Id IS NULL) OR (Facility_Id IS NULL AND Flight_Id IS NOT NULL)),
    CONSTRAINT fk_booking_facility FOREIGN KEY (Facility_Id) REFERENCES Facility(Facility_Id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_flight FOREIGN KEY (Flight_Id) REFERENCES Flight(Flight_Id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_customer FOREIGN KEY (Customer_Id) REFERENCES Customer(Customer_Id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_employee FOREIGN KEY (Employee_Id) REFERENCES Employee(Employee_Id) ON DELETE SET NULL
);

-- 6. Feedback — single surrogate PK, Customer_Id instead of Aadhaar.
CREATE TABLE Feedback (
    Feedback_Id SERIAL PRIMARY KEY,
    Facility_Id INT NOT NULL,
    Customer_Id INT NOT NULL,
    Manager_Id INT NOT NULL,
    Date_Time TIMESTAMP NOT NULL DEFAULT NOW(),
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    Comments TEXT,
    CONSTRAINT fk_feedback_facility FOREIGN KEY (Facility_Id) REFERENCES Facility(Facility_Id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_customer FOREIGN KEY (Customer_Id) REFERENCES Customer(Customer_Id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_manager FOREIGN KEY (Manager_Id) REFERENCES Employee(Employee_Id) ON DELETE SET NULL
);

-- 7. Revenue — unchanged.
CREATE TABLE Revenue (
    Revenue_Id SERIAL PRIMARY KEY,
    Facility_Id INT NOT NULL,
    Financial_Year INT NOT NULL,
    Month DATE NOT NULL,
    Monthly_Revenue NUMERIC(12,2),
    Yearly_Revenue NUMERIC(12,2),
    CONSTRAINT fk_revenue_facility FOREIGN KEY (Facility_Id) REFERENCES Facility(Facility_Id)
);

-- 8. Inventory — Price added (backs the cross-store inventory search engine).
CREATE TABLE Inventory (
    Inventory_Id SERIAL PRIMARY KEY,
    Facility_Id INT NOT NULL,
    Item_Name VARCHAR(255) NOT NULL,
    Quantity INT CHECK (Quantity >= 0),
    Price NUMERIC(10,2) CHECK (Price >= 0),
    Supplier VARCHAR(255),
    CONSTRAINT fk_inventory_facility FOREIGN KEY (Facility_Id) REFERENCES Facility(Facility_Id) ON DELETE CASCADE
);

-- 9. Staff_Schedule — unchanged.
CREATE TABLE Staff_Schedule (
    Schedule_Id SERIAL PRIMARY KEY,
    Employee_Id INT NOT NULL,
    Facility_Id INT NOT NULL,
    Shift_Date DATE NOT NULL,
    Shift_Start TIME NOT NULL,
    Shift_End TIME NOT NULL,
    Task_Description TEXT,
    Created_At TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_schedule_employee FOREIGN KEY (Employee_Id) REFERENCES Employee(Employee_Id) ON DELETE SET NULL,
    CONSTRAINT fk_schedule_facility FOREIGN KEY (Facility_Id) REFERENCES Facility(Facility_Id) ON DELETE SET NULL
);

-- 10. Communication — unchanged.
CREATE TABLE Communication (
    Message_Id SERIAL PRIMARY KEY,
    Sender_Id INT NOT NULL,
    Receiver_Id INT NOT NULL,
    Message_Type VARCHAR(50) CHECK (Message_Type IN ('Alert','Notice','Message')),
    Message TEXT NOT NULL,
    Sent_At TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_comm_sender FOREIGN KEY (Sender_Id) REFERENCES Employee(Employee_Id) ON DELETE SET NULL,
    CONSTRAINT fk_comm_receiver FOREIGN KEY (Receiver_Id) REFERENCES Employee(Employee_Id) ON DELETE SET NULL
);

-- 11. Incident — doubles as the complaint system. Reported_By/Reported_By_Customer_Id
-- is an exclusive arc (employee report vs. customer complaint). Assigned_To backs the
-- "complaint assignment engine" (defaults to the facility's manager in the app layer).
CREATE TABLE Incident (
    Incident_Id SERIAL PRIMARY KEY,
    Reported_By INT,
    Reported_By_Customer_Id INT,
    Facility_Id INT NOT NULL,
    Assigned_To INT,
    Description TEXT NOT NULL,
    Status VARCHAR(50) CHECK (Status IN ('Reported','In Progress','Resolved')),
    Reported_At TIMESTAMP NOT NULL DEFAULT NOW(),
    Resolved_At TIMESTAMP,
    CONSTRAINT chk_incident_reporter CHECK ((Reported_By IS NOT NULL AND Reported_By_Customer_Id IS NULL) OR (Reported_By IS NULL AND Reported_By_Customer_Id IS NOT NULL)),
    CONSTRAINT fk_incident_employee FOREIGN KEY (Reported_By) REFERENCES Employee(Employee_Id) ON DELETE SET NULL,
    CONSTRAINT fk_incident_customer FOREIGN KEY (Reported_By_Customer_Id) REFERENCES Customer(Customer_Id) ON DELETE SET NULL,
    CONSTRAINT fk_incident_assigned FOREIGN KEY (Assigned_To) REFERENCES Employee(Employee_Id) ON DELETE SET NULL,
    CONSTRAINT fk_incident_facility FOREIGN KEY (Facility_Id) REFERENCES Facility(Facility_Id) ON DELETE SET NULL
);

-- 12. users — auth/identity only. Aadhaar columns removed; linked to Customer/Employee
-- via plain surrogate FKs (mirrors how every other table links to Employee).
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20),
    customer_id INT REFERENCES Customer(Customer_Id) ON DELETE SET NULL,
    employee_id INT REFERENCES Employee(Employee_Id) ON DELETE SET NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin','manager','employee','customer')),
    password VARCHAR(255) NOT NULL,
    login_id VARCHAR(100) NOT NULL UNIQUE
);

CREATE OR REPLACE FUNCTION check_manager_role()
RETURNS trigger AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM Employee WHERE Employee_Id = NEW.Manager_Id AND Role = 'Manager'
    ) THEN
        RAISE EXCEPTION 'Manager_Id % does not belong to an employee with role Manager', NEW.Manager_Id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_manager_role_trigger
BEFORE INSERT OR UPDATE ON Facility
FOR EACH ROW
EXECUTE FUNCTION check_manager_role();
