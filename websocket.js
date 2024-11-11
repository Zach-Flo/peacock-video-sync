let ws;
let keepAliveTrigger;
function connect() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    chrome.runtime.sendMessage({ action: 'connected' });
    return 
  }
  ws = new WebSocket(
    "wss://y0412yh3k0.execute-api.us-east-1.amazonaws.com/dev"
  );
  ws.onopen = () => {
    console.log("Connected to WebSocket server");
    keepAliveTrigger = true;
    keepAlive(ws);
    chrome.runtime.sendMessage({ action: 'connected' });
  };
  ws.onmessage = (event) => {
    console.log("Message from server:", event.data);
    
    // Assuming the message is in JSON format, you can parse it
    //const message = JSON.parse(event.data);
    
    // Process the message
    if (event.data === 'playVideo') {
      //console.log(`Play video ${message.data.videoId} from ${message.data.startTime}`);
      console.log("playVideo chrome message initiate");
      chrome.runtime.sendMessage({ action: "playVideo" });
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {
          type: "playVideo",
          data: "some data",
        });
      });
      // Handle the 'playVideo' action
    } 
    //else if (message.routeKey === 'pauseVideo') {
        //console.log(`Pause video ${message.data.videoId}`);
        //// Handle the 'pauseVideo' action
    //} else {
        //console.log("Unknown route key:", message.routeKey);
    //}
  };
  ws.onclose = () => {
    console.log("Disconnected from WebSocket server");
    keepAliveTrigger = false;
  };
}

function keepAlive() {
  const keepAliveIntervalId = setInterval(
    () => {
      if (ws && keepAliveTrigger) {
        ws.send('keepalive');
        console.log('keepalive')
      } else {
        clearInterval(keepAliveIntervalId);
        return
      }
    },
    20 * 1000  //interval of 20 seconds
  );
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message);
  if (message.action === 'connect') {
    let statusCode = 200;
    connect();
    sendResponse({result: statusCode});
  }
  if (message.action === 'disconnect') {
    let statusCode = 500;
    if(ws && ws.readyState === WebSocket.OPEN){
      ws.close();
      chrome.runtime.sendMessage({action: 'disconnected'});
      statusCode = 200;
    }
    sendResponse({result: statusCode});
  }
  if (message.action === 'play') {
    console.log("websocket play init")
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log("play-pause init")
      const gatewayPayload = JSON.stringify({
        "action": "play-pause"
      });
      ws.send(gatewayPayload);
      console.log("Message sent:", gatewayPayload);
    } else {
      console.log("WebSocket is not open. Unable to send message.");
    }
  }

  if (message.action === 'checkConnection') {
    if (ws && ws.readyState === WebSocket.OPEN) {
      chrome.runtime.sendMessage({ action: 'connected'})
    } else {
      chrome.runtime.sendMessage({ action: 'disconnected'})
    } 
  }

});
