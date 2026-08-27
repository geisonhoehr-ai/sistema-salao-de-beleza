"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ImportExportButton } from "@/components/import-export/ImportExportButton"
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Percent,
    Mail,
    ChevronRight,
    LayoutGrid,
    List as ListIcon,
    Settings2,
    Loader2,
    AlertCircle,
    Users,
    RefreshCw,
    CheckCircle2,
    UserSearch,
} from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTenantEmployees, useTenantServices } from "@/hooks/useTenantRecords"
import { useTenant } from "@/contexts/tenant-context"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { EmployeeRecord } from "@/types/catalog"
import { UnavailabilityManager } from "@/components/employees/UnavailabilityManager"
import { CommissionExceptionsManager } from "@/components/employees/CommissionExceptionsManager"
import { AvatarUpload } from "@/components/employees/AvatarUpload"
import { PermissionsManager } from "@/components/employees/PermissionsManager"
import { type EmployeePermissions, DEFAULT_PERMISSIONS } from "@/lib/permissions"

const weekDays = [
    { id: 'monday',    label: 'Segunda' },
    { id: 'tuesday',   label: 'Terça' },
    { id: 'wednesday', label: 'Quarta' },
    { id: 'thursday',  label: 'Quinta' },
    { id: 'friday',    label: 'Sexta' },
    { id: 'saturday',  label: 'Sábado' },
    { id: 'sunday',    label: 'Domingo' },
]

type FormData = {
    name: string
    email: string
    phone: string
    document: string
    birthdate: string
    role: string
    specialties: string[]
    workingHours: Record<string, { start: string; end: string }[]>
    commission: number
    acceptsOnlineBooking: boolean
    permissions: EmployeePermissions
}

const defaultForm: FormData = {
    name: "",
    email: "",
    phone: "",
    document: "",
    birthdate: "",
    role: "",
    specialties: [],
    workingHours: {},
    commission: 40,
    acceptsOnlineBooking: true,
    permissions: DEFAULT_PERMISSIONS,
}

export default function FuncionariosPage() {
    const router = useRouter()
    const { currentTenant } = useTenant()
    const tenantId = currentTenant?.id

    const { data: employees, loading, error: loadError, refetch } = useTenantEmployees(tenantId)
    const { data: services } = useTenantServices(tenantId)

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [searchTerm, setSearchTerm] = useState("")
    const [saving, setSaving] = useState(false)
    const [showNewEmployee, setShowNewEmployee] = useState(false)
    const [showEditEmployee, setShowEditEmployee] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRecord | null>(null)
    const [formData, setFormData] = useState<FormData>(defaultForm)
    const [avatarUrl, setAvatarUrl] = useState<string>("")

    // Wizard states for new employee
    const [wizardStep, setWizardStep] = useState<'cpf' | 'dados' | 'horarios' | 'servicos' | 'finalizar'>('cpf')
    const [cpfSearch, setCpfSearch] = useState("")
    const [searching, setSearching] = useState(false)
    const [cpfSearched, setCpfSearched] = useState(false)
    const [foundPerson, setFoundPerson] = useState<{
        name: string
        email: string
        phone: string
        birthdate?: string
        source: 'cliente' | 'profissional'
    } | null>(null)

    const filteredEmployees = employees.filter(emp =>
        emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.specialties ?? []).some(specId => {
            const service = services.find(s => s.id === specId)
            return service?.name.toLowerCase().includes(searchTerm.toLowerCase())
        })
    )

    // Format CPF for display/search
    const formatCPF = (value: string) => {
        const numbers = value.replace(/\D/g, '').slice(0, 11)
        if (numbers.length <= 3) return numbers
        if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
        if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
        return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`
    }

    // Search for person by CPF
    const handleSearchCPF = async () => {
        if (!isSupabaseConfigured || !tenantId) {
            setCpfSearched(true)
            setFoundPerson(null)
            return
        }

        const supabase = getSupabaseBrowserClient()
        if (!supabase) return

        setSearching(true)
        setCpfSearched(false)
        setFoundPerson(null)

        const cleanCPF = cpfSearch.replace(/\D/g, '')

        // First check if already exists as employee
        const { data: existingEmployee } = await supabase
            .from("employees")
            .select("full_name, document")
            .eq("tenant_id", tenantId)
            .eq("document", cleanCPF)
            .eq("status", "active")
            .single()

        if (existingEmployee) {
            setSearching(false)
            setCpfSearched(true)
            setFoundPerson({
                name: existingEmployee.full_name,
                email: '',
                phone: '',
                source: 'profissional'
            })
            return
        }

        // Search in customers table
        const { data: customer } = await supabase
            .from("customers")
            .select("full_name, email, phone, birthdate, document")
            .eq("tenant_id", tenantId)
            .eq("document", cleanCPF)
            .single()

        setSearching(false)
        setCpfSearched(true)

        if (customer) {
            setFoundPerson({
                name: customer.full_name,
                email: customer.email || '',
                phone: customer.phone || '',
                birthdate: customer.birthdate || '',
                source: 'cliente'
            })
            // Pre-fill the form
            setFormData(prev => ({
                ...prev,
                name: customer.full_name,
                email: customer.email || '',
                phone: customer.phone || '',
                document: cleanCPF,
                birthdate: customer.birthdate || '',
            }))
        } else {
            // Set just the CPF
            setFormData(prev => ({
                ...prev,
                document: cleanCPF,
            }))
        }
    }

    // Reset wizard when opening
    const openNewEmployeeWizard = () => {
        setWizardStep('cpf')
        setCpfSearch('')
        setCpfSearched(false)
        setFoundPerson(null)
        resetForm()
        setShowNewEmployee(true)
    }

    // ---- Supabase mutations ----

    const handleCreateEmployee = async () => {
        if (!isSupabaseConfigured || !tenantId || !currentTenant) {
            // fallback: só fecha o modal se não tem Supabase
            setShowNewEmployee(false)
            resetForm()
            return
        }
        const supabase = getSupabaseBrowserClient()
        if (!supabase) return

        setSaving(true)

        // 1. Criar o profissional na tabela employees
        const { data: newEmployee, error } = await supabase.from("employees").insert({
            tenant_id: tenantId,
            full_name: formData.name,
            email: formData.email,
            phone: formData.phone,
            document: formData.document || null,
            birthdate: formData.birthdate || null,
            role: formData.role || null,
            avatar_url: avatarUrl || null,
            specialties: formData.specialties,
            working_hours: formData.workingHours,
            commission_rate: formData.commission,
            accepts_online_booking: formData.acceptsOnlineBooking,
            permissions: formData.permissions,
            status: "active",
        }).select("id").single()

        if (error || !newEmployee) {
            setSaving(false)
            console.error("[FuncionariosPage] Erro ao criar profissional:", error?.message)
            return
        }

        // 2. Gerar token de convite e criar registro
        const inviteToken = crypto.randomUUID()
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7) // Expira em 7 dias

        const { error: inviteError } = await supabase.from("employee_invites").insert({
            token: inviteToken,
            employee_id: newEmployee.id,
            tenant_id: tenantId,
            expires_at: expiresAt.toISOString(),
            status: "pending",
        })

        if (inviteError) {
            console.error("[FuncionariosPage] Erro ao criar convite:", inviteError.message)
            // Continua mesmo com erro no convite - o profissional foi criado
        }

        // 3. Enviar email de convite
        if (!inviteError && formData.email) {
            try {
                const response = await fetch("/api/send-email/employee-invite", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        employeeEmail: formData.email,
                        employeeName: formData.name,
                        tenantName: currentTenant.name,
                        tenantSlug: currentTenant.slug,
                        inviteToken: inviteToken,
                    }),
                })

                if (!response.ok) {
                    console.error("[FuncionariosPage] Erro ao enviar email de convite")
                }
            } catch (emailError) {
                console.error("[FuncionariosPage] Erro ao enviar email:", emailError)
            }
        }

        setSaving(false)
        setShowNewEmployee(false)
        resetForm()
        refetch()
    }

    const handleEditEmployee = async () => {
        if (!selectedEmployee) return
        if (!isSupabaseConfigured || !tenantId) {
            setShowEditEmployee(false)
            resetForm()
            return
        }
        const supabase = getSupabaseBrowserClient()
        if (!supabase) return

        setSaving(true)
        const { error } = await supabase.from("employees").update({
            full_name: formData.name,
            email: formData.email,
            phone: formData.phone,
            document: formData.document || null,
            birthdate: formData.birthdate || null,
            role: formData.role || null,
            avatar_url: avatarUrl || null,
            specialties: formData.specialties,
            working_hours: formData.workingHours,
            commission_rate: formData.commission,
            accepts_online_booking: formData.acceptsOnlineBooking,
            permissions: formData.permissions,
            updated_at: new Date().toISOString(),
        }).eq("id", selectedEmployee.id).eq("tenant_id", tenantId)

        setSaving(false)
        if (error) {
            console.error("[FuncionariosPage] Erro ao editar profissional:", error.message)
            return
        }
        setShowEditEmployee(false)
        resetForm()
        refetch()
    }

    const handleDeleteEmployee = async (employee: EmployeeRecord) => {
        if (!isSupabaseConfigured || !tenantId) {
            setShowConfirm(false)
            return
        }
        const supabase = getSupabaseBrowserClient()
        if (!supabase) return

        // Soft-delete: marcar como inativo em vez de apagar
        const { error } = await supabase.from("employees")
            .update({ status: "deleted", updated_at: new Date().toISOString() })
            .eq("id", employee.id)
            .eq("tenant_id", tenantId)

        setShowConfirm(false)
        if (error) {
            console.error("[FuncionariosPage] Erro ao remover profissional:", error.message)
            return
        }
        refetch()
    }

    const openEditDialog = (employee: EmployeeRecord) => {
        setSelectedEmployee(employee)
        setFormData({
            name: employee.fullName,
            email: employee.email,
            phone: employee.phone,
            document: employee.document ?? '',
            birthdate: employee.birthdate ?? '',
            role: employee.role ?? '',
            specialties: employee.specialties ?? [],
            workingHours: employee.workingHours ?? {},
            commission: employee.commissionRate ?? 40,
            acceptsOnlineBooking: employee.acceptsOnlineBooking ?? true,
            permissions: (employee as any).permissions ?? DEFAULT_PERMISSIONS,
        })
        setAvatarUrl(employee.avatarUrl ?? '')
        setShowEditEmployee(true)
    }

    const resetForm = () => {
        setFormData(defaultForm)
        setAvatarUrl('')
        setSelectedEmployee(null)
    }

    const toggleSpecialty = (serviceId: string) => {
        setFormData(prev => ({
            ...prev,
            specialties: prev.specialties.includes(serviceId)
                ? prev.specialties.filter(id => id !== serviceId)
                : [...prev.specialties, serviceId],
        }))
    }

    const setWorkingHours = (dayId: string, start: string, end: string) => {
        setFormData(prev => ({
            ...prev,
            workingHours: { ...prev.workingHours, [dayId]: [{ start, end }] },
        }))
    }

    const removeWorkingDay = (dayId: string) => {
        setFormData(prev => {
            const newHours = { ...prev.workingHours }
            delete newHours[dayId]
            return { ...prev, workingHours: newHours }
        })
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[#0F172A]">Profissionais</h2>
                    <p className="text-[#64748b] font-medium">Cadastre e gerencie a equipe do salão.</p>
                </div>
                <div className="flex gap-3">
                    <ImportExportButton
                        tenantId={currentTenant.id}
                        type="profissionais"
                        onImportComplete={refetch}
                    />
                    <Button
                        onClick={openNewEmployeeWizard}
                        className="rounded-lg h-11 px-5 bg-[#F97316] hover:bg-[#EA580C] text-white font-medium transition-all shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Profissional
                    </Button>
                </div>
            </div>

            {/* Search & Stats */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
                <div className="relative flex-1 w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                    <Input
                        placeholder="Buscar por nome ou especialidade..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-10 pl-11 bg-[#F8F9FF] border-[#E2E8F0] rounded-lg font-medium focus:border-[#F97316] focus:ring-[#F97316]"
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
                                viewMode === 'grid' ? "bg-white shadow-sm text-[#F97316]" : "text-[#64748b]"
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
                                viewMode === 'list' ? "bg-white shadow-sm text-[#F97316]" : "text-[#64748b]"
                            )}
                        >
                            <ListIcon className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex gap-8 border-l border-[#E2E8F0] pl-6">
                        <div className="text-right">
                            <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wide">Time</p>
                            <p className="text-lg font-bold text-[#0F172A]">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : employees.length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading state */}
            {loading && (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            )}

            {/* Error State */}
            {!loading && loadError && (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-red-50 rounded-xl border border-red-100">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <p className="text-red-600 font-bold mb-2">Erro ao carregar profissionais</p>
                    <p className="text-red-500/70 text-sm mb-4">{loadError}</p>
                    <Button onClick={refetch} variant="outline" className="rounded-lg border-red-200 text-red-600 hover:bg-red-50">
                        <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
                    </Button>
                </div>
            )}

            {/* Content View */}
            {!loading && !loadError && viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredEmployees.map((employee, idx) => (
                            <motion.div
                                key={employee.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="group relative overflow-hidden rounded-xl border border-[#E2E8F0] shadow-sm bg-white p-5 hover:shadow-md hover:border-[#F97316]/30 transition-all duration-200">
                                    <div className="space-y-4">
                                        {/* Header: Avatar + Actions */}
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-14 h-14 rounded-xl bg-[#FFF7ED] flex items-center justify-center text-[#F97316] font-bold text-xl overflow-hidden flex-shrink-0">
                                                    {employee.avatarUrl ? (
                                                        <img
                                                            src={employee.avatarUrl}
                                                            alt={employee.fullName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        employee.fullName.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-[#0F172A] truncate">{employee.fullName}</h3>
                                                    <p className="text-xs text-[#64748b] truncate">{employee.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    onClick={() => openEditDialog(employee)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="rounded-lg h-8 w-8 text-[#64748b] hover:bg-[#F8F9FF] hover:text-[#F97316] transition-all"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        setSelectedEmployee(employee)
                                                        setShowConfirm(true)
                                                    }}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="rounded-lg h-8 w-8 text-[#64748b] hover:bg-red-50 hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Specialties */}
                                        {(employee.specialties ?? []).length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {(employee.specialties ?? []).slice(0, 3).map(specId => {
                                                    const service = services.find(s => s.id === specId)
                                                    return (
                                                        <Badge key={specId} variant="secondary" className="bg-[#F1F5F9] text-[#64748b] text-[10px] py-0.5 px-2 border-none font-medium">
                                                            {service?.name || specId}
                                                        </Badge>
                                                    )
                                                })}
                                                {(employee.specialties ?? []).length > 3 && (
                                                    <Badge variant="secondary" className="bg-[#F1F5F9] text-[#64748b] text-[10px] py-0.5 px-2 border-none font-medium">
                                                        +{(employee.specialties ?? []).length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}

                                        {/* Info Row */}
                                        <div className="flex items-center justify-between py-3 border-y border-[#E2E8F0]">
                                            <div className="flex items-center gap-2 text-sm text-[#64748b]">
                                                <Percent className="w-4 h-4 text-[#22C55E]" />
                                                <span>Comissão</span>
                                            </div>
                                            <span className="font-bold text-[#0F172A]">{employee.commissionRate ?? 0}%</span>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between">
                                            {employee.acceptsOnlineBooking ? (
                                                <Badge className="bg-[#DCFCE7] text-[#22C55E] border-none font-semibold text-[10px] uppercase">
                                                    Booking Ativo
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-[#F1F5F9] text-[#94a3b8] border-none font-semibold text-[10px] uppercase">
                                                    Booking Inativo
                                                </Badge>
                                            )}
                                            <button
                                                onClick={() => router.push(`agenda?employee=${employee.id}`)}
                                                className="flex items-center gap-1 text-[11px] font-semibold text-[#F97316] uppercase hover:underline transition-colors"
                                            >
                                                Ver Agenda <ChevronRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredEmployees.length === 0 && (
                        <div className="col-span-full py-16 text-center">
                            <div className="w-16 h-16 rounded-xl bg-[#FFF7ED] flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-[#F97316]" />
                            </div>
                            <p className="text-lg font-bold text-[#0F172A]">Nenhum profissional encontrado</p>
                            <p className="text-sm text-[#64748b] mt-1">Clique em &quot;Novo Profissional&quot; para cadastrar.</p>
                        </div>
                    )}
                </div>
            )}

            {!loading && !loadError && viewMode === 'list' && (
                <div className="rounded-xl overflow-hidden border border-[#E2E8F0] shadow-sm bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-[#E2E8F0] bg-[#F8F9FF]">
                                <TableHead className="pl-6 py-4 font-semibold text-[11px] uppercase tracking-wide text-[#64748b]">Profissional</TableHead>
                                <TableHead className="font-semibold text-[11px] uppercase tracking-wide text-[#64748b]">Contatos</TableHead>
                                <TableHead className="font-semibold text-[11px] uppercase tracking-wide text-[#64748b]">Especialidades</TableHead>
                                <TableHead className="font-semibold text-[11px] uppercase tracking-wide text-[#64748b]">Comissão</TableHead>
                                <TableHead className="font-semibold text-[11px] uppercase tracking-wide text-[#64748b]">Status</TableHead>
                                <TableHead className="text-right pr-6 font-semibold text-[11px] uppercase tracking-wide text-[#64748b]">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEmployees.map((employee) => (
                                <TableRow key={employee.id} className="border-[#E2E8F0] hover:bg-[#F8F9FF] transition-colors">
                                    <TableCell className="pl-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-[#FFF7ED] flex items-center justify-center text-[#F97316] font-bold overflow-hidden">
                                                {employee.avatarUrl ? (
                                                    <img
                                                        src={employee.avatarUrl}
                                                        alt={employee.fullName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    employee.fullName.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div className="font-semibold text-[#0F172A]">{employee.fullName}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-[#0F172A]">{employee.email}</div>
                                        <div className="text-xs text-[#64748b]">{employee.phone}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                            {(employee.specialties ?? []).slice(0, 2).map(specId => {
                                                const service = services.find(s => s.id === specId)
                                                return (
                                                    <Badge key={specId} variant="secondary" className="bg-[#F1F5F9] text-[#64748b] text-[10px] py-0.5 px-2 border-none font-medium">
                                                        {service?.name || specId}
                                                    </Badge>
                                                )
                                            })}
                                            {(employee.specialties ?? []).length > 2 && (
                                                <Badge variant="secondary" className="bg-[#F1F5F9] text-[#64748b] text-[10px] py-0.5 px-2 border-none font-medium">
                                                    +{(employee.specialties ?? []).length - 2}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-[#0F172A]">
                                        {employee.commissionRate ?? 0}%
                                    </TableCell>
                                    <TableCell>
                                        {employee.acceptsOnlineBooking ? (
                                            <Badge className="bg-[#DCFCE7] text-[#22C55E] border-none font-semibold text-[10px] uppercase">Ativo</Badge>
                                        ) : (
                                            <Badge className="bg-[#F1F5F9] text-[#94a3b8] border-none font-semibold text-[10px] uppercase">Inativo</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                onClick={() => openEditDialog(employee)}
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-[#64748b] hover:bg-[#F8F9FF] hover:text-[#F97316]"
                                            >
                                                <Settings2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setSelectedEmployee(employee)
                                                    setShowConfirm(true)
                                                }}
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-[#64748b] hover:bg-red-50 hover:text-red-500"
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
            )}

            {/* Modal Novo / Editar */}
            <FormDialog
                open={showNewEmployee || showEditEmployee}
                onOpenChange={showNewEmployee ? setShowNewEmployee : setShowEditEmployee}
                title={showNewEmployee ? "Cadastrar Profissional" : "Editar Profissional"}
                description={showNewEmployee ? "Preencha os dados para cadastrar um novo profissional." : "Cadastre as informações e preferências do profissional."}
                onSubmit={showNewEmployee ? handleCreateEmployee : handleEditEmployee}
                submitLabel={saving ? "Salvando..." : showNewEmployee ? "Concluir Cadastro" : "Salvar Alterações"}
                hideSubmit={showNewEmployee && wizardStep !== 'finalizar'}
            >
                {showEditEmployee && selectedEmployee ? (
                    <Tabs defaultValue="basico" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="basico" type="button">Dados</TabsTrigger>
                            <TabsTrigger value="permissoes" type="button">Permissões</TabsTrigger>
                            <TabsTrigger value="bloqueios" type="button">Bloqueios</TabsTrigger>
                            <TabsTrigger value="comissoes" type="button">Comissões</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basico" className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin mt-4">
                            {/* Foto do Profissional */}
                            {selectedEmployee && (
                                <div className="pb-6 border-b border-slate-100 dark:border-zinc-800">
                                    <AvatarUpload
                                        tenantId={currentTenant.id}
                                        employeeId={selectedEmployee.id}
                                        currentAvatarUrl={avatarUrl}
                                        onUploadComplete={(url) => setAvatarUrl(url)}
                                    />
                                </div>
                            )}

                            {/* Informações Básicas */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informações Básicas</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label className="text-xs font-bold uppercase">Nome Completo</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="rounded-xl h-12 bg-slate-50 dark:bg-zinc-800 border-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase">Email</Label>
                                <Input
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="rounded-xl h-12 bg-slate-50 dark:bg-zinc-800 border-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase">Telefone</Label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="rounded-xl h-12 bg-slate-50 dark:bg-zinc-800 border-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase">CPF</Label>
                                <Input
                                    value={formData.document}
                                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                                    placeholder="000.000.000-00"
                                    className="rounded-xl h-12 bg-slate-50 dark:bg-zinc-800 border-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase">Data de Nascimento</Label>
                                <Input
                                    type="date"
                                    value={formData.birthdate}
                                    onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                                    className="rounded-xl h-12 bg-slate-50 dark:bg-zinc-800 border-none"
                                />
                            </div>
                        </div>

                        <div className="pt-4 space-y-2">
                            <Label className="text-xs font-bold uppercase">Cargo/Função</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger className="rounded-xl h-12 bg-slate-50 dark:bg-zinc-800 border-none">
                                    <SelectValue placeholder="Selecione o cargo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gerente">Gerente</SelectItem>
                                    <SelectItem value="cabeleireira">Cabeleireira</SelectItem>
                                    <SelectItem value="manicure">Manicure</SelectItem>
                                    <SelectItem value="esteticista">Esteticista</SelectItem>
                                    <SelectItem value="recepcionista">Recepcionista</SelectItem>
                                    <SelectItem value="assistente">Assistente</SelectItem>
                                    <SelectItem value="outro">Outro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Especialidades */}
                    <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-zinc-800">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Especialidades</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {services.map(service => (
                                <div key={service.id} className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                                    <Checkbox
                                        id={service.id}
                                        checked={formData.specialties.includes(service.id)}
                                        onCheckedChange={() => toggleSpecialty(service.id)}
                                    />
                                    <label htmlFor={service.id} className="text-sm font-medium leading-none">
                                        {service.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Horários de Atendimento */}
                    <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-zinc-800">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Horários de Atendimento</h4>
                        <div className="space-y-3">
                            {weekDays.map(day => {
                                const hours = formData.workingHours[day.id]?.[0]
                                return (
                                    <div key={day.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <Switch
                                                checked={!!hours}
                                                onCheckedChange={(checked) => {
                                                    if (checked) setWorkingHours(day.id, "09:00", "18:00")
                                                    else removeWorkingDay(day.id)
                                                }}
                                            />
                                            <span className="text-sm font-bold uppercase tracking-tight w-20">{day.label}</span>
                                        </div>
                                        {hours && (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="time"
                                                    value={hours.start}
                                                    onChange={(e) => setWorkingHours(day.id, e.target.value, hours.end)}
                                                    className="w-24 h-9 rounded-lg bg-white dark:bg-zinc-900 border-none text-xs font-bold"
                                                />
                                                <span className="text-slate-400 font-bold">às</span>
                                                <Input
                                                    type="time"
                                                    value={hours.end}
                                                    onChange={(e) => setWorkingHours(day.id, hours.start, e.target.value)}
                                                    className="w-24 h-9 rounded-lg bg-white dark:bg-zinc-900 border-none text-xs font-bold"
                                                />
                                            </div>
                                        )}
                                        {!hours && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pr-4">Folga</span>}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Preferências & Financeiro */}
                    <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-zinc-800">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preferências & Financeiro</h4>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase">Comissão (%)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={formData.commission}
                                    onChange={(e) => setFormData({ ...formData, commission: Number(e.target.value) })}
                                    className="rounded-xl h-12 bg-slate-50 dark:bg-zinc-800 border-none"
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl">
                                <div>
                                    <p className="text-sm font-bold">Reserva Online</p>
                                    <p className="text-[10px] text-slate-400">Permitir que clientes agendem com este profissional</p>
                                </div>
                                <Switch
                                    checked={formData.acceptsOnlineBooking}
                                    onCheckedChange={(checked) => setFormData({ ...formData, acceptsOnlineBooking: checked })}
                                />
                            </div>
                        </div>
                    </div>
                        </TabsContent>

                        <TabsContent value="permissoes" className="mt-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
                            <PermissionsManager
                                permissions={formData.permissions}
                                onChange={(permissions) => setFormData({ ...formData, permissions })}
                            />
                        </TabsContent>

                        <TabsContent value="bloqueios" className="mt-4">
                            <UnavailabilityManager
                                tenantId={currentTenant.id}
                                employeeId={selectedEmployee.id}
                            />
                        </TabsContent>

                        <TabsContent value="comissoes" className="mt-4">
                            <CommissionExceptionsManager
                                tenantId={currentTenant.id}
                                employeeId={selectedEmployee.id}
                                defaultCommissionRate={selectedEmployee.commissionRate ?? 40}
                            />
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="space-y-6">
                        {/* Wizard Steps Indicator */}
                        <div className="flex items-center gap-1 mb-6">
                            {[
                                { id: 'cpf', label: 'Dados Gerais' },
                                { id: 'horarios', label: 'Horários' },
                                { id: 'servicos', label: 'Serviços' },
                                { id: 'finalizar', label: 'Finalizar' },
                            ].map((step, idx, arr) => (
                                <div key={step.id} className="flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (step.id === 'cpf' || (cpfSearched && wizardStep !== 'cpf')) {
                                                setWizardStep(step.id as typeof wizardStep)
                                            }
                                        }}
                                        disabled={!cpfSearched && step.id !== 'cpf'}
                                        className={cn(
                                            "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
                                            wizardStep === step.id || (step.id === 'cpf' && (wizardStep === 'cpf' || wizardStep === 'dados'))
                                                ? "bg-[#F97316] text-white"
                                                : cpfSearched
                                                    ? "bg-[#F1F5F9] text-[#64748b] hover:bg-[#E2E8F0]"
                                                    : "bg-[#F1F5F9] text-[#94a3b8] cursor-not-allowed"
                                        )}
                                    >
                                        {step.label}
                                    </button>
                                    {idx < arr.length - 1 && (
                                        <ChevronRight className="w-4 h-4 text-[#E2E8F0] mx-1" />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Step: CPF Search / Dados Gerais */}
                        {(wizardStep === 'cpf' || wizardStep === 'dados') && (
                            <div className="space-y-6 max-h-[55vh] overflow-y-auto pr-2">
                                {/* CPF Search */}
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-bold text-[#F97316] uppercase tracking-wide">Dados Gerais</h4>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-[#64748b]">CPF</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={cpfSearch}
                                                onChange={(e) => setCpfSearch(formatCPF(e.target.value))}
                                                placeholder="000.000.000-00"
                                                className="rounded-lg h-11 bg-[#F8F9FF] border-[#E2E8F0] font-medium"
                                                maxLength={14}
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleSearchCPF}
                                                disabled={cpfSearch.replace(/\D/g, '').length < 11 || searching}
                                                className="rounded-lg h-11 px-4 bg-[#64748b] hover:bg-[#475569] text-white font-medium"
                                            >
                                                {searching ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <UserSearch className="w-4 h-4 mr-2" />
                                                        Pesquisar
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Search Result */}
                                    {cpfSearched && (
                                        <div className={cn(
                                            "p-4 rounded-xl border",
                                            foundPerson?.source === 'profissional'
                                                ? "bg-red-50 border-red-200"
                                                : foundPerson
                                                    ? "bg-green-50 border-green-200"
                                                    : "bg-[#F8F9FF] border-[#E2E8F0]"
                                        )}>
                                            {foundPerson?.source === 'profissional' ? (
                                                <div className="flex items-center gap-3">
                                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                                    <div>
                                                        <p className="font-semibold text-red-700">Profissional já cadastrado</p>
                                                        <p className="text-sm text-red-600">{foundPerson.name} já está cadastrado como profissional.</p>
                                                    </div>
                                                </div>
                                            ) : foundPerson ? (
                                                <div className="flex items-center gap-3">
                                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                    <div>
                                                        <p className="font-semibold text-green-700">Cliente encontrado!</p>
                                                        <p className="text-sm text-green-600">
                                                            {foundPerson.name} - Dados preenchidos automaticamente.
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <UserSearch className="w-5 h-5 text-[#64748b]" />
                                                    <div>
                                                        <p className="font-semibold text-[#0F172A]">CPF não encontrado</p>
                                                        <p className="text-sm text-[#64748b]">
                                                            Preencha os dados do novo profissional abaixo.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Form Fields - Show after CPF search */}
                                {cpfSearched && foundPerson?.source !== 'profissional' && (
                                    <div className="space-y-4 pt-4 border-t border-[#E2E8F0]">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2 space-y-2">
                                                <Label className="text-xs font-semibold text-[#64748b]">Nome Completo</Label>
                                                <Input
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="rounded-lg h-11 bg-[#F8F9FF] border-[#E2E8F0]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-[#64748b]">Email</Label>
                                                <Input
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="rounded-lg h-11 bg-[#F8F9FF] border-[#E2E8F0]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-[#64748b]">Telefone</Label>
                                                <Input
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="rounded-lg h-11 bg-[#F8F9FF] border-[#E2E8F0]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-[#64748b]">Data de Nascimento</Label>
                                                <Input
                                                    type="date"
                                                    value={formData.birthdate}
                                                    onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                                                    className="rounded-lg h-11 bg-[#F8F9FF] border-[#E2E8F0]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-[#64748b]">Cargo/Função</Label>
                                                <Select
                                                    value={formData.role}
                                                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                                                >
                                                    <SelectTrigger className="rounded-lg h-11 bg-[#F8F9FF] border-[#E2E8F0]">
                                                        <SelectValue placeholder="Selecione" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="gerente">Gerente</SelectItem>
                                                        <SelectItem value="cabeleireira">Cabeleireira</SelectItem>
                                                        <SelectItem value="manicure">Manicure</SelectItem>
                                                        <SelectItem value="esteticista">Esteticista</SelectItem>
                                                        <SelectItem value="recepcionista">Recepcionista</SelectItem>
                                                        <SelectItem value="assistente">Assistente</SelectItem>
                                                        <SelectItem value="outro">Outro</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Next Button */}
                                {cpfSearched && foundPerson?.source !== 'profissional' && (
                                    <div className="flex justify-end pt-4">
                                        <Button
                                            type="button"
                                            onClick={() => setWizardStep('horarios')}
                                            disabled={!formData.name}
                                            className="rounded-lg h-11 px-6 bg-[#F97316] hover:bg-[#EA580C] text-white font-medium"
                                        >
                                            Seguir
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step: Horários */}
                        {wizardStep === 'horarios' && (
                            <div className="space-y-6 max-h-[55vh] overflow-y-auto pr-2">
                                <h4 className="text-[11px] font-bold text-[#F97316] uppercase tracking-wide">Horários de Atendimento</h4>
                                <div className="space-y-3">
                                    {weekDays.map(day => {
                                        const hours = formData.workingHours[day.id]?.[0]
                                        return (
                                            <div key={day.id} className="flex items-center justify-between p-3 bg-[#F8F9FF] rounded-xl border border-[#E2E8F0]">
                                                <div className="flex items-center gap-3">
                                                    <Switch
                                                        checked={!!hours}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) setWorkingHours(day.id, "09:00", "18:00")
                                                            else removeWorkingDay(day.id)
                                                        }}
                                                    />
                                                    <span className="text-sm font-semibold text-[#0F172A] w-20">{day.label}</span>
                                                </div>
                                                {hours && (
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="time"
                                                            value={hours.start}
                                                            onChange={(e) => setWorkingHours(day.id, e.target.value, hours.end)}
                                                            className="w-24 h-9 rounded-lg bg-white border-[#E2E8F0] text-xs font-semibold"
                                                        />
                                                        <span className="text-[#64748b] font-medium">às</span>
                                                        <Input
                                                            type="time"
                                                            value={hours.end}
                                                            onChange={(e) => setWorkingHours(day.id, hours.start, e.target.value)}
                                                            className="w-24 h-9 rounded-lg bg-white border-[#E2E8F0] text-xs font-semibold"
                                                        />
                                                    </div>
                                                )}
                                                {!hours && <span className="text-[11px] font-semibold text-[#94a3b8] uppercase pr-4">Folga</span>}
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setWizardStep('cpf')}
                                        className="rounded-lg h-11 px-6"
                                    >
                                        Voltar
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setWizardStep('servicos')}
                                        className="rounded-lg h-11 px-6 bg-[#F97316] hover:bg-[#EA580C] text-white font-medium"
                                    >
                                        Seguir
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step: Serviços/Especialidades */}
                        {wizardStep === 'servicos' && (
                            <div className="space-y-6 max-h-[55vh] overflow-y-auto pr-2">
                                <h4 className="text-[11px] font-bold text-[#F97316] uppercase tracking-wide">Serviços que realiza</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {services.map(service => (
                                        <div
                                            key={service.id}
                                            className={cn(
                                                "flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-all",
                                                formData.specialties.includes(service.id)
                                                    ? "bg-[#FFF7ED] border-[#F97316]"
                                                    : "bg-[#F8F9FF] border-[#E2E8F0] hover:border-[#F97316]/50"
                                            )}
                                            onClick={() => toggleSpecialty(service.id)}
                                        >
                                            <Checkbox
                                                id={`new-${service.id}`}
                                                checked={formData.specialties.includes(service.id)}
                                                onCheckedChange={() => toggleSpecialty(service.id)}
                                                className="data-[state=checked]:bg-[#F97316] data-[state=checked]:border-[#F97316]"
                                            />
                                            <label htmlFor={`new-${service.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                                {service.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setWizardStep('horarios')}
                                        className="rounded-lg h-11 px-6"
                                    >
                                        Voltar
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setWizardStep('finalizar')}
                                        className="rounded-lg h-11 px-6 bg-[#F97316] hover:bg-[#EA580C] text-white font-medium"
                                    >
                                        Seguir
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step: Finalizar (Comissão, Booking, Permissões) */}
                        {wizardStep === 'finalizar' && (
                            <div className="space-y-6 max-h-[55vh] overflow-y-auto pr-2">
                                <h4 className="text-[11px] font-bold text-[#F97316] uppercase tracking-wide">Informações Adicionais</h4>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-[#64748b]">Comissão (%)</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={formData.commission}
                                            onChange={(e) => setFormData({ ...formData, commission: Number(e.target.value) })}
                                            className="rounded-lg h-11 bg-[#F8F9FF] border-[#E2E8F0] max-w-[120px]"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-[#F8F9FF] rounded-xl border border-[#E2E8F0]">
                                        <div>
                                            <p className="text-sm font-semibold text-[#0F172A]">Reserva Online</p>
                                            <p className="text-xs text-[#64748b]">Clientes podem agendar com este profissional</p>
                                        </div>
                                        <Switch
                                            checked={formData.acceptsOnlineBooking}
                                            onCheckedChange={(checked) => setFormData({ ...formData, acceptsOnlineBooking: checked })}
                                        />
                                    </div>
                                </div>

                                {/* Permissões */}
                                <div className="pt-4 border-t border-[#E2E8F0]">
                                    <PermissionsManager
                                        permissions={formData.permissions}
                                        onChange={(permissions) => setFormData({ ...formData, permissions })}
                                    />
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setWizardStep('servicos')}
                                        className="rounded-lg h-11 px-6"
                                    >
                                        Voltar
                                    </Button>
                                    {/* The submit button from FormDialog will appear here */}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </FormDialog>

            <ConfirmDialog
                open={showConfirm}
                onOpenChange={setShowConfirm}
                title="Remover Profissional?"
                description="Esta ação removerá o acesso do profissional ao sistema. Os dados históricos permanecerão salvos."
                onConfirm={() => selectedEmployee && handleDeleteEmployee(selectedEmployee)}
                variant="destructive"
            />
        </div>
    )
}
