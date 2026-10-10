# My Personal Website

Portfolio of **Yennam Sai Koushik Reddy**: <https://koushikreddyportfolio.vercel.app/>

A dependency-free static site (HTML, CSS, vanilla JS) styled with Bootstrap 5.3 from a CDN.

## Sections

About, Experience & Education, Technical Skills, Projects, Coding & Competitive Programming (with hackathons and
achievements), Contact, and Social links.

## Features

- Light and dark themes. The choice is remembered, and the first visit follows the OS setting.
- 3D touches layered on the original look: a rotating point-sphere behind the About section, pointer-driven card tilt,
  a 3D scroll reveal, and the original CSS cube.
- Respects `prefers-reduced-motion`: no auto-spin, tilt or scroll animation, and a single static sphere frame.
- Content stays fully readable without JavaScript (animations are progressive enhancement).
- Accessible by default: skip link, labelled controls, `aria-pressed` theme toggle, visible keyboard focus.
- Contact form composes a pre-filled `mailto:` message.

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | Markup and content |
| `styles.css` | Original theme plus the 2026 additions (marked by a comment block near the end) |
| `script.js` | Theme, bio toggle, scroll effects, tilt, counters, contact form and the 3D canvas |
| `img/` | Profile photo and background image |

## Run locally

No build step is needed. Either open `index.html` in a browser or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Updating content

Experience, skills, projects and achievements are plain HTML in `index.html`. Keep it in sync with the resume;
profile links (LeetCode, Codeforces, CodeChef, GitHub, LinkedIn) are in the Coding and Connect sections.

## License

See [LICENSE](LICENSE).
