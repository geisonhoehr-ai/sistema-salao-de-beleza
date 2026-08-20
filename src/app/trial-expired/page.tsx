"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertCircle, Crown, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useTenant } from "@/contexts/tenant-context"

// Force dynamic rendering to avoid SSR issues with context
export const dynamic = 'force-dynamic'

export default function TrialExpiredPage() {
    const router = useRouter()

    // Safe tenant access - may not be in provider during SSR
    let currentTenant = null
    try {
        currentTenant = useTenant().currentTenant
    } catch (e) {
        // Not in provider, will use fallback
    }

    return (
        <div className="fixed inset-0 bg-white dark:bg-zinc-950 flex items-center justify-center p-4">
            {/* Background decorations */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 opacity-40" />
            <div className="absolute top-20 left-10 w-72 h-72 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute top-40 right-10 w-72 h-72 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full relative z-10"
            >
                <Card className="p-8 sm:p-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 shadow-2xl">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-2xl shadow-orange-500/30">
                            <AlertCircle className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl sm:text-4xl font-black text-center text-gray-900 dark:text-white mb-4">
                        Seu período de avaliação expirou
                    </h1>

                    {/* Subtitle */}
                    <p className="text-center text-gray-600 dark:text-zinc-400 mb-8 text-lg">
                        Continue aproveitando todos os recursos do <strong>{currentTenant?.name || "Tratto"}</strong> fazendo upgrade para um plano pago.
                    </p>

                    {/* Benefits List */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-zinc-800 dark:to-zinc-900 rounded-xl p-6 mb-8">
                        <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Crown className="w-5 h-5 text-purple-600" />
                            O que você continua tendo:
                        </h2>
                        <ul className="space-y-3">
                            {[
                                "Agenda ilimitada",
                                "Gestão completa de clientes",
                                "Controle financeiro avançado",
                                "Comissões automáticas",
                                "Fechamento de caixa diário",
                                "Relatórios e analytics",
                                "Suporte prioritário",
                            ].map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700 dark:text-zinc-300">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-3">
                        <Button
                            onClick={() => router.push("/pricing")}
                            className="w-full h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-lg shadow-lg shadow-purple-500/30"
                        >
                            <Crown className="w-5 h-5 mr-2" />
                            Ver planos e fazer upgrade
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                        <p className="text-center text-sm text-gray-500 dark:text-zinc-500">
                            A partir de R$ 79/mês • Cancele quando quiser
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-zinc-700" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white dark:bg-zinc-900 text-gray-500 dark:text-zinc-500">
                                ou
                            </span>
                        </div>
                    </div>

                    {/* Secondary Action */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-zinc-400 mb-3">
                            Precisa de mais tempo para decidir?
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                // Pode implementar lógica de "falar com vendas" aqui
                                window.location.href = "mailto:vendas@tratto.app?subject=Extensão de Trial"
                            }}
                            className="font-semibold"
                        >
                            Falar com nossa equipe
                        </Button>
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}
