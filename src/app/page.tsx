import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Shield, Zap, Users, Database, Smartphone, BarChart2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const heroStats = [
  { label: "Empresas ativas", value: "320+" },
  { label: "Clientes gerenciados", value: "58k" },
  { label: "Automatizações por mês", value: "42k" },
]

const modules = [
  {
    title: "Super Admin completo",
    description: "Planos, billing, auditoria, suporte e playbooks para gerir centenas de salões.",
    icon: Shield,
    features: ["Cobranças e dunning", "Logs & auditoria", "Centro de suporte integrado"],
  },
  {
    title: "CRM com inteligência",
    description: "Segmentação dinâmica, campanhas e automações em poucos cliques.",
    icon: Users,
    features: ["Etiquetas inteligentes", "Campanhas salvas", "Importação/Exportação"],
  },
  {
    title: "Agenda & PDV",
    description: "Timeline unificada, PDV rápido e visão em tempo real do faturamento.",
    icon: Zap,
    features: ["Timeline ao vivo", "PDV omnichannel", "Metas e comissões"],
  },
  {
    title: "Portal público + profissional",
    description: "Booking, loja e painel mobile-first para equipes e clientes.",
    icon: Smartphone,
    features: ["Loja com combos", "Portal do profissional", "Login do cliente completo"],
  },
]

const plans = [
  {
    name: "Essencial",
    price: "R$ 199",
    description: "Ideal para salões em crescimento.",
    highlights: ["Agenda inteligente", "CRM básico", "Portal público"],
    cta: "Começar agora",
  },
  {
    name: "Pro",
    price: "R$ 349",
    description: "Tudo que você precisa para escalar.",
    highlights: ["Automations e playbooks", "Super Admin completo", "PDV & loja"],
    featured: true,
    cta: "Agendar demo",
  },
]

const testimonials = [
  {
    name: "Paula Andrade",
    company: "Studio Brunette",
    quote: "Conectamos 5 unidades em 1 semana. Playbooks e dunning salvaram nosso financeiro.",
  },
  {
    name: "Diego Lopes",
    company: "Barber Lab",
    quote: "Portal profissional mobile reduziu o no-show em 32%.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="max-w-6xl mx-auto px-6 py-16 space-y-24">
        {/* Hero */}
        <section className="text-center space-y-6">
          <Badge variant="secondary" className="rounded-full px-4 py-1 text-xs uppercase tracking-[0.3em] text-slate-900">
            SaaS para salões e clínicas
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black leading-tight">
            Sistema completo para escalar <span className="text-teal-300">salões, spas e clínicas</span>.
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
            Super Admin, CRM, agenda, PDV, portais e automações em um único stack preparado para multiunidades.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="rounded-full px-6 py-6 text-base gap-2">
              Agendar tour guiado <ArrowRight className="w-4 h-4" />
            </Button>
            <Link href="/login">
              <Button size="lg" variant="outline" className="rounded-full px-6 py-6 text-base border-white/20 text-white">
                Entrar na plataforma
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 pt-8">
            {heroStats.map(stat => (
              <div key={stat.label} className="text-left">
                <p className="text-3xl font-black">{stat.value}</p>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Modules */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black">Tudo em um único ambiente</h2>
            <Badge className="rounded-full bg-teal-500/10 text-teal-300 border-teal-500/20 gap-2">
              <Sparkles className="w-3 h-3" /> Lançamentos semanais
            </Badge>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {modules.map(module => {
              const Icon = module.icon
              return (
                <Card key={module.title} className="bg-slate-900/80 border-white/5">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-teal-300" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black">{module.title}</h3>
                        <p className="text-sm text-slate-400">{module.description}</p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-300">
                      {module.features.map(feature => (
                        <li key={feature} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-300" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Plans */}
        <section className="space-y-8">
          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-teal-400">Planos</p>
            <h2 className="text-3xl font-black">Preços para cada estágio de crescimento</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map(plan => (
              <Card key={plan.name} className={cn("border-white/5 bg-slate-900/70", plan.featured && "border-teal-500/40")}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{plan.name}</p>
                      <p className="text-3xl font-black text-white">{plan.price} <span className="text-base font-medium text-slate-400">/mês</span></p>
                    </div>
                    {plan.featured && (
                      <Badge className="rounded-full bg-teal-500 text-slate-900">Mais pedido</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-400">{plan.description}</p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {plan.highlights.map(item => (
                      <li key={item} className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-teal-300" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button className={cn("w-full rounded-full", plan.featured && "bg-teal-400 text-slate-900 hover:bg-teal-300/90")}>
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black">Quem já usa não volta atrás</h2>
            <Badge className="bg-white/10 border-white/20 text-white rounded-full">NPS 92</Badge>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map(testimonial => (
              <Card key={testimonial.name} className="bg-slate-900/70 border-white/5">
                <CardContent className="space-y-4 p-6">
                  <p className="text-sm text-slate-300 italic">
                    “{testimonial.quote}”
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-[0.3em]">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-[40px] border border-white/10 bg-gradient-to-r from-teal-400 to-slate-900 p-10 text-slate-900 space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-900/80">Pronto para escalar</p>
          <h2 className="text-3xl font-black">Vamos migrar sua operação em até 7 dias.</h2>
          <p className="text-sm text-slate-800 max-w-2xl">
            Nossa equipe conecta seus dados atuais, configura playbooks e entrega a plataforma pronta para uso.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button className="rounded-full bg-slate-900 text-white hover:bg-slate-900/90">
              Falar com especialistas
            </Button>
            <Button variant="outline" className="rounded-full border-slate-900 text-slate-900">
              Ver documentação técnica
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
