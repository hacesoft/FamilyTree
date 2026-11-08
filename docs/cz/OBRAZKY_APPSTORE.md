# Obrázky pro Nextcloud App Store

## Zdrojové soubory

Originály jsou součástí úplného zdrojového balíčku v `docs/images/appstore/` a nemají se zbytečně zmenšovat:

| Soubor | Rozměry | Účel |
| --- | --- | --- |
| `01-overview.png` | 2044 × 1020 | hlavní přehled rodokmenu |
| `01-overview-small.png` | 1187 × 715 | dodaný malý náhled prvního snímku |
| `02-journal.png` | 965 × 820 | výzkumný deník / úkoly |
| `03-photographs.png` | 968 × 830 | archiv fotografií a skenů |

## Zveřejnění

1. Přenést `docs/images/appstore/` spolu s celým projektem do veřejného repozitáře `https://github.com/hacesoft/FamilyTree` na větev `main` (obsah repozitáře je přímo v kořeni, ne ve složce `hc_familytree`).
2. Ověřit všechny čtyři veřejné adresy `https://raw.githubusercontent.com/hacesoft/FamilyTree/main/docs/images/appstore/<název>` — musí vrátit obrázek, ne HTTP 404.
3. `src/appinfo/info.xml` deklaruje tři `<screenshot>` v pořadí galerie; první má atribut `small-thumbnail`, další dva používají originál i jako náhled. Změny metadat a snímků musí být publikovány společně.
4. Pro App Store jsou zdrojem obrázků tyto veřejné HTTPS adresy, nikoli lokální soubory v instalaci Nextcloudu. Pouze `src/` je instalační runtime; obsah `docs/` patří do úplného zdrojového vydání a na GitHub.

Každý hlavní snímek musí mít méně než 2 MiB. Žádný z dodaných obrázků tuto hranici nepřekračuje. Formát rozlišení není povinně sjednocen; nedělat násilné převzorkování. Před zveřejněním zkontrolovat, zda snímky neobsahují osobní nebo citlivé údaje.
