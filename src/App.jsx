import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Bed from './Bed';  

const App = () => {
  const [showForm, setShowForm] = useState(false);
  const [beds, setBeds] = useState(0);
  const [patientData, setPatientData] = useState({
    name: '',
    age: '',
    gender: '',
    condition: '',
  });
  const [patients, setPatients] = useState([]); // State for patient data

  // Fetch available beds and patient data from backend
  useEffect(() => {
    fetchBedData();
    fetchPatientData(); // Fetch patient data on component mount
  }, []);

  const fetchBedData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/beds'); // Added 'http://'
      if (response.data && response.data.bedsAvailable != null) {
        setBeds(response.data.bedsAvailable);
      } else {
        console.error('Unexpected response format:', response.data);
        setBeds(0); 
      }
    } catch (error) {
      console.error('Error fetching bed data:', error);
      setBeds(0); // Default to 0 in case of error
    }
  };

  const fetchPatientData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/patients'); // Added 'http://'
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    }
  };

  const handleAddPatientClick = () => {
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (beds <= 0) {
      alert('No beds available!');
      return;
    }
    
    try {
      await axios.post('http://localhost:5000/api/patients', patientData); // Added 'http://'

      // Fetch bed data and patient data after successful submission
      fetchBedData();
      fetchPatientData();

      setShowForm(false);
      setPatientData({
        name: '',
        age: '',
        gender: '',
        condition: '',
      });
      alert('Patient added successfully and bed booked!');
    } catch (error) {
      console.error('Error submitting patient data:', error);
      alert('Failed to add patient. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientData({ ...patientData, [name]: value });
  };

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
            <input type="text" name="name" value={patientData.name} onChange={handleInputChange} required />
          </label>
          <label>
            Age:
            <input type="number" name="age" value={patientData.age} onChange={handleInputChange} required />
          </label>
          <label>
            Gender:
            <select name="gender" value={patientData.gender} onChange={handleInputChange} required>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
          <label>
            Condition:
            <input type="text" name="condition" value={patientData.condition} onChange={handleInputChange} required />
          </label>
          <button type="submit" disabled={beds <= 0}>Submit</button> {/* Disable if no beds available */}
        </form>
      )}
   
      {/* Display patient data */}
      <div>
  <h2>Patients List</h2>
  <table className="patient-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Age</th>
        <th>Gender</th>
        <th>Condition</th>
      </tr>
    </thead>
    <tbody>
      {patients.map((patient, index) => (
        <tr key={index}>
          <td>{patient.name}</td>
          <td>{patient.age}</td>
          <td>{patient.gender}</td>
          <td>{patient.condition}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

    </div>
  );
};

export default App;
