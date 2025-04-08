const mongoose = require("mongoose");

const studySessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  totalStudyTime: { type: Number, required: true } // Stored in seconds
});

module.exports = mongoose.models.StudySession || mongoose.model("StudySession", studySessionSchema);
