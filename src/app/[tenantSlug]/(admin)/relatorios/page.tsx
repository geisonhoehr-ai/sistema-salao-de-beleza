"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
    BarChart3,
    TrendingUp,
    Users,
    Scissors,
    ShoppingBag,
    Calendar,
    DollarSign,
    Award,
    Clock,
    UserCheck,
    Package,
    Star,
    ArrowRight,
    FileSpreadsheet,
    PieChart,
    Activity,
    Download,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react"
import { useTenant } from "@/contexts/tenant-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTenantAppointments, useTenantServices, useTenantEmployees } from "@/hooks/useTenantRecords"
import { formatCurrency } from "@/lib/utils"

interface ReportCard {
    icon: React.ElementType
    title: string
    description: string
    href: string
    color: string
    bgColor: string
}

export default function RelatoriosPage() {
    const { currentTenant } = useTenant()
    const params = useParams()
    const slug = params.tenantSlug as string

    const { data: appointments } = useTenantAppointments(currentTenant?.id || '')
    const { data: services } = useTenantServices(currentTenant?.id || '')
    const { data: employees } = useTenantEmployees(currentTenant?.id || '')

    // Quick stats
    const stats = useMemo(() => {
        const today = new Date()
        const thisMonth = appointments?.filter(a => {
            const d = new Date(a.startAt)
            return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
        }) || []

        const completedThisMonth = thisMonth.filter(a => a.status === 'completed')
        const revenue = completedThisMonth.reduce((sum, a) => sum + (a.finalPrice || a.price || 0), 0)

        return {
            totalAppointments: thisMonth.length,
            completedAppointments: completedThisMonth.length,
            revenue,
            avgTicket: completedThisMonth.length > 0 ? revenue / completedThisMonth.length : 0,
        }
    }, [appointments])

    // Mock ranking data
    const topServices = [
        { name: "Corte Masculino", amount: 12500, count: 250, growth: "+12%" },
        { name: "Barba Terapia", amount: 8400, count: 180, growth: "+5%" },
        { name: "Hidratação", amount: 4200, count: 45, growth: "-2%" },
        { name: "Coloração", amount: 3800, count: 22, growth: "+8%" },
    ]

    const topEmployees = [
        { name: "Carlos Silva", revenue: 15400, services: 180, rating: 4.9 },
        { name: "Ana Beatriz", revenue: 12800, services: 145, rating: 5.0 },
        { name: "João Pedro", revenue: 9500, services: 110, rating: 4.7 },
    ]

    const mainReports: ReportCard[] = [
        {
            icon: BarChart3,
            title: "Dashboard Financeiro",
            description: "Visão geral de receitas, despesas e lucro",
            href: `/${slug}/relatorios/financeiro`,
            color: "#22C55E",
            bgColor: "bg-green-50",
        },
        {
            icon: TrendingUp,
            title: "Demonstrativo de Resultado",
            description: "DRE simplificado do período",
            href: `/${slug}/relatorios/dre`,
            color: "#3B82F6",
            bgColor: "bg-blue-50",
        },
        {
            icon: Calendar,
            title: "Relatório de Agendamentos",
            description: "Histórico completo de atendimentos",
            href: `/${slug}/relatorios/agendamentos`,
            color: "#F97316",
            bgColor: "bg-orange-50",
        },
        {
            icon: DollarSign,
            title: "Comissões de Profissionais",
            description: "Pagamentos e comissões por período",
            href: `/${slug}/relatorios/comissoes`,
            color: "#8B5CF6",
            bgColor: "bg-purple-50",
        },
    ]

    const rankingReports: ReportCard[] = [
        {
            icon: Users,
            title: "Ranking de Clientes",
            description: "Clientes que mais gastam",
            href: `/${slug}/relatorios/ranking/clientes`,
            color: "#EC4899",
            bgColor: "bg-pink-50",
        },
        {
            icon: UserCheck,
            title: "Ranking de Profissionais",
            description: "Profissionais com melhor desempenho",
            href: `/${slug}/relatorios/ranking/profissionais`,
            color: "#14B8A6",
            bgColor: "bg-teal-50",
        },
        {
            icon: Scissors,
            title: "Ranking de Serviços",
            description: "Serviços mais procurados",
            href: `/${slug}/relatorios/ranking/servicos`,
            color: "#F59E0B",
            bgColor: "bg-amber-50",
        },
        {
            icon: Package,
            title: "Ranking de Produtos",
            description: "Produtos mais vendidos",
            href: `/${slug}/relatorios/ranking/produtos`,
            color: "#6366F1",
            bgColor: "bg-indigo-50",
        },
    ]

    const ReportCardComponent = ({ report }: { report: ReportCard }) => {
        const Icon = report.icon
        return (
            <Link href={report.href}>
                <Card className="p-5 rounded-xl border border-[#E2E8F0] shadow-sm bg-white hover:shadow-md hover:border-[#F97316]/30 transition-all group cursor-pointer h-full">
                    <div className="flex items-start gap-4">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", report.bgColor)}>
                            <Icon className="w-6 h-6" style={{ color: report.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-[#F97316] transition-colors">
                                {report.title}
                            </h3>
                            <p className="text-xs text-[#64748b] mt-1">{report.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#94a3b8] group-hover:text-[#F97316] transition-colors flex-shrink-0" />
                    </div>
                </Card>
            </Link>
        )
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[#0F172A]">Relatórios</h2>
                    <p className="text-[#64748b] font-medium mt-1">
                        Analise o desempenho do seu negócio
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-lg gap-2 border-[#E2E8F0] hover:bg-[#F8F9FF]">
                        <Calendar className="w-4 h-4" />
                        Este Mês
                    </Button>
                    <Button className="rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-medium shadow-sm gap-2">
                        <Download className="w-4 h-4" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 rounded-xl bg-[#0F172A] text-white border-none">
                    <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide">Ticket Médio</p>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(stats.avgTicket || 145)}</p>
                    <p className="text-xs text-[#22C55E] mt-1 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> +12% vs mês anterior
                    </p>
                </Card>
                <Card className="p-4 rounded-xl border border-[#E2E8F0] bg-white">
                    <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">Taxa de Ocupação</p>
                    <p className="text-2xl font-bold text-[#0F172A] mt-1">78%</p>
                    <p className="text-xs text-[#22C55E] mt-1 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> Alta demanda
                    </p>
                </Card>
                <Card className="p-4 rounded-xl border border-[#E2E8F0] bg-white">
                    <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">Novos Clientes</p>
                    <p className="text-2xl font-bold text-[#0F172A] mt-1">45</p>
                    <p className="text-xs text-[#64748b] mt-1">15% do total</p>
                </Card>
                <Card className="p-4 rounded-xl border border-[#E2E8F0] bg-white">
                    <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">Retenção</p>
                    <p className="text-2xl font-bold text-[#0F172A] mt-1">82%</p>
                    <p className="text-xs text-[#F59E0B] mt-1 flex items-center gap-1">
                        <ArrowDownRight className="w-3 h-3" /> -2% vs mês anterior
                    </p>
                </Card>
            </div>

            {/* Main Reports Grid - Trinks Style */}
            <div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-[#F97316]" />
                    Relatórios Principais
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {mainReports.map((report) => (
                        <ReportCardComponent key={report.title} report={report} />
                    ))}
                </div>
            </div>

            {/* Rankings Grid */}
            <div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#F97316]" />
                    Rankings
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {rankingReports.map((report) => (
                        <ReportCardComponent key={report.title} report={report} />
                    ))}
                </div>
            </div>

            {/* Detailed Rankings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Services */}
                <Card className="rounded-xl border border-[#E2E8F0] shadow-sm bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Scissors className="w-5 h-5 text-[#F97316]" />
                            Serviços Mais Vendidos
                        </CardTitle>
                        <CardDescription>O que seus clientes mais procuram</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topServices.map((service, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F8F9FF] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                                            i === 0 ? "bg-[#F97316] text-white" : "bg-[#F1F5F9] text-[#64748b]"
                                        )}>
                                            #{i + 1}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[#0F172A]">{service.name}</p>
                                            <p className="text-xs text-[#64748b]">{service.count} realizados</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-[#0F172A]">{formatCurrency(service.amount)}</p>
                                        <p className={cn(
                                            "text-xs font-medium",
                                            service.growth.startsWith('+') ? 'text-[#22C55E]' : 'text-[#EF4444]'
                                        )}>
                                            {service.growth}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Employees */}
                <Card className="rounded-xl border border-[#E2E8F0] shadow-sm bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Users className="w-5 h-5 text-[#F97316]" />
                            Top Profissionais
                        </CardTitle>
                        <CardDescription>Quem traz mais faturamento</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topEmployees.map((emp, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F8F9FF] transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm",
                                            i === 0 ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white" : "bg-[#F1F5F9] text-[#64748b]"
                                        )}>
                                            {i === 0 ? '👑' : emp.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[#0F172A] group-hover:text-[#F97316] transition-colors">{emp.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-[#64748b]">
                                                <span>{emp.services} serviços</span>
                                                <span>•</span>
                                                <span className="flex items-center text-amber-500">
                                                    ★ {emp.rating}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-[#0F172A]">{formatCurrency(emp.revenue)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Heat Map & Satisfaction - Trinks Style */}
            <div className="grid md:grid-cols-3 gap-4">
                <Link href={`/${slug}/relatorios/mapa-calor`}>
                    <Card className="p-5 rounded-xl border border-[#E2E8F0] shadow-sm bg-white hover:shadow-md hover:border-[#F97316]/30 transition-all group cursor-pointer h-full">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                                <Clock className="w-6 h-6 text-[#EF4444]" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-[#F97316] transition-colors">
                                    Mapa de Calor
                                </h3>
                                <p className="text-xs text-[#64748b] mt-1">Horários de pico</p>
                            </div>
                        </div>
                    </Card>
                </Link>
                <Link href={`/${slug}/relatorios/satisfacao`}>
                    <Card className="p-5 rounded-xl border border-[#E2E8F0] shadow-sm bg-white hover:shadow-md hover:border-[#F97316]/30 transition-all group cursor-pointer h-full">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
                                <Star className="w-6 h-6 text-[#F59E0B]" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-[#F97316] transition-colors">
                                    Pesquisa de Satisfação
                                </h3>
                                <p className="text-xs text-[#64748b] mt-1">Avaliações dos clientes</p>
                            </div>
                        </div>
                    </Card>
                </Link>
                <Link href={`/${slug}/relatorios/retorno`}>
                    <Card className="p-5 rounded-xl border border-[#E2E8F0] shadow-sm bg-white hover:shadow-md hover:border-[#F97316]/30 transition-all group cursor-pointer h-full">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center flex-shrink-0">
                                <Activity className="w-6 h-6 text-[#06B6D4]" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-[#F97316] transition-colors">
                                    Retorno de Clientes
                                </h3>
                                <p className="text-xs text-[#64748b] mt-1">Taxa de fidelização</p>
                            </div>
                        </div>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
