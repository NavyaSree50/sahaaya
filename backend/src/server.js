const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { db, initDb } = require('./db/database');
const { seedDatabase } = require('./db/seed');
const { setupSockets } = require('./sockets/socketHandler');

const incidentRoutes = require('./routes/incidents');
const volunteerRoutes = require('./routes/volunteers');
const agencyRoutes = require('./routes/agencies');
const analyticsRoutes = require('./routes/analytics');
const gatewayRoutes = require('./routes/gateway');

const app = express();
const server = http.createServer(app);

// Setup Socket.IO with permissive CORS for local dev
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

app.set('io', io);
setupSockets(io);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize DB schema & check if seed is needed
initDb();
const incidentCount = db.prepare('SELECT COUNT(*) as count FROM incidents').get().count;
if (incidentCount === 0) {
  seedDatabase();
}

// Routes
app.use('/api/incidents', incidentRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/agencies', agencyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/gateway', gatewayRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Sahaaya Emergency Coordination Backend',
    motto: 'Volunteer safety comes before volunteer service',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚨 Sahaaya Emergency Coordination Server Running`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🛡️ Core Principle: Volunteer safety comes before volunteer service`);
  console.log(`====================================================`);
});
