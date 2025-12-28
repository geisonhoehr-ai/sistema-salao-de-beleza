"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, Wallet, BarChart2, Download } from "lucide-react"

const mockEntries = [
    { id: "1", description: "Corte + escova", amount: 120, type: "comissao", date: "Hoje, 09:40" },
    { id: "2", description: "Recompensa upsell", amount: 50, type: "bonus", date: "Hoje, 10:15" },
    { id: "3", description: "Venda produto", amount: 80, type: "comissao", date: "Ontem, 17:30" },
]

export default function ProfissionalFinanceiroPage() {
    return (
        <div className="space-y-6 pb-20">
            <header className="space-y-1">
                <p className="text-xs uppercase tracking-[0.3em] text-primary/60">Financeiro</p>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Minhas comissões</h1>
                <p className="text-sm text-muted-foreground">Acompanhe recebíveis, bônus e retiradas.</p>
            </header>

            <section className="grid gap-4 sm:grid-cols-2">
                <Card className="rounded-2xl border-none shadow-sm bg-white/70 dark:bg-zinc-900/70">
                    <CardContent className="py-6 space-y-2">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">Saldo disponível</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">R$ 620,00</p>
                        <p className="text-xs text-muted-foreground">Próxima liberação em 3 dias</p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-none shadow-sm bg-white/70 dark:bg-zinc-900/70">
                    <CardContent className="py-6 space-y-2">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">Comissão mês</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">R$ 4.320</p>
                        <Progress value={72} className="h-1.5" />
                        <p className="text-xs text-muted-foreground">72% da meta mensal</p>
                    </CardContent>
                </Card>
            </section>

            <Card className="rounded-[2rem] border-none shadow-sm bg-white/80 dark:bg-zinc-900/70">
                <CardHeader className="flex flex-col gap-1">
                    <CardTitle>Entradas recentes</CardTitle>
                    <p className="text-sm text-muted-foreground">Serviços finalizados e bônus aplicados</p>
                </CardHeader>
                <CardContent className="space-y-3">
                    {mockEntries.map(entry => (
                        <div key={entry.id} className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{entry.description}</p>
                                <p className="text-xs text-muted-foreground">{entry.date}</p>
                            </div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">+ R$ {entry.amount}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-none shadow-sm bg-white/80 dark:bg-zinc-900/70">
                <CardHeader>
                    <CardTitle>Retiradas & ações</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                    <Button className="h-12 rounded-2xl gap-2">
                        <DollarSign className="w-4 h-4" />
                        Solicitar retirada
                    </Button>
                    <Button variant="outline" className="h-12 rounded-2xl gap-2">
                        <Download className="w-4 h-4" />
                        Exportar extrato
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

