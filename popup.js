document.addEventListener('DOMContentLoaded', () => {
  const output = document.getElementById('output');

  async function handleGenerate() {
    const task = document.getElementById('prompt').value;
    output.textContent = 'Generating...';

    // Get current tab information
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Get page description
    const [descriptionResult] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
        const firstParagraph = document.querySelector('p')?.textContent || '';
        return {
          description: metaDescription,
          text: firstParagraph.slice(0, 200)
        };
      }
    });

    const webPageInfo = `Title: ${tab.title}
URL: ${tab.url}
Description: ${descriptionResult.result.description}`;

    const formattedPrompt = `Please analyze the following web page information and determine if it is relevant and/or helpful for the given task.

TASK: ${task}
WEB PAGE INFORMATION:
${webPageInfo}`;

    // Create a connection to the background script
    const port = chrome.runtime.connect({ name: 'stream-response' });
    
    // Listen for streaming responses
    port.onMessage.addListener((message) => {
      if (message.error) {
        output.className = 'error';
        output.textContent = `Error: ${message.error}`;
      } else if (message.content) {
        updateOutput(message.content);
      }
    });

    // Send request to background script
    port.postMessage({
      type: 'generate',
      prompt: formattedPrompt
    });
  }

  function updateOutput(answer) {
    const finalAnswerRegex = /FINAL ANSWER:\s*(Yes|No)/i;
    const match = answer.match(finalAnswerRegex);
    const finalAnswer = match ? match[1] : 'Unknown';
    
    output.className = '';
    output.innerHTML = `<div class="answer ${finalAnswer.toLowerCase()}">${finalAnswer}</div>
<div class="full-response">${answer}</div>`;
  }

  document.getElementById('generate').addEventListener('click', handleGenerate);
}); 