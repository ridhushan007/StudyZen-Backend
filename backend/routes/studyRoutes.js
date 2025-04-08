const express = require("express");
const StudySession = require("../models/StudySession");

const router = express.Router();

// Save study session
router.post("/study-sessions/save", async (req, res) => {
  const { userId, studyTime } = req.body;
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  try {
    let session = await StudySession.findOne({ userId, date: today });

    if (session) {
      session.totalStudyTime += studyTime;
    } else {
      session = new StudySession({ userId, date: today, totalStudyTime: studyTime });
    }

    await session.save();
    res.json({ message: "Study time recorded", totalStudyTime: session.totalStudyTime });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// Fetch total study time per day
router.get("/study-sessions/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const sessions = await StudySession.find({ userId }).sort({ date: 1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});


// Fetch all study sessions
router.get("/study-sessions/all", async (req, res) => {
  try {
    const sessions = await StudySession.find().sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});


module.exports = router; // CommonJS export
