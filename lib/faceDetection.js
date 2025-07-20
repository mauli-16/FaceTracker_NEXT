import * as faceapi from 'face-api.js';

export async function loadModels() {
  const MODEL_URL = '/models'; // just write '/models' not public as it loads statically
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL), //loading tiny face detector model from /models/tiny_face_detector/
     faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
  ]);
}
