import os
try:
    import psycopg2
except ImportError:
    print("psycopg2-binary not installed")
    exit(1)
from dotenv import load_dotenv

load_dotenv()

def test_connection():
    url = os.getenv("DATABASE_URL")
    if not url:
        print("DATABASE_URL not found in .env")
        return
    
    try:
        conn = psycopg2.connect(url)
        print("Successfully connected to PostgreSQL!")
        conn.close()
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    test_connection()
