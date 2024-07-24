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

const handHistory = {
  left: [],
  right: [],
};

const maxHistoryLength = 10;

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
        checkAlphabetGesture(prediction.poseData);
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
      detectDynamicGesture(handHistory, chosenHand);

      checkHolonextGesture(prediction.poseData);

      checkAlphabetGesture(prediction.poseData);

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

function detectDynamicGesture(history, chosenHand) {
  //console.log(history);

  const leftHand = history.left;
  const rightHand = history.right;

  let leftHandPassFrame1 = false;
  let rightHandPassFrame1 = false;

  let leftHandPassFrame2 = false;
  let rightHandPassFrame2 = false;

  let frame1Check = false;
  let frame2Check = false;
  //console.log(leftHand, rightHand);
  // Bu history concole logu
  for (let i = 0; i < leftHand.length; i++) {
    //console.log(leftHand[i].poseData);

    // console.log(leftHand[i].poseData[0]); // thumb
    // console.log(leftHand[i].poseData[1]); // index
    // console.log(leftHand[i].poseData[2]); // middle
    // console.log(leftHand[i].poseData[3]); // ring
    // console.log(leftHand[i].poseData[4]); // pinky

    const curlType = leftHand[i].poseData[0][1];
    const direction = leftHand[i].poseData[0][2];

    const thumbCurlLeft = leftHand[i].poseData[0][1];
    const indexCurlLeft = leftHand[i].poseData[1][1];
    const middleCurlLeft = leftHand[i].poseData[2][1];
    const ringCurlLeft = leftHand[i].poseData[3][1];
    const pinkyCurlLeft = leftHand[i].poseData[4][1];

    const thumbDirLeft = leftHand[i].poseData[0][2];
    const indexDirLeft = leftHand[i].poseData[1][2];
    const middleDirLeft = leftHand[i].poseData[2][2];
    const ringDirLeft = leftHand[i].poseData[3][2];
    const pinkyDirLeft = leftHand[i].poseData[4][2];

    if (
      thumbCurlLeft == "No Curl" &&
      thumbDirLeft == "Horizontal Right" &&
      indexCurlLeft == "Half Curl" &&
      indexDirLeft == "Diagonal Up Right" &&
      middleCurlLeft == "Half Curl" &&
      middleDirLeft == "Diagonal Up Right" &&
      (ringCurlLeft == "No Curl" || "Half Curl") &&
      ringDirLeft == "Diagonal Up Right" &&
      (pinkyCurlLeft == "No Curl" || "Half Curl") &&
      pinkyDirLeft == "Diagonal Up Right"
    ) {
      leftHandPassFrame1 = true;
    }

    if (
      thumbCurlLeft == "No Curl" &&
      thumbDirLeft == "Horizontal Right" &&
      indexCurlLeft == "Half Curl" &&
      indexDirLeft == "Diagonal Up Right" &&
      middleCurlLeft == "Half Curl" &&
      middleDirLeft == "Diagonal Up Right" &&
      ringCurlLeft == "Half Curl" &&
      ringDirLeft == "Diagonal Up Right" &&
      pinkyCurlLeft == "Half Curl" &&
      pinkyDirLeft == "Horizontal Right"
    ) {
      leftHandPassFrame2 = true;
    }
  }

  for (let i = 0; i < rightHand.length; i++) {
    //console.log(leftHand[i].poseData);

    // console.log(rightHand[i].poseData[0]); // thumb
    // console.log(rightHand[i].poseData[1]); // index
    // console.log(rightHand[i].poseData[2]); // middle
    // console.log(rightHand[i].poseData[3]); // ring
    // console.log(rightHand[i].poseData[4]); // pinky

    const curlType = rightHand[i].poseData[0][1];
    const direction = rightHand[i].poseData[0][2];

    const thumbCurlRight = rightHand[i].poseData[0][1];
    const indexCurlRight = rightHand[i].poseData[1][1];
    const middleCurlRight = rightHand[i].poseData[2][1];
    const ringCurlRight = rightHand[i].poseData[3][1];
    const pinkyCurlRight = rightHand[i].poseData[4][1];

    const thumbDirRight = rightHand[i].poseData[0][2];
    const indexDirRight = rightHand[i].poseData[1][2];
    const middleDirRight = rightHand[i].poseData[2][2];
    const ringDirRight = rightHand[i].poseData[3][2];
    const pinkyDirRight = rightHand[i].poseData[4][2];

    if (
      thumbCurlRight == "No Curl" &&
      (thumbDirRight == "Diagonal Up Left" || "Horizontal Left") &&
      indexCurlRight == "No Curl" &&
      indexDirRight == "Horizontal Left" &&
      middleCurlRight == "No Curl" &&
      middleDirRight == "Horizontal Left" &&
      ringCurlRight == "No Curl" &&
      ringDirRight == "Horizontal Left" &&
      pinkyCurlRight == "No Curl" &&
      pinkyDirRight == "Horizontal Left"
    ) {
      rightHandPassFrame1 = true;
    }
    if (
      thumbCurlRight == "No Curl" &&
      (thumbDirRight == "Diagonal Up Left" || "Horizontal Left") &&
      indexCurlRight == "No Curl" &&
      indexDirRight == "Horizontal Left" &&
      middleCurlRight == "No Curl" &&
      middleDirRight == "Horizontal Left" &&
      ringCurlRight == "No Curl" &&
      ringDirRight == "Horizontal Left" &&
      pinkyCurlRight == "No Curl" &&
      pinkyDirRight == "Horizontal Left"
    ) {
      rightHandPassFrame2 = true;
    }
  }

  if (leftHandPassFrame1 && rightHandPassFrame1) {
    // document.getElementById("double-hand-text").innerHTML = "Bite";
    // console.log("Bite gesture detected");
    //console.log("Frame 1 passed");
    frame1Check = true;
  }
  if (leftHandPassFrame2 && rightHandPassFrame2) {
    // document.getElementById("double-hand-text").innerHTML = "Bite";
    // console.log("Bite gesture detected");
    //console.log("Frame 2 passed");
    frame2Check = true;
  }
  if (frame1Check && frame2Check) {
    document.getElementById("double-hand-text").innerHTML = "Bite";
    console.log("Bite gesture detected");
  }
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

function checkAlphabetGesture(poseData) {
  console.log("Checking alphabet gesture");
  //Case A:
  if (
    // thumb
    poseData[0][1] == "No Curl" &&
    (poseData[0][2] == "Diagonal Up Left" || "Vertical Up") &&
    // index
    poseData[1][1] == "Full Curl" &&
    poseData[1][2] == "Vertical Up" &&
    // middle
    poseData[2][1] == "Full Curl" &&
    poseData[2][2] == "Vertical Up" &&
    // ring
    poseData[3][1] == "Full Curl" &&
    poseData[3][2] == "Vertical Up" &&
    // pinky
    poseData[4][1] == "Full Curl" &&
    poseData[4][2] == "Vertical Up"
  ) {
    console.log("Letter A gesture detected");
    document.getElementById("detected-letter").innerHTML = "A";
    updateTextArea("A");
  }

  //Case B:
  else if (
    // bunda duruyor nedense
    // thumb
    poseData[0][1] == "Half Curl" &&
    (poseData[0][2] == "Diagonal Up Right" || "Vertical Up") &&
    // index
    poseData[1][1] == "No Curl" &&
    poseData[1][2] == "Vertical Up" &&
    // middle
    poseData[2][1] == "No Curl" &&
    poseData[2][2] == "Vertical Up" &&
    // ring
    poseData[3][1] == "No Curl" &&
    poseData[3][2] == "Vertical Up" &&
    // pinky
    poseData[4][1] == "No Curl" &&
    poseData[4][2] == "Vertical Up"
  ) {
    console.log("Letter B gesture detected");
    document.getElementById("detected-letter").innerHTML = "B";
    updateTextArea("B");
  }

  //Case C:
  else if (
    // thumb
    poseData[0][1] == "No Curl" &&
    poseData[0][2] == "Horizontal Left" &&
    // index
    poseData[1][1] == "Half Curl" &&
    poseData[1][2] == "Diagonal Up Left" &&
    // middle
    poseData[2][1] == "Half Curl" &&
    poseData[2][2] == "Diagonal Up Left" &&
    // ring
    poseData[3][1] == "Half Curl" &&
    poseData[3][2] == "Diagonal Up Left" &&
    // pinky
    poseData[4][1] == "Half Curl" &&
    poseData[4][2] == "Diagonal Up Left"
  ) {
    console.log("Letter C gesture detected");
    document.getElementById("detected-letter").innerHTML = "C";
    updateTextArea("C");
  }

  //Case D:
  else if (
    //thumb
    (poseData[0][1] == "No Curl" || "Half Curl") &&
    poseData[0][2] == "Vertical Up" &&
    //index
    poseData[1][1] == "No Curl" &&
    poseData[1][2] == "Vertical Up" &&
    //middle
    poseData[2][1] == "Half Curl" &&
    (poseData[2][2] == "Vertical Up" || "Diagonal Up Left") &&
    //ring
    poseData[3][1] == "Half Curl" &&
    poseData[3][2] == "Vertical Up" &&
    //pinky
    poseData[4][1] == "Half Curl" &&
    poseData[4][2] == "Vertical Up"
  ) {
    console.log("Letter D gesture detected");
    document.getElementById("detected-letter").innerHTML = "D";
    updateTextArea("D");
  }

  //Case E:
  else if (
    //thumb
    poseData[0][1] == "Half Curl" &&
    poseData[0][2] == "Diagonal Up Right" &&
    //index
    poseData[1][1] == "Full Curl" &&
    (poseData[1][2] == "Vertical Up" || "Vertical Up Left") &&
    //middle
    poseData[2][1] == "Full Curl" &&
    poseData[2][2] == "Vertical Up" &&
    //ring
    poseData[3][1] == "Full Curl" &&
    poseData[3][2] == "Vertical Up" &&
    //pinky
    poseData[4][1] == "Full Curl" &&
    poseData[4][2] == "Vertical Up"
  ) {
    console.log("Letter E gesture detected");
    document.getElementById("detected-letter").innerHTML = "E";
    updateTextArea("E");
  }

  // Case F:
  else if (
    // thumb
    poseData[0][1] == "No Curl" &&
    (poseData[0][2] == "Diagonal Up Left" || "Vertical Up") &&
    // index
    poseData[1][1] == "Half Curl" &&
    (poseData[1][2] == "Diagonal Up Right" || "Vertical Up") &&
    // middle
    poseData[2][1] == "No Curl" &&
    (poseData[2][2] == "Diagonal Up Right" || "Vertical Up") &&
    // ring
    poseData[3][1] == "No Curl" &&
    poseData[3][2] == "Vertical Up" &&
    // pinky
    poseData[4][1] == "No Curl" &&
    poseData[4][2] == "Vertical Up"
  ) {
    console.log("Letter F gesture detected");
    document.getElementById("detected-letter").innerHTML = "F";
    updateTextArea("F");
  }

  // Case G:
  else if (
    // thumb
    poseData[0][1] == "No Curl" &&
    poseData[0][2] == "Horizontal Right" &&
    // index
    poseData[1][1] == "Half Curl" &&
    poseData[1][2] == "Diagonal Up Right" &&
    // middle
    poseData[2][1] == "Full Curl" &&
    (poseData[2][2] == "Vertical Up" || "Diagonal Up Right") &&
    // ring
    poseData[3][1] == "Full Curl" &&
    poseData[3][2] == "Diagonal Up Right" &&
    // pinky
    poseData[4][1] == "Full Curl" &&
    poseData[4][2] == "Diagonal Up Right"
  ) {
    console.log("Letter G gesture detected");
    document.getElementById("detected-letter").innerHTML = "G";
    updateTextArea("G");
  }

  // Case H:
  else if (
    // thumb
    poseData[0][1] == "No Curl" &&
    poseData[0][2] == "Horizontal Right" &&
    // index
    poseData[1][1] == "No Curl" &&
    poseData[1][2] == "Horizontal Right" &&
    // middle
    poseData[2][1] == "No Curl" &&
    (poseData[2][2] == "Horizontal Right" || "Diagonal Up Right") &&
    // ring
    poseData[3][1] == "Full Curl" &&
    poseData[3][2] == "Horizontal Right" &&
    // pinky
    poseData[4][1] == "Full Curl" &&
    poseData[4][2] == "Horizontal Right"
  ) {
    console.log("Letter H gesture detected");
    document.getElementById("detected-letter").innerHTML = "H";
    updateTextArea("H");
  }

  // Case I:
  else if (
    // thumb
    poseData[0][1] == "Half Curl" &&
    (poseData[0][2] == "Diagonal Up Left" || "Vertical Up") &&
    // index
    poseData[1][1] == "Full Curl" &&
    poseData[1][2] == "Diagonal Up Left" &&
    // middle
    poseData[2][1] == "Full Curl" &&
    (poseData[2][2] == "Diagonal Up Left" || "Vertical Up") &&
    // ring
    poseData[3][1] == "Full Curl" &&
    poseData[3][2] == "Vertical Up" &&
    // pinky
    poseData[4][1] == "No Curl" &&
    poseData[4][2] == "Vertical Up"
  ) {
    console.log("Letter I gesture detected");
    document.getElementById("detected-letter").innerHTML = "I";
    updateTextArea("I");
  }

  // // Case J: Needs movement

  // Case K:
  else if (
    // thumb
    poseData[0][1] == "No Curl" &&
    poseData[0][2] == "Vertical Up" &&
    // index
    poseData[1][1] == "No Curl" &&
    poseData[1][2] == "Vertical Up" &&
    // middle
    poseData[2][1] == "No Curl" &&
    poseData[2][2] == "Vertical Up" &&
    // ring
    poseData[3][1] == "Full Curl" &&
    poseData[3][2] == "Vertical Up" &&
    // pinky
    poseData[4][1] == "Full Curl" &&
    poseData[4][2] == "Diagonal Up Right"
  ) {
    console.log("Letter K gesture detected");
    document.getElementById("detected-letter").innerHTML = "K";
    updateTextArea("K");
  }

  // Case L:
  else if (
    // thumb
    poseData[0][1] == "No Curl" &&
    poseData[0][2] == "Diagonal Up Left" &&
    // index
    poseData[1][1] == "No Curl" &&
    poseData[1][2] == "Diagonal Up Left" &&
    // middle
    poseData[2][1] == "Full Curl" &&
    poseData[2][2] == "Vertical Up" &&
    // ring
    poseData[3][1] == "Full Curl" &&
    poseData[3][2] == "Vertical Up" &&
    // pinky
    poseData[4][1] == "Full Curl" &&
    poseData[4][2] == "Vertical Up"
  ) {
    console.log("Letter L gesture detected");
    document.getElementById("detected-letter").innerHTML = "L";
    updateTextArea("L");
  }

  // Case M:
  else if (
    // thumb
    poseData[0][1] == "No Curl" &&
    poseData[0][2] == "Diagonal Up Right" &&
    // index
    poseData[1][1] == "Full Curl" &&
    poseData[1][2] == "Diagonal Up Left" &&
    // middle
    poseData[2][1] == "Full Curl" &&
    poseData[2][2] == "Diagonal Up Left" &&
    // ring
    poseData[3][1] == "Full Curl" &&
    poseData[3][2] == "Vertical Up" &&
    // pinky
    poseData[4][1] == "Full Curl" &&
    poseData[4][2] == "Vertical Up"
  ) {
    console.log("Letter M gesture detected");
    document.getElementById("detected-letter").innerHTML = "M";
    updateTextArea("M");
  }

  // Case N:
  else if (
    // thumb
    poseData[0][1] == "No Curl" &&
    poseData[0][2] == "Vertical Up" &&
    // index
    poseData[1][1] == "Full Curl" &&
    poseData[1][2] == "Diagonal Up Left" &&
    // middle
    poseData[2][1] == "Full Curl" &&
    poseData[2][2] == "Diagonal Up Left" &&
    // ring
    poseData[3][1] == "Full Curl" &&
    poseData[3][2] == "Vertical Up" &&
    // pinky
    poseData[4][1] == "Full Curl" &&
    poseData[4][2] == "Vertical Up"
  ) {
    console.log("Letter N gesture detected");
    document.getElementById("detected-letter").innerHTML = "N";
    updateTextArea("N");
  }

  // Case O:
  else if (
    // thumb
    poseData[0][1] == "No Curl" &&
    poseData[0][2] == "Diagonal Up Left" &&
    // index
    poseData[1][1] == "Half Curl" &&
    poseData[1][2] == "Diagonal Up Left" &&
    // middle
    poseData[2][1] == "Half Curl" &&
    poseData[2][2] == "Diagonal Up Left" &&
    // ring
    poseData[3][1] == "Half Curl" &&
    poseData[3][2] == "Diagonal Up Left" &&
    // pinky
    poseData[4][1] == "Half Curl" &&
    poseData[4][2] == "Diagonal Up Left"
  ) {
    console.log("Letter O gesture detected");
    document.getElementById("detected-letter").innerHTML = "O";
    updateTextArea("O");
  }
  // Case P:
  else if (
    // thumb
    poseData[0][1] == "No Curl" &&
    (poseData[0][2] == "Diagonal Up Right" || "Horizontal Right") &&
    // index
    poseData[1][1] == "No Curl" &&
    (poseData[1][2] == "Diagonal Up Right" || "Horizontal Right") &&
    // middle
    poseData[2][1] == "Half Curl" &&
    (poseData[2][2] == "Diagonal Up Right" || "Horizontal Right") &&
    // ring
    poseData[3][1] == "Full Curl" &&
    (poseData[3][2] == "Diagonal Up Right" || "Horizontal Right") &&
    // pinky
    poseData[4][1] == "Full Curl" &&
    (poseData[4][2] == "Diagonal Up Right" || "Horizontal Right")
  ) {
    console.log("Letter P gesture detected");
    document.getElementById("detected-letter").innerHTML = "P";
    updateTextArea("P");
  }

  // Case Q:
  else if (
    // thumb
    poseData[0][1] == "Half Curl" &&
    poseData[0][2] == "Horizontal Right" &&
    // index
    poseData[1][1] == "Half Curl" &&
    poseData[1][2] == "Horizontal Right" &&
    // middle
    poseData[2][1] == "Full Curl" &&
    poseData[2][2] == "Diagonal Up Right" &&
    // ring
    poseData[3][1] == "Full Curl" &&
    poseData[3][2] == "Diagonal Up Right" &&
    // pinky
    poseData[4][1] == "Full Curl" &&
    poseData[4][2] == "Diagonal Up Right"
  ) {
    console.log("Letter Q gesture detected");
    document.getElementById("detected-letter").innerHTML = "Q";
    updateTextArea("Q");
  }
  // Case R:
  else if (
    // thumb
    poseData[0][1] == "No Curl" &&
    poseData[0][2] == "Vertical Up" &&
    // index
    poseData[1][1] == "No Curl" &&
    poseData[1][2] == "Vertical Up" &&
    // middle
    poseData[2][1] == "Half Curl" &&
    poseData[2][2] == "Vertical Up" &&
    // ring
    poseData[3][1] == "Full Curl" &&
    poseData[3][2] == "Vertical Up" &&
    // pinky
    poseData[4][1] == "Full Curl" &&
    poseData[4][2] == "Vertical Up"
  ) {
    console.log("Letter R gesture detected");
    document.getElementById("detected-letter").innerHTML = "R";
    updateTextArea("R");
  }
  // Case S:
  else if (
    // thumb
    poseData[0][1] == "Half Curl" &&
    poseData[0][2] == "Vertical Up" &&
    // index
    poseData[1][1] == "Full Curl" &&
    poseData[1][2] == "Vertical Up" &&
    // middle
    poseData[2][1] == "Full Curl" &&
    poseData[2][2] == "Vertical Up" &&
    // ring
    poseData[3][1] == "Full Curl" &&
    poseData[3][2] == "Vertical Up" &&
    // pinky
    poseData[4][1] == "Full Curl" &&
    poseData[4][2] == "Vertical Up"
  ) {
    console.log("Letter S gesture detected");
    document.getElementById("detected-letter").innerHTML = "S";
    updateTextArea("S");
  }

  // Case T:
  else if (
    // thumb
    poseData[0][1] == "No Curl" &&
    poseData[0][2] == "Vertical Up" &&
    // index
    poseData[1][1] == "Full Curl" &&
    poseData[1][2] == "Diagonal Up Left" &&
    // middle
    poseData[2][1] == "Full Curl" &&
    poseData[2][2] == "Vertical Up" &&
    // ring
    poseData[3][1] == "Full Curl" &&
    poseData[3][2] == "Vertical Up" &&
    // pinky
    poseData[4][1] == "Full Curl" &&
    poseData[4][2] == "Diagonal Up Right"
  ) {
    console.log("Letter T gesture detected");
    document.getElementById("detected-letter").innerHTML = "T";
    updateTextArea("T");
  }
  // Case U:
  else if (
    // thumb
    poseData[0][1] == "Half Curl" &&
    poseData[0][2] == "Diagonal Up Right" &&
    // index
    poseData[1][1] == "No Curl" &&
    poseData[1][2] == "Vertical Up" &&
    // middle
    poseData[2][1] == "No Curl" &&
    poseData[2][2] == "Vertical Up" &&
    // ring
    poseData[3][1] == "Full Curl" &&
    poseData[3][2] == "Vertical Up" &&
    // pinky
    poseData[4][1] == "Full Curl" &&
    poseData[4][2] == "Vertical Up"
  ) {
    console.log("Letter U gesture detected");
    document.getElementById("detected-letter").innerHTML = "U";
    updateTextArea("U");
  }

  // Case V:
  else if (
    // thumb
    poseData[0][1] == "No Curl" &&
    poseData[0][2] == "Diagonal Up Right" &&
    // index
    poseData[1][1] == "No Curl" &&
    poseData[1][2] == "Vertical Up" &&
    // middle
    poseData[2][1] == "No Curl" &&
    poseData[2][2] == "Vertical Up" &&
    // ring
    poseData[3][1] == "Full Curl" &&
    poseData[3][2] == "Vertical Up" &&
    // pinky
    poseData[4][1] == "Full Curl" &&
    poseData[4][2] == "Vertical Up"
  ) {
    console.log("Letter V gesture detected");
    document.getElementById("detected-letter").innerHTML = "V";
    updateTextArea("V");
  }
  // Case W:
  else if (
    // thumb
    poseData[0][1] == "Half Curl" &&
    poseData[0][2] == "Diagonal Up Right" &&
    // index
    poseData[1][1] == "No Curl" &&
    poseData[1][2] == "Vertical Up" &&
    // middle
    poseData[2][1] == "No Curl" &&
    poseData[2][2] == "Vertical Up" &&
    // ring
    poseData[3][1] == "No Curl" &&
    poseData[3][2] == "Vertical Up" &&
    // pinky
    poseData[4][1] == "Half Curl" &&
    poseData[4][2] == "Vertical Up"
  ) {
    console.log("Letter W gesture detected");
    document.getElementById("detected-letter").innerHTML = "W";
    updateTextArea("W");
  }

  // Case X:
  else if (
    // thumb
    poseData[0][1] == "No Curl" &&
    poseData[0][2] == "Horizontal Right" &&
    // index
    poseData[1][1] == "No Curl" &&
    poseData[1][2] == "Diagonal Up Right" &&
    // middle
    poseData[2][1] == "Half Curl" &&
    poseData[2][2] == "Diagonal Up Right" &&
    // ring
    poseData[3][1] == "Half Curl" &&
    poseData[3][2] == "Horizontal Right" &&
    // pinky
    poseData[4][1] == "Half Curl" &&
    poseData[4][2] == "Horizontal Right"
  ) {
    console.log("Letter X gesture detected");
    document.getElementById("detected-letter").innerHTML = "X";
    updateTextArea("X");
  }
  // Case Y:
  else if (
    // thumb
    poseData[0][1] == "No Curl" &&
    poseData[0][2] == "Diagonal Up Left" &&
    // index
    poseData[1][1] == "Full Curl" &&
    (poseData[1][2] == "Vertical Up" || "Diagonal Up Left") &&
    // middle
    poseData[2][1] == "Full Curl" &&
    poseData[2][2] == "Vertical Up" &&
    // ring
    poseData[3][1] == "Full Curl" &&
    poseData[3][2] == "Vertical Up" &&
    // pinky
    poseData[4][1] == "No Curl" &&
    poseData[4][2] == "Diagonal Up Right"
  ) {
    console.log("Letter Y gesture detected");
    document.getElementById("detected-letter").innerHTML = "Y";
    updateTextArea("Y");
  }

  // Case Z:  // needs movement
  // else {
  //   document.getElementById("detected-letter").innerHTML = "None";
  // }
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

function updateTextArea(letter) {
  let textArea = document.getElementById("detected-text").innerHTML;
  let lastLetter = "";
  if (textArea == "None") {
    textArea = "";
  } else {
    lastLetter = textArea.slice(-1);
  }

  if (lastLetter !== letter) {
    textArea += letter;
  }
  document.getElementById("detected-text").innerHTML = textArea;
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
