import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

axios.defaults.baseURL = "http://localhost:5000";

const App = () => {
  const [showForm, setShowForm] = useState(false);
  const [beds, setBeds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [patientData, setPatientData] = useState({
    name: "",
    age: "",
    gender: "",
    bloodGroup: "",
    phoneNo: "",
    address: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBedType, setSelectedBedType] = useState("");
  const [bedsAvailable, setBedsAvailable] = useState(0);
  const [bedCountInput, setBedCountInput] = useState("");

  useEffect(() => {
    fetchBedData();
    fetchPatientData();
  }, []);

  const fetchBedData = async () => {
    try {
      const response = await axios.get("/api/beds");
      setBeds(response.data);
    } catch (error) {
      console.error("Error fetching bed data:", error);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (bedsAvailable <= 0) {
      alert("No beds available for the selected type!");
      return;
    }

    const generatedPatientId = Math.floor(100000 + Math.random() * 900000).toString();
    const dataToSubmit = {
      ...patientData,
      patientId: generatedPatientId,
      bedType: selectedBedType,
      date: new Date().toISOString().split('T')[0], // Automatically set the date to current date
    };

    try {
      await axios.post("/api/patients", dataToSubmit);
      // Update bed availability directly in state
      setBedsAvailable((prevCount) => prevCount - 1);
      fetchPatientData();
      setShowForm(false);
      setPatientData({
        name: "",
        age: "",
        gender: "",
        bloodGroup: "",
        phoneNo: "",
        address: "",
      });
      alert("Patient added successfully and bed booked!");
    } catch (error) {
      console.error("Error submitting patient data:", error);
      alert("Failed to add patient. Please try again.");
    }
  };

  const updateBedAvailability = async (bedType, newCount) => {
    try {
      await axios.put("/api/beds/update", {
        bedType,
        bedsAvailable: newCount,
      });
      // Update the state to reflect the new bed count
      setBeds((prevBeds) =>
        prevBeds.map((bed) =>
          bed.bedType === bedType ? { ...bed, bedsAvailable: newCount } : bed
        )
      );
    } catch (error) {
      console.error("Error updating bed availability:", error);
    }
  };

  const handleCheckout = async (patientId, bedType) => {
    try {
      await axios.post(`/api/patients/checkout/${patientId}`);
      // Update bed availability directly in state
      setBedsAvailable((prevCount) => prevCount + 1);
      fetchPatientData();
      alert("Patient checked out successfully.");
    } catch (error) {
      console.error("Error checking out patient:", error);
      alert("Failed to checkout patient. Please try again.");
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleBedTypeChange = (e) => {
    const selectedBedType = e.target.value;
    setSelectedBedType(selectedBedType);
    const selectedBed = beds.find((b) => b.bedType === selectedBedType);
    if (selectedBed) {
      setBedsAvailable(selectedBed.bedsAvailable);
    }
  };

  const handleBedCountChange = (e) => {
    setBedCountInput(e.target.value);
  };

  const handleUpdateBeds = async () => {
    if (selectedBedType && bedCountInput) {
      await updateBedAvailability(selectedBedType, Number(bedCountInput));
      alert("Bed availability updated successfully");
      setBedCountInput("");
    } else {
      alert("Please select a bed type and enter the bed count");
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId.includes(searchTerm)
  );

  return (
    <div className="App">
      <h1>Hospital Bed Management</h1>

      <div className="addPatient">
        <h2>Beds Available by Type</h2>
        <select id="bed-type" value={selectedBedType} onChange={handleBedTypeChange}>
          <option value="">-- Select Bed Type --</option>
          {beds.map((bed) => (
            <option key={bed.bedType} value={bed.bedType}>
              {bed.bedType}
            </option>
          ))}
        </select>
        {selectedBedType && <h3>Beds Available for {selectedBedType}: {bedsAvailable}</h3>}
      </div>

      <h2>Add New Patient</h2>
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "Add Patient"}
      </button>
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
            Blood Group:
            <input
              type="text"
              name="bloodGroup"
              value={patientData.bloodGroup}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Phone Number:
            <input
              type="text"
              name="phoneNo"
              value={patientData.phoneNo}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Address:
            <textarea
              name="address"
              value={patientData.address}
              onChange={handleInputChange}
              rows="4"
              cols="50"
              required
            />
          </label>
          <p className="para">Please select a bed type first!</p>
          <button type="submit" disabled={bedsAvailable <= 0}>
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
              <th>Date</th>
              <th>Patient ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Blood Group</th>
              <th>Phone Number</th>
              <th>Address</th>
              <th>Bed Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.patientId}>
                <td>{patient.date}</td>
                <td>{patient.patientId}</td>
                <td>{patient.name}</td>
                <td>{patient.age}</td>
                <td>{patient.gender}</td>
                <td>{patient.bloodGroup}</td>
                <td>{patient.phoneNo}</td>
                <td>{patient.address}</td>
                <td>{patient.bedType}</td>
                <td>
                  <button onClick={() => handleCheckout(patient._id, patient.bedType)}>
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
