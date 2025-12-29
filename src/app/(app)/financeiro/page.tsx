"use client"

import { motion } from "framer-motion"
import {
    ArrowDownRight,
    ArrowUpRight,
    CreditCard,
    DollarSign,
    Download,
    Filter,
    Handshake,
    Info,
    Search,
    Smartphone,
    TrendingDown,
    TrendingUp,
    Users,
    Wallet
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useTenant } from "@/contexts/tenant-context"
import { PdvQuickHub } from "@/components/PdvQuickHub"

export default function FinanceiroPage() {
    const { currentTenant } = useTenant()
    // Mock financial data
    const summary = {
        totalRevenue: 12450.00,
        pending: 1200.00,
        commissions: 4357.50,
        netProfit: 8092.50,
        growth: "+12.5%"
    }

    const transactions = [
        { id: 1, customer: "Alice Silva", service: "Mechas Premium", amount: 450.00, method: "Cartão", date: "2025-12-27", status: "completed" },
        { id: 2, customer: "Bruno Oliveira", service: "Corte Masculino", amount: 80.00, method: "Pix", date: "2025-12-27", status: "completed" },
        { id: 3, customer: "Carla Souza", service: "Manicure & Pedicure", amount: 120.00, method: "Local", date: "2025-12-26", status: "pending" },
        { id: 4, customer: "Douglas Lima", service: "Progressiva", amount: 350.00, method: "Pix", date: "2025-12-26", status: "completed" },
        { id: 5, customer: "Elena Mendes", service: "Coloração", amount: 200.00, method: "Cartão", date: "2025-12-25", status: "completed" },
    ]

    const transactionIconMap = {
        Pix: Smartphone,
        "Cartão": CreditCard,
        Local: Handshake,
    }

    const staffCommissions = [
        { name: "Ana Paula", role: "Cabeleireira", total: 1850.00, count: 24, commission: "35%" },
        { name: "Marcos Viana", role: "Barbeiro", total: 1200.00, count: 32, commission: "40%" },
        { name: "Leticia Paz", role: "Manicure", total: 850.00, count: 45, commission: "30%" },
    ]

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-6 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Financeiro</h1>
                    <p className="text-slate-500 dark:text-zinc-400 font-medium">Controle seu fluxo de caixa e comissões.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Button variant="outline" className="rounded-xl border-slate-200 dark:border-zinc-800 w-full md:w-auto">
                        <Download className="w-4 h-4 mr-2" /> Exportar PDF
                    </Button>
                    <Button className="rounded-xl bg-primary text-white font-bold w-full md:w-auto">
                        Gerar Relatório Completo
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
            >
                <motion.div variants={itemVariants}>
                    <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-primary text-white relative overflow-hidden h-full">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
                        <div className="relative z-10 space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Faturamento Total</p>
                                <h2 className="text-2xl font-black">R$ {summary.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-bold text-emerald-300">
                                <ArrowUpRight className="w-3 h-3" /> {summary.growth} este mês
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-white dark:bg-zinc-900 h-full">
                        <div className="space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Lucro Líquido</p>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">R$ {summary.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Após descontar comissões</p>
                        </div>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-white dark:bg-zinc-900 h-full">
                        <div className="space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Comissões</p>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">R$ {summary.commissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase">
                                <Info className="w-3 h-3" /> Ver Detalhamento
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-white dark:bg-zinc-900 h-full">
                        <div className="space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Pendentes</p>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">R$ {summary.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                            </div>
                            <Badge className="bg-amber-500/10 text-amber-600 border-none font-bold text-[10px] uppercase">
                                Pagamentos locais
                            </Badge>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>

            <div className="rounded-[2rem] border border-black/5 dark:border-white/5 bg-white/70 dark:bg-zinc-900/70 backdrop-blur p-4 sm:p-6">
                <PdvQuickHub tenantId={currentTenant.id} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Transactions Table */}
                <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Últimas Transações</h3>
                            <p className="text-slate-500 text-xs">Acompanhamento em tempo real das vendas.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="rounded-xl bg-slate-50 dark:bg-zinc-800">
                                <Search className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-xl bg-slate-50 dark:bg-zinc-800">
                                <Filter className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {transactions.map((tx) => {
                            const MethodIcon = transactionIconMap[tx.method as keyof typeof transactionIconMap] || Wallet
                            return (
                                <div
                                    key={tx.id}
                                    className="flex items-center justify-between p-4 rounded-3xl border border-slate-50 dark:border-zinc-800 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center",
                                                tx.method === 'Pix'
                                                    ? "bg-emerald-500/10 text-emerald-500"
                                                    : tx.method === 'Cartão'
                                                        ? "bg-blue-500/10 text-blue-500"
                                                        : "bg-slate-500/10 text-slate-500"
                                            )}
                                        >
                                            <MethodIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white">{tx.customer}</h4>
                                            <p className="text-xs text-slate-400 font-medium">{tx.service} • {tx.method}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-900 dark:text-white">
                                            R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                        <Badge
                                            className={cn(
                                                "font-bold text-[10px] uppercase px-2 py-0.5 rounded-full border-none",
                                                tx.status === 'completed'
                                                    ? "bg-emerald-500/10 text-emerald-500"
                                                    : "bg-amber-500/10 text-amber-500"
                                            )}
                                        >
                                            {tx.status === 'completed' ? 'Recebido' : 'Pendente'}
                                        </Badge>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <Button variant="ghost" className="w-full mt-6 rounded-2xl font-bold text-slate-400">
                        Ver todo o histórico de transações
                    </Button>
                </Card>

                {/* Staff Commissions List */}
                <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-6 sm:p-8 space-y-8">
                    <div>
                        <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Comissões</h3>
                        <p className="text-slate-500 text-xs">Total a pagar por profissional.</p>
                    </div>

                    <div className="space-y-6">
                        {staffCommissions.map((staff, i) => (
                            <div key={i} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-black text-slate-400">
                                            {staff.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{staff.name}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{staff.role}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-900 dark:text-white text-sm">R$ {staff.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                        <p className="text-[10px] font-bold text-primary uppercase">{staff.commission}</p>
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-slate-50 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary"
                                        style={{ width: `${(staff.total / 2000) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 space-y-4">
                        <Button className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-zinc-800 text-white font-bold hover:bg-slate-800">
                            Realizar Todos os Pagamentos
                        </Button>
                        <p className="text-[10px] text-center text-slate-400 font-medium">
                            Os pagamentos serão liquidados via transferência vinculada.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    )
}
