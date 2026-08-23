"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

const BUSINESS_TYPES = [
    { value: "salon", label: "Salão de Beleza" },
    { value: "clinic", label: "Clínica" },
    { value: "barbershop", label: "Barbearia" },
    { value: "aesthetics", label: "Estética" },
    { value: "spa", label: "Spa" },
    { value: "other", label: "Outro" },
]

export default function AuthCallbackPage() {
    const router = useRouter()
    const [status, setStatus] = useState<"processing" | "success" | "error">("processing")
    const [message, setMessage] = useState("Confirmando seu email...")
    const [errorDetail, setErrorDetail] = useState("")

    const generateSlug = (name: string): string => {
        return name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .substring(0, 50)
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

    useEffect(() => {
        const processCallback = async () => {
            try {
                // 1. Get the session after email confirmation
                setMessage("Verificando autenticação...")
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()

                if (sessionError || !session) {
                    console.error("Session error:", sessionError)
                    setStatus("error")
                    setMessage("Erro ao confirmar email")
                    setErrorDetail("Não foi possível obter sessão. Tente fazer login.")
                    return
                }

                const userId = session.user.id

                // 2. Get pending registration data
                const pendingDataStr = localStorage.getItem("pendingRegistration")
                if (!pendingDataStr) {
                    // No pending data, user might have confirmed from another device
                    // Just redirect to login
                    console.warn("No pending registration data found")
                    setStatus("success")
                    setMessage("Email confirmado!")
                    setTimeout(() => router.push("/login"), 2000)
                    return
                }

                const pendingData = JSON.parse(pendingDataStr)

                // 3. Create tenant
                setMessage("Criando sua empresa...")
                const baseSlug = generateSlug(pendingData.businessName)
                const uniqueSlug = await ensureUniqueSlug(baseSlug)

                const { data: tenant, error: tenantError } = await supabase
                    .from("tenants")
                    .insert({
                        name: pendingData.businessName,
                        slug: uniqueSlug,
                        full_name: pendingData.businessName,
                        settings: {
                            business_type: pendingData.businessType,
                            description: `${pendingData.businessName} - ${BUSINESS_TYPES.find(t => t.value === pendingData.businessType)?.label}`,
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
                    setStatus("error")
                    setMessage("Erro ao criar empresa")
                    setErrorDetail(tenantError?.message || "Tente novamente mais tarde")
                    return
                }

                // 4. Update user metadata with tenant_id and role
                setMessage("Configurando sua conta...")
                const { error: updateError } = await supabase.auth.updateUser({
                    data: {
                        full_name: pendingData.userName,
                        role: "company_admin",
                        tenant_id: tenant.id,
                    }
                })

                if (updateError) {
                    console.error("Error updating user metadata:", updateError)
                    // Continue anyway, can be fixed later
                }

                // 5. Create profile for the user
                const { error: profileError } = await supabase
                    .from("app_users")
                    .insert({
                        id: userId,
                        full_name: pendingData.userName,
                    })

                if (profileError) {
                    console.error("Profile creation error:", profileError)
                    // Continue anyway, profile can be created later if needed
                }

                // 6. Store tenant info and clean up
                localStorage.setItem("currentTenantId", tenant.id)
                localStorage.setItem("tenantSlug", tenant.slug)
                localStorage.removeItem("pendingRegistration")

                // 7. Success! Redirect to dashboard
                setStatus("success")
                setMessage(`Bem-vindo ao ${tenant.name}!`)
                setTimeout(() => {
                    router.push(`/${tenant.slug}/agenda`)
                }, 2000)

            } catch (err: any) {
                console.error("Callback processing error:", err)
                setStatus("error")
                setMessage("Erro ao processar confirmação")
                setErrorDetail(err.message || "Erro desconhecido")
            }
        }

        processCallback()
    }, [router])

    return (
        <div className="fixed inset-0 bg-white dark:bg-zinc-950 flex items-center justify-center p-4">
            {/* Background decorations */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-40" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full relative z-10"
            >
                <Card className="p-8 sm:p-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 shadow-2xl text-center">
                    {status === "processing" && (
                        <>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-16 h-16 mx-auto mb-6"
                            >
                                <Loader2 className="w-16 h-16 text-blue-600" />
                            </motion.div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {message}
                            </h1>
                            <p className="text-gray-600 dark:text-zinc-400">
                                Aguarde um momento...
                            </p>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
                            >
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </motion.div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {message}
                            </h1>
                            <p className="text-gray-600 dark:text-zinc-400">
                                Redirecionando para o sistema...
                            </p>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <AlertCircle className="w-10 h-10 text-red-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {message}
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-zinc-400 mb-6">
                                {errorDetail}
                            </p>
                            <div className="space-y-3">
                                <Button
                                    onClick={() => router.push("/login")}
                                    className="w-full"
                                >
                                    Ir para login
                                </Button>
                                <Button
                                    onClick={() => router.push("/register")}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Criar nova conta
                                </Button>
                            </div>
                        </>
                    )}
                </Card>
            </motion.div>
        </div>
    )
}
