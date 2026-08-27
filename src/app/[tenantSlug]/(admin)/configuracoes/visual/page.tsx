"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Save, Upload, Palette, Image } from "lucide-react"
import { useTenant } from "@/contexts/tenant-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ColorPicker } from "@/components/ui/color-picker"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client"

export default function ConfiguracoesVisualPage() {
    const { currentTenant, setCurrentTenant } = useTenant()
    const params = useParams()
    const slug = params.tenantSlug as string

    const [primaryColor, setPrimaryColor] = useState(currentTenant?.customPrimaryColor || currentTenant?.primaryColor || '#F97316')
    const [secondaryColor, setSecondaryColor] = useState(currentTenant?.customSecondaryColor || currentTenant?.secondaryColor || '#0F172A')
    const [logoPreview, setLogoPreview] = useState(currentTenant?.customLogo || '')
    const [saving, setSaving] = useState(false)

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => setLogoPreview(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const handleSave = async () => {
        setSaving(true)

        if (isSupabaseConfigured && currentTenant) {
            const supabase = getSupabaseBrowserClient()
            if (supabase) {
                await supabase
                    .from('tenants')
                    .update({
                        theme: { primary: primaryColor, secondary: secondaryColor },
                        logo_url: logoPreview || null,
                    })
                    .eq('id', currentTenant.id)
            }
        }

        if (currentTenant) {
            setCurrentTenant({
                ...currentTenant,
                customPrimaryColor: primaryColor,
                customSecondaryColor: secondaryColor,
                customLogo: logoPreview,
            })
        }

        document.documentElement.style.setProperty('--primary', primaryColor)
        setSaving(false)
        alert('Configurações visuais salvas com sucesso!')
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/${slug}/configuracoes`}
                        className="w-10 h-10 rounded-lg border border-[#E2E8F0] flex items-center justify-center hover:bg-[#F8F9FF] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-[#64748b]" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">Identidade Visual</h2>
                        <p className="text-[#64748b] text-sm mt-0.5">Logo e cores da sua marca</p>
                    </div>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-medium shadow-sm h-11 px-6"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Logo Upload */}
                <Card className="rounded-xl border border-[#E2E8F0] shadow-sm bg-white overflow-hidden">
                    <div className="px-6 py-4 bg-[#F8F9FF] border-b border-[#E2E8F0] flex items-center gap-3">
                        <Image className="w-5 h-5 text-[#F97316]" />
                        <h3 className="text-lg font-bold text-[#0F172A]">Logo e fotos do estabelecimento</h3>
                    </div>

                    <div className="p-6 space-y-6">
                        <div>
                            <p className="text-sm font-medium text-[#64748b] mb-4">Logo</p>
                            <div className="relative group w-32 h-32 mx-auto">
                                <div className="w-32 h-32 rounded-xl border-2 border-dashed border-[#E2E8F0] flex items-center justify-center overflow-hidden bg-[#F8F9FF]">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-5xl">{currentTenant?.logo || '🏪'}</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => document.getElementById('logo-upload')?.click()}
                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white"
                                >
                                    <Upload className="w-6 h-6" />
                                </button>
                                <input type="file" id="logo-upload" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-[#64748b] mb-4">Fotos do local</p>
                            <button
                                onClick={() => document.getElementById('photos-upload')?.click()}
                                className="w-full py-3 px-4 rounded-lg border-2 border-dashed border-[#FDBA74] bg-[#FFF7ED] text-[#EA580C] font-medium hover:bg-[#FFEDD5] transition-colors"
                            >
                                Adicionar imagem
                            </button>
                            <input type="file" id="photos-upload" className="hidden" accept="image/*" multiple />
                        </div>
                    </div>
                </Card>

                {/* Colors */}
                <Card className="rounded-xl border border-[#E2E8F0] shadow-sm bg-white overflow-hidden">
                    <div className="px-6 py-4 bg-[#F8F9FF] border-b border-[#E2E8F0] flex items-center gap-3">
                        <Palette className="w-5 h-5 text-[#F97316]" />
                        <h3 className="text-lg font-bold text-[#0F172A]">Cores da Marca</h3>
                    </div>

                    <div className="p-6 space-y-6">
                        <ColorPicker label="Cor Primária" color={primaryColor} onChange={setPrimaryColor} />
                        <ColorPicker label="Cor Secundária" color={secondaryColor} onChange={setSecondaryColor} />

                        <div className="pt-4 border-t border-[#E2E8F0]">
                            <p className="text-xs font-medium text-[#64748b] mb-3">Preview do Botão</p>
                            <div className="p-4 rounded-lg bg-[#0F172A]">
                                <button
                                    className="w-full h-12 rounded-lg text-white font-bold"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    Agendar Agora
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
