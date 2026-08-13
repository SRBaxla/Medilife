import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Create styles for clean, clinical PDF layout
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 30,
    lineHeight: 1.5,
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    color: '#191c1e'
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#006574',
    borderBottomStyle: 'solid',
    paddingBottom: 10,
    marginBottom: 20
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#006574'
  },
  subHeader: {
    fontSize: 8,
    color: '#3d494b',
    marginTop: 2
  },
  tenantName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#191c1e',
    textAlign: 'right'
  },
  patientInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#f7f9fb',
    padding: 10,
    borderRadius: 4
  },
  infoCol: {
    flexDirection: 'column',
    width: '48%'
  },
  infoText: {
    marginBottom: 4,
    color: '#3d494b'
  },
  boldLabel: {
    fontWeight: 'bold',
    color: '#191c1e'
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#006574',
    borderBottomWidth: 1,
    borderBottomColor: '#bcc9cc',
    borderBottomStyle: 'solid',
    paddingBottom: 4,
    marginBottom: 10,
    textTransform: 'uppercase'
  },
  table: {
    flexDirection: 'column',
    marginBottom: 20
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#191c1e',
    borderBottomStyle: 'solid',
    paddingBottom: 4,
    fontWeight: 'bold',
    color: '#006574',
    backgroundColor: '#eceef0',
    padding: 4
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e3e5',
    borderBottomStyle: 'solid',
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 4,
    paddingRight: 4,
    alignItems: 'center'
  },
  colParam: { width: '40%' },
  colValue: { width: '20%', fontWeight: 'bold' },
  colUnit: { width: '15%' },
  colRange: { width: '25%', color: '#3d494b' },
  outOfRangeValue: {
    color: '#ba1a1a',
    fontWeight: 'bold'
  },
  flaggedText: {
    color: '#ba1a1a',
    fontSize: 8,
    marginLeft: 2
  },
  notesContainer: {
    marginTop: 15,
    backgroundColor: '#f7f9fb',
    padding: 10,
    borderRadius: 4
  },
  notesTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#191c1e'
  },
  notesBody: {
    color: '#3d494b',
    fontStyle: 'italic'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#bcc9cc',
    borderTopStyle: 'solid',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: '#bcc9cc',
    fontSize: 7
  }
})

// Helper check for range violations in PDF
const isOutOfRange = (value, refRange) => {
  if (!refRange || value === undefined || value === '') return false
  const numVal = parseFloat(value)
  const min = parseFloat(refRange.min)
  const max = parseFloat(refRange.max)
  if (isNaN(numVal) || isNaN(min) || isNaN(max)) return false
  return numVal < min || numVal > max
}

const PARAM_SPECS = {
  // CBC parameters
  'hemoglobin': { label: 'Hemoglobin (Hb)', unit: 'g/dL', refText: '13.0 - 17.0', min: 13.0, max: 17.0 },
  'wbc_count': { label: 'WBC Total Count', unit: '/µL', refText: '4,000 - 11,000', min: 4000, max: 11000 },
  'rbc_count': { label: 'RBC Total Count', unit: 'million/µL', refText: '4.5 - 5.5', min: 4.5, max: 5.5 },
  'platelet_count': { label: 'Platelet Count', unit: 'Lakh/µL', refText: '1.5 - 4.5', min: 1.5, max: 4.5 },
  'pcv': { label: 'PCV / Hematocrit', unit: '%', refText: '40.0 - 50.0', min: 40.0, max: 50.0 },

  // Lipid Profile parameters
  'total_cholesterol': { label: 'Total Cholesterol', unit: 'mg/dL', refText: '< 200 mg/dL', min: 0, max: 200 },
  'hdl_cholesterol': { label: 'HDL Cholesterol (Good)', unit: 'mg/dL', refText: '40 - 60 mg/dL', min: 40, max: 60 },
  'hdl': { label: 'HDL Cholesterol (Good)', unit: 'mg/dL', refText: '40 - 60 mg/dL', min: 40, max: 60 },
  'ldl_cholesterol': { label: 'LDL Cholesterol (Bad)', unit: 'mg/dL', refText: '< 100 mg/dL', min: 0, max: 100 },
  'ldl': { label: 'LDL Cholesterol (Bad)', unit: 'mg/dL', refText: '< 100 mg/dL', min: 0, max: 100 },
  'triglycerides': { label: 'Triglycerides', unit: 'mg/dL', refText: '< 150 mg/dL', min: 0, max: 150 },
  'vldl_cholesterol': { label: 'VLDL Cholesterol', unit: 'mg/dL', refText: '10 - 30 mg/dL', min: 10, max: 30 },
  'vldl': { label: 'VLDL Cholesterol', unit: 'mg/dL', refText: '10 - 30 mg/dL', min: 10, max: 30 },

  // HbA1c & Fasting Glucose parameters
  'hba1c': { label: 'HbA1c (Glycated Hb)', unit: '%', refText: '< 5.7 %', min: 0, max: 5.7 },
  'fasting_glucose': { label: 'Fasting Blood Sugar', unit: 'mg/dL', refText: '70 - 99 mg/dL', min: 70, max: 99 },
  'estimated_avg_glucose': { label: 'Estimated Avg Glucose', unit: 'mg/dL', refText: '70 - 126 mg/dL', min: 70, max: 126 },

  // Thyroid parameters
  'tsh': { label: 'TSH (Ultrasensitive)', unit: 'µIU/mL', refText: '0.35 - 4.94 µIU/mL', min: 0.35, max: 4.94 },
  'total_t3': { label: 'Total T3', unit: 'ng/mL', refText: '0.8 - 2.0 ng/mL', min: 0.8, max: 2.0 },
  'total_t4': { label: 'Total T4', unit: 'µg/dL', refText: '5.1 - 14.1 µg/dL', min: 5.1, max: 14.1 },

  // LFT parameters
  'total_bilirubin': { label: 'Total Bilirubin', unit: 'mg/dL', refText: '0.2 - 1.2 mg/dL', min: 0.2, max: 1.2 },
  'sgot': { label: 'SGOT / AST', unit: 'U/L', refText: '5 - 40 U/L', min: 5, max: 40 },
  'sgot_ast': { label: 'SGOT / AST', unit: 'U/L', refText: '5 - 40 U/L', min: 5, max: 40 },
  'sgpt': { label: 'SGPT / ALT', unit: 'U/L', refText: '7 - 56 U/L', min: 7, max: 56 },
  'sgpt_alt': { label: 'SGPT / ALT', unit: 'U/L', refText: '7 - 56 U/L', min: 7, max: 56 },
  'alkaline_phosphatase': { label: 'Alkaline Phosphatase (ALP)', unit: 'U/L', refText: '44 - 147 U/L', min: 44, max: 147 },
  'serum_albumin': { label: 'Serum Albumin', unit: 'g/dL', refText: '3.5 - 5.2 g/dL', min: 3.5, max: 5.2 }
}

export default function PathologyReportPDF({ report, formData = {} }) {
  const mergedData = formData || report?.results_data || {}
  const testName = mergedData.test_name || report?.test_catalog?.test_name || report?.test_name || 'Diagnostic Pathology Profile'
  const testNameLower = (testName || '').toLowerCase()

  let fields = []
  if (testNameLower.includes('lipid')) {
    fields = [
      { name: 'total_cholesterol', label: 'Total Cholesterol', type: 'numeric', unit: 'mg/dL', reference_range: { min: 120, max: 200, refText: '< 200 mg/dL' } },
      { name: 'hdl_cholesterol', label: 'HDL Cholesterol (Good)', type: 'numeric', unit: 'mg/dL', reference_range: { min: 40, max: 60, refText: '40 - 60 mg/dL' } },
      { name: 'ldl_cholesterol', label: 'LDL Cholesterol (Bad)', type: 'numeric', unit: 'mg/dL', reference_range: { min: 50, max: 100, refText: '< 100 mg/dL' } },
      { name: 'triglycerides', label: 'Triglycerides', type: 'numeric', unit: 'mg/dL', reference_range: { min: 50, max: 150, refText: '< 150 mg/dL' } },
      { name: 'vldl_cholesterol', label: 'VLDL Cholesterol', type: 'numeric', unit: 'mg/dL', reference_range: { min: 10, max: 30, refText: '10 - 30 mg/dL' } },
      { name: 'technician_notes', label: 'Observations', type: 'textarea' }
    ]
  } else if (testNameLower.includes('hba1c') || testNameLower.includes('glucose')) {
    fields = [
      { name: 'hba1c', label: 'HbA1c (Glycated Hb)', type: 'numeric', unit: '%', reference_range: { min: 4.0, max: 5.7, refText: '< 5.7 %' } },
      { name: 'fasting_glucose', label: 'Fasting Blood Sugar', type: 'numeric', unit: 'mg/dL', reference_range: { min: 70, max: 99, refText: '70 - 99 mg/dL' } },
      { name: 'estimated_avg_glucose', label: 'Estimated Avg Glucose', type: 'numeric', unit: 'mg/dL', reference_range: { min: 70, max: 126, refText: '70 - 126 mg/dL' } },
      { name: 'technician_notes', label: 'Observations', type: 'textarea' }
    ]
  } else if (testNameLower.includes('thyroid') || testNameLower.includes('tsh')) {
    fields = [
      { name: 'tsh', label: 'TSH (Ultrasensitive)', type: 'numeric', unit: 'µIU/mL', reference_range: { min: 0.35, max: 4.94, refText: '0.35 - 4.94 µIU/mL' } },
      { name: 'total_t3', label: 'Total T3', type: 'numeric', unit: 'ng/mL', reference_range: { min: 0.8, max: 2.0, refText: '0.8 - 2.0 ng/mL' } },
      { name: 'total_t4', label: 'Total T4', type: 'numeric', unit: 'µg/dL', reference_range: { min: 5.1, max: 14.1, refText: '5.1 - 14.1 µg/dL' } },
      { name: 'technician_notes', label: 'Observations', type: 'textarea' }
    ]
  } else if (testNameLower.includes('liver') || testNameLower.includes('lft')) {
    fields = [
      { name: 'total_bilirubin', label: 'Total Bilirubin', type: 'numeric', unit: 'mg/dL', reference_range: { min: 0.2, max: 1.2, refText: '0.2 - 1.2 mg/dL' } },
      { name: 'sgot_ast', label: 'SGOT / AST', type: 'numeric', unit: 'U/L', reference_range: { min: 5, max: 40, refText: '5 - 40 U/L' } },
      { name: 'sgpt_alt', label: 'SGPT / ALT', type: 'numeric', unit: 'U/L', reference_range: { min: 7, max: 56, refText: '7 - 56 U/L' } },
      { name: 'alkaline_phosphatase', label: 'Alkaline Phosphatase (ALP)', type: 'numeric', unit: 'U/L', reference_range: { min: 44, max: 147, refText: '44 - 147 U/L' } },
      { name: 'serum_albumin', label: 'Serum Albumin', type: 'numeric', unit: 'g/dL', reference_range: { min: 3.5, max: 5.2, refText: '3.5 - 5.2 g/dL' } },
      { name: 'technician_notes', label: 'Observations', type: 'textarea' }
    ]
  } else {
    fields = [
      { name: 'hemoglobin', label: 'Hemoglobin (Hb)', type: 'numeric', unit: 'g/dL', reference_range: { min: 13.0, max: 17.0, refText: '13.0 - 17.0 g/dL' } },
      { name: 'wbc_count', label: 'WBC Total Count', type: 'numeric', unit: '/µL', reference_range: { min: 4000, max: 11000, refText: '4,000 - 11,000 /µL' } },
      { name: 'rbc_count', label: 'RBC Total Count', type: 'numeric', unit: 'million/µL', reference_range: { min: 4.5, max: 5.5, refText: '4.5 - 5.5 million/µL' } },
      { name: 'platelet_count', label: 'Platelet Count', type: 'numeric', unit: 'Lakh/µL', reference_range: { min: 1.5, max: 4.5, refText: '1.5 - 4.5 Lakh/µL' } },
      { name: 'pcv', label: 'PCV / Hematocrit', type: 'numeric', unit: '%', reference_range: { min: 40.0, max: 50.0, refText: '40.0 - 50.0 %' } },
      { name: 'technician_notes', label: 'Observations', type: 'textarea' }
    ]
  }

  // Extract text observations notes if they exist
  const observationsField = fields.find(f => f.type === 'textarea')
  const numericFields = fields.filter(f => f.type !== 'textarea')
  const obsKey = observationsField ? (observationsField.name || observationsField.id || observationsField.label) : null
  const observationsValue = (obsKey ? mergedData[obsKey] : null) || mergedData['technician_notes'] || mergedData['observations'] || ''

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.logoText}>MEDILIFE PATHOLOGY</Text>
            <Text style={styles.subHeader}>Accredited Medical Diagnostics Laboratories</Text>
          </View>
          <View>
            <Text style={styles.tenantName}>Jhansi Medilife Pathology Lab</Text>
            <Text style={styles.subHeader}>Location ID: Jhansi-01 • SaaS Integrated</Text>
          </View>
        </View>

        {/* Patient / Report Details Section */}
        <View style={styles.patientInfoContainer}>
          <View style={styles.infoCol}>
            <Text style={styles.infoText}>
              <Text style={styles.boldLabel}>Patient Name: </Text>{report?.patient_name || 'John Doe'}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.boldLabel}>Report Ref ID: </Text>{report?.id || 'REF-NABL-01'}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoText}>
              <Text style={styles.boldLabel}>Investigation Type: </Text>{testName}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.boldLabel}>Date Generated: </Text>{new Date(report?.created_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Lab Results Table */}
        <Text style={styles.sectionTitle}>Biomarker Diagnostics Findings</Text>
        <View style={styles.table}>
          
          {/* Table Header Row */}
          <View style={styles.tableHeader}>
            <Text style={styles.colParam}>Test Parameter</Text>
            <Text style={styles.colValue}>Result Value</Text>
            <Text style={styles.colUnit}>Unit</Text>
            <Text style={styles.colRange}>Reference Interval</Text>
          </View>

          {/* Table Data Rows */}
          {numericFields.map((field, idx) => {
            const fKey = field.name || field.id || field.label
            const rawVal = mergedData[fKey] || mergedData[field.label] || mergedData[field.id] || ''
            const flagged = isOutOfRange(rawVal, field.reference_range)
            const refDisplay = field.reference_range?.refText || (field.reference_range ? `${field.reference_range.min} - ${field.reference_range.max}` : 'N/A')
            
            return (
              <View key={field.name || field.label || `pdf-field-${idx}`} style={styles.tableRow}>
                <Text style={styles.colParam}>{field.label}</Text>
                
                {/* Highlight out-of-range results */}
                <Text style={[styles.colValue, flagged ? styles.outOfRangeValue : null]}>
                  {rawVal}
                  {flagged && <Text style={styles.flaggedText}> *</Text>}
                </Text>
                
                <Text style={styles.colUnit}>{field.unit || '-'}</Text>
                
                <Text style={styles.colRange}>
                  {refDisplay}
                </Text>
              </View>
            )
          })}
        </View>

        {/* Observations / Text Notes */}
        {observationsValue && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesTitle}>Clinical Observations & Notes</Text>
            <Text style={styles.notesBody}>{observationsValue}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Medilife Lab Suite - NABL Accredited - ISO 15189:2022 Certified</Text>
          <Text>Page 1 of 1</Text>
        </View>

      </Page>
    </Document>
  )
}
