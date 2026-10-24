const express = require('express');
const path = require('path');
const playerRoutes = require('./routes/playerRoutes');
const { initializeDatabase } = require('./config/database');

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/api/players', playerRoutes);

app.use('/api', (req, res) => {
  return res.status(404).json({ message: 'API endpoint not found.' });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ message: 'Request body must contain valid JSON.' });
  }

  console.error('Request error:', error.message);
  return res.status(500).json({ message: 'An unexpected server error occurred.' });
});

async function startServer() {
  try {
    await initializeDatabase();
    app.listen(port, () => {
      console.log(`CricCareers is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Unable to start CricCareers:', error.message);
    process.exitCode = 1;
  }
}

startServer();
