import { AuthNavbar } from "../../components/AuthNavbar/AuthNavbar";
import { ForgotPassword } from "../../features/passwordRecovery/ForgotPassword";

const ForgotPasswordPage = () => {
  return (
    <div>
      <AuthNavbar />
      <ForgotPassword />
    </div>
  );
};

export default ForgotPasswordPage;
