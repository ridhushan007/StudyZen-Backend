// controllers/journalController.js

const JournalEntry = require('../models/JournalEntry');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Helper function to invoke the Gemini/Google Generative AI
 * This version explicitly asks for:
 * 1) A few steps to improve knowledge,
 * 2) Two PDF/resource papers,
 * 3) Two YouTube tutorial links.
 */
async function generateRecommendationsFromReflection(reflection) {
  const prompt = `Based on the following reflection, please provide a structured response in Markdown format that includes:
1. A few short steps (3 or more) for how to improve or deepen knowledge on this topic (under a heading 'Steps to Improve').
2. Two (2) links to PDF/resource papers or articles (under a heading 'Resource Papers/Articles').
3. Two (2) YouTube tutorials with links (under a heading 'YouTube Tutorials').

Reflection:
\"${reflection}\"

Please ensure each heading is clearly labeled and use bullet points for each link. If an exact link isn't known, provide a plausible or example link.`;

  // Initialize the Generative AI client with your env key
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  // Use the correct model version, e.g., "gemini-2.0-flash"
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: 'text/plain',
  };

  // Start a chat session
  const chatSession = model.startChat({
    generationConfig,
    history: [],
  });

  // Send the prompt and await the AI’s response
  const result = await chatSession.sendMessage(prompt);

  // Return the raw text from the AI
  return result.response.text();
}

//----------------------------------------------------------
// GET all journal entries
//----------------------------------------------------------
exports.getJournalEntries = async (req, res) => {
  try {
    const entries = await JournalEntry.find().sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
};

//----------------------------------------------------------
// POST create a new journal entry
//----------------------------------------------------------
exports.createJournalEntry = async (req, res) => {
  try {
    const entryData = req.body;
    if (!entryData.lectureTitle) {
      return res.status(400).json({ error: 'Lecture title is required' });
    }

    // Create a new JournalEntry document
    const newEntry = new JournalEntry(entryData);
    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    console.error('Error saving journal entry:', error);
    res.status(500).json({ error: 'Failed to save journal entry' });
  }
};

//----------------------------------------------------------
// DELETE a journal entry
//----------------------------------------------------------
exports.deleteJournalEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEntry = await JournalEntry.findByIdAndDelete(id);
    if (!deletedEntry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    res.json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
};

//----------------------------------------------------------
// POST generate recommendations for an existing entry
//----------------------------------------------------------
exports.generateRecommendations = async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await JournalEntry.findById(id);

    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    // Combine relevant reflection fields
    let reflectionText = '';

    if (entry.learningSummary) {
      reflectionText += `Learning Summary: ${entry.learningSummary}\n`;
    }
    if (entry.challenges) {
      reflectionText += `Challenges: ${entry.challenges}\n`;
    }
    if (entry.futureActions) {
      reflectionText += `Future Actions: ${entry.futureActions}\n`;
    }
    if (entry.additionalNotes) {
      reflectionText += `Additional Notes: ${entry.additionalNotes}\n`;
    }

    // Generate AI-based recommendations using the helper
    const recommendations = await generateRecommendationsFromReflection(reflectionText);

    // Save the AI recommendations in the entry's 'recommendations' field
    entry.recommendations = recommendations;
    const updatedEntry = await entry.save();

    res.json(updatedEntry);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
};