-- Test users for each role
-- Login ID format matches frontend: {contactNumber}_{role}
-- Run this ONCE after creating the users table (database/users.sql)

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20),
    aaddhaar_no VARCHAR(20),
    role VARCHAR(50),
    password VARCHAR(255) NOT NULL,
    login_id VARCHAR(100) NOT NULL UNIQUE
);

INSERT INTO users (name, contact_number, aaddhaar_no, role, password, login_id) VALUES
  ('Test Admin',    '9000000001', '100000000001', 'admin',    'admin123',    '9000000001_admin'),
  ('Test Manager',  '9000000002', '100000000002', 'manager',  'manager123',  '9000000002_manager'),
  ('Test Employee', '9000000003', '100000000003', 'employee', 'employee123', '9000000003_employee'),
  ('Test Customer', '9000000004', '100000000004', 'customer', 'customer123', '9000000004_customer')
ON CONFLICT (login_id) DO NOTHING;
