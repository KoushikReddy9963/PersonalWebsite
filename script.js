(() => {
  'use strict';
  const root = document.documentElement;
  const toggleBtn = document.getElementById('toggle-btn');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const year = document.getElementById('current-year');
  const storedTheme = (() => {
    try { return localStorage.getItem('portfolio-theme'); } catch (_) { return null; }
  })();
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const setTheme = (theme) => {
    const dark = theme === 'dark';
    root.dataset.theme = dark ? 'dark' : 'light';
    document.body.classList.toggle('dark-mode', dark);
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-pressed', String(dark));
      toggleBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      toggleBtn.innerHTML = '<span aria-hidden="true">' + (dark ? '☀' : '☾') + '</span>';
    }
    if (themeColor) themeColor.setAttribute('content', dark ? '#11131b' : '#f8f9fa');
  };
  setTheme(storedTheme === 'dark' || (!storedTheme && prefersDark) ? 'dark' : 'light');
  if (toggleBtn) toggleBtn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('portfolio-theme', next); } catch (_) { /* Storage can be disabled. */ }
  });
  if (year) year.textContent = String(new Date().getFullYear());
  const nav = document.getElementById('navbarNav');
  if (nav && window.bootstrap) {
    nav.querySelectorAll('a.nav-link').forEach((link) => link.addEventListener('click', () => {
      if (window.innerWidth < 992) window.bootstrap.Collapse.getOrCreateInstance(nav).hide();
    }));
  }
})();