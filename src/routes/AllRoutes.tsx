
import { Route, Routes } from 'react-router-dom'
import HomePage from '../pages/home/HomePage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import UserDetailFormPage from '../pages/userDetailForm/UserDetailFormPage'

const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage role="student" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/userDetails" element={<UserDetailFormPage />} />
    </Routes>
  )
}

export default AllRoutes