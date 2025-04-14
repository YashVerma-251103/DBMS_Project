"""
Feedback table structure:

CREATE TABLE Feedback (
    Feedback_Id SERIAL NOT NULL,
    Facility_Id INT NOT NULL,
    Aadhaar_No VARCHAR(20) NOT NULL,
    Manager_Id INT NOT NULL,
    Date_Time TIMESTAMP NOT NULL DEFAULT NOW(),
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    Comments TEXT,
    PRIMARY KEY (Feedback_Id, Facility_Id, Aadhaar_No, Manager_Id),
    CONSTRAINT fk_feedback_facility FOREIGN KEY (Facility_Id) REFERENCES Facility(Facility_Id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_customer FOREIGN KEY (Aadhaar_No) REFERENCES Customer(Aadhaar_No) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_manager FOREIGN KEY (Manager_Id) REFERENCES Employee(Employee_Id) ON DELETE SET NULL
);
"""

def build_feedback_search_query(params):
    """
    Build a dynamic SQL query for the Feedback table.
    Modified to show feedback with rating >= selected rating.
    """
    query = "SELECT * FROM Feedback WHERE 1=1"
    values = []
    
    if params.get('feedback_id') and params['feedback_id'] != '':
        query += " AND Feedback_Id = %s"
        values.append(params['feedback_id'])
    
    if params.get('facility_id') and params['facility_id'] != '':
        query += " AND Facility_Id = %s"
        values.append(params['facility_id'])
    
    if params.get('aadhaar_no') and params['aadhaar_no'] != '':
        query += " AND Aadhaar_No = %s"
        values.append(params['aadhaar_no'])
    
    if params.get('manager_id') and params['manager_id'] != '':
        query += " AND Manager_Id = %s"
        values.append(params['manager_id'])
    
    if params.get('rating') and params['rating'] != '':
        # Changed from = to >= for rating comparison
        query += " AND Rating >= %s"
        values.append(params['rating'])

    return query, values


def build_feedback_update_query(params):
    """
    Build a dynamic SQL query for the Feedback table.
    
    Expects a dictionary `params` with possible keys:
    - feedback_id
    - facility_id
    - aadhaar_no
    - manager_id
    - rating
    - comments
    - date_time

    Returns:
        (query_string, values) tuple.
    """
    query = "UPDATE Feedback SET "
    set_clauses = []
    values = []

    if 'rating' in params:
        set_clauses.append("Rating = %s")
        values.append(params['rating'])
    
    if 'comments' in params:
        set_clauses.append("Comments = %s")
        values.append(params['comments'])
    
    if 'date_time' in params:
        set_clauses.append("Date_Time = %s")
        values.append(params['date_time'])
    
    if not set_clauses:
        return None, None  # No fields to update

    query += ", ".join(set_clauses) + " WHERE Feedback_Id = %s AND Facility_Id = %s AND Aadhaar_No = %s AND Manager_Id = %s"
    values.append(params['feedback_id'])
    values.append(params['facility_id'])
    values.append(params['aadhaar_no'])
    values.append(params['manager_id'])

    return query, values


def build_feedback_delete_query(params):
    """
    Build a dynamic SQL delete query for the Feedback table.
    
    Expects a dictionary `params` with possible keys:
    - feedback_id
    - facility_id
    - aadhaar_no
    - manager_id

    Returns:
        (query_string, values) tuple.
    """
    query = "DELETE FROM Feedback WHERE Feedback_Id = %s AND Facility_Id = %s AND Aadhaar_No = %s AND Manager_Id = %s"
    values = [
        params.get('feedback_id'),
        params.get('facility_id'),
        params.get('aadhaar_no'),
        params.get('manager_id')
    ]
    
    if None in values:
        return None, None

    return query, values


def build_feedback_insert_query(params):
    """
    Build a dynamic SQL insert query for the Feedback table.
    
    Expects a dictionary `params` with possible keys:
    - facility_id
    - aadhaar_no
    - manager_id
    - rating
    - comments
    - date_time

    Returns:
        (query_string, values) tuple.
    """
    query = "INSERT INTO Feedback ("
    columns = []
    placeholders = []
    values = []

    if 'facility_id' in params:
        columns.append("Facility_Id")
        placeholders.append("%s")
        values.append(params['facility_id'])
    if 'aadhaar_no' in params:
        columns.append("Aadhaar_No")
        placeholders.append("%s")
        values.append(params['aadhaar_no'])
    if 'manager_id' in params:
        columns.append("Manager_Id")
        placeholders.append("%s")
        values.append(params['manager_id'])
    if 'rating' in params:
        columns.append("Rating")
        placeholders.append("%s")
        values.append(params['rating'])
    if 'comments' in params:
        columns.append("Comments")
        placeholders.append("%s")
        values.append(params['comments'])
    if 'date_time' in params:
        columns.append("Date_Time")
        placeholders.append("%s")
        values.append(params['date_time'])
    
    if not columns:
        return None, None
    
    query += ", ".join(columns) + ") VALUES (" + ", ".join(placeholders) + ");"

    return query, values