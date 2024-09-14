import React, { useState } from 'react';

const EmergencyButton = () => {
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle Emergency Button Click
  const handleEmergency = () => {
    console.log("handel emergency called")
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        fetchHospitals(latitude, longitude);
      }, (error) => {
        setError("Unable to fetch location");
        setLoading(false);
        console.error("Geolocation error:", error);
      });
    } else {
      setError("Geolocation not supported by this browser");
    }
  };

  // Fetch hospitals from backend
  const fetchHospitals = async (latitude, longitude) => {
    try {
      console.log("fetchHospital called")
      const response = await fetch(`http://localhost:5000/api/hospitals?lat=${latitude}&lng=${longitude}`);
      const data = await response.json();
      setHospitals(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleEmergency}>Emergency</button>

      {loading && <p>Fetching hospitals...</p>}
      {error && <p>{error}</p>}

      {/* Display the list of hospitals */}
      {hospitals.length > 0 && (
        <ul>
          {hospitals.map((hospital, index) => (
            <li key={index}>
              <p><strong>{hospital.name}</strong></p>
              <p>{hospital.address}</p>
              <p>Distance: {hospital.distance.toFixed(2)} km</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EmergencyButton;
