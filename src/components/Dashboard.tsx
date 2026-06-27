import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Building, User, MapPin, Phone, Download, Upload, 
  PlusCircle, AlertTriangle, CheckCircle, RefreshCw, 
  Trash2, Search, Filter, ShieldAlert, ToggleLeft, ToggleRight, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import * as XLSX from "xlsx";
import { Medicine } from "../types";

export default function Dashboard() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual entry modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMedName, setNewMedName] = useState("");
  const [newMedCategory, setNewMedCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userJson = localStorage.getItem("user");
  const owner = userJson ? JSON.parse(userJson) : null;

  // Protect route
  useEffect(() => {
    if (!token || !owner) {
      localStorage.clear();
      navigate("/login");
    } else {
      fetchInventory();
    }
  }, [token]);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/medicines/my-inventory", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMedicines(data.results || []);
      } else {
        if (response.status === 401 || response.status === 403) {
          localStorage.clear();
          navigate("/login");
        } else {
          setError("Failed to fetch inventory.");
        }
      }
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setError("Network error while loading inventory.");
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Download dynamic Excel template via client-side SheetJS
  const handleDownloadTemplate = () => {
    const data = [
      { medicineName: "Paracetamol 500mg", category: "Analgesic" },
      { medicineName: "Amoxicillin 250mg", category: "Antibiotic" },
      { medicineName: "Cetirizine 10mg", category: "Antihistamine" },
      { medicineName: "Metformin 500mg", category: "Antidiabetic" },
      { medicineName: "", category: "Antibiotic (this row will be skipped)" }
    ];
    // Create spreadsheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Medicine_Stock");
    
    // Write and download
    XLSX.writeFile(workbook, "Ausadhi_Stock_Template.xlsx");
  };

  // 2. Handle File upload selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setUploadMessage(null);
    }
  };

  // 3. Import Stock bulk action
  const handleImportStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/medicines/bulk-upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        if (data.skippedCount > 0) {
          setUploadMessage({
            type: "warning",
            text: `${data.addedCount} medicines added successfully. ${data.skippedCount} rows skipped due to missing medicine names.`
          });
        } else {
          setUploadMessage({
            type: "success",
            text: `${data.addedCount} medicines added successfully.`
          });
        }
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchInventory(); // Refresh the list
      } else {
        setUploadMessage({
          type: "error",
          text: data.error || "Failed to process stock upload."
        });
      }
    } catch (err) {
      console.error("Bulk upload error:", err);
      setUploadMessage({
        type: "error",
        text: "Network error occurred during upload."
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 4. Toggle Available / Out of Stock
  const handleToggleStatus = async (medicineId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Available" ? "Out_of_Stock" : "Available";

    // Optimistically update frontend state
    setMedicines(prev => prev.map(m => m._id === medicineId ? { ...m, status: nextStatus as any, lastUpdated: new Date() } : m));

    try {
      const response = await fetch(`/api/medicines/${medicineId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (!response.ok) {
        // Revert on failure
        setMedicines(prev => prev.map(m => m._id === medicineId ? { ...m, status: currentStatus as any } : m));
        const data = await response.json();
        alert(data.error || "Failed to update medicine status.");
      }
    } catch (err) {
      console.error("Error toggling status:", err);
      // Revert on error
      setMedicines(prev => prev.map(m => m._id === medicineId ? { ...m, status: currentStatus as any } : m));
      alert("Network error. Could not save status update.");
    }
  };

  // 5. Submit single medicine manually
  const handleAddSingleMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!newMedName) {
      setModalError("Medicine name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/medicines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          medicineName: newMedName,
          category: newMedCategory || "General"
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Prepend to medicine list
        setMedicines(prev => [data.medicine, ...prev]);
        setIsModalOpen(false);
        setNewMedName("");
        setNewMedCategory("");
      } else {
        setModalError(data.error || "Failed to add medicine.");
      }
    } catch (err) {
      console.error("Add single error:", err);
      setModalError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filters logic
  const filteredMedicines = medicines.filter(m => {
    const matchesSearch = m.medicineName.toLowerCase().includes(searchFilter.toLowerCase()) || 
                          (m.category && m.category.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchesCategory = categoryFilter === "All" || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Extract distinct categories for filter dropdown
  const categories = ["All", ...Array.from(new Set(medicines.map(m => m.category || "General"))).filter(Boolean)];

  return (
    <div className="min-h-screen bg-[#F0F4F8] pb-16" id="dashboard_view">
      {/* Header Info Area */}
      {owner && (
        <div className="bg-white border-b border-gray-100 shadow-sm" id="owner_header_section">
          <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#148F77] bg-teal-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  Verified Pharmacy Owner Dashboard
                </span>
                <h1 className="text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">
                  {owner.shopName}
                </h1>
                <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                  <User className="h-4 w-4" /> Managed by <span className="font-semibold text-gray-700">{owner.ownerName}</span>
                </p>
              </div>

              {/* Quick Contacts Display */}
              <div className="flex flex-wrap gap-4 text-xs text-gray-600 bg-gray-50/50 p-4 rounded-xl border border-gray-100" id="pharmacy_meta">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-[#1A5276]" />
                  <div>
                    <p className="text-gray-400 font-medium">Location</p>
                    <p className="font-bold text-gray-800">{owner.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 border-l border-gray-200 pl-4">
                  <Phone className="h-4 w-4 text-[#1A5276]" />
                  <div>
                    <p className="text-gray-400 font-medium">Phone</p>
                    <p className="font-bold text-gray-800">{owner.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8" id="dashboard_grid">
        
        {/* LEFT COLUMN: Bulk Upload and Instructions */}
        <div className="lg:col-span-1 space-y-6">
          {/* BULK UPLOAD CARD */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between" id="bulk_upload_card">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Upload className="h-5 w-5 text-[#1A5276]" /> Bulk Stock Management
              </h2>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Add hundreds of medicines to your pharmacy instantly. Download our spreadsheet template, fill in your stock, and import.
              </p>

              {/* STEP 1: DOWNLOAD TEMPLATE */}
              <div className="mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                <p className="text-xs font-bold text-blue-900 mb-2">Step 1: Get Template</p>
                <button
                  onClick={handleDownloadTemplate}
                  className="w-full bg-[#1A5276] hover:bg-[#153e5a] text-white py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                  id="btn_download_template"
                >
                  <Download className="h-4 w-4" />
                  Download Excel Template
                </button>
              </div>

              {/* STEP 2: UPLOAD STOCK */}
              <div className="p-4 bg-teal-50/30 rounded-xl border border-teal-100/50">
                <p className="text-xs font-bold text-teal-900 mb-2">Step 2: Upload Completed File</p>
                
                <form onSubmit={handleImportStock} className="space-y-3">
                  <div className="border border-dashed border-gray-200 hover:border-[#148F77] rounded-lg p-3 text-center transition-colors relative cursor-pointer bg-white">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".xlsx, .xls, .csv"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <p className="text-xs text-gray-600 font-semibold truncate">
                      {selectedFile ? selectedFile.name : "Click to select Excel/CSV File"}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Supports .xlsx, .xls, .csv</p>
                  </div>

                  <button
                    type="submit"
                    disabled={!selectedFile || isUploading}
                    className="w-full bg-[#148F77] hover:bg-[#117a65] disabled:bg-gray-200 disabled:text-gray-400 text-white py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                    id="btn_import_stock"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Import Stock Now
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* RESPONSE NOTIFICATION BOX */}
            <AnimatePresence>
              {uploadMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-4 p-3 rounded-xl text-xs flex items-start gap-2 border ${
                    uploadMessage.type === "success"
                      ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                      : uploadMessage.type === "warning"
                      ? "bg-amber-50 border-amber-100 text-amber-800"
                      : "bg-rose-50 border-rose-100 text-[#E74C3C]"
                  }`}
                  id="upload_message_alert"
                >
                  {uploadMessage.type === "success" && <CheckCircle className="h-4.5 w-4.5 shrink-0 text-[#148F77]" />}
                  {uploadMessage.type === "warning" && <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-amber-600" />}
                  {uploadMessage.type === "error" && <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-[#E74C3C]" />}
                  <span className="font-medium leading-normal">{uploadMessage.text}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* MISMATCH WARNING INFO BOX */}
          <div className="bg-amber-50 border border-amber-150 rounded-2xl p-6" id="mismatch_info_box">
            <h3 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-600" /> Public Mismatch Reports
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              If public users search for a medicine and find it is actually out of stock (or vice versa), they can flag it. 
              <br /><br />
              Any medicine in your list with <span className="font-bold">3 or more reports</span> will display a prominent <span className="bg-rose-100 px-1 py-0.5 rounded text-rose-700 font-semibold">RED ALERT</span>. 
              Only you have the authority to toggle the status and clear reports.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Table of Inventory */}
        <div className="lg:col-span-2 space-y-4" id="inventory_management_section">
          
          {/* SEARCH & ADD TOOLBAR */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-1 flex-col sm:flex-row gap-3">
              {/* Search filter */}
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </span>
                <input
                  type="text"
                  placeholder="Search my stock..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1A5276] focus:bg-white"
                />
              </div>

              {/* Category selector filter */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-3.5 w-3.5 text-gray-400" />
                </span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="block w-full pl-8 pr-8 py-2 border border-gray-200 rounded-xl bg-gray-50 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1A5276] focus:bg-white appearance-none cursor-pointer font-semibold"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Add single manual entry button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#148F77] hover:bg-[#117a65] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              id="btn_add_manual"
            >
              <PlusCircle className="h-4 w-4" />
              Add Medicine
            </button>
          </div>

          {/* TABLE CONTAINER */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" id="inventory_table_card">
            {isLoading ? (
              <div className="py-20 text-center text-gray-400" id="loading_inventory_spinner">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-[#1A5276]" />
                <p className="text-xs">Loading inventory stock...</p>
              </div>
            ) : error ? (
              <div className="py-16 text-center text-rose-500 text-xs" id="error_inventory_banner">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p>{error}</p>
                <button onClick={fetchInventory} className="mt-2 text-[#1A5276] font-bold hover:underline">
                  Retry Loading
                </button>
              </div>
            ) : filteredMedicines.length === 0 ? (
              <div className="py-20 text-center text-gray-400" id="empty_inventory_banner">
                <Building className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-bold text-gray-700">No medicines in your inventory</p>
                <p className="text-xs text-gray-400 mt-1">Start by bulk-uploading an Excel list or adding manually.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Medicine Name
                      </th>
                      <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Reports Mismatch
                      </th>
                      <th scope="col" className="px-6 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-36">
                        Stock Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {filteredMedicines.map((med) => {
                      const hasHighReports = med.reportCount >= 3;
                      return (
                        <tr 
                          key={med._id} 
                          className={`transition-colors ${
                            hasHighReports ? "bg-rose-50/50 hover:bg-rose-50" : "hover:bg-gray-50/40"
                          }`}
                          id={`dashboard_medicine_row_${med._id}`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900">{med.medicineName}</span>
                              <span className="text-[10px] text-gray-400 mt-0.5">
                                Updated: {new Date(med.lastUpdated).toLocaleDateString("en-NP", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {med.category || "General"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {med.reportCount > 0 ? (
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                hasHighReports 
                                  ? "bg-rose-100 text-[#E74C3C] border border-rose-200 animate-pulse" 
                                  : "bg-amber-100 text-amber-800"
                              }`}>
                                <AlertTriangle className="h-3 w-3 shrink-0" />
                                {med.reportCount} {med.reportCount === 1 ? "report" : "reports"}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">0 reports</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => handleToggleStatus(med._id, med.status)}
                              className="focus:outline-none transition-all cursor-pointer inline-flex"
                              title="Toggle availability status"
                              id={`status_toggle_btn_${med._id}`}
                            >
                              {med.status === "Available" ? (
                                <div className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100/80 text-[#148F77] border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold shadow-xs">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#148F77]"></span> Available
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100/80 text-[#E74C3C] border border-rose-200 px-3 py-1 rounded-full text-xs font-bold shadow-xs">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#E74C3C]"></span> Out of Stock
                                </div>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* SINGLE MEDICINE MANUAL ENTRY MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 relative"
              id="add_medicine_modal"
            >
              {/* Modal header */}
              <div className="bg-[#1A5276] text-white px-6 py-4 flex items-center justify-between">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" /> Add New Medicine Manually
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal content */}
              <form onSubmit={handleAddSingleMedicine} className="p-6 space-y-4">
                {modalError && (
                  <div className="bg-rose-50 border border-rose-100 text-[#E74C3C] p-3 rounded-xl text-xs flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="h-4 w-4" /> {modalError}
                  </div>
                )}

                <div>
                  <label htmlFor="modal_medicine_name" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Medicine Name *
                  </label>
                  <input
                    id="modal_medicine_name"
                    type="text"
                    required
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    placeholder="e.g., Pantocid 40mg"
                    className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1A5276] focus:bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="modal_medicine_category" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Category (Optional)
                  </label>
                  <input
                    id="modal_medicine_category"
                    type="text"
                    value={newMedCategory}
                    onChange={(e) => setNewMedCategory(e.target.value)}
                    placeholder="e.g., Antacid, Antibiotic"
                    className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1A5276] focus:bg-white"
                  />
                </div>

                <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-100 mt-6 w-full">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full sm:w-auto px-4 py-2 text-[0.875rem] font-semibold text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-[#148F77] hover:bg-[#117a65] disabled:bg-gray-200 text-white px-5 py-2 rounded-lg text-[0.875rem] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {isSubmitting ? "Adding..." : "Add to Stock"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
