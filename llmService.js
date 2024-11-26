class MockLLMService {
  /**
   * Simulates an LLM analyzing website content and making a decision
   * @param {Object} pageInfo - Contains url, title, and description of the webpage
   * @returns {Promise<Object>} - Returns decision object with allow/block status and reason
   */
  async analyzeWebsite(pageInfo) {
    // Simulate API processing time (300-800ms)
    const processingTime = Math.random() * 500 + 300;
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Simulate LLM decision (random for now)
    const isAllowed = Math.random() > 0.5;
    
    // Simulate different types of responses
    const allowReasons = [
      "Content appears to be work-related",
      "Educational content detected",
      "Productivity tool identified",
      "Professional development resource"
    ];

    const blockReasons = [
      "Entertainment content detected",
      "Social media platform identified",
      "Potential distraction source",
      "Non-work-related content"
    ];

    return {
      decision: isAllowed ? 'allow' : 'block',
      confidence: Math.round((Math.random() * 30 + 70) * 100) / 100, // 70-100%
      reason: isAllowed 
        ? allowReasons[Math.floor(Math.random() * allowReasons.length)]
        : blockReasons[Math.floor(Math.random() * blockReasons.length)],
      analyzedContent: {
        url: pageInfo.url,
        title: pageInfo.title,
        description: pageInfo.description
      }
    };
  }
}

// Export the service
const llmService = new MockLLMService();
export default llmService; 