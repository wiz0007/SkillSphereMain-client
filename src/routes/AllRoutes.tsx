
import { Route, Routes } from 'react-router-dom'
import HomePage from '../pages/home/HomePage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import UserDetailFormPage from '../pages/userDetailForm/UserDetailFormPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import BecomeTutor from '../components/becomeTutor/BecomeTutor'

const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/explore" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/userDetails" element={<UserDetailFormPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/become-tutor" element={<BecomeTutor />} />
    </Routes>
  )
}

export default AllRoutes