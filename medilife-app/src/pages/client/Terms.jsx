import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import PageTransition from '../../components/common/PageTransition'

export default function Terms() {
  return (
    <PageTransition>
      {/* Header */}
      <div className="bg-primary pt-24 pb-xl sm:py-xxl px-md sm:px-lg text-on-primary">
        <div className="max-w-[1280px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="inline-flex items-center gap-xs px-md py-xs bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider mb-sm">
              <span className="material-symbols-outlined text-[16px] text-[#E31837]">gavel</span>
              <span>Terms of Service & Legal Disclaimer</span>
            </div>
            <h1 className="text-[28px] sm:text-display-lg-mobile font-bold mb-sm">Terms & Conditions</h1>
            <p className="text-body-md sm:text-body-lg opacity-90 max-w-xl">
              Legal agreement governing diagnostic testing services, home sample collection, and report delivery in Jhansi.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[840px] mx-auto px-md sm:px-lg py-xl sm:py-xxl space-y-xl text-on-surface">
        <div className="p-lg bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-clinical space-y-sm">
          <p className="text-body-sm text-on-surface-variant font-semibold">Effective Date: July 2026</p>
          <p className="text-body-md leading-relaxed">
            Welcome to <strong>Medipath Diagnostics</strong> (Redcliffe Labs Authorised Collection Center). By accessing our website, booking pathology tests, or requesting home sample collection, you agree to comply with the following legal terms.
          </p>
        </div>

        <div className="space-y-md">
          <h2 className="text-headline-sm font-bold text-primary flex items-center gap-xs">
            <span className="material-symbols-outlined text-[#E31837]">home_health</span>
            1. Home Sample Collection Terms
          </h2>
          <ul className="list-disc pl-lg space-y-xs text-body-md text-on-surface-variant">
            <li><strong>Service Coverage:</strong> Free home sample collection applies to qualifying diagnostic test packages across Jhansi city limits.</li>
            <li><strong>Slot Punctuality:</strong> Our phlebotomists strive to arrive within the selected 30-minute appointment window. Unforeseen traffic or weather delays will be communicated promptly.</li>
            <li><strong>Preparation Compliance:</strong> Patients must adhere to pre-test instructions (e.g. overnight fasting for Glucose/Lipid profiles). Medipath Diagnostics is not liable for skewed test values caused by non-compliance with fasting guidelines.</li>
          </ul>
        </div>

        <div className="space-y-md">
          <h2 className="text-headline-sm font-bold text-primary flex items-center gap-xs">
            <span className="material-symbols-outlined text-[#E31837]">health_and_safety</span>
            2. Medical Disclaimer
          </h2>
          <p className="text-body-md text-on-surface-variant leading-relaxed">
            Pathology reports issued by Medipath Diagnostics & Redcliffe Labs provide analytical laboratory findings intended solely for the guidance of qualified medical practitioners. Test reports do NOT constitute final medical diagnosis or prescription. Patients must consult a certified physician or MBBS doctor for clinical interpretation and treatment planning.
          </p>
        </div>

        <div className="space-y-md">
          <h2 className="text-headline-sm font-bold text-primary flex items-center gap-xs">
            <span className="material-symbols-outlined text-[#E31837]">event_busy</span>
            3. Cancellation & Refund Policy
          </h2>
          <p className="text-body-md text-on-surface-variant leading-relaxed">
            Test bookings can be cancelled or rescheduled free of charge up to 1 hour prior to the phlebotomist's dispatch. Once a sample has been drawn and dispatched to the laboratory for processing, no cancellations or refunds can be issued.
          </p>
        </div>

        <div className="space-y-md">
          <h2 className="text-headline-sm font-bold text-primary flex items-center gap-xs">
            <span className="material-symbols-outlined text-[#E31837]">verified_user</span>
            4. Franchise Ownership & Center Details
          </h2>
          <div className="p-md bg-surface-container-lowest border border-outline-variant/30 rounded-xl space-y-xs text-body-md text-on-surface-variant">
            <p><strong>Business Name:</strong> Medipath Diagnostics (Redcliffe Labs Authorised Collection Center)</p>
            <p><strong>Franchise Owner:</strong> Shivam Sharma</p>
            <p><strong>Location:</strong> In Front of Kalyan Petrol Pump, Khati Baba, Jhansi, UP - 284003</p>
            <p><strong>Contact Helpline:</strong> +91 8299487062</p>
          </div>
        </div>

        <div className="pt-md border-t border-outline-variant/30 flex justify-between items-center">
          <Link to="/privacy-policy" className="text-primary font-bold hover:underline flex items-center gap-xs">
            View Privacy Policy
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
          <Link to="/faq" className="text-primary font-bold hover:underline flex items-center gap-xs">
            View FAQs
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </PageTransition>
  )
}
