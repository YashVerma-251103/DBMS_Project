from flask import Blueprint, request, jsonify
from psycopg2 import extras, IntegrityError
from db import get_db_connection

bp = Blueprint("users", __name__, url_prefix="/users")


@bp.route("", methods=["POST"])
def create_user():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid Json"}), 400

    name = data.get("name")
    contactNumber = data.get("contactNumber")
    role = data.get("role")
    loginId = data.get("loginId")
    password = data.get("password")

    if not loginId or not password or not name:
        return jsonify({"error": "name, loginId, and password are required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)

    try:
        cur.execute(
            f"""INSERT INTO users (name,contact_number,role,password,login_id)
                VALUES ('{name}','{contactNumber}','{role}','{password}','{loginId}')
                RETURNING id, name, contact_number, role, password, login_id;"""
        )
        conn.commit()
    except IntegrityError:
        # ? must be because login id already made for some other customer.
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": f"Login ID '{loginId}' is already taken."}), 409

    new_user = cur.fetchone()
    cur.close()
    conn.close()

    user_json = {
        "id": new_user["id"],
        "name": new_user["name"],
        "contactNumber": new_user["contact_number"],
        "role": new_user["role"],
        "password": new_user["password"],
        "loginId": new_user["login_id"],
    }
    return jsonify(user_json), 201


# @bp.route('', methods=['GET'])
# def get_user_by_login():
#     loginId = request.args.get('loginId')
#     if not loginId:
#         return jsonify({"error": "loginId query parameter is required"}), 400

#     conn=get_db_connection()
#     cur = conn.cursor(cursor_factory=extras.RealDictCursor)
#     cur.execute(
#         f"""SELECT id,name,contact_number,role,password,login_id
#         FROM users
#         WHERE login_id='{loginId}';"""
#     )
#     user = cur.fetchone()
#     cur.close()
#     conn.close()

#     if not user:
#         return jsonify([]), 200

#     user_json={
#         "id":user["id"],
#         "name":user["name"],
#         "contactNumber":user["contact_number"],
#         "role":user["role"],
#         "password":user["password"],
#         "loginId":user["login_id"]
#     }
#     print(user_json)
#     return jsonify(user_json), 200


@bp.route("", methods=["GET"])
def get_user_by_login():
    loginId = request.args.get("loginId")
    if not loginId:
        return jsonify({"error": "loginId query parameter is required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    cur.execute(
        """SELECT id, name, contact_number, role, password, login_id
           FROM users
           WHERE login_id = %s;""",
        (loginId,),
    )
    user = cur.fetchone()
    cur.close()
    conn.close()

    if not user:
        return jsonify([]), 200

    user_json = {
        "id": user["id"],
        "name": user["name"],
        "contactNumber": user["contact_number"],
        "role": user["role"],
        "password": user["password"],
        "loginId": user["login_id"],
    }
    print(user_json)
    # Always return an array so that front-end code expecting an array works as expected
    return jsonify([user_json]), 200
