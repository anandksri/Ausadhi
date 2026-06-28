import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";
import Home from "./components/Home.tsx";
import Login from "./components/Login.tsx";
import Register from "./components/Register.tsx";
import Dashboard from "./components/Dashboard.tsx";

// New public pages
import About from "./components/About.tsx";
import Contact from "./components/Contact.tsx";
import Privacy from "./components/Privacy.tsx";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminPharmacies from "./pages/admin/AdminPharmacies.tsx";
import AdminMedicines from "./pages/admin/AdminMedicines.tsx";

import { User, AuthResponse } from "./types";

function AppContent({
  user,
  adminUser,
  handleLoginSuccess,
  handleLogout,
  handleAdminLoginSuccess,
  handleAdminLogout
}: {
  user: User | null;
  adminUser: User | null;
  handleLoginSuccess: (response: AuthResponse) => void;
  handleLogout: () => void;
  handleAdminLoginSuccess: (user: User, token: string) => void;
  handleAdminLogout: () => void;
}) {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col font-sans" id="app_root">
      {/* Navigation header (hidden on admin pages) */}
      {!isAdminPath && <Navbar user={user} onLogout={handleLogout} />}

      {/* Core application pages */}
      <div className="flex-grow">
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          
          {/* Pharmacy Owner Auth & Dashboard */}
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />
            } 
          />
          <Route 
            path="/register" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <Register onRegisterSuccess={handleLoginSuccess} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              user ? <Dashboard /> : <Navigate to="/login" replace />
            } 
          />

          {/* Admin Panel Pages */}
          <Route 
            path="/admin/login" 
            element={
              adminUser ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />
            } 
          />
          <Route 
            path="/admin" 
            element={
              adminUser ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/admin/login" replace />
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              adminUser ? <AdminDashboard adminUser={adminUser} onLogout={handleAdminLogout} /> : <Navigate to="/admin/login" replace />
            } 
          />
          <Route 
            path="/admin/pharmacies" 
            element={
              adminUser ? <AdminPharmacies adminUser={adminUser} onLogout={handleAdminLogout} /> : <Navigate to="/admin/login" replace />
            } 
          />
          <Route 
            path="/admin/medicines" 
            element={
              adminUser ? <AdminMedicines adminUser={adminUser} onLogout={handleAdminLogout} /> : <Navigate to="/admin/login" replace />
            } 
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Footer (hidden on admin pages) */}
      {!isAdminPath && <Footer />}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  // Restore sessions from localStorage on startup
  useEffect(() => {
    // Pharmacy Owner session
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    // Admin session
    const storedAdminUser = localStorage.getItem("adminUser");
    const storedAdminToken = localStorage.getItem("adminToken");
    if (storedAdminUser && storedAdminToken) {
      try {
        setAdminUser(JSON.parse(storedAdminUser));
      } catch (e) {
        localStorage.removeItem("adminUser");
        localStorage.removeItem("adminToken");
      }
    }

    setCheckedAuth(true);
  }, []);

  const handleLoginSuccess = (response: AuthResponse) => {
    setUser(response.user);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  const handleAdminLoginSuccess = (user: User, token: string) => {
    localStorage.setItem("adminUser", JSON.stringify(user));
    localStorage.setItem("adminToken", token);
    setAdminUser(user);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminToken");
    setAdminUser(null);
  };

  if (!checkedAuth) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 border-4 border-[#1A5276] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 text-xs font-semibold">Checking credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AppContent
        user={user}
        adminUser={adminUser}
        handleLoginSuccess={handleLoginSuccess}
        handleLogout={handleLogout}
        handleAdminLoginSuccess={handleAdminLoginSuccess}
        handleAdminLogout={handleAdminLogout}
      />
    </Router>
  );
}
