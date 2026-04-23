# POSTADOR — Suite de Automação de Conteúdo para Instagram sobre IA

Plataforma full-stack completa para operação de conteúdo no Instagram,
com IA agêntica, pipeline editorial, analytics e automação controlada.

## Stack

- **Frontend:** Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Backend:** tRPC (API type-safe) + Next.js API Routes
- **Banco:** PostgreSQL + Prisma ORM
- **Cache/Filas:** Redis + BullMQ
- **Auth:** NextAuth v5
- **IA:** Multi-provider (OpenAI, Anthropic, Groq) via Gateway
- **Vídeo:** Remotion (adapter)
- **Publicação:** SocialFlow adapter (Python FastAPI)
- **Pesquisa:** last30days adapter (Python CLI/HTTP)
- **Monorepo:** Turborepo

## Repositórios Integrados

| Repo | Função | Modo |
|------|--------|------|
| `SocialFlow-main` | Publicação em redes sociais | HTTP Adapter |
| `last30days-skill-main` | Pesquisa de tendências | CLI/HTTP Adapter |
| `react-video-editor-main` | Editor de vídeo visual | Componentes integrados |
| `remotion-main` | Renderização de vídeo | npm packages |

## Módulos Implementados

- **Dashboard Central** — visão operacional completa
- **Módulo de Ideias** — geração com IA + briefings + aprovação
- **Reference Radar** — monitoramento de perfis + oportunidades
- **Agency Ops (Control Tower)** — 15 agentes especializados
- **Carrosséis** — geração estruturada + editor slide a slide
- **Vídeos** — roteiro + Remotion render queue
- **Publicações** — agendamento + SocialFlow adapter + retry
- **Comentários** — classificação IA + sugestões + aprovação humana
- **Analytics** — métricas + score proprietário + recomendações
- **Calendário** — visão mensal/semanal + slots
- **Assets** — biblioteca de mídia

## Setup Rápido

### 1. Pré-requisitos
```bash
node >= 20
npm >= 10
docker
```

### 2. Subir infraestrutura
```bash
cd docker
docker compose up postgres redis -d
```

### 3. Instalar dependências
```bash
# Na raiz do monorepo
npm install
```

### 4. Configurar variáveis
```bash
cp .env.example .env
# Editar .env com suas credenciais
```

### 5. Banco de dados
```bash
cd packages/database
npm run db:push       # Criar tabelas
npm run db:seed       # Popular agentes e dados iniciais
```

### 6. Rodar em desenvolvimento
```bash
# Na raiz — roda tudo com Turborepo
npm run dev
```

Acesse: http://localhost:3000

### 7. Rodar workers separadamente
```bash
cd services/workers
npm run dev
```

## Variáveis Mínimas para Funcionar

```env
DATABASE_URL="postgresql://postador:postador_dev_senha@localhost:5432/postador_db"
REDIS_URL="redis://localhost:6379"
NEXTAUTH_SECRET="qualquer-string-longa-aleatoria"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="seu@email.com"
ADMIN_PASSWORD="sua-senha"
OPENAI_API_KEY="sk-..."
```

## Arquitetura de Agentes

O sistema opera com 15 agentes especializados orquestrados centralmente:

```
Chief Strategy → Trend Research → Reference Radar
      ↓
Content Planner → Creative Director
      ↓
Carousel Agent + Video Script Agent + Copy Agent
      ↓
Production Agent → Compliance & Quality Agent
      ↓
Publishing Agent → Analytics Agent
      ↓
Community Agent + Repurpose Agent + Ops Manager
```

## Integração com Repositórios Existentes

### SocialFlow
O adapter em `apps/web/src/lib/adapters/socialflow-adapter.ts` chama
o FastAPI do SocialFlow via HTTP. Rode o SocialFlow separadamente:
```bash
cd SocialFlow-main/backend
pip install -r requirements.txt
uvicorn main:app --port 8000
```

### last30days (Tendências)
O adapter em `apps/web/src/lib/adapters/research-adapter.ts` chama
o Python CLI diretamente ou via HTTP. Configure:
```env
TRENDS_REPO_URL="http://localhost:4000"  # Se exposto como API
# ou deixe em branco para usar CLI local
```

### Remotion
O adapter suporta render local (mock), API HTTP ou AWS Lambda:
```env
REMOTION_API_URL="http://localhost:3001"  # Render via API
# ou
REMOTION_LAMBDA_FUNCTION_NAME="remotion-render"  # AWS Lambda
```

## Estrutura de Pastas

```
POSTADOR/
├── apps/
│   └── web/                    # Next.js app principal
│       └── src/
│           ├── app/            # Next.js App Router
│           ├── components/     # Componentes React
│           └── lib/
│               ├── ai/         # Gateway + Prompts
│               ├── adapters/   # SocialFlow, Remotion, Research
│               ├── agents/     # Orquestrador agêntico
│               ├── queues/     # BullMQ queues
│               └── trpc/       # API type-safe
├── packages/
│   ├── database/               # Prisma schema + client
│   └── types/                  # Tipos compartilhados
├── services/
│   └── workers/                # Workers BullMQ
├── docker/
│   └── docker-compose.yml
└── SocialFlow-main/            # Repositório existente
└── last30days-skill-main/      # Repositório existente
└── react-video-editor-main/    # Repositório existente
└── remotion-main/              # Repositório existente
```

## Segurança e Compliance

- Toda publicação exige checklist pré-aprovação
- Respostas a comentários passam por aprovação humana
- Score de risco obrigatório antes de auto-aprovar
- Trilha completa de auditoria em `audit_logs`
- Limites de orçamento por agente configuráveis
- Modo de automação configurável por agente (Manual → Autônomo)

## Fase 1 — MVP (Atual)
- [x] Dashboard central
- [x] Geração de ideias com IA
- [x] Carrosséis com IA
- [x] Roteiros de vídeo
- [x] Publicação via SocialFlow adapter
- [x] Comentários assistidos por IA
- [x] Reference Radar básico
- [x] Agency Control Tower (15 agentes)
- [x] Analytics básico

## Fase 2 — Próximos Passos
- [ ] Editor visual de carrosséis (drag & drop)
- [ ] Integração completa com react-video-editor
- [ ] Render via Remotion Lambda
- [ ] Instagram Graph API direto
- [ ] Experimentos A/B de hook
- [ ] Social Media Strategy Engine completo
- [ ] Webhooks de analytics do Instagram
- [ ] Mobile responsivo completo
