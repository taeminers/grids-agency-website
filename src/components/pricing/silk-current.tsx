"use client";

import { useEffect, useRef, useState } from "react";

const vertexSource = `
attribute vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`;

// Continuous curved folds, rather than stacked slats. Each fold has a broad
// shaded body, a narrow illuminated lip, and a softer light spill behind it.
const fragmentSource = `
precision highp float;
uniform vec2 uResolution;
uniform float uTime;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = (gl_FragCoord.xy - .5 * uResolution) / uResolution.y;
  float t = uTime * .22;
  p = mat2(.86, -.51, .51, .86) * p;
  p.x += .07 * sin(p.y * 2.8 + t * .7);
  vec3 color = vec3(.018, .027, .043);

  for (int i = 0; i < 7; i++) {
    float n = float(i);
    float phase = n * .61;
    float bend = .19 * sin(p.y * 2.7 + t + phase)
               + .08 * sin(p.y * 5.1 - t * .63 + phase * .5);
    float center = (n - 3.0) * .23 + bend;
    float d = p.x - center;
    float width = .115 + .025 * sin(p.y * 2.0 + t + phase);
    float body = exp(-pow(d / width, 2.0));
    float lip = exp(-pow((d + width * .54) / .012, 2.0));
    float spill = exp(-abs(d + width * .54) * 18.0);
    float light = .5 + .5 * sin(p.y * 3.6 - t * .8 + phase);
    vec3 blue = mix(vec3(.055, .20, .36), vec3(.31, .65, .84), light);
    color = mix(color, blue * (.32 + .6 * light), body * .8);
    color += vec3(.50, .79, .96) * lip * (.18 + .3 * light);
    color += vec3(.07, .24, .39) * spill * .16;
  }

  // A broad, slow-moving studio reflection connects the ribbons into a surface.
  float reflection = exp(-pow((p.y - .35 * sin(t * .47)) / .48, 2.0));
  color += vec3(.035, .065, .08) * reflection;
  color *= .85 + .15 * pow(16.0 * uv.x * uv.y * (1.0-uv.x) * (1.0-uv.y), .25);
  gl_FragColor = vec4(color, 1.0);
}
`;

export default function SilkCurrent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [contextVersion, setContextVersion] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false });
    if (!gl) return;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    const buffer = gl.createBuffer();
    const dispose = () => {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
    if (!vertex || !fragment || !program || !buffer) { dispose(); return; }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { dispose(); return; }
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, "uResolution");
    const time = gl.getUniformLocation(program, "uTime");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = false;
    let lost = false;
    let elapsed = 6;
    let previous = performance.now();

    const draw = () => {
      if (lost) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
      gl.uniform2f(resolution, width, height);
      gl.uniform1f(time, elapsed);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.style.opacity = "1";
    };
    const tick = (now: number) => {
      if (!visible || document.hidden || reduced.matches || lost) return;
      elapsed += Math.min((now - previous) / 1000, .05);
      previous = now;
      draw();
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      previous = performance.now();
      if (visible && !document.hidden && !reduced.matches && !lost) frame = requestAnimationFrame(tick);
    };
    const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    const resize = new ResizeObserver(draw);
    const onLost = (event: Event) => { event.preventDefault(); lost = true; canvas.style.opacity = "0"; sync(); };
    const onRestored = () => setContextVersion(version => version + 1);
    visibility.observe(canvas);
    resize.observe(canvas);
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    draw();
    return () => {
      cancelAnimationFrame(frame);
      visibility.disconnect();
      resize.disconnect();
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      dispose();
    };
  }, [contextVersion]);

  return <canvas ref={canvasRef} aria-hidden="true" style={{ display: "block", width: "100%", height: "100%", opacity: 0 }} />;
}
