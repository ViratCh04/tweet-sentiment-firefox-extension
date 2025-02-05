// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'analyzeSentiment') {
        fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { 
        "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: request.text })
    })
    .then(response => response.json())
    .then(data => sendResponse(data))
    .catch(error => sendResponse({ error: error.message }));
    
      return true; // Will respond asynchronously
    }
});