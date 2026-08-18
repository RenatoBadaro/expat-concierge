# People Tech Design Guide

## Objetivo

Este guia traduz a linguagem visual observada nas referências do portal `Mobility AB InBev` para um sistema mais prático e reutilizável para a People Tech.

O foco aqui e:

- clareza
- credibilidade
- sensação de produto enterprise moderno e operacional
- hierarquia visual forte
- interfaces com pouco ruído

## Direcao de Estilo

### Personalidade da interface

A interface deve comunicar:

- confianca institucional
- simplicidade operacional
- organizacao
- tecnologia aplicada a negocio
- fluxo guiado e previsivel

Evitar:

- excesso de cores saturadas
- muitos contornos competindo entre si
- telas densas sem respiro
- botoes com estilos muito diferentes entre si

### Principios visuais

- Poucos elementos por bloco, com espacamento generoso.
- Tipografia grande nas areas de mensagem principal.
- Conteudo organizado em secoes amplas e bem separadas.
- Cards, formularios e paineis com aparencia limpa e profissional.
- Destaques visuais concentrados em azul-petroleo e amarelo funcional.
- Estados ativos claramente marcados por cor e sublinhado.

## Paleta de Cores

### Cores principais

#### `Primary / Petrol`

- Hex: `#0F3B4F`
- Uso: hero institucional, paineis de destaque, ancora de marca

#### `Primary / Yellow`

- Hex: `#F4D21F`
- Uso: CTA principal, item ativo, icones de acao, linhas de destaque

#### `Accent / Slate`

- Hex: `#2F3A4A`
- Uso: icones escuros, textos de alto contraste, divisores fortes

### Neutros

#### `Neutral / 900`

- Hex: `#111827`
- Uso: texto principal

#### `Neutral / 700`

- Hex: `#374151`
- Uso: texto secundario

#### `Neutral / 500`

- Hex: `#6B7280`
- Uso: placeholders, labels auxiliares, icones discretos

#### `Neutral / 300`

- Hex: `#D1D5DB`
- Uso: bordas, divisores

#### `Neutral / 100`

- Hex: `#F5F6F8`
- Uso: fundos sutis, containers secundarios

#### `Neutral / 50`

- Hex: `#FAFAFB`
- Uso: fundo de app, areas de respiro, topbar

#### `Neutral / 0`

- Hex: `#FFFFFF`
- Uso: fundo principal e cards

### Cores de apoio

#### `Success`

- Hex: `#1F9D68`

#### `Warning`

- Hex: `#C99700`

#### `Danger`

- Hex: `#D14343`

## Aplicacao da Cor

- Fundo principal: `#FAFAFB`
- Fundo de cards e modulos: `#FFFFFF`
- Fundo alternativo de secao: `#F5F6F8`
- Texto principal: `#111827`
- Texto secundario: `#374151`
- Hero institucional: `#0F3B4F`
- CTA principal: `#F4D21F`
- CTA secundario: branco com borda `#D1D5DB`
- Estados ativos e linhas de destaque: `#F4D21F`
- Focus de interacao: `#0F3B4F`

## Tipografia

### Recomendacao

Usar uma familia sans-serif corporativa e legivel. Sugestoes:

- `Manrope`
- `Plus Jakarta Sans`
- `IBM Plex Sans`

Se precisar de uma escolha unica, usar `Plus Jakarta Sans`.

### Hierarquia

#### Hero title

- Tamanho: `48px` desktop / `34px` mobile
- Peso: `800`
- Altura de linha: `1.1`

#### Section title

- Tamanho: `28px`
- Peso: `700`
- Altura de linha: `1.2`

#### Card title

- Tamanho: `20px`
- Peso: `600`

#### Body

- Tamanho: `16px`
- Peso: `400`
- Altura de linha: `1.6`

#### Small text

- Tamanho: `14px`
- Peso: `500`

## Espacamento

Trabalhar com escala simples de espacamento:

- `4px`
- `8px`
- `12px`
- `16px`
- `24px`
- `32px`
- `48px`
- `64px`

### Regras praticas

- Entre titulo e texto: `12px` a `16px`
- Entre blocos internos de card: `16px` a `24px`
- Entre secoes da pagina: `64px` a `96px`
- Padding de card: `24px`
- Padding de hero: `64px` ou mais
- Margem lateral do conteudo principal em apps: `24px` a `32px`

## Layout

### Estrutura geral

- Topbar branca, limpa e com utilitarios no canto direito.
- Sidebar vertical fixa com icones e estado ativo bem evidente.
- Hero com titulo forte, subtitulo curto e CTA principal amarelo.
- Secoes em blocos horizontais amplos.
- Uso de grid para cards de acao e indicadores.
- Footer institucional e discreto.

### Grid

- Desktop: grid de 12 colunas
- Tablet: grid de 8 colunas
- Mobile: grid de 4 colunas
- Largura maxima do conteudo: `1200px` a `1280px`

## Superficies e Containers

### Card padrao

- Fundo: `#FFFFFF`
- Borda: `1px solid #E5E7EB`
- Radius: `16px`
- Sombra: `0 2px 8px rgba(15, 39, 68, 0.04)`
- Padding: `24px`
- Destaque inferior opcional: `6px solid #F4D21F`

### Painel destacado

- Fundo: `#0F3B4F`
- Texto: branco
- Radius: `20px`
- Padding: `32px`

### Bloco neutro

- Fundo: `#F3F4F6`
- Radius: `16px`
- Padding: `24px`

## Botoes

### Principios

- Botoes devem ser robustos, consistentes e faceis de identificar.
- Priorizar poucos estilos recorrentes.
- Todos os botoes devem ter altura minima de `44px`.
- O CTA principal pode ser amarelo mesmo em contexto claro, desde que o contraste do texto seja alto.

### `Primary Button`

- Fundo: `#F4D21F`
- Texto: `#111827`
- Radius: `12px`
- Padding horizontal: `20px`
- Peso do texto: `600`
- Hover: `#E7C400`
- Active: `#DAB800`
- Focus ring: `0 0 0 4px rgba(244, 210, 31, 0.28)`

Uso:

- acao principal da tela
- confirmar
- avancar
- solicitar demo

### `Secondary Button`

- Fundo: `#FFFFFF`
- Texto: `#2F3A4A`
- Borda: `1px solid #CBD5E1`
- Radius: `12px`
- Hover: fundo `#F8FAFC`
- Focus ring: `0 0 0 4px rgba(15, 59, 79, 0.14)`

Uso:

- acao secundaria
- cancelar com baixo destaque
- ver detalhes

### `Tertiary Button`

- Fundo: transparente
- Texto: `#0F3B4F`
- Borda: nenhuma
- Hover: fundo `rgba(15, 59, 79, 0.06)`
- Radius: `10px`

Uso:

- acoes discretas
- links com cara de botao
- navegacao auxiliar

### `Danger Button`

- Fundo: `#D14343`
- Texto: `#FFFFFF`
- Hover: `#B73535`

Uso:

- remover
- excluir
- revogar

### Tamanhos

#### Large

- Altura: `52px`
- Fonte: `16px`

#### Medium

- Altura: `44px`
- Fonte: `15px`

#### Small

- Altura: `36px`
- Fonte: `14px`

## Campos e Formularios

### Input padrao

- Altura: `48px`
- Fundo: `#FFFFFF`
- Borda: `1px solid #D1D5DB`
- Radius: `12px`
- Padding horizontal: `16px`
- Texto: `#111827`

Estados:

- Hover: borda `#9CA3AF`
- Focus: borda `#0F3B4F` com anel suave
- Error: borda `#D14343`
- Disabled: fundo `#F5F6F8`, texto `#9CA3AF`

### Label

- Tamanho: `14px`
- Peso: `600`
- Cor: `#374151`
- Margem inferior: `8px`

### Helper text

- Tamanho: `13px`
- Cor: `#6B7280`

## Navegacao

### Header

- Altura sugerida: `72px`
- Fundo branco
- Logo alinhado a esquerda
- Utilitarios compactos no canto direito
- Sem excesso de navegacao horizontal

### Sidebar

Se houver area logada:

- fundo branco
- largura estreita
- item ativo com fundo amarelo
- icones lineares
- agrupamento claro por modulo
- espacamento vertical amplo entre icones

## Tabelas e Dados

### Tabela padrao

- Cabecalho com fundo `#F9FAFB`
- Texto do cabecalho em `#374151`
- Linhas com altura confortavel
- Hover de linha com `#F8FAFC`
- Divisores sutis

### Numeros e indicadores

- usar destaque em `#2F3A4A` para metricas principais
- usar `#1F9D68` e `#D14343` apenas para variacao positiva ou negativa
- evitar arco-iris de cores em dashboards
- indicadores podem usar sublinhado inferior para categorizar estados

## Iconografia e Ilustracao

### Icones

- estilo linear ou duotone leve
- traco consistente
- sem excesso de detalhes
- amarelo para icones de acao e destaque

### Imagens

- priorizar imagens institucionais, tecnologia, mobilidade e pessoas em contexto real
- evitar bancos de imagem com aparencia generica

## Motion

Animacao deve ser sutil e funcional:

- hover de botoes: `150ms` a `200ms`
- entrada de cards: fade + translate leve
- expansoes: `200ms` com easing suave

Evitar:

- animacoes decorativas longas
- excesso de microinteracoes

## Padroes de Componente

### Hero

Deve conter:

- titulo forte
- descricao curta
- 1 CTA principal
- 1 CTA secundario opcional
- composicao em duas colunas quando houver espaco
- fundo azul-petroleo com alto contraste

### Card informativo

Deve conter:

- icone simples no canto esquerdo
- titulo curto
- texto objetivo
- faixa inferior amarela para reforco de estado ou categoria

### Bloco de metricas

Deve conter:

- numero principal
- rotulo
- variacao opcional
- possibilidade de linha inferior colorida

### Stepper de processo

Deve conter:

- etapas numeradas em circulos
- etapa atual destacada em amarelo
- etapas futuras em cinza claro
- linha de progresso horizontal fina
- label curta e objetiva por etapa

### Modulo de lista ou painel operacional

Deve conter:

- titulo com icone
- area branca ampla
- sublinhado amarelo no rodape do container
- espaco para tabela, lista ou cards internos

### Secao institucional

Deve conter:

- titulo
- paragrafo curto
- ate 3 destaques

## Tokens Base

```yaml
color:
  primary_petrol: "#0F3B4F"
  primary_yellow: "#F4D21F"
  accent_slate: "#2F3A4A"
  text_primary: "#111827"
  text_secondary: "#374151"
  text_muted: "#6B7280"
  border: "#D1D5DB"
  surface: "#FFFFFF"
  surface_subtle: "#F5F6F8"
  app_background: "#FAFAFB"
  success: "#1F9D68"
  warning: "#C99700"
  danger: "#D14343"

radius:
  sm: "10px"
  md: "12px"
  lg: "16px"
  xl: "20px"

shadow:
  card: "0 2px 8px rgba(15, 39, 68, 0.04)"

spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "24px"
  6: "32px"
  7: "48px"
  8: "64px"
```

## Exemplo de CSS Base

```css
:root {
  --color-primary-petrol: #0f3b4f;
  --color-primary-yellow: #f4d21f;
  --color-accent-slate: #2f3a4a;
  --color-text-primary: #111827;
  --color-text-secondary: #374151;
  --color-text-muted: #6b7280;
  --color-border: #d1d5db;
  --color-surface: #ffffff;
  --color-surface-subtle: #f5f6f8;
  --color-app-background: #fafafb;
  --color-success: #1f9d68;
  --color-warning: #c99700;
  --color-danger: #d14343;
  --radius-sm: 10px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --shadow-card: 0 2px 8px rgba(15, 39, 68, 0.04);
}

.btn-primary {
  min-height: 44px;
  padding: 0 20px;
  border: 0;
  border-radius: var(--radius-md);
  background: var(--color-primary-yellow);
  color: var(--color-text-primary);
  font-weight: 600;
}

.btn-secondary {
  min-height: 44px;
  padding: 0 20px;
  border: 1px solid #cbd5e1;
  border-radius: var(--radius-md);
  background: #fff;
  color: var(--color-accent-slate);
  font-weight: 600;
}

.card-highlight {
  background: var(--color-surface);
  border: 1px solid #e5e7eb;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  border-bottom: 6px solid var(--color-primary-yellow);
}

.stepper__item.is-active .stepper__bullet {
  background: var(--color-primary-yellow);
  color: var(--color-text-primary);
}
```

## Recomendacao Final

Se a People Tech quiser seguir esse caminho com consistencia, a melhor combinacao e:

- base neutra clara
- azul-petroleo como ancora institucional
- amarelo como cor funcional de acao e estado ativo
- componentes chapados, limpos e com destaque inferior
- fluxo guiado por etapas em experiencias operacionais

## Observacao

Este documento foi revisado a partir das capturas compartilhadas do portal. Os pontos mais marcantes observados foram:

- hero em azul-petroleo
- CTA amarelo
- sidebar vertical minimalista
- cards brancos com sublinhado amarelo
- stepper numerado com etapa ativa destacada
