"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { DollarSign, Wallet, BarChart2, Download, ArrowUpRight, ShieldCheck } from "lucide-react"

const mockEntries = [
    { id: "1", description: "Corte + escova", amount: 120, type: "comissao", date: "Hoje, 09:40" },
    { id: "2", description: "Recompensa upsell", amount: 50, type: "bonus", date: "Hoje, 10:15" },
    { id: "3", description: "Venda produto", amount: 80, type: "comissao", date: "Ontem, 17:30" },
]

const payouts = [
    { id: "pix", title: "Pix instantâneo", amount: "R$ 350", detail: "Saldo liberado", action: "Sacar agora" },
    { id: "agenda", title: "Agendado", amount: "R$ 1.200", detail: "Liberação em 03/01", action: "Ver parcelas" },
]

const insights = [
    { id: "upsell", title: "Bônus de upsell", value: "+R$ 80", detail: "2 serviços com upgrade hoje" },
    { id: "produtos", title: "Venda de produtos", value: "+R$ 150", detail: "Meta semanal 60% atingida" },
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

            <section className="grid gap-4 lg:grid-cols-3">
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
                        <CardTitle>Painel de retiradas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {payouts.map(item => (
                            <div key={item.id} className="rounded-2xl border border-slate-100 dark:border-zinc-800 p-4 flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs uppercase text-muted-foreground">{item.title}</p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">{item.amount}</p>
                                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                                </div>
                                <Button variant="ghost" className="rounded-full text-xs gap-1">
                                    {item.action}
                                    <ArrowUpRight className="w-3 h-3" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-sm bg-white/80 dark:bg-zinc-900/70">
                    <CardHeader>
                        <CardTitle>Insights rápidos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {insights.map(item => (
                            <div key={item.id} className="rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 p-3">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-lg font-black text-primary">{item.value}</p>
                                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </section>

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
                    <Button variant="secondary" className="h-12 rounded-2xl gap-2">
                        <Wallet className="w-4 h-4" />
                        Ver histórico
                    </Button>
                    <Button variant="ghost" className="h-12 rounded-2xl gap-2">
                        <BarChart2 className="w-4 h-4" />
                        Comparar metas
                    </Button>
                </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-none shadow-sm bg-white/80 dark:bg-zinc-900/70">
                <CardHeader>
                    <CardTitle>Proteção & conformidade</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            Dossiê fiscal atualizado
                        </p>
                        <p className="text-xs text-muted-foreground">Envie suas notas até sexta-feira</p>
                    </div>
                    <Button variant="ghost" className="rounded-full text-xs gap-1">
                        Ver orientações
                        <ArrowUpRight className="w-3 h-3" />
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}


