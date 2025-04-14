# backend/dynamic_querry_generator/incident_query.py

"""
incident table structure:


-- 11. Incident Table (records operational incidents reported by staff)
CREATE TABLE Incident (
    Incident_Id SERIAL PRIMARY KEY,
    Reported_By INT NOT NULL,
    Facility_Id INT NOT NULL,
    Description TEXT NOT NULL,
    Status VARCHAR(50) CHECK (Status IN ('Reported', 'In Progress', 'Resolved')),
    Reported_At TIMESTAMP NOT NULL DEFAULT NOW(),
    Resolved_At TIMESTAMP,
    CONSTRAINT fk_incident_employee FOREIGN KEY (Reported_By) REFERENCES Employee(Employee_Id) ON DELETE SET NULL,
    CONSTRAINT fk_incident_facility FOREIGN KEY (Facility_Id) REFERENCES Facility(Facility_Id) ON DELETE SET NULL
);

"""


def build_incident_search_query(params):
    """
    Build a dynamic SQL query for the Incident table.
    
    Expects a dictionary `params` with possible keys:
    - incident_id
    - reported_by
    - facility_id
    - status
    - reported_at
    - resolved_at

    - order_by
    - limit

    Returns:
        (query_string, values) tuple.
    """
    
    
    # Our base query – note: we're referring to the Incident table as "Incident"
    query = "SELECT * FROM Incident WHERE 1=1"
    values = []
    
    if 'incident_id' in params:
        query += " AND Incident_Id = %s"
        values.append(params['incident_id'])
    
    if 'reported_by' in params:
        query += " AND Reported_By = %s"
        values.append(params['reported_by'])
    
    if 'facility_id' in params:
        query += " AND Facility_Id = %s"
        values.append(params['facility_id'])

    if 'status' in params:
        query += " AND Status = %s"
        values.append(params['status'])        
    
    if 'reported_at' in params:
        query += " AND Reported_At = %s"
        values.append(params['reported_at'])
    
    if 'resolved_at' in params:
        query += " AND Resolved_At = %s"
        values.append(params['resolved_at'])

    if 'order_by' in params:
        query += " ORDER BY %s" % params['order_by']
        # Note: Be cautious with this to avoid SQL injection.

    if 'limit' in params:
        query += " LIMIT %s"
        values.append(params['limit'])

    return query, values
    



def build_incident_update_query(params):
    """
    Build a dynamic SQL query for the Incident table.
    
    Expects a dictionary `params` with possible keys:
    - incident_id
    - reported_by
    - facility_id
    - description
    - status
    - reported_at
    - resolved_at

    Returns:
        (query_string, values) tuple.
    """

    # Our base query – note: we're referring to the Incident table as "Incident"
    query = "UPDATE Incident SET "
    set_clauses = []
    values = []

    if 'reported_by' in params:
        set_clauses.append("Reported_By = %s")
        values.append(params['reported_by'])
    
    if 'facility_id' in params:
        set_clauses.append("Facility_Id = %s")
        values.append(params['facility_id'])
    
    if 'description' in params:
        set_clauses.append("Description = %s")
        values.append(params['description'])
    
    if 'status' in params:
        set_clauses.append("Status = %s")
        values.append(params['status'])
    
    if 'reported_at' in params:
        set_clauses.append("Reported_At = %s")
        values.append(params['reported_at'])
    
    if 'resolved_at' in params:
        set_clauses.append("Resolved_At = %s")
        values.append(params['resolved_at'])
    
    if not set_clauses:
        return None, None  # No fields to update

    query += ", ".join(set_clauses) + " WHERE Incident_Id = %s"
    values.append(params['incident_id'])

    return query, values


def build_incident_delete_query(params):
    """
    Build a dynamic SQL delete query for the Incident table.
    
    Expects a dictionary `params` with possible keys:
    - incident_id

    Returns:
        (query_string, values) tuple.
    """
    
    # Our base query – note: we're referring to the Incident table as "Incident"
    query = "DELETE FROM Incident WHERE 1=1"
    where_clauses = []
    values = []

    
    if 'incident_id' in params:
        where_clauses.append("Incident_Id = %s")
        values.append(params['incident_id'])
    
    if where_clauses:
        query += " AND " + " AND ".join(where_clauses)
    else:
        return None, None

    return query, values



def build_incident_insert_query(params):
    """
    Build a dynamic SQL insert query for the Incident table.
    
    Expects a dictionary `params` with possible keys:
    - reported_by
    - facility_id
    - description
    - status
    - reported_at
    - resolved_at

    Returns:
        (query_string, values) tuple.
    """
    
    # Our base query – note: we're referring to the Incident table as "Incident"
    query = "INSERT INTO Incident ("
    columns = []
    placeholders = []
    values = []

    if 'reported_by' in params:
        columns.append("Reported_By")
        placeholders.append("%s")
        values.append(params['reported_by'])
    if 'facility_id' in params:
        columns.append("Facility_Id")
        placeholders.append("%s")
        values.append(params['facility_id'])
    if 'description' in params:
        columns.append("Description")
        placeholders.append("%s")
        values.append(params['description'])
    if 'status' in params:
        columns.append("Status")
        placeholders.append("%s")
        values.append(params['status'])
    if 'reported_at' in params:
        columns.append("Reported_At")
        placeholders.append("%s")
        values.append(params['reported_at'])
    if 'resolved_at' in params:
        columns.append("Resolved_At")
        placeholders.append("%s")
        values.append(params['resolved_at'])
    
    if not columns:
        return None, None
    
    query += ", ".join(columns) + ") VALUES (" + ", ".join(placeholders) + ");"

    return query, values