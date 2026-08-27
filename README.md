# Tratto

CRM e sistema de gestao para negocios de atendimento com agenda, equipe,
clientes, caixa e relacionamento no mesmo fluxo.

O Tratto nasceu de uma dor real de operacao: sistemas caros, pouco intuitivos e
com suporte distante da rotina de saloes, esmalterias, barbearias, clinicas e
studios. A proposta e entregar uma alternativa simples de operar, seria no
controle e preparada para integrar o que normalmente fica espalhado entre agenda,
WhatsApp, financeiro e historico do cliente.

## Visao do produto

Tratto organiza a jornada do atendimento do primeiro contato ao fechamento:

- agenda por profissional;
- cadastro de clientes e historico de atendimentos;
- cadastro de servicos, produtos, combos e pacotes;
- regras de comissao e fechamento financeiro;
- portal publico por negocio;
- onboarding de empresa, profissionais e permissoes;
- base para lembretes, retornos, campanhas e automacoes.

## Publico-alvo

- Saloes de beleza.
- Esmalterias.
- Barbearias.
- Clinicas de estetica.
- Studios de sobrancelha, cilios, maquiagem e cabelo.
- Negocios locais com agenda, recorrencia, equipe e caixa diario.

## Stack

- Next.js 16 com App Router.
- React 19.
- TypeScript.
- Tailwind CSS.
- Supabase para banco, autenticacao e storage.
- Radix UI, lucide-react, Recharts e Framer Motion.
- Resend para emails transacionais.

## Modulos principais

| Area | O que cobre |
| --- | --- |
| Landing | Apresentacao publica do Tratto e plano de teste |
| Autenticacao | Login, cadastro, callback, verificacao e recuperacao de senha |
| Multiempresa | Rotas por `tenantSlug` e isolamento por tenant |
| Dashboard | Resumo operacional do negocio |
| CRM | Clientes, filtros, segmentos, historico e relacao comercial |
| Agenda | Marcacoes, status, conclusao, cancelamentos e conflitos |
| Profissionais | Cadastro, permissoes, horarios, servicos e comissoes |
| Financeiro | Fechamento diario, pagamentos, comissoes e conferencia |
| Portal do cliente | Login, perfil, loja, agendamento e avaliacoes |
| Super admin | Acompanhamento da plataforma e empresas cadastradas |

## Ambiente local

### Pre-requisitos

- Node.js 20 ou superior.
- npm.
- Projeto Supabase configurado.

### Configuracao

```bash
npm install
cp .env.example .env.local
```

Preencha `.env.local` com as variaveis do Supabase e da aplicacao:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Nunca publique `.env.local` ou chaves `service_role`.

### Desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## Scripts

```bash
npm run dev      # servidor local
npm run build    # build de producao
npm run start    # executa build gerado
npm run lint     # validacao de lint
```

## Rotas uteis

| Rota | Uso |
| --- | --- |
| `/` | landing publica |
| `/login` | acesso de empresa/equipe |
| `/register` | cadastro de nova empresa |
| `/pricing` | planos |
| `/system/login` | acesso administrativo da plataforma |
| `/{tenantSlug}` | portal publico do negocio |
| `/{tenantSlug}/book` | agendamento online |
| `/{tenantSlug}/login` | login do cliente |
| `/dashboard` | painel operacional autenticado |
| `/crm` | gestao de clientes |
| `/financeiro` | financeiro e fechamento |
| `/profissional` | area do profissional |

## Banco de dados

Os arquivos SQL ficam em `supabase/`:

- `supabase/full_schema.sql` para referencia do schema completo.
- `supabase/migrations/` para evolucoes incrementais.
- `supabase/seed-*.sql` para dados de teste e demonstracao.

Consulte `SUPABASE_SETUP.md` antes de popular dados ou criar usuarios de teste.

## Padrao de produto

O Tratto deve parecer uma ferramenta operacional real: clara, rapida,
confiavel e sem excesso de promessa. A prioridade e paridade operacional antes
de recursos avancados.

Principios:

- clareza acima de enfeite;
- dados confiaveis para decidir;
- velocidade no atendimento diario;
- autonomia para o dono do negocio;
- linguagem simples, sem jargao de SaaS;
- usar "profissionais" quando o contexto envolver agenda, atendimento, servicos
  e comissoes.
