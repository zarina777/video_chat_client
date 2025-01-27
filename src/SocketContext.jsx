import { createContext, useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";
import api from "./api";

export const SocketContext = createContext();
const socket = io(api.defaults.baseURL);

export const SocketContextProvider = ({ children }) => {
  const [stream, setStream] = useState(null);
  const [userStream, setUserStream] = useState(null);
  const [call, setCall] = useState({}); // Call details
  const [me, setMe] = useState(null); // User's socket ID
  const [name, setName] = useState(""); // Local user's name
  const [callAccepted, setCallAccepted] = useState(false); // Call acceptance state
  const [callEnded, setCallEnded] = useState(false); // Call end state
  const socketRef = useRef(null); // Store the socket instance
  const connectionRef = useRef(null); // Reference to Peer connection
  const [online, setOnline] = useState(null); // State to hold the list of users
  const [callingUserName, setCallingUserName] = useState(null); // State to hold the calling user's name
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
      socket.on("callUser", ({ signal, from, name: callerName }) => {
        setCall({ isReceivedCall: true, signal, from, name: callerName });
      });
    }

    return () => {
      // Cleanup listeners
      socket.off("callUser");
    };
  }, [me]);

  // Calling function
  const callUserFn = (id, name) => {
    if (!me) {
      alert("Please select a user.");
      return;
    }
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream, // Attach local stream
    });
    connectionRef.current = peer;
    peer.on("signal", (data) => {
      socket.emit("callUser", { userToCall: id, from: me._id, name: me.name, signal: data });
    });
    setCallingUserName(name);

    // Receive remote stream
    peer.on("stream", (remoteStream) => {
      setUserStream(remoteStream);
    });
    socket.once("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });
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

    return () => {
      socket.off("callUser");
      socket.off("callAccepted");
      socket.off("UserIsOnline");
      socket.off("UserNotOnline");
    };
  };

  const answerCall = (id) => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("answerToCall", { signal: data, to: call.from });
    });

    peer.on("stream", (remoteStream) => {
      setUserStream(remoteStream);
    });

    connectionRef.current = peer;
    peer.signal(call.signal);
  };

  const leaveCall = () => {
    if (connectionRef.current) {
      connectionRef.current.destroy();
      connectionRef.current.removeAllListeners();
    }
    setCallEnded(true);
    setCall({});
    setCallAccepted(false);
    setUserStream(null);
  };

  const denyCall = () => {
    setCall({ ...call, isReceivedCall: false });
  };

  return (
    <SocketContext.Provider
      value={{
        name,
        setName,
        setMe,
        me,
        stream,
        userStream,
        socket,
        callUserFn,
        leaveCall,
        callEnded,
        call,
        answerCall,
        callAccepted,
        online,
        denyCall,
        callingUserName,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
