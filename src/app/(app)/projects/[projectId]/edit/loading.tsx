import { FormSkeleton } from "../../../_components/form-skeleton";

export default function EditProjectLoading() {
  return (
    <div className="mx-auto max-w-3xl">
      <FormSkeleton label="Cargando proyecto…" />
    </div>
  );
}
