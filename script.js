document.documentElement.classList.add('js');

// ---- Reveal on scroll (IntersectionObserver: no scroll handler, no jank) ----
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// ---- Scroll progress + nav behavior: one passive listener, batched in rAF ----
const bar = document.getElementById('progress');
const nav = document.getElementById('nav');
let lastY = 0, ticking = false;

function update() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  nav.classList.toggle('scrolled', y > 20);
  nav.classList.toggle('hidden', y > lastY && y > 400);
  lastY = y;
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) { ticking = true; requestAnimationFrame(update); }
}, { passive: true });
update();

// ---- Theme toggle ----
const root = document.documentElement;
document.getElementById('theme').addEventListener('click', () => {
  const isLight = (root.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')) === 'light';
  const next = isLight ? 'dark' : 'light';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
});

// ---- Count-up stats (rAF, runs once when scrolled into view) ----
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const countIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    countIO.unobserve(e.target);
    const el = e.target, to = +el.dataset.to, dur = 1400;
    if (reduce) { el.textContent = to; return; }
    const t0 = performance.now();
    (function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4))); // ease-out
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-to]').forEach((el) => countIO.observe(el));

// ---- Skill filter tabs: fade out, swap, fade in ----
const tabs = document.getElementById('tabs');
const grid = document.getElementById('skills-grid');
let swapTimer;
tabs.addEventListener('click', (ev) => {
  const btn = ev.target.closest('.tab');
  if (!btn || btn.classList.contains('active')) return;
  tabs.querySelectorAll('.tab').forEach((t) => {
    const on = t === btn;
    t.classList.toggle('active', on);
    t.setAttribute('aria-pressed', on);
  });
  const f = btn.dataset.filter;
  clearTimeout(swapTimer);
  grid.classList.add('swap');
  swapTimer = setTimeout(() => {
    grid.querySelectorAll('.skill-group').forEach((g) => {
      g.hidden = !(f === 'all' || g.dataset.cat === f);
    });
    grid.classList.remove('swap');
  }, reduce ? 0 : 220);
});

document.getElementById('year').textContent = new Date().getFullYear();
