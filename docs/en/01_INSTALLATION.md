[Česky](../cz/01_INSTALACE.md)

# FamilyTree 1.0.0 installation

**Requirements:** Nextcloud 35 and enabled [Shared App Core](https://github.com/hacesoft/core) 0.18.8 or later.

On a supported Synology NAS / Docker deployment, unpack the entire project outside `custom_apps` and run `sudo sh install.sh` from the project root. The installer uses the ready-to-run application from `src/`. Alternatively deploy **only the contents of `src/`** to `custom_apps/hc_familytree/`, set appropriate permissions and enable the app with `php occ app:enable hc_familytree` as the web-server user.

Nextcloud automatically applies the migration in `src/lib/Migration/` and creates missing tables. Back up the Nextcloud database and user files before upgrading.
