"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
    PlusCircle,
    CalendarPlus,
    Users,
    DollarSign,
    ShoppingBag,
    Sparkles,
    ArrowRight
} from "lucide-react"

const actions = [
    {
        icon: CalendarPlus,
        label: "Novo Agendamento",
        description: "Reserve um horário manualmente para o cliente no balcão.",
        href: "/agenda",
        accent: "from-primary to-purple-500"
    },
    {
        icon: Users,
        label: "Cadastrar Cliente",
        description: "Inclua clientes recorrentes e mantenha o CRM atualizado.",
        href: "/clientes",
        accent: "from-emerald-500 to-teal-400"
    },
    {
        icon: DollarSign,
        label: "Lançar Venda / PDV",
        description: "Abra o PDV para registrar um pagamento presencial.",
        href: "/financeiro",
        accent: "from-amber-500 to-orange-500"
    },
    {
        icon: ShoppingBag,
        label: "Gerenciar Loja",
        description: "Atualize produtos, kits e disponibilidade para retirada.",
        href: "/estoque",
        accent: "from-pink-500 to-rose-500"
    }
]

export function QuickActions() {
    return (
        <Card className="rounded-[2rem] border-none shadow-sm bg-white dark:bg-zinc-900 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 mb-1">Atalhos Operacionais</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">O que você precisa fazer agora?</h3>
                </div>
                <Button variant="ghost" className="gap-2 text-xs font-bold uppercase tracking-widest">
                    <PlusCircle className="w-4 h-4" />
                    Criar fluxo
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {actions.map((action, index) => {
                    const Icon = action.icon
                    return (
                        <motion.div
                            key={action.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link href={action.href} className="block">
                                <div className="group h-full rounded-[1.75rem] border border-slate-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 p-5 shadow-sm hover:shadow-xl transition-all">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center mb-4 shadow-lg shadow-black/10",
                                        action.accent
                                    )}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-base font-black text-slate-900 dark:text-white">{action.label}</p>
                                        <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">{action.description}</p>
                                    </div>
                                    <Button variant="ghost" className="mt-4 pl-0 text-xs font-bold uppercase tracking-widest text-primary">
                                        Acessar
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </Link>
                        </motion.div>
                    )
                })}
            </div>
        </Card>
    )
}



