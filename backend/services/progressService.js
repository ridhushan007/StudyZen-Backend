// backend/services/progressService.js
const Progress = require("../models/progressModel");

async function getAllProgress() {
  return await Progress.find({});
}

async function getProgressById(id) {
  return await Progress.findById(id);
}

async function createProgress(progressData) {
  const progress = new Progress(progressData);
  return await progress.save();
}

async function updateProgress(id, progressData) {
  return await Progress.findByIdAndUpdate(id, progressData, { new: true });
}

async function deleteProgress(id) {
  return await Progress.findByIdAndDelete(id);
}

async function addTarget(progressId, targetData) {
  const progress = await Progress.findById(progressId);
  if (!progress) throw new Error("Progress document not found");

  progress.targets.push(targetData);
  return await progress.save();
}

async function updateTarget(progressId, targetId, targetData) {
  const progress = await Progress.findById(progressId);
  if (!progress) throw new Error("Progress document not found");

  const target = progress.targets.id(targetId);
  if (!target) throw new Error("Target not found");

  target.set(targetData);
  await progress.save();
  return target;
}

async function deleteTarget(progressId, targetId) {
  const progress = await Progress.findById(progressId);
  if (!progress) throw new Error("Progress document not found");

  const target = progress.targets.id(targetId);
  if (!target) throw new Error("Target not found");

  target.remove();
  await progress.save();
  return progress;
}

module.exports = {
  getAllProgress,
  getProgressById,
  createProgress,
  updateProgress,
  deleteProgress,
  addTarget,
  updateTarget,
  deleteTarget,
};