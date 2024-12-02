class MockLLMService {
  async analyzeWebsite(pageInfo) {
    // Simulate API processing time (300-800ms)
    const processingTime = Math.random() * 500 + 300;
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Simulate LLM decision (random for now)
    const isAllowed = Math.random() > 0.5;
    
    return isAllowed ? 'ALLOW' : 'BLOCK';
  }
}

// Export the service
const llmService = new MockLLMService();
export default llmService;