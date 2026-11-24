/**
 * 全站特效：漂浮爱心、音乐、灯箱、在一起天数
 */
(function () {
  const HEARTS = ['❤', '♥', '♡', '💕'];

  /** 启动漂浮爱心；density 越小越稀 */
  function startHearts(density) {
    let layer = document.getElementById('heart-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'heart-layer';
      document.body.prepend(layer);
    }
    const gap = density || 900;
    setInterval(() => {
      const el = document.createElement('span');
      el.className = 'float-heart';
      el.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
      el.style.left = Math.random() * 100 + 'vw';
      el.style.fontSize = 12 + Math.random() * 18 + 'px';
      el.style.animationDuration = 6 + Math.random() * 7 + 's';
      layer.appendChild(el);
      setTimeout(() => el.remove(), 14000);
    }, gap);
  }

  /** 右下角音乐按钮（需用户点击后播放） */
  function setupMusic(src) {
    const path = src || (window.SITE_CONFIG && window.SITE_CONFIG.musicSrc) || 'assets/music/bgm.mp3';
    const audio = new Audio(path);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0.45;

    const btn = document.createElement('button');
    btn.className = 'music-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', '背景音乐');
    btn.title = '点击播放 / 暂停背景音乐';
    btn.innerHTML = '♪';
    document.body.appendChild(btn);

    let available = true;
    let playing = false;

    audio.addEventListener('error', () => {
      available = false;
      btn.title = '暂无音乐（请放入 assets/music/bgm.mp3）';
      btn.innerHTML = '🔇';
      btn.classList.remove('playing');
    });

    // 探测文件是否存在
    fetch(path, { method: 'HEAD' })
      .then((r) => {
        if (!r.ok) throw new Error('missing');
        available = true;
        btn.innerHTML = '♪';
        btn.title = '点击播放 / 暂停背景音乐';
      })
      .catch(() => {
        available = false;
        btn.title = '暂无音乐（请放入 assets/music/bgm.mp3）';
        btn.innerHTML = '🔇';
      });

    btn.addEventListener('click', async () => {
      if (!available) return;
      try {
        if (playing) {
          audio.pause();
          playing = false;
          btn.classList.remove('playing');
          btn.innerHTML = '♪';
        } else {
          await audio.play();
          playing = true;
          btn.classList.add('playing');
          btn.innerHTML = '♫';
        }
      } catch (e) {
        btn.title = '浏览器限制自动播放，请再点一次';
      }
    });
  }

  /** 通用图片灯箱 */
  function setupLightbox() {
    let box = document.getElementById('site-lightbox');
    if (!box) {
      box = document.createElement('div');
      box.id = 'site-lightbox';
      box.className = 'lightbox';
      box.innerHTML = '<img alt="预览">';
      document.body.appendChild(box);
      box.addEventListener('click', () => box.classList.remove('open'));
    }
    window.openLightbox = function (src) {
      box.querySelector('img').src = src;
      box.classList.add('open');
    };
  }

  /** 含当天的在一起天数 */
  function togetherDays(startStr) {
    const start = new Date(startStr || '2025-01-01');
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const now = new Date();
    const t = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.max(1, Math.floor((t - s) / 86400000) + 1);
  }

  /** 下一个纪念日倒计时（每年 1 月 1 日） */
  function nextAnniversaryCountdown(startStr) {
    const start = new Date(startStr || '2025-01-01');
    const now = new Date();
    let next = new Date(now.getFullYear(), start.getMonth(), start.getDate());
    if (now >= next) next = new Date(now.getFullYear() + 1, start.getMonth(), start.getDate());
    const diff = next - now;
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000)
    };
  }

  /** 时间轴滚动显现 */
  function observeReveal(selector) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible');
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(selector).forEach((el) => io.observe(el));
  }

  window.SiteFX = {
    startHearts,
    setupMusic,
    setupLightbox,
    togetherDays,
    nextAnniversaryCountdown,
    observeReveal
  };
})();
