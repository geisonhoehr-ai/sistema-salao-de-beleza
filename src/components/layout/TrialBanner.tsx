"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTenant } from "@/contexts/tenant-context"
import { AlertCircle, Crown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export function TrialBanner() {
    const { currentTenant } = useTenant()
    const router = useRouter()
    const [daysLeft, setDaysLeft] = useState<number | null>(null)
    const [isDismissed, setIsDismissed] = useState(false)

    useEffect(() => {
        if (!currentTenant?.trialEndsAt || currentTenant.subscriptionStatus === "active") {
            setDaysLeft(null)
            return
        }

        const trialEnd = new Date(currentTenant.trialEndsAt)
        const now = new Date()
        const diffTime = trialEnd.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        // Só mostra se faltarem 7 dias ou menos
        if (diffDays <= 7 && diffDays >= 0) {
            setDaysLeft(diffDays)
        } else {
            setDaysLeft(null)
        }
    }, [currentTenant])

    if (daysLeft === null || isDismissed) {
        return null
    }

    const getUrgencyColor = () => {
        if (daysLeft <= 2) return "from-red-600 to-orange-600"
        if (daysLeft <= 5) return "from-orange-600 to-yellow-600"
        return "from-blue-600 to-purple-600"
    }

    const getUrgencyText = () => {
        if (daysLeft === 0) return "Seu trial expira hoje!"
        if (daysLeft === 1) return "Seu trial expira amanhã!"
        return `Seu trial expira em ${daysLeft} dias`
    }

    const urgencyIcon = daysLeft <= 2 ? AlertCircle : Crown

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative"
            >
                <div
                    className={`bg-gradient-to-r ${getUrgencyColor()} text-white py-3 px-4 sm:px-6 shadow-lg`}
                >
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {daysLeft <= 2 ? (
                                <AlertCircle className="w-5 h-5 flex-shrink-0 animate-pulse" />
                            ) : (
                                <Crown className="w-5 h-5 flex-shrink-0 animate-pulse" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm sm:text-base font-bold truncate">
                                    {getUrgencyText()}
                                </p>
                                <p className="text-xs sm:text-sm opacity-90 hidden sm:block">
                                    Faça upgrade agora e continue aproveitando todos os recursos
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => router.push("/pricing")}
                                size="sm"
                                className="bg-white text-gray-900 hover:bg-gray-100 font-semibold shadow-lg whitespace-nowrap"
                            >
                                <Crown className="w-4 h-4 mr-2" />
                                Fazer upgrade
                            </Button>
                            <button
                                onClick={() => setIsDismissed(true)}
                                className="p-1 hover:bg-white/20 rounded transition-colors"
                                aria-label="Dispensar"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
