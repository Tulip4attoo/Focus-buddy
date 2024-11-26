document.addEventListener('DOMContentLoaded', function() {
  // Get the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const activeTab = tabs[0];
    
    // Inject content script to get page information
    chrome.scripting.executeScript({
      target: {tabId: activeTab.id},
      function: getPageInfo
    }, (results) => {
      // Display the results
      const pageInfo = results[0].result;
      document.getElementById('pageUrl').textContent = pageInfo.url;
      document.getElementById('pageTitle').textContent = pageInfo.title;
      document.getElementById('pageDescription').textContent = pageInfo.description || 'No description found';
    });
  });
});

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