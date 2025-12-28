"use client"

import { Bell, ChevronDown, Check } from "lucide-react"
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
    const pageTitle = pathSegments[0]?.charAt(0).toUpperCase() + pathSegments[0]?.slice(1) || "Dashboard"

    const { currentTenant, setCurrentTenant, allTenants } = useTenant()
    const { isSuperAdmin } = useAuth()
    const [isTenantMenuOpen, setIsTenantMenuOpen] = useState(false)
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

    const getNotificationIcon = (type: string) => {
        const icons = {
            appointment: '📅',
            payment: '💰',
            system: '⚙️',
            reminder: '⏰'
        }
        return icons[type as keyof typeof icons] || '📢'
    }

    return (
        <header className="h-16 sticky top-0 z-30 flex items-center justify-between px-8 bg-white/50 dark:bg-black/50 backdrop-blur-md border-b border-black/5 dark:border-white/5">
            {/* Left: Page Title & Tenant Selector */}
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold tracking-tight text-foreground/80">{pageTitle}</h1>

                {/* Tenant Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => isSuperAdmin && setIsTenantMenuOpen(!isTenantMenuOpen)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 group",
                            isSuperAdmin
                                ? "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                                : "bg-transparent cursor-default px-0"
                        )}
                    >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                            {currentTenant.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-foreground/70">{currentTenant.name}</span>
                        {isSuperAdmin && (
                            <ChevronDown className={cn(
                                "w-4 h-4 text-muted-foreground transition-transform duration-200",
                                isTenantMenuOpen && "rotate-180"
                            )} />
                        )}
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                        {isTenantMenuOpen && (
                            <>
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsTenantMenuOpen(false)}
                                />

                                {/* Menu */}
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden z-50"
                                >
                                    <div className="p-2">
                                        <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Trocar Empresa
                                        </div>
                                        {allTenants.map((tenant) => (
                                            <button
                                                key={tenant.id}
                                                onClick={() => {
                                                    setCurrentTenant(tenant)
                                                    setIsTenantMenuOpen(false)
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                                    {tenant.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <div className="text-sm font-medium text-foreground">{tenant.fullName}</div>
                                                    <div className="text-xs text-muted-foreground">{tenant.description}</div>
                                                </div>
                                                {currentTenant.id === tenant.id && (
                                                    <Check className="w-4 h-4 text-primary" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                <ThemeToggle />

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                        <Bell className="w-5 h-5 text-muted-foreground" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-black flex items-center justify-center text-[10px] text-white font-bold">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    <AnimatePresence>
                        {isNotificationsOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsNotificationsOpen(false)}
                                />

                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="absolute top-full right-0 mt-2 w-96 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden z-50"
                                >
                                    <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
                                        <h3 className="font-semibold">Notificações</h3>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={markAllAsRead}
                                                className="text-xs text-primary hover:underline"
                                            >
                                                Marcar todas como lidas
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-muted-foreground">
                                                Nenhuma notificação
                                            </div>
                                        ) : (
                                            notifications.map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    className={`p-4 border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${!notification.read ? 'bg-primary/5' : ''
                                                        }`}
                                                    onClick={() => {
                                                        markAsRead(notification.id)
                                                        if (notification.link) {
                                                            setIsNotificationsOpen(false)
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <p className="font-medium text-sm">{notification.title}</p>
                                                                {!notification.read && (
                                                                    <span className="w-2 h-2 bg-primary rounded-full" />
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {notification.message}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-2">
                                                                {formatDistanceToNow(new Date(notification.createdAt), {
                                                                    addSuffix: true,
                                                                    locale: ptBR
                                                                })}
                                                            </p>
                                                        </div>
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

                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-400 border border-white/20 shadow-sm cursor-pointer hover:shadow-md transition-shadow"></div>
            </div>
        </header>
    )
}
