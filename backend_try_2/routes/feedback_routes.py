from flask import Blueprint, request, jsonify
from psycopg2 import extras, IntegrityError
from db import get_db_connection
from dynamic_querry_generator.feedback_query import (
    build_feedback_search_query,
    build_feedback_update_query,
    build_feedback_delete_query,
    build_feedback_insert_query,
)

bp = Blueprint("feedback", __name__, url_prefix="/feedback")


@bp.route("/search", methods=["GET"])
def search_feedback():
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    search_params = {
        "feedback_id": normalized_args.get("feedback_id"),
        "facility_id": normalized_args.get("facility_id"),
        "aadhaar_no": normalized_args.get("aadhaar_no"),
        "manager_id": normalized_args.get("manager_id"),
        "rating": normalized_args.get("rating")
    }

    query, values = build_feedback_search_query(search_params)
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
def update_feedback():
    """Update feedback details in the database"""
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    update_params = {
        "feedback_id": normalized_args.get("feedback_id"),
        "facility_id": normalized_args.get("facility_id"),
        "aadhaar_no": normalized_args.get("aadhaar_no"),
        "manager_id": normalized_args.get("manager_id"),
        "rating": normalized_args.get("rating"),
        "comments": normalized_args.get("comments"),
        "date_time": normalized_args.get("date_time")
    }

    query, values = build_feedback_update_query(update_params)
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

    return jsonify({"message": "Feedback updated successfully"})


@bp.route("/delete", methods=["DELETE"])
def delete_feedback():
    """Delete feedback from the database"""
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    delete_params = {
        "feedback_id": normalized_args.get("feedback_id"),
        "facility_id": normalized_args.get("facility_id"),
        "aadhaar_no": normalized_args.get("aadhaar_no"),
        "manager_id": normalized_args.get("manager_id")
    }

    query, values = build_feedback_delete_query(delete_params)
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

    return jsonify({"message": "Feedback deleted successfully"})


@bp.route("/insert", methods=["POST"])
def create_feedback():
    """Insert feedback details into the database"""
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    feedback_params = {
        "facility_id": normalized_args.get("facility_id"),
        "aadhaar_no": normalized_args.get("aadhaar_no"),
        "manager_id": normalized_args.get("manager_id"),
        "rating": normalized_args.get("rating"),
        "comments": normalized_args.get("comments"),
        "date_time": normalized_args.get("date_time")
    }

    query, values = build_feedback_insert_query(feedback_params)
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

    return jsonify({"message": "Feedback inserted successfully"})