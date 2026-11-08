# Statistiky rodokmenu (FamilyTree 1.1.0-dev7)

- Otevři konkrétní rodokmen → **⋯ → Statistiky rodokmenu**, případně **⋯ → Výzkumný deník → Statistiky**.
- Pro součet všech vlastních stromů otevři **⋯ u názvu aplikace → Statistiky všech mých rodokmenů**.
- Počty se načítají živě z databáze až při otevření přehledu. Nemažou a neupravují záznamy.
- Statistika zahrnuje všech 13 tabulek, každou položku **právě jednou**. Rodokmen se započte jako jedna položka, další řádky jsou osoby, vztahy, události, dokumenty, vazby, sdílení, původní výzkumné záznamy, úkoly, hledání, důkazy, návrhy a historie.
- Poslední řádek je **Celkem položek (prostý součet)**, nikoli počet lidí ani historicky vytvořených záznamů. Podrobné dělení podle typů a stavů součet nezvyšuje.
- U historie se uvádí počet všech auditních řádků, ačkoli stránka historie zobrazí maximálně 500 nejnovějších.
- Globální přehled obsahuje pouze uživatelem **vlastněné** stromy; cizí sdílené rodokmeny nejsou připočteny.
- Binární soubory v exportním ZIPu nejsou samostatnou databázovou tabulkou a nepřidávají se do tohoto součtu. Příslušné záznamy médií mohou být zahrnuty mezi importovanými výzkumnými záznamy.

## Nasazení

Vydání dev2 nemění schéma ani ZIP v2. Po úspěšné migraci z dev1 se spouští pouze aktualizace přes `install.sh`, další `migrate-research-v2.php --apply` není potřeba.
