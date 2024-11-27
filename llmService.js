class MockLLMService {
  /**
   * Simulates an LLM analyzing website content and making a decision
   * @param {Object} pageInfo - Contains url, title, and description of the webpage
   * @returns {Promise<Object>} - Returns decision object with allow/block status
   */
  async analyzeWebsite(pageInfo) {
    // Simulate API processing time (300-800ms)
    const processingTime = Math.random() * 500 + 300;
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Simulate LLM decision (random for now)
    const isAllowed = Math.random() > 0.5;
    
    return {
      decision: isAllowed ? 'allow' : 'block'
    };
  }
}

// Export the service
const llmService = new MockLLMService();
export default llmService; 