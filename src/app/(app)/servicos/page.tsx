"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { services as initialServices, type Service } from "@/mocks/services"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { FormDialog } from "@/components/ui/form-dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Clock,
    DollarSign,
    Users,
    Sparkles,
    Settings2,
    ShieldCheck,
    ChevronRight,
    Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

const categories = ["Cabelo", "Unhas", "Maquiagem", "Estética", "Massagem", "Depilação", "Sobrancelha"]

export default function ServicosPage() {
    const [services, setServices] = useState(initialServices)
    const [searchTerm, setSearchTerm] = useState("")
    const [showNewService, setShowNewService] = useState(false)
    const [showEditService, setShowEditService] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [selectedService, setSelectedService] = useState<Service | null>(null)

    const [formData, setFormData] = useState({
        name: "",
        category: "Cabelo",
        duration: 60,
        price: 0,
        description: "",
        requiresDeposit: false,
        depositAmount: 0,
        allowOnlineBooking: true,
        bufferBefore: 5,
        bufferAfter: 10,
        maxClientsPerSlot: 1,
        requiredStaff: 1
    })

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleCreateService = () => {
        const newService: Service = {
            id: String(services.length + 1),
            tenantId: '1',
            ...formData,
            active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        setServices([...services, newService])
        setShowNewService(false)
        resetForm()
    }

    const handleEditService = () => {
        if (!selectedService) return

        setServices(services.map(s =>
            s.id === selectedService.id
                ? { ...s, ...formData, updatedAt: new Date().toISOString() }
                : s
        ))
        setShowEditService(false)
        resetForm()
    }

    const handleDeleteService = (service: Service) => {
        setServices(services.filter(s => s.id !== service.id))
        setShowConfirm(false)
    }

    const openEditDialog = (service: Service) => {
        setSelectedService(service)
        setFormData({
            name: service.name,
            category: service.category,
            duration: service.duration,
            price: service.price,
            description: service.description,
            requiresDeposit: service.requiresDeposit,
            depositAmount: service.depositAmount,
            allowOnlineBooking: service.allowOnlineBooking,
            bufferBefore: service.bufferBefore,
            bufferAfter: service.bufferAfter,
            maxClientsPerSlot: service.maxClientsPerSlot,
            requiredStaff: service.requiredStaff
        })
        setShowEditService(true)
    }

    const openDeleteDialog = (service: Service) => {
        setSelectedService(service)
        setShowConfirm(true)
    }

    const resetForm = () => {
        setFormData({
            name: "",
            category: "Cabelo",
            duration: 60,
            price: 0,
            description: "",
            requiresDeposit: false,
            depositAmount: 0,
            allowOnlineBooking: true,
            bufferBefore: 5,
            bufferAfter: 10,
            maxClientsPerSlot: 1,
            requiredStaff: 1
        })
        setSelectedService(null)
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Catálogo</h2>
                    <p className="text-slate-500 dark:text-zinc-400 font-medium">Configurações de serviços e experiências.</p>
                </div>
                <Button onClick={() => setShowNewService(true)} className="rounded-xl h-12 px-6 bg-primary text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Serviço
                </Button>
            </div>

            {/* Search & Stats */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border-none shadow-sm">
                <div className="relative flex-1 w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Nome, categoria ou descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-12 pl-12 bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl font-medium"
                    />
                </div>
                <div className="flex gap-8">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ativos</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{services.length}</p>
                    </div>
                </div>
            </div>

            {/* Service Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service, idx) => (
                    <motion.div
                        key={service.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <Card className="group relative overflow-hidden rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-8 hover:shadow-2xl transition-all duration-300">
                            {/* Category Badge */}
                            <div className="absolute top-6 right-6">
                                <Badge className="bg-slate-100 dark:bg-zinc-800 text-slate-500 border-none font-bold text-[9px] uppercase tracking-widest px-3 py-1">
                                    {service.category}
                                </Badge>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <Sparkles className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{service.name}</h3>
                                    <p className="text-xs text-slate-400 line-clamp-2 font-medium min-h-[32px]">{service.description}</p>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-100 dark:border-zinc-800">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Preço</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white">R$ {service.price}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Duração</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-emerald-500" />
                                            {service.duration}m
                                        </p>
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="flex gap-2">
                                    {service.allowOnlineBooking && (
                                        <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg uppercase">
                                            <Zap className="w-3 h-3" /> Booking On
                                        </div>
                                    )}
                                    {service.requiresDeposit && (
                                        <div className="flex items-center gap-1 text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg uppercase">
                                            <ShieldCheck className="w-3 h-3" /> Depósito
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        onClick={() => openEditDialog(service)}
                                        variant="outline"
                                        className="flex-1 rounded-xl h-11 border-slate-200 dark:border-zinc-800 font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all"
                                    >
                                        Configurar
                                    </Button>
                                    <Button
                                        onClick={() => openDeleteDialog(service)}
                                        size="icon"
                                        variant="ghost"
                                        className="rounded-xl h-11 w-11 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Modal Novo/Editar */}
            <FormDialog
                open={showNewService || showEditService}
                onOpenChange={showNewService ? setShowNewService : setShowEditService}
                title={showNewService ? "Novo Serviço" : "Editar Serviço"}
                description="Defina os detalhes e regras do serviço."
                onSubmit={showNewService ? handleCreateService : handleEditService}
                submitLabel={showNewService ? "Criar Serviço" : "Salvar Configurações"}
            >
                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4 scrollbar-thin">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identidade do Serviço</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label className="text-xs font-bold uppercase">Nome do Serviço</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="rounded-xl h-12 bg-slate-50 dark:bg-zinc-800 border-none"
                                    placeholder="Ex: Corte Artístico"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase">Categoria</Label>
                                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                                    <SelectTrigger className="rounded-xl h-12 bg-slate-50 dark:bg-zinc-800 border-none">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase">Preço Base (R$)</Label>
                                <Input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                    className="rounded-xl h-12 bg-slate-50 dark:bg-zinc-800 border-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-zinc-800">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tempo e Disponibilidade</h4>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-400">Duração (m)</Label>
                                <Input
                                    type="number"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                                    className="h-12 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-400">Antes (m)</Label>
                                <Input
                                    type="number"
                                    value={formData.bufferBefore}
                                    onChange={(e) => setFormData({ ...formData, bufferBefore: Number(e.target.value) })}
                                    className="h-12 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-400">Depois (m)</Label>
                                <Input
                                    type="number"
                                    value={formData.bufferAfter}
                                    onChange={(e) => setFormData({ ...formData, bufferAfter: Number(e.target.value) })}
                                    className="h-12 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-zinc-800">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Políticas de Agendamento</h4>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl">
                                <div>
                                    <p className="text-sm font-bold">Reserva Online</p>
                                    <p className="text-[10px] text-slate-400">Visível no catálogo de clientes</p>
                                </div>
                                <Switch checked={formData.allowOnlineBooking} onCheckedChange={(val) => setFormData({ ...formData, allowOnlineBooking: val })} />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl">
                                <div>
                                    <p className="text-sm font-bold">Exigir Sinal (Pagamento Prévio)</p>
                                    <p className="text-[10px] text-slate-400">Garante a reserva com valor antecipado</p>
                                </div>
                                <Switch checked={formData.requiresDeposit} onCheckedChange={(val) => setFormData({ ...formData, requiresDeposit: val })} />
                            </div>
                            {formData.requiresDeposit && (
                                <div className="p-4 border-2 border-primary/20 rounded-2xl space-y-2">
                                    <Label className="text-xs font-bold uppercase">Valor do Depósito (R$)</Label>
                                    <Input
                                        type="number"
                                        value={formData.depositAmount}
                                        onChange={(e) => setFormData({ ...formData, depositAmount: Number(e.target.value) })}
                                        className="h-10 border-none bg-primary/5"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </FormDialog>

            <ConfirmDialog
                open={showConfirm}
                onOpenChange={setShowConfirm}
                title="Remover Serviço?"
                description={`A exclusão de ${selectedService?.name} não afetará agendamentos já realizados.`}
                onConfirm={() => selectedService && handleDeleteService(selectedService)}
                variant="destructive"
            />
        </div>
    )
}
