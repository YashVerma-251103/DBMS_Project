-- 1. Employee Table Inserts
INSERT INTO Employee (Name, Role, Shift_Timings) VALUES
('Rahul Sharma', 'Manager', '09:00-17:00'),
('Rajesh Khanna', 'Manager', '09:00-17:00'),
('Amitabh Bachchan', 'Manager', '09:00-17:00'),
('Hrithik Roshan', 'Manager', '09:00-17:00'),
('Akshay Kumar', 'Manager', '09:00-17:00'),
('Prithvi Raj Chauhan', 'Manager', '09:00-17:00'),
('Paresh Raval', 'Manager', '09:00-17:00'),
('Virat Kohli', 'Manager', '09:00-17:00'),
('Rohit Sharma', 'Manager', '09:00-17:00'),
('Tiger Shroff', 'Manager', '09:00-17:00'),
('Shradhha Kapoor', 'Manager', '09:00-17:00'),
('Alia Bhatt', 'Manager', '09:00-17:00'),
('Deepika Padukone', 'Manager', '09:00-17:00'),
('Katrina Kaif', 'Manager', '09:00-17:00'),
('Tom Holand', 'Manager', '09:00-17:00'),
('Priya Singh', 'Staff', '10:00-18:00'),
('Amit Patel', 'Technician', '08:00-16:00'),
('Rahul Gandhi', 'Cleaner', '07:00-15:00'),
('Vijay Kumar', 'Security', '12:00-20:00'),
('Anjali Mehta', 'Authority', '11:00-19:00'),
('Ravi Verma', 'Staff', '10:00-18:00'),
('Sneha Reddy', 'Technician', '08:00-16:00'),
('Karan Malhotra', 'Cleaner', '07:00-15:00'),
('Pooja Joshi', 'Security', '12:00-20:00'),
('Sunita Desai', 'Staff', '10:00-18:00'),
('Arun Mishra', 'Technician', '08:00-16:00'),
('Deepa Iyer', 'Cleaner', '07:00-15:00'),
('Manoj Tiwari', 'Security', '12:00-20:00');

-- 2. Facility Table Inserts
-- Assuming Employee IDs are auto-assigned sequentially 1-15 (all 'Manager' rows above).
INSERT INTO Facility (Name, Type, Location, Contact_No, Opening_Hours, Manager_Id) VALUES
('Mumbai Central Gym', 'Gym', 'Mumbai Central, Mumbai', '9123456780', '06:00-22:00', 1),
('Delhi Airport Lounge', 'Lounge', 'Indira Gandhi Airport, Delhi', '9112345678', '05:00-23:00', 2),
('Bangalore Restaurant', 'Restaurant', 'MG Road, Bangalore', '8012345678', '10:00-22:00', 3),
('Chennai Central Shop', 'Shop', 'Chennai Central, Chennai', '7012345678', '09:00-21:00', 4),
('Hyderabad Park Facility', 'Other', 'Hitech City, Hyderabad', '6012345678', 'Open 24 Hours', 5),
('Pune Fitness Center', 'Gym', 'Koregaon Park, Pune', '5012345678', '06:00-22:00', 6),
('Kolkata Lounge', 'Lounge', 'Park Street, Kolkata', '4012345678', '05:00-23:00', 7),
('Ahmedabad Diner', 'Restaurant', 'CG Road, Ahmedabad', '3012345678', '10:00-22:00', 8),
('Jaipur Handicrafts', 'Shop', 'Johari Bazaar, Jaipur', '2012345678', '09:00-21:00', 9),
('Lucknow Community Center', 'Other', 'Gomti Nagar, Lucknow', '1012345678', 'Open 24 Hours', 10),
('Chandigarh Gym', 'Gym', 'Sector 17, Chandigarh', '9012345678', '06:00-22:00', 11),
('Goa Beach Lounge', 'Lounge', 'Calangute Beach, Goa', '8112345678', '05:00-23:00', 12),
('Kochi Restaurant', 'Restaurant', 'Marine Drive, Kochi', '7112345678', '10:00-22:00', 13),
('Bhopal Shop', 'Shop', 'New Market, Bhopal', '6112345678', '09:00-21:00', 14),
('Surat Facility', 'Other', 'Athwa Lines, Surat', '5112345678', 'Open 24 Hours', 15);

-- 3. Customer Table Inserts (Aadhaar removed — Customer_Id auto-assigns 1-15 in this order)
INSERT INTO Customer (Customer_Name, Age, Sex, Nationality, Contact_No) VALUES
('Ramesh Kumar', 30, 'Male', 'Indian', '5551112222'),
('Sita Devi', 25, 'Female', 'Indian', '5553334444'),
('Arjun Singh', 40, 'Male', 'Indian', '5555556666'),
('Priyanka Sharma', 28, 'Female', 'Indian', '5557778888'),
('Vikram Patel', 35, 'Male', 'Indian', '5559990000'),
('Ananya Reddy', 22, 'Female', 'Indian', '5552223333'),
('Rajiv Verma', 45, 'Male', 'Indian', '5554445555'),
('Meera Iyer', 29, 'Female', 'Indian', '5556667777'),
('Suresh Khanna', 50, 'Male', 'Indian', '5558889999'),
('Kavita Desai', 32, 'Female', 'Indian', '5550001111'),
('Rohan Malhotra', 27, 'Male', 'Indian', '5551234567'),
('Neha Joshi', 33, 'Female', 'Indian', '5552345678'),
('Amitabh Tiwari', 38, 'Male', 'Indian', '5553456789'),
('Sunita Reddy', 26, 'Female', 'Indian', '5554567890'),
('Deepak Mishra', 42, 'Male', 'Indian', '5555678901');

-- 4. Flight Table Inserts
INSERT INTO Flight (Flight_Number, Airline, Origin, Destination, Departure_Time, Arrival_Time, Status, Gate, Terminal) VALUES
('AI101', 'Air India', 'Delhi', 'Mumbai', '2025-03-20 06:00:00', '2025-03-20 08:30:00', 'On Time', 'A1', 'T1'),
('6E202', 'Indigo', 'Mumbai', 'Bangalore', '2025-03-20 09:00:00', '2025-03-20 11:45:00', 'Delayed', 'B2', 'T2'),
('SG303', 'SpiceJet', 'Bangalore', 'Chennai', '2025-03-20 12:15:00', '2025-03-20 14:45:00', 'Cancelled', 'C3', 'T3'),
('UK404', 'Vistara', 'Chennai', 'Hyderabad', '2025-03-20 15:00:00', '2025-03-20 17:30:00', 'Departed', 'D4', 'T3'),
('G80505', 'GoAir', 'Hyderabad', 'Delhi', '2025-03-20 18:00:00', '2025-03-20 20:30:00', 'Arrived', 'E5', 'T2'),
('AI102', 'Air India', 'Delhi', 'Pune', '2025-03-21 06:00:00', '2025-03-21 08:30:00', 'On Time', 'A1', 'T1'),
('6E203', 'Indigo', 'Pune', 'Kolkata', '2025-03-21 09:00:00', '2025-03-21 11:45:00', 'Delayed', 'B2', 'T2'),
('SG304', 'SpiceJet', 'Kolkata', 'Ahmedabad', '2025-03-21 12:15:00', '2025-03-21 14:45:00', 'Cancelled', 'C3', 'T3'),
('UK405', 'Vistara', 'Ahmedabad', 'Jaipur', '2025-03-21 15:00:00', '2025-03-21 17:30:00', 'Departed', 'D4', 'T1'),
('G80506', 'GoAir', 'Jaipur', 'Lucknow', '2025-03-21 18:00:00', '2025-03-21 20:30:00', 'Arrived', 'E5', 'T3'),
('AI103', 'Air India', 'Delhi', 'Chandigarh', '2025-03-22 06:00:00', '2025-03-22 08:30:00', 'On Time', 'A1', 'T1'),
('6E204', 'Indigo', 'Chandigarh', 'Goa', '2025-03-22 09:00:00', '2025-03-22 11:45:00', 'Delayed', 'B2', 'T2'),
('SG305', 'SpiceJet', 'Goa', 'Kochi', '2025-03-22 12:15:00', '2025-03-22 14:45:00', 'Cancelled', 'C3', 'T3'),
('UK406', 'Vistara', 'Kochi', 'Bhopal', '2025-03-22 15:00:00', '2025-03-22 17:30:00', 'Departed', 'D4', 'T2'),
('G80507', 'GoAir', 'Bhopal', 'Surat', '2025-03-22 18:00:00', '2025-03-22 20:30:00', 'Arrived', 'E5', 'T1');

-- 5. Booking Table Inserts (Customer_Id replaces Aadhaar_No, 1:1 with Customer insert order above)
INSERT INTO Booking (Facility_Id, Customer_Id, Employee_Id, Date_Time, Payment_Status) VALUES
(1, 1, 2, '2025-03-15 10:30:00', 'Completed'),
(2, 2, 2, '2025-03-16 14:00:00', 'Pending'),
(3, 3, 3, '2025-03-17 18:45:00', 'Cancelled'),
(1, 2, 4, '2025-03-18 09:15:00', 'Completed'),
(5, 1, 1, '2025-03-19 12:00:00', 'Pending'),
(6, 4, 7, '2025-03-20 08:00:00', 'Completed'),
(7, 5, 8, '2025-03-21 16:30:00', 'Pending'),
(8, 6, 9, '2025-03-22 19:00:00', 'Cancelled'),
(9, 7, 10, '2025-03-23 11:45:00', 'Completed'),
(10, 8, 11, '2025-03-24 13:15:00', 'Pending'),
(11, 9, 12, '2025-03-25 10:00:00', 'Completed'),
(12, 10, 13, '2025-03-26 14:30:00', 'Pending'),
(13, 11, 14, '2025-03-27 17:00:00', 'Cancelled'),
(14, 12, 15, '2025-03-28 09:30:00', 'Completed'),
(15, 13, 1, '2025-03-29 12:45:00', 'Pending');

-- 6. Feedback Table Inserts
INSERT INTO Feedback (Facility_Id, Customer_Id, Manager_Id, Date_Time, Rating, Comments) VALUES
(1, 1, 1, '2025-03-16 11:00:00', 5, 'Excellent service and facilities.'),
(2, 2, 2, '2025-03-17 15:30:00', 4, 'Comfortable lounge with timely assistance.'),
(3, 3, 2, '2025-03-18 20:45:00', 3, 'Food quality was average, could be improved.'),
(5, 1, 5, '2025-03-19 13:00:00', 4, 'Great ambiance but slightly crowded.'),
(6, 4, 11, '2025-03-20 09:00:00', 5, 'Well-maintained gym with modern equipment.'),
(7, 5, 11, '2025-03-21 17:30:00', 4, 'Good service but could improve seating.'),
(8, 6, 12, '2025-03-22 20:00:00', 3, 'Average food, but staff was polite.'),
(9, 7, 14, '2025-03-23 12:45:00', 5, 'Excellent shopping experience.'),
(10, 8, 6, '2025-03-24 14:15:00', 4, 'Clean and well-organized facility.'),
(11, 9, 1, '2025-03-25 11:00:00', 5, 'Great gym with professional trainers.'),
(12, 10, 1, '2025-03-26 15:30:00', 4, 'Good lounge but could improve Wi-Fi speed.'),
(13, 11, 2, '2025-03-27 18:00:00', 3, 'Average food, but ambiance was nice.'),
(14, 12, 6, '2025-03-28 10:30:00', 5, 'Excellent shop with a wide variety of products.'),
(15, 13, 6, '2025-03-29 13:45:00', 4, 'Good facility but needs more staff.');

-- 7. Revenue Table Inserts
INSERT INTO Revenue (Financial_Year, Facility_Id, Month, Monthly_Revenue, Yearly_Revenue)
SELECT
    EXTRACT(YEAR FROM d)::INT as Financial_Year,
    f.facility_id,
    d::DATE as Month,
    ROUND((100000 + random() * 100000)::numeric, 2) as Monthly_Revenue,
    ROUND(((100000 + random() * 100000) * 12)::numeric, 2) as Yearly_Revenue
FROM generate_series('2021-01-01'::date, '2023-12-01'::date, interval '1 month') AS d,
     (SELECT facility_id FROM Facility) AS f;

-- 8. Inventory Table Inserts
INSERT INTO Inventory (Facility_Id, Item_Name, Quantity, Price, Supplier) VALUES
(1, 'Treadmills', 10, 45000.00, 'FitnessSuppliers India'),
(1, 'Dumbbells', 100, 1200.00, 'GymEquip India'),
(2, 'Sofas', 20, 18000.00, 'Comfort Furnishings India'),
(3, 'Tableware', 200, 350.00, 'Culinary Supplies India'),
(4, 'Merchandise', 300, 800.00, 'Retail Wholesale India'),
(5, 'First Aid Kits', 30, 500.00, 'Medical Essentials India'),
(6, 'Yoga Mats', 50, 700.00, 'FitnessSuppliers India'),
(7, 'Recliners', 15, 22000.00, 'Comfort Furnishings India'),
(8, 'Cutlery', 150, 150.00, 'Culinary Supplies India'),
(9, 'Handicrafts', 250, 600.00, 'Retail Wholesale India'),
(10, 'Fire Extinguishers', 25, 1500.00, 'Safety Essentials India'),
(11, 'Elliptical Machines', 8, 52000.00, 'FitnessSuppliers India'),
(12, 'Coffee Tables', 12, 9000.00, 'Comfort Furnishings India'),
(13, 'Plates', 180, 120.00, 'Culinary Supplies India'),
(14, 'Clothing', 400, 950.00, 'Retail Wholesale India');

-- 9. Staff_Schedule Table Inserts
INSERT INTO Staff_Schedule (Employee_Id, Facility_Id, Shift_Date, Shift_Start, Shift_End, Task_Description, Created_At) VALUES
(2, 1, '2025-03-20', '10:00:00', '18:00:00', 'Manage front-desk operations', '2025-03-15 09:00:00'),
(3, 1, '2025-03-20', '08:00:00', '16:00:00', 'Oversee technical maintenance', '2025-03-15 09:15:00'),
(4, 2, '2025-03-20', '07:00:00', '15:00:00', 'General cleaning duties', '2025-03-15 09:30:00'),
(5, 3, '2025-03-20', '12:00:00', '20:00:00', 'Security monitoring', '2025-03-15 09:45:00'),
(1, 4, '2025-03-20', '09:00:00', '17:00:00', 'Facility management oversight', '2025-03-15 10:00:00'),
(7, 5, '2025-03-21', '10:00:00', '18:00:00', 'Customer support', '2025-03-16 09:00:00'),
(8, 6, '2025-03-21', '08:00:00', '16:00:00', 'Equipment maintenance', '2025-03-16 09:15:00'),
(9, 7, '2025-03-21', '07:00:00', '15:00:00', 'Cleaning and sanitation', '2025-03-16 09:30:00'),
(10, 8, '2025-03-21', '12:00:00', '20:00:00', 'Security patrol', '2025-03-16 09:45:00'),
(11, 9, '2025-03-21', '09:00:00', '17:00:00', 'Managerial duties', '2025-03-16 10:00:00'),
(12, 10, '2025-03-22', '10:00:00', '18:00:00', 'Front-desk operations', '2025-03-17 09:00:00'),
(13, 11, '2025-03-22', '08:00:00', '16:00:00', 'Technical support', '2025-03-17 09:15:00'),
(14, 12, '2025-03-22', '07:00:00', '15:00:00', 'Cleaning duties', '2025-03-17 09:30:00'),
(15, 13, '2025-03-22', '12:00:00', '20:00:00', 'Security checks', '2025-03-17 09:45:00'),
(6, 14, '2025-03-22', '09:00:00', '17:00:00', 'Facility oversight', '2025-03-17 10:00:00');

-- 10. Communication Table Inserts
INSERT INTO Communication (Sender_Id, Receiver_Id, Message_Type, Message, Sent_At) VALUES
(1, 2, 'Alert', 'Please review the facility maintenance report.', '2025-03-16 08:00:00'),
(2, 3, 'Notice', 'Scheduled system update tonight at 22:00.', '2025-03-16 12:00:00'),
(3, 4, 'Message', 'Requesting extra cleaning supplies in the storage.', '2025-03-16 14:30:00'),
(5, 1, 'Alert', 'Security breach attempt detected in the lounge.', '2025-03-16 16:45:00'),
(6, 7, 'Notice', 'New staff training session tomorrow at 10:00.', '2025-03-17 09:00:00'),
(7, 8, 'Message', 'Please check the gym equipment for maintenance.', '2025-03-17 11:30:00'),
(8, 9, 'Alert', 'Spillage reported in the restaurant kitchen.', '2025-03-17 13:45:00'),
(9, 10, 'Notice', 'Security cameras are under maintenance.', '2025-03-17 15:00:00'),
(10, 11, 'Message', 'Please update the inventory list.', '2025-03-17 17:30:00'),
(11, 12, 'Alert', 'Fire drill scheduled for tomorrow at 11:00.', '2025-03-18 08:00:00'),
(12, 13, 'Notice', 'New menu items added to the restaurant.', '2025-03-18 10:15:00'),
(13, 14, 'Message', 'Cleaning supplies are running low.', '2025-03-18 12:30:00'),
(14, 15, 'Alert', 'Suspicious activity reported near the shop.', '2025-03-18 14:45:00'),
(15, 1, 'Notice', 'Monthly revenue report is due tomorrow.', '2025-03-18 16:00:00'),
(1, 3, 'Message', 'Please ensure all facilities are operational.', '2025-03-18 18:30:00');

-- 11. Incident Table Inserts (all employee-reported, matches original seed intent)
INSERT INTO Incident (Reported_By, Facility_Id, Description, Status, Reported_At, Resolved_At) VALUES
(2, 1, 'Equipment malfunction in the gym area.', 'Reported', '2025-03-16 09:30:00', NULL),
(3, 2, 'Air conditioning failure in the lounge.', 'In Progress', '2025-03-16 11:00:00', NULL),
(4, 3, 'Spillage in the restaurant kitchen causing a slip hazard.', 'Resolved', '2025-03-16 12:15:00', '2025-03-16 13:00:00'),
(5, 13, 'Suspicious activity reported near the facility entrance.', 'Reported', '2025-03-16 15:20:00', NULL),
(7, 6, 'Treadmill stopped working during peak hours.', 'Reported', '2025-03-17 10:00:00', NULL),
(8, 7, 'Lounge seating damaged by a customer.', 'In Progress', '2025-03-17 12:30:00', NULL),
(9, 8, 'Kitchen fire alarm triggered accidentally.', 'Resolved', '2025-03-17 14:45:00', '2025-03-17 15:30:00'),
(10, 11, 'Unauthorized entry attempt in the facility.', 'Reported', '2025-03-17 16:00:00', NULL),
(11, 11, 'Gym locker broken into.', 'Reported', '2025-03-18 08:30:00', NULL),
(12, 12, 'Lounge Wi-Fi not working.', 'In Progress', '2025-03-18 10:45:00', NULL),
(13, 13, 'Restaurant power outage.', 'Resolved', '2025-03-18 12:00:00', '2025-03-18 13:00:00'),
(14, 9, 'Shop theft reported.', 'Reported', '2025-03-18 14:15:00', NULL),
(15, 15, 'First aid kit missing from the facility.', 'Reported', '2025-03-18 16:30:00', NULL),
(1, 1, 'Gym member injured during workout.', 'In Progress', '2025-03-19 09:00:00', NULL),
(2, 2, 'Lounge AC not cooling properly.', 'Reported', '2025-03-19 11:15:00', NULL);
