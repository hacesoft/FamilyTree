[English](../en/01_INSTALLATION.md)

# Instalace Rodokmenu 1.0.0

**Požadavky:** Nextcloud 35 a povolený [Shared App Core](https://github.com/hacesoft/core) 0.18.8 nebo novější.

Na podporovaném Synology NAS / Dockeru rozbalte celý projekt mimo adresář `custom_apps` a spusťte z kořene projektu `sudo sh install.sh`. Instalátor použije hotovou aplikaci ze `src/`. Případně lze nasadit pouze **obsah `src/`** do `custom_apps/hc_familytree/`, nastavit oprávnění a aktivovat aplikaci příkazem `php occ app:enable hc_familytree` jako uživatel webového serveru.

Nextcloud automaticky spustí migraci v `src/lib/Migration/` a založí chybějící tabulky. Před aktualizací zazálohujte databázi Nextcloudu a uživatelské soubory.
