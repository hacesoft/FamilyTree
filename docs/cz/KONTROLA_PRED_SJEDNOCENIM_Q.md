# Kontrola před jednorázovým sjednocením úkolů Q

Tento nástroj **jen čte** databázi FamilyTree. Neprovádí žádné změny. Je určený pro vývojovou instalaci, kde již byly nainstalovány tabulky deníku a stabilní ID.

## Proč kontrolujeme před opravou

- Staré `Q0002`, `Q0006`, `Q0003` mohou být v archivních řádcích `hc_familytree_research`, poznámkách osoby a také v `hc_familytree_research_tasks` po JSON importu.
- Stejný text `Q0002` z různých importních zdrojů **nemusí označovat stejný úkol**. O původu rozhoduje `origin_key`, vazby na původní ID osob a audit importu.
- Samotný export a obnovení úplné zálohy duplicitní úkoly ani textové poznámky nesjednotí.

## NAS – nejprve bez zápisu

Po rozbalení **kompletního Full Source ZIPu** v adresáři projektu:

```sh
sudo docker cp scripts/QTaskInspector.php nextcloud-app:/tmp/QTaskInspector.php
sudo docker cp scripts/inspect-q-before-repair.php nextcloud-app:/tmp/inspect-q-before-repair.php
sudo docker exec -u root nextcloud-app chmod 644 /tmp/QTaskInspector.php /tmp/inspect-q-before-repair.php
sudo docker exec -u www-data nextcloud-app php /tmp/inspect-q-before-repair.php --tree-id=2
```

Zaměňte `2` za skutečné SQL ID stromu v aktuálním NASu. Skript před spuštěním vypíše název stromu.

### Výklad výsledků

- **Již jednoznačně propojeno** – stejné Q je jak v původním archivu, tak ve stávajícím deníku; pouze kontrola, nikoli důvod pro druhý INSERT.
- **Pouze v původním archivu** – např. dokončený úkol Q0003; vhodný k pozdějšímu založení v editovatelné evidenci s původními podklady.
- **Pouze v novém deníku** – nově založený/importovaný úkol; do historie se nemá uměle přidávat další kopie.
- **NEJASNÁ SHODA** – kód Q je v několika různých importních zdrojích nebo je založeno několik nových úkolů se stejným Q; vyžaduje ověření osoby a původu.

Nástroj neprovádí automatické spojování osob, změny vztahů, změny stavu matričních důkazů ani přesun médií. Po zkontrolování skutečného výpisu se připraví úzce cílený **transakční opravný skript**, který bude mít vlastní dry-run a bezpečnostní kontrolu.

Pokud existuje původní úplný GEDCOM/GEDZIP nebo nativní ZIP, porovnání s ním pomůže odhalit, které Q pochází ze stejné importní sady. **Nikdy soubor znovu neimportovat jen kvůli této kontrole.**
