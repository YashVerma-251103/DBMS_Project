# db.py
import psycopg2
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()  # This will load the variables from .env into os.environ

# Read database connection details from environment variables, or use defaults
DB_HOST = os.getenv("DB_HOST") #, "localhost")
DB_PORT = os.getenv("DB_PORT") #, 7022)  # default is 5432
DB_NAME = os.getenv("DB_NAME") #, "ams_2")
DB_USER = os.getenv("DB_USER") #, "postgres")
DB_PASS = os.getenv("DB_PASS") #, "2511")

def get_db_connection():
    """Open a new database connection."""
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS
    )
    return conn


# http://localhost:5000/flights/search?Flight_Number=6E202&Airline=Indigo
