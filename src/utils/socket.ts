import { io } from "socket.io-client";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://api.skillsphere.space/api";

const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export const socket = io(SOCKET_BASE_URL, {
  withCredentials: true,
  autoConnect: true,
  transports: ["websocket", "polling"],
});
