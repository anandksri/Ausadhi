import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Phone, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Sparkles, Filter } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Medicine } from "../types";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [reporting, setReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  // Advanced Filters state
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [timeFilter, setTimeFilter] = useState("any"); // "any", "24h", "7d", "30d"
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "Available", "Out_of_Stock"
  const [isNearbyActive, setIsNearbyActive] = useState(false);

  // Dropdown panel states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tempLat, setTempLat] = useState<number | null>(null);
  const [tempLng, setTempLng] = useState<number | null>(null);
  const [tempTimeFilter, setTempTimeFilter] = useState("any");
  const [tempStatusFilter, setTempStatusFilter] = useState("all");
  const [tempIsNearbyActive, setTempIsNearbyActive] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync temp state when opening dropdown
  useEffect(() => {
    if (isDropdownOpen) {
      setTempLat(lat);
      setTempLng(lng);
      setTempTimeFilter(timeFilter);
      setTempStatusFilter(statusFilter);
      setTempIsNearbyActive(isNearbyActive);
    }
  }, [isDropdownOpen, lat, lng, timeFilter, statusFilter, isNearbyActive]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocationSelect = (nearby: boolean) => {
    if (!nearby) {
      setTempLat(null);
      setTempLng(null);
      setTempIsNearbyActive(false);
    } else {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setTempLat(pos.coords.latitude);
          setTempLng(pos.coords.longitude);
          setTempIsNearbyActive(true);
          setIsLocating(false);
        },
        (err) => {
          console.error(err);
          alert("Could not access location. Please check browser permissions.");
          setIsLocating(false);
        }
      );
    }
  };

  const handleApplyFilters = () => {
    setLat(tempLat);
    setLng(tempLng);
    setTimeFilter(tempTimeFilter);
    setStatusFilter(tempStatusFilter);
    setIsNearbyActive(tempIsNearbyActive);
    setIsDropdownOpen(false);
  };

  const handleClearAll = () => {
    setLat(null);
    setLng(null);
    setTimeFilter("any");
    setStatusFilter("all");
    setIsNearbyActive(false);

    setTempLat(null);
    setTempLng(null);
    setTempTimeFilter("any");
    setTempStatusFilter("all");
    setTempIsNearbyActive(false);

    setIsDropdownOpen(false);
  };

  const isAnyFilterApplied = isNearbyActive || timeFilter !== "any" || statusFilter !== "all";

  // Trigger search on mount or when search query / filters update (debounced)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchResults(searchQuery, lat, lng, timeFilter, statusFilter);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, lat, lng, timeFilter, statusFilter]);

  const fetchResults = async (
    query: string,
    latitude: number | null,
    longitude: number | null,
    time: string,
    status: string
  ) => {
    setIsLoading(true);
    try {
      let url = `/api/medicines/search?q=${encodeURIComponent(query)}`;
      if (latitude !== null && longitude !== null) {
        url += `&lat=${latitude}&lng=${longitude}`;
      }
      if (time !== "any") {
        url += `&timeFilter=${time}`;
      }
      if (status !== "all") {
        url += `&statusFilter=${status}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      } else {
        console.error("Search failed");
      }
    } catch (err) {
      console.error("Error fetching medicines:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportMismatch = async () => {
    if (!selectedMed) return;
    setReporting(true);
    try {
      const response = await fetch(`/api/medicines/${selectedMed._id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        const data = await response.json();
        setReportSuccess(`Thank you. Your report has been recorded. Mismatch count: ${data.medicine.reportCount}`);
        // Refresh local search list
        setResults(prev => prev.map(m => m._id === selectedMed._id ? { ...m, reportCount: data.medicine.reportCount } : m));
        setTimeout(() => {
          setSelectedMed(null);
          setReportSuccess(null);
        }, 3000);
      } else {
        alert("Failed to file mismatch report. Please try again.");
      }
    } catch (err) {
      console.error("Error reporting mismatch:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setReporting(false);
    }
  };

  const popularMedicines = ["Paracetamol", "Amoxicillin", "Cetirizine", "Metformin", "Pantoprazole", "Amlodipine"];

  return (
    <div className="min-h-screen bg-[#F0F4F8] pb-16" id="home_view">
      {/* Hero Banner Section */}
      <div className="bg-[#1A5276] text-white py-14 px-4 text-center relative overflow-hidden shadow-inner" id="hero_section">
        {/* Decorative ambient background curves */}
        <div className="absolute top-0 left-0 right-0 bottom-0 opacity-10 pointer-events-none">
          <div className="absolute w-[400px] h-[400px] bg-white rounded-full blur-3xl -top-40 -left-40"></div>
          <div className="absolute w-[400px] h-[400px] bg-teal-300 rounded-full blur-3xl -bottom-40 -right-40"></div>
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          <span className="bg-teal-700/50 text-teal-200 text-[0.75rem] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-4 border border-teal-500/30">
            <Sparkles className="h-3 w-3 text-teal-300" /> Hyper-Local Health Tracker
          </span>
          <h1 className="text-[1.75rem] sm:text-[2.25rem] md:text-[3rem] font-extrabold tracking-tight mb-4 leading-tight">
            Find Medicine Availability in Nepal
          </h1>
          <p className="text-white/85 text-[0.95rem] sm:text-[1.125rem] max-w-xl mx-auto mb-8 px-2">
            Real-time medicine search matched with direct stock updates verified by pharmacies across Nepal.
          </p>

          {/* Search Input Box & Filter Dropdown container */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-xl mx-auto px-2 sm:px-0 relative" id="search_and_filter_container">
            <div className="relative flex-1 responsive-search-bar" id="search_container">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicine by name (e.g., Paracetamol, Flexon)..."
                className="block w-full pl-12 pr-12 py-3.5 sm:py-4 border border-transparent rounded-2xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-400 shadow-lg text-[0.95rem] sm:text-[1rem] outline-none"
                id="input_search_query"
              />
              {isLoading && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <RefreshCw className="h-5 w-5 text-teal-600 animate-spin" />
                </div>
              )}
            </div>

            {/* Filter Dropdown */}
            <div className="relative" id="filter_dropdown_container" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full sm:w-auto px-5 py-3.5 sm:py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border shadow-lg text-sm ${
                  isAnyFilterApplied
                    ? "bg-[#148F77] text-white border-transparent hover:bg-[#117a65]"
                    : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
                }`}
                id="btn_filter_dropdown_toggle"
              >
                <Filter className="h-4 w-4 shrink-0" />
                <span>Filter</span>
                {isAnyFilterApplied && (
                  <span className="bg-white text-[#148F77] text-[0.65rem] px-1.5 py-0.5 rounded-full font-extrabold">
                    Active
                  </span>
                )}
                <span className="ml-1 text-[0.6rem] opacity-60">▼</span>
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-full sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 text-left p-5 text-gray-800"
                    id="filter_dropdown_panel"
                  >
                    {/* Location Filter Section */}
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Location</h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                          <input
                            type="radio"
                            name="locationFilter"
                            checked={!tempIsNearbyActive}
                            onChange={() => handleLocationSelect(false)}
                            className="text-[#1A5276] focus:ring-[#1A5276] h-4 w-4"
                          />
                          <span>Anywhere</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                          <input
                            type="radio"
                            name="locationFilter"
                            checked={tempIsNearbyActive}
                            onChange={() => handleLocationSelect(true)}
                            className="text-[#1A5276] focus:ring-[#1A5276] h-4 w-4"
                          />
                          <span className="flex items-center gap-1">
                            Nearby Me
                            {isLocating && <RefreshCw className="h-3 w-3 text-teal-600 animate-spin" />}
                          </span>
                        </label>
                      </div>
                    </div>

                    <hr className="border-gray-100 my-3" />

                    {/* Time Filter Section */}
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Last Updated</h4>
                      <div className="space-y-2">
                        {[
                          { val: "any", label: "Any Time" },
                          { val: "24h", label: "Last 24 Hours" },
                          { val: "7d", label: "Last 7 Days" },
                          { val: "30d", label: "Last 30 Days" }
                        ].map((opt) => (
                          <label key={opt.val} className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                            <input
                              type="radio"
                              name="timeFilter"
                              value={opt.val}
                              checked={tempTimeFilter === opt.val}
                              onChange={() => setTempTimeFilter(opt.val)}
                              className="text-[#1A5276] focus:ring-[#1A5276] h-4 w-4"
                            />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <hr className="border-gray-100 my-3" />

                    {/* Status Filter Section */}
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Availability Status</h4>
                      <div className="space-y-2">
                        {[
                          { val: "all", label: "All" },
                          { val: "Available", label: "Available Only" },
                          { val: "Out_of_Stock", label: "Out of Stock Only" }
                        ].map((opt) => (
                          <label key={opt.val} className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                            <input
                              type="radio"
                              name="statusFilter"
                              value={opt.val}
                              checked={tempStatusFilter === opt.val}
                              onChange={() => setTempStatusFilter(opt.val)}
                              className="text-[#1A5276] focus:ring-[#1A5276] h-4 w-4"
                            />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className="text-xs font-bold text-[#E74C3C] hover:underline cursor-pointer bg-transparent border-none p-0"
                        id="btn_clear_filters_link"
                      >
                        Clear All
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyFilters}
                        className="px-4 py-2 bg-[#1A5276] text-white text-xs font-bold rounded-xl hover:bg-[#154360] transition-colors cursor-pointer"
                        id="btn_apply_filters"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Suggested searches */}
          <div className="mt-5 flex flex-wrap justify-center items-center gap-2 px-2" id="popular_searches">
            <span className="text-[0.75rem] text-white/70 font-semibold mr-1 w-full sm:w-auto text-center mb-1 sm:mb-0">Popular Search:</span>
            {popularMedicines.map((med) => (
              <button
                key={med}
                onClick={() => setSearchQuery(med)}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[0.75rem] px-3 py-1 rounded-full transition-all cursor-pointer"
              >
                {med}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 mt-8" id="main_content_container">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[1.25rem] font-bold text-gray-800" id="results_title">
            {searchQuery ? `Search Results for "${searchQuery}"` : "All Tracked Medicines"}
            <span className="ml-2 text-[0.875rem] font-medium text-gray-500">({results.length} found)</span>
          </h2>
        </div>

        {results.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-gray-100 shadow-sm max-w-lg mx-auto" id="no_results_card">
            <div className="w-16 h-16 bg-blue-50 text-[#1A5276] rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-[1.125rem] font-bold text-gray-800 mb-1">No medicines found</h3>
            <p className="text-gray-500 text-[0.875rem] mb-6">
              We couldn't find matches for your selection. Ask your local pharmacy to register and upload their inventory.
            </p>
            {(searchQuery || isNearbyActive || timeFilter !== "any" || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  handleClearAll();
                }}
                className="text-[#1A5276] text-[0.875rem] font-bold hover:underline cursor-pointer"
              >
                Clear All Search Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="results_grid">
            {results.map((med) => (
              <div
                key={med._id}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between w-full"
                id={`medicine_card_${med._id}`}
              >
                <div>
                  {/* Status and Category */}
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-gray-100 text-gray-600 text-[0.75rem] font-semibold px-2.5 py-1 rounded-md">
                      {med.category || "General"}
                    </span>
                    {med.status === "Available" ? (
                      <span className="bg-emerald-50 text-[#148F77] border border-emerald-200 text-[0.75rem] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#148F77] animate-pulse"></span> Available
                      </span>
                    ) : (
                      <span className="bg-rose-50 text-[#E74C3C] border border-rose-200 text-[0.75rem] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E74C3C]"></span> Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Medicine Name */}
                  <h3 className="text-[1.25rem] font-bold text-gray-900 mb-4 tracking-tight">
                    {med.medicineName}
                  </h3>

                  {/* Pharmacy Details */}
                  {med.pharmacy ? (
                    <div className="space-y-2 border-t border-gray-50 pt-4 mb-4" id={`pharmacy_info_${med._id}`}>
                      <h4 className="text-[0.75rem] uppercase tracking-wider text-gray-400 font-bold">Sold & Managed By</h4>
                      <div className="text-[0.875rem] font-bold text-[#1A5276]">
                        {med.pharmacy.shopName}
                      </div>
                      <div className="flex items-center text-[0.75rem] text-gray-500 gap-1 flex-wrap">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="truncate max-w-[150px]">{med.pharmacy.location}</span>
                        {med.distanceKm !== undefined && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded bg-teal-50 border border-teal-200 text-[#148F77] text-[0.65rem] font-extrabold shrink-0">
                            {med.distanceKm < 1 ? `${Math.round(med.distanceKm * 1000)}m` : `${med.distanceKm} km`} away
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-[0.75rem] text-gray-500 gap-1">
                        <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <a href={`tel:${med.pharmacy.phone}`} className="hover:underline font-medium text-gray-600">
                          {med.pharmacy.phone}
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[0.75rem] text-rose-500 italic py-2">
                      Pharmacy information unavailable.
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4 mt-2 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-[0.75rem] text-gray-400">
                    <span>Last verification:</span>
                    <span className="font-semibold text-gray-600">
                      {new Date(med.lastUpdated).toLocaleDateString("en-NP", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>

                  {/* Mismatch Alert Box */}
                  {med.reportCount > 0 && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5 flex items-start gap-2 text-[0.75rem] text-amber-800">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">{med.reportCount}</span> mismatch reports received. The pharmacy has been notified to check stock.
                      </div>
                    </div>
                  )}

                  {/* Report Mismatch Button */}
                  <button
                    onClick={() => setSelectedMed(med)}
                    className="w-full py-2.5 border border-amber-300 text-amber-800 hover:bg-amber-50 text-[0.75rem] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    id={`btn_report_${med._id}`}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Report Mismatch
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Confirmation Modal for Reporting Mismatch */}
      <AnimatePresence>
        {selectedMed && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 p-6 relative"
              id="report_modal"
            >
              <h3 className="text-[1.125rem] font-bold text-gray-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" /> Report Stock Mismatch
              </h3>
              <p className="text-[0.875rem] text-gray-600 mb-4">
                Are you currently at <span className="font-bold text-gray-800">{selectedMed.pharmacy?.shopName}</span> or spoke to them, and found that <span className="font-bold text-gray-900">{selectedMed.medicineName}</span> is actually <span className="font-bold underline">{selectedMed.status === "Available" ? "Out of Stock" : "Available"}</span>?
              </p>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 mb-6 text-[0.75rem] text-amber-850">
                <p className="font-bold mb-1">Anti-Spam (Neighbor Sabotage Control):</p>
                To prevent competitors from marking medicines as Out of Stock, public reporting does NOT instantly change the status. It notifies the owner with an alert. If 3 or more users file reports, a critical verification banner appears on the pharmacy's dashboard.
              </div>

              {reportSuccess ? (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl p-3 text-[0.875rem] font-semibold flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-[#148F77]" />
                  {reportSuccess}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 justify-end w-full">
                  <button
                    onClick={() => setSelectedMed(null)}
                    className="w-full sm:w-auto px-4 py-2.5 text-[0.875rem] font-semibold text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer"
                    disabled={reporting}
                    id="btn_cancel_report"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReportMismatch}
                    className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg text-[0.875rem] font-bold cursor-pointer flex items-center justify-center gap-1.5"
                    disabled={reporting}
                    id="btn_confirm_report"
                  >
                    {reporting ? "Filing Report..." : "Confirm Mismatch"}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
