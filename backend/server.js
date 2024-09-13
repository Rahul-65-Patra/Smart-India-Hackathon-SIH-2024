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
  date: { type: Date, default: Date.now },
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

// Initialize or update bed data to 300 beds
const initializeBedData = async () => {
  try {
    let bedData = await Bed.findOne({});
    if (bedData) {
      // Update the bed count to 300 (since bed data already exists)
      bedData.bedsAvailable = 300;
      await bedData.save();
      console.log('Bed data updated to 300 beds');
    } else {
      // Initialize the bed count to 300 (if bed data does not exist)
      bedData = new Bed({ bedsAvailable: 300 });
      await bedData.save();
      console.log('Bed data initialized with 300 beds');
    }
  } catch (error) {
    console.error('Error initializing/updating bed data:', error.message);
  }
};

// Fetch available beds from the database
const getBedsAvailable = async () => {
  try {
    const bedData = await Bed.findOne({});
    return bedData ? bedData.bedsAvailable : 0; // Return 0 if no data is found
  } catch (error) {
    console.error('Error fetching bed data:', error.message);
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

  // Validate request body
  if (!name || !age || !gender || !condition) {
    return res.status(400).json({ error: 'All patient details are required' });
  }

  try {
    const bedData = await Bed.findOne({});
    
    if (!bedData) {
      // Handle case where bed data is not initialized
      return res.status(500).json({ error: 'Bed data not initialized' });
    }
    
    if (bedData.bedsAvailable > 0) {
      const patient = new Patient({ name, age, gender, condition });
      await patient.save();

      // Decrease bed count
      bedData.bedsAvailable -= 1;
      await bedData.save();

      return res.status(201).json({ message: 'Patient added and bed booked' });
    } else {
      return res.status(400).json({ error: 'No beds available' });
    }
  } catch (error) {
    console.error('Error adding patient:', error.message);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// API route to get all patients
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await Patient.find({});
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patient data:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Checked Out Patient Schema
const checkedOutPatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  condition: { type: String, required: true },  
  checkoutDate: { type: Date, default: Date.now }
});

const CheckedOutPatient = mongoose.model('CheckedOutPatient', checkedOutPatientSchema);

// API route to checkout a patient
app.post('/api/patients/checkout/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Move patient to CheckedOutPatient collection
    const checkedOutPatient = new CheckedOutPatient({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      condition: patient.condition
    });
    await checkedOutPatient.save();

    // Delete the patient from the current collection
    await patient.deleteOne();

    // Increment bed count when a patient checks out
    const bedData = await Bed.findOne({});
    if (bedData) {
      bedData.bedsAvailable +=1 ;
      await bedData.save();
    }

    res.status(200).json({ message: 'Patient checked out successfully' });
  } catch (error) {
    console.error('Error checking out patient:', error.message);
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
