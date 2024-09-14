const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Hospital = require('./models/hospital');  // Assuming you have a Hospital model
const app = express();
app.use(cors());
const PORT = 5000;

// Replace with your actual MongoDB Atlas connection string
const MONGO_URI = 'mongodb+srv://rahul:rahul123@cluster0.qzw60o2.mongodb.net/hospital_management?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB Atlas using Mongoose
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Atlas connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(express.json());
 
// Haversine formula to calculate the distance between two lat/lng points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

// Fetch nearby hospitals and calculate distance
app.get('/api/hospitals', async (req, res) => {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }
  
    try {
      const hospitals = await Hospital.find(); // Make sure this is fetching hospitals correctly
      const hospitalsWithDistance = hospitals.map(hospital => {
        const distance = calculateDistance(lat, lng, hospital.lat, hospital.lng); // calculate distance on backend
        return { ...hospital._doc, distance };
      });
  
      hospitalsWithDistance.sort((a, b) => a.distance - b.distance);
      res.json(hospitalsWithDistance);  // Return JSON
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      res.status(500).json({ error: "Error fetching hospitals" });
    }
  });
  

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
