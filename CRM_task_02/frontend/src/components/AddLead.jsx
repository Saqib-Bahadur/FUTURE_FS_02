import { useState } from "react";
import API from "../services/api";

function AddLead({ onLeadAdded }) {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {

      const response = await API.post(
        "/leads",
        formData
      );

      setMessage("Lead added successfully!");

      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });

      // Tell dashboard to refresh
      if (onLeadAdded) {
        onLeadAdded(response.data.lead);
      }

    } catch (error) {

      setMessage(
        error.response?.data?.message ||
          "Failed to add lead"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-lead">

      <h2>Add New Lead</h2>

      <form onSubmit={handleSubmit}>

        <div className="form-group">
          <label>Name</label>

          <input
            type="text"
            name="name"
            placeholder="Enter name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>

          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Phone</label>

          <input
            type="text"
            name="phone"
            placeholder="Enter phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Message</label>

          <textarea
            name="message"
            placeholder="Enter message"
            value={formData.message}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Lead"}
        </button>

        {message && (
          <p>{message}</p>
        )}

      </form>

    </div>
  );
}

export default AddLead;