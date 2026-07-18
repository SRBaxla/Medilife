import { Link } from 'react-router-dom'

export default function ClientFooter() {
  return (
    <footer className="bg-inverse-surface text-inverse-on-surface mt-0">
      <div className="max-w-[1280px] mx-auto px-lg py-xxl grid grid-cols-1 md:grid-cols-4 gap-xl">
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-sm mb-md">
            <div className="w-9 h-9 rounded-xl bg-primary-fixed-dim flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[20px]">science</span>
            </div>
            <span className="font-bold text-[18px] text-primary-fixed-dim">Medilife Pathology</span>
          </div>
          <p className="text-body-md text-inverse-on-surface/70 max-w-xs mb-lg">
            World-class clinical diagnostics with the warmth of a local clinic. Accurate reports, fast results, trusted care.
          </p>
          <div className="flex gap-sm">
            {['facebook', 'twitter', 'instagram'].map((s) => (
              <button key={s} className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary-fixed-dim/20 flex items-center justify-center transition-colors text-inverse-on-surface/70 hover:text-primary-fixed-dim">
                <span className="material-symbols-outlined text-[18px]">link</span>
              </button>
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <h4 className="font-label-md text-label-md uppercase tracking-wider text-inverse-on-surface/50 mb-md">Services</h4>
          <ul className="space-y-sm">
            {['Blood Tests', 'Health Packages', 'Home Collection', 'Corporate Health', 'Senior Care'].map((item) => (
              <li key={item}>
                <Link to="/tests" className="text-body-md text-inverse-on-surface/70 hover:text-primary-fixed-dim transition-colors">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-label-md text-label-md uppercase tracking-wider text-inverse-on-surface/50 mb-md">Contact</h4>
          <ul className="space-y-sm">
            {[
              { icon: 'location_on', text: '123 Clinic Road, Medical District' },
              { icon: 'phone', text: '+91 98765 43210' },
              { icon: 'mail', text: 'care@medilife.in' },
              { icon: 'schedule', text: 'Mon–Sat: 7AM – 9PM' },
            ].map(({ icon, text }) => (
              <li key={text} className="flex items-start gap-sm text-body-md text-inverse-on-surface/70">
                <span className="material-symbols-outlined text-[16px] mt-0.5 text-primary-fixed-dim">{icon}</span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 px-lg py-md max-w-[1280px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-sm">
        <p className="text-label-sm text-inverse-on-surface/40">© 2024 Medilife Pathology. All rights reserved.</p>
        <div className="flex gap-md">
          <Link to="/contact" className="text-label-sm text-inverse-on-surface/50 hover:text-primary-fixed-dim transition-colors">Privacy Policy</Link>
          <Link to="/contact" className="text-label-sm text-inverse-on-surface/50 hover:text-primary-fixed-dim transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  )
}
