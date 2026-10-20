# Rodokmen 1.0.0 pro Nextcloud


[English](README.md) · [GEDCOM a data](docs/cz/03_DATA.md) · [Instalace](docs/cz/01_INSTALACE.md)

Soukromá aplikace pro tvorbu a sdílení rodokmenů přímo v **Nextcloudu 35**. Správa osob, vztahů, událostí, fotografií, dokumentů a poznámek. Podporuje import **FamilySearch GEDCOM 7** (`.ged`) a GEDZIP (`.gdz`) včetně pramenů, citací, badatelských poznámek a obrázků.

## Požadavky

- Nextcloud 35 a jím podporovaná verze PHP
- [Shared App Core](https://github.com/hacesoft/core) (`hc_shared_app_core`) **0.18.8 nebo novější**; nainstalovat a povolit předem

## Instalace

Nejprve nainstalujte a povolte HC Shared App Core 0.18.8 nebo novější. Na podporovaném Synology NAS s Dockerem rozbalte celý tento projekt **mimo** `custom_apps` a spusťte v jeho kořeni:

```sh
sudo sh install.sh
```

Instalátor používá hotové soubory z `src/`. Pro ruční nasazení na jiném serveru uložte **pouze obsah `src/`** do `custom_apps/hc_familytree/`, nastavte příslušná oprávnění a aktivujte pomocí `occ app:enable hc_familytree` jako uživatel webového serveru.

Aplikace obsahuje nedestruktivní databázovou migraci v `src/lib/Migration/`, která vytváří osm potřebných tabulek, pokud chybějí. Před aktualizací zálohujte databázi i uživatelské soubory. [Podrobný návod](docs/cz/01_INSTALACE.md).

## Funkce

- Interaktivní strom, přiblížení, posouvání, rozmístění osob, vrácení a opakování změn
- Osoby, vztahy, události, prameny, badatelské záznamy, fotografie a přílohy
- Import GEDCOM 7 / GEDZIP s náhledem, kontrolou provenience a porovnáním podle UID
- Sdílení s oprávněními, české a anglické rozhraní, mobilní rozložení
- Data zůstávají na vlastním Nextcloud serveru

## Struktura repozitáře

`src/` obsahuje běhovou aplikaci (`appinfo/`, `lib/`, `js/`, `css/`, `img/`, `templates/`, `l10n/`); `docs/` obsahuje veřejnou dokumentaci. Skripty `install.sh`, `uninstall.sh` a `scripts/` jsou volitelné nástroje pro Docker/NAS.

## Licence

AGPL-3.0-or-later. Viz [LICENSE](LICENSE) a [úplný text licence](https://www.gnu.org/licenses/agpl-3.0.txt).

Veřejná historie vydání: [CHANGELOG.md](CHANGELOG.md). Český přehled: [CHANGELOG.cs.md](CHANGELOG.cs.md).
