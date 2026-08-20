"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
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

const BUSINESS_TYPES = [
    { value: "salon", label: "Salão de Beleza" },
    { value: "clinic", label: "Clínica" },
    { value: "barbershop", label: "Barbearia" },
    { value: "aesthetics", label: "Estética" },
    { value: "spa", label: "Spa" },
    { value: "other", label: "Outro" },
]

export default function RegisterPage() {
    const router = useRouter()
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
            // 1. Create user in Supabase Auth
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

            // Debug: check what we got from signUp
            console.log("SignUp result:", {
                user: authData.user?.id,
                session: authData.session ? "EXISTS" : "NULL",
                email_confirmed: authData.user?.email_confirmed_at,
            })

            // 2. Check if email confirmation is disabled (session exists in signup response)
            if (authData.session) {
                // Email confirmation is disabled - create tenant immediately
                console.log("Email confirmation disabled, creating tenant now...")

                const baseSlug = generateSlug(formData.businessName)
                const uniqueSlug = await ensureUniqueSlug(baseSlug)

                const { data: tenant, error: tenantError } = await supabase
                    .from("tenants")
                    .insert({
                        name: formData.businessName,
                        slug: uniqueSlug,
                        full_name: formData.businessName,
                        settings: {
                            business_type: formData.businessType,
                            description: `${formData.businessName} - ${BUSINESS_TYPES.find(t => t.value === formData.businessType)?.label}`,
                        },
                        theme: {
                            primaryColor: "#7c3aed",
                            accentColor: "#a78bfa",
                        },
                        plan_id: "trial",
                        subscription_status: "trialing",
                        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    })
                    .select()
                    .single()

                if (tenantError || !tenant) {
                    console.error("Tenant creation error:", tenantError)
                    await supabase.auth.signOut()
                    setError(`Erro ao criar empresa: ${tenantError?.message || "Tente novamente."}`)
                    setIsSubmitting(false)
                    return
                }

                // Update user metadata
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

                // Create profile
                const { error: profileError } = await supabase
                    .from("app_users")
                    .insert({
                        id: authData.user.id,
                        full_name: formData.userName,
                    })

                if (profileError) {
                    console.error("Profile creation error:", profileError)
                }

                // Store tenant info
                localStorage.setItem("currentTenantId", tenant.id)
                localStorage.setItem("tenantSlug", tenant.slug)

                // Redirect to dashboard
                router.push(`/${tenant.slug}/agenda`)
            } else {
                // Email confirmation is enabled - save data and redirect to verify email
                console.log("Email confirmation enabled, redirecting to verify-email...")

                const pendingData = {
                    userId: authData.user.id,
                    email: formData.email,
                    userName: formData.userName,
                    businessName: formData.businessName,
                    businessType: formData.businessType,
                }
                localStorage.setItem("pendingRegistration", JSON.stringify(pendingData))

                router.push("/verify-email")
            }

        } catch (err: any) {
            console.error("Registration error:", err)
            setError("Erro ao criar cadastro. Por favor, tente novamente.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-white dark:bg-zinc-950 flex items-center justify-center p-4 sm:p-6 font-sans overflow-auto">
            {/* Background decorations */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 opacity-40" />
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute top-40 right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-6 sm:space-y-8 relative z-10"
            >
                <div className="text-center space-y-3 sm:space-y-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 mx-auto flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-2xl shadow-purple-500/30">
                        T
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                            Criar Conta no Tratto
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 font-medium">
                            Configure sua empresa em minutos
                        </p>
                    </div>
                </div>

                <Card className="p-6 sm:p-8 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-100 dark:border-zinc-800 shadow-2xl space-y-5 sm:space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        {/* User Name */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Seu Nome *
                            </Label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder="João Silva"
                                    value={formData.userName}
                                    onChange={(e) => handleChange("userName", e.target.value)}
                                    className="h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-zinc-700"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Email *
                            </Label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <Input
                                    type="email"
                                    placeholder="joao@email.com"
                                    value={formData.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    className="h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-zinc-700"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Senha *
                            </Label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <Input
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    value={formData.password}
                                    onChange={(e) => handleChange("password", e.target.value)}
                                    className="h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-zinc-700"
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Confirmar Senha *
                            </Label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <Input
                                    type="password"
                                    placeholder="Digite a senha novamente"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                                    className="h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-zinc-700"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-zinc-700 pt-4"></div>

                        {/* Business Name */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Nome da Empresa *
                            </Label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder="Salão Beleza Pura"
                                    value={formData.businessName}
                                    onChange={(e) => handleChange("businessName", e.target.value)}
                                    className="h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-zinc-700"
                                />
                            </div>
                        </div>

                        {/* Business Type */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Tipo de Negócio
                            </Label>
                            <Select value={formData.businessType} onValueChange={(val) => handleChange("businessType", val)}>
                                <SelectTrigger className="h-12 rounded-xl border border-gray-200 dark:border-zinc-700">
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
                            <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                                <p className="text-xs font-bold text-red-600 text-center">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Criando conta...
                                </div>
                            ) : (
                                <>
                                    Criar Conta e Empresa
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="text-center space-y-2">
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
                            Já tem uma conta?{" "}
                            <button
                                onClick={() => router.push("/login")}
                                className="font-bold text-purple-600 hover:text-purple-700"
                            >
                                Fazer login
                            </button>
                        </p>
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}
