export async function GET() {
  return Response.json({
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    keyStart: process.env.ANTHROPIC_API_KEY?.substring(0, 20) ?? "NOT FOUND",
    provider: process.env.AI_DEFAULT_PROVIDER,
    scrapecreators: !!process.env.SCRAPECREATORS_API_KEY,
  });
}
