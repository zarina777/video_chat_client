import { createContext, useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";
import api from "./api";

export const SocketContext = createContext();
const socket = io(api.defaults.baseURL, { autoConnect: true });

export const SocketContextProvider = ({ children }) => {
  const [stream, setStream] = useState(null);
  const [userStream, setUserStream] = useState(null);
  const [call, setCall] = useState({}); // Call details
  const [callID, setCallID] = useState({}); // Call details
  const [me, setMe] = useState(null); // User's socket ID
  const [name, setName] = useState(""); // Local user's name
  const [callAccepted, setCallAccepted] = useState(false); // Call acceptance state
  const [callEnded, setCallEnded] = useState(false); // Call end state
  const connectionRef = useRef(null); // Reference to Peer connection
  const [online, setOnline] = useState(null); // State to hold the list of users
  const [callingUserName, setCallingUserName] = useState(null); // State to hold the calling user's name
  const [busyLine, setBusyLine] = useState(undefined); // State to hold the calling user's name
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  let [number, setNumber] = useState(0);
  useEffect(() => {
    console.log(number);
  }, [number]);
  useEffect(() => {
    // Get user's media devices
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error.message);
        alert("Unable to access camera or microphone. Please check your device permissions.");
      });

    if (me) {
      socket.on("callUser", ({ signal, from, name, userToCall }) => {
        setCall({ isReceivedCall: true, signal, from, name, userToCall });
      });
    }
    socket.on("endCall", (message) => {
      if (connectionRef.current) {
        connectionRef.current.removeAllListeners();
        connectionRef.current.destroy();
        connectionRef.current = null;
      }
      if (stream) {
        setStream(null);
      }
      // Reset state related to the call
      setCallEnded(true);
      setCall({});
      setCallAccepted(false);
      setUserStream(null);
      setIsCameraOn(true);
      setIsMicOn(true);
    });
    return () => {
      // Cleanup listeners
      socket.off("callUser");
    };
  }, [me, call]);

  // Calling function
  const callUserFn = async (id, name) => {
    if (!me) {
      alert("Please select a user.");
      return;
    }

    //Changes from here
    if (!stream) {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(newStream);
      } catch (error) {
        console.error("Error accessing media devices:", error.message);
        alert("Unable to access camera or microphone.");
        return;
      }
    }

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream, // Ensure this is not null
    });

    connectionRef.current = peer;
    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        from: me._id,
        name: me.name,
        signal: data,
      });
    });

    peer.on("stream", (remoteStream) => {
      setUserStream(remoteStream);
      setNumber((prev) => prev + 1);
    });

    socket.once("callAccepted", (signal) => {
      setCallEnded(false);
      setCallAccepted(true);
      peer.signal(signal);
    });
    //  to there

    setCallingUserName(name);
    socket.on("UserIsOnline", (res) => {
      setOnline(res);
      setTimeout(() => {
        setOnline(null);
      }, 5000);
    });
    socket.on("UserNotOnline", (res) => {
      setOnline(res);
      setTimeout(() => {
        setOnline(null);
      }, 5000);
    });
    socket.on("busyUser", (res) => {
      setBusyLine(res);
      setTimeout(() => {
        setBusyLine(null);
      }, 5000);
    });

    return () => {
      socket.off("callUser");
      socket.off("callAccepted");
      socket.off("UserIsOnline");
      socket.off("UserNotOnline");
      socket.off("busyUser");
    };
  };

  const answerCall = (id) => {
    setCallAccepted(true);
    setCallEnded(false);
    let peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    connectionRef.current = peer;
    peer.on("signal", (data) => {
      socket.emit("answerToCall", { signal: data, to: call.from, from: me._id });
    });

    peer.on("stream", (remoteStream) => {
      setUserStream(remoteStream);
      setNumber((former) => former + 1);
    });

    peer.signal(call.signal);
  };

  const leaveCall = () => {
    console.log(call);
    socket.emit("endCall", {
      to: call.from || callID,
      from: me._id,
    });

    // Clean up the Peer connection
    if (connectionRef.current) {
      connectionRef.current.removeAllListeners();
      connectionRef.current.destroy();
      connectionRef.current = null;
    }
    if (stream) {
      setStream(null);
    }
    // Reset state related to the call
    setCallEnded(true);
    setCall({});
    setCallAccepted(false);
    setIsCameraOn(true);
    setIsMicOn(true);
    // setStream(null);

    setUserStream(null);
  };

  const denyCall = () => {
    setCall({ ...call, isReceivedCall: false });
  };
  const toggleCamera = async () => {
    if (!stream) return;

    const videoTrack = stream.getVideoTracks()[0];

    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOn(videoTrack.enabled);

      if (connectionRef.current) {
        const sender = connectionRef.current._pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) {
          sender.replaceTrack(videoTrack); // Update track for peer
        }
      }
    }
  };
  const toggleMic = () => {
    if (!stream) return;

    const audioTrack = stream.getAudioTracks()[0];

    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);

      if (connectionRef.current) {
        const sender = connectionRef.current._pc.getSenders().find((s) => s.track?.kind === "audio");
        if (sender) {
          sender.replaceTrack(audioTrack); // Update track for peer
        }
      }
    }
  };

  return (
    <SocketContext.Provider
      value={{
        name,
        setName,
        setMe,
        me,
        setCallID,
        stream,
        userStream,
        socket,
        callUserFn,
        leaveCall,
        callEnded,
        setStream,
        call,
        answerCall,
        callAccepted,
        online,
        denyCall,
        callingUserName,
        busyLine,
        isCameraOn,
        setIsCameraOn,
        isMicOn,
        setIsMicOn,
        number,
        toggleCamera,
        toggleMic,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
