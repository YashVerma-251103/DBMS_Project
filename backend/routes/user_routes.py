# routes/user_routes.py
from flask import Blueprint, request, jsonify
import psycopg2
from psycopg2 import extras, errors
from werkzeug.security import generate_password_hash
from db import get_db_connection

bp = Blueprint('users', __name__, url_prefix='/users')

@bp.route('', methods=['POST'])
def create_user():
    data = request.get_json()  # Parse JSON body
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    name = data.get('name')
    contact_number = data.get('contactNumber')
    aadhar_number= data.get('aaddhaar_no')
    role = data.get('role')
    login_id = data.get('loginId')
    password = data.get('password')

    # Basic validation
    if not login_id or not password or not name:
        return jsonify({"error": "name, loginId, and password are required"}), 400

    # Hash the password before storing (for security)
    # hashed_pw = generate_password_hash(password)  # e.g. using PBKDF2
    hashed_pw = password

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    try:
        cur.execute(
            """INSERT INTO users (name, contact_number,aaddhaar_no, role, password, login_id)
               VALUES (%s, %s, %s, %s, %s, %s)
               RETURNING id, name, contact_number, aadhaar_number,role, password, login_id;""",
            (name, contact_number, aadhar_number,role, hashed_pw, login_id)
        )
        conn.commit()
    except psycopg2.IntegrityError:
        # This error is likely raised if login_id violates the UNIQUE constraint
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": f"Login ID '{login_id}' is already taken."}), 409
    # If no exception, fetch the newly inserted user record
    new_user = cur.fetchone()
    cur.close()
    conn.close()

    # Format the result to match expected JSON keys (camelCase for JSON fields)
    user_json = {
        "id": new_user["id"],
        "name": new_user["name"],
        "contactNumber": new_user["contact_number"],
        "aaddhaar_no":new_user["aaddhaar_no"],
        "role": new_user["role"],
        "password": new_user["password"],       # This is the hashed password
        "loginId": new_user["login_id"]
    }
    # Return JSON of the new user (201 Created)
    return jsonify(user_json), 201



@bp.route('', methods=['GET'])
def get_user_by_login():
    login_id = request.args.get('loginId')
    if not login_id:
        return jsonify({"error": "loginId query parameter is required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    cur.execute(
        """SELECT id, name, contact_number, aaddhaar_no, role, password, login_id
           FROM users WHERE login_id = %s""",
        (login_id,)
    )
    user = cur.fetchone()
    cur.close()
    conn.close()

    if not user:
        # No matching user found: return empty list (just like json-server would)
        return jsonify([]), 200

    # Prepare the user JSON (convert DB keys to expected JSON keys)
    user_json = {
        "id": user["id"],
        "name": user["name"],
        "contactNumber": user["contact_number"],
        "aaddhaar_no":user["aaddhaar_no"],
        "role": user["role"],
        "password": user["password"],     # hashed password
        "loginId": user["login_id"]
    }
    # Return as an array with one element to match frontend expectations
    return jsonify([user_json]), 200
