import Link from "next/link";
import { SearchIcon } from "../../_components/icons";
import { buttonClass, Card, EmptyState } from "../../_components/ui";

export default function EventNotFound() {
  return (
    <Card>
      <EmptyState
        icon={SearchIcon}
        title="Evento no encontrado"
        description="No existe o no pertenece a tu organización."
        action={
          <Link href="/smartdesk/calendar" className={buttonClass.secondary}>
            Volver al calendario
          </Link>
        }
      />
    </Card>
  );
}
