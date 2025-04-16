import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const BookingsTab = () => {
  // Search parameters (you can extend these if needed)
  const [searchParams, setSearchParams] = useState({
    booking_id: "",
    facility_id: "",
    payment_status: "",
  });
  const [searchResults, setSearchResults] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [formData, setFormData] = useState({});

  // Fetch all bookings using the search endpoint.
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const fetchData = async () => {
    setLoading(true);
    try {
      // If the user is a customer, filter bookings by his Aadhaar number.
      const url =
        currentUser?.role === "customer"
          ? `http://localhost:5000/bookings/search?aadhaar_no=${currentUser.aadhaar_no}`
          : "http://localhost:5000/bookings/search";
      const response = await fetch(url);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle booking search using the booking search endpoint.
  const handleSearchBookings = async (e) => {
    e.preventDefault();
    setSearchError("");
    try {
      const response = await axios.get(
        "http://localhost:5000/bookings/search",
        {
          params: searchParams,
        }
      );
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (err) {
      console.error("Error fetching booking data:", err);
      setSearchError("Error fetching booking data. Please try again later.");
      setShowSearchResults(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value,
    });
  };

  // Initialize form for creating a new booking.
  const handleCreate = () => {
    setEditMode(true);
    setCurrentBooking(null);
    setFormData({
      facility_id: "",
      aadhaar_no:
        currentUser?.role === "customer" ? currentUser.aadhaar_no : "",
      employee_id: "",
      date_time: "",
      payment_status: "",
    });
  };

  // Populate form for editing an existing booking.
  const handleEdit = (booking) => {
    setEditMode(true);
    setCurrentBooking(booking);
    setFormData({ ...booking });
  };

  // Submit form to either create or update a booking.
  const handleSubmit = async (e) => {
    e.preventDefault();
    let baseURL = "";
    let method = "";

    if (currentBooking) {
      // Update existing booking.
      baseURL = "http://localhost:5000/bookings/update_customer";
      method = "PUT";
    } else {
      // Create new booking.
      baseURL = "http://localhost:5000/bookings/create/";
      method = "POST";
    }

    // Convert formData into a URL query string since backend uses request.args.
    const params = new URLSearchParams(formData).toString();
    const url = `${baseURL}?${params}`;

    try {
      const response = await fetch(url, { method: method });
      if (response.ok) {
        const result = await response.json();
        console.log(
          `${currentBooking ? "Update" : "Creation"} successful:`,
          result
        );
        alert(
          `${
            currentBooking ? "Booking updated" : "Booking created"
          } successfully!`
        );
        fetchData();
        setEditMode(false);
        setCurrentBooking(null);
      } else {
        const errorData = await response.json();
        console.error(
          `Error ${currentBooking ? "updating" : "creating"} booking:`,
          errorData
        );
        alert(
          `Error ${currentBooking ? "updating" : "creating"} booking: ${
            errorData.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert(
        "Failed to process booking action. Please check console for details."
      );
    }
  };

  // Delete booking using the delete endpoint.
  const handleDelete = async (booking) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        const url = `http://localhost:5000/bookings/delete_customer?booking_id=${booking.booking_id}`;
        const response = await fetch(url, { method: "DELETE" });
        if (response.ok) {
          fetchData();
        } else {
          console.error("Error deleting booking");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  // Render the bookings table.
  const renderBookingsTable = (bookingsData) => {
    return (
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Select</th>
              <th>Booking ID</th>
              <th>Facility ID</th>
              <th>Aadhar No</th>
              <th>Employee ID</th>
              <th>Date Time</th>
              <th>Payment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookingsData.map((booking, index) => (
              <tr
                key={index}
                className={
                  currentBooking?.booking_id === booking.booking_id
                    ? "selected-row"
                    : ""
                }
                onClick={() => setCurrentBooking(booking)}
              >
                <td>
                  <input
                    type="radio"
                    name="selectedBooking"
                    checked={currentBooking?.booking_id === booking.booking_id}
                    onChange={() => setCurrentBooking(booking)}
                  />
                </td>
                <td>{booking.booking_id}</td>
                <td>{booking.facility_id}</td>
                <td>{booking.aadhaar_no}</td>
                <td>{booking.employee_id}</td>
                <td>{new Date(booking.date_time).toLocaleString()}</td>
                <td>{booking.payment_status}</td>
                <td className="actions-cell">
                  {/* <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(booking);
                    }}
                    className="btn-edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(booking);
                    }}
                    className="btn-delete"
                  >
                    <FaTrash />
                  </button> */}
                  {(currentUser?.role !== "customer" ||
                    booking.aadhaar_no === currentUser.aadhaar_no) && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(booking);
                        }}
                        className="btn-edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(booking);
                        }}
                        className="btn-delete"
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
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
        <h3>BOOKING SEARCH & MANAGEMENT</h3>
        <div className="action-buttons">
          <button
            onClick={() => handleEdit(currentBooking)}
            className="btn-update"
            disabled={!currentBooking}
          >
            <FaEdit /> Update Selected Booking
          </button>
          <button onClick={handleCreate} className="btn-primary">
            <FaPlus /> Add a New Booking
          </button>
        </div>
      </div>

      {/* Search Bookings Form */}
      <div className="search-bookings-container">
        <h4>Search Bookings</h4>
        <form onSubmit={handleSearchBookings} className="search-form">
          <div className="form-group">
            <label htmlFor="booking_id">Booking ID:</label>
            <input
              type="text"
              id="booking_id"
              name="booking_id"
              value={searchParams.booking_id}
              onChange={handleSearchChange}
              placeholder="e.g., 12345"
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
              placeholder="e.g., 101"
            />
          </div>
          <div className="form-group">
            <label htmlFor="payment_status">Payment Status:</label>
            <select
              id="payment_status"
              name="payment_status"
              value={searchParams.payment_status}
              onChange={handleSearchChange}
            >
              <option value="">--Select--</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
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
                Show All Bookings
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
            renderBookingsTable(searchResults)
          ) : (
            <p>No bookings found matching your criteria.</p>
          )}
        </>
      ) : loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading bookings...</p>
        </div>
      ) : data.length > 0 ? (
        renderBookingsTable(data)
      ) : (
        <p>No bookings available.</p>
      )}

      {/* Form Modal for Editing/Creating */}
      {editMode && (
        <div className="form-modal">
          <div className="form-content">
            <h2>{currentBooking ? "Edit Booking" : "Create Booking"}</h2>
            <form onSubmit={handleSubmit}>
              {currentBooking && (
                <div className="form-group">
                  <label>Booking ID</label>
                  <input
                    type="text"
                    name="booking_id"
                    value={formData.booking_id}
                    onChange={(e) =>
                      setFormData({ ...formData, booking_id: e.target.value })
                    }
                    disabled={true}
                  />
                </div>
              )}
              <div className="form-group">
                <label>Facility ID</label>
                <input
                  type="text"
                  name="facility_id"
                  value={formData.facility_id}
                  onChange={(e) =>
                    setFormData({ ...formData, facility_id: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Aadhar No</label>
                <input
                  type="text"
                  name="aadhaar_no"
                  value={formData.aadhaar_no}
                  onChange={(e) =>
                    setFormData({ ...formData, aadhaar_no: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Employee ID</label>
                <input
                  type="text"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={(e) =>
                    setFormData({ ...formData, employee_id: e.target.value })
                  }
                  disabled={currentUser?.role === "customer"} // prevent modification by customer
                />
              </div>
              <div className="form-group">
                <label>Date Time</label>
                <input
                  type="datetime-local"
                  name="date_time"
                  value={formData.date_time}
                  onChange={(e) =>
                    setFormData({ ...formData, date_time: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Payment Status</label>
                <select
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_status: e.target.value })
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
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

export default BookingsTab;
