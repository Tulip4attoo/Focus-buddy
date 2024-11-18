document.addEventListener('DOMContentLoaded', () => {
  const output = document.getElementById('output');

  document.getElementById('generate').addEventListener('click', async () => {
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
          text: firstParagraph.slice(0, 200) // Get first 200 characters of first paragraph
        };
      }
    });

    const webPageInfo = `Title: ${tab.title}
URL: ${tab.url}
Description: ${descriptionResult.result.description}`;

    const formattedPrompt = `TASK: ${task}
WEB PAGE INFORMATION:
${webPageInfo}`;

    chrome.runtime.sendMessage({
      type: 'generate',
      prompt: formattedPrompt
    }, function(response) {
      if (response && response.error) {
        output.className = 'error';
        output.textContent = `Error: ${response.error}`;
      } else if (response && response.result) {
        const finalAnswerRegex = /FINAL ANSWER:\s*(Yes|No)/i;
        const match = response.result.match(finalAnswerRegex);
        const answer = match ? match[1] : 'Unknown';
        
        output.className = '';
        output.innerHTML = `<div class="answer ${answer.toLowerCase()}">${answer}</div>
<div class="full-response">${response.result}</div>`;
      } else {
        output.className = 'error';
        output.textContent = 'No response received';
      }
    });
  });
}); 