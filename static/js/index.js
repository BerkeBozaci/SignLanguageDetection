import { gestures } from "./gestures.js";
import { detectBiteGesture, detectLoveGesture } from "./words.js";
import { checkAlphabetGesture } from "./letters.js";
import { predict, convertInputToNumerical } from "./checkmodel.js";

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

const handHistory = {
  left: [],
  right: [],
};

const maxHistoryLength = 10;

let capturing = false;
let dataToWrite = [];

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

    let leftWrist = null;
    let rightWrist = null;

    for (const hand of hands) {
      if (hand.handedness === "Left") leftHandDetected = true;
      if (hand.handedness === "Right") rightHandDetected = true;

      // Log finger coordinates in a structured format

      const wrist = hand.keypoints.find((kp) => kp.name === "wrist");
      if (wrist) {
        // console.log(
        //   `Hand: ${hand.handedness} Wrist: x=${wrist.x.toFixed(
        //     5
        //   )}, y=${wrist.y.toFixed(5)}`
        // );
        if (hand.handedness === "Left") {
          leftWrist = wrist;
        } else if (hand.handedness === "Right") {
          rightWrist = wrist;
        }
      }

      // console.log(`Hand: ${hand.handedness}`);
      // hand.keypoints3D.forEach((keypoint, index) => {
      //   console.log(
      //     `Finger ${index}: x=${keypoint.x.toFixed(5)}, y=${keypoint.y.toFixed(
      //       5
      //     )}, z=${keypoint.z.toFixed(5)}`
      //   );
      // });
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
      // normalized version of x y z coordinates x y are normalized
      // according to 1 and z is normalized according to
      // width and height of the view

      // console.log("Hand keypoints 3D");
      // console.log(keypoints3D);

      const prediction = GE.estimate(keypoints3D, 8.5);
      if (prediction.gestures.length === 0) {
        updateDebugInfo(prediction.poseData, hand.handedness.toLowerCase());
        checkAlphabetGesture(prediction.poseData);

        // Convert the pose data to CSV string
        const poseDataCsv = `
      ${prediction.poseData[0][1]},${prediction.poseData[0][2]},
      ${prediction.poseData[1][1]},${prediction.poseData[1][2]},
      ${prediction.poseData[2][1]},${prediction.poseData[2][2]},
      ${prediction.poseData[3][1]},${prediction.poseData[3][2]},
      ${prediction.poseData[4][1]},${prediction.poseData[4][2]}
      `;
        //console.log("Pose data CSV", poseDataCsv);
        const numericalInput = convertInputToNumerical(poseDataCsv);
        //console.log("Numerical input", numericalInput);
        // Call the predict function
        predict(numericalInput);

        if (capturing) {
          dataToWrite.push({
            timestamp: Date.now(),
            poseData: prediction.poseData,
          });
        }
      }

      if (!prediction.gestures.length) continue;

      const result = prediction.gestures.reduce((p, c) =>
        p.score > c.score ? p : c
      );
      const found = gestureStrings[result.name];
      const chosenHand = hand.handedness.toLowerCase();
      const count = updateDebugInfo(prediction.poseData, chosenHand);

      handHistory[chosenHand].push({
        timestamp: Date.now(),
        poseData: prediction.poseData,
      });

      if (handHistory[chosenHand].length > maxHistoryLength) {
        handHistory[chosenHand].shift();
      }

      checkHolonextGesture(prediction.poseData);

      checkAlphabetGesture(prediction.poseData);

      // Convert the pose data to CSV string
      const poseDataCsv = `
      ${prediction.poseData[0][1]},${prediction.poseData[0][2]},
      ${prediction.poseData[1][1]},${prediction.poseData[1][2]},
      ${prediction.poseData[2][1]},${prediction.poseData[2][2]},
      ${prediction.poseData[3][1]},${prediction.poseData[3][2]},
      ${prediction.poseData[4][1]},${prediction.poseData[4][2]}
      `;
      //console.log("Pose data CSV", poseDataCsv);
      const numericalInput = convertInputToNumerical(poseDataCsv);
      //console.log("Numerical input", numericalInput);
      // Call the predict function
      predict(numericalInput);

      // if (prediction.poseData.length > 0) {
      //   writeDataToCSV(prediction.poseData, "gesture_data.csv");
      // }

      // if (capturing && prediction.poseData.length > 0) {
      //   dataToWrite.push(prediction.poseData);
      // }

      if (capturing && prediction.poseData.length > 0) {
        dataToWrite.push({
          timestamp: Date.now(),
          poseData: prediction.poseData,
        });
      }

      let distanceBetweenHand = Infinity;
      if (leftWrist && rightWrist) {
        distanceBetweenHand = Math.sqrt(
          Math.pow(leftWrist.x - rightWrist.x, 2) +
            Math.pow(leftWrist.y - rightWrist.y, 2)
        );
        console.log(
          `Distance between wrists: ${distanceBetweenHand.toFixed(5)}`
        );
      }

      if (detectBiteGesture(handHistory) && distanceBetweenHand < 300) {
        console.log("Bite gesture detected");
        document.getElementById("double-hand-text").innerHTML = "Bite";
      }
      if (detectLoveGesture(handHistory) && distanceBetweenHand < 60) {
        console.log("Love gesture detected");
        document.getElementById("double-hand-text").innerHTML = "Love";
      }

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
  let middleFullCurl = false;
  let ringFullCurl = false;

  let indexFullCurl = false;
  let pinkyFullCurl = false;

  let directionCheck = false;

  for (let fingerIdx in poseData) {
    const curlType = poseData[fingerIdx][1];
    if (curlType === "No Curl") {
      if (fingerIdx == 0) thumbNoCurl = true;
    } else if (curlType === "Full Curl") {
      if (fingerIdx == 1) indexFullCurl = true;
      if (fingerIdx == 4) pinkyFullCurl = true;
      if (fingerIdx == 2) middleFullCurl = true;
      if (fingerIdx == 3) ringFullCurl = true;
    }

    if (
      poseData[0][2] == "Diagonal Up Left" &&
      poseData[1][2] == "Vertical Up" &&
      poseData[2][2] == "Vertical Up" &&
      poseData[3][2] == "Vertical Up" &&
      poseData[4][2] == "Vertical Up"
    ) {
      directionCheck = true;
    }
  }
  if (
    thumbNoCurl &&
    indexFullCurl &&
    middleFullCurl &&
    ringFullCurl &&
    pinkyFullCurl &&
    directionCheck
  ) {
    document.getElementById("detected-sentence").innerHTML = "Holonext";
  } else {
    document.getElementById("detected-sentence").innerHTML = "None";
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

function handleCaptureButton() {
  const captureButton = document.getElementById("capture-button");
  captureButton.addEventListener("click", () => {
    capturing = !capturing;
    captureButton.textContent = capturing ? "Stop Capture" : "Start Capture";

    if (!capturing) {
      if (dataToWrite.length > 0) {
        const csvContent =
          "data:text/csv;charset=utf-8," +
          "timestamp,Thumb Curl,Thumb Direction,Index Curl,Index Direction,Middle Curl,Middle Direction,Ring Curl,Ring Direction,Pinky Curl,Pinky Direction\n" +
          dataToWrite
            .map(({ timestamp, poseData }) => {
              const thumbCurl = poseData[0][1];
              const thumbDirection = poseData[0][2];
              const indexCurl = poseData[1][1];
              const indexDirection = poseData[1][2];
              const middleCurl = poseData[2][1];
              const middleDirection = poseData[2][2];
              const ringCurl = poseData[3][1];
              const ringDirection = poseData[3][2];
              const pinkyCurl = poseData[4][1];
              const pinkyDirection = poseData[4][2];

              return `${timestamp},${thumbCurl},${thumbDirection},${indexCurl},${indexDirection},${middleCurl},${middleDirection},${ringCurl},${ringDirection},${pinkyCurl},${pinkyDirection}`;
            })
            .join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "gesture_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        dataToWrite = [];
      }
    }
  });
}
window.addEventListener("DOMContentLoaded", () => {
  initCamera(config.video.width, config.video.height, config.video.fps).then(
    (video) => {
      video.play();
      video.addEventListener("loadeddata", (event) => {
        console.log("Camera is ready");
        main();
        handleCaptureButton();
      });
    }
  );

  const canvas = document.querySelector("#pose-canvas");
  canvas.width = config.video.width;
  canvas.height = config.video.height;
  console.log("Canvas initialized");

  document
    .getElementById("delete-button")
    .addEventListener("click", function () {
      document.getElementById("detected-text").innerHTML = "";
    });

  document.getElementById("delete-last").addEventListener("click", function () {
    let str = document.getElementById("detected-text").innerHTML;
    document.getElementById("detected-text").innerHTML = str.substring(
      0,
      str.length - 1
    );
  });
});
