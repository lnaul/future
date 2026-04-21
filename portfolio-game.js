// portfolio-game.js — Absorb mini-game (Canvas 2D)

(function () {
  const canvas  = document.getElementById('game-canvas');
  const overlay = document.getElementById('game-overlay');
  const startBtn = document.getElementById('start-game-btn');
  const scoreEl  = document.getElementById('score-display');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width  = Math.round(rect.width);
    H = canvas.height = Math.round(rect.height);
    if (player) { player.x = W / 2; player.y = H / 2; }
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
  resize();

  // ─── State ──────────────────────────────────────────────────────────────────

  let running    = false;
  let score      = 0;
  let spawnTimer = 0;
  let animId     = null;
  let lastT      = 0;

  const player = {
    x: 0, y: 0, r: 22,
    vx: 0, vy: 0,
    trail: [],
    pulse: 0,
    mouseX: null, mouseY: null,
  };

  let orbs  = [];
  let sparks = [];

  // ─── Controls ───────────────────────────────────────────────────────────────

  const keys = {};
  window.addEventListener('keydown', e => { keys[e.key] = true; });
  window.addEventListener('keyup',   e => { keys[e.key] = false; });

  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    player.mouseX = (e.clientX - r.left) * (W / r.width);
    player.mouseY = (e.clientY - r.top)  * (H / r.height);
  });
  canvas.addEventListener('mouseleave', () => { player.mouseX = null; });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    const t = e.touches[0];
    player.mouseX = (t.clientX - r.left) * (W / r.width);
    player.mouseY = (t.clientY - r.top)  * (H / r.height);
  }, { passive: false });

  canvas.addEventListener('touchend', () => { player.mouseX = null; });

  // ─── Spawn ───────────────────────────────────────────────────────────────────

  function spawnOrb() {
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    if (edge === 0) { x = Math.random() * W; y = -40; }
    else if (edge === 1) { x = W + 40; y = Math.random() * H; }
    else if (edge === 2) { x = Math.random() * W; y = H + 40; }
    else { x = -40; y = Math.random() * H; }

    const r = 7 + Math.random() * 26;
    const ang = Math.atan2(H / 2 - y, W / 2 - x) + (Math.random() - 0.5) * 1.2;
    const spd = 0.6 + Math.random() * 1.8;
    const larger = r > player.r * 0.85;

    orbs.push({
      x, y, r, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
      hue: larger ? 270 + Math.random() * 50 : 165 + Math.random() * 35,
      pulse: Math.random() * Math.PI * 2,
      alive: true,
    });
  }

  function emitSparks(x, y, count, hue) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 1.5 + Math.random() * 5;
      sparks.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: 1, decay: 0.028 + Math.random() * 0.04,
        r: 2 + Math.random() * 3, hue,
      });
    }
  }

  // ─── Update ───────────────────────────────────────────────────────────────────

  function update(dt) {
    const spd = 4.2;

    // Mouse / touch follow
    if (player.mouseX !== null) {
      const dx = player.mouseX - player.x;
      const dy = player.mouseY - player.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d > 6) {
        player.vx = (dx / d) * Math.min(d * 0.14, spd);
        player.vy = (dy / d) * Math.min(d * 0.14, spd);
      } else { player.vx *= 0.8; player.vy *= 0.8; }
    } else {
      const up    = keys['w'] || keys['W'] || keys['ArrowUp'];
      const down  = keys['s'] || keys['S'] || keys['ArrowDown'];
      const left  = keys['a'] || keys['A'] || keys['ArrowLeft'];
      const right = keys['d'] || keys['D'] || keys['ArrowRight'];
      if (up)    player.vy = -spd; else if (down)  player.vy = spd;  else player.vy *= 0.82;
      if (left)  player.vx = -spd; else if (right) player.vx = spd;  else player.vx *= 0.82;
    }

    player.x = Math.max(player.r, Math.min(W - player.r, player.x + player.vx));
    player.y = Math.max(player.r, Math.min(H - player.r, player.y + player.vy));
    player.pulse += 0.06;

    player.trail.push({ x: player.x, y: player.y });
    if (player.trail.length > 18) player.trail.shift();

    // Spawn
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnOrb();
      spawnTimer = Math.max(350, 1400 - score * 4);
    }

    // Orbs
    for (const o of orbs) {
      o.x += o.vx;
      o.y += o.vy;
      o.pulse += 0.055;
      o.hue = o.r > player.r * 0.85 ? 270 + 40 : 170 + 30;

      if (o.x < -80 || o.x > W + 80 || o.y < -80 || o.y > H + 80) { o.alive = false; continue; }

      const dx = o.x - player.x, dy = o.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < player.r + o.r - 4) {
        if (o.r < player.r * 0.92) {
          player.r = Math.min(85, player.r + o.r * 0.13);
          score += Math.ceil(o.r * 1.2);
          scoreEl.textContent = score;
          emitSparks(o.x, o.y, 14, 175);
          o.alive = false;
        } else if (o.r > player.r * 1.12) {
          endGame(); return;
        }
      }
    }
    orbs = orbs.filter(o => o.alive);

    // Sparks
    for (const s of sparks) {
      s.x += s.vx; s.y += s.vy;
      s.vx *= 0.94; s.vy *= 0.94;
      s.life -= s.decay;
    }
    sparks = sparks.filter(s => s.life > 0);
  }

  // ─── Draw ─────────────────────────────────────────────────────────────────────

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // BG
    ctx.fillStyle = '#03030a';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(0,229,255,0.04)';
    ctx.lineWidth = 1;
    const gs = 44;
    for (let x = 0; x < W; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Player trail
    for (let i = 0; i < player.trail.length; i++) {
      const t = i / player.trail.length;
      const pt = player.trail[i];
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, player.r * t * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,229,255,${t * 0.08})`;
      ctx.fill();
    }

    // Orbs
    for (const o of orbs) {
      const larger = o.r > player.r * 0.85;
      const gHue   = larger ? 275 : 175;
      const pr = o.r + Math.sin(o.pulse) * 1.8;

      // Soft glow
      const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, pr * 2.4);
      g.addColorStop(0, `hsla(${gHue},100%,65%,0.28)`);
      g.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(o.x, o.y, pr * 2.4, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();

      // Core
      ctx.beginPath(); ctx.arc(o.x, o.y, pr, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${gHue},90%,68%)`;
      ctx.fill();

      // Threat ring for large orbs
      if (larger) {
        ctx.beginPath(); ctx.arc(o.x, o.y, pr + 4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(180,0,255,${0.25 + Math.sin(o.pulse) * 0.15})`;
        ctx.lineWidth = 1.5; ctx.stroke();
      }
    }

    // Sparks
    for (const s of sparks) {
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue},100%,70%,${s.life})`;
      ctx.fill();
    }

    // Player glow
    const pg = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, player.r * 2.8);
    pg.addColorStop(0, 'rgba(0,229,255,0.22)');
    pg.addColorStop(1, 'transparent');
    ctx.beginPath(); ctx.arc(player.x, player.y, player.r * 2.8, 0, Math.PI * 2);
    ctx.fillStyle = pg; ctx.fill();

    // Player outer ring
    ctx.beginPath(); ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
    ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 2.5; ctx.stroke();

    // Player inner fill
    ctx.beginPath(); ctx.arc(player.x, player.y, player.r * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,229,255,0.25)'; ctx.fill();

    // Player pulse ring
    const pulseFade = (Math.sin(player.pulse) + 1) * 0.5;
    ctx.beginPath(); ctx.arc(player.x, player.y, player.r * (1.15 + pulseFade * 0.3), 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0,229,255,${0.15 * pulseFade})`;
    ctx.lineWidth = 2; ctx.stroke();
  }

  // ─── Loop ────────────────────────────────────────────────────────────────────

  function loop(ts) {
    const dt = Math.min(ts - lastT, 50);
    lastT = ts;
    update(dt);
    draw();
    if (running) animId = requestAnimationFrame(loop);
  }

  // ─── Start / End ─────────────────────────────────────────────────────────────

  function startGame() {
    Object.assign(player, { x: W / 2, y: H / 2, r: 22, vx: 0, vy: 0, trail: [], mouseX: null });
    orbs = []; sparks = []; score = 0;
    scoreEl.textContent = '0';
    spawnTimer = 600;
    overlay.style.display = 'none';
    running = true;
    for (let i = 0; i < 6; i++) spawnOrb();
    lastT = performance.now();
    animId = requestAnimationFrame(loop);
  }

  function endGame() {
    running = false;
    cancelAnimationFrame(animId);
    overlay.innerHTML = `
      <h3 style="color:var(--accent)">ABSORBED</h3>
      <p style="color:var(--dim)">Final score: <span style="color:var(--accent)">${score}</span></p>
      <p style="color:var(--dim)">You were eaten.</p>
      <button class="start-btn" id="retry-btn">Try Again</button>
    `;
    overlay.style.display = 'flex';
    document.getElementById('retry-btn').addEventListener('click', startGame);
  }

  startBtn.addEventListener('click', startGame);

  // Draw idle state
  draw();

})();
