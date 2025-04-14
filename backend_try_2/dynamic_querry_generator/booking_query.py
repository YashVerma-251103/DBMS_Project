# backend/dynamic_querry_generator/booking_query.py


def build_booking_search_query(params):
    """
    Build a dynamic SQL query for the Booking table.

    Expects a dictionary `params` with possible keys:
    - booking_id
    - facility_id
    - aadhaar_no
    - employee_id
    - date_time
    - payment_status

    Returns:
        (query_string, values) tuple.
    """

    # Our base query – note: we're referring to the Booking table as "booking"
    query = "SELECT * FROM booking WHERE 1=1"
    values = []

    if params.get("booking_id"):
        query += " AND booking_id = %s"
        values.append(params["booking_id"])
    if params.get("facility_id"):
        query += " AND facility_id = %s"
        values.append(params["facility_id"])
    if params.get("aadhaar_no"):
        query += " AND aadhaar_no = %s"
        values.append(params["aadhaar_no"])
    if params.get("employee_id"):
        query += " AND employee_id = %s"
        values.append(params["employee_id"])
    if params.get("date_time"):
        query += " AND date_time = %s"
        values.append(params["date_time"])
    if params.get("payment_status"):
        query += " AND payment_status = %s"
        values.append(params["payment_status"])

    return query, values


def build_booking_update_query(params):
    """
    Build a dynamic SQL query for the Booking table.

    Expects a dictionary `params` with possible keys:
    - booking_id
    - facility_id
    - aadhaar_no
    - employee_id
    - date_time
    - payment_status

    Returns:
        (query_string, values) tuple.
    """

    # Our base query – note: we're referring to the Booking table as "booking"
    query = "UPDATE booking SET "
    set_clauses = []
    values = []

    if params.get("facility_id"):
        set_clauses.append("facility_id = %s")
        values.append(params["facility_id"])
    if params.get("aadhaar_no"):
        set_clauses.append("aadhaar_no = %s")
        values.append(params["aadhaar_no"])
    if params.get("employee_id"):
        set_clauses.append("employee_id = %s")
        values.append(params["employee_id"])
    if params.get("date_time"):
        set_clauses.append("date_time = %s")
        values.append(params["date_time"])
    if params.get("payment_status"):
        set_clauses.append("payment_status = %s")
        values.append(params["payment_status"])

    if not set_clauses:
        return None, None

    query += ", ".join(set_clauses) + " WHERE booking_id = %s"
    values.append(params["booking_id"])

    return query, values


def build_booking_delete_query(params):
    """
    Build a dynamic SQL delete query for the Booking table.

    Expects a dictionary `params` with possible keys:
    - booking_id

    Returns:
        (query_string, values) tuple.
    """

    # Our base query – note: we're referring to the Booking table as "booking"
    query = "DELETE FROM booking WHERE 1=1"
    where_clauses = []
    values = []

    if params.get("booking_id"):
        where_clauses.append("booking_id = %s")
        values.append(params["booking_id"])
    
    if not where_clauses:
        return None, None
    query += " AND " + " AND ".join(where_clauses) +";"

    return query, values


def build_booking_insert_query(params):
    """
    Build a dynamic SQL insert query for the Booking table.

    Expects a dictionary `params` with possible keys:
    - facility_id
    - aadhaar_no
    - employee_id
    - date_time
    - payment_status

    Returns:
        (query_string, values) tuple.
    """

    # Our base query – note: we're referring to the Booking table as "booking"
    query = "INSERT INTO booking ("
    columns = []
    placeholders = []
    values = []

    if params.get("facility_id"):
        columns.append("facility_id")
        placeholders.append("%s")
        values.append(params["facility_id"])
    if params.get("aadhaar_no"):
        columns.append("aadhaar_no")
        placeholders.append("%s")
        values.append(params["aadhaar_no"])
    if params.get("employee_id"):
        columns.append("employee_id")
        placeholders.append("%s")
        values.append(params["employee_id"])
    if params.get("date_time"):
        columns.append("date_time")
        placeholders.append("%s")
        values.append(params["date_time"])
    if params.get("payment_status"):
        columns.append("payment_status")
        placeholders.append("%s")
        values.append(params["payment_status"])

    if not columns:
        return None, None

    query += ", ".join(columns) + ") VALUES (" + ", ".join(placeholders) + ");"

    return query, values