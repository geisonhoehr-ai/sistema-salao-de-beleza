"use client"

import { useState } from "react"
import { Shield, ChevronDown, ChevronUp } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    type EmployeePermissions,
    PERMISSION_TEMPLATES,
    PERMISSION_LABELS,
    TEMPLATE_LABELS,
    getPermissionsByCategory,
} from "@/lib/permissions"
import { cn } from "@/lib/utils"

interface PermissionsManagerProps {
    permissions: EmployeePermissions
    onChange: (permissions: EmployeePermissions) => void
}

export function PermissionsManager({ permissions, onChange }: PermissionsManagerProps) {
    const [expandedCategories, setExpandedCategories] = useState<string[]>(['Agenda'])
    const [selectedTemplate, setSelectedTemplate] = useState<string>('')

    const categorizedPermissions = getPermissionsByCategory()

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        )
    }

    const handleTemplateChange = (templateKey: string) => {
        setSelectedTemplate(templateKey)
        if (templateKey && PERMISSION_TEMPLATES[templateKey as keyof typeof PERMISSION_TEMPLATES]) {
            onChange(PERMISSION_TEMPLATES[templateKey as keyof typeof PERMISSION_TEMPLATES])
        }
    }

    const handlePermissionChange = (key: keyof EmployeePermissions, value: boolean) => {
        setSelectedTemplate('') // Clear template when manually changing
        onChange({
            ...permissions,
            [key]: value,
        })
    }

    const categoryOrder = ['Agenda', 'Clientes', 'Serviços', 'Financeiro', 'Relatórios', 'Profissionais', 'Estoque', 'CRM', 'Configurações']

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="w-10 h-10 rounded-xl bg-[#0D9488]/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#0D9488]" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-[#0F172A]">Permissões de Acesso</h4>
                    <p className="text-xs text-[#64748b]">Defina o que este profissional pode acessar</p>
                </div>
            </div>

            {/* Template Selector */}
            <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-[#64748b]">
                    Aplicar Modelo
                </Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                    <SelectTrigger className="h-11 rounded-lg border-[#E2E8F0] bg-white">
                        <SelectValue placeholder="Selecione um modelo de permissões..." />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(TEMPLATE_LABELS).map(([key, { label, description }]) => (
                            <SelectItem key={key} value={key}>
                                <div className="flex flex-col">
                                    <span className="font-medium">{label}</span>
                                    <span className="text-xs text-[#64748b]">{description}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Permission Categories */}
            <div className="space-y-2">
                {categoryOrder.map(category => {
                    const permKeys = categorizedPermissions[category]
                    if (!permKeys) return null

                    const isExpanded = expandedCategories.includes(category)
                    const enabledCount = permKeys.filter(key => permissions[key]).length

                    return (
                        <div
                            key={category}
                            className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-white"
                        >
                            {/* Category Header */}
                            <button
                                type="button"
                                onClick={() => toggleCategory(category)}
                                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-[#0F172A]">{category}</span>
                                    <span className={cn(
                                        "text-xs px-2 py-0.5 rounded-full font-medium",
                                        enabledCount > 0
                                            ? "bg-[#0D9488]/10 text-[#0D9488]"
                                            : "bg-slate-100 text-slate-400"
                                    )}>
                                        {enabledCount}/{permKeys.length}
                                    </span>
                                </div>
                                {isExpanded
                                    ? <ChevronUp className="w-4 h-4 text-[#64748b]" />
                                    : <ChevronDown className="w-4 h-4 text-[#64748b]" />
                                }
                            </button>

                            {/* Permissions List */}
                            {isExpanded && (
                                <div className="px-4 pb-4 space-y-3 border-t border-[#E2E8F0]">
                                    {permKeys.map(permKey => {
                                        const { label, description } = PERMISSION_LABELS[permKey]
                                        return (
                                            <div
                                                key={permKey}
                                                className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0"
                                            >
                                                <div className="flex-1 pr-4">
                                                    <p className="text-sm font-medium text-[#0F172A]">{label}</p>
                                                    <p className="text-xs text-[#64748b]">{description}</p>
                                                </div>
                                                <Switch
                                                    checked={permissions[permKey]}
                                                    onCheckedChange={(checked) => handlePermissionChange(permKey, checked)}
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        const allEnabled = {} as EmployeePermissions
                        Object.keys(PERMISSION_LABELS).forEach(key => {
                            allEnabled[key as keyof EmployeePermissions] = true
                        })
                        onChange(allEnabled)
                        setSelectedTemplate('')
                    }}
                    className="text-xs"
                >
                    Marcar Todos
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        const allDisabled = {} as EmployeePermissions
                        Object.keys(PERMISSION_LABELS).forEach(key => {
                            allDisabled[key as keyof EmployeePermissions] = false
                        })
                        onChange(allDisabled)
                        setSelectedTemplate('')
                    }}
                    className="text-xs"
                >
                    Desmarcar Todos
                </Button>
            </div>
        </div>
    )
}
