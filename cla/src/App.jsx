import { Routes, Route, Navigate } from "react-router-dom";

import TabLayout from "./tabs/___layout"; // your layout
import Login from "./tabs/Login";
import Register from "./tabs/Register";
import RegisterSuccess from "./tabs/RegisterSuccess";
import ForgotPassword from "./tabs/ForgotPassword";
import Verification from "./tabs/Verification";
import ResetPassword from "./tabs/ResetPassword";

import MainLayout from "./tabs/MainLayout";
export default function App() {
  return (
    <Routes>
      {/* Redirect root to /tab/login */}
      <Route path="/" element={<Navigate to="/tab/login" replace />} />

      {/* TabLayout with nested routes */}
      <Route path="/tab" element={<TabLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="register-success" element={<RegisterSuccess />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="verification" element={<Verification />} />
          <Route path="reset-password" element={<ResetPassword />} />
          
      </Route>

      {/* Other routes */}
      <Route path="/web/*" element={<MainLayout />} />
    </Routes>
  );
}
