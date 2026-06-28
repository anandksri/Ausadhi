import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, Users, ShieldAlert, CheckCircle, XCircle, Key, LogOut, Settings, BarChart2, ShieldAlert as ReportIcon } from "lucide-react";
import { AdminStats, User } from "../../types";

interface AdminDashboardProps {
  adminUser: User;
  onLogout: () => void;
}

export default function AdminDashboard({ adminUser, onLogout }: AdminDashboardProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);
  const [pwdErr, setPwdErr] = useState<string | null>(null);
  const [changingPwd, setChangingPwd] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        if (response.status === 401 || response.status === 403) {
          onLogout();
          navigate("/admin/login");
        }
      }
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);
    setPwdErr(null);

    if (newPassword.length < 6) {
      setPwdErr("Password must be at least 6 characters.");
      return;
    }

    setChangingPwd(true);
    try {
      const response = await fetch("/api/admin/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });

      const data = await response.json();
      if (response.ok) {
        setPwdMsg("Password updated successfully.");
        setNewPassword("");
      } else {
        setPwdErr(data.error || "Failed to update password.");
      }
    } catch (err) {
      setPwdErr("Network error. Try again.");
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col md:flex-row font-sans" id="admin_dashboard_view">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#1E293B] border-r border-[#334155] flex flex-col justify-between shrink-0" id="admin_sidebar">
        <div className="p-6">
          <div className="flex items-center space-x-2.5 mb-8">
            <div className="bg-teal-500/10 text-teal-400 p-1.5 rounded-lg">
              <Activity className="h-6 w-6 stroke-[2.5]" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              Ausadhi<span className="text-teal-400">.</span>Admin
            </span>
          </div>

          <nav className="space-y-1.5">
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-teal-400 bg-teal-950/40 border border-teal-800/30"
              id="sidebar_link_dashboard"
            >
              <BarChart2 className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            
            <Link
              to="/admin/pharmacies"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-[#334155] transition-all"
              id="sidebar_link_pharmacies"
            >
              <Users className="h-4 w-4 text-gray-400" />
              <span>Manage Pharmacies</span>
            </Link>

            <Link
              to="/admin/medicines"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-[#334155] transition-all"
              id="sidebar_link_medicines"
            >
              <Activity className="h-4 w-4 text-gray-400" />
              <span>Manage Medicines</span>
            </Link>
          </nav>
        </div>

        {/* Profile Card / Logout Footer */}
        <div className="p-6 border-t border-[#334155] bg-[#0F172A]/50 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-700/50 flex items-center justify-center font-bold text-sm text-teal-300 border border-teal-500/25">
              A
            </div>
            <div>
              <p className="text-xs font-bold truncate max-w-[140px]">{adminUser.ownerName || "Super Admin"}</p>
              <p className="text-[0.65rem] text-teal-400">System Admin</p>
            </div>
          </div>

          <button
            onClick={() => {
              onLogout();
              navigate("/admin/login");
            }}
            className="w-full flex items-center justify-center gap-2 py-2 border border-rose-500/20 bg-rose-950/20 hover:bg-rose-950/50 text-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            id="btn_admin_logout"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Stats Workspace */}
      <main className="flex-grow p-6 md:p-10 space-y-8 overflow-y-auto">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Dashboard Overview</h1>
            <p className="text-xs text-gray-400 mt-1">Platform analytics and administrative system settings.</p>
          </div>
          <button 
            onClick={fetchStats}
            className="px-4 py-2 bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Refresh Data
          </button>
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="stats_grid">
              
              {/* Stat 1: Total Pharmacies */}
              <div className="bg-[#1E293B] p-6 rounded-2xl border border-[#334155] flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-teal-500/10 p-3 rounded-xl text-teal-400">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[0.65rem] uppercase tracking-wider text-gray-400 font-bold">Pharmacies</p>
                  <p className="text-2xl font-black mt-0.5">{stats.totalPharmacies}</p>
                  <p className="text-[0.65rem] text-teal-400 mt-0.5">Registered owners</p>
                </div>
              </div>

              {/* Stat 2: Total Medicines */}
              <div className="bg-[#1E293B] p-6 rounded-2xl border border-[#334155] flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-blue-500/10 p-3 rounded-xl text-blue-400">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[0.65rem] uppercase tracking-wider text-gray-400 font-bold">Medicines</p>
                  <p className="text-2xl font-black mt-0.5">{stats.totalMedicines}</p>
                  <p className="text-[0.65rem] text-blue-400 mt-0.5">Active listings</p>
                </div>
              </div>

              {/* Stat 3: Available / OOS Split */}
              <div className="bg-[#1E293B] p-6 rounded-2xl border border-[#334155] flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-400">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[0.65rem] uppercase tracking-wider text-gray-400 font-bold">Stock Status</p>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xl font-black text-emerald-400">{stats.availableMedicines}</span>
                    <span className="text-xs text-gray-500">/</span>
                    <span className="text-sm font-semibold text-rose-400">{stats.outOfStockMedicines} OOS</span>
                  </div>
                  <p className="text-[0.65rem] text-gray-400 mt-0.5">In-stock validation ratio</p>
                </div>
              </div>

              {/* Stat 4: Mismatch Reports */}
              <div className="bg-[#1E293B] p-6 rounded-2xl border border-[#334155] flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-amber-500/10 p-3 rounded-xl text-amber-400">
                  <ReportIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[0.65rem] uppercase tracking-wider text-gray-400 font-bold">Stock Reports</p>
                  <p className="text-2xl font-black mt-0.5">{stats.totalReports}</p>
                  <p className="text-[0.65rem] text-amber-400 mt-0.5">Public verification logs</p>
                </div>
              </div>

            </div>
          )
        )}

        {/* Settings/Configuration Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
          
          {/* Admin Profile Details */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-3xl p-6 sm:p-8 space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Settings className="h-4.5 w-4.5 text-teal-400" /> Account Settings
            </h2>
            <div className="space-y-3.5 text-xs text-gray-300">
              <div className="flex justify-between border-b border-[#334155] pb-2.5">
                <span className="text-gray-400 font-medium">Username/Phone</span>
                <span className="font-bold text-white">{adminUser.phone}</span>
              </div>
              <div className="flex justify-between border-b border-[#334155] pb-2.5">
                <span className="text-gray-400 font-medium">Access Rank</span>
                <span className="font-bold text-teal-400">Super Administrator</span>
              </div>
              <div className="flex justify-between border-b border-[#334155] pb-2.5">
                <span className="text-gray-400 font-medium">System Location</span>
                <span className="font-bold text-white">{adminUser.location}</span>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-3xl p-6 sm:p-8 space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Key className="h-4.5 w-4.5 text-teal-400" /> Change Password
            </h2>
            
            {pwdMsg && (
              <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-400 rounded-xl p-3 text-xs flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{pwdMsg}</span>
              </div>
            )}

            {pwdErr && (
              <div className="bg-rose-950/40 border border-rose-800 text-rose-400 rounded-xl p-3 text-xs flex items-center gap-2">
                <XCircle className="h-4 w-4 shrink-0" />
                <span>{pwdErr}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4" id="admin_password_form">
              <div>
                <label htmlFor="new_pwd_input" className="block text-xs text-gray-400 mb-1">
                  New Secure Password
                </label>
                <input
                  id="new_pwd_input"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters..."
                  className="block w-full px-3 py-2 border border-[#334155] rounded-xl bg-[#0F172A] text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-450 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={changingPwd}
                className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-xs font-bold rounded-xl transition-all cursor-pointer"
                id="btn_submit_change_password"
              >
                {changingPwd ? "Updating Password..." : "Update Password"}
              </button>
            </form>
          </div>

        </div>

      </main>
    </div>
  );
}
