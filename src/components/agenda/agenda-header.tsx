"use client"

import { memo } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Menu, Plus, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AgendaHeaderProps {
    currentDate: Date
    onDateChange: (date: Date) => void
    onToggleSidebar: () => void
    onNewAppointment: () => void
    sidebarOpen: boolean
    searchQuery: string
    onSearchChange: (query: string) => void
    totalAppointments?: number
    filteredCount?: number
}

export const AgendaHeader = memo(function AgendaHeader({
    currentDate,
    onDateChange,
    onToggleSidebar,
    onNewAppointment,
    sidebarOpen,
    searchQuery,
    onSearchChange,
}: AgendaHeaderProps) {
    const navigateDate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate)
        if (direction === 'next') {
            newDate.setDate(currentDate.getDate() + 1)
        } else {
            newDate.setDate(currentDate.getDate() - 1)
        }
        onDateChange(newDate)
    }

    const goToToday = () => {
        onDateChange(new Date())
    }

    const isToday = () => {
        const today = new Date()
        return currentDate.toDateString() === today.toDateString()
    }

    return (
        <div className="h-14 border-b border-[#E2E8F0] bg-white flex items-center px-3 sm:px-4 gap-2 sm:gap-3">
            {/* Botão toggle sidebar */}
            <Button
                variant="ghost"
                size="icon"
                onClick={onToggleSidebar}
                className="h-9 w-9 flex-shrink-0 text-[#64748b] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
            >
                <Menu className="h-4 w-4" />
            </Button>

            {/* Navegação de data */}
            <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateDate('prev')}
                    className="h-8 w-8 text-[#64748b] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <button
                    onClick={goToToday}
                    className="min-w-[120px] sm:min-w-[150px] text-center px-3 py-1.5 rounded-md hover:bg-[#F1F5F9] transition-colors"
                >
                    <div className="text-sm font-semibold text-[#0F172A] leading-tight">
                        {format(currentDate, "d 'de' MMMM", { locale: ptBR })}
                    </div>
                    <div className="text-[11px] text-[#64748b] leading-tight capitalize hidden sm:block">
                        {isToday() ? 'Hoje' : format(currentDate, "EEEE", { locale: ptBR })}
                    </div>
                </button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateDate('next')}
                    className="h-8 w-8 text-[#64748b] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Campo de busca */}
            <div className="hidden md:flex flex-1 max-w-sm">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                onSearchChange('')
                            }
                        }}
                        placeholder="Buscar cliente..."
                        className="pl-9 pr-9 h-9 text-sm rounded-md border-[#E2E8F0] focus:border-[#0D9488] focus:ring-[#0D9488]"
                    />
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onSearchChange('')}
                            className="absolute right-0.5 top-1/2 -translate-y-1/2 h-8 w-8 text-[#94a3b8] hover:text-[#64748b]"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Spacer */}
            <div className="flex-1 md:hidden" />

            {/* Botão Agendar */}
            <Button
                onClick={onNewAppointment}
                className="h-9 px-3 sm:px-4 text-sm rounded-md bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium flex-shrink-0 shadow-sm"
            >
                <Plus className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Novo Agendamento</span>
            </Button>
        </div>
    )
})
