"use client";

import { useEffect, useRef } from "react";

/*
 * Hero visual: a sphere made of thousands of glowing points whose surface
 * ripples with 3D simplex noise, turns slowly and leans towards the pointer.
 * Plain WebGL (no 3D library). It pauses while off screen or in a hidden
 * tab, draws a single still frame for people who prefer reduced motion, and
 * falls back to the CSS glow behind it when WebGL is not available.
 */

const VERTEX_SHADER = `
attribute vec3 aPosition;
attribute float aSeed;
uniform float uTime;
uniform float uScale;
uniform float uAspect;
uniform float uPointSize;
uniform vec2 uTilt;
varying float vAlpha;
varying vec3 vColor;

// 3D simplex noise by Ian McEwan and Stefan Gustavson (webgl-noise, MIT license).
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
    i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
    i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

vec3 rotate(vec3 p, float yaw, float pitch) {
  float cy = cos(yaw), sy = sin(yaw), cp = cos(pitch), sp = sin(pitch);
  p = vec3(cy * p.x + sy * p.z, p.y, -sy * p.x + cy * p.z);
  return vec3(p.x, cp * p.y - sp * p.z, sp * p.y + cp * p.z);
}

void main() {
  // Organic ripples: two octaves of noise moving through the sphere over time.
  float slow = snoise(aPosition * 1.05 + vec3(0.0, 0.0, uTime * 0.2));
  float fast = snoise(aPosition * 2.2 - vec3(uTime * 0.14));
  float displacement = slow * 0.15 + fast * 0.035;
  vec3 p = aPosition * (1.0 + displacement);

  p = rotate(p, uTime * 0.12 + uTilt.x, uTilt.y);

  // Simple perspective: camera on the z axis looking at the origin.
  float perspective = 3.2 / (3.2 - p.z);
  gl_Position = vec4(p.x * perspective * uScale / uAspect, p.y * perspective * uScale, 0.0, 1.0);

  // Rim light: points on the silhouette glow, the centre stays dark.
  vec3 normal = normalize(p);
  float rim = 1.0 - abs(normal.z);
  float front = step(0.0, p.z);
  float crest = clamp(displacement * 4.0, 0.0, 1.0);
  vAlpha = (0.14 + pow(rim, 1.8) * 0.9 + crest * 0.3) * mix(0.5, 1.0, front) * (0.6 + 0.4 * aSeed);
  vec3 deep = vec3(0.09, 0.32, 1.0);
  vec3 bright = vec3(0.45, 0.82, 1.0);
  vColor = mix(deep, bright, clamp(rim * 0.85 + crest * 0.6, 0.0, 1.0));
  vColor = mix(vColor, vec3(0.85, 0.95, 1.0), pow(rim, 6.0) * 0.35);
  gl_PointSize = uPointSize * perspective * (0.85 + rim * 1.1);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
varying float vAlpha;
varying vec3 vColor;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float alpha = vAlpha * (1.0 - smoothstep(0.15, 0.5, d));
  gl_FragColor = vec4(vColor * alpha, alpha);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** Points evenly spread over a unit sphere (Fibonacci lattice) plus a random seed per point. */
function spherePoints(count: number): Float32Array {
  const data = new Float32Array(count * 4);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = golden * i;
    data.set([Math.cos(theta) * radius, y, Math.sin(theta) * radius, Math.random()], i * 4);
  }
  return data;
}

export function ParticleSphere({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true });
    if (!canvas || !gl) return; // No WebGL: the CSS glow behind the canvas stays as the visual.

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const small = window.matchMedia("(max-width: 640px)").matches;
    const count = small ? 12000 : 26000;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, spherePoints(count), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "aPosition");
    const seed = gl.getAttribLocation(program, "aSeed");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(seed);
    gl.vertexAttribPointer(seed, 1, gl.FLOAT, false, 16, 12);

    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const uTime = uniform("uTime");
    const uScale = uniform("uScale");
    const uAspect = uniform("uAspect");
    const uPointSize = uniform("uPointSize");
    const uTilt = uniform("uTilt");

    // Additive light: overlapping points add up to the glow of the video.
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.clearColor(0, 0, 0, 0);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      if (!canvas || !gl) return;
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      gl.uniform1f(uAspect, width / height);
      gl.uniform1f(uScale, width / height < 1 ? 0.62 * (width / height) : 0.62);
      gl.uniform1f(uPointSize, (small ? 2.4 : 2.1) * dpr);
    }

    // Pointer: the sphere leans gently towards it (smoothed every frame).
    const target = { x: 0, y: 0 };
    const tilt = { x: 0, y: 0 };
    function onPointer(event: PointerEvent) {
      target.x = (event.clientX / window.innerWidth - 0.5) * 0.9;
      target.y = (event.clientY / window.innerHeight - 0.5) * 0.6;
    }

    let frame = 0;
    let running = false;
    let visible = true;
    const start = performance.now();
    function draw(now: number) {
      if (!gl) return;
      tilt.x += (target.x - tilt.x) * 0.04;
      tilt.y += (target.y - tilt.y) * 0.04;
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uTilt, tilt.x, tilt.y);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, count);
    }
    function loop(now: number) {
      draw(now);
      frame = requestAnimationFrame(loop);
    }
    function update() {
      const shouldRun = visible && document.visibilityState === "visible";
      if (shouldRun && !running) {
        running = true;
        frame = requestAnimationFrame(loop);
      } else if (!shouldRun && running) {
        running = false;
        cancelAnimationFrame(frame);
      }
    }

    resize();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw(start + 4000);
    });
    observer.observe(canvas);

    if (reduceMotion) {
      draw(start + 4000);
      return () => observer.disconnect();
    }

    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    visibility.observe(canvas);
    document.addEventListener("visibilitychange", update);
    window.addEventListener("pointermove", onPointer, { passive: true });
    update();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("pointermove", onPointer);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <div aria-hidden="true" className={`relative ${className}`}>
      {/* Soft glow behind the particles (also the fallback without WebGL). */}
      <div className="absolute inset-[18%] rounded-full bg-blue-600/30 blur-3xl" />
      <div className="absolute inset-[32%] rounded-full bg-cyan-400/20 blur-2xl" />
      <canvas ref={canvasRef} className="relative size-full" />
    </div>
  );
}
