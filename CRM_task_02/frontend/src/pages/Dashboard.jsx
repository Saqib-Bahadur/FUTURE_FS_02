import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import AddLead from "../components/AddLead";

function Dashboard() {
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Selected lead for View/Edit
  const [selectedLead, setSelectedLead] = useState(null);

  // Edit form
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    status: "NEW",
    notes: "",
    followUpDate: "",
  });

  const [updateMessage, setUpdateMessage] = useState("");
  const [updating, setUpdating] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  // ==========================================
  // GET ALL LEADS
  // ==========================================

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await API.get("/leads", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLeads(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");
      }

      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  // ==========================================
  // VIEW / EDIT LEAD
  // ==========================================

  const handleViewLead = (lead) => {
    setSelectedLead(lead);

    setEditData({
      name: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      message: lead.message || "",
      status: lead.status || "NEW",
      notes: lead.notes || "",
      followUpDate: lead.followUpDate
        ? lead.followUpDate.substring(0, 10)
        : "",
    });

    setUpdateMessage("");
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const closeModal = () => {
    setSelectedLead(null);
    setUpdateMessage("");
  };

  // ==========================================
  // HANDLE EDIT INPUT
  // ==========================================

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // UPDATE LEAD
  // ==========================================

  const handleUpdate = async (e) => {
    e.preventDefault();

    setUpdating(true);
    setUpdateMessage("");

    try {
      const token = localStorage.getItem("token");

      const response = await API.put(
        `/leads/${selectedLead._id}`,
        editData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUpdateMessage("Lead updated successfully!");

      // Update lead in frontend immediately
      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead._id === selectedLead._id
            ? response.data.lead
            : lead
        )
      );

      // Update selected lead
      setSelectedLead(response.data.lead);
    } catch (error) {
      setUpdateMessage(
        error.response?.data?.message ||
          "Failed to update lead"
      );
    } finally {
      setUpdating(false);
    }
  };

  // ==========================================
  // DELETE LEAD
  // ==========================================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this lead?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await API.delete(`/leads/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove lead from frontend
      setLeads((prevLeads) =>
        prevLeads.filter((lead) => lead._id !== id)
      );

      // Close modal
      setSelectedLead(null);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete lead"
      );
    }
  };

  // ==========================================
  // SEARCH + FILTER
  // ==========================================

  const filteredLeads = leads.filter((lead) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      lead.name.toLowerCase().includes(searchText) ||
      lead.email.toLowerCase().includes(searchText) ||
      lead.phone.includes(searchText);

    const matchesStatus =
      statusFilter === "ALL" ||
      lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ==========================================
  // STATISTICS
  // ==========================================

  const totalLeads = leads.length;

  const newLeads = leads.filter(
    (lead) => lead.status === "NEW"
  ).length;

  const contactedLeads = leads.filter(
    (lead) => lead.status === "CONTACTED"
  ).length;

  const convertedLeads = leads.filter(
    (lead) => lead.status === "CONVERTED"
  ).length;

  return (
    <div className="dashboard">

      {/* ================= NAVBAR ================= */}

      <nav className="navbar">

        <h2>CRM Dashboard</h2>

        <div className="navbar-right">

          <span>
            Welcome, {user?.name}
          </span>

          <button onClick={handleLogout}>
            Logout
          </button>

        </div>

      </nav>


      {/* ================= MAIN ================= */}

      <main className="dashboard-content">

        <h1>Lead Management</h1>


        {/* ================= STATISTICS ================= */}

        <div className="stats-container">

          <div className="stat-card">
            <h3>Total Leads</h3>
            <p>{totalLeads}</p>
          </div>

          <div className="stat-card">
            <h3>New</h3>
            <p>{newLeads}</p>
          </div>

          <div className="stat-card">
            <h3>Contacted</h3>
            <p>{contactedLeads}</p>
          </div>

          <div className="stat-card">
            <h3>Converted</h3>
            <p>{convertedLeads}</p>
          </div>

        </div>


        {/* ================= ADD LEAD ================= */}

        <AddLead onLeadAdded={fetchLeads} />


        {/* ================= SEARCH + FILTER ================= */}

        <div className="search-filter">

          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="ALL">
              All Status
            </option>

            <option value="NEW">
              NEW
            </option>

            <option value="CONTACTED">
              CONTACTED
            </option>

            <option value="CONVERTED">
              CONVERTED
            </option>

          </select>

        </div>


        {/* ================= LEADS TABLE ================= */}

        <div className="leads-section">

          <h2>All Leads</h2>

          {loading ? (

            <p>Loading leads...</p>

          ) : filteredLeads.length === 0 ? (

            <p>No leads found.</p>

          ) : (

            <table>

              <thead>

                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Follow-up</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {filteredLeads.map((lead) => (

                  <tr key={lead._id}>

                    <td>
                      {lead.name}
                    </td>

                    <td>
                      {lead.email}
                    </td>

                    <td>
                      {lead.phone}
                    </td>

                    <td>
                      <span
                        className={`status ${lead.status.toLowerCase()}`}
                      >
                        {lead.status}
                      </span>
                    </td>

                    <td>
                      {lead.followUpDate
                        ? new Date(
                            lead.followUpDate
                          ).toLocaleDateString()
                        : "Not set"}
                    </td>

                    <td className="actions">

                      <button
                        onClick={() =>
                          handleViewLead(lead)
                        }
                      >
                        View / Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(lead._id)
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </main>


      {/* ================= EDIT MODAL ================= */}

      {selectedLead && (

        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-header">

              <h2>Lead Details</h2>

              <button
                className="close-btn"
                onClick={closeModal}
              >
                ×
              </button>

            </div>


            <form onSubmit={handleUpdate}>

              {/* Name */}

              <div className="form-group">

                <label>Name</label>

                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleEditChange}
                  required
                />

              </div>


              {/* Email */}

              <div className="form-group">

                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleEditChange}
                  required
                />

              </div>


              {/* Phone */}

              <div className="form-group">

                <label>Phone</label>

                <input
                  type="text"
                  name="phone"
                  value={editData.phone}
                  onChange={handleEditChange}
                  required
                />

              </div>


              {/* Message */}

              <div className="form-group">

                <label>Message</label>

                <textarea
                  name="message"
                  value={editData.message}
                  onChange={handleEditChange}
                  required
                />

              </div>


              {/* Status */}

              <div className="form-group">

                <label>Status</label>

                <select
                  name="status"
                  value={editData.status}
                  onChange={handleEditChange}
                >

                  <option value="NEW">
                    NEW
                  </option>

                  <option value="CONTACTED">
                    CONTACTED
                  </option>

                  <option value="CONVERTED">
                    CONVERTED
                  </option>

                </select>

              </div>


              {/* Notes */}

              <div className="form-group">

                <label>Notes</label>

                <textarea
                  name="notes"
                  placeholder="Add internal notes..."
                  value={editData.notes}
                  onChange={handleEditChange}
                />

              </div>


              {/* Follow-up */}

              <div className="form-group">

                <label>
                  Follow-up Date
                </label>

                <input
                  type="date"
                  name="followUpDate"
                  value={editData.followUpDate}
                  onChange={handleEditChange}
                />

              </div>


              {/* Message */}

              {updateMessage && (

                <p className="update-message">
                  {updateMessage}
                </p>

              )}


              {/* Buttons */}

              <div className="modal-actions">

                <button
                  type="submit"
                  disabled={updating}
                >
                  {updating
                    ? "Updating..."
                    : "Save Changes"}
                </button>

                <button
                  type="button"
                  className="delete-btn"
                  onClick={() =>
                    handleDelete(selectedLead._id)
                  }
                >
                  Delete
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Dashboard;