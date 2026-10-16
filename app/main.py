
from fastapi import FastAPI

app = FastAPI(
    title="Employee Salary Management System",
    description="API for managing employee and salary information",
    version="0.1.0",
)


@app.get("/")
def home():
    return {
        "message": "Employee Salary Management System API",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
