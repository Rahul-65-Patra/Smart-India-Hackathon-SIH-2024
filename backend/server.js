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
    process.exit(1);
  });

const patientSchema = new mongoose.Schema({
  date: { type: String, required: true },
  patientId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  condition: { type: String, required: true }
});

const bedSchema = new mongoose.Schema({
  bedsAvailable: { type: Number, required: true }
});

const Patient = mongoose.model('Patient', patientSchema);
const Bed = mongoose.model('Bed', bedSchema);

const initializeBedData = async () => {
  try {
    let bedData = await Bed.findOne({});
    if (bedData) {
      bedData.bedsAvailable = 300;
      await bedData.save();
    } else {
      bedData = new Bed({ bedsAvailable: 300 });
      await bedData.save();
    }
  } catch (error) {
    console.error('Error initializing/updating bed data:', error.message);
  }
};

const getBedsAvailable = async () => {
  try {
    const bedData = await Bed.findOne({});
    return bedData ? bedData.bedsAvailable : 0;
  } catch (error) {
    console.error('Error fetching bed data:', error.message);
    throw new Error('Internal server error');
  }
};

app.get('/api/beds', async (req, res) => {
  try {
    const bedsAvailable = await getBedsAvailable();
    res.json({ bedsAvailable });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/patients', async (req, res) => {
  const { date, patientId, name, age, gender, condition } = req.body;

  if (!date || !patientId || !name || !age || !gender || !condition) {
    return res.status(400).json({ error: 'All patient details are required' });
  }

  try {
    const bedData = await Bed.findOne({});
    if (!bedData) {
      return res.status(500).json({ error: 'Bed data not initialized' });
    }

    if (bedData.bedsAvailable > 0) {
      const patient = new Patient({ date, patientId, name, age, gender, condition });
      await patient.save();

      bedData.bedsAvailable -= 1;
      await bedData.save();

      return res.status(201).json({ message: 'Patient added and bed booked' });
    } else {
      return res.status(400).json({ error: 'No beds available' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add patient' });
  }
});

app.get('/api/patients', async (req, res) => {
  try {
    const patients = await Patient.find({});
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

const checkedOutPatientSchema = new mongoose.Schema({
  date: { type: String, required: true },
  patientId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  condition: { type: String, required: true },
  checkoutDate: { type: Date, default: Date.now } // Track when the patient was checked out
});

const CheckedOutPatient = mongoose.model('CheckedOutPatient', checkedOutPatientSchema);

app.post('/api/patients/checkout/:id', async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid patient ID' });
  }

  try {
    const patient = await Patient.findByIdAndDelete(id); // Updated method
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Save the patient to the CheckedOutPatient collection
    const checkedOutPatient = new CheckedOutPatient({
      date: patient.date,
      patientId: patient.patientId,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      condition: patient.condition
    });
    await checkedOutPatient.save();

    // Update the bed count
    const bedData = await Bed.findOne({});
    if (bedData) {
      bedData.bedsAvailable +=1;
      await bedData.save();
    }

    res.json({ message: 'Patient checked out and bed freed' });
  } catch (error) {
    console.error('Error during checkout:', error); // Log the error
    res.status(500).json({ error: 'Failed to checkout patient', details: error.message });
  }
});

app.get('/api/checkedoutpatients', async (req, res) => {
  try {
    const checkedOutPatients = await CheckedOutPatient.find({});
    res.json(checkedOutPatients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch checked-out patients' });
  }
});

app.listen(5000, () => {
  console.log('Server started on http://localhost:5000');
  initializeBedData();
});
