# from flask import Blueprint, request, jsonify
# from psycopg2 import extras, IntegrityError
# from db import get_db_connection
# from dynamic_querry_generator.complex_queries.revenue_query import build_calculate_revenue

# bp = Blueprint("revenue", __name__, url_prefix="/revenue")

# @bp.route("/calculate_avg", methods=["GET"])
# def calculate_avg_revenue():
#     """
#     Endpoint to calculate the average revenue.
#     If start_date and end_date are provided as full dates within the same financial year,
#     it calculates average monthly revenue for that interval (grouped by month);
#     otherwise, it calculates based on the Financial_Year range.
    
#     Expects query parameters:
#       - facility_id (optional)
#       - start_date (optional, e.g. '2023-03-20' or just '2023')
#       - end_date (optional, e.g. '2023-04-15' or just '2023')
#       - revenue_type (optional, default 'monthly')
#     """
#     normalized_args = {k.lower(): v for k, v in request.args.items()}
#     print("Normalized args:", normalized_args)

#     search_params = {
#         "facility_id": normalized_args.get("facility_id"),
#         "start_date": normalized_args.get("start_date"),
#         "end_date": normalized_args.get("end_date"),
#         "revenue_type": normalized_args.get("revenue_type", "monthly"),
#     }

#     query, values = build_calculate_revenue(search_params)
#     print("Constructed query:", query)
#     print("With values:", values)

#     conn = get_db_connection()
#     cur = conn.cursor()
#     cur.execute(query, tuple(values))
#     rows = cur.fetchall()
#     colnames = [desc[0] for desc in cur.description]
#     data = [dict(zip(colnames, row)) for row in rows]
    
#     cur.close()
#     conn.close()
#     print(data)
#     return jsonify(data)



from flask import Blueprint, request, jsonify
from psycopg2 import IntegrityError
from db import get_db_connection
from dynamic_querry_generator.complex_queries.revenue_query import build_revenue_analysis_query

bp = Blueprint("revenue", __name__, url_prefix="/revenue")

@bp.route("/calculate_avg", methods=["GET"])
def calculate_avg_revenue():
    """
    Endpoint to calculate aggregated revenue.
    Query parameters supported:
      - facility_id (optional)
      - start_date (optional, 'YYYY-MM-DD' or just 'YYYY')
      - end_date (optional, same as start_date)
      - revenue_type ('monthly' or 'yearly', default 'monthly')
      - aggregation ('average' or 'total', default 'average')
      - min_revenue (optional threshold)
      - max_revenue (optional threshold)
    """
    normalized_args = {k.lower(): v for k, v in request.args.items()}
    print("Normalized args:", normalized_args)

    # Build the query using our new query builder
    query, values = build_revenue_analysis_query(normalized_args)
    print("Constructed query:", query)
    print("With values:", values)

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(query, tuple(values))
    rows = cur.fetchall()
    colnames = [desc[0] for desc in cur.description]
    data = [dict(zip(colnames, row)) for row in rows]

    cur.close()
    conn.close()
    print(data)
    return jsonify(data)
