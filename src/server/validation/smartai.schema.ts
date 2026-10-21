import { z } from "zod";
import { ASSISTANT_IDS, BUSINESS_LIMITS, getAssistant } from "@/lib/smartai";

const tooLong = (max: number) => `Máximo ${max} caracteres`;

const businessSchema = z.strictObject({
  name: z.string().trim().max(BUSINESS_LIMITS.name, tooLong(BUSINESS_LIMITS.name)).default(""),
  sector: z.string().trim().max(BUSINESS_LIMITS.sector, tooLong(BUSINESS_LIMITS.sector)).default(""),
  tone: z.string().trim().max(BUSINESS_LIMITS.tone, tooLong(BUSINESS_LIMITS.tone)).default(""),
});

/**
 * Body of POST /api/smartai. The fields allowed in `inputs` depend on the
 * assistant: unknown fields, missing required ones, values over the limit or
 * outside a select's options are rejected. Values come back trimmed.
 */
export const smartAiRequestSchema = z
  .strictObject({
    assistant: z.enum(ASSISTANT_IDS, { error: "Asistente no válido" }),
    inputs: z.record(z.string(), z.string().max(10_000)),
    business: businessSchema.optional(),
  })
  .transform((body, ctx) => {
    const assistant = getAssistant(body.assistant);
    const inputs: Record<string, string> = {};

    for (const key of Object.keys(body.inputs)) {
      if (!assistant.fields.some((field) => field.name === key)) {
        ctx.addIssue({ code: "custom", path: ["inputs", key], message: "Campo no válido" });
      }
    }

    for (const field of assistant.fields) {
      const value = (body.inputs[field.name] ?? "").trim();
      const path = ["inputs", field.name];
      if (field.required && !value) {
        ctx.addIssue({ code: "custom", path, message: `${field.label}: este campo es obligatorio` });
      } else if (value.length > field.maxLength) {
        ctx.addIssue({ code: "custom", path, message: `${field.label}: ${tooLong(field.maxLength).toLowerCase()}` });
      } else if (value && field.options && !field.options.includes(value)) {
        ctx.addIssue({ code: "custom", path, message: `${field.label}: elige una opción de la lista` });
      }
      inputs[field.name] = value;
    }

    return {
      assistant: body.assistant,
      inputs,
      business: body.business ?? { name: "", sector: "", tone: "" },
    };
  });

export type SmartAiRequest = z.output<typeof smartAiRequestSchema>;
