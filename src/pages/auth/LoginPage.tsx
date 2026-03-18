import {Login} from "../../features/login/Login"
import { AuthNavbar } from '../../components/authNavbar/authNavbar'

const LoginPage = () => {
  return (
    <div>
      <AuthNavbar/>
        <Login/>
    </div>
  )
}

export default LoginPage
