type Level = "info" | "warn" | "error";

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return { message: String(error) };
}

function write(level: Level, message: string, context?: Record<string, unknown>) {
  const { error, ...rest } = context ?? {};
  const entry = {
    level,
    time: new Date().toISOString(),
    message,
    ...rest,
    ...(error === undefined ? {} : { error: serializeError(error) }),
  };
  console[level](JSON.stringify(entry));
}

/** Structured JSON logger (server-side only). */
export const logger = {
  info: (message: string, context?: Record<string, unknown>) => write("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => write("warn", message, context),
  error: (message: string, context?: Record<string, unknown>) => write("error", message, context),
};
