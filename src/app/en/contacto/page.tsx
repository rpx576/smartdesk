import type { Metadata } from "next";
import { pageMetadata } from "../../_home/page-metadata";
import { ContactPage } from "../../contacto/contact-page";

export const metadata: Metadata = pageMetadata("en", "contact", "/contacto");

export default function EnglishContact() {
  return <ContactPage locale="en" />;
}
