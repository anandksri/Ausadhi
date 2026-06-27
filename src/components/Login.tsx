import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Phone, ArrowRight, Activity, AlertCircle } from "lucide-react";
import { AuthResponse } from "../types";

interface LoginProps {
  onLoginSuccess: (response: AuthResponse) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onLoginSuccess(data);
        navigate("/dashboard");
      } else {
        setError(data.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#F0F4F8] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8" id="login_view">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <div className="bg-[#1A5276] text-white p-3 rounded-2xl shadow-md inline-flex">
            <Activity className="h-8 w-8" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Pharmacy Owner Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Manage your medicine inventory, bulk upload stock, and handle status.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit} id="login_form">
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-[#E74C3C] rounded-xl p-3 text-sm flex items-start gap-2 animate-shake" id="login_error_box">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                Registered Phone Number
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A5276] focus:bg-white text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A5276] focus:bg-white text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#1A5276] hover:bg-[#153e5a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1A5276] transition-colors disabled:opacity-50 cursor-pointer"
                id="btn_submit_login"
              >
                {isLoading ? "Signing in..." : "Sign In"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-500">Don't have a registered pharmacy?</span>{" "}
            <Link to="/register" className="text-sm font-bold text-[#1A5276] hover:underline">
              Register Here
            </Link>
          </div>

          {/* Presentation Demo Credentials */}
          <div className="mt-6 border-t border-gray-100 pt-6 text-left">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
              Presentation Demo Accounts (Click to Autofill)
            </h4>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setPhone("9851012345");
                  setPassword("password123");
                }}
                className="w-full text-left px-3 py-2 text-xs bg-[#F4F9FC] border border-sky-100 rounded-xl hover:bg-[#EBF5FB] transition-colors flex justify-between items-center text-[#1A5276]"
              >
                <div>
                  <strong className="block font-semibold">Sewa Pharmacy (Kathmandu)</strong>
                  <span className="text-gray-500 text-[10px] font-mono">Hari Sharma • 9851012345</span>
                </div>
                <span className="text-[9px] bg-white px-2 py-0.5 rounded-full border border-sky-200 font-bold">Autofill</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setPhone("9841234567");
                  setPassword("password123");
                }}
                className="w-full text-left px-3 py-2 text-xs bg-[#F4FCF7] border border-emerald-100 rounded-xl hover:bg-[#EBFBF0] transition-colors flex justify-between items-center text-emerald-800"
              >
                <div>
                  <strong className="block font-semibold">Pathibhara Pharma (Dharan)</strong>
                  <span className="text-emerald-600 text-[10px] font-mono">Sita Dahal • 9841234567</span>
                </div>
                <span className="text-[9px] bg-white px-2 py-0.5 rounded-full border border-emerald-200 font-bold text-emerald-700">Autofill</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPhone("9801234567");
                  setPassword("password123");
                }}
                className="w-full text-left px-3 py-2 text-xs bg-[#FAF5FF] border border-purple-100 rounded-xl hover:bg-[#F3E8FF] transition-colors flex justify-between items-center text-purple-800"
              >
                <div>
                  <strong className="block font-semibold">Annapurna Medical (Pokhara)</strong>
                  <span className="text-purple-600 text-[10px] font-mono">Kiran Gurung • 9801234567</span>
                </div>
                <span className="text-[9px] bg-white px-2 py-0.5 rounded-full border border-purple-200 font-bold text-purple-700">Autofill</span>
              </button>
              
              <p className="text-[10px] text-gray-400 text-center mt-1">
                Demo Password for all: <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-600 font-bold">password123</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
