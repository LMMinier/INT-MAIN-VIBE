/* INT MAIN VIBE -- main.js */

// Per-story accent injection
const stories = document.querySelectorAll('.story');
stories.forEach(story => {
  const accent = story.dataset.accent;
  if (!accent) return;
  story.querySelectorAll('.accent').forEach(el => el.style.color = accent);
  const openQ = story.querySelector('.open-q');
  if (openQ) openQ.style.borderColor = accent;
  const bar = story.querySelector('.accent-bar');
  if (bar) bar.style.background = accent;
});

// Parallax engine
const parallaxSections = document.querySelectorAll('.parallax-section');
let ticking = false;
function updateParallax() {
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

// Scroll reveal
const revealSelectors = [
  '.story-meta', '.story-headline', '.story-deck',
  '.company-grid', '.stat-row', '.analysis-block',
  '.pullquote-row', '.story-quote', '.open-q',
  '.hero-headline', '.hero-sub', '.issue-tag', '.hero-byline'
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
  { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);
revealEls.forEach(el => revealObs.observe(el));

// Nav active state
const navLinks = document.querySelectorAll('.nav-links a');
const sections = ['hero','models','capital','jobs','ethics','trust']
  .map(id => document.getElementById(id)).filter(Boolean);
const navObs = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const a = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (a) a.classList.add('active');
    }
  }),
  { threshold: 0.4 }
);
sections.forEach(s => navObs.observe(s));
