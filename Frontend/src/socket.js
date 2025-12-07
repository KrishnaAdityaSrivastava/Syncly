import { io } from "socket.io-client";

const URL = "http://localhost:5500"; // your backend port

// connect immediately
export const socket = io(URL, {
  withCredentials: true,
});
