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

chrome.runtime.onMessage.addListener((message) => {
  if (message.target !== 'background') {
    return;
  }
  if (message.type === 'log') {
    console.log(message.data);
  }
});

const log = async (...args) => chrome.runtime.sendMessage({
  target: 'background',
  type: 'log',
  data: args,
});

const llmService = new MockLLMService();
export { llmService as default, log };