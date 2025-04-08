const express = require('express');
const router = express.Router();
const StudySession = require('../models/StudySession');
const RecentActivity = require('../models/RecentActivity');

async function getRecentActivities(req, res) {
  try {
    // Query StudySession (sorted by date descending, limit 5)
    const studySessions = await StudySession.find().sort({ date: -1 }).limit(5).lean();
    const studyActivities = studySessions.map(session => ({
      _id: session._id,
      type: 'study',
      title: `Studied for ${Math.floor(session.totalStudyTime / 3600)}h ${Math.floor((session.totalStudyTime % 3600) / 60)}m`,
      // Convert the stored date (string) into a Date object for sorting
      timestamp: new Date(session.date)
    }));

    // Query the RecentActivity collection (if you have other types of activities)
    const recentActivities = await RecentActivity.find().sort({ timestamp: -1 }).limit(5).lean();
    const formattedRecentActivities = recentActivities.map(activity => ({
      _id: activity._id,
      type: activity.action, // or simply 'activity' if you prefer
      title: activity.action,
      timestamp: activity.timestamp
    }));

    // Combine both arrays
    const allActivities = [...studyActivities, ...formattedRecentActivities];

    // Sort all activities by timestamp descending
    allActivities.sort((a, b) => b.timestamp - a.timestamp);

    // Limit to top 5
    const topActivities = allActivities.slice(0, 5);

    console.log("Final Sorted Activities:", topActivities);
    res.status(200).json(topActivities);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

router.get('/', getRecentActivities);

module.exports = router;