# app.py
from flask import Flask
from flask_cors import CORS

from routes.flight_routes import bp as flight_bp
from routes.employee_routes import bp as employee_bp
from routes.facility_routes import bp as facility_bp
# from routes.customer_routes import bp as customer_bp
from routes.booking_routes import bp as booking_bp
# from routes.feedback_routes import bp as feedback_bp
from routes.revenue_routes import bp as revenue_bp
# from routes.inventory_routes import bp as inventory_bp
from routes.staff_schedule_routes import bp as staff_schedule_bp
# from routes.communication_routes import bp as communication_bp
from routes.incident_routes import bp as incident_bp
from routes.user_routes import bp as user_bp





app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Register blueprints
app.register_blueprint(flight_bp)
app.register_blueprint(booking_bp)

app.register_blueprint(employee_bp)
app.register_blueprint(facility_bp)
# app.register_blueprint(customer_bp)
# app.register_blueprint(feedback_bp)
app.register_blueprint(revenue_bp)
# app.register_blueprint(inventory_bp)
app.register_blueprint(staff_schedule_bp)
# app.register_blueprint(communication_bp)
app.register_blueprint(incident_bp)
app.register_blueprint(user_bp)


if __name__ == "__main__":
    app.run(debug=True)
