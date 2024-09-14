import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import Bed from "./Bed"; // Ensure this component is properly implemented


axios.defaults.baseURL = "http://localhost:5000";

const App = () => {
  const [showForm, setShowForm] = useState(false);
  const [beds, setBeds] = useState(0);
  const [patientData, setPatientData] = useState({
    name: "",
    age: "",
    gender: "",
    condition: "",
  });
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBedData();
    fetchPatientData();
  }, []);

  const fetchBedData = async () => {
    try {
      const response = await axios.get("/api/beds");
      const bedsAvailable = response.data?.bedsAvailable ?? 0;
      setBeds(bedsAvailable);
      localStorage.setItem("beds", bedsAvailable);
    } catch (error) {
      console.error("Error fetching bed data:", error);
      setBeds(0);
      localStorage.setItem("beds", 0);
    }
  };

  const fetchPatientData = async () => {
    try {
      const response = await axios.get("/api/patients");
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  const handleAddPatientClick = () => {
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (beds <= 0) {
      alert("No beds available!");
      return;
    }

    const currentDate = new Date().toISOString().slice(0, 10);
    const generatedPatientId = Math.floor(100000 + Math.random() * 900000).toString();

    const dataToSubmit = {
      ...patientData,
      date: currentDate,
      patientId: generatedPatientId,
    };

    try {
      await axios.post("/api/patients", dataToSubmit);
      fetchBedData();
      fetchPatientData();
      setShowForm(false);
      setPatientData({
        name: "",
        age: "",
        gender: "",
        condition: "",
      });
      alert("Patient added successfully and bed booked!");
    } catch (error) {
      console.error("Error submitting patient data:", error);
      alert("Failed to add patient. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCheckout = async (patientId) => {
    try {
      await axios.post(`/api/patients/checkout/${patientId}`);
      fetchBedData();
      fetchPatientData();
      alert('Patient checked out successfully.');
    } catch (error) {
      console.error('Error checking out patient:', error);
      alert('Failed to checkout patient. Please try again.');
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId.includes(searchTerm)
  );

  return (
    <div className="App">
      <h1>Hospital Bed Management</h1>

      <Bed />

      <div>
        <h2>Beds Available: {beds}</h2>
        <button onClick={handleAddPatientClick}>Add Patient</button>
        
      </div>

      {showForm && (
        <form className="patient-form" onSubmit={handleSubmit}>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={patientData.name}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Age:
            <input
              type="number"
              name="age"
              value={patientData.age}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Gender:
            <select
              name="gender"
              value={patientData.gender}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
          <label>
            Condition:
            <input
              type="text"
              name="condition"
              value={patientData.condition}
              onChange={handleInputChange}
              required
            />
          </label>
          <button type="submit" disabled={beds <= 0}>
            Submit
          </button>
        </form>
      )}

      <div>
        <input
          type="text"
          placeholder="Search by Name or Patient ID..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div>
        <h2>Patients List</h2>
        <table className="patient-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Condition</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.patientId}>
                <td>{patient.name}</td>
                <td>{patient.age}</td>
                <td>{patient.gender}</td>
                <td>{patient.condition}</td>
                <td>
                  <button onClick={() => handleCheckout(patient._id)}>
                    Checkout
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
