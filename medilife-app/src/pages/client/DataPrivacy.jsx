import { motion } from 'framer-motion'
import PageTransition from '../../components/common/PageTransition'

export default function DataPrivacy() {
  return (
    <PageTransition>
      {/* Header */}
      <div className="bg-primary pt-24 pb-xl sm:py-xxl px-md sm:px-lg text-on-primary">
        <div className="max-w-[1280px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="inline-flex items-center gap-xs px-md py-xs bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider mb-sm">
              <span className="material-symbols-outlined text-[16px] text-[#E31837]">shield</span>
              <span>Patient Data Protection</span>
            </div>
            <h1 className="text-[28px] sm:text-display-lg-mobile font-bold mb-sm">Privacy Policy</h1>
            <p className="text-body-md sm:text-body-lg opacity-90 max-w-xl">
              Medipath Diagnostics is committed to safeguarding patient medical records, personal contact data, and diagnostic test results.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[840px] mx-auto px-md sm:px-lg py-xl sm:py-xxl space-y-xl text-on-surface">
        <div className="p-lg bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-clinical space-y-sm">
          <p className="text-body-sm text-on-surface-variant font-semibold">Last Updated: July 2026</p>
          <p className="text-body-md leading-relaxed">
            This Privacy Policy explains how <strong>Medipath Diagnostics</strong> (Redcliffe Labs Authorised Collection Center, Franchise Owner: Shivam Sharma, located In Front of Kalyan Petrol Pump, Khati Baba, Jhansi, UP - 284003) collects, protects, uses, and discloses your personal information and diagnostic health records.
          </p>
        </div>

        <div className="space-y-md">
          <h2 className="text-headline-sm font-bold text-primary flex items-center gap-xs">
            <span className="material-symbols-outlined text-[#E31837]">database</span>
            1. Information We Collect
          </h2>
          <p className="text-body-md text-on-surface-variant leading-relaxed">
            When you book a pathology test, request home sample collection, or use our digital portal, we collect:
          </p>
          <ul className="list-disc pl-lg space-y-xs text-body-md text-on-surface-variant">
            <li><strong>Patient Identity:</strong> Full Name, Age, Gender, and Medical History relevant to requested tests.</li>
            <li><strong>Contact Details:</strong> Phone Number (used for WhatsApp report dispatch), Email Address, and Home Address (for sample collection).</li>
            <li><strong>Diagnostic Records:</strong> Blood/Urine test parameters, laboratory findings, doctor panel referrals, and historical report archives.</li>
          </ul>
        </div>

        <div className="space-y-md">
          <h2 className="text-headline-sm font-bold text-primary flex items-center gap-xs">
            <span className="material-symbols-outlined text-[#E31837]">lock</span>
            2. Medical Confidentiality & Security
          </h2>
          <p className="text-body-md text-on-surface-variant leading-relaxed">
            Your medical diagnostic test results are strictly confidential. We implement encrypted data storage, secure patient portal authentication, and restricted staff access in compliance with Indian healthcare guidelines (DISHA / IT Act rules). Reports are only shared with the patient or their designated referring physician.
          </p>
        </div>

        <div className="space-y-md">
          <h2 className="text-headline-sm font-bold text-primary flex items-center gap-xs">
            <span className="material-symbols-outlined text-[#E31837]">chat</span>
            3. Communication & WhatsApp PDF Dispatch
          </h2>
          <p className="text-body-md text-on-surface-variant leading-relaxed">
            By booking a test with Medipath Diagnostics, you consent to receive test status updates, phlebotomist arrival notifications, and secure password-protected PDF test reports on your registered WhatsApp phone number and email address. You may opt out of promotional communications at any time.
          </p>
        </div>

        <div className="space-y-md">
          <h2 className="text-headline-sm font-bold text-primary flex items-center gap-xs">
            <span className="material-symbols-outlined text-[#E31837]">no_accounts</span>
            4. Third-Party Data Sharing
          </h2>
          <p className="text-body-md text-on-surface-variant leading-relaxed">
            We do NOT sell, rent, or trade your personal or medical data to advertising agencies or third-party marketing companies. Data is shared exclusively with <strong>Redcliffe Labs</strong> central reference laboratories for specialized sample processing and quality auditing.
          </p>
        </div>

        <div className="space-y-md">
          <h2 className="text-headline-sm font-bold text-primary flex items-center gap-xs">
            <span className="material-symbols-outlined text-[#E31837]">contact_support</span>
            5. Contact Privacy Officer
          </h2>
          <p className="text-body-md text-on-surface-variant leading-relaxed">
            If you have any questions regarding your medical data privacy, wish to delete your portal account, or request a physical copy of your records, please contact:
          </p>
          <div className="p-md bg-secondary-container rounded-xl border border-primary/20 text-body-md font-medium text-primary">
            <p className="font-bold">Shivam Sharma (Franchise Owner)</p>
            <p>Medipath Diagnostics — Redcliffe Labs Authorised Center</p>
            <p>In Front of Kalyan Petrol Pump, Khati Baba, Jhansi, UP - 284003</p>
            <p className="mt-xs">Phone: +91 8299487062</p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
