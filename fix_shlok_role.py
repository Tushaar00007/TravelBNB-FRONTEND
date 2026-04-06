from pymongo import MongoClient
import os

MONGO_URL = "mongodb+srv://travelbnb07_db_user:hNwaWe4jqic61Wh2@travel-cluster.pgc8x5d.mongodb.net/?appName=travel-cluster"
DB_NAME = "travel_app"

try:
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    
    target_email = "shloksukhija2505@gmail.com"
    result = db.users.update_one(
        {"email": {"$regex": f"^{target_email}$", "$options": "i"}},
        {"$set": {"role": "host", "is_host": True}}
    )
    print(f"Modified: {result.modified_count}")
    
    # Verify
    user = db.users.find_one({"email": {"$regex": f"^{target_email}$", "$options": "i"}})
    if user:
        print(f"User: {user.get('name')}, Role: {user.get('role')}, is_host: {user.get('is_host')}")
    else:
        print("User not found after update!")

except Exception as e:
    print(f"Error: {e}")
finally:
    if 'client' in locals():
        client.close()
