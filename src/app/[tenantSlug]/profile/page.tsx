"use client"

import { useMemo } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { format, parseISO, differenceInHours, isAfter, addHours } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
    ChevronLeft,
    Calendar,
    Clock,
    User,
    MapPin,
    ExternalLink,
    Sparkles,
    History,
    ShieldCheck,
    AlertCircle,
    Bell,
    ShoppingBag,
    Lock
} from "lucide-react"
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { tenants } from "@/mocks/tenants"
import { appointments } from "@/mocks/data"
import { services } from "@/mocks/services"
import { mockCustomers } from "@/mocks/customers"
import { cn } from "@/lib/utils"

export default function CustomerProfilePage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const tenantSlug = params.tenantSlug as string
    const customerEmail = searchParams.get('email')

    const tenant = useMemo(() => {
        return tenants.find(t => t.slug === tenantSlug) || tenants[0]
    }, [tenantSlug])

    const customer = useMemo(() => {
        if (!customerEmail) return null
        return mockCustomers.find(c => c.email === customerEmail) || {
            name: customerEmail.split('@')[0],
            email: customerEmail,
            points: 150, // Default for non-mocked emails
            status: 'active'
        }
    }, [customerEmail])

    // Find all appointments for this email
    const allAppointments = useMemo(() => {
        if (!customerEmail) return []
        return appointments.filter(apt => apt.customer.toLowerCase().includes(customerEmail.split('@')[0].toLowerCase()))
    }, [customerEmail])

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    }

    if (!customerEmail) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-4">
                    <h1 className="text-2xl font-bold">Perfil não encontrado</h1>
                    <p className="text-slate-500">Por favor, acesse o link enviado após o seu agendamento.</p>
                    <Button onClick={() => router.back()} variant="outline">Voltar</Button>
                </div>
            </div>
        )
    }

    const AppointmentCard = ({ apt }: { apt: typeof appointments[0] }) => {
        const aptTenant = tenants.find(t => t.id === apt.tenantId)
        const aptService = services.find(s => s.id === apt.serviceId)

        // Cancellation Logic: 24h rule
        const appointmentDate = parseISO(apt.date)
        const [hours, minutes] = apt.time.split(':').map(Number)
        const fullAptDate = addHours(appointmentDate, hours)
        const canCancel = differenceInHours(fullAptDate, new Date()) >= 24 && apt.status === 'confirmed'

        const handleCancelRequest = () => {
            if (canCancel) {
                alert("Solicitação de cancelamento enviada com sucesso!")
            } else {
                const message = encodeURIComponent(`Olá! Gostaria de cancelar meu agendamento de ${aptService?.name} no dia ${format(fullAptDate, "dd/MM")}.`)
                window.open(`https://wa.me/${aptTenant?.whatsapp}?text=${message}`, '_blank')
            }
        }

        return (
            <Card className="p-5 rounded-3xl border-none shadow-sm bg-white dark:bg-zinc-900 group">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-xl">
                            {aptTenant?.logo || '🏢'}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-widest">{aptTenant?.name}</h4>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{aptService?.name}</p>
                        </div>
                    </div>
                    <Badge className={cn(
                        "rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-tighter",
                        apt.status === 'confirmed' ? "bg-emerald-500/10 text-emerald-600 border-none" :
                            apt.status === 'completed' ? "bg-slate-500/10 text-slate-600 border-none" : "bg-blue-500/10 text-blue-600 border-none"
                    )}>
                        {apt.status === 'confirmed' ? 'Confirmado' : apt.status === 'completed' ? 'Concluído' : 'Agendado'}
                    </Badge>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-zinc-400">
                        <Calendar className="w-4 h-4 text-primary" />
                        {format(parseISO(apt.date), "dd 'de' MMM", { locale: ptBR })}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-zinc-400">
                        <Clock className="w-4 h-4 text-primary" />
                        {apt.time}
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-50 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">R$ {aptService?.price},00</span>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelRequest}
                            className={cn(
                                "h-9 rounded-xl font-bold text-[10px] uppercase tracking-wider px-4",
                                canCancel ? "text-red-500 hover:text-red-600 hover:bg-red-50" : "text-slate-400 hover:text-primary hover:bg-slate-50"
                            )}
                        >
                            {canCancel ? 'Cancelar' : 'Falar com Salão'}
                        </Button>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-zinc-800/50 px-6 py-4">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/${tenantSlug}/book`)} className="rounded-full">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="text-center">
                        <h1 className="text-lg font-black tracking-tight">Painel Beauty</h1>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] leading-none mt-0.5">Meu Universo {tenant.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/${tenantSlug}/shop`)}
                            className="rounded-full bg-slate-100 dark:bg-zinc-800"
                        >
                            <ShoppingBag className="w-5 h-5 text-slate-400" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/${tenantSlug}/login`)} // Simulating Logout/Switch
                            className="rounded-full bg-slate-100 dark:bg-zinc-800"
                        >
                            <User className="w-5 h-5 text-slate-400" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto p-6 space-y-8">
                {/* Loyalty Card */}
                <motion.div initial="hidden" animate="visible" variants={containerVariants}>
                    <Card className="p-8 rounded-[2.5rem] border-none shadow-2xl bg-slate-900 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Beauty Rewards</p>
                                    <h2 className="text-4xl font-black">{customer?.name}</h2>
                                    <p className="text-slate-400 font-medium text-sm">{customer?.email}</p>
                                </div>
                                <div className="flex gap-3">
                                    <Badge className="bg-white/10 backdrop-blur-md text-white border-none rounded-full px-4 py-1.5 font-bold uppercase text-[10px] tracking-widest">
                                        Nível Diamante
                                    </Badge>
                                    <Badge className="bg-emerald-500/20 text-emerald-400 border-none rounded-full px-4 py-1.5 font-bold uppercase text-[10px] tracking-widest">
                                        Ativo
                                    </Badge>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">Saldo Atual</p>
                                <div className="flex items-center justify-end gap-3 text-primary">
                                    <Sparkles className="w-10 h-10" />
                                    <span className="text-6xl font-black tracking-tighter">{(customer as any)?.points || 0}</span>
                                </div>
                                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">BeautyPoints</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Reminders Status Section */}
                <motion.div
                    initial="hidden" animate="visible" variants={containerVariants}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="p-6 rounded-[2.5rem] border-none shadow-lg bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 group">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center relative">
                                    <Bell className="w-6 h-6 text-primary" />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        Lembretes Ativos
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400">Enviaremos notificações 1 dia e 1 hora antes.</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="rounded-full border-slate-200 dark:border-zinc-800 text-slate-400 font-bold text-[10px] uppercase">
                                Automático
                            </Badge>
                        </div>
                    </Card>
                </motion.div>

                {/* Info Alert */}
                <Card className="p-4 rounded-3xl bg-amber-500/5 border-amber-500/10 flex gap-3 items-center">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest leading-normal">
                        Cancelamentos permitidos até 24h antes. Após esse prazo, entre em contato direto pelo WhatsApp.
                    </p>
                </Card>

                {/* History Tabs */}
                <Tabs defaultValue="tenant" className="w-full">
                    <TabsList className="w-full bg-slate-200/50 dark:bg-zinc-900 p-1.5 rounded-2xl h-14 mb-6">
                        <TabsTrigger
                            value="tenant"
                            className="flex-1 rounded-xl font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all"
                        >
                            No Salão
                        </TabsTrigger>
                        <TabsTrigger
                            value="all"
                            className="flex-1 rounded-xl font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all text-xs"
                        >
                            Histórico Global
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="tenant" className="space-y-4 outline-none">
                        <div className="flex items-center justify-between mb-2 px-2">
                            <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest flex items-center gap-2">
                                <MapPin className="w-3 h-3" /> Próximas Visitas em {tenant.name}
                            </h3>
                        </div>
                        {allAppointments.filter(apt => apt.status === 'confirmed' || apt.status === 'scheduled').length > 0 ? (
                            allAppointments
                                .filter(apt => apt.status === 'confirmed' || apt.status === 'scheduled')
                                .map(apt => <AppointmentCard key={apt.id} apt={apt} />)
                        ) : (
                            <div className="py-12 text-center rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-zinc-800">
                                <Calendar className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-400 font-medium italic text-sm">Nenhum agendamento futuro.</p>
                            </div>
                        )}

                        <div className="pt-8 mb-4 px-2">
                            <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest">Resgate seus Pontos</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="p-6 rounded-3xl border-none bg-primary/5 hover:bg-primary/10 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge className="bg-white dark:bg-zinc-800 text-primary border-none rounded-full px-3 font-black">500 PTS</Badge>
                                    <Sparkles className="w-6 h-6 text-primary" />
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-white">Design de Sobrancelha</h4>
                                <p className="text-xs text-slate-500 mt-1">Troque seus pontos agora.</p>
                                <Button className="w-full mt-4 rounded-2xl h-10 font-black text-[10px] uppercase tracking-widest">Resgatar</Button>
                            </Card>
                            <Card className="p-6 rounded-3xl border-none bg-slate-100 dark:bg-zinc-800 opacity-60">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge className="bg-white dark:bg-zinc-700 text-slate-400 border-none rounded-full px-3 font-black">2000 PTS</Badge>
                                    <Lock className="w-6 h-6 text-slate-400" />
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-white">Escova + Hidratação</h4>
                                <p className="text-xs text-slate-500 mt-1">Faltam {(2000 - ((customer as any)?.points || 0))} pontos.</p>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="all" className="space-y-4 outline-none">
                        <div className="flex items-center justify-between mb-2 px-2">
                            <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest flex items-center gap-2">
                                <History className="w-3 h-3" /> Histórico Completo
                            </h3>
                        </div>
                        {allAppointments.map(apt => <AppointmentCard key={apt.id} apt={apt} />)}
                    </TabsContent>
                </Tabs>
            </main>
            <FloatingWhatsApp phone={tenant.whatsapp} tenantName={tenant.name} />
        </div>
    )
}
