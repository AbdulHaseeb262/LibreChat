import { useEffect, useRef } from 'react';

/**
 * Solvane — the ground behind the whole app.
 *
 * This used to be an animated starfield. It was striking for ten seconds and
 * tiring for the rest of the day: a surface you read on should not move while
 * you read. Claude, the bar we are aiming at, has nothing moving behind the
 * conversation at all.
 *
 * What is left is a single static wash — two very faint pools of warmth so the
 * surface is not flat paint — painted once per resize and once per theme change.
 * No requestAnimationFrame and no timers, so it costs nothing after first paint
 * and cannot compete with the text.
 *
 * The ground colour itself is the `bg-presentation` class on the canvas, which
 * lets every pane above it stay transparent.
 */
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

    const paint = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const dark = document.documentElement.classList.contains('dark');
      // Upper right, the warmer pool; lower left, a cooler green one. Both sit
      // far below the threshold where they would read as "a background".
      const warm = dark ? 'rgba(127,200,164,0.055)' : 'rgba(31,77,61,0.030)';
      const cool = dark ? 'rgba(47,125,95,0.045)' : 'rgba(31,77,61,0.018)';

      const a = ctx.createRadialGradient(w * 0.78, h * 0.16, 0, w * 0.78, h * 0.16, Math.max(w, h) * 0.62);
      a.addColorStop(0, warm);
      a.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = a;
      ctx.fillRect(0, 0, w, h);

      const b = ctx.createRadialGradient(w * 0.16, h * 0.88, 0, w * 0.16, h * 0.88, Math.max(w, h) * 0.5);
      b.addColorStop(0, cool);
      b.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = b;
      ctx.fillRect(0, 0, w, h);
    };

    const ro = new ResizeObserver(paint);
    ro.observe(canvas);
    // Repaint on a theme change so the wash follows light/dark.
    const themeObserver = new MutationObserver(paint);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    paint();

    return () => {
      ro.disconnect();
      themeObserver.disconnect();
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
