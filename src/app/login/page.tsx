"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { ArrowRight, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const { login, user } = useAuth()
    const router = useRouter()

    // Helper function to get tenant slug and redirect
    const redirectToTenant = async (tenantId: string, basePath: string) => {
        const { data: tenant } = await supabase
            .from("tenants")
            .select("slug")
            .eq("id", tenantId)
            .single()

        if (tenant?.slug) {
            localStorage.setItem("currentTenantId", tenantId)
            localStorage.setItem("tenantSlug", tenant.slug)
            window.location.href = `/${tenant.slug}${basePath}`
        } else {
            // Fallback if tenant not found
            setError("Erro ao encontrar sua empresa. Contate o suporte.")
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const success = await login(email, password)

            if (success) {
                // Get fresh session to get user metadata
                const { data: { session } } = await supabase.auth.getSession()
                const metadata = session?.user?.user_metadata

                if (metadata?.role === 'super_admin') {
                    window.location.href = "/super-admin/dashboard"
                    return
                }

                let tenantId = metadata?.tenant_id

                // Fallback 1: Try localStorage (set during registration)
                if (!tenantId) {
                    tenantId = localStorage.getItem("currentTenantId")
                }

                // Fallback 2: Try to find tenant by owner_id
                if (!tenantId && session?.user?.id) {
                    const { data: ownedTenant } = await supabase
                        .from("tenants")
                        .select("id")
                        .eq("owner_id", session.user.id)
                        .single()

                    if (ownedTenant) {
                        tenantId = ownedTenant.id
                        // Update user metadata for next time
                        await supabase.auth.updateUser({
                            data: { tenant_id: tenantId, role: 'company_admin' }
                        })
                    }
                }

                if (tenantId) {
                    const basePath = metadata?.role === 'employee'
                        ? '/profissional/dashboard'
                        : '/dashboard'
                    await redirectToTenant(tenantId, basePath)
                } else {
                    setError("Conta não associada a uma empresa. Contate o suporte.")
                    setIsLoading(false)
                }
            } else {
                setError("Email ou senha inválidos")
                setIsLoading(false)
            }
        } catch (err) {
            setError("Erro ao fazer login. Tente novamente.")
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const checkUserAndRedirect = async () => {
            if (user) {
                if (user.role === 'super_admin') {
                    router.push('/super-admin/dashboard')
                    return
                }

                if (user.companyId) {
                    const basePath = user.role === 'employee'
                        ? '/profissional/dashboard'
                        : '/dashboard'
                    await redirectToTenant(user.companyId, basePath)
                }
            }
        }
        checkUserAndRedirect()
    }, [user, router])

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1e293b] to-[#0F172A]" />
                <div className="relative z-10 flex flex-col justify-between p-12 text-white">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-[#0D9488] flex items-center justify-center font-bold text-lg">
                                T
                            </div>
                            <span className="text-2xl font-semibold tracking-tight">Tratto</span>
                        </div>
                        <p className="text-white/60 text-sm">Sistema de Gestão</p>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-4xl font-semibold leading-tight">
                            Gerencie seu negócio<br />
                            <span className="text-[#0D9488]">com precisão</span>
                        </h2>
                        <p className="text-white/70 text-lg max-w-md leading-relaxed">
                            Agenda, clientes, profissionais e financeiro em uma única plataforma profissional.
                        </p>

                        <div className="flex gap-8 pt-4">
                            <div>
                                <div className="text-3xl font-bold text-[#0D9488]">500+</div>
                                <div className="text-sm text-white/60">Salões ativos</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-[#0D9488]">50k+</div>
                                <div className="text-sm text-white/60">Agendamentos/mês</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-[#0D9488]">99.9%</div>
                                <div className="text-sm text-white/60">Uptime</div>
                            </div>
                        </div>
                    </div>

                    <div className="text-sm text-white/40">
                        © 2024 Tratto. Todos os direitos reservados.
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[#F8F9FF]">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-[#0F172A] flex items-center justify-center text-white font-bold text-lg">
                                T
                            </div>
                            <span className="text-2xl font-semibold text-[#0F172A]">Tratto</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-[#0F172A] mb-2">
                            Bem-vindo de volta
                        </h1>
                        <p className="text-[#64748b]">
                            Entre com suas credenciais para acessar o sistema
                        </p>
                    </div>

                    <Card className="p-6 sm:p-8 bg-white border border-[#E2E8F0] shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-medium text-[#64748b] uppercase tracking-wide">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="h-11 rounded-md border-[#E2E8F0] bg-white focus:border-[#0D9488] focus:ring-[#0D9488] transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-medium text-[#64748b] uppercase tracking-wide">
                                        Senha
                                    </Label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-xs font-medium text-[#0D9488] hover:text-[#0F766E] transition-colors"
                                    >
                                        Esqueceu a senha?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        className="h-11 rounded-md border-[#E2E8F0] bg-white focus:border-[#0D9488] focus:ring-[#0D9488] transition-colors pr-11"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b] transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-md bg-red-50 border border-red-200 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-11 rounded-md bg-[#0F172A] hover:bg-[#1e293b] text-white font-medium transition-colors"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Entrando...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        Entrar
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                )}
                            </Button>
                        </form>
                    </Card>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-[#64748b]">
                            Não tem uma conta?{" "}
                            <Link
                                href="/register"
                                className="font-medium text-[#0D9488] hover:text-[#0F766E] transition-colors"
                            >
                                Criar conta grátis
                            </Link>
                        </p>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-4 text-xs text-[#94a3b8]">
                        <a href="#" className="hover:text-[#64748b] transition-colors">Privacidade</a>
                        <span>•</span>
                        <a href="#" className="hover:text-[#64748b] transition-colors">Termos</a>
                        <span>•</span>
                        <a href="#" className="hover:text-[#64748b] transition-colors">Suporte</a>
                    </div>
                </div>
            </div>
        </div>
    )
}
