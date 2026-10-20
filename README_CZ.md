# Rodokmen 1.0.0 pro Nextcloud

> **Vstupní archiv pro Publisher:** Tento ZIP má výslednou strukturu s jediným kořenovým adresářem aplikace. Neobsahuje NAS nástroje (`install.sh`, `uninstall.sh`, `build-release.sh`, `scripts/`). Návody, které je zmiňují, platí pro samostatný úplný zdrojový repozitář, nikoli pro tento archiv. Podepsaný `.tar.gz` pro App Store vytváří až Hacesoft Publisher.


[English](README.md) · [GEDCOM a data](docs/cz/03_DATA.md) · [Instalace](docs/cz/01_INSTALACE.md)

Soukromá aplikace pro tvorbu a sdílení rodokmenů přímo v **Nextcloudu 35**. Správa osob, vztahů, událostí, fotografií, dokumentů a poznámek. Podporuje import **FamilySearch GEDCOM 7** (`.ged`) a GEDZIP (`.gdz`) včetně pramenů, citací, badatelských poznámek a obrázků.

## Požadavky

- Nextcloud 35 a jím podporovaná verze PHP
- [Shared App Core](https://github.com/hacesoft/core) (`hc_shared_app_core`) **0.18.8 nebo novější**; nainstalovat a povolit předem

## Instalace

Po zveřejnění lze použít Nextcloud App Store. Alternativně rozbalte instalační archiv přímo jako `custom_apps/hc_familytree` a aktivujte aplikaci příkazem `occ app:enable hc_familytree`.

Součástí aplikace je nedestruktivní výchozí migrace Nextcloudu v `lib/Migration/` pro osm tabulek Rodokmenu. **Před zveřejněním** je nutné otestovat první instalaci na Nextcloudu 35 a aktualizaci s existujícími daty. Před aktualizací zazálohujte databázi i soubory.

Vstupní ZIP Publisheru obsahuje jediný kořenový adresář `hc_familytree/`. npm ani Composer nejsou k instalaci potřeba.

## Funkce

- Interaktivní strom, přiblížení, posouvání, rozmístění osob, vrácení a opakování změn
- Osoby, vztahy, události, prameny, badatelské záznamy, fotografie a přílohy
- Import GEDCOM 7 / GEDZIP s náhledem, kontrolou provenience a porovnáním podle UID
- Sdílení s oprávněními, české a anglické rozhraní, mobilní rozložení
- Data zůstávají na vlastním Nextcloud serveru

## Struktura repozitáře

`appinfo/`, `lib/`, `js/`, `css/`, `img/`, `templates/`, `l10n/` tvoří běhovou aplikaci; `docs/` obsahuje veřejnou dokumentaci. Skripty `install.sh`, `uninstall.sh` a `scripts/` jsou volitelné nástroje pro Docker/NAS.

## Licence

AGPL-3.0-or-later. Viz [LICENSE](LICENSE) a [úplný text licence](https://www.gnu.org/licenses/agpl-3.0.txt).

Veřejná historie vydání: [CHANGELOG.md](CHANGELOG.md). Český přehled: [CHANGELOG.cs.md](CHANGELOG.cs.md).

## Úplný zdrojový balíček a Hacesoft Publisher

Balíček pro GitHub a instalaci na NAS obsahuje `install.sh`, `uninstall.sh`, `build-release.sh`, adresáře `scripts/`, `docs/` a hotovou aplikaci v `src/`. Pro instalaci na NAS rozbalte celý projekt a v jeho kořeni spusťte `sudo sh install.sh`. Do `custom_apps` se kopíruje pouze běhový obsah `src/`, nikoliv dokumentace projektu a instalační skripty. Publisher následně provede vlastní kontrolu a sestaví distribuční archiv s kořenovým adresářem podle ID aplikace; zdejší zdrojový ZIP není přímo distribuční TAR.GZ.
