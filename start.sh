#!/bin/bash
# ============================================================
# POSTADOR — Script de Inicialização Completa
# Roda todos os serviços em localhost:3000 (único endereço)
# ============================================================

cd "$(dirname "$0")"
ROOT="$(pwd)"

echo ""
echo "🚀 Iniciando POSTADOR..."
echo ""

# Carrega variáveis do .env
set -a
source "$ROOT/apps/web/.env" 2>/dev/null
source "$ROOT/apps/web/.env.local" 2>/dev/null
set +a

# Verifica chaves
if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "⚠️  ANTHROPIC_API_KEY não configurada — geração de IA desativada"
fi

# 1. SocialFlow (backend de publicação)
echo "▶ Iniciando SocialFlow (publicação Instagram)..."
cd "$ROOT/SocialFlow-main/backend"
OPENAI_API_KEY="$OPENAI_API_KEY" \
ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
INSTAGRAM_USERNAME="$INSTAGRAM_USERNAME" \
INSTAGRAM_PASSWORD="$INSTAGRAM_PASSWORD" \
python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 > /tmp/socialflow.log 2>&1 &
SOCIALFLOW_PID=$!
echo "  ✅ SocialFlow PID $SOCIALFLOW_PID"

# 2. Editor de Vídeos
echo "▶ Iniciando Editor de Vídeos..."
cd "$ROOT/react-video-editor-main"
pnpm next dev --port 3002 > /tmp/video-editor.log 2>&1 &
VIDEO_PID=$!
echo "  ✅ Editor de Vídeos PID $VIDEO_PID"

# 3. POSTADOR (app principal — localhost:3000)
echo "▶ Iniciando POSTADOR..."
cd "$ROOT/apps/web"
ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
OPENAI_API_KEY="$OPENAI_API_KEY" \
GROQ_API_KEY="$GROQ_API_KEY" \
SCRAPECREATORS_API_KEY="$SCRAPECREATORS_API_KEY" \
BRAVE_API_KEY="$BRAVE_API_KEY" \
INSTAGRAM_USERNAME="$INSTAGRAM_USERNAME" \
INSTAGRAM_PASSWORD="$INSTAGRAM_PASSWORD" \
npx next dev --port 3000 > /tmp/nextjs.log 2>&1 &
WEB_PID=$!
echo "  ✅ POSTADOR PID $WEB_PID"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎯 POSTADOR:  http://localhost:3000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Aguardando... (Ctrl+C para parar tudo)"

# Para tudo com Ctrl+C
trap "echo 'Parando serviços...'; kill $SOCIALFLOW_PID $VIDEO_PID $WEB_PID 2>/dev/null; exit" INT TERM
wait $WEB_PID
