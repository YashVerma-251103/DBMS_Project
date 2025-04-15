"""
Employee table structure:

CREATE TABLE Employee (
    Employee_Id SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Role VARCHAR(100) NOT NULL CHECK (Role IN ('Manager', 'Staff', 'Technician', 'Cleaner', 'Security', 'Authority')),
    Shift_Timings VARCHAR(50) NOT NULL
);
"""

def build_employee_search_query(params):
    """
    Build a dynamic SQL query for the Employee table.
    
    Expects a dictionary `params` with possible keys:
    - employee_id
    - name
    - role
    - shift_timings

    Returns:
        (query_string, values) tuple.
    """
    query = "SELECT * FROM Employee WHERE 1=1"
    values = []
    
    if params.get('employee_id') and params['employee_id'] != '':
        query += " AND Employee_Id = %s"
        values.append(params['employee_id'])
    
    if params.get('name') and params['name'] != '':
        query += " AND Name = %s"
        values.append(params['name'])
    
    if params.get('role') and params['role'] != '':
        query += " AND Role = %s"
        values.append(params['role'])
    
    if params.get('shift_timings') and params['shift_timings'] != '':
        query += " AND Shift_Timings = %s"
        values.append(params['shift_timings'])

    return query, values


def build_employee_update_query(params):
    """
    Build a dynamic SQL query for the Employee table.
    
    Expects a dictionary `params` with possible keys:
    - employee_id
    - name
    - role
    - shift_timings

    Returns:
        (query_string, values) tuple.
    """
    query = "UPDATE Employee SET "
    set_clauses = []
    values = []

    if 'name' in params:
        set_clauses.append("Name = %s")
        values.append(params['name'])
    
    if 'role' in params:
        set_clauses.append("Role = %s")
        values.append(params['role'])
    
    if 'shift_timings' in params:
        set_clauses.append("Shift_Timings = %s")
        values.append(params['shift_timings'])
    
    if not set_clauses:
        return None, None  # No fields to update

    query += ", ".join(set_clauses) + " WHERE Employee_Id = %s"
    values.append(params['employee_id'])

    return query, values


def build_employee_delete_query(params):
    """
    Build a dynamic SQL delete query for the Employee table.
    
    Expects a dictionary `params` with possible keys:
    - employee_id

    Returns:
        (query_string, values) tuple.
    """
    query = "DELETE FROM Employee WHERE Employee_Id = %s"
    values = [params['employee_id']] if params.get('employee_id') else None
    
    if not values:
        return None, None

    return query, values


def build_employee_insert_query(params):
    """
    Build a dynamic SQL insert query for the Employee table.
    
    Expects a dictionary `params` with possible keys:
    - name
    - role
    - shift_timings

    Returns:
        (query_string, values) tuple.
    """
    query = "INSERT INTO Employee ("
    columns = []
    placeholders = []
    values = []

    if 'name' in params:
        columns.append("Name")
        placeholders.append("%s")
        values.append(params['name'])
    if 'role' in params:
        columns.append("Role")
        placeholders.append("%s")
        values.append(params['role'])
    if 'shift_timings' in params:
        columns.append("Shift_Timings")
        placeholders.append("%s")
        values.append(params['shift_timings'])
    
    if not columns:
        return None, None
    
    query += ", ".join(columns) + ") VALUES (" + ", ".join(placeholders) + ");"

    return query, values