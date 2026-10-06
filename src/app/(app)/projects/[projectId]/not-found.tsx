import Link from "next/link";
import { SearchIcon } from "../../_components/icons";
import { buttonClass, Card, EmptyState } from "../../_components/ui";

export default function ProjectNotFound() {
  return (
    <Card>
      <EmptyState
        icon={SearchIcon}
        title="Proyecto no encontrado"
        description="No existe o no pertenece a tu organización."
        action={
          <Link href="/projects" className={buttonClass.secondary}>
            Volver a proyectos
          </Link>
        }
      />
    </Card>
  );
}
