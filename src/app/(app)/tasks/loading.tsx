import { ListSkeleton } from "../_components/list-skeleton";

export default function TasksLoading() {
  return <ListSkeleton label="Cargando tareas…" filters={7} />;
}
