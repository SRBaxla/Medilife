import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldAlert, Search, Home, PlusCircle, ArrowRight } from 'lucide-react'

export default function LabNotFound() {
  const navigate = useNavigate()
  const [searchSlug, setSearchSlug] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchSlug.trim()) {
      const sanitized = searchSlug.toLowerCase().replace(/[^a-z0-9-]/g, '')
      navigate(`/${sanitized}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#051424] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl p-8 glass-panel border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl space-y-6"
        >
          {/* Header Icon */}
          <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <ShieldAlert className="w-10 h-10 animate-bounce" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-widest border border-amber-500/30">
              404 • Storefront Not Found
            </span>
            <h1 className="text-2xl font-bold text-white mt-3">
              Diagnostic Laboratory Not Found
            </h1>
            <p className="text-xs text-admin-on-surface-variant leading-relaxed mt-2">
              The requested laboratory subdomain slug does not match any registered franchisee in our active registry.
            </p>
          </div>

          {/* Quick Search Form */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="block text-xs text-left font-semibold text-admin-on-surface-variant">
              Lookup Registered Lab Subdomain:
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="jhansi-medilife-tenant-01"
                className="w-full pl-4 pr-10 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-mono text-xs focus:outline-none focus:border-clinical-teal"
                value={searchSlug}
                onChange={(e) => setSearchSlug(e.target.value)}
              />
              <button type="submit" className="absolute right-2 p-1.5 bg-clinical-teal text-slate-950 rounded-lg">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Link
              to="/jhansi-medilife-tenant-01"
              className="w-full py-3 rounded-xl font-bold bg-clinical-teal text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 text-xs shadow-admin-glow"
            >
              <Home className="w-4 h-4" />
              Visit Default Jhansi Medilife Storefront
            </Link>

            <Link
              to="/onboarding"
              className="w-full py-3 rounded-xl font-bold bg-white/10 hover:bg-white/15 border border-white/10 text-white transition-all flex items-center justify-center gap-2 text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              Register New Laboratory Franchisee
              <ArrowRight className="w-3.5 h-3.5 ml-auto" />
            </Link>
          </div>

        </motion.div>
      </div>
    </div>
  )
}
