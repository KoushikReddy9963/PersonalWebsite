(() => {
    'use strict';

    const $ = (selector, context = document) => context.querySelector(selector);
    const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

    const root = document.documentElement;
    const body = document.body;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const hasObserver = 'IntersectionObserver' in window;

    /* ------------------------------------------------------------------
     * Theme (light / dark)
     * The initial theme is decided by inline scripts in index.html before
     * first paint. Here we keep the button, <html data-bs-theme> and
     * localStorage in sync. Glyphs are unchanged: sun in light, cloud in dark.
     * ------------------------------------------------------------------ */
    const toggleBtn = $('#toggle-btn');
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const readStoredTheme = () => {
        try {
            return localStorage.getItem('theme');
        } catch (e) {
            return null;
        }
    };

    const storeTheme = (theme) => {
        try {
            localStorage.setItem('theme', theme);
        } catch (e) { /* storage unavailable: preference lasts for this visit only */ }
    };

    const applyTheme = (dark) => {
        body.classList.toggle('dark-mode', dark);
        root.setAttribute('data-bs-theme', dark ? 'dark' : 'light');
        if (toggleBtn) {
            toggleBtn.textContent = dark ? '☁' : '☀';
            toggleBtn.setAttribute('aria-pressed', String(dark));
            toggleBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
        }
        document.dispatchEvent(new CustomEvent('themechange', { detail: { dark } }));
    };

    applyTheme(body.classList.contains('dark-mode'));

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const dark = !body.classList.contains('dark-mode');
            applyTheme(dark);
            storeTheme(dark ? 'dark' : 'light');
        });
    }

    // Follow the OS setting live, but only until the visitor makes an explicit choice.
    const onSystemThemeChange = (event) => {
        if (!readStoredTheme()) {
            applyTheme(event.matches);
        }
    };
    if (darkQuery.addEventListener) {
        darkQuery.addEventListener('change', onSystemThemeChange);
    } else if (darkQuery.addListener) {
        darkQuery.addListener(onSystemThemeChange);
    }

    /* ------------------------------------------------------------------
     * Show / hide bio
     * ------------------------------------------------------------------ */
    const bioBtn = $('#bio-btn');
    const bioDetails = $('#bio-details');
    if (bioBtn && bioDetails) {
        bioBtn.addEventListener('click', () => {
            const open = bioDetails.classList.toggle('is-open');
            bioBtn.setAttribute('aria-expanded', String(open));
            bioBtn.textContent = open ? 'Hide Bio' : 'Show Bio';
            bioDetails.setAttribute('aria-hidden', String(!open));
        });
    }

    /* ------------------------------------------------------------------
     * Footer year
     * ------------------------------------------------------------------ */
    const yearEl = $('#year');
    if (yearEl) {
        yearEl.textContent = String(new Date().getFullYear());
    }

    /* ------------------------------------------------------------------
     * Scroll progress bar
     * ------------------------------------------------------------------ */
    const progressBar = $('.scroll-progress');
    if (progressBar) {
        let progressQueued = false;
        const updateProgress = () => {
            progressQueued = false;
            const scrollable = root.scrollHeight - root.clientHeight;
            const ratio = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
            progressBar.style.setProperty('--p', ratio.toFixed(4));
        };
        const queueProgress = () => {
            if (!progressQueued) {
                progressQueued = true;
                window.requestAnimationFrame(updateProgress);
            }
        };
        window.addEventListener('scroll', queueProgress, { passive: true });
        window.addEventListener('resize', queueProgress);
        updateProgress();
    }

    /* ------------------------------------------------------------------
     * Mobile menu: close it after choosing a link. The navbar is sticky and
     * in normal flow, so collapsing it shifts the page. To avoid landing in
     * the wrong place, wait for the menu to finish closing, then scroll.
     * ------------------------------------------------------------------ */
    const navCollapse = $('#navbarNav');
    if (navCollapse) {
        $$('.nav-link', navCollapse).forEach((link) => {
            link.addEventListener('click', (event) => {
                if (!navCollapse.classList.contains('show') || !window.bootstrap) {
                    return;
                }
                const hash = link.getAttribute('href') || '';
                const target = hash.length > 1 && hash.charAt(0) === '#' ? $(hash) : null;
                if (!target) {
                    return;
                }
                event.preventDefault();
                navCollapse.addEventListener('hidden.bs.collapse', () => {
                    target.scrollIntoView();
                    if (window.history && window.history.pushState && window.location.hash !== hash) {
                        window.history.pushState(null, '', hash);
                    }
                }, { once: true });
                window.bootstrap.Collapse.getOrCreateInstance(navCollapse).hide();
            });
        });
    }

    /* ------------------------------------------------------------------
     * Scroll reveal (3D fade-in). Content stays visible without JS or
     * IntersectionObserver, and when reduced motion is requested.
     * ------------------------------------------------------------------ */
    $$('[data-stagger]').forEach((group) => {
        Array.from(group.children).forEach((child, index) => {
            child.style.setProperty('--d', `${index * 90}ms`);
        });
    });

    const revealTargets = $$('.reveal');
    if (!hasObserver || reducedMotion.matches) {
        revealTargets.forEach((el) => el.classList.add('is-visible'));
    } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        revealTargets.forEach((el) => revealObserver.observe(el));
    }

    /* ------------------------------------------------------------------
     * 3D tilt on cards and the profile photo (mouse / pen only)
     * ------------------------------------------------------------------ */
    if (!reducedMotion.matches && finePointer.matches) {
        const MAX_TILT = 7;
        $$('.tilt').forEach((el) => {
            let frame = 0;

            el.addEventListener('pointermove', (event) => {
                if (event.pointerType === 'touch') {
                    return;
                }
                const rect = el.getBoundingClientRect();
                const px = (event.clientX - rect.left) / rect.width;
                const py = (event.clientY - rect.top) / rect.height;
                window.cancelAnimationFrame(frame);
                frame = window.requestAnimationFrame(() => {
                    el.style.setProperty('--ry', `${((px - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`);
                    el.style.setProperty('--rx', `${((0.5 - py) * 2 * MAX_TILT).toFixed(2)}deg`);
                    el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
                    el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
                });
            });

            el.addEventListener('pointerleave', () => {
                window.cancelAnimationFrame(frame);
                el.style.setProperty('--rx', '0deg');
                el.style.setProperty('--ry', '0deg');
            });
        });
    }

    /* ------------------------------------------------------------------
     * Count-up numbers. The final value is already in the HTML, so this is
     * purely progressive enhancement.
     * ------------------------------------------------------------------ */
    const counters = $$('[data-count]');
    if (counters.length && hasObserver && !reducedMotion.matches) {
        const DURATION = 1400;
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

        const runCounter = (el) => {
            const target = parseFloat(el.dataset.count);
            const decimals = parseInt(el.dataset.decimals || '0', 10);
            if (Number.isNaN(target)) {
                return;
            }
            const start = performance.now();
            const tick = (now) => {
                const t = Math.min(1, (now - start) / DURATION);
                el.textContent = (target * easeOutCubic(t)).toFixed(decimals);
                if (t < 1) {
                    window.requestAnimationFrame(tick);
                } else {
                    el.textContent = target.toFixed(decimals);
                }
            };
            window.requestAnimationFrame(tick);
        };

        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    observer.unobserve(entry.target);
                    runCounter(entry.target);
                }
            });
        }, { threshold: 0.6 });
        counters.forEach((el) => counterObserver.observe(el));
    }

    /* ------------------------------------------------------------------
     * Contact form: the fields now have names, and the message is composed
     * into a mailto: link so the subject and body arrive filled in.
     * ------------------------------------------------------------------ */
    const contactForm = $('#contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const data = new FormData(contactForm);
            const name = String(data.get('name') || '').trim();
            const email = String(data.get('email') || '').trim();
            const message = String(data.get('message') || '').trim();
            const to = contactForm.dataset.to;
            if (!to) {
                return;
            }
            const subject = `Portfolio message from ${name}`;
            const text = `${message}\n\n${name} <${email}>`;
            window.location.href =
                `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
        });
    }

    /* ------------------------------------------------------------------
     * 3D point-sphere behind the About section (plain 2D canvas, no
     * dependencies). Slowly rotates, leans toward the pointer, follows the
     * current theme, pauses when off-screen or when the tab is hidden, and
     * renders a single static frame under prefers-reduced-motion.
     * ------------------------------------------------------------------ */
    const initHeroSphere = () => {
        const canvas = $('#hero-canvas');
        if (!canvas || !canvas.getContext) {
            return;
        }
        const ctx = canvas.getContext('2d');
        const host = canvas.parentElement;
        if (!ctx || !host) {
            return;
        }

        const POINT_COUNT = 110;
        const LINK_DISTANCE = 0.5;
        const CAMERA = 3;

        // Evenly spread points on a unit sphere (Fibonacci lattice).
        const base = [];
        const golden = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < POINT_COUNT; i++) {
            const y = 1 - (i / (POINT_COUNT - 1)) * 2;
            const ring = Math.sqrt(1 - y * y);
            const angle = golden * i;
            base.push([Math.cos(angle) * ring, y, Math.sin(angle) * ring]);
        }

        // The sphere is rigid, so neighbours never change: compute links once.
        const links = [];
        for (let i = 0; i < POINT_COUNT; i++) {
            for (let j = i + 1; j < POINT_COUNT; j++) {
                const dx = base[i][0] - base[j][0];
                const dy = base[i][1] - base[j][1];
                const dz = base[i][2] - base[j][2];
                if (Math.hypot(dx, dy, dz) < LINK_DISTANCE) {
                    links.push([i, j]);
                }
            }
        }

        const sx = new Float32Array(POINT_COUNT);
        const sy = new Float32Array(POINT_COUNT);
        const depth = new Float32Array(POINT_COUNT);

        let width = 0;
        let height = 0;
        let centerX = 0;
        let centerY = 0;
        let radius = 0;
        let strength = 1;

        let yawOffset = 0;
        let pitchOffset = 0;
        let targetYaw = 0;
        let targetPitch = 0;
        let spin = 0;
        let lastTime = 0;
        let frameId = 0;
        let running = false;
        let onScreen = false;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = host.clientWidth;
            height = host.clientHeight;
            canvas.width = Math.max(1, Math.round(width * dpr));
            canvas.height = Math.max(1, Math.round(height * dpr));
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const wide = width >= 992;
            centerX = width * (wide ? 0.78 : 0.5);
            centerY = height * 0.5;
            radius = Math.min(height * 0.46, width * (wide ? 0.3 : 0.4));
            strength = wide ? 0.55 : 0.3;
            draw();
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            const yaw = spin + yawOffset;
            const pitch = 0.35 + pitchOffset;
            const cosY = Math.cos(yaw);
            const sinY = Math.sin(yaw);
            const cosX = Math.cos(pitch);
            const sinX = Math.sin(pitch);

            for (let i = 0; i < POINT_COUNT; i++) {
                const [x, y, z] = base[i];
                const x1 = x * cosY + z * sinY;
                const z1 = -x * sinY + z * cosY;
                const y2 = y * cosX - z1 * sinX;
                const z2 = y * sinX + z1 * cosX;
                const scale = CAMERA / (CAMERA + z2);
                sx[i] = centerX + x1 * scale * radius;
                sy[i] = centerY + y2 * scale * radius;
                depth[i] = (1 - z2) / 2; // 1 = nearest, 0 = farthest
            }

            const rgb = body.classList.contains('dark-mode') ? '255, 255, 255' : '17, 17, 17';
            ctx.strokeStyle = `rgb(${rgb})`;
            ctx.fillStyle = `rgb(${rgb})`;
            ctx.lineWidth = 1;

            for (let k = 0; k < links.length; k++) {
                const a = links[k][0];
                const b = links[k][1];
                ctx.globalAlpha = 0.5 * strength * (0.15 + 0.85 * ((depth[a] + depth[b]) / 2));
                ctx.beginPath();
                ctx.moveTo(sx[a], sy[a]);
                ctx.lineTo(sx[b], sy[b]);
                ctx.stroke();
            }

            for (let i = 0; i < POINT_COUNT; i++) {
                ctx.globalAlpha = strength * (0.25 + 0.75 * depth[i]);
                ctx.beginPath();
                ctx.arc(sx[i], sy[i], 0.8 + 1.9 * depth[i], 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        };

        const frame = (now) => {
            if (!running) {
                return;
            }
            const dt = Math.min(64, now - lastTime);
            lastTime = now;
            spin += dt * 0.00018;
            yawOffset += (targetYaw - yawOffset) * 0.05;
            pitchOffset += (targetPitch - pitchOffset) * 0.05;
            draw();
            frameId = window.requestAnimationFrame(frame);
        };

        const start = () => {
            if (running || reducedMotion.matches || !onScreen || document.hidden) {
                return;
            }
            running = true;
            lastTime = performance.now();
            frameId = window.requestAnimationFrame(frame);
        };

        const stop = () => {
            running = false;
            window.cancelAnimationFrame(frameId);
        };

        host.addEventListener('pointermove', (event) => {
            if (event.pointerType === 'touch' || reducedMotion.matches) {
                return;
            }
            const rect = host.getBoundingClientRect();
            targetYaw = ((event.clientX - rect.left) / rect.width - 0.5) * 1.2;
            targetPitch = ((event.clientY - rect.top) / rect.height - 0.5) * 0.8;
        }, { passive: true });

        host.addEventListener('pointerleave', () => {
            targetYaw = 0;
            targetPitch = 0;
        });

        if ('ResizeObserver' in window) {
            new ResizeObserver(resize).observe(host);
        } else {
            window.addEventListener('resize', resize);
        }

        if (hasObserver) {
            new IntersectionObserver((entries) => {
                onScreen = entries.some((entry) => entry.isIntersecting);
                if (onScreen) {
                    start();
                } else {
                    stop();
                }
            }).observe(host);
        } else {
            onScreen = true;
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stop();
            } else {
                start();
            }
        });

        // Redraw immediately on theme change (matters when the loop is not running).
        document.addEventListener('themechange', draw);

        const onMotionPreferenceChange = () => {
            if (reducedMotion.matches) {
                stop();
                draw();
            } else {
                start();
            }
        };
        if (reducedMotion.addEventListener) {
            reducedMotion.addEventListener('change', onMotionPreferenceChange);
        }

        resize();
        start();
    };

    initHeroSphere();
})();
