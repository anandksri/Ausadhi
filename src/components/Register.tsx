import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building, User, Phone, MapPin, Lock, ArrowRight, Activity, AlertCircle } from "lucide-react";
import { AuthResponse } from "../types";

interface RegisterProps {
  onRegisterSuccess: (response: AuthResponse) => void;
}

export default function Register({ onRegisterSuccess }: RegisterProps) {
  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!shopName || !ownerName || !phone || !location || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (phone.length < 10) {
      setError("Please enter a valid phone number (at least 10 digits).");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopName, ownerName, phone, location, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onRegisterSuccess(data);
        navigate("/dashboard");
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Network error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] bg-[#F0F4F8] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8" id="register_view">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <div className="bg-[#1A5276] text-white p-3 rounded-2xl shadow-md inline-flex">
            <Activity className="h-8 w-8" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Register Pharmacy
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Join Nepal's "Ausadhi" Network to let the public view your active stock.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-5" onSubmit={handleSubmit} id="register_form">
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-[#E74C3C] rounded-xl p-3 text-sm flex items-start gap-2 animate-shake" id="register_error_box">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="shopName" className="block text-sm font-semibold text-gray-700">
                  Pharmacy/Shop Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-4.5 w-4.5 text-gray-400" />
                  </div>
                  <input
                    id="shopName"
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="Sewa Pharma"
                    className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A5276] focus:bg-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ownerName" className="block text-sm font-semibold text-gray-700">
                  Owner/Contact Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4.5 w-4.5 text-gray-400" />
                  </div>
                  <input
                    id="ownerName"
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Hari Prasad"
                    className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A5276] focus:bg-white text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                  Mobile / Phone Number
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4.5 w-4.5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A5276] focus:bg-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-gray-700">
                  Location (Town, City)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4.5 w-4.5 text-gray-400" />
                  </div>
                  <input
                    id="location"
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="New Road, Pokhara"
                    className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A5276] focus:bg-white text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Create Secure Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A5276] focus:bg-white text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#148F77] hover:bg-[#117a65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#148F77] transition-all disabled:opacity-50 cursor-pointer"
                id="btn_submit_register"
              >
                {isLoading ? "Creating Pharmacy Account..." : "Register Pharmacy Account"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-500">Already registered?</span>{" "}
            <Link to="/login" className="text-sm font-bold text-[#1A5276] hover:underline">
              Owner Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
