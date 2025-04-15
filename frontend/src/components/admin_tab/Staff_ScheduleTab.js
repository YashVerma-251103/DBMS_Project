import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const StaffScheduleTab = () => {
  const [searchParams, setSearchParams] = useState({
    schedule_id: "",
    employee_id: "",
    facility_id: "",
    shift_date: "",
    shift_start: "",
    shift_end: "",
    task_description: "",
    shift_start_exact: "false", // New flag for exact matching
    shift_end_exact: "false", // New flag for exact matching
  });
  const [searchResults, setSearchResults] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/staff_schedule/search"
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching staff schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearchSchedules = async (e) => {
    e.preventDefault();
    setSearchError("");

    const filteredParams = Object.fromEntries(
      Object.entries(searchParams).filter(([_, value]) => value !== "")
    );

    try {
      const response = await axios.get(
        "http://localhost:5000/staff_schedule/search",
        {
          params: filteredParams,
        }
      );
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (err) {
      console.error("Error fetching staff schedule data:", err);
      setSearchError(
        "Error fetching staff schedule data. Please try again later."
      );
      setShowSearchResults(false);
    }
  };

  const handleSearchChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setSearchParams({
        ...searchParams,
        [name]: checked,
      });
    } else {
      setSearchParams({
        ...searchParams,
        [name]: value,
      });
    }
  };

  const handleCreate = () => {
    setEditMode(true);
    setCurrentSchedule(null);
    setFormData({
      employee_id: "",
      facility_id: "",
      shift_date: "",
      shift_start: "",
      shift_end: "",
      task_description: "",
    });
  };

  const handleEdit = (schedule) => {
    setEditMode(true);
    setCurrentSchedule(schedule);
    setFormData({ ...schedule });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let baseURL = "";
    let method = "";

    if (currentSchedule) {
      baseURL = "http://localhost:5000/staff_schedule/update";
      method = "PUT";
    } else {
      baseURL = "http://localhost:5000/staff_schedule/insert";
      method = "POST";
    }

    const params = new URLSearchParams(formData).toString();
    const url = `${baseURL}?${params}`;

    try {
      const response = await fetch(url, { method: method });
      if (response.ok) {
        const result = await response.json();
        console.log(
          `${currentSchedule ? "Update" : "Creation"} successful:`,
          result
        );
        alert(
          `${
            currentSchedule ? "Schedule updated" : "Schedule created"
          } successfully!`
        );
        fetchData();
        setEditMode(false);
        setCurrentSchedule(null);
      } else {
        const errorData = await response.json();
        console.error(
          `Error ${currentSchedule ? "updating" : "creating"} schedule:`,
          errorData
        );
        alert(
          `Error ${currentSchedule ? "updating" : "creating"} schedule: ${
            errorData.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert(
        "Failed to process schedule action. Please check console for details."
      );
    }
  };

  const handleDelete = async (schedule) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      try {
        const url = `http://localhost:5000/staff_schedule/delete?schedule_id=${schedule.schedule_id}`;
        const response = await fetch(url, { method: "DELETE" });
        if (response.ok) {
          fetchData();
        } else {
          console.error("Error deleting schedule");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const renderSchedulesTable = (schedulesData) => {
    return (
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Select</th>
              <th>Schedule ID</th>
              <th>Employee ID</th>
              <th>Facility ID</th>
              <th>Shift Date</th>
              <th>Shift Start</th>
              <th>Shift End</th>
              <th>Task Description</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedulesData.map((schedule, index) => (
              <tr
                key={index}
                className={
                  currentSchedule?.schedule_id === schedule.schedule_id
                    ? "selected-row"
                    : ""
                }
                onClick={() => setCurrentSchedule(schedule)}
              >
                <td>
                  <input
                    type="radio"
                    name="selectedSchedule"
                    checked={
                      currentSchedule?.schedule_id === schedule.schedule_id
                    }
                    onChange={() => setCurrentSchedule(schedule)}
                  />
                </td>
                <td>{schedule.schedule_id}</td>
                <td>{schedule.employee_id}</td>
                <td>{schedule.facility_id}</td>
                <td>{schedule.shift_date}</td>
                <td>{schedule.shift_start}</td>
                <td>{schedule.shift_end}</td>
                <td>{schedule.task_description}</td>
                <td>{schedule.created_at}</td>
                <td className="actions-cell">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(schedule);
                    }}
                    className="btn-edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(schedule);
                    }}
                    className="btn-delete"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{ padding: "1rem" }}>
      <div className="table-header">
        <h3>STAFF SCHEDULE MANAGEMENT</h3>
        <div className="action-buttons">
          <button
            onClick={() => handleEdit(currentSchedule)}
            className="btn-update"
            disabled={!currentSchedule}
          >
            <FaEdit /> Update Selected Schedule
          </button>
          <button onClick={handleCreate} className="btn-primary">
            <FaPlus /> Add a New Schedule
          </button>
        </div>
      </div>

      {/* Search Schedules Form */}
      <div className="search-schedules-container">
        <h4>Search Schedules</h4>
        <form onSubmit={handleSearchSchedules} className="search-form">
          <div className="form-group">
            <label htmlFor="schedule_id">Schedule ID:</label>
            <input
              type="text"
              id="schedule_id"
              name="schedule_id"
              value={searchParams.schedule_id}
              onChange={handleSearchChange}
              placeholder="e.g., 1"
            />
          </div>
          <div className="form-group">
            <label htmlFor="employee_id">Employee ID:</label>
            <input
              type="text"
              id="employee_id"
              name="employee_id"
              value={searchParams.employee_id}
              onChange={handleSearchChange}
              placeholder="e.g., 1001"
            />
          </div>
          <div className="form-group">
            <label htmlFor="facility_id">Facility ID:</label>
            <input
              type="text"
              id="facility_id"
              name="facility_id"
              value={searchParams.facility_id}
              onChange={handleSearchChange}
              placeholder="e.g., 201"
            />
          </div>
          <div className="form-group">
            <label htmlFor="shift_date">Shift Date:</label>
            <input
              type="date"
              id="shift_date"
              name="shift_date"
              value={searchParams.shift_date}
              onChange={handleSearchChange}
            />
          </div>
          {/* <div className="form-group">
            <label htmlFor="shift_start">Shift Start Time:</label>
            <input
              type="time"
              id="shift_start"
              name="shift_start"
              value={searchParams.shift_start}
              onChange={handleSearchChange}
            />
            <label>
              <input
                type="checkbox"
                name="shift_start_exact"
                checked={searchParams.shift_start_exact === "true"}
                onChange={handleSearchChange}
              />
              Exact Match
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="shift_end">Shift End Time:</label>
            <input
              type="time"
              id="shift_end"
              name="shift_end"
              value={searchParams.shift_end}
              onChange={handleSearchChange}
            />
            <label>
              <input
                type="checkbox"
                name="shift_end_exact"
                checked={searchParams.shift_end_exact === "true"}
                onChange={handleSearchChange}
              />
              Exact Match
            </label>
          </div> */}

          <div className="form-group">
            <label htmlFor="shift_start">Shift Start Time:</label>
            <input
              type="time"
              id="shift_start"
              name="shift_start"
              value={searchParams.shift_start}
              onChange={handleSearchChange}
            />
            <div className="checkbox-group">
              <input
                type="checkbox"
                name="shift_start_exact"
                checked={searchParams.shift_start_exact === "true"}
                onChange={handleSearchChange}
              />
              <span>Exact Match</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="shift_end">Shift End Time:</label>
            <input
              type="time"
              id="shift_end"
              name="shift_end"
              value={searchParams.shift_end}
              onChange={handleSearchChange}
            />
            <div className="checkbox-group">
              <input
                type="checkbox"
                name="shift_end_exact"
                checked={searchParams.shift_end_exact === "true"}
                onChange={handleSearchChange}
              />
              <span>Exact Match</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="task_description">Task Description:</label>
            <input
              type="text"
              id="task_description"
              name="task_description"
              value={searchParams.task_description}
              onChange={handleSearchChange}
              placeholder="e.g., Cleaning duties"
            />
          </div>
          <div className="form-group">
            <button type="submit" className="btn-primary">
              Search
            </button>
            {showSearchResults && (
              <button
                type="button"
                onClick={() => setShowSearchResults(false)}
                className="btn-secondary"
              >
                Show All Schedules
              </button>
            )}
          </div>
        </form>
        {searchError && <p className="error-message">{searchError}</p>}
      </div>

      {/* Render Search Results or full listing */}
      {showSearchResults ? (
        <>
          <h4>Search Results:</h4>
          {searchResults.length > 0 ? (
            renderSchedulesTable(searchResults)
          ) : (
            <p>No schedules found matching your criteria.</p>
          )}
        </>
      ) : loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading schedules...</p>
        </div>
      ) : data.length > 0 ? (
        renderSchedulesTable(data)
      ) : (
        <p>No schedules available.</p>
      )}

      {/* Form Modal for Editing/Creating */}
      {editMode && (
        <div className="form-modal">
          <div className="form-content">
            <h2>{currentSchedule ? "Edit Schedule" : "Create Schedule"}</h2>
            <form onSubmit={handleSubmit}>
              {currentSchedule && (
                <div className="form-group">
                  <label>Schedule ID</label>
                  <input
                    type="text"
                    name="schedule_id"
                    value={formData.schedule_id}
                    onChange={(e) =>
                      setFormData({ ...formData, schedule_id: e.target.value })
                    }
                    disabled={true}
                  />
                </div>
              )}
              <div className="form-group">
                <label>Employee ID</label>
                <input
                  type="number"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={(e) =>
                    setFormData({ ...formData, employee_id: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Facility ID</label>
                <input
                  type="number"
                  name="facility_id"
                  value={formData.facility_id}
                  onChange={(e) =>
                    setFormData({ ...formData, facility_id: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Shift Date</label>
                <input
                  type="date"
                  name="shift_date"
                  value={formData.shift_date}
                  onChange={(e) =>
                    setFormData({ ...formData, shift_date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Shift Start Time</label>
                <input
                  type="time"
                  name="shift_start"
                  value={formData.shift_start}
                  onChange={(e) =>
                    setFormData({ ...formData, shift_start: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Shift End Time</label>
                <input
                  type="time"
                  name="shift_end"
                  value={formData.shift_end}
                  onChange={(e) =>
                    setFormData({ ...formData, shift_end: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Task Description</label>
                <textarea
                  name="task_description"
                  value={formData.task_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      task_description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Save
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffScheduleTab;
