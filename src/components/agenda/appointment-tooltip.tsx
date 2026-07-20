"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Phone, MessageCircle, User, Scissors, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { AppointmentRecord, ServiceRecord, EmployeeRecord } from "@/types/catalog"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { format } from "date-fns"

interface AppointmentTooltipProps {
    appointment: AppointmentRecord & {
        service?: ServiceRecord
        startDate: Date
    }
    employee?: EmployeeRecord
    isVisible: boolean
    cardRect?: DOMRect | null
    onMouseEnter?: () => void
    onMouseLeave?: () => void
}

interface CustomerData {
    phone?: string
    email?: string
    tags?: string[]
    isFirstTime?: boolean
    hasIncompleteData?: boolean
}

export function AppointmentTooltip({
    appointment,
    employee,
    isVisible,
    cardRect,
    onMouseEnter,
    onMouseLeave
}: AppointmentTooltipProps) {
    const [customerData, setCustomerData] = useState<CustomerData | null>(null)
    const [position, setPosition] = useState<'top' | 'bottom'>('bottom')

    // Buscar dados do cliente
    useEffect(() => {
        if (!isVisible || !appointment.customerId) {
            setCustomerData(null)
            return
        }

        const fetchCustomerData = async () => {
            const supabase = getSupabaseBrowserClient()
            if (!supabase) return

            const { data } = await supabase
                .from('customers')
                .select('phone, email')
                .eq('id', appointment.customerId)
                .single()

            if (data) {
                setCustomerData({
                    phone: data.phone,
                    email: data.email,
                    tags: [], // TODO: buscar tags quando implementar
                    isFirstTime: false, // TODO: calcular baseado em histórico
                    hasIncompleteData: !data.phone || !data.email,
                })
            }
        }

        fetchCustomerData()
    }, [isVisible, appointment.customerId])

    // Calcular posição do tooltip (acima ou abaixo do card)
    useEffect(() => {
        if (!cardRect) return

        const spaceBelow = window.innerHeight - cardRect.bottom
        const spaceAbove = cardRect.top

        // Se tem mais espaço embaixo, abre para baixo
        setPosition(spaceBelow > spaceAbove ? 'bottom' : 'top')
    }, [cardRect])

    if (!isVisible) return null

    const startTime = format(appointment.startDate, 'HH:mm')
    const endTime = appointment.endAt
        ? format(new Date(appointment.endAt), 'HH:mm')
        : format(new Date(appointment.startDate.getTime() + (appointment.durationMinutes || 60) * 60000), 'HH:mm')

    const whatsappLink = customerData?.phone
        ? `https://wa.me/55${customerData.phone.replace(/\D/g, '')}`
        : null

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: position === 'bottom' ? -10 : 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: position === 'bottom' ? -10 : 10 }}
                    transition={{ duration: 0.15 }}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    className={`absolute left-1/2 -translate-x-1/2 z-50 ${
                        position === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'
                    }`}
                    style={{
                        width: '280px',
                    }}
                >
                    {/* Seta */}
                    <div
                        className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 ${
                            position === 'bottom'
                                ? '-top-2 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white dark:border-b-zinc-800'
                                : '-bottom-2 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white dark:border-t-zinc-800'
                        }`}
                    />

                    {/* Conteúdo do balão */}
                    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-2xl border border-gray-200 dark:border-zinc-700 p-4 space-y-3">
                        {/* Nome do cliente */}
                        <div>
                            <h3 className="font-bold text-sm uppercase text-gray-900 dark:text-white">
                                {appointment.customerName || 'Cliente'}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                {startTime} - {endTime}
                            </p>
                        </div>

                        {/* Telefone + WhatsApp */}
                        {customerData?.phone && (
                            <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                                <Phone className="w-3.5 h-3.5 text-gray-500" />
                                <span>{customerData.phone}</span>
                                {whatsappLink && (
                                    <a
                                        href={whatsappLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-auto pointer-events-auto"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <MessageCircle className="w-4 h-4 text-green-600 hover:text-green-700 transition-colors" />
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Profissional */}
                        {employee && (
                            <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                                <User className="w-3.5 h-3.5 text-gray-500" />
                                <span>{employee.fullName}</span>
                            </div>
                        )}

                        {/* Serviço */}
                        {(appointment.service?.name || appointment.serviceName) && (
                            <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                                <Scissors className="w-3.5 h-3.5 text-gray-500" />
                                <span>{appointment.service?.name || appointment.serviceName}</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
