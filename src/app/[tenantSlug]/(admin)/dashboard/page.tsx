"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useTenant } from "@/contexts/tenant-context"
import { Card } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import {
    Calendar,
    TrendingUp,
    Users,
    DollarSign,
    Copy,
    Check,
    ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn, formatCurrency } from "@/lib/utils"
// Note: These components might need adaptation if they use specific contexts, checking them later if needed
// For now, I'll comment out complex sub-components to ensure the page loads, and add them back progressively or replace with simple UI
// import { QuickActions } from "@/components/QuickActions"
// import { DailyGoals } from "@/components/DailyGoals"

import { useTenantAppointments } from "@/hooks/useTenantRecords"

export default function TenantDashboardPage() {
    const { currentTenant } = useTenant()

    // If we don't have a tenant yet (loading), show skeleton
    if (!currentTenant) {
        return <div className="min-h-screen flex items-center justify-center">Carregando painel...</div>
    }

    const { data: appointmentRecords, loading: isLoading } = useTenantAppointments(currentTenant.id)
    const [copied, setCopied] = useState(false)

    // Calculate Real Stats
    const today = new Date()
    const todayStr = today.toDateString()
    const appointments = appointmentRecords || []

    const appointmentsToday = appointments.filter(a => new Date(a.startAt).toDateString() === todayStr)
    const incomeToday = appointmentsToday
        .filter(a => a.status === 'confirmed' || a.status === 'completed')
        .reduce((sum, a) => sum + (a.price || 0), 0)

    const incomeMonth = appointments
        .filter(a => {
            const d = new Date(a.startAt)
            return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear() && (a.status === 'confirmed' || a.status === 'completed')
        })
        .reduce((sum, a) => sum + (a.price || 0), 0)

    const activeClients = new Set(appointments.map(a => a.customerName)).size

    const realStats = [
        { label: "Agendamentos Hoje", value: appointmentsToday.length.toString(), icon: Calendar },
        { label: "Faturamento Hoje", value: formatCurrency(incomeToday), icon: DollarSign },
        { label: "Faturamento Mês", value: formatCurrency(incomeMonth), icon: TrendingUp },
        { label: "Clientes Ativos", value: activeClients.toString(), icon: Users },
    ]

    // Chart Data (Last 7 Days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        return d
    })

    const chartData = last7Days.map(date => {
        const dateStr = date.toDateString()
        const dayApts = appointments.filter(a => new Date(a.startAt).toDateString() === dateStr && (a.status === 'confirmed' || a.status === 'completed'))
        const total = dayApts.reduce((sum, a) => sum + (a.price || 0), 0)
        return {
            name: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
            total: total,
            customers: dayApts.length
        }
    })

    const topAppointments = [...appointments]
        .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
        .filter(a => new Date(a.startAt) >= new Date())
        .slice(0, 5)

    const bookingUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/${currentTenant.slug}/book`
        : `https://tratto.app/${currentTenant.slug}/book`

    const copyToClipboard = () => {
        navigator.clipboard.writeText(bookingUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }


    return (
        <div className="space-y-8 pb-10 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[#0F172A]">Visão Geral</h2>
                    <p className="text-[#64748b] font-medium mt-1">Bem-vindo(a) ao painel da {currentTenant.name}.</p>
                </div>

                <Card className="flex items-center gap-4 px-6 py-4 bg-white border border-[#E2E8F0] shadow-sm rounded-xl relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex-1 min-w-0 pr-4 relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b] mb-1">Seu Link de Agendamento</p>
                        <p className="text-xs font-semibold truncate text-[#0D9488]">{bookingUrl}</p>
                    </div>
                    <Button
                        size="sm"
                        onClick={copyToClipboard}
                        className="rounded-lg h-10 px-4 bg-[#0F172A] hover:bg-[#1e293b] text-white font-medium shrink-0 shadow-sm relative z-10"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                </Card>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                {realStats.map((stat, i) => (
                    <Card key={i} className="p-6 rounded-xl border border-[#E2E8F0] shadow-sm hover:shadow-md bg-white transition-all hover:border-[#0D9488]/30">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-[#F1F5F9] flex items-center justify-center">
                                <stat.icon className="w-5 h-5 text-[#0D9488]" />
                            </div>
                            <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">{stat.label}</p>
                        </div>
                        <h3 className="text-2xl font-bold text-[#0F172A]">{stat.value}</h3>
                    </Card>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Visual Chart */}
                <Card className="lg:col-span-8 rounded-xl border border-[#E2E8F0] shadow-sm bg-white p-6 sm:p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-[#0F172A]">Performance de Vendas</h3>
                            <p className="text-xs text-[#64748b] font-medium">Movimentação financeira dos últimos 7 dias.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#0D9488]" />
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#64748b]">Total</span>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                    fontWeight="bold"
                                />
                                <YAxis
                                    stroke="#94a3b8"
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
                                                <div className="bg-[#0F172A] p-4 rounded-lg shadow-lg border-none">
                                                    <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wide mb-1">{payload[0].payload.name}</p>
                                                    <p className="text-xl font-bold text-white">R$ {payload[0].value?.toLocaleString('pt-BR')}</p>
                                                    <p className="text-[10px] font-semibold text-[#0D9488] uppercase mt-1">{payload[0].payload.customers} atendimentos</p>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#0D9488"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Next Appointments */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="rounded-xl border border-[#E2E8F0] shadow-sm bg-white p-6 sm:p-8 min-h-[400px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-[#0F172A]">Agenda Hoje</h3>
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0D9488] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0D9488]"></span>
                            </span>
                        </div>

                        <div className="space-y-4">
                            {appointmentsToday.length === 0 ? (
                                <div className="text-center py-10">
                                    <Calendar className="w-10 h-10 text-[#E2E8F0] mx-auto mb-2" />
                                    <p className="text-sm text-[#64748b]">Agenda livre hoje!</p>
                                </div>
                            ) : (
                                topAppointments.map((apt, i) => (
                                    <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-[#F8F9FF] p-3 rounded-lg transition-colors border border-transparent hover:border-[#E2E8F0]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-[#F1F5F9] flex items-center justify-center font-semibold text-[#0D9488]">
                                                {apt.customerName?.charAt(0) || "C"}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-[#0F172A] truncate max-w-[120px]">{apt.customerName || "Cliente"}</h4>
                                                <p className="text-[10px] font-medium text-[#64748b] uppercase tracking-wide truncate max-w-[120px]">{apt.serviceName ?? "Serviço"}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-[#0F172A]">
                                                {new Date(apt.startAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <Button variant="ghost" className="w-full mt-6 rounded-lg font-medium text-[#0D9488] hover:text-[#0F766E] hover:bg-[#F8F9FF]">
                            Ver Agenda Completa <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    )
}
