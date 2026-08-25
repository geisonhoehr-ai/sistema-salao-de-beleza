"use client"

import { Bell, ChevronDown, Check, Search, Calendar, DollarSign, Settings, Timer, Megaphone, LogOut } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { useTenant } from "@/contexts/tenant-context"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { notifications as initialNotifications } from "@/mocks/notifications"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

export function Header() {
    const pathname = usePathname()
    const pathSegments = pathname.split('/').filter(Boolean)
    const pageTitleMap: Record<string, string> = {
        dashboard: "Visão Geral",
        agenda: "Agenda",
        clientes: "Clientes",
        servicos: "Serviços",
        galeria: "Galeria",
        funcionarios: "Profissionais",
        financeiro: "Financeiro",
        estoque: "Estoque",
        crm: "Marketing & CRM",
        profissional: "Área do Profissional",
        perfil: "Perfil",
        configuracoes: "Configurações",
        integracoes: "Integrações",
        fechamento: "Fechamento Diário"
    }

    const currentPath = pathSegments[1] || pathSegments[0] || "dashboard"
    const pageTitle = pageTitleMap[currentPath] || currentPath.charAt(0).toUpperCase() + currentPath.slice(1)

    const { currentTenant, setCurrentTenant, allTenants } = useTenant()
    const { isSuperAdmin, logout } = useAuth()
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const [notifications, setNotifications] = useState(initialNotifications)

    const unreadCount = notifications.filter(n => !n.read).length

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ))
    }

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })))
    }

    const notificationIconMap: Record<string, LucideIcon> = {
        appointment: Calendar,
        payment: DollarSign,
        system: Settings,
        reminder: Timer
    }

    const getNotificationIcon = (type: string) => notificationIconMap[type] || Megaphone

    const handleTenantSelect = (tenantId: string) => {
        const tenant = allTenants.find(t => t.id === tenantId)
        if (!tenant) return
        setCurrentTenant(tenant)
        setIsUserMenuOpen(false)
    }

    return (
        <header className="h-16 sticky top-0 z-30 flex items-center justify-between px-6 bg-white border-b border-[#E2E8F0]">
            {/* Left: Page Title & Search Bar */}
            <div className="flex items-center gap-6 flex-1">
                <h1 className="text-lg font-semibold text-[#0F172A] hidden md:block">{pageTitle}</h1>

                {/* Search Bar */}
                <div className="relative max-w-md w-full hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                    <input
                        type="text"
                        placeholder="Buscar clientes, profissionais..."
                        className="w-full h-10 bg-[#F8F9FF] border border-[#E2E8F0] rounded-md pl-10 pr-4 text-sm focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] transition-all outline-none"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 pr-4 border-r border-[#E2E8F0]">
                    <ThemeToggle />

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className="relative w-9 h-9 flex items-center justify-center rounded-md hover:bg-[#F1F5F9] transition-colors"
                        >
                            <Bell className="w-[18px] h-[18px] text-[#64748b]" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#0D9488] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        <AnimatePresence>
                            {isNotificationsOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        className="absolute top-full right-0 mt-2 w-[360px] bg-white rounded-md shadow-lg border border-[#E2E8F0] overflow-hidden z-50"
                                    >
                                        <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0]">
                                            <h3 className="text-sm font-semibold text-[#0F172A]">Notificações</h3>
                                            <button onClick={markAllAsRead} className="text-xs font-medium text-[#0D9488] hover:underline">
                                                Marcar todas como lidas
                                            </button>
                                        </div>

                                        <div className="max-h-[400px] overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="py-12 text-center">
                                                    <Bell className="w-8 h-8 text-[#E2E8F0] mx-auto mb-2" />
                                                    <p className="text-sm text-[#94a3b8]">Nenhuma notificação</p>
                                                </div>
                                            ) : (
                                                notifications.map((n) => (
                                                    <div
                                                        key={n.id}
                                                        onClick={() => markAsRead(n.id)}
                                                        className={cn(
                                                            "p-4 flex gap-3 cursor-pointer transition-colors border-b border-[#F1F5F9] last:border-0",
                                                            !n.read ? "bg-[#0D9488]/5" : "hover:bg-[#F8F9FF]"
                                                        )}
                                                    >
                                                        <div className="w-9 h-9 rounded-md bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                                                            {(() => {
                                                                const Icon = getNotificationIcon(n.type)
                                                                return <Icon className="w-4 h-4 text-[#0D9488]" />
                                                            })()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <p className="text-sm font-medium text-[#0F172A] truncate">{n.title}</p>
                                                                {!n.read && <div className="w-2 h-2 bg-[#0D9488] rounded-full flex-shrink-0 mt-1.5" />}
                                                            </div>
                                                            <p className="text-xs text-[#64748b] mt-0.5 line-clamp-2">{n.message}</p>
                                                            <p className="text-[10px] text-[#94a3b8] mt-1">
                                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* User Profile Menu */}
                <div className="relative">
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-[#F1F5F9] transition-colors"
                    >
                        <div className="w-8 h-8 rounded-md bg-[#0F172A] flex items-center justify-center text-white text-xs font-semibold" suppressHydrationWarning>
                            {currentTenant?.name?.substring(0, 2).toUpperCase() || 'TR'}
                        </div>
                        <div className="text-left hidden lg:block" suppressHydrationWarning>
                            <p className="text-sm font-medium text-[#0F172A] leading-tight">{currentTenant?.name || 'Tratto'}</p>
                            <p className="text-[10px] text-[#94a3b8]">{isSuperAdmin ? 'Super Admin' : 'Administrador'}</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-[#94a3b8]" />
                    </button>

                    <AnimatePresence>
                        {isUserMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    className="absolute right-0 mt-2 w-[240px] rounded-md bg-white border border-[#E2E8F0] shadow-lg z-50 overflow-hidden"
                                >
                                    {/* User Info */}
                                    <div className="p-3 border-b border-[#E2E8F0]">
                                        <p className="text-sm font-medium text-[#0F172A]">{currentTenant?.name}</p>
                                        <p className="text-xs text-[#94a3b8]">{isSuperAdmin ? 'Super Admin' : 'Administrador'}</p>
                                    </div>

                                    {/* Tenant Selector (Super Admin only) */}
                                    {isSuperAdmin && allTenants.length > 1 && (
                                        <div className="border-b border-[#E2E8F0]">
                                            <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wide">Trocar Empresa</p>
                                            <div className="max-h-32 overflow-y-auto">
                                                {allTenants.map((tenant) => {
                                                    const isActive = tenant.id === currentTenant?.id
                                                    return (
                                                        <button
                                                            key={tenant.id}
                                                            onClick={() => {
                                                                handleTenantSelect(tenant.id)
                                                                setIsUserMenuOpen(false)
                                                            }}
                                                            className={cn(
                                                                "w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-[#F8F9FF] transition-colors text-sm",
                                                                isActive && "bg-[#0D9488]/5"
                                                            )}
                                                        >
                                                            <div className="w-6 h-6 rounded bg-[#0F172A] flex items-center justify-center text-white font-medium text-[10px]">
                                                                {tenant.name.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <span className="flex-1 truncate text-[#64748b]">{tenant.name}</span>
                                                            {isActive && <Check className="w-4 h-4 text-[#0D9488]" />}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Menu Actions */}
                                    <div className="p-1">
                                        <Link
                                            href={`/${currentTenant?.slug}/configuracoes`}
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-[#64748b] hover:bg-[#F8F9FF] hover:text-[#0F172A] transition-colors"
                                        >
                                            <Settings className="w-4 h-4" />
                                            Configurações
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setIsUserMenuOpen(false)
                                                logout()
                                            }}
                                            className="flex items-center gap-2.5 w-full px-3 py-2 rounded text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sair
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    )
}
