import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Entrar | POSTADOR" };

export default async function LoginPage() {
  const session = await getServerSession();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500 mb-4 shadow-lg">
            <span className="text-2xl font-bold text-white">P</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            POSTADOR
          </h1>
          <p className="mt-2 text-slate-400 text-sm">
            Suite de Automação de Conteúdo para IA
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold mb-1">Bem-vindo de volta</h2>
          <p className="text-slate-500 text-sm mb-6">Acesse sua plataforma de conteúdo</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
