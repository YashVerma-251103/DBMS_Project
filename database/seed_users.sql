-- Test users for each role
-- Login ID format matches frontend: {contactNumber}_{role}
-- Run after `npm run migrate` (backend/scripts/migrate.js) has created the schema.
-- Table creation now lives only in database/migrations/0001_baseline.sql — this file
-- just seeds rows, including the Employee/Customer rows each test account links to.
--
-- Passwords are hashed with pgcrypto's crypt()/gen_salt('bf') — bcrypt-compatible, so the
-- app's bcryptjs-based login can verify them. Login with the plaintext password shown in
-- each comment; the stored value is the hash, not the password itself.

WITH new_emp AS (
  INSERT INTO Employee (Name, Role, Department, Shift_Timings)
  VALUES ('Test Manager', 'Manager', 'General Staff', '09:00-17:00')
  RETURNING Employee_Id
)
-- password: manager123
INSERT INTO users (name, contact_number, employee_id, role, password, login_id)
SELECT 'Test Manager', '9000000002', Employee_Id, 'manager', crypt('manager123', gen_salt('bf')), '9000000002_manager' FROM new_emp
ON CONFLICT (login_id) DO NOTHING;

WITH new_emp AS (
  INSERT INTO Employee (Name, Role, Department, Shift_Timings)
  VALUES ('Test Employee', 'Staff', 'General Staff', '10:00-18:00')
  RETURNING Employee_Id
)
-- password: employee123
INSERT INTO users (name, contact_number, employee_id, role, password, login_id)
SELECT 'Test Employee', '9000000003', Employee_Id, 'employee', crypt('employee123', gen_salt('bf')), '9000000003_employee' FROM new_emp
ON CONFLICT (login_id) DO NOTHING;

WITH new_cust AS (
  INSERT INTO Customer (Customer_Name, Age, Sex, Nationality, Contact_No)
  VALUES ('Test Customer', 28, 'Other', 'Indian', '9000000004')
  RETURNING Customer_Id
)
-- password: customer123
INSERT INTO users (name, contact_number, customer_id, role, password, login_id)
SELECT 'Test Customer', '9000000004', Customer_Id, 'customer', crypt('customer123', gen_salt('bf')), '9000000004_customer' FROM new_cust
ON CONFLICT (login_id) DO NOTHING;

-- Admin is a predefined user per Auth.md — no Employee/Customer row, both links stay NULL.
-- password: admin123
INSERT INTO users (name, contact_number, role, password, login_id)
VALUES ('Test Admin', '9000000001', 'admin', crypt('admin123', gen_salt('bf')), '9000000001_admin')
ON CONFLICT (login_id) DO NOTHING;
