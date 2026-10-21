import type { Metadata } from "next";
import { pageMetadata } from "../_home/page-metadata";
import { ContactPage } from "./contact-page";

export const metadata: Metadata = pageMetadata("es", "contact", "/contacto");

export default function Contacto() {
  return <ContactPage locale="es" />;
}
