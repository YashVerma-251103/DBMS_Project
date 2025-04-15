"""
Staff_Schedule table structure:

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
"""

def build_staff_schedule_search_query(params):
    """
    Build a dynamic SQL query for the Staff_Schedule table.

    Expects a dictionary `params` with possible keys:
    - schedule_id
    - employee_id
    - facility_id
    - shift_date
    - shift_start
    - shift_end
    - task_description

    Returns:
        (query_string, values) tuple.
    """
    query = "SELECT * FROM Staff_Schedule WHERE 1=1"
    values = []

    if params.get('schedule_id') and params['schedule_id'] != '':
        query += " AND Schedule_Id = %s"
        values.append(params['schedule_id'])

    if params.get('employee_id') and params['employee_id'] != '':
        query += " AND Employee_Id = %s"
        values.append(params['employee_id'])

    if params.get('facility_id') and params['facility_id'] != '':
        query += " AND Facility_Id = %s"
        values.append(params['facility_id'])

    if params.get('shift_date') and params['shift_date'] != '':
        query += " AND Shift_Date = %s"
        values.append(params['shift_date'])

    if params.get('shift_start') and params['shift_start'] != '':
        query += " AND Shift_Start = %s"
        values.append(params['shift_start'])

    if params.get('shift_end') and params['shift_end'] != '':
        query += " AND Shift_End = %s"
        values.append(params['shift_end'])

    if params.get('task_description') and params['task_description'] != '':
        query += " AND Task_Description = %s"
        values.append(params['task_description'])

    return query, values


def build_staff_schedule_update_query(params):
    """
    Build a dynamic SQL query for updating the Staff_Schedule table.

    Expects a dictionary `params` with possible keys:
    - schedule_id (for the WHERE clause)
    - employee_id
    - facility_id
    - shift_date
    - shift_start
    - shift_end
    - task_description

    Returns:
        (query_string, values) tuple.
    """
    query = "UPDATE Staff_Schedule SET "
    set_clauses = []
    values = []

    if 'employee_id' in params:
        set_clauses.append("Employee_Id = %s")
        values.append(params['employee_id'])

    if 'facility_id' in params:
        set_clauses.append("Facility_Id = %s")
        values.append(params['facility_id'])

    if 'shift_date' in params:
        set_clauses.append("Shift_Date = %s")
        values.append(params['shift_date'])

    if 'shift_start' in params:
        set_clauses.append("Shift_Start = %s")
        values.append(params['shift_start'])

    if 'shift_end' in params:
        set_clauses.append("Shift_End = %s")
        values.append(params['shift_end'])

    if 'task_description' in params:
        set_clauses.append("Task_Description = %s")
        values.append(params['task_description'])

    if not set_clauses:
        return None, None  # No fields to update

    query += ", ".join(set_clauses) + " WHERE Schedule_Id = %s"
    values.append(params['schedule_id'])

    return query, values


def build_staff_schedule_delete_query(params):
    """
    Build a dynamic SQL delete query for the Staff_Schedule table.

    Expects a dictionary `params` with possible keys:
    - schedule_id

    Returns:
        (query_string, values) tuple.
    """
    query = "DELETE FROM Staff_Schedule WHERE Schedule_Id = %s"
    values = [params['schedule_id']] if params.get('schedule_id') else None

    if not values:
        return None, None

    return query, values


def build_staff_schedule_insert_query(params):
    """
    Build a dynamic SQL insert query for the Staff_Schedule table.

    Expects a dictionary `params` with possible keys:
    - employee_id
    - facility_id
    - shift_date
    - shift_start
    - shift_end
    - task_description

    Returns:
        (query_string, values) tuple.
    """
    query = "INSERT INTO Staff_Schedule ("
    columns = []
    placeholders = []
    values = []

    if 'employee_id' in params:
        columns.append("Employee_Id")
        placeholders.append("%s")
        values.append(params['employee_id'])
    if 'facility_id' in params:
        columns.append("Facility_Id")
        placeholders.append("%s")
        values.append(params['facility_id'])
    if 'shift_date' in params:
        columns.append("Shift_Date")
        placeholders.append("%s")
        values.append(params['shift_date'])
    if 'shift_start' in params:
        columns.append("Shift_Start")
        placeholders.append("%s")
        values.append(params['shift_start'])
    if 'shift_end' in params:
        columns.append("Shift_End")
        placeholders.append("%s")
        values.append(params['shift_end'])
    if 'task_description' in params:
        columns.append("Task_Description")
        placeholders.append("%s")
        values.append(params['task_description'])

    if not columns:
        return None, None

    query += ", ".join(columns) + ") VALUES (" + ", ".join(placeholders) + ");"

    return query, values