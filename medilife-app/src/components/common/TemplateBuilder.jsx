import React, { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../supabaseClient'
import AudienceFilter from './AudienceFilter'
import CampaignAnalytics from './CampaignAnalytics'
import { 
  Sparkles, MessageSquare, CheckCheck, Loader2, ArrowUpRight, 
  Layers, ChevronDown, ShieldCheck, BarChart3, Send
} from 'lucide-react'

// Default fallback text for empty input fields so preview never breaks
const DEFAULT_PLACEHOLDERS = {
  '1': 'Patient Name',
  '2': 'Jhansi Medilife Pathology Lab',
  '3': '₹499 Special Offer',
  '4': 'Tomorrow at 9:00 AM'
}

export default function TemplateBuilder() {
  const [activeTab, setActiveTab] = useState('builder') // 'builder' or 'analytics'
  const [templates, setTemplates] = useState([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  // Dynamic variable state: { 1: 'Value 1', 2: 'Value 2', ... }
  const [variableInputs, setVariableInputs] = useState({})
  
  // Audience list state from AudienceFilter
  const [audienceList, setAudienceList] = useState([])
  const [isDispatching, setIsDispatching] = useState(false)

  // Fetch templates from public.message_templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoadingTemplates(true)
        const { data, error } = await supabase
          .from('message_templates')
          .select('*')
          .order('created_at', { ascending: true })

        if (!error && data && data.length > 0) {
          setTemplates(data)
          setSelectedTemplate(data[0])
        } else {
          // Fallback mock templates if table is seeding
          const fallbackList = [
            {
              id: 'tpl-1',
              template_name: 'full_body_checkup_promo',
              meta_template_id: 'meta_tpl_full_body_01',
              category: 'MARKETING',
              body_text: 'Hello {{1}}, stay proactive with your health! Get 20% off on Complete Full Body Profile at {{2}}. Book today!',
              variable_count: 2,
              button_text: 'Book Test Now'
            },
            {
              id: 'tpl-2',
              template_name: 'diabetes_screening_offer',
              meta_template_id: 'meta_tpl_diabetes_02',
              category: 'MARKETING',
              body_text: 'Hi {{1}}, special HbA1c & Fasting Glucose Package available for {{2}} at {{3}}. Early detection saves lives!',
              variable_count: 3,
              button_text: 'Claim Offer'
            },
            {
              id: 'tpl-3',
              template_name: 'monsoon_fever_package',
              meta_template_id: 'meta_tpl_monsoon_03',
              category: 'MARKETING',
              body_text: 'Dear {{1}}, protect your family from Dengue & Typhoid with our Monsoon Health Shield at {{2}}.',
              variable_count: 2,
              button_text: 'Book Home Sample'
            }
          ]
          setTemplates(fallbackList)
          setSelectedTemplate(fallbackList[0])
        }
      } catch (err) {
        console.warn("Could not fetch message_templates:", err)
      } finally {
        setLoadingTemplates(false)
      }
    }

    fetchTemplates()
  }, [])

  // Reset variable inputs when template selection changes
  useEffect(() => {
    if (selectedTemplate) {
      const initialVars = {}
      for (let i = 1; i <= selectedTemplate.variable_count; i++) {
        initialVars[i] = ''
      }
      setVariableInputs(initialVars)
    }
  }, [selectedTemplate])

  // Real-Time Regex String Replacement Engine with Fallback Support
  const livePreviewText = useMemo(() => {
    if (!selectedTemplate?.body_text) return ''

    return selectedTemplate.body_text.replace(/\{\{(\d+)\}\}/g, (match, index) => {
      const value = variableInputs[index]
      if (value && value.trim() !== '') {
        return value.trim()
      }
      // Graceful fallback to default placeholder so preview UI never breaks
      return DEFAULT_PLACEHOLDERS[index] || `[Variable {{${index}}}]`
    })
  }, [selectedTemplate, variableInputs])

  // Current timestamp formatted for WhatsApp message bubble
  const currentTimeString = useMemo(() => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }, [])

  return (
    <div className="w-full text-white">
      
      {/* Header Banner & Sub-Nav Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">WhatsApp Marketing & Campaign Engine</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-clinical-teal/20 text-clinical-teal text-[10px] font-bold uppercase tracking-wider border border-clinical-teal/30">
              5 Credits / Msg
            </span>
          </div>
          <p className="text-xs text-admin-on-surface-variant mt-1">
            Build campaigns with real-time WhatsApp UI preview, segment audiences, and track webhook delivery analytics.
          </p>
        </div>

        {/* Sub-Nav Tab Switcher */}
        <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'builder'
                ? 'bg-clinical-teal text-white shadow-md'
                : 'text-admin-on-surface-variant hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Campaign Builder & Preview</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-clinical-teal text-white shadow-md'
                : 'text-admin-on-surface-variant hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics & Funnels</span>
          </button>
        </div>
      </div>

      {activeTab === 'analytics' ? (
        <CampaignAnalytics />
      ) : (
        /* Two-Column Split Screen Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: FORM CONTROLS & AUDIENCE SETUP (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Template Dropdown Selector */}
          <div className="rounded-2xl p-5 bg-white/5 border border-white/10 space-y-3">
            <label className="block text-xs font-semibold text-admin-on-surface-variant uppercase tracking-wider">
              Select Pre-Approved Marketing Template
            </label>

            {loadingTemplates ? (
              <div className="flex items-center gap-2 text-xs text-admin-on-surface-variant">
                <Loader2 className="w-4 h-4 animate-spin text-clinical-teal" /> Loading templates...
              </div>
            ) : (
              <div className="relative">
                <select
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/20 text-white text-sm focus:outline-none focus:border-clinical-teal appearance-none cursor-pointer"
                  value={selectedTemplate?.id || ''}
                  onChange={(e) => {
                    const found = templates.find(t => t.id === e.target.value)
                    if (found) setSelectedTemplate(found)
                  }}
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.template_name} ({t.category}) — {t.variable_count} variables
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-admin-on-surface-variant pointer-events-none" />
              </div>
            )}

            {selectedTemplate && (
              <div className="flex items-center gap-2 pt-1 text-[11px] text-admin-on-surface-variant">
                <ShieldCheck className="w-3.5 h-3.5 text-clinical-teal" />
                <span>Meta Template ID: <strong className="text-amber-300 font-mono">{selectedTemplate.meta_template_id}</strong></span>
              </div>
            )}
          </div>

          {/* 2. Dynamic Variable Inputs (Parse variable_count) */}
          {selectedTemplate && selectedTemplate.variable_count > 0 && (
            <div className="rounded-2xl p-5 bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-clinical-teal" />
                  Dynamic Template Variables ({selectedTemplate.variable_count})
                </h3>
                <span className="text-[10px] text-admin-on-surface-variant">
                  Fills <code className="text-amber-300">{"{{1}}"}</code>, <code className="text-amber-300">{"{{2}}"}</code>...
                </span>
              </div>

              <div className="space-y-3">
                {Array.from({ length: selectedTemplate.variable_count }).map((_, idx) => {
                  const varNum = String(idx + 1)
                  return (
                    <div key={varNum}>
                      <label className="block text-xs font-medium text-admin-on-surface-variant mb-1">
                        Variable {`{{${varNum}}}`} (e.g. {DEFAULT_PLACEHOLDERS[varNum] || 'Custom Text'})
                      </label>
                      <input
                        type="text"
                        placeholder={DEFAULT_PLACEHOLDERS[varNum] || `Input value for {{${varNum}}}`}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-clinical-teal"
                        value={variableInputs[varNum] || ''}
                        onChange={(e) => {
                          setVariableInputs({ ...variableInputs, [varNum]: e.target.value })
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 3. Integrated Audience Filter & Dispatch Launcher */}
          <div className="rounded-2xl p-5 bg-white/5 border border-white/10">
            <AudienceFilter
              onAudienceChange={(list) => setAudienceList(list)}
              templateId={selectedTemplate?.id || selectedTemplate?.template_name}
              variables={variableInputs}
              isDispatching={isDispatching}
            />
          </div>

        </div>

        {/* RIGHT COLUMN: REAL-TIME WHATSAPP UI PREVIEW ENGINE (5 cols) */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="rounded-3xl border border-white/20 bg-slate-950 overflow-hidden shadow-2xl">
            
            {/* Mock Phone / WhatsApp Header */}
            <div className="bg-[#075e54] text-white p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-clinical-teal flex items-center justify-center font-bold text-white shadow-md">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight">Medilife Health Portal</h4>
                  <p className="text-[10px] text-emerald-200">Official Business Account • Verified</p>
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>

            {/* Authentic WhatsApp Chat Wallpaper Container */}
            <div 
              className="p-6 min-h-[380px] flex flex-col justify-end relative bg-[#0b141a]"
              style={{
                backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(18, 140, 126, 0.05) 0%, transparent 60%)'
              }}
            >
              {/* Date Stamp Pill */}
              <div className="self-center px-3 py-1 rounded-lg bg-[#182229] text-[10px] font-medium text-slate-400 mb-4 shadow-sm">
                TODAY
              </div>

              {/* Mock WhatsApp Chat Bubble */}
              <div className="max-w-[90%] self-start rounded-2xl rounded-tl-none bg-[#202c33] border border-white/10 text-slate-100 shadow-xl overflow-hidden relative group">
                
                {/* Message Body Content */}
                <div className="p-3.5 text-xs leading-relaxed whitespace-pre-wrap">
                  {livePreviewText}
                </div>

                {/* Footer Time & Double Ticks */}
                <div className="px-3 pb-2 flex justify-end items-center gap-1 text-[10px] text-slate-400">
                  <span>{currentTimeString}</span>
                  <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
                </div>

                {/* Simulated Clickable CTA Button (button_text) */}
                {selectedTemplate?.button_text && (
                  <div className="border-t border-white/10 px-3 py-2 bg-white/5 flex items-center justify-center gap-1.5 text-clinical-teal font-bold text-xs hover:bg-white/10 cursor-pointer transition-colors">
                    <span>{selectedTemplate.button_text}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <p className="text-center text-[10px] text-slate-500 mt-4">
                🔒 End-to-end encrypted • WhatsApp Business API
              </p>
            </div>

            {/* Live Indicator Banner */}
            <div className="p-3 bg-[#111b21] border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Live Preview Engine Active
              </span>
              <span className="font-mono text-[10px] text-slate-500">Regex Replace Engine</span>
            </div>

          </div>
        </div>

      </div>
      )}
    </div>
  )
}

