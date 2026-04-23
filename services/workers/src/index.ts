// =============================================================================
// POSTADOR — Worker Service Entry Point
// Inicializa todos os workers BullMQ
// =============================================================================

import "./workers/publish-worker";

console.log("🏭 POSTADOR Workers iniciados");
console.log("   - publish-worker: processando fila de publicações");

// Graceful shutdown
const shutdown = () => {
  console.log("Encerrando workers...");
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
