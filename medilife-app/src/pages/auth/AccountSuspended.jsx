import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldAlert, CreditCard, RefreshCw, LogOut, ArrowRight, HelpCircle } from 'lucide-react'
import { useTenant } from '../../context/TenantContext'
import { supabase } from '../../supabaseClient'

export default function AccountSuspended() {
  const navigate = useNavigate()
  const { tenant, refreshTenant, subscriptionStatus, tier } = useTenant()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    const activeSlug = tenant?.subdomain || 'jhansi-medilife-tenant-01'
    navigate(`/${activeSlug}/admin/login`)
  }

  return (
    <div className="min-h-screen bg-[#051424] flex items-center justify-center p-md text-white">
      <div className="w-full max-w-lg">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl p-xl glass-panel border border-red-500/30 bg-gradient-to-b from-red-950/20 to-slate-900/80 shadow-2xl backdrop-blur-xl relative overflow-hidden"
        >
          {/* Top Decorative Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-red-500/10 blur-3xl rounded-full pointer-events-none" />

          {/* Header Icon */}
          <div className="flex justify-center mb-lg">
            <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shadow-lg shadow-red-950/50">
              <ShieldAlert className="w-10 h-10 text-red-400 animate-pulse" />
            </div>
          </div>

          {/* Title & Status */}
          <div className="text-center mb-xl">
            <span className="inline-block px-md py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-red-500/20 text-red-300 border border-red-500/40 mb-sm">
              Status: {subscriptionStatus.toUpperCase()}
            </span>
            <h1 className="text-headline-md font-extrabold text-white mb-xs">
              Account Access Suspended
            </h1>
            <p className="text-body-md text-admin-on-surface-variant leading-relaxed">
              Workspace access for <strong className="text-white">{tenant?.business_name || 'Your Diagnostic Lab'}</strong> ({tenant?.subdomain}.medilife.in) has been paused due to an inactive or failed payment subscription.
            </p>
          </div>

          {/* Details Card */}
          <div className="rounded-2xl p-md bg-white/5 border border-white/10 mb-xl space-y-3">
            <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
              <span className="text-admin-on-surface-variant">Subscription Tier</span>
              <span className="font-bold text-clinical-teal">{tier || 'Base'} Plan</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
              <span className="text-admin-on-surface-variant">Subdomain Slug</span>
              <span className="font-mono text-amber-300">{tenant?.subdomain || 'demo-lab'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-admin-on-surface-variant">Required Action</span>
              <span className="font-semibold text-red-300">Update Payment / Settle Invoice</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-sm">
            <Link
              to="/onboarding"
              className="w-full py-md rounded-xl font-label-md font-bold transition-all active:scale-[0.98] bg-clinical-teal hover:bg-clinical-teal/90 text-white flex items-center justify-center gap-xs shadow-admin-glow"
            >
              <CreditCard className="w-5 h-5" />
              Reactivate Subscription & Pay Now
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Link>

            <button
              onClick={() => refreshTenant()}
              className="w-full py-md rounded-xl font-label-md font-medium transition-all bg-white/5 hover:bg-white/10 border border-white/10 text-admin-on-surface-variant hover:text-white flex items-center justify-center gap-xs"
            >
              <RefreshCw className="w-4 h-4" />
              I Have Completed Payment (Re-check Status)
            </button>
          </div>

          {/* Bottom Footer Actions */}
          <div className="flex items-center justify-between border-t border-white/10 mt-xl pt-md text-xs text-admin-on-surface-variant">
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-1 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
            <a 
              href="mailto:support@medilife.in" 
              className="flex items-center gap-1 text-clinical-teal hover:underline font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Contact Billing Support
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
