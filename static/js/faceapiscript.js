const video = document.getElementById("pose-video");
const canvas = document.getElementById("pose-canvas");
const text = document.getElementById("expr");

let url =
  "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/";

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(
    url + "tiny_face_detector_model-weights_manifest.json"
  ),
  faceapi.nets.faceLandmark68Net.loadFromUri(
    url + "face_landmark_68_model-weights_manifest.json"
  ),
  faceapi.nets.faceRecognitionNet.loadFromUri(
    url + "face_recognition_model-weights_manifest.json"
  ),
  faceapi.nets.faceExpressionNet.loadFromUri(
    url + "face_expression_model-weights_manifest.json"
  ),
])
  .then(() => {
    console.log("Models loaded successfully");
    startVideo();
  })
  .catch((err) => console.error("Error loading models: ", err));

function objToString(obj) {
  let mostPredict = "neutral";
  let maxVal = 0;

  if (!obj || !obj.expressions) return mostPredict;

  for (let expression in obj.expressions) {
    if (obj.expressions.hasOwnProperty(expression)) {
      if (obj.expressions[expression] > maxVal) {
        maxVal = obj.expressions[expression];
        mostPredict = expression;
      }
    }
  }

  return mostPredict;
}

function startVideo() {
  navigator.mediaDevices
    .getUserMedia({ video: { width: 640, height: 480 } })
    .then((stream) => {
      video.srcObject = stream;
      video.play();
    })
    .catch((err) => {
      console.error("Error accessing camera: ", err);
      document.body.innerText =
        "Camera access is not supported by your browser or device.";
    });
}

video.addEventListener("play", () => {
  // Wait for the video to load metadata to get its correct dimensions
  video.addEventListener("loadedmetadata", () => {
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        //.withFaceLandmarks()
        .withFaceExpressions();

      if (detections.length > 0) {
        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        //faceapi.draw.drawDetections(canvas, resizedDetections);
        //faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        text.innerText = objToString(detections[0]);
      } else {
        text.innerText = "No face detected";
      }
    }, 100);
  });
});
