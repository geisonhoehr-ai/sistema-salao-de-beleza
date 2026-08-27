# Brief de UX mobile: referencia Trinks

Data: 2026-08-27
Origem: observacao do Oseias a partir da tela principal mobile do Trinks.

## Contexto

Oseias comparou a experiencia mobile atual do Tratto com a pagina principal do
Trinks no celular. A percepcao dele e que o Trinks esta mais facil de navegar
no mobile, principalmente por usar menu inferior fixo e uma pagina inicial com
acoes rapidas.

Este documento registra a referencia para implementacao futura com Claude Code.
Nao e uma decisao de copiar visualmente o Trinks; e uma direcao de UX para deixar
o Tratto mais nativo no celular e menos parecido com pagina web adaptada.

## Problema percebido

- A experiencia mobile do Tratto ainda parece "pagina de web".
- A navegacao principal exige mais deslocamento visual e mais esforco no celular.
- A home mobile precisa priorizar acoes frequentes, nao apenas layout bonito.
- O usuario operacional precisa chegar rapido em agenda, acoes, comissoes,
  clientes e opcoes.

## Referencia observada no Trinks

Pontos positivos da tela enviada:

- Menu inferior fixo com cinco entradas:
  - Inicio
  - Agenda
  - Acoes
  - Comissoes
  - Opcoes
- Item ativo bem claro, com fundo destacado.
- Acoes principais em cards horizontais no topo:
  - Ver minha trilha
  - Agendar cliente
  - Cadastrar cliente
- Cabecalho simples:
  - usuario;
  - unidade/empresa atual;
  - ajuda;
  - notificacoes.
- Conteudo dividido por blocos operacionais:
  - proximos compromissos;
  - comissao;
  - resumo do dia.
- Texto de estado vazio direto e util.
- Interface leve, com bastante area tocavel e pouca densidade no primeiro nivel.

## Direcao recomendada para o Tratto

Criar uma experiencia mobile-first para usuarios logados, com foco operacional.

### 1. Bottom navigation fixa

Adicionar uma navegacao inferior para mobile, visivel nas rotas autenticadas.

Sugestao inicial:

| Item | Destino provavel | Observacao |
| --- | --- | --- |
| Inicio | `/dashboard` | resumo do dia e atalhos |
| Agenda | rota de agenda | principal uso diario |
| Acoes | menu central de criacao rapida | novo cliente, agendamento, venda, servico |
| Financeiro | `/financeiro` ou comissoes por perfil | pode mudar por permissao |
| Opcoes | perfil, empresa, configuracoes e sair | evita menu lateral pesado no mobile |

Regra: no desktop, manter sidebar/topbar atual se ela estiver funcionando. A
bottom navigation deve ser prioridade para telas pequenas.

### 2. Home mobile operacional

A primeira tela no mobile deve responder rapidamente:

- o que tenho hoje;
- qual e a proxima acao;
- onde agendo;
- onde cadastro cliente;
- quanto tenho para conferir;
- se existe pendencia.

Blocos sugeridos:

- cabecalho com nome do usuario e negocio ativo;
- carrossel ou grade horizontal de acoes rapidas;
- proximos compromissos;
- pendencias do dia;
- comissao ou resumo financeiro conforme perfil;
- atalhos para clientes e servicos.

### 3. Acoes rapidas

O botao central "Acoes" deve abrir uma sheet/modal inferior no mobile.

Acoes iniciais:

- Novo agendamento.
- Cadastrar cliente.
- Registrar atendimento concluido.
- Adicionar servico/produto.
- Ver fechamento do dia.

Cada acao deve ter icone, titulo curto e descricao minima.

### 4. Permissoes por perfil

A navegacao deve respeitar perfil do usuario.

Exemplos:

- Dono/admin: agenda, CRM, financeiro, profissionais, configuracoes.
- Profissional: minha agenda, meus atendimentos, comissoes, perfil.
- Recepcao: agenda, clientes, acoes, pendencias, opcoes.

Evitar mostrar entradas que a pessoa nao pode usar.

### 5. Criterios de UX

- Tap targets com pelo menos 44px.
- Bottom nav fixa sem cobrir conteudo importante.
- Safe area para iPhone: usar `env(safe-area-inset-bottom)`.
- Estado ativo evidente.
- Labels curtas, sem termos tecnicos.
- Sem hover como unica forma de descobrir acao.
- Evitar cards altos demais na primeira dobra.
- Testar em largura 390px e 430px.

## Onde investigar no codigo

Arquivos provaveis:

- `src/components/layout/AppLayout.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/ProfessionalSidebar.tsx`
- `src/components/layout/SuperAdminSidebar.tsx`
- `src/app/(app)/layout.tsx`
- `src/app/(app)/dashboard/page.tsx`
- `src/styles/mobile.css`

Tambem verificar rotas por tenant em `src/app/[tenantSlug]/` antes de decidir
se a bottom nav entra apenas no app interno ou tambem no portal do cliente.

## Sugestao de implementacao em fases

1. Criar componente `MobileBottomNav`.
2. Integrar no layout autenticado sem alterar desktop.
3. Adicionar sheet de acoes rapidas.
4. Ajustar dashboard mobile para blocos operacionais.
5. Validar com screenshot mobile e fluxo de toque.

## Criterio de aceite

No celular, o Tratto deve parecer um app operacional:

- usuario entende onde esta;
- consegue agendar cliente em ate dois toques;
- acessa agenda sem abrir sidebar;
- encontra opcoes sem procurar no topo;
- visual fica mais proximo de ferramenta mobile nativa do que de site responsivo.
