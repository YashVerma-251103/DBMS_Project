# # app.py
# from flask import Flask
# from routes import booking_routes, flight_routes  # import blueprint modules

# app = Flask(__name__)
# # Register blueprints for different parts of the API
# app.register_blueprint(booking_routes.bp)   # registers routes under /bookings
# app.register_blueprint(flight_routes.bp)    # registers routes under /flights
# # ... register other blueprints as needed

# if __name__ == "__main__":
#     app.run(debug=True)  # Run the Flask development server


# app.py
from flask import Flask
from flask_cors import CORS
from routes.flight_routes import bp as flight_bp
from routes.booking_routes import bp as booking_bp  # if you have one

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Register blueprints
app.register_blueprint(flight_bp)
app.register_blueprint(booking_bp)

if __name__ == "__main__":
    app.run(debug=True)
