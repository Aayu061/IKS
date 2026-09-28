/**
 * Hero 3D Binary Field
 * ───────────────────────────────────────────────────────────────────────────
 * Renders a mouse-interactive 3D field of floating Sanskrit binary glyphs
 * (0, 1, ∪, —, and Devanāgarī digits) on a canvas element behind the hero.
 *
 * Features
 * ────────
 * • ~180 particles drifting in a 3D bounding box with perspective projection
 * • Mouse movement tilts the virtual camera (yaw + pitch) — parallax effect
 * • Click anywhere → shockwave ripple pushes nearby particles outward
 * • Particles connect with faint lines when close in projected 2D space
 * • Full theme awareness: reads CSS variables at runtime for colors
 * • Respects prefers-reduced-motion: pauses animation if set
 * • ResizeObserver keeps canvas pixel-perfect on any viewport change
 * ───────────────────────────────────────────────────────────────────────────
 */

const GLYPHS = ['0', '1', '∪', '—', '०', '१', '२', '३', '✦', '•'];

// Particle count and 3D field dimensions
const N_PARTICLES  = 210;
const FIELD_W      = 1450; // half-extents in virtual 3D units
const FIELD_H      = 620;
const FIELD_D      = 920;

// Camera / projection
const FOV_FACTOR   = 700; // perspective divisor (higher = less distortion)

// Connection line max distance (projected 2D px)
const LINK_DIST    = 105;

// Mouse tilt max angle (radians)
const TILT_MAX     = 0.28;

// Shockwave
const SHOCK_RADIUS = 240; // virtual 3D units — push radius
const SHOCK_FORCE  = 6.5;

export function initHero3DCanvas() {
  const canvas = document.getElementById('hero-3d-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;

  // ── Camera state ──────────────────────────────────────────────────────────
  let camYaw   = 0; // rotation around Y axis (mouse X)
  let camPitch = 0; // rotation around X axis (mouse Y)
  let targetYaw   = 0;
  let targetPitch = 0;

  // ── Shockwaves ─────────────────────────────────────────────────────────────
  const shockwaves = []; // { x, y, z, age, maxAge }

  // ── Particles ──────────────────────────────────────────────────────────────
  const particles = [];

  function createParticle(i) {
    const isNode = i % 5 === 0; // 20% are sparkling constellation nodes
    return {
      // 3D position (centered at origin)
      x: (Math.random() - 0.5) * FIELD_W,
      y: (Math.random() - 0.5) * FIELD_H,
      z: (Math.random() - 0.5) * FIELD_D,
      // Velocity
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.20,
      vz: (Math.random() - 0.5) * 0.22,
      // Visual
      isNode,
      glyph: isNode ? '•' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      size: isNode ? (7 + Math.random() * 6) : (13 + Math.random() * 15),
      opacity: 0.55 + Math.random() * 0.42, // High vibrant opacity (0.55 - 0.97)
      colorIdx: Math.floor(Math.random() * 4), // 0=saffron 1=gold 2=teal 3=cyan/indigo
      // Phase for individual pulsing
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.010 + Math.random() * 0.015,
    };
  }

  for (let i = 0; i < N_PARTICLES; i++) {
    particles.push(createParticle(i));
  }

  // ── Theme color resolver ────────────────────────────────────────────────────
  function getColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      isDark,
      saffron: isDark ? 'rgba(255,180,60,'  : 'rgba(230,85,15,',
      gold:    isDark ? 'rgba(255,220,75,'  : 'rgba(217,119,6,',
      teal:    isDark ? 'rgba(52,211,153,'  : 'rgba(13,148,136,',
      accent:  isDark ? 'rgba(56,189,248,'  : 'rgba(79,70,229,',
      link:    isDark ? 'rgba(74,222,128,'  : 'rgba(20,184,166,',
      glowColors: isDark ? [
        'rgba(255,180,60,0.85)',
        'rgba(255,220,75,0.90)',
        'rgba(52,211,153,0.85)',
        'rgba(56,189,248,0.85)'
      ] : [
        'rgba(230,85,15,0.30)',
        'rgba(217,119,6,0.30)',
        'rgba(13,148,136,0.25)',
        'rgba(79,70,229,0.25)'
      ]
    };
  }

  // ── Resize handler ─────────────────────────────────────────────────────────
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width  = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
  resize();

  // ── 3D → 2D projection ─────────────────────────────────────────────────────
  function project(x, y, z) {
    // Apply camera yaw (Y rotation) and pitch (X rotation)
    const cosY = Math.cos(camYaw),  sinY = Math.sin(camYaw);
    const cosP = Math.cos(camPitch), sinP = Math.sin(camPitch);

    // Yaw
    const x1 =  x * cosY + z * sinY;
    const z1 = -x * sinY + z * cosY;
    const y1 =  y;

    // Pitch
    const y2 = y1 * cosP - z1 * sinP;
    const z2 = y1 * sinP + z1 * cosP;

    // Perspective divide
    const scale = FOV_FACTOR / (FOV_FACTOR + z2);
    return {
      sx: W / 2 + x1 * scale,
      sy: H / 2 + y2 * scale,
      scale,
      z: z2, // for depth-based opacity/size
    };
  }

  // ── Mouse tracking ─────────────────────────────────────────────────────────
  function onMouseMove(e) {
    const rect = canvas.parentElement.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 … +0.5
    const ny = (e.clientY - rect.top)  / rect.height - 0.5;
    targetYaw   =  nx * TILT_MAX * 2;
    targetPitch = -ny * TILT_MAX;
  }

  function onMouseLeave() {
    targetYaw   = 0;
    targetPitch = 0;
  }

  // ── Click → shockwave ─────────────────────────────────────────────────────
  function onClick(e) {
    const rect = canvas.parentElement.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    // Unproject to an approximate 3D point at z=0 plane
    const x3d = (sx - W / 2) / (FOV_FACTOR / FOV_FACTOR);
    const y3d = (sy - H / 2) / (FOV_FACTOR / FOV_FACTOR);

    shockwaves.push({ x: x3d, y: y3d, z: 0, age: 0, maxAge: 60 });
  }

  // Attach to parent section so clicks land through hero-content too
  const section = canvas.parentElement;
  section.addEventListener('mousemove', onMouseMove, { passive: true });
  section.addEventListener('mouseleave', onMouseLeave, { passive: true });
  section.addEventListener('click', onClick, { passive: true });

  // ── Animation loop ─────────────────────────────────────────────────────────
  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let rafId;
  let tick = 0;

  function draw() {
    rafId = requestAnimationFrame(draw);
    tick++;

    // Smooth camera
    camYaw   += (targetYaw   - camYaw)   * 0.06;
    camPitch += (targetPitch - camPitch) * 0.06;

    ctx.clearRect(0, 0, W, H);

    const colors = getColors();

    // ── Apply shockwaves to particle velocities ───────────────────────────
    shockwaves.forEach((sw) => {
      sw.age++;
      if (sw.age > sw.maxAge) return;
      const t = sw.age / sw.maxAge;
      const force = SHOCK_FORCE * (1 - t) * (1 - t);

      particles.forEach((p) => {
        const dx = p.x - sw.x;
        const dy = p.y - sw.y;
        const dz = p.z - sw.z;
        const d  = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < SHOCK_RADIUS && d > 0.1) {
          const f = force / d;
          p.vx += dx * f * 0.03;
          p.vy += dy * f * 0.03;
          p.vz += dz * f * 0.03;
        }
      });
    });

    // Cull dead shockwaves
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      if (shockwaves[i].age > shockwaves[i].maxAge) shockwaves.splice(i, 1);
    }

    // ── Update particles ──────────────────────────────────────────────────
    if (!prefersReducedMotion) {
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Damping (slows drift after shockwave)
        p.vx *= 0.992;
        p.vy *= 0.992;
        p.vz *= 0.992;

        // Wrap around field boundaries
        if (p.x >  FIELD_W / 2) p.x = -FIELD_W / 2;
        if (p.x < -FIELD_W / 2) p.x =  FIELD_W / 2;
        if (p.y >  FIELD_H / 2) p.y = -FIELD_H / 2;
        if (p.y < -FIELD_H / 2) p.y =  FIELD_H / 2;
        if (p.z >  FIELD_D / 2) p.z = -FIELD_D / 2;
        if (p.z < -FIELD_D / 2) p.z =  FIELD_D / 2;

        // Advance phase
        p.phase += p.pulseSpeed;
      });
    }

    // ── Project all particles ─────────────────────────────────────────────
    const projected = particles.map((p) => ({
      p,
      ...project(p.x, p.y, p.z),
    }));

    // Sort back-to-front for painter's algorithm
    projected.sort((a, b) => a.z - b.z);

    // ── Draw connection lines ─────────────────────────────────────────────
    const colorArr = [colors.saffron, colors.gold, colors.teal, colors.accent];

    for (let i = 0; i < projected.length; i++) {
      const a = projected[i];
      if (a.sx < -50 || a.sx > W + 50 || a.sy < -50 || a.sy > H + 50) continue;

      for (let j = i + 1; j < projected.length; j++) {
        const b = projected[j];
        const dx = a.sx - b.sx;
        const dy = a.sy - b.sy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          const alpha = (1 - dist / LINK_DIST) * (colors.isDark ? 0.35 : 0.28) * Math.min(1, Math.max(a.p.opacity, b.p.opacity));
          ctx.beginPath();
          ctx.moveTo(a.sx, a.sy);
          ctx.lineTo(b.sx, b.sy);
          ctx.strokeStyle = colorArr[a.p.colorIdx] + alpha + ')';
          ctx.lineWidth = colors.isDark ? 0.9 : 1.1;
          ctx.stroke();
        }
      }
    }

    // ── Draw glyphs & sparkling nodes ─────────────────────────────────────
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    projected.forEach(({ p, sx, sy, scale, z }) => {
      if (sx < -60 || sx > W + 60 || sy < -60 || sy > H + 60) return;

      // Depth fade: particles far back are still comfortably visible (0.40 - 1.0)
      const depthRatio = Math.max(0, Math.min(1, (z + FIELD_D / 2) / FIELD_D));
      const depthAlpha = 0.40 + 0.60 * depthRatio;
      // Individual pulse
      const pulse = 0.88 + 0.12 * Math.sin(p.phase);
      const finalAlpha = Math.min(1, p.opacity * depthAlpha * pulse);

      const color = colorArr[p.colorIdx];
      const glow = colors.glowColors[p.colorIdx];

      // Set neon shadow blur in dark mode, subtle warm crisp shadow in light mode
      if (colors.isDark) {
        ctx.shadowColor = glow;
        ctx.shadowBlur = Math.min(16, 5 + scale * 9);
      } else {
        ctx.shadowColor = 'rgba(217, 119, 6, 0.28)';
        ctx.shadowBlur = Math.min(6, 1 + scale * 4);
      }

      if (p.isNode) {
        // Draw sparkling circular constellation node
        const r = Math.max(1.8, (p.size * scale) * 0.4);
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = color + finalAlpha + ')';
        ctx.fill();
      } else {
        // Draw bold text glyph
        const fontSize = p.size * scale * 1.15;
        ctx.font = `600 ${Math.max(9, fontSize)}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = color + finalAlpha + ')';
        ctx.fillText(p.glyph, sx, sy);
      }
    });

    // Reset shadow after particles to prevent bleed
    ctx.shadowBlur = 0;

    // ── Draw shockwave rings (bright energetic double ripple) ───────────────
    shockwaves.forEach((sw) => {
      const t = sw.age / sw.maxAge;
      if (t >= 1) return;
      const proj = project(sw.x, sw.y, sw.z);
      const radius = SHOCK_RADIUS * t * proj.scale;
      const alphaOuter = (1 - t) * 0.70;
      const alphaInner = (1 - t) * 0.90;

      if (colors.isDark) {
        ctx.shadowColor = 'rgba(251, 191, 36, 0.85)';
        ctx.shadowBlur = 14;
      }

      // Outer ripple
      ctx.beginPath();
      ctx.arc(proj.sx, proj.sy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = colors.saffron + alphaOuter + ')';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Inner concentrated core
      ctx.beginPath();
      ctx.arc(proj.sx, proj.sy, radius * 0.92, 0, Math.PI * 2);
      ctx.strokeStyle = colors.gold + alphaInner + ')';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.shadowBlur = 0;
    });
  }

  draw();

  // Cleanup on page unload (prevents memory leaks)
  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(rafId);
    ro.disconnect();
    section.removeEventListener('mousemove', onMouseMove);
    section.removeEventListener('mouseleave', onMouseLeave);
    section.removeEventListener('click', onClick);
  });
}
