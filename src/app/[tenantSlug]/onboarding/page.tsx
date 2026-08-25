"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
    Building2, MapPin, Phone, Clock, Image as ImageIcon,
    Instagram, Facebook, Globe, ArrowRight, ArrowLeft,
    Check, Loader2, Upload
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

const STEPS = [
    { id: "info", title: "Dados do Negócio", icon: Building2 },
    { id: "hours", title: "Horários", icon: Clock },
    { id: "brand", title: "Logo e Visual", icon: ImageIcon },
    { id: "social", title: "Redes Sociais", icon: Instagram },
]

const WEEK_DAYS = [
    { id: "monday", label: "Segunda-feira" },
    { id: "tuesday", label: "Terça-feira" },
    { id: "wednesday", label: "Quarta-feira" },
    { id: "thursday", label: "Quinta-feira" },
    { id: "friday", label: "Sexta-feira" },
    { id: "saturday", label: "Sábado" },
    { id: "sunday", label: "Domingo" },
]

interface BusinessHours {
    [key: string]: { enabled: boolean; open: string; close: string }
}

export default function OnboardingPage() {
    const router = useRouter()
    const params = useParams()
    const tenantSlug = params.tenantSlug as string

    const [currentStep, setCurrentStep] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [tenantId, setTenantId] = useState<string | null>(null)

    // Form data
    const [businessInfo, setBusinessInfo] = useState({
        description: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        phone: "",
        whatsapp: "",
    })

    const [businessHours, setBusinessHours] = useState<BusinessHours>({
        monday: { enabled: true, open: "09:00", close: "18:00" },
        tuesday: { enabled: true, open: "09:00", close: "18:00" },
        wednesday: { enabled: true, open: "09:00", close: "18:00" },
        thursday: { enabled: true, open: "09:00", close: "18:00" },
        friday: { enabled: true, open: "09:00", close: "18:00" },
        saturday: { enabled: true, open: "09:00", close: "14:00" },
        sunday: { enabled: false, open: "00:00", close: "00:00" },
    })

    const [brandInfo, setBrandInfo] = useState({
        logoUrl: "",
        primaryColor: "#0D9488",
        secondaryColor: "#0F172A",
    })

    const [socialInfo, setSocialInfo] = useState({
        instagram: "",
        facebook: "",
        website: "",
    })

    // Load tenant on mount
    useEffect(() => {
        const loadTenant = async () => {
            const supabase = getSupabaseBrowserClient()
            if (!supabase) return

            const { data } = await supabase
                .from("tenants")
                .select("id, settings, business_hours")
                .eq("slug", tenantSlug)
                .single()

            if (data) {
                setTenantId(data.id)
                // Pre-fill if data exists
                if (data.settings) {
                    const settings = data.settings as Record<string, unknown>
                    setBusinessInfo(prev => ({
                        ...prev,
                        description: (settings.description as string) || "",
                        address: (settings.address as string) || "",
                        city: (settings.city as string) || "",
                        state: (settings.state as string) || "",
                        zipCode: (settings.zip_code as string) || "",
                        phone: (settings.phone as string) || "",
                        whatsapp: (settings.whatsapp as string) || "",
                    }))
                    setSocialInfo(prev => ({
                        ...prev,
                        instagram: (settings.instagram as string) || "",
                        facebook: (settings.facebook as string) || "",
                        website: (settings.website as string) || "",
                    }))
                }
                if (data.business_hours) {
                    setBusinessHours(data.business_hours as BusinessHours)
                }
            }
        }
        loadTenant()
    }, [tenantSlug])

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleComplete = async () => {
        if (!tenantId) return
        setIsSubmitting(true)

        const supabase = getSupabaseBrowserClient()
        if (!supabase) {
            setIsSubmitting(false)
            return
        }

        try {
            const { error } = await supabase
                .from("tenants")
                .update({
                    settings: {
                        description: businessInfo.description,
                        address: businessInfo.address,
                        city: businessInfo.city,
                        state: businessInfo.state,
                        zip_code: businessInfo.zipCode,
                        phone: businessInfo.phone,
                        whatsapp: businessInfo.whatsapp,
                        instagram: socialInfo.instagram,
                        facebook: socialInfo.facebook,
                        website: socialInfo.website,
                        onboarding_completed: true,
                    },
                    business_hours: businessHours,
                    logo_url: brandInfo.logoUrl || null,
                    theme: {
                        primary: brandInfo.primaryColor,
                        secondary: brandInfo.secondaryColor,
                    },
                    updated_at: new Date().toISOString(),
                })
                .eq("id", tenantId)

            if (error) {
                console.error("Error saving onboarding:", error)
                alert("Erro ao salvar. Tente novamente.")
                return
            }

            // Redirect to dashboard
            router.push(`/${tenantSlug}/dashboard`)
        } catch (err) {
            console.error("Onboarding error:", err)
            alert("Erro ao completar onboarding.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSkip = () => {
        router.push(`/${tenantSlug}/dashboard`)
    }

    const updateHours = (day: string, field: "enabled" | "open" | "close", value: boolean | string) => {
        setBusinessHours(prev => ({
            ...prev,
            [day]: { ...prev[day], [field]: value }
        }))
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Business Info
                return (
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-[#0F172A]">Descrição do Negócio</Label>
                            <Textarea
                                placeholder="Conte um pouco sobre seu estabelecimento..."
                                value={businessInfo.description}
                                onChange={(e) => setBusinessInfo(prev => ({ ...prev, description: e.target.value }))}
                                className="min-h-[100px] border-[#E2E8F0] focus:border-[#0D9488] focus:ring-[#0D9488]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-[#0F172A]">Endereço</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                                <Input
                                    placeholder="Rua, número, bairro"
                                    value={businessInfo.address}
                                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, address: e.target.value }))}
                                    className="pl-10 h-11 border-[#E2E8F0] focus:border-[#0D9488] focus:ring-[#0D9488]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-[#0F172A]">Cidade</Label>
                                <Input
                                    placeholder="São Paulo"
                                    value={businessInfo.city}
                                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, city: e.target.value }))}
                                    className="h-11 border-[#E2E8F0] focus:border-[#0D9488] focus:ring-[#0D9488]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-[#0F172A]">Estado</Label>
                                <Input
                                    placeholder="SP"
                                    maxLength={2}
                                    value={businessInfo.state}
                                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                                    className="h-11 border-[#E2E8F0] focus:border-[#0D9488] focus:ring-[#0D9488]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-[#0F172A]">Telefone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                                    <Input
                                        placeholder="(11) 3456-7890"
                                        value={businessInfo.phone}
                                        onChange={(e) => setBusinessInfo(prev => ({ ...prev, phone: e.target.value }))}
                                        className="pl-10 h-11 border-[#E2E8F0] focus:border-[#0D9488] focus:ring-[#0D9488]"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-[#0F172A]">WhatsApp</Label>
                                <Input
                                    placeholder="(11) 98765-4321"
                                    value={businessInfo.whatsapp}
                                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, whatsapp: e.target.value }))}
                                    className="h-11 border-[#E2E8F0] focus:border-[#0D9488] focus:ring-[#0D9488]"
                                />
                            </div>
                        </div>
                    </div>
                )

            case 1: // Business Hours
                return (
                    <div className="space-y-3">
                        <p className="text-sm text-[#64748b] mb-4">
                            Configure os horários de funcionamento do seu estabelecimento.
                        </p>
                        {WEEK_DAYS.map((day) => (
                            <div
                                key={day.id}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-lg border transition-colors",
                                    businessHours[day.id]?.enabled
                                        ? "border-[#E2E8F0] bg-white"
                                        : "border-[#E2E8F0] bg-[#F8F9FF]"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Switch
                                        checked={businessHours[day.id]?.enabled}
                                        onCheckedChange={(checked) => updateHours(day.id, "enabled", checked)}
                                        className="data-[state=checked]:bg-[#0D9488]"
                                    />
                                    <span className={cn(
                                        "font-medium text-sm",
                                        businessHours[day.id]?.enabled ? "text-[#0F172A]" : "text-[#94a3b8]"
                                    )}>
                                        {day.label}
                                    </span>
                                </div>
                                {businessHours[day.id]?.enabled && (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="time"
                                            value={businessHours[day.id]?.open}
                                            onChange={(e) => updateHours(day.id, "open", e.target.value)}
                                            className="w-24 h-9 text-center text-sm border-[#E2E8F0]"
                                        />
                                        <span className="text-[#94a3b8] text-sm">às</span>
                                        <Input
                                            type="time"
                                            value={businessHours[day.id]?.close}
                                            onChange={(e) => updateHours(day.id, "close", e.target.value)}
                                            className="w-24 h-9 text-center text-sm border-[#E2E8F0]"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )

            case 2: // Brand
                return (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-[#0F172A]">Logo do Estabelecimento</Label>
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-[#E2E8F0] flex items-center justify-center bg-[#F8F9FF]">
                                    {brandInfo.logoUrl ? (
                                        <img src={brandInfo.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <Upload className="w-8 h-8 text-[#94a3b8]" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <Input
                                        placeholder="URL da imagem ou faça upload"
                                        value={brandInfo.logoUrl}
                                        onChange={(e) => setBrandInfo(prev => ({ ...prev, logoUrl: e.target.value }))}
                                        className="h-11 border-[#E2E8F0] focus:border-[#0D9488] focus:ring-[#0D9488]"
                                    />
                                    <p className="text-xs text-[#64748b] mt-1">
                                        Você pode configurar o upload de imagem em Configurações depois.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-[#0F172A]">Cor Principal</Label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={brandInfo.primaryColor}
                                        onChange={(e) => setBrandInfo(prev => ({ ...prev, primaryColor: e.target.value }))}
                                        className="w-12 h-12 rounded-lg border border-[#E2E8F0] cursor-pointer"
                                    />
                                    <Input
                                        value={brandInfo.primaryColor}
                                        onChange={(e) => setBrandInfo(prev => ({ ...prev, primaryColor: e.target.value }))}
                                        className="h-11 border-[#E2E8F0] focus:border-[#0D9488] focus:ring-[#0D9488]"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-[#0F172A]">Cor Secundária</Label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={brandInfo.secondaryColor}
                                        onChange={(e) => setBrandInfo(prev => ({ ...prev, secondaryColor: e.target.value }))}
                                        className="w-12 h-12 rounded-lg border border-[#E2E8F0] cursor-pointer"
                                    />
                                    <Input
                                        value={brandInfo.secondaryColor}
                                        onChange={(e) => setBrandInfo(prev => ({ ...prev, secondaryColor: e.target.value }))}
                                        className="h-11 border-[#E2E8F0] focus:border-[#0D9488] focus:ring-[#0D9488]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )

            case 3: // Social
                return (
                    <div className="space-y-5">
                        <p className="text-sm text-[#64748b] mb-4">
                            Conecte suas redes sociais para seus clientes te encontrarem facilmente.
                        </p>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-[#0F172A]">Instagram</Label>
                            <div className="relative">
                                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                                <Input
                                    placeholder="@seusalaodebeleza"
                                    value={socialInfo.instagram}
                                    onChange={(e) => setSocialInfo(prev => ({ ...prev, instagram: e.target.value }))}
                                    className="pl-10 h-11 border-[#E2E8F0] focus:border-[#0D9488] focus:ring-[#0D9488]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-[#0F172A]">Facebook</Label>
                            <div className="relative">
                                <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                                <Input
                                    placeholder="facebook.com/seusalao"
                                    value={socialInfo.facebook}
                                    onChange={(e) => setSocialInfo(prev => ({ ...prev, facebook: e.target.value }))}
                                    className="pl-10 h-11 border-[#E2E8F0] focus:border-[#0D9488] focus:ring-[#0D9488]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-[#0F172A]">Website</Label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                                <Input
                                    placeholder="www.seusalao.com.br"
                                    value={socialInfo.website}
                                    onChange={(e) => setSocialInfo(prev => ({ ...prev, website: e.target.value }))}
                                    className="pl-10 h-11 border-[#E2E8F0] focus:border-[#0D9488] focus:ring-[#0D9488]"
                                />
                            </div>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-[#0D9488] flex items-center justify-center text-white font-bold text-lg">
                            T
                        </div>
                        <span className="text-2xl font-semibold text-[#0F172A]">Tratto</span>
                    </div>
                    <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Configure seu Negócio</h1>
                    <p className="text-[#64748b]">Complete as informações para começar a usar o sistema</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {STEPS.map((step, index) => {
                        const StepIcon = step.icon
                        const isActive = index === currentStep
                        const isCompleted = index < currentStep

                        return (
                            <div key={step.id} className="flex items-center">
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                                        isActive && "bg-[#0D9488] text-white",
                                        isCompleted && "bg-[#0D9488]/20 text-[#0D9488]",
                                        !isActive && !isCompleted && "bg-[#E2E8F0] text-[#94a3b8]"
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        <StepIcon className="w-5 h-5" />
                                    )}
                                </div>
                                {index < STEPS.length - 1 && (
                                    <div className={cn(
                                        "w-12 h-1 mx-1 rounded-full",
                                        index < currentStep ? "bg-[#0D9488]" : "bg-[#E2E8F0]"
                                    )} />
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Card */}
                <Card className="p-6 sm:p-8 bg-white border border-[#E2E8F0] shadow-sm rounded-xl">
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-[#0F172A]">{STEPS[currentStep].title}</h2>
                    </div>

                    {renderStepContent()}

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E2E8F0]">
                        <div>
                            {currentStep === 0 ? (
                                <Button
                                    variant="ghost"
                                    onClick={handleSkip}
                                    className="text-[#64748b] hover:text-[#0F172A]"
                                >
                                    Pular por agora
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={handleBack}
                                    className="border-[#E2E8F0] hover:bg-[#F8F9FF]"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Voltar
                                </Button>
                            )}
                        </div>

                        {currentStep === STEPS.length - 1 ? (
                            <Button
                                onClick={handleComplete}
                                disabled={isSubmitting}
                                className="bg-[#0D9488] hover:bg-[#0F766E] text-white"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        Concluir Setup
                                        <Check className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNext}
                                className="bg-[#0D9488] hover:bg-[#0F766E] text-white"
                            >
                                Próximo
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </Card>

                {/* Step indicator */}
                <p className="text-center text-sm text-[#64748b] mt-4">
                    Passo {currentStep + 1} de {STEPS.length}
                </p>
            </div>
        </div>
    )
}
