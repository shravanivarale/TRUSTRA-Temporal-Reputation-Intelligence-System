const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Service URLs 
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const GRAPH_SERVICE_URL = process.env.GRAPH_SERVICE_URL || 'http://localhost:8001';

// Routes
app.get('/', (req, res) => {
  res.send('TRUSTRA API Gateway Running (No-Docker Mode)');
});

// Get List of Sellers
app.get('/api/sellers', async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/sellers`);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching sellers:", error.message);
    res.status(500).json({ error: "Failed to fetch sellers" });
  }
});

// Get Seller Trust Data
app.get('/api/trust/:sellerId', async (req, res) => {
  const { sellerId } = req.params;

  try {
    // 1. Get Trust Data from ML Service (Data is now in-memory there)
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/compute-trust`, {
      seller_id: sellerId
    });

    // 2. Get Graph Data from Graph Service (Data is now in-memory there)
    // We try/catch this separately so graph failure doesn't block main trust data
    let graphData = {};
    try {
      const graphResponse = await axios.get(`${GRAPH_SERVICE_URL}/graph/${sellerId}`);
      graphData = graphResponse.data;
    } catch (err) {
      console.warn("Graph service unavailable:", err.message);
    }

    const responseData = {
      seller: { name: "Seller " + sellerId }, // Placeholder name if not in ML response
      trustData: mlResponse.data,
      graphData: graphData
    };

    res.json(responseData);
  } catch (error) {
    console.error("Error fetching trust data:", error.message);
    res.status(500).json({
      error: "Failed to compute trust",
      details: error.message
    });
  }
});

// WebSocket Connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Emit mock real-time updates
  const interval = setInterval(() => {
    const randomChange = Math.floor(Math.random() * 10) - 5;
    // We can't know valid IDs easily here without fetching, so we broadcast generally
    // In a real app, we'd subscribe to specific IDs. 
    // For demo, just emit for the currently viewed seller if possible, or broadcast generic event
    socket.emit('trust_update', {
      sellerId: '76293524-7b94-4366-963d-4299446d7904', // Example ID
      change: randomChange
    });
  }, 5000);

  socket.on('disconnect', () => {
    clearInterval(interval);
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
