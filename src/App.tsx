import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.tsx";
import Home from "./components/Home.tsx";
import Login from "./components/Login.tsx";
import Register from "./components/Register.tsx";
import Dashboard from "./components/Dashboard.tsx";
import { User, AuthResponse } from "./types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  // Restore session from localStorage on startup
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.clear();
      }
    }
    setCheckedAuth(true);
  }, []);

  const handleLoginSuccess = (response: AuthResponse) => {
    setUser(response.user);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
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
      <div className="min-h-screen bg-[#F0F4F8] flex flex-col font-sans" id="app_root">
        {/* Navigation header */}
        <Navbar user={user} onLogout={handleLogout} />

        {/* Core application pages */}
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            
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

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Footer */}
        <footer className="bg-[#1A5276]/10 border-t border-gray-200/50 py-6 text-center text-xs text-gray-500" id="global_footer">
          <div className="max-w-7xl mx-auto px-4">
            <p className="font-bold text-gray-600 mb-1">
              Ausadhi.nepal &copy; {new Date().getFullYear()}
            </p>
            <p>
              A public service medicine availability and validation utility platform.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
