"use client"

import { useRef,useEffect } from "react"
 export default function FaceDetection(){
    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(()=>{
        //requesting webcam access
        navigator.mediaDevices
        .getUserMedia({video:true})//get user media available only on client = use client
        .then((stream)=>{
            if(videoRef.current){
                videoRef.current.srcObject=stream //sets src obj of video dom element to  stream
                //telling the video cam to play this feed
               
            }
        })
        .catch((err)=>{
            console.error("Failed to access webcam:",err);
        })
    },[])
     return (
    <div className="flex flex-col items-center justify-center mt-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-[500px] rounded shadow-lg"
      />
    </div>
  );
 }