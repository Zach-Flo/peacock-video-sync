const connectButton = document.getElementById("connect");
const disconnectButton = document.getElementById("disconnect");
const statusMessage = document.getElementById("status");

chrome.runtime.sendMessage({ action: 'checkConnection' }), (response) => {}

connectButton.addEventListener("click", () => {
  console.log("Connection initiating");
  chrome.runtime.sendMessage({ action: "connect" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Error sending message:", chrome.runtime.lastError);
    }
  });
});

disconnectButton.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "disconnect" }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error sending message:", chrome.runtime.lastError);
    }
  });
});



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'connected'){
      statusMessage.textContent = 'Status: Connected';
    }
    if (message.action === 'disconnected'){
      statusMessage.textContent = 'Status: Disconnected'
    }
});
