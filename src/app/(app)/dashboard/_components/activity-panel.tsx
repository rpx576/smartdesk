import { ActivityIcon } from "../../_components/icons";
import { Card, CardHeader, ComingSoonBadge, EmptyState } from "../../_components/ui";

/**
 * Placeholder for the organization activity feed.
 *
 * There is no activity/audit model yet, so nothing is fetched or invented.
 * Missing to make it real: an `ActivityEvent` table (organizationId, actorId,
 * action, entity type/id, metadata, createdAt) written by the services, plus a
 * repository/service method that lists the latest events for one organization.
 */
export function ActivityPanel() {
  return (
    <Card>
      <CardHeader
        title="Actividad reciente"
        description="Últimos cambios en tu organización"
        action={<ComingSoonBadge />}
      />
      <EmptyState
        icon={ActivityIcon}
        title="Aún no hay actividad registrada"
        description="Aquí verás las altas de clientes, tareas completadas o documentos subidos cuando se active el registro de actividad."
      />
    </Card>
  );
}
