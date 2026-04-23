// =============================================================================
// POSTADOR — Seed do Banco de Dados
// Popula agentes, workflows, prompts e dados iniciais
// =============================================================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do POSTADOR...");

  // =========================================================================
  // AGENTES
  // =========================================================================
  const agents = [
    { slug: "chief_strategy",   name: "Chief Strategy Agent",     role: "strategy",    description: "Define direção editorial, metas e mix de conteúdo" },
    { slug: "trend_research",   name: "Trend Research Agent",     role: "research",    description: "Pesquisa tendências e consolida sinais de oportunidade" },
    { slug: "reference_radar",  name: "Reference Radar Agent",    role: "research",    description: "Monitora perfis de referência e extrai padrões editoriais" },
    { slug: "content_planner",  name: "Content Planner Agent",    role: "planning",    description: "Transforma oportunidades em pauta e calendário" },
    { slug: "creative_director",name: "Creative Director Agent",  role: "creative",    description: "Define ângulo criativo, hook e direção narrativa" },
    { slug: "carousel",         name: "Carousel Agent",           role: "production",  description: "Gera estruturas e conteúdo de carrosséis" },
    { slug: "video_script",     name: "Video Script Agent",       role: "production",  description: "Gera roteiros, cenas e voice-over para vídeos" },
    { slug: "production",       name: "Production Agent",         role: "production",  description: "Orquestra geração de assets, renders e produções" },
    { slug: "copy",             name: "Copy Agent",               role: "production",  description: "Gera legendas, CTAs, hashtags e variações de copy" },
    { slug: "compliance",       name: "Compliance & Quality Agent",role: "quality",    description: "Revisa risco, originalidade, qualidade e compliance" },
    { slug: "publishing",       name: "Publishing Agent",         role: "publishing",  description: "Prepara, valida e executa publicações" },
    { slug: "community",        name: "Community Agent",          role: "community",   description: "Analisa comentários e sugere respostas assistidas" },
    { slug: "analytics",        name: "Analytics Agent",          role: "analytics",   description: "Coleta métricas e gera relatórios de performance" },
    { slug: "repurpose",        name: "Repurpose Agent",          role: "strategy",    description: "Identifica e propõe reaproveitamento de conteúdo" },
    { slug: "ops_manager",      name: "Operations Manager Agent", role: "ops",         description: "Monitora SLAs, gargalos e saúde da operação" },
  ];

  for (const agent of agents) {
    await prisma.agent.upsert({
      where: { slug: agent.slug },
      update: { name: agent.name, description: agent.description },
      create: {
        ...agent,
        status: "IDLE",
        mode: "ASSISTED",
        isEnabled: true,
        capabilities: JSON.stringify({ tasks: [], canAutoApprove: false, requiresHuman: true }),
      },
    });
  }
  console.log(`✅ ${agents.length} agentes criados`);

  // =========================================================================
  // WORKFLOWS / PLAYBOOKS
  // =========================================================================
  const workflows = [
    {
      slug: "daily_routine",
      name: "Rotina Diária",
      type: "playbook",
      description: "Executa pesquisa de tendências, planejamento e monitoramento de comentários",
      steps: [
        { agentSlug: "trend_research",   name: "Pesquisa de tendências",  requiresApproval: false },
        { agentSlug: "content_planner",  name: "Atualizar backlog",        requiresApproval: false },
        { agentSlug: "community",        name: "Processar comentários",    requiresApproval: true },
        { agentSlug: "analytics",        name: "Coletar métricas",         requiresApproval: false },
      ],
    },
    {
      slug: "weekly_planning",
      name: "Planejamento Semanal",
      type: "playbook",
      description: "Análise estratégica, planejamento editorial e definição de prioridades",
      steps: [
        { agentSlug: "chief_strategy",    name: "Análise estratégica",      requiresApproval: true },
        { agentSlug: "trend_research",    name: "Consolidar tendências",     requiresApproval: false },
        { agentSlug: "reference_radar",   name: "Benchmarking de referências",requiresApproval: false },
        { agentSlug: "content_planner",   name: "Montar calendário",         requiresApproval: true },
        { agentSlug: "repurpose",         name: "Oportunidades de reuso",    requiresApproval: false },
      ],
    },
    {
      slug: "content_creation",
      name: "Criação de Conteúdo",
      type: "playbook",
      description: "Pipeline completo de criação: brief → produção → revisão → aprovação",
      steps: [
        { agentSlug: "creative_director", name: "Direção criativa",     requiresApproval: true },
        { agentSlug: "carousel",          name: "Gerar carrossel",      requiresApproval: false },
        { agentSlug: "copy",              name: "Escrever legenda",     requiresApproval: false },
        { agentSlug: "compliance",        name: "Revisão de qualidade", requiresApproval: true },
      ],
    },
    {
      slug: "weekly_analysis",
      name: "Análise Semanal",
      type: "playbook",
      description: "Relatório de performance, insights e recomendações",
      steps: [
        { agentSlug: "analytics",  name: "Gerar relatório",          requiresApproval: false },
        { agentSlug: "repurpose",  name: "Identificar top posts",    requiresApproval: false },
        { agentSlug: "ops_manager",name: "Avaliar eficiência",       requiresApproval: false },
      ],
    },
  ];

  for (const wf of workflows) {
    await prisma.workflow.upsert({
      where: { slug: wf.slug },
      update: { name: wf.name, steps: JSON.stringify(wf.steps) },
      create: { ...wf, steps: JSON.stringify(wf.steps), isActive: true },
    });
  }
  console.log(`✅ ${workflows.length} workflows criados`);

  // =========================================================================
  // PILARES DE CONTEÚDO PADRÃO (será vinculado ao primeiro usuário)
  // =========================================================================
  const firstUser = await prisma.user.findFirst();
  if (firstUser) {
    const pillars = [
      { name: "Notícias de IA",       color: "#6366f1", percentage: 20, description: "Cobertura de lançamentos, pesquisas e novidades do ecossistema" },
      { name: "Ferramentas",          color: "#10b981", percentage: 25, description: "Reviews, comparativos e tutoriais de ferramentas de IA" },
      { name: "Automações",           color: "#f59e0b", percentage: 20, description: "Casos de uso práticos e workflows automatizados com IA" },
      { name: "Opinião/Estratégia",   color: "#8b5cf6", percentage: 15, description: "Visão crítica sobre o mercado e tendências de longo prazo" },
      { name: "Tutoriais",            color: "#3b82f6", percentage: 20, description: "Conteúdo educativo passo a passo para diferentes níveis" },
    ];

    for (const pillar of pillars) {
      const exists = await prisma.contentPillar.findFirst({
        where: { userId: firstUser.id, name: pillar.name },
      });
      if (!exists) {
        await prisma.contentPillar.create({ data: { ...pillar, userId: firstUser.id } });
      }
    }
    console.log(`✅ ${pillars.length} pilares editoriais criados para ${firstUser.email}`);

    // KPIs padrão
    const kpis = [
      { name: "Posts por semana",        metric: "posts_per_week",           target: 4,   period: "weekly" },
      { name: "Reels por semana",         metric: "reels_per_week",           target: 2,   period: "weekly" },
      { name: "Taxa de consistência",     metric: "consistency_rate",         target: 0.9, period: "weekly" },
      { name: "Tempo médio de produção",  metric: "avg_production_hours",     target: 4,   period: "weekly" },
      { name: "Resp. a comentários (h)",  metric: "comment_response_hours",   target: 24,  period: "weekly" },
      { name: "Reaproveitamentos/mês",    metric: "repurpose_per_month",      target: 4,   period: "monthly" },
    ];

    for (const kpi of kpis) {
      const exists = await prisma.kpiTarget.findFirst({ where: { userId: firstUser.id, metric: kpi.metric } });
      if (!exists) {
        await prisma.kpiTarget.create({ data: { ...kpi, userId: firstUser.id } });
      }
    }
    console.log(`✅ ${kpis.length} KPIs configurados`);

    // Budget padrão
    const budgetExists = await prisma.budget.findFirst({ where: { userId: firstUser.id } });
    if (!budgetExists) {
      await prisma.budget.create({
        data: {
          userId: firstUser.id,
          name: "Orçamento IA Mensal",
          type: "ai_tokens",
          limitUsd: 50,
          period: "monthly",
          alertAt: 0.8,
        },
      });
      console.log("✅ Orçamento IA criado: $50/mês");
    }
  }

  console.log("\n🎉 Seed concluído com sucesso!");
  console.log("📝 Próximos passos:");
  console.log("   1. Configure .env com suas credenciais");
  console.log("   2. npm run dev");
  console.log("   3. Acesse http://localhost:3000");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
