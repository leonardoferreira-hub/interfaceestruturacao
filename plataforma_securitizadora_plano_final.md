# Plano de Ação: Migração e Evolução da Plataforma de Gestão de Securitização

**Autor**: Manus AI  
**Data**: 24 de Janeiro de 2026  
**Versão**: 2.0

---

## Sumário

1. [Introdução e Contexto](#1-introdução-e-contexto)
2. [Análise do Sistema Atual e Proposta de Evolução](#2-análise-do-sistema-atual-e-proposta-de-evolução)
3. [Diretrizes de Design e Experiência do Usuário](#3-diretrizes-de-design-e-experiência-do-usuário-uxui)
4. [Arquitetura da Base de Dados](#4-arquitetura-da-base-de-dados)
5. [Scripts SQL para Criação das Tabelas](#5-scripts-sql-para-criação-das-tabelas)
6. [Migração de Dados](#6-migração-de-dados)
7. [Sistema de Autenticação e Perfis](#7-sistema-de-autenticação-e-perfis)
8. [Automação de E-mails](#8-automação-de-e-mails)
9. [Estrutura do Frontend](#9-estrutura-do-frontend)
10. [Cronograma de Implementação](#10-cronograma-de-implementação)
11. [Próximos Passos](#11-próximos-passos)
12. [Referências](#12-referências)

---

## 1. Introdução e Contexto

Este documento detalha o plano de ação completo para migrar e evoluir o controle de operações de securitização, atualmente em uma planilha Google Sheets e uma aplicação Lovable básica, para uma plataforma web robusta, intuitiva e moderna. A nova plataforma utilizará **React** com **TypeScript** no frontend, **Supabase** como backend, e será enriquecida com um design system baseado em **shadcn/ui** e animações fluidas com **Framer Motion**.

O objetivo é criar um sistema que não apenas replique e aprimore as funcionalidades atuais, mas que também ofereça uma experiência de usuário superior, com maior controle, segurança, e eficiência para as equipes de estruturação e gestão.

### 1.1. Escopo do Projeto

O projeto abrange a migração e desenvolvimento das seguintes funcionalidades:

| Funcionalidade | Origem (Sheets/Lovable) | Destino (Plataforma 2.0) |
|:---|:---|:---|
| Pipeline de operações | Aba "Pipe" / Página "Emissões" | Página "Pipeline" com tabela avançada |
| Histórico de operações | Aba "Histórico" / Página "Histórico" | Página "Histórico" com filtros e busca |
| Controle de pendências | Aba "Pendências" / Página "Pendências" | Página "Pendências" com layout Kanban |
| Verificação de compliance | Aba "Compliance" | Workflow visual integrado na operação |
| Atribuição de analistas | Portal do Gestor / Dropdowns | Sistema de login com perfis e modais |
| Envio automático de e-mails | Apps Script | Supabase Edge Functions com Resend |
| Auditoria de alterações | Não existente | Audit Log completo e visualizável |
| Design System e UX | Básico (Lovable) | Moderno, com Dark Mode e animações |

### 1.2. Integrações Existentes

A plataforma se integrará com o sistema comercial já existente no mesmo projeto Supabase:

| Sistema | Schema Supabase | Tabelas Principais | Função |
|:---|:---|:---|:---|
| Calculadora Comercial | `public` e `base_custos` | `emissoes`, `series`, `custos_*` | Fonte de novas operações aceitas |
| Interface de Estruturação | `estruturacao` | `operacoes`, `pendencias`, etc. | Gestão do pipeline |
| Autenticação | `auth` (Supabase Auth) | `users` | Login e controle de acesso |

---

## 2. Análise do Sistema Atual e Proposta de Evolução

A análise da aplicação Lovable e do repositório GitHub revela uma base sólida, porém com espaço para melhorias significativas em design, funcionalidade e experiência do usuário.

### 2.1. Estrutura Atual do Repositório

A aplicação atual está organizada da seguinte forma:

```
src/
├── components/
│   ├── emissoes/          # Componentes específicos de emissões
│   ├── estruturacao/      # Componentes de estruturação
│   ├── layout/            # Componentes de layout (Header, etc.)
│   ├── pendencias/        # Componentes de pendências
│   ├── ui/                # Componentes shadcn/ui (50+ componentes)
│   └── NavLink.tsx        # Componente de navegação
├── hooks/                 # Custom hooks
├── integrations/supabase/ # Configuração e queries Supabase
├── lib/                   # Utilitários
├── pages/                 # Páginas da aplicação
├── types/                 # Definições TypeScript
└── utils/                 # Funções auxiliares
```

### 2.2. O que Será Mantido

A tabela abaixo resume os elementos que serão preservados da implementação atual:

| Elemento | Justificativa |
|:---|:---|
| **Stack Tecnológica** (Vite, React, TypeScript, TailwindCSS, Supabase) | Base moderna e performática |
| **Estrutura de Componentes** por funcionalidade | Boa organização e separação de responsabilidades |
| **Biblioteca shadcn/ui** | Componentes acessíveis e customizáveis |
| **Integração com Supabase** | Conexão existente e queries básicas funcionais |
| **Estrutura de Abas no Modal** (Visão Geral, Séries, Despesas, etc.) | Organização lógica das informações |

### 2.3. O que Será Alterado e Melhorado

| Componente/Página | Situação Atual | Proposta de Melhoria |
|:---|:---|:---|
| **Tabela de Emissões** | Tabela simples, sem ordenação, filtros ou paginação | Substituir por `DataTable` avançado com `tanstack/react-table`, filtros por coluna, busca global, ordenação, paginação e `StatusBadge` coloridos |
| **Modal de Detalhes** | Sheet lateral com campos básicos | Enriquecer com animações de entrada/saída, substituir dropdowns por `Combobox` com busca, adicionar `DatePicker` e `CurrencyInput` |
| **Página de Pendências** | Layout Kanban estático sem conteúdo | Implementar Kanban funcional com drag-and-drop (`dnd-kit`), cards detalhados e filtros |
| **Página de Histórico** | Tabela vazia sem funcionalidades | Popular com dados migrados, implementar filtros avançados por data, tipo e status |
| **Dashboard** | Gráficos com bugs (mostrando UUIDs) | Corrigir queries, adicionar métricas relevantes, usar `Recharts` com animações e tooltips |
| **Navegação** | Header simples com links | Adicionar indicador de página ativa e transições suaves |
| **Cores de Status** | Sem indicadores visuais | Implementar badges coloridos por status (verde/amarelo/vermelho) |

### 2.4. O que Será Criado do Zero

| Funcionalidade | Descrição |
|:---|:---|
| **Sistema de Autenticação Completo** | Telas de Login e fluxo de criação de usuários pelo Admin |
| **Controle de Acesso por Perfil (RLS)** | Políticas de segurança no Supabase para cada perfil |
| **Página de Gestão** | Interface para gestores atribuírem analistas |
| **Página de Administração** | Interface para admins gerenciarem usuários e configurações |
| **Workflow Visual de Compliance** | Componente interativo para verificação de documentos |
| **Audit Log** | Tabela e interface para visualizar histórico de mudanças |
| **Dark Mode** | Tema escuro em toda a aplicação |
| **Animações e Micro-interações** | Feedback visual e transições fluidas |

---

## 3. Diretrizes de Design e Experiência do Usuário (UX/UI)

Para elevar a plataforma, adotaremos princípios de design moderno, focados em clareza, eficiência e uma estética agradável.

### 3.1. Filosofia de Design

Os 10 princípios de design para dashboards modernos que guiarão o desenvolvimento são:

1. **Foco no Objetivo Principal do Usuário**: Dashboard deve responder "O que o usuário precisa saber ou fazer?" Exibir informações mais relevantes primeiro.

2. **Visualizações de Dados Corretas**: Line Charts para tendências temporais, Bar Charts para comparações, Pie Charts com moderação para proporções simples.

3. **Hierarquia Visual Clara**: Usar contraste, cor, tamanho e espaçamento para guiar o olhar do usuário para as informações mais importantes.

4. **Interatividade Inteligente e Reativa**: Implementar filtros, drill-downs, hover para detalhes. Cada interação deve ter feedback instantâneo.

5. **Design Responsivo e Adaptativo**: Funcionar bem em desktop, tablet e mobile.

6. **Consistência de Interface**: Elementos UI consistentes em todo o sistema para minimizar carga cognitiva.

7. **Dark Mode e Acessibilidade**: Opção de tema escuro, alto contraste, labels claros e navegação por teclado.

8. **Dados em Tempo Real**: Dashboards com dados atualizados, especialmente em aplicações financeiras.

9. **Personalização por Usuário**: Exibição customizada de acordo com o papel do usuário.

10. **Design Minimalista e Estética Funcional**: "Menos é mais". Cada elemento deve servir a um propósito claro.

### 3.2. Paleta de Cores

Adotaremos uma paleta de cores moderna e acessível, com suporte para Light e Dark Mode:

| Modo | Elemento | Cor (Hex) | Tailwind Class |
|:---|:---|:---|:---|
| **Light** | Background | #F8FAFC | `bg-slate-50` |
| | Card/Widget | #FFFFFF | `bg-white` |
| | Texto Principal | #0F172A | `text-slate-900` |
| | Texto Secundário | #64748B | `text-slate-500` |
| | Borda | #E2E8F0 | `border-slate-200` |
| | Primária (Acento) | #3B82F6 | `bg-blue-500` |
| **Dark** | Background | #0F172A | `dark:bg-slate-900` |
| | Card/Widget | #1E293B | `dark:bg-slate-800` |
| | Texto Principal | #F8FAFC | `dark:text-slate-50` |
| | Texto Secundário | #94A3B8 | `dark:text-slate-400` |
| | Borda | #334155 | `dark:border-slate-700` |
| | Primária (Acento) | #60A5FA | `dark:bg-blue-400` |

**Cores de Status:**

| Status | Light Mode | Dark Mode | Uso |
|:---|:---|:---|:---|
| Sucesso/OK | `bg-green-100 text-green-800` | `dark:bg-green-900 dark:text-green-300` | Compliance aprovado, pendência resolvida |
| Alerta/Pendente | `bg-yellow-100 text-yellow-800` | `dark:bg-yellow-900 dark:text-yellow-300` | Aguardando ação, em análise |
| Erro/NOK | `bg-red-100 text-red-800` | `dark:bg-red-900 dark:text-red-300` | Compliance reprovado, problema |
| Info/Em Estruturação | `bg-blue-100 text-blue-800` | `dark:bg-blue-900 dark:text-blue-300` | Status neutro, em progresso |

### 3.3. Animações e Micro-interações (Framer Motion)

Animações serão usadas de forma sutil para melhorar a usabilidade, não para distrair.

| Tipo de Animação | Onde Aplicar | Configuração Sugerida |
|:---|:---|:---|
| **Transições de Página** | Navegação entre rotas | `fade-in` com `duration: 0.2s` |
| **Carregamento de Dados** | Tabelas, cards | `Skeleton` com `animate-pulse` |
| **Hover em Botões/Links** | Todos os elementos clicáveis | `scale: 1.02` com `duration: 0.15s` |
| **Abertura de Sheets** | Modal de detalhes | `slide-in` da direita com `spring` |
| **Abertura de Modais** | Dialogs de confirmação | `fade-in` + `scale` de 0.95 para 1 |
| **Listas e Tabelas** | Entrada de itens | `stagger` com delay de 0.05s por item |
| **Notificações (Toasts)** | Feedback de ações | `slide-in` do canto + `slide-out` após 5s |
| **Drag and Drop** | Kanban de pendências | `layout` animation do Framer Motion |

**Exemplo de implementação com Framer Motion:**

```tsx
// Componente de lista animada
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const AnimatedList = ({ items }) => (
  <motion.ul
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="space-y-2"
  >
    {items.map(item => (
      <motion.li
        key={item.id}
        variants={itemVariants}
        className="p-4 bg-white rounded-lg shadow"
      >
        {item.name}
      </motion.li>
    ))}
  </motion.ul>
);
```

**Exemplo de StatusBadge com animação:**

```tsx
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const statusConfig = {
  'ok': { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-300', label: 'OK' },
  'pendente': { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-300', label: 'Pendente' },
  'nok': { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-300', label: 'NOK' },
};

export const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig['pendente'];
  
  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.bg,
        config.text
      )}
    >
      {config.label}
    </motion.span>
  );
};
```

---

## 4. Arquitetura da Base de Dados

A estrutura do banco de dados será organizada em schemas para manter a separação lógica das responsabilidades e facilitar a manutenção.

### 4.1. Visão Geral dos Schemas

| Schema | Responsabilidade | Tabelas Principais |
|:---|:---|:---|
| `public` | Tabelas compartilhadas e autenticação | `usuarios`, `perfis`, `historico_alteracoes` |
| `base_custos` | Tabelas de referência do comercial | `categorias`, `veiculos`, `tipos_oferta`, `lastros` |
| `estruturacao` | Dados específicos da interface de estruturação | `operacoes`, `pendencias`, `compliance_checks`, `analistas_gestao` |

### 4.2. Modelo de Dados Detalhado

#### 4.2.1. Tabela `estruturacao.operacoes`

Esta é a tabela central do sistema, consolidando todas as operações desde a aceitação da proposta comercial até a liquidação e arquivamento.

| Coluna | Tipo | Obrigatório | Descrição |
|:---|:---|:---|:---|
| `id` | `uuid` | Sim | Chave primária |
| `id_emissao_comercial` | `uuid` | Não | FK para `public.emissoes` (origem comercial) |
| `numero_emissao` | `text` | Sim | Código único da emissão (ex: EM-20260115-0019) |
| `nome_operacao` | `text` | Sim | Nome descritivo da operação |
| `status` | `text` | Sim | Status atual: `Em Estruturação`, `Liquidada`, `On Hold`, `Abortada`, `Finalizada` |
| `pmo_id` | `uuid` | Não | FK para `public.usuarios` - PMO responsável |
| `analista_gestao_id` | `uuid` | Não | FK para `estruturacao.analistas_gestao` |
| `analista_financeiro_id` | `uuid` | Não | Preenchido automaticamente via hierarquia |
| `analista_contabil_id` | `uuid` | Não | Preenchido automaticamente via hierarquia |
| `categoria_id` | `uuid` | Não | FK para `base_custos.categorias` (CRI, CRA, DEB, etc.) |
| `veiculo_id` | `uuid` | Não | FK para `base_custos.veiculos` |
| `tipo_oferta_id` | `uuid` | Não | FK para `base_custos.tipos_oferta` |
| `lastro_id` | `uuid` | Não | FK para `base_custos.lastros` |
| `volume` | `numeric(18,2)` | Sim | Volume total da operação |
| `empresa_cnpj` | `text` | Não | CNPJ da empresa emissora |
| `empresa_razao_social` | `text` | Não | Razão social da empresa |
| `data_entrada_pipe` | `timestamptz` | Sim | Data de entrada no pipeline |
| `data_previsao_liquidacao` | `date` | Não | Previsão de liquidação |
| `data_liquidacao` | `date` | Não | Data efetiva de liquidação |
| `data_primeira_pagamento` | `date` | Não | 1ª data de pagamento |
| `fee_estruturacao` | `numeric(10,4)` | Não | Fee de estruturação (%) |
| `fee_gestao` | `numeric(10,4)` | Não | Fee de gestão (%) |
| `fee_originacao` | `numeric(10,4)` | Não | Fee de originação (%) |
| `boletagem` | `text` | Não | Status da boletagem |
| `df` | `text` | Não | Distribuição financeira |
| `banco` | `text` | Não | Banco da operação |
| `agencia` | `text` | Não | Agência bancária |
| `conta_bancaria` | `text` | Não | Conta bancária |
| `majoracao` | `numeric(10,4)` | Não | Majoração (%) |
| `floating` | `boolean` | Não | Indicador de floating |
| `proximos_passos` | `text` | Não | Próximos passos da operação |
| `alertas` | `text` | Não | Alertas importantes |
| `status_tech` | `text` | Não | Status técnico |
| `resumo` | `text` | Não | Resumo da operação |
| `investidores_obs` | `text` | Não | Observações sobre investidores |
| `criado_em` | `timestamptz` | Sim | Data de criação do registro |
| `atualizado_em` | `timestamptz` | Sim | Data da última atualização |

#### 4.2.2. Tabela `estruturacao.pendencias`

Gerencia as pendências de operações já liquidadas. Uma operação vai para pendências quando liquida mas ainda possui campos com status "pendente".

| Coluna | Tipo | Obrigatório | Descrição |
|:---|:---|:---|:---|
| `id` | `uuid` | Sim | Chave primária |
| `operacao_id` | `uuid` | Sim | FK para `estruturacao.operacoes` |
| `mapa_liquidacao` | `text` | Sim | Status: `ok`, `nok`, `pendente` |
| `mapa_registros` | `text` | Sim | Status: `ok`, `nok`, `pendente` |
| `lo_status` | `text` | Sim | Status: `ok`, `nok`, `pendente` |
| `due_diligence` | `text` | Sim | Status: `ok`, `nok`, `pendente` |
| `envio_email_prestadores` | `text` | Sim | Status: `ok`, `nok`, `pendente` |
| `passagem_bastao` | `text` | Sim | Status: `ok`, `nok`, `pendente` |
| `kick_off` | `text` | Sim | Status: `ok`, `nok`, `pendente` |
| `resolvida` | `boolean` | Sim | Indica se todas as pendências foram resolvidas |
| `criado_em` | `timestamptz` | Sim | Data de criação |
| `atualizado_em` | `timestamptz` | Sim | Data da última atualização |

#### 4.2.3. Tabela `estruturacao.compliance_checks`

Rastreia as verificações de compliance (CPF/CNPJ) para cada parte envolvida na operação.

| Coluna | Tipo | Obrigatório | Descrição |
|:---|:---|:---|:---|
| `id` | `uuid` | Sim | Chave primária |
| `operacao_id` | `uuid` | Sim | FK para `estruturacao.operacoes` |
| `documento` | `text` | Sim | CPF ou CNPJ a ser verificado |
| `tipo_documento` | `text` | Sim | `CPF` ou `CNPJ` |
| `nome_entidade` | `text` | Não | Nome da pessoa/empresa |
| `tipo_entidade` | `text` | Não | Tipo: `Cedente`, `Devedor`, `Avalista`, etc. |
| `status` | `text` | Sim | `pendente`, `em_analise`, `aprovado`, `reprovado` |
| `responsavel_id` | `uuid` | Não | FK para `public.usuarios` - quem está analisando |
| `observacoes` | `text` | Não | Observações da análise |
| `data_verificacao` | `timestamptz` | Não | Data da verificação |
| `criado_em` | `timestamptz` | Sim | Data de criação |
| `atualizado_em` | `timestamptz` | Sim | Data da última atualização |

#### 4.2.4. Tabela `estruturacao.analistas_gestao`

Tabela de referência para os analistas de gestão, financeiro e contábil (usada em dropdowns).

| Coluna | Tipo | Obrigatório | Descrição |
|:---|:---|:---|:---|
| `id` | `uuid` | Sim | Chave primária |
| `nome` | `text` | Sim | Nome do analista |
| `email` | `text` | Não | E-mail do analista |
| `tipo` | `text` | Sim | `gestao`, `financeiro`, `contabil` |
| `ativo` | `boolean` | Sim | Se o analista está ativo |
| `criado_em` | `timestamptz` | Sim | Data de criação |

#### 4.2.5. Tabela `estruturacao.hierarquia_analistas`

Mapeia a relação automática entre analistas de gestão, financeiro e contábil.

| Coluna | Tipo | Obrigatório | Descrição |
|:---|:---|:---|:---|
| `analista_gestao_id` | `uuid` | Sim | PK e FK para `analistas_gestao` |
| `analista_financeiro_id` | `uuid` | Sim | FK para `analistas_gestao` |
| `analista_contabil_id` | `uuid` | Sim | FK para `analistas_gestao` |

#### 4.2.6. Tabela `public.historico_alteracoes` (Audit Log)

Registra todas as alterações importantes no sistema para auditoria.

| Coluna | Tipo | Obrigatório | Descrição |
|:---|:---|:---|:---|
| `id` | `bigserial` | Sim | Chave primária |
| `schema_name` | `text` | Sim | Nome do schema |
| `table_name` | `text` | Sim | Nome da tabela |
| `record_id` | `text` | Sim | ID do registro alterado |
| `old_data` | `jsonb` | Não | Dados antes da alteração |
| `new_data` | `jsonb` | Não | Dados após a alteração |
| `action` | `text` | Sim | `INSERT`, `UPDATE`, `DELETE` |
| `changed_by` | `uuid` | Não | FK para `auth.users` |
| `changed_at` | `timestamptz` | Sim | Data/hora da alteração |

---

## 5. Scripts SQL para Criação das Tabelas

### 5.1. Criação do Schema e Tabelas Principais

```sql
-- =====================================================
-- SCRIPT DE CRIAÇÃO DO SCHEMA ESTRUTURACAO
-- =====================================================

-- 1. Criar o schema
CREATE SCHEMA IF NOT EXISTS estruturacao;

-- 2. Tabela de Analistas de Gestão (referência)
CREATE TABLE IF NOT EXISTS estruturacao.analistas_gestao (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL,
    email text,
    tipo text NOT NULL CHECK (tipo IN ('gestao', 'financeiro', 'contabil')),
    ativo boolean NOT NULL DEFAULT true,
    criado_em timestamptz DEFAULT now()
);

-- 3. Tabela de Hierarquia de Analistas
CREATE TABLE IF NOT EXISTS estruturacao.hierarquia_analistas (
    analista_gestao_id uuid PRIMARY KEY REFERENCES estruturacao.analistas_gestao(id),
    analista_financeiro_id uuid NOT NULL REFERENCES estruturacao.analistas_gestao(id),
    analista_contabil_id uuid NOT NULL REFERENCES estruturacao.analistas_gestao(id)
);

-- 4. Tabela Central de Operações
CREATE TABLE IF NOT EXISTS estruturacao.operacoes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_emissao_comercial uuid UNIQUE REFERENCES public.emissoes(id),
    numero_emissao text NOT NULL,
    nome_operacao text NOT NULL,
    status text NOT NULL DEFAULT 'Em Estruturação' 
        CHECK (status IN ('Em Estruturação', 'Liquidada', 'On Hold', 'Abortada', 'Finalizada')),
    pmo_id uuid REFERENCES auth.users(id),
    analista_gestao_id uuid REFERENCES estruturacao.analistas_gestao(id),
    analista_financeiro_id uuid REFERENCES estruturacao.analistas_gestao(id),
    analista_contabil_id uuid REFERENCES estruturacao.analistas_gestao(id),
    categoria_id uuid,
    veiculo_id uuid,
    tipo_oferta_id uuid,
    lastro_id uuid,
    volume numeric(18,2) NOT NULL DEFAULT 0,
    empresa_cnpj text,
    empresa_razao_social text,
    data_entrada_pipe timestamptz NOT NULL DEFAULT now(),
    data_previsao_liquidacao date,
    data_liquidacao date,
    data_primeira_pagamento date,
    fee_estruturacao numeric(10,4),
    fee_gestao numeric(10,4),
    fee_originacao numeric(10,4),
    boletagem text,
    df text,
    banco text,
    agencia text,
    conta_bancaria text,
    majoracao numeric(10,4),
    floating boolean DEFAULT false,
    proximos_passos text,
    alertas text,
    status_tech text,
    resumo text,
    investidores_obs text,
    criado_em timestamptz DEFAULT now(),
    atualizado_em timestamptz DEFAULT now()
);

-- 5. Tabela de Pendências
CREATE TABLE IF NOT EXISTS estruturacao.pendencias (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    operacao_id uuid NOT NULL REFERENCES estruturacao.operacoes(id) ON DELETE CASCADE,
    mapa_liquidacao text NOT NULL DEFAULT 'pendente' CHECK (mapa_liquidacao IN ('ok', 'nok', 'pendente')),
    mapa_registros text NOT NULL DEFAULT 'pendente' CHECK (mapa_registros IN ('ok', 'nok', 'pendente')),
    lo_status text NOT NULL DEFAULT 'pendente' CHECK (lo_status IN ('ok', 'nok', 'pendente')),
    due_diligence text NOT NULL DEFAULT 'pendente' CHECK (due_diligence IN ('ok', 'nok', 'pendente')),
    envio_email_prestadores text NOT NULL DEFAULT 'pendente' CHECK (envio_email_prestadores IN ('ok', 'nok', 'pendente')),
    passagem_bastao text NOT NULL DEFAULT 'pendente' CHECK (passagem_bastao IN ('ok', 'nok', 'pendente')),
    kick_off text NOT NULL DEFAULT 'pendente' CHECK (kick_off IN ('ok', 'nok', 'pendente')),
    resolvida boolean NOT NULL DEFAULT false,
    criado_em timestamptz DEFAULT now(),
    atualizado_em timestamptz DEFAULT now()
);

-- 6. Tabela de Compliance Checks
CREATE TABLE IF NOT EXISTS estruturacao.compliance_checks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    operacao_id uuid NOT NULL REFERENCES estruturacao.operacoes(id) ON DELETE CASCADE,
    documento text NOT NULL,
    tipo_documento text NOT NULL CHECK (tipo_documento IN ('CPF', 'CNPJ')),
    nome_entidade text,
    tipo_entidade text,
    status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_analise', 'aprovado', 'reprovado')),
    responsavel_id uuid REFERENCES auth.users(id),
    observacoes text,
    data_verificacao timestamptz,
    criado_em timestamptz DEFAULT now(),
    atualizado_em timestamptz DEFAULT now()
);

-- 7. Tabela de Audit Log
CREATE TABLE IF NOT EXISTS public.historico_alteracoes (
    id bigserial PRIMARY KEY,
    schema_name text NOT NULL,
    table_name text NOT NULL,
    record_id text NOT NULL,
    old_data jsonb,
    new_data jsonb,
    action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    changed_by uuid REFERENCES auth.users(id),
    changed_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_operacoes_status ON estruturacao.operacoes(status);
CREATE INDEX IF NOT EXISTS idx_operacoes_pmo ON estruturacao.operacoes(pmo_id);
CREATE INDEX IF NOT EXISTS idx_pendencias_operacao ON estruturacao.pendencias(operacao_id);
CREATE INDEX IF NOT EXISTS idx_compliance_operacao ON estruturacao.compliance_checks(operacao_id);
CREATE INDEX IF NOT EXISTS idx_audit_table ON public.historico_alteracoes(table_name, changed_at);
```

### 5.2. Triggers e Functions

```sql
-- =====================================================
-- TRIGGERS E FUNCTIONS
-- =====================================================

-- 1. Trigger para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_operacoes_updated_at
    BEFORE UPDATE ON estruturacao.operacoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_pendencias_updated_at
    BEFORE UPDATE ON estruturacao.pendencias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_compliance_updated_at
    BEFORE UPDATE ON estruturacao.compliance_checks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. Trigger para preencher analistas via hierarquia
CREATE OR REPLACE FUNCTION preencher_analistas_hierarquia()
RETURNS TRIGGER AS $$
DECLARE
    v_financeiro_id uuid;
    v_contabil_id uuid;
BEGIN
    IF NEW.analista_gestao_id IS NOT NULL AND 
       (OLD.analista_gestao_id IS NULL OR OLD.analista_gestao_id != NEW.analista_gestao_id) THEN
        
        SELECT analista_financeiro_id, analista_contabil_id
        INTO v_financeiro_id, v_contabil_id
        FROM estruturacao.hierarquia_analistas
        WHERE analista_gestao_id = NEW.analista_gestao_id;
        
        IF v_financeiro_id IS NOT NULL THEN
            NEW.analista_financeiro_id := v_financeiro_id;
        END IF;
        
        IF v_contabil_id IS NOT NULL THEN
            NEW.analista_contabil_id := v_contabil_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_preencher_analistas
    BEFORE INSERT OR UPDATE ON estruturacao.operacoes
    FOR EACH ROW EXECUTE FUNCTION preencher_analistas_hierarquia();

-- 3. Trigger para criar operação quando emissão é aceita no comercial
CREATE OR REPLACE FUNCTION criar_operacao_de_emissao()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'aceita' AND (OLD.status IS NULL OR OLD.status != 'aceita') THEN
        INSERT INTO estruturacao.operacoes (
            id_emissao_comercial,
            numero_emissao,
            nome_operacao,
            volume,
            empresa_cnpj,
            categoria_id,
            veiculo_id,
            tipo_oferta_id
        ) VALUES (
            NEW.id,
            NEW.numero_emissao,
            COALESCE(NEW.nome, 'Operação ' || NEW.numero_emissao),
            COALESCE(NEW.volume_total, 0),
            NEW.cnpj_empresa,
            NEW.categoria_id,
            NEW.veiculo_id,
            NEW.tipo_oferta_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_criar_operacao
    AFTER INSERT OR UPDATE ON public.emissoes
    FOR EACH ROW EXECUTE FUNCTION criar_operacao_de_emissao();

-- 4. Trigger para Audit Log
CREATE OR REPLACE FUNCTION log_alteracao()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.historico_alteracoes (schema_name, table_name, record_id, new_data, action, changed_by)
        VALUES (TG_TABLE_SCHEMA, TG_TABLE_NAME, NEW.id::text, to_jsonb(NEW), 'INSERT', auth.uid());
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.historico_alteracoes (schema_name, table_name, record_id, old_data, new_data, action, changed_by)
        VALUES (TG_TABLE_SCHEMA, TG_TABLE_NAME, NEW.id::text, to_jsonb(OLD), to_jsonb(NEW), 'UPDATE', auth.uid());
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.historico_alteracoes (schema_name, table_name, record_id, old_data, action, changed_by)
        VALUES (TG_TABLE_SCHEMA, TG_TABLE_NAME, OLD.id::text, to_jsonb(OLD), 'DELETE', auth.uid());
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_operacoes
    AFTER INSERT OR UPDATE OR DELETE ON estruturacao.operacoes
    FOR EACH ROW EXECUTE FUNCTION log_alteracao();

CREATE TRIGGER audit_pendencias
    AFTER INSERT OR UPDATE OR DELETE ON estruturacao.pendencias
    FOR EACH ROW EXECUTE FUNCTION log_alteracao();

CREATE TRIGGER audit_compliance
    AFTER INSERT OR UPDATE OR DELETE ON estruturacao.compliance_checks
    FOR EACH ROW EXECUTE FUNCTION log_alteracao();
```

### 5.3. Row Level Security (RLS)

```sql
-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE estruturacao.operacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estruturacao.pendencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE estruturacao.compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE estruturacao.analistas_gestao ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para obter perfil do usuário
CREATE OR REPLACE FUNCTION public.get_user_profile()
RETURNS text AS $$
DECLARE
    v_profile text;
BEGIN
    SELECT perfil INTO v_profile
    FROM public.user_profiles
    WHERE id = auth.uid();
    
    RETURN v_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies para operacoes
CREATE POLICY "admin_full_access" ON estruturacao.operacoes
    FOR ALL USING (public.get_user_profile() = 'admin');

CREATE POLICY "gestor_estruturacao_full_access" ON estruturacao.operacoes
    FOR ALL USING (public.get_user_profile() = 'gestor_estruturacao');

CREATE POLICY "analista_estruturacao_full_access" ON estruturacao.operacoes
    FOR ALL USING (public.get_user_profile() = 'analista_estruturacao');

CREATE POLICY "gestor_gestao_view_all" ON estruturacao.operacoes
    FOR SELECT USING (public.get_user_profile() = 'gestor_gestao');

CREATE POLICY "gestor_gestao_update_analistas" ON estruturacao.operacoes
    FOR UPDATE USING (public.get_user_profile() = 'gestor_gestao')
    WITH CHECK (public.get_user_profile() = 'gestor_gestao');

-- Policies para pendencias
CREATE POLICY "full_access_pendencias" ON estruturacao.pendencias
    FOR ALL USING (public.get_user_profile() IN ('admin', 'gestor_estruturacao', 'analista_estruturacao'));

CREATE POLICY "gestor_gestao_view_pendencias" ON estruturacao.pendencias
    FOR SELECT USING (public.get_user_profile() = 'gestor_gestao');

-- Policies para compliance_checks
CREATE POLICY "full_access_compliance" ON estruturacao.compliance_checks
    FOR ALL USING (public.get_user_profile() IN ('admin', 'gestor_estruturacao', 'analista_estruturacao'));

-- Policies para analistas_gestao (leitura para todos autenticados)
CREATE POLICY "read_analistas" ON estruturacao.analistas_gestao
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "admin_manage_analistas" ON estruturacao.analistas_gestao
    FOR ALL USING (public.get_user_profile() = 'admin');
```

---

## 6. Migração de Dados

### 6.1. Mapeamento de Colunas

A tabela a seguir mapeia as colunas da planilha para as colunas do banco de dados:

| Coluna Planilha (Pipe) | Coluna Supabase | Observações |
|:---|:---|:---|
| UID | `id` | Gerar novo UUID |
| PMO | `pmo_id` | Buscar ID do usuário pelo nome |
| Categoria | `categoria_id` | Buscar ID da categoria pelo código |
| Operação | `nome_operacao` | Direto |
| Previsão de Liquidação | `data_previsao_liquidacao` | Converter formato de data |
| Veículo | `veiculo_id` | Buscar ID do veículo |
| Emissão | `numero_emissao` | Direto |
| Volume | `volume` | Converter para numérico |
| Remuneração | `fee_gestao` | Converter para decimal |
| Lastro | `lastro_id` | Buscar ID do lastro |
| Tipo Operação | `tipo_oferta_id` | Buscar ID do tipo |
| Boletagem | `boletagem` | Mapear valores |
| Data de Entrada no Pipe | `data_entrada_pipe` | Converter formato |
| Próximos Passos | `proximos_passos` | Direto |
| Alertas | `alertas` | Direto |
| Floating | `floating` | Converter para boolean |
| Status | `status` | Mapear valores |
| Tech | `status_tech` | Direto |
| Resumo | `resumo` | Direto |
| Analista Gestão | `analista_gestao_id` | Buscar ID pelo nome |
| Investidores | `investidores_obs` | Direto |
| Data de Liquidação | `data_liquidacao` | Converter formato |
| 1ª Data de Pagamento | `data_primeira_pagamento` | Converter formato |

### 6.2. Script de Migração (Python)

```python
import pandas as pd
from supabase import create_client, Client
from datetime import datetime
import os

# Configuração do Supabase
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def carregar_planilha(caminho: str) -> dict:
    """Carrega todas as abas relevantes da planilha."""
    return {
        'pipe': pd.read_excel(caminho, sheet_name='Pipe'),
        'historico': pd.read_excel(caminho, sheet_name='Histórico'),
        'pendencias': pd.read_excel(caminho, sheet_name='Pendências')
    }

def buscar_referencias():
    """Busca IDs das tabelas de referência."""
    categorias = {r['codigo']: r['id'] for r in supabase.table('categorias').select('id, codigo').execute().data}
    veiculos = {r['sigla']: r['id'] for r in supabase.table('veiculos').select('id, sigla').execute().data}
    usuarios = {r['nome']: r['id'] for r in supabase.table('user_profiles').select('id, nome').execute().data}
    analistas = {r['nome']: r['id'] for r in supabase.schema('estruturacao').table('analistas_gestao').select('id, nome').execute().data}
    return categorias, veiculos, usuarios, analistas

def converter_data(valor):
    """Converte diferentes formatos de data para ISO."""
    if pd.isna(valor):
        return None
    if isinstance(valor, datetime):
        return valor.isoformat()
    try:
        return pd.to_datetime(valor).isoformat()
    except:
        return None

def mapear_status(status_planilha: str) -> str:
    """Mapeia status da planilha para o banco."""
    mapeamento = {
        'Em Estruturação': 'Em Estruturação',
        'Liquidada': 'Liquidada',
        'On hold': 'On Hold',
        'Abortada': 'Abortada',
        'Finalizada': 'Finalizada'
    }
    return mapeamento.get(status_planilha, 'Em Estruturação')

def migrar_operacao(row, refs):
    """Converte uma linha da planilha para o formato do banco."""
    categorias, veiculos, usuarios, analistas = refs
    
    return {
        'numero_emissao': str(row.get('Emissão', '')),
        'nome_operacao': str(row.get('Operação', 'Sem nome')),
        'status': mapear_status(row.get('Status', 'Em Estruturação')),
        'pmo_id': usuarios.get(row.get('PMO')),
        'analista_gestao_id': analistas.get(row.get('Analista Gestão')),
        'categoria_id': categorias.get(row.get('Categoria')),
        'veiculo_id': veiculos.get(row.get('Veículo')),
        'volume': float(row.get('Volume', 0)) if pd.notna(row.get('Volume')) else 0,
        'data_entrada_pipe': converter_data(row.get('Data de Entrada no Pipe')),
        'data_previsao_liquidacao': converter_data(row.get('Previsão de Liquidação')),
        'data_liquidacao': converter_data(row.get('Data de Liquidação')),
        'floating': bool(row.get('Floating')) if pd.notna(row.get('Floating')) else False,
        'proximos_passos': str(row.get('Próximos Passos', '')) if pd.notna(row.get('Próximos Passos')) else None,
        'alertas': str(row.get('Alertas', '')) if pd.notna(row.get('Alertas')) else None,
        'resumo': str(row.get('Resumo', '')) if pd.notna(row.get('Resumo')) else None,
    }

def executar_migracao(caminho_planilha: str):
    """Executa a migração completa."""
    dados = carregar_planilha(caminho_planilha)
    refs = buscar_referencias()
    
    # Migrar Pipe e Histórico
    for aba in ['pipe', 'historico']:
        df = dados[aba]
        for _, row in df.iterrows():
            operacao = migrar_operacao(row, refs)
            try:
                supabase.schema('estruturacao').table('operacoes').insert(operacao).execute()
                print(f"Migrada: {operacao['numero_emissao']}")
            except Exception as e:
                print(f"Erro em {operacao['numero_emissao']}: {e}")
    
    print("Migração concluída!")

if __name__ == "__main__":
    executar_migracao("Pipe-Overview.xlsx")
```

---

## 7. Sistema de Autenticação e Perfis

### 7.1. Perfis de Usuário

| Perfil | Descrição | Permissões |
|:---|:---|:---|
| `admin` | Administrador do sistema | Acesso total a todas as funcionalidades e configurações |
| `gestor_estruturacao` | Gestor da equipe de estruturação | Visualizar todas as operações, atribuir PMOs, editar operações |
| `analista_estruturacao` | Analista de estruturação (PMO) | Editar todas as operações, gerenciar compliance |
| `gestor_gestao` | Gestor da equipe de gestão pós-liquidação | Visualizar pipeline, atribuir analistas de gestão às operações liquidadas |

### 7.2. Fluxo de Autenticação

O sistema utilizará o Supabase Auth com as seguintes configurações:

1. **Método de Login**: E-mail e senha (pode ser expandido para SSO no futuro).
2. **Criação de Usuários**: Apenas administradores podem criar novos usuários.
3. **Atribuição de Perfil**: Ao criar um usuário, o admin define o perfil na tabela `user_profiles`.

---

## 8. Automação de E-mails

### 8.1. Configuração do Resend

O serviço de e-mail **Resend** será utilizado para envios automáticos. A configuração será feita através de uma Supabase Edge Function.

### 8.2. Tipos de E-mail

| Tipo | Destinatário | Gatilho | Conteúdo |
|:---|:---|:---|:---|
| Cobrança de Compliance | PMO | Diário (cron) | Lista de compliance pendentes |
| Relatório de Gestão | Analistas de Gestão | Semanal (cron) | Resumo das operações sob responsabilidade |
| Relatório Financeiro | Analistas Financeiros | Semanal (cron) | Resumo financeiro das operações |
| Nova Atribuição | PMO/Analista | Evento (trigger) | Notificação de nova operação atribuída |

### 8.3. Exemplo de Edge Function

```typescript
// supabase/functions/enviar-email-compliance/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Buscar compliance pendentes agrupados por PMO
  const { data: pendentes } = await supabase
    .schema('estruturacao')
    .from('compliance_checks')
    .select(`
      *,
      operacao:operacoes(numero_emissao, nome_operacao, pmo:user_profiles(nome, email))
    `)
    .eq('status', 'pendente')

  // Agrupar por PMO e enviar e-mails
  const porPmo = pendentes?.reduce((acc, item) => {
    const pmoEmail = item.operacao?.pmo?.email
    if (pmoEmail) {
      if (!acc[pmoEmail]) acc[pmoEmail] = []
      acc[pmoEmail].push(item)
    }
    return acc
  }, {})

  for (const [email, items] of Object.entries(porPmo || {})) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'estruturacao@suasecuritizadora.com.br',
        to: email,
        subject: 'Compliance Pendente - Ação Necessária',
        html: `<p>Você tem ${items.length} verificações de compliance pendentes.</p>`
      })
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

## 9. Estrutura do Frontend

### 9.1. Páginas da Aplicação

| Página | Rota | Descrição | Perfis com Acesso |
|:---|:---|:---|:---|
| Login | `/login` | Tela de autenticação com design moderno | Público |
| Pipeline | `/` | Tabela avançada de operações em estruturação | Todos autenticados |
| Detalhes da Operação | (Sheet) | Detalhes de uma operação, aberto a partir do Pipeline | Todos autenticados |
| Pendências | `/pendencias` | Kanban de operações com pendências | Todos autenticados |
| Histórico | `/historico` | Arquivo de operações finalizadas com filtros | Todos autenticados |
| Gestão | `/gestao` | Atribuição de analistas (visão para gestores) | `gestor_estruturacao`, `gestor_gestao` |
| Admin | `/admin` | Gerenciamento de usuários e configurações | `admin` |
| Meu Perfil | `/perfil` | Configurações do usuário (ex: toggle Dark Mode) | Todos autenticados |

### 9.2. Componentes Principais

A interface utilizará a biblioteca **shadcn/ui** com as seguintes implementações-chave:

| Componente | Localização | Descrição |
|:---|:---|:---|
| `DataTable` | `/components/ui/data-table.tsx` | Tabela avançada baseada em `tanstack/react-table` |
| `SheetOperacao` | `/components/estruturacao/sheet-operacao.tsx` | Modal de detalhes com abas e formulários |
| `KanbanBoard` | `/components/pendencias/kanban-board.tsx` | Kanban com drag-and-drop usando `dnd-kit` |
| `StatusBadge` | `/components/ui/status-badge.tsx` | Badge colorido por status |
| `Header` | `/components/layout/header.tsx` | Cabeçalho com navegação e toggle de tema |
| `ComplianceWorkflow` | `/components/estruturacao/compliance-workflow.tsx` | Workflow visual de compliance |

### 9.3. Bibliotecas Adicionais a Instalar

```bash
# Animações
npm install framer-motion

# Tabela avançada
npm install @tanstack/react-table

# Drag and Drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Gráficos
npm install recharts

# Formatação de moeda
npm install react-number-format
```

---

## 10. Cronograma de Implementação

| Fase | Atividades | Duração Estimada |
|:---|:---|:---|
| **Fase 1: Backend** | Criação do schema, tabelas, triggers e RLS no Supabase | 3-4 dias |
| **Fase 2: Migração** | Execução e validação do script de migração de dados | 2-3 dias |
| **Fase 3: Frontend - Base** | Configuração do Design System (theming, fontes), Header, Navegação e Autenticação | 3-4 dias |
| **Fase 4: Frontend - Core** | Desenvolvimento da página de Pipeline com DataTable e o Sheet de Detalhes | 5-7 dias |
| **Fase 5: Frontend - Módulos** | Desenvolvimento das páginas de Pendências (Kanban) e Histórico | 3-5 dias |
| **Fase 6: Automação** | Implementação das Edge Functions para e-mails | 2-3 dias |
| **Fase 7: Finalização** | Testes integrados, ajustes de responsividade e polimento de animações | 3-5 dias |
| **Total** | | **21-31 dias** |

---

## 11. Próximos Passos

1. **Aprovação do Plano**: Validar este documento e esclarecer dúvidas pendentes.
2. **Execução da Fase 1 (Backend)**: Iniciar a implementação da estrutura no Supabase.
3. **Setup do Projeto Frontend**: Configurar o tema do `shadcn/ui` e instalar `framer-motion`.
4. **Desenvolvimento Iterativo**: Seguir as fases do cronograma, começando pela autenticação e a tela principal do Pipeline.

---

## 12. Referências

- [1] Documentação do Supabase: [https://supabase.com/docs](https://supabase.com/docs)
- [2] Supabase Row Level Security: [https://supabase.com/docs/guides/auth/row-level-security](https://supabase.com/docs/guides/auth/row-level-security)
- [3] Biblioteca de Componentes shadcn/ui: [https://ui.shadcn.com/](https://ui.shadcn.com/)
- [4] Framer Motion (Animações): [https://www.framer.com/motion/](https://www.framer.com/motion/)
- [5] TanStack Table v8: [https://tanstack.com/table/v8](https://tanstack.com/table/v8)
- [6] DND Kit (Drag and Drop): [https://dndkit.com/](https://dndkit.com/)
- [7] Serviço de E-mail Resend: [https://resend.com/](https://resend.com/)
- [8] 10 Best UI/UX Dashboard Design Principles for 2025 (Medium): [https://medium.com/@farazjonanda/10-best-ui-ux-dashboard-design-principles-for-2025-2f9e7c21a454](https://medium.com/@farazjonanda/10-best-ui-ux-dashboard-design-principles-for-2025-2f9e7c21a454)
