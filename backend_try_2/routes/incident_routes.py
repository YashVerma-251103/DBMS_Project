from flask import Blueprint, request, jsonify
from psycopg2 import extras, IntegrityError
from db import get_db_connection
from backend.dynamic_querry_generator.incident_query import (
    build_incident_search_query,
    build_incident_update_query,
    build_incident_delete_query,
    build_incident_insert_query,
)

bp = Blueprint("incidents", __name__, url_prefix="/incidents")


@bp.route("/search", methods=["GET"])
def search_incidentw():
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    search_params = {
        "incident_id": normalized_args.get("incident_id"),
        "facility_id": normalized_args.get("facility_id"),
        "reported_by": normalized_args.get("reported_by"),
        "description": normalized_args.get("description"),
        "status": normalized_args.get("status"),
        "reported_at": normalized_args.get("reported_at"),
        "resolved_at": normalized_args.get("resolved_at"),
    }

    query, values = build_incident_search_query(search_params)
    print("Constructed query:", query)
    print("With values:", values)
    conn = get_db_connection()
    cur = conn.cursor()
    # cur = conn.cursor(extras.DictCursor)
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
def update_incident():
    """Update incident details in the database"""
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    update_params = {
        "incident_id": normalized_args.get("incident_id"),
        "facility_id": normalized_args.get("facility_id"),
        "reported_by": normalized_args.get("reported_by"),
        "description": normalized_args.get("description"),
        "status": normalized_args.get("status"),
        "reported_at": normalized_args.get("reported_at"),
        "resolved_at": normalized_args.get("resolved_at"),
    }

    query, values = build_incident_update_query(update_params)
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

    return jsonify({"message": "Incident updated successfully"})


@bp.route("/delete", methods=["DELETE"])
def delete_incident():
    """Delete an incident from the database"""
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    delete_params = {
        "incident_id": normalized_args.get("incident_id"),
        "facility_id": normalized_args.get("facility_id"),
        "reported_by": normalized_args.get("reported_by"),
        "description": normalized_args.get("description"),
        "status": normalized_args.get("status"),
        "reported_at": normalized_args.get("reported_at"),
        "resolved_at": normalized_args.get("resolved_at"),
    }

    query, values = build_incident_delete_query(delete_params)
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

    return jsonify({"message": "Incident deleted successfully"})


@bp.route("/insert", methods=["POST"])
def create_incident():
    """Insert incident details into the database"""
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    incident_params = {
        "incident_id": normalized_args.get("incident_id"),
        "facility_id": normalized_args.get("facility_id"),
        "reported_by": normalized_args.get("reported_by"),
        "description": normalized_args.get("description"),
        "status": normalized_args.get("status"),
        "reported_at": normalized_args.get("reported_at"),
        "resolved_at": normalized_args.get("resolved_at"),
    }

    query, values = build_incident_insert_query(incident_params)
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

    return jsonify({"message": "Incident inserted successfully"})
