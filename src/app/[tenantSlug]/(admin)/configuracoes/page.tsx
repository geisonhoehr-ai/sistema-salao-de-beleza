"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
    Store,
    Shield,
    Globe,
    CreditCard,
    Settings,
    Calendar,
    MessageSquare,
    Heart,
    Receipt,
    FileText,
    ChevronRight,
    Bell,
    Users,
    Palette,
} from "lucide-react"
import { useTenant } from "@/contexts/tenant-context"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SettingItem {
    icon: React.ElementType
    label: string
    href: string
    description?: string
}

export default function ConfiguracoesPage() {
    const { currentTenant } = useTenant()
    const params = useParams()
    const slug = params.tenantSlug as string

    const systemSettings: SettingItem[] = [
        {
            icon: Store,
            label: "Dados do estabelecimento",
            href: `/${slug}/configuracoes/estabelecimento`,
            description: "Nome, endereço, contato"
        },
        {
            icon: Shield,
            label: "Perfis de acesso",
            href: `/${slug}/configuracoes/perfis`,
            description: "Permissões de usuários"
        },
        {
            icon: Globe,
            label: "Site e Agendamento Online",
            href: `/${slug}/configuracoes/agendamento-online`,
            description: "Configurar página de booking"
        },
        {
            icon: CreditCard,
            label: "Formas de pagamento",
            href: `/${slug}/configuracoes/pagamentos`,
            description: "Métodos aceitos"
        },
        {
            icon: Settings,
            label: "Configurações gerais",
            href: `/${slug}/configuracoes/gerais`,
            description: "Horários, intervalos, regras"
        },
        {
            icon: Calendar,
            label: "Feriados e horários especiais",
            href: `/${slug}/configuracoes/feriados`,
            description: "Dias fechados, exceções"
        },
        {
            icon: Palette,
            label: "Identidade Visual",
            href: `/${slug}/configuracoes/visual`,
            description: "Logo, cores, tema"
        },
    ]

    const additionalSettings: SettingItem[] = [
        {
            icon: Bell,
            label: "Notificações",
            href: `/${slug}/configuracoes/notificacoes`,
            description: "Email, SMS, WhatsApp"
        },
        {
            icon: MessageSquare,
            label: "Rotina de mensagens",
            href: `/${slug}/configuracoes/mensagens`,
            description: "Lembretes automáticos"
        },
        {
            icon: Users,
            label: "Convite de retorno",
            href: `/${slug}/configuracoes/retorno`,
            description: "Reengajamento de clientes"
        },
        {
            icon: Heart,
            label: "Programa de Fidelidade",
            href: `/${slug}/configuracoes/fidelidade`,
            description: "Pontos e recompensas"
        },
        {
            icon: Receipt,
            label: "Nota Fiscal de Serviços (NFS-e)",
            href: `/${slug}/configuracoes/nfse`,
            description: "Emissão automática"
        },
        {
            icon: FileText,
            label: "Nota Fiscal do Consumidor (NFC-e)",
            href: `/${slug}/configuracoes/nfce`,
            description: "Emissão de cupom fiscal"
        },
    ]

    const SettingsList = ({ items, title }: { items: SettingItem[], title: string }) => (
        <Card className="rounded-xl border border-[#E2E8F0] shadow-sm bg-white overflow-hidden">
            <div className="px-6 py-4 bg-[#F8F9FF] border-b border-[#E2E8F0]">
                <h3 className="text-lg font-bold text-[#0F172A]">{title}</h3>
            </div>
            <div className="divide-y divide-[#E2E8F0]">
                {items.map((item) => {
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="flex items-center gap-4 px-6 py-4 hover:bg-[#F8F9FF] transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-[#F97316]/10 flex items-center justify-center flex-shrink-0">
                                <Icon className="w-5 h-5 text-[#F97316]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#0F172A] group-hover:text-[#F97316] transition-colors">
                                    {item.label}
                                </p>
                                {item.description && (
                                    <p className="text-xs text-[#64748b] mt-0.5">{item.description}</p>
                                )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-[#94a3b8] group-hover:text-[#F97316] transition-colors" />
                        </Link>
                    )
                })}
            </div>
        </Card>
    )

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-[#0F172A]">Configurações</h2>
                <p className="text-[#64748b] font-medium mt-1">
                    Gerencie todas as configurações do seu estabelecimento.
                </p>
            </div>

            {/* Two Column Layout - Trinks Style */}
            <div className="grid md:grid-cols-2 gap-8">
                <SettingsList items={systemSettings} title="Configurações do sistema" />
                <SettingsList items={additionalSettings} title="Configurações adicionais" />
            </div>

            {/* Quick Info Card */}
            <Card className="p-6 rounded-xl border border-[#E2E8F0] shadow-sm bg-gradient-to-r from-[#FFF7ED] to-white">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#F97316] flex items-center justify-center flex-shrink-0">
                        <Store className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-[#0F172A]">{currentTenant?.name}</h4>
                        <p className="text-sm text-[#64748b]">
                            Slug: <span className="font-mono text-[#F97316]">{slug}</span>
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    )
}
