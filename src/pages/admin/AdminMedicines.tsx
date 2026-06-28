import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, Users, ShieldAlert, CheckCircle, XCircle, LogOut, Search, Trash2, Flag, Filter, RefreshCw, AlertTriangle } from "lucide-react";
import { Medicine, User } from "../../types";

interface AdminMedicinesProps {
  adminUser: User;
  onLogout: () => void;
}

export default function AdminMedicines({ adminUser, onLogout }: AdminMedicinesProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [pharmacies, setPharmacies] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPharmacy, setSelectedPharmacy] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [filterHighReports, setFilterHighReports] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchMedicines();
    fetchPharmacies();
  }, []);

  const fetchMedicines = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/medicines", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMedicines(data.medicines || []);
      } else {
        if (response.status === 401 || response.status === 403) {
          onLogout();
          navigate("/admin/login");
        }
      }
    } catch (err) {
      console.error("Error fetching medicines:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPharmacies = async () => {
    try {
      const response = await fetch("/api/admin/pharmacies", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPharmacies(data.pharmacies || []);
      }
    } catch (err) {
      console.error("Error fetching pharmacies for filter:", err);
    }
  };

  const handleToggleFlag = async (id: string) => {
    setActioningId(id);
    try {
      const response = await fetch(`/api/admin/medicines/${id}/flag`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMedicines(prev => prev.map(m => m._id === id ? { ...m, isFlagged: data.medicine.isFlagged } : m));
      } else {
        alert("Failed to toggle review flag.");
      }
    } catch (err) {
      console.error("Toggle flag error:", err);
    } finally {
      setActioningId(null);
    }
  };

  const handleDeleteMedicine = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this medicine listing? This action cannot be undone.")) {
      return;
    }
    setActioningId(id);
    try {
      const response = await fetch(`/api/admin/medicines/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setMedicines(prev => prev.filter(m => m._id !== id));
      } else {
        alert("Failed to delete medicine listing.");
      }
    } catch (err) {
      console.error("Delete medicine error:", err);
    } finally {
      setActioningId(null);
    }
  };

  const filteredMedicines = medicines.filter(m => {
    // 1. Text Search Filter
    const term = searchQuery.toLowerCase();
    const matchesText =
      (m.medicineName && m.medicineName.toLowerCase().includes(term)) ||
      (m.category && m.category.toLowerCase().includes(term));

    // 2. Pharmacy Filter
    const matchesPharmacy =
      selectedPharmacy === "all" ||
      (m.pharmacy && m.pharmacy.shopName === selectedPharmacy) ||
      m.pharmacyId === selectedPharmacy;

    // 3. Status Filter
    const matchesStatus =
      selectedStatus === "all" ||
      m.status === selectedStatus;

    // 4. High Reports Filter (reportCount >= 3)
    const matchesReports =
      !filterHighReports ||
      (m.reportCount !== undefined && m.reportCount >= 3);

    return matchesText && matchesPharmacy && matchesStatus && matchesReports;
  });

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col md:flex-row font-sans" id="admin_medicines_view">
      
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
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-[#334155] transition-all"
              id="sidebar_link_pharmacies"
            >
              <Users className="h-4 w-4 text-gray-400" />
              <span>Manage Pharmacies</span>
            </Link>

            <Link
              to="/admin/medicines"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-teal-400 bg-teal-950/40 border border-teal-800/30"
              id="sidebar_link_medicines"
            >
              <Activity className="h-4 w-4 text-teal-400" />
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

      {/* Main Medicines Mod Area */}
      <main className="flex-grow p-6 md:p-10 space-y-6 overflow-y-auto">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Manage Medicines</h1>
          <p className="text-xs text-gray-400 mt-1">Audit medicine listings, review spam reports, flag items for moderation, or delete regulatory violations.</p>
        </div>

        {/* Filter Controls Header */}
        <div className="bg-[#1E293B] p-5 rounded-3xl border border-[#334155] space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full lg:max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicine name or category..."
                className="block w-full pl-9 pr-3 py-2 border border-[#334155] rounded-xl bg-[#0F172A] text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-400 text-xs"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Pharmacy Dropdown */}
              <div className="flex items-center gap-1.5 bg-[#0F172A] border border-[#334155] px-3 py-1.5 rounded-xl shrink-0">
                <Filter className="h-3.5 w-3.5 text-gray-500" />
                <select
                  value={selectedPharmacy}
                  onChange={(e) => setSelectedPharmacy(e.target.value)}
                  className="bg-transparent border-0 outline-none text-xs text-gray-300 focus:ring-0 cursor-pointer"
                >
                  <option value="all" className="bg-[#0F172A]">All Pharmacies</option>
                  {pharmacies.map(p => (
                    <option key={p._id} value={p.shopName} className="bg-[#0F172A]">{p.shopName}</option>
                  ))}
                </select>
              </div>

              {/* Status Dropdown */}
              <div className="flex items-center gap-1.5 bg-[#0F172A] border border-[#334155] px-3 py-1.5 rounded-xl shrink-0">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-transparent border-0 outline-none text-xs text-gray-300 focus:ring-0 cursor-pointer"
                >
                  <option value="all" className="bg-[#0F172A]">All Statuses</option>
                  <option value="Available" className="bg-[#0F172A]">Available Only</option>
                  <option value="Out_of_Stock" className="bg-[#0F172A]">Out of Stock Only</option>
                </select>
              </div>

              {/* High Reports Toggle */}
              <button
                onClick={() => setFilterHighReports(!filterHighReports)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  filterHighReports
                    ? "bg-amber-950/40 border-amber-800 text-amber-300"
                    : "bg-[#0F172A] border-[#334155] text-gray-400 hover:text-white"
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>High Reports (≥ 3)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Medicines Data Table Grid */}
        {isLoading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-[#1E293B] rounded-2xl border border-[#334155] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="medicines_table">
                <thead>
                  <tr className="bg-[#0F172A] border-b border-[#334155] text-gray-400 font-bold text-[0.65rem] uppercase tracking-wider">
                    <th className="p-4">Medicine Details</th>
                    <th className="p-4">Pharmacy</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Reports</th>
                    <th className="p-4 text-center">Review Status</th>
                    <th className="p-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155] text-xs">
                  {filteredMedicines.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500 font-medium">
                        No medicines listed matching the filters.
                      </td>
                    </tr>
                  ) : (
                    filteredMedicines.map((med) => (
                      <tr key={med._id} className="hover:bg-[#334155]/20 transition-colors">
                        <td className="p-4">
                          <p className="font-extrabold text-white text-sm">{med.medicineName}</p>
                          <p className="text-[0.65rem] text-teal-400 mt-0.5">Category: {med.category || "General"}</p>
                        </td>
                        <td className="p-4">
                          {med.pharmacy ? (
                            <div className="space-y-0.5">
                              <p className="font-semibold text-gray-200">{med.pharmacy.shopName}</p>
                              <p className="text-[0.65rem] text-gray-500">{med.pharmacy.location}</p>
                            </div>
                          ) : (
                            <span className="text-[0.65rem] text-rose-450 italic">Pharmacy deleted</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {med.status === "Available" ? (
                            <span className="bg-emerald-950/30 text-emerald-450 border border-emerald-900/50 px-2 py-0.5 rounded-full text-[0.65rem] font-bold">
                              Available
                            </span>
                          ) : (
                            <span className="bg-rose-950/30 text-rose-450 border border-rose-900/50 px-2 py-0.5 rounded-full text-[0.65rem] font-bold">
                              Out of Stock
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center font-bold">
                          {med.reportCount >= 3 ? (
                            <span className="inline-flex items-center gap-1 text-amber-400 font-black bg-amber-950/35 border border-amber-900/40 px-2 py-0.5 rounded-lg">
                              <AlertTriangle className="h-3 w-3 shrink-0" />
                              {med.reportCount}
                            </span>
                          ) : (
                            <span className="text-gray-400">{med.reportCount || 0}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {med.isFlagged ? (
                            <span className="inline-flex items-center gap-1.5 text-rose-400 font-bold bg-rose-950/30 border border-rose-900/40 px-2.5 py-1 rounded-full text-[0.65rem]">
                              <Flag className="h-3.5 w-3.5 fill-rose-400" />
                              <span>Flagged</span>
                            </span>
                          ) : (
                            <span className="text-gray-550 text-[0.7rem]">Standard</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => handleToggleFlag(med._id)}
                              disabled={actioningId === med._id}
                              className={`p-1.5 border rounded-lg cursor-pointer transition-colors ${
                                med.isFlagged
                                  ? "border-rose-900 bg-rose-950/20 text-rose-400"
                                  : "border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white"
                              }`}
                              title={med.isFlagged ? "Unflag Listing" : "Flag Listing for Audit"}
                            >
                              <Flag className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteMedicine(med._id)}
                              disabled={actioningId === med._id}
                              className="p-1.5 border border-rose-900 bg-rose-950/20 hover:bg-rose-950/60 text-rose-450 rounded-lg cursor-pointer transition-colors"
                              title="Delete Listing Permanently"
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
