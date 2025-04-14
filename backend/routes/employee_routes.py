# # routes/employee_routes.py
# from flask import Blueprint, request, jsonify
# from db import get_db_connection
# from psycopg2.extras import RealDictCursor

# import psycopg2
# from psycopg2 import errors
# from db import get_db_connection

# bp = Blueprint("employees", __name__, url_prefix="/employees")
# @bp.route("/", methods=["GET"])
# def get_all_employees():
#     """Fetch all employees"""
#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)
#     cur.execute("SELECT * FROM Employee;")
#     employees = cur.fetchall()
#     cur.close()
#     conn.close()
#     return jsonify(employees)

# @bp.route("/", methods=["POST"])
# def create_employee():
#     """Create a new employee"""
#     data = request.get_json()
#     required_fields = ["Name", "Role", "Shift_Timings"]
#     if not all(field in data for field in required_fields):
#         return jsonify({"error": "Missing required fields"}), 400

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)
#     try:
#         cur.execute("""
#             INSERT INTO Employee (Name, Role, Shift_Timings)
#             VALUES (%s, %s, %s)
#             RETURNING *;
#         """, (data["Name"], data["Role"], data["Shift_Timings"]))
#         conn.commit()
#         new_employee = cur.fetchone()
#     except Exception as e:
#         conn.rollback()
#         return jsonify({"error": str(e)}), 500
#     finally:
#         cur.close()
#         conn.close()
    
#     return jsonify(new_employee), 201

# # Similarly, you can add PUT (update) and DELETE endpoints here.





from flask import Blueprint, jsonify
import psycopg2
import psycopg2.extras
from db import get_db_connection

bp = Blueprint('employees', __name__, url_prefix='/employees')

# List employees who have handled more than 1 booking in the last month
@bp.route('/multiple-bookings', methods=['GET'])
def get_active_employees():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""SELECT 
                   e.Employee_Id, 
                   e.Name, 
                   COUNT(b.Booking_Id) AS Booking_Count
                   FROM Employee e
                   JOIN Booking b ON e.Employee_Id = b.Employee_Id
                   WHERE b.Date_Time >= CURRENT_DATE - INTERVAL '1 month'
                   GROUP BY e.Employee_Id, e.Name
                   HAVING COUNT(b.Booking_Id) >= 2""")
    employees = cur.fetchall()
    colnames = [desc[0] for desc in cur.description]  # get column names from cursor
    data = []
    for row in employees:
        # zip each tuple with the column names, creating a dictionary
        row_dict = dict(zip(colnames, row))
        data.append(row_dict)

    cur.close()
    conn.close()
    return jsonify(data)