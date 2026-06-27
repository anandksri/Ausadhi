import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, LogOut, LayoutDashboard, Building, Menu, X } from "lucide-react";

interface NavbarProps {
  user: any;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white text-gray-800 shadow-sm border-b border-gray-100 sticky top-0 z-50" id="navbar_container">
      <div 
        className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 h-16 flex items-center justify-between" 
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        {/* Brand Logo & Name (LEFT side, #1A5276) */}
        <Link 
          to="/" 
          className="flex items-center space-x-2.5 hover:opacity-90 transition-opacity" 
          id="brand_link"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="bg-[#1A5276]/10 text-[#1A5276] p-1.5 rounded-lg flex items-center justify-center">
            <Activity className="h-6 w-6 stroke-[2.5]" style={{ color: "#1A5276" }} />
          </div>
          <span className="text-2xl font-extrabold tracking-tight" style={{ color: "#1A5276" }}>
            Ausadhi<span className="text-teal-500">.</span>
          </span>
        </Link>

        {/* Desktop Navigation Items (RIGHT side) */}
        <nav className="hidden md:flex items-center space-x-4" id="nav_links">
          <Link
            to="/"
            className="text-gray-700 hover:text-[#1A5276] px-3 py-2 rounded-md text-sm font-semibold transition-colors"
            id="nav_link_home"
          >
            Home
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 text-[#1A5276] bg-[#1A5276]/10 hover:bg-[#1A5276]/20 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                id="nav_link_dashboard"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              
              <div className="flex items-center space-x-2 text-gray-600 text-sm px-2 border-l border-gray-200" id="user_display">
                <Building className="h-4 w-4 text-[#148F77]" />
                <span className="font-semibold text-gray-800 max-w-[150px] truncate">{user.shopName}</span>
              </div>

              <button
                onClick={() => {
                  onLogout();
                  navigate("/");
                }}
                className="flex items-center gap-1.5 bg-[#E74C3C] hover:bg-[#c0392b] text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                id="btn_logout"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[#1A5276] border border-[#1A5276] hover:bg-[#1A5276]/5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors"
                id="nav_link_login"
              >
                Owner Login
              </Link>
              <Link
                to="/register"
                className="bg-[#148F77] hover:bg-[#117a65] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
                id="nav_link_register"
              >
                Register Pharmacy
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Hamburger Button (☰) */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1A5276] cursor-pointer"
            aria-label="Toggle navigation menu"
            id="mobile_menu_button"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-3 pb-5 space-y-3 shadow-lg" id="mobile_menu">
          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className="block text-gray-700 hover:text-[#1A5276] hover:bg-gray-50 px-3 py-2.5 rounded-lg text-base font-semibold transition-colors"
            id="mobile_link_home"
          >
            Home
          </Link>

          {user ? (
            <>
              <div className="flex items-center space-x-2 text-gray-700 px-3 py-2 bg-gray-50 rounded-lg text-sm" id="mobile_user_display">
                <Building className="h-4 w-4 text-[#148F77]" />
                <span className="font-semibold text-gray-800">{user.shopName}</span>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 text-[#1A5276] bg-[#1A5276]/10 px-3 py-2.5 rounded-lg text-base font-semibold"
                id="mobile_link_dashboard"
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onLogout();
                  navigate("/");
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#E74C3C] text-white py-2.5 rounded-lg text-base font-semibold cursor-pointer"
                id="mobile_btn_logout"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center text-[#1A5276] border border-[#1A5276] py-2.5 rounded-lg text-base font-semibold"
                id="mobile_link_login"
              >
                Owner Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center bg-[#148F77] text-white py-2.5 rounded-lg text-base font-semibold shadow-sm"
                id="mobile_link_register"
              >
                Register Pharmacy
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

