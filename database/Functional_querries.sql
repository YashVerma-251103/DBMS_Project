-- -- TODO : May need to change the current date to a particular date.


-- Data Retrieval with Multiple Joins :
-- Retrieve booking details along with associated facility, customer, and employee (booking handler) information.
SELECT 
    b.Booking_Id, 
    b.Date_Time, 
    b.Payment_Status,
    f.Name AS Facility_Name, 
    f.Type,
    c.Customer_Name, 
    c.Contact_No,
    e.Name AS Employee_Name
FROM Booking b
JOIN Facility f ON b.Facility_Id = f.Facility_Id
JOIN Customer c ON b.Aadhaar_No = c.Aadhaar_No
JOIN Employee e ON b.Employee_Id = e.Employee_Id;


-- Aggregation and Grouping :
-- Calculate the total monthly revenue per facility for a specific financial year (e.g., 2023).
SELECT 
    f.Name AS Facility_Name, 
    SUM(r.Monthly_Revenue) AS Total_Monthly_Revenue
FROM Revenue r
JOIN Facility f ON r.Facility_Id = f.Facility_Id
WHERE r.Financial_Year = 2023
GROUP BY f.Name;


-- Nested Sub-Query for Analytical Insights :
-- List facilities that have an average feedback rating higher than 4.
SELECT 
    f.Facility_Id, 
    f.Name
FROM Facility f
WHERE f.Facility_Id IN (
    SELECT fb.Facility_Id
    FROM Feedback fb
    GROUP BY fb.Facility_Id
    HAVING AVG(fb.Rating) > 4
);


-- Insertion Queries

-- -- Insert a new booking record.
-- INSERT INTO Booking (Facility_Id, Aadhaar_No, Employee_Id, Date_Time, Payment_Status)
-- VALUES (1, '111122223333', 2, '2025-03-19 12:00:00', 'Pending');

-- -- Insert a new flight record.
-- INSERT INTO Flight (Flight_Number, Airline, Departure_Time, Arrival_Time, Status, Gate, Terminal)
-- VALUES ('AI202', 'Air India', '2025-04-20 15:30:00', '2025-04-20 18:00:00', 'On Time', 'G5', 'T1');


-- -- Update Queries
-- -- Update the payment status of a booking.
-- UPDATE Booking
-- SET Payment_Status = 'Completed'
-- WHERE Booking_Id = 10 AND Facility_Id = 2 AND Aadhaar_No = '123456789012';

-- -- Update flight status for a specific flight.
-- UPDATE Flight
-- SET Status = 'Delayed'
-- WHERE Flight_Number = 'AI202';

-- -- Deletion Queries
-- -- Delete an incident record that has been marked as resolved.
-- DELETE FROM Incident
-- WHERE Incident_Id = 10 AND Status = 'Resolved';


-- Complex Join with Internal Communication & Scheduling
-- Retrieve today's staff schedules along with any internal communication messages sent to those employees.
SELECT 
    ss.Schedule_Id, 
    e.Name AS Employee_Name, 
    ss.Shift_Date, 
    ss.Shift_Start, 
    ss.Shift_End, 
    com.Message, 
    com.Sent_At, 
    com.Message_Type
FROM Staff_Schedule ss
JOIN Employee e ON ss.Employee_Id = e.Employee_Id
LEFT JOIN Communication com ON com.Receiver_Id = e.Employee_Id
WHERE ss.Shift_Date = CURRENT_DATE;


-- Nested Subquery with Aggregation
-- List employees who have handled more than 1 bookings in the last month.
SELECT
    e.Employee_Id, 
    e.Name, 
    COUNT(b.Booking_Id) AS Booking_Count
FROM Employee e
JOIN Booking b ON e.Employee_Id = b.Employee_Id
WHERE b.Date_Time >= CURRENT_DATE - INTERVAL '1 month'
GROUP BY e.Employee_Id, e.Name
HAVING COUNT(b.Booking_Id) >= 2;


-- Flight Information for Upcoming Departures
-- Retrieve flights scheduled to depart within the next five hours from 6 am.
-- SELECT 
--     Flight_Number, 
--     Airline, 
--     Departure_Time, 
--     Arrival_Time, 
--     Status
-- FROM Flight
-- WHERE Departure_Time BETWEEN TIMESTAMP '2025-03-20 06:00:00' AND TIMESTAMP '2025-03-20 06:00:00' + INTERVAL '5 hours';


-- Revenue Analysis per Facility
-- Calculate the average monthly revenue for each facility for a given year (e.g., 2023).
SELECT 
    r.Facility_Id, 
    f.Name AS Facility_Name, 
    AVG(r.Monthly_Revenue) AS Avg_Monthly_Revenue,
    r.Financial_Year
FROM Revenue r
JOIN Facility f ON r.Facility_Id = f.Facility_Id
WHERE r.Financial_Year = 2023
GROUP BY r.Facility_Id, f.Name, r.Financial_Year;