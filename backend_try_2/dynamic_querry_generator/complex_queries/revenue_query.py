"""
TODO: Build a querry builder to operate on the revenue table (and other related tables) and is able to run the following types of queries:

-- Revenue Analysis per Facility
-- Calculate the average monthly revenue for each facility for a given year (e.g., 2023).
SELECT 
    r.Facility_Id, 
    f.Name AS Facility_Name, 
    AVG(r.Monthly_Revenue) AS Avg_Monthly_Revenue,
    r.Financial_Year
FROM Revenue r
JOIN Facility f ON r.Facility_Id = f.Facility_Id
WHERE r.Financial_Year = 2023
GROUP BY r.Facility_Id, f.Name, r.Financial_Year;

"""



# def build_calculate_revenue(params):
#     """
#     Build a query to calculate the average monthly or yearly revenue from a given year to a given year and facility.
#     - if end date is none then treat it as after the start date
#     - if start date is none then treat it as before the end date
#     """

#     # Extract parameters from the input dictionary
#     facility_id = params.get('facility_id')
#     start_date = params.get('start_date')
#     end_date = params.get('end_date')
#     revenue_type = params.get('revenue_type', 'monthly')  # Default to monthly revenue if not specified

#     # Initialize the base query
#     query = "SELECT r.Facility_Id, f.Name AS Facility_Name, AVG(r.Monthly_Revenue) AS Avg_Monthly_Revenue, r.Financial_Year FROM Revenue r JOIN Facility f ON r.Facility_Id = f.Facility_Id"

#     # Add WHERE clause based on provided parameters
#     where_clauses = []
#     if facility_id:
#         where_clauses.append(f"r.Facility_Id = {facility_id}")
#     if start_date:
#         where_clauses.append(f"r.Financial_Year >= '{start_date}'")
#     if end_date:
#         where_clauses.append(f"r.Financial_Year <= '{end_date}'")

#     if where_clauses:
#         query += " WHERE " + " AND ".join(where_clauses)

#     # Add GROUP BY clause
#     query += " GROUP BY r.Facility_Id, f.Name, r.Financial_Year"

#     return query





import datetime

def build_calculate_revenue(params):
    """
    Build a query to calculate the average monthly or yearly revenue over a given time interval.
    
    If both start_date and end_date are provided and they parse as full dates that belong 
    to the same financial year, the query will calculate the average monthly revenue for 
    that year, filtering on the month range. Otherwise, the query uses the provided values 
    to filter on Financial_Year.
    
    Expects parameters:
      - facility_id (optional)
      - start_date (optional; can be a full date 'YYYY-MM-DD' or just a year)
      - end_date (optional; same format as start_date)
      - revenue_type (optional; default is 'monthly')
      
    Returns:
      (query_string, values) tuple.
    """
    facility_id = params.get('facility_id')
    start_date = params.get('start_date')
    end_date = params.get('end_date')
    revenue_type = params.get('revenue_type', 'monthly').lower()
    
    base_select = "SELECT r.Facility_Id, f.Name AS Facility_Name, "
    group_by = " GROUP BY r.Facility_Id, f.Name"
    where_clauses = []
    values = []
    
    if facility_id:
        where_clauses.append(f"r.Facility_Id = {facility_id}")

    # Try parsing start_date and end_date as full dates.
    same_year_interval = False
    start_dt = None
    end_dt = None
    try:
        if start_date:
            start_dt = datetime.datetime.fromisoformat(start_date)
        if end_date:
            end_dt = datetime.datetime.fromisoformat(end_date)
    except Exception:
        start_dt = None
        end_dt = None

    if start_dt and end_dt and (start_dt.year == end_dt.year):
        same_year_interval = True

    if same_year_interval:
        # Filter on the single financial year and also by month range.
        year = start_dt.year
        start_month = start_dt.month
        end_month = end_dt.month
        where_clauses.append(f"r.Financial_Year = {year}")
        # Here we assume there's a column named "Month" of type DATE storing the month.
        where_clauses.append("EXTRACT(MONTH FROM r.Month) BETWEEN %s AND %s")
        values.extend([start_month, end_month])
        # Use monthly revenue (over the specific months)
        select_revenue = "AVG(r.Monthly_Revenue) AS Avg_Monthly_Revenue, EXTRACT(MONTH FROM r.Month) AS revenue_month, r.Financial_Year"
        group_by += ", EXTRACT(MONTH FROM r.Month), r.Financial_Year"
    else:
        # Use the Financial_Year filtering.
        if start_date:
            # If start_date cannot be parsed as a full date, assume it's a year.
            where_clauses.append(f"r.Financial_Year >= {start_date}")
        if end_date:
            where_clauses.append(f"r.Financial_Year <= {end_date}")
        if revenue_type == 'yearly':
            select_revenue = "AVG(r.Yearly_Revenue) AS Avg_Yearly_Revenue, r.Financial_Year"
        else:
            select_revenue = "AVG(r.Monthly_Revenue) AS Avg_Monthly_Revenue, r.Financial_Year"
        group_by += ", r.Financial_Year"
    
    query = base_select + select_revenue + " FROM Revenue r JOIN Facility f ON r.Facility_Id = f.Facility_Id"
    if where_clauses:
        query += " WHERE " + " AND ".join(where_clauses)
    query += group_by

    return query, values
