from flask import Blueprint, request, jsonify
from psycopg2 import extras, IntegrityError
from db import get_db_connection
from dynamic_querry_generator.employee_query import (
    build_employee_search_query,
    build_employee_update_query,
    build_employee_delete_query,
    build_employee_insert_query,
)

bp = Blueprint("employees", __name__, url_prefix="/employees")


@bp.route("/search", methods=["GET"])
def search_employees():
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    search_params = {
        "employee_id": normalized_args.get("employee_id"),
        "name": normalized_args.get("name"),
        "role": normalized_args.get("role"),
        "shift_timings": normalized_args.get("shift_timings")
    }

    query, values = build_employee_search_query(search_params)
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
def update_employee():
    """Update employee details in the database"""
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    update_params = {
        "employee_id": normalized_args.get("employee_id"),
        "name": normalized_args.get("name"),
        "role": normalized_args.get("role"),
        "shift_timings": normalized_args.get("shift_timings")
    }

    query, values = build_employee_update_query(update_params)
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

    return jsonify({"message": "Employee updated successfully"})


@bp.route("/delete", methods=["DELETE"])
def delete_employee():
    """Delete an employee from the database"""
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    delete_params = {
        "employee_id": normalized_args.get("employee_id")
    }

    query, values = build_employee_delete_query(delete_params)
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

    return jsonify({"message": "Employee deleted successfully"})


@bp.route("/insert", methods=["POST"])
def create_employee():
    """Insert employee details into the database"""
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    employee_params = {
        "name": normalized_args.get("name"),
        "role": normalized_args.get("role"),
        "shift_timings": normalized_args.get("shift_timings")
    }

    query, values = build_employee_insert_query(employee_params)
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

    return jsonify({"message": "Employee inserted successfully"})