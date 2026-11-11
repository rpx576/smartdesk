import { getContactConfig, isEmailConfigured, type ContactConfig } from "@/config/env";
import { AppError, TooManyRequestsError, ValidationError } from "@/server/errors/app-error";
import { logger } from "@/server/logger";
import { createRateLimiter, type RateLimiter } from "@/server/security/rate-limit";
import { verifyTurnstile } from "@/server/security/turnstile";
import { acknowledgementEmail, teamEmail } from "./email";
import { resendMailer, type Mailer } from "./mailer";
import { contactSchema, type ContactInput } from "./schema";
import { checkSpam } from "./spam";

/** Email sending is not set up yet: the form must say so and offer WhatsApp. */
export class EmailNotConfiguredError extends AppError {
  constructor() {
    super("NOT_CONFIGURED", 503, "El envío por correo todavía no está activado.");
  }
}

/** The provider refused or timed out: nothing was sent. */
export class EmailDeliveryError extends AppError {
  constructor() {
    super("DELIVERY_FAILED", 502, "No hemos podido enviar tu mensaje. Inténtalo de nuevo o escríbenos por WhatsApp.");
  }
}

type Deps = {
  config: () => ContactConfig;
  mailer: (config: ContactConfig) => Mailer;
  limiter: RateLimiter;
  verifyHuman: (token: string | undefined, secret: string, ip: string | null) => Promise<boolean>;
  now: () => number;
};

/** Per IP: 5 submissions every 10 minutes (per server instance). */
const defaultLimiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

export function createContactService(deps: Deps) {
  return {
    /**
     * Validates and sends one submission. Bots that trip the honeypot or the
     * time check get the same answer as a person, so they learn nothing;
     * nothing is sent for them. Logs never contain personal data.
     */
    async submit(body: unknown, ip: string | null): Promise<{ sent: boolean }> {
      if (!deps.limiter.tryConsume(ip ?? "unknown", deps.now())) throw new TooManyRequestsError("Has enviado varios mensajes seguidos. Espera unos minutos.");

      const input: ContactInput = contactSchema.parse(body);
      const spam = checkSpam(input, deps.now());
      if (!spam.ok) {
        logger.warn("Contact form submission discarded", { reason: spam.reason });
        return { sent: false };
      }

      const config = deps.config();
      if (config.turnstileSecret && !(await deps.verifyHuman(input.turnstileToken, config.turnstileSecret, ip))) {
        throw new ValidationError("No hemos podido comprobar que no eres un robot. Recarga la página e inténtalo de nuevo.");
      }
      if (!isEmailConfigured(config)) throw new EmailNotConfiguredError();

      const addresses = { to: config.to as string, from: config.from as string };
      const send = deps.mailer(config);
      try {
        await send(teamEmail(input, addresses));
      } catch (error) {
        logger.error("Contact email to the team failed", { error });
        throw new EmailDeliveryError();
      }
      try {
        await send(acknowledgementEmail(input, addresses));
      } catch (error) {
        // The request already reached the team; a failed copy must not show an error.
        logger.warn("Contact acknowledgement email failed", { error });
      }
      logger.info("Contact form submission sent", { requestType: input.requestType, service: input.service });
      return { sent: true };
    },
  };
}

export const contactService = createContactService({
  config: getContactConfig,
  mailer: (config) => resendMailer(config.resendApiKey as string),
  limiter: defaultLimiter,
  verifyHuman: verifyTurnstile,
  now: Date.now,
});
