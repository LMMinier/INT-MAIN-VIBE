/* INT MAIN VIBE — main.js
   Parallax engine + scroll reveal + per-story accent injection
*/

// --- PER-STORY ACCENT COLORS ----------------------------
const stories = document.querySelectorAll('.story');
stories.forEach(story => {
  const accentColor = story.dataset.accent;
  if (!accentColor) return;
  story.querySelectorAll('.accent').forEach(el => el.style.color = accentColor);
  const openQ = story.querySelector('.open-q');
  if (openQ) openQ.style.borderColor = accentColor;
  const bar = story.querySelector('.accent-bar');
  if (bar) bar.style.background = accentColor;
  const quote = story.querySelector('.story-quote');
  if (quote) quote.style.setProperty('--story-accent', accentColor);
});

// --- PARALLAX ENGINE ------------------------------------
const parallaxSections = document.querySelectorAll('.parallax-section');
let ticking = false;

function updateParallax() {
  const scrollY = window.scrollY;
  parallaxSections.forEach(section => {
    const bg = section.querySelector('.parallax-bg');
    if (!bg) return;
    const speed = parseFloat(section.dataset.speed || 0.2);
    const rect = section.getBoundingClientRect();
    const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
    bg.style.transform = `translateY(${centerOffset * speed}px)`;
  });
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
}, { passive: true });

updateParallax();

// --- SCROLL REVEAL ---------------------------------------
const revealEls = document.querySelectorAll(
  '.story-meta, .story-headline, .story-deck, .stat-row, .story-quote, .open-q, .hero-headline, .hero-sub, .issue-tag'
);

revealEls.forEach((el, i) => {
  el.classList.add('reveal');
  const delay = i % 5;
  if (delay === 1) el.classList.add('reveal-delay-1');
  if (delay === 2) el.classList.add('reveal-delay-2');
  if (delay === 3) el.classList.add('reveal-delay-3');
  if (delay === 4) el.classList.add('reveal-delay-4');
});

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
);

revealEls.forEach(el => revealObserver.observe(el));

// --- NAV ACTIVE HIGHLIGHT --------------------------------
const navLinks = document.querySelectorAll('.nav-links a');
const sectionEls = ['hero','models','jobs','money','ethics','trust']
  .map(id => document.getElementById(id)).filter(Boolean);

const navObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.style.color = '');
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.style.color = 'var(--color-ink)';
      }
    });
  },
  { threshold: 0.4 }
);

sectionEls.forEach(el => navObserver.observe(el));
