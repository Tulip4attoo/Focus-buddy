document.addEventListener('DOMContentLoaded', () => {
  const output = document.getElementById('output');

  document.getElementById('generate').addEventListener('click', async () => {
    const prompt = document.getElementById('prompt').value;
    output.textContent = 'Generating...';

    chrome.runtime.sendMessage({
      type: 'generate',
      prompt: prompt
    }, function(response) {
      if (response && response.error) {
        output.className = 'error';
        output.textContent = `Error: ${response.error}`;
      } else if (response && response.result) {
        output.className = '';
        output.textContent = response.result;
      } else {
        output.className = 'error';
        output.textContent = 'No response received';
      }
    });
  });
}); 