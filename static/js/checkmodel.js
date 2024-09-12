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

  // Convert the tensor to an array of probabilities
  const probabilities = prediction.dataSync(); // Array of probabilities for each letter
  //console.log("Probabilities:", probabilities);

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

  const letterProbabilities = labelToLetter.map((letter, index) => ({
    letter: letter,
    probability: probabilities[index].toFixed(5), // Limiting to 5 decimal places for readability
  }));

  // Sort the letters by probability, descending
  letterProbabilities.sort((a, b) => b.probability - a.probability);

  // Output the top predictions with their confidence levels
  // letterProbabilities.forEach((lp) => {
  //   if (lp.probability < 0.01) {
  //     return;
  //   }
  //   console.log(`${lp.letter} -> ${lp.probability}`);
  // });

  // if (predictedLabel < labelToLetter.length) {
  //   const predictedLetter = labelToLetter[predictedLabel];
  //   console.log(`Predicted Letter: ${predictedLetter}`);
  //   return predictedLetter;
  // } else {
  //   console.error("Predicted label index is out of bounds:", predictedLabel);
  //   return null;
  // }

  // Output the top predictions with their confidence levels
  const mostConfidentPrediction = letterProbabilities[0];
  console.log(
    `${mostConfidentPrediction.letter} -> ${mostConfidentPrediction.probability}`
  );

  // Apply the confidence threshold
  if (mostConfidentPrediction.probability >= 0.9) {
    console.log(
      `Prediction accepted: ${mostConfidentPrediction.letter} with confidence ${mostConfidentPrediction.probability}`
    );
    return mostConfidentPrediction.letter;
  } else {
    console.log(
      `Prediction rejected due to low confidence: ${mostConfidentPrediction.letter} with confidence ${mostConfidentPrediction.probability}`
    );
    return null; // Or handle as no valid prediction
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

/*
Probability Report:

A:
A -> 0.98107
M -> 0.01854

B:
B -> 0.98509
F -> 0.01362

C:
C -> 0.99965

D:
D -> 0.99929

E:
E -> 0.98404
S -> 0.01333
-----
E -> 0.97933
N -> 0.02008

F:
F -> 0.98374
C -> 0.01388

G:
G -> 0.87458
Q -> 0.11883
----
G -> 0.99390

H:
H -> 0.99115

I:
I -> 0.99974

K:
K -> 0.97761
R -> 0.02228
-------
K -> 0.99630

L:
L -> 0.97920
G -> 0.01616
-------
L -> 0.99703


M:
M -> 0.93113
N -> 0.06776


N:
N -> 0.99959

O:
O -> 0.94992
C -> 0.04967

P:
P -> 0.62774
H -> 0.17796
X -> 0.12099
O -> 0.03911
C -> 0.01922
Q -> 0.01444


Q:
Q -> 0.79172
P -> 0.09944
G -> 0.09833
X -> 0.01049

R:
R -> 0.96983
V -> 0.02157

S:
S -> 0.96736
N -> 0.02414

T:
T -> 0.98423
N -> 0.01468
------
T -> 0.99758

U:
U -> 0.97389
V -> 0.02552

V:
V -> 0.99107

W:
W -> 0.99979

X:
X -> 0.99755

Y:
Y -> 0.99996

*/
