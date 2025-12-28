"use client"

import { stats, appointments } from "@/mocks/data"
import { useTenant } from "@/contexts/tenant-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Calendar, TrendingUp, Users, DollarSign, Clock } from "lucide-react"

const chartData = [
    { name: 'Seg', total: 1200 },
    { name: 'Ter', total: 1800 },
    { name: 'Qua', total: 1400 },
    { name: 'Qui', total: 2200 },
    { name: 'Sex', total: 2800 },
    { name: 'Sáb', total: 3200 },
]

export default function DashboardPage() {
    const { currentTenant } = useTenant()

    // Filter appointments by current tenant
    const tenantAppointments = appointments.filter(apt => apt.tenantId === currentTenant.id)

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
                    <p className="text-muted-foreground mt-1">Bem-vindo de volta ao BeautyFlow.</p>
                </div>
            </div>

            {/* Stats Grid - Bento Style */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="rounded-2xl border-none shadow-sm bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <span className={stat.trend.startsWith('+') ? "text-green-600" : "text-red-600"}>
                                    {stat.trend}
                                </span>
                                em relação a ontem
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                {/* Main Chart */}
                <Card className="col-span-4 rounded-2xl border-none shadow-sm bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Receita Semanal</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `R$${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorTotal)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Appointments */}
                <Card className="col-span-3 rounded-2xl border-none shadow-sm bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Próximos Agendamentos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {tenantAppointments.map((apt, i) => (
                                <div key={i} className="flex items-center">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                        {apt.customer.charAt(0)}
                                    </div>
                                    <div className="ml-4 space-y-1 flex-1">
                                        <p className="text-sm font-medium leading-none">{apt.customer}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {apt.time} • {apt.duration} min
                                        </p>
                                    </div>
                                    <div className={`text-xs font-medium px-2.5 py-1 rounded-full ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                        apt.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                        {apt.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
