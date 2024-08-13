from flask import Flask, request, jsonify, render_template
from deepface import DeepFace
import cv2
import numpy as np
import base64
import os

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/emotion')
def emotion():
    return render_template('emotion.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    img_data = base64.b64decode(data['image'])
    np_img = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    demography = DeepFace.analyze(img)
    return jsonify(demography)

if __name__ == '__main__':
    app.run(debug=True)

