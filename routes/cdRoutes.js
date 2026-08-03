const express = require('express');
const router = express.Router();
const CD = require('../models/CD');

// GET /cds - Supports ?artist=, ?genre=, ?before=, ?fields=title
router.get('/', async (req, res) => {
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
        return res.status(400).json({ error: 'Parameter "before" must be a number' });
      }
      filter.year = { $lt: yearLimit };
    }

    let projection = '';
    if (fields) {
      projection = fields.split(',').join(' ');
    }

    const cds = await CD.find(filter).select(projection);
    res.status(200).json(cds);
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching CDs', details: error.message });
  }
});

// POST /cds - Create new CD
router.post('/', async (req, res) => {
  try {
    const { title, artist, genre, year } = req.body;
    const newCD = new CD({ title, artist, genre, year });
    const savedCD = await newCD.save();
    res.status(201).json(savedCD);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation Error', details: error.message });
    }
    res.status(500).json({ error: 'Server error while creating CD', details: error.message });
  }
});

// PUT /cds/:id - Update CD by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedCD = await CD.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCD) {
      return res.status(404).json({ error: 'CD not found' });
    }

    res.status(200).json(updatedCD);
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

// DELETE /cds/:id - Delete CD by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedCD = await CD.findByIdAndDelete(req.params.id);

    if (!deletedCD) {
      return res.status(404).json({ error: 'CD not found' });
    }

    res.status(200).json({ message: 'CD deleted successfully', cd: deletedCD });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid CD ID format' });
    }
    res.status(500).json({ error: 'Server error while deleting CD', details: error.message });
  }
});

module.exports = router;