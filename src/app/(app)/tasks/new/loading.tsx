import { FormSkeleton } from "../../_components/form-skeleton";

export default function NewTaskLoading() {
  return (
    <div className="mx-auto max-w-3xl">
      <FormSkeleton label="Cargando formulario…" />
    </div>
  );
}
