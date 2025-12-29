import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getInitials(value: string, maxCharacters = 2) {
    if (!value) return ""
    const parts = value.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return value.slice(0, maxCharacters).toUpperCase()
    const initials = parts.map((part) => part[0]?.toUpperCase() ?? "")
    const joined = initials.join("")
    return joined.slice(0, maxCharacters) || value.slice(0, maxCharacters).toUpperCase()
}
