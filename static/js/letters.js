export function checkAlphabetGesture(poseData) {
  //console.log("Checking alphabet gesture");
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

export function updateTextArea(letter) {
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
