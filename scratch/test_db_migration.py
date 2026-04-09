import sqlite3
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def migrate():
    sqlite_db = "secure_training_platform/database/secure_platform.db"
    pg_url = os.getenv("DATABASE_URL")
    
    if not os.path.exists(sqlite_db):
        print(f"SQLite DB not found at {sqlite_db}")
        return
        
    if not pg_url:
        print("DATABASE_URL not found")
        return

    # This is a placeholder for actual migration logic
    print(f"Ready to migrate {sqlite_db} to {pg_url}")

if __name__ == "__main__":
    migrate()
