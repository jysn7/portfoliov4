'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

// ---------------------------------------------------------------------------
// Same reactive WebGL wave shader from NewHero, now painted inside the
// pill/oval masthead strip instead of a flat color, with the photo removed
// entirely. Palette is pulled live from --primary / --background / --foreground
// so it always matches the site's theme (light/dark included).
// ---------------------------------------------------------------------------

/** Reads a CSS custom property and returns it as [r, g, b] in 0..1, via a
 *  canvas normalization trick so oklch/hsl/whatever all resolve correctly. */
function resolveCssColorRgb(varName: string, fallback: [number, number, number]) {
  if (typeof window === 'undefined') return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  if (!raw) return fallback;
  try {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return fallback;
    ctx.fillStyle = raw;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255] as [number, number, number];
  } catch {
    return fallback;
  }
}

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, isPressed: false });
  const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vertexSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentSource = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_intensity;
      uniform vec3 u_bg;
      uniform vec3 u_mid;
      uniform vec3 u_crest;

      float hash(vec2 p){
        p=fract(p*vec2(127.1,311.7));
        p+=dot(p,p+45.32);
        return fract(p.x*p.y);
      }

      void main(){
        vec2 uv = gl_FragCoord.xy / u_resolution;
        vec2 st = (uv - .5) * vec2(u_resolution.x / u_resolution.y, 1.);
        float t = u_time;

        float mdist = distance(uv, u_mouse);
        float mpull = smoothstep(.55, 0., mdist) * (.4 + u_intensity * .9);

        float warp = sin(st.x * 3.8 + t * .7 + sin(st.y * 2.5 + t * .5) * 1.2) * .18;
        warp      += sin(st.y * 4.2 - t * .55 + sin(st.x * 3.1 + t * .4) * 1.1) * .14;
        warp      += mpull * sin(st.x * 6. + t * 1.2) * .3;

        vec2 sw = st + vec2(warp);

        float w1 = sin(sw.x * 5.5 + t * .9);
        float w2 = sin(sw.y * 4.8 - t * .75 + warp * 2.2);
        float w3 = sin((sw.x + sw.y) * 3.9 + t * .6);
        float w4 = sin(sw.x * 8.2 - sw.y * 5.1 + t * 1.1 + u_intensity * 2.);
        float w5 = sin(length(sw) * 6. - t * 1.4) * mpull;

        float wave = (w1 + w2 + w3 + w4 * .5 + w5) / 4.0;
        wave = wave * .5 + .5;

        float crest  = smoothstep(.6, 1., wave);
        float trough = smoothstep(.4, 0., wave);
        float mid    = 1. - crest - trough;

        vec3 baseCol = u_bg * trough + u_mid * mid + u_crest * crest;

        float vig  = 1. - smoothstep(.45, 1.3, length((uv - .5) * 1.5));
        float mask = smoothstep(.18, .75, wave) * vig;
        mask += mpull * .35;

        vec3 finalColor = mix(u_bg, baseCol, clamp(mask * .92, 0., 1.));

        float grain = (hash(uv + u_time) - .5) * .09;
        float scan  = sin(uv.y * 700. + u_time * 4.) * .025;
        finalColor += (grain + scan) * mask;

        gl_FragColor = vec4(finalColor, 1.);
      }
    `;

    const createShader = (glCtx: WebGLRenderingContext, type: number, source: string) => {
      const shader = glCtx.createShader(type)!;
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        console.error('Shader compile error:', glCtx.getShaderInfoLog(shader));
      }
      return shader;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
    }
    gl.useProgram(program);

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const resLoc = gl.getUniformLocation(program, 'u_resolution');
    const mouseLoc = gl.getUniformLocation(program, 'u_mouse');
    const intenseLoc = gl.getUniformLocation(program, 'u_intensity');
    const bgLoc = gl.getUniformLocation(program, 'u_bg');
    const midLoc = gl.getUniformLocation(program, 'u_mid');
    const crestLoc = gl.getUniformLocation(program, 'u_crest');

    // Theme colors — background/mid(primary)/crest(foreground), sampled once on mount.
    const bgColor = resolveCssColorRgb('--background', [0.07, 0.07, 0.07]);
    const midColor = resolveCssColorRgb('--primary', [0.76, 0.91, 0.12]);
    const crestColor = resolveCssColorRgb('--foreground', [0.98, 0.98, 0.96]);

    let animationFrameId: number;
    let intensity = 0;

    const render = (time: number) => {
      if (!canvas) return;
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      const targetIntensity = mouseRef.current.isPressed ? 1.0 : 0.0;
      intensity += (targetIntensity - intensity) * 0.08;

      smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * 0.12;
      smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * 0.12;

      gl.uniform1f(timeLoc, time * 0.001);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform2f(mouseLoc, smoothMouseRef.current.x, smoothMouseRef.current.y);
      gl.uniform1f(intenseLoc, intensity);
      gl.uniform3f(bgLoc, bgColor[0], bgColor[1], bgColor[2]);
      gl.uniform3f(midLoc, midColor[0], midColor[1], midColor[2]);
      gl.uniform3f(crestLoc, crestColor[0], crestColor[1], crestColor[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl.fromTo(
        stripRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 1.2, ease: 'power3.inOut' }
      )
        .fromTo(
          nameRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
          '-=0.4'
        )
        .fromTo(
          subRef.current,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
          '-=0.6'
        );
    }, containerRef);

    return () => {
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      ctx.revert();
    };
  }, []);

  const handlePointer = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    if (pillRef.current && !('touches' in e)) {
      gsap.to(pillRef.current, { x: clientX, y: clientY, duration: 0.35, ease: 'power3.out' });
    }

    mouseRef.current = {
      ...mouseRef.current,
      x: (clientX - rect.left) / rect.width,
      y: 1.0 - (clientY - rect.top) / rect.height,
    };
  };

  const handleMouseDown = () => {
    mouseRef.current.isPressed = true;
    gsap.to(pillRef.current, { scale: 0.85, duration: 0.4, ease: 'power3.out' });
  };

  const handleMouseUp = () => {
    mouseRef.current.isPressed = false;
    gsap.to(pillRef.current, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-center bg-background px-6 py-16 overflow-hidden"
    >
      {/* "hold" cursor pill — follows the pointer while hovering the strip */}
      <div
        ref={pillRef}
        className={`fixed top-0 left-0 pointer-events-none z-[100] -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out ${
          isHovering ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-75 blur-sm'
        }`}
        style={{
          color: 'var(--background)',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          fontFamily: 'monospace',
          padding: '10px 30px',
          borderRadius: '100px',
          background: 'color-mix(in srgb, var(--foreground) 100%, transparent)',
          border: '1px solid color-mix(in srgb, var(--foreground) 100%, transparent)',
          backdropFilter: 'blur(14px)',
        }}
      >
        hold
      </div>

      {/* Shader strip — pill-shaped, same reactive wave effect as NewHero */}
      <div
        ref={stripRef}
        className="relative w-[70vw] max-w-3xl h-16 sm:h-20 md:h-20 rounded-full overflow-hidden origin-center cursor-none"
        onMouseMove={handlePointer}
        onTouchMove={handlePointer}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
      >
        <canvas ref={canvasRef} className="h-full w-full block touch-none bg-background" />
      </div>

      {/* Name */}
      <h1
        ref={nameRef}
        className="mt-6 sm:mt-8 font-body font-semibold text-foreground uppercase text-center leading-[0.9] tracking-tight text-5xl md:text-8xl"
      >
        Jayson Baloyi
      </h1>

      {/* Role line */}
      <p
        ref={subRef}
        className="mt-4 font-normal text-foreground/80 text-xs sm:text-sm uppercase tracking-[0.25em] text-center"
      >
        Software Engineer
      </p>
    </section>
  );
}