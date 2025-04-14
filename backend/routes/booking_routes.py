# # routes/booking_routes.py
# from flask import Blueprint, request, jsonify
# from db import get_db_connection
# from psycopg2.extras import RealDictCursor

# bp = Blueprint("bookings", __name__, url_prefix="/bookings")

# @bp.route("/", methods=["GET"])
# def get_all_bookings():
#     """Retrieve all booking details with related info."""
#     conn = get_db_connection()
#     # Use RealDictCursor so rows are returned as dictionaries
#     cur = conn.cursor(cursor_factory=RealDictCursor)
#     query = """
#         SELECT 
#             b.Booking_Id, 
#             b.Date_Time, 
#             b.Payment_Status,
#             f.Name AS Facility_Name, 
#             f.Type,
#             c.Customer_Name, 
#             c.Contact_No,
#             e.Name AS Employee_Name
#         FROM Booking b
#         JOIN Facility f ON b.Facility_Id = f.Facility_Id
#         JOIN Customer c ON b.Aadhaar_No = c.Aadhaar_No
#         JOIN Employee e ON b.Employee_Id = e.Employee_Id;
#     """
#     cur.execute(query)
#     rows = cur.fetchall()
#     cur.close()
#     conn.close()
#     # Return JSON with keys (thanks to RealDictCursor)
#     return jsonify(rows)

# @bp.route("/revenue/<int:year>", methods=["GET"])
# def get_revenue_by_year(year):
#     """Retrieve total monthly revenue grouped by facility for a given financial year."""
#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)
#     query = """
#       SELECT 
#           f.Name AS Facility_Name, 
#           SUM(r.Monthly_Revenue) AS Total_Revenue
#       FROM Revenue r
#       JOIN Facility f ON r.Facility_Id = f.Facility_Id
#       WHERE r.Financial_Year = %s
#       GROUP BY f.Name;
#     """
#     cur.execute(query, (year,))
#     data = cur.fetchall()
#     cur.close()
#     conn.close()
#     return jsonify(data)





from flask import Blueprint, request, jsonify
import psycopg2
import psycopg2.extras
from db import get_db_connection

bp = Blueprint('bookings', __name__, url_prefix='/bookings')

# Retrieve booking details with related facility, customer, and employee info
@bp.route('/summary', methods=['GET'])
def get_bookings_summary():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""SELECT 
                   b.Booking_Id, 
                   b.Date_Time, 
                   b.Payment_Status,
                   f.Name AS Facility_Name, 
                   f.Type,
                   c.Customer_Name, 
                   c.Contact_No,
                   e.Name AS Employee_Name
                   FROM Booking b
                   JOIN Facility f ON b.Facility_Id = f.Facility_Id
                   JOIN Customer c ON b.Aadhaar_No = c.Aadhaar_No
                   JOIN Employee e ON b.Employee_Id = e.Employee_Id""")
    rows = cur.fetchall()

    colnames = [desc[0] for desc in cur.description]  # get column names from cursor
    data = []
    for row in rows:
        # zip each tuple with the column names, creating a dictionary
        row_dict = dict(zip(colnames, row))
        data.append(row_dict)

    cur.close()
    conn.close()
    return jsonify(data)

# Create a new booking record
@bp.route('', methods=['POST'])
def create_booking():
    data = request.get_json()
    facility_id = data.get('Facility_Id')
    aadhaar_no = data.get('Aadhaar_No')
    employee_id = data.get('Employee_Id')
    date_time = data.get('Date_Time')
    payment_status = data.get('Payment_Status')
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    # Insert new booking (using RETURNING to get the generated Booking_Id)
    cur.execute("""INSERT INTO Booking (Facility_Id, Aadhaar_No, Employee_Id, Date_Time, Payment_Status)
                 VALUES (%s, %s, %s, %s, %s) RETURNING Booking_Id""", 
                (facility_id, aadhaar_no, employee_id, date_time, payment_status))
    new_booking = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return jsonify(new_booking), 201

# Update the payment status of a booking
@bp.route('/status', methods=['PUT'])
def update_booking_status():
    data = request.get_json()
    booking_id = data.get('Booking_Id')
    facility_id = data.get('Facility_Id')
    aadhaar_no = data.get('Aadhaar_No')
    new_status = data.get('Payment_Status')
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""UPDATE Booking
                   SET Payment_Status = %s
                   WHERE Booking_Id = %s AND Facility_Id = %s AND Aadhaar_No = %s""", 
                (new_status, booking_id, facility_id, aadhaar_no))
    conn.commit()
    affected = cur.rowcount
    cur.close()
    conn.close()
    if affected == 0:
        return jsonify({'error': 'No booking updated'}), 404
    return jsonify({'message': 'Booking status updated'})
