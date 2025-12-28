"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { stats, appointments } from "@/mocks/data"
import { useTenant } from "@/contexts/tenant-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import {
    Calendar,
    TrendingUp,
    Users,
    DollarSign,
    Clock,
    Share2,
    Copy,
    Check,
    Sparkles,
    ArrowUpRight,
    AlertCircle,
    Zap,
    ChevronRight,
    Star,
    TrendingDown,
    Heart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const chartData = [
    { name: 'Seg', total: 1200, customers: 12 },
    { name: 'Ter', total: 1800, customers: 15 },
    { name: 'Qua', total: 1400, customers: 10 },
    { name: 'Qui', total: 2200, customers: 18 },
    { name: 'Sex', total: 2800, customers: 22 },
    { name: 'Sáb', total: 3200, customers: 25 },
]

export default function DashboardPage() {
    const { currentTenant } = useTenant()
    const [copied, setCopied] = useState(false)

    const tenantAppointments = appointments.filter(apt => apt.tenantId === currentTenant.id)

    const bookingUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/${currentTenant.slug}/book`
        : `/${currentTenant.slug}/book`

    const copyToClipboard = () => {
        navigator.clipboard.writeText(bookingUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const insights = [
        {
            title: "Oportunidade de Manhã",
            description: "Você tem 3 horários livres amanhã entre 09h e 11h. Que tal um cupom relâmpago?",
            icon: Zap,
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        },
        {
            title: "Serviço em Alta",
            description: "'Mechas Loiro Perolado' teve um aumento de 40% na procura esta semana.",
            icon: TrendingUp,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            title: "Lembrete de Recompra",
            description: "15 clientes completam 30 dias desde a última visita. Hora de enviar um 'saudade'?",
            icon: Heart,
            color: "text-pink-500",
            bg: "bg-pink-500/10"
        },
    ]

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Dashboard</h2>
                    <p className="text-slate-500 dark:text-zinc-400 font-medium">Insights e performance da {currentTenant.name}.</p>
                </div>

                <Card className="flex items-center gap-4 px-6 py-3 bg-white dark:bg-zinc-900 border-none shadow-xl rounded-2xl relative overflow-hidden group border border-slate-100 dark:border-zinc-800">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform" />
                    <div className="flex-1 min-w-0 pr-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Link de Agendamento</p>
                        <p className="text-sm font-bold truncate text-primary">{bookingUrl}</p>
                    </div>
                    <Button
                        size="sm"
                        onClick={copyToClipboard}
                        className="rounded-xl h-10 px-4 bg-slate-900 dark:bg-primary text-white font-bold shrink-0 hover:scale-105 transition-all active:scale-95"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                </Card>
            </div>

            {/* Strategic Insights Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insights.map((insight, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="p-5 rounded-3xl border-none shadow-sm bg-white dark:bg-zinc-900 group cursor-pointer hover:shadow-md transition-all border border-transparent hover:border-slate-100 dark:hover:border-zinc-800">
                            <div className="flex gap-4">
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", insight.bg)}>
                                    <insight.icon className={cn("w-6 h-6", insight.color)} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                                        {insight.title}
                                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">{insight.description}</p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="p-6 rounded-[2rem] border-none shadow-sm bg-white dark:bg-zinc-900">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
                            <div className={cn(
                                "flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full",
                                stat.trend.startsWith('+') ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"
                            )}>
                                {stat.trend.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {stat.trend}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Visual Chart */}
                <Card className="lg:col-span-8 rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Performance de Vendas</h3>
                            <p className="text-xs text-slate-500 font-medium">Movimentação financeira da última semana.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Faturamento</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="name"
                                    stroke="#cbd5e1"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                    fontWeight="bold"
                                />
                                <YAxis
                                    stroke="#cbd5e1"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v) => `R$${v}`}
                                    fontWeight="bold"
                                />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-slate-900 p-4 rounded-2xl shadow-2xl border-none">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                                                    <p className="text-xl font-black text-white">R$ {payload[0].value?.toLocaleString('pt-BR')}</p>
                                                    <p className="text-[10px] font-bold text-primary uppercase mt-1">{payload[0].payload.customers} atendimentos</p>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Status Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Agora no Salão</h3>
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                        </div>

                        <div className="space-y-6">
                            {tenantAppointments.slice(0, 3).map((apt, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center font-black text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                            {apt.customer.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{apt.customer}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{apt.serviceId}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-slate-900 dark:text-white">{apt.time}</p>
                                        <Badge className={cn(
                                            "mt-1 text-[8px] font-bold uppercase border-none",
                                            apt.status === 'confirmed' ? "bg-emerald-500/10 text-emerald-500" :
                                                apt.status === 'completed' ? "bg-slate-100 text-slate-400" : "bg-primary/10 text-primary"
                                        )}>
                                            {apt.status === 'confirmed' ? 'Confirmado' : apt.status === 'completed' ? 'Finalizado' : 'Em breve'}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button variant="ghost" className="w-full mt-8 rounded-2xl font-bold text-slate-400 hover:text-primary">
                            Visualizar Agenda Completa <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </Card>

                    {/* Pro Tip */}
                    <Card className="p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden">
                        <Sparkles className="absolute top-4 right-4 w-6 h-6 text-primary" />
                        <div className="relative z-10 space-y-4">
                            <h4 className="font-black text-lg leading-tight">Dica do Dia</h4>
                            <p className="text-xs text-slate-400 leading-relaxed italic">"Clientes que compram o Shampoo Premium voltam 24% mais vezes. Ofereça no fechamento!"</p>
                            <Button className="w-full h-12 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100">
                                Ver Relatório de Recompra
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
