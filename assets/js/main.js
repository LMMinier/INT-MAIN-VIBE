// INT MAIN VIBE -- main.js

// Per-story accent injection
document.querySelectorAll('.story').forEach(story => {
  const accent = story.dataset.accent;
  if (!accent) return;
  story.querySelectorAll('.accent').forEach(el => el.style.color = accent);
  const openQ = story.querySelector('.open-q');
  if (openQ) openQ.style.borderColor = accent;
  const bar = story.querySelector('.accent-bar');
  if (bar) bar.style.background = accent;
});

// ── SCROLL PROGRESS BAR ────────────────────────────────────────────────────
const progressBar = document.getElementById('scroll-progress');
function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (progressBar) progressBar.style.width = pct + '%';
}

// ── PARALLAX ENGINE ────────────────────────────────────────────────────────
const parallaxSections = document.querySelectorAll('[data-speed]');
function updateParallax() {
  parallaxSections.forEach(sec => {
    const bg = sec.querySelector('.parallax-bg');
    if (!bg) return;
    const speed = parseFloat(sec.dataset.speed) || 0.2;
    const rect = sec.getBoundingClientRect();
    const centerOffset = (rect.top + rect.height / 2 - window.innerHeight / 2);
    bg.style.transform = `translateY(${centerOffset * speed}px)`;
  });
}

// ── STORY NAV DOTS ─────────────────────────────────────────────────────────
const storyDefs = [
  { id: 'hero',       label: 'INTRO' },
  { id: 'fable',      label: '01 FABLE 5' },
  { id: 'capital',    label: '02 CAPITAL' },
  { id: 'jobs',       label: '03 JOBS' },
  { id: 'ethics',     label: '04 ETHICS' },
  { id: 'trust',      label: '05 TRUST' },
  { id: 'suspension', label: '06 72 HRS' },
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

// ── LIVE CLOCK ─────────────────────────────────────────────────────────────
const clockEl = document.getElementById('live-clock');
function updateClock() {
  if (!clockEl) return;
  const now = new Date();
  const time = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);
  const date = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', year: 'numeric' }).format(now);
  clockEl.innerHTML = `<span>LIVE</span> &nbsp;${date} &nbsp;${time} ET`;
}
setInterval(updateClock, 1000);
updateClock();

// ── SHARE BUTTONS ─────────────────────────────────────────────────────────
document.querySelectorAll('.share-btn[data-action]').forEach(btn => {
  btn.addEventListener('click', function() {
    const action = this.dataset.action;
    const title = 'INT MAIN VIBE — AI & Tech Brief, June 2026 by @wheresmaicol';
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

// ── SCROLL REVEAL ─────────────────────────────────────────────────────────
const revealSelectors = [
  '.story-meta', '.story-headline', '.story-deck',
  '.company-grid', '.stat-row', '.analysis-block',
  '.pullquote-row', '.story-quote', '.open-q',
  '.hero-headline', '.hero-sub', '.issue-tag', '.hero-byline',
  '.story-infographic', '.reading-time-badge', '.share-widget'
];
const revealEls = document.querySelectorAll(revealSelectors.join(', '));
revealEls.forEach((el, i) => {
  el.classList.add('reveal');
  const d = i % 5;
  if (d === 1) el.classList.add('reveal-delay-1');
  if (d === 2) el.classList.add('reveal-delay-2');
  if (d === 3) el.classList.add('reveal-delay-3');
  if (d === 4) el.classList.add('reveal-delay-4');
});
const revealObs = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  }),
  { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
);
revealEls.forEach(el => revealObs.observe(el));

// ── NAV HIDE ON SCROLL ────────────────────────────────────────────────────
let lastScroll = 0;
const nav = document.getElementById('site-nav');

// ── SCROLL HANDLER ────────────────────────────────────────────────────────
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateProgress();
      updateParallax();
      updateDots();
      const curr = window.scrollY;
      if (nav) nav.style.transform = curr > lastScroll && curr > 120 ? 'translateY(-100%)' : 'translateY(0)';
      lastScroll = curr;
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

// Init
updateProgress();
updateParallax();
updateDots();

// Nav active state
const navLinks = document.querySelectorAll('.nav-links a');
const navSections = storyDefs.map(s => document.getElementById(s.id)).filter(Boolean);
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
navSections.forEach(s => navObs.observe(s));
