import { useEffect, useRef } from 'react';

/**
 * Solvane — the sky behind the conversation.
 *
 * Dark: a starfield that twinkles, a faint mint nebula that drifts, and a
 * shooting star every few seconds. Light: soft motes of light rising through
 * warm paper with a slow patch of sun moving across it.
 *
 * One 2D canvas, one requestAnimationFrame. DPR capped at 1.5, paused when the
 * tab is hidden, a single still frame under prefers-reduced-motion. It reads
 * the theme from the `dark` class on <html> and watches it, so switching
 * themes swaps the sky without a reload.
 */

type Star = { x: number; y: number; r: number; p: number; s: number };
type Meteor = { x: number; y: number; vx: number; vy: number; life: number; max: number; len: number };
type Mote = { x: number; y: number; r: number; v: number; a: number; d: number };

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export default function Sky() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      return;
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let dark = document.documentElement.classList.contains('dark');
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let running = true;
    let last = performance.now();
    let nextMeteor = 1500;

    let stars: Star[] = [];
    let meteors: Meteor[] = [];
    let motes: Mote[] = [];
    let drift = 0;

    const seed = () => {
      const n = Math.round((w * h) / 9000);
      stars = Array.from({ length: Math.min(320, Math.max(80, n)) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(0.4, 1.5),
        p: Math.random() * Math.PI * 2,
        s: rand(0.4, 1.4),
      }));
      const m = Math.round((w * h) / 30000);
      motes = Array.from({ length: Math.min(90, Math.max(24, m)) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(1.5, 4.5),
        v: rand(4, 14),
        a: rand(0.08, 0.26),
        d: rand(-6, 6),
      }));
      meteors = [];
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const drawDark = (t: number, dt: number) => {
      // Nebula: two soft mint patches that drift very slowly.
      drift += dt * 0.00004;
      const nx = w * (0.62 + Math.sin(drift) * 0.12);
      const ny = h * (0.28 + Math.cos(drift * 0.8) * 0.1);
      const g1 = ctx.createRadialGradient(nx, ny, 0, nx, ny, Math.max(w, h) * 0.45);
      g1.addColorStop(0, 'rgba(127,200,164,0.11)');
      g1.addColorStop(1, 'rgba(127,200,164,0)');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);
      const mx = w * (0.2 - Math.sin(drift * 0.6) * 0.08);
      const my = h * (0.78 + Math.cos(drift) * 0.08);
      const g2 = ctx.createRadialGradient(mx, my, 0, mx, my, Math.max(w, h) * 0.35);
      g2.addColorStop(0, 'rgba(47,125,95,0.12)');
      g2.addColorStop(1, 'rgba(47,125,95,0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      // Stars, twinkling on their own phases.
      for (const s of stars) {
        const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.0012 * s.s + s.p));
        ctx.fillStyle = `rgba(234,247,239,${a * 0.85})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shooting stars: launch one every few seconds, from the upper half,
      // travelling down and to the right with a tail that fades.
      nextMeteor -= dt;
      if (nextMeteor <= 0 && meteors.length < 2) {
        const speed = rand(0.9, 1.4);
        const ang = rand(Math.PI * 0.12, Math.PI * 0.3);
        meteors.push({
          x: rand(-w * 0.1, w * 0.7),
          y: rand(-h * 0.1, h * 0.45),
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed,
          life: 0,
          max: rand(700, 1100),
          len: rand(140, 260),
        });
        nextMeteor = rand(2600, 6500);
      }
      meteors = meteors.filter((m) => m.life < m.max);
      for (const m of meteors) {
        m.life += dt;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        const k = m.life / m.max;
        const fade = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85;
        const tx = m.x - m.vx * m.len;
        const ty = m.y - m.vy * m.len;
        const g = ctx.createLinearGradient(tx, ty, m.x, m.y);
        g.addColorStop(0, 'rgba(234,247,239,0)');
        g.addColorStop(0.7, `rgba(191,233,211,${0.35 * fade})`);
        g.addColorStop(1, `rgba(255,255,255,${0.95 * fade})`);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();
        ctx.fillStyle = `rgba(255,255,255,${0.9 * fade})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawLight = (t: number, dt: number) => {
      // A slow patch of sun across the paper.
      drift += dt * 0.00003;
      const sx = w * (0.3 + Math.sin(drift) * 0.25);
      const sy = h * (0.25 + Math.cos(drift * 0.7) * 0.15);
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, Math.max(w, h) * 0.5);
      g.addColorStop(0, 'rgba(255,255,255,0.55)');
      g.addColorStop(0.5, 'rgba(127,200,164,0.08)');
      g.addColorStop(1, 'rgba(127,200,164,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Motes of light rising, wandering a little.
      for (const m of motes) {
        m.y -= (m.v * dt) / 1000;
        m.x += Math.sin(t * 0.0006 + m.d) * 0.08;
        if (m.y < -10) {
          m.y = h + 10;
          m.x = Math.random() * w;
        }
        const a = m.a * (0.6 + 0.4 * Math.sin(t * 0.001 + m.d));
        const mg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 3);
        mg.addColorStop(0, `rgba(47,125,95,${a})`);
        mg.addColorStop(1, 'rgba(47,125,95,0)');
        ctx.fillStyle = mg;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(50, now - last);
      last = now;
      ctx.clearRect(0, 0, w, h);
      if (dark) {
        drawDark(now, dt);
      } else {
        drawLight(now, dt);
      }
    };

    const loop = (now: number) => {
      if (!running) {
        return;
      }
      frame(now);
      raf = requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      running = !document.hidden && !reduced;
      if (running) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      } else {
        cancelAnimationFrame(raf);
      }
    };

    const themeObserver = new MutationObserver(() => {
      const next = document.documentElement.classList.contains('dark');
      if (next !== dark) {
        dark = next;
        meteors = [];
        if (reduced) {
          frame(performance.now());
        }
      }
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) {
        frame(performance.now());
      }
    });
    ro.observe(canvas);
    resize();

    document.addEventListener('visibilitychange', onVisibility);
    if (reduced) {
      frame(performance.now());
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      themeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="solvane-sky pointer-events-none absolute inset-0 -z-10 h-full w-full bg-presentation"
    />
  );
}
