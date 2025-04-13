-- Triggers

CREATE OR REPLACE FUNCTION check_manager_role() 
RETURNS trigger AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM Employee 
        WHERE Employee_Id = NEW.Manager_Id 
          AND Role = 'Manager'
    ) THEN
        RAISE EXCEPTION 'Manager_Id % does not belong to an employee with role Manager', NEW.Manager_Id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;





-- Attachments

CREATE TRIGGER check_manager_role_trigger
BEFORE INSERT OR UPDATE ON Facility
FOR EACH ROW
EXECUTE FUNCTION check_manager_role();
