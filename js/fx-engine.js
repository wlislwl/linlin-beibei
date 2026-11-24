/**
 * 炫酷特效引擎（参考 romantic-gift-web / romantic-animations / 告白气球 思路）
 * - 星空闪烁 + 流星
 * - 樱花/花瓣雨
 * - 鼠标/触摸爱心拖尾
 * - 点击爱心爆炸
 * - 放飞气球
 * - 增强烟花（牡丹 / 柳絮 / 心形）
 */
(function () {
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const HEARTS = ['❤', '♥', '💖', '💕', '💗', '✨'];
  const COLORS = ['#e8a0bf', '#ff6b9d', '#f0c4a8', '#f3d5e0', '#ffd6a5', '#c77dff', '#ff8fab', '#ffc2d1'];

  function ensureCanvas(id, z) {
    let c = document.getElementById(id);
    if (!c) {
      c = document.createElement('canvas');
      c.id = id;
      c.className = 'fx-canvas';
      c.style.cssText = `position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:${z || 1};`;
      document.body.prepend(c);
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;
    c.width = Math.floor(W * dpr);
    c.height = Math.floor(H * dpr);
    const ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { canvas: c, ctx, W, H, dpr };
  }

  /** 星空 + 流星 + 花瓣环境层 */
  function startAmbient(opts) {
    opts = opts || {};
    const density = opts.density || 1;
    const { canvas, ctx } = ensureCanvas('fx-ambient', 1);
    let W = window.innerWidth;
    let H = window.innerHeight;
    const isMobile = W < 768;
    const starN = Math.floor((isMobile ? 60 : 110) * density);
    const petalN = Math.floor((isMobile ? 14 : 26) * density);

    const stars = Array.from({ length: starN }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: rand(0.4, 1.8),
      a: rand(0.2, 0.95),
      tw: rand(0.01, 0.04),
      phase: Math.random() * Math.PI * 2
    }));

    const petals = Array.from({ length: petalN }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      s: rand(8, 18),
      vy: rand(0.4, 1.4),
      vx: rand(-0.4, 0.4),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.03, 0.03),
      color: pick(['rgba(255,182,193,0.75)', 'rgba(255,192,203,0.65)', 'rgba(255,160,180,0.55)', 'rgba(243,213,224,0.5)'])
    }));

    let meteors = [];
    let running = true;
    let lastMeteor = 0;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener('resize', resize);

    function spawnMeteor() {
      meteors.push({
        x: rand(W * 0.1, W * 0.95),
        y: rand(-20, H * 0.35),
        vx: rand(-6, -3),
        vy: rand(3, 6),
        life: 1,
        len: rand(60, 120)
      });
    }

    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(p.s * 0.5, p.s * 0.2, 0, p.s);
      ctx.quadraticCurveTo(-p.s * 0.5, p.s * 0.2, 0, 0);
      ctx.fill();
      ctx.restore();
    }

    function frame(t) {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);

      // stars
      for (const s of stars) {
        s.phase += s.tw;
        const a = s.a * (0.55 + 0.45 * Math.sin(s.phase));
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,240,250,${a})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // meteors
      if (t - lastMeteor > 2800 + Math.random() * 2500) {
        spawnMeteor();
        lastMeteor = t;
      }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life -= 0.016;
        const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 8, m.y - m.vy * 8);
        grad.addColorStop(0, `rgba(255,230,245,${Math.max(m.life, 0)})`);
        grad.addColorStop(1, 'rgba(255,230,245,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * (m.len / 8), m.y - m.vy * (m.len / 8));
        ctx.stroke();
        if (m.life <= 0 || m.y > H) meteors.splice(i, 1);
      }

      // petals
      for (const p of petals) {
        p.x += p.vx + Math.sin(t / 800 + p.s) * 0.3;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y > H + 20) {
          p.y = -20;
          p.x = Math.random() * W;
        }
        drawPetal(p);
      }

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running) requestAnimationFrame(frame);
    });

    return { stop: () => { running = false; } };
  }

  /** DOM 漂浮爱心（更密、更炫） */
  function startHeartRain(gapMs) {
    let layer = document.getElementById('heart-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'heart-layer';
      document.body.prepend(layer);
    }
    const gap = gapMs || 520;
    const id = setInterval(() => {
      const el = document.createElement('span');
      el.className = 'float-heart fancy-heart';
      el.textContent = pick(HEARTS);
      el.style.left = Math.random() * 100 + 'vw';
      el.style.fontSize = 14 + Math.random() * 22 + 'px';
      el.style.animationDuration = 5 + Math.random() * 6 + 's';
      el.style.filter = `hue-rotate(${Math.random() * 40}deg)`;
      layer.appendChild(el);
      setTimeout(() => el.remove(), 12000);
    }, gap);
    return () => clearInterval(id);
  }

  /** 鼠标/触摸爱心拖尾 */
  function startCursorTrail() {
    let last = 0;
    const spawn = (x, y) => {
      const now = performance.now();
      if (now - last < 40) return;
      last = now;
      const el = document.createElement('span');
      el.className = 'cursor-heart';
      el.textContent = pick(['❤', '✨', '💕']);
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.fontSize = 10 + Math.random() * 12 + 'px';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 900);
    };
    window.addEventListener('pointermove', (e) => spawn(e.clientX, e.clientY), { passive: true });
    window.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      if (t) spawn(t.clientX, t.clientY);
    }, { passive: true });
  }

  /** 点击爱心爆炸 */
  function startClickBurst() {
    window.addEventListener('pointerdown', (e) => {
      if (e.target.closest('a,button,input,textarea,.music-btn,.egg-btn,.gallery-bar,.keke-item,.place-card')) return;
      burstAt(e.clientX, e.clientY);
    });
  }

  function burstAt(x, y, count) {
    const n = count || 14;
    for (let i = 0; i < n; i++) {
      const el = document.createElement('span');
      el.className = 'burst-heart';
      el.textContent = pick(HEARTS);
      const angle = (Math.PI * 2 * i) / n + rand(-0.2, 0.2);
      const dist = 40 + Math.random() * 90;
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      el.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      el.style.fontSize = 12 + Math.random() * 16 + 'px';
      el.style.color = pick(COLORS);
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 900);
    }
  }

  /** 放飞气球（参考告白气球） */
  function releaseBalloons(amount) {
    const n = amount || Math.max(8, Math.floor(window.innerWidth / 90));
    const colors = [
      ['#ff9eb5', '#ff6b8a'],
      ['#ffc2d1', '#e8a0bf'],
      ['#c77dff', '#9b5de5'],
      ['#f0c4a8', '#e09f7d'],
      ['#a0e7e5', '#7bdff2']
    ];
    for (let i = 0; i < n; i++) {
      const pair = pick(colors);
      const b = document.createElement('div');
      b.className = 'fx-balloon';
      const size = 42 + Math.random() * 36;
      b.style.width = size + 'px';
      b.style.height = size * 1.25 + 'px';
      b.style.left = Math.random() * 100 + 'vw';
      b.style.setProperty('--c1', pair[0]);
      b.style.setProperty('--c2', pair[1]);
      b.style.animationDuration = 6 + Math.random() * 5 + 's';
      b.style.animationDelay = Math.random() * 0.8 + 's';
      b.innerHTML = '<i></i><s></s>';
      document.body.appendChild(b);
      setTimeout(() => b.remove(), 12000);
    }
  }

  /** 增强烟花引擎；opts.overlay=true 时不盖黑背景，可叠在当前页当彩蛋 */
  function createFireworks(canvas, opts) {
    opts = opts || {};
    const overlay = !!opts.overlay;
    const auto = opts.auto !== false && !overlay;
    const ctx = canvas.getContext('2d');
    let W, H, rockets = [], particles = [], running = true;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function launch(x) {
      rockets.push({
        x: x != null ? x : rand(W * 0.12, W * 0.88),
        y: H,
        vx: rand(-0.8, 0.8),
        vy: rand(-12.5, -8),
        color: pick(COLORS),
        kind: pick(['peony', 'willow', 'heart', 'ring'])
      });
    }

    function explode(r) {
      if (r.kind === 'heart') {
        for (let i = 0; i < 70; i++) {
          const t = (i / 70) * Math.PI * 2;
          // 心形参数方程
          const hx = 16 * Math.pow(Math.sin(t), 3);
          const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
          particles.push({
            x: r.x, y: r.y,
            vx: hx * 0.22 + rand(-0.3, 0.3),
            vy: hy * 0.22 + rand(-0.3, 0.3),
            life: 1, decay: rand(0.01, 0.02),
            color: r.color, size: rand(1.4, 2.8), gravity: 0.03, drag: 0.985
          });
        }
        return;
      }
      if (r.kind === 'ring') {
        for (let i = 0; i < 48; i++) {
          const a = (Math.PI * 2 * i) / 48;
          const sp = 3.8;
          particles.push({
            x: r.x, y: r.y,
            vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
            life: 1, decay: 0.014, color: r.color, size: 2.2, gravity: 0.02, drag: 0.99
          });
        }
        return;
      }
      const n = r.kind === 'willow' ? 90 : 70;
      for (let i = 0; i < n; i++) {
        const a = rand(0, Math.PI * 2);
        const sp = r.kind === 'willow' ? rand(1.2, 4.5) : rand(1.5, 5.8);
        particles.push({
          x: r.x, y: r.y,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          life: 1,
          decay: r.kind === 'willow' ? rand(0.008, 0.016) : rand(0.012, 0.024),
          color: Math.random() > 0.3 ? r.color : pick(COLORS),
          size: rand(1.3, 3.4),
          gravity: r.kind === 'willow' ? 0.055 : 0.035,
          drag: r.kind === 'willow' ? 0.97 : 0.985
        });
      }
    }

    function burstShow() {
      for (let i = 0; i < 6; i++) setTimeout(() => launch(), i * 160);
    }

    function frame() {
      if (!running) return;
      if (overlay) {
        // 透明叠层：只擦淡粒子残影，不盖黑页面
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';
      } else {
        ctx.fillStyle = 'rgba(5,4,10,0.2)';
        ctx.fillRect(0, 0, W, H);
      }

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += r.vx; r.y += r.vy; r.vy += 0.055;
        ctx.beginPath();
        ctx.fillStyle = r.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = r.color;
        ctx.arc(r.x, r.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // trail
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillRect(r.x - 0.5, r.y + 4, 1, 8);
        if (r.vy >= -1 || r.y < H * 0.22) {
          explode(r);
          rockets.splice(i, 1);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx *= p.drag; p.vy *= p.drag;
        p.vy += p.gravity;
        p.x += p.vx; p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      requestAnimationFrame(frame);
    }

    let timer = null;
    if (auto) {
      burstShow();
      timer = setInterval(burstShow, 2800);
    }
    frame();

    if (!overlay) {
      canvas.addEventListener('click', (e) => launch(e.clientX));
    }

    return {
      boom: burstShow,
      launch,
      stop: () => { running = false; if (timer) clearInterval(timer); }
    };
  }

  /** 两侧彩蛋图标：左气球、右烟花，点击就地触发，不跳转 */
  function mountEggs() {
    if (document.getElementById('egg-balloon')) return;

    const left = document.createElement('button');
    left.id = 'egg-balloon';
    left.type = 'button';
    left.className = 'egg-btn egg-left';
    left.title = '彩蛋：放飞气球';
    left.setAttribute('aria-label', '放飞气球');
    left.textContent = '🎈';

    const right = document.createElement('button');
    right.id = 'egg-fireworks';
    right.type = 'button';
    right.className = 'egg-btn egg-right';
    right.title = '彩蛋：放烟花';
    right.setAttribute('aria-label', '放烟花');
    right.textContent = '🎆';

    document.body.appendChild(left);
    document.body.appendChild(right);

    // 透明烟花层（默认空转，点击才 boom）
    let fwCanvas = document.getElementById('fx-fireworks-egg');
    if (!fwCanvas) {
      fwCanvas = document.createElement('canvas');
      fwCanvas.id = 'fx-fireworks-egg';
      fwCanvas.className = 'fx-canvas';
      fwCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:34;';
      document.body.appendChild(fwCanvas);
    }
    const fw = createFireworks(fwCanvas, { overlay: true, auto: false });

    left.addEventListener('click', (e) => {
      e.stopPropagation();
      FX.releaseBalloons(16);
      FX.burstAt(e.clientX, e.clientY, 14);
      left.classList.add('pop');
      setTimeout(() => left.classList.remove('pop'), 400);
    });

    right.addEventListener('click', (e) => {
      e.stopPropagation();
      fw.boom();
      FX.burstAt(e.clientX, e.clientY, 16);
      right.classList.add('pop');
      setTimeout(() => right.classList.remove('pop'), 400);
    });
  }

  /** 一键挂上整站炫酷特效 */
  function mountPretty(level) {
    // level: 'full' | 'soft'
    const soft = level === 'soft';
    startAmbient({ density: soft ? 0.7 : 1 });
    startHeartRain(soft ? 900 : 520);
    if (!soft) {
      startCursorTrail();
      startClickBurst();
    }
  }

  window.FX = {
    startAmbient,
    startHeartRain,
    startCursorTrail,
    startClickBurst,
    burstAt,
    releaseBalloons,
    createFireworks,
    mountPretty,
    mountEggs
  };
})();
