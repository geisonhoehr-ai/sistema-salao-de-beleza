"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Building2, Mail, Lock, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

const BUSINESS_TYPES = [
    { value: "salon", label: "Salão de Beleza" },
    { value: "clinic", label: "Clínica" },
    { value: "barbershop", label: "Barbearia" },
    { value: "aesthetics", label: "Estética" },
    { value: "spa", label: "Spa" },
    { value: "other", label: "Outro" },
]

function RegisterContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const isAdminMode = searchParams.get("admin") === "true"
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
        businessName: "",
        businessType: "salon",
    })

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setError("")
    }

    const generateSlug = (name: string): string => {
        return name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .substring(0, 50)
    }

    const validateForm = () => {
        if (!formData.userName.trim()) {
            setError("Por favor, informe seu nome")
            return false
        }
        if (!formData.email.includes("@")) {
            setError("Por favor, informe um email válido")
            return false
        }
        if (formData.password.length < 6) {
            setError("A senha deve ter no mínimo 6 caracteres")
            return false
        }
        if (formData.password !== formData.confirmPassword) {
            setError("As senhas não coincidem")
            return false
        }
        if (!formData.businessName.trim()) {
            setError("Por favor, informe o nome da empresa")
            return false
        }
        return true
    }

    const ensureUniqueSlug = async (baseSlug: string): Promise<string> => {
        let slug = baseSlug
        let counter = 2

        while (true) {
            const { data, error } = await supabase
                .from("tenants")
                .select("id")
                .eq("slug", slug)
                .maybeSingle()

            if (error) {
                console.error("Erro ao verificar slug:", error)
                break
            }

            if (!data) {
                return slug
            }

            slug = `${baseSlug}-${counter}`
            counter++
        }

        return slug
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsSubmitting(true)
        setError("")

        try {
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.userName,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
            })

            if (signUpError) {
                console.error("Signup error:", signUpError)
                setError(signUpError.message || "Erro ao criar conta")
                setIsSubmitting(false)
                return
            }

            if (!authData.user) {
                setError("Erro ao criar usuário")
                setIsSubmitting(false)
                return
            }

            if (authData.session) {
                const baseSlug = generateSlug(formData.businessName)
                const uniqueSlug = await ensureUniqueSlug(baseSlug)

                const tenantData: Record<string, unknown> = {
                    name: formData.businessName,
                    slug: uniqueSlug,
                    full_name: formData.businessName,
                    settings: {
                        business_type: formData.businessType,
                        description: `${formData.businessName} - ${BUSINESS_TYPES.find(t => t.value === formData.businessType)?.label}`,
                    },
                    theme: {
                        primaryColor: "#0F172A",
                        accentColor: "#0D9488",
                    },
                    plan_id: isAdminMode ? "pro" : "trial",
                    subscription_status: isAdminMode ? "active" : "trialing",
                }

                if (!isAdminMode) {
                    tenantData.trial_ends_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                }

                const { data: tenant, error: tenantError } = await supabase
                    .from("tenants")
                    .insert(tenantData)
                    .select()
                    .single()

                if (tenantError || !tenant) {
                    console.error("Tenant creation error:", tenantError)
                    await supabase.auth.signOut()
                    setError(`Erro ao criar empresa: ${tenantError?.message || "Tente novamente."}`)
                    setIsSubmitting(false)
                    return
                }

                const { error: updateError } = await supabase.auth.updateUser({
                    data: {
                        full_name: formData.userName,
                        role: "company_admin",
                        tenant_id: tenant.id,
                    }
                })

                if (updateError) {
                    console.error("Error updating user metadata:", updateError)
                }

                const { error: profileError } = await supabase
                    .from("app_users")
                    .insert({
                        id: authData.user.id,
                        full_name: formData.userName,
                    })

                if (profileError) {
                    console.error("Profile creation error:", profileError)
                }

                localStorage.setItem("currentTenantId", tenant.id)
                localStorage.setItem("tenantSlug", tenant.slug)

                // Redirect to onboarding to complete business setup
                router.push(`/${tenant.slug}/onboarding`)
            } else {
                const pendingData = {
                    userId: authData.user.id,
                    email: formData.email,
                    userName: formData.userName,
                    businessName: formData.businessName,
                    businessType: formData.businessType,
                    isAdminMode: isAdminMode,
                }
                localStorage.setItem("pendingRegistration", JSON.stringify(pendingData))

                router.push("/verify-email")
            }

        } catch (err: unknown) {
            console.error("Registration error:", err)
            setError("Erro ao criar cadastro. Por favor, tente novamente.")
        } finally {
            setIsSubmitting(false)
        }
    }

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
                            Comece agora<br />
                            <span className="text-[#0D9488]">gratuitamente</span>
                        </h2>
                        <p className="text-white/70 text-lg max-w-md leading-relaxed">
                            30 dias de teste grátis. Sem necessidade de cartão de crédito.
                        </p>

                        <div className="space-y-3 pt-4">
                            <div className="flex items-center gap-3 text-white/80">
                                <div className="w-5 h-5 rounded-full bg-[#0D9488]/20 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-[#0D9488]" />
                                </div>
                                <span>Agenda inteligente</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/80">
                                <div className="w-5 h-5 rounded-full bg-[#0D9488]/20 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-[#0D9488]" />
                                </div>
                                <span>Gestão de clientes</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/80">
                                <div className="w-5 h-5 rounded-full bg-[#0D9488]/20 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-[#0D9488]" />
                                </div>
                                <span>Controle financeiro</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/80">
                                <div className="w-5 h-5 rounded-full bg-[#0D9488]/20 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-[#0D9488]" />
                                </div>
                                <span>Relatórios completos</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-sm text-white/40">
                        © 2024 Tratto. Todos os direitos reservados.
                    </div>
                </div>
            </div>

            {/* Right Panel - Register Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[#F8F9FF] overflow-auto">
                <div className="w-full max-w-md py-8">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-[#0F172A] flex items-center justify-center text-white font-bold text-lg">
                                T
                            </div>
                            <span className="text-2xl font-semibold text-[#0F172A]">Tratto</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-[#0F172A] mb-2">
                            Criar sua conta
                        </h1>
                        <p className="text-[#64748b]">
                            Configure sua empresa em poucos minutos
                        </p>
                    </div>

                    <Card className="p-6 sm:p-8 bg-white border border-[#E2E8F0] shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* User Name */}
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-[#64748b] uppercase tracking-wide">
                                    Seu Nome
                                </Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <Input
                                        type="text"
                                        placeholder="João Silva"
                                        value={formData.userName}
                                        onChange={(e) => handleChange("userName", e.target.value)}
                                        className="h-11 pl-10 rounded-md border-[#E2E8F0] focus:border-[#0D9488] focus:ring-[#0D9488]"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-[#64748b] uppercase tracking-wide">
                                    Email
                                </Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <Input
                                        type="email"
                                        placeholder="joao@email.com"
                                        value={formData.email}
                                        onChange={(e) => handleChange("email", e.target.value)}
                                        className="h-11 pl-10 rounded-md border-[#E2E8F0] focus:border-[#0D9488] focus:ring-[#0D9488]"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-[#64748b] uppercase tracking-wide">
                                    Senha
                                </Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <Input
                                        type="password"
                                        placeholder="Mínimo 6 caracteres"
                                        value={formData.password}
                                        onChange={(e) => handleChange("password", e.target.value)}
                                        className="h-11 pl-10 rounded-md border-[#E2E8F0] focus:border-[#0D9488] focus:ring-[#0D9488]"
                                    />
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-[#64748b] uppercase tracking-wide">
                                    Confirmar Senha
                                </Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <Input
                                        type="password"
                                        placeholder="Digite a senha novamente"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                                        className="h-11 pl-10 rounded-md border-[#E2E8F0] focus:border-[#0D9488] focus:ring-[#0D9488]"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-[#E2E8F0] my-4" />

                            {/* Business Name */}
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-[#64748b] uppercase tracking-wide">
                                    Nome da Empresa
                                </Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                                        <Building2 className="w-4 h-4" />
                                    </div>
                                    <Input
                                        type="text"
                                        placeholder="Salão Beleza Pura"
                                        value={formData.businessName}
                                        onChange={(e) => handleChange("businessName", e.target.value)}
                                        className="h-11 pl-10 rounded-md border-[#E2E8F0] focus:border-[#0D9488] focus:ring-[#0D9488]"
                                    />
                                </div>
                            </div>

                            {/* Business Type */}
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-[#64748b] uppercase tracking-wide">
                                    Tipo de Negócio
                                </Label>
                                <Select value={formData.businessType} onValueChange={(val) => handleChange("businessType", val)}>
                                    <SelectTrigger className="h-11 rounded-md border-[#E2E8F0] focus:border-[#0D9488] focus:ring-[#0D9488]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {BUSINESS_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {error && (
                                <div className="p-3 rounded-md bg-red-50 border border-red-200">
                                    <p className="text-sm text-red-600 text-center">{error}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-11 rounded-md bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium transition-colors mt-2"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Criando conta...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        Criar Conta
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                )}
                            </Button>
                        </form>
                    </Card>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-[#64748b]">
                            Já tem uma conta?{" "}
                            <Link
                                href="/login"
                                className="font-medium text-[#0D9488] hover:text-[#0F766E] transition-colors"
                            >
                                Fazer login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="fixed inset-0 bg-[#F8F9FF] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
            </div>
        }>
            <RegisterContent />
        </Suspense>
    )
}
