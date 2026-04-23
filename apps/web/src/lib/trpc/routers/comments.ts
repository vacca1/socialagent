import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/server";

export const commentsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      sentiment: z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL"]).optional(),
      status: z.enum(["UNREAD", "READ", "REPLIED", "IGNORED"]).optional(),
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const items = [
        {
          id: "c1", status: "UNREAD", sentiment: "POSITIVE",
          authorName: "João Silva", authorHandle: "@joaosilva",
          text: "Você é o melhor candidato! Estamos com você rumo à vitória! 🚀🚀🚀",
          publicationId: "p1", createdAt: new Date(),
          publication: { content: "Reunião na Zona Sul" },
          suggestedReply: "Muito obrigado pelo apoio, João! Vamos juntos!"
        },
        {
          id: "c2", status: "UNREAD", sentiment: "POSITIVE",
          authorName: "Maria Oliveira", authorHandle: "@maria_oli",
          text: "Meu voto e da minha família toda é seu! Parabéns pelo trabalho na educação infantil.",
          publicationId: "p2", createdAt: new Date(),
          publication: { content: "Nossas propostas" },
          suggestedReply: "Agradeço demais, Maria! A educação é a base de tudo."
        },
        {
          id: "c3", status: "UNREAD", sentiment: "POSITIVE",
          authorName: "Carlos Eduardo", authorHandle: "@cadu_eleitor",
          text: "Finalmenteee alguém que pensa na gente. Que discurso perfeito! 👏👏",
          publicationId: "p3", createdAt: new Date(),
          publication: { content: "Cortes do Debate" },
          suggestedReply: "Obrigado, Carlos! A voz do povo precisa ser ouvida no debate."
        },
        {
          id: "c4", status: "UNREAD", sentiment: "POSITIVE",
          authorName: "Ana Clara", authorHandle: "@ana_clara12",
          text: "Já virei voto de três amigas! Pra cima deles! 🙌",
          publicationId: "p1", createdAt: new Date(),
          publication: { content: "Reunião na Zona Sul" },
          suggestedReply: "Que maravilha, Ana! O boca a boca de vocês é a nossa maior força."
        },
        {
          id: "c5", status: "UNREAD", sentiment: "POSITIVE",
          authorName: "Roberto Farias", authorHandle: "@roberto.farias",
          text: "Esse projeto para os postos de saúde é geniaaal, pode contar comigo na campanha!",
          publicationId: "p2", createdAt: new Date(),
          publication: { content: "Propostas de Saúde" },
          suggestedReply: "Fico feliz que tenha gostado, Roberto! Precisamos de todos engajados."
        }
      ];
      return { items, total: items.length, page: input.page, hasMore: false };
    }),

  stats: protectedProcedure.query(async () => {
    return {
      total: 1540,
      unread: 23,
      positivePercent: 65,
      negativePercent: 20,
      neutralPercent: 15,
      requiresAttention: 5,
    };
  }),

  generateReply: protectedProcedure.input(z.any()).mutation(async () => ({ reply: "Muito obrigado!" })),
  reply: protectedProcedure.input(z.any()).mutation(async () => ({ id: "mock" })),
  updateStatus: protectedProcedure.input(z.any()).mutation(async () => ({ id: "mock" })),
});
