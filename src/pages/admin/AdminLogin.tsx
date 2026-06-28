import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";
import { User } from "../../types";

interface AdminLoginProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(data.user, data.token);
        navigate("/admin/dashboard");
      } else {
        setError(data.error || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setError("A connection error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-white font-sans" id="admin_login_view">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <div className="bg-[#1A5276] text-white p-3 rounded-2xl shadow-lg shadow-teal-950 inline-flex">
            <Activity className="h-8 w-8 text-teal-300 animate-pulse" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-white">
          Ausadhi Admin Panel
        </h2>
        <p className="mt-2 text-center text-xs text-gray-400">
          Sign in to access platform moderation, inventory review, and pharmacy statistics.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#1E293B] py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-[#334155]">
          <form className="space-y-6" onSubmit={handleSubmit} id="admin_login_form">
            {error && (
              <div className="bg-rose-950/50 border border-rose-900 text-rose-300 rounded-xl p-3 text-xs flex items-start gap-2" id="admin_login_error">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="admin_email" className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                Admin Email
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-450" />
                </div>
                <input
                  id="admin_email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ausadhi.com"
                  className="block w-full pl-9 pr-3 py-2.5 border border-[#334155] rounded-xl bg-[#0F172A] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 text-xs"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin_password" className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-450" />
                </div>
                <input
                  id="admin_password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2.5 border border-[#334155] rounded-xl bg-[#0F172A] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 text-xs"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all disabled:opacity-50 cursor-pointer"
                id="btn_admin_login"
              >
                {isLoading ? "Verifying Credentials..." : "Authenticate Admin Session"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
