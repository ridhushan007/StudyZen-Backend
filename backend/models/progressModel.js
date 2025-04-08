// backend/models/progressModel.js
const mongoose = require("mongoose");

const targetSchema = new mongoose.Schema({
  title: {
    type: String,
    default: "", // Allow empty target titles
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const progressSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "", // Allow empty goal titles
    },
    description: {
      type: String,
      default: "",
    },
    deadline: Date,
    completed: {
      type: Boolean,
      default: false,
    },
    targets: [targetSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Progress", progressSchema);