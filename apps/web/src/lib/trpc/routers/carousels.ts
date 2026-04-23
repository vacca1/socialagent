import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/server";

export const carouselsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      status: z.enum(["DRAFT", "GENERATING", "READY", "FAILED"]).optional(),
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const items = [
        {
          id: "c1", status: "READY", title: "O que fizemos pela Educação",
          slideCount: 5, createdAt: new Date(), project: { title: "Propostas Educação" }
        },
        {
          id: "c2", status: "GENERATING", title: "Mentiras vs Verdades",
          slideCount: 7, createdAt: new Date(), project: { title: "Combate Fake News" }
        }
      ];
      return { items, total: items.length, page: input.page, hasMore: false };
    }),

  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async () => null),
  generate: protectedProcedure.input(z.any()).mutation(async () => ({ id: "mock" })),
  updateSlide: protectedProcedure.input(z.any()).mutation(async () => ({ id: "mock" })),
  delete: protectedProcedure.input(z.any()).mutation(async () => true),
});
