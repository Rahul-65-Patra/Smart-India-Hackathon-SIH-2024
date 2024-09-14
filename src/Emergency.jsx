import React, { useState } from 'react';
import axios from 'axios'; // Optional: only if using Axios for API requests

const BedBookingForm = () => {
  const [formData, setFormData] = useState({
    patientId: '',
    name: '',
    age: '',
    gender: '',
    condition: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: ''
  });
  
  const [isBooked, setIsBooked] = useState(false); // Confirmation state
  const [errorMessage, setErrorMessage] = useState(''); // Error state

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Send POST request to backend API
      const response = await axios.post('/api/patients', formData);

      if (response.status === 201) {
        // Set booking confirmation
        setIsBooked(true);
        setErrorMessage('');
      }
    } catch (error) {
      // Handle error if something goes wrong
      setIsBooked(false);
      setErrorMessage('Failed to book the bed. Please try again.');
    }
  };

  return (
    <div>
      <h1>Hospital Bed Booking</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Patient ID:
          <input
            type="text"
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Age:
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Gender:
          <input
            type="text"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Condition:
          <input
            type="text"
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            required
          />
        </label>
        
        <h3>Emergency Contact Information:</h3>
        <label>
          Contact Name:
          <input
            type="text"
            name="emergencyContactName"
            value={formData.emergencyContactName}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Contact Phone:
          <input
            type="text"
            name="emergencyContactPhone"
            value={formData.emergencyContactPhone}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Relationship:
          <input
            type="text"
            name="emergencyContactRelationship"
            value={formData.emergencyContactRelationship}
            onChange={handleChange}
            required
          />
        </label>
        
        <button type="submit">Book Bed</button>
      </form>

      {/* Confirmation Message */}
      {isBooked && <p style={{ color: 'green' }}>Your bed has been successfully booked!</p>}

      {/* Error Message */}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
};

export default BedBookingForm;
