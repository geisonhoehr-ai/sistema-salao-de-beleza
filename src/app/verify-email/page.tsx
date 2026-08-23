"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, ArrowRight, RefreshCw, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

export default function VerifyEmailPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [isResending, setIsResending] = useState(false)
    const [resendSuccess, setResendSuccess] = useState(false)

    useEffect(() => {
        // Get pending registration data
        const pendingData = localStorage.getItem("pendingRegistration")
        if (pendingData) {
            const data = JSON.parse(pendingData)
            setEmail(data.email)
        } else {
            // No pending registration, redirect to register
            router.push("/register")
        }
    }, [router])

    const handleResendEmail = async () => {
        if (!email) return

        setIsResending(true)
        setResendSuccess(false)

        try {
            const { error } = await supabase.auth.resend({
                type: "signup",
                email: email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
            })

            if (error) {
                console.error("Resend error:", error)
                alert("Erro ao reenviar email. Tente novamente.")
            } else {
                setResendSuccess(true)
                setTimeout(() => setResendSuccess(false), 5000)
            }
        } catch (err) {
            console.error("Resend exception:", err)
            alert("Erro ao reenviar email. Tente novamente.")
        } finally {
            setIsResending(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-white dark:bg-zinc-950 flex items-center justify-center p-4">
            {/* Background decorations */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-40" />
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg w-full relative z-10"
            >
                <Card className="p-8 sm:p-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 shadow-2xl">
                    {/* Animated Mail Icon */}
                    <div className="flex justify-center mb-6">
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 1,
                            }}
                            className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-2xl shadow-blue-500/30"
                        >
                            <Mail className="w-10 h-10 text-white" />
                        </motion.div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl sm:text-4xl font-black text-center text-gray-900 dark:text-white mb-4">
                        Verifique seu email
                    </h1>

                    {/* Instructions */}
                    <div className="space-y-4 mb-8">
                        <p className="text-center text-gray-600 dark:text-zinc-400 text-lg">
                            Enviamos um link de confirmação para:
                        </p>
                        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                            <p className="text-center font-bold text-blue-900 dark:text-blue-100 break-all">
                                {email}
                            </p>
                        </div>
                        <p className="text-center text-sm text-gray-600 dark:text-zinc-400">
                            Clique no link do email para ativar sua conta e criar sua empresa.
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-900 rounded-xl p-6 mb-8">
                        <h2 className="font-bold text-sm text-gray-900 dark:text-white mb-4">
                            Próximos passos:
                        </h2>
                        <ol className="space-y-3">
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    1
                                </div>
                                <span className="text-sm text-gray-700 dark:text-zinc-300">
                                    Abra sua caixa de entrada
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    2
                                </div>
                                <span className="text-sm text-gray-700 dark:text-zinc-300">
                                    Procure por email de <strong>noreply@...</strong>
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    3
                                </div>
                                <span className="text-sm text-gray-700 dark:text-zinc-300">
                                    Clique no botão <strong>&ldquo;Confirmar email&rdquo;</strong>
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    <CheckCircle className="w-4 h-4" />
                                </div>
                                <span className="text-sm text-gray-700 dark:text-zinc-300">
                                    Pronto! Você será redirecionado automaticamente
                                </span>
                            </li>
                        </ol>
                    </div>

                    {/* Resend Section */}
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200 dark:border-zinc-700" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white dark:bg-zinc-900 text-gray-500 dark:text-zinc-500">
                                    Não recebeu o email?
                                </span>
                            </div>
                        </div>

                        {resendSuccess && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                            >
                                <p className="text-sm text-green-700 dark:text-green-300 text-center font-medium flex items-center justify-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Email reenviado com sucesso!
                                </p>
                            </motion.div>
                        )}

                        <Button
                            onClick={handleResendEmail}
                            disabled={isResending}
                            variant="outline"
                            className="w-full h-12 rounded-full font-semibold"
                        >
                            {isResending ? (
                                <div className="flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Reenviando...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4" />
                                    Reenviar email de confirmação
                                </div>
                            )}
                        </Button>

                        <p className="text-xs text-center text-gray-500 dark:text-zinc-500">
                            Verifique também sua pasta de spam ou lixo eletrônico
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-zinc-700 text-center">
                        <p className="text-sm text-gray-600 dark:text-zinc-400 mb-3">
                            Email errado?
                        </p>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                localStorage.removeItem("pendingRegistration")
                                router.push("/register")
                            }}
                            className="text-blue-600 hover:text-blue-700 font-semibold"
                        >
                            Voltar e criar nova conta
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}
