import Link from "next/link";
import { SearchIcon } from "../../_components/icons";
import { buttonClass, Card, EmptyState } from "../../_components/ui";

export default function ClientNotFound() {
  return (
    <Card>
      <EmptyState
        icon={SearchIcon}
        title="Cliente no encontrado"
        description="No existe o no pertenece a tu organización."
        action={
          <Link href="/clients" className={buttonClass.secondary}>
            Volver a clientes
          </Link>
        }
      />
    </Card>
  );
}
