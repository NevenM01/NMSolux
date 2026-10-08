#!/usr/bin/env node
// Generira HR (NMSloux/index.html) i EN (NMSloux/en/index.html) stranicu iz src/.
// Bez ovisnosti: `node build.mjs`
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.join(ROOT, 'NMSloux');
const SRC = path.join(ROOT, 'src');
const read = (f) => fs.readFileSync(path.join(SRC, f), 'utf8');

const i18n = JSON.parse(read('i18n.json'));
const projectsData = JSON.parse(read('projects.json'));
const testimonials = JSON.parse(read('testimonials.json'));
const head = read('head.html');
const body = read('body.html');

const LANGS = {
  hr: { lang: 'hr', url: 'https://nmsolux.com/', outFile: 'index.html', base: '', ogLocale: 'hr_HR', ogLocaleAlt: 'en_US', switchTo: 'en', switchLabel: 'EN', switchBase: 'en/', otherLabel: 'HR' },
  en: { lang: 'en', url: 'https://nmsolux.com/en/', outFile: 'en/index.html', base: '../', ogLocale: 'en_US', ogLocaleAlt: 'hr_HR', switchTo: 'hr', switchLabel: 'HR', switchBase: '../', otherLabel: 'EN' }
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonEsc = (s) => String(s); // JSON.stringify radi escaping

// ---------- dimenzije webp-a (bez ovisnosti)
function webpSize(file) {
  const b = fs.readFileSync(file);
  if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null;
  const t = b.toString('ascii', 12, 16);
  if (t === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
  if (t === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  if (t === 'VP8L') { const v = b.readUInt32LE(21); return { w: (v & 0x3fff) + 1, h: ((v >> 14) & 0x3fff) + 1 }; }
  return null;
}

// ---------- Radovi
function img(id, name, alt, base, eager = false) {
  const f = path.join(SITE, 'assets', 'images', 'projects', id, name + '.webp');
  if (!fs.existsSync(f)) return '';
  const s = webpSize(f);
  const dim = s ? ` width="${s.w}" height="${s.h}"` : '';
  return `<img src="${base}assets/images/projects/${id}/${name}.webp" alt="${esc(alt)}"${dim} loading="lazy" decoding="async" class="w-full h-full object-cover">`;
}

function renderCard(id, p, L, base, t) {
  const l = L.lang;
  const status = p.status ? projectsData.statuses[p.status][l] : '';
  const cover = img(id, 'cover', p.title, base);
  const extras = ['1', '2', '3'].map((n) => img(id, n, p.title, base)).filter(Boolean);
  const stack = (p.stack || []).map((s) => (typeof s === 'string' ? s : s[l]));
  const kq = p.quote ? testimonials[p.quote] : null;
  const parts = [];
  parts.push(`                    <article id="projekt-${id}" class="glass-panel project-card p-8 md:p-10 flex flex-col scroll-mt-4${p.featured ? ' md:col-span-2' : ''}">`);
  if (cover) {
    parts.push(`                        <div class="project-cover">${cover}</div>`);
    if (extras.length) parts.push(`                        <div class="project-thumbs">${extras.map((e) => `<div>${e}</div>`).join('')}</div>`);
  }
  parts.push(`                        <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">`);
  parts.push(`                            <h4 class="text-2xl md:text-3xl font-bold tracking-tight min-w-0 break-words">${esc(p.title)}</h4>`);
  if (status) parts.push(`                            <span class="project-status">${esc(status)}</span>`);
  parts.push(`                        </div>`);
  if (p.role) parts.push(`                        <p class="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-5">${t['work.role']}: ${esc(p.role[l])}</p>`);
  parts.push(`                        <p class="text-zinc-400 text-[15px] leading-relaxed mb-6">${esc(p.desc[l])}</p>`);
  if (kq) {
    parts.push(`                        <blockquote class="project-quote">`);
    parts.push(`                            <p>\u201C${esc(kq.excerpts[0])}\u201D</p>`);
    parts.push(`                            <p class="project-quote-source">\u2014 ${esc(kq.name)}, ${esc(kq.org)}</p>`);
    parts.push(`                        </blockquote>`);
  }
  if (stack.length) {
    parts.push(`                        <ul class="flex flex-wrap gap-2 mt-auto mb-6" aria-label="${esc(t['work.stack_aria'])}">`);
    for (const s of stack) parts.push(`                            <li class="project-tag">${esc(s)}</li>`);
    parts.push(`                        </ul>`);
  }
  if (p.link) {
    parts.push(`                        <a href="${esc(p.link)}" target="_blank" rel="noopener noreferrer" class="project-panel-link self-start${stack.length ? '' : ' mt-auto'}" aria-label="${esc(t['work.view'] + ': ' + p.title + ' (' + t['work.view_aria'] + ')')}">${esc(t['work.view'])} <i data-lucide="external-link" class="w-3.5 h-3.5" aria-hidden="true"></i></a>`);
  }
  parts.push(`                    </article>`);
  return parts.join('\n');
}

function renderRadovi(L, t) {
  const groups = projectsData.groups.map((g, gi) => {
    const cards = g.projects.map((id) => {
      const p = projectsData.projects[id];
      if (!p) throw new Error('Nepoznat projekt: ' + id);
      return renderCard(id, p, L, L.base, t);
    }).join('\n');
    return `            <div class="mb-20 last:mb-0" data-group="${g.id}">
                <div class="flex items-center gap-6 mb-8">
                    <h3 class="text-2xl md:text-3xl font-bold tracking-tight">${esc(g[L.lang])}</h3>
                    <span class="flex-1 h-px bg-white/5" aria-hidden="true"></span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
${cards}
                </div>
            </div>`;
  }).join('\n');
  return `    <!-- Radovi -->
    <section id="radovi" class="py-32 md:py-40 px-6">
        <div class="max-w-7xl mx-auto">
            <span class="text-violet-500 font-mono text-[11px] tracking-widest uppercase block mb-6">${t['work.eyebrow']}</span>
            <h2 class="text-5xl md:text-6xl font-bold tracking-tighter mb-6">${t['work.h2']}</h2>
            <p class="text-zinc-400 text-xl leading-relaxed mb-16 md:mb-20 max-w-2xl">${t['work.intro']}</p>
${groups}
        </div>
    </section>`;
}

// ---------- Testimonial Kelly Caffery (KCPT)
function renderKcpt(L, t) {
  const k = testimonials.kcpt;
  const hr = L.lang === 'hr';
  const p = (arr, cls) => arr.map((x) => `<p class="${cls}">${esc(x)}</p>`).join('\n                            ');
  const trBlock = (arr) => hr
    ? `<div class="mt-6 pl-5 border-l border-white/10">
                                <div class="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">${esc(t['kcpt.translation'])}</div>
                                ${p(arr, 'text-zinc-400 text-base leading-relaxed mb-3')}
                            </div>` : '';
  const excerpts = k.excerpts.map((x) => `<p class="text-zinc-300 text-lg leading-relaxed">\u201C${esc(x)}\u201D</p>`).join('\n                            ');
  return `                <div class="glass-panel p-10 md:p-12 md:col-span-3">
                    <div class="mb-8">
                        <div id="testimonial-kcpt-excerpts" class="space-y-4" lang="en">
                            ${excerpts}
                        </div>
                        ${hr ? `<div id="testimonial-kcpt-excerpts-tr">${trBlock(k.excerptsHr)}</div>` : ''}
                        <div id="testimonial-kcpt-full" class="testimonial-full" lang="en">
                            ${p(k.full, 'text-zinc-300 text-lg leading-relaxed mb-4')}
                            ${trBlock(k.fullHr)}
                        </div>
                        <button type="button" id="testimonial-kcpt-toggle" class="testimonial-toggle" data-target="testimonial-kcpt-full" data-hide="testimonial-kcpt-excerpts${hr ? ' testimonial-kcpt-excerpts-tr' : ''}" aria-expanded="false">${t['testi.more']}</button>
                    </div>
                    <div class="border-l border-violet-500/40 pl-6 space-y-1">
                        <div class="text-white font-bold tracking-tight break-words">${esc(k.name)}</div>
                        <div class="text-[10px] text-zinc-500 font-mono uppercase tracking-widest"><a href="${esc(k.orgLink)}" target="_blank" rel="noopener noreferrer" class="hover:text-violet-400 transition-colors underline underline-offset-4 decoration-zinc-700">${esc(k.org)}</a> (${esc(t['kcpt.desc'])})</div>
                        <div class="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">${esc(t['kcpt.source'])}</div>
                    </div>
                </div>`;
}

// ---------- JSON-LD
function renderJsonLd(L, t, d) {
  const l = L.lang;
  const faq = [1, 2, 3, 4, 5, 6].map((n) => ({
    '@type': 'Question', name: d['faq.q' + n].replace(/\u201E|\u201D|\u201C/g, '"'),
    acceptedAnswer: { '@type': 'Answer', text: d['faq.a' + n] }
  }));
  const blocks = [
    {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': ['Organization', 'LocalBusiness', 'ProfessionalService'], name: 'NMSolux', description: d['jsonld.description'], url: L.url,
          email: 'mulavdic.neven2001@gmail.com', telephone: '+385958400721',
          areaServed: d['jsonld.areaServed'].map((n) => ({ '@type': 'Country', name: n })),
          serviceType: d['jsonld.serviceType'], priceRange: '\u20AC\u20AC', founder: { '@id': '#founder' },
          sameAs: ['https://www.linkedin.com/in/neven-mulavdic-11b937393/', 'https://www.instagram.com/nmsolux/']
        },
        { '@id': '#founder', '@type': 'Person', name: 'Neven Mulavdi\u0107', jobTitle: 'Founder / Developer', worksFor: { '@type': 'Organization', name: 'NMSolux' }, sameAs: 'https://www.linkedin.com/in/neven-mulavdic-11b937393/' }
      ]
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: l, mainEntity: faq },
    { '@context': 'https://schema.org', '@type': 'WebSite', name: 'NMSolux', url: L.url, inLanguage: l },
    {
      '@context': 'https://schema.org', '@type': 'Organization', name: 'NMSolux', url: L.url,
      image: `https://nmsolux.com/assets/images/favcon/og-image-${l}.png`,
      address: { '@type': 'PostalAddress', addressRegion: d['jsonld.region'], addressCountry: 'HR' }
    }
  ];
  return blocks.map((b) => `    <script type="application/ld+json">\n${JSON.stringify(b, null, 2).replace(/</g, '\\u003c')}\n    </script>`).join('\n');
}

// ---------- Prekida\u010d jezika
function renderSwitch(L, t) {
  const cur = `<span class="text-white" aria-current="true">${L.otherLabel}</span>`;
  const other = `<a id="lang-switch" href="${L.switchBase}" data-base="${L.switchBase}" hreflang="${L.switchTo}" lang="${L.switchTo}" class="hover:text-white transition-colors" aria-label="${esc(t['lang.switch_aria'])}">${L.switchLabel}</a>`;
  return `<div class="lang-switch flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-400 ml-auto mr-3 lg:ml-0 lg:mr-0">${cur}<span class="text-zinc-700" aria-hidden="true">|</span>${other}</div>`;
}

// ---------- Render
const EXTRA_CSS = `
        /* Radovi */
        .project-card { min-width: 0; }
        .project-cover { margin: -0.5rem -0.5rem 1.5rem; border-radius: 16px; overflow: hidden; aspect-ratio: 16 / 9; background: rgba(139, 92, 246, 0.08); }
        .project-cover img { display: block; }
        .project-thumbs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin: -0.75rem -0.5rem 1.5rem; }
        .project-thumbs div { border-radius: 10px; overflow: hidden; aspect-ratio: 16 / 10; background: rgba(139, 92, 246, 0.08); }
        .project-thumbs img { display: block; }
        .project-status { display: inline-block; padding: 0.2rem 0.65rem; font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.04em; color: rgba(167, 139, 250, 0.95); border: 1px solid rgba(139, 92, 246, 0.4); border-radius: 9999px; background: rgba(139, 92, 246, 0.08); }
        .project-tag { padding: 0.25rem 0.7rem; font-size: 0.6875rem; font-family: 'Fira Code', monospace; color: rgb(161, 161, 170); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 9999px; background: rgba(255, 255, 255, 0.02); }
        .project-quote { margin: 0 0 1.5rem; padding: 0.25rem 0 0.25rem 1rem; border-left: 2px solid rgba(139, 92, 246, 0.5); color: rgb(212, 212, 216); font-size: 0.9375rem; line-height: 1.6; }
        .project-quote p { margin: 0 0 0.35rem; }
        .project-quote .project-quote-source { font-size: 0.6875rem; font-family: 'Fira Code', monospace; letter-spacing: 0.08em; text-transform: uppercase; color: #85858f; }
        .testimonial-full { display: none; }
        .testimonial-full.is-expanded { display: block; }
        .lang-switch a, .lang-switch span { white-space: nowrap; }
        html { scroll-padding-top: 5rem; }

        /* Pristupačnost */
        .skip-link { position: absolute; left: 1rem; top: -4rem; z-index: 200; padding: 0.75rem 1.25rem; background: #fafafa; color: #050308; border-radius: 9999px; font-size: 0.8125rem; font-weight: 700; text-decoration: none; transition: top 0.2s ease; }
        .skip-link:focus { top: 1rem; }
        a:focus-visible, button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible,
        .custom-select-trigger:focus-visible, .custom-select-option:focus-visible, [tabindex]:focus-visible {
            outline: 2px solid #a78bfa !important; outline-offset: 3px;
        }
        @media (prefers-reduced-motion: reduce) {
            html, body { scroll-behavior: auto !important; }
            *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
        }

        #testimonials .glass-panel { min-width: 0; }
        main:focus { outline: none !important; }

        /* Kontrast (WCAG AA 4.5:1) */
        body .text-zinc-500 { color: #85858f; }
        body .text-zinc-600 { color: #80808a; }
        .project-panel-link { color: #a78bfa; }
        .logo-grayscale { filter: grayscale(1) brightness(0.95) contrast(1.1); opacity: 0.85; }
        .logo-grayscale:hover { filter: none; opacity: 1; }
`;

function strings(L) {
  const d = i18n[L.lang];
  return d;
}

function render(L) {
  const d = strings(L);
  const t = d;
  const vars = { lang: L.lang, url: L.url, base: L.base, og_locale: L.ogLocale, og_locale_alt: L.ogLocaleAlt, og_image: `https://nmsolux.com/assets/images/favcon/og-image-${L.lang}.png` };
  let html = head + body.replace('    </style>\n</head>', EXTRA_CSS + '    </style>\n</head>');
  html = html
    .replace('{{@jsonld}}', () => renderJsonLd(L, t, d))
    .replace('{{@radovi}}', () => renderRadovi(L, t))
    .replace('{{@kcpt_testimonial}}', () => renderKcpt(L, t))
    .replace('{{lang.switch}}', () => renderSwitch(L, t));
  // zamjena {{key}} (vi\u0161e prolaza jer vrijednosti mogu sadr\u017eavati {{base}})
  for (let pass = 0; pass < 3; pass++) {
    html = html.replace(/\{\{([a-zA-Z0-9_.]+)\}\}/g, (m, k) => {
      if (k in vars) return vars[k];
      if (k in d && typeof d[k] === 'string') return d[k];
      throw new Error(`Nedostaje prijevod/varijabla: ${k} (${L.lang})`);
    });
  }
  if (/\{\{|\}\}/.test(html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/\$\{[^}]*\}/g, ''))) {
    // preostali {{ izvan skripti
    const m = html.match(/.{0,40}\{\{.{0,40}/);
    if (m) throw new Error('Preostao placeholder: ' + m[0]);
  }
  return html;
}

for (const key of Object.keys(LANGS)) {
  const L = LANGS[key];
  const out = path.join(SITE, L.outFile);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, render(L));
  console.log('napisano', path.relative(ROOT, out));
}
