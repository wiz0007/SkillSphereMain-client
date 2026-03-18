import {Login} from "../../features/login/Login"
import { AuthNavbar } from "../../components/AuthNavbar/AuthNavbar"

const LoginPage = () => {
  return (
    <div>
      <AuthNavbar/>
        <Login/>
    </div>
  )
}

export default LoginPage
