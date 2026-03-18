import {Login} from "../../features/login/Login"
import { AuthNavbar } from "../../components/authNavbar/AuthNavbar.jsx"

const LoginPage = () => {
  return (
    <div>
      <AuthNavbar/>
        <Login/>
    </div>
  )
}

export default LoginPage
