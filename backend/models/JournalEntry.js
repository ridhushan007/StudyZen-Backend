const mongoose = require('mongoose');

const JournalEntrySchema = new mongoose.Schema({
  lectureTitle: { type: String, required: true },
  keyPoints: [String],
  additionalNotes: String,
  questions: [
    {
      description: String,
      isResolved: { type: Boolean, default: false },
      resources: [String],
    },
  ],
  studyMethods: [
    {
      method: String,
      effectiveness: Number,
      notes: String,
    },
  ],
  mood: String,
  // New guided reflection fields
  learningSummary: String,
  challenges: String,
  futureActions: String,
  // New recommendations field to store AI-generated recommendations
  recommendations: String,
  date: { type: Date, default: Date.now },
});

// Create a virtual property "id" that equals _id
JournalEntrySchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized when converting documents to JSON
JournalEntrySchema.set('toJSON', {
  virtuals: true,
});

module.exports = mongoose.model('JournalEntry', JournalEntrySchema);