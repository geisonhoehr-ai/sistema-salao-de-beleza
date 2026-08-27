"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Save, Clock, Calendar, ShieldCheck } from "lucide-react"
import { useTenant } from "@/contexts/tenant-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client"

export default function ConfiguracoesGeraisPage() {
    const { currentTenant, setCurrentTenant } = useTenant()
    const params = useParams()
    const slug = params.tenantSlug as string

    const [bufferTime, setBufferTime] = useState("15")
    const [saving, setSaving] = useState(false)

    const [weekDays, setWeekDays] = useState([
        { id: 'seg', label: 'Segunda-Feira', open: '09:00', close: '20:00', active: true },
        { id: 'ter', label: 'Terça-Feira', open: '09:00', close: '20:00', active: true },
        { id: 'qua', label: 'Quarta-Feira', open: '09:00', close: '20:00', active: true },
        { id: 'qui', label: 'Quinta-Feira', open: '09:00', close: '20:00', active: true },
        { id: 'sex', label: 'Sexta-Feira', open: '09:00', close: '20:00', active: true },
        { id: 'sab', label: 'Sábado', open: '09:00', close: '20:00', active: true },
        { id: 'dom', label: 'Domingo', open: '', close: '', active: false },
    ])

    const toggleDay = (id: string) => {
        setWeekDays(prev => prev.map(day =>
            day.id === id ? { ...day, active: !day.active } : day
        ))
    }

    const updateTime = (id: string, field: 'open' | 'close', value: string) => {
        setWeekDays(prev => prev.map(day =>
            day.id === id ? { ...day, [field]: value } : day
        ))
    }

    const handleSave = async () => {
        setSaving(true)
        // TODO: Save to database
        await new Promise(resolve => setTimeout(resolve, 1000))
        setSaving(false)
        alert('Configurações salvas com sucesso!')
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
                        <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">Configurações Gerais</h2>
                        <p className="text-[#64748b] text-sm mt-0.5">Horários e regras de funcionamento</p>
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

            {/* Operating Hours - Trinks Style */}
            <Card className="rounded-xl border border-[#E2E8F0] shadow-sm bg-white overflow-hidden">
                <div className="px-6 py-4 bg-[#F8F9FF] border-b border-[#E2E8F0] flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#F97316]" />
                    <h3 className="text-lg font-bold text-[#0F172A]">Horário de funcionamento</h3>
                </div>

                <div className="p-6 space-y-3">
                    {weekDays.map((day) => (
                        <div
                            key={day.id}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-lg border transition-all",
                                day.active
                                    ? "border-[#E2E8F0] bg-white"
                                    : "border-[#E2E8F0] bg-[#F8F9FF]"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <Switch
                                    checked={day.active}
                                    onCheckedChange={() => toggleDay(day.id)}
                                    className="data-[state=checked]:bg-[#22C55E]"
                                />
                                <span className={cn(
                                    "font-medium text-sm min-w-[120px]",
                                    day.active ? "text-[#0F172A]" : "text-[#94a3b8]"
                                )}>
                                    {day.label}
                                </span>
                            </div>

                            {day.active ? (
                                <div className="flex items-center gap-3">
                                    <Input
                                        type="time"
                                        value={day.open}
                                        onChange={(e) => updateTime(day.id, 'open', e.target.value)}
                                        className="w-28 h-10 rounded-lg text-center font-medium border-[#E2E8F0] bg-white"
                                    />
                                    <span className="text-[#94a3b8] text-sm">até</span>
                                    <Input
                                        type="time"
                                        value={day.close}
                                        onChange={(e) => updateTime(day.id, 'close', e.target.value)}
                                        className="w-28 h-10 rounded-lg text-center font-medium border-[#E2E8F0] bg-white"
                                    />
                                    <button className="w-10 h-10 rounded-lg border border-[#E2E8F0] flex items-center justify-center hover:bg-[#F8F9FF] transition-colors">
                                        <span className="text-[#64748b]">↕</span>
                                    </button>
                                </div>
                            ) : (
                                <span className="text-sm text-[#94a3b8] font-medium">Fechado</span>
                            )}
                        </div>
                    ))}
                </div>
            </Card>

            {/* Buffer Time */}
            <Card className="rounded-xl border border-[#E2E8F0] shadow-sm bg-white overflow-hidden">
                <div className="px-6 py-4 bg-[#F8F9FF] border-b border-[#E2E8F0] flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#F97316]" />
                    <h3 className="text-lg font-bold text-[#0F172A]">Regras de Agendamento</h3>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label className="text-sm font-bold text-[#0F172A]">Tempo de Respiro (Buffer)</Label>
                            <p className="text-xs text-[#64748b]">Intervalo automático entre cada atendimento.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={bufferTime}
                                onChange={(e) => setBufferTime(e.target.value)}
                                className="w-20 h-10 rounded-lg text-center font-bold border-[#E2E8F0] bg-[#F8F9FF]"
                            />
                            <span className="text-sm font-medium text-[#64748b]">min</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-[#FFF7ED] border border-[#FDBA74] flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-[#F97316] flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-[#9A3412]">
                            Esta regra será aplicada globalmente a todos os serviços de <strong>{currentTenant?.name}</strong>.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    )
}
