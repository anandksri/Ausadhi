import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, Users, ShieldAlert, CheckCircle, XCircle, LogOut, Search, Trash2, ShieldCheck, MapPin, Phone } from "lucide-react";
import { User } from "../../types";

interface AdminPharmaciesProps {
  adminUser: User;
  onLogout: () => void;
}

export default function AdminPharmacies({ adminUser, onLogout }: AdminPharmaciesProps) {
  const [pharmacies, setPharmacies] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/pharmacies", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPharmacies(data.pharmacies || []);
      } else {
        if (response.status === 401 || response.status === 403) {
          onLogout();
          navigate("/admin/login");
        }
      }
    } catch (err) {
      console.error("Error fetching pharmacies:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    setActioningId(id);
    try {
      const response = await fetch(`/api/admin/pharmacies/${id}/toggle-status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPharmacies(prev => prev.map(p => p._id === id ? { ...p, isActive: data.user.isActive } : p));
      } else {
        alert("Failed to toggle pharmacy status.");
      }
    } catch (err) {
      console.error("Toggle status error:", err);
    } finally {
      setActioningId(null);
    }
  };

  const handleDeletePharmacy = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this pharmacy? This will also wipe out their medicine inventory.")) {
      return;
    }
    setActioningId(id);
    try {
      const response = await fetch(`/api/admin/pharmacies/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setPharmacies(prev => prev.filter(p => p._id !== id));
      } else {
        alert("Failed to delete pharmacy.");
      }
    } catch (err) {
      console.error("Delete pharmacy error:", err);
    } finally {
      setActioningId(null);
    }
  };

  const filteredPharmacies = pharmacies.filter(p => {
    const term = searchQuery.toLowerCase();
    return (
      (p.shopName && p.shopName.toLowerCase().includes(term)) ||
      (p.location && p.location.toLowerCase().includes(term)) ||
      (p.ownerName && p.ownerName.toLowerCase().includes(term)) ||
      (p.phone && p.phone.includes(term))
    );
  });

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col md:flex-row font-sans" id="admin_pharmacies_view">
      
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
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-[#334155] transition-all"
              id="sidebar_link_dashboard"
            >
              <Users className="h-4 w-4 text-gray-405" />
              <span>Dashboard</span>
            </Link>
            
            <Link
              to="/admin/pharmacies"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-teal-400 bg-teal-950/40 border border-teal-800/30"
              id="sidebar_link_pharmacies"
            >
              <Users className="h-4 w-4 text-teal-400" />
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

      {/* Main Pharmacies Moderator Workspace */}
      <main className="flex-grow p-6 md:p-10 space-y-6 overflow-y-auto">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Manage Pharmacies</h1>
          <p className="text-xs text-gray-400 mt-1">Suspend, activate, or remove registered pharmacy listings on the platform.</p>
        </div>

        {/* Search Bar & Action Header */}
        <div className="bg-[#1E293B] p-4 rounded-2xl border border-[#334155] flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pharmacy name, location, phone..."
              className="block w-full pl-9 pr-3 py-2 border border-[#334155] rounded-xl bg-[#0F172A] text-white placeholder-gray-550 focus:outline-none focus:ring-1 focus:ring-teal-400 text-xs"
              id="admin_pharmacy_search_input"
            />
          </div>
          <div className="text-xs text-gray-400 font-bold shrink-0">
            {filteredPharmacies.length} pharmacies found
          </div>
        </div>

        {/* Main Database Table Grid */}
        {isLoading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-[#1E293B] rounded-2xl border border-[#334155] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="pharmacies_table">
                <thead>
                  <tr className="bg-[#0F172A] border-b border-[#334155] text-gray-400 font-bold text-[0.65rem] uppercase tracking-wider">
                    <th className="p-4">Shop Details</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Location</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155] text-xs">
                  {filteredPharmacies.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">
                        No registered pharmacies found matching the criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredPharmacies.map((pharma) => (
                      <tr key={pharma._id} className="hover:bg-[#334155]/20 transition-colors">
                        <td className="p-4">
                          <p className="font-extrabold text-white text-sm">{pharma.shopName}</p>
                          <p className="text-[0.65rem] text-teal-400 mt-0.5">Owner: {pharma.ownerName}</p>
                        </td>
                        <td className="p-4 space-y-1">
                          <div className="flex items-center gap-1.5 text-gray-300">
                            <Phone className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                            <span>{pharma.phone}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-gray-300 max-w-xs">
                            <MapPin className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                            <span className="truncate">{pharma.location}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          {pharma.isActive !== false ? (
                            <span className="bg-emerald-950/30 text-emerald-400 border border-emerald-900/50 px-2.5 py-1 rounded-full text-[0.65rem] font-bold">
                              Active
                            </span>
                          ) : (
                            <span className="bg-rose-950/30 text-rose-400 border border-rose-900/50 px-2.5 py-1 rounded-full text-[0.65rem] font-bold">
                              Suspended
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => pharma._id && handleToggleStatus(pharma._id)}
                              disabled={actioningId === pharma._id}
                              className={`px-3 py-1.5 rounded-lg text-[0.65rem] font-extrabold cursor-pointer transition-all border ${
                                pharma.isActive !== false
                                  ? "border-rose-900 bg-rose-950/20 hover:bg-rose-950/50 text-rose-300"
                                  : "border-emerald-900 bg-emerald-950/20 hover:bg-emerald-950/50 text-emerald-300"
                              }`}
                            >
                              {pharma.isActive !== false ? "Suspend" : "Activate"}
                            </button>
                            
                            <button
                              onClick={() => pharma._id && handleDeletePharmacy(pharma._id)}
                              disabled={actioningId === pharma._id}
                              className="p-1.5 border border-rose-900 bg-rose-950/20 hover:bg-rose-950/60 text-rose-400 rounded-lg cursor-pointer transition-colors"
                              title="Delete Account Permanently"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
