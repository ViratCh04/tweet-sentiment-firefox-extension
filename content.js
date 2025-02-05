const tweetTextSelector = '.css-1jxf684, .r-bcqeeo';


async function analyzeTweet(tweet) {
    try {
        const response = await chrome.runtime.sendMessage({
            type: 'analyzeSentiment',
            text: tweet
        });
        
        if (response.error) {
            throw new Error(response.error);
        }
        
        return {
            sentiment: response.sentiment.charAt(0).toUpperCase() + response.sentiment.slice(1),
            probability: response.probability
        };
    } catch (error) {
        console.error("Error analyzing sentiment:", error);
        return {
            sentiment: "Unknown",
            probability: 0
        };
    }
}

function getTweetText(tweetElement) {
    const textContent = Array.from(tweetElement.querySelectorAll(tweetTextSelector))
        .map(el => el.textContent)
        .join(' ');
    return textContent || tweetElement.innerText;
}

async function processTweets() {
    const tweetTextElements = document.querySelectorAll('[data-testid="tweetText"]');
   
    for (const tweetTextElement of tweetTextElements) {
        if (tweetTextElement.querySelector(".sentiment-label")) continue;
       
        const tweetText = getTweetText(tweetTextElement);
        const { sentiment, probability } = await analyzeTweet(tweetText);
       
        const sentimentLabel = document.createElement("span");
        sentimentLabel.className = "sentiment-label";
        sentimentLabel.style.marginLeft = "10px";
        sentimentLabel.style.color = "white";
        
        const confidence = Math.round(probability * 100);
        let backgroundColor;
        if (sentiment === "Positive") {
            backgroundColor = confidence > 80 ? "#2ecc71" : "#27ae60";
        } else if (sentiment === "Negative") {
            backgroundColor = confidence > 80 ? "#e74c3c" : "#c0392b";
        } else {
            backgroundColor = "#95a5a6";
        }
        
        sentimentLabel.style.backgroundColor = backgroundColor;
        sentimentLabel.style.padding = "2px 5px";
        sentimentLabel.style.borderRadius = "5px";
        sentimentLabel.style.fontSize = "12px";
        sentimentLabel.style.fontWeight = "bold";
        sentimentLabel.innerText = `${sentiment} (${confidence}%)`;
    
        tweetTextElement.appendChild(sentimentLabel);
    }
}

function initializeObserver() {
    const tweetContainer = document.body;
    const observer = new MutationObserver(() => processTweets());
    observer.observe(tweetContainer, { childList: true, subtree: true });
    console.log("Tweet sentiment analyzer initialized!");
}

initializeObserver();
processTweets();
