import { createTRPCRouter } from "@/lib/trpc/server";
import { dashboardRouter } from "./dashboard";
import { ideasRouter } from "./ideas";
import { trendsRouter } from "./trends";
import { carouselsRouter } from "./carousels";
import { videosRouter } from "./videos";
import { publicationsRouter } from "./publications";
import { commentsRouter } from "./comments";
import { analyticsRouter } from "./analytics";
import { referenceRadarRouter } from "./reference-radar";
import { agencyRouter } from "./agency";
import { assetsRouter } from "./assets";
import { calendarRouter } from "./calendar";

export const appRouter = createTRPCRouter({
  dashboard: dashboardRouter,
  ideas: ideasRouter,
  trends: trendsRouter,
  carousels: carouselsRouter,
  videos: videosRouter,
  publications: publicationsRouter,
  comments: commentsRouter,
  analytics: analyticsRouter,
  referenceRadar: referenceRadarRouter,
  agency: agencyRouter,
  assets: assetsRouter,
  calendar: calendarRouter,
});

export type AppRouter = typeof appRouter;
