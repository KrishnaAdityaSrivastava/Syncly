import { io } from "socket.io-client";

const trimTrailingSlash = (value) => value?.replace(/\/$/, "");

const socketUrl = trimTrailingSlash(
  import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5500"
);

// connect immediately
export const socket = io(socketUrl, {
  withCredentials: true,
});
