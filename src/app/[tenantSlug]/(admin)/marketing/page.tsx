"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import {
    Gift,
    MessageSquare,
    Mail,
    Smartphone,
    Heart,
    Users,
    ArrowRight,
    Megaphone,
    Sparkles,
} from "lucide-react"
import { useTenant } from "@/contexts/tenant-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MarketingCard {
    icon: React.ElementType
    title: string
    description: string
    href: string
    color: string
    bgColor: string
    badge?: string
}

export default function MarketingPage() {
    const { currentTenant } = useTenant()
    const params = useParams()
    const slug = params.tenantSlug as string

    const marketingTools: MarketingCard[] = [
        {
            icon: Gift,
            title: "Cupons de Desconto",
            description: "Crie cupons promocionais para atrair clientes",
            href: `/${slug}/marketing/cupons`,
            color: "#F97316",
            bgColor: "bg-orange-50",
        },
        {
            icon: MessageSquare,
            title: "Automações por WhatsApp",
            description: "Lembretes automáticos e confirmações",
            href: `/${slug}/marketing/whatsapp`,
            color: "#22C55E",
            bgColor: "bg-green-50",
            badge: "Popular",
        },
        {
            icon: Smartphone,
            title: "SMS Marketing",
            description: "Campanhas por mensagem de texto",
            href: `/${slug}/marketing/sms`,
            color: "#3B82F6",
            bgColor: "bg-blue-50",
        },
        {
            icon: Mail,
            title: "E-mail Marketing",
            description: "Newsletters e promoções por email",
            href: `/${slug}/marketing/email`,
            color: "#8B5CF6",
            bgColor: "bg-purple-50",
        },
        {
            icon: Heart,
            title: "Programa de Fidelidade",
            description: "Sistema de pontos e recompensas",
            href: `/${slug}/marketing/fidelidade`,
            color: "#EC4899",
            bgColor: "bg-pink-50",
        },
        {
            icon: Users,
            title: "Convite de Retorno",
            description: "Reengaje clientes inativos",
            href: `/${slug}/marketing/retorno`,
            color: "#14B8A6",
            bgColor: "bg-teal-50",
        },
    ]

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[#0F172A] flex items-center gap-3">
                        <Megaphone className="w-8 h-8 text-[#F97316]" />
                        Marketing
                    </h2>
                    <p className="text-[#64748b] font-medium mt-1">
                        Ferramentas para atrair e fidelizar clientes
                    </p>
                </div>
            </div>

            {/* Feature Highlight */}
            <Card className="p-6 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white relative overflow-hidden">
                <Sparkles className="absolute top-4 right-4 w-8 h-8 text-white/30" />
                <div className="max-w-xl">
                    <h3 className="text-xl font-bold mb-2">Automatize seu marketing</h3>
                    <p className="text-white/80 text-sm mb-4">
                        Configure mensagens automáticas de confirmação, lembrete e pós-atendimento.
                        Seus clientes sempre informados, você focado no que importa.
                    </p>
                    <Link href={`/${slug}/marketing/whatsapp`}>
                        <Button className="bg-white text-[#F97316] hover:bg-white/90 font-medium">
                            Configurar WhatsApp
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </Card>

            {/* Marketing Tools Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketingTools.map((tool) => {
                    const Icon = tool.icon
                    return (
                        <Link key={tool.title} href={tool.href}>
                            <Card className="p-5 rounded-xl border border-[#E2E8F0] shadow-sm bg-white hover:shadow-md hover:border-[#F97316]/30 transition-all group cursor-pointer h-full relative">
                                {tool.badge && (
                                    <span className="absolute top-4 right-4 px-2 py-0.5 bg-[#22C55E] text-white text-[10px] font-bold uppercase rounded-full">
                                        {tool.badge}
                                    </span>
                                )}
                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", tool.bgColor)}>
                                    <Icon className="w-6 h-6" style={{ color: tool.color }} />
                                </div>
                                <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-[#F97316] transition-colors">
                                    {tool.title}
                                </h3>
                                <p className="text-xs text-[#64748b] mt-1">{tool.description}</p>
                            </Card>
                        </Link>
                    )
                })}
            </div>

            {/* Tips Section */}
            <Card className="p-6 rounded-xl border border-[#E2E8F0] bg-[#FFF7ED]">
                <h4 className="font-bold text-[#9A3412] mb-3">Dicas para aumentar seu faturamento</h4>
                <ul className="space-y-2 text-sm text-[#9A3412]">
                    <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#F97316] text-white flex items-center justify-center text-xs flex-shrink-0">1</span>
                        <span>Configure lembretes automáticos para reduzir faltas</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#F97316] text-white flex items-center justify-center text-xs flex-shrink-0">2</span>
                        <span>Crie cupons de primeira visita para novos clientes</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#F97316] text-white flex items-center justify-center text-xs flex-shrink-0">3</span>
                        <span>Ative o programa de fidelidade para aumentar retorno</span>
                    </li>
                </ul>
            </Card>
        </div>
    )
}
