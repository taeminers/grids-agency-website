"use client";

import { useEffect, useRef } from "react";

const vertex = `
attribute vec2 position;
varying vec2 uv;
void main() {
  uv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const fragment = `
precision highp float;
varying vec2 uv;
uniform vec2 resolution;
uniform vec2 pointer;
uniform float time;
uniform float dark;

float line(float value, float spacing, float width) {
  float distance = abs(fract(value / spacing + 0.5) - 0.5) * spacing;
  return 1.0 - smoothstep(width, width * 2.0, distance);
}

void main() {
  vec2 p = uv;
  float aspect = resolution.x / resolution.y;
  float x = (p.x - 0.5) * mix(1.3, 2.6, smoothstep(0.6, 2.5, aspect));
  x += pointer.x * 0.028;
  float t = time * 0.07;
  vec3 ground = mix(vec3(1.0), vec3(0.0784), dark);
  vec3 sky = mix(vec3(0.85, 0.93, 0.98), vec3(0.055, 0.087, 0.135), dark);
  vec3 color = mix(ground, sky, smoothstep(0.05, 0.95, p.y));

  // Broad light above the surface, leaving a quiet field behind the heading.
  float light = exp(-pow((p.x - 0.68) * 2.5, 2.0) - pow((p.y - 0.58) * 2.0, 2.0));
  color += mix(vec3(0.025, 0.035, 0.04), vec3(0.02, 0.045, 0.075), dark) * light;

  for (int i = 0; i < 4; i++) {
    float layer = float(i);
    float phase = layer * 0.72;
    float wave = sin(x * 1.9 + t + phase);
    float secondary = sin(x * 3.25 - t * 0.65 + phase * 1.4);
    float crest = 0.58 - layer * 0.095 + 0.072 * wave + 0.035 * secondary;
    crest += pointer.y * (0.003 + layer * 0.002);
    float depth = crest - p.y;
    float aa = 1.5 / resolution.y;
    float cover = smoothstep(-aa, aa, depth);
    float slope = 0.137 * cos(x * 1.9 + t + phase) + 0.114 * cos(x * 3.25 - t * 0.65 + phase * 1.4);
    float facing = 0.5 + 0.5 * dot(normalize(vec3(-slope, 0.6, 0.8)), normalize(vec3(-0.6, 0.8, 0.5)));

    vec3 distant = mix(vec3(0.66, 0.79, 0.88), vec3(0.19, 0.29, 0.40), dark);
    vec3 near = mix(vec3(0.40, 0.60, 0.76), vec3(0.075, 0.14, 0.22), dark);
    vec3 surface = mix(distant, near, layer / 3.0);
    surface *= 0.82 + facing * 0.2;
    surface *= 1.0 - 0.24 * smoothstep(0.0, 0.32, depth);

    // Satin highlights and fine contour lines follow the same smooth surface.
    float rim = exp(-max(depth, 0.0) * 110.0);
    float sheen = exp(-max(depth, 0.0) * 15.0) * (0.5 + 0.5 * sin(x * 2.0 + phase));
    surface += mix(vec3(0.09, 0.12, 0.14), vec3(0.13, 0.21, 0.29), dark) * rim * 0.65;
    surface += mix(vec3(0.045, 0.065, 0.08), vec3(0.04, 0.08, 0.12), dark) * sheen;
    float contours = line(depth + depth * depth * 0.8, 0.034, 0.35 / resolution.y);
    float meridians = line(x + depth * depth * 0.65, 0.14, 0.3 / resolution.y);
    float grid = (contours * 0.045 + meridians * 0.023) * exp(-max(depth, 0.0) * 5.0);
    surface += grid * mix(vec3(0.45, 0.60, 0.7), vec3(0.5, 0.7, 0.9), dark);
    color = mix(color, surface, cover);
  }

  // A soft fade makes the landscape meet the portfolio grid without a seam.
  color = mix(ground, color, smoothstep(0.0, 0.34, p.y));
  float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  color += (grain - 0.5) / 700.0;
  gl_FragColor = vec4(color, 1.0);
}`;

export default function ArchiveLandscape({ dark, paused }: { dark: boolean; paused: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const darkRef = useRef(dark);
  const requestFrame = useRef<(() => void) | null>(null);

  useEffect(() => {
    darkRef.current = dark;
    requestFrame.current?.();
  }, [dark]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false });
    if (!gl) return;

    const shaders: WebGLShader[] = [];
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
    };
    const vs = compile(gl.VERTEX_SHADER, vertex);
    const fs = compile(gl.FRAGMENT_SHADER, fragment);
    const program = gl.createProgram();
    if (!vs || !fs || !program) {
      shaders.forEach((shader) => gl.deleteShader(shader));
      if (program) gl.deleteProgram(program);
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      shaders.forEach((shader) => gl.deleteShader(shader));
      gl.deleteProgram(program);
      return;
    }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uniforms = {
      resolution: gl.getUniformLocation(program, "resolution"),
      pointer: gl.getUniformLocation(program, "pointer"),
      time: gl.getUniformLocation(program, "time"),
      dark: gl.getUniformLocation(program, "dark"),
    };

    let frame = 0;
    let inView = true;
    let last = 0;
    let elapsed = 0;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    const draw = (now: number) => {
      frame = 0;
      if (!inView || document.hidden) return;
      if (!paused) schedule();
      if (!paused && last && now - last < 1000 / 30) return;
      const dt = paused || !last ? 0 : Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += dt;
      const ease = 1 - Math.exp(-dt * 4);
      pointerX += (targetX - pointerX) * ease;
      pointerY += (targetY - pointerY) * ease;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(host.clientWidth * dpr));
      const height = Math.max(1, Math.round(host.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uniforms.resolution, width, height);
      gl.uniform2f(uniforms.pointer, pointerX, pointerY);
      gl.uniform1f(uniforms.time, elapsed);
      gl.uniform1f(uniforms.dark, darkRef.current ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.style.opacity = "1";
    };
    function schedule() {
      if (!frame && inView && !document.hidden) frame = requestAnimationFrame(draw);
    }
    const resume = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      schedule();
    };
    const pointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      const inside = event.clientY >= rect.top && event.clientY <= rect.bottom && event.clientX >= rect.left && event.clientX <= rect.right;
      targetX = inside ? (event.clientX - rect.left) / rect.width - 0.5 : 0;
      targetY = inside ? (event.clientY - rect.top) / rect.height - 0.5 : 0;
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(host);
    const visibility = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      resume();
    });
    visibility.observe(host);
    document.addEventListener("visibilitychange", resume);
    if (!paused) window.addEventListener("pointermove", pointerMove, { passive: true });
    requestFrame.current = schedule;
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      requestFrame.current = null;
      resize.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("pointermove", pointerMove);
      gl.deleteBuffer(buffer);
      shaders.forEach((shader) => gl.deleteShader(shader));
      gl.deleteProgram(program);
      canvas.style.opacity = "0";
    };
  }, [paused]);

  return (
    <div ref={hostRef} className="absolute inset-0 bg-[linear-gradient(180deg,#dfedf7,#b6d2e5_65%,#fff)] dark:bg-[linear-gradient(180deg,#111b2a,#253d56_65%,#141414)]">
      <canvas ref={canvasRef} className="absolute inset-0 size-full opacity-0" />
    </div>
  );
}
