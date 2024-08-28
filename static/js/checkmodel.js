let model;

export async function predict(inputData) {
  if (!model) {
    await loadModel();
  }

  //console.log(inputData);
  const tensor = tf.tensor(inputData).reshape([1, inputData.length]);

  const prediction = model.predict(tensor);

  const predictedLabel = prediction.argMax(-1).dataSync()[0];
  //console.log(`Predicted Label: ${predictedLabel}`);

  const labelToLetter = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
  ];

  if (predictedLabel < labelToLetter.length) {
    const predictedLetter = labelToLetter[predictedLabel];
    console.log(`Predicted Letter: ${predictedLetter}`);
    return predictedLetter;
  } else {
    console.error("Predicted label index is out of bounds:", predictedLabel);
    return null;
  }
}

async function loadModel() {
  if (!model) {
    try {
      model = await tf.loadGraphModel("/models/model_tfjs/model.json");
      console.log("Model loaded successfully");
    } catch (error) {
      console.error("Error loading model:", error);
    }
  }
  return model;
}

const mappings = {
  "Thumb Curl": { "No Curl": 1, "Half Curl": 0 },
  "Thumb Direction": {
    "Diagonal Down Right": 0,
    "Vertical Up": 5,
    "Diagonal Up Right": 2,
    "Diagonal Up Left": 1,
    "Horizontal Right": 4,
    "Horizontal Left": 3,
  },
  "Index Curl": { "No Curl": 2, "Half Curl": 1, "Full Curl": 0 },
  "Index Direction": {
    "Vertical Up": 3,
    "Diagonal Up Right": 1,
    "Diagonal Up Left": 0,
    "Horizontal Right": 2,
  },
  "Middle Curl": { "No Curl": 2, "Half Curl": 1, "Full Curl": 0 },
  "Middle Direction": {
    "Vertical Up": 4,
    "Diagonal Up Right": 2,
    "Diagonal Up Left": 1,
    "Horizontal Right": 3,
  },
  "Ring Curl": { "No Curl": 2, "Half Curl": 1, "Full Curl": 0 },
  "Ring Direction": {
    "Vertical Up": 4,
    "Diagonal Up Right": 1,
    "Diagonal Up Left": 0,
    "Horizontal Right": 3,
    "Horizontal Left": 2,
  },
  "Pinky Curl": { "No Curl": 2, "Half Curl": 1, "Full Curl": 0 },
  "Pinky Direction": {
    "Vertical Up": 4,
    "Diagonal Up Right": 1,
    "Diagonal Up Left": 0,
    "Horizontal Right": 3,
    "Horizontal Left": 2,
  },
};

export function convertInputToNumerical(poseDataCsv) {
  const values = poseDataCsv.split(",");

  if (values.length !== 10) {
    console.error("Unexpected data length in poseDataCsv");
    return [];
  }

  const numericalInput = [
    mappings["Thumb Curl"][values[0].trim()],
    mappings["Thumb Direction"][values[1].trim()],
    mappings["Index Curl"][values[2].trim()],
    mappings["Index Direction"][values[3].trim()],
    mappings["Middle Curl"][values[4].trim()],
    mappings["Middle Direction"][values[5].trim()],
    mappings["Ring Curl"][values[6].trim()],
    mappings["Ring Direction"][values[7].trim()],
    mappings["Pinky Curl"][values[8].trim()],
    mappings["Pinky Direction"][values[9].trim()],
  ];

  return numericalInput;
}
