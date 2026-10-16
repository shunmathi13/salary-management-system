
from app.database import Base, SessionLocal, engine
from app.models import Employee

COUNTRIES = [
    ("India", "INR"),
    ("United States", "USD"),
    ("United Kingdom", "GBP"),
    ("Germany", "EUR"),
    ("Singapore", "SGD"),
]

DEPARTMENTS = [
    "Engineering",
    "Human Resources",
    "Finance",
    "Sales",
    "Operations",
    "Marketing",
    "IT",
    "Research",
]


def seed_employees():
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        existing = db.query(Employee).count()

        if existing:
            print(
                f"Database already contains {existing} employees. "
                "No records added."
            )
            return

        employees = []

        for i in range(1, 10001):
            country, currency = COUNTRIES[(i - 1) % len(COUNTRIES)]

            employees.append(
                Employee(
                    employee_id=f"EMP{i:05d}",
                    name=f"Employee {i:05d}",
                    country=country,
                    department=DEPARTMENTS[
                        (i - 1) % len(DEPARTMENTS)
                    ],
                    salary=30000 + ((i * 137) % 170000),
                    currency=currency,
                )
            )

        db.add_all(employees)
        db.commit()

        print(f"Successfully created {len(employees)} employees.")


if __name__ == "__main__":
    seed_employees()
