# Grafika aplikace a Nextcloud App Store – FamilyTree 1.1.3

## Vzor Nextcloud Talk (`spreed`)

Nextcloud odlišuje **ikonu instalované aplikace** a **screenshoty pro katalog**. Talk má v běhové aplikaci `img/app.svg` (volitelně `img/app-dark.svg`), zatímco v `appinfo/info.xml` používá veřejné HTTPS URL screenshotů. Umístění do `img/` automaticky nezajišťuje jejich zobrazení v katalogu: rozhoduje URL v `<screenshot>`.

## Správné role obrázků FamilyTree

| Role | Soubor | Rozměry |
| --- | --- | --- |
| Ikona v Nextcloudu | `src/img/app.svg` → při sestavení `img/app.svg` | SVG |
| Karta katalogu a první snímek galerie | `src/img/01-overview.png` | 2044 × 1020 |
| Druhý snímek galerie | `src/img/02-journal.png` | 965 × 820 |
| Třetí snímek galerie | `src/img/03-photographs.png` | 968 × 830 |
| Schválená grafika/logo (nepoužívá se jako karta) | `src/img/app-store.png` | 512 × 512 |
| Schválený malý náhled (nepoužívá se jako karta) | `src/img/menu-preview.png` | 64 × 64 |

Kopie screenshotů jsou **bitově totožné** se schválenými originály v `docs/images/appstore/`. Neměnit barvy, velikosti ani obsah. Zdrojové soubory v `src/img/` jsou dostupné v GitHubu na ověřitelných cestách a sestavení je přenáší do běhového `img/`.

V `src/appinfo/info.xml` se používá **první snímek bez `small-thumbnail`**; App Store tak pro kartu použije skutečný barevný screenshot, nikoliv ikonu. Příslušné odkazy:

```xml
<screenshot>https://raw.githubusercontent.com/hacesoft/FamilyTree/main/src/img/01-overview.png</screenshot>
<screenshot>https://raw.githubusercontent.com/hacesoft/FamilyTree/main/src/img/02-journal.png</screenshot>
<screenshot>https://raw.githubusercontent.com/hacesoft/FamilyTree/main/src/img/03-photographs.png</screenshot>
```

## Postup vydání – důležitá závislost

1. Nejdříve nahrát **nové soubory `src/img/01-overview.png`, `02-journal.png`, `03-photographs.png`** a upravené metadata do větve `main` repozitáře `hacesoft/FamilyTree`. V repozitáři musí být obsah `full-source.zip` v kořeni, nikoliv v podadresáři `hc_familytree/`.
2. Ověřit každý přímý raw GitHub odkaz metodou HTTP GET: status 200, `Content-Type: image/png`, správné rozměry a SHA-256 bajtů. Pro automatickou kontrolu lze spustit `node scripts/check-appstore-public-urls.cjs` (po uploadu zdrojů na GitHub; vyžaduje přístup k internetu).
3. Teprve po úspěšné kontrole provést nové podepsané vydání Publisherem a registrovat verzi 1.1.3 v Nextcloud App Storu. `build-release.sh` nepodepisuje ani nepublikuje.
4. Poté ověřit veřejnou kartu a galerii v App Storu. Jejich zobrazení závisí i na obrazové cache Nextcloudu; místní build nestačí jako důkaz úspěchu.

Soubory ve vydaném instalačním TAR.GZ musí být pod `hc_familytree/img/`. App Store si **obrázky galerie nestahuje ze složky `img/` v TAR.GZ**, ale z URL v `appinfo/info.xml`. Do TAR.GZ jsou zde screenshoty navíc přibalené pro konzistenci, nikoliv jako náhrada zveřejnění na GitHubu.

Kontrola ikon v HDS/CP21 zůstává blokující a referenční hashe se nesmějí měnit bez schválení vlastníkem. Online URL nemohou mít PASS před zveřejněním souborů.
