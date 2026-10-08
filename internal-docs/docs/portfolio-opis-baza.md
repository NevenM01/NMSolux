# Baza: kako opisivati projekte u portfoliju

Ovo je referentna baza za unos i uređivanje projekata u sekciji **Projekti** na stranici. Opisi trebaju biti jasni klijentima i posjetiteljima, bez tehničkih pojmova.

---

## Polja projekta

| Polje | Namjena | Primjer |
|------|--------|--------|
| **tag** | Kratka oznaka tipa projekta (vidljiva iznad naslova) | Web, Aplikacija, Sustav za narudžbe |
| **title** | Naziv projekta | Villa Palazzina Burjaki |
| **desc** | Kratki opis (1–2 rečenice): za koga je projekt i što nudi | Prezentacijska stranica za vilu u Istri: više jezika, galerija, lokacija i upute, rezervacija. |
| **fullDesc** | Detaljniji opis: što posjetitelj/vlasnik vidi i može raditi | Stranica uključuje predstavljanje vile, sadržaje (bazen, wellness, klima), galeriju soba i okoliša, informacije o lokaciji (plaže, restorani, trgovine) i mogućnost rezervacije. |
| **images** | Glavna slika (putanja) | assets/images/palazzina-burjaki/hero.png |
| **imagesFallback** | Ostale slike ako glavna nije dostupna ili za galeriju | niz putanja |
| **link** | URL live stranice / demo (ostavi prazno ako nema) | https://primjer.hr |

---

## Stil opisa (desc i fullDesc)

- **Jezik:** hrvatski, jednostavan.
- **Ton:** što projekt **radi za korisnika**, ne kako je napravljen.
- **Format kratkog opisa (desc):**  
  **[Za koga / što je projekt]: [što mogu raditi / što nude], [druga stavka], [treća].**
- **Detaljni opis (fullDesc):** isto bez tehničkih riječi — koristi nazive stranica, izbornika i radnji koje korisnik vidi (npr. „pregled ponuda”, „upis rezervacije”), ne nazive sustava (npr. „dashboard”, „backend”).

---

## Što izbjegavati (tehničko)

- Izrazi: SaaS, multi-tenant, API, integracija, POS, frontend, backend, responzivan dizajn, dark theme, CTA, deploy.
- Opisivanje „kako” (tehnologije, arhitektura) — ostavi za razgovor s klijentom.

---

## Što koristiti

- **Za koga:** vlasnik trgovine, gosti vile, član teretane, tim koji izdaje ponude.
- **Što mogu:** pregledati, rezervirati, preuzeti, ispuniti, vidjeti galeriju, upute, cijene.
- **Konkretno:** nazivi stranica i izbornika koje korisnik vidi („O nama”, „Cijene”, „Kontakt”, „Moje ponude”, „Rezervacija termina”).

---

## Primjeri prema projektu

### Prezentacijski web (npr. vila, hotel)

- **desc:** Prezentacijska stranica za [tko/što]: [jezici ako ima], galerija, informacije o lokaciji i sadržajima, rezervacija ili kontakt.
- **fullDesc:** Stranica uključuje uvod i predstavljanje objekta, sadržaje za goste, galeriju prostora, lokaciju i korisne informacije (plaže, restorani, prijevoz), te način rezervacije ili kontakt.

### Aplikacija za poslovanje (npr. zaliha, ponude)

- **desc:** Sustav za [tko]: [glavne radnje — npr. praćenje zaliha, izrada ponuda], pregled podataka, više korisnika po potrebi.
- **fullDesc:** Vlasnik i zaposlenici mogu [glavne radnje]. Uključuje pregled stanja, povijest promjena, izvještaje i, po želji, više lokacija ili korisnika.

### Aplikacija za korisnike i vlasnike (npr. teretana)

- **desc:** Aplikacija za [vlasnike i korisnike]: [što vlasnici rade], [što korisnici rade], nagrade ili dodatne pogodnosti.
- **fullDesc:** Vlasnici vide popunjenost i dolaske, postavljaju termine i nagrade. Korisnici rezerviraju termine, dolaze prema rezervaciji i mogu ostvarivati pogodnosti ovisno o korištenju.

---

## Predložak za novi projekt

```
tag: "[Tip projekta — jednu-dvije riječi]"
title: "[Naziv projekta]"
desc: "[Za koga / što je]: [stavka 1], [stavka 2], [stavka 3]."
fullDesc: "[Jedna-dvije rečenice: što korisnik vidi i može raditi, bez tehničkih pojmova.]"
images: ["assets/images/naziv-projekta/glavna.png"]
imagesFallback: ["..."]  // po želji
link: ""   // URL ako postoji live verzija
```

Kad dodaješ novi projekt u `index.html`, ispuni polja prema ovoj bazi i provjeri da opisi zvuče prirodno nekome tko ne zna tehničke detalje.
