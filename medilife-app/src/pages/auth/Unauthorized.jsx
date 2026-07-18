import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import PageTransition from '../../components/common/PageTransition'

export default function Unauthorized() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-[#051424] flex items-center justify-center p-lg text-center">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-xl max-w-md space-y-md shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          
          <h2 className="text-headline-md font-bold text-red-400">403 — Unauthorized Access</h2>
          
          <p className="text-body-md text-admin-on-surface-variant max-w-sm">
            Your authenticated user role or organization tenant context does not have access permissions for this diagnostic laboratory segment.
          </p>

          <div className="pt-md">
            <Link 
              to="/login" 
              className="btn-admin !py-sm !px-lg inline-flex items-center gap-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
