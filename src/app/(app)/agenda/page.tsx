"use client"

import { useState, useEffect } from "react"
import { format, addDays, parseISO, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Filter, Users as UsersIcon, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { appointments } from "@/mocks/data"
import { services, employees } from "@/mocks/services"
import { useTenant } from "@/contexts/tenant-context"
import { motion, AnimatePresence } from "framer-motion"

// Generate time slots from 08:00 to 20:00
const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8)

export default function AgendaPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
    const [currentTime, setCurrentTime] = useState(new Date())
    const { currentTenant } = useTenant()

    // Update real-time indicator every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    const tenantEmployees = employees.filter(e => e.tenantId === currentTenant.id)
    const tenantAppointments = appointments.filter(apt => apt.tenantId === currentTenant.id)

    const nextDay = () => setCurrentDate(addDays(currentDate, 1))
    const prevDay = () => setCurrentDate(addDays(currentDate, -1))
    const today = () => setCurrentDate(new Date())

    const filteredAppointments = tenantAppointments.filter(apt => {
        const aptDate = parseISO(apt.date)
        const matchesDate = isSameDay(aptDate, currentDate)
        const matchesEmployee = selectedEmployee === "all" || apt.staffId === selectedEmployee
        return matchesDate && matchesEmployee
    })

    const getAppointmentWithBuffer = (apt: typeof tenantAppointments[0]) => {
        const service = services.find(s => s.id === apt.serviceId)
        const [hours, minutes] = apt.time.split(':').map(Number)
        const bufferBefore = service?.bufferBefore || 0
        const bufferAfter = service?.bufferAfter || 0
        const serviceDuration = apt.duration
        const startMinute = (hours - 8) * 60 + minutes - bufferBefore
        const totalDuration = bufferBefore + serviceDuration + bufferAfter

        return {
            top: `${startMinute * 2.5}px`, // Slightly taller slots
            height: `${totalDuration * 2.5}px`,
            serviceStart: bufferBefore * 2.5,
            serviceHeight: serviceDuration * 2.5,
            bufferBeforeHeight: bufferBefore * 2.5,
            bufferAfterHeight: bufferAfter * 2.5
        }
    }

    const getStatusStyles = (status: string) => {
        const styles = {
            pending: 'bg-amber-100/40 text-amber-700 border-amber-200/50 after:bg-amber-500',
            confirmed: 'bg-emerald-100/40 text-emerald-700 border-emerald-200/50 after:bg-emerald-500',
            completed: 'bg-slate-100/40 text-slate-700 border-slate-200/50 after:bg-slate-500',
            cancelled: 'bg-rose-100/40 text-rose-700 border-rose-200/50 after:bg-rose-500'
        }
        return styles[status as keyof typeof styles] || styles.pending
    }

    const employeesWithAppointments = selectedEmployee === "all"
        ? tenantEmployees
        : tenantEmployees.filter(e => e.id === selectedEmployee)

    const isToday = isSameDay(currentDate, new Date())
    const currentIndicatorPos = isToday
        ? ((currentTime.getHours() - 8) * 60 + currentTime.getMinutes()) * 2.5
        : -100

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <CalendarIcon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-semibold uppercase tracking-wider text-primary">Agenda Global</span>
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
                        {format(currentDate, "dd 'de' MMMM", { locale: ptBR })}
                    </h2>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Gerencie a escala e atendimentos de hoje em tempo real.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl border-black/5 dark:border-white/10 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtros Avançados
                    </Button>
                    <Button className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Agendamento
                    </Button>
                </div>
            </div>

            {/* Controls Bar */}
            <Card className="rounded-3xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-5 border border-white/20 dark:border-white/5">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl">
                        <Button variant="ghost" size="icon" onClick={prevDay} className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-zinc-800">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={today}
                            className={cn(
                                "px-6 rounded-xl font-medium transition-all",
                                isToday ? "bg-white dark:bg-zinc-800 shadow-sm text-primary" : "hover:bg-white dark:hover:bg-zinc-800"
                            )}
                        >
                            Hoje
                        </Button>
                        <Button variant="ghost" size="icon" onClick={nextDay} className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-zinc-800">
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-primary/5 border border-primary/10">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                {format(currentTime, "HH:mm")} • Tempo Real
                            </span>
                        </div>

                        <div className="h-6 w-[1px] bg-black/5 dark:bg-white/10 hidden sm:block" />

                        <div className="flex items-center gap-3 min-w-[240px]">
                            <UsersIcon className="w-4 h-4 text-muted-foreground" />
                            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                                <SelectTrigger className="border-none bg-transparent hover:bg-black/5 dark:hover:bg-white/5 rounded-xl h-10 ring-0 focus:ring-0">
                                    <SelectValue placeholder="Profissional" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-2xl backdrop-blur-xl bg-white/90 dark:bg-zinc-900/90">
                                    <SelectItem value="all" className="rounded-lg">Todos os profissionais</SelectItem>
                                    {tenantEmployees.map(emp => (
                                        <SelectItem key={emp.id} value={emp.id} className="rounded-lg">
                                            {emp.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Calendar Grid Container */}
            <div className="relative group/agenda">
                <Card className="rounded-[32px] border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl overflow-hidden border border-white/20 dark:border-white/5">
                    <div className="flex h-[900px] overflow-hidden">
                        {/* Time Column */}
                        <div className="w-24 border-r border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] sticky left-0 z-20 backdrop-blur-md">
                            <div className="h-20 border-b border-black/5 dark:border-white/5 flex items-center justify-center">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Horários</span>
                            </div>
                            <div className="h-full overflow-y-auto invisible-scrollbar pb-20">
                                {timeSlots.map(hour => (
                                    <div
                                        key={hour}
                                        className="h-[150px] flex flex-col items-center justify-start pt-4 border-b border-black/5 dark:border-white/5"
                                    >
                                        <span className="text-sm font-bold text-foreground/70">{String(hour).padStart(2, '0')}:00</span>
                                        <span className="text-[10px] text-muted-foreground font-medium mt-1 opacity-50">__:30</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Employee Columns */}
                        <div className="flex-1 flex overflow-x-auto invisible-scrollbar scroll-smooth">
                            <AnimatePresence mode="popLayout">
                                {employeesWithAppointments.map((employee, idx) => {
                                    const employeeAppointments = filteredAppointments.filter(
                                        apt => apt.staffId === employee.id
                                    )

                                    return (
                                        <motion.div
                                            key={employee.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: idx * 0.05, duration: 0.4 }}
                                            className="flex-1 min-w-[320px] border-r border-black/5 dark:border-white/5 last:border-r-0 relative"
                                        >
                                            {/* Employee Header */}
                                            <div className="h-20 border-b border-black/5 dark:border-white/5 px-6 flex items-center gap-4 bg-white/30 dark:bg-zinc-900/30 sticky top-0 z-10 backdrop-blur-md">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-purple-600 p-[2px] shadow-lg shadow-primary/10">
                                                    <div className="w-full h-full rounded-[14px] bg-white dark:bg-zinc-900 flex items-center justify-center font-bold text-lg text-primary">
                                                        {employee.name.charAt(0)}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-base truncate text-foreground">{employee.name}</p>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-tight">
                                                            {employee.specialties.length} Serviços
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Time Grid with real-time indicator */}
                                            <div className="relative h-full overflow-y-auto invisible-scrollbar pb-20">
                                                {timeSlots.map(hour => (
                                                    <div
                                                        key={hour}
                                                        className="h-[150px] border-b border-black/[0.03] dark:border-white/[0.03] relative group/slot hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors"
                                                    />
                                                ))}

                                                {/* Today Indicator Line (Fixed relative position if simple) */}
                                                {isToday && (
                                                    <motion.div
                                                        className="absolute left-0 right-0 z-10 pointer-events-none"
                                                        style={{ top: currentIndicatorPos }}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                    >
                                                        <div className="absolute left-0 w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] border-2 border-white dark:border-zinc-900" />
                                                        <div className="h-[2px] w-full bg-gradient-to-r from-red-500 to-transparent opacity-50" />
                                                    </motion.div>
                                                )}

                                                {/* Appointments */}
                                                <AnimatePresence>
                                                    {employeeAppointments.map(apt => {
                                                        const layout = getAppointmentWithBuffer(apt)
                                                        const service = services.find(s => s.id === apt.serviceId)

                                                        return (
                                                            <motion.div
                                                                key={apt.id}
                                                                initial={{ scale: 0.9, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                whileHover={{ scale: 1.02, y: -2 }}
                                                                className="absolute left-3 right-3 rounded-2xl overflow-hidden shadow-2xl shadow-black/5 group/card"
                                                                style={{
                                                                    top: layout.top,
                                                                    height: layout.height,
                                                                    zIndex: 5
                                                                }}
                                                            >
                                                                {/* Glass Background */}
                                                                <div className={cn(
                                                                    "absolute inset-0 border-l-[6px] border backdrop-blur-xl transition-all duration-300",
                                                                    getStatusStyles(apt.status)
                                                                )} />

                                                                <div className="relative h-full flex flex-col">
                                                                    {/* Buffer Before */}
                                                                    {service && service.bufferBefore > 0 && (
                                                                        <div
                                                                            className="flex items-center justify-center border-b border-dashed border-black/10 dark:border-white/10 overflow-hidden"
                                                                            style={{ height: `${layout.bufferBeforeHeight}px` }}
                                                                        >
                                                                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Setup</span>
                                                                        </div>
                                                                    )}

                                                                    {/* Main Service */}
                                                                    <div className="flex-1 p-4 flex flex-col justify-between min-h-0">
                                                                        <div>
                                                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                                                <span className="text-[11px] font-bold tracking-tight opacity-70">
                                                                                    {apt.time} - {(() => {
                                                                                        try {
                                                                                            const [h, m] = apt.time.split(':').map(Number);
                                                                                            const start = parseISO(apt.date);
                                                                                            start.setHours(h, m, 0, 0);
                                                                                            const end = new Date(start.getTime() + (apt.duration * 60000));
                                                                                            return format(end, 'HH:mm');
                                                                                        } catch (e) {
                                                                                            return '--:--';
                                                                                        }
                                                                                    })()}
                                                                                </span>
                                                                                <Badge variant="outline" className="h-5 text-[9px] font-bold uppercase tracking-tighter border-black/10 dark:border-white/10 bg-white/20">
                                                                                    {apt.duration}m
                                                                                </Badge>
                                                                            </div>
                                                                            <p className="font-extrabold text-sm tracking-tight leading-tight mb-0.5 line-clamp-1">
                                                                                {apt.customer}
                                                                            </p>
                                                                            <p className="text-xs font-medium opacity-60 line-clamp-1 uppercase tracking-tighter">
                                                                                {service?.name}
                                                                            </p>
                                                                        </div>

                                                                        <div className="flex items-center justify-between mt-auto">
                                                                            <div className="flex -space-x-1.5">
                                                                                {[1].map(i => (
                                                                                    <div key={i} className="w-5 h-5 rounded-full border-2 border-white dark:border-zinc-800 bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[8px] font-bold">
                                                                                        {apt.customer.charAt(0)}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
                                                                        </div>
                                                                    </div>

                                                                    {/* Buffer After */}
                                                                    {service && service.bufferAfter > 0 && (
                                                                        <div
                                                                            className="flex items-center justify-center border-t border-dashed border-black/10 dark:border-white/10 overflow-hidden"
                                                                            style={{ height: `${layout.bufferAfterHeight}px` }}
                                                                        >
                                                                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Limpeza</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        )
                                                    })}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Legend - Floating Style */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40">
                <div className="flex items-center gap-6 px-8 py-4 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl shadow-2xl border border-white/20 dark:border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pendente</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Confirmado</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.5)]" />
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Concluído</span>
                    </div>
                    <div className="h-4 w-[1px] bg-black/10 dark:bg-white/10" />
                    <div className="flex items-center gap-2 opacity-50">
                        <div className="w-3 h-3 rounded bg-black/10 dark:bg-white/10 border border-dashed border-black/20" />
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Intervalo</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
