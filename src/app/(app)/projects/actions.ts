"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { getAppContext } from "@/server/auth/organization-context";
import { ForbiddenError, NotFoundError, ValidationError } from "@/server/errors/app-error";
import { logger } from "@/server/logger";
import { projectService } from "@/server/services/project.service";
import { projectCreateSchema, projectUpdateSchema } from "@/server/validation/project.schema";
import {
  projectsListHref,
  readProjectForm,
  type ProjectFormField,
  type ProjectFormValues,
} from "./form-data";

export type ProjectFormState =
  | {
      error?: string;
      fieldErrors?: Partial<Record<ProjectFormField, string[]>>;
      /** What the user typed, to refill the form after an error. */
      values?: ProjectFormValues;
    }
  | undefined;

export type DeleteProjectState = { error?: string } | undefined;

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

const NOT_FOUND_MESSAGE = "El proyecto no existe o no pertenece a tu organización.";

/** Field-level details from service validation (e.g. a client of another organization). */
type FieldErrors = NonNullable<NonNullable<ProjectFormState>["fieldErrors"]>;

function detailsToFieldErrors(details: unknown): FieldErrors | undefined {
  if (!Array.isArray(details)) return undefined;
  const fieldErrors: FieldErrors = {};
  for (const detail of details) {
    const path = (detail as { path?: unknown })?.path;
    const message = (detail as { message?: unknown })?.message;
    if (typeof path === "string" && typeof message === "string") {
      fieldErrors[path as ProjectFormField] = [message];
    }
  }
  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

/** Maps expected failures to friendly messages; never exposes internal details. */
function failure(error: unknown, values?: ProjectFormValues): ProjectFormState {
  // Let Next.js control-flow errors (e.g. the redirect to /login) through.
  unstable_rethrow(error);
  if (error instanceof ValidationError) {
    const fieldErrors = detailsToFieldErrors(error.details);
    return fieldErrors
      ? { fieldErrors, values }
      : { fieldErrors: { clientId: ["Selecciona un cliente de tu organización"] }, values };
  }
  if (error instanceof ForbiddenError) {
    return { error: "No tienes permiso para realizar esta acción.", values };
  }
  if (error instanceof NotFoundError) return { error: NOT_FOUND_MESSAGE, values };
  logger.error("Project action failed", { error });
  return { error: "No se han podido guardar los cambios. Inténtalo de nuevo en unos segundos.", values };
}

const projectIdSchema = z.uuid();

export async function createProject(
  _state: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const values = readProjectForm(formData);
  const parsed = projectCreateSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };

  let projectId: string;
  try {
    const { user, organizationId } = await requireTenant();
    // The service re-checks that clientId belongs to this organization.
    projectId = (await projectService.create(user, organizationId, parsed.data)).id;
  } catch (error) {
    return failure(error, values);
  }
  redirect(`/projects/${projectId}?notice=created`);
}

export async function updateProject(
  projectId: string,
  _state: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const values = readProjectForm(formData);
  // The bound id travels through the browser: treat it as untrusted input.
  const id = projectIdSchema.safeParse(projectId);
  if (!id.success) return { error: NOT_FOUND_MESSAGE, values };

  const parsed = projectUpdateSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };

  try {
    const { user, organizationId } = await requireTenant();
    await projectService.update(user, organizationId, id.data, parsed.data);
  } catch (error) {
    return failure(error, values);
  }
  redirect(`/projects/${id.data}?notice=updated`);
}

export async function deleteProject(
  _state: DeleteProjectState,
  formData: FormData,
): Promise<DeleteProjectState> {
  const id = projectIdSchema.safeParse(formData.get("projectId"));
  if (!id.success) return { error: NOT_FOUND_MESSAGE };

  try {
    const { user, organizationId } = await requireTenant();
    // Only ADMIN holds `project:delete`; the service rejects everyone else.
    await projectService.delete(user, organizationId, id.data);
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof ForbiddenError) return { error: "Solo un administrador puede eliminar proyectos." };
    if (error instanceof NotFoundError) return { error: NOT_FOUND_MESSAGE };
    logger.error("Project delete failed", { error });
    return { error: "No se ha podido eliminar el proyecto. Inténtalo de nuevo en unos segundos." };
  }
  redirect(
    projectsListHref({
      search: formData.get("search"),
      status: formData.get("status"),
      priority: formData.get("priority"),
      clientId: formData.get("clientId"),
      page: formData.get("page"),
      notice: "deleted",
    }),
  );
}
