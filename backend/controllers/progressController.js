// backend/controllers/progressController.js
const progressService = require("../services/progressService");

exports.getAllProgress = async (req, res) => {
  try {
    const progresses = await progressService.getAllProgress();
    res.json(progresses);
  } catch (error) {
    console.error("Error fetching progress documents:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.getProgressById = async (req, res) => {
  try {
    const progress = await progressService.getProgressById(req.params.id);
    if (!progress) {
      return res.status(404).json({ error: "Progress document not found" });
    }
    res.json(progress);
  } catch (error) {
    console.error("Error fetching progress document:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.createProgress = async (req, res) => {
  try {
    const newProgress = await progressService.createProgress(req.body);
    res.status(201).json(newProgress);
  } catch (error) {
    console.error("Error creating progress document:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const updatedProgress = await progressService.updateProgress(req.params.id, req.body);
    if (!updatedProgress) {
      return res.status(404).json({ error: "Progress document not found" });
    }
    res.json(updatedProgress);
  } catch (error) {
    console.error("Error updating progress document:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.deleteProgress = async (req, res) => {
  try {
    const deletedProgress = await progressService.deleteProgress(req.params.id);
    if (!deletedProgress) {
      return res.status(404).json({ error: "Progress document not found" });
    }
    res.json({ message: "Progress document deleted successfully" });
  } catch (error) {
    console.error("Error deleting progress document:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.addTarget = async (req, res) => {
  try {
    const updatedProgress = await progressService.addTarget(req.params.progressId, req.body);
    res.status(201).json(updatedProgress);
  } catch (error) {
    console.error("Error adding target:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.updateTarget = async (req, res) => {
  try {
    const updatedTarget = await progressService.updateTarget(
      req.params.progressId,
      req.params.targetId,
      req.body
    );
    res.json(updatedTarget);
  } catch (error) {
    console.error("Error updating target:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.deleteTarget = async (req, res) => {
  try {
    const updatedProgress = await progressService.deleteTarget(
      req.params.progressId,
      req.params.targetId
    );
    res.json(updatedProgress);
  } catch (error) {
    console.error("Error deleting target:", error);
    res.status(500).json({ error: "Server Error" });
  }
};