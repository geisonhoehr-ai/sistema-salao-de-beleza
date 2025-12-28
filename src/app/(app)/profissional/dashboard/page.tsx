"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { appointments, services, clients } from "@/mocks/data"
import { useTenant } from "@/contexts/tenant-context"
import { useAuth } from "@/contexts/auth-context"
import {
    TrendingUp,
    DollarSign,
    Clock,
    CheckCircle,
    Calendar,
    MapPin,
    Users
} from "lucide-react"

export default function ProfissionalDashboard() {
    const { currentTenant } = useTenant()
    const { user } = useAuth()

    const todayAppointments = appointments.filter(
        apt => apt.tenantId === currentTenant.id && apt.staffId === "1" // mock: staff 1
    )

    const vipClients = clients
        .filter(client => client.tenantId === currentTenant.id)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 3)

    const metrics = useMemo(() => ({
        revenue: 580,
        tips: 120,
        completion: 68,
        retention: "+12%",
    }), [])

    return (
        <div className="space-y-6 pb-20">
            <header className="space-y-1">
                <p className="text-xs uppercase tracking-[0.4em] text-primary/60">Boa jornada</p>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">Vista Profissional</h1>
                <p className="text-sm text-muted-foreground">
                    Agenda, metas e financeiro pessoal – otimizados para mobile.
                </p>
            </header>

            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard icon={DollarSign} label="Faturado hoje" value={`R$ ${metrics.revenue}`} footer="+R$ 350 em metas" />
                <MetricCard icon={TrendingUp} label="Metas batidas" value={`${metrics.completion}%`} footer="Meta diária 90%" progress />
                <MetricCard icon={Clock} label="Horas em serviço" value="5h 40m" footer="2h livres a partir das 16h" />
                <MetricCard icon={Users} label="Retenção" value={metrics.retention} footer="Clientes recorrentes da semana" />
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
                <Card className="rounded-[2rem] border-none shadow-lg bg-white/80 dark:bg-zinc-900/70">
                    <CardHeader>
                        <CardTitle>Agenda do dia</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {todayAppointments.map((apt) => {
                            const service = services.find(s => s.id === apt.serviceId)
                            return (
                                <div key={apt.id} className="rounded-2xl border border-slate-100 dark:border-zinc-800 p-4 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{apt.customer}</p>
                                            <p className="text-xs uppercase tracking-widest text-muted-foreground">{service?.name}</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs capitalize">
                                            {apt.status}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        {apt.time} • {apt.duration} min
                                    </div>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-lg bg-white/80 dark:bg-zinc-900/70">
                    <CardHeader>
                        <CardTitle>Metas e comissões</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-xs uppercase text-muted-foreground">Meta do dia</p>
                            <p className="text-lg font-bold">R$ 950 / R$ 1.200</p>
                            <Progress value={80} className="mt-2" />
                        </div>
                        <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold">Comissão prevista</p>
                                <p className="text-sm font-bold text-primary">R$ 340</p>
                            </div>
                            <p className="text-xs text-muted-foreground">4 serviços concluídos • bônus por upsell disponível</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-lg bg-white/80 dark:bg-zinc-900/70">
                    <CardHeader>
                        <CardTitle>Check-in rápido</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button className="w-full h-12 rounded-2xl">Iniciar expediente</Button>
                        <Button variant="outline" className="w-full h-12 rounded-2xl">Registrar intervalo</Button>
                        <Button variant="secondary" className="w-full h-12 rounded-2xl">Finalizar dia</Button>
                    </CardContent>
                </Card>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
                <Card className="rounded-[2rem] border-none shadow-sm bg-white/80 dark:bg-zinc-900/70">
                    <CardHeader>
                        <CardTitle>Ações rápidas</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3">
                        {["Registrar venda", "Adicionar nota", "Enviar lembrete", "Ver histórico"].map(action => (
                            <Button key={action} variant="outline" className="h-12 rounded-2xl justify-start">
                                {action}
                            </Button>
                        ))}
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-sm bg-white/80 dark:bg-zinc-900/70">
                    <CardHeader>
                        <CardTitle>Clientes que amam você</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {vipClients.map(client => (
                            <div key={client.id} className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{client.name}</p>
                                    <p className="text-xs text-muted-foreground">Ticket médio R$ {client.totalSpent.toFixed(2)}</p>
                                </div>
                                <Badge variant="secondary" className="rounded-full">
                                    {client.status}
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}

function MetricCard({ icon: Icon, label, value, footer, progress }: { icon: any, label: string, value: string, footer: string, progress?: boolean }) {
    return (
        <Card className="rounded-2xl border-none shadow-sm bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
            <CardContent className="py-5 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
                {progress && <Progress value={parseInt(value)} className="h-1.5" />}
                <p className="text-xs text-muted-foreground">{footer}</p>
            </CardContent>
        </Card>
    )
}

