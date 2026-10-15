import type { Metadata } from "next";
import Link from "next/link";
import { SMARTDESK_HREF } from "../_home/navigation";
import { SiteHeader } from "../_home/site-header";
import { ARTICLES, CATEGORIES, KEY_DATES, categoryOf, type CoverImage as Cover } from "./articles";
import { BlogExplorer } from "./blog-explorer";
import { CoverImage } from "./cover-image";
import { KeyDates } from "./key-dates";
import { formatDay } from "./query";
import "./blog.css";

export const metadata: Metadata = {
  title: "Blog · SmartHub",
  description:
    "Noticias con fuentes sobre facturación electrónica, Verifactu, inteligencia artificial para empresas, webs y ciberseguridad, explicadas para pequeñas empresas.",
};

const latest = [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date));
const lastUpdate = latest[0].date;

/** One photo per topic for the hero mosaic, taken from that topic's newest story. */
const mosaic = ["facturacion", "ia", "seguridad", "web"].flatMap((id) => latest.find((a) => a.category === id) ?? []);

const ctaImage: Cover = { id: "photo-1449247709967-d4461a6a6103", alt: "", author: "Bench Accounting" };

const sectionLinks = [
  { label: "Inicio", href: "/" },
  { label: "Soluciones", href: "/#soluciones" },
  { label: "SmartDesk", href: SMARTDESK_HREF },
  { label: "Opiniones", href: "/#opiniones" },
  { label: "Contacto", href: "/contacto" },
];

function SectionLinks() {
  return (
    <ul className="bl-links">
      {sectionLinks.map((link) => (
        <li key={link.href}>
          <Link href={link.href}>{link.label}</Link>
        </li>
      ))}
    </ul>
  );
}

/** SmartHub blog: light, minimal and photo-led, apart from the dark pages of the site. */
export default function BlogPage() {
  return (
    <div className="bl-page relative isolate flex min-h-dvh flex-1 flex-col font-sans">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <nav aria-label="Secciones de SmartHub" className="bl-crumbs">
          <Link href="/" className="bl-back">
            <span aria-hidden="true">←</span> Volver al inicio
          </Link>
          <SectionLinks />
        </nav>

        <header className="bl-hero">
          <div className="bl-hero__copy bl-in">
            <p className="bl-eyebrow">
              <span className="bl-live" aria-hidden="true" /> Blog de SmartHub · actualizado el {formatDay(lastUpdate)}
            </p>
            <h1 className="bl-hero__title">
              Noticias que <span className="bl-hero__accent">mueven</span> tu negocio.
            </h1>
            <p className="bl-hero__lead">
              Facturación, inteligencia artificial, webs y seguridad, explicadas en claro para pequeñas empresas. Cada
              noticia enlaza a sus fuentes originales.
            </p>
            <dl className="bl-stats">
              <div>
                <dt>Noticias</dt>
                <dd>{ARTICLES.length}</dd>
              </div>
              <div>
                <dt>Temas</dt>
                <dd>{CATEGORIES.length}</dd>
              </div>
              <div>
                <dt>Plazos en agenda</dt>
                <dd>{KEY_DATES.length}</dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#noticias" className="bl-button">
                Ver noticias
              </a>
              <a href="#plazos" className="bl-button bl-button--ghost">
                Próximos plazos
              </a>
            </div>
          </div>

          <ul className="bl-mosaic" aria-label="Lo último por tema">
            {mosaic.map((article, index) => (
              <li key={article.id} className={`bl-mosaic__item bl-mosaic__item--${index + 1} bl-in`}>
                <a href={`#${article.id}`} className="bl-mosaic__link">
                  <CoverImage
                    image={article.image}
                    sizes={index === 0 ? "(min-width: 1024px) 30vw, 60vw" : "(min-width: 1024px) 18vw, 40vw"}
                    preload={index === 0}
                    className="bl-media__img"
                  />
                  <span className="bl-mosaic__shade" aria-hidden="true" />
                  <span className="bl-mosaic__text">
                    <span className={`bl-chip bl-chip--glass bl-tone--${article.category}`}>
                      {categoryOf(article.category).label}
                    </span>
                    {index === 0 && <span className="bl-mosaic__title">{article.title}</span>}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </header>

        <BlogExplorer />

        <section id="plazos" aria-labelledby="plazos-title" className="bl-section scroll-mt-20">
          <div className="bl-section__head">
            <div>
              <p className="bl-eyebrow">Agenda</p>
              <h2 id="plazos-title" className="bl-section__title">
                Próximos plazos
              </h2>
            </div>
            <p className="bl-section__intro">Las fechas clave que salen en las noticias, con su cuenta atrás.</p>
          </div>
          <KeyDates />
        </section>

        <section aria-labelledby="cta-title" className="bl-cta">
          <div className="bl-cta__copy">
            <p className="bl-eyebrow bl-eyebrow--light">SmartDesk · SmartAI · SmartWeb</p>
            <h2 id="cta-title" className="bl-cta__title">
              ¿Te afecta alguna de estas noticias?
            </h2>
            <p className="bl-cta__text">
              Te ayudamos a prepararte: gestión y facturación con SmartDesk, automatización con SmartAI y webs
              accesibles con SmartWeb.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={SMARTDESK_HREF} className="bl-button bl-button--light">
                Probar SmartDesk
              </Link>
              <Link href="/contacto" className="bl-button bl-button--outline">
                Hablar con nosotros
              </Link>
            </div>
          </div>
          <div className="bl-media bl-cta__media">
            <CoverImage image={ctaImage} sizes="(min-width: 1024px) 40vw, 100vw" className="bl-media__img" />
          </div>
        </section>

        <p className="bl-note">
          Los resúmenes los redacta SmartHub a partir de las fuentes enlazadas y no sustituyen el asesoramiento fiscal o
          legal. Fotos de Unsplash.
        </p>

        <footer className="bl-footer">
          <Link href="/" className="bl-back">
            <span aria-hidden="true">←</span> Volver al inicio
          </Link>
          <SectionLinks />
        </footer>
      </main>
    </div>
  );
}
