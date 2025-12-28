"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { format, addDays, isSameDay, startOfToday } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    Calendar as CalendarIcon,
    CheckCircle2,
    Sparkles,
    User,
    ArrowRight,
    MapPin,
    Phone
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { tenants } from "@/mocks/tenants"
import { services, employees } from "@/mocks/services"
import { cn } from "@/lib/utils"

type Step = 'service' | 'professional' | 'datetime' | 'confirmation' | 'success'

export default function BookingPage() {
    const params = useParams()
    const router = useRouter()
    const tenantSlug = params.tenantSlug as string

    // Find tenant by slug (in a real app, this would be an API call)
    const tenant = useMemo(() => {
        return tenants.find(t => t.customDomain?.split('.')[0] === tenantSlug) || tenants[0]
    }, [tenantSlug])

    const [step, setStep] = useState<Step>('service')
    const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null)
    const [selectedEmployee, setSelectedEmployee] = useState<typeof employees[0] | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date>(startOfToday())
    const [selectedTime, setSelectedTime] = useState<string | null>(null)

    const tenantServices = services.filter(s => s.tenantId === tenant.id)
    const tenantEmployees = employees.filter(e => e.tenantId === tenant.id)

    // Mock time slots
    const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]

    const handleNext = () => {
        if (step === 'service' && selectedService) setStep('professional')
        else if (step === 'professional' && selectedEmployee) setStep('datetime')
        else if (step === 'datetime' && selectedDate && selectedTime) setStep('confirmation')
    }

    const handleBack = () => {
        if (step === 'professional') setStep('service')
        else if (step === 'datetime') setStep('professional')
        else if (step === 'confirmation') setStep('datetime')
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
    }

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <motion.div
                    initial="hidden" animate="visible" variants={containerVariants}
                    className="max-w-md w-full text-center space-y-6"
                >
                    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-200">
                        <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">Agendamento Confirmado!</h1>
                        <p className="text-slate-500">Tudo pronto! Enviamos um lembrete para o seu e-mail e WhatsApp.</p>
                    </div>
                    <Card className="p-6 rounded-[2rem] border-none shadow-xl bg-white space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400 font-medium tracking-tight uppercase">Serviço</span>
                            <span className="text-slate-900 font-bold">{selectedService?.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400 font-medium tracking-tight uppercase">Profissional</span>
                            <span className="text-slate-900 font-bold">{selectedEmployee?.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400 font-medium tracking-tight uppercase">Data e Hora</span>
                            <span className="text-slate-900 font-bold">
                                {format(selectedDate, "dd 'de' MMM", { locale: ptBR })} às {selectedTime}
                            </span>
                        </div>
                    </Card>
                    <Button
                        onClick={() => router.push(`/${tenantSlug}/book`)}
                        className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg"
                    >
                        Fazer outro agendamento
                    </Button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans selection:bg-primary/20">
            {/* Elegant Header */}
            <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-zinc-800/50 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-xl shadow-lg shadow-primary/20">
                            {tenant.logo}
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{tenant.fullName}</h1>
                            <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-500 text-xs font-semibold uppercase tracking-widest">
                                <MapPin className="w-3 h-3" />
                                {tenant.name} • Centro
                            </div>
                        </div>
                    </div>
                    <Button variant="outline" size="icon" className="rounded-full border-slate-200 dark:border-zinc-800">
                        <Phone className="w-4 h-4" />
                    </Button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-6 pb-32">
                {/* Progress Bar */}
                <div className="mb-10 flex gap-2">
                    {['service', 'professional', 'datetime', 'confirmation'].map((s, idx) => (
                        <div
                            key={s}
                            className={cn(
                                "h-1.5 flex-1 rounded-full transition-all duration-500",
                                step === s ? "bg-primary w-3" :
                                    ['service', 'professional', 'datetime', 'confirmation'].indexOf(step) > idx
                                        ? "bg-primary/40"
                                        : "bg-slate-200 dark:bg-zinc-800"
                            )}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* Step: Select Service */}
                    {step === 'service' && (
                        <motion.div
                            key="service"
                            initial="hidden" animate="visible" exit="exit" variants={containerVariants}
                            className="space-y-6"
                        >
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">O que vamos fazer hoje?</h2>
                                <p className="text-slate-500 dark:text-zinc-400">Selecione o serviço desejado para agendar.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tenantServices.map(service => (
                                    <Card
                                        key={service.id}
                                        onClick={() => setSelectedService(service)}
                                        className={cn(
                                            "p-6 rounded-[2rem] border-2 transition-all cursor-pointer group active:scale-[0.98]",
                                            selectedService?.id === service.id
                                                ? "border-primary bg-primary/[0.03] shadow-xl shadow-primary/10"
                                                : "border-transparent bg-white dark:bg-zinc-900 hover:border-slate-200 dark:hover:border-zinc-800 shadow-sm"
                                        )}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{service.name}</h3>
                                                <p className="text-sm text-slate-500 dark:text-zinc-400 line-clamp-2">{service.description}</p>
                                            </div>
                                            {selectedService?.id === service.id && (
                                                <CheckCircle2 className="w-6 h-6 text-primary" />
                                            )}
                                        </div>
                                        <div className="mt-6 flex items-center justify-between">
                                            <div className="flex gap-4 text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {service.duration}m</span>
                                                <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> R$ {service.price}</span>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step: Select Professional */}
                    {step === 'professional' && (
                        <motion.div
                            key="professional"
                            initial="hidden" animate="visible" exit="exit" variants={containerVariants}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <Button variant="ghost" size="sm" onClick={handleBack} className="rounded-full">
                                    <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                                </Button>
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Escolha um especialista</h2>
                                <p className="text-slate-500 dark:text-zinc-400">Quem você gostaria que realizasse seu atendimento?</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {tenantEmployees.map(emp => (
                                    <Card
                                        key={emp.id}
                                        onClick={() => setSelectedEmployee(emp)}
                                        className={cn(
                                            "p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer text-center space-y-4 group active:scale-[0.98]",
                                            selectedEmployee?.id === emp.id
                                                ? "border-primary bg-primary/[0.03] shadow-xl shadow-primary/10"
                                                : "border-transparent bg-white dark:bg-zinc-900 hover:border-slate-200 dark:hover:border-zinc-800 shadow-sm"
                                        )}
                                    >
                                        <div className="relative mx-auto w-20 h-20 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-zinc-900 shadow-md">
                                            <User className="w-10 h-10 text-slate-300 dark:text-zinc-600" />
                                            {selectedEmployee?.id === emp.id && (
                                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                    <CheckCircle2 className="w-8 h-8 text-primary" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white">{emp.name}</h3>
                                            <Badge variant="outline" className="mt-1 text-[10px] uppercase font-bold tracking-tighter opacity-70">Expert</Badge>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step: Date & Time */}
                    {step === 'datetime' && (
                        <motion.div
                            key="datetime"
                            initial="hidden" animate="visible" exit="exit" variants={containerVariants}
                            className="space-y-8"
                        >
                            <div className="flex items-center gap-4 -mb-4">
                                <Button variant="ghost" size="sm" onClick={handleBack} className="rounded-full">
                                    <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                                </Button>
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Quando será sua visita?</h2>
                                <p className="text-slate-500 dark:text-zinc-400">Selecione o melhor dia e horário para você.</p>
                            </div>

                            <div className="space-y-6">
                                {/* Date Picker */}
                                <div className="flex gap-3 overflow-x-auto pb-4 invisible-scrollbar">
                                    {Array.from({ length: 14 }).map((_, i) => {
                                        const date = addDays(startOfToday(), i)
                                        const isSelected = isSameDay(date, selectedDate)
                                        return (
                                            <div
                                                key={i}
                                                onClick={() => setSelectedDate(date)}
                                                className={cn(
                                                    "flex flex-col items-center justify-center min-w-[72px] h-24 rounded-3xl border-2 transition-all cursor-pointer",
                                                    isSelected
                                                        ? "border-primary bg-primary text-white shadow-xl shadow-primary/20"
                                                        : "border-transparent bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400"
                                                )}
                                            >
                                                <span className="text-[10px] font-bold uppercase tracking-widest leading-none mb-2 opacity-70">
                                                    {format(date, "EEE", { locale: ptBR })}
                                                </span>
                                                <span className="text-xl font-black leading-none">{format(date, "dd")}</span>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Time Grid */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Horários disponíveis</h4>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                        {timeSlots.map(time => (
                                            <Button
                                                key={time}
                                                variant={selectedTime === time ? "default" : "outline"}
                                                onClick={() => setSelectedTime(time)}
                                                className={cn(
                                                    "h-14 rounded-2xl font-bold transition-all",
                                                    selectedTime === time
                                                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.05]"
                                                        : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white hover:bg-slate-50"
                                                )}
                                            >
                                                {time}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step: Confirmation */}
                    {step === 'confirmation' && (
                        <motion.div
                            key="confirmation"
                            initial="hidden" animate="visible" exit="exit" variants={containerVariants}
                            className="space-y-8"
                        >
                            <div className="flex items-center gap-4 -mb-4">
                                <Button variant="ghost" size="sm" onClick={handleBack} className="rounded-full">
                                    <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                                </Button>
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Confirme seu agendamento</h2>
                                <p className="text-slate-500 dark:text-zinc-400">Revise os detalhes antes de finalizar.</p>
                            </div>

                            <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-zinc-900 p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Serviço</p>
                                            <p className="text-xl font-extrabold text-slate-900 dark:text-white">{selectedService?.name}</p>
                                            <p className="text-slate-500 text-sm font-medium">{selectedService?.duration} minutos • R$ {selectedService?.price}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Profissional</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-slate-400">
                                                    {selectedEmployee?.name.charAt(0)}
                                                </div>
                                                <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedEmployee?.name}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Data e Hora</p>
                                            <div className="flex items-center gap-3">
                                                <CalendarIcon className="w-5 h-5 text-primary" />
                                                <p className="text-lg font-bold text-slate-900 dark:text-white">
                                                    {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3 mt-2">
                                                <Clock className="w-5 h-5 text-primary" />
                                                <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedTime}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-100 dark:border-zinc-800">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-slate-500">Valor Total</p>
                                            <p className="text-3xl font-black text-primary">R$ {selectedService?.price},00</p>
                                        </div>
                                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none px-4 py-1.5 rounded-full font-bold">
                                            Pagamento no local
                                        </Badge>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Custom Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent dark:from-zinc-950 dark:via-zinc-950 z-50">
                <div className="max-w-4xl mx-auto">
                    <Button
                        disabled={
                            (step === 'service' && !selectedService) ||
                            (step === 'professional' && !selectedEmployee) ||
                            (step === 'datetime' && (!selectedDate || !selectedTime))
                        }
                        onClick={step === 'confirmation' ? () => setStep('success') : handleNext}
                        className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black text-xl shadow-2xl shadow-primary/30 group transition-all active:scale-[0.98]"
                    >
                        {step === 'confirmation' ? 'Confirmar Agendamento' : 'Próximo Passo'}
                        <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
