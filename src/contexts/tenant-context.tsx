"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { tenants, type Tenant } from '@/mocks/tenants'
import { useAuth } from './auth-context'

interface TenantContextType {
    currentTenant: Tenant
    setCurrentTenant: (tenant: Tenant) => void
    allTenants: Tenant[]
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export function TenantProvider({ children }: { children: ReactNode }) {
    const { user, isSuperAdmin } = useAuth()
    const [currentTenant, setCurrentTenantState] = useState<Tenant>(tenants[0])
    const [isHydrated, setIsHydrated] = useState(false)

    // Sync tenant with logged-in user
    useEffect(() => {
        if (!user) return

        if (!isSuperAdmin && user.companyId) {
            const userTenant = tenants.find(t => t.id === user.companyId)
            if (userTenant) {
                setCurrentTenantState(userTenant)
                localStorage.setItem('currentTenantId', userTenant.id)
            }
        } else {
            // For super admins, allow loading from localStorage
            const savedTenantId = localStorage.getItem('currentTenantId')
            if (savedTenantId) {
                const savedTenant = tenants.find(t => t.id === savedTenantId)
                if (savedTenant) {
                    setCurrentTenantState(savedTenant)
                }
            }
        }
        setIsHydrated(true)
    }, [user, isSuperAdmin])

    const setCurrentTenant = (tenant: Tenant) => {
        // Only allow switching if super admin
        if (isSuperAdmin) {
            setCurrentTenantState(tenant)
            localStorage.setItem('currentTenantId', tenant.id)
        }
    }

    // Prevent hydration mismatch by not rendering until client-side
    if (!isHydrated) {
        return null
    }

    return (
        <TenantContext.Provider value={{
            currentTenant,
            setCurrentTenant,
            allTenants: tenants
        }}>
            {children}
        </TenantContext.Provider>
    )
}

export function useTenant() {
    const context = useContext(TenantContext)
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider')
    }
    return context
}
