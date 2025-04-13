-- SCHEMA WAS ALREADY PROVIDED BEFORE THIS !

-- --1 -- GPT

-- PROMPT

-- No changes to the original schema is allowed. Now based on the original schema perform the following task.
-- Find the names of facilities that generate more than the average monthly revenue in the financial year 2022 and less than the average yearly revenue in the financial year 2023 order them in decreasing order of yearly revenue if values comes same order them in same way using monthly revenue. if the result is not empty then create a separate table if it does not exist and calculate the difference in the yearly revenues from average and also create a column if it does not exist in the facility table with name "fraud status", there would 5 values for this under suspicion , on notice, excomunicado, and time_notice. these will be determined whether the difference in yearly revenues is of a factor of their monthly revenue. if the difference is more than 10 times the monthly revenue of the facility then excomunicado, more than 7 times then time_notice, more than 5 times then notice, more than 3 times then under suspicion, else free.
-- now also make sure that if there was a facility whose status is not free then change the status appropriately based on the current calculation of the revenues. also link the columns appropriately.
-- Make a single SQL command for this.



-- RESULT

WITH Avg_Revenues AS (
    SELECT 
        (SELECT AVG(Monthly_Revenue) FROM Revenue WHERE Financial_Year = 2022) AS Avg_Monthly_2022,
        (SELECT AVG(Yearly_Revenue) FROM Revenue WHERE Financial_Year = 2023) AS Avg_Yearly_2023
),
Filtered_Facilities AS (
    SELECT 
        r.Facility_Id, 
        f.Name AS Facility_Name, 
        r.Monthly_Revenue, 
        r.Yearly_Revenue, 
        (r.Yearly_Revenue - (SELECT Avg_Yearly_2023 FROM Avg_Revenues)) AS Revenue_Difference
    FROM Revenue r
    JOIN Facility f ON r.Facility_Id = f.Facility_Id
    WHERE r.Financial_Year = 2023
    AND r.Monthly_Revenue > (SELECT Avg_Monthly_2022 FROM Avg_Revenues)
    AND r.Yearly_Revenue < (SELECT Avg_Yearly_2023 FROM Avg_Revenues)
    ORDER BY r.Yearly_Revenue DESC, r.Monthly_Revenue DESC
)
-- Ensure the table exists
CREATE TABLE IF NOT EXISTS Facility_Revenue_Analysis (
    Facility_Id INT PRIMARY KEY,
    Facility_Name VARCHAR(255),
    Monthly_Revenue DECIMAL(10,2),
    Yearly_Revenue DECIMAL(12,2),
    Revenue_Difference DECIMAL(12,2),
    Fraud_Status VARCHAR(20) CHECK (Fraud_Status IN ('under suspicion', 'on notice', 'excomunicado', 'time_notice', 'free')),
    FOREIGN KEY (Facility_Id) REFERENCES Facility(Facility_Id) ON DELETE CASCADE
);

-- Ensure the fraud status column exists in Facility table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='facility' AND column_name='fraud_status') THEN
        ALTER TABLE Facility ADD COLUMN fraud_status VARCHAR(20) CHECK (fraud_status IN ('under suspicion', 'on notice', 'excomunicado', 'time_notice', 'free')) DEFAULT 'free';
    END IF;
END $$;

-- Insert or update the Facility_Revenue_Analysis table with calculated values
INSERT INTO Facility_Revenue_Analysis (Facility_Id, Facility_Name, Monthly_Revenue, Yearly_Revenue, Revenue_Difference, Fraud_Status)
SELECT 
    Facility_Id, 
    Facility_Name, 
    Monthly_Revenue, 
    Yearly_Revenue, 
    Revenue_Difference,
    CASE 
        WHEN Revenue_Difference > 10 * Monthly_Revenue THEN 'excomunicado'
        WHEN Revenue_Difference > 7 * Monthly_Revenue THEN 'time_notice'
        WHEN Revenue_Difference > 5 * Monthly_Revenue THEN 'on notice'
        WHEN Revenue_Difference > 3 * Monthly_Revenue THEN 'under suspicion'
        ELSE 'free'
    END AS Fraud_Status
FROM Filtered_Facilities
ON CONFLICT (Facility_Id) DO UPDATE 
SET 
    Facility_Name = EXCLUDED.Facility_Name,
    Monthly_Revenue = EXCLUDED.Monthly_Revenue,
    Yearly_Revenue = EXCLUDED.Yearly_Revenue,
    Revenue_Difference = EXCLUDED.Revenue_Difference,
    Fraud_Status = EXCLUDED.Fraud_Status;

-- Update Facility table's fraud_status accordingly
UPDATE Facility f
SET fraud_status = fa.Fraud_Status
FROM Facility_Revenue_Analysis fa
WHERE f.Facility_Id = fa.Facility_Id;




-- --2 -- GPT

-- PROMPT

-- For each employee who holds the role of 'Technician' and has worked on at least three distinct facilities during night shifts (defined as shifts that start at or after 10:00 PM and end at or before 6:00 AM) in the month of December 2023, retrieve the following information:

-- Employee Details:

-- Employee_Id

-- Name

-- Total number of night shifts worked in December 2023

-- List of distinct Facility_Names where the technician has worked night shifts

-- Facility Managers:

-- For each distinct facility identified above, provide the Name and Contact_No of the manager overseeing that facility.

-- Communication Records:

-- Retrieve all communication messages sent by the technician to any manager of the facilities they worked at during night shifts in December 2023. For each message, provide:

-- Message_Id

-- Receiver_Id (Manager's Employee_Id)

-- Message_Type

-- Message content

-- Sent_At timestamp

-- Additional Conditions:

-- Ensure that the 'Technician' has a valid 'Shift_Timings' entry that includes the substring 'Night'.

-- Only include communications where the Message_Type is 'Alert' or 'Notice'.

-- Order the final result by Employee_Id, followed by Facility_Name, and then by Sent_At timestamp in ascending order.



-- RESULT


WITH NightShiftTechnicians AS (
    -- Identify technicians who worked night shifts on at least 3 distinct facilities in December 2023
    SELECT 
        e.Employee_Id,
        e.Name,
        COUNT(DISTINCT f.Facility_Id) AS TotalFacilities,
        ARRAY_AGG(DISTINCT f.Name) AS FacilityNames
    FROM Employee e
    JOIN Work_Shifts ws ON e.Employee_Id = ws.Employee_Id
    JOIN Facility f ON ws.Facility_Id = f.Facility_Id
    WHERE 
        e.Role = 'Technician'
        AND ws.Shift_Timings LIKE '%Night%'  -- Ensure valid night shift entry
        AND ws.Start_Time >= '22:00:00' 
        AND ws.End_Time <= '06:00:00'
        AND ws.Date BETWEEN '2023-12-01' AND '2023-12-31'
    GROUP BY e.Employee_Id, e.Name
    HAVING COUNT(DISTINCT f.Facility_Id) >= 3
),
FacilityManagers AS (
    -- Retrieve managers for the facilities where the technicians worked
    SELECT 
        f.Facility_Id,
        f.Name AS Facility_Name,
        e.Employee_Id AS Manager_Id,
        e.Name AS Manager_Name,
        e.Contact_No
    FROM Facility f
    JOIN Employee e ON f.Manager_Id = e.Employee_Id
),
TechnicianCommunications AS (
    -- Retrieve communications sent by technicians to managers during December 2023
    SELECT 
        c.Sender_Id AS Technician_Id,
        c.Receiver_Id,
        c.Message_Id,
        c.Message_Type,
        c.Message_Content,
        c.Sent_At
    FROM Communication c
    JOIN NightShiftTechnicians nt ON c.Sender_Id = nt.Employee_Id
    JOIN FacilityManagers fm ON c.Receiver_Id = fm.Manager_Id
    WHERE 
        c.Message_Type IN ('Alert', 'Notice')
        AND c.Sent_At BETWEEN '2023-12-01 00:00:00' AND '2023-12-31 23:59:59'
)
-- Final selection combining all required data
SELECT 
    nt.Employee_Id,
    nt.Name AS Technician_Name,
    nt.TotalFacilities AS Total_Night_Shifts,
    nt.FacilityNames,
    fm.Facility_Name,
    fm.Manager_Name,
    fm.Contact_No AS Manager_Contact,
    tc.Message_Id,
    tc.Receiver_Id AS Manager_Employee_Id,
    tc.Message_Type,
    tc.Message_Content,
    tc.Sent_At
FROM NightShiftTechnicians nt
JOIN FacilityManagers fm ON fm.Facility_Name = ANY (nt.FacilityNames)
LEFT JOIN TechnicianCommunications tc ON nt.Employee_Id = tc.Technician_Id
ORDER BY nt.Employee_Id, fm.Facility_Name, tc.Sent_At;
