# Portfolio kolazi (jedan po projektu, stil Softify)

Da bi se u portfoliju prikazali **jedan kolaz po projektu** (Moja ponudica, GymFlow), treba generirati PNG datoteke.

## Zahtjevi

- Python 3
- Pillow: `pip install Pillow`

## Generiranje

```bash
# Iz roota projekta (NMSolux)
pip install Pillow
python scripts/blur-and-collage.py   # Moja ponudica (s blurom osjetljivih podataka)
python scripts/gymflow-collage.py    # GymFlow
```

## Rezultat

- `NMSloux/assets/images/moja-ponudica-portfolio-collage.png` — 5 screenshotova u 2 reda, s blurom OIB/adresa/IBAN/tablica
- `NMSloux/assets/images/gymflow-portfolio-collage.png` — 3 screenshota u jednom redu

Ako kolazi nisu generirani, stranica prikazuje pojedinačne slike kao fallback.
