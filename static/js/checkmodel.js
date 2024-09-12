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
      model = await tf.loadGraphModel(
        "/models/neural_network_model/model.json"
      );
      console.log("Model loaded successfully");
    } catch (error) {
      console.error("Error loading model:", error);
    }
  }
  return model;
}

const mappings = {
  "Thumb Curl": { "No Curl": 0, "Half Curl": 1, "Full Curl": 2 },
  "Thumb Direction": {
    "Vertical Up": 0,
    "Diagonal Up Right": 1,
    "Diagonal Up Left": 2,
    "Horizontal Right": 3,
    "Horizontal Left": 4,
  },
  "Index Curl": { "No Curl": 0, "Half Curl": 1, "Full Curl": 2 },
  "Index Direction": {
    "Vertical Up": 0,
    "Diagonal Up Right": 1,
    "Diagonal Up Left": 2,
    "Horizontal Right": 3,
    "Horizontal Left": 4,
  },
  "Middle Curl": { "No Curl": 0, "Half Curl": 1, "Full Curl": 2 },
  "Middle Direction": {
    "Vertical Up": 0,
    "Diagonal Up Right": 1,
    "Diagonal Up Left": 2,
    "Horizontal Right": 3,
    "Horizontal Left": 4,
  },
  "Ring Curl": { "No Curl": 0, "Half Curl": 1, "Full Curl": 2 },
  "Ring Direction": {
    "Vertical Up": 0,
    "Diagonal Up Right": 1,
    "Diagonal Up Left": 2,
    "Horizontal Right": 3,
    "Horizontal Left": 4,
  },
  "Pinky Curl": { "No Curl": 0, "Half Curl": 1, "Full Curl": 2 },
  "Pinky Direction": {
    "Vertical Up": 0,
    "Diagonal Up Right": 1,
    "Diagonal Up Left": 2,
    "Horizontal Right": 3,
    "Horizontal Left": 4,
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
