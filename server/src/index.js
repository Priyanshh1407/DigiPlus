import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { testConnection } from './services/aiService.js';
import incidentRoutes from './routes/incidents.js';
import kbRoutes from './routes/kb.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/incidents', incidentRoutes);
app.use('/api/kb', kbRoutes);

app.get('/api/test-ai', async (req, res) => {
  try {
    const text = await testConnection();
    res.json({ success: true, message: "AI is working", response: text });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
