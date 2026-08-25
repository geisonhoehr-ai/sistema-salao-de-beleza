"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
import { ImportExportButton } from "@/components/import-export/ImportExportButton"
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
    Zap,
    LayoutGrid,
    List as ListIcon,
    AlertCircle,
    RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useTenant } from "@/contexts/tenant-context"
import { useTenantEmployees, useTenantServices } from "@/hooks/useTenantRecords"
import type { ServiceRecord, EmployeeRecord } from "@/types/catalog"
import { ImageUpload } from "@/components/ui/image-upload"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client"

const categories = ["Cabelo", "Unhas", "Maquiagem", "Estética", "Massagem", "Depilação", "Sobrancelha"]

// Tipo local para UI (derivado de ServiceRecord com campos extras de display)
interface ServiceUI {
    id: string
    tenantId: string
    name: string
    category: string
    duration: number
    price: number
    description: string
    requiresDeposit: boolean
    depositAmount: number
    allowOnlineBooking: boolean
    bufferBefore: number
    bufferAfter: number
    maxClientsPerSlot: number
    requiredStaff: number
    active: boolean
    imageUrl?: string
    createdAt: string
    updatedAt: string
}

// Tipo local para Employee UI
interface EmployeeUI {
    id: string
    tenantId: string
    name: string
    email: string
    phone: string
    specialties: string[]
    workingHours: Record<string, unknown>
    commission: number
    acceptsOnlineBooking: boolean
    roundRobinEnabled: boolean
    active: boolean
    createdAt: string
    updatedAt: string
}

export default function ServicosPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [services, setServices] = useState<ServiceUI[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [showNewService, setShowNewService] = useState(false)
    const [showEditService, setShowEditService] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [selectedService, setSelectedService] = useState<ServiceUI | null>(null)
    const [employees, setEmployees] = useState<EmployeeUI[]>([])
    const { currentTenant } = useTenant()

    // Buscar dados do Supabase
    const { data: employeeRecords } = useTenantEmployees(currentTenant?.id)
    const { data: serviceRecords, loading: servicesLoading, error: servicesError, refetch: refetchServices } = useTenantServices(currentTenant?.id)

    // Sincronizar employees com dados do Supabase
    useEffect(() => {
        const mappedEmployees: EmployeeUI[] = employeeRecords.map(record => ({
            id: record.id,
            tenantId: record.tenantId,
            name: record.fullName,
            email: record.email || '',
            phone: record.phone || '',
            specialties: record.specialties || [],
            workingHours: {},
            commission: 0,
            acceptsOnlineBooking: true,
            roundRobinEnabled: true,
            active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }))
        setEmployees(mappedEmployees)
    }, [employeeRecords])

    const [serviceCategories, setServiceCategories] = useState<{ id: string; name: string }[]>([])

    useEffect(() => {
        if (!currentTenant?.id) return
        const supabase = getSupabaseBrowserClient()
        if (!supabase) return
        supabase
            .from('service_categories')
            .select('id, name')
            .eq('tenant_id', currentTenant.id)
            .order('name')
            .then(({ data }) => { if (data) setServiceCategories(data) })
    }, [currentTenant?.id])

    // Sincronizar serviços com dados do Supabase, resolvendo categoria pelo UUID
    useEffect(() => {
        const mappedServices: ServiceUI[] = serviceRecords.map(record => {
            const metadata = record.metadata as { allowOnlineBooking?: boolean; bufferAfter?: number; depositAmount?: number } | undefined
            return {
                id: record.id,
                tenantId: record.tenantId,
                name: record.name,
                category: serviceCategories.find(c => c.id === record.categoryId)?.name || 'Geral',
                duration: record.durationMinutes,
                price: record.price,
                description: record.description || '',
                requiresDeposit: record.requiresConfirmation,
                depositAmount: metadata?.depositAmount ?? 0,
                allowOnlineBooking: metadata?.allowOnlineBooking ?? true,
                bufferBefore: 0,
                bufferAfter: metadata?.bufferAfter ?? 0,
                maxClientsPerSlot: 1,
                requiredStaff: 1,
                active: record.isActive,
                imageUrl: record.imageUrl,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        })
        setServices(mappedServices)
    }, [serviceRecords, serviceCategories])

    const [formData, setFormData] = useState({
        name: "",
        categoryId: "",
        category: "Cabelo",
        duration: 60,
        price: 0,
        description: "",
        requiresDeposit: false,
        depositAmount: 0,
        allowOnlineBooking: true,
        bufferBefore: 0,
        bufferAfter: 10,
        professionalIds: [] as string[],
        imageUrl: ""
    })

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleCreateService = async () => {
        const supabase = getSupabaseBrowserClient()
        if (!supabase || !isSupabaseConfigured) return

        const selectedCategory = serviceCategories.find(c => c.id === formData.categoryId)

        try {
            const { error } = await supabase.from('services').insert({
                tenant_id: currentTenant.id,
                name: formData.name,
                description: formData.description,
                duration_minutes: formData.duration,
                price: formData.price,
                requires_confirmation: formData.requiresDeposit,
                is_active: true,
                image_url: formData.imageUrl || null,
                category_id: formData.categoryId || null,
                metadata: {
                    category: selectedCategory?.name || formData.category,
                    allowOnlineBooking: formData.allowOnlineBooking,
                    bufferAfter: formData.bufferAfter,
                    depositAmount: formData.depositAmount
                }
            })
            if (error) throw error
            refetchServices()
            setShowNewService(false)
            resetForm()
        } catch (error) {
            console.error('[ServicosPage] Erro ao criar serviço:', error)
            alert('Erro ao criar serviço. Verifique os dados e tente novamente.')
        }
    }

    const handleEditService = async () => {
        if (!selectedService) return

        const supabase = getSupabaseBrowserClient()
        if (!supabase || !isSupabaseConfigured) return

        const selectedCategory = serviceCategories.find(c => c.id === formData.categoryId)

        try {
            const { error } = await supabase
                .from('services')
                .update({
                    name: formData.name,
                    description: formData.description,
                    duration_minutes: formData.duration,
                    price: formData.price,
                    requires_confirmation: formData.requiresDeposit,
                    image_url: formData.imageUrl || null,
                    category_id: formData.categoryId || null,
                    metadata: {
                        category: selectedCategory?.name || formData.category,
                        allowOnlineBooking: formData.allowOnlineBooking,
                        bufferAfter: formData.bufferAfter,
                        depositAmount: formData.depositAmount
                    },
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedService.id)
                .eq('tenant_id', currentTenant.id)
            if (error) throw error
            refetchServices()
            setShowEditService(false)
            resetForm()
        } catch (error) {
            console.error('[ServicosPage] Erro ao editar serviço:', error)
        }
    }

    const handleDeleteService = async (service: ServiceUI) => {
        const supabase = getSupabaseBrowserClient()
        if (supabase && isSupabaseConfigured && currentTenant?.id) {
            const { error } = await supabase
                .from('services')
                .delete()
                .eq('id', service.id)
                .eq('tenant_id', currentTenant.id)
            if (error) {
                console.error('[ServicosPage] Erro ao deletar serviço:', error)
                return
            }
        }
        refetchServices()
        setShowConfirm(false)
    }

    const openEditDialog = (service: ServiceUI) => {
        setSelectedService(service)
        const linkedProfessionalIds = employees
            .filter(emp => emp.specialties.includes(service.id))
            .map(emp => emp.id)

        const originalRecord = serviceRecords.find(r => r.id === service.id)

        setFormData({
            name: service.name,
            categoryId: originalRecord?.categoryId || "",
            category: service.category,
            duration: service.duration,
            price: service.price,
            description: service.description,
            allowOnlineBooking: service.allowOnlineBooking,
            requiresDeposit: service.requiresDeposit,
            depositAmount: service.depositAmount,
            bufferBefore: service.bufferBefore,
            bufferAfter: service.bufferAfter,
            professionalIds: linkedProfessionalIds,
            imageUrl: service.imageUrl || ""
        })
        setShowEditService(true)
    }

    const openDeleteDialog = (service: ServiceUI) => {
        setSelectedService(service)
        setShowConfirm(true)
    }

    const resetForm = () => {
        setFormData({
            name: "",
            categoryId: "",
            category: "Cabelo",
            duration: 60,
            price: 0,
            description: "",
            requiresDeposit: false,
            depositAmount: 0,
            allowOnlineBooking: true,
            bufferBefore: 0,
            bufferAfter: 10,
            professionalIds: [],
            imageUrl: ""
        })
        setSelectedService(null)
    }

    const toggleProfessional = (empId: string) => {
        setFormData(prev => ({
            ...prev,
            professionalIds: prev.professionalIds.includes(empId)
                ? prev.professionalIds.filter(id => id !== empId)
                : [...prev.professionalIds, empId]
        }))
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[#0F172A]">Catálogo</h2>
                    <p className="text-[#64748b] font-medium">Configurações de serviços e experiências.</p>
                </div>
                <div className="flex gap-3">
                    <ImportExportButton
                        tenantId={currentTenant.id}
                        type="servicos"
                        onImportComplete={refetchServices}
                    />
                    <Button onClick={() => setShowNewService(true)} className="rounded-lg h-11 px-5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium transition-all shadow-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Serviço
                    </Button>
                </div>
            </div>

            {/* Search & Stats */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
                <div className="relative flex-1 w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                    <Input
                        placeholder="Nome, categoria ou descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-10 pl-11 bg-[#F8F9FF] border-[#E2E8F0] rounded-lg font-medium focus:border-[#0D9488] focus:ring-[#0D9488]"
                    />
                </div>
                <div className="flex gap-4 items-center">
                    <div className="flex bg-[#F1F5F9] p-1 rounded-lg">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "rounded-md h-8 w-8 p-0 transition-all",
                                viewMode === 'grid' ? "bg-white shadow-sm text-[#0D9488]" : "text-[#64748b]"
                            )}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "rounded-md h-8 w-8 p-0 transition-all",
                                viewMode === 'list' ? "bg-white shadow-sm text-[#0D9488]" : "text-[#64748b]"
                            )}
                        >
                            <ListIcon className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex gap-8 border-l border-[#E2E8F0] pl-6">
                        <div className="text-right">
                            <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wide">Ativos</p>
                            <p className="text-lg font-bold text-[#0F172A]">{services.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {servicesLoading && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-primary mb-4" />
                    <p className="text-slate-500 font-medium">Carregando serviços...</p>
                </div>
            )}

            {/* Error State */}
            {!servicesLoading && servicesError && (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-red-50 dark:bg-red-900/10 rounded-3xl">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <p className="text-red-600 dark:text-red-400 font-bold mb-2">Erro ao carregar serviços</p>
                    <p className="text-red-500/70 text-sm mb-4">{servicesError}</p>
                    <Button onClick={refetchServices} variant="outline" className="rounded-xl">
                        <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
                    </Button>
                </div>
            )}

            {/* Empty State */}
            {!servicesLoading && !servicesError && services.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-[#F8F9FF] rounded-xl border border-dashed border-[#E2E8F0]">
                    <Sparkles className="w-12 h-12 text-[#94a3b8] mb-4" />
                    <p className="text-[#0F172A] font-semibold mb-2">Nenhum serviço cadastrado</p>
                    <p className="text-[#64748b] text-sm mb-4">Comece adicionando seu primeiro serviço</p>
                    <Button onClick={() => setShowNewService(true)} className="rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white">
                        <Plus className="w-4 h-4 mr-2" /> Novo Serviço
                    </Button>
                </div>
            )}

            {/* Content View */}
            {!servicesLoading && !servicesError && services.length > 0 && (viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServices.map((service, idx) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="group relative overflow-hidden rounded-xl border border-[#E2E8F0] shadow-sm bg-white p-6 hover:shadow-md hover:border-[#0D9488]/30 transition-all duration-300">
                                {/* Category Badge */}
                                <div className="absolute top-5 right-5">
                                    <Badge className="bg-[#F1F5F9] text-[#64748b] border-none font-semibold text-[9px] uppercase tracking-wide px-2.5 py-1">
                                        {service.category}
                                    </Badge>
                                </div>

                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <div className="w-12 h-12 rounded-lg bg-[#0D9488]/10 flex items-center justify-center text-[#0D9488] group-hover:scale-105 transition-transform">
                                            <Sparkles className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-bold text-[#0F172A]">{service.name}</h3>
                                        <p className="text-xs text-[#64748b] line-clamp-2 font-medium min-h-[32px]">{service.description}</p>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#E2E8F0]">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-semibold text-[#64748b] uppercase">Preço</p>
                                            <p className="text-lg font-bold text-[#0F172A]">R$ {service.price}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-semibold text-[#64748b] uppercase">Duração</p>
                                            <p className="text-lg font-bold text-[#0F172A] flex items-center gap-1">
                                                <Clock className="w-4 h-4 text-[#0D9488]" />
                                                {service.duration}m
                                            </p>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="flex gap-2">
                                        {service.allowOnlineBooking && (
                                            <div className="flex items-center gap-1 text-[9px] font-semibold text-[#0D9488] bg-[#0D9488]/10 px-2 py-1 rounded-md uppercase">
                                                <Zap className="w-3 h-3" /> Booking On
                                            </div>
                                        )}
                                        {service.requiresDeposit && (
                                            <div className="flex items-center gap-1 text-[9px] font-semibold text-amber-600 bg-amber-500/10 px-2 py-1 rounded-md uppercase">
                                                <ShieldCheck className="w-3 h-3" /> Depósito
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            onClick={() => openEditDialog(service)}
                                            variant="outline"
                                            className="flex-1 rounded-lg h-10 border-[#E2E8F0] font-medium hover:bg-[#F8F9FF] hover:border-[#0D9488]/30 transition-all"
                                        >
                                            Configurar
                                        </Button>
                                        <Button
                                            onClick={() => openDeleteDialog(service)}
                                            size="icon"
                                            variant="ghost"
                                            className="rounded-lg h-10 w-10 text-red-500 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="rounded-xl overflow-hidden border border-[#E2E8F0] shadow-sm bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-[#E2E8F0] bg-[#F8F9FF]">
                                <TableHead className="pl-6 py-4 font-semibold text-xs text-[#64748b] uppercase tracking-wide">Serviço</TableHead>
                                <TableHead className="font-semibold text-xs text-[#64748b] uppercase tracking-wide">Categoria</TableHead>
                                <TableHead className="font-semibold text-xs text-[#64748b] uppercase tracking-wide">Duração</TableHead>
                                <TableHead className="font-semibold text-xs text-[#64748b] uppercase tracking-wide">Preço</TableHead>
                                <TableHead className="font-semibold text-xs text-[#64748b] uppercase tracking-wide">Status</TableHead>
                                <TableHead className="text-right pr-6 font-semibold text-xs text-[#64748b] uppercase tracking-wide">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredServices.map((service) => (
                                <TableRow key={service.id} className="border-[#E2E8F0] hover:bg-[#F8F9FF] transition-colors">
                                    <TableCell className="pl-6 py-4">
                                        <div className="font-semibold text-[#0F172A]">{service.name}</div>
                                        <div className="text-[10px] text-[#64748b] truncate max-w-[200px]">{service.description}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="rounded-md border-[#E2E8F0] font-medium text-[9px] uppercase">
                                            {service.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 font-medium text-[#0F172A]">
                                            <Clock className="w-3 h-3 text-[#0D9488]" />
                                            {service.duration}m
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-black text-slate-900 dark:text-white">
                                        R$ {service.price}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            {service.allowOnlineBooking && <Zap className="w-3 h-3 text-emerald-500" />}
                                            {service.requiresDeposit && <ShieldCheck className="w-3 h-3 text-amber-500" />}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-8">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                onClick={() => openEditDialog(service)}
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary"
                                            >
                                                <Settings2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                onClick={() => openDeleteDialog(service)}
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ))}

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
                                {serviceCategories.length > 0 ? (
                                    <Select
                                        value={formData.categoryId}
                                        onValueChange={(val) => {
                                            const cat = serviceCategories.find(c => c.id === val)
                                            setFormData({ ...formData, categoryId: val, category: cat?.name || '' })
                                        }}
                                    >
                                        <SelectTrigger className="rounded-xl h-12 bg-slate-50 dark:bg-zinc-800 border-none">
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {serviceCategories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                                        <SelectTrigger className="rounded-xl h-12 bg-slate-50 dark:bg-zinc-800 border-none">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase">Preço Base (R$)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                    className="rounded-xl h-12 bg-slate-50 dark:bg-zinc-800 border-none"
                                    placeholder="Ex: 90.00"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-zinc-800">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tempo e Disponibilidade</h4>
                        <p className="text-[10px] text-slate-400 -mt-2">Configure a duração do serviço e o tempo de limpeza para bloquear corretamente a agenda.</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase">Duração (min)</Label>
                                <p className="text-[9px] text-slate-400">Tempo do serviço</p>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                                    className="h-12 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl"
                                    placeholder="60"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-400">Intervalo (min)</Label>
                                <p className="text-[9px] text-slate-400">Limpeza e organização</p>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.bufferAfter}
                                    onChange={(e) => setFormData({ ...formData, bufferAfter: Number(e.target.value) })}
                                    className="h-12 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl"
                                    placeholder="10"
                                />
                            </div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl">
                            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                                💡 Tempo total bloqueado na agenda: {formData.duration + formData.bufferAfter} minutos (Serviço: {formData.duration}min + Intervalo: {formData.bufferAfter}min)
                            </p>
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
                                <Switch
                                    checked={formData.requiresDeposit}
                                    onCheckedChange={(checked) => setFormData({ ...formData, requiresDeposit: !!checked })}
                                />
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

                    <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-zinc-800">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profissionais Vinculados</h4>
                        <p className="text-[10px] text-slate-400 -mt-2">Selecione quem realiza este serviço. Isso afetará a disponibilidade no agendamento online.</p>
                        <div className="grid grid-cols-2 gap-3">
                            {employees.filter(e => e.tenantId === currentTenant.id).map(emp => (
                                <div key={emp.id} className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors">
                                    <Checkbox
                                        id={`emp-${emp.id}`}
                                        checked={formData.professionalIds.includes(emp.id)}
                                        onCheckedChange={() => toggleProfessional(emp.id)}
                                    />
                                    <label htmlFor={`emp-${emp.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                        {emp.name}
                                    </label>
                                </div>
                            ))}
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

