import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { ArrowLeftIcon } from "./icons";
import { buttonClass, Card, PageHeader } from "./ui";

type Props = {
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** What the module will offer, shown as a short list. */
  features: string[];
};

/** Consistent placeholder for modules that are planned but not built yet. */
export function ComingSoon({ title, description, icon: Icon, features }: Props) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Card className="px-6 py-12 sm:px-10">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <span className="mb-5 grid size-14 place-items-center rounded-2xl bg-accent-soft text-accent">
            <Icon className="size-7" />
          </span>
          <span className="mb-3 rounded-full border border-line px-2.5 py-0.5 text-xs font-medium text-ink-muted">
            Próximamente
          </span>
          <h2 className="text-lg font-semibold text-ink">Este módulo está en desarrollo</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Todavía no hay datos que mostrar aquí. Cuando esté disponible podrás:
          </p>
          <ul className="mt-4 flex w-full flex-col gap-2 text-left text-sm text-ink-muted">
            {features.map((feature) => (
              <li key={feature} className="flex gap-2.5 rounded-lg bg-surface-muted/70 px-3 py-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
          <Link href="/dashboard" className={`${buttonClass.secondary} mt-6`}>
            <ArrowLeftIcon className="size-4" />
            Volver al dashboard
          </Link>
        </div>
      </Card>
    </>
  );
}
