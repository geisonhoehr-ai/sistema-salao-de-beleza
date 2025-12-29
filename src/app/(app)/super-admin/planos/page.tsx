"use client"

import { useRef, useState } from "react"
import { plans as initialPlans, type Plan } from "@/mocks/companies"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { FormDialog } from "@/components/ui/form-dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Check, Star, Edit, Trash2, Plus } from "lucide-react"

export default function PlanosPage() {
    const [plans, setPlans] = useState(initialPlans)
    const planIdCounter = useRef(initialPlans.length + 1)
    const [showNewPlan, setShowNewPlan] = useState(false)
    const [showEditPlan, setShowEditPlan] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: 0,
        maxEmployees: 1,
        maxAppointmentsPerMonth: 100,
        features: [] as string[],
        popular: false,
        billingCycle: 'monthly' as 'monthly' | 'yearly',
        status: 'active' as 'active' | 'inactive'
    })

    const [newFeature, setNewFeature] = useState("")

    const handleCreatePlan = () => {
        const newPlanId = `plan-${planIdCounter.current}`
        planIdCounter.current += 1
        const newPlan: Plan = {
            id: newPlanId,
            name: formData.name,
            description: formData.description,
            price: formData.price,
            maxEmployees: formData.maxEmployees,
            maxAppointmentsPerMonth: formData.maxAppointmentsPerMonth,
            features: formData.features,
            popular: formData.popular,
            billingCycle: formData.billingCycle,
            status: formData.status
        }

        setPlans([...plans, newPlan])
        setShowNewPlan(false)
        resetForm()
    }

    const handleEditPlan = () => {
        if (!selectedPlan) return

        setPlans(plans.map(p =>
            p.id === selectedPlan.id
                ? { ...p, ...formData }
                : p
        ))
        setShowEditPlan(false)
        resetForm()
    }

    const handleDeletePlan = (plan: Plan) => {
        setPlans(plans.filter(p => p.id !== plan.id))
        setShowConfirm(false)
    }

    const openEditDialog = (plan: Plan) => {
        setSelectedPlan(plan)
        setFormData({
            name: plan.name,
            description: plan.description,
            price: plan.price,
            maxEmployees: plan.maxEmployees,
            maxAppointmentsPerMonth: plan.maxAppointmentsPerMonth,
            features: [...plan.features],
            popular: plan.popular || false,
            billingCycle: plan.billingCycle,
            status: plan.status
        })
        setShowEditPlan(true)
    }

    const openDeleteDialog = (plan: Plan) => {
        setSelectedPlan(plan)
        setShowConfirm(true)
    }

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            price: 0,
            maxEmployees: 1,
            maxAppointmentsPerMonth: 100,
            features: [],
            popular: false,
            billingCycle: 'monthly',
            status: 'active'
        })
        setSelectedPlan(null)
    }

    const addFeature = () => {
        if (newFeature.trim()) {
            setFormData({ ...formData, features: [...formData.features, newFeature.trim()] })
            setNewFeature("")
        }
    }

    const removeFeature = (index: number) => {
        setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Planos</h2>
                    <p className="text-muted-foreground mt-1">
                        Gerencie os planos de assinatura da plataforma
                    </p>
                </div>
                <Button onClick={() => setShowNewPlan(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Plano
                </Button>
            </div>

            {/* Plans Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {plans.map((plan) => (
                    <Card key={plan.id} className={`rounded-2xl border-none shadow-sm backdrop-blur-md ${plan.popular ? 'ring-2 ring-primary bg-primary/5' : 'bg-white/60 dark:bg-zinc-900/60'}`}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                {plan.popular && (
                                    <Badge className="bg-primary text-white">
                                        <Star className="w-3 h-3 mr-1" />
                                        Popular
                                    </Badge>
                                )}
                            </div>
                            <CardDescription>{plan.description}</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold">R$ {plan.price}</span>
                                <span className="text-muted-foreground">/mês</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Limites:</p>
                                <ul className="space-y-1 text-sm">
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-600" />
                                        {plan.maxEmployees === -1 ? 'Funcionários ilimitados' : `Até ${plan.maxEmployees} funcionário(s)`}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-600" />
                                        {plan.maxAppointmentsPerMonth === -1 ? 'Agendamentos ilimitados' : `${plan.maxAppointmentsPerMonth} agendamentos/mês`}
                                    </li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Funcionalidades:</p>
                                <ul className="space-y-1 text-sm">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-green-600" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="pt-4 flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => openEditDialog(plan)}
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => openDeleteDialog(plan)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Excluir
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Modal Novo Plano */}
            <FormDialog
                open={showNewPlan}
                onOpenChange={setShowNewPlan}
                title="Novo Plano"
                description="Crie um novo plano de assinatura"
                onSubmit={handleCreatePlan}
                submitLabel="Criar Plano"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome do Plano</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Professional"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Preço Mensal (R$)</Label>
                            <Input
                                id="price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                placeholder="197"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Ideal para salões em crescimento"
                            rows={2}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="maxEmployees">Máx. Funcionários</Label>
                            <Input
                                id="maxEmployees"
                                type="number"
                                value={formData.maxEmployees}
                                onChange={(e) => setFormData({ ...formData, maxEmployees: Number(e.target.value) })}
                                placeholder="5"
                            />
                            <p className="text-xs text-muted-foreground">-1 para ilimitado</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxAppointments">Máx. Agendamentos/Mês</Label>
                            <Input
                                id="maxAppointments"
                                type="number"
                                value={formData.maxAppointmentsPerMonth}
                                onChange={(e) => setFormData({ ...formData, maxAppointmentsPerMonth: Number(e.target.value) })}
                                placeholder="500"
                            />
                            <p className="text-xs text-muted-foreground">-1 para ilimitado</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Funcionalidades</Label>
                        <div className="flex gap-2">
                            <Input
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                placeholder="Ex: Agendamento online"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                            />
                            <Button type="button" onClick={addFeature} size="sm">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        {formData.features.length > 0 && (
                            <ul className="space-y-1 mt-2">
                                {formData.features.map((feature, index) => (
                                    <li key={index} className="flex items-center justify-between text-sm bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded">
                                        <span>{feature}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFeature(index)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="popular"
                            checked={formData.popular}
                            onCheckedChange={(checked) => setFormData({ ...formData, popular: checked })}
                        />
                        <Label htmlFor="popular">Marcar como popular</Label>
                    </div>
                </div>
            </FormDialog>

            {/* Modal Editar Plano */}
            <FormDialog
                open={showEditPlan}
                onOpenChange={setShowEditPlan}
                title="Editar Plano"
                description={`Editando ${selectedPlan?.name}`}
                onSubmit={handleEditPlan}
                submitLabel="Salvar Alterações"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nome do Plano</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-price">Preço Mensal (R$)</Label>
                            <Input
                                id="edit-price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Descrição</Label>
                        <Textarea
                            id="edit-description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={2}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-maxEmployees">Máx. Funcionários</Label>
                            <Input
                                id="edit-maxEmployees"
                                type="number"
                                value={formData.maxEmployees}
                                onChange={(e) => setFormData({ ...formData, maxEmployees: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-maxAppointments">Máx. Agendamentos/Mês</Label>
                            <Input
                                id="edit-maxAppointments"
                                type="number"
                                value={formData.maxAppointmentsPerMonth}
                                onChange={(e) => setFormData({ ...formData, maxAppointmentsPerMonth: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Funcionalidades</Label>
                        <div className="flex gap-2">
                            <Input
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                placeholder="Ex: Agendamento online"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                            />
                            <Button type="button" onClick={addFeature} size="sm">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        {formData.features.length > 0 && (
                            <ul className="space-y-1 mt-2">
                                {formData.features.map((feature, index) => (
                                    <li key={index} className="flex items-center justify-between text-sm bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded">
                                        <span>{feature}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFeature(index)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="edit-popular"
                            checked={formData.popular}
                            onCheckedChange={(checked) => setFormData({ ...formData, popular: checked })}
                        />
                        <Label htmlFor="edit-popular">Marcar como popular</Label>
                    </div>
                </div>
            </FormDialog>

            {/* Confirm Delete */}
            {selectedPlan && (
                <ConfirmDialog
                    open={showConfirm}
                    onOpenChange={setShowConfirm}
                    title="Excluir Plano"
                    description={`Tem certeza que deseja excluir o plano "${selectedPlan.name}"? Esta ação não pode ser desfeita.`}
                    onConfirm={() => handleDeletePlan(selectedPlan)}
                    variant="destructive"
                    confirmLabel="Excluir"
                />
            )}
        </div>
    )
}
