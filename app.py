from flask import Flask, request, jsonify, render_template, send_from_directory
from deepface import DeepFace
import cv2
import numpy as np
import base64
import os
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/emotion')
def emotion():
    return render_template('emotion.html')

@app.route('/models/<path:filename>')
def model_file(filename):
    return send_from_directory('static/models', filename)

@app.route('/jsemotion')
def jsemotion():
    return render_template('face.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    img_data = base64.b64decode(data['image'])
    np_img = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    demography = DeepFace.analyze(img)
    return jsonify(demography)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)


