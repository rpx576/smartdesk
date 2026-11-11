/**
 * The rotating planet of the home hero, drawn with WebGL on a canvas.
 *
 * The sphere is placed exactly over the planet painted in the banner (its top
 * edge at 79.5 % of the picture height, radius 1.5 × the picture width), so it
 * covers it once it fades in. Each pixel is ray-traced against the sphere and
 * coloured with a night-lights map of the Earth (`/brand/planeta-noche.jpg`),
 * plus the blue atmosphere and the sunrise glow of the banner.
 *
 * Motion: the Earth turns eastwards (the surface moves to the right), the
 * pointer nudges the rotation, the tilt and the sunrise, and a horizontal drag
 * spins it with inertia. It only animates while visible on screen and the tab
 * is open; with `prefers-reduced-motion` it is drawn once and stays still.
 */

const TEXTURE = "/brand/planeta-noche.jpg";
/** Geometry of the planet painted in the banner, relative to the picture. */
const HORIZON = 0.795;
const RADIUS = 1.5;
const CENTER_X = 0.505;
/** Rotation speed (radians per second) and start longitude (Europe in front). */
const SPEED = 0.018;
const START_LONGITUDE = 0.26;
/** Latitude seen at the horizon: the tilt of the sphere towards the viewer. */
const TILT = 0.61;
/** Pixel budget of the canvas: smaller on phones and tablets. */
const MAX_PIXELS = 2_600_000;
const MAX_PIXELS_TOUCH = 900_000;

const VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAGMENT = `
precision highp float;
uniform vec2 uRes;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uRot;
uniform float uTilt;
uniform float uSun;
uniform float uFade;
uniform sampler2D uTex;

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 d = (p - uCenter) / uRadius;
  float r = length(d);
  float edge = 1.5 / uRadius;
  float sunBand = exp(-pow((d.x - uSun) / 0.24, 2.0));

  vec3 surface = vec3(0.0);
  float inside = 1.0 - smoothstep(1.0 - edge, 1.0, r);
  if (r < 1.0) {
    float z = sqrt(max(0.0, 1.0 - r * r));
    vec3 n = vec3(d.x, -d.y, z);
    float ct = cos(uTilt);
    float st = sin(uTilt);
    vec3 m = vec3(n.x, n.y * ct - n.z * st, n.y * st + n.z * ct);
    float lat = asin(clamp(m.y, -1.0, 1.0));
    float lon = atan(m.x, m.z) + uRot;
    vec2 uv = vec2(fract(lon / 6.2831853 + 0.5), 0.5 - lat / 3.1415927);
    vec3 tex = texture2D(uTex, uv).rgb;
    float lights = smoothstep(0.04, 0.32, tex.r - tex.b);
    float limb = 1.0 - z;
    vec3 base = tex * vec3(0.5, 0.72, 1.15) * (0.55 + 0.45 * smoothstep(0.0, 0.55, z));
    vec3 city = vec3(1.0, 0.8, 0.55) * lights * 1.5;
    vec3 air = vec3(0.1, 0.4, 1.0) * pow(limb, 3.0);
    vec3 dawn = vec3(0.75, 0.88, 1.0) * sunBand * pow(limb, 14.0) * 1.1;
    surface = base + city + air + dawn;
  }

  float outside = max(r - 1.0, 0.0) * uRadius;
  // The glow fades out before the top of the canvas so its edge never shows.
  float fade = smoothstep(0.0, uFade, p.y);
  float halo = exp(-outside / (uRadius * 0.01)) * 0.75 * fade;
  float dawnHalo = sunBand * exp(-outside / (uRadius * 0.016)) * 0.8 * fade;
  vec3 glow = vec3(0.12, 0.48, 1.0) * halo + vec3(0.78, 0.9, 1.0) * dawnHalo;
  float glowAlpha = clamp(max(halo, dawnHalo), 0.0, 1.0);

  gl_FragColor = vec4(surface * inside + glow * (1.0 - inside), inside + glowAlpha * (1.0 - inside));
}
`;

type Options = { root: HTMLElement; banner: HTMLElement; canvas: HTMLCanvasElement };

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

/** Starts the planet and returns a function that stops it and frees the GPU resources. */
export function startPlanet({ root, banner, canvas }: Options): () => void {
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: "low-power" });
  if (!gl) return () => {};
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return () => {};
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return () => {};
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniform = (name: string) => gl.getUniformLocation(program, name);
  const u = {
    res: uniform("uRes"),
    center: uniform("uCenter"),
    radius: uniform("uRadius"),
    rot: uniform("uRot"),
    tilt: uniform("uTilt"),
    sun: uniform("uSun"),
    fade: uniform("uFade"),
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  /** Touch devices draw at 30 frames per second: the turn is slow, so it looks the same and saves battery. */
  const coarse = window.matchMedia("(pointer: coarse)");
  const state = {
    ready: false,
    visible: true,
    frame: 0,
    last: 0,
    rotation: START_LONGITUDE,
    spin: 0,
    offset: 0,
    offsetTarget: 0,
    tilt: TILT,
    tiltTarget: TILT,
    sun: 0,
    sunTarget: 0,
    dragX: null as number | null,
    dragTime: 0,
    center: [0, 0] as [number, number],
    radius: 1,
    pad: 1,
    scale: 1,
  };

  function layout() {
    const box = root.getBoundingClientRect();
    const picture = banner.getBoundingClientRect();
    const radius = picture.width * RADIUS;
    const horizon = picture.top - box.top + picture.height * HORIZON;
    // The canvas starts a little above the horizon to leave room for the glow.
    const top = Math.max(0, horizon - Math.max(64, radius * 0.07));
    const height = Math.max(1, box.height - top);
    canvas.style.top = `${top}px`;
    canvas.style.height = `${height}px`;
    const budget = coarse.matches ? MAX_PIXELS_TOUCH : MAX_PIXELS;
    let scale = Math.min(window.devicePixelRatio || 1, coarse.matches ? 1 : 1.5);
    while (box.width * height * scale * scale > budget && scale > 0.5) scale -= 0.1;
    canvas.width = Math.round(box.width * scale);
    canvas.height = Math.round(height * scale);
    state.scale = scale;
    state.radius = radius * scale;
    state.pad = (horizon - top) * scale * 0.85;
    state.center = [(picture.left - box.left + picture.width * CENTER_X) * scale, (horizon - top + radius) * scale];
    gl!.viewport(0, 0, canvas.width, canvas.height);
  }

  function draw() {
    if (!state.ready) return;
    gl!.uniform2f(u.res, canvas.width, canvas.height);
    gl!.uniform2f(u.center, state.center[0], state.center[1]);
    gl!.uniform1f(u.radius, state.radius);
    gl!.uniform1f(u.rot, state.rotation + state.offset);
    gl!.uniform1f(u.tilt, state.tilt);
    gl!.uniform1f(u.sun, state.sun);
    gl!.uniform1f(u.fade, state.pad);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }

  function tick(now: number) {
    state.frame = 0;
    if (coarse.matches && state.last && now - state.last < 30) {
      schedule();
      return;
    }
    const dt = state.last ? Math.min((now - state.last) / 1000, 0.05) : 0;
    state.last = now;
    // Free spin from a drag decays back to the steady eastward turn.
    state.spin *= Math.exp(-dt * 2.2);
    if (state.dragX === null) state.rotation -= (SPEED + state.spin) * dt;
    const ease = 1 - Math.exp(-dt * 3);
    state.offset += (state.offsetTarget - state.offset) * ease;
    state.tilt += (state.tiltTarget - state.tilt) * ease;
    state.sun += (state.sunTarget - state.sun) * ease;
    draw();
    schedule();
  }

  function schedule() {
    if (!state.ready || state.frame || !state.visible || document.hidden || reducedMotion.matches) return;
    state.frame = requestAnimationFrame(tick);
  }

  function stop() {
    cancelAnimationFrame(state.frame);
    state.frame = 0;
    state.last = 0;
  }

  function onPointerMove(event: PointerEvent) {
    if (reducedMotion.matches) return;
    const box = root.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    if (event.pointerType === "mouse") {
      state.offsetTarget = x * 0.35;
      state.tiltTarget = TILT + y * 0.08;
      state.sunTarget = x * 0.3;
      root.style.setProperty("--px", x.toFixed(3));
      root.style.setProperty("--py", y.toFixed(3));
    }
    if (state.dragX !== null) {
      const dx = (event.clientX - state.dragX) * state.scale;
      const seconds = Math.max((event.timeStamp - state.dragTime) / 1000, 0.008);
      const turn = dx / (state.radius * 0.7);
      state.rotation -= turn;
      state.spin = Math.max(-1.2, Math.min(1.2, turn / seconds - SPEED));
      state.dragX = event.clientX;
      state.dragTime = event.timeStamp;
    }
  }

  function onPointerDown(event: PointerEvent) {
    if (reducedMotion.matches || event.button !== 0) return;
    // The hero text stays selectable: dragging only spins from the banner and the planet.
    if (event.target instanceof Element && event.target.closest(".sh-hero__content")) return;
    state.dragX = event.clientX;
    state.dragTime = event.timeStamp;
  }

  function onPointerUp() {
    state.dragX = null;
  }

  function onPointerLeave() {
    state.dragX = null;
    state.offsetTarget = 0;
    state.tiltTarget = TILT;
    state.sunTarget = 0;
    root.style.setProperty("--px", "0");
    root.style.setProperty("--py", "0");
  }

  function onVisibility() {
    if (document.hidden) stop();
    else schedule();
  }

  function onMotionChange() {
    stop();
    onPointerLeave();
    draw();
    schedule();
  }

  const resize = new ResizeObserver(() => {
    layout();
    draw();
  });
  const onScreen = new IntersectionObserver(([entry]) => {
    state.visible = entry.isIntersecting;
    if (state.visible) schedule();
    else stop();
  });

  const texture = gl.createTexture();
  const image = new window.Image();
  image.decoding = "async";
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Older phones cap the texture size: scale the map down when it does not fit.
    const max = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
    let source: TexImageSource = image;
    if (image.naturalWidth > max) {
      const fit = document.createElement("canvas");
      fit.width = max;
      fit.height = max / 2;
      fit.getContext("2d")?.drawImage(image, 0, 0, fit.width, fit.height);
      source = fit;
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    state.ready = true;
    layout();
    draw();
    root.dataset.planet = "on";
    schedule();
  };
  image.src = TEXTURE;

  layout();
  resize.observe(root);
  onScreen.observe(root);
  root.addEventListener("pointermove", onPointerMove);
  root.addEventListener("pointerdown", onPointerDown);
  root.addEventListener("pointerleave", onPointerLeave);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);
  document.addEventListener("visibilitychange", onVisibility);
  reducedMotion.addEventListener("change", onMotionChange);

  return () => {
    stop();
    image.onload = null;
    resize.disconnect();
    onScreen.disconnect();
    root.removeEventListener("pointermove", onPointerMove);
    root.removeEventListener("pointerdown", onPointerDown);
    root.removeEventListener("pointerleave", onPointerLeave);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);
    document.removeEventListener("visibilitychange", onVisibility);
    reducedMotion.removeEventListener("change", onMotionChange);
    delete root.dataset.planet;
    gl.deleteTexture(texture);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
  };
}
