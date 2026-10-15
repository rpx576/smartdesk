/** Decorative animated background of the account screens (CSS only). */
export function AccessBackground() {
  return (
    <div className="sd-access-bg" aria-hidden="true">
      <div className="sd-grid" />
      <div className="sd-blob sd-blob--blue" />
      <div className="sd-blob sd-blob--violet" />
      <div className="sd-blob sd-blob--sky" />
      <span className="sd-beam sd-beam--1" />
      <span className="sd-beam sd-beam--2" />
      <span className="sd-beam sd-beam--3" />
      <svg className="sd-waves" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sd-wave-stroke" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="0.6" stopColor="#818cf8" stopOpacity="0.35" />
            <stop offset="1" stopColor="#60a5fa" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <path className="sd-ribbon" d="M-60 960 L-60 640 C 260 520 520 860 900 780 S 1320 600 1500 680 L1500 960 Z" />
        <path className="sd-wave" stroke="url(#sd-wave-stroke)" d="M-60 520 C 240 400 440 760 780 700 S 1260 500 1500 600" />
        <path className="sd-wave sd-wave--slow" stroke="url(#sd-wave-stroke)" d="M-60 660 C 300 560 540 900 880 830 S 1300 650 1500 760" />
        <path
          className="sd-wave"
          stroke="url(#sd-wave-stroke)"
          strokeOpacity="0.5"
          d="M-60 360 C 260 280 480 560 820 510 S 1280 340 1500 430"
        />
      </svg>
    </div>
  );
}
