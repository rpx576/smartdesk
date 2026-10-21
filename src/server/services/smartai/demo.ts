import type { AssistantId, BusinessProfile } from "@/lib/smartai";

/*
 * Demo mode: when no AI key is configured, SmartAI still answers with a
 * deterministic draft built from what the visitor typed (rules and
 * templates, no model). The page labels these answers as a demo.
 */

const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", useGrouping: "always" });

/** "1.800 €", "1800,50", "2.500" -> number (Spanish notation). Null when there is no amount. */
export function parseEuros(text: string): number | null {
  const match = text.replace(/\s/g, "").match(/\d[\d.,]*/);
  if (!match) return null;
  let raw = match[0].replace(/[.,]$/, "");
  if (/,\d{1,2}$/.test(raw)) raw = raw.replace(/\./g, "").replace(",", ".");
  else raw = raw.replace(/[.,](?=\d{3}(\D|$))/g, "").replace(",", ".");
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : null;
}

/** Splits `total` by `weights`, in cents, so the parts always add up exactly. */
export function splitAmount(total: number, weights: number[]): number[] {
  const cents = Math.round(total * 100);
  const sum = weights.reduce((a, b) => a + b, 0);
  const parts = weights.map((w) => Math.floor((cents * w) / sum / 100) * 100);
  parts[parts.length - 1] += cents - parts.reduce((a, b) => a + b, 0);
  return parts.map((p) => p / 100);
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const clean = (text: string) => text.trim().replace(/\s+/g, " ").replace(/[.;:,]+$/, "");
const businessName = (business: BusinessProfile) => business.name || "[Tu negocio]";

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map(clean)
    .filter((s) => s.length > 2);
}

function quote(inputs: Record<string, string>, business: BusinessProfile, today: Date): string {
  const client = inputs.cliente || "[Cliente]";
  const date = today.toLocaleDateString("es-ES", { timeZone: "Europe/Madrid" });
  const parsed = parseEuros(inputs.importe ?? "");
  const total = parsed ?? 950;

  let concepts = inputs.trabajo
    .split(/[.;\n]|,\s*|\s+y\s+(?=[a-záéíóú]+\s)/i)
    .map(clean)
    .filter((c) => c.length > 3)
    .slice(0, 4)
    .map(capitalize);
  if (concepts.length < 2) concepts = ["Análisis y planificación", capitalize(clean(inputs.trabajo)).slice(0, 80), "Puesta en marcha y entrega"];

  const weights = [0.4, 0.3, 0.2, 0.1].slice(0, concepts.length);
  const amounts = splitAmount(total, weights);
  const vat = Math.round(total * 21) / 100;

  const rows = concepts.map((concept, i) => `| ${concept} | ${i === 0 ? "Incluye preparación y material necesario" : "Según lo acordado"} | ${euros.format(amounts[i])} |`);

  return `## Presupuesto

**Cliente:** ${client} · **Fecha:** ${date} · **Validez:** 30 días · **Emitido por:** ${businessName(business)}

| Concepto | Detalle | Importe |
| --- | --- | --- |
${rows.join("\n")}

- **Base imponible:** ${euros.format(total)}
- **IVA (21 %):** ${euros.format(vat)}
- **Total:** ${euros.format(total + vat)}
${parsed === null ? "\n> Importe orientativo: no indicaste un precio, así que hemos usado una cifra de ejemplo. Ajústala antes de enviarlo.\n" : ""}
## Plazo y condiciones

- **Plazo de entrega:** ${inputs.plazo || "a convenir tras la aceptación"}.
- **Forma de pago:** 50 % al aceptar el presupuesto y 50 % a la entrega.
- No incluye trabajos ni materiales que no aparezcan en este documento.

## Correo para enviarlo

**Asunto:** Presupuesto para ${client}

Hola${inputs.cliente ? ` ${inputs.cliente}` : ""}:

Te adjunto el presupuesto que hemos preparado según lo que hablamos. Si te encaja, solo tienes que responder a este correo y lo ponemos en marcha${inputs.plazo ? ` con un plazo de ${inputs.plazo}` : ""}. Cualquier duda, estamos a tu disposición.

Un saludo,
${businessName(business)}`;
}

function reply(inputs: Record<string, string>, business: BusinessProfile): string {
  const message = inputs.mensaje.toLowerCase();
  const upset = /(nadie|queja|molest|tarde|retraso|esper|mal |fatal|no me (han|habéis|has)|todavía|aún no)/.test(message);
  const price = /(precio|presupuesto|cu[aá]nto|tarifa|coste)/.test(message);
  const whatsapp = inputs.canal === "WhatsApp";
  const tone = inputs.tono || "Profesional";
  const goal = inputs.objetivo ? clean(inputs.objetivo) : "";

  const greeting = tone === "Profesional" ? "Buenos días" : "¡Hola!";
  const apology = upset
    ? tone === "Breve"
      ? "Perdona el retraso en responderte."
      : "Tienes toda la razón y te pedimos disculpas por no haberte contestado antes; no es la atención que queremos dar."
    : "Gracias por escribirnos.";
  const answer = price
    ? "Te preparamos el presupuesto hoy mismo para que lo tengas cuanto antes, con el precio cerrado y sin sorpresas."
    : "Hemos revisado tu mensaje y nos encargamos de ello.";
  const next = /cita/i.test(goal) || upset
    ? "¿Te viene bien pasarte [día] a las [hora]? Te reservamos el hueco ahora mismo."
    : "¿Te parece bien que lo dejemos cerrado hoy? Solo tienes que confirmarnos y nos ponemos en marcha.";

  const body = whatsapp
    ? `${greeting} ${apology}\n\n${answer}\n\n${next}`
    : `${greeting}:\n\n${apology} ${answer}\n\n${next}\n\nUn saludo,\n${businessName(business)}`;

  return `## Respuesta lista para enviar

${body}

## Versión corta

${upset ? "Perdona el retraso, ya estamos con ello." : "Gracias por escribirnos, nos encargamos."} ${next}`;
}

const TASK_VERB = /(enviar|enviará|revisar|revisará|preparar|preparará|hay que|pendiente|llamar|llamará|pedir|pedirá|mandar|mandará|hacer|hará|organizar|confirmar|confirmará)/i;
const DECISION = /(decid|acord|aprob|vamos a|empezar|empezamos|quieren|elegi)/i;
const WHEN = /\b(hoy|mañana|lunes|martes|miércoles|jueves|viernes|sábado|domingo|(?:el )?día \d{1,2}|\d{1,2}\/\d{1,2}|esta semana|la semana que viene|antes de [a-záéíóú]+)\b/i;
const OWNER = /^([A-ZÁÉÍÓÚ][a-záéíóúñ]+)\s+(se encargará de|enviará|revisará|preparará|llamará|pedirá|mandará|hará|confirmará|organizará)\s+/;
const INFINITIVE: Record<string, string> = {
  "se encargará de": "",
  enviará: "enviar",
  revisará: "revisar",
  preparará: "preparar",
  llamará: "llamar",
  pedirá: "pedir",
  mandará: "mandar",
  hará: "hacer",
  confirmará: "confirmar",
  organizará: "organizar",
};

export function extractTasks(text: string): { task: string; owner: string; when: string }[] {
  const tasks: { task: string; owner: string; when: string }[] = [];
  for (const sentence of sentences(text)) {
    if (!TASK_VERB.test(sentence)) continue;
    const whenMatch = sentence.match(WHEN)?.[0];
    const when = whenMatch ? whenMatch.replace(/^el /i, "") : "Sin fecha";
    const owner = sentence.match(OWNER);
    let body = owner ? `${INFINITIVE[owner[2]]} ${sentence.slice(owner[0].length)}` : sentence;
    if (whenMatch) body = body.replace(new RegExp(`\\s*(?:para |antes de |el |la )?${whenMatch}`, "i"), "");
    body = body.replace(/^(hay que|pendiente:?|tenemos que)\s*/i, "");

    const items = /^pendiente/i.test(sentence) ? body.split(/,\s*|\s+y\s+/) : [body];
    const verb = clean(items[0]).split(" ")[0];
    items.forEach((item, i) => {
      let task = clean(item);
      if (!task) return;
      // "pedir fotos y los textos": the second item borrows the verb of the first.
      if (i > 0 && !/^[a-záéíóúñ]+(ar|er|ir)\b/i.test(task)) task = `${verb} ${task}`;
      tasks.push({ task: capitalize(task), owner: owner?.[1] ?? "Sin asignar", when });
    });
  }
  return tasks;
}

function summary(inputs: Record<string, string>): string {
  const all = sentences(inputs.texto);
  const tasks = extractTasks(inputs.texto);
  const decisions = all.filter((s) => DECISION.test(s) && !TASK_VERB.test(s));
  const rows = tasks.map((t) => `| ${t.task} | ${t.owner} | ${t.when} |`);

  return `## Resumen

${all.slice(0, 2).join(". ")}.

## Decisiones

${decisions.length > 0 ? decisions.map((d) => `- ${d}`).join("\n") : "- No se recoge ninguna decisión cerrada."}

## Tareas

${tasks.length > 0 ? `| Tarea | Responsable | Fecha |\n| --- | --- | --- |\n${rows.join("\n")}` : "No hemos encontrado tareas pendientes en el texto."}

## Próximos pasos

${tasks[0] ? `${tasks[0].task}${[tasks[0].owner, tasks[0].when].some((v) => !v.startsWith("Sin")) ? ` (${[tasks[0].owner, tasks[0].when].filter((v) => !v.startsWith("Sin")).join(", ")})` : ""}.` : "Confirmar con el equipo qué hay que hacer a continuación."}`;
}

function hashtags(text: string, business: BusinessProfile): string[] {
  const words = `${text} ${business.sector}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .match(/[a-zñ]{5,}/g) ?? [];
  const stop = new Set(["durante", "todos", "todas", "nuestro", "nuestra", "desde", "hasta", "sobre", "cortesia", "completa", "completo"]);
  const unique = [...new Set(words.filter((w) => !stop.has(w)))].slice(0, 5);
  return [...unique, "pymes", "comerciolocal"].map((w) => `#${w}`);
}

function marketing(inputs: Record<string, string>, business: BusinessProfile): string {
  const offer = clean(inputs.oferta);
  const network = inputs.red || "Instagram";
  const goal = inputs.objetivo || "Vender";
  const name = businessName(business);
  const cta = goal === "Vender" ? "Reserva ya por mensaje directo o llámanos." : goal === "Fidelizar" ? "Gracias por confiar en nosotros, ¡te esperamos!" : "Síguenos para no perderte ninguna novedad.";

  const main =
    network === "LinkedIn"
      ? `En ${name} creemos que los detalles marcan la diferencia.\n\n${offer}.\n\nLo hemos pensado para quienes valoran su tiempo y quieren un servicio sin sorpresas. ${cta}`
      : network === "Google Business"
        ? `${offer}. ${cta}`
        : `✨ ${offer} ✨\n\nEn ${name} lo ponemos fácil: tú eliges el día y nosotros nos encargamos del resto.\n\n👉 ${cta}`;

  const extra =
    network === "Google Business"
      ? `## Oferta destacada\n\n${capitalize(offer.split(/[,.]/)[0])}`
      : `## Hashtags\n\n${hashtags(offer, business).join(" ")}`;

  return `## Publicación principal

${main}

## Versión alternativa

Este mes en ${name}: ${offer.charAt(0).toLowerCase()}${offer.slice(1)}. Plazas limitadas. ${cta}

${extra}

## Idea para la imagen

Foto real del equipo de ${name} trabajando, con la oferta en grande y el precio o la fecha bien visibles.

## Asuntos para un email

- ${capitalize(offer.split(/[,.]/)[0])}
- Solo este mes en ${name}
- Te guardamos un hueco: ${goal === "Vender" ? "reserva hoy" : "descubre la novedad"}`;
}

/** Complaint keywords -> how the reply names them (topic) and apologises for them. */
const COMPLAINTS: { pattern: RegExp; topic: string; sorry: string }[] = [
  { pattern: /esper/, topic: "los tiempos de espera", sorry: "la espera que tuviste" },
  { pattern: /(retraso|tarde|demora)/, topic: "los retrasos", sorry: "el retraso" },
  { pattern: /(precio|caro|factura)/, topic: "los precios y cómo los explicamos", sorry: "que el precio no te encajara" },
  { pattern: /(sucio|limpi)/, topic: "la limpieza", sorry: "lo que nos cuentas de la limpieza" },
  { pattern: /(organiza|desorden|caos)/, topic: "la organización", sorry: "los fallos de organización" },
  { pattern: /(borde|antip|mal trato|maleducad)/, topic: "el trato al cliente", sorry: "que no te sintieras bien atendido" },
];

function review(inputs: Record<string, string>, business: BusinessProfile): string {
  const stars = Number(inputs.puntuacion?.match(/\d/)?.[0] ?? 5);
  const author = inputs.autor ? ` ${inputs.autor}` : "";
  const name = businessName(business);
  const text = inputs.resena.toLowerCase();
  const praise = /(amable|trato|atenci|perfect|genial|profesional|rápid)/.test(text);
  const complaint = COMPLAINTS.find((c) => c.pattern.test(text));

  const body =
    stars >= 4
      ? `¡Muchas gracias${author}! ${praise ? "Nos alegra mucho que valores el trato del equipo" : "Nos alegra mucho que quedaras contento"}; se lo trasladamos a todos. ${complaint ? `Tomamos nota de lo que comentas sobre ${complaint.topic} para hacerlo aún mejor. ` : ""}¡Te esperamos pronto en ${name}!`
      : `Hola${author}, gracias por tomarte el tiempo de escribirnos. ${praise ? "Nos alegra que el trato fuera bueno, pero sentimos" : "Sentimos"} de verdad ${complaint ? complaint.sorry : "que la experiencia no estuviera a la altura"}: no es lo que queremos para nuestros clientes y ya lo estamos revisando. Si quieres, escríbenos a [email] o llámanos al [teléfono] y lo hablamos en persona.`;

  return `## Respuesta pública

${body}

## Qué mejorar internamente

- ${complaint ? `Revisar ${complaint.topic}: es lo que más pesa en esta reseña.` : "Revisar el caso con el equipo que le atendió."}
- ${stars >= 4 ? "Pedir a los clientes satisfechos que dejen su reseña." : "Contactar con el cliente en privado en las próximas 24 horas."}`;
}

export function demoAnswer(
  assistant: AssistantId,
  inputs: Record<string, string>,
  business: BusinessProfile,
  today: Date,
): string {
  switch (assistant) {
    case "presupuesto":
      return quote(inputs, business, today);
    case "respuesta":
      return reply(inputs, business);
    case "resumen":
      return summary(inputs);
    case "marketing":
      return marketing(inputs, business);
    case "resena":
      return review(inputs, business);
  }
}
