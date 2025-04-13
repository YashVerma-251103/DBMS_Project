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
