// INT MAIN VIBE -- main.js (lightweight, no parallax)

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
