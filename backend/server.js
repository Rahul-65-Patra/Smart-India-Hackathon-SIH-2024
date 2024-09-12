import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/hospital', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1); // Terminate the server if DB connection fails
  });

// Patient Schema
const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  condition: { type: String, required: true }
});

// Bed Schema
const bedSchema = new mongoose.Schema({
  bedsAvailable: { type: Number, required: true }
});

// Patient and Bed Models
const Patient = mongoose.model('Patient', patientSchema);
const Bed = mongoose.model('Bed', bedSchema);

// Initialize or update bed data to 400 beds
const initializeBedData = async () => {
  try {
    const bedData = await Bed.findOne({});
    if (bedData) {   
      bedData.bedsAvailable = 400; // Update the bed count to 300
      await bedData.save();
      console.log('Bed data updated to 400 beds');
    } else {
      const newBedData = new Bed({ bedsAvailable: 400 }); // Initialize with 300 beds
      await newBedData.save();
      console.log('Bed data initialized with 400 beds');
    }
  } catch (error) {
    console.error('Error initializing/updating bed data:', error);
  }
};

// Fetch available beds from the database
const getBedsAvailable = async () => {
  try {
    const bedData = await Bed.findOne({});
    return bedData ? bedData.bedsAvailable : 0; // Return 0 if no data is found
  } catch (error) {
    console.error('Error fetching bed data:', error);
    throw new Error('Internal server error');
  }
};

// API route to get available beds
app.get('/api/beds', async (req, res) => {
  try {
    const bedsAvailable = await getBedsAvailable();
    res.json({ bedsAvailable });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API route to add a patient and update bed count
app.post('/api/patients', async (req, res) => {
  const { name, age, gender, condition } = req.body;
  if (!name || !age || !gender || !condition) {
    return res.status(400).json({ error: 'All patient details are required' });
  }

  try {
    const bedData = await Bed.findOne({});
    if (bedData.bedsAvailable > 0) {
      const patient = new Patient({ name, age, gender, condition });
      await patient.save();

      bedData.bedsAvailable -= 1; // Decrease bed count
      await bedData.save();

      res.status(201).json({ message: 'Patient added and bed booked' });
    } else {
      res.status(400).json({ error: 'No beds available' });
    }
  } catch (error) {
    console.error('Error adding patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API route to get all patients
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await Patient.find({});
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patient data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize bed data when the server starts
initializeBedData();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
