"use client"

import { useState, useEffect } from "react"
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
    ChevronLeft,
    ChevronRight,
    Home,
    Store,
    ChevronDown,
    BarChart3,
    Megaphone,
    Gift,
    MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function Sidebar() {
    const pathname = usePathname()
    const { logout } = useAuth()
    const { currentTenant } = useTenant()
    const { checkPermission } = useSubscription(currentTenant)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [expandedMenus, setExpandedMenus] = useState<string[]>(['Principal'])

    // Load collapsed state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('sidebar-collapsed')
        if (saved !== null) {
            setIsCollapsed(saved === 'true')
        }
    }, [])

    // Save collapsed state
    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', isCollapsed.toString())
    }, [isCollapsed])

    const slug = currentTenant?.slug || 'demo'

    const menuSections = [
        {
            title: "Principal",
            items: [
                { icon: Home, label: "Home", href: `/${slug}/dashboard`, permission: null },
                { icon: Calendar, label: "Agenda", href: `/${slug}/agenda`, permission: null },
            ]
        },
        {
            title: "Meu Estabelecimento",
            items: [
                { icon: Users, label: "Clientes", href: `/${slug}/clientes`, permission: null },
                { icon: UserCircle, label: "Profissionais", href: `/${slug}/funcionarios`, permission: null },
                { icon: Scissors, label: "Serviços", href: `/${slug}/servicos`, permission: null },
            ]
        },
        {
            title: "Financeiro",
            items: [
                { icon: DollarSign, label: "Financeiro", href: `/${slug}/financeiro`, permission: null },
                { icon: ClipboardList, label: "Fechamento Diário", href: `/${slug}/fechamento`, permission: null },
            ]
        },
        {
            title: "Relatórios",
            items: [
                { icon: BarChart3, label: "Relatórios", href: `/${slug}/relatorios`, permission: null },
            ]
        },
        {
            title: "Marketing",
            items: [
                { icon: Gift, label: "Cupons", href: `/${slug}/marketing/cupons`, permission: null },
                { icon: MessageSquare, label: "Automações WhatsApp", href: `/${slug}/marketing/whatsapp`, permission: null },
            ]
        }
    ]

    const toggleMenu = (title: string) => {
        setExpandedMenus(prev =>
            prev.includes(title)
                ? prev.filter(t => t !== title)
                : [...prev, title]
        )
    }

    return (
        <>
            {/* Mobile Hamburger Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="fixed top-4 left-4 z-50 md:hidden rounded-md bg-[#F97316] shadow-sm border-0"
            >
                {isMobileMenuOpen ? (
                    <X className="w-5 h-5 text-white" />
                ) : (
                    <Menu className="w-5 h-5 text-white" />
                )}
            </Button>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Trinks Style (Orange) */}
            <aside className={cn(
                "h-screen sticky top-0 bg-[#F97316] flex flex-col z-40 transition-all duration-300",
                "fixed md:static",
                isCollapsed ? "w-[68px]" : "w-60",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                {/* Logo Area */}
                <div className={cn(
                    "h-16 flex items-center border-b border-white/10",
                    isCollapsed ? "px-3 justify-center" : "px-5"
                )}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                            <Store className="w-5 h-5 text-[#F97316]" />
                        </div>
                        {!isCollapsed && (
                            <div className="overflow-hidden">
                                <span className="font-bold text-white text-sm">tratto</span>
                                <p className="text-[10px] text-white/70 font-medium truncate max-w-[130px]">
                                    {currentTenant?.name || 'Sistema de Gestão'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                    {menuSections.map((section) => {
                        const isExpanded = expandedMenus.includes(section.title)

                        return (
                            <div key={section.title}>
                                {/* Section Header - Clickable */}
                                {!isCollapsed && (
                                    <button
                                        onClick={() => toggleMenu(section.title)}
                                        className="w-full flex items-center justify-between px-3 py-2 mb-1 text-[11px] font-semibold text-white/60 uppercase tracking-wider hover:text-white/80 transition-colors"
                                    >
                                        <span>{section.title}</span>
                                        <ChevronDown className={cn(
                                            "w-3 h-3 transition-transform",
                                            isExpanded ? "rotate-0" : "-rotate-90"
                                        )} />
                                    </button>
                                )}

                                {/* Menu Items */}
                                {(isCollapsed || isExpanded) && (
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
                                                    title={isCollapsed ? item.label : undefined}
                                                    className={cn(
                                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 group select-none",
                                                        isActive
                                                            ? "bg-white/20 text-white"
                                                            : "text-white/80 hover:bg-white/10 hover:text-white",
                                                        isLocked && "opacity-50 cursor-not-allowed hover:bg-transparent",
                                                        isCollapsed && "justify-center px-2"
                                                    )}
                                                    suppressHydrationWarning
                                                >
                                                    <Icon className={cn(
                                                        "w-5 h-5 flex-shrink-0 transition-colors",
                                                        isActive ? "text-white" : "text-white/70 group-hover:text-white"
                                                    )} />

                                                    {!isCollapsed && (
                                                        <>
                                                            <span className="flex-1">{item.label}</span>
                                                            {isLocked ? (
                                                                <Lock className="w-3 h-3 text-yellow-300" />
                                                            ) : isActive ? (
                                                                <ChevronRight className="w-3 h-3 text-white/60" />
                                                            ) : null}
                                                        </>
                                                    )}
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </nav>

                {/* Settings & Logout */}
                <div className="p-2 border-t border-white/10 space-y-0.5">
                    <Link
                        href={`/${slug}/configuracoes`}
                        title={isCollapsed ? "Configurações" : undefined}
                        className={cn(
                            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors",
                            pathname.includes('/configuracoes')
                                ? "bg-white/20 text-white"
                                : "text-white/80 hover:bg-white/10 hover:text-white",
                            isCollapsed && "justify-center px-2"
                        )}
                    >
                        <Settings className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span>Configurações</span>}
                    </Link>
                    <button
                        onClick={logout}
                        title={isCollapsed ? "Sair" : undefined}
                        className={cn(
                            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors",
                            isCollapsed && "justify-center px-2"
                        )}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span>Sair</span>}
                    </button>
                </div>

                {/* Collapse Button */}
                <div className="p-2 border-t border-white/10">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={cn(
                            "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[12px] font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors",
                            isCollapsed && "justify-center px-2"
                        )}
                    >
                        <ChevronLeft className={cn(
                            "w-4 h-4 transition-transform",
                            isCollapsed && "rotate-180"
                        )} />
                        {!isCollapsed && <span>Recolher Menu</span>}
                    </button>
                </div>
            </aside>
        </>
    )
}
