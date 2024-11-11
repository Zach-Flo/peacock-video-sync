const WebSocket = require('ws');
const https = require('https')
console.log("script running")


// Connect to the WebSocket server on the cloud
const ws = new WebSocket('wss://pspwfmqlki.execute-api.us-east-1.amazonaws.com/prod/?api_key=YVggupVACK3o2Q0KipkjA6DrAkub1yJw8BSIkFQB'); // Use 'ws://' for non-secure or 'wss://' for secure

ws.onopen = () => {
  console.log('Connected to WebSocket server');
  //ws.send('Hello from content.js!');
};

ws.onmessage = (event) => {
  const receivedMessage = JSON.parse(event.data)
  console.log('Message from server:', receivedMessage);
};

ws.onclose = () => {
  console.log('Disconnected from WebSocket server');
};

ws.onerror = (error) => {
  console.log(error)
}
