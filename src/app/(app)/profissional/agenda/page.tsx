"use client"

import { useMemo } from "react"
import { appointments, services } from "@/mocks/data"
import { useTenant } from "@/contexts/tenant-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react"
import { addDays, format, isSameDay, startOfToday } from "date-fns"
import { useState } from "react"
import { ptBR } from "date-fns/locale"

const filters = ["Todos", "Confirmados", "Aguardando", "Finalizados"]

export default function ProfissionalAgendaPage() {
    const { currentTenant } = useTenant()
    const [currentDate, setCurrentDate] = useState(startOfToday())
    const [filter, setFilter] = useState("Todos")

    const dayAppointments = useMemo(() => {
        return appointments
            .filter(apt => apt.tenantId === currentTenant.id && apt.staffId === "1")
            .filter(apt => isSameDay(new Date(apt.date), currentDate))
            .filter(apt => filter === "Todos" || statusLabels[apt.status] === filter)
            .map(apt => ({
                ...apt,
                service: services.find(service => service.id === apt.serviceId)
            }))
    }, [currentTenant.id, currentDate, filter])

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-primary/60">Agenda</p>
                    <h1 className="text-2xl font-black">Meus horários</h1>
                    <p className="text-sm text-muted-foreground">Gerencie o dia sem confusão</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setCurrentDate(addDays(currentDate, -1))}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="px-3 py-1 rounded-full bg-white dark:bg-zinc-900 border text-sm font-semibold">
                        {format(currentDate, "dd 'de' MMM", { locale: ptBR })}
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setCurrentDate(addDays(currentDate, 1))}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </header>

            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {filters.map(item => (
                    <Button
                        key={item}
                        variant={filter === item ? "default" : "outline"}
                        className="rounded-full h-9 px-4"
                        onClick={() => setFilter(item)}
                    >
                        {item}
                    </Button>
                ))}
            </div>

            <div className="space-y-4">
                {dayAppointments.length === 0 && (
                    <Card className="rounded-2xl border-none shadow-sm bg-white/70 dark:bg-zinc-900/70">
                        <CardContent className="p-6 text-center text-sm text-muted-foreground">
                            Nenhum agendamento para este dia.
                        </CardContent>
                    </Card>
                )}
                {dayAppointments.map((apt) => (
                    <Card key={apt.id} className="rounded-2xl border-none shadow-sm bg-white/80 dark:bg-zinc-900/70">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">{apt.customer}</CardTitle>
                            <Badge variant="outline" className="capitalize">{apt.status}</Badge>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p className="font-semibold">{apt.service?.name}</p>
                            <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4" />
                                {apt.time} • {apt.duration} min
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="w-4 h-4" />
                                Sala 2 - {currentTenant.name}
                            </div>
                            <Button className="w-full h-10 rounded-xl mt-3">Iniciar atendimento</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

const statusLabels: Record<string, string> = {
    confirmed: "Confirmados",
    scheduled: "Aguardando",
    completed: "Finalizados",
    pending: "Aguardando"
}

