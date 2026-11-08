# Archiv osob, zdrojových tvrzení, skenů a fotografií

## Zásada: propojený pohled, nikoli duplicitní import

Od 1.1.0-dev7 se v **Výzkumném deníku** zobrazují přímo existující záznamy z `hc_familytree_research`, vedle nového deníku úkolů/hledání/důkazů. Ani tisíce starších tvrzení se nekopírují do `hc_familytree_research_tasks`. Jde o propojený, pouze čtecí pohled; změna v původní vrstvě se po opětovném načtení projeví. Nezakládat z informací ve výpisu automaticky nový prokázaný fakt.

### Identifikátory

- **P…**: osoba původního genealogického archivu; `external_id` se váže na `origin_key` a interní `native_id`. Původní P-ID není databázové SQL ID.
- **F…**: jednotlivé badatelské tvrzení (`research_facts`), jeho druh, původní hodnota, normalizovaná hodnota, stav ověření, pracovní jistota a lokátor. Je-li více tvrzení, zachovávají se odděleně; význam jistoty není statistická pravděpodobnost.
- **Q…**: historický výzkumný úkol (`research`), včetně checkpointu, průběhu, výsledku a dalšího kroku.
- **S…**: archivní pramen či matrika (`sources`) – název, archiv, signatura a odkaz.
- **C… / M…**: citace a mediální záznam. **R… / E…**: vztahy a události. Jde o typové vodítko, **skutečný význam určuje `entity_type` a původní importní sada**, nikoliv pouhé první písmeno. U všech položek je zachován `origin_key`.
- Nové úkoly/záznamy z deníku JSON v1 mají vlastní stabilní identifikátor `source` + `source_id` a oddělené tabulky. Nesměšovat ho s P/F/Q ID ze staršího původního archivu.

### Ovládání

Otevřít `⋯` u názvu rodokmenu → **Výzkumný deník** → **Archiv P/F/Q**. První otevření ukazuje existující původní informace automaticky. Lze hledat podle ID (`P0027`, `F00274`, `Q0003`), jména, lokátoru, signatury (`12437`), názvu knihy nebo části textu. Zúžení podle osoby a typu záznamu. Po kliknutí na **Otevřít osobu** se zobrazí její údaje a související zdroje. U každé osoby je také **Otevřít všechny výzkumné záznamy osoby v deníku**.

### Skeny a fotografie

**Matriky a fotografie** zobrazují média importovaná z GEDZIP jako kartičky s náhledem, názvem, zdrojem, právy a možností otevřít celý soubor. Zobrazení lokálního skenu používá chráněný endpoint `/api/research/media/{id}`. Backend nejprve ověří práva ke konkrétnímu rodokmenu, poté velikost i povolený obrázkový MIME; nenačítá soubor přes veřejnou cestu. Chybějící média se nevymýšlejí; externí zdroje zůstávají odkazy, nenačítají se automaticky jako vložené obrázky.

Karta **Fotografie osob a připojené dokumenty** umožňuje přístup k URL fotografií osob a dokumentům uloženým přes Nextcloud Files. U fotografií dostupných pouze z externího webu se náhled načte **až po výslovném kliknutí** na „Načíst náhled externí fotografie“; lokální URL stejné domény lze zobrazit přímo. Externí URL nemusí představovat lokální uložený soubor. Pro budoucí plnohodnotné nahrávání nových portrétů doporučujeme vazbu přes bezpečné úložiště Nextcloudu; současné UI zde zobrazuje již evidované fotografie a dokumenty, ale nevytváří novou službu uploadu.

V **detailu osoby** jsou nyní u svázaných uložených skenů či portrétů přímo obrázkové náhledy; ostatní odkazy zůstávají pouze odkazy. Původní skeny ani fotografie se při prohlížení nekopírují, nemažou ani neposílají externí službě.

### Export a kompatibilita v době vývoje

**Kompletní ZIP v2** uchovává původní výzkumné řádky, jejich ID, přílohy a všech 13 tabulek. **JSON deníku v1** nadále přenáší pouze nové úkoly, hledání a důkazy; samotné P/F/Q záznamy ani binární skeny a fotografie neobsahuje. Podrobné struktury obou formátů najdete v `FORMATY_IMPORT_EXPORT.md`. Tento vývojový přídavek nemění DB schéma ani formát zálohy. Vždy ověřit vytvoření kompletní ZIP zálohy a přístup ke skenům na NAS.


## Sjednocené výzkumné úkoly Q (od 1.1.0-dev7)

Starší úkoly se mohou nacházet v tabulce importovaných záznamů `hc_familytree_research`
(`entity_type=research`) nebo pouze v původních poznámkách osoby, kde je text jako
`Výzkumný úkol Q0002 — …`. Nové úkoly jsou v `hc_familytree_research_tasks`.
**Jde o různé reprezentace téhož badatelského cíle, ne automaticky o další úkoly.**

- Karta **Úkoly** sestavuje pouze čtecí společný pohled: nejprve původní Q a pak aktuální úkoly.
  Při jednoznačném společném původním označení Q je prezentuje jako **jeden logický úkol**.
  Součástí karty jsou historické pokusy, výsledek, checkpoint i další krok; původní data zůstanou neměnná.
- Původní označení Q importovaných úkolů se dohledává ze záznamu jejich vzniku v auditní historii.
  Interní `stable_id` a původní lidské ID `Q0002` **nejsou totéž**.
- Pokud více různých zdrojů používá stejné Q a nelze jednoznačně rozpoznat tentýž úkol,
  oba se zobrazí odděleně s označením původu. Nic se automaticky neslučuje podle samotného názvu.
- Původní Q bez aktivního protějšku má označení **Původní archiv – pouze ke čtení**;
  nevytváří se v databázi druhý úkol. Aktuální úkol lze upravit a změny se auditují.
- Archiv P/F/Q nabízí skutečný filtr **Q – výzkumné úkoly**. U detailu osoby je
  přímé otevření jejích úkolů na kartě Úkoly.
- Statistika **Výzkumné úkoly** vyjadřuje počet fyzických databázových záznamů v nové tabulce,
  nikoliv počet historických Q projektovaných z textů. Počet v pohledu Úkoly je **logický**.

Příklad: Anna Dostálová má z původního výzkumu `Q0002` a `Q0006`; pokud byly
oba importovány do nového deníku, uvidíte po jednom záznamu každého Q.
Dokončený `Q0003` Karla Schwarze zůstane viditelný z původních podkladů,
i když ještě není v novém JSON deníku. Propojení dat neznamená nový matriční nález.

