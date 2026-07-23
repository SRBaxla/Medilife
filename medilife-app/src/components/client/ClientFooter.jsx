import { Link } from 'react-router-dom'

export default function ClientFooter() {
  return (
    <footer className="bg-[#071338] text-white border-t border-white/10">
      {/* Top CTA Bar */}
      <div className="border-b border-white/10 py-lg px-lg">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-md text-center md:text-left">
          <div>
            <h3 className="font-bold text-headline-sm text-white">Need Urgent Blood Tests or Health Checkup?</h3>
            <p className="text-body-md text-slate-300">Free home sample collection available across Khati Baba & Jhansi city.</p>
          </div>
          <Link to="/booking" className="btn-primary bg-[#E31837] hover:bg-red-700 text-white shrink-0">
            Book Home Collection
          </Link>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-lg py-xxl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-xl">
        {/* Brand Column */}
        <div className="space-y-md">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-clinical shrink-0">
              <span className="material-symbols-outlined text-white text-[20px]">science</span>
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
              { label: 'Individual Pathology Tests', to: '/tests' },
              { label: 'Health Packages (BharatFit)', to: '/packages' },
              { label: 'Hospital & Clinic Tie-ups', to: '/hospitals' },
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

        {/* Quick & Legal Links */}
        <div>
          <h4 className="font-label-md text-label-md uppercase tracking-wider text-[#E31837] font-bold mb-md">Quick & Legal</h4>
          <ul className="space-y-sm">
            {[
              { label: 'About Us', to: '/about' },
              { label: 'Frequently Asked Questions (FAQ)', to: '/faq' },
              { label: 'Privacy Policy', to: '/privacy-policy' },
              { label: 'Terms & Legal Disclaimer', to: '/terms' },
              { label: 'Contact Lab', to: '/contact' },
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
                +91 8299487062 (Shivam Sharma)
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
          <Link to="/faq" className="text-label-sm text-slate-400 hover:text-white transition-colors">FAQ</Link>
          <Link to="/privacy-policy" className="text-label-sm text-slate-400 hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="text-label-sm text-slate-400 hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  )
}
