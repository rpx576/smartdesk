const modules = [
  "Dashboard",
  "Clientes",
  "Proyectos",
  "Tareas",
  "Calendario",
  "Documentos",
  "Usuarios y roles",
  "Configuración",
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-8 px-8 py-24">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
            SmartDesk
          </h1>
          <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Plataforma de gestión para pequeñas empresas: clientes, proyectos, tareas y
            documentos en un solo lugar.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {modules.map((name) => (
            <li
              key={name}
              className="rounded-lg border border-black/[.08] bg-white px-4 py-3 text-sm font-medium text-zinc-800 dark:border-white/[.145] dark:bg-zinc-950 dark:text-zinc-200"
            >
              {name}
            </li>
          ))}
        </ul>
        <p className="text-sm text-zinc-500">
          API en desarrollo ·{" "}
          <a className="underline" href="/api/health">
            /api/health
          </a>
        </p>
      </main>
    </div>
  );
}
