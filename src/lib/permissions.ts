// Employee Permission System
// Based on common salon/clinic access control needs

export interface EmployeePermissions {
    // Agenda
    viewOwnSchedule: boolean       // Ver própria agenda
    viewAllSchedules: boolean      // Ver agenda de todos
    manageSchedule: boolean        // Criar/editar/cancelar agendamentos

    // Clientes
    viewClients: boolean           // Ver lista de clientes
    manageClients: boolean         // Criar/editar clientes

    // Serviços
    viewServices: boolean          // Ver serviços
    manageServices: boolean        // Criar/editar serviços

    // Financeiro
    viewOwnFinancials: boolean     // Ver próprias comissões
    viewAllFinancials: boolean     // Ver financeiro geral
    manageFinancials: boolean      // Registrar pagamentos, fechamento

    // Relatórios
    viewReports: boolean           // Acessar relatórios

    // Configurações
    viewSettings: boolean          // Ver configurações
    manageSettings: boolean        // Editar configurações

    // Profissionais
    viewEmployees: boolean         // Ver lista de profissionais
    manageEmployees: boolean       // Criar/editar profissionais

    // Estoque
    viewInventory: boolean         // Ver estoque
    manageInventory: boolean       // Gerenciar estoque

    // CRM
    viewCRM: boolean               // Ver CRM
    manageCRM: boolean             // Gerenciar CRM
}

// Predefined permission templates
export const PERMISSION_TEMPLATES = {
    // Administrador - acesso total
    admin: {
        viewOwnSchedule: true,
        viewAllSchedules: true,
        manageSchedule: true,
        viewClients: true,
        manageClients: true,
        viewServices: true,
        manageServices: true,
        viewOwnFinancials: true,
        viewAllFinancials: true,
        manageFinancials: true,
        viewReports: true,
        viewSettings: true,
        manageSettings: true,
        viewEmployees: true,
        manageEmployees: true,
        viewInventory: true,
        manageInventory: true,
        viewCRM: true,
        manageCRM: true,
    } as EmployeePermissions,

    // Gerente - quase tudo, exceto configurações sensíveis
    manager: {
        viewOwnSchedule: true,
        viewAllSchedules: true,
        manageSchedule: true,
        viewClients: true,
        manageClients: true,
        viewServices: true,
        manageServices: true,
        viewOwnFinancials: true,
        viewAllFinancials: true,
        manageFinancials: true,
        viewReports: true,
        viewSettings: true,
        manageSettings: false,
        viewEmployees: true,
        manageEmployees: false,
        viewInventory: true,
        manageInventory: true,
        viewCRM: true,
        manageCRM: true,
    } as EmployeePermissions,

    // Profissional padrão - agenda própria e clientes
    professional: {
        viewOwnSchedule: true,
        viewAllSchedules: false,
        manageSchedule: true,
        viewClients: true,
        manageClients: true,
        viewServices: true,
        manageServices: false,
        viewOwnFinancials: true,
        viewAllFinancials: false,
        manageFinancials: false,
        viewReports: false,
        viewSettings: false,
        manageSettings: false,
        viewEmployees: false,
        manageEmployees: false,
        viewInventory: false,
        manageInventory: false,
        viewCRM: false,
        manageCRM: false,
    } as EmployeePermissions,

    // Recepcionista - agenda e clientes, sem financeiro
    receptionist: {
        viewOwnSchedule: true,
        viewAllSchedules: true,
        manageSchedule: true,
        viewClients: true,
        manageClients: true,
        viewServices: true,
        manageServices: false,
        viewOwnFinancials: false,
        viewAllFinancials: false,
        manageFinancials: false,
        viewReports: false,
        viewSettings: false,
        manageSettings: false,
        viewEmployees: true,
        manageEmployees: false,
        viewInventory: false,
        manageInventory: false,
        viewCRM: true,
        manageCRM: false,
    } as EmployeePermissions,

    // Assistente - apenas visualização básica
    assistant: {
        viewOwnSchedule: true,
        viewAllSchedules: true,
        manageSchedule: false,
        viewClients: true,
        manageClients: false,
        viewServices: true,
        manageServices: false,
        viewOwnFinancials: true,
        viewAllFinancials: false,
        manageFinancials: false,
        viewReports: false,
        viewSettings: false,
        manageSettings: false,
        viewEmployees: true,
        manageEmployees: false,
        viewInventory: true,
        manageInventory: false,
        viewCRM: false,
        manageCRM: false,
    } as EmployeePermissions,
}

// Permission labels for UI
export const PERMISSION_LABELS: Record<keyof EmployeePermissions, { label: string; description: string; category: string }> = {
    viewOwnSchedule: { label: 'Ver própria agenda', description: 'Visualizar seus próprios agendamentos', category: 'Agenda' },
    viewAllSchedules: { label: 'Ver todas as agendas', description: 'Visualizar agendamentos de todos os profissionais', category: 'Agenda' },
    manageSchedule: { label: 'Gerenciar agendamentos', description: 'Criar, editar e cancelar agendamentos', category: 'Agenda' },

    viewClients: { label: 'Ver clientes', description: 'Visualizar lista e dados de clientes', category: 'Clientes' },
    manageClients: { label: 'Gerenciar clientes', description: 'Criar e editar cadastros de clientes', category: 'Clientes' },

    viewServices: { label: 'Ver serviços', description: 'Visualizar catálogo de serviços', category: 'Serviços' },
    manageServices: { label: 'Gerenciar serviços', description: 'Criar e editar serviços', category: 'Serviços' },

    viewOwnFinancials: { label: 'Ver próprio financeiro', description: 'Visualizar suas comissões e ganhos', category: 'Financeiro' },
    viewAllFinancials: { label: 'Ver financeiro geral', description: 'Visualizar todo o financeiro da empresa', category: 'Financeiro' },
    manageFinancials: { label: 'Gerenciar financeiro', description: 'Registrar pagamentos e fazer fechamento', category: 'Financeiro' },

    viewReports: { label: 'Ver relatórios', description: 'Acessar relatórios e análises', category: 'Relatórios' },

    viewSettings: { label: 'Ver configurações', description: 'Visualizar configurações da empresa', category: 'Configurações' },
    manageSettings: { label: 'Gerenciar configurações', description: 'Alterar configurações da empresa', category: 'Configurações' },

    viewEmployees: { label: 'Ver profissionais', description: 'Visualizar lista de profissionais', category: 'Profissionais' },
    manageEmployees: { label: 'Gerenciar profissionais', description: 'Criar e editar profissionais', category: 'Profissionais' },

    viewInventory: { label: 'Ver estoque', description: 'Visualizar produtos em estoque', category: 'Estoque' },
    manageInventory: { label: 'Gerenciar estoque', description: 'Adicionar e editar produtos', category: 'Estoque' },

    viewCRM: { label: 'Ver CRM', description: 'Visualizar funil e campanhas', category: 'CRM' },
    manageCRM: { label: 'Gerenciar CRM', description: 'Criar campanhas e gerenciar leads', category: 'CRM' },
}

// Template labels for UI
export const TEMPLATE_LABELS: Record<keyof typeof PERMISSION_TEMPLATES, { label: string; description: string }> = {
    admin: { label: 'Administrador', description: 'Acesso total a todas as funcionalidades' },
    manager: { label: 'Gerente', description: 'Acesso amplo, exceto configurações sensíveis' },
    professional: { label: 'Profissional', description: 'Agenda própria, clientes e comissões' },
    receptionist: { label: 'Recepcionista', description: 'Agenda de todos e clientes, sem financeiro' },
    assistant: { label: 'Assistente', description: 'Apenas visualização básica' },
}

// Default permissions for new employees
export const DEFAULT_PERMISSIONS: EmployeePermissions = PERMISSION_TEMPLATES.professional

// Group permissions by category for UI
export function getPermissionsByCategory(): Record<string, (keyof EmployeePermissions)[]> {
    const categories: Record<string, (keyof EmployeePermissions)[]> = {}

    for (const [key, value] of Object.entries(PERMISSION_LABELS)) {
        const permKey = key as keyof EmployeePermissions
        if (!categories[value.category]) {
            categories[value.category] = []
        }
        categories[value.category].push(permKey)
    }

    return categories
}
