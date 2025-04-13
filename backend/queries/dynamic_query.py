# # backend/queries/dynamic_query.py

# def build_flight_search_query(params):
#     """
#     Build a dynamic SQL query to search the Flight table.
#     The `params` dict can include any of the following keys:
#       - flight_number
#       - airline
#       - departure_airport
#       - arrival_airport
#       - departure_date (in YYYY-MM-DD format)
      
#     Adjust the field names below to match your actual schema.
#     """
#     query = "SELECT * FROM Flight WHERE 1=1"
#     values = []

#     if "flight_number" in params and params["flight_number"]:
#         query += " AND flight_number = %s"
#         values.append(params["flight_number"])
#     if "airline" in params and params["airline"]:
#         query += " AND airline = %s"
#         values.append(params["airline"])
#     if "departure_airport" in params and params["departure_airport"]:
#         query += " AND departure_airport = %s"
#         values.append(params["departure_airport"])
#     if "arrival_airport" in params and params["arrival_airport"]:
#         query += " AND arrival_airport = %s"
#         values.append(params["arrival_airport"])
#     if "departure_date" in params and params["departure_date"]:
#         # Assuming that your departure_time column stores full timestamps,
#         # we filter by date only:
#         query += " AND DATE(departure_time) = %s"
#         values.append(params["departure_date"])

#     return query, values



# backend/queries/dynamic_query.py

def build_flight_search_query(params):
    """
    Build a dynamic SQL query for the Flight table.
    
    Expects a dictionary `params` with possible keys:
      - flight_number
      - airline
      - departure_date  (if you want to filter by the date of departure)
    
    Returns:
      (query_string, values) tuple.
    
    The SQL query is built using lower-case column names assuming the DDL was executed without quotes.
    """
    # Our base query – note: we're referring to the Flight table as "flight"
    query = "SELECT * FROM flight WHERE 1=1"
    values = []

    # If the key exists and has a value, add the filter. Use lower-case column names.
    if params.get("flight_number"):
        # query += " AND flight_number = %s"
        query += " AND flight_number ILIKE %s"
        # query += " AND LOWER(flight_number) = LOWER(%s)"
        values.append(params["flight_number"])
    if params.get("airline"):
        # query += " AND airline = %s"
        query += " AND airline ILIKE %s"
        # query += " AND LOWER(airline) = LOWER(%s)"
        values.append(params["airline"])
    if params.get("departure_date"):
        # Here we extract the date from the departure_time column.
        query += " AND DATE(departure_time) = %s"
        values.append(params["departure_date"])

    return query, values
