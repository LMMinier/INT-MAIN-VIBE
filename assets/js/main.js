// INT MAIN VIBE -- main.js (lightweight, no parallax)

// ── IMMERSIVE HERO: constellation canvas + word cycler ─────────────────────
(function heroExperience() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // cycling accent word
  const cycleEl = document.getElementById('cycle-word');
  if (cycleEl && !reduce) {
    const words = ['IS RUNNING.', 'IS ACCELERATING.', 'IS UNGOVERNED.', 'IS HERE.'];
    let i = 0;
    setInterval(() => {
      cycleEl.classList.add('swap');
      setTimeout(() => {
        i = (i + 1) % words.length;
        cycleEl.textContent = words[i];
        cycleEl.classList.remove('swap');
      }, 300);
    }, 2600);
  }

  const canvas = document.getElementById('hero-canvas');
  if (!canvas || reduce) return;
  const ctx = canvas.getContext('2d');
  let w, h, dpr, nodes = [], raf = null, running = false;

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(90, Math.floor((w * h) / 16000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.6 + 0.6
    }));
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }
    // links
    for (let a = 0; a < nodes.length; a++) {
      for (let b = a + 1; b < nodes.length; b++) {
        const dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 16000) {
          const o = (1 - d2 / 16000) * 0.5;
          ctx.strokeStyle = `rgba(255,214,0,${o * 0.4})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[a].x, nodes[a].y);
          ctx.lineTo(nodes[b].x, nodes[b].y);
          ctx.stroke();
        }
      }
    }
    // dots
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(240,237,232,0.55)';
      ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!running) { running = true; frame(); } }
  function stop() { if (running) { running = false; cancelAnimationFrame(raf); } }

  size();
  start();
  window.addEventListener('resize', () => { size(); }, { passive: true });
  // pause when hero scrolls out of view (perf)
  new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? start() : stop()), { threshold: 0.02 })
    .observe(canvas);
})();


// Per-story accent injection
document.querySelectorAll('.story').forEach(story => {
  const accent = story.dataset.accent;
  if (!accent) return;
  story.querySelectorAll('.accent').forEach(el => el.style.color = accent);
  const openQ = story.querySelector('.open-q');
  if (openQ) openQ.style.borderColor = accent;
});

// ── SCROLL PROGRESS BAR ────────────────────────────────────────────────────
const progressBar = document.getElementById('scroll-progress');
function updateProgress() {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
  if (progressBar) progressBar.style.width = pct + '%';
}

// ── STORY NAV DOTS ─────────────────────────────────────────────────────────
const storyDefs = [
  { id: 'fable',      label: '01 FABLE 5' },
  { id: 'capital',    label: '02 CAPITAL' },
  { id: 'jobs',       label: '03 JOBS' },
  { id: 'ethics',     label: '04 ETHICS' },
  { id: 'trust',      label: '05 TRUST' },
  { id: 'suspension', label: '06 72 HRS' },
  { id: 'science',    label: '07 SCIENCE' },
];
const counterEl = document.getElementById('story-counter');
if (counterEl) {
  storyDefs.forEach(s => {
    const dot = document.createElement('div');
    dot.className = 'story-dot';
    dot.dataset.target = s.id;
    dot.dataset.label = s.label;
    dot.addEventListener('click', () => {
      const el = document.getElementById(s.id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
    counterEl.appendChild(dot);
  });
}
function updateDots() {
  const scrollMid = window.scrollY + window.innerHeight * 0.45;
  let active = null;
  storyDefs.forEach(s => {
    const el = document.getElementById(s.id);
    if (!el) return;
    if (scrollMid >= el.offsetTop && scrollMid < el.offsetTop + el.offsetHeight) active = s.id;
  });
  document.querySelectorAll('.story-dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.target === active);
  });
}

// ── SHARE BUTTONS ─────────────────────────────────────────────────────────
document.querySelectorAll('.share-btn[data-action]').forEach(btn => {
  btn.addEventListener('click', function() {
    const action = this.dataset.action;
    const title = 'INT MAIN VIBE — AI, Tech & Science Brief, June 2026 by @wheresmaicol';
    const url = window.location.href;
    if (action === 'copy') {
      navigator.clipboard.writeText(url).then(() => {
        this.textContent = '✓ COPIED';
        this.classList.add('copied');
        setTimeout(() => { this.textContent = '⊕ COPY LINK'; this.classList.remove('copied'); }, 2000);
      });
    } else if (action === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
    }
  });
});

// ── SCROLL REVEAL (cheap, one-shot) ────────────────────────────────────────
const revealEls = document.querySelectorAll('.story-meta, .story-headline, .story-deck, .plate, .ig, .open-q, .share-widget');
revealEls.forEach(el => el.classList.add('reveal'));
const revealObs = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  }),
  { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
);
revealEls.forEach(el => revealObs.observe(el));

// ── NAV HIDE ON SCROLL + handlers ──────────────────────────────────────────
const nav = document.getElementById('site-nav');
let lastScroll = 0, ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateProgress();
      updateDots();
      const curr = window.scrollY;
      if (nav) nav.style.transform = (curr > lastScroll && curr > 120) ? 'translateY(-100%)' : 'translateY(0)';
      lastScroll = curr;
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

updateProgress();
updateDots();

// Nav active state
const navLinks = document.querySelectorAll('.nav-links a');
const navObs = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const a = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (a) a.classList.add('active');
    }
  }),
  { threshold: 0.35 }
);
storyDefs.map(s => document.getElementById(s.id)).filter(Boolean).forEach(s => navObs.observe(s));
