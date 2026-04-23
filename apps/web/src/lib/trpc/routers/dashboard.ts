import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/server";
import { subDays, subHours, subMinutes } from "date-fns";

export const dashboardRouter = createTRPCRouter({
  // Stats gerais
  stats: protectedProcedure
    .input(z.object({ period: z.enum(["7d", "30d", "90d"]).default("30d") }))
    .query(async () => {
      return {
        postsPublished: 142,
        postsScheduled: 18,
        postsDraft: 5,
        postsInReview: 3,
        pendingApprovals: 4,
        trendSignals: 27,
        activeAgents: 6,
        runningJobs: 2,
      };
    }),

  // Pipeline de produção
  pipeline: protectedProcedure.query(async () => {
    return [
      {
        id: "1",
        title: "Vídeo de Resposta: Combate a Fake News na Saúde",
        format: "REELS",
        status: "IN_PRODUCTION",
        scheduledFor: null,
        updatedAt: subHours(new Date(), 2),
      },
      {
        id: "2",
        title: "Carrossel: Nossas propostas para Educação",
        format: "CAROUSEL",
        status: "IN_REVIEW",
        scheduledFor: null,
        updatedAt: subHours(new Date(), 5),
      },
      {
        id: "3",
        title: "Cortes do Debate na Emissora X",
        format: "REELS",
        status: "APPROVED",
        scheduledFor: subHours(new Date(), -12),
        updatedAt: subDays(new Date(), 1),
      },
      {
        id: "4",
        title: "Thread: O que fizemos pelo transporte público",
        format: "THREAD",
        status: "IN_PRODUCTION",
        scheduledFor: null,
        updatedAt: subDays(new Date(), 1),
      },
    ];
  }),

  // Publicações recentes
  recentPublications: protectedProcedure
    .input(z.object({ limit: z.number().default(5) }))
    .query(async () => {
      return [
        {
          id: "p1",
          status: "PUBLISHED",
          publishedAt: subHours(new Date(), 3),
          socialProfile: { platform: "INSTAGRAM", handle: "@candidato" },
          content: "Reunião incrível hoje com a associação de moradores da Zona Sul!",
          analytics: [{ impressions: 45200, reach: 38100, likes: 5200, comments: 450, saves: 120, engagementRate: 14.5 }],
        },
        {
          id: "p2",
          status: "PUBLISHED",
          publishedAt: subDays(new Date(), 1),
          socialProfile: { platform: "TIKTOK", handle: "@candidato" },
          content: "3 motivos para acreditar na nossa cidade. Assista até o fim! 🚀",
          analytics: [{ impressions: 125000, reach: 110000, likes: 18000, comments: 1200, saves: 3400, engagementRate: 18.2 }],
        },
      ];
    }),

  // Aprovações pendentes
  pendingApprovals: protectedProcedure.query(async () => {
    return [
      {
        id: "a1",
        type: "PUBLICATION",
        status: "PENDING",
        riskScore: 85,
        riskAnalysis: "Menciona o nome do adversário principal diretamente. Requer aprovação jurídica.",
        createdAt: subMinutes(new Date(), 45),
        title: "Roteiro: Inserção TV 30s (Ataque)",
      },
      {
        id: "a2",
        type: "PUBLICATION",
        status: "PENDING",
        riskScore: 20,
        riskAnalysis: "Conteúdo de agenda padrão. Sem riscos mapeados.",
        createdAt: subHours(new Date(), 2),
        title: "Carrossel: Visita ao Mercado Municipal",
      },
      {
        id: "a3",
        type: "COMMENT_REPLY",
        status: "PENDING",
        riskScore: 60,
        riskAnalysis: "Resposta a um influenciador cobrando posicionamento sobre o buraco na avenida.",
        createdAt: subHours(new Date(), 5),
        title: "Resposta a Influenciador",
      },
    ];
  }),

  // Tendências recentes para o radar
  trendRadar: protectedProcedure.query(async () => {
    return [
      {
        id: "t1",
        topic: "Transporte Público Lotado",
        source: "Twitter (X)",
        relevanceScore: 0.95,
        isProcessed: false,
        createdAt: new Date(),
      },
      {
        id: "t2",
        topic: "Falta de remédios no Posto",
        source: "Comentários Instagram",
        relevanceScore: 0.88,
        isProcessed: false,
        createdAt: subHours(new Date(), 1),
      },
      {
        id: "t3",
        topic: "Pesquisa Eleitoral DataFolha",
        source: "Portais de Notícia",
        relevanceScore: 0.92,
        isProcessed: false,
        createdAt: subHours(new Date(), 2),
      },
      {
        id: "t4",
        topic: "Segurança no bairro X",
        source: "Grupos de WhatsApp",
        relevanceScore: 0.75,
        isProcessed: false,
        createdAt: subHours(new Date(), 5),
      },
    ];
  }),

  // Oportunidades do Reference Radar
  opportunities: protectedProcedure
    .input(z.object({ limit: z.number().default(5) }))
    .query(async () => {
      return [
        {
          id: "o1",
          status: "NEW",
          fitScore: 98,
          urgencyScore: 95,
          title: "Adversário escorregou em entrevista",
          description: "Opositor deu uma resposta controversa sobre o tema de segurança. Oportunidade para corte de contraste.",
          referenceProfile: { handle: "@jornaldacidade", displayName: "Jornal da Cidade", sourceType: "NEWS" },
        },
        {
          id: "o2",
          status: "NEW",
          fitScore: 85,
          urgencyScore: 60,
          title: "Trend de áudio viral (Eleição)",
          description: "Áudio humorístico sobre 'o que o candidato prometeu vs o que fez' está em alta no TikTok.",
          referenceProfile: { handle: "@trendbrasil", displayName: "Trends Brasil", sourceType: "TIKTOK" },
        },
      ];
    }),

  // Status da agência
  agencyStatus: protectedProcedure.query(async () => {
    return {
      agents: [
        { slug: "estrategista", name: "Estrategista Chefe", status: "RUNNING", lastRunAt: new Date() },
        { slug: "redator", name: "Redator de Discursos", status: "IDLE", lastRunAt: subHours(new Date(), 2) },
        { slug: "monitor", name: "Monitor de Crise", status: "RUNNING", lastRunAt: new Date() },
        { slug: "analytics", name: "Analista de Pesquisas", status: "RUNNING", lastRunAt: subMinutes(new Date(), 15) },
      ],
      pendingApprovals: 4,
      weekJobs: 145,
      budgetUsed: 84.5,
      budgetLimit: 200,
    };
  }),

  // Gráfico de performance
  performanceChart: protectedProcedure
    .input(z.object({ period: z.enum(["7d", "30d"]).default("30d") }))
    .query(async () => {
      const data = [];
      let impressions = 10000;
      let reach = 8000;
      let engagement = 5;

      for (let i = 30; i >= 0; i--) {
        const date = subDays(new Date(), i);
        impressions += Math.floor(Math.random() * 5000);
        reach += Math.floor(Math.random() * 4000);
        engagement += Math.random() * 0.5 - 0.1;

        data.push({
          snapshotAt: date,
          impressions,
          reach,
          likes: Math.floor(impressions * 0.1),
          comments: Math.floor(impressions * 0.01),
          saves: Math.floor(impressions * 0.005),
          engagementRate: Number(engagement.toFixed(1)),
          performanceScore: Math.min(100, 60 + (30 - i) * 1.2),
        });
      }
      return data;
    }),
});
