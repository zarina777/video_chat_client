import React, { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "../../SocketContext";
import { MdCallEnd, MdMic, MdMicOff, MdVideocam, MdVideocamOff } from "react-icons/md";
import UserVideo from "./userVideo";

const Video = () => {
  const {
    stream,
    me,
    userStream,
    call,
    callAccepted,
    leaveCall,
    answerCall,
    denyCall,
    callEnded,
    callingUserName,
    isCameraOn,
    isMicOn,
    toggleCamera,
    toggleMic,
    callDenied,
  } = useContext(SocketContext);
  const myVideo = useRef();
  const userVideo = useRef();

  // Toggles camera on/off
  // const toggleCamera = async () => {
  //   const videoTracks = stream.getTracks().filter((track) => track.kind === "video");
  //   const isVideoOn = videoTracks[0].enabled;
  //   videoTracks[0].enabled = !isVideoOn;
  //   setIsCameraOn(!isVideoOn);
  //   console.log("Toggling camera on");
  // };

  // Toggles microphone on/off
  // const toggleMic = async () => {
  //   const audioTracks = stream.getTracks().filter((track) => track.kind === "audio");
  //   const isMicOn = audioTracks[0].enabled;
  //   audioTracks[0].enabled = !isMicOn;
  //   setIsMicOn(!isMicOn);
  //   console.log("Toggling microphone on");
  // };

  useEffect(() => {
    if (stream) {
      myVideo.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (userStream && userVideo.current) {
      userVideo.current.srcObject = userStream;
    }
  }, [userStream]);
  return (
    <div className="h-full w-full flex justify-center items-center flex-col bg-gray-900">
      {!!callDenied && <h2 className="text-white">Call denied</h2>}
      <div className="videos flex flex-col gap-5 justify-center w-full px-10">
        {call?.isReceivedCall && !callAccepted && (
          <div className="flex items-center gap-2 justify-between mb-10 w-full border rounded border-black p-3">
            <h2 className="text-white">{call?.name} is calling...</h2>
            <div className="flex gap-1">
              <button onClick={answerCall} className="bg-green-500 text-white px-4 py-2 rounded-xl">
                Accept
              </button>
              <button onClick={denyCall} className="bg-red-500 text-white px-4 py-2 rounded-xl">
                Deny
              </button>
            </div>
          </div>
        )}
        {/* My Video */}
        <div className="w-full bg-gray-100 rounded-lg p-2">
          {me && <h2 className="text-center font-semibold">{me?.name}</h2>}
          <video ref={myVideo} playsInline className="w-full bg-red-300 rounded-md" muted autoPlay />
        </div>
        {/* User Video */}
        {!callEnded && callAccepted && <UserVideo call={call} callingUserName={callingUserName} ref={userVideo} />}
      </div>

      <div className="flex items-center gap-4 mt-6 -translate-y-4">
        <button
          onClick={toggleMic}
          className="text-2xl text-red-700 border border-red-500 rounded-full p-5 hover:bg-red-600 hover:text-white transition-all duration-200"
        >
          {isMicOn ? <MdMic /> : <MdMicOff />}
        </button>
        <button
          onClick={toggleCamera}
          className="text-2xl text-red-700 border border-red-500 rounded-full p-5 hover:bg-red-600 hover:text-white transition-all duration-200"
        >
          {isCameraOn ? <MdVideocam /> : <MdVideocamOff />}
        </button>
        {callAccepted && call && !callEnded && (
          <button onClick={leaveCall} className="p-4 text-3xl rounded-full bg-red-700 text-white hover:-translate-y-2 transition-all duration-200">
            <MdCallEnd />
          </button>
        )}
      </div>
    </div>
  );
};

export default Video;
