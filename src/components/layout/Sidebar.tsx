"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import {
    Calendar,
    LayoutDashboard,
    Users,
    Settings,
    Scissors,
    UserCircle,
    LogOut,
    Building2
} from "lucide-react"

const menuSections = [
    {
        title: "Principal",
        items: [
            { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
            { icon: Calendar, label: "Agenda", href: "/agenda" },
        ]
    },
    {
        title: "Gestão",
        items: [
            { icon: Users, label: "Clientes", href: "/clientes" },
            { icon: Scissors, label: "Serviços", href: "/servicos" },
            { icon: UserCircle, label: "Funcionários", href: "/funcionarios" },
        ]
    },
    {
        title: "Configurações",
        items: [
            { icon: Building2, label: "Perfil", href: "/perfil" },
            { icon: Settings, label: "Configurações", href: "/configuracoes" },
        ]
    }
]

export function Sidebar() {
    const pathname = usePathname()
    const { logout } = useAuth()

    return (
        <aside className="w-64 h-screen sticky top-0 border-r border-black/5 dark:border-white/10 bg-white/70 dark:bg-black/70 backdrop-blur-xl flex flex-col z-40">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-black/5 dark:border-white/10">
                <div className="flex items-center gap-2 text-primary">
                    <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                        <Scissors className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-lg tracking-tight text-foreground">BeautyFlow</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto">
                {menuSections.map((section) => (
                    <div key={section.title}>
                        <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {section.title}
                        </p>
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const isActive = pathname.startsWith(item.href)
                                const Icon = item.icon

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                                            isActive
                                                ? "bg-primary/10 text-primary shadow-sm"
                                                : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                                        )}
                                    >
                                        <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User / Logout */}
            <div className="p-4 border-t border-black/5 dark:border-white/10">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Sair
                </button>
            </div>
        </aside>
    )
}
