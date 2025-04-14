from flask import Blueprint, jsonify
import psycopg2
import psycopg2.extras
from db import get_db_connection

bp = Blueprint('revenue', __name__, url_prefix='/revenue')

# Calculate total monthly revenue per facility for a given financial year
@bp.route('/yearly/<int:year>', methods=['GET'])
def get_revenue_summary(year):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""SELECT 
                   f.Name AS Facility_Name, 
                   SUM(r.Monthly_Revenue) AS Total_Monthly_Revenue
                   FROM Revenue r
                   JOIN Facility f ON r.Facility_Id = f.Facility_Id
                   WHERE r.Financial_Year = %s
                   GROUP BY f.Name""", (year,))
    summary = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(summary)

# Calculate average monthly revenue for each facility for a given year
@bp.route('/average/<int:year>', methods=['GET'])
def get_avg_monthly_revenue(year):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""SELECT 
                   r.Facility_Id, 
                   f.Name AS Facility_Name, 
                   AVG(r.Monthly_Revenue) AS Avg_Monthly_Revenue,
                   r.Financial_Year
                   FROM Revenue r
                   JOIN Facility f ON r.Facility_Id = f.Facility_Id
                   WHERE r.Financial_Year = %s
                   GROUP BY r.Facility_Id, f.Name, r.Financial_Year""", (year,))
    averages = cur.fetchall()
    colnames = [desc[0] for desc in cur.description]  # get column names from cursor
    data = []
    for row in averages:
        # zip each tuple with the column names, creating a dictionary
        row_dict = dict(zip(colnames, row))
        data.append(row_dict)
    cur.close()
    conn.close()
    return jsonify(averages)
