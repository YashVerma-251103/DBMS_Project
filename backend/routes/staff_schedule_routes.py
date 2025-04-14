from flask import Blueprint, jsonify
import psycopg2
import psycopg2.extras
from db import get_db_connection

bp = Blueprint('staff', __name__, url_prefix='/staff')

# Retrieve today's staff schedules with any internal messages sent to those employees
@bp.route('/schedules/today', methods=['GET'])
def get_todays_staff_schedule():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""SELECT 
                   ss.Schedule_Id, 
                   e.Name AS Employee_Name, 
                   ss.Shift_Date, 
                   ss.Shift_Start, 
                   ss.Shift_End, 
                   com.Message, 
                   com.Sent_At, 
                   com.Message_Type
                   FROM Staff_Schedule ss
                   JOIN Employee e ON ss.Employee_Id = e.Employee_Id
                   LEFT JOIN Communication com ON com.Receiver_Id = e.Employee_Id
                   WHERE ss.Shift_Date = CURRENT_DATE""")
    schedules = cur.fetchall()
    colnames = [desc[0] for desc in cur.description]  # get column names from cursor
    data = []
    for row in schedules:
        # zip each tuple with the column names, creating a dictionary
        row_dict = dict(zip(colnames, row))
        data.append(row_dict)

    cur.close()
    conn.close()
    return jsonify(data)
