import llmServiceForPopup, { log } from './background.js';

document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    log('Starting to get page info');
    const activeTab = tabs[0];
    
    chrome.scripting.executeScript({
      target: {tabId: activeTab.id},
      function: getPageInfo
    }, async (results) => {
      const pageInfo = results[0].result;

      // Display page info
      document.getElementById('pageUrl').textContent = pageInfo.url;
      document.getElementById('pageTitle').textContent = pageInfo.title;

      log('Page info retrieved:', pageInfo);
      try {
        const startTime = performance.now();
        const analysis = await llmServiceForPopup.analyzeWebsite(pageInfo);
        if (analysis === 'BLOCK') {
          chrome.tabs.update(activeTab.id, { url: chrome.runtime.getURL('block.html') });
          return;
        }
        log('Analysis time:', (performance.now() - startTime) / 1000);
        document.getElementById('analysisResult').textContent = analysis;
      } catch (error) {
        console.error('Error getting LLM analysis:', error);
        document.getElementById('analysisResult').textContent = 'Error analyzing website';
      }
    });
  });
});

// Function to be injected into the page
function getPageInfo() {
  return {
    url: window.location.href,
    title: document.title,
  };
} 