// server.js
require('dotenv').config();
console.log("Google API Key:", process.env.GOOGLE_API_KEY);

const express = require('express');
const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const cron = require("node-cron");
const mongoose = require('mongoose');

// Database connection and models
const connectDB = require('./config/db');
const StudySession = require("./models/StudySession");

// Import routes
const authRoutes = require('./routes/authRoutes');
const confessionRoutes = require('./routes/confessionRoutes');
const journalRoutes = require('./routes/journalRoutes');
const quizRoutes = require('./routes/quizRoutes');
const progressRoutes = require('./routes/progressRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const studyRoutes = require("./routes/studyRoutes");
const recentActivityRoutes = require('./routes/recentActivityRoutes');
const weekCountRoutes = require('./routes/week-count');

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

connectDB();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

require('./socket/chatSocket')(io);

// Make io accessible to all routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ===================
//       Routes
// ===================
app.use('/api/auth', authRoutes);
app.use('/api/confessions', confessionRoutes);
app.use('/api/journal-entries', journalRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use("/api", studyRoutes);
app.use("/api/recent-activities", recentActivityRoutes);
app.use('/api/quizzes', weekCountRoutes);

app.get('/', (req, res) => {
  res.send('StudyZen API is running');
});

// Cron job example for study time reset
cron.schedule("0 0 * * *", async () => {
  console.log("Resetting study time at midnight...");
  const today = new Date().toISOString().split("T")[0];
  try {
    const users = await StudySession.distinct("userId");
    for (const userId of users) {
      try {
        await StudySession.findOneAndUpdate(
          { userId, date: today },
          { totalStudyTime: 0 },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.error(`Failed to save study time for user ${userId}:`, err);
      }
    }
    console.log("Study time reset for all users.");
  } catch (err) {
    console.error("Error during resetting study time:", err);
  }
});

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});