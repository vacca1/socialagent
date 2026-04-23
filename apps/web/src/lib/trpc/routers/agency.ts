import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/server";

export const agencyRouter = createTRPCRouter({
  controlTower: protectedProcedure.query(async () => {
    return {
      agents: [
        { id: "a1", name: "Estrategista Chefe", slug: "estrategista", isEnabled: true, status: "RUNNING", mode: "AUTONOMOUS_WITH_APPROVAL" },
        { id: "a2", name: "Monitor de Crise", slug: "monitor", isEnabled: true, status: "RUNNING", mode: "AUTONOMOUS_WITH_APPROVAL" },
        { id: "a3", name: "Redator de Discursos", slug: "redator", isEnabled: true, status: "IDLE", mode: "ASSISTED" },
        { id: "a4", name: "Analista de Pesquisas", slug: "analista", isEnabled: true, status: "RUNNING", mode: "AUTONOMOUS_WITH_APPROVAL" },
      ],
      pendingApprovals: 4,
      runningJobs: 3,
      failedJobs: 0,
      weeklyRuns: 42,
      budgetUsed: 85.5,
      budgetLimit: 200,
    };
  }),

  agents: protectedProcedure.query(async () => {
    return [
      { id: "a1", name: "Estrategista Chefe", slug: "estrategista", description: "Define a linha auxiliar da campanha.", role: "strategy", isEnabled: true, status: "RUNNING", mode: "AUTONOMOUS_WITH_APPROVAL" },
      { id: "a2", name: "Monitor de Crise", slug: "monitor", description: "Vigia menções e ataques do adversário.", role: "research", isEnabled: true, status: "RUNNING", mode: "AUTONOMOUS_WITH_APPROVAL" },
      { id: "a3", name: "Redator de Discursos", slug: "redator", description: "Escreve textos inflamados para a militância.", role: "copy", isEnabled: true, status: "IDLE", mode: "ASSISTED" },
      { id: "a4", name: "Analista de Pesquisas", slug: "analista", description: "Filtra dados de DataFolha e Ibope.", role: "analytics", isEnabled: true, status: "RUNNING", mode: "AUTONOMOUS_WITH_APPROVAL" },
    ];
  }),

  toggleAgent: protectedProcedure.input(z.any()).mutation(async () => ({ id: "mock" })),
  runAgent: protectedProcedure.input(z.any()).mutation(async () => ({ runId: "mock", status: "queued" })),
  
  agentRuns: protectedProcedure.input(z.any()).query(async () => {
    return { items: [], total: 0, page: 1, hasMore: false };
  }),

  approvals: protectedProcedure.input(z.any()).query(async ({ input }) => {
    return {
      items: [
        { id: "ap1", type: "PUBLICATION", status: "PENDING", riskScore: 85, createdAt: new Date() }
      ],
      total: 1, page: input.page, hasMore: false
    };
  }),

  reviewApproval: protectedProcedure.input(z.any()).mutation(async () => ({ id: "mock" })),
  
  kpiTargets: protectedProcedure.query(async () => {
    return [
      { id: "k1", name: "Engajamento Diário", metric: "engagement", target: 5000, period: "weekly", results: [] }
    ];
  }),
  createKpiTarget: protectedProcedure.input(z.any()).mutation(async () => ({ id: "mock" })),

  playbooks: protectedProcedure.query(async () => {
    return [
      { id: "pb1", name: "Geração de Conteúdo Diário", slug: "daily", type: "playbook", isActive: true },
      { id: "pb2", name: "Protocolo Crise", slug: "crisis", type: "playbook", isActive: true }
    ];
  }),
  runPlaybook: protectedProcedure.input(z.any()).mutation(async () => ({ runId: "mock", status: "started" })),
  workflowRuns: protectedProcedure.input(z.any()).query(async () => ({ items: [], total: 0, page: 1, hasMore: false })),

  agentMemory: protectedProcedure.input(z.any()).query(async () => []),
  
  budget: protectedProcedure.query(async () => {
    return [
      { budget: { id: "b1", name: "Verba Mensal IA", type: "ai_tokens", limitUsd: 200 }, usedUsd: 85.5 }
    ];
  }),

  setAutomationMode: protectedProcedure.input(z.any()).mutation(async () => ({ id: "mock" })),
});
