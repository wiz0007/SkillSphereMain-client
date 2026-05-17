import { AuthNavbar } from "../../components/AuthNavbar/AuthNavbar";
import { ResetPassword } from "../../features/passwordRecovery/ResetPassword";

const ResetPasswordPage = () => {
  return (
    <div>
      <AuthNavbar />
      <ResetPassword />
    </div>
  );
};

export default ResetPasswordPage;
