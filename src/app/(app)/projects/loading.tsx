import { ListSkeleton } from "../_components/list-skeleton";

export default function ProjectsLoading() {
  return <ListSkeleton label="Cargando proyectos…" filters={3} />;
}
