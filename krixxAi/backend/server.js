require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY not found in environment variables');
  process.exit(1);
}

// API endpoint to handle chat messages
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: message
            }]
          }]
        })
      }
    );

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const aiResponse = data.candidates[0].content.parts[0].text;
      return res.json({ response: aiResponse });
    } else {
      console.error('Unexpected API response:', data);
      return res.status(500).json({ error: 'Failed to get valid response from AI' });
    }
  } catch (error) {
    console.error('Error processing chat request:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Serve static files from frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../frontend'));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});