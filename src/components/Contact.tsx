import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact Form Submission Log:", { name, email, subject, message });
    
    // Show success message
    setSubmitted(true);
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");

    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  return (
    <div className="bg-[#F0F4F8] min-h-screen py-12 px-4 sm:px-6 lg:px-8" id="contact_page">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Contact Support & Relations</h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            Are you a pharmacy owner who wants to join, or a user with feedback? We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
            
            {submitted && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl p-4 mb-6 flex items-start gap-3 text-sm">
                <CheckCircle2 className="h-5 w-5 text-[#148F77] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Thank you!</span> Your message has been sent successfully. We will get back to you shortly.
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" id="contact_form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact_name" className="block text-sm font-semibold text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    id="contact_name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ram Bahadur"
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A5276] focus:bg-white text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="contact_email" className="block text-sm font-semibold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="contact_email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ram@gmail.com"
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A5276] focus:bg-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact_subject" className="block text-sm font-semibold text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  id="contact_subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Inquiry about pharmacy registration"
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A5276] focus:bg-white text-sm"
                />
              </div>

              <div>
                <label htmlFor="contact_message" className="block text-sm font-semibold text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="contact_message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we assist you?"
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A5276] focus:bg-white text-sm"
                ></textarea>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full sm:w-auto flex justify-center items-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#1A5276] hover:bg-[#154360] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1A5276] transition-all cursor-pointer"
                  id="btn_submit_contact"
                >
                  <span>Submit Message</span>
                  <Send className="ml-2 h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

          Sidebar Info & Map
          <div className="space-y-6">
            <div className="bg-[#1A5276] text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
              <h3 className="text-lg font-bold">Contact Info</h3>
              
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-teal-300 shrink-0" />
                  <div>
                    <p className="font-semibold">Central Office</p>
                    <p className="text-white/80">Durbar Marg, Kathmandu, Nepal</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-teal-300 shrink-0" />
                  <div>
                    <p className="font-semibold">Phone Support</p>
                    <a href="tel:+97714522900" className="text-teal-200 hover:underline">+977-1-4522900</a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-teal-300 shrink-0" />
                  <div>
                    <p className="font-semibold">Email Us</p>
                    <a href="mailto:support@ausadhi.com" className="text-teal-200 hover:underline">support@ausadhi.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-teal-300 shrink-0" />
                  <div>
                    <p className="font-semibold">Working Hours</p>
                    <p className="text-white/80">Mon-Sat, 9:00 AM - 6:00 PM (NST)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Map Placeholder (iframe) */}
            <div className="bg-white rounded-3xl overflow-hidden border border-gray-150 shadow-sm h-64 relative">
              <iframe
                title="Ausadhi Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m12!1m3!1d14129.805561081515!2d85.31802353341857!3d27.717208169188846!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb193ade56b46b%3A0x64cf51532439121!2sDurbar%20Marg%2C%20Kathmandu%2044600!5e0!3m2!1sen!2snp!4v1700000000000!5m2!1sen!2snp"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
              ></iframe>
            </div>
         </div>


        </div>
      </div>
    </div>
  );
}
