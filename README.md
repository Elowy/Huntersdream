# Hunter's Dream 2 — Slot

A böngészőben futó nyerőgépes (slot) játék a mellékelt **Hunter's Dream 2**
kaszinógép alapján. Nincs build lépés, nincs függőség — csak nyisd meg az
`index.html`-t egy böngészőben.

## Játékleírás

- **5 tárcsa · 3 sor · 20 nyerővonal**
- Tét: **0.10 € – 10.00 €**
- A nyeremények **balról jobbra** fizetnek, vonalanként a **legmagasabb**
  nyeremény kerül kifizetésre.

### Szimbólumok

| Szimbólum | Típus | Megjegyzés |
|-----------|-------|------------|
| 🏹 Hunter (vadász) | prémium | legmagasabb fizetés |
| 🐺 Wolf (farkas) | prémium | |
| 🐻 Bear (medve) | prémium | |
| 🐗 Boar (vaddisznó) | prémium | |
| 🦅 Eagle (sas) | prémium | |
| A · K · Q · J · 10 · 9 | kártyák | alacsonyabb fizetés |
| 🔥 **WILD** (tűz) | wild | helyettesít minden szimbólumot a Scatter kivételével; **minden aktív WILD a vonalon ×2** szorzót ad |
| 🏚️ **BONUS / SCATTER** (kunyhó) | scatter | csak a 3 középső tárcsán; **3 db → 10 ingyenes játék** |

### Sticky Free Spins (ragadós ingyenes pörgetések)

3 Scatter a 3 középső tárcsán 10 ingyenes játékot indít. Az ingyenes
játékokban a nyerő szimbólumok **ragadnak** (sticky), és a többi tárcsa
újrapörög a magasabb nyereményekért mindaddig, amíg nő a nyeremény. Az
ingyenes játék módban újabb 10 ingyenes játék nyerhető (retrigger).

## Vezérlés

| Gomb | Funkció |
|------|---------|
| **START** | pörgetés indítása (vagy `Szóköz` billentyű) |
| **TÉT − / TÉT +** | tét csökkentése / növelése |
| **MAX TÉT** | maximális tét és azonnali pörgetés |
| **AUTO** | automatikus pörgetés be/ki |
| **Szabályok** | nyerőtábla és játékszabályok |

## Fájlok

```
index.html      – szerkezet
css/style.css   – megjelenés (fa keret, téli/vadász téma)
js/game.js      – játéklogika (tárcsák, nyerővonalak, wild, scatter, free spins)
```

> A pénznemek és nyeremények csak szórakoztató célúak — ez nem valódi pénzes
> szerencsejáték.
