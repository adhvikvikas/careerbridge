const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Health route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: "CareerBridge API is running"
  });
});

// Basic Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "An internal server error occurred"
  });
});

module.exports = app;
