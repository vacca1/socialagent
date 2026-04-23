import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/server";

export const assetsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      type: z.string().optional(),
      search: z.string().optional(),
      tags: z.array(z.string()).optional(),
      isFavorite: z.boolean().optional(),
      page: z.number().default(1),
      pageSize: z.number().default(24),
    }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.pageSize;
      const where = {
        userId: ctx.userId,
        ...(input.type && { type: input.type }),
        ...(input.isFavorite !== undefined && { isFavorite: input.isFavorite }),
        ...(input.search && {
          OR: [
            { name: { contains: input.search } },
            { description: { contains: input.search } },
          ],
        }),
        // tags como string JSON no SQLite — busca por contains
      };
      const [items, total] = await Promise.all([
        ctx.prisma.asset.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: input.pageSize }),
        ctx.prisma.asset.count({ where }),
      ]);
      return { items, total, page: input.page, hasMore: skip + items.length < total };
    }),

  toggleFavorite: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.prisma.asset.findFirst({ where: { id: input.id, userId: ctx.userId } });
      if (!asset) return null;
      return ctx.prisma.asset.update({ where: { id: input.id }, data: { isFavorite: !asset.isFavorite } });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.asset.deleteMany({ where: { id: input.id, userId: ctx.userId } });
      return { success: true };
    }),
});
