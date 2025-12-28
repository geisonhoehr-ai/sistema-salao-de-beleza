"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ShieldCheck, ChevronLeft, ArrowRight, Lock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { tenants } from "@/mocks/tenants"
import { mockCustomers } from "@/mocks/customers"
import { cn } from "@/lib/utils"

export default function CustomerLoginPage() {
    const params = useParams()
    const router = useRouter()
    const tenantSlug = params.tenantSlug as string

    const tenant = useMemo(() => {
        return tenants.find(t => t.slug === tenantSlug) || tenants[0]
    }, [tenantSlug])

    const [cpf, setCpf] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        const customer = mockCustomers.find(c => c.cpf === cpf && c.password === password)

        if (customer) {
            // In a real app, we would set a session/cookie here
            // For the mockup, we'll redirect to profile with the email as a param
            router.push(`/${tenantSlug}/profile?email=${customer.email}`)
        } else {
            setError("CPF ou senha incorretos. Tente novamente.")
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-6 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-8"
            >
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 rounded-[2rem] bg-primary mx-auto flex items-center justify-center text-white text-3xl shadow-xl shadow-primary/20">
                        {tenant.logo}
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Área do Cliente</h1>
                        <p className="text-slate-500 dark:text-zinc-400 font-medium">Acesse seus agendamentos e pontos em {tenant.name}.</p>
                    </div>
                </div>

                <Card className="p-8 rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-zinc-900">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">CPF</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="000.000.000-00"
                                    value={cpf}
                                    onChange={(e) => setCpf(e.target.value)}
                                    className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-transparent bg-slate-50 dark:bg-zinc-800 shadow-sm focus:border-primary focus:ring-0 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Senha</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-transparent bg-slate-50 dark:bg-zinc-800 shadow-sm focus:border-primary focus:ring-0 transition-all font-medium"
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-xs font-bold text-red-500 text-center">{error}</p>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-14 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Entrar
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-50 dark:border-zinc-800 text-center">
                        <p className="text-sm text-slate-400 font-medium">
                            Ainda não tem acesso? <br />
                            <span className="text-primary font-bold cursor-pointer" onClick={() => router.push(`/${tenantSlug}/book`)}>
                                Agende um serviço para criar seu perfil.
                            </span>
                        </p>
                    </div>
                </Card>

                <Button
                    variant="ghost"
                    onClick={() => router.push(`/${tenantSlug}/book`)}
                    className="w-full text-slate-400 font-bold hover:text-primary transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Voltar ao Agendamento
                </Button>
            </motion.div>
        </div>
    )
}
