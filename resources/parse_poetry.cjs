const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'all_poetry_data.txt');
const outputPath = path.join(__dirname, '..', 'src', 'poetry.json');

try {
  const content = fs.readFileSync(inputPath, 'utf-8');
  
  // Split by line breaks, normalize line endings
  const lines = content.split(/\r?\n/).map(line => line.trim());
  
  const stanzas = [];
  let currentStanza = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line === '') {
      if (currentStanza.length > 0) {
        stanzas.push(currentStanza);
        currentStanza = [];
      }
    } else {
      currentStanza.push(line);
    }
  }
  
  if (currentStanza.length > 0) {
    stanzas.push(currentStanza);
  }
  
  console.log(`Total blocks found: ${stanzas.length}`);
  
  // Analyze block lengths
  const lengthStats = {};
  stanzas.forEach(s => {
    lengthStats[s.length] = (lengthStats[s.length] || 0) + 1;
  });
  
  console.log('Block length distribution:', lengthStats);
  
  // Filter for stanzas that have lines of content
  // Note: we can filter out blocks of length 0 or comments or separator lines.
  // Let's filter stanzas where length is 4 and keep them.
  // Wait, let's look at what other blocks are:
  const fourLineStanzas = stanzas.filter(s => s.length === 4).map((lines, index) => {
    return {
      id: index + 1,
      lines: lines
    };
  });
  
  console.log(`Total 4-line stanzas: ${fourLineStanzas.length}`);
  
  // Let's write them all to src/poetry.json
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(fourLineStanzas, null, 2), 'utf-8');
  console.log(`Successfully wrote ${fourLineStanzas.length} stanzas to ${outputPath}`);
} catch (err) {
  console.error('Error processing poetry data:', err);
}
