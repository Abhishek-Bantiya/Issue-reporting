const express = require('express');
const multer = require('multer');
const Image = require('../models/Image');
const authenticateUser = require('../middleware/authenticate'); // Import authentication middleware

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Route to upload an image
router.post('/upload', authenticateUser, upload.single('image'), async (req, res) => {
  try {
    const image = new Image({ data: req.file.buffer.toString('base64') });
    await image.save();
    res.status(201).json({ imageId: image._id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Route to retrieve an image
router.get('/:imageId', authenticateUser, async (req, res) => {
  const { imageId } = req.params;
  try {
    const image = await Image.findById(imageId);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.json({ data: image.data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve image' });
  }
});

module.exports = router;