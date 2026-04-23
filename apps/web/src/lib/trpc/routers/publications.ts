import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/server";

export const publicationsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "FAILED"]).optional(),
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const items = [
        {
          id: "p1", status: "PUBLISHED", publishedAt: new Date(),
          socialProfile: { platform: "INSTAGRAM", handle: "@candidato" },
          content: "Reunião incrível hoje com a associação de moradores da Zona Sul!",
        },
        {
          id: "p2", status: "SCHEDULED", scheduledFor: new Date(Date.now() + 86400000),
          socialProfile: { platform: "TIKTOK", handle: "@candidato" },
          content: "Meus planos para a segurança pública.",
        }
      ];
      return { items, total: items.length, page: input.page, hasMore: false };
    }),
});
