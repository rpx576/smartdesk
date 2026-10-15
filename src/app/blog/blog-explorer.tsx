"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ARTICLES, CATEGORIES, categoryOf, type Article, type CategoryId } from "./articles";
import { CoverImage } from "./cover-image";
import { SORT_OPTIONS, countByCategory, filterArticles, formatDay, type SortId } from "./query";
import { toggleSaved, useSavedArticles } from "./saved-store";

type View = "cuadricula" | "lista";

const counts = countByCategory(ARTICLES);

function BookmarkIcon({ filled, className = "size-4" }: { filled: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M6 3.75h12a.75.75 0 0 1 .75.75v16.2l-6.75-4.5-6.75 4.5V4.5A.75.75 0 0 1 6 3.75Z" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="4" y="5" width="5" height="5" rx="1.2" />
      <rect x="4" y="14" width="5" height="5" rx="1.2" />
      <path d="M12 7.5h8M12 16.5h8" strokeLinecap="round" />
    </svg>
  );
}

/** Icon-only save button that sits on top of the cover photo. */
function SaveButton({ article, saved }: { article: Article; saved: boolean }) {
  const label = saved ? "Quitar de guardadas" : "Guardar para leer después";
  return (
    <button type="button" aria-pressed={saved} aria-label={label} title={label} onClick={() => toggleSaved(article.id)} className="bl-save">
      <BookmarkIcon filled={saved} />
    </button>
  );
}

function Chip({ category }: { category: CategoryId }) {
  return <span className={`bl-chip bl-tone--${category}`}>{categoryOf(category).label}</span>;
}

function Meta({ article }: { article: Article }) {
  return (
    <p className="bl-meta">
      <time dateTime={article.date}>{formatDay(article.date)}</time>
      <span aria-hidden="true">·</span>
      <span>{article.readMinutes} min de lectura</span>
    </p>
  );
}

function Sources({ article }: { article: Article }) {
  return (
    <ul className="bl-sources" aria-label="Fuentes">
      {article.sources.map((source) => (
        <li key={source.url}>
          <a href={source.url} target="_blank" rel="noopener noreferrer" className="bl-source">
            {source.name}
            <ArrowIcon />
            <span className="sr-only">(se abre en una pestaña nueva)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function Takeaway({ article }: { article: Article }) {
  return (
    <details className="bl-why">
      <summary>Qué significa para tu negocio</summary>
      <p>{article.takeaway}</p>
    </details>
  );
}

function Credit({ article }: { article: Article }) {
  return <p className="bl-credit">Foto: {article.image.author} · Unsplash</p>;
}

type CardProps = { article: Article; saved: boolean; onTag: (tag: string) => void };

function Tags({ article, onTag }: CardProps) {
  return (
    <ul className="bl-tags" aria-label="Temas">
      {article.tags.slice(0, 3).map((tag) => (
        <li key={tag}>
          <button type="button" onClick={() => onTag(tag)} className="bl-tag">
            #{tag}
          </button>
        </li>
      ))}
    </ul>
  );
}

/** First story of the default view: wide photo next to the full text. */
function FeatureCard(props: CardProps) {
  const { article, saved } = props;
  return (
    <article id={article.id} className="bl-feature bl-in">
      <div className="bl-media bl-feature__media">
        <CoverImage image={article.image} sizes="(min-width: 1024px) 60vw, 100vw" preload className="bl-media__img" />
        <div className="bl-media__top">
          <Chip category={article.category} />
          <SaveButton article={article} saved={saved} />
        </div>
      </div>
      <div className="bl-feature__body">
        <p className="bl-eyebrow">Destacada</p>
        <Meta article={article} />
        <h2 className="bl-feature__title">
          <a href={article.sources[0].url} target="_blank" rel="noopener noreferrer">
            {article.title}
          </a>
        </h2>
        <p className="bl-text">{article.summary}</p>
        <div className="bl-callout">
          <p className="bl-callout__label">Qué significa para tu negocio</p>
          <p>{article.takeaway}</p>
        </div>
        <Sources article={article} />
        <div className="bl-card__foot">
          <Tags {...props} />
          <Credit article={article} />
        </div>
      </div>
    </article>
  );
}

function StoryCard(props: CardProps) {
  const { article, saved } = props;
  return (
    <article id={article.id} className="bl-card bl-in">
      <div className="bl-media bl-card__media">
        <CoverImage image={article.image} sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw" className="bl-media__img" />
        <div className="bl-media__top">
          <Chip category={article.category} />
          <SaveButton article={article} saved={saved} />
        </div>
      </div>
      <div className="bl-card__body">
        <Meta article={article} />
        <h3 className="bl-card__title">
          <a href={article.sources[0].url} target="_blank" rel="noopener noreferrer">
            {article.title}
          </a>
        </h3>
        <p className="bl-text bl-clamp">{article.summary}</p>
        <Takeaway article={article} />
        <Sources article={article} />
        <div className="bl-card__foot">
          <Tags {...props} />
          <Credit article={article} />
        </div>
      </div>
    </article>
  );
}

function StoryRow({ article, saved }: CardProps) {
  return (
    <li id={article.id} className="bl-row bl-in">
      <div className="bl-media bl-row__media">
        <CoverImage image={article.image} sizes="160px" className="bl-media__img" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Chip category={article.category} />
          <Meta article={article} />
        </div>
        <h3 className="bl-row__title">
          <a href={article.sources[0].url} target="_blank" rel="noopener noreferrer">
            {article.title}
          </a>
        </h3>
        <p className="bl-text bl-clamp bl-clamp--2">{article.takeaway}</p>
        <Sources article={article} />
      </div>
      <SaveButton article={article} saved={saved} />
    </li>
  );
}

/**
 * Interactive part of the blog: search (press "/" to focus it), topics,
 * order, grid or list view, and articles saved for later.
 */
export function BlogExplorer() {
  const saved = useSavedArticles();
  const [text, setText] = useState("");
  const [category, setCategory] = useState<CategoryId | "todas">("todas");
  const [sort, setSort] = useState<SortId>("recientes");
  const [view, setView] = useState<View>("cuadricula");
  const [onlySaved, setOnlySaved] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT");
      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(
    () => filterArticles(ARTICLES, { text, category, sort, onlySaved, saved }),
    [text, category, sort, onlySaved, saved],
  );

  const filtered = text.trim() !== "" || category !== "todas" || onlySaved;
  const [first, ...rest] = results;
  const feature = view === "cuadricula" && !filtered && sort === "recientes" ? first : undefined;

  function reset() {
    setText("");
    setCategory("todas");
    setOnlySaved(false);
    setSort("recientes");
  }

  function searchTag(tag: string) {
    setText(tag);
    setCategory("todas");
    document.getElementById("noticias")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section id="noticias" aria-label="Noticias" className="scroll-mt-20">
      <div className="bl-bar">
        <div className="bl-pills" role="group" aria-label="Temas">
          <button type="button" aria-pressed={category === "todas"} onClick={() => setCategory("todas")} className="bl-pill">
            Todo <span className="bl-pill__count">{ARTICLES.length}</span>
          </button>
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={category === item.id}
              onClick={() => setCategory(category === item.id ? "todas" : item.id)}
              className={`bl-pill bl-tone--${item.id}`}
              title={item.blurb}
            >
              <span className="bl-pill__dot" aria-hidden="true" />
              {item.label} <span className="bl-pill__count">{counts[item.id]}</span>
            </button>
          ))}
        </div>

        <div className="bl-tools">
          <label className="bl-search">
            <span className="sr-only">Buscar noticias</span>
            <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4.5 4.5" strokeLinecap="round" />
            </svg>
            <input
              ref={searchRef}
              type="search"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Buscar: Verifactu, WhatsApp, accesibilidad…"
            />
            <kbd aria-hidden="true">/</kbd>
          </label>

          <label className="bl-select">
            <span className="sr-only">Orden</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortId)}>
              {SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="bl-segmented" role="group" aria-label="Vista">
            <button type="button" aria-pressed={view === "cuadricula"} onClick={() => setView("cuadricula")} aria-label="Cuadrícula" title="Cuadrícula">
              <GridIcon />
            </button>
            <button type="button" aria-pressed={view === "lista"} onClick={() => setView("lista")} aria-label="Lista" title="Lista">
              <ListIcon />
            </button>
          </div>

          <button type="button" aria-pressed={onlySaved} onClick={() => setOnlySaved(!onlySaved)} className="bl-saved-toggle">
            <BookmarkIcon filled={onlySaved} />
            Guardadas <span className="bl-pill__count">{saved.size}</span>
          </button>
        </div>
      </div>

      <p className="bl-status" aria-live="polite">
        <span>
          {results.length === 1 ? "1 noticia" : `${results.length} noticias`}
          {category !== "todas" && ` en ${categoryOf(category).label}`}
          {text.trim() && ` con «${text.trim()}»`}
          {onlySaved && " guardadas"}
        </span>
        {filtered && (
          <button type="button" onClick={reset} className="bl-link">
            Quitar filtros
          </button>
        )}
      </p>

      {results.length === 0 ? (
        <div className="bl-empty">
          <p className="bl-empty__title">{onlySaved && saved.size === 0 ? "Aún no has guardado noticias" : "Sin resultados"}</p>
          <p>
            {onlySaved && saved.size === 0
              ? "Pulsa el marcador de cualquier noticia y aparecerá aquí, en este navegador."
              : "Prueba con otra palabra o quita algún filtro."}
          </p>
          <button type="button" onClick={reset} className="bl-button mt-5">
            Ver todas las noticias
          </button>
        </div>
      ) : view === "lista" ? (
        <ol className="bl-list">
          {results.map((article) => (
            <StoryRow key={article.id} article={article} saved={saved.has(article.id)} onTag={searchTag} />
          ))}
        </ol>
      ) : (
        <>
          {feature && <FeatureCard article={feature} saved={saved.has(feature.id)} onTag={searchTag} />}
          <div className="bl-grid">
            {(feature ? rest : results).map((article) => (
              <StoryCard key={article.id} article={article} saved={saved.has(article.id)} onTag={searchTag} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
