"use client"

import { memo, useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Edit,
    CheckCircle2,
    Clock,
    PlayCircle,
    AlertCircle,
    Scissors,
    Calendar,
    MessageSquare,
    Ban,
    Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { AppointmentRecord, ServiceRecord, AppointmentStatus } from "@/types/catalog"

type AppointmentView = AppointmentRecord & {
    service?: ServiceRecord
    startDate: Date
    duration: number
}

interface AppointmentActionsSheetProps {
    appointment: AppointmentView | null
    isOpen: boolean
    onClose: () => void
    onEdit: (appointment: AppointmentView) => void
    onStatusChange: (appointmentId: string, newStatus: AppointmentStatus) => void
    onComplete: (appointment: AppointmentView) => void
}

const STATUS_OPTIONS: Array<{
    value: AppointmentStatus
    label: string
    icon: React.ElementType
    color: string
    bgColor: string
}> = [
    { value: 'pending', label: 'Aguardando', icon: Clock, color: '#EC9F73', bgColor: 'bg-orange-50' },
    { value: 'confirmed', label: 'Confirmado', icon: CheckCircle2, color: '#64A500', bgColor: 'bg-green-50' },
    { value: 'in_progress', label: 'Em Atendimento', icon: PlayCircle, color: '#65DDC8', bgColor: 'bg-teal-50' },
    { value: 'completed', label: 'Finalizado', icon: Check, color: '#88B2D5', bgColor: 'bg-blue-50' },
    { value: 'no_show', label: 'Nao Compareceu', icon: AlertCircle, color: '#949494', bgColor: 'bg-gray-50' },
    { value: 'cancelled', label: 'Cancelado', icon: Ban, color: '#DA9CE0', bgColor: 'bg-pink-50' },
]

export const AppointmentActionsSheet = memo(function AppointmentActionsSheet({
    appointment,
    isOpen,
    onClose,
    onEdit,
    onStatusChange,
    onComplete,
}: AppointmentActionsSheetProps) {
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean
        status: AppointmentStatus | null
        message: string
    }>({ open: false, status: null, message: '' })

    if (!appointment) return null

    const startTime = format(appointment.startDate, 'HH:mm')
    const endTime = format(
        new Date(appointment.startDate.getTime() + appointment.duration * 60000),
        'HH:mm'
    )
    const dateLabel = format(appointment.startDate, "EEEE, d 'de' MMMM", { locale: ptBR })

    const handleStatusClick = (status: AppointmentStatus) => {
        if (status === appointment.status) return

        // Status "completed" abre modal de conclusao
        if (status === 'completed') {
            onComplete(appointment)
            onClose()
            return
        }

        // Status que requerem confirmacao
        if (status === 'cancelled' || status === 'no_show') {
            const message = status === 'cancelled'
                ? 'Tem certeza que deseja cancelar este agendamento?'
                : 'Confirmar que o cliente nao compareceu?'
            setConfirmDialog({ open: true, status, message })
            return
        }

        // Outros status aplicam direto
        onStatusChange(appointment.id, status)
        onClose()
    }

    const handleConfirmStatus = () => {
        if (confirmDialog.status) {
            onStatusChange(appointment.id, confirmDialog.status)
        }
        setConfirmDialog({ open: false, status: null, message: '' })
        onClose()
    }

    const handleEdit = () => {
        onEdit(appointment)
        onClose()
    }

    const currentStatus = STATUS_OPTIONS.find(s => s.value === appointment.status)

    return (
        <>
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent side="right" className="w-full sm:w-[400px] p-0 overflow-hidden">
                    {/* Header com cor do status */}
                    <div
                        className="p-6 text-white"
                        style={{ backgroundColor: currentStatus?.color || '#0D9488' }}
                    >
                        <SheetHeader>
                            <SheetTitle className="text-white text-left">
                                <span className="text-lg font-bold">
                                    {appointment.customerName || 'Cliente'}
                                </span>
                            </SheetTitle>
                        </SheetHeader>
                        <div className="mt-3 space-y-1">
                            <div className="flex items-center gap-2 text-white/90">
                                <Scissors className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    {appointment.service?.name || appointment.serviceName || 'Servico'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-white/90">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm capitalize">{dateLabel}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/90">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-semibold">{startTime} - {endTime}</span>
                                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                                    {appointment.duration} min
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                        {/* Acao principal - Editar */}
                        <button
                            onClick={handleEdit}
                            className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#0D9488]/10 hover:bg-[#0D9488]/20 transition-colors group"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#0D9488] flex items-center justify-center">
                                <Edit className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-[#0F172A]">Ver / Editar Agendamento</p>
                                <p className="text-sm text-[#64748b]">Alterar horario, servico ou cliente</p>
                            </div>
                        </button>

                        {/* Alterar Status */}
                        <div>
                            <h3 className="text-xs font-bold text-[#64748b] uppercase tracking-wide mb-3 px-1">
                                Alterar Status
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {STATUS_OPTIONS.map((option) => {
                                    const Icon = option.icon
                                    const isCurrentStatus = appointment.status === option.value
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => handleStatusClick(option.value)}
                                            disabled={isCurrentStatus}
                                            className={cn(
                                                "flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                                                isCurrentStatus
                                                    ? "border-current opacity-100 ring-2 ring-offset-1"
                                                    : "border-transparent hover:border-slate-200 opacity-80 hover:opacity-100",
                                                option.bgColor
                                            )}
                                            style={{
                                                borderColor: isCurrentStatus ? option.color : undefined,
                                                // @ts-expect-error CSS custom property for ring
                                                '--tw-ring-color': isCurrentStatus ? option.color : undefined,
                                            }}
                                        >
                                            <Icon
                                                className="w-5 h-5 flex-shrink-0"
                                                style={{ color: option.color }}
                                            />
                                            <span
                                                className="text-sm font-medium"
                                                style={{ color: option.color }}
                                            >
                                                {option.label}
                                            </span>
                                            {isCurrentStatus && (
                                                <Check className="w-4 h-4 ml-auto" style={{ color: option.color }} />
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Info do Cliente */}
                        {appointment.notes && (
                            <div>
                                <h3 className="text-xs font-bold text-[#64748b] uppercase tracking-wide mb-3 px-1">
                                    Informacoes
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                                        <MessageSquare className="w-5 h-5 text-[#64748b] mt-0.5" />
                                        <span className="text-sm text-[#0F172A]">
                                            {appointment.notes}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Valor */}
                        {appointment.price && (
                            <div className="flex items-center justify-between p-4 rounded-xl bg-[#0D9488]/5 border border-[#0D9488]/20">
                                <span className="text-sm font-medium text-[#64748b]">Valor do Servico</span>
                                <span className="text-xl font-bold text-[#0D9488]">
                                    R$ {Number(appointment.price).toFixed(2).replace('.', ',')}
                                </span>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Dialog de confirmacao */}
            <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, status: null, message: '' })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar alteracao</AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmDialog.message}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmStatus}>
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
})
