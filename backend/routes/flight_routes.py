# backend/routes/flight_routes.py
from flask import Blueprint, request, jsonify
from db import get_db_connection
from queries.dynamic_query import build_flight_search_query

bp = Blueprint("flights", __name__, url_prefix="/flights")


@bp.route("/search", methods=["GET"])
def search_flights():
    # Normalize all query parameter keys to lower-case.
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)  # Debug: see what keys are received

    search_params = {
        "flight_number": normalized_args.get("flight_number"),
        "airline": normalized_args.get("airline"),
        "departure_date": normalized_args.get("departure_date"),
    }

    query, values = build_flight_search_query(search_params)
    print("Constructed query:", query)
    print("With values:", values)

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(query, tuple(values))
    rows = cur.fetchall()
    colnames = [desc[0] for desc in cur.description]  # get column names from cursor

    data = []
    for row in rows:
        # zip each tuple with the column names, creating a dictionary
        row_dict = dict(zip(colnames, row))
        data.append(row_dict)

    cur.close()
    conn.close()

    return jsonify(data)


@bp.route("/<flight_number>", methods=["PUT"])
def update_flight(flight_number):
    """Update flight details in the database"""
    update_data = request.get_json()
    
    if not update_data:
        return jsonify({"error": "No update data provided"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Build the dynamic update query based on provided fields
        set_clauses = []
        values = []
        
        if 'airline' in update_data:
            set_clauses.append("airline = %s")
            values.append(update_data['airline'])
        
        if 'departure_time' in update_data:
            set_clauses.append("departure_time = %s")
            values.append(update_data['departure_time'])
        
        if 'arrival_time' in update_data:
            set_clauses.append("arrival_time = %s")
            values.append(update_data['arrival_time'])
        
        if 'status' in update_data:
            set_clauses.append("status = %s")
            values.append(update_data['status'])
        
        if 'gate' in update_data:
            set_clauses.append("gate = %s")
            values.append(update_data['gate'])
        
        if 'terminal' in update_data:
            set_clauses.append("terminal = %s")
            values.append(update_data['terminal'])

        if not set_clauses:
            return jsonify({"error": "No valid fields provided for update"}), 400

        # Add flight_number for WHERE clause
        values.append(flight_number)

        update_query = f"""
            UPDATE flight
            SET {', '.join(set_clauses)}
            WHERE flight_number = %s
            RETURNING flight_number, airline, departure_time, 
                     arrival_time, status, gate, terminal
        """

        cur.execute(update_query, tuple(values))
        updated_flight = cur.fetchone()
        
        if not updated_flight:
            conn.rollback()
            return jsonify({"error": "Flight not found or update failed"}), 404

        conn.commit()
        
        # Return the updated flight data
        colnames = [desc[0] for desc in cur.description]
        result = dict(zip(colnames, updated_flight))
        return jsonify(result)

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()