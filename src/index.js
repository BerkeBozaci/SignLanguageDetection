import { gestures } from "./gestures.js";

const config = {
  video: { width: 640, height: 480, fps: 30 },
};

const landmarkColors = {
  thumb: "red",
  index: "blue",
  middle: "yellow",
  ring: "green",
  pinky: "pink",
  wrist: "white",
};

const gestureStrings = {
  thumbs_up: "👍",
  victory: "✌🏻",
  rock: "👊🏻",
  paper: "🖐",
  scissors: "✌🏻",
  dont: "🙅",
};
const base = ["Horizontal ", "Diagonal Up "];
const dont = {
  left: [...base].map((i) => i.concat(`Right`)),
  right: [...base].map((i) => i.concat(`Left`)),
};

async function createDetector() {
  return window.handPoseDetection.createDetector(
    window.handPoseDetection.SupportedModels.MediaPipeHands,
    {
      runtime: "mediapipe",
      modelType: "full",
      maxHands: 2,
      solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915`,
    }
  );
}

async function main() {
  const video = document.querySelector("#pose-video");
  const canvas = document.querySelector("#pose-canvas");
  const ctx = canvas.getContext("2d");

  const resultLayer = {
    right: document.querySelector("#pose-result-right"),
    left: document.querySelector("#pose-result-left"),
  };
  // configure gesture estimator
  // add "✌🏻" and "👍" as sample gestures
  const knownGestures = [
    fp.Gestures.VictoryGesture,
    fp.Gestures.ThumbsUpGesture,
    ...gestures,
  ];
  const GE = new fp.GestureEstimator(knownGestures);
  // load handpose model
  const detector = await createDetector();
  console.log("mediaPose model loaded");

  const pair = new Set();
  function checkGestureCombination(chosenHand, poseData) {
    const addToPairIfCorrect = (chosenHand) => {
      const containsHand = poseData.some((finger) =>
        dont[chosenHand].includes(finger[2])
      );
      if (!containsHand) return;
      pair.add(chosenHand);
    };

    addToPairIfCorrect(chosenHand);

    if (pair.size !== 2) return;
    resultLayer.left.innerText = resultLayer.right.innerText =
      gestureStrings.dont;
    pair.clear();
  }
  // main estimation loop
  const estimateHands = async () => {
    // clear canvas overlay
    ctx.clearRect(0, 0, config.video.width, config.video.height);
    resultLayer.right.innerText = "";
    resultLayer.left.innerText = "";

    // get hand landmarks from video
    const hands = await detector.estimateHands(video, {
      flipHorizontal: true,
    });

    for (const hand of hands) {
      for (const keypoint of hand.keypoints) {
        const name = keypoint.name.split("_")[0].toString().toLowerCase();
        const color = landmarkColors[name];
        drawPoint(ctx, keypoint.x, keypoint.y, 3, color);
      }

      const keypoints3D = hand.keypoints3D.map((keypoint) => [
        keypoint.x,
        keypoint.y,
        keypoint.z,
      ]);

      const fingerLabels = {
        thumb: "Thumb",
        index: "Index",
        middle: "Middle",
        ring: "Ring",
        pinky: "Pinky",
        wrist: "Wrist",
      };

      for (const keypoint of hand.keypoints) {
        const fingerName = keypoint.name.split("_")[0].toString().toLowerCase();
        const label = fingerLabels[fingerName];
        console.log(
          `${label} - x: ${keypoint.x}, y: ${keypoint.y}, z: ${keypoint.z}`
        );
      }

      const prediction = GE.estimate(keypoints3D, 8.5);
      if (prediction.gestures.length === 0) {
        updateDebugInfo(prediction.poseData, "left");
      }

      if (!prediction.gestures.length) continue;

      // find gesture with highest match score
      const result = prediction.gestures.reduce((p, c) =>
        p.score > c.score ? p : c
      );
      const found = gestureStrings[result.name];
      const chosenHand = hand.handedness.toLowerCase();
      updateDebugInfo(prediction.poseData, chosenHand);

      if (found !== gestureStrings.dont) {
        resultLayer[chosenHand].innerText = found;
        continue;
      }

      checkGestureCombination(chosenHand, prediction.poseData);
    }
    // ...and so on
    setTimeout(() => {
      estimateHands();
    }, 1000 / config.video.fps);
  };

  estimateHands();
  console.log("Starting predictions");
}

async function initCamera(width, height, fps) {
  const constraints = {
    audio: false,
    video: {
      facingMode: "user",
      width: width,
      height: height,
      frameRate: { max: fps },
    },
  };

  const video = document.querySelector("#pose-video");
  video.width = width;
  video.height = height;

  // get video stream
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

function drawPoint(ctx, x, y, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

// function updateDebugInfo(data, hand) {
//   const summaryTable = `#summary-${hand}`;

//   let noCurlCount = 0; // Initialize count for fingers with no curl

//   for (let fingerIdx in data) {
//     const curlType = data[fingerIdx][1];

//     document.querySelector(`${summaryTable} span#curl-${fingerIdx}`).innerHTML =
//       data[fingerIdx][1];

//     if (curlType === "No Curl") {
//       noCurlCount++;
//     }
//     //console.log(data[fingerIdx][1]);
//     document.querySelector(`${summaryTable} span#dir-${fingerIdx}`).innerHTML =
//       data[fingerIdx][2];
//   }

//   // Update the count of fingers with no curl in the new table
//   document.getElementById("no-curl-count").innerHTML = noCurlCount;
// }

function updateDebugInfo(data, hand) {
  const summaryTable = `#summary-${hand}`;

  // Initialize finger states
  let thumbNoCurl = false;
  let indexNoCurl = false;
  let middleNoCurl = false;
  let ringNoCurl = false;
  let pinkyNoCurl = false;

  for (let fingerIdx in data) {
    const curlType = data[fingerIdx][1];

    document.querySelector(`${summaryTable} span#curl-${fingerIdx}`).innerHTML =
      data[fingerIdx][1];

    // Update finger states based on the curl type
    if (curlType === "No Curl") {
      if (fingerIdx == 0) thumbNoCurl = true;
      if (fingerIdx == 1) indexNoCurl = true;
      if (fingerIdx == 2) middleNoCurl = true;
      if (fingerIdx == 3) ringNoCurl = true;
      if (fingerIdx == 4) pinkyNoCurl = true;
    }

    document.querySelector(`${summaryTable} span#dir-${fingerIdx}`).innerHTML =
      data[fingerIdx][2];
  }

  // Determine the count based on the specified cases
  let specialCount = 0;
  if (
    thumbNoCurl &&
    !indexNoCurl &&
    !middleNoCurl &&
    !ringNoCurl &&
    !pinkyNoCurl
  ) {
    specialCount = 1; // Only thumb is no curl
  } else if (
    !thumbNoCurl &&
    indexNoCurl &&
    !middleNoCurl &&
    !ringNoCurl &&
    !pinkyNoCurl
  ) {
    specialCount = 1; // Only index finger is no curl
  } else if (
    !thumbNoCurl &&
    indexNoCurl &&
    middleNoCurl &&
    !ringNoCurl &&
    !pinkyNoCurl
  ) {
    specialCount = 2; // Only index and middle are no curl
  } else if (
    thumbNoCurl &&
    indexNoCurl &&
    !middleNoCurl &&
    !ringNoCurl &&
    !pinkyNoCurl
  ) {
    specialCount = 2; // Only thumb and index are no curl
  } else if (
    thumbNoCurl &&
    indexNoCurl &&
    middleNoCurl &&
    !ringNoCurl &&
    !pinkyNoCurl
  ) {
    specialCount = 3; // Only thumb, index, and middle are no curl
  } else if (
    !thumbNoCurl &&
    indexNoCurl &&
    middleNoCurl &&
    ringNoCurl &&
    !pinkyNoCurl
  ) {
    specialCount = 3; // Only index, middle, and ring are no curl
  } else if (
    !thumbNoCurl &&
    indexNoCurl &&
    middleNoCurl &&
    ringNoCurl &&
    pinkyNoCurl
  ) {
    specialCount = 4; // Only index, middle, ring, and pinky are no curl
  } else if (
    thumbNoCurl &&
    indexNoCurl &&
    middleNoCurl &&
    ringNoCurl &&
    pinkyNoCurl
  ) {
    specialCount = 5; // All fingers are no curl
  }

  // Update the count of fingers with no curl in the new table
  document.getElementById("no-curl-count").innerHTML = specialCount;
}

window.addEventListener("DOMContentLoaded", () => {
  initCamera(config.video.width, config.video.height, config.video.fps).then(
    (video) => {
      video.play();
      video.addEventListener("loadeddata", (event) => {
        console.log("Camera is ready");
        main();
      });
    }
  );

  const canvas = document.querySelector("#pose-canvas");
  canvas.width = config.video.width;
  canvas.height = config.video.height;
  console.log("Canvas initialized");
});
