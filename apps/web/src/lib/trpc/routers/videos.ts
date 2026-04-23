import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/server";

export const videosRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      status: z.enum(["DRAFT", "RENDERING", "READY", "FAILED"]).optional(),
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const items = [
        {
          id: "v1", status: "RENDERING", title: "Corte: Debate na TV - Segurança",
          duration: 45, thumbnail: null, createdAt: new Date(),
          project: { title: "Cortes Debate" }
        },
        {
          id: "v2", status: "READY", title: "Inserção Comercial - Propostas Saúde",
          duration: 30, thumbnail: null, createdAt: new Date(),
          project: { title: "Campanha TV" }
        }
      ];
      return { items, total: items.length, page: input.page, hasMore: false };
    }),

  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async () => null),
  render: protectedProcedure.input(z.any()).mutation(async () => ({ id: "mock" })),
  delete: protectedProcedure.input(z.any()).mutation(async () => true),
});
