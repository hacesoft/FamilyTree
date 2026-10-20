[🇨🇿 **Česky**](03_DATA.md) | [🇬🇧 English](../en/03_DATA.md)

# GEDCOM 7 / GEDZIP a výzkumné údaje

Aplikace přijímá FamilySearch GEDCOM 7 (`.ged`) a GEDZIP (`.gdz`). V archivu musí ležet `gedcom.ged` v kořeni. Každá lokální cesta `FILE` musí být bezpečná a odkazovaný soubor musí v GEDZIP skutečně existovat. Pro obrázky se před zápisem kontroluje obsah a deklarovaný MIME typ; chybějící či neplatný obrázek import zastaví. PNG, JPEG, GIF a WebP se ukládají do Souborů a zpřístupní v detailu osoby nebo události. Ostatní typy médií mají záznam s metadaty a zůstávají v archivovaném originálu.

## Import do nového stromu

1. Vytvořte prázdný rodokmen a v nabídce **⋮ → Import GEDCOM 7 / GEDZIP** vyberte soubor.
2. Zadejte stálé označení sady, například `genealogie`, a vyberte **Importovat do prázdného stromu**.
3. Klikněte na **Zkontrolovat soubor**. Náhled ukáže osoby, rodiny a vztahy, události, standardní i badatelská tvrzení, prameny, citace, média, místa, úkoly, poznámky a neznámé poznámky. Zkontrolujte také konflikty a chybějící soubory.
4. Klikněte na **Importovat zkontrolovaná data**. Aplikace znovu kontroluje SHA-256 nahraného balíčku; změněný soubor vyžaduje nový náhled.

## Aktualizace úplné sady

Otevřete tentýž rodokmen, použijte **stejné označení sady** a vyberte **Aktualizovat tuto sadu podle UID**. Náhled ukáže nové, změněné a již nepřítomné záznamy. Přenos porovnává osobu a rodinu podle GEDCOM `UID`, nikdy pouze podle jména. Změněnou osobu či rodinu bez UID nelze bezpečně synchronizovat. Stejný soubor znovu nevytváří duplicity.

Po potvrzení se změny promítnou do výzkumných dat. Základní údaje osoby a události ve stromu se aktualizují jen tehdy, pokud je uživatel od předchozího importu ručně nezměnil. Chybějící starší záznamy zůstávají označené pro ruční kontrolu. Jejich rodičovské spojnice se už nekreslí. Změna členů již zobrazeného vztahu se záměrně zastaví, dokud se původní spojnice ručně neposoudí. Výsledek ukáže počty i upozornění; původní verze souboru má vlastní archivovanou kopii.

## Jak se uchovají údaje

Standardní `NAME`, `BIRT`, `MARR` a další opakované údaje mají vlastní záznamy. První standardní údaj může být použit ve stromu, varianty zůstávají v detailu. `FAMC.STAT CHALLENGED` se kreslí přerušovaně, `DISPROVEN` zůstává v evidenci bez spojnice. `PEDI` se zachová. `SOUR` a jednotlivé citace včetně `PAGE`, `DATA.TEXT` a `QUAY` jsou oddělené; `QUAY` není zaměňován s badatelským procentem jistoty.

Sdílené poznámky `@NF_…@ SNOTE` se převádějí na jednotlivá výzkumná tvrzení `Fxxxxx`, `@NP_…@ SNOTE` na katalog míst a `@NR_…@ SNOTE` na úkoly a CHECKPOINTy. Pokračování `CONT` patří k předchozímu tvrzení, dokud nezačne nové `Fxxxxx —`. Stav tvrzení, jistota, původní text, zdroj i lokátor zůstanou oddělené. Vazby `SNOTE` na osoby, rodiny, události, prameny a citace se zachovají. Neznámé `NOTE/SNOTE` jsou v **Výzkumných záznamech → Poznámky / ostatní výzkumná data** a nepřicházejí o původní text a podstrom.

Při přijetí balíčku se původní `.ged`/`.gdz` ukládá beze změn do **Soubory/Rodokmen/Import/ID_stromu/**. Tento originál je podkladem pro úplnou archivaci a případný budoucí export. Aplikace zatím nevytváří plný zpětný GEDZIP export; pro zálohu si ponechte originál a zálohujte databázi i Soubory. Před instalační aktualizací se stávající osoby a výzkumné záznamy nemažou.

Na serveru s PHP CLI lze ověřit mapování NF/NP/NR a odmítnutí chybějícího snímku příkazem `php scripts/test-gedcom-research.php` z kořene zdrojového projektu. Instalační skript před aktivací kontroluje syntaxi všech PHP souborů na cílovém serveru.
