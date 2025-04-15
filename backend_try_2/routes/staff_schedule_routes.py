from flask import Blueprint, request, jsonify
from psycopg2 import extras, IntegrityError
from db import get_db_connection
from dynamic_querry_generator.staff_schedule_query import (
    build_staff_schedule_search_query,
    build_staff_schedule_update_query,
    build_staff_schedule_delete_query,
    build_staff_schedule_insert_query,
)

bp = Blueprint("staff_schedule", __name__, url_prefix="/staff_schedule")


# @bp.route("/search", methods=["GET"])
# def search_staff_schedules():
#     normalized_args = {k.lower(): v for k, v in request.args.items()}
#     print("Normalized args:", normalized_args)

#     search_params = {
#         "schedule_id": normalized_args.get("schedule_id"),
#         "employee_id": normalized_args.get("employee_id"),
#         "facility_id": normalized_args.get("facility_id"),
#         "shift_date": normalized_args.get("shift_date"),
#         "shift_start": normalized_args.get("shift_start"),
#         "shift_end": normalized_args.get("shift_end"),
#         "task_description": normalized_args.get("task_description"),
#     }

#     query, values = build_staff_schedule_search_query(search_params)
#     print("Constructed query:", query)
#     print("With values:", values)
#     conn = get_db_connection()
#     cur = conn.cursor()
#     cur.execute(query, tuple(values))
#     rows = cur.fetchall()
#     colnames = [desc[0] for desc in cur.description]
#     data = []
#     for row in rows:
#         row_dict = dict(zip(colnames, row))
#         data.append(row_dict)

#     cur.close()
#     conn.close()
#     return jsonify(data)


@bp.route("/search", methods=["GET"])
def search_staff_schedules():
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    search_params = {
        "schedule_id": normalized_args.get("schedule_id"),
        "employee_id": normalized_args.get("employee_id"),
        "facility_id": normalized_args.get("facility_id"),
        "shift_date": normalized_args.get("shift_date"),
        "shift_start": normalized_args.get("shift_start"),
        "shift_end": normalized_args.get("shift_end"),
        "task_description": normalized_args.get("task_description"),
    }

    query, values = build_staff_schedule_search_query(search_params)
    print("Constructed query:", query)
    print("With values:", values)
    
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(query, tuple(values))
    rows = cur.fetchall()
    colnames = [desc[0] for desc in cur.description]
    data = []
    
    import datetime  # Ensure datetime is imported for type checking

    for row in rows:
        row_dict = dict(zip(colnames, row))
        # Convert time, date and datetime objects to string
        for key, value in row_dict.items():
            if isinstance(value, (datetime.time, datetime.date, datetime.datetime)):
                row_dict[key] = value.isoformat()
        data.append(row_dict)

    cur.close()
    conn.close()
    return jsonify(data)


@bp.route("/update", methods=["PUT"])
def update_staff_schedule():
    """Update staff schedule details in the database"""
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    update_params = {
        "schedule_id": normalized_args.get("schedule_id"),
        "employee_id": normalized_args.get("employee_id"),
        "facility_id": normalized_args.get("facility_id"),
        "shift_date": normalized_args.get("shift_date"),
        "shift_start": normalized_args.get("shift_start"),
        "shift_end": normalized_args.get("shift_end"),
        "task_description": normalized_args.get("task_description"),
    }

    query, values = build_staff_schedule_update_query(update_params)
    print("Constructed query:", query)
    print("With values:", values)

    if values is None or query is None:
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

    return jsonify({"message": "Staff schedule updated successfully"})


@bp.route("/delete", methods=["DELETE"])
def delete_staff_schedule():
    """Delete a staff schedule from the database"""
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    delete_params = {
        "schedule_id": normalized_args.get("schedule_id")
    }

    query, values = build_staff_schedule_delete_query(delete_params)
    print("Constructed query:", query)
    print("With values:", values)

    if values is None or query is None:
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

    return jsonify({"message": "Staff schedule deleted successfully"})


@bp.route("/insert", methods=["POST"])
def create_staff_schedule():
    """Insert staff schedule details into the database"""
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    schedule_params = {
        "employee_id": normalized_args.get("employee_id"),
        "facility_id": normalized_args.get("facility_id"),
        "shift_date": normalized_args.get("shift_date"),
        "shift_start": normalized_args.get("shift_start"),
        "shift_end": normalized_args.get("shift_end"),
        "task_description": normalized_args.get("task_description"),
    }

    query, values = build_staff_schedule_insert_query(schedule_params)
    print("Constructed query:", query)
    print("With values:", values)

    if values is None or query is None:
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

    return jsonify({"message": "Staff schedule inserted successfully"})