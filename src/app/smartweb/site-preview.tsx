import type { CSSProperties } from "react";
import { activeModules, getPalette, getSector, type WebConfig } from "@/lib/smartweb";
import {
  BotIcon,
  CalendarIcon,
  CardIcon,
  CartIcon,
  ChatBubbleIcon,
  ImageIcon,
  LinkIcon,
  SearchIcon,
  StarIcon,
} from "./icons";

export type PreviewDevice = "desktop" | "mobile";

const days = ["Hoy", "Mañana", "Jue", "Vie", "Sáb"];
const times = ["10:00", "11:30", "13:00", "17:30", "19:00"];

function initialsOf(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
}

/** "casa-lucia" for the address bar. */
export function slugOf(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 28) || "tunegocio"
  );
}

export function previewName(config: WebConfig): string {
  return config.businessName.trim() || getSector(config.sector).sampleName;
}

function Stars() {
  return (
    <span className="swp-stars" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <StarIcon key={i} className="size-3" />
      ))}
    </span>
  );
}

/**
 * The website being configured, drawn live from the configuration: sector
 * texts, colours, style and one section per module. Purely illustrative (no
 * links or forms that do anything), so it is hidden from assistive tech and
 * the studio describes the result in text next to it.
 */
export function SitePreview({ config }: { config: WebConfig }) {
  const sector = getSector(config.sector);
  const palette = getPalette(config.palette);
  const modules = activeModules(config);
  const name = previewName(config);
  const has = (id: Parameters<typeof modules.has>[0]) => modules.has(id);
  const isLanding = config.type === "landing";

  const nav = isLanding
    ? []
    : [
        "Inicio",
        "Servicios",
        ...(has("tienda") ? ["Tienda"] : []),
        ...(has("reservas") ? ["Reservas"] : []),
        ...(has("galeria") ? ["Trabajos"] : []),
        ...(has("blog") ? ["Blog"] : []),
        "Contacto",
      ];

  const style = {
    "--p": palette.primary,
    "--a": palette.accent,
    "--soft": palette.soft,
    "--ink": palette.ink,
  } as CSSProperties;

  return (
    <div className={`swp swp--${config.style}`} style={style} aria-hidden="true">
      <header className="swp-nav">
        <span className="swp-logo">
          <span className="swp-logo__mark">{initialsOf(name)}</span>
          <span className="swp-logo__name">{name}</span>
        </span>
        <nav className="swp-links">
          {nav.map((item, i) => (
            <span key={item} className={i === 0 ? "is-active" : undefined}>
              {item}
            </span>
          ))}
        </nav>
        <span className="swp-nav__tools">
          {has("multidioma") && <span className="swp-lang">ES · EN</span>}
          {has("tienda") && (
            <span className="swp-cart">
              <CartIcon className="size-4" />
              <i>2</i>
            </span>
          )}
          <span className="swp-btn swp-btn--sm swp-nav__cta">{sector.cta}</span>
          <span className="swp-burger">
            <i />
            <i />
            <i />
          </span>
        </span>
      </header>

      <section className="swp-hero swp-in" key={`hero-${config.sector}-${config.headline}`}>
        <div className="swp-hero__copy">
          <p className="swp-eyebrow">{sector.name} · Abierto hoy</p>
          <h3 className="swp-h1">{sector.headlines[config.headline] ?? sector.headlines[0]}</h3>
          <p className="swp-lead">{sector.subheadline}</p>
          <div className="swp-actions">
            <span className="swp-btn">{sector.cta}</span>
            {has("whatsapp") && (
              <span className="swp-btn swp-btn--ghost">
                <ChatBubbleIcon className="size-3.5" />
                Escríbenos
              </span>
            )}
          </div>
          {has("resenas") && (
            <p className="swp-rating">
              <Stars />
              <strong>4,9</strong> · 128 reseñas en Google
            </p>
          )}
        </div>
        <div className="swp-hero__art">
          <span className="swp-blob swp-blob--1" />
          <span className="swp-blob swp-blob--2" />
          <span className="swp-photo">
            <ImageIcon className="size-6" />
          </span>
          {has("seo") && (
            <span className="swp-float swp-float--seo">
              <SearchIcon className="size-3" />
              Nº 1 en Google para «{sector.name.toLowerCase()} cerca de mí»
            </span>
          )}
        </div>
      </section>

      <section className="swp-section">
        <p className="swp-kicker">Servicios</p>
        <div className="swp-grid3">
          {sector.services.map((service, i) => (
            <div key={service.title} className="swp-card">
              <span className="swp-card__icon">{i + 1}</span>
              <p className="swp-card__title">{service.title}</p>
              <p className="swp-card__text">{service.text}</p>
            </div>
          ))}
        </div>
      </section>

      {has("reservas") && (
        <section className="swp-section swp-in swp-booking">
          <div>
            <p className="swp-kicker">
              <CalendarIcon className="size-3.5" /> Reserva online
            </p>
            <p className="swp-h2">Elige día y hora</p>
            <p className="swp-card__text">Confirmación al momento y recordatorio el día antes.</p>
          </div>
          <div className="swp-booking__panel">
            <div className="swp-chips">
              {days.map((day, i) => (
                <span key={day} className={i === 1 ? "is-on" : undefined}>
                  {day}
                </span>
              ))}
            </div>
            <div className="swp-chips swp-chips--times">
              {times.map((time, i) => (
                <span key={time} className={i === 2 ? "is-on" : undefined}>
                  {time}
                </span>
              ))}
            </div>
            <span className="swp-btn swp-btn--block">
              Confirmar reserva{has("pagos") && !has("tienda") ? " y pagar señal" : ""}
            </span>
          </div>
        </section>
      )}

      {has("tienda") && (
        <section className="swp-section swp-in">
          <p className="swp-kicker">
            <CartIcon className="size-3.5" /> Tienda online
          </p>
          <div className="swp-grid3">
            {sector.products.map((product, i) => (
              <div key={product.name} className="swp-product">
                <span className={`swp-product__img swp-product__img--${i + 1}`} />
                <p className="swp-card__title">{product.name}</p>
                <p className="swp-product__row">
                  <strong>{product.price}</strong>
                  <span className="swp-btn swp-btn--sm">Añadir</span>
                </p>
              </div>
            ))}
          </div>
          {has("pagos") && (
            <p className="swp-pay">
              <CardIcon className="size-3.5" /> Tarjeta · Bizum · Apple Pay · Envío 24-48 h
            </p>
          )}
        </section>
      )}

      {has("galeria") && (
        <section className="swp-section swp-in">
          <p className="swp-kicker">
            <ImageIcon className="size-3.5" /> Nuestros trabajos
          </p>
          <div className="swp-gallery">
            {[1, 2, 3, 4].map((n) => (
              <span key={n} className={`swp-tile swp-tile--${n}`}>
                {n === 1 ? "Antes" : n === 2 ? "Después" : ""}
              </span>
            ))}
          </div>
        </section>
      )}

      {has("resenas") && (
        <section className="swp-section swp-in">
          <blockquote className="swp-quote">
            <Stars />
            <p>«{sector.testimonial.text}»</p>
            <footer>{sector.testimonial.author} · Reseña de Google</footer>
          </blockquote>
        </section>
      )}

      {has("blog") && (
        <section className="swp-section swp-in">
          <p className="swp-kicker">Blog</p>
          <div className="swp-grid2">
            {["Novedades de esta temporada", "Las preguntas que más nos hacéis"].map((title) => (
              <div key={title} className="swp-card swp-card--post">
                <span className="swp-post__img" />
                <p className="swp-card__title">{title}</p>
                <p className="swp-card__text">Lectura de 3 min</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="swp-section swp-contact">
        <div>
          <p className="swp-h2">¿Hablamos?</p>
          <p className="swp-card__text">Te respondemos en menos de 24 horas.</p>
          <div className="swp-form">
            <span>Nombre</span>
            <span>Teléfono</span>
            <span className="swp-btn swp-btn--block">Enviar</span>
          </div>
          {has("smartdesk") && (
            <p className="swp-tag">
              <LinkIcon className="size-3" /> Cada contacto entra en SmartDesk
            </p>
          )}
        </div>
        <div className="swp-map">
          <span className="swp-map__pin" />
          {has("seo") && <span className="swp-map__label">Cómo llegar</span>}
        </div>
      </section>

      <footer className="swp-footer">
        <span>© {name}</span>
        <span>Aviso legal · Cookies · Privacidad</span>
      </footer>

      <div className="swp-fabs">
        {has("smartai") && (
          <span className="swp-bot swp-in">
            <span className="swp-bot__bubble">Hola, ¿te ayudo a {has("reservas") ? "reservar" : "elegir"}?</span>
            <span className="swp-fab swp-fab--bot">
              <BotIcon className="size-4" />
            </span>
          </span>
        )}
        {has("whatsapp") && (
          <span className="swp-fab swp-fab--wa">
            <ChatBubbleIcon className="size-4" />
          </span>
        )}
      </div>
    </div>
  );
}
