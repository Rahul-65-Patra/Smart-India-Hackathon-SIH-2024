const express = require('express');
const router = express.Router();
const Hospital = require('../models/hospital');
const fs = require('fs');
const path = require('path');

// Helper function to calculate distance using Haversine formula
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const toRad = (value) => value * Math.PI / 180;
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// API endpoint to fetch hospitals
router.get('/', async (req, res) => {
  const { lat, lng } = req.query;

  try {
    // Fetch hospitals from the database
    const hospitals = await Hospital.find();

    // Calculate distances
    const hospitalsWithDistance = hospitals.map(hospital => {
      const distance = calculateDistance(lat, lng, hospital.lat, hospital.lng);
      return { ...hospital._doc, distance };
    });

    // Sort hospitals by distance
    hospitalsWithDistance.sort((a, b) => a.distance - b.distance);

    res.json(hospitalsWithDistance);
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Load hospitals data from JSON file (Run this once to populate the DB)
router.get('/load-data', async (req, res) => {
  try {
    const hospitalsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data/hospitals.json'), 'utf-8')
    );
    await Hospital.insertMany(hospitalsData);
    res.status(200).json({ message: 'Hospitals data loaded successfully!' });
  } catch (error) {
    console.error("Error loading hospital data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
