import sqlite3

def verify():
    # Connect to the SQLite database file
    conn = sqlite3.connect("route53.db")
    cursor = conn.cursor()

    print("=== DATABASE VERIFICATION ===")
    
    # 1. Query the master table to check created tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall()]
    print(f"Created Tables: {tables}\n")
    
    # 2. Inspect users table
    cursor.execute("SELECT id, name, email FROM users;")
    users = cursor.fetchall()
    print(f"Seeded Users count: {len(users)}")
    for user in users:
        print(f" - ID: {user[0]}, Name: {user[1]}, Email: {user[2]}")
    print()

    # 3. Inspect hosted zones table
    cursor.execute("SELECT id, domain_name, description, user_id FROM hosted_zones;")
    zones = cursor.fetchall()
    print(f"Seeded Hosted Zones count: {len(zones)}")
    for zone in zones:
        print(f" - ID: {zone[0]}, Domain: {zone[1]}, Desc: {zone[2]}, Owner ID: {zone[3]}")
    print()

    # 4. Inspect DNS records table
    cursor.execute("SELECT id, record_name, record_type, value, ttl, hosted_zone_id FROM dns_records;")
    records = cursor.fetchall()
    print(f"Seeded DNS Records count: {len(records)}")
    for record in records:
        print(f" - ID: {record[0]}, Name: {record[1]}, Type: {record[2]}, Value: {record[3]}, TTL: {record[4]}s, Zone ID: {record[5]}")
    print("=============================")

    conn.close()

if __name__ == "__main__":
    verify()
