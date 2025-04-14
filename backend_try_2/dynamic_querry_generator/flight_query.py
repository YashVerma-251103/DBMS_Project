# backend/dynamic_querry_generator/flight_query.py



# def build_flight_search_query(params):
#     """
#     Build a dynamic SQL query for the Flight table.
    
#     Expects a dictionary `params` with possible keys:
#     - flight_number
#     - airline
#     - departure_date  (if you want to filter by the date of departure)
#     - departure_time (if you want to filter by the flight's departure time)
#     - arrival_date  (if you want to filter by the date of arrival)
#     - arrival_time   (if you want to filter by the flight's arrival time)
#     - status (if you want to filter by the flight's status)
#     - gate (if you want to filter by the flight's gate)
#     - terminal (if you want to filter by the flight's terminal)

#     Returns:
#         (query_string, values) tuple.
    
#     """

#     # Our base query – note: we're referring to the Flight table as "flight"
#     query = "SELECT * FROM flight WHERE 1=1"
#     values = []

#     # If the key exists and has a value, add the filter. Use lower-case column names.
#     if params.get("flight_number"):
#         query += " AND flight_number ILIKE %s"
#         values.append(params["flight_number"])
#     if params.get("airline"):
#         query += " AND airline ILIKE %s"
#         values.append(params["airline"])
#     if params.get("departure_date"):
#         query += " AND DATE(departure_time) = %s"
#         values.append(params["departure_date"])
#     if params.get("departure_time"):
#         query += " AND departure_time::time = %s"
#         values.append(params["departure_time"])
#     if params.get("arrival_date"):
#         query += " AND DATE(arrival_time) = %s"
#         values.append(params["arrival_date"])
#     if params.get("arrival_time"):
#         query += " AND arrival_time::time = %s"
#         values.append(params["arrival_time"])
#     if params.get("status"):
#         query += " AND status ILIKE %s"
#         values.append(params["status"])
#     if params.get("gate"):
#         query += " AND gate ILIKE %s"
#         values.append(params["gate"])
#     if params.get("terminal"):
#         query += " AND terminal ILIKE %s"
#         values.append(params["terminal"])

#     return query, values


def build_flight_search_query(params):
    """
    Build a dynamic SQL query for the Flight table.

    Expects a dictionary `params` with possible keys:
      - flight_number
      - airline
      - departure_time_start  (for filtering flights leaving after this time)
      - departure_time_end    (for filtering flights leaving before this time)
      - arrival_time_start    (for filtering flights arriving after this time)
      - arrival_time_end      (for filtering flights arriving before this time)
      - status
      - gate
      - terminal

    Returns:
        (query_string, values) tuple.
    """
    # Our base query – note: we're referring to the Flight table as "flight"
    query = "SELECT * FROM flight WHERE 1=1"
    values = []

    if params.get("flight_number"):
        query += " AND flight_number ILIKE %s"
        values.append(params["flight_number"])
    if params.get("airline"):
        query += " AND airline ILIKE %s"
        values.append(params["airline"])
    
    # Departure time filtering:
    if params.get("departure_time_start") and params.get("departure_time_end"):
        query += " AND departure_time BETWEEN %s AND %s"
        values.append(params["departure_time_start"])
        values.append(params["departure_time_end"])
    elif params.get("departure_time_start"):
        query += " AND departure_time >= %s"
        values.append(params["departure_time_start"])
    elif params.get("departure_time_end"):
        query += " AND departure_time <= %s"
        values.append(params["departure_time_end"])
        
    # Arrival time filtering:
    if params.get("arrival_time_start") and params.get("arrival_time_end"):
        query += " AND arrival_time BETWEEN %s AND %s"
        values.append(params["arrival_time_start"])
        values.append(params["arrival_time_end"])
    elif params.get("arrival_time_start"):
        query += " AND arrival_time >= %s"
        values.append(params["arrival_time_start"])
    elif params.get("arrival_time_end"):
        query += " AND arrival_time <= %s"
        values.append(params["arrival_time_end"])
    
    if params.get("status"):
        query += " AND status ILIKE %s"
        values.append(params["status"])
    if params.get("gate"):
        query += " AND gate ILIKE %s"
        values.append(params["gate"])
    if params.get("terminal"):
        query += " AND terminal ILIKE %s"
        values.append(params["terminal"])

    return query, values



def build_flight_update_query(params):
    """
    Build a dynamic SQL update query for the Flight table.

    Expects a dictionary `params` with possible keys:
    - airline
    - departure_time
    - arrival_time
    - status
    - gate
    - terminal
    - flight_number (for WHERE clause)

    Returns:
        (query_string, values) tuple.
    """

    # Base query for updating flight details
    query = "UPDATE flight SET "
    set_clauses = []
    values = []

    # Dynamically build the SET clauses based on provided fields
    if params.get("airline"):
        set_clauses.append("airline = %s")
        values.append(params["airline"])
    if params.get("departure_time"):
        set_clauses.append("departure_time = %s")
        values.append(params["departure_time"])
    if params.get("arrival_time"):
        set_clauses.append("arrival_time = %s")
        values.append(params["arrival_time"])
    if params.get("status"):
        set_clauses.append("status = %s")
        values.append(params["status"])
    if params.get("gate"):
        set_clauses.append("gate = %s")
        values.append(params["gate"])
    if params.get("terminal"):
        set_clauses.append("terminal = %s")
        values.append(params["terminal"])

    # If no valid fields provided for update, return an error message
    if not set_clauses:
        return None, None

    query += ", ".join(set_clauses) + """ WHERE flight_number = %s 
    RETURNING flight_number, airline, departure_time, arrival_time, status, gate, terminal;"""
    
    values.append(params["flight_number"])

    return query, values

def build_flight_delete_query(params):
    """
    Build a dynamic SQL delete query for the Flight table.

    Expects a dictionary `params` with possible keys:
    - flight_number (for WHERE clause)

    Returns:
        (query_string, values) tuple.
    """

    # Base query for deleting flight details
    query = "DELETE FROM flight WHERE "
    where_clauses = []
    values = []

    # Dynamically build the WHERE clauses based on provided fields
    if params.get("flight_number"):
        where_clauses.append("flight_number = %s")
        values.append(params["flight_number"])

    # If no valid fields provided for deletion, return an error message
    if not where_clauses:
        return None, None

    query += " AND ".join(where_clauses) + ";"
    
    return query, values

def build_flight_inser_query(params):
    """
    Build a dynamic SQL insert query for the Flight table.

    Expects a dictionary `params` with possible keys:
    - flight_number
    - airline
    - departure_time
    - arrival_time
    - status
    - gate
    - terminal

    Returns:
        (query_string, values) tuple.
    """

    # Base query for inserting flight details
    query = "INSERT INTO flight ("
    columns = []
    values = []

    # Dynamically build the columns and values based on provided fields
    if params.get("flight_number"):
        columns.append("flight_number")
        values.append(params["flight_number"])
    if params.get("airline"):
        columns.append("airline")
        values.append(params["airline"])
    if params.get("departure_time"):
        columns.append("departure_time")
        values.append(params["departure_time"])
    if params.get("arrival_time"):
        columns.append("arrival_time")
        values.append(params["arrival_time"])
    if params.get("status"):
        columns.append("status")
        values.append(params["status"])
    if params.get("gate"):
        columns.append("gate")
        values.append(params["gate"])
    if params.get("terminal"):
        columns.append("terminal")
        values.append(params["terminal"])
    
    if not columns:
        return None, None
    
    query += ", ".join(columns) + ") VALUES (" + ", ".join(["%s"] * len(values)) + ");"
    
    return query, values