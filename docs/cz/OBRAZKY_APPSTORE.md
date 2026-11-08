# Obrázky pro Nextcloud App Store

## Zdrojové soubory

Originály jsou součástí úplného zdrojového balíčku v `docs/images/appstore/` a nemají se zbytečně zmenšovat:

| Soubor | Rozměry | Účel |
| --- | --- | --- |
| `01-overview.png` | 2044 × 1020 | hlavní přehled rodokmenu |
| `01-overview-small.png` | 1187 × 715 | dodaný malý náhled prvního snímku |
| `02-journal.png` | 965 × 820 | výzkumný deník / úkoly |
| `03-photographs.png` | 968 × 830 | archiv fotografií a skenů |

## Hlavní obrázek a skutečná galerie

Do metadat byla přidána **schválená hlavní grafika aplikace** `src/img/app-store.png` (512 × 512 px):

- Přímý obrázek: `https://raw.githubusercontent.com/hacesoft/FamilyTree/main/src/img/app-store.png`
- Malý náhled: `https://raw.githubusercontent.com/hacesoft/FamilyTree/main/src/img/menu-preview.png`

Další tři záznamy v galerii jsou původní screenshoty uživatelského rozhraní v `docs/images/appstore/`. Tyto čtyři obrazové položky **nejsou zaměnitelné** s ikonou `img/app.svg` v instalačním archivu.

V `README.md` a `README_CZ.md` je stále jen jediný skutečný screenshot rodokmenu `docs/images/appstore/01-overview.png`.

## Zveřejnění

1. Přenést `docs/images/appstore/` spolu s celým projektem do veřejného repozitáře `https://github.com/hacesoft/FamilyTree` na větev `main` (obsah repozitáře je přímo v kořeni, ne ve složce `hc_familytree`).
2. Ověřit všech šest URL deklarovaných ve `<screenshot>` (hlavní `src/img/app-store.png`, `src/img/menu-preview.png`, tři původní screenshoty a náhled `01-overview-small.png`) — musí vrátit PNG, ne HTTP 404. Odkaz na hlavní grafiku `src/img/app-store.png` už vlastník ověřil v prohlížeči.
3. `src/appinfo/info.xml` deklaruje čtyři `<screenshot>` v pořadí: schválené logo aplikace s náhledem, přehled rodokmenu s náhledem, badatelský deník a fotografie. Změny metadat a snímků musí být publikovány společně.
4. Pro App Store jsou zdrojem obrázků tyto veřejné HTTPS adresy, nikoli lokální soubory v instalaci Nextcloudu. Pouze `src/` je instalační runtime; obsah `docs/` patří do úplného zdrojového vydání a na GitHub.

Každý hlavní snímek musí mít méně než 2 MiB. Žádný z dodaných obrázků tuto hranici nepřekračuje. Formát rozlišení není povinně sjednocen; nedělat násilné převzorkování. Před zveřejněním zkontrolovat, zda snímky neobsahují osobní nebo citlivé údaje.

## Kontrola schválených originálů (HDS / CP21)

Všechny uvedené snímky a původní ikona rodinného stromu musí zůstat **bitově beze změny**. Soubor `scripts/appstore-approved-assets.json` obsahuje SHA-256 referenčních originálů a jejich veřejné URL; kontrolní skript `node scripts/check-appstore-assets.cjs .` porovná skutečné soubory se schválenými hashi a ověří `src/appinfo/info.xml` i odkazy hlavního screenshotu v obou README.

Sestavení `sh build-release.sh` navíc povinně kontroluje, že se schválená ikona nachází v `img/app.svg` uvnitř runtime ZIPu i TAR.GZ a že screenshoty nejsou změněné ve veřejném full-source ZIPu. Chybějící nebo změněný originál vydání blokuje. Referenční manifest nesmí být samoúčelně upravován kvůli odstranění chyby kontroly; změna grafiky vyžaduje nové výslovné schválení.

Kontrola veřejných URL a výsledného zobrazení ve Nextcloud App Storu je **samostatná následná kontrola po zveřejnění**; bez ní se nesmí uvádět veřejné ověření PASS. Screenshoty jsou načítány z HTTPS URL a nemusejí být v běhovém TAR.GZ; správné `<screenshot>` záznamy ale ve vydaném `appinfo/info.xml` být musejí.

**Poznámka:** Publisher nepřenáší změny na GitHub. Aby nové odkazy fungovaly, soubory musí být ve veřejné větvi `main` na přesně uvedených cestách a aplikace musí být znovu publikována v App Storu. Lokální kontrola není důkazem dostupnosti přes HTTPS.
