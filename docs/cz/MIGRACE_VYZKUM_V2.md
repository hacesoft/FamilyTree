# FamilyTree 1.1.0-dev7 – jednorázový převod databáze

**Pouze pro vývojovou instalaci.** Není podporována zpětná kompatibilita databáze ani vlastního ZIP v1. Žádný skript zde nepřepisuje genealogické údaje. Přidává se pět tabulek a přenosná stabilní ID.

## Bezpečný postup na Synology

1. **PŘED instalací** vytvoř skutečnou zálohu MariaDB databáze a příloh Nextcloud Files (včetně `Rodokmen/Import`). Ověř, že zálohy lze číst. Nelze se spolehnout pouze na dřívější FamilyTree ZIP v1: nový import ho záměrně nepřijme.
2. Nainstaluj Full Source ZIP běžným `sudo sh install.sh`. Instalátor průběžně vypíše 16 kroků a vytvoří chybějící tabulky/volitelný sloupec `stable_id`, **ale staré hodnoty ID sám nepřepisuje**.
3. V rozbaleném adresáři projektu zkopíruj jednorázový skript do kontejneru:

```sh
sudo docker cp scripts/migrate-research-v2.php nextcloud-app:/tmp/hc-ft-migrate-v2.php
sudo docker exec -u www-data nextcloud-app php /tmp/hc-ft-migrate-v2.php
```

4. Prohlédni počty tabulek a chybějících stabilních ID, potom spusť potvrzený jednorázový převod:

```sh
sudo docker exec -u www-data nextcloud-app php /tmp/hc-ft-migrate-v2.php --apply
sudo docker exec -u www-data nextcloud-app php /tmp/hc-ft-migrate-v2.php
sudo docker exec nextcloud-app rm -f /tmp/hc-ft-migrate-v2.php
```

5. Ověř všech 61 osob, 73 vztahů, události a původní importované výzkumné záznamy v aplikaci (počty ber jako kontrolní body z dřívější zálohy, nikoliv univerzální pevné hodnoty). Neodvozuj úmrtí z `is_living`.
6. Otevři Výzkumný deník v menu ⋯ konkrétního rodokmenu. Vytvoř zkušební úkol a hledání, změň údaj testovací osoby, ověř auditní historii a vytvoř úplný FamilyTree ZIP v2. Ověř ZIP a pro obnovu použij nejlépe testovací instanci, nikoliv existující hlavní data.

## Omezení v tomto vývojovém vydání

- Starý ZIP `formatVersion: 1` již nelze importovat; k obnovení před migrací je nutná předchozí verze a původní databáze.
- Audit zachycuje běžné změny provedené přes GenealogyService a změny projekcí GEDCOM importu, nevytváří však dodatečně historii všech operací před nasazením této verze.
- Vracení historie je omezené na změny údajů osoby, jejichž současné hodnoty se přesně shodují s auditovaným stavem. Smazané osoby/stromy neobnovuje; k tomu slouží záloha.
- Úplná záloha obsahuje 13 tabulek, přílohy a historii; pro větší archivy stále platí existující velikostní limity.
- PHP/UI testy bez běžícího NASu nenahrazují skutečný test migrace s MariaDB.
