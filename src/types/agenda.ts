import type { AppointmentStatus } from "./catalog"

export type GridSize = 'PP' | 'P' | 'M' | 'G'

export interface AgendaFilters {
    selectedEmployees: string[]  // IDs dos profissionais ou ["all"]
    selectedServiceCategories: string[]  // IDs das categorias ou ["all"]
    selectedStatuses: AppointmentStatus[]  // Array de status
    accountClosure: 'open' | 'closed'
    gridSize: {
        row: GridSize  // Altura das linhas
        column: GridSize  // Largura das colunas
    }
    showAbsences: boolean
}

export const ROW_HEIGHTS: Record<GridSize, string> = {
    PP: '40px',   // Extra compacto
    P: '60px',    // Compacto
    M: '80px',    // Médio - bom para 30min (40px)
    G: '100px',   // Grande
}

export const COLUMN_WIDTHS: Record<GridSize, string> = {
    PP: '140px',
    P: '160px',
    M: '180px',  // padrão atual
    G: '220px',
}

export const DEFAULT_FILTERS: AgendaFilters = {
    selectedEmployees: ['all'],
    selectedServiceCategories: ['all'],
    selectedStatuses: [],
    accountClosure: 'open',
    gridSize: {
        row: 'M',  // Médio - bom equilíbrio (70px)
        column: 'M',
    },
    showAbsences: true,
}
