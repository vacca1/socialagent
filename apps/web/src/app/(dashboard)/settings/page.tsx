"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Key,
  CheckCircle2,
  XCircle,
  Loader2,
  Instagram,
  Server,
  BookOpen,
  Save,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ServiceStatus {
  name: string;
  url: string;
  label: string;
  checking: boolean;
  online: boolean | null;
}

interface ApiKeyField {
  key: string;
  label: string;
  placeholder: string;
  helpUrl: string;
  helpText: string;
  required: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_KEY_FIELDS: ApiKeyField[] = [
  {
    key: "OPENAI_API_KEY",
    label: "OpenAI API Key",
    placeholder: "sk-...",
    helpUrl: "https://platform.openai.com/api-keys",
    helpText: "Obter chave OpenAI",
    required: true,
  },
  {
    key: "ANTHROPIC_API_KEY",
    label: "Anthropic API Key",
    placeholder: "sk-ant-...",
    helpUrl: "https://console.anthropic.com/settings/keys",
    helpText: "Obter chave Anthropic",
    required: false,
  },
  {
    key: "GROQ_API_KEY",
    label: "Groq API Key",
    placeholder: "gsk_...",
    helpUrl: "https://console.groq.com/keys",
    helpText: "Obter chave Groq",
    required: false,
  },
  {
    key: "SCRAPECREATORS_API_KEY",
    label: "ScrapeCreators API Key",
    placeholder: "sc-...",
    helpUrl: "https://scrapecreators.com",
    helpText: "Necessário para pesquisa de tendências",
    required: true,
  },
  {
    key: "BRAVE_API_KEY",
    label: "Brave Search API Key",
    placeholder: "BSA...",
    helpUrl: "https://api.search.brave.com/app/keys",
    helpText: "Opcional — melhora resultados de pesquisa",
    required: false,
  },
];

const INITIAL_SERVICES: ServiceStatus[] = [
  {
    name: "postador",
    url: "http://localhost:3000",
    label: "POSTADOR Web",
    checking: false,
    online: true,
  },
  {
    name: "socialflow",
    url: "http://localhost:8001",
    label: "SocialFlow",
    checking: false,
    online: null,
  },
  {
    name: "videoeditor",
    url: "http://localhost:3002",
    label: "Editor de Vídeos",
    checking: false,
    online: null,
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Section({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-5 flex items-start gap-3">
        {icon && (
          <div className="mt-0.5 text-indigo-400 shrink-0">{icon}</div>
        )}
        <div>
          <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
          {description && (
            <p className="text-sm text-zinc-500 mt-1">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function StatusDot({ online }: { online: boolean | null }) {
  if (online === null)
    return <span className="inline-block w-2 h-2 rounded-full bg-zinc-600" />;
  if (online)
    return (
      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
    );
  return <span className="inline-block w-2 h-2 rounded-full bg-red-500" />;
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  // API Keys form state
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  // Instagram / SocialFlow
  const [igUser, setIgUser] = useState("");
  const [igPass, setIgPass] = useState("");
  const [igTesting, setIgTesting] = useState(false);
  const [igResult, setIgResult] = useState<string | null>(null);

  // Services status
  const [services, setServices] = useState<ServiceStatus[]>(INITIAL_SERVICES);

  // ---------------------------------------------------------------------------
  // Check services on mount
  // ---------------------------------------------------------------------------
  async function checkService(url: string): Promise<boolean> {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(3000),
        mode: "no-cors",
      });
      // no-cors returns opaque response — if it doesn't throw, server is up
      return true;
    } catch {
      return false;
    }
  }

  useEffect(() => {
    async function checkAll() {
      setServices((prev) =>
        prev.map((s) => (s.name === "postador" ? s : { ...s, checking: true }))
      );

      const results = await Promise.all(
        INITIAL_SERVICES.map(async (s) => {
          if (s.name === "postador") return { ...s, online: true, checking: false };
          const online = await checkService(s.url);
          return { ...s, online, checking: false };
        })
      );

      setServices(results);
    }

    checkAll();
  }, []);

  async function refreshServices() {
    setServices((prev) =>
      prev.map((s) =>
        s.name === "postador" ? s : { ...s, checking: true, online: null }
      )
    );

    const results = await Promise.all(
      services.map(async (s) => {
        if (s.name === "postador") return { ...s, online: true, checking: false };
        const online = await checkService(s.url);
        return { ...s, online, checking: false };
      })
    );

    setServices(results);
  }

  // ---------------------------------------------------------------------------
  // Save API Keys
  // ---------------------------------------------------------------------------
  async function handleSaveKeys() {
    setSaving(true);
    setSaveResult(null);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiKeys),
      });
      const data = (await res.json()) as { ok: boolean; message: string };
      setSaveResult(data);
    } catch (err) {
      setSaveResult({
        ok: false,
        message: "Erro ao salvar. Verifique o servidor.",
      });
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Test SocialFlow connection
  // ---------------------------------------------------------------------------
  async function testSocialFlow() {
    setIgTesting(true);
    setIgResult(null);
    try {
      const res = await fetch("http://localhost:8001/health", {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        setIgResult("Conexão com SocialFlow OK!");
      } else {
        setIgResult(`SocialFlow respondeu com status ${res.status}`);
      }
    } catch {
      setIgResult(
        "Não foi possível conectar ao SocialFlow em localhost:8001. Verifique se está rodando."
      );
    } finally {
      setIgTesting(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <Settings className="h-6 w-6 text-indigo-400" />
          Configurações
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Gerencie chaves de API, integrações e serviços do POSTADOR
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Section 1: API Keys                                                  */}
      {/* ------------------------------------------------------------------ */}
      <Section
        title="Chaves de API"
        description="Configure as chaves necessárias para os serviços de IA e pesquisa"
        icon={<Key className="h-5 w-5" />}
      >
        <div className="space-y-4">
          {API_KEY_FIELDS.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                  {field.label}
                  {field.required && (
                    <span className="text-xs text-amber-400 bg-amber-900/30 px-1.5 py-0.5 rounded">
                      obrigatório
                    </span>
                  )}
                </label>
                <a
                  href={field.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                >
                  {field.helpText}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <input
                type="password"
                placeholder={field.placeholder}
                value={apiKeys[field.key] ?? ""}
                onChange={(e) =>
                  setApiKeys((prev) => ({
                    ...prev,
                    [field.key]: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <p className="text-xs text-zinc-600">{field.helpText}</p>
            </div>
          ))}

          {saveResult && (
            <div
              className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                saveResult.ok
                  ? "bg-emerald-900/30 border border-emerald-800 text-emerald-300"
                  : "bg-red-900/30 border border-red-800 text-red-300"
              }`}
            >
              {saveResult.ok ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              {saveResult.message}
            </div>
          )}

          {saveResult?.ok && (
            <div className="p-3 rounded-lg bg-zinc-800 border border-zinc-700">
              <p className="text-xs text-zinc-400 font-mono mb-2 text-zinc-300 font-semibold">
                Formato .env (referência):
              </p>
              <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap">
                {API_KEY_FIELDS.filter((f) => apiKeys[f.key])
                  .map((f) => `${f.key}="${apiKeys[f.key]}"`)
                  .join("\n")}
              </pre>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleSaveKeys}
              disabled={saving || Object.keys(apiKeys).length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Salvando..." : "Salvar chaves"}
            </button>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Section 2: Instagram / SocialFlow                                   */}
      {/* ------------------------------------------------------------------ */}
      <Section
        title="Instagram / SocialFlow"
        description="Configure as credenciais do Instagram para automação via SocialFlow"
        icon={<Instagram className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-200">
              Usuário do Instagram
            </label>
            <input
              type="text"
              placeholder="@seuperfil"
              value={igUser}
              onChange={(e) => setIgUser(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-200">
              Senha do Instagram
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={igPass}
              onChange={(e) => setIgPass(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {igResult && (
            <div
              className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                igResult.includes("OK")
                  ? "bg-emerald-900/30 border border-emerald-800 text-emerald-300"
                  : "bg-amber-900/30 border border-amber-800 text-amber-300"
              }`}
            >
              {igResult}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={testSocialFlow}
              disabled={igTesting}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 rounded-lg text-sm font-medium transition-colors border border-zinc-700"
            >
              {igTesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Server className="h-4 w-4" />
              )}
              Testar conexão SocialFlow
            </button>
            <span className="text-xs text-zinc-600">
              SocialFlow deve estar rodando em localhost:8001
            </span>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Section 3: Serviços Ativos                                          */}
      {/* ------------------------------------------------------------------ */}
      <Section
        title="Serviços Ativos"
        description="Status dos serviços em execução"
        icon={<Server className="h-5 w-5" />}
      >
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/60 border border-zinc-700/50"
            >
              <div className="flex items-center gap-3">
                <StatusDot online={service.online} />
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    {service.label}
                  </p>
                  <p className="text-xs text-zinc-500">{service.url}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {service.checking ? (
                  <span className="text-xs text-zinc-500 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Verificando...
                  </span>
                ) : service.online === true ? (
                  <span className="text-xs text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded-full">
                    Online
                  </span>
                ) : service.online === false ? (
                  <span className="text-xs text-red-400 bg-red-900/30 px-2 py-0.5 rounded-full">
                    Offline
                  </span>
                ) : (
                  <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                    Desconhecido
                  </span>
                )}
                {service.name !== "postador" && (
                  <a
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}

          {/* Research service status */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/60 border border-zinc-700/50">
            <div className="flex items-center gap-3">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  last30days Research
                </p>
                <p className="text-xs text-zinc-500">Script Python local</p>
              </div>
            </div>
            <div>
              <span className="text-xs text-amber-400 bg-amber-900/30 px-2 py-0.5 rounded-full">
                Requer SCRAPECREATORS_API_KEY
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={refreshServices}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Atualizar status
            </button>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Section 4: Como Começar                                             */}
      {/* ------------------------------------------------------------------ */}
      <Section
        title="Como Começar"
        description="Siga os passos abaixo para configurar o POSTADOR completamente"
        icon={<BookOpen className="h-5 w-5" />}
      >
        <ol className="space-y-4">
          {[
            {
              step: 1,
              title: "Configure as chaves de API",
              desc: 'Adicione suas chaves de OpenAI e ScrapeCreators na seção "Chaves de API" acima. Essas chaves são necessárias para geração de conteúdo e pesquisa de tendências.',
            },
            {
              step: 2,
              title: "Inicie o SocialFlow",
              desc: "Execute o SocialFlow para automação do Instagram: cd SocialFlow-main/backend && python3 -m uvicorn main:app --port 8001",
              code: "cd SocialFlow-main/backend\npython3 -m uvicorn main:app --host 0.0.0.0 --port 8001",
            },
            {
              step: 3,
              title: "Inicie o Editor de Vídeos",
              desc: "Execute o react-video-editor para edição de vídeos: cd react-video-editor-main && pnpm next dev --port 3002",
              code: "cd react-video-editor-main\npnpm next dev --port 3002",
            },
            {
              step: 4,
              title: "Use o script de inicialização rápida",
              desc: "Use o start.sh na raiz do POSTADOR para iniciar todos os serviços de uma vez:",
              code: "chmod +x start.sh && ./start.sh",
            },
            {
              step: 5,
              title: "Pesquise tendências",
              desc: 'Vá para a página "Tendências" e pesquise tópicos para capturar sinais de mercado usando o last30days.',
            },
          ].map((item) => (
            <li key={item.step} className="flex gap-4">
              <div className="shrink-0 w-7 h-7 rounded-full bg-indigo-900/60 border border-indigo-700 flex items-center justify-center text-xs font-bold text-indigo-300">
                {item.step}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-200">
                  {item.title}
                </p>
                <p className="text-sm text-zinc-500 mt-0.5">{item.desc}</p>
                {item.code && (
                  <pre className="mt-2 p-2.5 rounded-lg bg-zinc-800 text-xs font-mono text-emerald-400 overflow-x-auto border border-zinc-700">
                    {item.code}
                  </pre>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Section>
    </div>
  );
}
