## 1.1.6 – 2026-11-11

- Schválené screenshoty `01.png`, `02.png`, `03.png` zůstanou výhradně v externí kořenové složce `screenshot/` na GitHubu. Změněny jen odkazy v `info.xml`, nikoli obsah obrázků.
- Z veřejného zdrojového ZIPu a podepsané aplikace odstraněny screenshoty i nepotřebné doplňkové PNG; instalační ikona `img/app.svg` zůstává bitově nezměněná.
- Kontrola sestavení vynucuje nepřítomnost screenshotů v archivech, platnou schválenou ikonu a přesné URL; samostatná online kontrola před podpisem ověřuje HTTPS dostupnost a SHA-256 vzdálených screenshotů.
- Zachován slučovací import výzkumných nálezů, databáze a všechny ostatní funkce.

## 1.1.5 – 2026-11-10

- Opraveno navázání screenshotů na obrazovou cache Nextcloud App Storu změnou veřejných názvů souborů (`01.png`, `02.png`, `03.png`); původní obsah obrázků zůstává bitově totožný.
- První skutečný screenshot nyní slouží také jako `small-thumbnail` (stejná URL), aby se na kartě nepoužívalo malé logo.
- Před registrací vydání je nutné nahrát nové soubory na GitHub `main` a ověřit veřejné URL; provozní zobrazení galerie není místním testem garantováno.
- Bez změn výzkumného importu 1.1.4, databáze a schválených ikon.

## 1.1.4 – 2026-11-09

- Přidán nový náhledový a potvrzovaný import dílčích genealogických nálezů do stávajícího rodokmenu.
- Sloučení podle stabilních ID, bez mazání stávajících osob a bez přepisování konfliktních údajů.
- GEDZIP, výzkumný deník a archivní snímky ve společném ZIPu; důkazy s auditní historií.
- Při opakovaném importu deduplikace deníku a archivních souborů.

## 1.1.3 — 2026-11-09

- Aligned App Store image roles with the official Nextcloud Talk pattern: the first original UI screenshot is also the catalog card cover, without a logo-only `small-thumbnail`.
- Public screenshot URLs now point to the reliable `src/img/` repository location; original approved image bytes remain unchanged and are present in the runtime `img/` as well.
- Added separate verification of public GitHub image URLs and clarified deployment order; local HDS checks remain mandatory.
- No changes to genealogical data models, permissions or migrations.

## 1.1.2 — 2026-11-08

- Corrected App Store first screenshot pairing: the approved 512 × 512 branding image now serves only as the app-card `small-thumbnail`, while the gallery opens with the actual family-tree overview.
- Removed the 64 × 64 preview from App Store metadata without modifying or deleting the approved source image. The other two gallery screenshots remain unchanged.
- Hardened local asset validation so a tiny preview, wrong screenshot order or incorrect GitHub URL blocks packaging. External App Store image caching still requires a separate post-publication check.
- No changes to genealogical data, application functionality, approved image bytes or database schema.

## 1.1.1 — 2026-11-08

- Patch release after 1.1.0, required to publish updated Nextcloud App Store image metadata as a new version.
- App Store metadata link to the approved `src/img/app-store.png` cover and `src/img/menu-preview.png` thumbnail via direct GitHub raw URLs, alongside three original application screenshots.
- Approved icon and image bytes, database schema, genealogy data, import/export formats and core application behavior remain unchanged.
- Aligned `info.xml`, versioned JS/CSS filenames, PHP asset references, package manifests and public installation guides to 1.1.1.
- The release must still pass the independent HDS 1.2.1 / Publisher CP21 process and be signed before publication.

## 1.1.0 — 2026-11-08

- Completed H05 source-documentation pass: Hungarian-type prefixes and legends for internal JS/PHP variables; Czech descriptions of functions, input parameters and return types. Kept Nextcloud route/template variable names intact as framework-contract exceptions. Independent HDS 1.2.1 and Publisher CP21 release approval is still pending.
- Prepared stable 1.1.0 source from development baseline 1.1.0-dev23 without changing genealogical data formats or database schema.
- Unified app metadata, package version, versioned JS/CSS assets and all runtime references.
- Updated Czech/English public documentation: signed Nextcloud App Store installation is primary; `sudo sh install.sh` is developer/tester-only on supported Docker deployments.
- Separated public GitHub source from internal HDS/CP21 test material. Unsigned TAR.GZ is staging only; publishing still requires independent HDS/Publisher checks, Nextcloud code-signing and final TAR.GZ signature.

## 1.1.0-dev23 — 2026-11-01

- Dokončeno všech 154 dosud chybějících anglických zdrojových klíčů ve všech devíti dalších jazycích (1 386 skutečných překladových hodnot). Všech 11 jazyků nyní obsahuje 854/854 položek; pt_PT kopíruje portugalský katalog.
- Synchronizované, čitelně formátované soubory `l10n/*.json` a `l10n/*.js`. Přísná lokalizační kontrola ověřuje shodné klíče, nenulové hodnoty, parametry a shodu JS/JSON.
- Nový regresní požadavek na 100% katalogové pokrytí; nedochází ke změně genealogických údajů, databázového schématu ani importních formátů.
- Vývojové vydání: jazykovou správnost je vhodné průběžně ověřovat při uživatelském testování; HDS vyžaduje také nezávislé ruční brány a CP21 nebyl spuštěn.

## 1.1.0-dev22 — 2026-11-01

- Doplněno 360 dalších anglických zdrojových klíčů dev21 do všech devíti zbývajících jazyků (3 240 jazykových hodnot); katalogy dosahují 700 z 854 položek pro de/es/fr/it/nl/pl/pt/sk/uk.
- Zachované české a anglické katalogy, synchronizovaný portugalský alias pt_PT a přehledný zápis všech l10n JS/JSON.
- Posílené regresní kontroly lokalizace, syntaxe a formátu zdrojů; neprohlašovat EN fallback za hotový překlad.
- Neměněny genealogické funkce, uložené záznamy, databázové schéma ani integrace CP21. HDS přísné vydání blokuje až do 100% pokrytí a uzavření ručních bran.

## 1.1.0-dev21 — 2026-11-01

- Dalších 56 skutečných překladových klíčů ve všech 9 doplňovaných jazycích (504 nových hodnot); angličtina a čeština zachovány.
- Přeznačení historické CP19 kontroly na neutrální `source-check.cjs` bez změny jejího technického rozsahu.
- Samostatné vstupní body auditu HDS 1.1.0 a jasné odlišení od Publisheru CP21.
- Beze změny databázového schématu a genealogických funkcí; HDS release stále blokuje chybějící překlady.

## 1.1.0-dev20 — 2026-11-01

- Dokončeno čitelné zalamování hlavního zdrojového JavaScriptu bez řádků nad 240 znaků, zachované výsledné HTML šablony; odstraněn redundantní anglický slovník v aplikaci. Angličtina je přímo kanonický fallback.
- Odstraněno překrytí některých anglických zdrojových klíčů historickými českými aliasy (například `restore`), při zachování kompatibility starých českých hlášení.
- Doplněno 30 překladů skutečných popisků ve všech devíti dalších jazycích (270 nových položek), včetně synchronizace JSON/JS katalogů. Neúplné jazyky mají nyní 284/854 položek.
- Nové regresní testy struktury JavaScriptu, odstraněné duplicity a nových lokalizačních položek. Žádná změna databázového schématu, GEDZIP, zálohování ani výzkumných záznamů.
- Blokující položky před App Store: 5 130 dosud nepřeložených položek, věcná revize komentářů, provozní test na Nextcloudu 35, certifikát a dostupnost screenshotů.

## 1.1.0-dev19 — 2026-11-01

- Oprava testovacího mechanismu: `npm test` nyní před všemi regresními testy ověřuje syntaxi skutečných zdrojových JavaScriptových souborů, včetně lokalizačních souborů. Předejde falešnému PASS při poškozeném hlavním JS.
- Další opatrné rozdělení dlouhých řádků v hlavním JS, každá změna jednotlivě ověřená syntakticky a kompletní sadou 87 regresních testů. Původní HTML řetězce a data nebyly úmyslně změněny.
- Věcně opraveno 178 zavádějících `@return` dokumentačních komentářů PHP metod, včetně rozlišení návratových typů `DataResponse`, `Response`, `array`, `string`, `void` a dalších.
- Nezměněno databázové schéma, historie výzkumu, GEDZIP ani zálohovací formát. Bez zásahů do Publisheru.
- Otevřené blokující body HDS: dosud 5 400 překladů v devíti jazycích, nezrevidované dokumentační komentáře, zbývající dlouhé řádky a ruční kontroly Nextcloud 35, certifikátu a dostupnosti snímků App Storu.

## 1.1.0-dev18 — 2026-11-01

- Opraveny anglické zdrojové texty serveru: 214 převedených českých zpráv, následně doplněny chybové a dynamické zprávy pro práci s osobami, GEDCOM a výzkumnými záznamy.
- Šest nových bezpečnostních a validačních hlášení má skutečné překlady v celé 11jazykové sadě; synchronizována překladová data `en`, `cs` a alias `pt_PT`.
- Zachovány archivní značky, původní data a identifikátory výzkumného deníku. Žádná databázová migrace.
- Doplněny české dokumentační komentáře k 126 pojmenovaným JS funkcím a 189 PHP metodám; zpřehledněno 38 JS funkcí s průběžnými regresními testy.
- Udrženy kompletní zdroje, 4 originální snímky App Storu a samostatný HDS kontrolor bez zásahů do Publisheru.
- Nedokončené: 600 starších překladů v každém z devíti dalších jazyků; dlouhé řádky v hlavním JS; ruční bezpečnostní a integrační kontroly na NC35.

## 1.1.0-dev17 — 2026-10-31

- Připojen kontrolní profil Hacesoft Development Standard 1.1.0 (samostatný kontrolor, bez změn Publisheru).
- Zpřehledněn Core Guard a doplněna česká dokumentace jeho funkcí a prefixů; žádné nové funkce ani změny databáze.
- Přidán příkaz scripts/check-hds.sh pro audit baseline/release; výsledky podléhají přísným kontrolám HDS.
- Nedokončené překlady a část komentářů hlavního JS zůstávají otevřeným blokujícím nálezem, nikoliv schváleným vydáním.

## 1.1.0-dev16 — 2026-10-31
- Localization audit across the shared 11-language set; added nine partially translated catalogs with English fallback.
- Added translation coverage reporting and a strict full-coverage gate for public release.
- No feature or database schema changes.

## 1.1.0-dev16 — 2026-10-31
- Enforce the project-wide localization standard: English default/fallback, Czech translation and catalog-based user interface; add localized native ZIP restore diagnostics and regression tests.

- Audit Czech and English translations across the main app, Research Journal, statistics, import/export, errors and Dashboard widget.
- Add deterministic English fallback for instances where Nextcloud does not load an English JavaScript catalog.
- Localize known server validation/warning messages while preserving user-authored notes and imported records.
- No data model changes, migrations or new features.

## 1.1.0-dev13 — 2026-10-31

- Journal statistics: responsive breakdown cards with localized names, category totals and relative proportions, preserving underlying database counts.
- Double-clicking a family tree name in the sidebar opens that tree's Research Journal (P/F/Q archive); single click selects the tree and keyboard selection is unchanged.
- No database migration; App Store screenshots and metadata retained.

## 1.1.0-dev12 — 2026-10-31
- Added three original App Store screenshots and the supplied dedicated overview thumbnail under dřívější veřejné složky screenshotů (již nepoužívané) without scaling or recompression.
- Declared screenshot HTTPS URLs in `src/appinfo/info.xml`, referencing the GitHub `main` branch once those images are published there.
- Added screenshot metadata validation and publishing instructions (CZ/EN). No database migration or changes to GEDCOM/ZIP data formats.

## 1.1.0-dev11 — 2026-10-31
- Removed the obsolete informational "Dialogs and controls" card from application settings. No settings, behavior, schema or backup formats were changed.

### 1.1.0-dev10 — Unified import routing

- GEDCOM 7 / GEDZIP now imports directly into a newly created tree; separate native backup restore remains available.
- Support ZIP-wrapped GEDCOM (`gedcom.ged`) and clear diagnostics for wrong ZIP types.
- Preflight validation runs before creating a tree; existing trees are never overwritten by native restore.

## 1.1.0-dev9 — 2026-10-31
- Optional tree summary in main toolbar (off by default), no duplicate canvas overlay.
- Legend dragging over the entire application area (sidebar, toolbar, stage), with saved position, toggle and reset (no migration of previous locations).
- No database migration, existing native backup format unchanged.

## 1.1.0-dev9 — 2026-10-30
- Doplněny filtry stavů pro sjednocené původní i nové úkoly Q (vše, plánováno, probíhá, čeká na ověření, hotovo, zamítnuto), průběžné počty a zapamatování filtrů v rámci rodokmenu.
- Deník hledání filtruje podle výsledku, nálezy a návrhy podle stavu, historie podle typu akce, Archiv P/F/Q podle stavu/ověření. Filtrování probíhá před omezením počtu zobrazených položek.
- Žádná databázová migrace ani změna formátu ZIP v2 / JSON v1.

## 1.1.0-dev7
- Add a read-only preflight audit for historic Q tasks and imported research journal entries; no database changes.

## 1.1.0-dev7 (2026-10-30)
- Sjednocený pohled výzkumných úkolů: původní Q z poznámek a výzkumné vrstvy + nové úkoly JSON, bez duplikací.
- Importní původní Q čerpá z append-only auditní historie; kolidující kódy z různých původů neslučujeme bez jednoznačné vazby.
- Úkoly lze procházet a filtrovat podle osoby; v detailu osoby je přímý odkaz na související úkoly.
- Archiv P/F/Q doplněn o Q z původních poznámek (jen pokud není archivní řádek), údaje o pokusech, výsledcích a kontrolních bodech.
- Opraveno překrývání textů vysvětlivky identifikátorů v portálových dialogových oknech Shared App Core.
- Bez migrace databáze, bez změny ZIP v2 či JSON deníku v1, beze změny genealogických faktů a oprávnění.
- Rozšířena dokumentace CZ/EN a regresní testy.

## 1.1.0-dev7 (2026-10-30)
- Journal's archive P/F/Q view: live, searchable projection of existing research data without duplicating legacy facts.
- Research book/scan/person filters and ID legend; linked original person detail.
- Protected, lazy-loaded thumbnails for existing GEDZIP scans and person photos; links to archived sources and Nextcloud documents.
- CZ/EN docs and regression tests. No schema/backup-format changes.

## 1.1.0-dev4 — 2026-10-30

- Export výzkumného deníku do JSON v1 (úkoly, hledání a důkazy); chráněno kontrolou přístupu ke stromu.
- Opakovaný import JSON exportu do stejného rodokmenu přeskočí existující položky; není to náhrada úplné zálohy.
- Dokumentace úplného ZIP v2, samostatného deníku JSON v1 a badatelského vlákna.
- Beze změn databázového schématu, úplné zálohy v2 a instalačních 16 kroků.

## 1.1.0-dev4 — 2026-10-30
- Chybové HTTP odpovědi nyní vždy ukazují konkrétní chybu (nejméně HTTP status), místo prázdné černé notifikace.
- Opraven výpočet statistik na MariaDB/Nextcloud 35: SQL `COUNT(*)` se nyní vytváří přes `selectAlias($qb->func()->count('*'), 'total')`, nikoliv jako neexistující sloupec. Přidán regresní PHP test skutečné sestavy dotazu.
- Opraven chybějící JavaScript widgetu Dashboard: soubor `dashboard-1.1.0-dev4.js` odpovídá přesnému názvu načítanému PHP widgetem.
- Nový import výzkumného deníku ze strukturovaného JSON s náhledem a bezpečným potvrzením. Samostatné úkoly, hledání a kandidátní důkazy; výchozí genealogická fakta se automaticky nemění.
- Opakovaný import stejné zdrojové sady nevytváří duplicity; zápisy jsou transakční, s kontrolou oprávnění, návaznosti na úkoly a auditním záznamem. Vnější soubor nesmí označit důkazy automaticky za ověřené.
- Přiložen český návod na import a předávání výzkumu v JSON. Ukázkový rodinný import je distribuován odděleně od veřejného zdrojového archivu.
- Formát úplné zálohy FamilyTree v2 a databázové schéma jsou beze změny. Opakovaná migrace stabilních ID není potřeba.

## 1.1.0-dev2 — 2026-10-30
- Statistiky přímo ve Výzkumném deníku vedle Historie změn. Zobrazují počty všech 13 druhů databázových záznamů a nakonec prostý součet.
- Přehled konkrétního stromu i všech vlastních stromů přes tři tečky. Samostatně rozpad typů vztahů, událostí, importovaných záznamů a výzkumných stavů.
- Historie se počítá celá (není omezena na posledních 500 záznamů). Podskupiny se nepřičítají podruhé, sdílené stromy se nedostávají do souhrnu vlastníka.
- Čistě čtecí API a PHP testy. Beze změny schématu, formátu ZIP v2 a migračního skriptu.

## 1.1.0-dev1 — 30. 10. 2026
- Výzkumný deník s kartami Úkoly, Deník hledání, Nálezy/důkazy, Návrhy/rozpory a Historie změn.
- Trvalý audit ručních úprav, dělení genealogických faktů od kandidátních nálezů a řízené schvalování návrhů údajů osoby.
- Stabilní technická ID (32 hex znaků) pro přenos dat mezi interními identifikátory databáze.
- Záloha FamilyTree ZIP `formatVersion: 2` nově zahrnuje všech 13 tabulek včetně auditních událostí.
- Jednorázový skript `scripts/migrate-research-v2.php` (dry-run / --apply) pro současnou vývojovou instalaci.
- Starý proprietární ZIP v1 se již neimportuje. GEDCOM 7 zůstává samostatný výměnný formát.
- Vracení změn je záměrně omezené na bezpečné úpravy údajů osob; mazání stromu je nevratné bez plné zálohy.
- Průběžný 16krokový instalátor zachován; provoz na konkrétním NASu je nutné ověřit.

## 1.0.1-dev6 — 2026-10-30
- Každý rodokmen má nyní jedinou nabídku ⋯ otevírající plovoucí kontextové menu (úprava, sdílení, import, export, výzkum, rozmístění, smazání) s kontrolou oprávnění.
- Zoom v hlavičce ukazuje jen − / procenta / +; opraveno zobrazení procent i na mobilu.
- Opraven ořez stavových hlášení pod akcemi: úplný ZIP export, GEDCOM export, úplný ZIP import, GEDCOM import a mazání.
- Obnovena omylem odstraněná implementace importu vlastní kompletní ZIP zálohy včetně náhledu a SHA-256 kontroly.
- Přidány regresní testy plovoucí nabídky, zoomu a import/export dialogů. NAS vizuální ověření zbývá.
- Žádná změna databázového schématu ani Shared App Core; zachován průběžný 16-krokový instalátor.

## 1.0.1-dev6 — 2026-10-30
- Oprava zálohovacího exportu na skutečnou API cestu `/api/backups/native`; možnost exportu všech vlastních stromů i konkrétního otevřeného.
- Nová paleta nástrojů pro každý rodokmen, trojtečkové menu aplikace, přesunutí zobrazení a zoomu do hlavičky; odstraněna duplicitní plovoucí lišta.
- Kompaktní nastavení s kartou „O aplikaci“ jako poslední, ochrana mazání všech vlastních stromů potvrzovacím textem a transakčním mazáním.
- Opravena chyba po odstranění původní nabídky akcí (historie rozmístění) a neexistující volání `renderConnections`.
- Kontrola dialogů: opravena CSS pravidla fokusů, rádiových tlačítek a checkboxů v oknech Shared App Core mimo kořen FamilyTree. Vizuální kontrola na skutečném NASu zbývá.
- Zachován šestnáctikrokový instalační postup se živým výpisem.

# Changelog

# 1.0.1-dev6 — 2026-10-30

- Opraven živý výstup instalačních kroků: stav `[xx/16] ... OK` se zapisuje přímo na původní stderr a není zadržen přesměrováním stdout do logu.
- Doplněn integrační test okamžitého výpisu ještě za běhu kroku a test diagnostiky selhání.
- Import, export a databázový model zůstávají stejné jako ve verzi 1.0.1-dev2.

# 1.0.1-dev2 — 2026-10-30

- Import a export jsou samostatná tlačítka přímo v bočním panelu, také bez otevřeného stromu.
- Výchozí export je úplná záloha všech vlastních rodokmenů, s možností přepnout na GEDCOM 7 u otevřeného stromu.
- Přehlednější omezení velikosti a zachování přesného názvu souboru ze serveru.
- Doplněn test dostupnosti exportního rozhraní a serverového směrování.
- Opraven limit importu ZIPu: nyní zahrnuje i databázovou část, takže validní export není odmítnut při následné obnově.

- Samostatné nabídky Import a Export. GEDCOM 7 export (.ged) a stávající GEDCOM 7/GEDZIP import.
- Vlastní verzovaná plná záloha FamilyTree ZIP pro jeden nebo všechny vlastní rodokmeny: databázové záznamy, výzkumné varianty, dokumenty, soubory a sdílení.
- Bezpečný náhled a obnova do nových stromů s novými ID, validací a volitelným znovuzapnutím sdílení.
- Instalační skript s průběžným výpisem 16 kroků.

## 1.0.0 — 2026-10-20

First public source release for Nextcloud 35.

### Features
- Interactive genealogy, relationships and events
- Research records, photos, documents and GEDCOM 7 / GEDZIP import
- Sharing with access permissions

### Compatibility
- Nextcloud 35.
- Requires Hacesoft Shared App Core 0.18.8 or newer.
