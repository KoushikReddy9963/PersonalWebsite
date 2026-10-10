const toggleBtn = document.getElementById('toggle-btn');
const bioBtn = document.getElementById('bio-btn');
const bioDetails = document.getElementById('bio-details');

if (toggleBtn) {
  toggleBtn.setAttribute('aria-label', 'Toggle dark mode');
  toggleBtn.addEventListener('click', () => {
    const dark = document.body.classList.toggle('dark-mode');
    toggleBtn.textContent = dark ? '☀' : '☾';
    toggleBtn.setAttribute('aria-pressed', String(dark));
  });
}
if (bioBtn && bioDetails) {
  bioBtn.setAttribute('aria-controls', 'bio-details');
  bioBtn.setAttribute('aria-expanded', 'false');
  bioBtn.addEventListener('click', () => {
    const isHidden = getComputedStyle(bioDetails).display === 'none';
    bioDetails.style.display = isHidden ? 'block' : 'none';
    bioDetails.style.opacity = isHidden ? '1' : '0';
    bioBtn.setAttribute('aria-expanded', String(isHidden));
    bioBtn.textContent = isHidden ? 'Hide Bio' : 'Show Bio';
  });
}
const motionTargets = document.querySelectorAll('#about h1, #experience .card, #projects .card, #coding .row, #contact .row, #social-media .container');
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('motion-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    motionTargets.forEach((element) => observer.observe(element));
  } else {
    motionTargets.forEach((element) => element.classList.add('motion-in'));
  }
}
