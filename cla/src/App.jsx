import { Routes, Route, Navigate } from "react-router-dom";

import TabLayout from "./tabs/___layout";
import Login from "./tabs/Login";
import Register from "./tabs/Register";
import RegisterSuccess from "./tabs/RegisterSuccess";
import ForgotPassword from "./tabs/ForgotPassword";
import Verification from "./tabs/Verification";
import ResetPassword from "./tabs/ResetPassword";

import MainLayout from "./tabs/MainLayout";
import AdminDashboard from "./tabs/AdminDashboard";
import CaregiversPage from "./tabs/CaregiversPage";
import PatientsPage from "./tabs/PatientsPage";
import ArchivePage from "./tabs/ArchivePage";

export default function App() {
  return (
    <Routes>
      {/* Redirect root to /tab/login */}
      <Route path="/" element={<Navigate to="/tab/login" replace />} />

      {/* Auth layout */}
      <Route path="/tab" element={<TabLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="register-success" element={<RegisterSuccess />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="verification" element={<Verification />} />
        <Route path="reset-password" element={<ResetPassword />} />
      </Route>

      {/* Admin layout pages using the preset navbar */}
      <Route path="/tab/dashboard" element={<AdminDashboard />} />
      <Route path="/tab/caregivers" element={<CaregiversPage />} />
      <Route path="/tab/patients" element={<PatientsPage />} />
      <Route path="/tab/archive" element={<ArchivePage />} />

      {/* Other routes */}
      <Route path="/web/*" element={<MainLayout />} />
    </Routes>
  );
}