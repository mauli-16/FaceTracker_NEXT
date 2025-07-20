"use client";

import { useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import { loadModels } from "../lib/faceDetection";

export default function FaceDetection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Load face-api models
    loadModels().then(() => {
      // Access webcam
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Failed to access webcam:", err);
        });
    });
  }, []);

  useEffect(() => {
    const detect = async () => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const displaysize = {
          width: video.videoWidth,
          height: video.videoHeight,
        };
        faceapi.matchDimensions(canvas, displaysize);
        const result = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        const resizedDetections = faceapi.resizeResults(result, displaysize);

        canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);

        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

        //nsole.log("Detection Result:", result);
      }
    };

    const interval = setInterval(() => {
      detect();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-[500px] mt-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="rounded shadow-lg w-full"
      />
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
    </div>
  );
}
