-- Drop tables in the correct reverse order of dependencies
DROP TABLE IF EXISTS Communication, Incident, Staff_Schedule, Flight, Inventory, Revenue, Feedback, Booking, Customer, Facility, Employee CASCADE;

-- 1. Employee Table (including a broader range of roles)
CREATE TABLE Employee (
    Employee_Id SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Role VARCHAR(100) NOT NULL CHECK (Role IN ('Manager', 'Staff', 'Technician', 'Cleaner', 'Security', 'Authority')),
    Shift_Timings VARCHAR(50) NOT NULL
);

-- 2. Facility Table (linked to Employee as Manager)
CREATE TABLE Facility (
    Facility_Id SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Type VARCHAR(100) NOT NULL CHECK (Type IN ('Gym', 'Lounge', 'Restaurant', 'Shop', 'Other')) ,
    Location TEXT NOT NULL,
    Contact_No VARCHAR(15) NOT NULL CHECK (Contact_No ~ '^[0-9]+$'),
    Opening_Hours VARCHAR(50) NOT NULL,
    Manager_Id INT NOT NULL,
    CONSTRAINT fk_manager FOREIGN KEY (Manager_Id) REFERENCES Employee(Employee_Id) ON DELETE SET NULL
);

-- 3. Customer Table (using Aadhaar as unique identifier)
CREATE TABLE Customer (
    Aadhaar_No VARCHAR(20) PRIMARY KEY,
    Customer_Name VARCHAR(255) NOT NULL,
    Age INT CHECK (Age >= 0) NOT NULL,
    Contact_No VARCHAR(15) NOT NULL CHECK (Contact_No ~ '^[0-9]+$')
);

-- 4. Booking Table (captures facility bookings by customers)
CREATE TABLE Booking (
    Booking_Id SERIAL NOT NULL,
    Facility_Id INT NOT NULL,
    Aadhaar_No VARCHAR(20) NOT NULL,
    Employee_Id INT NOT NULL,
    Date_Time TIMESTAMP NOT NULL DEFAULT NOW(),
    Payment_Status VARCHAR(20) CHECK (Payment_Status IN ('Pending', 'Completed', 'Cancelled')),
    PRIMARY KEY (Booking_Id, Facility_Id, Aadhaar_No),
    CONSTRAINT fk_booking_facility FOREIGN KEY (Facility_Id) REFERENCES Facility(Facility_Id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_customer FOREIGN KEY (Aadhaar_No) REFERENCES Customer(Aadhaar_No) ON DELETE CASCADE,
    CONSTRAINT fk_booking_employee FOREIGN KEY (Employee_Id) REFERENCES Employee(Employee_Id) ON DELETE SET NULL
);

-- 5. Feedback Table (associates customer feedback with facility and manager)
CREATE TABLE Feedback (
    Feedback_Id SERIAL NOT NULL,
    Facility_Id INT NOT NULL,
    Aadhaar_No VARCHAR(20) NOT NULL,
    Manager_Id INT NOT NULL,
    Date_Time TIMESTAMP NOT NULL DEFAULT NOW(),
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    Comments TEXT,
    PRIMARY KEY (Feedback_Id, Facility_Id, Aadhaar_No, Manager_Id),
    CONSTRAINT fk_feedback_facility FOREIGN KEY (Facility_Id) REFERENCES Facility(Facility_Id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_customer FOREIGN KEY (Aadhaar_No) REFERENCES Customer(Aadhaar_No) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_manager FOREIGN KEY (Manager_Id) REFERENCES Employee(Employee_Id) ON DELETE SET NULL
);

-- 6. Revenue Table (tracks financial performance per facility and year)
-- CREATE TABLE Revenue (
--     Financial_Year INT CHECK (Financial_Year >= 1962),
--     Facility_Id INT NOT NULL,
--     Monthly_Revenue DECIMAL(10,2) CHECK (Monthly_Revenue >= 0),
--     Yearly_Revenue DECIMAL(12,2) CHECK (Yearly_Revenue >= 0),
--     PRIMARY KEY (Financial_Year, Facility_Id),
--     CONSTRAINT fk_revenue_facility FOREIGN KEY (Facility_Id) REFERENCES Facility(Facility_Id) ON DELETE CASCADE
-- );
CREATE TABLE Revenue (
    Revenue_Id SERIAL PRIMARY KEY,
    Facility_Id INT NOT NULL,
    Financial_Year INT NOT NULL,
    Month DATE NOT NULL,    -- new column: store a representative date for the month (e.g. the 1st day)
    Monthly_Revenue NUMERIC(12,2),
    Yearly_Revenue NUMERIC(12,2),
    CONSTRAINT fk_revenue_facility FOREIGN KEY (Facility_Id) REFERENCES Facility(Facility_Id)
);

-- 7. Inventory Table (manages items per facility)
CREATE TABLE Inventory (
    Inventory_Id SERIAL PRIMARY KEY,
    Facility_Id INT NOT NULL,
    Item_Name VARCHAR(255) NOT NULL,
    Quantity INT CHECK (Quantity >= 0),
    Supplier VARCHAR(255),
    CONSTRAINT fk_inventory_facility FOREIGN KEY (Facility_Id) REFERENCES Facility(Facility_Id) ON DELETE CASCADE
);

-- 8. Flight Table (captures real-time flight information)
CREATE TABLE Flight (
    Flight_Id SERIAL PRIMARY KEY,
    Flight_Number VARCHAR(20) NOT NULL,
    Airline VARCHAR(255) NOT NULL,
    Departure_Time TIMESTAMP NOT NULL,
    Arrival_Time TIMESTAMP NOT NULL,
    Status VARCHAR(50) CHECK (Status IN ('On Time', 'Delayed', 'Cancelled', 'Departed', 'Arrived')),
    Gate VARCHAR(10),
    Terminal VARCHAR(10)
);

-- 9. Staff_Schedule Table (manages staff shift scheduling and task allocation)
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

-- 10. Communication Table (internal communication between employees)
CREATE TABLE Communication (
    Message_Id SERIAL PRIMARY KEY,
    Sender_Id INT NOT NULL,
    Receiver_Id INT NOT NULL,
    Message_Type VARCHAR(50) CHECK (Message_Type IN ('Alert', 'Notice', 'Message')),
    Message TEXT NOT NULL,
    Sent_At TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_comm_sender FOREIGN KEY (Sender_Id) REFERENCES Employee(Employee_Id) ON DELETE SET NULL,
    CONSTRAINT fk_comm_receiver FOREIGN KEY (Receiver_Id) REFERENCES Employee(Employee_Id) ON DELETE SET NULL
);

-- 11. Incident Table (records operational incidents reported by staff)
CREATE TABLE Incident (
    Incident_Id SERIAL PRIMARY KEY,
    Reported_By INT NOT NULL,
    Facility_Id INT NOT NULL,
    Description TEXT NOT NULL,
    Status VARCHAR(50) CHECK (Status IN ('Reported', 'In Progress', 'Resolved')),
    Reported_At TIMESTAMP NOT NULL DEFAULT NOW(),
    Resolved_At TIMESTAMP,
    CONSTRAINT fk_incident_employee FOREIGN KEY (Reported_By) REFERENCES Employee(Employee_Id) ON DELETE SET NULL,
    CONSTRAINT fk_incident_facility FOREIGN KEY (Facility_Id) REFERENCES Facility(Facility_Id) ON DELETE SET NULL
);
