"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useTenant } from "@/contexts/tenant-context"
import { useSubscription } from "@/hooks/useSubscription"
import { cn } from "@/lib/utils"
import {
    Calendar,
    LayoutDashboard,
    Users,
    Settings,
    Scissors,
    UserCircle,
    LogOut,
    DollarSign,
    Menu,
    X,
    Lock,
    ClipboardList,
    ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function Sidebar() {
    const pathname = usePathname()
    const { logout } = useAuth()
    const { currentTenant } = useTenant()
    const { checkPermission } = useSubscription(currentTenant)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const slug = currentTenant?.slug || 'demo'
    const menuSections = [
        {
            title: "Principal",
            items: [
                { icon: LayoutDashboard, label: "Visão Geral", href: `/${slug}/dashboard`, permission: null },
                { icon: Calendar, label: "Agenda", href: `/${slug}/agenda`, permission: null },
            ]
        },
        {
            title: "Gestão",
            items: [
                { icon: Users, label: "Clientes", href: `/${slug}/clientes`, permission: null },
                { icon: Scissors, label: "Serviços", href: `/${slug}/servicos`, permission: null },
                { icon: UserCircle, label: "Profissionais", href: `/${slug}/funcionarios`, permission: null },
            ]
        },
        {
            title: "Financeiro",
            items: [
                { icon: DollarSign, label: "Financeiro", href: `/${slug}/financeiro`, permission: null },
                { icon: ClipboardList, label: "Fechamento Diário", href: `/${slug}/fechamento`, permission: null },
            ]
        }
    ]

    return (
        <>
            {/* Mobile Hamburger Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="fixed top-4 left-4 z-50 md:hidden rounded-md bg-white shadow-sm border border-[#E2E8F0]"
            >
                {isMobileMenuOpen ? (
                    <X className="w-5 h-5 text-[#0F172A]" />
                ) : (
                    <Menu className="w-5 h-5 text-[#0F172A]" />
                )}
            </Button>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "w-60 h-screen sticky top-0 border-r border-[#E2E8F0] bg-white flex flex-col z-40 transition-transform duration-300",
                "fixed md:static",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                {/* Logo Area */}
                <div className="h-16 flex items-center px-5 border-b border-[#E2E8F0]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-[#0F172A] flex items-center justify-center">
                            <span className="text-white font-bold text-sm">T</span>
                        </div>
                        <div>
                            <span className="font-semibold text-[#0F172A] text-sm">Tratto</span>
                            <p className="text-[10px] text-[#64748b] font-medium truncate max-w-[140px]">
                                {currentTenant?.name || 'Sistema de Gestão'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
                    {menuSections.map((section) => (
                        <div key={section.title}>
                            <p className="px-3 mb-2 text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider">
                                {section.title}
                            </p>
                            <div className="space-y-0.5">
                                {section.items.map((item) => {
                                    const isActive = pathname.startsWith(item.href)
                                    const isLocked = item.permission ? !checkPermission(item.permission) : false
                                    const Icon = item.icon

                                    return (
                                        <Link
                                            key={item.href}
                                            href={isLocked ? '#' : item.href}
                                            onClick={(e) => {
                                                if (isLocked) {
                                                    e.preventDefault()
                                                    alert("Funcionalidade bloqueada no seu plano atual. Faça o upgrade!")
                                                }
                                                setIsMobileMenuOpen(false)
                                            }}
                                            className={cn(
                                                "flex items-center justify-between px-3 py-2 rounded-md text-[13px] font-medium transition-all duration-150 group select-none",
                                                isActive
                                                    ? "bg-[#0D9488]/10 text-[#0D9488] border-l-2 border-[#0D9488] ml-[-1px]"
                                                    : "text-[#64748b] hover:bg-[#F1F5F9] hover:text-[#0F172A]",
                                                isLocked && "opacity-50 cursor-not-allowed hover:bg-transparent"
                                            )}
                                            suppressHydrationWarning
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <Icon className={cn(
                                                    "w-4 h-4 transition-colors",
                                                    isActive ? "text-[#0D9488]" : "text-[#94a3b8] group-hover:text-[#64748b]"
                                                )} />
                                                {item.label}
                                            </div>

                                            {isLocked ? (
                                                <Lock className="w-3 h-3 text-amber-500" />
                                            ) : isActive ? (
                                                <ChevronRight className="w-3 h-3 text-[#0D9488]" />
                                            ) : null}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Settings & Logout */}
                <div className="p-3 border-t border-[#E2E8F0] space-y-1">
                    <Link
                        href={`/${slug}/configuracoes`}
                        className={cn(
                            "flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-[13px] font-medium transition-colors",
                            pathname.includes('/configuracoes')
                                ? "bg-[#0D9488]/10 text-[#0D9488]"
                                : "text-[#64748b] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                        )}
                    >
                        <Settings className="w-4 h-4" />
                        Configurações
                    </Link>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-[13px] font-medium text-[#64748b] hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair
                    </button>
                </div>
            </aside>
        </>
    )
}
