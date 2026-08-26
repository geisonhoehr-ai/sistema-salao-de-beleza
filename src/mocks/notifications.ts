export interface Notification {
    id: string
    type: 'appointment' | 'payment' | 'system' | 'reminder'
    title: string
    message: string
    read: boolean
    createdAt: string
    link?: string
}

// Empty notifications - will be populated from database
export const notifications: Notification[] = []

