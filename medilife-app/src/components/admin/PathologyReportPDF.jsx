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

export default function PathologyReportPDF({ report, formData = {} }) {
  const testName = report?.test_catalog?.test_name || report?.test_name || 'Diagnostic Pathology Profile'
  let fields = report?.test_catalog?.report_schema?.fields || []

  // Fallback: If report_schema fields are missing, derive fields dynamically from formData keys or standard template
  if (!fields || fields.length === 0) {
    const keys = Object.keys(formData || {})
    if (keys.length > 0) {
      fields = keys.map(k => {
        if (k.includes('note') || k.includes('obs') || k === 'observations' || k === 'technician_notes') {
          return { name: k, id: k, label: 'Observations', type: 'textarea' }
        }
        return {
          name: k,
          id: k,
          label: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          type: 'numeric',
          unit: k.includes('hgb') || k.includes('hemo') ? 'g/dL' : 'mg/dL',
          reference_range: { min: 12.0, max: 18.0 }
        }
      })
    } else {
      // Default standard Hematology template
      fields = [
        { name: 'hemoglobin', id: 'hemoglobin', label: 'Hemoglobin (Hb)', type: 'numeric', unit: 'g/dL', reference_range: { min: 13.8, max: 17.2 } },
        { name: 'technician_notes', id: 'technician_notes', label: 'Observations', type: 'textarea' }
      ]
    }
  }

  // Extract text observations notes if they exist
  const observationsField = fields.find(f => f.type === 'textarea')
  const numericFields = fields.filter(f => f.type !== 'textarea')
  const obsKey = observationsField ? (observationsField.name || observationsField.id || observationsField.label) : null
  const observationsValue = (obsKey ? formData[obsKey] : null) || formData['technician_notes'] || formData['observations'] || ''

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
              <Text style={styles.boldLabel}>Patient Name: </Text>{report.patient_name}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.boldLabel}>Report Ref ID: </Text>{report.id}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoText}>
              <Text style={styles.boldLabel}>Investigation Type: </Text>{testName}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.boldLabel}>Date Generated: </Text>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
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
            const rawVal = formData[fKey] || ''
            const flagged = isOutOfRange(rawVal, field.reference_range)
            
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
                  {field.reference_range 
                    ? `${field.reference_range.min} - ${field.reference_range.max}` 
                    : 'N/A'
                  }
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
