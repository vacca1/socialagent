import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@postador/database";

// =============================================================================
// CONTEXTO
// =============================================================================
export async function createTRPCContext(opts: { headers: Headers }) {
  const session = await getServerSession();

  return {
    session,
    prisma,
    headers: opts.headers,
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

// =============================================================================
// tRPC
// =============================================================================
const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// Middleware de autenticação
const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userId = (ctx.session.user as any).id as string;
  return next({ ctx: { ...ctx, session: ctx.session, userId } });
});

// Exports
export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;
export const mergeRouters = t.mergeRouters;

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthenticated);
