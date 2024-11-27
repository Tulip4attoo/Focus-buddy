import llmService from './llmService.js';

document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const activeTab = tabs[0];
    
    chrome.scripting.executeScript({
      target: {tabId: activeTab.id},
      function: getPageInfo
    }, async (results) => {
      const pageInfo = results[0].result;

      // Display page info
      document.getElementById('pageUrl').textContent = pageInfo.url;
      document.getElementById('pageTitle').textContent = pageInfo.title;
      document.getElementById('pageDescription').textContent = pageInfo.description || 'No description found';

      // Get LLM decision
      try {
        const decision = await llmService.analyzeWebsite(pageInfo);
        displayDecision(decision);
      } catch (error) {
        console.error('Error getting LLM decision:', error);
      }
    });
  });
});

function displayDecision(decision) {
  const decisionElement = document.createElement('div');
  decisionElement.innerHTML = `
    <div class="decision ${decision.decision}">
      <h3>${decision.decision.toUpperCase()}</h3>
    </div>
  `;
  document.body.appendChild(decisionElement);
}

// Function to be injected into the page
function getPageInfo() {
  const description = document.querySelector('meta[name="description"]')?.content || 
                     document.querySelector('meta[property="og:description"]')?.content;
  
  return {
    url: window.location.href,
    title: document.title,
    description: description
  };
} 