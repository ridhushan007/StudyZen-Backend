const StudySession = require("../models/StudySession");

const getStats = async (req, res) => {
  try {
    const userId = 'user1234'; // Hardcoded for now, replace with dynamic value when ready

    // Get total study time
    const allSessions = await StudySession.find({ userId });
    const totalStudyTime = allSessions.reduce((sum, session) => sum + session.totalStudyTime, 0);

    // Get today's study time
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const todaySessions = await StudySession.find({ userId, date: today });
    const todayStudyTime = todaySessions.reduce((sum, session) => sum + session.totalStudyTime, 0);

    // Placeholder streak calculation
    const streak = {
      days: 5,
      message: "Keep it up!"
    };

    res.json({
      totalTimeStudied: totalStudyTime,
      todayTimeStudied: todayStudyTime,
      streak
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
};

const getActivities = async (req, res) => {
  try {
    const userId = 'user1234'; // Hardcoded for now
    const recentSessions = await StudySession.find({ userId })
        .sort({ date: -1 })
        .limit(10);

    // Helper function to format time
    function formatTime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }

    res.json(recentSessions.map(session => ({
      _id: session._id,
      type: "study",
      title: `Studied for ${formatTime(session.totalStudyTime)}`,
      date: session.date
    })));
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: error.message });
  }
};

const getProgress = async (req, res) => {
  try {
    const userId = 'user1234';

    const days = [];
    const labels = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
      days.push(dateString);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }

    const dailyData = [];

    for (const day of days) {
      // This is the key fix - match by string date exactly as stored in the database
      const sessions = await StudySession.find({
        userId,
        date: day // Match the exact date string format
      });

      console.log(`Sessions for ${day}:`, sessions); // Debug log to see what's being found

      const totalTimeInSeconds = sessions.reduce((sum, session) => sum + session.totalStudyTime, 0);
      const totalTimeInMinutes = parseFloat((totalTimeInSeconds / 60).toFixed(1));
      dailyData.push(totalTimeInMinutes);
    }

    console.log("Final Daily Data:", dailyData);

    res.json({
      labels,
      data: dailyData
    });
  } catch (error) {
    console.error('Error fetching progress data:', error);
    res.status(500).json({ error: error.message });
  }
};



  module.exports = {
    getStats,
    getActivities,
    getProgress
  };
