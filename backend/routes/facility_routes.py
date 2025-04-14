# # routes/facility_routes.py
# from flask import Blueprint, request, jsonify
# from db import get_db_connection
# from psycopg2.extras import RealDictCursor

# bp = Blueprint("facilities", __name__, url_prefix="/facilities")

# @bp.route("/", methods=["GET"])
# def get_all_facilities():
#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)
#     cur.execute("SELECT * FROM Facility;")
#     facilities = cur.fetchall()
#     cur.close()
#     conn.close()
#     return jsonify(facilities)

# @bp.route("/", methods=["POST"])
# def create_facility():
#     data = request.get_json()
#     required_fields = ["Name", "Type", "Location", "Contact_No", "Opening_Hours", "Manager_Id"]
#     if not all(field in data for field in required_fields):
#         return jsonify({"error": "Missing required fields"}), 400

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)
#     try:
#         cur.execute("""
#             INSERT INTO Facility (Name, Type, Location, Contact_No, Opening_Hours, Manager_Id)
#             VALUES (%s, %s, %s, %s, %s, %s)
#             RETURNING *;
#         """, (data["Name"], data["Type"], data["Location"],
#               data["Contact_No"], data["Opening_Hours"], data["Manager_Id"]))
#         conn.commit()
#         new_facility = cur.fetchone()
#     except Exception as e:
#         conn.rollback()
#         return jsonify({"error": str(e)}), 500
#     finally:
#         cur.close()
#         conn.close()
#     return jsonify(new_facility), 201

# # Add endpoints for updating and deleting facilities similarly.




from flask import Blueprint, jsonify
import psycopg2
import psycopg2.extras
from db import get_db_connection

bp = Blueprint('facilities', __name__, url_prefix='/facilities')

# List facilities that have an average feedback rating higher than 4
@bp.route('/top-rated', methods=['GET'])
def get_top_rated_facilities():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""SELECT 
                   f.Facility_Id, 
                   f.Name
                   FROM Facility f
                   WHERE f.Facility_Id IN (
                       SELECT fb.Facility_Id
                       FROM Feedback fb
                       GROUP BY fb.Facility_Id
                       HAVING AVG(fb.Rating) > 4
                   )""")
    facilities = cur.fetchall()

    colnames = [desc[0] for desc in cur.description]  # get column names from cursor
    data = []
    for row in facilities:
        # zip each tuple with the column names, creating a dictionary
        row_dict = dict(zip(colnames, row))
        data.append(row_dict)

    cur.close()
    conn.close()
    return jsonify(data)