
import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  const [employees, setEmployees] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    employee_id: "",
    name: "",
    country: "India",
    department: "Engineering",
    salary: "",
    currency: "INR",
  });

  async function loadEmployees() {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ limit: "100" });
      if (country) params.set("country", country);
      if (department) params.set("department", department);

      const [listResponse, countResponse] = await Promise.all([
        fetch(`${API}/employees?${params}`),
        fetch(`${API}/employees/count`),
      ]);

      if (!listResponse.ok || !countResponse.ok) {
        throw new Error("Could not load employee data.");
      }

      setEmployees(await listResponse.json());
      setTotal((await countResponse.json()).total_employees);
    } catch {
      setError("Cannot connect to the backend. Check that FastAPI is running on port 8000.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, [country, department]);

  const filtered = employees.filter((employee) => {
    const term = search.toLowerCase();
    return (
      employee.name.toLowerCase().includes(term) ||
      employee.employee_id.toLowerCase().includes(term)
    );
  });

  function startEdit(employee) {
    setEditing(employee.employee_id);
    setForm({
      name: employee.name,
      country: employee.country,
      department: employee.department,
      salary: String(employee.salary),
      currency: employee.currency,
    });
  }

  async function saveEmployee(event) {
    event.preventDefault();

    try {
      const isEdit = Boolean(editing);
      const url = isEdit
        ? `${API}/employees/${editing}`
        : `${API}/employees`;

      const payload = {
        ...form,
        salary: Number(form.salary),
      };

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Unable to save employee.");
      }

      setEditing(null);
      setForm({
        employee_id: "",
        name: "",
        country: "India",
        department: "Engineering",
        salary: "",
        currency: "INR",
      });
      await loadEmployees();
      alert(isEdit ? "Employee updated successfully." : "Employee added successfully.");
    } catch (err) {
      alert(err.message);
    }
  }

  async function deleteEmployee(employeeId) {
    if (!window.confirm(`Delete employee ${employeeId}?`)) return;

    try {
      const response = await fetch(`${API}/employees/${employeeId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Unable to delete employee.");
      await loadEmployees();
    } catch (err) {
      alert(err.message);
    }
  }

  const money = (amount, currency) =>
    new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <div className="brand">ACME <span>PEOPLE</span></div>
          <p>Human Resources · Salary Management</p>
        </div>
        <span className="status"><i /> System online</span>
      </header>

      <section className="welcome">
        <div>
          <p className="eyebrow">HR MANAGEMENT CONSOLE</p>
          <h1>Employee directory</h1>
          <p className="subtitle">Manage employee records and salary information.</p>
        </div>
        <button className="primary" onClick={() => {
          setEditing(null);
          setForm({
            employee_id: "",
            name: "",
            country: "India",
            department: "Engineering",
            salary: "",
            currency: "INR",
          });
        }}>
          + Add employee
        </button>
      </section>

      <section className="stats">
        <article className="stat-card">
          <span>Total employees</span>
          <strong>{total.toLocaleString()}</strong>
          <small>Across all locations</small>
        </article>
        <article className="stat-card">
          <span>Loaded records</span>
          <strong>{employees.length}</strong>
          <small>Based on selected filters</small>
        </article>
        <article className="stat-card">
          <span>Matching employees</span>
          <strong>{filtered.length}</strong>
          <small>Current search results</small>
        </article>
      </section>

      <section className="directory">
        <div className="directory-heading">
          <div>
            <h2>Employees</h2>
            <p>Search and manage your workforce.</p>
          </div>
        </div>

        <div className="filters">
          <input
            aria-label="Search employees"
            placeholder="Search by name or employee ID..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select value={country} onChange={(event) => setCountry(event.target.value)}>
            <option value="">All countries</option>
            {["India", "United States", "United Kingdom", "Germany", "Singapore"].map((item) =>
              <option key={item}>{item}</option>
            )}
          </select>
          <select value={department} onChange={(event) => setDepartment(event.target.value)}>
            <option value="">All departments</option>
            {["Engineering", "Human Resources", "Finance", "Sales", "Operations", "Marketing", "IT", "Research"].map((item) =>
              <option key={item}>{item}</option>
            )}
          </select>
        </div>

        {error && <p className="error">{error}</p>}
        {loading ? <p className="message">Loading employees...</p> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>COUNTRY</th>
                  <th>DEPARTMENT</th>
                  <th>SALARY</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((employee) => (
                  <tr key={employee.employee_id}>
                    <td>
                      <div className="employee-name">{employee.name}</div>
                      <div className="employee-id">{employee.employee_id}</div>
                    </td>
                    <td>{employee.country}</td>
                    <td><span className="department-tag">{employee.department}</span></td>
                    <td className="salary">{money(employee.salary, employee.currency)}</td>
                    <td>
                      <div className="actions">
                        <button className="edit" onClick={() => startEdit(employee)}>Edit</button>
                        <button className="delete" onClick={() => deleteEmployee(employee.employee_id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="5" className="message">No matching employees found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <p className="footnote">Showing up to 100 employees per selected filter.</p>
      </section>

      {(editing !== null || form.employee_id !== "") && null}

      <section className="form-panel">
        <h2>{editing ? `Edit ${editing}` : "Add a new employee"}</h2>
        <p>Complete the fields below to save an employee record.</p>
        <form onSubmit={saveEmployee}>
          {!editing && (
            <label>Employee ID
              <input required value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} />
            </label>
          )}
          <label>Full name
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>Country
            <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
              {["India", "United States", "United Kingdom", "Germany", "Singapore"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>Department
            <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
              {["Engineering", "Human Resources", "Finance", "Sales", "Operations", "Marketing", "IT", "Research"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>Salary
            <input required type="number" min="0" step="0.01" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
          </label>
          <label>Currency
            <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
              {["INR", "USD", "GBP", "EUR", "SGD"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <div className="form-actions">
            <button className="primary" type="submit">{editing ? "Save changes" : "Create employee"}</button>
            <button type="button" className="secondary" onClick={() => {
              setEditing(null);
              setForm({
                employee_id: "",
                name: "",
                country: "India",
                department: "Engineering",
                salary: "",
                currency: "INR",
              });
            }}>Reset form</button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default App;
