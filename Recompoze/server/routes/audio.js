const express = require('express');
const multer = require('multer');
const { analyzeAudio } = require('../controllers/audio');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('audioFile'), async (req, res) => {
  const file = req.file;

  try {
    const results = await analyzeAudio(file.path);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

module.exports = router;