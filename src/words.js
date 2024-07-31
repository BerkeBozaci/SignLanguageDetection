export function detectDynamicGesture(history) {
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
    //document.getElementById("double-hand-text").innerHTML = "Bite";
    //console.log("Bite gesture detected");
    return true;
  }
  return false;
}

// function calculateDistance(hand1, hand2) {
//   if (!hand1 || !hand2) {
//     return null;
//   }
//   const wrist1 = hand1.keypoints.find((kp) => kp.name === "wrist");
//   const wrist2 = hand2.keypoints.find((kp) => kp.name === "wrist");

//   if (wrist1 && wrist2) {
//     const dx = wrist1.x - wrist2.x;
//     const dy = wrist1.y - wrist2.y;
//     const distance = Math.sqrt(dx * dx + dy * dy);
//     return distance;
//   }
//   return null;
// }

// function areHandsClose(leftHand, rightHand, threshold = 300) {
//   const distance = calculateDistance(leftHand, rightHand);
//   if (distance && distance < threshold) {
//     return true;
//   }
//   return false;
// }
