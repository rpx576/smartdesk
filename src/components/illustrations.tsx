import type { CSSProperties, ReactNode } from "react";
import type { ServiceId } from "@/content/services";

/**
 * Original illustrations of the website, drawn here as SVG (no stock images,
 * no third-party rights). They take the accent of the page they are on through
 * the `--acc` variables (see `.il-*` in globals.css), so the same drawing
 * language changes colour per service. Decorative: hidden from screen readers.
 */

type FrameProps = { id: string; children: ReactNode; className?: string };

/** Common stage: soft glow, an orbit and the edge of the planet, the brand motif. */
function Stage({ id, children, className = "" }: FrameProps) {
  return (
    <svg viewBox="0 0 480 400" aria-hidden="true" focusable="false" className={`il h-auto w-full ${className}`}>
      <defs>
        <radialGradient id={`${id}-glow`} cx="50%" cy="45%" r="55%">
          <stop offset="0" className="il-stop-acc" stopOpacity="0.32" />
          <stop offset="1" className="il-stop-acc" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-planet`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1a3a" />
          <stop offset="1" stopColor="#020617" />
        </linearGradient>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" className="il-stop-acc" stopOpacity="0.35" />
          <stop offset="1" className="il-stop-acc" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <circle cx="240" cy="190" r="200" fill={`url(#${id}-glow)`} />
      <ellipse cx="240" cy="205" rx="226" ry="64" transform="rotate(-10 240 205)" className="il-orbit" />
      <g className="il-stars">
        <circle cx="38" cy="54" r="1.4" />
        <circle cx="430" cy="40" r="1.2" />
        <circle cx="452" cy="170" r="1" />
        <circle cx="24" cy="210" r="1.1" />
        <circle cx="96" cy="26" r="0.9" />
        <circle cx="388" cy="330" r="1" />
      </g>
      <path d="M-30 420 Q240 318 510 420 Z" fill={`url(#${id}-planet)`} />
      <path d="M-30 420 Q240 318 510 420" className="il-horizon" />
      {children}
    </svg>
  );
}

/** CreaciÃ³n web: a page being assembled from its blocks. */
function WebIllustration() {
  const id = "il-web";
  return (
    <Stage id={id}>
      <g className="il-rise">
        <rect x="78" y="62" width="324" height="236" rx="16" className="il-frame" />
        <path d="M78 96 H402" className="il-divider" />
        <circle cx="98" cy="79" r="4.5" className="il-muted" />
        <circle cx="113" cy="79" r="4.5" className="il-muted" />
        <circle cx="128" cy="79" r="4.5" className="il-muted" />
        <rect x="150" y="72" width="170" height="14" rx="7" className="il-muted" />
        <rect x="100" y="114" width="170" height="14" rx="5" className="il-fill" />
        <rect x="100" y="136" width="130" height="8" rx="4" className="il-muted" />
        <rect x="100" y="150" width="108" height="8" rx="4" className="il-muted" />
        <rect x="100" y="170" width="70" height="20" rx="10" className="il-fill" />
        <rect x="286" y="112" width="96" height="78" rx="10" fill={`url(#${id}-fill)`} className="il-line" />
        <path d="M296 178 L320 150 L338 168 L352 156 L372 178 Z" className="il-soft" />
        <circle cx="356" cy="132" r="7" className="il-soft" />
        <rect x="100" y="210" width="86" height="70" rx="10" className="il-card" />
        <rect x="196" y="210" width="86" height="70" rx="10" className="il-card" />
        <rect x="292" y="210" width="90" height="70" rx="10" className="il-slot" />
        <rect x="112" y="224" width="40" height="6" rx="3" className="il-fill" />
        <rect x="112" y="238" width="60" height="5" rx="2.5" className="il-muted" />
        <rect x="208" y="224" width="40" height="6" rx="3" className="il-fill" />
        <rect x="208" y="238" width="60" height="5" rx="2.5" className="il-muted" />
      </g>
      {/* The last block arriving to its slot. */}
      <g className="il-float">
        <rect x="334" y="250" width="104" height="72" rx="12" className="il-frame il-lift" />
        <rect x="348" y="266" width="40" height="6" rx="3" className="il-fill" />
        <rect x="348" y="280" width="70" height="5" rx="2.5" className="il-muted" />
        <rect x="348" y="292" width="56" height="5" rx="2.5" className="il-muted" />
      </g>
      <path d="M336 252 L322 240" className="il-dash" />
      {/* Code card. */}
      <g className="il-float il-float-slow">
        <rect x="30" y="188" width="104" height="74" rx="12" className="il-frame il-lift" />
        <path d="M48 212 l-8 8 l8 8 M74 212 l8 8 l-8 8 M66 208 l-8 24" className="il-stroke-acc" />
        <rect x="94" y="210" width="26" height="5" rx="2.5" className="il-cyan" />
        <rect x="94" y="222" width="20" height="5" rx="2.5" className="il-muted" />
        <rect x="44" y="244" width="76" height="5" rx="2.5" className="il-muted" />
      </g>
      <path d="M176 184 l0 18 l5 -5 l4 9 l4 -2 l-4 -9 l7 0 Z" className="il-cursor" />
    </Stage>
  );
}

/** Mantenimiento web: health gauge, steady uptime and the backup cycle. */
function MaintenanceIllustration() {
  const id = "il-mant";
  const bars = [40, 46, 42, 48, 44, 47, 45, 49, 46, 48];
  return (
    <Stage id={id}>
      <g className="il-rise">
        <rect x="64" y="70" width="352" height="232" rx="18" className="il-frame" />
        <rect x="84" y="88" width="90" height="10" rx="5" className="il-muted" />
        <rect x="336" y="84" width="60" height="18" rx="9" fill={`url(#${id}-fill)`} className="il-line" />
        <circle cx="350" cy="93" r="4" className="il-fill il-pulse" />
        <rect x="360" y="90" width="28" height="6" rx="3" className="il-muted" />
        <path d="M84 112 H396" className="il-divider" />
        {/* Gauge. */}
        <path d="M110 230 A62 62 0 0 1 234 230" className="il-track" />
        <path d="M110 230 A62 62 0 0 1 222 194" className="il-gauge" />
        <path d="M172 230 L208 196" className="il-needle" />
        <circle cx="172" cy="230" r="7" className="il-fill" />
        <rect x="140" y="250" width="64" height="8" rx="4" className="il-muted" />
        {/* Uptime bars. */}
        {bars.map((height, index) => (
          <rect key={index} x={262 + index * 13} y={232 - height} width="8" height={height} rx="3" className="il-fill il-bar" style={{ animationDelay: `${index * 0.12}s` }} />
        ))}
        <path d="M258 236 H392" className="il-divider" />
        {/* Checklist. */}
        {[262, 280].map((y) => (
          <g key={y}>
            <circle cx="268" cy={y} r="6" fill={`url(#${id}-fill)`} className="il-line" />
            <path d={`M265 ${y} l2.5 2.5 l4 -5`} className="il-check" />
            <rect x="282" y={y - 3} width={y === 262 ? 90 : 70} height="6" rx="3" className="il-muted" />
          </g>
        ))}
      </g>
      {/* Backup cycle. */}
      <g className="il-float">
        <circle cx="410" cy="300" r="40" className="il-frame il-lift" />
        <g className="il-spin" style={{ transformOrigin: "410px 300px" }}>
          <path d="M386 296 A24 24 0 0 1 428 284" className="il-stroke-acc" />
          <path d="M428 284 l2 -10 M428 284 l-10 -1" className="il-stroke-acc" />
          <path d="M434 304 A24 24 0 0 1 392 316" className="il-stroke-acc" />
          <path d="M392 316 l-2 10 M392 316 l10 1" className="il-stroke-acc" />
        </g>
        <rect x="402" y="293" width="16" height="14" rx="3" className="il-cyan" />
      </g>
    </Stage>
  );
}

/** SEO: a search that climbs, step by step, to the first positions. */
function SeoIllustration() {
  const id = "il-seo";
  return (
    <Stage id={id}>
      <g className="il-rise">
        <rect x="70" y="58" width="340" height="48" rx="24" className="il-frame" />
        <circle cx="98" cy="80" r="9" className="il-stroke-acc" />
        <path d="M105 87 l8 8" className="il-stroke-acc" />
        <rect x="124" y="76" width="150" height="8" rx="4" className="il-muted" />
        <path d="M282 72 V90" className="il-caret" />
        <rect x="70" y="124" width="340" height="182" rx="18" className="il-frame" />
        <path d="M100 280 H384 M100 280 V150" className="il-divider" />
        {[180, 212, 244].map((y) => (
          <path key={y} d={`M100 ${y} H384`} className="il-grid" />
        ))}
        <path d="M100 270 C140 266 160 250 190 246 S240 224 266 212 S320 178 372 150 L372 280 L100 280 Z" fill={`url(#${id}-fill)`} />
        <path d="M100 270 C140 266 160 250 190 246 S240 224 266 212 S320 178 372 150" className="il-curve" />
        <circle cx="190" cy="246" r="5" className="il-fill" />
        <circle cx="266" cy="212" r="5" className="il-fill" />
        <circle cx="372" cy="150" r="10" className="il-soft il-pulse" />
        <circle cx="372" cy="150" r="6" className="il-fill" />
        <path d="M356 136 l16 -14 l16 14" className="il-stroke-acc" />
      </g>
      {/* Ranking card. */}
      <g className="il-float">
        <rect x="318" y="226" width="132" height="98" rx="14" className="il-frame il-lift" />
        <rect x="332" y="242" width="104" height="18" rx="6" fill={`url(#${id}-fill)`} className="il-line" />
        <rect x="340" y="248" width="10" height="6" rx="3" className="il-fill" />
        <rect x="356" y="248" width="66" height="6" rx="3" className="il-white" />
        <rect x="340" y="272" width="10" height="6" rx="3" className="il-muted" />
        <rect x="356" y="272" width="54" height="6" rx="3" className="il-muted" />
        <rect x="340" y="294" width="10" height="6" rx="3" className="il-muted" />
        <rect x="356" y="294" width="60" height="6" rx="3" className="il-muted" />
      </g>
      {/* Local search pin. */}
      <g className="il-float il-float-slow">
        <path d="M58 248 c-14 0 -22 10 -22 21 c0 15 22 35 22 35 s22 -20 22 -35 c0 -11 -8 -21 -22 -21 Z" className="il-frame il-lift" />
        <circle cx="58" cy="270" r="7" className="il-fill" />
      </g>
    </Stage>
  );
}

/** Ciberseguridad: shield and lock inside a guarded network perimeter. */
function SecurityIllustration() {
  const id = "il-sec";
  const nodes = [0, 60, 120, 180, 240, 300].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return { x: 240 + Math.cos(rad) * 150, y: 200 + Math.sin(rad) * 118 };
  });
  return (
    <Stage id={id}>
      <defs>
        <clipPath id={`${id}-shield`}>
          <path d="M240 86 L322 118 V196 C322 252 288 290 240 312 C192 290 158 252 158 196 V118 Z" />
        </clipPath>
      </defs>
      <g className="il-spin il-spin-slow" style={{ transformOrigin: "240px 200px" }}>
        <ellipse cx="240" cy="200" rx="150" ry="118" className="il-perimeter" />
      </g>
      {nodes.map((node, index) => (
        <g key={index}>
          <path d={`M${node.x} ${node.y} L240 200`} className="il-grid" />
          <circle cx={node.x} cy={node.y} r="9" className="il-frame" />
          <circle cx={node.x} cy={node.y} r="3.5" className="il-fill il-pulse" style={{ animationDelay: `${index * 0.4}s` }} />
        </g>
      ))}
      {/* A threat stopped at the perimeter. */}
      <path d="M444 76 L398 112" className="il-threat-line" />
      <circle cx="448" cy="72" r="6" className="il-threat" />
      <path d="M392 106 l10 10 M402 106 l-10 10" className="il-threat-x" />
      <g className="il-rise">
        <path d="M240 86 L322 118 V196 C322 252 288 290 240 312 C192 290 158 252 158 196 V118 Z" fill={`url(#${id}-fill)`} className="il-shield" />
        <path d="M240 104 L306 130 V196 C306 242 280 272 240 292 C200 272 174 242 174 196 V130 Z" className="il-line" />
        <path d="M222 190 V176 a18 18 0 0 1 36 0 V190" className="il-stroke-white" />
        <rect x="210" y="188" width="60" height="50" rx="10" className="il-fill" />
        <circle cx="240" cy="208" r="6" fill="#020617" />
        <path d="M240 212 V224" stroke="#020617" strokeWidth="4" strokeLinecap="round" />
        <g clipPath={`url(#${id}-shield)`}>
          <rect x="150" y="80" width="180" height="3" className="il-scan" />
        </g>
      </g>
    </Stage>
  );
}

const SERVICE_ILLUSTRATIONS: Record<ServiceId, () => ReactNode> = {
  "creacion-web": WebIllustration,
  "mantenimiento-web": MaintenanceIllustration,
  seo: SeoIllustration,
  ciberseguridad: SecurityIllustration,
};

/** Hero illustration of a service page. */
export function ServiceIllustration({ id }: { id: ServiceId }) {
  const Illustration = SERVICE_ILLUSTRATIONS[id];
  return <Illustration />;
}

/** Accent of each service on the orbit, the same as its page (see `.acc-*` in globals.css). */
const ORBIT_NODES = [
  { x: 72, y: 208, color: "96 165 250", glyph: "M-7 -5 l-5 5 l5 5 M7 -5 l5 5 l-5 5" },
  { x: 176, y: 92, color: "45 212 191", glyph: "M-9 4 A9 9 0 0 1 9 4 M0 4 L5 -3" },
  { x: 392, y: 132, color: "167 139 250", glyph: "M-9 6 L-3 0 L2 3 L9 -6" },
  { x: 330, y: 300, color: "52 211 153", glyph: "M0 -9 L8 -6 V0 C8 5 4 8 0 10 C-4 8 -8 5 -8 0 V-6 Z" },
];

/** Sobre nosotros: one team at the centre and the four services in orbit around it. */
export function AboutOrbitIllustration() {
  const id = "il-about";
  return (
    <Stage id={id}>
      <defs>
        <radialGradient id={`${id}-core`} cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#60a5fa" />
          <stop offset="0.6" stopColor="#1d4ed8" />
          <stop offset="1" stopColor="#0b1a3a" />
        </radialGradient>
      </defs>
      <ellipse cx="236" cy="200" rx="168" ry="112" className="il-orbit-strong" />
      <g className="il-spin il-spin-slow" style={{ transformOrigin: "236px 200px" }}>
        <ellipse cx="236" cy="200" rx="110" ry="74" className="il-perimeter" />
      </g>
      {ORBIT_NODES.map((node) => (
        <g key={node.glyph} className="il-float" style={{ "--node": node.color } as CSSProperties}>
          <path d={`M${node.x} ${node.y} L236 200`} className="il-node-line" />
          <circle cx={node.x} cy={node.y} r="24" className="il-frame il-lift" />
          <circle cx={node.x} cy={node.y} r="24" className="il-node-ring" />
          <path d={node.glyph} transform={`translate(${node.x} ${node.y})`} className="il-node-glyph" />
        </g>
      ))}
      <circle cx="236" cy="200" r="66" className="il-soft il-pulse" />
      <circle cx="236" cy="200" r="46" fill={`url(#${id}-core)`} />
      <path d="M216 222 L236 172 L256 222 M224 206 H248" className="il-stroke-white" />
    </Stage>
  );
}

/** Sobre nosotros: people connected around the client's project. */
export function AboutTeamIllustration() {
  const id = "il-team";
  const people = [
    { x: 96, y: 112 },
    { x: 384, y: 104 },
    { x: 80, y: 280 },
    { x: 400, y: 276 },
  ];
  return (
    <Stage id={id}>
      {people.map((person) => (
        <path key={`${person.x}`} d={`M${person.x} ${person.y} L240 196`} className="il-dash" />
      ))}
      <g className="il-rise">
        <rect x="160" y="138" width="160" height="116" rx="16" className="il-frame" />
        <path d="M160 164 H320" className="il-divider" />
        <circle cx="176" cy="151" r="3.5" className="il-muted" />
        <circle cx="188" cy="151" r="3.5" className="il-muted" />
        <rect x="178" y="180" width="80" height="10" rx="5" className="il-fill" />
        <rect x="178" y="198" width="120" height="6" rx="3" className="il-muted" />
        <rect x="178" y="212" width="96" height="6" rx="3" className="il-muted" />
        <rect x="178" y="228" width="50" height="14" rx="7" className="il-fill" />
      </g>
      {people.map((person, index) => (
        <g key={index} className={index % 2 ? "il-float il-float-slow" : "il-float"}>
          <circle cx={person.x} cy={person.y} r="30" className="il-frame il-lift" />
          <circle cx={person.x} cy={person.y - 8} r="8" className="il-fill" />
          <path d={`M${person.x - 14} ${person.y + 16} a14 12 0 0 1 28 0`} className="il-soft-fill" />
        </g>
      ))}
    </Stage>
  );
}
