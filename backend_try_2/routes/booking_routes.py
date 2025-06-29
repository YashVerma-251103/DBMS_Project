from flask import Blueprint, request, jsonify
from psycopg2 import extras, IntegrityError
from db import get_db_connection
from dynamic_querry_generator.booking_query import (
    build_booking_search_query,
    build_booking_update_query,
    build_booking_delete_query,
    build_booking_insert_query,
)

bp = Blueprint("bookings", __name__, url_prefix="/bookings")


@bp.route("/search", methods=["GET"])
def search_bookings():
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    search_params = {
        "booking_id": normalized_args.get("booking_id"),
        "facility_id": normalized_args.get("facility_id"),
        "aadhaar_no": normalized_args.get("aadhaar_no"),
        "employee_id": normalized_args.get("employee_id"),
        "date_time": normalized_args.get("date_time"),
        "payment_status": normalized_args.get("payment_status"),
    }

    query, values = build_booking_search_query(search_params)
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
    print(data)
    return jsonify(data)


@bp.route("/update", methods=["PUT"])
def update_booking():
    """Update booking details in the database"""
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    update_params = {
        "booking_id": normalized_args.get("booking_id"),
        "facility_id": normalized_args.get("facility_id"),
        "aadhaar_no": normalized_args.get("aadhaar_no"),
        "employee_id": normalized_args.get("employee_id"),
        "date_time": normalized_args.get("date_time"),
        "payment_status": normalized_args.get("payment_status"),
    }

    query, values = build_booking_update_query(update_params)
    print("Constructed query:", query)
    print("With values:", values)

    if values == None or query == None:
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "No valid parameters provided for update",
                }
            ),
            400,
        )

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(query, tuple(values))
        conn.commit()
        response = {"status": "success", "message": "Booking updated successfully"}
    except IntegrityError as e:
        conn.rollback()
        response = {"status": "error", "message": str(e)}
    finally:
        cur.close()
        conn.close()

    return jsonify(response)


@bp.route("/delete", methods=["DELETE"])
def delete_booking():
    """Delete booking details from the database"""
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    delete_params = {
        "booking_id": normalized_args.get("booking_id"),
    }

    query, values = build_booking_delete_query(delete_params)
    print("Constructed query:", query)
    print("With values:", values)

    if values == None or query == None:
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "No valid parameters provided for deletion",
                }
            ),
            400,
        )

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(query, tuple(values))
        conn.commit()
        response = {"status": "success", "message": "Booking deleted successfully"}
    except IntegrityError as e:
        conn.rollback()
        response = {"status": "error", "message": str(e)}
    finally:
        cur.close()
        conn.close()

    return jsonify(response)


@bp.route("/create", methods=["POST"])
def create_booking():
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    booking_params = {
        "facility_id": normalized_args.get("facility_id"),
        "aadhaar_no": normalized_args.get("aadhaar_no"),
        "employee_id": normalized_args.get("employee_id"),
        "date_time": normalized_args.get("date_time"),
        "payment_status": normalized_args.get("payment_status"),
    }

    query, values = build_booking_insert_query(booking_params)
    print("Constructed query:", query)
    print("With values:", values)

    if values == None or query == None:
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "No valid parameters provided for insertion",
                }
            ),
            400,
        )

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(query, tuple(values))
        conn.commit()
        response = {"status": "success", "message": "Booking created successfully"}
    except IntegrityError as e:
        conn.rollback()
        response = {"status": "error", "message": str(e)}
    finally:
        cur.close()
        conn.close()

    return jsonify(response)


@bp.route("/update_customer", methods=["PUT"])
def update_customer_booking():
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)
    update_params = {
        "booking_id": normalized_args.get("booking_id"),
        "facility_id": normalized_args.get("facility_id"),
        "aadhaar_no": normalized_args.get("aadhaar_no"),
        "employee_id": normalized_args.get("employee_id"),
        "date_time": normalized_args.get("date_time"),
        "payment_status": normalized_args.get("payment_status"),
    }

    # First: fetch the existing booking to verify ownership.
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT aadhaar_no FROM booking WHERE booking_id = %s",
        (update_params["booking_id"],),
    )
    result = cur.fetchone()
    if result is None:
        cur.close()
        conn.close()
        return jsonify({"status": "error", "message": "Booking not found"}), 404

    existing_aadhaar = result[0]
    # Check if the booking's owner is the same as the one provided in the request.
    # In production, retrieve the current user's aadhaar_no from the session/token instead.
    if normalized_args.get("aadhaar_no") != existing_aadhaar:
        cur.close()
        conn.close()
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Unauthorized update: booking does not belong to the user",
                }
            ),
            403,
        )

    # Now, build and execute the update query as before.
    query, values = build_booking_update_query(update_params)
    print("Constructed query:", query)
    print("With values:", values)

    if values is None or query is None:
        cur.close()
        conn.close()
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "No valid parameters provided for update",
                }
            ),
            400,
        )

    try:
        cur.execute(query, tuple(values))
        conn.commit()
        response = {"status": "success", "message": "Booking updated successfully"}
    except IntegrityError as e:
        conn.rollback()
        response = {"status": "error", "message": str(e)}
    finally:
        cur.close()
        conn.close()

    return jsonify(response)


@bp.route("/delete_ customer", methods=["DELETE"])
def delete_customer_booking():
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)
    delete_params = {
        "booking_id": normalized_args.get("booking_id"),
    }

    # First: fetch the existing booking to verify ownership.
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT aadhaar_no FROM booking WHERE booking_id = %s",
        (delete_params["booking_id"],),
    )
    result = cur.fetchone()
    if result is None:
        cur.close()
        conn.close()
        return jsonify({"status": "error", "message": "Booking not found"}), 404

    existing_aadhaar = result[0]
    # Compare with the aadhaar_no sent by the client.
    if normalized_args.get("aadhaar_no") != existing_aadhaar:
        cur.close()
        conn.close()
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Unauthorized deletion: booking does not belong to the user",
                }
            ),
            403,
        )

    query, values = build_booking_delete_query(delete_params)
    print("Constructed query:", query)
    print("With values:", values)

    if values is None or query is None:
        cur.close()
        conn.close()
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "No valid parameters provided for deletion",
                }
            ),
            400,
        )

    try:
        cur.execute(query, tuple(values))
        conn.commit()
        response = {"status": "success", "message": "Booking deleted successfully"}
    except IntegrityError as e:
        conn.rollback()
        response = {"status": "error", "message": str(e)}
    finally:
        cur.close()
        conn.close()

    return jsonify(response)
