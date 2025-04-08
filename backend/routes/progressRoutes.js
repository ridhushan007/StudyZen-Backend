// backend/routes/progressRoutes.js
const express = require("express");
const router = express.Router();
const progressController = require("../controllers/progressController");

// Progress CRUD
router.get("/", progressController.getAllProgress);
router.get("/:id", progressController.getProgressById);
router.post("/", progressController.createProgress);
router.put("/:id", progressController.updateProgress);
router.delete("/:id", progressController.deleteProgress);

// Targets CRUD within a progress document
router.post("/:progressId/targets", progressController.addTarget);
router.put("/:progressId/targets/:targetId", progressController.updateTarget);
router.delete("/:progressId/targets/:targetId", progressController.deleteTarget);

module.exports = router;