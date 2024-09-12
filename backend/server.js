import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/hospital', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

const patientSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String,
  condition: String,
});

const bedSchema = new mongoose.Schema({
  bedsAvailable: Number,
});

const Patient = mongoose.model('Patient', patientSchema);
const Bed = mongoose.model('Bed', bedSchema);

const initializeBedData = async () => {
  const bedData = await Bed.findOne({});
  if (!bedData) {
    const newBedData = new Bed({ bedsAvailable: 100 });
    await newBedData.save();
  }
};

const getBedsAvailable = async () => {
  const bedData = await Bed.findOne({});
  return bedData ? bedData.bedsAvailable : null;
};

app.get('/api/beds', async (req, res) => {
  try {
    const bedsAvailable = await getBedsAvailable();
    if (bedsAvailable !== null) {
      res.json({ bedsAvailable });
    } else {
      res.status(500).json({ error: 'Unable to fetch bed data' });
    }
  } catch (error) {
    console.error('Error fetching bed data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/patients', async (req, res) => {
  const { name, age, gender, condition } = req.body;
  try {
    const patient = new Patient({ name, age, gender, condition });
    await patient.save();

    const bedData = await Bed.findOne({});
    if (bedData.bedsAvailable > 0) {
      bedData.bedsAvailable -= 1;
      await bedData.save();
      res.status(201).send('Patient added and bed booked');
    } else {
      res.status(400).send('No beds available');
    }
  } catch (error) {
    console.error('Error adding patient:', error);
    res.status(500).send('Internal server error');
  }
});

app.get('/api/patients', async (req, res) => {
  try {
    const patients = await Patient.find({});
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patient data:', error);
    res.status(500).send('Internal server error');
  }
});

initializeBedData();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
