const axios = require('axios');

const analyzeText = async (text) => {
  try {
    const apiKey = process.env.PERSPECTIVE_API_KEY;
    const url = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey}`;

    const response = await axios.post(url, {
      comment: { text },
      languages: ["en"],
      requestedAttributes: {
        TOXICITY: {},
        INSULT: {},
        THREAT: {},
        SEXUALLY_EXPLICIT: {},
        SEVERE_TOXICITY: {},
        IDENTITY_ATTACK: {}
      }
    });

    const scores = response.data.attributeScores;

    return {
      isToxic: scores.TOXICITY.summaryScore.value >= 0.7,
      isInsult: scores.INSULT.summaryScore.value >= 0.7,
      isThreat: scores.THREAT.summaryScore.value >= 0.6,
      isExplicit: scores.SEXUALLY_EXPLICIT.summaryScore.value >= 0.7,
      isSevereToxic: scores.SEVERE_TOXICITY.summaryScore.value >= 0.75,
      isHateSpeech: scores.IDENTITY_ATTACK.summaryScore.value >= 0.7
    };
  } catch (error) {
    console.error("Error analyzing text:", error);
    throw new Error("Text moderation failed.");
  }
};

module.exports = analyzeText;
