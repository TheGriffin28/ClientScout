import { Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import VerifyEmailOTP from "./pages/AuthPages/VerifyEmailOTP";
import VerifyTwoFactor from "./pages/AuthPages/VerifyTwoFactor";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";

import Leads from "./pages/leads";
import FollowUps from "./pages/followups";
import Settings from "./pages/settings";
import LeadDetail from "./pages/LeadDetail";
import MapLeadSearch from "./pages/MapLeadSearch";

import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Dashboard/Home";
import Support from "./pages/Support";
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminUsers from "./pages/Admin/Users";
import AdminSettings from "./pages/Admin/Settings";
import AdminLogs from "./pages/Admin/Logs";
import AdminRoute from "./components/auth/AdminRoute";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Auth Layout */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmailOTP />} />
        <Route path="/verify-2fa" element={<VerifyTwoFactor />} />

        {/* Dashboard Layout */}
        <Route element={<AppLayout />}>
          <Route index path="/" element={<Home />} />
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/leads/:id" element={<LeadDetail />} />
          <Route path="/maps-search" element={<MapLeadSearch />} />
          <Route path="/follow-ups" element={<FollowUps />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/support" element={<Support />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <AdminRoute>
                <AdminUsers />
               </AdminRoute>
             } 
           />
           <Route 
              path="/admin/settings" 
              element={
                <AdminRoute>
                  <AdminSettings />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/logs" 
              element={
                <AdminRoute>
                  <AdminLogs />
                </AdminRoute>
              } 
            />
           </Route>

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
