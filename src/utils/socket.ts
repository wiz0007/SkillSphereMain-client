import { io } from "socket.io-client";

export const socket = io("https://skillspheremain-server-1.onrender.com", {
  withCredentials: true,
});