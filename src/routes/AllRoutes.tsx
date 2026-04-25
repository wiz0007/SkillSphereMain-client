import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/home/HomePage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import UserDetailFormPage from "../pages/userDetailForm/UserDetailFormPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import TutorPage from "../pages/tutor/TutorPage";
import ProfilePage from "../pages/profile/ProfilePage";
import SettingsPage from "../pages/settings/SettingsPage";
import SessionPage from "../pages/session/SessionPage";
import AddCoursePage from "../pages/addCourse/AddCoursePage";
import CourseDetailsPage from "../pages/courseDetails/CourseDetailsPage";
import SavedCoursesPage from "../pages/savedCourses/SavedCoursesPage";
import NotificationPage from "../pages/notification/NotificationPage";
import PublicProfilePage from "../pages/publicProfile/PublicProfilePage";
import MessagesPage from "../pages/messages/MessagesPage";

import MainLayout from "../layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/userDetails" element={<UserDetailFormPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/sessions" element={<SessionPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/become-tutor" element={<TutorPage />} />
          <Route path="/add-course" element={<AddCoursePage />} />
          <Route path="/add-course/:id" element={<AddCoursePage />} />
          <Route path="/course/:id" element={<CourseDetailsPage />} />
          <Route path="/saved-courses" element={<SavedCoursesPage />} />
          <Route path="/notifications" element={<NotificationPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route
            path="/public-profile/:userId"
            element={<PublicProfilePage />}
          />
        </Route>
      </Route>

      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
};

export default AllRoutes;
