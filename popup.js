document.addEventListener('DOMContentLoaded', () => {
  const modelSelect = document.getElementById('modelSelect');
  const output = document.getElementById('output');

  // Fetch available models from the background script
  chrome.runtime.sendMessage({ type: 'getModels' }, (response) => {
    if (response && response.models) {
      response.models.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        modelSelect.appendChild(option);
      });
    } else {
      output.className = 'error';
      output.textContent = 'Failed to load models.';
    }
  });

  document.getElementById('generate').addEventListener('click', async () => {
    const prompt = document.getElementById('prompt').value;
    const selectedModel = modelSelect.value;
    output.textContent = 'Generating...';

    chrome.runtime.sendMessage({
      type: 'generate',
      prompt: prompt,
      model: selectedModel
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