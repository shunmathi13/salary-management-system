# Salary Management System — Design Notes

## 1. Goal
Build a web-based salary management system for ACME's HR Manager to manage employee records across multiple countries.

## 2. Architecture
- **Frontend:** React with Vite.
- **Backend:** Python FastAPI.
- **Database:** SQLite with SQLAlchemy ORM.
- **Testing:** Pytest and FastAPI TestClient.
- **Seed data:** A Python script generates 10,000 sample employee records.

## 3. Core Features
- List and view employee records.
- Search employee records by employee ID or name in the current loaded results.
- Filter employees by country and department.
- Create, update, and delete employee records.
- Validate required fields and reject duplicate employee IDs.
- Provide an API endpoint for total employee count.

## 4. Design Decisions and Trade-offs
- SQLite was selected for simple local development and assessment portability. A production deployment with concurrent HR users may need a managed relational database.
- FastAPI provides a lightweight API and automatic API documentation.
- The UI currently loads up to 100 employees at a time. Server-side search and pagination across all 10,000 employees remain an improvement.
- Sample salaries use country-specific currency codes. Values in different currencies should not be added together without currency conversion.
- Authentication, role-based access, salary change audit logs, and production security hardening are not yet implemented.

## 5. Testing
Automated tests cover health status, employee count, employee CRUD workflow, and duplicate employee ID rejection. Further tests should cover validation failures, filtering, pagination, and database isolation.

## 6. AI-Assisted Development
AI assistance was used to help plan the implementation, scaffold backend and frontend code, and guide testing and debugging. Generated code was run and checked incrementally. The developer reviewed outputs and executed commands and tests during development.

## 7. Next Steps
- Add server-side search and pagination.
- Improve test isolation and validation coverage.
- Deploy frontend and backend publicly.
- Record a demo showing the main HR workflows.
