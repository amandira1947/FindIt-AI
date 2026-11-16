
import sqlite3
from pathlib import Path

# Database file location
DB_PATH = Path(__file__).with_name("lost_found.db")


# Connect to database
def get_connection():
    return sqlite3.connect(DB_PATH)


# Create the items table
def init_db():
    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_type TEXT NOT NULL,
            item_name TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            location TEXT NOT NULL,
            item_date TEXT,
            image_filename TEXT,
            contact TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    connection.commit()
    connection.close()


# Insert an item into database
def insert_item(data):
    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO items (
            item_type,
            item_name,
            category,
            description,
            location,
            item_date,
            image_filename,
            contact
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["item_type"],
        data["item_name"],
        data["category"],
        data["description"],
        data["location"],
        data.get("item_date"),
        data.get("image_filename"),
        data.get("contact")
    ))

    item_id = cursor.lastrowid

    connection.commit()
    connection.close()

    return item_id


# Get all reported items
def get_items():
    connection = get_connection()

    connection.row_factory = sqlite3.Row

    cursor = connection.cursor()

    cursor.execute("SELECT * FROM items ORDER BY id DESC")

    items = [dict(row) for row in cursor.fetchall()]

    connection.close()

    return items
