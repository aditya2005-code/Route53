from sqlalchemy import select
from sqlalchemy.orm import Session
from app.db.database import engine, Base
from app.models.user import User
from app.models.hosted_zone import HostedZone
from app.models.dns_record import DNSRecord
from app.core.security import hash_password

def init_db(db: Session) -> None:
    """
    Initializes the database schema by creating all tables if they do not exist
    and seeding initial development records.
    """
    # 1. Create all tables registered with Declarative Base
    # Note: Because User, HostedZone, and DNSRecord are imported above,
    # they are registered in Base.metadata.
    Base.metadata.create_all(bind=engine)
    
    # 2. Check if default user already exists
    stmt = select(User).where(User.email == "admin@route53.aws")
    existing_user = db.execute(stmt).scalar_one_or_none()
    
    if not existing_user:
        print("Seeding database with default records...")
        
        # Create default admin user
        admin = User(
            name="Route53 Admin",
            email="admin@route53.aws",
            password=hash_password("password123")
        )
        db.add(admin)
        db.flush()  # Flushes changes to database to populate auto-incremented admin.id
        
        # Create default Hosted Zone for example.com
        zone = HostedZone(
            user_id=admin.id,
            domain_name="example.com",
            description="Default hosted zone for testing."
        )
        db.add(zone)
        db.flush()  # Flushes changes to populate zone.id
        
        # Create default DNS records under example.com
        # 1. An 'A' record routing root domain apex to an IP
        dns_a = DNSRecord(
            hosted_zone_id=zone.id,
            record_name="@",
            record_type="A",
            value="192.0.2.1",
            ttl=300
        )
        # 2. A 'CNAME' record routing 'www' to the apex domain
        dns_cname = DNSRecord(
            hosted_zone_id=zone.id,
            record_name="www",
            record_type="CNAME",
            value="example.com",
            ttl=3600
        )
        
        db.add(dns_a)
        db.add(dns_cname)
        db.commit()
        print("Database initialized and seeded successfully.")
    else:
        print("Database already contains seed data. Skipping.")
