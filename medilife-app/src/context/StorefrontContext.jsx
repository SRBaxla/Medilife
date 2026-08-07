import React, { createContext, useContext, useState, useEffect } from 'react'

const StorefrontContext = createContext(null)

export function StorefrontProvider({ children, tenant, catalog, notFound }) {
  const [storefrontTenant, setStorefrontTenant] = useState(tenant)
  const [testCatalog, setTestCatalog] = useState(catalog || [])

  useEffect(() => {
    if (tenant) {
      setStorefrontTenant(tenant)
    }
    if (catalog) {
      setTestCatalog(catalog)
    }
  }, [tenant, catalog])

  const value = {
    tenant: storefrontTenant,
    catalog: testCatalog,
    notFound: !!notFound,
    brandColor: storefrontTenant?.brand_color || '#0d9488',
    labName: storefrontTenant?.business_name || 'Medilife Pathology Lab',
    address: storefrontTenant?.primary_address || 'Jhansi, UP',
    phone: storefrontTenant?.contact_phone || '+91 98765 43210'
  }

  return (
    <StorefrontContext.Provider value={value}>
      {children}
    </StorefrontContext.Provider>
  )
}

export function useStorefront() {
  const context = useContext(StorefrontContext)
  if (!context) {
    throw new Error("useStorefront must be used within a StorefrontProvider")
  }
  return context
}
