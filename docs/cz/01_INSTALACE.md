[English](../en/01_INSTALLATION.md)

# Instalace Rodokmenu 1.0.0

**Požadavky:** Nextcloud 35 a povolený [Shared App Core](https://github.com/hacesoft/core) 0.18.8 nebo novější.

Po zveřejnění instalujte přes Nextcloud App Store, případně rozbalte archiv do `custom_apps/hc_familytree` a spusťte `php occ app:enable hc_familytree` jako uživatel webového serveru. Nextcloud automaticky provádí migraci z `lib/Migration/` a zakládá chybějící tabulky. Tento archiv nevyžaduje externí skript pro vytvoření schématu.

Před aktualizací zazálohujte data. Před zveřejněním ověřte čistou instalaci i aktualizaci na Nextcloudu 35; specifické NAS instalační skripty nejsou součástí vstupu pro Publisher.
