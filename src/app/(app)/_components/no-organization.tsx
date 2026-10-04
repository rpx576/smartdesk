import { UsersIcon } from "./icons";
import { Card, EmptyState } from "./ui";

/** Shown when a signed-in user is not a member of any organization. */
export function NoOrganization() {
  return (
    <Card>
      <EmptyState
        icon={UsersIcon}
        title="No perteneces a ninguna organización"
        description="Pide a un administrador de tu empresa que te dé acceso a SmartDesk."
      />
    </Card>
  );
}
