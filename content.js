let videoElement;
let playbackButton;
setInterval(() => {
  if (!playbackButton) {
    playbackButton = document.querySelector(".playback-button.play-pause");
    console.log('playbackButton:' + playbackButton)
  }

  if(videoElement) {
    console.log(videoElement.currentTime);
    return;
  }

  videoElement = getVideoElement();
  videoElement.addEventListener('play', () => {
    console.log("play hit")
    chrome.runtime.sendMessage({ action: 'play', time: videoElement.currentTime });
  })

  videoElement.addEventListener('pause', () => {
    console.log("pause hit")
    const message = JSON.stringify({
      action: 'pause',
      data: videoElement.currentTime
    })
  })
}, 1000); 

// Function to find the video element
function getVideoElement() {
  return document.querySelector("video"); // Adjust the selector if necessary
}

function play() {
  const allElements = document.querySelectorAll("*");
  console.log("All elements on the page:", allElements);
  const playButton = document.querySelector('[aria-label="Play"]');
  console.log("function ran");
}


function togglePlayPause() {
  if (playbackButton) {
    playbackButton.click();
    console.log("Toggled play/pause");
  } else {
    console.log("Playback button not found");
  }
}


// Function to set the video current time
function setVideoTime(time) {
  if (videoElement) {
    videoElement.currentTime = time;
    console.log(`Video time set to ${time} seconds`);
  } else {
    console.log("Video element not found");
  }
}

// Function to increase the video time by a specified number of seconds
function increaseVideoTime(seconds) {
  if (videoElement) {
    videoElement.currentTime += seconds;
    console.log(`Increased video time by ${seconds} seconds`);
  } else {
    console.log("Video element not found");
  }
}

// Function to decrease the video time by a specified number of seconds
function decreaseVideoTime(seconds) {
  if (videoElement) {
    videoElement.currentTime -= seconds;
    console.log(`Decreased video time by ${seconds} seconds`);
  } else {
    console.log("Video element not found");
  }
}
