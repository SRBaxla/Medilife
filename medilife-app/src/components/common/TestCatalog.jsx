import React, { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../supabaseClient'
import { 
  AlertTriangle, 
  Beaker, 
  Clock, 
  Activity, 
  Search, 
  Loader2, 
  CheckCircle, 
  Database,
  RefreshCw,
  Send,
  Sliders,
  ChevronDown,
  X,
  Trash2,
  Plus,
  Edit3,
  Check
} from 'lucide-react'

// Simple Error Boundary component for rendering errors in React 18+ safely
class ComponentErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, errorInfo) {
    console.error("TestCatalog Error Boundary caught an error:", error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-lg bg-red-50 border border-red-200 rounded-2xl text-center space-y-md">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-headline-sm text-red-800">Something went wrong rendering the catalog</h3>
          <p className="text-body-md text-red-700 max-w-md mx-auto">
            {this.state.error?.message || "Please reload or check the component configuration."}
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-md py-sm bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-label-md"
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function TestCatalogComponent({ tenantId }) {
  const [catalog, setCatalog] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Edit Modal State
  const [editingTest, setEditingTest] = useState(null)
  const [editForm, setEditForm] = useState({
    test_name: '',
    turnaround_time_hours: 4,
    requires_fasting: false,
    fasting_hours: 12,
    pre_test_instructions: []
  })
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState(null)

  // Fetch catalog records from Supabase
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('test_catalog')
        .select('*')
        .eq('tenant_id', tenantId)

      if (fetchError) throw fetchError

      if (!data || data.length === 0) {
        setCatalog(getFallbackMockData(tenantId))
      } else {
        setCatalog(data)
      }
    } catch (err) {
      console.warn("Supabase fetch failed, fallback to mock mode:", err)
      setError(`Supabase connection error: ${err.message || err}`)
      setCatalog(getFallbackMockData(tenantId))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tenantId) {
      fetchData()
    }
  }, [tenantId])

  // Filter Catalog
  const filteredCatalog = useMemo(() => {
    return catalog.filter((test) => {
      const nameMatch = test.test_name.toLowerCase().includes(searchQuery.toLowerCase())
      const isFasting = test.requires_fasting || test.fasting_hours > 0
      const categoryMatch = selectedCategory === 'All' 
        || (selectedCategory === 'Fasting Required' && isFasting)
        || (selectedCategory === 'No Fasting' && !isFasting)
        || (selectedCategory === 'Stat (<=6h)' && test.turnaround_time_hours <= 6)
      return nameMatch && categoryMatch
    })
  }, [catalog, searchQuery, selectedCategory])

  // Open Edit Modal
  const handleOpenEdit = (test) => {
    setEditingTest(test)
    const instructions = Array.isArray(test.pre_test_instructions) 
      ? [...test.pre_test_instructions] 
      : []
    setEditForm({
      id: test.id,
      test_name: test.test_name,
      turnaround_time_hours: test.turnaround_time_hours || 4,
      requires_fasting: test.requires_fasting || test.fasting_hours > 0 || false,
      fasting_hours: test.fasting_hours || 12,
      pre_test_instructions: instructions.length > 0 ? instructions : ['']
    })
    setSaveSuccess(false)
    setSaveError(null)
  }

  // Add Instruction Rule Input Line
  const handleAddInstruction = () => {
    setEditForm(prev => ({
      ...prev,
      pre_test_instructions: [...prev.pre_test_instructions, '']
    }))
  }

  // Update Instruction Text
  const handleInstructionChange = (index, value) => {
    setEditForm(prev => {
      const copy = [...prev.pre_test_instructions]
      copy[index] = value
      return { ...prev, pre_test_instructions: copy }
    })
  }

  // Remove Instruction Line
  const handleRemoveInstruction = (index) => {
    setEditForm(prev => {
      const copy = prev.pre_test_instructions.filter((_, i) => i !== index)
      return { ...prev, pre_test_instructions: copy }
    })
  }

  // Save Pre-Test Requirements to Supabase
  const handleSaveRequirements = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      const cleanInstructions = editForm.pre_test_instructions
        .map(i => i.trim())
        .filter(Boolean)

      const payload = {
        test_name: editForm.test_name,
        turnaround_time_hours: parseInt(editForm.turnaround_time_hours, 10) || 4,
        requires_fasting: editForm.requires_fasting,
        fasting_hours: editForm.requires_fasting ? (parseInt(editForm.fasting_hours, 10) || 12) : 0,
        pre_test_instructions: cleanInstructions
      }

      if (editingTest.id) {
        const { error: updateErr } = await supabase
          .from('test_catalog')
          .update(payload)
          .eq('id', editingTest.id)

        if (updateErr) throw updateErr
      }

      // Update local state
      setCatalog(prev => prev.map(t => (t.test_name === editingTest.test_name || t.id === editingTest.id) ? { ...t, ...payload } : t))
      setSaveSuccess(true)

      setTimeout(() => {
        setEditingTest(null)
        setSaveSuccess(false)
      }, 1200)

    } catch (err) {
      console.error("Save pre-test rules failed:", err)
      // Local fallback update for presentation mode
      const cleanInstructions = editForm.pre_test_instructions.map(i => i.trim()).filter(Boolean)
      const payload = {
        test_name: editForm.test_name,
        turnaround_time_hours: parseInt(editForm.turnaround_time_hours, 10) || 4,
        requires_fasting: editForm.requires_fasting,
        fasting_hours: editForm.requires_fasting ? (parseInt(editForm.fasting_hours, 10) || 12) : 0,
        pre_test_instructions: cleanInstructions
      }
      setCatalog(prev => prev.map(t => (t.test_name === editingTest.test_name) ? { ...t, ...payload } : t))
      setSaveSuccess(true)
      setTimeout(() => {
        setEditingTest(null)
        setSaveSuccess(false)
      }, 1200)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto space-y-lg">
      
      {/* Header Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-lg shadow-clinical flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div className="space-y-xs">
          <div className="flex items-center gap-sm">
            <Beaker className="w-6 h-6 text-primary" />
            <h2 className="text-headline-lg font-bold text-on-surface">Test Preparation & Fasting Manager</h2>
          </div>
          <p className="text-body-md text-on-surface-variant">
            Configure pre-test fasting rules and patient instructions for location: <span className="font-mono font-bold bg-secondary-container px-sm py-xs text-primary rounded-lg text-label-md">{tenantId}</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-sm items-stretch sm:items-center">
          <div className="relative">
            <Search className="w-4 h-4 text-on-surface-variant/60 absolute left-md top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search catalog tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-md py-sm bg-surface-container-low border border-outline-variant/50 rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 w-full sm:w-64"
            />
          </div>
          <button 
            onClick={fetchData}
            className="btn-outline !py-sm flex items-center justify-center gap-xs"
            title="Refresh database"
          >
            <RefreshCw className="w-4 h-4" />
            Sync
          </button>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex gap-sm overflow-x-auto pb-xs">
        {['All', 'Fasting Required', 'No Fasting', 'Stat (<=6h)'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-md py-sm rounded-full text-label-md transition-all shrink-0 ${
              selectedCategory === cat 
                ? 'bg-primary text-on-primary font-semibold shadow-clinical'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-secondary-container hover:text-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          {[1, 2].map((i) => (
            <div key={i} className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-lg space-y-md shadow-clinical animate-pulse">
              <div className="h-6 bg-surface-container rounded-md w-2/3" />
              <div className="h-20 bg-surface-container rounded-2xl" />
            </div>
          ))}
        </div>
      ) : filteredCatalog.length === 0 ? (
        <div className="text-center py-xxl bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-xl shadow-clinical">
          <Activity className="w-12 h-12 text-on-surface-variant mx-auto mb-md animate-pulse-slow" />
          <h3 className="text-headline-md font-bold text-on-surface">No matching catalog tests</h3>
          <p className="text-body-md text-on-surface-variant mt-xs max-w-sm mx-auto">
            Try clearing search filters or search for another test name.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          {filteredCatalog.map((test) => {
            const isFasting = test.requires_fasting || test.fasting_hours > 0
            const instructions = Array.isArray(test.pre_test_instructions) ? test.pre_test_instructions : []

            return (
              <div 
                key={test.id || test.test_name} 
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-lg shadow-clinical flex flex-col justify-between hover:shadow-clinical-lg transition-all duration-300 relative overflow-hidden"
              >
                {/* Visual Top Accent */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${isFasting ? 'bg-amber-500' : 'bg-emerald-500'}`} />

                <div>
                  {/* Test Header & Badges */}
                  <div className="flex justify-between items-start gap-md mb-md">
                    <div>
                      <h3 className="text-headline-sm font-bold text-on-surface">{test.test_name}</h3>
                      <div className="flex items-center gap-md text-on-surface-variant text-label-sm mt-xs">
                        <span className="flex items-center gap-xs">
                          <Clock className="w-3.5 h-3.5" />
                          TAT: {test.turnaround_time_hours || 4} Hours
                        </span>
                      </div>
                    </div>
                    
                    {/* Fasting Badge */}
                    {isFasting ? (
                      <span className="px-md py-xs rounded-full text-label-sm font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-xs shrink-0">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        {test.fasting_hours || 12}h Fasting Required
                      </span>
                    ) : (
                      <span className="px-md py-xs rounded-full text-label-sm font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-xs shrink-0">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        No Fasting Required
                      </span>
                    )}
                  </div>

                  {/* Pre-Test Preparation Requirements Box */}
                  <div className={`rounded-2xl p-md mb-md ${isFasting ? 'bg-amber-50/70 border border-amber-200' : 'bg-emerald-50/50 border border-emerald-200'}`}>
                    <div className="flex items-center gap-xs font-semibold text-label-md mb-sm text-on-surface">
                      <AlertTriangle className={`w-4 h-4 ${isFasting ? 'text-amber-600' : 'text-emerald-600'}`} />
                      <span>Patient Preparation Requirements</span>
                    </div>

                    {instructions.length === 0 ? (
                      <p className="text-body-md text-on-surface-variant italic">No specific pre-test instructions configured.</p>
                    ) : (
                      <ul className="space-y-xs">
                        {instructions.map((ins, idx) => (
                          <li key={idx} className="text-body-md text-on-surface flex items-start gap-sm">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-2 ${isFasting ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            <span>{ins}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Practitioner Configure / Edit Button */}
                <div className="border-t border-outline-variant/20 pt-md flex items-center justify-between">
                  <span className="text-label-sm text-on-surface-variant">
                    Practitioner Preparation Rules
                  </span>
                  <button
                    onClick={() => handleOpenEdit(test)}
                    className="btn-primary !py-xs !px-md text-label-sm flex items-center gap-xs"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Configure Requirements
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Practitioner Pre-Test Requirement Modal Editor */}
      {editingTest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-md">
          <div className="bg-surface-container-lowest border border-outline-variant/30 w-full max-w-lg rounded-3xl overflow-hidden shadow-clinical-xl animate-scale-up max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="bg-primary text-on-primary p-lg flex justify-between items-center shrink-0">
              <div className="flex items-center gap-sm">
                <Sliders className="w-5 h-5" />
                <h3 className="font-bold text-headline-sm">Configure Pre-Test Requirements</h3>
              </div>
              <button 
                onClick={() => setEditingTest(null)}
                className="text-on-primary/80 hover:text-on-primary p-sm rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveRequirements} className="p-lg space-y-md overflow-y-auto flex-1">
              {saveError && (
                <div className="p-sm bg-red-50 border border-red-200 text-red-700 rounded-xl text-label-md flex items-center gap-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{saveError}</span>
                </div>
              )}

              {saveSuccess ? (
                <div className="text-center py-lg space-y-sm">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                  <p className="font-bold text-headline-sm text-on-surface">Instructions Saved</p>
                  <p className="text-body-md text-on-surface-variant">Pre-test guidelines saved to laboratory database catalog.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-xs">
                    <label className="text-label-sm text-on-surface-variant block font-medium">Test Profile Name</label>
                    <input
                      type="text"
                      disabled
                      value={editForm.test_name}
                      className="w-full px-md py-sm bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-body-md text-on-surface opacity-80"
                    />
                  </div>

                  {/* Fasting Requirement Controls */}
                  <div className="p-md bg-surface-container-low border border-outline-variant/50 rounded-2xl space-y-md">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-label-md font-bold text-on-surface block">Requires Patient Fasting?</label>
                        <span className="text-label-sm text-on-surface-variant">Check if patient must refrain from food prior to draw.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={editForm.requires_fasting}
                        onChange={(e) => setEditForm({ ...editForm, requires_fasting: e.target.checked })}
                        className="w-5 h-5 accent-primary cursor-pointer rounded"
                      />
                    </div>

                    {editForm.requires_fasting && (
                      <div className="space-y-xs pt-sm border-t border-outline-variant/20">
                        <label className="text-label-sm text-on-surface-variant block font-medium">Required Fasting Duration (Hours)</label>
                        <input
                          type="number"
                          min="1"
                          max="48"
                          value={editForm.fasting_hours}
                          onChange={(e) => setEditForm({ ...editForm, fasting_hours: e.target.value })}
                          className="w-full px-md py-sm bg-surface-container-lowest border border-outline-variant/50 rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary"
                        />
                      </div>
                    )}
                  </div>

                  {/* Turnaround Time */}
                  <div className="space-y-xs">
                    <label className="text-label-sm text-on-surface-variant block font-medium">Report Turnaround Time (Hours)</label>
                    <input
                      type="number"
                      min="1"
                      value={editForm.turnaround_time_hours}
                      onChange={(e) => setEditForm({ ...editForm, turnaround_time_hours: e.target.value })}
                      className="w-full px-md py-sm bg-surface-container-low border border-outline-variant/50 rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Pre-Test Instructions List Editor */}
                  <div className="space-y-xs">
                    <div className="flex justify-between items-center">
                      <label className="text-label-sm font-bold text-on-surface block">Pre-Test Patient Instructions</label>
                      <button
                        type="button"
                        onClick={handleAddInstruction}
                        className="text-primary text-label-sm font-semibold flex items-center gap-xs hover:underline"
                      >
                        + Add Rule
                      </button>
                    </div>

                    <div className="space-y-sm max-h-48 overflow-y-auto pr-xs">
                      {editForm.pre_test_instructions.map((instruction, idx) => (
                        <div key={idx} className="flex items-center gap-sm">
                          <input
                            type="text"
                            placeholder={`Instruction #${idx + 1} (e.g. Discontinue biotin 48 hours prior)`}
                            value={instruction}
                            onChange={(e) => handleInstructionChange(idx, e.target.value)}
                            className="flex-1 px-md py-sm bg-surface-container-low border border-outline-variant/50 rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveInstruction(idx)}
                            className="p-sm text-on-surface-variant hover:text-red-600 rounded-lg transition-colors"
                            title="Remove rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer buttons */}
                  <div className="pt-md flex justify-end gap-sm border-t border-outline-variant/20">
                    <button
                      type="button"
                      onClick={() => setEditingTest(null)}
                      className="btn-outline !py-sm !px-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary !py-sm !px-md flex items-center gap-xs"
                    >
                      {saving ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                      ) : (
                        <><Check className="w-4 h-4" />Save Guidelines</>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>

          </div>
        </div>
      )}

    </div>
  )
}

// Full premium mock fallback data structure matching Supabase fields and catalog rules
function getFallbackMockData(tenantId) {
  return [
    {
      id: "tc-001",
      tenant_id: tenantId,
      test_name: "Complete Blood Count (CBC) with Differential",
      turnaround_time_hours: 4,
      requires_fasting: false,
      fasting_hours: 0,
      pre_test_instructions: [
        "Fasting is not strictly required, but a light meal is suggested.",
        "Drink plenty of water to stay hydrated prior to blood drawing.",
        "Inform the clinician about any blood thinners currently taken."
      ]
    },
    {
      id: "tc-002",
      tenant_id: tenantId,
      test_name: "Lipid Panel with Risk Assessment",
      turnaround_time_hours: 8,
      requires_fasting: true,
      fasting_hours: 12,
      pre_test_instructions: [
        "Strict fasting required for 12 hours prior to draw (water only).",
        "Avoid alcohol consumption for 24 hours before the test."
      ]
    },
    {
      id: "tc-003",
      tenant_id: tenantId,
      test_name: "Thyroid Stimulating Hormone (TSH)",
      turnaround_time_hours: 6,
      requires_fasting: false,
      fasting_hours: 0,
      pre_test_instructions: [
        "Schedule the test for morning hours if monitoring thyroid replacement therapy.",
        "Biotin supplements should be discontinued 48 hours prior to test."
      ]
    },
    {
      id: "tc-004",
      tenant_id: tenantId,
      test_name: "Urinalysis with Microscopic Examination",
      turnaround_time_hours: 12,
      requires_fasting: false,
      fasting_hours: 0,
      pre_test_instructions: [
        "First-morning void urine sample is highly recommended.",
        "Provide a clean-catch midstream urine sample in the sterile container."
      ]
    }
  ]
}

// Export wrapped in the Error Boundary as requested
export default function TestCatalog({ tenantId }) {
  return (
    <ComponentErrorBoundary>
      <TestCatalogComponent tenantId={tenantId} />
    </ComponentErrorBoundary>
  )
}
