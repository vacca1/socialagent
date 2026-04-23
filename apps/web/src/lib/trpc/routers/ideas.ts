import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/server";

export const ideasRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      status: z.enum(["IDEA", "IN_PRODUCTION", "IN_REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"]).optional(),
      format: z.enum(["REELS", "CAROUSEL", "POST", "THREAD", "STORY"]).optional(),
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const items = [
        {
          id: "i1", title: "Vídeo: A verdade sobre a Saúde", format: "REELS", status: "IN_PRODUCTION",
          viralPotentialScore: 9.2, authorityScore: 8.5, clarityScore: 9.0, urgencyScore: 8.5, generatedByAi: true, createdAt: new Date(), updatedAt: new Date(),
        },
        {
          id: "i2", title: "Carrossel: Propostas para o Bairro Novo", format: "CAROUSEL", status: "IDEA",
          viralPotentialScore: 6.5, authorityScore: 9.5, clarityScore: 8.0, urgencyScore: 4.0, generatedByAi: false, createdAt: new Date(), updatedAt: new Date(),
        },
        {
          id: "i3", title: "Resposta oficial: Mentiras do Opositor", format: "POST", status: "IN_REVIEW",
          viralPotentialScore: 9.5, authorityScore: 7.0, clarityScore: 9.8, urgencyScore: 9.8, generatedByAi: true, createdAt: new Date(), updatedAt: new Date(),
        }
      ];
      return { items, total: items.length, page: input.page, hasMore: false };
    }),

  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async () => null),
  create: protectedProcedure.input(z.any()).mutation(async () => ({ id: "mock" })),
  update: protectedProcedure.input(z.any()).mutation(async () => ({ id: "mock" })),
  delete: protectedProcedure.input(z.any()).mutation(async () => true),
});
