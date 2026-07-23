import { Link } from 'react-router-dom'

export default function ClientFooter() {
  return (
    <footer className="bg-[#071338] text-[#F1F5F9] mt-0 border-t-4 border-[#E31837]">
      <div className="max-w-[1280px] mx-auto px-lg py-xxl grid grid-cols-1 md:grid-cols-4 gap-xl">
        {/* Brand */}
        <div className="md:col-span-2 space-y-md">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 rounded-xl bg-[#0A1F6E] flex items-center justify-center relative border border-white/20 shadow-md">
              <span className="material-symbols-outlined text-white text-[22px]">science</span>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#E31837] rounded-full border-2 border-[#071338]"></span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[19px] text-white leading-tight">
                Medipath<span className="text-[#E31837]"> Diagnostics</span>
              </span>
              <span className="text-[11px] text-blue-200/80 font-medium leading-none tracking-tight">
                Redcliffe Labs Authorised Collection Center
              </span>
            </div>
          </div>
          <p className="text-body-md text-slate-300 max-w-sm leading-relaxed">
            Bringing national Redcliffe Labs diagnostic precision and comprehensive pathology services to Khati Baba, Jhansi under Shivam Sharma.
          </p>
          <div className="inline-flex items-center gap-xs px-md py-xs bg-white/10 rounded-full text-xs text-slate-200 border border-white/15 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold">Mon–Sun | 7:00 AM – 8:00 PM</span>
          </div>
        </div>

        {/* Core Services */}
        <div>
          <h4 className="font-label-md text-label-md uppercase tracking-wider text-[#E31837] font-bold mb-md">Services</h4>
          <ul className="space-y-sm">
            {[
              { label: 'Individual Diagnostic Tests', to: '/tests' },
              { label: 'Health Packages (BharatFit)', to: '/packages' },
              { label: 'Hospital & Clinic Test Booking', to: '/hospitals' },
              { label: 'Free Home Collection', to: '/booking' },
            ].map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="text-body-md text-slate-300 hover:text-white hover:translate-x-1 transition-all flex items-center gap-xs">
                  <span className="text-[#E31837] font-bold text-[12px]">›</span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Links */}
        <div>
          <h4 className="font-label-md text-label-md uppercase tracking-wider text-[#E31837] font-bold mb-md">Jhansi Lab Contact</h4>
          <ul className="space-y-sm">
            <li className="flex items-start gap-sm text-body-md text-slate-300">
              <span className="material-symbols-outlined text-[20px] text-[#E31837] shrink-0 mt-0.5">location_on</span>
              <span>In Front of Kalyan Petrol Pump, Khati Baba, Jhansi, UP - 284003</span>
            </li>
            <li className="pt-xs">
              <a href="tel:+918299487062" className="flex items-center gap-sm text-body-md text-slate-200 hover:text-white font-semibold transition-colors">
                <div className="w-6 h-6 rounded-full bg-[#E31837]/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[14px] text-[#E31837]">call</span>
                </div>
                +91 8299487062
              </a>
            </li>
            <li className="flex items-center gap-sm text-body-md text-slate-300 pt-xs">
              <span className="material-symbols-outlined text-[18px] text-[#E31837] shrink-0">schedule</span>
              <span>Mon-Sun: 7:00 AM – 8:00 PM</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Map Strip Section */}
      <div className="border-t border-white/10 px-lg py-md max-w-[1280px] mx-auto">
        <div className="flex items-center justify-between mb-xs">
          <p className="text-label-sm uppercase text-slate-300 font-semibold tracking-wider flex items-center gap-xs">
            <span className="material-symbols-outlined text-[16px] text-[#E31837]">map</span>
            Khati Baba Collection Center Location Map
          </p>
          <span className="text-xs text-blue-200/70">Jhansi, UP</span>
        </div>
        <div className="w-full h-44 rounded-xl overflow-hidden shadow-lg border border-white/15">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14411.391672322316!2d78.5422896!3d25.443315!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397776d4586d6349%3A0x6b447833504fb4!2sKhati%20Baba%2C%20Jhansi%2C%20Uttar%20Pradesh%20284003!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Medipath Diagnostics Khati Baba Location"
          ></iframe>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 px-lg py-md max-w-[1280px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-sm">
        <p className="text-label-sm text-slate-400">© 2026 Medipath Diagnostics (Redcliffe Labs Authorised Center). All rights reserved.</p>
        <div className="flex gap-md">
          <Link to="/contact" className="text-label-sm text-slate-400 hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/contact" className="text-label-sm text-slate-400 hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  )
}
