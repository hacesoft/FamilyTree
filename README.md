# FamilyTree 1.0.0 for Nextcloud

> **Publisher input archive:** This ZIP uses the final app-rooted format. NAS deployment helpers (`install.sh`, `uninstall.sh`, `build-release.sh`, `scripts/`) are not included. Any instructions referencing those files apply to the separate full-source GitHub repository, not this archive. The final signed App Store `.tar.gz` is produced by Hacesoft Publisher.


[Česky](README_CZ.md) · [User data and GEDCOM](docs/en/03_DATA.md) · [Installation](docs/en/01_INSTALLATION.md)

A private, self-hosted family tree inside **Nextcloud 35**. Manage trees, people, relationships, events, photos, documents and notes. Share family trees with authorized Nextcloud users and import **FamilySearch GEDCOM 7** (`.ged`) or GEDZIP (`.gdz`) with source citations, research notes and image attachments.

## Requirements

- Nextcloud 35 and its supported PHP runtime
- [Shared App Core](https://github.com/hacesoft/core) (`hc_shared_app_core`) **0.18.8 or newer** — install and enable it before FamilyTree

## Installation

Use the Nextcloud App Store after publication, or install the release archive as `custom_apps/hc_familytree` and enable the app via `occ app:enable hc_familytree`.

The application includes a non-destructive Nextcloud baseline migration in `lib/Migration/`, creating the eight FamilyTree tables when missing. **Before publication**, test a fresh Nextcloud 35 installation and an update with existing user data. Back up the database and user files before upgrading.

The Publisher ZIP has the single root directory `hc_familytree/` and requires no npm or Composer build.

## Features

- Interactive family tree with zoom, pan, drag-to-arrange and undo/redo
- People, relatives, events, sources, research notes, photos and attachments
- GEDCOM 7 / GEDZIP import with preview, provenance and duplicate protection by UID
- Permission-aware sharing, Czech and English interface, responsive layout
- Data remains in the user's own Nextcloud deployment

## Repository layout

`appinfo/`, `lib/`, `js/`, `css/`, `img/`, `templates/`, `l10n/` contain the runnable app; `docs/` contains public documentation; optional `install.sh`, `uninstall.sh`, and `scripts/` support Docker/NAS deployments.

## License

AGPL-3.0-or-later. See [LICENSE](LICENSE) and the [full license](https://www.gnu.org/licenses/agpl-3.0.txt).

Release history: [CHANGELOG.md](CHANGELOG.md). Czech: [CHANGELOG.cs.md](CHANGELOG.cs.md).

## Full source archive and Hacesoft Publisher

This GitHub/NAS project contains install.sh, uninstall.sh, build-release.sh, scripts/, docs/ and the installable Nextcloud runtime in src/. For NAS installation, extract the entire project and run `sudo sh install.sh` from its root. Do not copy the project root or scripts/ directly into Nextcloud custom_apps; the installer deploys src/. Publisher independently validates this full-source input and builds its own app-ID-rooted, signed distribution archive.
