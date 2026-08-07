import React from 'react'
import { useTenant } from '../../context/TenantContext'
import AccountSuspended from '../../pages/auth/AccountSuspended'
import { AlertTriangle, CreditCard, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TenantMiddleware({ children }) {
  const { tenant, loading, isSuspended, isGracePeriodActive, subscriptionStatus } = useTenant()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#051424] flex flex-col items-center justify-center gap-md">
        <Loader2 className="w-10 h-10 text-clinical-teal animate-spin" />
        <p className="text-body-md text-admin-on-surface-variant animate-pulse font-medium">
          Resolving laboratory subscription status...
        </p>
      </div>
    )
  }

  // Hard Lock: Account suspended or canceled
  if (isSuspended) {
    return <AccountSuspended />
  }

  // Grace Period: Status is 'past_due' but grace period is active
  if (isGracePeriodActive) {
    return (
      <div className="relative">
        {/* Sticky Warning Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-4 py-2 font-medium text-xs md:text-sm flex items-center justify-between shadow-lg z-[100] sticky top-0 border-b border-amber-400">
          <div className="flex items-center gap-2 max-w-4xl">
            <AlertTriangle className="w-4 h-4 shrink-0 text-slate-950 animate-bounce" />
            <span>
              <strong>Payment Past Due (Grace Access Active):</strong> Your payment attempt failed. Access will be suspended when grace period expires. Please update your payment method.
            </span>
          </div>
          <Link
            to="/onboarding"
            className="px-3 py-1 bg-slate-950 text-amber-300 hover:bg-slate-900 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 border border-amber-400/40 ml-2"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Update Payment
          </Link>
        </div>

        {/* Portal View */}
        {children}
      </div>
    )
  }

  // Normal active tenant operation
  return children
}
