# NMSloux — Tech studio koncept

Moderan, premium web koncept i identitet za tech studio **NMSloux**.

## Što je uključeno

- **Početna stranica** s herojem, što gradimo, procesom, projektima, o studiju i CTA
- **Brend smjer** u `BRAND.md`: logotip (wordmark), tipografija (Sora + Inter), paleta, ton
- **Tamna tema**: duboka crna (#0A0A0A), visok kontrast, minimalistički grid
- **Suptilne animacije**: scroll reveal (Intersection Observer), stagger u heroju, glatke tranzicije
- **Responzivnost**: navigacija s mobilnim izbornikom

## Pokretanje

Otvori `index.html` u pregledniku ili pokreni lokalni server:

```bash
# npr. Python
python -m http.server 8080

# ili Node (npx)
npx serve .
```

Zatim otvori `http://localhost:8080`.

## Struktura

```
NMSloux/
├── index.html          # Jedna stranica, sve sekcije
├── BRAND.md            # Smjer brenda, tipografija, paleta
├── README.md
└── assets/
    ├── css/
    │   └── styles.css  # UI sustav, varijable, sekcije
    └── js/
        └── main.js     # Header, menu, animacije, godina
```

## Prilagodbe

- **Email CTA:** u `index.html` zamijeni `hello@nmsloux.com` stvarnom adresom.
- **Projekti:** zamijeni placeholder opise i dodaj linkove na case studye ako ih imaš.
- **Boje / fontovi:** u `assets/css/styles.css` prilagodi CSS varijable u `:root`.

## Estetika

Brend i web su usklađeni s briefom: ozbiljno, tehnički snažno, tamna tema, bez generičkih fraza i bez Web3/crypto vizuala. Ton je direktan i samouvjeren; vizualno blizu Stripe / Linear / Vercel, ali tamnije i ozbiljnije.
