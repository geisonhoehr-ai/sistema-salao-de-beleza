"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
    ArrowLeft,
    Plus,
    Gift,
    Copy,
    Trash2,
    Calendar,
    Percent,
    Users,
    Check,
} from "lucide-react"
import { useTenant } from "@/contexts/tenant-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface Coupon {
    id: string
    code: string
    discount: number
    type: 'percent' | 'fixed'
    usageLimit: number
    usageCount: number
    expiresAt: string
    active: boolean
}

export default function CuponsPage() {
    const { currentTenant } = useTenant()
    const params = useParams()
    const slug = params.tenantSlug as string

    const [coupons, setCoupons] = useState<Coupon[]>([
        {
            id: '1',
            code: 'BEMVINDO10',
            discount: 10,
            type: 'percent',
            usageLimit: 100,
            usageCount: 23,
            expiresAt: '2024-12-31',
            active: true,
        },
        {
            id: '2',
            code: 'PRIMEIRAVISITA',
            discount: 20,
            type: 'percent',
            usageLimit: 50,
            usageCount: 12,
            expiresAt: '2024-06-30',
            active: true,
        },
    ])

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discount: '',
        type: 'percent' as 'percent' | 'fixed',
        usageLimit: '',
        expiresAt: '',
    })

    const [copiedCode, setCopiedCode] = useState<string | null>(null)

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code)
        setCopiedCode(code)
        setTimeout(() => setCopiedCode(null), 2000)
    }

    const toggleCoupon = (id: string) => {
        setCoupons(prev => prev.map(c =>
            c.id === id ? { ...c, active: !c.active } : c
        ))
    }

    const deleteCoupon = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este cupom?')) {
            setCoupons(prev => prev.filter(c => c.id !== id))
        }
    }

    const createCoupon = () => {
        const coupon: Coupon = {
            id: Date.now().toString(),
            code: newCoupon.code.toUpperCase(),
            discount: Number(newCoupon.discount),
            type: newCoupon.type,
            usageLimit: Number(newCoupon.usageLimit) || 999,
            usageCount: 0,
            expiresAt: newCoupon.expiresAt,
            active: true,
        }
        setCoupons(prev => [...prev, coupon])
        setIsDialogOpen(false)
        setNewCoupon({ code: '', discount: '', type: 'percent', usageLimit: '', expiresAt: '' })
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/${slug}/marketing`}
                        className="w-10 h-10 rounded-lg border border-[#E2E8F0] flex items-center justify-center hover:bg-[#F8F9FF] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-[#64748b]" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">Cupons de Desconto</h2>
                        <p className="text-[#64748b] text-sm mt-0.5">Gerencie cupons promocionais</p>
                    </div>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-medium shadow-sm h-11 px-5">
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Cupom
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Gift className="w-5 h-5 text-[#F97316]" />
                                Criar Novo Cupom
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Código do Cupom</Label>
                                <Input
                                    value={newCoupon.code}
                                    onChange={(e) => setNewCoupon(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                    placeholder="Ex: BEMVINDO10"
                                    className="uppercase"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Desconto</Label>
                                    <Input
                                        type="number"
                                        value={newCoupon.discount}
                                        onChange={(e) => setNewCoupon(prev => ({ ...prev, discount: e.target.value }))}
                                        placeholder="10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Tipo</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant={newCoupon.type === 'percent' ? 'default' : 'outline'}
                                            onClick={() => setNewCoupon(prev => ({ ...prev, type: 'percent' }))}
                                            className={cn(
                                                "flex-1",
                                                newCoupon.type === 'percent' && "bg-[#F97316] hover:bg-[#EA580C]"
                                            )}
                                        >
                                            %
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={newCoupon.type === 'fixed' ? 'default' : 'outline'}
                                            onClick={() => setNewCoupon(prev => ({ ...prev, type: 'fixed' }))}
                                            className={cn(
                                                "flex-1",
                                                newCoupon.type === 'fixed' && "bg-[#F97316] hover:bg-[#EA580C]"
                                            )}
                                        >
                                            R$
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Limite de Uso</Label>
                                    <Input
                                        type="number"
                                        value={newCoupon.usageLimit}
                                        onChange={(e) => setNewCoupon(prev => ({ ...prev, usageLimit: e.target.value }))}
                                        placeholder="100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Validade</Label>
                                    <Input
                                        type="date"
                                        value={newCoupon.expiresAt}
                                        onChange={(e) => setNewCoupon(prev => ({ ...prev, expiresAt: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={createCoupon}
                                disabled={!newCoupon.code || !newCoupon.discount}
                                className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white"
                            >
                                Criar Cupom
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Coupons List */}
            <div className="space-y-4">
                {coupons.length === 0 ? (
                    <Card className="p-12 rounded-xl border border-[#E2E8F0] bg-white text-center">
                        <Gift className="w-12 h-12 text-[#E2E8F0] mx-auto mb-4" />
                        <h3 className="font-bold text-[#0F172A] mb-2">Nenhum cupom criado</h3>
                        <p className="text-sm text-[#64748b]">Crie seu primeiro cupom promocional</p>
                    </Card>
                ) : (
                    coupons.map((coupon) => (
                        <Card
                            key={coupon.id}
                            className={cn(
                                "p-5 rounded-xl border shadow-sm transition-all",
                                coupon.active
                                    ? "border-[#E2E8F0] bg-white"
                                    : "border-[#E2E8F0] bg-[#F8F9FF] opacity-60"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-14 h-14 rounded-xl flex items-center justify-center",
                                        coupon.active ? "bg-[#FFF7ED]" : "bg-[#F1F5F9]"
                                    )}>
                                        <Gift className={cn(
                                            "w-7 h-7",
                                            coupon.active ? "text-[#F97316]" : "text-[#94a3b8]"
                                        )} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-lg text-[#0F172A]">
                                                {coupon.code}
                                            </span>
                                            <button
                                                onClick={() => copyCode(coupon.code)}
                                                className="p-1 rounded hover:bg-[#F1F5F9] transition-colors"
                                            >
                                                {copiedCode === coupon.code ? (
                                                    <Check className="w-4 h-4 text-[#22C55E]" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-[#64748b]" />
                                                )}
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-[#64748b]">
                                            <span className="flex items-center gap-1">
                                                <Percent className="w-3 h-3" />
                                                {coupon.discount}{coupon.type === 'percent' ? '%' : ' R$'} de desconto
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {coupon.usageCount}/{coupon.usageLimit} usos
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                até {new Date(coupon.expiresAt).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Switch
                                        checked={coupon.active}
                                        onCheckedChange={() => toggleCoupon(coupon.id)}
                                        className="data-[state=checked]:bg-[#22C55E]"
                                    />
                                    <button
                                        onClick={() => deleteCoupon(coupon.id)}
                                        className="p-2 rounded-lg hover:bg-red-50 text-[#64748b] hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
