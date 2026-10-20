# FamilyTree 1.0.0 for Nextcloud


[Česky](README_CZ.md) · [User data and GEDCOM](docs/en/03_DATA.md) · [Installation](docs/en/01_INSTALLATION.md)

A private, self-hosted family tree inside **Nextcloud 35**. Manage trees, people, relationships, events, photos, documents and notes. Share family trees with authorized Nextcloud users and import **FamilySearch GEDCOM 7** (`.ged`) or GEDZIP (`.gdz`) with source citations, research notes and image attachments.

## Requirements

- Nextcloud 35 and its supported PHP runtime
- [Shared App Core](https://github.com/hacesoft/core) (`hc_shared_app_core`) **0.18.8 or newer** — install and enable it before FamilyTree

## Installation

Install and enable HC Shared App Core 0.18.8 or later first. On a supported Synology NAS / Docker deployment, unpack the complete project **outside** `custom_apps` and run from its root:

```sh
sudo sh install.sh
```

The installer deploys the ready-to-use application from `src/`. For manual deployment elsewhere, install **only the contents of `src/`** to `custom_apps/hc_familytree/`, set the proper permissions and enable it using `occ app:enable hc_familytree` as the web-server user.

The non-destructive Nextcloud migration in `src/lib/Migration/` creates the eight required tables if missing. Back up the database and user files before updating. [Detailed guide](docs/en/01_INSTALLATION.md).

## Features

- Interactive family tree with zoom, pan, drag-to-arrange and undo/redo
- People, relatives, events, sources, research notes, photos and attachments
- GEDCOM 7 / GEDZIP import with preview, provenance and duplicate protection by UID
- Permission-aware sharing, Czech and English interface, responsive layout
- Data remains in the user's own Nextcloud deployment

## Repository layout

`src/` contains the runnable app (`appinfo/`, `lib/`, `js/`, `css/`, `img/`, `templates/`, `l10n/`); `docs/` contains public documentation; optional `install.sh`, `uninstall.sh`, and `scripts/` support Docker/NAS deployments.

## License

AGPL-3.0-or-later. See [LICENSE](LICENSE) and the [full license](https://www.gnu.org/licenses/agpl-3.0.txt).

Release history: [CHANGELOG.md](CHANGELOG.md). Czech: [CHANGELOG.cs.md](CHANGELOG.cs.md).
