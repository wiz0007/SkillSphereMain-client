import AdminGiftPopup from "./components/adminGiftPopup/AdminGiftPopup";
import MoveToTop from "./components/moveToTop/MoveToTop";
import AllRoutes from "./routes/AllRoutes";
import SeoHead from "./seo/SeoHead";

function App() {
  return (
    <>
      <SeoHead />
      <MoveToTop />
      <AdminGiftPopup />
      <AllRoutes />
    </>
  );
}

export default App;
