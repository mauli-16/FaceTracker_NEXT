"use client";

import { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import { loadModels } from "../lib/faceDetection";

export default function FaceDetection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    loadModels().then(() => {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error("Webcam error:", err));
    });
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const detectFaces = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      const resized = faceapi.resizeResults(detections, {
        width: canvas.width,
        height: canvas.height,
      });

      faceapi.draw.drawDetections(canvas, resized);
      faceapi.draw.drawFaceLandmarks(canvas, resized);
      faceapi.draw.drawFaceExpressions(canvas, resized);
    };

    intervalId = setInterval(detectFaces, 100);

    return () => clearInterval(intervalId);
  }, []);

  const startRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Cleanup previous recording
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }

    recordedChunksRef.current = [];

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, {
        type: "video/webm",
      });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="p-4">
  <div className="relative w-full max-w-[640px] aspect-video mx-auto">
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className="absolute top-0 left-0 w-full h-full z-0 object-cover"
    />
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none"
    />
  </div>

  <div className="mt-4 flex flex-wrap gap-4 justify-center">
    {!isRecording ? (
      <button
        onClick={startRecording}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
      >
        Start Recording
      </button>
    ) : (
      <button
        onClick={stopRecording}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Stop Recording
      </button>
    )}
  </div>

  {videoUrl && (
    <>
      <div className="mt-6 text-center">
        <a
          href={videoUrl}
          download="recorded-video.webm"
          className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Download Video
        </a>
      </div>

      <div className="mt-6 max-w-[640px] w-full mx-auto">
        <h2 className="text-lg font-semibold mb-2 text-center">Recorded Video:</h2>
        <video
          src={videoUrl}
          controls
          className="w-full border border-gray-400 rounded"
        />
      </div>
    </>
  )}
</div>

  );
}
