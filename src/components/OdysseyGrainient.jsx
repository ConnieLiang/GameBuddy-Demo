import { useEffect, useRef } from 'react';

// Native WebGL: smooth flowing Odyssey bands, with no rendering dependency.
const vertex = `attribute vec2 position;
void main(){gl_Position=vec4(position,0.,1.);}`;
const fragment = `precision highp float;
uniform vec2 resolution;
uniform float time;
void main(){
  vec2 uv=gl_FragCoord.xy/resolution;
  // Broad, slow color drift with restrained distortion.
  const float zoom=1.1;
  const float timeSpeed=.45;
  const float warpStrength=.35;
  const float warpFrequency=3.;
  const float warpSpeed=.6;
  vec2 p=(uv-.5)*vec2(resolution.x/resolution.y,1.)/zoom;
  float t=time*timeSpeed;
  float warpTime=t*warpSpeed;
  p.x+=warpStrength*(.19*sin(p.y*warpFrequency+warpTime)+.09*cos(p.y*warpFrequency*1.8-warpTime*.7));
  p.y+=warpStrength*.15*sin(p.x*warpFrequency*1.2-warpTime*.8);
  float wave=.5+.5*sin(p.x*5.+p.y*4.+1.4*sin(p.y*3.-t)+t*.55);
  vec3 c1=vec3(212.,196.,255.)/255.;
  vec3 c2=vec3(167.,181.,254.)/255.;
  vec3 c3=vec3(126.,143.,255.)/255.;
  vec3 color=mix(c1,c2,smoothstep(0.,.5,wave));
  color=mix(color,c3,smoothstep(.5,1.,wave));
  color=clamp((color-.5)*1.25+.5,0.,1.);
  // Fade into the white upper screen, keeping the branding and heading quiet.
  float field=1.-smoothstep(.30,.72,uv.y);
  color=mix(vec3(1.),color,field*.8);
  gl_FragColor=vec4(color,1.);
}`;

export default function OdysseyGrainient() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
    if (!gl) return;
    // Keep the color field clean: no GPU dithering or procedural noise.
    gl.disable(gl.DITHER);
    const shaders = [];
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
      return shader;
    };
    const program = gl.createProgram();
    let buffer;
    let frame;
    let observer;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let elapsed = 0;
    let last = 0;
    const dispose = () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      if (buffer) gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      shaders.forEach(shader => gl.deleteShader(shader));
    };
    let restart;
    try {
      gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
      gl.useProgram(program);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      const size = gl.getUniformLocation(program, 'resolution');
      const time = gl.getUniformLocation(program, 'time');
      const draw = () => {
        gl.uniform2f(size, canvas.width, canvas.height);
        gl.uniform1f(time, motion.matches ? 0 : elapsed);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };
      const tick = now => {
        if (last) elapsed += Math.min((now-last)/1000, .05);
        last = now;
        draw();
        frame = requestAnimationFrame(tick);
      };
      restart = () => {
        cancelAnimationFrame(frame);
        last = 0;
        draw();
        if (!document.hidden && !motion.matches) frame = requestAnimationFrame(tick);
      };
      observer = new ResizeObserver(() => {
        const scale = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.max(1, Math.round(canvas.clientWidth*scale));
        canvas.height = Math.max(1, Math.round(canvas.clientHeight*scale));
        gl.viewport(0, 0, canvas.width, canvas.height);
        draw();
      });
      observer.observe(canvas);
      motion.addEventListener('change', restart);
      document.addEventListener('visibilitychange', restart);
      restart();
    } catch (error) {
      console.warn('Odyssey background using CSS fallback:', error);
      dispose();
      return;
    }
    return () => {
      motion.removeEventListener('change', restart);
      document.removeEventListener('visibilitychange', restart);
      dispose();
    };
  }, []);
  return <div className="signin-grainient" aria-hidden="true"><canvas ref={ref}/></div>;
}
