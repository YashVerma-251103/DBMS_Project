from flask import Blueprint, request, jsonify
from psycopg2 import extras, IntegrityError
from db import get_db_connection
from dynamic_querry_generator.facility_query import (
    build_facility_search_query,
    build_facility_update_query,
    build_facility_delete_query,
    build_facility_insert_query,
)

bp = Blueprint("facilities", __name__, url_prefix="/facilities")


@bp.route("/search", methods=["GET"])
def search_facilities():
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    search_params = {
        "facility_id": normalized_args.get("facility_id"),
        "name": normalized_args.get("name"),
        "type": normalized_args.get("type"),
        "location": normalized_args.get("location"),
        "manager_id": normalized_args.get("manager_id")
    }

    query, values = build_facility_search_query(search_params)
    print("Constructed query:", query)
    print("With values:", values)
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(query, tuple(values))
    rows = cur.fetchall()
    colnames = [desc[0] for desc in cur.description]
    data = []
    for row in rows:
        row_dict = dict(zip(colnames, row))
        data.append(row_dict)

    cur.close()
    conn.close()
    return jsonify(data)


@bp.route("/update", methods=["PUT"])
def update_facility():
    """Update facility details in the database"""
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    update_params = {
        "facility_id": normalized_args.get("facility_id"),
        "name": normalized_args.get("name"),
        "type": normalized_args.get("type"),
        "location": normalized_args.get("location"),
        "contact_no": normalized_args.get("contact_no"),
        "opening_hours": normalized_args.get("opening_hours"),
        "manager_id": normalized_args.get("manager_id")
    }

    query, values = build_facility_update_query(update_params)
    print("Constructed query:", query)
    print("With values:", values)

    if values == None or query == None:
        return (
            jsonify({"error": "Invalid parameters"}),
            400,
        )

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(query, tuple(values))
        conn.commit()
    except IntegrityError as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()

    return jsonify({"message": "Facility updated successfully"})


@bp.route("/delete", methods=["DELETE"])
def delete_facility():
    """Delete a facility from the database"""
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    delete_params = {
        "facility_id": normalized_args.get("facility_id")
    }

    query, values = build_facility_delete_query(delete_params)
    print("Constructed query:", query)
    print("With values:", values)

    if values == None or query == None:
        return (
            jsonify({"error": "Invalid parameters"}),
            400,
        )

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(query, tuple(values))
        conn.commit()
    except IntegrityError as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()

    return jsonify({"message": "Facility deleted successfully"})


@bp.route("/insert", methods=["POST"])
def create_facility():
    """Insert facility details into the database"""
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    facility_params = {
        "name": normalized_args.get("name"),
        "type": normalized_args.get("type"),
        "location": normalized_args.get("location"),
        "contact_no": normalized_args.get("contact_no"),
        "opening_hours": normalized_args.get("opening_hours"),
        "manager_id": normalized_args.get("manager_id")
    }

    query, values = build_facility_insert_query(facility_params)
    print("Constructed query:", query)
    print("With values:", values)

    if values == None or query == None:
        return (
            jsonify({"error": "Invalid parameters"}),
            400,
        )

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(query, tuple(values))
        conn.commit()
    except IntegrityError as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()

    return jsonify({"message": "Facility inserted successfully"})