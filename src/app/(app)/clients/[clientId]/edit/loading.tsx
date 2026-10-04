import { FormSkeleton } from "../../_components/form-skeleton";

export default function EditClientLoading() {
  return (
    <div className="mx-auto max-w-3xl">
      <FormSkeleton label="Cargando cliente…" />
    </div>
  );
}
