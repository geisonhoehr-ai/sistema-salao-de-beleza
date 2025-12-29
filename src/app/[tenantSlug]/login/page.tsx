"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ChevronLeft, ArrowRight, Lock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { tenants } from "@/mocks/tenants"
import { mockCustomers, type Customer } from "@/mocks/customers"
import { Badge } from "@/components/ui/badge"
import { cn, getInitials } from "@/lib/utils"

const normalizeCpf = (value: string) => value.replace(/\D/g, "")

const findCustomerByIdentifier = (identifier: string): Customer | undefined => {
    if (!identifier) return undefined
    if (identifier.includes("@")) {
        return mockCustomers.find((customer) => customer.email.toLowerCase() === identifier.toLowerCase())
    }
    const cpf = normalizeCpf(identifier)
    return mockCustomers.find((customer) => normalizeCpf(customer.cpf) === cpf)
}

export default function CustomerLoginPage() {
    const params = useParams()
    const router = useRouter()
    const tenantSlug = params.tenantSlug as string

    const tenant = useMemo(() => {
        return tenants.find(t => t.slug === tenantSlug) || tenants[0]
    }, [tenantSlug])

    const tenantInitials = useMemo(() => getInitials(tenant.fullName || tenant.name), [tenant.fullName, tenant.name])
    const tenantBadge = tenant.logo || tenantInitials || "BF"

    const [identifier, setIdentifier] = useState("")
    const [stage, setStage] = useState<'identify' | 'password' | 'signup'>('identify')
    const [password, setPassword] = useState("")
    const [detectedCustomer, setDetectedCustomer] = useState<Customer | null>(null)
    const [error, setError] = useState("")

    const resetFlow = () => {
        setStage('identify')
        setDetectedCustomer(null)
        setPassword("")
        setError("")
    }

    const handleIdentify = (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        const customer = findCustomerByIdentifier(identifier)
        if (customer) {
            setDetectedCustomer(customer)
            setStage('password')
            setPassword("")
        } else {
            setDetectedCustomer(null)
            setStage('signup')
        }
    }

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (!detectedCustomer) return
        if (detectedCustomer.password === password) {
            router.push(`/${tenantSlug}/profile?email=${detectedCustomer.email}`)
        } else {
            setError("Senha incorreta. Tente novamente.")
        }
    }

    const loginSteps = [
        { id: 'identify', label: 'Identificação' },
        { id: 'password', label: 'Confirmação' },
        { id: 'signup', label: 'Primeiro acesso' },
    ]
    const currentStepIndex = loginSteps.findIndex(stepItem => stepItem.id === stage)

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-6 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-8"
            >
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 rounded-[2rem] bg-primary mx-auto flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-primary/20">
                        {tenantBadge}
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Área do Cliente</h1>
                        <p className="text-slate-500 dark:text-zinc-400 font-medium">Acesse seus agendamentos e pontos em {tenant.name}.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {loginSteps.map((stepItem, index) => (
                        <div
                            key={stepItem.id}
                            className={cn(
                                "flex-1 h-2 rounded-full",
                                index <= currentStepIndex ? "bg-primary" : "bg-slate-200 dark:bg-zinc-800"
                            )}
                        />
                    ))}
                </div>

                <Card className="p-8 rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-zinc-900 space-y-8">
                    {stage === 'identify' && (
                        <form onSubmit={handleIdentify} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                                    CPF ou e-mail
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="000.000.000-00 ou voce@email.com"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-transparent bg-slate-50 dark:bg-zinc-800 shadow-sm focus:border-primary focus:ring-0 transition-all font-medium"
                                    />
                                </div>
                                <p className="text-xs text-slate-400">
                                    Identificaremos automaticamente se você já possui cadastro.
                                </p>
                            </div>

                            {error && (
                                <p className="text-xs font-bold text-red-500 text-center">{error}</p>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-14 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Continuar
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </form>
                    )}

                    {stage === 'password' && detectedCustomer && (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                                    {detectedCustomer.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-slate-900 dark:text-white">{detectedCustomer.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400">{detectedCustomer.email}</p>
                                </div>
                                <Badge variant="outline" className="rounded-full border-primary/30 text-primary text-[10px] font-bold uppercase tracking-widest">
                                    Cliente
                                </Badge>
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

                            <div className="space-y-3">
                                <Button
                                    type="submit"
                                    className="w-full h-14 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Entrar
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={resetFlow}
                                    className="w-full h-12 rounded-2xl text-slate-400 hover:text-primary"
                                >
                                    Não é você? Informar outro CPF/E-mail
                                </Button>
                            </div>
                        </form>
                    )}

                    {stage === 'signup' && (
                        <div className="space-y-6 text-center">
                            <Badge className="mx-auto w-fit bg-primary/10 text-primary border-none rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em]">
                                Primeiro acesso
                            </Badge>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">Ainda não encontramos você</h3>
                                <p className="text-sm text-slate-500 dark:text-zinc-400">
                                    Use o agendamento online para criar sua conta automaticamente e já garantir seu primeiro horário.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <Button
                                    onClick={() => router.push(`/${tenantSlug}/book`)}
                                    className="w-full h-14 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Agendar e criar acesso
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={resetFlow}
                                    className="w-full h-12 rounded-2xl text-slate-400 hover:text-primary"
                                >
                                    Tentar outro CPF/E-mail
                                </Button>
                            </div>
                        </div>
                    )}
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
