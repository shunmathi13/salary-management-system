# AI-Assisted Development Workflow

## Objective
Use AI assistance to accelerate implementation while retaining responsibility for correctness, maintainability, and testing.

## Development Workflow
1. Define the employee salary management problem and identify the HR Manager as the primary user.
2. Draft requirements before implementing the application.
3. Use AI assistance to plan the FastAPI backend, SQLAlchemy data model, and REST API.
4. Implement employee creation, retrieval, updating, deletion, filtering, and count endpoints.
5. Create a seed script for 10,000 sample employee records.
6. Use AI assistance to scaffold the React dashboard and connect it to the backend API.
7. Run automated tests and manually verify API responses.
8. Commit working increments to Git.

## Example Prompts Used
- Help structure a FastAPI application for managing employee salary records using a relational database.
- Suggest a SQLAlchemy employee model with employee ID, name, country, department, salary, and currency.
- Design REST endpoints for creating, listing, retrieving, updating, and deleting employees.
- Generate deterministic sample data for 10,000 employees.
- Create pytest tests for employee CRUD operations and duplicate employee IDs.
- Help debug API integration and browser CORS configuration.
- Review design trade-offs and identify missing validation and test cases.

## Verification
AI-generated suggestions were treated as proposals, not as proof of correctness. Commands were executed in the development environment, API behavior was checked, and automated tests were run. Four automated tests passed during development.

## Known Limitations
- Search currently operates on the records loaded by the UI, not all 10,000 records.
- Authentication, authorization, salary audit history, and production deployment are not yet implemented.
- Further automated tests and production security review are required.
