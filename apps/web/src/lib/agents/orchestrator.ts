// =============================================================================
// POSTADOR — Agent Orchestrator
// Orquestra os 15 agentes especializados da camada agêntica
// Executa playbooks, gerencia memória, controla aprovações
// =============================================================================

import { prisma } from "@postador/database";
import { aiGateway } from "@/lib/ai/gateway";

interface EnqueueAgentOptions {
  agentSlug: string;
  userId: string;
  context?: Record<string, unknown>;
  priority?: number;
}

interface RunPlaybookOptions {
  workflowId: string;
  userId: string;
  context?: Record<string, unknown>;
}

interface ApprovalDecisionOptions {
  approvalId: string;
  decision: "APPROVED" | "REJECTED" | "NEEDS_REVISION";
  entityType: string;
  entityId: string | null;
}

class AgentOrchestrator {
  // =========================================================================
  // ENFILEIRAR AGENTE
  // =========================================================================
  async enqueueAgent(options: EnqueueAgentOptions) {
    const run = await prisma.agentRun.create({
      data: {
        agentSlug: options.agentSlug,
        userId: options.userId,
        status: "PENDING",
        input: JSON.stringify(options.context ?? {}),
        metadata: JSON.stringify({ priority: options.priority ?? 0 }),
      },
    });

    // Executar de forma assíncrona
    setImmediate(() => {
      this.executeAgent(run.id, options.agentSlug, options.userId, options.context ?? {})
        .catch((err) => {
          console.error(`[Orchestrator] Agent run ${run.id} falhou:`, err);
          prisma.agentRun.update({
            where: { id: run.id },
            data: { status: "FAILED", errorMessage: String(err), completedAt: new Date() },
          }).catch(console.error);
        });
    });

    return run;
  }

  // =========================================================================
  // EXECUTAR AGENTE
  // =========================================================================
  private async executeAgent(
    runId: string,
    agentSlug: string,
    userId: string,
    context: Record<string, unknown>
  ) {
    await prisma.agentRun.update({
      where: { id: runId },
      data: { status: "RUNNING", startedAt: new Date() },
    });

    // Buscar configuração do agente
    const agent = await prisma.agent.findUnique({ where: { slug: agentSlug } });
    if (!agent || !agent.isEnabled) {
      throw new Error(`Agente ${agentSlug} não encontrado ou desabilitado`);
    }

    // Buscar memória do agente
    const memories = await this.getAgentMemory(agentSlug, userId);

    let output: Record<string, unknown> = {};
    let tokensUsed = 0;
    let costUsd = 0;

    try {
      // Dispatch para o agente correto
      switch (agentSlug) {
        case "chief_strategy":
          ({ output, tokensUsed, costUsd } = await this.runChiefStrategyAgent(userId, context, memories));
          break;
        case "trend_research":
          ({ output, tokensUsed, costUsd } = await this.runTrendResearchAgent(userId, context, memories));
          break;
        case "content_planner":
          ({ output, tokensUsed, costUsd } = await this.runContentPlannerAgent(userId, context, memories));
          break;
        case "creative_director":
          ({ output, tokensUsed, costUsd } = await this.runCreativeDirectorAgent(userId, context, memories));
          break;
        case "carousel":
          ({ output, tokensUsed, costUsd } = await this.runCarouselAgent(userId, context, memories));
          break;
        case "analytics":
          ({ output, tokensUsed, costUsd } = await this.runAnalyticsAgent(userId, context, memories));
          break;
        case "community":
          ({ output, tokensUsed, costUsd } = await this.runCommunityAgent(userId, context, memories));
          break;
        case "repurpose":
          ({ output, tokensUsed, costUsd } = await this.runRepurposeAgent(userId, context, memories));
          break;
        default:
          output = { message: `Agente ${agentSlug} executado (stub)`, context };
      }

      // Salvar memória atualizada
      if (output.memoryUpdate) {
        await this.updateAgentMemory(agentSlug, userId, output.memoryUpdate as Record<string, unknown>);
      }

      // Registrar custo
      if (costUsd > 0) {
        await prisma.costEvent.create({
          data: {
            agentSlug,
            type: "ai_token",
            amount: costUsd,
            description: `Agent run: ${agentSlug}`,
            entityType: "agent_run",
            entityId: runId,
          },
        });
      }

      await prisma.agentRun.update({
        where: { id: runId },
        data: {
          status: "COMPLETED",
          output: output as any,
          tokensUsed,
          costUsd,
          completedAt: new Date(),
          durationMs: Date.now() - (await prisma.agentRun.findUnique({ where: { id: runId } }))?.startedAt?.getTime()!,
        },
      });

    } catch (err) {
      await prisma.agentRun.update({
        where: { id: runId },
        data: { status: "FAILED", errorMessage: String(err), completedAt: new Date() },
      });
      throw err;
    }
  }

  // =========================================================================
  // PLAYBOOKS
  // =========================================================================
  async runPlaybook(options: RunPlaybookOptions) {
    const workflow = await prisma.workflow.findUnique({ where: { id: options.workflowId } });
    if (!workflow) throw new Error("Workflow não encontrado");

    const run = await prisma.workflowRun.create({
      data: {
        workflowId: options.workflowId,
        userId: options.userId,
        status: "RUNNING",
        context: JSON.stringify(options.context ?? {}),
        totalSteps: (JSON.parse(workflow.steps as string) as any[]).length,
        startedAt: new Date(),
      },
    });

    setImmediate(() => this.executePlaybook(run.id, workflow, options.userId, options.context ?? {})
      .catch(console.error));

    return run;
  }

  private async executePlaybook(
    runId: string,
    workflow: any,
    userId: string,
    context: Record<string, unknown>
  ) {
    const steps: any[] = workflow.steps ?? [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]!;

      await prisma.workflowRun.update({
        where: { id: runId },
        data: { currentStep: i },
      });

      // Executar agente do step
      if (step.agentSlug) {
        const agentRun = await this.enqueueAgent({
          agentSlug: step.agentSlug,
          userId,
          context: { ...context, step: i, stepConfig: step.config },
        });

        // Associar ao workflow run
        await prisma.agentRun.update({
          where: { id: agentRun.id },
          data: { workflowRunId: runId },
        });

        // Se exige aprovação humana, pausar
        if (step.requiresApproval) {
          await prisma.workflowRun.update({
            where: { id: runId },
            data: { status: "WAITING_HUMAN" },
          });
          // Neste ponto aguardaria aprovação
          // Em produção: aguardar webhook/event de aprovação
          break;
        }
      }

      // Pequeno delay entre steps
      await new Promise((r) => setTimeout(r, 500));
    }

    await prisma.workflowRun.update({
      where: { id: runId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  }

  // =========================================================================
  // DECISÃO DE APROVAÇÃO
  // =========================================================================
  async onApprovalDecision(options: ApprovalDecisionOptions) {
    // Notificar workflows em espera
    const waitingRuns = await prisma.workflowRun.findMany({
      where: { status: "WAITING_HUMAN" },
    });

    for (const run of waitingRuns) {
      if (options.decision === "APPROVED") {
        // Retomar workflow
        await prisma.workflowRun.update({
          where: { id: run.id },
          data: { status: "RUNNING" },
        });
      }
    }

    // Notificação para o usuário
    await prisma.notification.create({
      data: {
        userId: (await prisma.approval.findUnique({ where: { id: options.approvalId } }))?.userId ?? "",
        type: options.decision === "APPROVED" ? "success" : "info",
        title: `Aprovação ${options.decision === "APPROVED" ? "concluída" : "revisada"}`,
        message: `Item ${options.entityType} foi ${options.decision === "APPROVED" ? "aprovado" : "enviado para revisão"}.`,
      },
    }).catch(console.error);
  }

  // =========================================================================
  // MEMÓRIA DOS AGENTES
  // =========================================================================
  private async getAgentMemory(agentSlug: string, userId: string): Promise<Record<string, unknown>> {
    const memories = await prisma.agentMemory.findMany({
      where: { agentSlug, userId, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    });
    return Object.fromEntries(memories.map((m) => [m.key, m.value]));
  }

  private async updateAgentMemory(
    agentSlug: string,
    userId: string,
    updates: Record<string, unknown>
  ) {
    await Promise.all(
      Object.entries(updates).map(([key, value]) =>
        prisma.agentMemory.upsert({
          where: { agentSlug_userId_key_type: { agentSlug, userId, key, type: "operational" } },
          create: { agentSlug, userId, key, value: value as any, type: "operational" },
          update: { value: value as any, updatedAt: new Date() },
        })
      )
    );
  }

  // =========================================================================
  // IMPLEMENTAÇÕES DOS AGENTES
  // =========================================================================

  private async runChiefStrategyAgent(userId: string, context: any, memories: any) {
    const [recentPerf, pillars, kpis] = await Promise.all([
      prisma.analyticsSnapshot.findMany({
        where: { publication: { userId } },
        orderBy: { snapshotAt: "desc" },
        take: 20,
      }),
      prisma.contentPillar.findMany({ where: { userId, isActive: true } }),
      prisma.kpiTarget.findMany({ where: { userId, isActive: true } }),
    ]);

    const result = await aiGateway.complete({
      messages: [
        {
          role: "system",
          content: `Você é o Chief Strategy Agent de uma operação de conteúdo sobre IA para Instagram.
Analise dados de performance, pilares e KPIs. Gere diretrizes estratégicas semanais.
Priorize crescimento orgânico, consistência editorial e autoridade temática.
Retorne JSON válido.`,
        },
        {
          role: "user",
          content: JSON.stringify({
            recentPerformance: recentPerf.slice(0, 5),
            pillars: pillars.map((p) => ({ name: p.name, percentage: p.percentage })),
            kpis: kpis.map((k) => ({ metric: k.metric, target: k.target, period: k.period })),
            memories,
            context,
          }),
        },
      ],
      responseFormat: "json",
      temperature: 0.6,
      maxTokens: 2000,
    });

    let plan: any = {};
    try { plan = JSON.parse(result.content); } catch { plan = { raw: result.content }; }

    return {
      output: { strategicPlan: plan, generatedAt: new Date().toISOString() },
      tokensUsed: result.inputTokens + result.outputTokens,
      costUsd: result.costUsd,
    };
  }

  private async runTrendResearchAgent(userId: string, context: any, memories: any) {
    const recentSignals = await prisma.trendSignal.findMany({
      where: { isProcessed: false },
      orderBy: { relevanceScore: "desc" },
      take: 30,
    });

    const result = await aiGateway.complete({
      messages: [
        {
          role: "system",
          content: `Você é o Trend Research Agent. Analise sinais de tendência e identifique oportunidades de conteúdo sobre IA.
Priorize por urgência, novidade e fit com o perfil. Retorne JSON.`,
        },
        {
          role: "user",
          content: JSON.stringify({ signals: recentSignals.slice(0, 10), context }),
        },
      ],
      responseFormat: "json",
      temperature: 0.5,
    });

    let opportunities: any = {};
    try { opportunities = JSON.parse(result.content); } catch { opportunities = {}; }

    return {
      output: { opportunities, processedSignals: recentSignals.length },
      tokensUsed: result.inputTokens + result.outputTokens,
      costUsd: result.costUsd,
    };
  }

  private async runContentPlannerAgent(userId: string, context: any, _memories: any) {
    const [ideas, calendar] = await Promise.all([
      prisma.contentIdea.findMany({
        where: { userId, status: "IDEA", frozenAt: null },
        orderBy: { urgencyScore: "desc" },
        take: 20,
      }),
      prisma.publication.findMany({
        where: { userId, status: "SCHEDULED" },
        orderBy: { scheduledFor: "asc" },
        take: 10,
      }),
    ]);

    return {
      output: {
        message: "Plano de conteúdo atualizado",
        ideasAvailable: ideas.length,
        scheduledPosts: calendar.length,
        recommendations: [
          ideas.length < 5 ? "⚠️ Backlog baixo — gere mais ideias" : "✅ Backlog saudável",
          calendar.length === 0 ? "⚠️ Nenhum post agendado" : `✅ ${calendar.length} posts na fila`,
        ],
      },
      tokensUsed: 0,
      costUsd: 0,
    };
  }

  private async runCreativeDirectorAgent(userId: string, context: any, _memories: any) {
    const ideas = await prisma.contentIdea.findMany({
      where: { userId, status: "BRIEFING" },
      take: 5,
    });

    return {
      output: {
        message: "Direção criativa revisada",
        ideasReviewed: ideas.length,
        guidelines: ["Manter tom didático e acessível", "Hook nos primeiros 3 segundos", "CTA claro no final"],
      },
      tokensUsed: 0,
      costUsd: 0,
    };
  }

  private async runCarouselAgent(userId: string, context: any, _memories: any) {
    return {
      output: { message: "Carousel Agent — aguardando briefs aprovados", context },
      tokensUsed: 0,
      costUsd: 0,
    };
  }

  private async runAnalyticsAgent(userId: string, _context: any, _memories: any) {
    const [pubs, snapshots] = await Promise.all([
      prisma.publication.count({ where: { userId, status: "PUBLISHED" } }),
      prisma.analyticsSnapshot.count({ where: { publication: { userId } } }),
    ]);

    return {
      output: {
        totalPublished: pubs,
        totalSnapshots: snapshots,
        message: "Analytics coletados e atualizados",
        recommendations: pubs > 0 ? ["Analise os top posts da semana", "Verifique padrões de horário"] : ["Publique conteúdo para começar analytics"],
      },
      tokensUsed: 0,
      costUsd: 0,
    };
  }

  private async runCommunityAgent(userId: string, _context: any, _memories: any) {
    const pendingComments = await prisma.comment.count({
      where: { userId, processedAt: null },
    });

    return {
      output: {
        pendingComments,
        message: `${pendingComments} comentários aguardando processamento`,
      },
      tokensUsed: 0,
      costUsd: 0,
    };
  }

  private async runRepurposeAgent(userId: string, _context: any, _memories: any) {
    const topPosts = await prisma.publication.findMany({
      where: { userId, status: "PUBLISHED" },
      include: { analytics: { orderBy: { snapshotAt: "desc" }, take: 1 } },
      take: 20,
    });

    const repurposeCandidates = topPosts
      .filter((p) => (p.analytics[0]?.performanceScore ?? 0) > 7)
      .slice(0, 5);

    return {
      output: {
        repurposeCandidates: repurposeCandidates.map((p) => ({
          id: p.id,
          title: p.title ?? p.caption?.substring(0, 50),
          score: p.analytics[0]?.performanceScore,
        })),
        message: `${repurposeCandidates.length} posts com alto potencial de reaproveitamento`,
      },
      tokensUsed: 0,
      costUsd: 0,
    };
  }

  // =========================================================================
  // ROTINAS AGENDADAS
  // =========================================================================
  async runDailyRoutine(userId: string) {
    const agents = ["trend_research", "content_planner", "analytics", "community"];
    for (const agentSlug of agents) {
      await this.enqueueAgent({ agentSlug, userId, context: { routine: "daily" } });
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  async runWeeklyRoutine(userId: string) {
    const agents = [
      "chief_strategy", "trend_research", "reference_radar",
      "content_planner", "creative_director", "analytics", "repurpose",
    ];
    for (const agentSlug of agents) {
      await this.enqueueAgent({ agentSlug, userId, context: { routine: "weekly" } });
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

export const agentOrchestrator = new AgentOrchestrator();
