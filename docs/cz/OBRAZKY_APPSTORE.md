# Grafika aplikace a Nextcloud App Store – FamilyTree 1.1.5

## Vzor Nextcloud Talk (`spreed`)

Nextcloud odlišuje **ikonu instalované aplikace** a **screenshoty pro katalog**. Talk má v běhové aplikaci `img/app.svg` (volitelně `img/app-dark.svg`), zatímco v `appinfo/info.xml` používá veřejné HTTPS URL screenshotů. Umístění do `img/` automaticky nezajišťuje jejich zobrazení v katalogu: rozhoduje URL v `<screenshot>`.

## Správné role obrázků FamilyTree

| Role | Soubor | Rozměry |
| --- | --- | --- |
| Ikona v Nextcloudu | `src/img/app.svg` → při sestavení `img/app.svg` | SVG |
| Karta katalogu a první snímek galerie | `src/img/01.png` | 2044 × 1020 |
| Druhý snímek galerie | `src/img/02.png` | 965 × 820 |
| Třetí snímek galerie | `src/img/03.png` | 968 × 830 |
| Schválená grafika/logo (nepoužívá se jako karta) | `src/img/app-store.png` | 512 × 512 |
| Schválený malý náhled (nepoužívá se jako karta) | `src/img/menu-preview.png` | 64 × 64 |

**Jediné schválené screenshoty FamilyTree jsou uživatelem dodané soubory `src/img/01.png`, `src/img/02.png`, `src/img/03.png`.** Původní soubory s dlouhými názvy a duplicitní složka screenshotů byly z projektu odstraněny; nové sestavení je nesmí vrátit. Obrazová data se nekódují znovu, neupravují ani se do nich nevkládají metadata nebo označení AI. Soubory jsou ověřované přes SHA-256 manifest a přenášejí se beze změny do běhového `img/`.

V `src/appinfo/info.xml` se používá **první snímek se `small-thumbnail` nastaveným na tutéž URL jako velký přehled**; App Store tak pro kartu použije skutečný barevný screenshot, nikoliv ikonu. Příslušné odkazy:

```xml
<screenshot small-thumbnail="https://raw.githubusercontent.com/hacesoft/FamilyTree/main/src/img/01.png">https://raw.githubusercontent.com/hacesoft/FamilyTree/main/src/img/01.png</screenshot>
<screenshot>https://raw.githubusercontent.com/hacesoft/FamilyTree/main/src/img/02.png</screenshot>
<screenshot>https://raw.githubusercontent.com/hacesoft/FamilyTree/main/src/img/03.png</screenshot>
```

## Postup vydání – důležitá závislost

1. Nejdříve nahrát **nové soubory `src/img/01.png`, `src/img/02.png`, `src/img/03.png`** a upravené metadata do větve `main` repozitáře `hacesoft/FamilyTree`. V repozitáři musí být obsah `full-source.zip` v kořeni, nikoliv v podadresáři `hc_familytree/`.
2. Ověřit každý přímý raw GitHub odkaz metodou HTTP GET: status 200, `Content-Type: image/png`, správné rozměry a SHA-256 bajtů. Pro automatickou kontrolu lze spustit `node scripts/check-appstore-public-urls.cjs` (po uploadu zdrojů na GitHub; vyžaduje přístup k internetu).
3. Teprve po úspěšné kontrole provést nové podepsané vydání Publisherem a registrovat verzi 1.1.5 v Nextcloud App Storu. `build-release.sh` nepodepisuje ani nepublikuje.
4. Poté ověřit veřejnou kartu a galerii v App Storu. Jejich zobrazení závisí i na obrazové cache Nextcloudu; místní build nestačí jako důkaz úspěchu.

Soubory ve vydaném instalačním TAR.GZ musí být pod `hc_familytree/img/`. App Store si **obrázky galerie nestahuje ze složky `img/` v TAR.GZ**, ale z URL v `appinfo/info.xml`. Do TAR.GZ jsou zde screenshoty navíc přibalené pro konzistenci, nikoliv jako náhrada zveřejnění na GitHubu.

Kontrola ikon v HDS/CP21 zůstává blokující a referenční hashe se nesmějí měnit bez schválení vlastníkem. Online URL nemohou mít PASS před zveřejněním souborů.
