"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
    ArrowLeft,
    MessageSquare,
    Bell,
    Clock,
    Star,
    Check,
    ChevronRight,
    Smartphone,
} from "lucide-react"
import { useTenant } from "@/contexts/tenant-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface Automation {
    id: string
    title: string
    description: string
    icon: React.ElementType
    enabled: boolean
    timing?: string
}

export default function WhatsAppPage() {
    const { currentTenant } = useTenant()
    const params = useParams()
    const slug = params.tenantSlug as string

    const [automations, setAutomations] = useState<Automation[]>([
        {
            id: 'confirmation',
            title: "Confirmação de atendimento",
            description: "Mensagem enviada automaticamente após o agendamento ser criado",
            icon: Check,
            enabled: true,
        },
        {
            id: 'reminder_24h',
            title: "Lembrete de horário (24h antes)",
            description: "Lembra o cliente 24 horas antes do atendimento",
            icon: Clock,
            enabled: true,
            timing: "24h antes",
        },
        {
            id: 'reminder_2h',
            title: "Lembrete de horário (2h antes)",
            description: "Lembra o cliente 2 horas antes do atendimento",
            icon: Bell,
            enabled: false,
            timing: "2h antes",
        },
        {
            id: 'rating',
            title: "Avaliação do atendimento",
            description: "Solicita avaliação após a conclusão do serviço",
            icon: Star,
            enabled: true,
        },
        {
            id: 'return',
            title: "Convite de retorno",
            description: "Convida o cliente a retornar após período de inatividade",
            icon: MessageSquare,
            enabled: false,
        },
    ])

    const toggleAutomation = (id: string) => {
        setAutomations(prev => prev.map(a =>
            a.id === id ? { ...a, enabled: !a.enabled } : a
        ))
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/${slug}/marketing`}
                        className="w-10 h-10 rounded-lg border border-[#E2E8F0] flex items-center justify-center hover:bg-[#F8F9FF] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-[#64748b]" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">Automações por WhatsApp</h2>
                        <p className="text-[#64748b] text-sm mt-0.5">Configure mensagens automáticas</p>
                    </div>
                </div>
            </div>

            {/* WhatsApp Connection Card */}
            <Card className="p-6 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white relative overflow-hidden">
                <Smartphone className="absolute top-4 right-4 w-16 h-16 text-white/10" />
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                        <MessageSquare className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">WhatsApp da Tratto</h3>
                        <p className="text-white/80 text-sm">
                            Mensagens enviadas pelo número oficial do Tratto. Seus clientes recebem automaticamente.
                        </p>
                    </div>
                </div>
            </Card>

            {/* How it works */}
            <Card className="p-6 rounded-xl border border-[#E2E8F0] bg-white">
                <h3 className="font-bold text-[#0F172A] mb-4">Como funciona</h3>
                <div className="flex items-start gap-6">
                    <div className="flex-1 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#22C55E] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                        <div>
                            <p className="font-medium text-[#0F172A]">Confirmação de atendimento</p>
                            <p className="text-xs text-[#64748b] mt-0.5">Seu cliente recebe uma mensagem confirmando o agendamento</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#E2E8F0] flex-shrink-0 mt-1" />
                    <div className="flex-1 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#22C55E] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                        <div>
                            <p className="font-medium text-[#0F172A]">Lembrete de horário</p>
                            <p className="text-xs text-[#64748b] mt-0.5">Antes do atendimento, enviamos um lembrete</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#E2E8F0] flex-shrink-0 mt-1" />
                    <div className="flex-1 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#22C55E] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                        <div>
                            <p className="font-medium text-[#0F172A]">Avaliação do atendimento</p>
                            <p className="text-xs text-[#64748b] mt-0.5">Após o serviço, coletamos feedback</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Automations List */}
            <div className="space-y-4">
                <h3 className="font-bold text-[#0F172A]">Automações disponíveis</h3>

                {automations.map((automation) => {
                    const Icon = automation.icon
                    return (
                        <Card
                            key={automation.id}
                            className={cn(
                                "p-5 rounded-xl border shadow-sm transition-all",
                                automation.enabled
                                    ? "border-[#22C55E]/30 bg-white"
                                    : "border-[#E2E8F0] bg-[#F8F9FF]"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center",
                                        automation.enabled ? "bg-[#DCFCE7]" : "bg-[#F1F5F9]"
                                    )}>
                                        <Icon className={cn(
                                            "w-6 h-6",
                                            automation.enabled ? "text-[#22C55E]" : "text-[#94a3b8]"
                                        )} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className={cn(
                                                "font-semibold",
                                                automation.enabled ? "text-[#0F172A]" : "text-[#64748b]"
                                            )}>
                                                {automation.title}
                                            </h4>
                                            {automation.timing && (
                                                <span className="px-2 py-0.5 bg-[#F1F5F9] text-[#64748b] text-[10px] font-medium rounded-full">
                                                    {automation.timing}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-[#64748b] mt-0.5">{automation.description}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Switch
                                        checked={automation.enabled}
                                        onCheckedChange={() => toggleAutomation(automation.id)}
                                        className="data-[state=checked]:bg-[#22C55E]"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-[#64748b] hover:text-[#0F172A]"
                                    >
                                        Editar
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button className="rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-medium shadow-sm h-11 px-8">
                    Salvar Configurações
                </Button>
            </div>
        </div>
    )
}
