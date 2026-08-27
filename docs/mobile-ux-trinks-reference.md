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

## Estado atual observado no Tratto

Referencia enviada por Oseias: tela mobile em `gotratto.com.br`, painel da
empresa Aura Salao de Beleza.

Pontos que reforcam a percepcao de "web no mobile":

- Navegacao principal depende de botao de menu no topo, com cara de sidebar
  recolhida.
- O topo ocupa uma faixa relevante com menu, tema, notificacoes, avatar e seta,
  mas nao entrega as acoes mais frequentes.
- A tela comeca com "Visao Geral" e cards de metricas, mas nao oferece caminho
  direto para agenda, cliente, acoes e financeiro no polegar.
- O link de agendamento aparece cedo, mas compete com tarefas operacionais mais
  urgentes para uso diario.
- Cards de resumo ocupam muita altura no primeiro scroll, fazendo a tela parecer
  dashboard desktop empilhado.
- O navegador mobile fica com barra inferior propria; sem bottom navigation do
  produto, a experiencia parece mais site aberto no browser do que app.
- Falta uma camada de acoes rapidas clara para recepcao, dono e profissional.

Leitura: o problema nao e somente estetico. A hierarquia mobile atual prioriza
resumo e configuracoes no topo, enquanto o uso diario pede navegacao persistente
e atalhos de execucao.

## Comparacao objetiva

| Tema | Trinks observado | Tratto atual observado | Direcao para Tratto |
| --- | --- | --- | --- |
| Navegacao | Bottom nav fixa | Menu superior/sidebar | Bottom nav mobile nas rotas autenticadas |
| Acoes frequentes | Cards de acao no topo | Cards de metrica primeiro | Acoes rapidas antes dos indicadores |
| Uso com uma mao | Itens no alcance do polegar | Controles concentrados no topo | Acoes principais na parte inferior |
| Primeiro nivel | Operacional | Dashboard web responsivo | Home de operacao diaria |
| Estado vazio | Mensagem direta no bloco | Numeros e cards grandes | Estado vazio com proxima acao |
| Perfil | Parece app de rotina | Parece painel web | Experiencia mobile-first |

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

No mobile, reduzir a dependencia do menu hamburguer. Ele pode continuar existindo
para configuracoes secundarias, mas nao deve ser o principal caminho para tarefas
do dia.

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

Ordem recomendada para o painel mobile:

1. Negocio ativo + usuario + notificacoes.
2. Acoes rapidas.
3. Proximo compromisso ou agenda de hoje.
4. Pendencias.
5. Resumo financeiro/comissao.
6. Link publico de agendamento.

O link publico de agendamento e importante, mas nao deve ocupar prioridade acima
de agendar cliente, abrir agenda e cadastrar cliente no uso interno diario.

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

## Backlog sugerido para Claude Code

- Criar `src/components/layout/MobileBottomNav.tsx`.
- Criar `src/components/layout/MobileQuickActionsSheet.tsx`.
- Ajustar `AppLayout` para renderizar bottom nav apenas em mobile.
- Adicionar padding inferior no conteudo autenticado quando a bottom nav estiver
  ativa.
- Rever `src/app/(app)/dashboard/page.tsx` para priorizar acoes e agenda no
  mobile.
- Manter sidebar desktop sem mudanca nesta primeira fase.
- Mapear permissoes antes de exibir Financeiro/Comissoes.

## Tela de Profissionais: referencia Trinks

Referencia enviada por Oseias: tela mobile de profissionais no Trinks.

Observacao principal: a lista de profissionais do Trinks usa uma tabela compacta
com informacoes relevantes visiveis de uma vez. Oseias prefere esse padrao para
o Tratto, porque a tela atual do Tratto esta com cara de card grande, pouco
intuitiva e pesada no mobile.

### O que o Trinks resolve melhor nessa tela

- Estrutura em tabela/lista operacional, nao em cards grandes.
- Abas claras no topo:
  - Todos os profissionais
  - Perfis de acesso
- Acoes compactas acima da tabela:
  - adicionar profissional;
  - filtro "Apenas Ativos";
  - exportar;
  - recalcular/atualizar.
- Colunas com informacoes uteis para decisao rapida:
  - foto;
  - nome;
  - apelido;
  - perfil de acesso;
  - possui agenda;
  - funcao.
- Linhas densas, escaneaveis e com separadores leves.
- Botoes menores para mobile, sem ocupar meia tela.

### Estado atual no Tratto

Arquivo principal: `src/app/[tenantSlug]/(admin)/funcionarios/page.tsx`.

Pontos do codigo atual que merecem ajuste:

- `viewMode` inicia como `grid`, entao o usuario cai primeiro nos cards.
- A tela tem alternancia entre grid e lista, mas no mobile a tabela/lista deve
  ser o padrao.
- Os cards atuais usam muito espaco visual (`p-8`, radius grande, botoes 40px,
  avatar grande e blocos altos).
- Os botoes principais no topo ficam grandes para uso mobile.
- A lista atual existe, mas ainda parece tabela desktop adaptada:
  - colunas `Profissional`, `Contatos`, `Especialidades`, `Comissao`, `Status`,
    `Acoes`;
  - nao mostra claramente `Apelido`, `Perfil de acesso`, `Possui agenda` e
    `Funcao` como a referencia.

### Direcao recomendada para Profissionais

No mobile, substituir a experiencia inicial de cards por uma tabela/lista
compacta inspirada na referencia do Trinks.

Requisitos:

- Mobile deve abrir em modo lista/tabela por padrao.
- Manter cards apenas como opcao secundaria ou remover do mobile.
- Botoes no mobile devem ser menores e mais densos:
  - altura entre 32px e 36px para acoes secundarias;
  - icone + texto curto;
  - evitar botao largo para tudo.
- Adicionar tabs ou segmentacao clara:
  - Todos os profissionais;
  - Perfis de acesso.
- Adicionar filtro `Apenas ativos` perto das acoes principais.
- Priorizar colunas/campos:
  - Foto;
  - Nome;
  - Apelido;
  - Perfil de acesso;
  - Possui agenda;
  - Funcao;
  - Acoes.
- A tabela mobile pode ter rolagem horizontal controlada, desde que:
  - a primeira coluna de identidade continue facil de ler;
  - os botoes de acao nao quebrem layout;
  - nao exista texto gigante empurrando as colunas.

### Backlog especifico

- Alterar `useState<'grid' | 'list'>('grid')` para iniciar como lista no mobile
  ou persistir preferencia por viewport.
- Criar uma versao mobile compacta da tabela de profissionais.
- Rever se o termo da rota deve continuar `funcionarios` internamente, mas na UI
  manter sempre "Profissionais".
- Mapear campos faltantes:
  - apelido;
  - perfil de acesso;
  - possui agenda;
  - funcao/cargo.
- Compactar botoes de topo:
  - Novo;
  - Exportar/importar;
  - Atualizar;
  - Apenas ativos.
- Validar screenshot em 390px e 430px.

### Criterio de aceite para Profissionais

- Ao abrir no celular, a tela parece uma lista operacional, nao um grid de cards.
- O usuario consegue comparar profissionais sem abrir cada cadastro.
- Nome, apelido, perfil, agenda e funcao aparecem na visao principal.
- Botoes nao dominam a tela.
- Acoes continuam tocaveis, mas visualmente compactas.
- A versao desktop nao perde a tabela nem a leitura atual.

## Criterio de aceite

No celular, o Tratto deve parecer um app operacional:

- usuario entende onde esta;
- consegue agendar cliente em ate dois toques;
- acessa agenda sem abrir sidebar;
- encontra opcoes sem procurar no topo;
- visual fica mais proximo de ferramenta mobile nativa do que de site responsivo.
