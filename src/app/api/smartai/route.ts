import { parseBody, route } from "@/server/http/route";
import { smartAiService } from "@/server/services/smartai.service";
import { smartAiRequestSchema } from "@/server/validation/smartai.schema";

/** First address of X-Forwarded-For (set by the proxy in production), else a shared bucket. */
function visitorKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anonymous";
}

/**
 * POST /api/smartai — public SmartAI Studio endpoint. Streams the answer as
 * plain text; the `X-SmartAI-Mode` header says whether it comes from the AI
 * model ("live") or from the demo templates ("demo").
 */
export const POST = route(async (request) => {
  const body = await parseBody(request, smartAiRequestSchema);
  const { mode, stream } = smartAiService.generate(body, visitorKey(request));
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-SmartAI-Mode": mode,
    },
  });
});
