import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/server";

export const analyticsRouter = createTRPCRouter({
  byFormat: protectedProcedure
    .input(z.object({ period: z.enum(["7d", "30d", "90d"]).default("30d") }))
    .query(async () => {
      return [
        { format: "REELS", avgScore: 92.5, count: 14 },
        { format: "CAROUSEL", avgScore: 88.0, count: 12 },
        { format: "STORY", avgScore: 75.3, count: 45 },
        { format: "POST", avgScore: 68.2, count: 8 },
      ];
    }),

  topPosts: protectedProcedure
    .input(z.object({
      period: z.enum(["7d", "30d", "90d"]).default("30d"),
      metric: z.enum(["impressions", "reach", "likes", "saves", "performanceScore"]).default("performanceScore"),
      limit: z.number().default(10),
    }))
    .query(async () => {
      return [
        {
          id: "p1", title: "Vídeo: A verdade sobre a Saúde", format: "REELS", publishedAt: new Date(),
          metrics: { impressions: 142000, reach: 128000, likes: 25000, comments: 3400, saves: 5200 },
          score: 98,
        },
        {
          id: "p2", title: "Carrossel: Propostas para o Bairro Novo", format: "CAROUSEL", publishedAt: new Date(),
          metrics: { impressions: 85000, reach: 71000, likes: 12000, comments: 850, saves: 3100 },
          score: 89,
        },
        {
          id: "p3", title: "Corte: Debate na TV - Segurança", format: "REELS", publishedAt: new Date(),
          metrics: { impressions: 215000, reach: 198000, likes: 45000, comments: 6200, saves: 11000 },
          score: 99,
        }
      ];
    }),

  performanceScore: protectedProcedure
    .input(z.object({ publicationId: z.string() }))
    .query(async () => {
      return {
        score: 95,
        breakdown: {
          impressions: 142000, reach: 128000, likes: 25000, saves: 5200, comments: 3400, shares: 12000, engagementRate: 18.5,
        },
        snapshots: [],
      };
    }),

  repurposeRecommendations: protectedProcedure.query(async () => {
    return [
      {
        id: "p1", title: "Corte: Debate na TV - Segurança", format: "REELS", publishedAt: new Date(), score: 99,
        suggestions: ["Criar carrossel com as principais frases", "Fazer um Story enquete sobre segurança", "Extrair áudio para Trend"],
      },
      {
        id: "p2", title: "Plano de Governo: Educação", format: "CAROUSEL", publishedAt: new Date(), score: 92,
        suggestions: ["Transformar em roteiro de vídeo curto", "Criar Threads no Twitter detalhando cada slide"],
      }
    ];
  }),

  frequencyAnalysis: protectedProcedure.query(async () => {
    return {
      totalPublished: 142,
      byDayOfWeek: [
        { day: "Dom", count: 12, avgScore: 85 },
        { day: "Seg", count: 24, avgScore: 92 },
        { day: "Ter", count: 22, avgScore: 88 },
        { day: "Qua", count: 25, avgScore: 95 },
        { day: "Qui", count: 28, avgScore: 98 },
        { day: "Sex", count: 20, avgScore: 90 },
        { day: "Sáb", count: 11, avgScore: 82 },
      ],
      byHour: Array.from({ length: 24 }, (_, h) => ({
        hour: h,
        count: h === 18 ? 45 : h === 12 ? 30 : h === 20 ? 25 : Math.floor(Math.random() * 10),
      })),
    };
  }),
});
