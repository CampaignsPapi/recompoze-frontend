import React, { useState } from 'react';
import axios from 'axios';

const Dashboard = ({ user }) => {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState([]);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('audioFile', file);

    try {
      const res = await axios.post('/api/audio/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResults(res.data);
    } catch (error) {
      alert('Error uploading file');
    }
  };

  return (
    <div className="upload-container">
      <h2>Welcome, {user?.name}</h2>
      <input
        type="file"
        accept=".mp3,.wav,.flac"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload}>Upload & Analyze</button>

      <div className="result">
        {results.map((stem, index) => (
          <div key={index} className="stem-item">
            <h3>{stem.label} ({stem.instrument})</h3>
            <audio controls src={stem.previewUrl}></audio>
            <a href={stem.midiUrl} download>
              <button>Download MIDI</button>
            </a>
            <div>
              <strong>VST Suggestions:</strong>
              {stem.vstSuggestions.map((vst, idx) => (
                <div key={idx}>{vst.vst} - Preset: {vst.preset}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;