import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/server";

export const trendsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      processed: z.boolean().optional(),
      source: z.string().optional(),
      minScore: z.number().optional(),
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const items = [
        {
          id: "t1", topic: "Transporte Público Lotado", source: "Twitter (X)",
          relevanceScore: 0.95, isProcessed: false, capturedAt: new Date(),
          normalizedText: "Usuários reclamam de superlotação na linha Amarela.", tags: "transporte"
        },
        {
          id: "t2", topic: "Falta de remédios no Posto Central", source: "Facebook",
          relevanceScore: 0.88, isProcessed: false, capturedAt: new Date(),
          normalizedText: "Muitos relatos de falta de insulina e dipirona.", tags: "saude"
        },
        {
          id: "t3", topic: "Debate Eleitoral na TV", source: "Portais",
          relevanceScore: 0.92, isProcessed: false, capturedAt: new Date(),
          normalizedText: "Candidato opositor gagueja ao falar de segurança pública.", tags: "seguranca, debate"
        }
      ];
      return { items, total: items.length, page: input.page, hasMore: false };
    }),

  research: protectedProcedure
    .input(z.object({ topic: z.string().min(2), mode: z.enum(["quick", "deep"]).default("quick") }))
    .mutation(async () => {
      return { signals: [], summary: "Pesquisa mockada...", trendScore: 85 };
    }),

  markProcessed: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async () => { return { id: "mock" }; }),

  convertToIdea: protectedProcedure
    .input(z.object({ signalId: z.string() }))
    .mutation(async () => { return { id: "idea_mock", title: "Nova Ideia" }; }),
});
