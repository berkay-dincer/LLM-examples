import express from 'express';
import cors from 'cors';
import { contextManager } from './contextManager';
import { ContextRequest } from './types';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// MCP endpoint
app.post('/context', (req, res) => {
  const request: ContextRequest = req.body;
  
  if (!request.userId || !request.action) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: userId and action'
    });
  }

  const response = contextManager.handleRequest(request);
  res.status(response.success ? 200 : 400).json(response);
});

app.listen(port, () => {
  console.log(`MCP Server running on port ${port}`);
}); 