# Filtry výzkumného deníku (1.1.0-dev9)

Všechny filtry jsou pouze pohled na uložená data; **nic nemažou ani nemění**. Volby se pamatují v aktuální relaci aplikace pro konkrétní rodokmen a kartu, po změně stromu se resetují.

| Karta | Filtry | Co znamená stav |
| --- | --- | --- |
| Úkoly | Hledaný text/Q, osoba, stav | `planned`, `in_progress`, `waiting_verify`, `done`, `rejected`; původní `DONE` se vyhodnotí jako `done`. |
| Deník hledání | Text, výsledek hledání | `no_result`, `found` atd. podle hodnot záznamů. |
| Nálezy a důkazy | Text, stav důkazu | Stav přezkoumání nebo ověření, nikoli stav úkolu. |
| Návrhy a rozpory | Text, stav návrhu | Čeká / schváleno / odloženo / zamítnuto. |
| Historie změn | Text, typ akce | Auditní historie nemá „stav úkolu“; proto filtruje podle typu akce. |
| Archiv P/F/Q | Hledání, osoba, druh, stav/ověření | Stav Q nebo `verification_status` u F. Záznamy bez stavového údaje zůstávají viditelné v režimu „Všechny stavy“. |
| Matriky a fotografie | Text a osoba | Snímky nemají pracovní stav; filtr podle stavu se nezobrazuje. |
| Statistiky | — | Agregované počty; žádný filtr stavu. |

Zobrazený počet říká **nalezené / aktuálně zobrazené / celkové**. Omezení dlouhých seznamů se aplikuje až po filtraci, takže lze dohledat i starší položky. Filtry nemění export nativního ZIP v2 ani export/import samostatného JSON v1.
