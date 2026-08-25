"use client"

import { memo } from "react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { AppointmentStatus } from "@/types/catalog"
import { cn } from "@/lib/utils"

interface StatusCount {
    all: number
    pending: number
    confirmed: number
    in_progress: number
    completed: number
    cancelled: number
    no_show: number
}

interface AgendaStatusBarProps {
    statusCounts: StatusCount
    todayRevenue: number
    selectedStatuses: AppointmentStatus[]
    onStatusFilterChange: (statuses: AppointmentStatus[]) => void
    showCancelled: boolean
    onShowCancelledChange: (show: boolean) => void
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; selectedBg: string; status?: AppointmentStatus }> = {
    all: {
        label: "Todos",
        color: "text-[#64748b]",
        bgColor: "bg-white border-[#E2E8F0]",
        selectedBg: "bg-[#0F172A] text-white border-[#0F172A]",
    },
    pending: {
        label: "Aguardando",
        color: "text-amber-700",
        bgColor: "bg-white border-[#E2E8F0] hover:border-amber-300",
        selectedBg: "bg-amber-100 border-amber-400 text-amber-800",
        status: "pending" as AppointmentStatus,
    },
    confirmed: {
        label: "Confirmado",
        color: "text-blue-700",
        bgColor: "bg-white border-[#E2E8F0] hover:border-blue-300",
        selectedBg: "bg-blue-100 border-blue-400 text-blue-800",
        status: "confirmed" as AppointmentStatus,
    },
    in_progress: {
        label: "Em atendimento",
        color: "text-purple-700",
        bgColor: "bg-white border-[#E2E8F0] hover:border-purple-300",
        selectedBg: "bg-purple-100 border-purple-400 text-purple-800",
        status: "in_progress" as AppointmentStatus,
    },
    completed: {
        label: "Finalizado",
        color: "text-emerald-700",
        bgColor: "bg-white border-[#E2E8F0] hover:border-emerald-300",
        selectedBg: "bg-emerald-100 border-emerald-400 text-emerald-800",
        status: "completed" as AppointmentStatus,
    },
    cancelled: {
        label: "Cancelado",
        color: "text-red-700",
        bgColor: "bg-white border-[#E2E8F0] hover:border-red-300",
        selectedBg: "bg-red-100 border-red-400 text-red-800",
        status: "cancelled" as AppointmentStatus,
    },
    no_show: {
        label: "Não compareceu",
        color: "text-orange-700",
        bgColor: "bg-white border-[#E2E8F0] hover:border-orange-300",
        selectedBg: "bg-orange-100 border-orange-400 text-orange-800",
        status: "no_show" as AppointmentStatus,
    },
}

export const AgendaStatusBar = memo(function AgendaStatusBar({
    statusCounts,
    todayRevenue,
    selectedStatuses,
    onStatusFilterChange,
    showCancelled,
    onShowCancelledChange,
}: AgendaStatusBarProps) {
    const isStatusSelected = (status: string) => {
        if (status === 'all') {
            return selectedStatuses.length === 0
        }
        return selectedStatuses.includes(status as AppointmentStatus)
    }

    const toggleStatus = (status: string) => {
        if (status === 'all') {
            onStatusFilterChange([])
            return
        }

        const statusValue = status as AppointmentStatus
        if (selectedStatuses.includes(statusValue)) {
            onStatusFilterChange(selectedStatuses.filter(s => s !== statusValue))
        } else {
            onStatusFilterChange([...selectedStatuses, statusValue])
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value / 100)
    }

    return (
        <div className="border-b border-[#E2E8F0] bg-[#F8F9FF] px-4 py-3">
            {/* Status Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                    const count = statusCounts[key as keyof StatusCount]
                    const selected = isStatusSelected(key)

                    return (
                        <Badge
                            key={key}
                            variant="outline"
                            onClick={() => toggleStatus(key)}
                            className={cn(
                                "cursor-pointer transition-all text-xs px-2.5 py-1 font-medium border",
                                selected ? config.selectedBg : config.bgColor,
                                !selected && config.color
                            )}
                        >
                            {config.label}
                            <span className="ml-1.5 font-semibold">{count}</span>
                        </Badge>
                    )
                })}
            </div>

            {/* Bottom row: Revenue + Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                {/* Revenue */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-md border border-[#E2E8F0]">
                        <span className="text-[#64748b] text-xs">Receita hoje:</span>
                        <span className="font-semibold text-[#0D9488]">
                            {formatCurrency(todayRevenue)}
                        </span>
                    </div>
                </div>

                {/* Toggle Cancelled */}
                <div className="flex items-center gap-2">
                    <Switch
                        id="show-cancelled"
                        checked={showCancelled}
                        onCheckedChange={onShowCancelledChange}
                        className="data-[state=checked]:bg-[#0D9488]"
                    />
                    <Label htmlFor="show-cancelled" className="text-xs text-[#64748b] cursor-pointer">
                        Mostrar cancelados
                    </Label>
                </div>
            </div>
        </div>
    )
})
