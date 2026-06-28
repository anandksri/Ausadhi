import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Linkedin, Send, Sparkles, ShieldCheck } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    console.log("Mock Subscription Email:", email);
    setSubscribed(true);
    setEmail("");
    setTimeout(() => {
      setSubscribed(false);
    }, 4000);
  };

  return (
    <footer className="bg-[#1A5276] text-white pt-16 pb-8 border-t border-white/10" id="global_footer">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
        
        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-white/10 pb-12 mb-8">
          
          {/* Section 1: Brand & Socials */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-extrabold tracking-tight text-white">
                Ausadhi<span className="text-teal-400">.</span>
              </span>
            </Link>
            <p className="text-white/70 text-xs leading-relaxed max-w-sm">
              Ausadhi is a community-driven medicine tracker in Nepal. We help individuals locate vital drugs and coordinates near them instantly during emergencies.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <a href="https://facebook.com/ausadhi" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white hover:scale-115 transition-all" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com/ausadhi" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white hover:scale-115 transition-all" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://instagram.com/ausadhi" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white hover:scale-115 transition-all" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://youtube.com/ausadhi" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white hover:scale-115 transition-all" aria-label="YouTube">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com/company/ausadhi" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white hover:scale-115 transition-all" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Section 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2.5 text-xs text-white/80">
              <li>
                <Link to="/" className="hover:text-white hover:underline transition-colors">Home Page</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white hover:underline transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white hover:underline transition-colors">Contact Support</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white hover:underline transition-colors">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          {/* Section 3: Support Section */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Support desk</h3>
            <div className="space-y-2.5 text-xs text-white/80">
              <p>
                <strong className="text-white block font-medium">Email Support:</strong>
                <a href="mailto:support@ausadhi.com" className="hover:underline text-teal-300">support@ausadhi.com</a>
              </p>
              <p>
                <strong className="text-white block font-medium">Call Support:</strong>
                <a href="tel:+97714522900" className="hover:underline text-teal-300">+977-1-4522900</a>
              </p>
              <p>
                <strong className="text-white block font-medium">Working Hours:</strong>
                Mon-Sat, 9:00 AM - 6:00 PM (NST)
              </p>
            </div>
          </div>

          {/* Section 4: Newsletter */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Newsletter</h3>
            <p className="text-white/70 text-xs leading-relaxed">
              Get notified of newly registered pharmacies and health bulletins.
            </p>
            
            {subscribed ? (
              <div className="text-[#148F77] bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 text-[0.75rem] font-bold text-center flex items-center justify-center gap-1.5 animate-pulse">
                <ShieldCheck className="h-4 w-4" /> Subscribed successfully!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2" id="footer_newsletter_form">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email..."
                  className="bg-white/10 text-white placeholder-white/50 text-xs px-3 py-2 rounded-xl border border-white/10 outline-none focus:ring-1 focus:ring-teal-400 w-full"
                />
                <button
                  type="submit"
                  className="bg-[#148F77] hover:bg-[#117a65] text-white p-2 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                  aria-label="Subscribe"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-white/50 space-y-4 sm:space-y-0" id="copyright_container">
          <p>&copy; 2026 Ausadhi. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made in <span className="text-red-400 font-bold">♥</span> Nepal
          </p>
        </div>

      </div>
    </footer>
  );
}
