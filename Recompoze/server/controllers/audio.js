const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

exports.analyzeAudio = async (filePath) => {
  const outputDir = path.join(__dirname, '../uploads/output'); // Directory for separated stems
  const midiDir = path.join(__dirname, '../uploads/midi'); // Directory for MIDI files

  // Ensure output directories exist
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  if (!fs.existsSync(midiDir)) fs.mkdirSync(midiDir, { recursive: true });

  return new Promise((resolve, reject) => {
    // Step 1: Use Spleeter to separate stems
    exec(
      `spleeter separate -i ${filePath} -p spleeter:4stems -o ${outputDir}`,
      async (error) => {
        if (error) {
          console.error('Error during stem separation:', error);
          return reject('Failed to separate stems.');
        }

        try {
          // Step 2: Process each stem with Basic Pitch to generate MIDI
          const stems = ['vocals', 'drums', 'bass', 'other'];
          const results = [];

          for (const stem of stems) {
            const stemPath = path.join(outputDir, 'input', `${stem}.wav`);
            const midiPath = path.join(midiDir, `${stem}.mid`);

            // Generate MIDI for the stem
            await new Promise((midiResolve, midiReject) => {
              exec(
                `basic-pitch ${midiDir} ${stemPath}`,
                (midiError) => {
                  if (midiError) {
                    console.error(`Error generating MIDI for ${stem}:`, midiError);
                    return midiReject(`Failed to generate MIDI for ${stem}`);
                  }
                  midiResolve();
                }
              );
            });

            // Add result for this stem
            results.push({
              label: capitalize(stem),
              instrument: stem,
              previewUrl: `/uploads/output/input/${stem}.wav`,
              midiUrl: `/uploads/midi/${stem}.mid`,
              vstSuggestions: getVSTSuggestions(stem), // Get VST suggestions
            });
          }

          resolve(results);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
};

// Helper function to capitalize the first letter of a string
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Helper function to provide VST suggestions based on the instrument
function getVSTSuggestions(instrument) {
  const vstDatabase = {
    vocals: [
      { vst: 'Antares Auto-Tune', preset: 'Natural Vocals' },
      { vst: 'Waves Tune Real-Time', preset: 'Live Performance' },
      { vst: 'Melodyne', preset: 'Studio Vocals' },
    ],
    drums: [
      { vst: 'EZdrummer', preset: 'Acoustic Kit' },
      { vst: 'Superior Drummer', preset: 'Rock Kit' },
      { vst: 'Addictive Drums', preset: 'Electronic Kit' },
    ],
    bass: [
      { vst: 'Trillian', preset: 'Fingered Bass' },
      { vst: 'Scarbee Rickenbacker', preset: 'Pick Bass' },
      { vst: 'Ample Bass', preset: 'Slap Bass' },
    ],
    other: [
      { vst: 'Xfer Serum', preset: 'Synth Pad' },
      { vst: 'Arturia Pigments', preset: 'Ambient Pad' },
      { vst: 'Native Instruments Massive X', preset: 'Lead Synth' },
    ],
  };

  return vstDatabase[instrument] || [];
}