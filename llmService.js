class LMStudioLLMService {
  constructor() {
    this.API_URL = "http://127.0.0.1:1234/v1/chat/completions";
  }

  async analyzeWebsite(pageInfo) {
    const headers = {
      'Content-Type': 'application/json',
    };

    const data = {
      messages: [
        {
          role: "system",
          content: "You are an AI that analyzes websites and determines if they should be allowed or blocked. Respond with either 'ALLOW' or 'BLOCK'."
        },
        {
          role: "user",
          content: `Please analyze this website: ${JSON.stringify(pageInfo)}`
        }
      ]
    };
    log(data);

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const result = await response.json();
      log(result);

      return 'ALLOW';  // TODO: Return the actual decision
    } catch (error) {
      log('Error calling LLM service:', {
        message: error.message,
        stack: error.stack,
        url: this.API_URL,
        requestData: data
      });
      return 'BLOCK';  // Default to blocking on error
    }
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


const llmService = new LMStudioLLMService();
export { llmService as default, log };