import type { Metadata } from "next";
import { HomePage } from "./_home/home-page";
import { pageMetadata } from "./_home/page-metadata";

export const metadata: Metadata = pageMetadata("es", "home", "/");

/** Home in Spanish (the default language). The English version lives at /en. */
export default function Home() {
  return <HomePage locale="es" />;
}
