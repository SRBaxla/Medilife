import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../supabaseClient'
import { useTenant } from '../../context/TenantContext'
import { 
  BarChart3, CheckCircle2, AlertTriangle, Eye, Send, 
  RefreshCw, Loader2, Sparkles, TrendingUp, Users, AlertCircle 
} from 'lucide-react'

export default function CampaignAnalytics() {
  const { tenant } = useTenant()
  const activeTenantId = tenant?.id || '42ed7e81-66a5-4b5b-af5e-cc27b8a9705e'

  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('campaigns')
        .select('*')
        .eq('tenant_id', activeTenantId)
        .order('created_at', { ascending: false })

      if (err) throw err

      if (data && data.length > 0) {
        setCampaigns(data)
      } else {
        // Fallback demo campaigns for Jhansi Medilife Branch presentation
        setCampaigns([
          {
            id: 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1',
            tenant_id: activeTenantId,
            template_name: 'full_body_checkup_promo',
            target_audience_size: 100,
            sent_count: 100,
            delivered_count: 94,
            read_count: 78,
            failed_count: 6,
            status: 'completed',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2',
            tenant_id: activeTenantId,
            template_name: 'diabetes_screening_offer',
            target_audience_size: 50,
            sent_count: 50,
            delivered_count: 49,
            read_count: 42,
            failed_count: 0,
            status: 'completed',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3',
            tenant_id: activeTenantId,
            template_name: 'monsoon_fever_package',
            target_audience_size: 250,
            sent_count: 250,
            delivered_count: 238,
            read_count: 195,
            failed_count: 12,
            status: 'completed',
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
          }
        ])
      }
    } catch (e) {
      console.warn("Could not fetch campaigns from Supabase:", e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [activeTenantId])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  // Aggregate KPI Calculations
  const totalCampaigns = campaigns.length
  const totalAudience = campaigns.reduce((acc, c) => acc + (c.target_audience_size || 0), 0)
  const totalSent = campaigns.reduce((acc, c) => acc + (c.sent_count || 0), 0)
  const totalDelivered = campaigns.reduce((acc, c) => acc + (c.delivered_count || 0), 0)
  const totalRead = campaigns.reduce((acc, c) => acc + (c.read_count || 0), 0)
  const totalFailed = campaigns.reduce((acc, c) => acc + (c.failed_count || 0), 0)

  const aggregateDeliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0'
  const aggregateReadRate = totalDelivered > 0 ? ((totalRead / totalDelivered) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6 text-white">
      
      {/* Header & Refresh */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-clinical-teal" />
            WhatsApp Campaign Analytics Engine
          </h2>
          <p className="text-xs text-admin-on-surface-variant mt-0.5">
            Real-time receipt performance tracking via Meta WhatsApp Business API webhooks.
          </p>
        </div>
        <button
          onClick={fetchCampaigns}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Targeted */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-admin-on-surface-variant font-medium">Total Audience Targeted</p>
            <p className="text-2xl font-extrabold text-white mt-1">{totalAudience.toLocaleString()}</p>
            <p className="text-[10px] text-clinical-teal font-medium mt-0.5">{totalCampaigns} Campaigns Run</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-clinical-teal/10 border border-clinical-teal/30 flex items-center justify-center text-clinical-teal">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2: Delivery Rate */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-admin-on-surface-variant font-medium">Delivered Rate</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">{aggregateDeliveryRate}%</p>
            <p className="text-[10px] text-emerald-300 font-medium mt-0.5">{totalDelivered.toLocaleString()} Delivered</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Read Rate */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-admin-on-surface-variant font-medium">Read Rate</p>
            <p className="text-2xl font-extrabold text-sky-400 mt-1">{aggregateReadRate}%</p>
            <p className="text-[10px] text-sky-300 font-medium mt-0.5">{totalRead.toLocaleString()} Read Receipts</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Failed Messages */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          totalFailed > 0 ? 'bg-red-950/20 border-red-500/30 text-red-300' : 'bg-white/5 border-white/10 text-white'
        }`}>
          <div>
            <p className="text-xs opacity-80 font-medium">Delivery Failures</p>
            <p className={`text-2xl font-extrabold mt-1 ${totalFailed > 0 ? 'text-red-400' : 'text-white'}`}>
              {totalFailed}
            </p>
            <p className="text-[10px] opacity-70 font-medium mt-0.5">Invalid phones / Meta errors</p>
          </div>
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
            totalFailed > 0 ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/10 border-white/20 text-white'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Campaign Performance & Conversion Funnels List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Campaign Performance & Funnel Breakdown</h3>

        {loading ? (
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-clinical-teal mx-auto mb-2" />
            <p className="text-xs text-admin-on-surface-variant">Fetching campaign analytics...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center text-admin-on-surface-variant text-xs">
            No campaign records found. Run a campaign from the Template Builder to start tracking!
          </div>
        ) : (
          campaigns.map((c) => {
            const target = c.target_audience_size || 1
            const sent = c.sent_count || 0
            const delivered = c.delivered_count || 0
            const read = c.read_count || 0
            const failed = c.failed_count || 0

            const deliveredPct = Math.min(100, Math.round((delivered / target) * 100))
            const readPct = Math.min(100, Math.round((read / target) * 100))

            const formattedDate = new Date(c.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })

            return (
              <div 
                key={c.id} 
                className={`p-5 rounded-2xl bg-white/5 border transition-all ${
                  failed > 0 ? 'border-red-500/30 hover:border-red-500/50' : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white font-mono">{c.template_name}</h4>
                      <span className="px-2 py-0.5 rounded-md bg-white/10 text-clinical-teal text-[10px] font-bold uppercase">
                        {c.status}
                      </span>
                      {failed > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-red-400" /> {failed} Failed
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-admin-on-surface-variant mt-0.5">Dispatched on {formattedDate}</p>
                  </div>

                  <div className="text-right sm:text-right">
                    <span className="text-xs font-extrabold text-amber-300 font-mono">
                      {target * 5} Credits
                    </span>
                    <p className="text-[10px] text-admin-on-surface-variant">{target} Recipients</p>
                  </div>
                </div>

                {/* Conversion Funnel Progress Bar Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-admin-on-surface-variant font-medium">Conversion Funnel Drop-off:</span>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-white">Sent: <strong>{sent}</strong></span>
                      <span className="text-emerald-400">Delivered: <strong>{delivered} ({deliveredPct}%)</strong></span>
                      <span className="text-sky-400">Read: <strong>{read} ({readPct}%)</strong></span>
                    </div>
                  </div>

                  {/* Multi-segmented Progress Bar */}
                  <div className="h-3.5 w-full bg-slate-900 rounded-full overflow-hidden flex p-0.5 border border-white/10">
                    <div 
                      style={{ width: `${deliveredPct}%` }}
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      title={`Delivered: ${delivered}`}
                    />
                    <div 
                      style={{ width: `${readPct}%` }}
                      className="-ml-full bg-sky-400 h-full rounded-full transition-all duration-500 opacity-90" 
                      title={`Read: ${read}`}
                    />
                  </div>
                </div>

                {/* Detail Pills */}
                <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-white/10 text-center text-xs">
                  <div className="bg-white/5 py-1.5 rounded-lg border border-white/5">
                    <span className="block text-[10px] text-admin-on-surface-variant">Targeted</span>
                    <span className="font-bold text-white">{target}</span>
                  </div>
                  <div className="bg-emerald-500/10 py-1.5 rounded-lg border border-emerald-500/20">
                    <span className="block text-[10px] text-emerald-300">Delivered</span>
                    <span className="font-bold text-emerald-400">{delivered}</span>
                  </div>
                  <div className="bg-sky-500/10 py-1.5 rounded-lg border border-sky-500/20">
                    <span className="block text-[10px] text-sky-300">Read</span>
                    <span className="font-bold text-sky-400">{read}</span>
                  </div>
                  <div className={`py-1.5 rounded-lg border ${failed > 0 ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-white/5 border-white/5 text-white'}`}>
                    <span className="block text-[10px] opacity-70">Failed</span>
                    <span className="font-bold">{failed}</span>
                  </div>
                </div>

              </div>
            )
          })
        )}
      </div>

    </div>
  )
}
