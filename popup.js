document.addEventListener('DOMContentLoaded', () => {
  const output = document.getElementById('output');

  document.getElementById('generate').addEventListener('click', async () => {
    const prompt = document.getElementById('prompt').value;
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

    const pageInfo = `Current Page:
Title: ${tab.title}
URL: ${tab.url}
Description: ${descriptionResult.result.description}
Preview: ${descriptionResult.result.text}...\n\n`;

    chrome.runtime.sendMessage({
      type: 'generate',
      prompt: prompt,
      tabInfo: pageInfo
    }, function(response) {
      if (response && response.error) {
        output.className = 'error';
        output.textContent = `Error: ${response.error}`;
      } else if (response && response.result) {
        output.className = '';
        output.textContent = pageInfo + response.result;
      } else {
        output.className = 'error';
        output.textContent = 'No response received';
      }
    });
  });
}); 