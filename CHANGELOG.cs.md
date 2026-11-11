## 1.1.6 – 2026-11-11

- Screenshoty jsou nyní externě v kořenové složce `screenshot/` GitHubu a nejsou v běhové instalaci ani distribuovaných ZIPech. Metadata používají `screenshot/01.png` až `03.png`.
- Schválená instalační ikona `img/app.svg` zůstává beze změny, doplněna kontrola SHA-256, struktury archivů a veřejných URL před publikací.
- Beze změn rodokmenu, deníku, importu nálezů a databázového schématu.

## 1.1.5 – 2026-11-10

- Nové názvy URL screenshotů (`01.png`, `02.png`, `03.png`) kvůli obnovení cache App Storu; obrazová data i schválené ikony jsou beze změny.
- Hlavní screenshot je také vlastním náhledem karty, bez malého loga.
- Nové obrázky je nutné zveřejnit na GitHubu ještě před registrací vydání; zobrazení galerie ověřit zvlášť.
- Bez změn ve slučovacím importu, datech a schématu.

## 1.1.4 – 2026-11-09

- Přidán nový náhledový a potvrzovaný import dílčích genealogických nálezů do stávajícího rodokmenu.
- Sloučení podle stabilních ID, bez mazání stávajících osob a bez přepisování konfliktních údajů.
- GEDZIP, výzkumný deník a archivní snímky ve společném ZIPu; důkazy s auditní historií.
- Při opakovaném importu deduplikace deníku a archivních souborů.

## 1.1.3 — 2026-11-09

- Karta App Storu a galerie nově používají skutečný schválený snímek rodokmenu bez náhrady logem, podle příkladu Nextcloud Talk.
- Doplněny bitově totožné kopie schválených snímků do `src/img/`, opraveny odkazy a přidáno samostatné online ověřování obrázků.
- Datový model, práva a migrace se nemění.

## 1.1.2 — 2026-11-08

- Opraveno propojení obrázků pro Nextcloud App Store: schválená grafika 512 × 512 je nyní náhled karty `small-thumbnail` prvního snímku, zatímco galerie začíná skutečným přehledem rodokmenu.
- Odstraněno používání malého 64 × 64 náhledu v metadatech; původní soubor i všechny schválené obrázky zůstávají beze změny.
- Přidána blokující kontrola malého náhledu, pořadí galerie a URL. Zobrazení ve veřejné cache vyžaduje následné ověření po publikaci.
- Beze změny funkcí, uložených rodokmenů, databáze a grafických originálů.

## 1.1.1 — 2026-11-08

- Opravné vydání po 1.1.0. Aktualizovaná metadata obrázků v Nextcloud App Storu musí být zveřejněna jako nová verze.
- V `info.xml` jsou přímé GitHub raw odkazy na schválenou grafiku `src/img/app-store.png` a její náhled `src/img/menu-preview.png`, společně se třemi původními snímky aplikace.
- Schválené ikony, obrázky, databázové schéma, genealogická data, formáty importu a exportu ani chování aplikace se nemění.
- Sjednoceny verze metadat, JS/CSS souborů, PHP odkazů, balíčků a veřejných instalačních příruček na 1.1.1.
- Před publikací je stále povinný audit HDS 1.2.1 / Publisher CP21 a podpis balíčku.

## 1.1.0 — 2026-11-08
- Metadata pro Nextcloud App Store nově uvádějí také původní schválený `src/img/app-store.png` s náhledem `src/img/menu-preview.png`; původní tři screenshoty zůstávají zachovány. Odkazy jsou pevně svázané se skutečnými cestami na GitHubu.

- Dokončena úprava zdrojů pro H05: typové prefixy a jejich legenda v JS/PHP, české popisy funkcí, vstupních parametrů a návratových hodnot. Názvy parametrů tras Nextcloudu a šablonové proměnné zůstaly zachovány jako povinné výjimky. Nezávislé schválení HDS 1.2.1 a Publisherem CP21 dosud neproběhlo.
- Připraveny stabilní zdroje 1.1.0 z vývojové verze 1.1.0-dev23, beze změny genealogických dat, struktury DB a formátů záloh.
- Sjednocena verze v metadatech, názvech JS/CSS souborů a odkazech v PHP.
- Česká a anglická dokumentace nyní upřednostňuje podepsanou instalaci z Nextcloud App Storu; `sudo sh install.sh` výslovně jen pro vývojáře/testery na podporovaném Dockeru.
- Oddělen veřejný GitHub ZIP od interních podkladů HDS/CP21. Přípravný TAR.GZ je bez podpisu; schválení Publisherem a podepsání pro App Store ještě zbývá.

## 1.1.0-dev23 — 2026-11-01

- Dokončeny překlady zbývajících 154 klíčů pro DE, ES, FR, IT, NL, PL, PT, SK a UK. Každý z 11 jazyků má 854/854 položek.
- Synchronizován portugalský alias `pt_PT`; aktualizovány přehledné JS/JSON soubory a testy úplnosti překladů.
- Beze změny datový model a funkce rodokmenu. Vydání v CP21 dosud nebylo provedeno.

## 1.1.0-dev22 — 2026-11-01

- Doplněno 360 dalších anglických zdrojových klíčů dev21 do všech devíti zbývajících jazyků (3 240 jazykových hodnot); katalogy dosahují 700 z 854 položek pro de/es/fr/it/nl/pl/pt/sk/uk.
- Zachované české a anglické katalogy, synchronizovaný portugalský alias pt_PT a přehledný zápis všech l10n JS/JSON.
- Posílené regresní kontroly lokalizace, syntaxe a formátu zdrojů; neprohlašovat EN fallback za hotový překlad.
- Neměněny genealogické funkce, uložené záznamy, databázové schéma ani integrace CP21. HDS přísné vydání blokuje až do 100% pokrytí a uzavření ručních bran.

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

## 1.1.0-dev16 — 31. 10. 2026
- Lokalizační audit 11 jazyků. Doplněno devět katalogů se skutečně přeloženými uživatelskými texty; zbývající texty používají EN fallback.
- Přidána kontrola rozsahu překladů a striktní blokace neúplných překladů pro veřejné vydání.
- Angličtina zůstává výchozím jazykem. Funkce a databáze beze změny.

## 1.1.0-dev16 — 31. 10. 2026
- Zaveden společný standard lokalizace Hacesoft: angličtina jako výchozí jazyk, plná čeština, chybová hlášení nativních ZIP záloh a regresní testy.

- Audit českého a anglického rozhraní včetně Výzkumného deníku, importů, statistik a chybových hlášení.
- Spolehlivá angličtina i při výchozím anglickém jazyku Nextcloudu.
- Uživatelské údaje, poznámky a zdrojové záznamy zůstávají beze změny.

## 1.1.0-dev13 — 31. 10. 2026

- Výzkumný deník / Statistiky: podrobné rozdělení je nově vykreslené jako responzivní karty se srozumitelnými názvy událostí a stavů, součty za kategorii a poměrovými ukazateli; všechna původní data a přesné počty zůstávají zachovány.
- Dvojklik myší na název rodokmenu v levém panelu otevře přímo jeho Výzkumný deník na kartě Archiv P/F/Q; jednoduchý klik dále vybírá rodokmen, klávesnicové ovládání zůstává funkční.
- Žádná databázová migrace; screenshoty App Store a metadata zachovány.

## 1.1.0-dev12 — 31. 10. 2026
- Přidány tři původní snímky pro Nextcloud App Store a dodaný malý náhled přehledu do dřívější veřejné složky screenshotů (již nepoužívané), bez zmenšování nebo rekomprese.
- V `src/appinfo/info.xml` nastaveny HTTPS odkazy na snímky v repozitáři GitHub na větvi `main` (po jejich zveřejnění).
- Doplněny kontroly metadat a český/anglický návod. Databáze, GEDCOM i struktura úplné zálohy zůstávají beze změny.

## 1.1.0-dev11 — 31. 10. 2026
- Odstraněna zastaralá informační karta „Dialogy a ovládání“ z nastavení aplikace. Ostatní nastavení, chování, databáze a formáty záloh beze změny.

### 1.1.0-dev10 — Sjednocení importu

- GEDCOM 7 / GEDZIP now imports directly into a newly created tree; separate native backup restore remains available.
- Support ZIP-wrapped GEDCOM (`gedcom.ged`) and clear diagnostics for wrong ZIP types.
- Preflight validation runs before creating a tree; existing trees are never overwritten by native restore.

## 1.1.0-dev9 — 31. 10. 2026
- Volitelný přehled počtů v horní liště, ve výchozím stavu vypnutý.
- Legenda lze posunout i nad postranní panel a lištu, polohu si pamatuje; přepínač a reset v nastavení.
- Bez migrace databáze či změny zálohy.

## 1.1.0-dev9 — 2026-10-30
- Doplněny filtry stavů pro sjednocené původní i nové úkoly Q (vše, plánováno, probíhá, čeká na ověření, hotovo, zamítnuto), průběžné počty a zapamatování filtrů v rámci rodokmenu.
- Deník hledání filtruje podle výsledku, nálezy a návrhy podle stavu, historie podle typu akce, Archiv P/F/Q podle stavu/ověření. Filtrování probíhá před omezením počtu zobrazených položek.
- Žádná databázová migrace ani změna formátu ZIP v2 / JSON v1.

## 1.1.0-dev7
- Přidána bezpečná kontrola historických úkolů Q a nového výzkumného deníku před jednorázovým sjednocením. Nic nemění v databázi.

## 1.1.0-dev7 (2026-10-30)
- Jednotný archivní a aktivní pohled úkolů Q bez kopírování historických údajů, filtrování dle osoby a oprava legendy ID.
- Beze změn databázového schématu a exportních formátů.

## 1.1.0-dev7 (2026-10-30)
- Deník: vyhledatelný pohled na původní P/F/Q/S a další záznamy bez jejich duplikování.
- Filtrování podle osoby, ID, knihy, signatury a typu; propojení na detail osoby.
- Chráněné náhledy uložených skenů a portrétů, odkazy na prameny a dokumenty v Nextcloudu.
- Dokumentace a regresní testy CZ/EN, bez změny databázového schématu.

## 1.1.0-dev4 — 2026-10-30

- Export výzkumného deníku do JSON v1 (úkoly, hledání a důkazy); chráněno kontrolou přístupu ke stromu.
- Opakovaný import JSON exportu do stejného rodokmenu přeskočí existující položky; není to náhrada úplné zálohy.
- Dokumentace úplného ZIP v2, samostatného deníku JSON v1 a badatelského vlákna.
- Beze změn databázového schématu, úplné zálohy v2 a instalačních 16 kroků.

## 1.1.0-dev4 — 2026-10-30
- Oprava SQL `COUNT(*)` ve statistikách, regresní PHP test.
- Opraven chybějící JavaScript Dashboard widgetu.
- Import výzkumného deníku z JSON s náhledem, ochranou proti duplicitám, transakčním zápisem a auditní historií. Bez automatických zásahů do genealogických faktů.
- Záloha v2 a schéma beze změny. Není potřeba spouštět migraci.

## 1.1.0-dev4 — 30. 10. 2026
- Nová karta **Statistiky** ve Výzkumném deníku a nabídka statistik pro jednotlivý rodokmen i všechny vlastní rodokmeny.
- Přesné aktuální počty všech 13 databázových tabulek, závěrečný prostý součet položek a podrobné rozdělení podle typů a stavů bez dvojího započtení.
- Kompletní počet auditních záznamů i při více než 500 položkách, oddělení sdílených rodokmenů od celkových statistik vlastníka.
- Pouze nové čtecí API: beze změny databázového schématu, migračního skriptu nebo formátu úplné ZIP zálohy v2.
- Přidány regresní testy výpočtu součtů, oprávnění a UI; Zachován živý 16krokový instalátor.

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

## 1.0.1-dev6 — 30. 10. 2026
Oprava exportu úplného ZIPu, nové kompaktní UI a palety nástrojů jednotlivých rodokmenů, nastavení v kartách (O aplikaci poslední), oprava artefaktů ve všech aplikačních dialozích přes Scoped CSS Core, zajištění úplného mazání jen vlastních rodokmenů, zachování živého výpisu instalátoru. Lokální syntaktická a regresní kontrola; kontrola vzhledu na NASu zbývá.

# Přehled změn

# 1.0.1-dev6 — 2026-10-30

- Průběh instalace nyní běží průběžně na stderr; zachován jednořádkový výpis 16 kroků a úplný log při chybě.
- Testováno průběžné zobrazení při čekajícím kroku i výpis chyby a diagnostiky.
- Import/export a databázový model bez změn.

# 1.0.1-dev2 — 2026-10-30

- Samostatné nabídky Import a Export. GEDCOM 7 export (.ged) a stávající GEDCOM 7/GEDZIP import.
- Vlastní verzovaná plná záloha FamilyTree ZIP pro jeden nebo všechny vlastní rodokmeny: databázové záznamy, výzkumné varianty, dokumenty, soubory a sdílení.
- Bezpečný náhled a obnova do nových stromů s novými ID, validací a volitelným znovuzapnutím sdílení.
- Instalační skript s průběžným výpisem 16 kroků.

## 1.0.0 — 2026-10-20

První veřejné vydání pro Nextcloud 35.

### Funkce
- Interaktivní genealogie, vztahy a události
- Badatelské záznamy, přílohy a import GEDCOM 7 / GEDZIP
- Sdílení s oprávněními

### Kompatibilita
- Nextcloud 35.
- Vyžaduje Hacesoft Shared App Core 0.18.8 nebo novější.
