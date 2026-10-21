import type { Metadata } from "next";
import { HomePage } from "../_home/home-page";
import { pageMetadata } from "../_home/page-metadata";

export const metadata: Metadata = pageMetadata("en", "home", "/");

/** Home in English. */
export default function EnglishHome() {
  return <HomePage locale="en" />;
}
