import type { NextRequest } from "next/server";
import { contactService } from "@/server/contact/contact.service";
import { errorResponse, parseBody } from "@/server/http/route";
import { z } from "zod";

/** Address of the visitor: Netlify's header first, then the standard proxy header. */
function clientIp(request: NextRequest): string | null {
  return (
    request.headers.get("x-nf-client-connection-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null
  );
}

const MAX_BODY_BYTES = 16 * 1024;

/** POST /api/contacto: contact and quote requests from the website form. */
export async function POST(request: NextRequest) {
  try {
    if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
      return Response.json({ error: { code: "VALIDATION_ERROR", message: "El mensaje es demasiado largo." } }, { status: 413 });
    }
    const body = await parseBody(request, z.unknown());
    await contactService.submit(body, clientIp(request));
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}
