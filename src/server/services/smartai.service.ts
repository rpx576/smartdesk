import Anthropic from "@anthropic-ai/sdk";
import { getSmartAiConfig, type SmartAiConfig } from "@/config/env";
import { SMARTAI_ERROR_MARKER, type SmartAiMode } from "@/lib/smartai";
import { TooManyRequestsError } from "@/server/errors/app-error";
import { logger } from "@/server/logger";
import type { SmartAiRequest } from "@/server/validation/smartai.schema";
import { demoAnswer } from "./smartai/demo";
import { buildPrompt } from "./smartai/prompts";
import { createRateLimiter, type RateLimiter } from "./smartai/rate-limit";

type Deps = {
  config: () => SmartAiConfig;
  limiters: Record<SmartAiMode, RateLimiter>;
  now: () => Date;
  /** Pause between demo chunks, so the demo types like the real thing. */
  demoDelayMs: number;
  createClient: (apiKey: string) => Anthropic;
};

const encoder = new TextEncoder();
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function demoStream(text: string, delayMs: number): ReadableStream<Uint8Array> {
  const chunks = text.match(/\S+\s*|\s+/g) ?? [];
  let index = 0;
  return new ReadableStream({
    async pull(controller) {
      if (index >= chunks.length) {
        controller.close();
        return;
      }
      const next = chunks.slice(index, index + 3).join("");
      index += 3;
      if (delayMs > 0) await sleep(delayMs);
      controller.enqueue(encoder.encode(next));
    },
  });
}

function friendlyError(error: unknown): string {
  if (error instanceof Anthropic.RateLimitError || error instanceof Anthropic.InternalServerError) {
    return "SmartAI tiene mucha demanda ahora mismo. Inténtalo de nuevo en unos segundos.";
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return "No hemos podido conectar con el servicio de IA. Revisa tu conexión e inténtalo de nuevo.";
  }
  return "SmartAI no ha podido completar la respuesta. Inténtalo de nuevo.";
}

function liveStream(client: Anthropic, model: string, request: SmartAiRequest, today: Date): ReadableStream<Uint8Array> {
  const prompt = buildPrompt(request.assistant, request.inputs, request.business, today);
  const stream = client.beta.messages.stream({
    model,
    max_tokens: 16000,
    system: prompt.system,
    messages: [{ role: "user", content: prompt.user }],
    output_config: { effort: "medium" },
    // If a safety classifier declines, the API retries on its recommended fallback model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
  });

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const message = await stream.finalMessage();
        if (message.stop_reason === "refusal") {
          controller.enqueue(
            encoder.encode(`${SMARTAI_ERROR_MARKER}SmartAI no puede ayudarte con esta petición. Prueba a reformularla.`),
          );
        } else if (message.stop_reason === "max_tokens") {
          controller.enqueue(encoder.encode("\n\n_(Respuesta recortada por longitud. Pide un texto más breve.)_"));
        }
      } catch (error) {
        if (!stream.controller.signal.aborted) {
          logger.error("SmartAI generation failed", { error, assistant: request.assistant });
          controller.enqueue(encoder.encode(`${SMARTAI_ERROR_MARKER}${friendlyError(error)}`));
        }
      } finally {
        try {
          controller.close();
        } catch {
          // Already closed because the visitor cancelled.
        }
      }
    },
    cancel() {
      stream.abort();
    },
  });
}

export function createSmartAiService(deps: Deps) {
  let client: { apiKey: string; instance: Anthropic } | undefined;

  function mode(): SmartAiMode {
    return deps.config().apiKey ? "live" : "demo";
  }

  return {
    mode,

    /**
     * Streams the answer for a validated request as plain UTF-8 text.
     * `visitorKey` identifies the caller for rate limiting (IP address).
     */
    generate(request: SmartAiRequest, visitorKey: string): { mode: SmartAiMode; stream: ReadableStream<Uint8Array> } {
      const config = deps.config();
      const current = mode();
      if (!deps.limiters[current].tryConsume(visitorKey)) {
        throw new TooManyRequestsError("Has hecho muchas peticiones seguidas. Espera unos minutos y vuelve a probar.");
      }

      if (!config.apiKey) {
        const text = demoAnswer(request.assistant, request.inputs, request.business, deps.now());
        return { mode: current, stream: demoStream(text, deps.demoDelayMs) };
      }

      if (client?.apiKey !== config.apiKey) client = { apiKey: config.apiKey, instance: deps.createClient(config.apiKey) };
      return { mode: current, stream: liveStream(client.instance, config.model, request, deps.now()) };
    },
  };
}

export type SmartAiService = ReturnType<typeof createSmartAiService>;

export const smartAiService = createSmartAiService({
  config: getSmartAiConfig,
  limiters: {
    live: createRateLimiter({ limit: 15, windowMs: 10 * 60_000 }),
    demo: createRateLimiter({ limit: 60, windowMs: 10 * 60_000 }),
  },
  now: () => new Date(),
  demoDelayMs: 25,
  createClient: (apiKey) => new Anthropic({ apiKey, maxRetries: 2 }),
});
