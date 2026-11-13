/**
 * The rotating planet of the home hero, drawn with WebGL on a canvas.
 *
 * The sphere is placed exactly over the planet painted in the banner (its top
 * edge at 79.5 % of the picture height, radius 1.5 × the picture width), so it
 * covers it once it fades in. Each pixel is ray-traced against the sphere and
 * coloured with a night-lights map of the Earth (`/brand/planeta-noche.jpg`),
 * plus the blue atmosphere and the sunrise glow of the banner.
 *
 * Life: the city lights glow (warm sodium tones, a soft bloom around the big
 * cities and a faint shimmer), thin clouds drift over them, and the sunrise and
 * the atmosphere breathe slowly.
 *
 * Motion: the Earth turns slowly eastwards on its own (the surface moves to the
 * right); it does not react to the pointer. It only animates while visible on
 * screen and the tab is open; with `prefers-reduced-motion` it is drawn once and
 * stays still.
 */

const TEXTURE = "/brand/planeta-noche.jpg";
/** Geometry of the planet painted in the banner, relative to the picture. */
const HORIZON = 0.795;
const RADIUS = 1.5;
const CENTER_X = 0.505;
/** Rotation speed (radians per second, about one turn every 2.5 minutes) and start longitude (Europe in front). */
const SPEED = 0.042;
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
uniform float uTime;
uniform float uFade;
uniform vec2 uTexel;
uniform sampler2D uTex;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z);
}

float clouds(vec3 q) {
  float v = 0.5 * noise(q * 3.2);
  v += 0.25 * noise(q * 6.7);
  v += 0.125 * noise(q * 13.9);
  return smoothstep(0.42, 0.72, v / 0.875);
}

/** How lit a texel is by city lights (they are warm; the land and the sea are blue). */
float cityLight(vec3 c) { return smoothstep(0.04, 0.32, c.r - c.b); }

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 d = (p - uCenter) / uRadius;
  float r = length(d);
  float edge = 1.5 / uRadius;
  // The sunrise slides gently along the horizon and the air breathes.
  float sun = 0.14 * sin(uTime * 0.045);
  float breath = 0.93 + 0.07 * sin(uTime * 0.35);
  float sunBand = exp(-pow((d.x - sun) / 0.24, 2.0));

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

    // Bloom: a ring of wider samples makes the big cities glow beyond their streets.
    vec2 o = uTexel * 3.0;
    float halo = cityLight(texture2D(uTex, uv + vec2(o.x, 0.0)).rgb)
      + cityLight(texture2D(uTex, uv - vec2(o.x, 0.0)).rgb)
      + cityLight(texture2D(uTex, uv + vec2(0.0, o.y)).rgb)
      + cityLight(texture2D(uTex, uv - vec2(0.0, o.y)).rgb)
      + cityLight(texture2D(uTex, uv + o * 2.0).rgb)
      + cityLight(texture2D(uTex, uv - o * 2.0).rgb);
    halo /= 6.0;

    float lights = cityLight(tex);
    // The shimmer is tied to the ground, so each city flickers on its own.
    vec3 q = vec3(cos(lat) * sin(lon), sin(lat), cos(lat) * cos(lon));
    float shimmer = 0.82 + 0.36 * noise(q * 260.0 + vec3(0.0, 0.0, uTime * 0.9));
    // Small towns burn orange, dense centres almost white.
    vec3 sodium = mix(vec3(1.0, 0.52, 0.18), vec3(1.0, 0.88, 0.7), smoothstep(0.35, 1.0, lights));

    // Thin clouds drift a little faster than the ground and veil the lights.
    vec3 cq = vec3(cos(lat) * sin(lon + uTime * 0.006), sin(lat), cos(lat) * cos(lon + uTime * 0.006));
    float cloud = clouds(cq);

    float limb = 1.0 - z;
    float shade = 0.55 + 0.45 * smoothstep(0.0, 0.55, z);
    vec3 base = tex * vec3(0.5, 0.72, 1.15) * shade;
    vec3 city = sodium * (lights * 1.55 * shimmer + halo * 0.55) * (1.0 - cloud * 0.65);
    // Moonlight on the clouds, and the sunrise catching them near the horizon.
    vec3 cloudLight = vec3(0.1, 0.14, 0.24) * cloud * shade
      + vec3(0.55, 0.7, 1.0) * cloud * sunBand * pow(limb, 5.0) * 0.6;
    vec3 air = vec3(0.1, 0.4, 1.0) * pow(limb, 3.0) * breath;
    vec3 dawn = vec3(0.75, 0.88, 1.0) * sunBand * pow(limb, 14.0) * 1.1;
    surface = base + city + cloudLight + air + dawn;
  }

  float outside = max(r - 1.0, 0.0) * uRadius;
  // The glow fades out before the top of the canvas so its edge never shows.
  float fade = smoothstep(0.0, uFade, p.y);
  float halo = exp(-outside / (uRadius * 0.01)) * 0.75 * fade * breath;
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
    time: uniform("uTime"),
    fade: uniform("uFade"),
    texel: uniform("uTexel"),
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
    time: 0,
    center: [0, 0] as [number, number],
    radius: 1,
    pad: 1,
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
    gl!.uniform1f(u.rot, state.rotation);
    gl!.uniform1f(u.tilt, TILT);
    gl!.uniform1f(u.time, state.time);
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
    state.rotation -= SPEED * dt;
    state.time += dt;
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

  function onVisibility() {
    if (document.hidden) stop();
    else schedule();
  }

  function onMotionChange() {
    stop();
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
    let width = image.naturalWidth;
    if (width > max) {
      const fit = document.createElement("canvas");
      fit.width = max;
      fit.height = max / 2;
      fit.getContext("2d")?.drawImage(image, 0, 0, fit.width, fit.height);
      source = fit;
      width = max;
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform2f(u.texel, 1 / width, 2 / width);
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
  document.addEventListener("visibilitychange", onVisibility);
  reducedMotion.addEventListener("change", onMotionChange);

  return () => {
    stop();
    image.onload = null;
    resize.disconnect();
    onScreen.disconnect();
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
