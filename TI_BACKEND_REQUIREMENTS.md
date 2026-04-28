# Documentação de Requisitos e Setup de Backend - POSTADOR
**Destinatários:** Equipe de TI (André e Helcio)
**Objetivo:** Detalhar a arquitetura atual, o que falta ser configurado e os passos para subir a plataforma para produção de forma totalmente funcional.

---

## 1. Arquitetura Atual do Projeto
O projeto está configurado como um **Monorepo** utilizando [Turborepo](https://turbo.build/repo).

### Estrutura Principal:
*   `apps/web`: Aplicação principal em **Next.js 14** (App Router). Contém tanto o frontend quanto o backend principal através de rotas da API (`/api/*`) e **tRPC**.
*   `packages/database`: Camada de acesso a dados usando **Prisma ORM**.
*   `packages/types`: Tipagens compartilhadas do TypeScript.
*   `services/*`: Diretórios preparados para futuros microsserviços/workers (gateway de IA, renderização de vídeo, analytics), mas que atualmente **não estão implementados**. A lógica atual reside quase toda no Next.js.

---

## 2. Estado Atual (Modo de Demonstração)
Para a apresentação atual, o sistema está rodando em um **modo de demonstração (Mockup Mode)**.
Isso significa que:
1.  **A Autenticação (NextAuth) foi desligada.** O `middleware.ts` e o `layout.tsx` foram alterados para pular a checagem de login e injetar um usuário falso ("Demo User").
2.  **Mock Data no Frontend:** Muitas páginas estão tipadas usando dados falsos e contornos (`as any`) para evitar falhas de build de prototipação.
3.  **Banco de Dados:** O `schema.prisma` está configurado para usar **SQLite local** (`provider = "sqlite"`).
4.  **Ignorando Erros no Build:** O `next.config.js` foi configurado para ignorar erros do TypeScript e ESLint em produção para agilizar os deploys da demonstração.

---

## 3. O que precisa ser feito para operar em Produção Real

### 3.1. Migração e Setup do Banco de Dados
A plataforma **precisa de um banco PostgreSQL** para suportar a carga de produção e concorrência real.

**Passo a passo:**
1.  Vá até o arquivo `packages/database/prisma/schema.prisma`.
2.  Altere o `provider = "sqlite"` para `provider = "postgresql"`.
3.  Suba uma instância do PostgreSQL (AWS RDS, Supabase, Neon, Docker local, etc.).
4.  Crie a string de conexão e adicione na variável de ambiente `DATABASE_URL`.
5.  Rode a migração para criar as tabelas no novo banco:
    ```bash
    cd packages/database
    npx prisma db push
    # ou "npx prisma migrate dev" se quiserem criar um histórico versionado de migrações
    ```

### 3.2. Reativar o Sistema de Autenticação
Quando for operar de verdade, a autenticação precisará ser religada:
1.  Reverter as alterações recentes no `apps/web/src/middleware.ts` para voltar a usar o `withAuth`.
2.  Reverter o `apps/web/src/app/(dashboard)/layout.tsx` para usar o `getServerSession()` e bloquear usuários não logados.
3.  Reverter a raiz `apps/web/src/app/page.tsx` para redirecionar para `/login` se não houver sessão ativa.
4.  Garantir que as variáveis `NEXTAUTH_SECRET` e `NEXTAUTH_URL` estejam configuradas no ambiente.

### 3.3. Configuração de Variáveis de Ambiente (.env)
A equipe de TI precisará providenciar e configurar as seguintes chaves no ambiente de hospedagem da aplicação:

```env
# BANCO DE DADOS
DATABASE_URL="postgresql://usuario:senha@host:5432/postador_db"

# AUTENTICAÇÃO
NEXTAUTH_SECRET="gerar_uma_hash_segura_aqui"
NEXTAUTH_URL="https://app.seudominio.com.br"
ADMIN_EMAIL="admin@seudominio.com"
ADMIN_PASSWORD="senha_super_segura"

# APIS DE INTELIGÊNCIA ARTIFICIAL
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GROQ_API_KEY="gsk_..."
AI_DEFAULT_PROVIDER="anthropic"
AI_DEFAULT_MODEL="claude-sonnet-3-5"

# INTEGRAÇÃO SOCIALFLOW (Agendamento e Publicação de Posts)
SOCIALFLOW_API_URL="https://api.socialflow.com" # ou endpoint interno na VPC
SOCIALFLOW_API_KEY="sua_chave_do_socialflow"

# OUTRAS INTEGRAÇÕES
SCRAPECREATORS_API_KEY="sua_chave"
BRAVE_API_KEY="sua_chave"
```

### 3.4. Fluxos Assíncronos e Serviços de Terceiros
A plataforma espera se conectar a algumas "engrenagens" externas. A TI precisa garantir que elas existam e estejam responsivas:
*   **Video Editor / Remotion**: O código do Next.js (`next.config.js`) mostra que há um proxy para as rotas `/video-editor` apontando localmente para `http://localhost:3002`. Esse serviço de edição/renderização precisará ser hospedado separadamente ou integrado na pipeline principal e ter a URL ajustada no config.
*   **SocialFlow**: O Next.js também faz um proxy de `/api/socialflow` para `http://localhost:8001`. Esse serviço parece ser o responsável real pela publicação nas redes sociais. Ele deve estar rodando na mesma VPC ou acessível publicamente via autenticação.

---

## 4. Scripts e Rotina de Build
O projeto está hospedado no Netlify, mas para rodar em qualquer lugar (Vercel, AWS Amplify, Docker, VPS), o fluxo padronizado de build é este:

1.  **Instalar dependências na raiz:**
    ```bash
    npm install
    ```
2.  **Gerar o cliente do Banco de Dados Prisma:**
    ```bash
    npx prisma generate --schema=packages/database/prisma/schema.prisma
    ```
3.  **Buildar o projeto usando Turborepo:**
    ```bash
    npx turbo run build --filter=@postador/web
    ```
*(No Netlify atual, foi configurado o plugin `@netlify/plugin-nextjs` no `netlify.toml` para subir o servidor SSR (Server-Side Rendering) adequadamente e contornar erros "Page Not Found").*

---

## 5. Resumo de Tarefas para a TI (To-Do List de Produção)
- [ ] Mudar o `schema.prisma` de `sqlite` para `postgresql`.
- [ ] Provisionar o servidor PostgreSQL.
- [ ] Rodar o comando de `prisma db push` contra o banco de produção para criar as tabelas.
- [ ] Configurar as chaves de API reais no `.env` da hospedagem em produção.
- [ ] Identificar, conteinerizar e levantar a API do **SocialFlow** (atualmente esperada na porta 8001).
- [ ] Identificar, conteinerizar e levantar a API do **Video Editor / Remotion** (atualmente esperada na porta 3002).
- [ ] Desativar as flags `ignoreBuildErrors: true` e `ignoreDuringBuilds: true` do `apps/web/next.config.js` e arrumar os erros de Typescript assim que a prototipação for finalizada.
- [ ] Reativar a camada de segurança do NextAuth (revertendo os commits de "Demo Mode").
- [ ] Definir a estratégia de *cron jobs* ou filas assíncronas (BullMQ, Redis, etc.) se a plataforma for automatizar fluxos pesados e background jobs, visto que os diretórios em `/services/workers` ainda estão vazios.

*Boa sorte! Qualquer dúvida arquitetural, a documentação oficial do Next.js (App Router), tRPC e do Prisma ORM são as melhores referências para a base principal deste código.*
