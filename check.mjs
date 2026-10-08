#!/usr/bin/env node
// Provjere generiranih stranica: `node check.mjs` (dodaj --net za provjeru vanjskih linkova)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.join(ROOT, 'NMSloux');
const pages = { hr: path.join(SITE, 'index.html'), en: path.join(SITE, 'en', 'index.html') };
const html = Object.fromEntries(Object.entries(pages).map(([k, f]) => [k, fs.readFileSync(f, 'utf8')]));
let fails = 0;
const ok = (c, msg) => { if (!c) { fails++; console.log('FAIL', msg); } else console.log('ok  ', msg); };
const attr = (h, re) => [...h.matchAll(re)].map((m) => m[1]);

for (const [lang, h] of Object.entries(html)) {
  ok(!/href="#"/.test(h), `${lang}: nema href="#"`);
  const ids = new Set(attr(h, /\sid="([^"]+)"/g));
  const anchors = [...new Set(attr(h, /href="#([^"]+)"/g))];
  const missing = anchors.filter((a) => !ids.has(a));
  ok(missing.length === 0, `${lang}: svi interni anchori imaju cilj ${missing.join(',')}`);
  ok(new RegExp(`<html lang="${lang}">`).test(h), `${lang}: <html lang>`);
  ok(/rel="canonical" href="https:\/\/nmsolux\.com\/(en\/)?"/.test(h), `${lang}: canonical`);
  ok(/hreflang="hr"/.test(h) && /hreflang="en"/.test(h) && /hreflang="x-default"/.test(h), `${lang}: hreflang hr/en/x-default`);
  ok(h.includes(lang === 'hr' ? 'og:locale" content="hr_HR"' : 'og:locale" content="en_US"'), `${lang}: og:locale`);
  ok(!/7\s?[-–]\s?14|Fiksna cijena|fiksnu cijenu|fiksne cijene|Fixed price|fixed prices/.test(h), `${lang}: nema "7-14 dana"/"fiksna cijena"`);
  ok(!/Najduži MVP|longest MVP/i.test(h), `${lang}: nema statistike 14 dana`);
  ok(!/\{\{|\}\}/.test(h.replace(/<script[\s\S]*?<\/script>/g, '')), `${lang}: nema preostalih placeholdera`);
  ok(['moja-ponudica', 'movyn', 'optilium', 'flowops', 'gallebo', 'walar', 'kcpt', 'respondly', 'savio', 'wellora', 'document-intelligence', 'palazzina-burjaki'].every((id) => ids.has('projekt-' + id)), `${lang}: 12 kartica projekata`);
  // kartice bez linka nemaju gumb
  for (const id of ['movyn', 'optilium', 'kcpt', 'respondly', 'document-intelligence']) {
    const m = h.match(new RegExp(`<article id="projekt-${id}"[\\s\\S]*?</article>`));
    ok(m && !/project-panel-link/.test(m[0]), `${lang}: ${id} bez gumba`);
  }
  const k = h.match(/<article id="projekt-kcpt"[\s\S]*?<\/article>/)[0];
  ok(!k.includes('kellycaffery'), `${lang}: kcpt kartica bez linka na app.kellycaffery.com`);
  ok(h.includes('href="https://app.kellycaffery.com"'), `${lang}: link na KCPT u testimonialu`);
  ok(!h.includes('⭐'), `${lang}: bez zvjezdica`);
  // vanjski linkovi projekata
  for (const u of ['https://mojaponudica.netlify.app', 'https://flowops.synidox.com/', 'https://savio.synidox.com/', 'https://wellora.synidox.com/', 'https://gallebo.vercel.app/', 'https://walar-skydive.netlify.app']) {
    ok(h.includes(`href="${u}"`), `${lang}: link ${u}`);
  }
}

// forma identična u HR i EN
const formSig = (h) => {
  const f = h.match(/<form[\s\S]*?<\/form>/)[0];
  const fa = f.match(/<form([^>]*)>/)[1].replace(/\s+class="[^"]*"/, '');
  const names = attr(f, /\sname="([^"]+)"/g);
  const hidden = f.match(/<input type="hidden" name="form-name" value="[^"]*">/)[0];
  const opts = attr(f, /data-value="([^"]+)"/g);
  const types = attr(f, /<(?:input|textarea)[^>]*\stype="([^"]+)"/g);
  return JSON.stringify({ fa, names, hidden, opts, types });
};
ok(formSig(html.hr) === formSig(html.en), 'forma: name/form-name/honeypot/data-value identični u HR i EN');

// prekidač jezika
ok(/id="lang-switch" href="en\/"/.test(html.hr), 'hr: prekidač vodi na en/');
ok(/id="lang-switch" href="\.\.\/"/.test(html.en), 'en: prekidač vodi na ../');
ok(/navLinks|lang-switch/.test(html.hr) && html.hr.includes("data-base") , 'prekidač održava sekciju (JS)');

// EN ne smije imati hrvatskih riječi/dijakritika u vidljivom tekstu
const enText = html.en.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
const hrChars = enText.match(/[^\s]*[čćšžđČĆŠŽĐ][^\s]*/g) || [];
const allowed = new Set(['Mulavdić']);
const bad = hrChars.filter((w) => ![...allowed].some((a) => w.includes(a)));
ok(bad.length === 0, `en: nema hrvatskih dijakritika u tekstu ${[...new Set(bad)].slice(0, 15).join(' | ')}`);

// slike u karticama imaju width/height/lazy
for (const [lang, h] of Object.entries(html)) {
  const imgs = [...h.matchAll(/<img [^>]*src="[^"]*assets\/images\/projects\/[^>]*>/g)].map((m) => m[0]);
  ok(imgs.every((t) => /width="\d+"/.test(t) && /height="\d+"/.test(t) && /loading="lazy"/.test(t) && /alt="[^"]+"/.test(t)), `${lang}: ${imgs.length} slika projekata s width/height/lazy/alt`);
}


// pristupačnost i forma (grupa 2)
for (const [lang, h] of Object.entries(html)) {
  ok(/<a href="#main" class="skip-link">/.test(h) && /<main id="main"/.test(h) && (h.match(/<main/g) || []).length === 1, `${lang}: skip link i jedan <main>`);
  ok(!/lucide\.min\.css/.test(h), `${lang}: nema lucide.min.css`);
  ok(/id="contact-ime"[^>]*maxlength="120"/.test(h) && /id="contact-email"[^>]*maxlength="200"/.test(h) && /id="contact-telefon"[^>]*maxlength="40"/.test(h) && /id="contact-poruka"[^>]*maxlength="5000"/.test(h) && /id="contact-vrijeme-poziva"[^>]*maxlength="200"/.test(h), `${lang}: maxlength na poljima`);
  ok(!/<blockquote[\s\S]*?<footer[\s\S]*?<\/blockquote>/.test(h), `${lang}: nema <footer> u blockquote`);
  const sw = h.match(/id="lang-switch"[^>]*aria-label="([^"]*)"[^>]*>([^<]*)</);
  ok(sw && sw[1].startsWith(sw[2]), `${lang}: aria-label prekidača počinje vidljivim tekstom (${sw && sw[1]})`);
  ok(/id="contact-tip" aria-labelledby="contact-tip-label contact-tip-value"/.test(h), `${lang}: #contact-tip naziv sadrži vidljivi tekst`);
  ok(/<h4 [^>]*break-words/.test(h), `${lang}: break-words na naslovima kartica`);
  ok(!/aggregateRating|"@type": "Review"/.test(h), `${lang}: nema aggregateRating/review u JSON-LD`);
  ok(/prefers-reduced-motion/.test(h), `${lang}: prefers-reduced-motion`);
}
for (const f of ['politika-privatnosti.html', 'politika-kolacica.html', 'en/privacy-policy.html', 'en/cookie-policy.html', '404.html', 'en/404.html']) {
  const h = fs.readFileSync(path.join(SITE, f), 'utf8');
  ok(/class="skip-link"/.test(h) && /<main id="main"/.test(h) && /<\/main>/.test(h), `${f}: skip link i <main>`);
}


// OG slike
const favDir = path.join(SITE, 'assets', 'images', 'favcon');
for (const l of ['hr', 'en']) {
  const f = path.join(favDir, `og-image-${l}.png`);
  const exists = fs.existsSync(f);
  ok(exists, `og-image-${l}.png postoji`);
  if (exists) {
    const b = fs.readFileSync(f);
    const isPng = b.toString('ascii', 1, 4) === 'PNG';
    ok(isPng && b.readUInt32BE(16) === 1200 && b.readUInt32BE(20) === 630, `og-image-${l}.png je PNG 1200x630 (${b.readUInt32BE(16)}x${b.readUInt32BE(20)}, ${Math.round(b.length / 1024)} KB)`);
    ok(b.length < 300 * 1024, `og-image-${l}.png < 300 KB`);
  }
}
const ogPages = { 'index.html': 'hr', 'en/index.html': 'en', 'politika-privatnosti.html': 'hr', 'politika-kolacica.html': 'hr', 'en/privacy-policy.html': 'en', 'en/cookie-policy.html': 'en' };
const altOf = { hr: 'NMSolux – SaaS proizvodi i marketplace platforme', en: 'NMSolux – SaaS products and marketplaces' };
for (const [f, l] of Object.entries(ogPages)) {
  const h = fs.readFileSync(path.join(SITE, f), 'utf8');
  const want = `https://nmsolux.com/assets/images/favcon/og-image-${l}.png`;
  const meta = (re) => (h.match(re) || [])[1];
  ok(meta(/property="og:image" content="([^"]*)"/) === want, `${f}: og:image apsolutan i za jezik ${l}`);
  ok(meta(/name="twitter:image" content="([^"]*)"/) === want, `${f}: twitter:image apsolutan i za jezik ${l}`);
  ok(meta(/og:image:width" content="([^"]*)"/) === '1200' && meta(/og:image:height" content="([^"]*)"/) === '630' && meta(/og:image:type" content="([^"]*)"/) === 'image/png', `${f}: og:image width/height/type`);
  ok(meta(/og:image:alt" content="([^"]*)"/) === altOf[l] && meta(/twitter:image:alt" content="([^"]*)"/) === altOf[l], `${f}: og:image:alt i twitter:image:alt (${l})`);
}
const walkAll = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walkAll(path.join(d, e.name)) : [path.join(d, e.name)]);
const oldRefs = walkAll(SITE).filter((f) => /.(html|xml|txt|json|js|css)$/.test(f)).filter((f) => /og-image.png/.test(fs.readFileSync(f, 'utf8')));
ok(oldRefs.length === 0, `nijedna stranica ne pokazuje na staru og-image.png ${oldRefs.map((f) => path.relative(SITE, f)).join(', ')}`);

if (process.argv.includes('--net')) {
  const urls = [...new Set([...html.hr.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((m) => m[1]))].filter((u) => !/fonts|schema\.org|nmsolux\.com/.test(u));
  for (const u of urls) {
    try {
      let r = await fetch(u, { method: 'GET', redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) });
      console.log(r.status, u);
    } catch (e) { console.log('ERR', u, e.message); }
  }
}
console.log(fails ? `\n${fails} provjera nije prošlo` : '\nSve provjere prošle');
process.exit(fails ? 1 : 0);
