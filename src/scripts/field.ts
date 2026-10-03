/**
 * Hero "voice field": a ridgeline of sound-wave lines drawn on canvas.
 * - Idle: the lines breathe slowly.
 * - Pointer: lines swell around the cursor (desktop pointers only).
 * - Scroll: the field grows and flows as the hero scrolls away, and settles back on the way up.
 *
 * Progress is read from the hero's position inside the animation frame, so there is
 * no scroll listener, and the loop pauses whenever the hero is off-screen.
 * The canvas is painted fully opaque in the page colour and the edges are faded by
 * fading the strokes, which avoids banding from blending translucent pixels.
 */

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function hexToRgb(hex: string) {
  const m = hex.replace('#', '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const n = parseInt(full, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

export function initField() {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-field]');
  const hero = canvas?.closest<HTMLElement>('[data-hero]');
  const ctx = canvas?.getContext('2d', { alpha: false });
  if (!canvas || !hero || !ctx) return;

  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  let inkRgb = '14, 26, 43';
  let accentRgb = '30, 95, 207';
  let bg = '#f6f6f3';
  const readTheme = () => {
    inkRgb = hexToRgb(cssVar('--ink'));
    accentRgb = hexToRgb(cssVar('--accent'));
    bg = cssVar('--bg');
  };

  let w = 0;
  let h = 0;
  let lines = 24;
  let step = 6;
  // 'side' fades the left edge (desktop); 'vertical' fades top and bottom (mobile).
  let fadeMode: 'side' | 'vertical' = 'side';
  let inkStroke: CanvasGradient | string = '';
  let accentStroke: CanvasGradient | string = '';

  // Smoothed state
  let progress = 0;
  let pointerX = 0;
  let pointerY = 0;
  let pointerAmt = 0;
  let pointerTarget = 0;

  let running = false;
  let visible = true;
  let start = performance.now();

  const buildStrokes = () => {
    if (fadeMode === 'side') {
      const make = (rgb: string) => {
        const g = ctx.createLinearGradient(0, 0, w, 0);
        g.addColorStop(0, `rgba(${rgb}, 0)`);
        g.addColorStop(0.1, `rgba(${rgb}, 0)`);
        g.addColorStop(0.46, `rgba(${rgb}, 1)`);
        g.addColorStop(1, `rgba(${rgb}, 1)`);
        return g;
      };
      inkStroke = make(inkRgb);
      accentStroke = make(accentRgb);
    } else {
      inkStroke = `rgb(${inkRgb})`;
      accentStroke = `rgb(${accentRgb})`;
    }
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    lines = Math.round(clamp(h / 21, 14, 36));
    step = w < 640 ? 7 : 5;
    fadeMode =
      getComputedStyle(canvas).getPropertyValue('--field-fade').trim() === 'vertical' ? 'vertical' : 'side';
    buildStrokes();
  };

  /** Extra fade per line, based on its resting height. */
  const lineFade = (y0: number) =>
    fadeMode === 'side'
      ? 0.35 + 0.65 * smooth(h * 0.06, h * 0.32, y0)
      : smooth(h * 0.04, h * 0.26, y0) * (1 - smooth(h * 0.74, h * 0.96, y0));

  // Layered sines give organic, repeatable motion without a noise library.
  const wave = (x: number, i: number, t: number) =>
    Math.sin(x * 0.011 + i * 0.62 + t * 0.5) * 0.55 +
    Math.sin(x * 0.029 - i * 0.37 + t * 0.85) * 0.3 +
    Math.sin(x * 0.067 + i * 1.31 - t * 1.3) * 0.15;

  const draw = (now: number) => {
    const t = reduceQuery.matches ? 0 : (now - start) / 1000;

    if (!reduceQuery.matches) {
      const rect = hero.getBoundingClientRect();
      const target = clamp(-rect.top / (rect.height * 0.85), 0, 1);
      progress += (target - progress) * 0.08;
      pointerAmt += (pointerTarget - pointerAmt) * 0.06;
    }

    ctx.globalAlpha = 1;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const top = h * 0.14;
    const bottom = h * 0.9;
    const gap = (bottom - top) / (lines - 1);
    const centerX = w * 0.56;
    const spread = w * 0.27;
    const amp = gap * (3 + progress * 5);
    const drift = progress * 3.2;
    const lift = progress * h * 0.06;
    const accentIndex = Math.round(lines * 0.6);
    const pointerSpreadX = 2 * 90 * 90;
    const pointerSpreadY = 2 * (gap * 5) * (gap * 5);

    for (let i = 0; i < lines; i++) {
      const y0 = top + i * gap - lift;
      const depth = i / (lines - 1);

      ctx.beginPath();
      for (let x = -step; x <= w + step; x += step) {
        const env = Math.exp(-((x - centerX) ** 2) / (2 * spread * spread));
        const v = wave(x, i, t + drift) * 0.5 + 0.5;
        let y = y0 - amp * env * v * v;
        if (pointerAmt > 0.001) {
          y -=
            pointerAmt *
            gap *
            7 *
            Math.exp(-((x - pointerX) ** 2) / pointerSpreadX) *
            Math.exp(-((y0 - pointerY) ** 2) / pointerSpreadY);
        }
        if (x === -step) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      // Fill beneath each line with the page colour so nearer ridges hide farther ones.
      ctx.lineTo(w + step, h + 2);
      ctx.lineTo(-step, h + 2);
      ctx.closePath();
      ctx.globalAlpha = 1;
      ctx.fill();

      const isAccent = i === accentIndex;
      const fade = lineFade(y0);
      ctx.lineWidth = isAccent ? 1.75 : 1;
      ctx.strokeStyle = isAccent ? accentStroke : inkStroke;
      ctx.globalAlpha = (isAccent ? 1 : 0.14 + depth * 0.46) * fade;
      ctx.stroke();
      ctx.fillStyle = bg;
    }
    ctx.globalAlpha = 1;

    if (running) requestAnimationFrame(draw);
  };

  const play = () => {
    if (running || reduceQuery.matches || !visible) return;
    running = true;
    requestAnimationFrame(draw);
  };
  const pause = () => {
    running = false;
  };
  const renderStill = () => {
    if (!running) draw(performance.now());
  };

  readTheme();
  resize();
  renderStill();
  play();

  new ResizeObserver(() => {
    resize();
    renderStill();
  }).observe(canvas);

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) play();
    else pause();
  }).observe(hero);

  darkQuery.addEventListener('change', () => {
    readTheme();
    buildStrokes();
    renderStill();
  });
  reduceQuery.addEventListener('change', () => {
    if (reduceQuery.matches) {
      pause();
      renderStill();
    } else {
      start = performance.now();
      play();
    }
  });

  hero.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const rect = canvas.getBoundingClientRect();
    pointerX = e.clientX - rect.left;
    pointerY = e.clientY - rect.top;
    pointerTarget = pointerX >= 0 && pointerX <= rect.width ? 1 : 0;
  });
  hero.addEventListener('pointerleave', () => {
    pointerTarget = 0;
  });
}
