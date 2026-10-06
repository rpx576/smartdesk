import Link from "next/link";
import { SearchIcon } from "../../_components/icons";
import { buttonClass, Card, EmptyState } from "../../_components/ui";

export default function TaskNotFound() {
  return (
    <Card>
      <EmptyState
        icon={SearchIcon}
        title="Tarea no encontrada"
        description="No existe o no pertenece a tu organización."
        action={
          <Link href="/tasks" className={buttonClass.secondary}>
            Volver a tareas
          </Link>
        }
      />
    </Card>
  );
}
