import React from "react";
import { ShieldCheck, Eye, Lock, FileText, Ban } from "lucide-react";

export default function Privacy() {
  return (
    <div className="bg-[#F0F4F8] min-h-screen py-12 px-4 sm:px-6 lg:px-8" id="privacy_page">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm space-y-8">
        
        {/* Title */}
        <div className="border-b border-gray-100 pb-6 space-y-2">
          <span className="bg-teal-50 text-[#148F77] border border-teal-200 text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> Effective Date: June 2026
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Privacy Policy</h1>
          <p className="text-gray-500 text-xs">
            Ausadhi is dedicated to protecting user data and verifying medicinal tracking in a secure manner.
          </p>
        </div>

        {/* 1. Restricted Substances Clause (HIGHLIGHTED) */}
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 flex items-start gap-4">
          <Ban className="h-6 w-6 text-[#E74C3C] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Restricted Medicines & Regulations Clause</h2>
            <p className="text-gray-600 text-xs leading-relaxed font-semibold">
              Drugs or highly restricted medicines (including narcotics, psychotropic substances, and specialized prescription-only therapeutics) are not allowed to be added on our platform. We reserve the right to audit and instantly remove any medicine listings that violate Nepal's pharmaceutical regulations or Department of Drug Administration guidelines.
            </p>
          </div>
        </div>

        {/* 2. Content Sections */}
        <div className="space-y-6 text-xs sm:text-sm text-gray-650 leading-relaxed">
          
          <div className="space-y-2">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Eye className="h-4.5 w-4.5 text-[#1A5276]" /> 1. Information We Collect
            </h3>
            <p>
              We collect information necessary to deliver accurate medical availability services. This includes:
            </p>
            <ul className="list-disc list-inside pl-4 space-y-1 text-gray-500">
              <li><strong className="text-gray-700">Account Details:</strong> For pharmacy owners (shop name, owner name, mobile number, physical address, password hash).</li>
              <li><strong className="text-gray-700">Geographic Location:</strong> Latitude and longitude coordinates (via browser Geolocation API) to sort closest pharmacies.</li>
              <li><strong className="text-gray-700">Search History & Interaction:</strong> Term queries and stock mismatch reports submitted by the public.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-[#1A5276]" /> 2. How We Use Information
            </h3>
            <p>
              We use gathered metrics to enhance user search queries, compute distances to pharmacies, verify stock data consistency, notify owners of mismatch reports, and prevent anti-competitive automated abuse (spam). We do not sell user data to pharmaceutical companies or advertisers.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Lock className="h-4.5 w-4.5 text-[#1A5276]" /> 3. Cookies and Tracking
            </h3>
            <p>
              We utilize cookies or local storage tokens to preserve logged-in sessions for authenticated pharmacy owners and administrators. These files contain JWT tokens and are kept strictly local. We do not use third-party behavioral cross-tracking pixels.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-[#1A5276]" /> 4. Data Security Measures
            </h3>
            <p>
              We enforce SSL/TLS encryption across all client-server communication channels, hash passwords utilizing industry-standard bcrypt functions, and manage access logs to secure pharmacy information databases.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-[#1A5276]" /> 5. User Rights (Access, Modify, Delete)
            </h3>
            <p>
              Both public searchers and pharmacy owners retain absolute control over their profiles. Owners can request complete deletion of their account and all inventory lists at any time by contacting our support desk. If you believe incorrect location data is listed under your store name, please update your dashboard coordinate settings or contact us directly.
            </p>
          </div>

        </div>

        {/* Footer Note */}
        <div className="border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
          Ausadhi Platform Governance Team &copy; 2026. Kathmandu, Nepal.
        </div>

      </div>
    </div>
  );
}
