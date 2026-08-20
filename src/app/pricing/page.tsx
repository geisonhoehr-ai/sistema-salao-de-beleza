"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Check, Sparkles, Zap, Crown, Building2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const plans = [
    {
        id: "trial",
        name: "Trial Gratuito",
        icon: Sparkles,
        price: "R$ 0",
        period: "30 dias",
        description: "Experimente todas as funcionalidades",
        color: "from-gray-600 to-gray-700",
        features: [
            "Agenda ilimitada",
            "Até 3 profissionais",
            "Gestão de clientes",
            "Gestão de serviços",
            "Financeiro básico",
            "Suporte por email",
        ],
        limitations: ["Limitado a 30 dias"],
        cta: "Começar trial grátis",
        highlighted: false,
    },
    {
        id: "basic",
        name: "Basic",
        icon: Zap,
        price: "R$ 79",
        period: "por mês",
        description: "Ideal para pequenos negócios",
        color: "from-blue-600 to-blue-700",
        features: [
            "Tudo do Trial",
            "Até 5 profissionais",
            "Agendamento online",
            "Relatórios básicos",
            "Comissões automáticas",
            "Fechamento de caixa",
            "Suporte prioritário",
        ],
        cta: "Começar trial grátis",
        highlighted: false,
    },
    {
        id: "pro",
        name: "Pro",
        icon: Crown,
        price: "R$ 149",
        period: "por mês",
        description: "Para negócios em crescimento",
        color: "from-purple-600 to-blue-600",
        features: [
            "Tudo do Basic",
            "Profissionais ilimitados",
            "Múltiplas unidades",
            "Relatórios avançados",
            "API de integração",
            "Gestão de estoque",
            "Campanhas de marketing",
            "Suporte 24/7",
        ],
        cta: "Começar trial grátis",
        highlighted: true,
    },
    {
        id: "enterprise",
        name: "Enterprise",
        icon: Building2,
        price: "Personalizado",
        period: "",
        description: "Soluções customizadas",
        color: "from-gray-800 to-black",
        features: [
            "Tudo do Pro",
            "Infraestrutura dedicada",
            "SLA garantido",
            "Treinamento presencial",
            "Gerente de conta",
            "Customizações sob medida",
            "Migração assistida",
            "Auditoria e compliance",
        ],
        cta: "Falar com vendas",
        highlighted: false,
    },
]

export default function PricingPage() {
    const router = useRouter()
    const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")

    const handlePlanClick = (planId: string) => {
        if (planId === "enterprise") {
            // Redirecionar para contato/vendas (pode implementar depois)
            const mailtoLink = "mailto:vendas@tratto.app"
            window.open(mailtoLink, "_self")
        } else {
            // Todos os outros planos começam com trial grátis
            router.push("/register")
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950">
            {/* Background decorations */}
            <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 opacity-40" />
            <div className="fixed top-20 left-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="fixed top-40 right-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
            <div className="fixed bottom-20 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

            <div className="relative z-10">
                {/* Header */}
                <header className="border-b border-gray-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-gray-900 dark:text-white">Tratto</span>
                            </div>
                            <Button
                                variant="ghost"
                                onClick={() => router.push("/login")}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                Fazer login
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="pt-20 pb-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto px-4"
                    >
                        <Badge className="mb-6 bg-purple-100 text-purple-700 border-purple-200">
                            🎉 Trial gratuito de 30 dias em todos os planos
                        </Badge>
                        <h1 className="text-5xl sm:text-6xl font-black text-gray-900 dark:text-white mb-6">
                            Planos para cada{" "}
                            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                momento do seu negócio
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
                            Comece gratuitamente por 30 dias. Sem cartão de crédito. Cancele quando quiser.
                        </p>
                    </motion.div>
                </section>

                {/* Plans Grid */}
                <section className="pb-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {plans.map((plan, index) => (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                >
                                    <Card
                                        className={`relative p-8 h-full flex flex-col ${
                                            plan.highlighted
                                                ? "border-2 border-purple-500 shadow-2xl shadow-purple-500/20 scale-105"
                                                : "border border-gray-200 dark:border-zinc-800"
                                        } bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl hover:shadow-xl transition-all duration-300`}
                                    >
                                        {plan.highlighted && (
                                            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
                                                Mais Popular
                                            </Badge>
                                        )}

                                        <div className="flex-1">
                                            {/* Icon */}
                                            <div
                                                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}
                                            >
                                                <plan.icon className="w-6 h-6 text-white" />
                                            </div>

                                            {/* Name & Price */}
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                                {plan.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-zinc-400 mb-4">
                                                {plan.description}
                                            </p>
                                            <div className="mb-6">
                                                <span className="text-4xl font-black text-gray-900 dark:text-white">
                                                    {plan.price}
                                                </span>
                                                {plan.period && (
                                                    <span className="text-gray-600 dark:text-zinc-400 ml-2">
                                                        {plan.period}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Features */}
                                            <ul className="space-y-3 mb-6">
                                                {plan.features.map((feature, idx) => (
                                                    <li key={idx} className="flex items-start gap-3">
                                                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                        <span className="text-sm text-gray-700 dark:text-zinc-300">
                                                            {feature}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {plan.limitations && (
                                                <div className="mb-6">
                                                    {plan.limitations.map((limitation, idx) => (
                                                        <p key={idx} className="text-xs text-gray-500 dark:text-zinc-500">
                                                            {limitation}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* CTA Button */}
                                        <Button
                                            onClick={() => handlePlanClick(plan.id)}
                                            className={`w-full h-12 rounded-full font-semibold transition-all ${
                                                plan.highlighted
                                                    ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/30"
                                                    : "bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                                            }`}
                                        >
                                            {plan.cta}
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </Button>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-20 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
                            Perguntas Frequentes
                        </h2>
                        <div className="space-y-6">
                            <Card className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                                    Como funciona o trial gratuito?
                                </h3>
                                <p className="text-gray-600 dark:text-zinc-400">
                                    Você cria sua conta e tem 30 dias completos para usar TODAS as funcionalidades
                                    gratuitamente. Não pedimos cartão de crédito no cadastro.
                                </p>
                            </Card>
                            <Card className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                                    Posso cancelar quando quiser?
                                </h3>
                                <p className="text-gray-600 dark:text-zinc-400">
                                    Sim! Você pode cancelar sua assinatura a qualquer momento sem multas ou taxas.
                                </p>
                            </Card>
                            <Card className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                                    Posso mudar de plano depois?
                                </h3>
                                <p className="text-gray-600 dark:text-zinc-400">
                                    Claro! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. A
                                    cobrança será ajustada proporcionalmente.
                                </p>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Footer CTA */}
                <section className="py-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
                    >
                        <Card className="p-12 bg-gradient-to-br from-purple-600 to-blue-600 border-0 shadow-2xl">
                            <h2 className="text-4xl font-black text-white mb-4">
                                Pronto para transformar seu negócio?
                            </h2>
                            <p className="text-xl text-purple-100 mb-8">
                                Experimente grátis por 30 dias. Sem compromisso.
                            </p>
                            <Button
                                onClick={() => router.push("/register")}
                                size="lg"
                                className="h-14 px-8 rounded-full bg-white text-purple-600 hover:bg-gray-100 font-bold text-lg shadow-xl"
                            >
                                Começar agora grátis
                                <ArrowRight className="w-6 h-6 ml-2" />
                            </Button>
                        </Card>
                    </motion.div>
                </section>
            </div>
        </div>
    )
}
