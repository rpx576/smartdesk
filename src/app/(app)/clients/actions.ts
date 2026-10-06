"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { getAppContext } from "@/server/auth/organization-context";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/server/errors/app-error";
import { logger } from "@/server/logger";
import { clientService } from "@/server/services/client.service";
import { clientCreateSchema, clientUpdateSchema } from "@/server/validation/client.schema";
import { clientsListHref, readClientForm, type ClientFormField, type ClientFormValues } from "./form-data";

export type ClientFormState =
  | {
      error?: string;
      fieldErrors?: Partial<Record<ClientFormField, string[]>>;
      /** What the user typed, to refill the form after an error. */
      values?: ClientFormValues;
    }
  | undefined;

export type DeleteClientState = { error?: string } | undefined;

/**
 * Identity comes from Auth.js and the organization from the server-side
 * context (memberships in the database). Nothing from the form decides the
 * tenant; the service still authorizes every operation.
 */
async function requireTenant() {
  const { user, organization } = await getAppContext();
  if (!organization) throw new NotFoundError("Organization not found");
  return { user, organizationId: organization.id };
}

/** Maps expected failures to friendly messages; never exposes internal details. */
function failure(error: unknown, values?: ClientFormValues): ClientFormState {
  // Let Next.js control-flow errors (e.g. the redirect to /login) through.
  unstable_rethrow(error);
  if (error instanceof ConflictError) {
    return { fieldErrors: { email: ["Ya existe un cliente con este email en tu organización"] }, values };
  }
  if (error instanceof ForbiddenError) {
    return { error: "No tienes permiso para realizar esta acción.", values };
  }
  if (error instanceof NotFoundError || error instanceof ValidationError) {
    return { error: "El cliente no existe o no pertenece a tu organización.", values };
  }
  logger.error("Client action failed", { error });
  return { error: "No se han podido guardar los cambios. Inténtalo de nuevo en unos segundos.", values };
}

const clientIdSchema = z.uuid();

export async function createClient(_state: ClientFormState, formData: FormData): Promise<ClientFormState> {
  const values = readClientForm(formData);
  const parsed = clientCreateSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };

  let clientId: string;
  try {
    const { user, organizationId } = await requireTenant();
    clientId = (await clientService.create(user, organizationId, parsed.data)).id;
  } catch (error) {
    return failure(error, values);
  }
  redirect(`/clients/${clientId}?notice=created`);
}

export async function updateClient(
  clientId: string,
  _state: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const values = readClientForm(formData);
  // The bound id travels through the browser: treat it as untrusted input.
  const id = clientIdSchema.safeParse(clientId);
  if (!id.success) return failure(new NotFoundError(), values);

  const parsed = clientUpdateSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };

  try {
    const { user, organizationId } = await requireTenant();
    await clientService.update(user, organizationId, id.data, parsed.data);
  } catch (error) {
    return failure(error, values);
  }
  redirect(`/clients/${id.data}?notice=updated`);
}

export async function deleteClient(_state: DeleteClientState, formData: FormData): Promise<DeleteClientState> {
  const id = clientIdSchema.safeParse(formData.get("clientId"));
  if (!id.success) return { error: failure(new NotFoundError())?.error };

  try {
    const { user, organizationId } = await requireTenant();
    // Only ADMIN holds `client:delete`; the service rejects everyone else.
    await clientService.delete(user, organizationId, id.data);
  } catch (error) {
    const result = failure(error);
    if (error instanceof ForbiddenError) return { error: "Solo un administrador puede eliminar clientes." };
    if (error instanceof NotFoundError) return { error: result?.error };
    return { error: "No se ha podido eliminar el cliente. Inténtalo de nuevo en unos segundos." };
  }
  redirect(
    clientsListHref({ search: formData.get("search"), page: formData.get("page"), notice: "deleted" }),
  );
}
