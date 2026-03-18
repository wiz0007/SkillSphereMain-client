import "./App.css";
import AllRoutes from "./routes/AllRoutes";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
        <AllRoutes />
    </AuthProvider>
  );
}

export default App;

