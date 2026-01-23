import { Routes, Route, Navigate } from "react-router-dom";

import TabLayout from "./tabs/___layout";
import Login from "./tabs/Login";
import Register from "./tabs/Register";
import RegisterSuccess from "./tabs/RegisterSuccess";
import ForgotPassword from "./tabs/ForgotPassword";
import Verification from "./tabs/Verification";
import ResetPassword from "./tabs/ResetPassword";
import ProtectedRoute from "./tabs/ProtectedRoute";
import MainLayout from "./tabs/MainLayout";
import AdminDashboard from "./tabs/AdminDashboard";
import CaregiversPage from "./tabs/CaregiversPage";
import PatientsPage from "./tabs/PatientsPage";
import ArchivePage from "./tabs/ArchivePage";
import SuperAdminDashboard from "./tabs/superadmin/SuperAdminDashboard";
import SuperAdminCaregiverPage from "./tabs/superadmin/SuperAdminCaregiverPage";
import SuperAdminPatientPage from "./tabs/superadmin/SuperAdminPatientPage";
import SuperAdminArchivePage from "./tabs/superadmin/SuperAdminArchivePage";
import AdminAccountManagement from "./tabs/superadmin/AdminAccountManagement";
import SuperAdminLogPage from "./tabs/superadmin/SuperAdminLogPage";

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

      {/* ADMIN ROUTES - Also accessible by SUPER_ADMIN */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/caregivers"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <CaregiversPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/patients"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <PatientsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/archive"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <ArchivePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/logs"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <SuperAdminLogPage />
          </ProtectedRoute>
        }
      />

      {/* SUPER ADMIN ROUTES */}
      <Route
        path="/superadmin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/superadmin/caregivers"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <SuperAdminCaregiverPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/superadmin/patients"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <SuperAdminPatientPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/superadmin/archive"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <SuperAdminArchivePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/superadmin/admins"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <AdminAccountManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/superadmin/logs"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <SuperAdminLogPage />
          </ProtectedRoute>
        }
      />


      {/* Other routes */}
      <Route path="/web/*" element={<MainLayout />} />
    </Routes>
  );
}