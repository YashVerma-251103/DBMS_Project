"""
Facility table structure:

CREATE TABLE Facility (
    Facility_Id SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Type VARCHAR(100) NOT NULL CHECK (Type IN ('Gym', 'Lounge', 'Restaurant', 'Shop', 'Other')),
    Location TEXT NOT NULL,
    Contact_No VARCHAR(15) NOT NULL CHECK (Contact_No ~ '^[0-9]+$'),
    Opening_Hours VARCHAR(50) NOT NULL,
    Manager_Id INT NOT NULL,
    CONSTRAINT fk_manager FOREIGN KEY (Manager_Id) REFERENCES Employee(Employee_Id) ON DELETE SET NULL
);
"""

def build_facility_search_query(params):
    """
    Build a dynamic SQL query for the Facility table.
    
    Expects a dictionary `params` with possible keys:
    - facility_id
    - name
    - type
    - location
    - manager_id

    Returns:
        (query_string, values) tuple.
    """
    query = "SELECT * FROM Facility WHERE 1=1"
    values = []
    
    if params.get('facility_id') and params['facility_id'] != '':
        query += " AND Facility_Id = %s"
        values.append(params['facility_id'])
    
    if params.get('name') and params['name'] != '':
        query += " AND Name = %s"
        values.append(params['name'])
    
    if params.get('type') and params['type'] != '':
        query += " AND Type = %s"
        values.append(params['type'])

    if params.get('location') and params['location'] != '':
        query += " AND Location = %s"
        values.append(params['location'])
    
    if params.get('manager_id') and params['manager_id'] != '':
        query += " AND Manager_Id = %s"
        values.append(params['manager_id'])

    return query, values


def build_facility_update_query(params):
    """
    Build a dynamic SQL query for the Facility table.
    
    Expects a dictionary `params` with possible keys:
    - facility_id
    - name
    - type
    - location
    - contact_no
    - opening_hours
    - manager_id

    Returns:
        (query_string, values) tuple.
    """
    query = "UPDATE Facility SET "
    set_clauses = []
    values = []

    if 'name' in params:
        set_clauses.append("Name = %s")
        values.append(params['name'])
    
    if 'type' in params:
        set_clauses.append("Type = %s")
        values.append(params['type'])
    
    if 'location' in params:
        set_clauses.append("Location = %s")
        values.append(params['location'])
    
    if 'contact_no' in params:
        set_clauses.append("Contact_No = %s")
        values.append(params['contact_no'])
    
    if 'opening_hours' in params:
        set_clauses.append("Opening_Hours = %s")
        values.append(params['opening_hours'])
    
    if 'manager_id' in params:
        set_clauses.append("Manager_Id = %s")
        values.append(params['manager_id'])
    
    if not set_clauses:
        return None, None  # No fields to update

    query += ", ".join(set_clauses) + " WHERE Facility_Id = %s"
    values.append(params['facility_id'])

    return query, values


def build_facility_delete_query(params):
    """
    Build a dynamic SQL delete query for the Facility table.
    
    Expects a dictionary `params` with possible keys:
    - facility_id

    Returns:
        (query_string, values) tuple.
    """
    query = "DELETE FROM Facility WHERE Facility_Id = %s"
    values = [params['facility_id']] if params.get('facility_id') else None
    
    if not values:
        return None, None

    return query, values


def build_facility_insert_query(params):
    """
    Build a dynamic SQL insert query for the Facility table.
    
    Expects a dictionary `params` with possible keys:
    - name
    - type
    - location
    - contact_no
    - opening_hours
    - manager_id

    Returns:
        (query_string, values) tuple.
    """
    query = "INSERT INTO Facility ("
    columns = []
    placeholders = []
    values = []

    if 'name' in params:
        columns.append("Name")
        placeholders.append("%s")
        values.append(params['name'])
    if 'type' in params:
        columns.append("Type")
        placeholders.append("%s")
        values.append(params['type'])
    if 'location' in params:
        columns.append("Location")
        placeholders.append("%s")
        values.append(params['location'])
    if 'contact_no' in params:
        columns.append("Contact_No")
        placeholders.append("%s")
        values.append(params['contact_no'])
    if 'opening_hours' in params:
        columns.append("Opening_Hours")
        placeholders.append("%s")
        values.append(params['opening_hours'])
    if 'manager_id' in params:
        columns.append("Manager_Id")
        placeholders.append("%s")
        values.append(params['manager_id'])
    
    if not columns:
        return None, None
    
    query += ", ".join(columns) + ") VALUES (" + ", ".join(placeholders) + ");"

    return query, values