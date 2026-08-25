"use client"

import { memo } from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { AgendaFilters, GridSize } from "@/types/agenda"
import type { AppointmentStatus, EmployeeRecord } from "@/types/catalog"
import { Calendar } from "@/components/ui/calendar"

interface AgendaSidebarProps {
    isOpen: boolean
    filters: AgendaFilters
    onFiltersChange: (filters: AgendaFilters) => void
    employees: EmployeeRecord[]
    serviceCategories: { id: string; name: string; shortCode?: string }[]
    onNewAppointment: () => void
    currentDate: Date
    onDateChange: (date: Date) => void
}

const STATUS_CONFIG: Array<{
    value: AppointmentStatus
    label: string
    color: string
}> = [
    { value: 'staff_unavailable', label: 'Ausência', color: '#94a3b8' },
    { value: 'pending', label: 'Aguardando', color: '#f59e0b' },
    { value: 'confirmed', label: 'Confirmado', color: '#3b82f6' },
    { value: 'no_show', label: 'Não compareceu', color: '#f97316' },
    { value: 'in_progress', label: 'Em atendimento', color: '#8b5cf6' },
    { value: 'completed', label: 'Finalizado', color: '#10b981' },
    { value: 'cancelled', label: 'Cancelado', color: '#ef4444' },
]

export const AgendaSidebar = memo(function AgendaSidebar({
    isOpen,
    filters,
    onFiltersChange,
    employees,
    serviceCategories,
    onNewAppointment,
    currentDate,
    onDateChange,
}: AgendaSidebarProps) {
    const employeesByInitial = employees.reduce((acc, emp) => {
        const initial = emp.fullName.charAt(0).toUpperCase()
        if (!acc[initial]) acc[initial] = []
        acc[initial].push(emp)
        return acc
    }, {} as Record<string, EmployeeRecord[]>)

    const initials = Object.keys(employeesByInitial).sort()

    const toggleEmployee = (employeeId: string) => {
        if (employeeId === 'all') {
            onFiltersChange({
                ...filters,
                selectedEmployees: ['all'],
            })
            return
        }

        const current = filters.selectedEmployees
        const hasAll = current.includes('all')

        if (hasAll) {
            onFiltersChange({
                ...filters,
                selectedEmployees: [employeeId],
            })
        } else {
            const hasEmployee = current.includes(employeeId)
            const newSelection = hasEmployee
                ? current.filter(id => id !== employeeId)
                : [...current, employeeId]

            onFiltersChange({
                ...filters,
                selectedEmployees: newSelection.length === 0 ? ['all'] : newSelection,
            })
        }
    }

    const toggleCategory = (categoryId: string) => {
        if (categoryId === 'all') {
            onFiltersChange({
                ...filters,
                selectedServiceCategories: ['all'],
            })
            return
        }

        const current = filters.selectedServiceCategories
        const hasAll = current.includes('all')

        if (hasAll) {
            onFiltersChange({
                ...filters,
                selectedServiceCategories: [categoryId],
            })
        } else {
            const hasCategory = current.includes(categoryId)
            const newSelection = hasCategory
                ? current.filter(id => id !== categoryId)
                : [...current, categoryId]

            onFiltersChange({
                ...filters,
                selectedServiceCategories: newSelection.length === 0 ? ['all'] : newSelection,
            })
        }
    }

    const toggleStatus = (status: AppointmentStatus) => {
        const current = filters.selectedStatuses
        const hasStatus = current.includes(status)

        const newSelection = hasStatus
            ? current.filter(s => s !== status)
            : [...current, status]

        onFiltersChange({
            ...filters,
            selectedStatuses: newSelection,
        })
    }

    const isEmployeeSelected = (employeeId: string) => {
        if (employeeId === 'all') return filters.selectedEmployees.includes('all')
        return filters.selectedEmployees.includes(employeeId)
    }

    const isCategorySelected = (categoryId: string) => {
        if (categoryId === 'all') return filters.selectedServiceCategories.includes('all')
        return filters.selectedServiceCategories.includes(categoryId)
    }

    return (
        <div
            className={cn(
                "h-full border-r border-[#E2E8F0] bg-white transition-all duration-300 ease-in-out overflow-hidden flex flex-col",
                isOpen ? "w-[280px]" : "w-0"
            )}
        >
            {isOpen && (
                <div className="flex flex-col h-full overflow-y-auto p-4 space-y-5">
                    {/* Calendar */}
                    <div>
                        <Calendar
                            mode="single"
                            selected={currentDate}
                            onSelect={(date) => date && onDateChange(date)}
                            className="rounded-md border border-[#E2E8F0] w-full"
                        />
                    </div>

                    {/* New Appointment Button */}
                    <Button
                        onClick={onNewAppointment}
                        className="w-full bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-md h-10"
                    >
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Novo Agendamento
                    </Button>

                    {/* Professionals */}
                    <div className="space-y-3">
                        <h3 className="text-[11px] font-semibold uppercase text-[#94a3b8] tracking-wide">
                            Profissionais
                        </h3>

                        <div className="flex flex-wrap gap-1.5">
                            <Button
                                variant={isEmployeeSelected('all') ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => toggleEmployee('all')}
                                className={cn(
                                    "h-7 px-2.5 rounded text-xs font-medium",
                                    isEmployeeSelected('all')
                                        ? "bg-[#0F172A] hover:bg-[#1e293b] text-white"
                                        : "border-[#E2E8F0] text-[#64748b] hover:text-[#0F172A] hover:border-[#94a3b8]"
                                )}
                            >
                                Todos
                            </Button>

                            {initials.map(initial => (
                                <Button
                                    key={initial}
                                    variant={
                                        employeesByInitial[initial].some(emp =>
                                            isEmployeeSelected(emp.id)
                                        ) && !isEmployeeSelected('all')
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() => {
                                        const empIds = employeesByInitial[initial].map(e => e.id)
                                        const allSelected = empIds.every(id =>
                                            filters.selectedEmployees.includes(id)
                                        )

                                        if (allSelected) {
                                            const newSelection = filters.selectedEmployees.filter(
                                                id => !empIds.includes(id)
                                            )
                                            onFiltersChange({
                                                ...filters,
                                                selectedEmployees:
                                                    newSelection.length === 0 ? ['all'] : newSelection,
                                            })
                                        } else {
                                            const current = filters.selectedEmployees.filter(
                                                id => id !== 'all'
                                            )
                                            onFiltersChange({
                                                ...filters,
                                                selectedEmployees: [...new Set([...current, ...empIds])],
                                            })
                                        }
                                    }}
                                    className={cn(
                                        "h-7 w-7 p-0 rounded text-xs font-semibold",
                                        employeesByInitial[initial].some(emp =>
                                            isEmployeeSelected(emp.id)
                                        ) && !isEmployeeSelected('all')
                                            ? "bg-[#0D9488] hover:bg-[#0F766E] text-white border-[#0D9488]"
                                            : "border-[#E2E8F0] text-[#64748b] hover:text-[#0F172A] hover:border-[#94a3b8]"
                                    )}
                                >
                                    {initial}
                                </Button>
                            ))}
                        </div>

                        <div className="space-y-0.5 max-h-[180px] overflow-y-auto">
                            {employees.map(emp => (
                                <button
                                    key={emp.id}
                                    onClick={() => toggleEmployee(emp.id)}
                                    className={cn(
                                        "w-full text-left px-2.5 py-1.5 rounded text-sm transition-colors",
                                        isEmployeeSelected(emp.id) && !isEmployeeSelected('all')
                                            ? "bg-[#0D9488]/10 text-[#0D9488] font-medium"
                                            : "text-[#64748b] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                                    )}
                                >
                                    {emp.fullName}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="space-y-3">
                        <h3 className="text-[11px] font-semibold uppercase text-[#94a3b8] tracking-wide">
                            Categorias
                        </h3>

                        <div className="flex flex-wrap gap-1.5">
                            <Button
                                variant={isCategorySelected('all') ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => toggleCategory('all')}
                                className={cn(
                                    "h-7 px-2.5 rounded text-xs font-medium",
                                    isCategorySelected('all')
                                        ? "bg-[#0F172A] hover:bg-[#1e293b] text-white"
                                        : "border-[#E2E8F0] text-[#64748b] hover:text-[#0F172A]"
                                )}
                            >
                                Todas
                            </Button>

                            {serviceCategories.map(cat => (
                                <Button
                                    key={cat.id}
                                    variant={
                                        isCategorySelected(cat.id) && !isCategorySelected('all')
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() => toggleCategory(cat.id)}
                                    className={cn(
                                        "h-7 px-2.5 rounded text-xs font-medium",
                                        isCategorySelected(cat.id) && !isCategorySelected('all')
                                            ? "bg-[#0D9488] hover:bg-[#0F766E] text-white border-[#0D9488]"
                                            : "border-[#E2E8F0] text-[#64748b] hover:text-[#0F172A]"
                                    )}
                                >
                                    {cat.shortCode || cat.name}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-3">
                        <h3 className="text-[11px] font-semibold uppercase text-[#94a3b8] tracking-wide">
                            Status
                        </h3>

                        <div className="flex flex-wrap gap-1.5">
                            {STATUS_CONFIG.map(({ value, label, color }) => (
                                <Badge
                                    key={value}
                                    variant="outline"
                                    className={cn(
                                        "cursor-pointer transition-all h-6 px-2 text-[11px] font-medium border",
                                        filters.selectedStatuses.includes(value)
                                            ? "text-white border-transparent"
                                            : "bg-white"
                                    )}
                                    style={
                                        filters.selectedStatuses.includes(value)
                                            ? { backgroundColor: color }
                                            : { borderColor: color, color: color }
                                    }
                                    onClick={() => toggleStatus(value)}
                                >
                                    {label}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Account Closure */}
                    <div className="space-y-3">
                        <h3 className="text-[11px] font-semibold uppercase text-[#94a3b8] tracking-wide">
                            Fechamento
                        </h3>

                        <div className="flex gap-2">
                            <Button
                                variant={filters.accountClosure === 'open' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() =>
                                    onFiltersChange({ ...filters, accountClosure: 'open' })
                                }
                                className={cn(
                                    "flex-1 h-8 rounded text-xs font-medium",
                                    filters.accountClosure === 'open'
                                        ? "bg-[#0F172A] hover:bg-[#1e293b] text-white"
                                        : "border-[#E2E8F0] text-[#64748b]"
                                )}
                            >
                                Aberta
                            </Button>
                            <Button
                                variant={filters.accountClosure === 'closed' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() =>
                                    onFiltersChange({ ...filters, accountClosure: 'closed' })
                                }
                                className={cn(
                                    "flex-1 h-8 rounded text-xs font-medium",
                                    filters.accountClosure === 'closed'
                                        ? "bg-[#0F172A] hover:bg-[#1e293b] text-white"
                                        : "border-[#E2E8F0] text-[#64748b]"
                                )}
                            >
                                Fechada
                            </Button>
                        </div>
                    </div>

                    {/* Grid Size */}
                    <div className="space-y-3">
                        <h3 className="text-[11px] font-semibold uppercase text-[#94a3b8] tracking-wide">
                            Tamanho da Agenda
                        </h3>

                        <div className="space-y-2">
                            <Label className="text-xs text-[#64748b]">Linha (altura)</Label>
                            <RadioGroup
                                value={filters.gridSize.row}
                                onValueChange={(value: GridSize) =>
                                    onFiltersChange({
                                        ...filters,
                                        gridSize: { ...filters.gridSize, row: value },
                                    })
                                }
                                className="flex gap-3"
                            >
                                {(['PP', 'P', 'M', 'G'] as const).map(size => (
                                    <div key={size} className="flex items-center">
                                        <RadioGroupItem value={size} id={`row-${size}`} className="border-[#0D9488] text-[#0D9488]" />
                                        <Label
                                            htmlFor={`row-${size}`}
                                            className="ml-1.5 text-xs text-[#64748b] cursor-pointer"
                                        >
                                            {size}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-[#64748b]">Coluna (largura)</Label>
                            <RadioGroup
                                value={filters.gridSize.column}
                                onValueChange={(value: GridSize) =>
                                    onFiltersChange({
                                        ...filters,
                                        gridSize: { ...filters.gridSize, column: value },
                                    })
                                }
                                className="flex gap-3"
                            >
                                {(['PP', 'P', 'M', 'G'] as const).map(size => (
                                    <div key={size} className="flex items-center">
                                        <RadioGroupItem value={size} id={`col-${size}`} className="border-[#0D9488] text-[#0D9488]" />
                                        <Label
                                            htmlFor={`col-${size}`}
                                            className="ml-1.5 text-xs text-[#64748b] cursor-pointer"
                                        >
                                            {size}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    </div>

                    {/* Show Absences */}
                    <div className="space-y-3">
                        <h3 className="text-[11px] font-semibold uppercase text-[#94a3b8] tracking-wide">
                            Exibir Folga
                        </h3>

                        <div className="flex gap-2">
                            <Button
                                variant={filters.showAbsences ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => onFiltersChange({ ...filters, showAbsences: true })}
                                className={cn(
                                    "flex-1 h-8 rounded text-xs font-medium",
                                    filters.showAbsences
                                        ? "bg-[#0F172A] hover:bg-[#1e293b] text-white"
                                        : "border-[#E2E8F0] text-[#64748b]"
                                )}
                            >
                                Sim
                            </Button>
                            <Button
                                variant={!filters.showAbsences ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => onFiltersChange({ ...filters, showAbsences: false })}
                                className={cn(
                                    "flex-1 h-8 rounded text-xs font-medium",
                                    !filters.showAbsences
                                        ? "bg-[#0F172A] hover:bg-[#1e293b] text-white"
                                        : "border-[#E2E8F0] text-[#64748b]"
                                )}
                            >
                                Não
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
})
