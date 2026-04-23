import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/server";
import { subDays, addDays } from "date-fns";

export const calendarRouter = createTRPCRouter({
  getEvents: protectedProcedure
    .input(z.object({ startDate: z.date(), endDate: z.date() }))
    .query(async () => {
      return [
        {
          id: "e1", type: "PUBLICATION", title: "Vídeo Saúde", date: new Date(), status: "PUBLISHED",
        },
        {
          id: "e2", type: "PROJECT", title: "Cortes do Debate", date: addDays(new Date(), 1), status: "IN_PRODUCTION",
        }
      ];
    }),
});
