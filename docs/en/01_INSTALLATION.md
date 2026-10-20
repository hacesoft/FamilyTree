[Česky](../cz/01_INSTALACE.md)

# FamilyTree 1.0.0 installation

**Requirements:** Nextcloud 35 and enabled [Shared App Core](https://github.com/hacesoft/core) 0.18.8 or later.

Install with the official Nextcloud App Store after publication, or unpack the runtime archive into `custom_apps/hc_familytree` and run `php occ app:enable hc_familytree` as the web server user. Nextcloud executes the migration from `lib/Migration/` and creates missing tables automatically. No separate schema initializer is required with this archive.

For upgrades, back up existing data first. Test a clean Nextcloud 35 installation and an upgrade before publication; the environment-specific NAS scripts are not included in the Publisher ZIP.
