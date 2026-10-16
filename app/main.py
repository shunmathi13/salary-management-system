


from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError

from app.database import Base, SessionLocal, engine
from app.models import Employee


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Employee Salary Management System",
    version="0.1.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmployeeCreate(BaseModel):
    employee_id: str = Field(min_length=1, max_length=30)
    name: str = Field(min_length=1, max_length=120)
    country: str = Field(min_length=1, max_length=80)
    department: str = Field(min_length=1, max_length=80)
    salary: float = Field(ge=0, allow_inf_nan=False)
    currency: str = Field(pattern=r"^[A-Z]{3}$")


class EmployeeUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    country: str | None = Field(default=None, min_length=1, max_length=80)
    department: str | None = Field(default=None, min_length=1, max_length=80)
    salary: float | None = Field(default=None, ge=0, allow_inf_nan=False)
    currency: str | None = Field(default=None, pattern=r"^[A-Z]{3}$")


def employee_data(employee: Employee):
    return {
        "id": employee.id,
        "employee_id": employee.employee_id,
        "name": employee.name,
        "country": employee.country,
        "department": employee.department,
        "salary": employee.salary,
        "currency": employee.currency,
    }


@app.get("/")
def home():
    return {
        "message": "Employee Salary Management System API",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/employees/count")
def employee_count():
    with SessionLocal() as db:
        count = db.scalar(select(func.count()).select_from(Employee))
        return {"total_employees": count}


@app.get("/employees")
def list_employees(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    country: str | None = None,
    department: str | None = None,
):
    with SessionLocal() as db:
        query = select(Employee)

        if country:
            query = query.where(Employee.country == country)
        if department:
            query = query.where(Employee.department == department)

        employees = db.scalars(
            query.order_by(Employee.id).offset(skip).limit(limit)
        ).all()

        return [employee_data(employee) for employee in employees]


@app.get("/employees/{employee_id}")
def get_employee(employee_id: str):
    with SessionLocal() as db:
        employee = db.scalar(
            select(Employee).where(Employee.employee_id == employee_id)
        )
        if employee is None:
            raise HTTPException(status_code=404, detail="Employee not found")
        return employee_data(employee)


@app.post("/employees", status_code=status.HTTP_201_CREATED)
def create_employee(payload: EmployeeCreate):
    with SessionLocal() as db:
        employee = Employee(**payload.model_dump())
        db.add(employee)

        try:
            db.commit()
            db.refresh(employee)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=409,
                detail="Employee ID already exists",
            )

        return employee_data(employee)


@app.put("/employees/{employee_id}")
def update_employee(employee_id: str, payload: EmployeeUpdate):
    changes = payload.model_dump(exclude_unset=True)

    if not changes:
        raise HTTPException(
            status_code=400,
            detail="Provide at least one field to update",
        )

    if any(value is None for value in changes.values()):
        raise HTTPException(
            status_code=422,
            detail="Updated fields cannot be null",
        )

    with SessionLocal() as db:
        employee = db.scalar(
            select(Employee).where(Employee.employee_id == employee_id)
        )
        if employee is None:
            raise HTTPException(status_code=404, detail="Employee not found")

        for field, value in changes.items():
            setattr(employee, field, value)

        db.commit()
        db.refresh(employee)
        return employee_data(employee)


@app.delete("/employees/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: str):
    with SessionLocal() as db:
        employee = db.scalar(
            select(Employee).where(Employee.employee_id == employee_id)
        )
        if employee is None:
            raise HTTPException(status_code=404, detail="Employee not found")

        db.delete(employee)
        db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)


