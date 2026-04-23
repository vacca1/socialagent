import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/server";

export const referenceRadarRouter = createTRPCRouter({
  profiles: protectedProcedure.input(z.any().optional()).query(async () => {
    return [
      {
        id: "r1", handle: "@prefeito_atual", displayName: "Prefeito Opositor",
        sourceType: "instagram", isActive: true, analysisIntervalHours: 24, lastAnalyzedAt: new Date(),
        niche: "Adversário Direto", priority: 5, relevanceScore: 0.95,
        _count: { contentEntries: 120, signals: 15, opportunities: 3 }
      },
      {
        id: "r2", handle: "@jornal_cidade", displayName: "Jornal Local",
        sourceType: "blog", isActive: true, analysisIntervalHours: 12, lastAnalyzedAt: new Date(),
        niche: "Notícias da Cidade", priority: 4, relevanceScore: 0.85,
        _count: { contentEntries: 450, signals: 25, opportunities: 8 }
      },
      {
        id: "r3", handle: "@influenciador_bairro", displayName: "Líder Comunitário",
        sourceType: "twitter_x", isActive: true, analysisIntervalHours: 6, lastAnalyzedAt: new Date(),
        niche: "Apoiador/Defensor", priority: 3, relevanceScore: 0.70,
        _count: { contentEntries: 45, signals: 8, opportunities: 2 }
      }
    ];
  }),

  groups: protectedProcedure.query(async () => {
    return [
      { id: "g1", name: "Opositores", color: "#ef4444", _count: { profiles: 1 } },
      { id: "g2", name: "Imprensa", color: "#3b82f6", _count: { profiles: 1 } },
      { id: "g3", name: "Lideranças", color: "#10b981", _count: { profiles: 1 } }
    ];
  }),

  listOpportunities: protectedProcedure
    .input(z.object({
      status: z.enum(["NEW", "REVIEWED", "CONVERTED", "REJECTED"]).optional(),
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const items = [
        {
          id: "o1", status: "NEW", fitScore: 95, urgencyScore: 90,
          title: "Prefeito faz post polêmico sobre obras atrasadas",
          description: "Oportunidade de responder mostrando nossas propostas de infraestrutura.",
          capturedAt: new Date(),
          referenceProfile: { handle: "@prefeito_atual", displayName: "Prefeito Opositor", sourceType: "instagram" }
        }
      ];
      return { items, total: items.length, page: input.page, hasMore: false };
    }),

  addProfile: protectedProcedure.input(z.any()).mutation(async () => ({ id: "mock" })),
  updateProfile: protectedProcedure.input(z.any()).mutation(async () => ({ id: "mock" })),
  removeProfile: protectedProcedure.input(z.any()).mutation(async () => true),
  forceAnalysis: protectedProcedure.input(z.any()).mutation(async () => true),
  updateOpportunityStatus: protectedProcedure.input(z.any()).mutation(async () => ({ id: "mock" })),
  convertToIdea: protectedProcedure.input(z.any()).mutation(async () => ({ id: "mock_idea", title: "Idea" })),
});
