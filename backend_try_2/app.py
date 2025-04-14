from flask import Flask
from flask_cors import CORS

from routes.user_routes import bp as user_bp
from routes.booking_routes import bp as booking_bp
from routes.flight_routes import bp as flight_bp
from routes.incident_routes import bp as incident_bp


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app.register_blueprint(user_bp)
app.register_blueprint(flight_bp)
app.register_blueprint(booking_bp)
app.register_blueprint(incident_bp)

if __name__ == "__main__":
    app.run(debug=True)
