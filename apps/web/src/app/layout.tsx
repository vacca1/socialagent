import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { TRPCProvider } from "@/lib/trpc/provider";
import { SessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "POSTADOR — Suite de Automação de Conteúdo",
    template: "%s | POSTADOR",
  },
  description:
    "Plataforma completa de automação de conteúdo para Instagram sobre Inteligência Artificial.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <body
        className={`${inter.variable} font-sans min-h-screen bg-background antialiased`}
      >
        <SessionProvider>
          <TRPCProvider>
            {children}
            <Toaster
              richColors
              position="bottom-right"
              toastOptions={{
                duration: 4000,
              }}
            />
          </TRPCProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
