# from flask import Blueprint, request, jsonify
# from psycopg2 import extras, IntegrityError
# from db import get_db_connection
# from dynamic_querry_generator.flight_query import (
#     build_flight_search_query,
#     build_flight_update_query,
#     build_flight_delete_query,
#     build_flight_inser_query,
# )

# bp = Blueprint("flights", __name__, url_prefix="/flights")


# @bp.route("/search", methods=["GET"])
# def search_flights():
#     normalized_args = {k.lower(): v for k, v in request.args.items()}
#     print("Normalized args:", normalized_args)

#     search_params = {
#         "flight_number": normalized_args.get("flight_number"),
#         "airline": normalized_args.get("airline"),
#         "departure_date": normalized_args.get("departure_date"),
#         "departure_time": normalized_args.get("departure_time"),
#         "arrival_date": normalized_args.get("arrival_date"),
#         "arrival_time": normalized_args.get("arrival_time"),
#         "status": normalized_args.get("status"),
#         "gate": normalized_args.get("gate"),
#         "terminal": normalized_args.get("terminal"),
#     }

#     query, values = build_flight_search_query(search_params)
#     print("Constructed query:", query)
#     print("With values:", values)

#     conn = get_db_connection()
#     cur = conn.cursor()
#     # cur = conn.cursor(extras.DictCursor)
#     cur.execute(query, tuple(values))
#     rows = cur.fetchall()
#     colnames = [desc[0] for desc in cur.description]
#     data = []
#     for row in rows:
#         row_dict = dict(zip(colnames, row))
#         data.append(row_dict)

#     cur.close()
#     conn.close()
#     print(data)
#     return jsonify(data)


from flask import Blueprint, request, jsonify
from psycopg2 import extras, IntegrityError
from db import get_db_connection
from dynamic_querry_generator.flight_query import (
    build_flight_search_query,
    build_flight_update_query,
    build_flight_delete_query,
    build_flight_inser_query,
)

bp = Blueprint("flights", __name__, url_prefix="/flights")

@bp.route("/search", methods=["GET"])
def search_flights():
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    # Use the new keys for flexible time filtering.
    search_params = {
        "flight_number": normalized_args.get("flight_number"),
        "airline": normalized_args.get("airline"),
        "departure_time_start": normalized_args.get("departure_time_start"),
        "departure_time_end": normalized_args.get("departure_time_end"),
        "arrival_time_start": normalized_args.get("arrival_time_start"),
        "arrival_time_end": normalized_args.get("arrival_time_end"),
        "status": normalized_args.get("status"),
        "gate": normalized_args.get("gate"),
        "terminal": normalized_args.get("terminal"),
    }

    query, values = build_flight_search_query(search_params)
    print("Constructed query:", query)
    print("With values:", values)

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(query, tuple(values))
    rows = cur.fetchall()
    colnames = [desc[0] for desc in cur.description]
    data = [dict(zip(colnames, row)) for row in rows]

    cur.close()
    conn.close()
    print(data)
    return jsonify(data)



@bp.route("/update", methods=["PUT"])
def update_flight():
    """Update flight details in the database"""
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    update_params = {
        "flight_number": normalized_args.get("flight_number"),
        "airline": normalized_args.get("airline"),
        "departure_date": normalized_args.get("departure_date"),
        "departure_time": normalized_args.get("departure_time"),
        "arrival_date": normalized_args.get("arrival_date"),
        "arrival_time": normalized_args.get("arrival_time"),
        "status": normalized_args.get("status"),
        "gate": normalized_args.get("gate"),
        "terminal": normalized_args.get("terminal"),
    }

    query, values = build_flight_update_query(update_params)
    print("Constructed query:", query)
    print("With values:", values)
    if query == None or values == None:
        return jsonify({"error": "No fields to update"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(query, tuple(values))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Flight updated successfully"}), 200
    except IntegrityError as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": str(e)}), 400


@bp.route("/<flight_number>", methods=["DELETE"])
def delete_flight(flight_number):
    """Delete flight details from the database"""
    delete_params = {"flight_number": flight_number}

    query, values = build_flight_delete_query(delete_params)
    print("Constructed query:", query)
    print("With values:", values)

    if query == None or values == None:
        return jsonify({"error": "No fields to delete"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(query, tuple(values))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Flight deleted successfully"}), 200
    except IntegrityError as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": str(e)}), 400


@bp.route("/create", methods=["POST"])
def create_flight():
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    flight_params = {
        "flight_number": normalized_args.get("flight_number"),
        "airline": normalized_args.get("airline"),
        "departure_date": normalized_args.get("departure_date"),
        "departure_time": normalized_args.get("departure_time"),
        "arrival_date": normalized_args.get("arrival_date"),
        "arrival_time": normalized_args.get("arrival_time"),
        "status": normalized_args.get("status"),
        "gate": normalized_args.get("gate"),
        "terminal": normalized_args.get("terminal"),
    }

    query, values = build_flight_inser_query(flight_params)
    print("Constructed query:", query)
    print("With values:", values)
    if query == None or values == None:
        return jsonify({"error": "No fields to insert"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(query, tuple(values))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Flight created successfully"}), 201
    except IntegrityError as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": str(e)}), 400