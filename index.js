require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cd_inventory')
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Mongoose CD Model
const cdSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    genre: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
  },
  { timestamps: true }
);

const CD = mongoose.model('CD', cdSchema);

// GET /cds - Return CDs (with optional query filters: artist, genre, before, fields)
app.get('/cds', async (req, res) => {
  try {
    const { artist, genre, before, fields } = req.query;
    const filter = {};

    if (artist) {
      filter.artist = new RegExp(`^${artist}$`, 'i');
    }

    if (genre) {
      filter.genre = new RegExp(`^${genre}$`, 'i');
    }

    if (before) {
      const yearLimit = parseInt(before, 10);
      if (isNaN(yearLimit)) {
        return res.status(400).json({ error: 'Parameter "before" must be a valid number' });
      }
      filter.year = { $lt: yearLimit };
    }

    let projection = '';
    if (fields) {
      projection = fields.split(',').join(' ');
    }

    const cds = await CD.find(filter).select(projection);
    res.json(cds);
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching CDs', details: error.message });
  }
});

// POST /cds - Add a new CD
app.post('/cds', async (req, res) => {
  try {
    const { title, artist, genre, year } = req.body;
    const newCD = new CD({ title, artist, genre, year });
    const savedCD = await newCD.save();
    res.status(201).json(savedCD);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation Error', details: error.message });
    }
    res.status(500).json({ error: 'Server error while adding CD', details: error.message });
  }
});

// PUT /cds/:id - Update an existing CD
app.put('/cds/:id', async (req, res) => {
  try {
    const updatedCD = await CD.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCD) {
      return res.status(404).json({ error: 'CD not found' });
    }

    res.json(updatedCD);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid CD ID format' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation Error', details: error.message });
    }
    res.status(500).json({ error: 'Server error while updating CD', details: error.message });
  }
});

// DELETE /cds/:id - Delete a CD
app.delete('/cds/:id', async (req, res) => {
  try {
    const deletedCD = await CD.findByIdAndDelete(req.params.id);

    if (!deletedCD) {
      return res.status(404).json({ error: 'CD not found' });
    }

    res.json(deletedCD);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid CD ID format' });
    }
    res.status(500).json({ error: 'Server error while deleting CD', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});