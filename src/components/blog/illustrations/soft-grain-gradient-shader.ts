/** Broad soft light and a diagonal shadow; grain stays fixed in place. */
export const softGrainGradientFragmentShader = `#version 300 es
precision highp float;

uniform float u_time;
// Match Paper's vertex-uniform precision while retaining precise grain math.
uniform mediump vec2 u_resolution;
uniform vec4 u_colors[3];
out vec4 fragColor;

float grain(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1.0 - uv.y;
  float time = u_time * .25;
  float edge = uv.y - .8 * uv.x - .17;
  edge += .055 * sin(uv.x * 4.0 + time);
  float shadow = smoothstep(-.19, .19, edge);
  vec3 color = mix(u_colors[2].rgb, u_colors[0].rgb, shadow * .94);

  vec2 lightUV = (uv - vec2(.97, .78)) / vec2(.36, .58);
  float sideLight = exp(-dot(lightUV, lightUV));
  color = mix(color, u_colors[2].rgb, sideLight * .68);

  vec2 shadeUV = (uv - vec2(.42, .83 + .02 * sin(time))) / vec2(.4, .17);
  float lowerShade = exp(-dot(shadeUV, shadeUV));
  color = mix(color, u_colors[1].rgb, lowerShade * .28);
  color += (grain(gl_FragCoord.xy) - .5) * .13;
  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;
