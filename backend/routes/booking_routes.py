# routes/booking_routes.py
from flask import Blueprint, request, jsonify
from db import get_db_connection

bp = Blueprint("bookings", __name__, url_prefix="/bookings")

@bp.route("/", methods=["GET"])
def get_all_bookings():
    """Retrieve all booking details with related info."""
    conn = get_db_connection()
    cur = conn.cursor()
    # Example query: join Booking with Facility, Customer, Employee (handler)
    query = """
        SELECT b.Booking_Id, b.Date_Time, b.Payment_Status,
               f.Name AS Facility_Name, f.Type,
               c.Customer_Name, c.Contact_No,
               e.Name AS Employee_Name
        FROM Booking b
        JOIN Facility f ON b.Facility_Id = f.Facility_Id
        JOIN Customer c ON b.Aadhaar_No = c.Aadhaar_No
        JOIN Employee e ON b.Employee_Id = e.Employee_Id;
    """
    cur.execute(query)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    # For now, return raw data; later convert to JSON with keys
    return jsonify(rows)

# routes/booking_routes.py (or a dedicated revenue endpoint)
@bp.route("/revenue/<int:year>", methods=["GET"])
def get_revenue_by_year(year):
    conn = get_db_connection()
    cur = conn.cursor()
    query = """
      SELECT f.Name AS Facility_Name, SUM(r.Monthly_Revenue) AS Total_Revenue
      FROM Revenue r
      JOIN Facility f ON r.Facility_Id = f.Facility_Id
      WHERE r.Financial_Year = %s
      GROUP BY f.Name;
    """
    cur.execute(query, (year,))
    data = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(data)
