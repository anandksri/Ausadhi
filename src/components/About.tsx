import React from "react";
import { Sparkles, Users, Award, ShieldAlert } from "lucide-react";

export default function About() {
  const team = [
    { name: "Dr. Aayush Shrestha", role: "Co-Founder & Health Informatics Lead", desc: "A medical tech visionary committed to digitizing Nepal's healthcare supply chain." },
    { name: "Bipina Dahal", role: "Head of Pharmacy Relations", desc: "Coordinates with local pharmacy networks across Kathmandu, Lalitpur, and Pokhara." },
    { name: "Suresh Chaudhary", role: "Lead Systems Architect", desc: "Builds and maintains the secure distributed ledger and low-latency geospatial services." }
  ];

  const stats = [
    { value: "250+", label: "Registered Pharmacies", desc: "Across major urban centers" },
    { value: "7,500+", label: "Medicines Tracked", desc: "Daily inventory updates" },
    { value: "15,000+", label: "Successful Searches", desc: "Patients connected to stores" },
    { value: "98.2%", label: "Data Accuracy", desc: "With community verifications" }
  ];

  return (
    <div className="bg-[#F0F4F8] min-h-screen py-12 px-4 sm:px-6 lg:px-8" id="about_page">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="bg-[#1A5276]/10 text-[#1A5276] text-xs uppercase tracking-widest font-extrabold px-3 py-1 rounded-full">
            Our Mission
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Connecting Patients with Pharmacies for <span className="text-[#148F77]">Faster Medicine Access</span>
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Ausadhi was founded to bridge the critical information gap in Nepal's pharmaceutical access. By providing real-time inventory visibility, we save precious hours during medical emergencies.
          </p>
        </div>

        {/* Problem Statement Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8">
          <div className="bg-amber-50 text-amber-600 p-5 rounded-2xl shrink-0">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">The Medicine Availability Crisis in Nepal</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              In Nepal, patients and their family members frequently spend hours traveling from one pharmacy to another, or calling multiple locations in search of prescribed medicines. This delay can be life-threatening during emergencies. Supply chain fragmentation and lack of digital records leave patients in the dark. Ausadhi solves this by letting pharmacies upload their stock and letting the public query it instantly by location.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-center text-gray-900">How It Works in 3 Simple Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-2xl border border-gray-150/60 shadow-sm hover:shadow-md transition-shadow relative">
              <span className="absolute -top-3 left-6 bg-[#1A5276] text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center">1</span>
              <h3 className="font-bold text-gray-900 mt-2 mb-2 text-lg">Search Medicine</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                Type the name of your required drug in our search bar. You can toggle "Nearby Me" to filter by proximity.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-150/60 shadow-sm hover:shadow-md transition-shadow relative">
              <span className="absolute -top-3 left-6 bg-[#148F77] text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center">2</span>
              <h3 className="font-bold text-gray-900 mt-2 mb-2 text-lg">Verify & Connect</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                Check stock status (Available or Out of Stock), last verified time, and direct contact phone numbers.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-150/60 shadow-sm hover:shadow-md transition-shadow relative">
              <span className="absolute -top-3 left-6 bg-teal-500 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center">3</span>
              <h3 className="font-bold text-gray-900 mt-2 mb-2 text-lg">Visit or Reserve</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                Directly dial the pharmacy, navigate using the provided coordinates, and get the medicine without delays.
              </p>
            </div>
          </div>
        </div>

        {/* Impact Statistics */}
        <div className="bg-[#1A5276] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <Sparkles className="w-96 h-96 -mr-20 -mt-20 text-teal-300" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-2xl font-bold tracking-tight">Our Scale and Impact in Nepal</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-extrabold text-teal-300">{stat.value}</div>
                  <div className="text-[0.85rem] font-semibold text-white/95">{stat.label}</div>
                  <div className="text-[0.7rem] text-white/70">{stat.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <Users className="h-6 w-6 text-[#1A5276]" /> Meet Our Dedicated Team
            </h2>
            <p className="text-gray-500 text-xs leading-relaxed">
              We are a passionate team of doctors, pharmacists, and software engineers working to democratize health resources in Nepal.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-[#1A5276]/10 text-[#1A5276] flex items-center justify-center font-bold text-lg">
                    {member.name.split(" ").pop()?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">{member.name}</h4>
                    <span className="text-[#148F77] text-xs font-semibold">{member.role}</span>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed">{member.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
