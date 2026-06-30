-- Test users for each role
-- Login ID format matches frontend: {contactNumber}_{role}
-- Run after `npm run migrate` (backend/scripts/migrate.js) has created the schema.
-- Table creation now lives only in database/migrations/0001_baseline.sql — this file
-- just seeds rows, including the Employee/Customer rows each test account links to.

WITH new_emp AS (
  INSERT INTO Employee (Name, Role, Department, Shift_Timings)
  VALUES ('Test Manager', 'Manager', 'General Staff', '09:00-17:00')
  RETURNING Employee_Id
)
INSERT INTO users (name, contact_number, employee_id, role, password, login_id)
SELECT 'Test Manager', '9000000002', Employee_Id, 'manager', 'manager123', '9000000002_manager' FROM new_emp
ON CONFLICT (login_id) DO NOTHING;

WITH new_emp AS (
  INSERT INTO Employee (Name, Role, Department, Shift_Timings)
  VALUES ('Test Employee', 'Staff', 'General Staff', '10:00-18:00')
  RETURNING Employee_Id
)
INSERT INTO users (name, contact_number, employee_id, role, password, login_id)
SELECT 'Test Employee', '9000000003', Employee_Id, 'employee', 'employee123', '9000000003_employee' FROM new_emp
ON CONFLICT (login_id) DO NOTHING;

WITH new_cust AS (
  INSERT INTO Customer (Customer_Name, Age, Sex, Nationality, Contact_No)
  VALUES ('Test Customer', 28, 'Other', 'Indian', '9000000004')
  RETURNING Customer_Id
)
INSERT INTO users (name, contact_number, customer_id, role, password, login_id)
SELECT 'Test Customer', '9000000004', Customer_Id, 'customer', 'customer123', '9000000004_customer' FROM new_cust
ON CONFLICT (login_id) DO NOTHING;

-- Admin is a predefined user per Auth.md — no Employee/Customer row, both links stay NULL.
INSERT INTO users (name, contact_number, role, password, login_id)
VALUES ('Test Admin', '9000000001', 'admin', 'admin123', '9000000001_admin')
ON CONFLICT (login_id) DO NOTHING;
