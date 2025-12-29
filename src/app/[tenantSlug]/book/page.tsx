"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { format, addDays, isSameDay, startOfToday, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
    ArrowRight,
    Calendar as CalendarIcon,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    CreditCard,
    MapPin,
    Phone,
    ShieldCheck,
    ShoppingBag,
    Smartphone,
    Sparkles,
    Star,
    Gift,
    MessageCircle,
    User,
    Users as UsersIcon,
    Wallet
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { tenants } from "@/mocks/tenants"
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp"
import { services, employees } from "@/mocks/services"
import { appointments } from "@/mocks/data"
import { mockCustomers } from "@/mocks/customers"
import { combos } from "@/mocks/combos"
import { cn, getInitials } from "@/lib/utils"
import { CustomerTrustBar } from "@/components/CustomerTrustBar"
import { CustomerReviews } from "@/components/CustomerReviews"

type Step = 'service' | 'professional' | 'datetime' | 'client_info' | 'confirmation' | 'payment' | 'success'

const STEP_SEQUENCE: Step[] = ['service', 'professional', 'datetime', 'client_info', 'confirmation', 'payment']

const STEP_DETAILS: Record<Step, { label: string; description: string; icon: LucideIcon }> = {
    service: { label: "Serviço", description: "Escolha o cuidado", icon: Sparkles },
    professional: { label: "Profissional", description: "Preferências", icon: UsersIcon },
    datetime: { label: "Data & hora", description: "Disponibilidade", icon: Clock },
    client_info: { label: "Seus dados", description: "Identifique-se", icon: ShieldCheck },
    confirmation: { label: "Confirmação", description: "Revise tudo", icon: CheckCircle2 },
    payment: { label: "Pagamento", description: "Finalize em segurança", icon: CreditCard },
    success: { label: "Concluído", description: "Tudo pronto", icon: CheckCircle2 },
}

const weekDayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const

type PaymentMethod = {
    id: 'pix' | 'card' | 'local'
    label: string
    icon: LucideIcon
    description: string
}

const PAYMENT_METHODS: PaymentMethod[] = [
    { id: 'pix', label: 'Pix (5% de Desconto)', icon: Smartphone, description: 'Liberação imediata' },
    { id: 'card', label: 'Cartão de Crédito', icon: CreditCard, description: 'Até 3x sem juros' },
    { id: 'local', label: 'Pagar no Local', icon: Wallet, description: 'Pague ao finalizar o serviço' },
]

const trustHighlights = [
    { title: "Padrão BeautyFlow", description: "Equipe selecionada, avaliação 4.9/5", icon: Star },
    { title: "Confirmação imediata", description: "Whatsapp + e-mail com todos os detalhes", icon: MessageCircle },
    { title: "Presentes especiais", description: "Cupons exclusivos após o agendamento", icon: Gift },
]

const normalizeCpf = (value: string) => value.replace(/\D/g, "")

const findCustomerByCpf = (cpf: string) => mockCustomers.find((customer) => normalizeCpf(customer.cpf) === cpf)

const findCustomerByEmail = (email: string) =>
    mockCustomers.find((customer) => customer.email.toLowerCase() === email.toLowerCase())

export default function BookingPage() {
    const params = useParams()
    const router = useRouter()
    const tenantSlug = params.tenantSlug as string

    // Find tenant by slug (in a real app, this would be an API call)
    const tenant = useMemo(() => {
        return tenants.find(t => t.slug === tenantSlug) || tenants[0]
    }, [tenantSlug])

    const tenantInitials = useMemo(() => getInitials(tenant.fullName || tenant.name), [tenant.fullName, tenant.name])
    const tenantBadge = tenant.logo || tenantInitials || "BF"

    const whatsappUrl = useMemo(() => {
        const message = encodeURIComponent(`Olá, gostaria de agendar com ${tenant.fullName}!`)
        return `https://wa.me/${tenant.whatsapp}?text=${message}`
    }, [tenant.fullName, tenant.whatsapp])

    const handleWhatsAppContact = () => {
        window.open(whatsappUrl, "_blank")
    }

    const [step, setStep] = useState<Step>('service')
    const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null)
    const [selectedEmployee, setSelectedEmployee] = useState<typeof employees[0] | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date>(startOfToday())
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'pix' | 'card' | 'local' | null>(null)

    const voucherCode = useMemo(() => {
        if (!selectedService) {
            return "BF0000"
        }
        const datePart = format(selectedDate, "ddMM")
        const servicePart = selectedService.id.toString().padStart(2, '0').slice(-2)
        return `BF${datePart}${servicePart}`
    }, [selectedDate, selectedService])

    // Up-sell Logic: Find a service for the next slot
    const upsellService = useMemo(() => {
        if (step !== 'success' || !selectedTime) return null

        // 1. Get next slot
        const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]
        const currentIdx = timeSlots.indexOf(selectedTime)
        if (currentIdx === -1 || currentIdx === timeSlots.length - 1) return null

        const nextSlot = timeSlots[currentIdx + 1]

        // 2. Filter tenant services that AREN'T the selected one
        const otherServices = services.filter(s => s.tenantId === tenant.id && s.id !== selectedService?.id)

        // 3. For the mockup, we suggest the first one that is "quick" (like Manicure)
        const candidate = otherServices.find(s => s.duration <= 60) || otherServices[0]

        // 4. Check if slot is available (simulated)
        const isTaken = appointments.some(apt =>
            apt.tenantId === tenant.id &&
            apt.time === nextSlot &&
            format(parseISO(apt.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
        )

        return isTaken ? null : { service: candidate, time: nextSlot }
    }, [step, selectedTime, tenant.id, selectedService?.id, selectedDate])

    // Client Info State
    const [clientData, setClientData] = useState({
        name: "",
        email: "",
        phone: "",
        cpf: "",
        password: "",
        isExisting: false
    })

    const isCpfReady = normalizeCpf(clientData.cpf).length === 11

    const tenantServices = services.filter(s => s.tenantId === tenant.id)
    const tenantEmployees = employees.filter(e => e.tenantId === tenant.id)
    const suggestedCombos = useMemo(() => combos.filter(combo => combo.tenantId === tenant.id).slice(0, 2), [tenant.id])

    // Dynamic Slot Generation
    const timeSlots = useMemo(() => {
        if (!selectedService || !selectedEmployee || !selectedDate) return []

        const slots: string[] = []
        const dayOfWeek = weekDayKeys[selectedDate.getDay()]
        const employeeSchedule = selectedEmployee.workingHours[dayOfWeek]

        if (!employeeSchedule || employeeSchedule.length === 0) return []

        // Simulation parameters
        const intervalStep = 15 // minutes
        const serviceTotalDuration = (selectedService.bufferBefore || 0) + selectedService.duration + (selectedService.bufferAfter || 0)

        employeeSchedule.forEach(shift => {
            const [startH, startM] = shift.start.split(':').map(Number)
            const [endH, endM] = shift.end.split(':').map(Number)

            let currentTime = new Date(selectedDate)
            currentTime.setHours(startH, startM, 0, 0)

            const endTime = new Date(selectedDate)
            endTime.setHours(endH, endM, 0, 0)

            while (currentTime.getTime() + serviceTotalDuration * 60000 <= endTime.getTime()) {
                const slotTime = format(currentTime, 'HH:mm')

                // Check for conflicts
                const isTaken = appointments.some(apt => {
                    const aptStart = parseISO(apt.date)
                    const [aptH, aptM] = apt.time.split(':').map(Number)
                    aptStart.setHours(aptH, aptM, 0, 0)

                    const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000)

                    // Target window
                    const targetStart = new Date(currentTime)
                    const targetEnd = new Date(currentTime.getTime() + serviceTotalDuration * 60000)

                    // Overlap check
                    const overlaps = (targetStart < aptEnd && targetEnd > aptStart)

                    if (!overlaps) return false

                    // If individual mode, only care about THIS professional
                    if (tenant.schedulingType === 'individual') {
                        return apt.staffId === selectedEmployee.id
                    }

                    // If shared mode, ANY appointment in the tenant is a conflict
                    return apt.tenantId === tenant.id
                })

                if (!isTaken) {
                    slots.push(slotTime)
                }

                currentTime = new Date(currentTime.getTime() + intervalStep * 60000)
            }
        })

        return slots
    }, [selectedService, selectedEmployee, selectedDate, tenant.id, tenant.schedulingType])

    const activeTime = selectedTime ?? (timeSlots[0] ?? null)

    const handleNext = () => {
        if (step === 'service' && selectedService) setStep('professional')
        else if (step === 'professional' && selectedEmployee) setStep('datetime')
        else if (step === 'datetime' && selectedDate && activeTime) {
            if (!selectedTime && activeTime) {
                setSelectedTime(activeTime)
            }
            setStep('client_info')
        }
        else if (step === 'client_info') {
            if (!isCpfReady) return;
            if (clientData.isExisting && !clientData.password) return;
            if (!clientData.isExisting && (!clientData.name || !clientData.email || !clientData.phone || !clientData.password)) return;
            setStep('confirmation')
        }
        else if (step === 'confirmation') setStep('payment')
    }

    const handleBack = () => {
        if (step === 'professional') setStep('service')
        else if (step === 'datetime') setStep('professional')
        else if (step === 'client_info') setStep('datetime')
        else if (step === 'confirmation') setStep('client_info')
        else if (step === 'payment') setStep('confirmation')
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
    }

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-6">
                <motion.div
                    initial="hidden" animate="visible" variants={containerVariants}
                    className="max-w-md w-full text-center space-y-8"
                >
                    <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse" />
                        <div className="relative w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/40">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Agendado!</h1>
                        <p className="text-slate-500 dark:text-zinc-400 font-medium">Tudo certo, {clientData.name}. Te esperamos lá!</p>
                    </div>

                    <Card className="p-6 rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-12 translate-x-12" />
                        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-lg font-black text-primary">
                            {tenantBadge}
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-bold text-slate-900 dark:text-white">{selectedService?.name}</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} às {selectedTime}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
                                    Voucher: #{voucherCode}
                                </span>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Apresente este código na recepção.</p>
                            </div>
                        </div>
                    </Card>

                    {/* Order Bump Section */}
                    {upsellService && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Card className="p-6 rounded-[2.5rem] border-2 border-primary/20 bg-primary/5 relative overflow-hidden group">
                                <div className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-bl-3xl uppercase tracking-widest shadow-lg">
                                    Oferta Especial
                                </div>
                                <div className="space-y-4 text-left">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white leading-tight">Que tal aproveitar?</h4>
                                            <p className="text-xs text-slate-500 dark:text-zinc-400">Vimos que há um horário vago para {upsellService.service.name.toLowerCase()} logo após o seu.</p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-white dark:border-zinc-800 flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{upsellService.service.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Às {upsellService.time} • R$ {upsellService.service.price},00</p>
                                        </div>
                                        <Button size="sm" className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold h-10 px-6 active:scale-95 transition-all">
                                            Adicionar
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {suggestedCombos.length > 0 && (
                        <div className="space-y-3 w-full">
                            <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-slate-400">Complete sua experiência</h3>
                            <div className="grid gap-3">
                                {suggestedCombos.map(combo => (
                                    <Card key={combo.id} className="p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 text-left flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{combo.name}</p>
                                                <p className="text-xs text-slate-500">{combo.description}</p>
                                            </div>
                                            <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-widest">
                                                R$ {combo.price}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {combo.items.map(item => (
                                                <Badge key={item} variant="outline" className="text-[10px] rounded-full">
                                                    {item}
                                                </Badge>
                                            ))}
                                        </div>
                                        <Button className="rounded-xl w-full" variant="outline">
                                            Reservar combo
                                        </Button>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            onClick={() => router.push(`/${tenantSlug}/profile?email=${clientData.email}`)}
                            variant="outline"
                            className="flex-1 h-14 rounded-2xl border-slate-200 font-bold text-slate-600"
                        >
                            Ver Meus Agendamentos
                        </Button>
                        <Button
                            onClick={() => router.push(`/${tenantSlug}/book`)}
                            className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
                        >
                            Novo Agendamento
                        </Button>
                    </div>
                </motion.div>
                <FloatingWhatsApp phone={tenant.whatsapp} tenantName={tenant.name} />
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
                            {tenantBadge}
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{tenant.fullName}</h1>
                            <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-500 text-xs font-semibold uppercase tracking-widest">
                                <MapPin className="w-3 h-3" />
                                {tenant.name} • Centro
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/${tenantSlug}/shop`)}
                            className="rounded-full border-slate-200 dark:border-zinc-800 font-bold text-xs gap-2"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Loja
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full border-slate-200 dark:border-zinc-800"
                            onClick={handleWhatsAppContact}
                        >
                            <Phone className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-6 pb-32 space-y-8">
                <CustomerTrustBar tenant={tenant} />
                <CustomerReviews tenantName={tenant.fullName} />
                <Card className="p-5 sm:p-6 rounded-[2rem] border-none bg-gradient-to-br from-primary/5 via-white to-slate-50 dark:from-primary/20 dark:via-zinc-900 dark:to-zinc-900 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                            <Phone className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Precisa de ajuda?</p>
                            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                                Concierge BeautyFlow disponível para você
                            </p>
                            <p className="text-sm text-slate-500 dark:text-zinc-400">
                                Resposta média em menos de 3 minutos via WhatsApp.
                            </p>
                        </div>
                    </div>
                    <Button className="rounded-2xl h-12 font-bold" onClick={handleWhatsAppContact}>
                        Falar pelo WhatsApp
                    </Button>
                </Card>
                {/* Progress Tracker */}
                <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {STEP_SEQUENCE.map((flowStep, index) => {
                        const Icon = STEP_DETAILS[flowStep].icon
                        const currentIndex = step === 'success' ? STEP_SEQUENCE.length : Math.max(STEP_SEQUENCE.indexOf(step), 0)
                        const isCompleted = index < currentIndex
                        const isCurrent = step === flowStep
                        return (
                            <div
                                key={flowStep}
                                className={cn(
                                    "rounded-2xl border bg-white/80 dark:bg-zinc-900/70 p-4 transition-all",
                                    isCompleted && "border-primary/40 shadow-lg shadow-primary/10",
                                    isCurrent && "ring-2 ring-primary/40",
                                    !isCompleted && !isCurrent && "border-slate-100 dark:border-zinc-800"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center border",
                                            isCompleted
                                                ? "bg-primary text-white border-primary"
                                                : isCurrent
                                                    ? "bg-primary/10 text-primary border-primary/20"
                                                    : "bg-white text-slate-400 border-slate-200 dark:bg-zinc-900 dark:border-zinc-800"
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                                            {STEP_DETAILS[flowStep].label}
                                        </p>
                                        <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                                            {STEP_DETAILS[flowStep].description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
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
                                        onClick={() => {
                                            setSelectedEmployee(emp)
                                            setSelectedTime(null)
                                        }}
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
                                                onClick={() => {
                                                    setSelectedDate(date)
                                                    setSelectedTime(null)
                                                }}
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
                                    {timeSlots.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 p-6 text-center text-sm text-slate-500 dark:text-zinc-400">
                                            Nenhum horário disponível neste dia. Escolha outra data ou profissional.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                        {timeSlots.map(time => (
                                                <Button
                                                    key={time}
                                                variant={activeTime === time ? "default" : "outline"}
                                                    onClick={() => setSelectedTime(time)}
                                                    className={cn(
                                                        "h-14 rounded-2xl font-bold transition-all",
                                                    activeTime === time
                                                            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.05]"
                                                            : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white hover:bg-slate-50"
                                                    )}
                                                >
                                                    {time}
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step: Client Info */}
                    {step === 'client_info' && (
                        <motion.div
                            key="client_info"
                            initial="hidden" animate="visible" exit="exit" variants={containerVariants}
                            className="space-y-8"
                        >
                            <div className="flex items-center gap-4 -mb-4">
                                <Button variant="ghost" size="sm" onClick={handleBack} className="rounded-full">
                                    <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                                </Button>
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Falta pouco!</h2>
                                <p className="text-slate-500 dark:text-zinc-400">Preencha seus dados para finalizarmos o agendamento.</p>
                            </div>

                            <div className="space-y-6 max-w-lg">
                                {/* CPF Field - Primary ID */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">CPF (Identificação)</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="000.000.000-00"
                                            value={clientData.cpf}
                                            onChange={(e) => {
                                                const val = e.target.value
                                                const normalized = normalizeCpf(val)
                                                const existing = normalized.length === 11 ? findCustomerByCpf(normalized) : undefined
                                                setClientData((prev) => {
                                                    if (existing) {
                                                        return {
                                                            ...prev,
                                                            cpf: val,
                                                            isExisting: true,
                                                            name: existing.name,
                                                            email: existing.email,
                                                            phone: existing.phone || prev.phone,
                                                            password: ""
                                                        }
                                                    }

                                                    if (normalized.length === 11) {
                                                        return {
                                                            ...prev,
                                                            cpf: val,
                                                            isExisting: false,
                                                            name: "",
                                                            email: "",
                                                            phone: "",
                                                            password: ""
                                                        }
                                                    }

                                                    return { ...prev, cpf: val, isExisting: false }
                                                })
                                            }}
                                            className="w-full h-16 pl-12 pr-4 rounded-2xl border-2 border-transparent bg-white dark:bg-zinc-900 shadow-sm focus:border-primary focus:ring-0 transition-all font-medium text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <AnimatePresence mode="wait">
                                    {isCpfReady && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-4 overflow-hidden"
                                        >
                                            {clientData.isExisting ? (
                                                <div className="space-y-4">
                                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none rounded-full px-3 py-1">
                                                        Cliente Identificado: {clientData.name}
                                                    </Badge>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Sua Senha</label>
                                                        <input
                                                            type="password"
                                                            placeholder="••••••••"
                                                            value={clientData.password}
                                                            onChange={(e) => setClientData({ ...clientData, password: e.target.value })}
                                                            className="w-full h-16 px-6 rounded-2xl border-2 border-transparent bg-white dark:bg-zinc-900 shadow-sm focus:border-primary focus:ring-0 transition-all font-medium text-slate-900 dark:text-white"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <Badge className="bg-primary/10 text-primary border-none rounded-full px-3 py-1">
                                                        Primeiro Acesso: Criar Perfil
                                                    </Badge>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Nome Completo</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Como gostaria de ser chamado?"
                                                            value={clientData.name}
                                                            onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                                                            className="w-full h-16 px-6 rounded-2xl border-2 border-transparent bg-white dark:bg-zinc-900 shadow-sm focus:border-primary focus:ring-0 transition-all font-medium text-slate-900 dark:text-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">E-mail</label>
                                                        <input
                                                            type="email"
                                                            placeholder="seu@email.com"
                                                            value={clientData.email}
                                                            onChange={(e) => {
                                                                const val = e.target.value
                                                                const existing = findCustomerByEmail(val)
                                                                setClientData((prev) => {
                                                                    if (existing) {
                                                                        return {
                                                                            ...prev,
                                                                            email: val,
                                                                            isExisting: true,
                                                                            name: existing.name,
                                                                            cpf: existing.cpf,
                                                                            phone: existing.phone || prev.phone,
                                                                            password: ""
                                                                        }
                                                                    }
                                                                    return { ...prev, email: val }
                                                                })
                                                            }}
                                                            className="w-full h-16 px-6 rounded-2xl border-2 border-transparent bg-white dark:bg-zinc-900 shadow-sm focus:border-primary focus:ring-0 transition-all font-medium text-slate-900 dark:text-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">WhatsApp</label>
                                                        <input
                                                            type="tel"
                                                            placeholder="(11) 99999-0000"
                                                            value={clientData.phone}
                                                            onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                                                            className="w-full h-16 px-6 rounded-2xl border-2 border-transparent bg-white dark:bg-zinc-900 shadow-sm focus:border-primary focus:ring-0 transition-all font-medium text-slate-900 dark:text-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Criar Senha para Acesso</label>
                                                        <input
                                                            type="password"
                                                            placeholder="Mínimo 6 caracteres"
                                                            value={clientData.password}
                                                            onChange={(e) => setClientData({ ...clientData, password: e.target.value })}
                                                            className="w-full h-16 px-6 rounded-2xl border-2 border-transparent bg-white dark:bg-zinc-900 shadow-sm focus:border-primary focus:ring-0 transition-all font-medium text-slate-900 dark:text-white"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <Card className="p-6 rounded-[2rem] bg-emerald-500/5 border-emerald-500/10 flex gap-4 items-center">
                                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                                    {clientData.isExisting
                                        ? "Bom te ver de novo! Entre com sua senha para prosseguir."
                                        : "Com sua senha, você poderá consultar seu histórico e pontos de fidelidade a qualquer momento."}
                                </p>
                            </Card>
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
                                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                            Seguro
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Step: Payment */}
                    {step === 'payment' && (
                        <motion.div
                            key="payment"
                            initial="hidden" animate="visible" exit="exit" variants={containerVariants}
                            className="space-y-8"
                        >
                            <div className="flex items-center gap-4 -mb-4">
                                <Button variant="ghost" size="sm" onClick={handleBack} className="rounded-full">
                                    <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                                </Button>
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Forma de pagamento</h2>
                                <p className="text-slate-500 dark:text-zinc-400">Como você prefere pagar pelo serviço?</p>
                            </div>

                       <div className="grid grid-cols-1 gap-4">
                        {PAYMENT_METHODS.map((method) => (
                            <Card
                                key={method.id}
                                onClick={() => setSelectedPaymentMethod(method.id)}
                                className={cn(
                                    "p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center justify-between group active:scale-[0.98]",
                                    selectedPaymentMethod === method.id
                                        ? "border-primary bg-primary/[0.03] shadow-lg shadow-primary/5"
                                        : "border-transparent bg-white dark:bg-zinc-900 hover:border-slate-200 dark:hover:border-zinc-800 shadow-sm"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform text-slate-400">
                                        <method.icon className={cn(
                                            "w-6 h-6",
                                            selectedPaymentMethod === method.id ? "text-primary" : "text-slate-400"
                                        )} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{method.label}</h4>
                                        <p className="text-xs text-slate-500 dark:text-zinc-400">{method.description}</p>
                                    </div>
                                </div>
                                <div className={cn(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                    selectedPaymentMethod === method.id ? "border-primary bg-primary" : "border-slate-200"
                                )}>
                                    {selectedPaymentMethod === method.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                            </Card>
                        ))}
                            </div>

                            {selectedPaymentMethod === 'pix' && (
                                <Card className="p-6 rounded-[2.5rem] border-none shadow-xl bg-slate-900 text-white space-y-4">
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total com Desconto</p>
                                        <p className="text-2xl font-black text-emerald-400">R$ {Math.floor((selectedService?.price || 0) * 0.95)},00</p>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                                            <Sparkles className="w-5 h-5 text-white" />
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300 leading-tight">
                                            O código Pix expira em 30 minutos após a confirmação.
                                        </p>
                                    </div>
                                </Card>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {showSummary && (
                <section className="max-w-4xl mx-auto px-6 pb-8 space-y-4">
                    <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
                        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Resumo</p>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Quase tudo pronto!</h3>
                                </div>
                                <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-widest">
                                    {STEP_DETAILS[step].label}
                                </Badge>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Serviço</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedService?.name}</p>
                                    <p className="text-xs text-slate-500">{selectedService?.duration} min • R$ {selectedService?.price}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profissional</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedEmployee?.name}</p>
                                    <p className="text-xs text-slate-500">{selectedEmployee?.specialty}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                        {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Horário</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{activeTime}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="rounded-[2.5rem] border-none shadow-lg bg-white dark:bg-zinc-900 p-5 space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Ajuda & suporte</p>
                            <p className="text-sm text-slate-500 dark:text-zinc-400">Precisa ajustar algo? Fale com a equipe em segundos.</p>
                            <div className="flex flex-col gap-2">
                                <Button variant="outline" className="rounded-2xl w-full" onClick={handleWhatsAppContact}>
                                    WhatsApp {tenant.whatsapp?.substring(2)}
                                </Button>
                                <Button variant="ghost" className="rounded-2xl w-full text-slate-500" onClick={() => window.open(`tel:${tenant.phone}`, '_blank')}>
                                    Ligar para {tenant.phone}
                                </Button>
                            </div>
                        </Card>
                    </div>
                </section>
            )}

            {/* Confidence Highlights */}
            <section className="max-w-4xl mx-auto px-6 pb-32 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-slate-400 text-center">Por que reservar com a gente</h3>
                <div className="grid gap-3 md:grid-cols-3">
                    {trustHighlights.map(item => {
                        const Icon = item.icon
                        return (
                            <div key={item.title} className="p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                                    <p className="text-xs text-slate-500">{item.description}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* Custom Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent dark:from-zinc-950 dark:via-zinc-950 z-50">
                <div className="max-w-4xl mx-auto flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                        <span>{STEP_DETAILS[step].label}</span>
                        {selectedService && (
                            <span className="text-primary flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Voucher {voucherCode}
                            </span>
                        )}
                    </div>
                    <Button
                        disabled={
                            (step === 'service' && !selectedService) ||
                            (step === 'professional' && !selectedEmployee) ||
                            (step === 'datetime' && (!selectedDate || !activeTime)) ||
                            (step === 'client_info' && (
                                !isCpfReady ||
                                (clientData.isExisting
                                    ? !clientData.password
                                    : (!clientData.name || !clientData.email || !clientData.phone || !clientData.password))
                            )) ||
                            (step === 'payment' && !selectedPaymentMethod)
                        }
                        onClick={step === 'payment' ? () => setStep('success') : handleNext}
                        className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black text-xl shadow-2xl shadow-primary/30 group transition-all active:scale-[0.98]"
                    >
                        {step === 'payment' ? 'Finalizar Agendamento' : 'Próximo Passo'}
                        <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
