import "./App.css";
import AllRoutes from "./routes/AllRoutes";
import { AuthProvider } from "./context/AuthContext";
import { useEffect } from "react";
import { socket } from "./utils/socket";

function App() {
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId) {
      socket.emit("register", userId);
    }
  }, [userId]);
  return (
    <AuthProvider>
      <AllRoutes />
    </AuthProvider>
  );
}

export default App;
