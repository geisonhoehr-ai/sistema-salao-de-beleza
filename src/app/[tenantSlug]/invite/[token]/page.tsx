"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Lock, Loader2, CheckCircle2, XCircle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface InviteData {
    id: string
    employeeId: string
    employeeName: string
    employeeEmail: string
    tenantId: string
    tenantName: string
    tenantSlug: string
    expiresAt: string
    status: string
}

export default function AcceptInvitePage() {
    const router = useRouter()
    const params = useParams()
    const token = params.token as string
    const tenantSlug = params.tenantSlug as string

    const [inviteData, setInviteData] = useState<InviteData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    })

    useEffect(() => {
        const loadInvite = async () => {
            const supabase = getSupabaseBrowserClient()
            if (!supabase) {
                setError("Erro ao conectar com o sistema.")
                setLoading(false)
                return
            }

            try {
                // Load invite data
                const { data: invite, error: inviteError } = await supabase
                    .from("employee_invites")
                    .select(`
                        id,
                        employee_id,
                        tenant_id,
                        expires_at,
                        status,
                        employees!inner(full_name, email),
                        tenants!inner(name, slug)
                    `)
                    .eq("token", token)
                    .single()

                if (inviteError || !invite) {
                    setError("Convite não encontrado ou expirado.")
                    setLoading(false)
                    return
                }

                // Check if expired
                if (new Date(invite.expires_at) < new Date()) {
                    setError("Este convite expirou. Solicite um novo convite ao administrador.")
                    setLoading(false)
                    return
                }

                // Check if already accepted
                if (invite.status === "accepted") {
                    setError("Este convite já foi utilizado.")
                    setLoading(false)
                    return
                }

                const employees = invite.employees as unknown as { full_name: string; email: string }
                const tenants = invite.tenants as unknown as { name: string; slug: string }

                setInviteData({
                    id: invite.id,
                    employeeId: invite.employee_id,
                    employeeName: employees.full_name,
                    employeeEmail: employees.email,
                    tenantId: invite.tenant_id,
                    tenantName: tenants.name,
                    tenantSlug: tenants.slug,
                    expiresAt: invite.expires_at,
                    status: invite.status,
                })
            } catch (err) {
                console.error("Error loading invite:", err)
                setError("Erro ao carregar convite.")
            } finally {
                setLoading(false)
            }
        }

        loadInvite()
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!inviteData) return

        if (formData.password.length < 6) {
            setError("A senha deve ter no mínimo 6 caracteres.")
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError("As senhas não coincidem.")
            return
        }

        setIsSubmitting(true)
        setError("")

        const supabase = getSupabaseBrowserClient()
        if (!supabase) {
            setError("Erro ao conectar.")
            setIsSubmitting(false)
            return
        }

        try {
            // Create auth user
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email: inviteData.employeeEmail,
                password: formData.password,
                options: {
                    data: {
                        full_name: inviteData.employeeName,
                        role: "employee",
                        tenant_id: inviteData.tenantId,
                        employee_id: inviteData.employeeId,
                    },
                }
            })

            if (signUpError) {
                // Check if user already exists
                if (signUpError.message.includes("already registered")) {
                    setError("Este email já possui uma conta. Faça login normalmente.")
                } else {
                    setError(signUpError.message)
                }
                setIsSubmitting(false)
                return
            }

            // Update invite status
            await supabase
                .from("employee_invites")
                .update({
                    status: "accepted",
                    accepted_at: new Date().toISOString()
                })
                .eq("id", inviteData.id)

            // Update employee with user_id
            if (authData.user) {
                await supabase
                    .from("employees")
                    .update({
                        user_id: authData.user.id,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", inviteData.employeeId)

                // Create app_users record
                await supabase
                    .from("app_users")
                    .insert({
                        id: authData.user.id,
                        full_name: inviteData.employeeName,
                    })
            }

            setSuccess(true)

            // Redirect after success
            setTimeout(() => {
                router.push(`/${inviteData.tenantSlug}/profissional/dashboard`)
            }, 2000)

        } catch (err) {
            console.error("Accept invite error:", err)
            setError("Erro ao criar conta. Tente novamente.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#0D9488] mx-auto mb-4" />
                    <p className="text-[#64748b]">Carregando convite...</p>
                </div>
            </div>
        )
    }

    if (error && !inviteData) {
        return (
            <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center p-6">
                <Card className="max-w-md w-full p-8 text-center bg-white border border-[#E2E8F0]">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-[#0F172A] mb-2">Convite Inválido</h1>
                    <p className="text-[#64748b] mb-6">{error}</p>
                    <Button
                        onClick={() => router.push("/login")}
                        className="bg-[#0D9488] hover:bg-[#0F766E] text-white"
                    >
                        Ir para Login
                    </Button>
                </Card>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center p-6">
                <Card className="max-w-md w-full p-8 text-center bg-white border border-[#E2E8F0]">
                    <CheckCircle2 className="w-16 h-16 text-[#0D9488] mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-[#0F172A] mb-2">Conta Criada!</h1>
                    <p className="text-[#64748b] mb-2">
                        Bem-vindo à equipe de <strong>{inviteData?.tenantName}</strong>!
                    </p>
                    <p className="text-sm text-[#94a3b8]">
                        Redirecionando para sua área...
                    </p>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-[#0D9488] flex items-center justify-center text-white font-bold text-lg">
                            T
                        </div>
                        <span className="text-2xl font-semibold text-[#0F172A]">Tratto</span>
                    </div>
                </div>

                <Card className="p-6 sm:p-8 bg-white border border-[#E2E8F0] shadow-sm rounded-xl">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-[#0D9488]/10 flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-[#0D9488]" />
                        </div>
                        <h1 className="text-xl font-bold text-[#0F172A] mb-2">
                            Bem-vindo, {inviteData?.employeeName}!
                        </h1>
                        <p className="text-[#64748b]">
                            Você foi convidado para fazer parte da equipe de
                        </p>
                        <p className="text-[#0D9488] font-semibold text-lg">
                            {inviteData?.tenantName}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-[#0F172A]">
                                Seu Email
                            </Label>
                            <Input
                                type="email"
                                value={inviteData?.employeeEmail || ""}
                                disabled
                                className="h-11 bg-[#F8F9FF] border-[#E2E8F0]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-[#0F172A]">
                                Criar Senha
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                                <Input
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    value={formData.password}
                                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    className="pl-10 h-11 border-[#E2E8F0] focus:border-[#0D9488] focus:ring-[#0D9488]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-[#0F172A]">
                                Confirmar Senha
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                                <Input
                                    type="password"
                                    placeholder="Digite a senha novamente"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    className="pl-10 h-11 border-[#E2E8F0] focus:border-[#0D9488] focus:ring-[#0D9488]"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-md bg-red-50 border border-red-200">
                                <p className="text-sm text-red-600 text-center">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-11 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Criando conta...
                                </>
                            ) : (
                                "Criar Minha Conta"
                            )}
                        </Button>
                    </form>
                </Card>

                <p className="text-center text-sm text-[#64748b] mt-4">
                    Ao criar sua conta, você poderá gerenciar sua agenda e ver seus atendimentos.
                </p>
            </div>
        </div>
    )
}
