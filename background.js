import { SYSTEM_PROMPTS, USER_PROMPTS } from './prompts.js';

class LMStudioLLMService {
  constructor(systemPrompt = SYSTEM_PROMPTS.default) {
    this.API_URL = "http://127.0.0.1:1234/v1/chat/completions";
    this.systemPrompt = systemPrompt;
  }

  setSystemPrompt(prompt) {
    this.systemPrompt = prompt;
  }

  async analyzeWebsite(pageInfo) {
    const headers = {
      'Content-Type': 'application/json',
    };

    const data = {
      messages: [
        {
          role: "system",
          content: this.systemPrompt
        },
        {
          role: "user",
          content: USER_PROMPTS.analyzeWebsite(pageInfo)
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

const llmService = new LMStudioLLMService();

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


// Add tab update listener
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Skip browser internal pages
    if (tab.url.startsWith('chrome://') || 
        tab.url.startsWith('edge://') ||
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('edge-extension://')) {
      return;
    }
    // Wait 1s before checking
    setTimeout(() => checkWebsite(tabId, tab.url), 1000);
  }
});


// New function to check website
async function checkWebsite(tabId, url) {
  try {
    // Get page info
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      function: getPageInfo
    });
    
    const analysis = await llmService.analyzeWebsite(result.result);
    if (analysis === 'BLOCK') {
      chrome.tabs.update(tabId, { url: chrome.runtime.getURL('block.html') });
    }
  } catch (error) {
    console.error('Error checking website:', error);
  }
}


// Add getPageInfo function to background
function getPageInfo() {
  return {
    url: window.location.href,
    title: document.title,
  };
}


const llmServiceForPopup = new LMStudioLLMService();
export { llmServiceForPopup as default, log };
