import Link from "next/link";
import { UsersIcon } from "./icons";
import { buttonClass, Card, EmptyState } from "./ui";

/** Shown when a signed-in user is not a member of any organization. */
export function NoOrganization() {
  return (
    <Card>
      <EmptyState
        icon={UsersIcon}
        title="No perteneces a ninguna organización"
        description="Crea la de tu empresa o pide a un administrador que te dé acceso a SmartDesk."
        action={
          <Link href="/smartdesk/empezar" className={buttonClass.primary}>
            Crear mi empresa
          </Link>
        }
      />
    </Card>
  );
}
