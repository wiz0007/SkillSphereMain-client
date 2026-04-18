import { io } from "socket.io-client";

export const socket = io("https://api.skillsphere.space", {
  withCredentials: true,
});