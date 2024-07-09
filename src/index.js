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
  iloveyou: "I love you",
  a: "A",
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

  const handStatus = document.querySelector("#hand-status");

  // configure gesture estimator
  const knownGestures = [
    fp.Gestures.VictoryGesture,
    fp.Gestures.ThumbsUpGesture,
    ...gestures,
  ];
  const GE = new fp.GestureEstimator(knownGestures);

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

  function updateHandStatus(leftHandDetected, rightHandDetected) {
    const handStatus = document.querySelector("#hand-detection-status");

    if (leftHandDetected && rightHandDetected) {
      handStatus.innerText = "Both hands detected";
    } else if (leftHandDetected) {
      handStatus.innerText = "Left hand detected";
    } else if (rightHandDetected) {
      handStatus.innerText = "Right hand detected";
    } else {
      handStatus.innerText = "No hand detected";
    }
  }

  const estimateHands = async () => {
    ctx.clearRect(0, 0, config.video.width, config.video.height);
    resultLayer.right.innerText = "";
    resultLayer.left.innerText = "";

    const hands = await detector.estimateHands(video, {
      flipHorizontal: true,
    });

    let leftHandDetected = false;
    let rightHandDetected = false;

    let leftHandCount = 0;
    let rightHandCount = 0;

    for (const hand of hands) {
      if (hand.handedness === "Left") leftHandDetected = true;
      if (hand.handedness === "Right") rightHandDetected = true;

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

      const prediction = GE.estimate(keypoints3D, 8.5);
      if (prediction.gestures.length === 0) {
        updateDebugInfo(prediction.poseData, hand.handedness.toLowerCase());
      }

      if (!prediction.gestures.length) continue;

      const result = prediction.gestures.reduce((p, c) =>
        p.score > c.score ? p : c
      );
      const found = gestureStrings[result.name];
      const chosenHand = hand.handedness.toLowerCase();
      const count = updateDebugInfo(prediction.poseData, chosenHand);

      console.log("-----Checking I Love You and A gestures-----");
      checkHolonextGesture(prediction.poseData);
      checkLetterAGesture(prediction.poseData);
      checkLetterBGesture(prediction.poseData);

      console.log("-----Gestures checked-----");

      if (chosenHand === "left") {
        leftHandCount = count;
      } else if (chosenHand === "right") {
        rightHandCount = count;
      }
    }

    updateHandStatus(leftHandDetected, rightHandDetected);
    updateCombinedCount(leftHandCount, rightHandCount);

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

function updateDebugInfo(data, hand) {
  const summaryTable = `#summary-${hand}`;

  let thumbNoCurl = false;
  let indexNoCurl = false;
  let middleNoCurl = false;
  let ringNoCurl = false;
  let pinkyNoCurl = false;

  for (let fingerIdx in data) {
    const curlType = data[fingerIdx][1];

    document.querySelector(`${summaryTable} span#curl-${fingerIdx}`).innerHTML =
      data[fingerIdx][1];

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

  let specialCount = 0;
  if (
    thumbNoCurl &&
    !indexNoCurl &&
    !middleNoCurl &&
    !ringNoCurl &&
    !pinkyNoCurl
  ) {
    specialCount = 1;
  } else if (
    !thumbNoCurl &&
    indexNoCurl &&
    !middleNoCurl &&
    !ringNoCurl &&
    !pinkyNoCurl
  ) {
    specialCount = 1;
  } else if (
    !thumbNoCurl &&
    indexNoCurl &&
    middleNoCurl &&
    !ringNoCurl &&
    !pinkyNoCurl
  ) {
    specialCount = 2;
  } else if (
    thumbNoCurl &&
    indexNoCurl &&
    !middleNoCurl &&
    !ringNoCurl &&
    !pinkyNoCurl
  ) {
    specialCount = 2;
  } else if (
    thumbNoCurl &&
    indexNoCurl &&
    middleNoCurl &&
    !ringNoCurl &&
    !pinkyNoCurl
  ) {
    specialCount = 3;
  } else if (
    !thumbNoCurl &&
    indexNoCurl &&
    middleNoCurl &&
    ringNoCurl &&
    !pinkyNoCurl
  ) {
    specialCount = 3;
  } else if (
    !thumbNoCurl &&
    indexNoCurl &&
    middleNoCurl &&
    ringNoCurl &&
    pinkyNoCurl
  ) {
    specialCount = 4;
  } else if (
    thumbNoCurl &&
    indexNoCurl &&
    middleNoCurl &&
    ringNoCurl &&
    pinkyNoCurl
  ) {
    specialCount = 5;
  }

  document.getElementById("no-curl-count").innerHTML = specialCount;

  return specialCount;
}

function checkHolonextGesture(poseData) {
  let thumbNoCurl = false;
  let indexNoCurl = false;
  let middleFullCurl = false;
  let ringFullCurl = false;
  let pinkyNoCurl = false;
  ///////////
  let indexFullCurl = false;
  let pinkyFullCurl = false;
  //////
  console.log("Checking Holonext gesture");

  for (let fingerIdx in poseData) {
    const curlType = poseData[fingerIdx][1];
    console.log("Finger", fingerIdx, "Curl Type", curlType);
    if (curlType === "No Curl") {
      if (fingerIdx == 0) thumbNoCurl = true;
      if (fingerIdx == 1) indexNoCurl = true;
      if (fingerIdx == 4) pinkyNoCurl = true;
    } else if (curlType === "Full Curl") {
      if (fingerIdx == 1) indexFullCurl = true;
      if (fingerIdx == 4) pinkyFullCurl = true;
      if (fingerIdx == 2) middleFullCurl = true;
      if (fingerIdx == 3) ringFullCurl = true;
    }
  }
  if (
    thumbNoCurl &&
    indexFullCurl &&
    middleFullCurl &&
    ringFullCurl &&
    pinkyFullCurl
  ) {
    console.log("Holonext gesture detected");
    //updateSentenceTable("I love you");
    document.getElementById("detected-sentence").innerHTML = "Holonext";
  } else {
    document.getElementById("detected-sentence").innerHTML = "None";
  }
}

function checkLetterAGesture(poseData) {
  let thumbNoCurl = false;
  let indexFullCurl = false;
  let middleFullCurl = false;
  let ringFullCurl = false;
  let pinkyFullCurl = false;
  let directions = ["Diagonal Up Left", "Vertical Up"];
  let validDirections = true;

  for (let fingerIdx in poseData) {
    const curlType = poseData[fingerIdx][1];
    const direction = poseData[fingerIdx][2];

    if (fingerIdx == 0 && curlType === "No Curl") {
      thumbNoCurl = true;
    } else if (curlType === "Full Curl") {
      if (fingerIdx == 1) indexFullCurl = true;
      if (fingerIdx == 2) middleFullCurl = true;
      if (fingerIdx == 3) ringFullCurl = true;
      if (fingerIdx == 4) pinkyFullCurl = true;
    } else {
      validDirections = false;
    }

    if (!directions.includes(direction)) {
      validDirections = false;
    }
  }

  if (
    thumbNoCurl &&
    indexFullCurl &&
    middleFullCurl &&
    ringFullCurl &&
    pinkyFullCurl &&
    validDirections
  ) {
    console.log("Letter A gesture detected");
    document.getElementById("detected-letter").innerHTML = "A";
  } else {
    document.getElementById("detected-letter").innerHTML = "None";
  }
}

function checkLetterBGesture(poseData) {
  let thumbHalfCurl = false;
  let indexNoCurl = false;
  let middleNoCurl = false;
  let ringNoCurl = false;
  let pinkyNoCurl = false;
  let validDirections = true;

  for (let fingerIdx in poseData) {
    const curlType = poseData[fingerIdx][1];
    const direction = poseData[fingerIdx][2];

    if (
      fingerIdx == 0 &&
      curlType === "Half Curl" &&
      (direction === "Diagonal Up Right" || direction === "Vertical Up")
    ) {
      thumbHalfCurl = true;
    } else if (
      fingerIdx == 1 &&
      curlType === "No Curl" &&
      direction === "Vertical Up"
    ) {
      indexNoCurl = true;
    } else if (
      fingerIdx == 2 &&
      curlType === "No Curl" &&
      direction === "Vertical Up"
    ) {
      middleNoCurl = true;
    } else if (
      fingerIdx == 3 &&
      curlType === "No Curl" &&
      direction === "Vertical Up"
    ) {
      ringNoCurl = true;
    } else if (
      fingerIdx == 4 &&
      curlType === "No Curl" &&
      direction === "Vertical Up"
    ) {
      pinkyNoCurl = true;
    } else {
      validDirections = false;
    }
  }

  if (
    thumbHalfCurl &&
    indexNoCurl &&
    middleNoCurl &&
    ringNoCurl &&
    pinkyNoCurl &&
    validDirections
  ) {
    console.log("Letter B gesture detected");
    document.getElementById("detected-letter").innerHTML = "B";
  }
}

function updateCombinedCount(leftHandCount, rightHandCount) {
  let combinedCount = leftHandCount + rightHandCount;

  if (leftHandCount === 5) {
    combinedCount = 5 + rightHandCount;
  } else if (rightHandCount === 5) {
    combinedCount = 5 + leftHandCount;
  }
  document.getElementById("no-curl-count").innerHTML = combinedCount;
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
