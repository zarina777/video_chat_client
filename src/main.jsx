import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "@material-tailwind/react";
import App from "./App";
import { SocketContextProvider } from "./SocketContext";
import { Buffer } from "buffer";
window.Buffer = Buffer;
import process from "process";
window.process = process;
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SocketContextProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </SocketContextProvider>
  </React.StrictMode>
);
