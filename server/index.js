const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// API routes
const contactsRouter = require('./routes/contacts');
app.use('/api/contacts', contactsRouter);

// Top-level scan-card route (avoids any sub-router ordering issues)
const multer = require('multer');
const scanUpload = multer({ dest: path.join(__dirname, '..', 'uploads', 'tmp') });
app.post('/api/scan-card', scanUpload.single('card'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const imageData = fs.readFileSync(req.file.path).toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageData } },
          { type: 'text', text: 'Extract contact info from this business card. Return ONLY valid JSON: {"name":"","email":"","phone":"","company":""}. Use empty string for missing fields.' }
        ]
      }]
    });
    try { fs.unlinkSync(req.file.path); } catch(e) {}
    const text = response.content[0].text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const extracted = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    res.json({ success: true, contact: extracted });
  } catch (err) {
    console.error('scan-card error:', err.message);
    if (req.file) try { fs.unlinkSync(req.file.path); } catch(e) {}
    res.status(500).json({ error: err.message });
  }
});

// Serve React app in production
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Personal CRM running on port ${PORT}`);
});

module.exports = app;
