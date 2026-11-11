## 1.1.6 – 2026-11-11

- App Store screenshots are now separately hosted in the public repository root `screenshot/` folder and excluded from installation and source ZIP archives. Their original bytes remain unchanged.
- The installed app still contains the original approved `img/app.svg`; release checks validate archive contents and exact public URL/approved-hash mapping.
- No genealogy database, findings merge, or feature changes.

## 1.1.5 — 2026-11-10

- New version-specific screenshot URLs (`01.png`, `02.png`, `03.png`) to request fresh Nextcloud App Store cache keys, preserving the exact image bytes.
- The first real UI screenshot now also serves as its own `small-thumbnail` for the catalog card.
- Publish the three new files to GitHub `main` and verify their public URLs before registering the signed release; public gallery rendering remains independently unverified.
- No changes to research findings import, the data schema, or approved icons.

## 1.1.4 – 2026-11-09

- Added review-first findings merge into an existing family tree.
- Exact stable-ID matching, non-destructive genealogical updates, and conflict safeguards.
- Combined GEDZIP, research journal and historical media with an audit trail.
- Repeat imports avoid duplicate journal records and stored media.

## 1.1.3 — 2026-11-09

- The catalog card and gallery now use the original FamilyTree overview screenshot, following Nextcloud Talk; the approved icon remains separate.
- Added lossless copies of approved screenshots under `src/img/`, updated metadata and public URL verification.
- No data, schema or permission changes.

## 1.1.2 — 2026-11-08

- Fixed App Store image roles: the approved 512 × 512 branding image is the first screenshot's `small-thumbnail` for the app card, while the gallery begins with the actual family-tree overview.
- Removed the tiny 64 × 64 thumbnail from published metadata without changing any approved source asset.
- Added blocking checks for undersized preview, screenshot order and URL mapping; external caching and display still require post-publication verification.
- No changes to genealogy features, stored data, schema or source image bytes.

## 1.1.1 — 2026-11-08

- Patch release after 1.1.0 so updated Nextcloud App Store image metadata are distributed under a new version.
- `info.xml` references the approved `src/img/app-store.png` cover and `src/img/menu-preview.png` thumbnail through direct GitHub raw URLs, retaining the three original screenshots.
- Approved images and icon, database schema, genealogical data, import/export formats, and runtime behavior are unchanged.
- Updated metadata, versioned JS/CSS filenames, PHP asset references, package versions and public installation guides to 1.1.1.
- Release requires HDS 1.2.1 / Publisher CP21 checks and signing before publication.

## 1.1.0 — 2026-11-08
- Nextcloud App Store metadata now include the original approved `src/img/app-store.png` cover with the `src/img/menu-preview.png` thumbnail. All three original UI screenshots are retained, and URLs are checked against actual repository paths.

- Completed the H05 documentation pass: Hungarian-type variable prefixes and legends across JS/PHP plus Czech function, parameter and return-value docs. Nextcloud route parameter and template variable names are preserved as required framework-contract exceptions. Independent HDS 1.2.1 / Publisher CP21 approval remains outstanding.
- Prepared stable source 1.1.0 based on dev23; no intentional changes to genealogical data, schema or backup formats.
- Aligned info.xml version, versioned JavaScript/CSS asset filenames and PHP references.
- Updated public EN/CZ instructions to prefer signed Nextcloud App Store installation; `sudo sh install.sh` remains a Docker developer/tester tool.
- Removed internal HDS/CP21 material from the public source distribution. Publisher approval and signing are still required before App Store release.

## 1.1.0-dev23 — 2026-11-01

- Completed 154 missing English source keys in each of the nine additional locales (1,386 translated entries). All 11 language catalogs now have 854/854 keys.
- Synchronized the Portuguese pt_PT alias and formatted readable Nextcloud JSON/JavaScript translation files.
- Hardened completeness regression tests; genealogical data, schema and functionality remain unchanged. Live NC35 and Publisher CP21 checks are still outstanding.

## 1.1.0-dev20 — 2026-11-01

- Reformatted the main JavaScript source to remove lines longer than 240 characters while preserving the cooked HTML template content. Removed the duplicated embedded English catalog; English source keys are the fallback.
- Fixed precedence between canonical English keys and legacy Czech compatibility aliases; preserved support for old server messages.
- Added 30 translated user-facing labels in each of the nine additional locales (270 entries), and synchronized Nextcloud JS/JSON translation catalogs.
- Added regression tests. No changes to database schema, GEDZIP interchange, backups or stored research records.
- Release is blocked pending 5,130 additional translations, comment review, live Nextcloud testing, certificate/signature and published screenshot URLs.

## 1.1.0-dev19 — 2026-11-01

- Test runner now checks syntax of every shipped JavaScript source and locale before running the existing regression suite, preventing false positives on unparsable application code.
- Incremental, regression-verified readability improvements to the main JavaScript file and corrections to PHP return-type documentation.
- No changes to database schema, research history, GEDZIP interchange formats, backups, or Publisher.
- Development-only build: nine locales still require 600 real translations each, and live Nextcloud and publication checks remain pending.

## 1.1.0-dev18 — 2026-11-01

- Converted server-facing Czech diagnostics to canonical English source messages; legacy research identifiers and user records are preserved.
- Added six localized safety/validation messages for all 11 supported languages.
- Added Czech documentation for many JS/PHP methods and progressively formatted named JS functions while preserving all regression tests.
- Development only: 600 existing translations remain missing in each of nine languages; further code-formatting and live Nextcloud 35 tests are required.

## 1.1.0-dev16 — 2026-10-31
- Localization audit across the shared 11-language set; added nine partially translated catalogs with English fallback.
- Added translation coverage reporting and a strict full-coverage gate for public release.
- No feature or database schema changes.

## 1.1.0-dev16 — 2026-10-31
- Document English as default and Czech as translation for all Hacesoft apps; improve native backup and server warning translations.

- Czech/English localization audit of dialogs, research journal, statistics, import/export and validation errors.
- Reliable English fallback and translation regression tests. No database migrations or new features.

## 1.1.0-dev13 — 2026-10-31

- Journal statistics: responsive breakdown cards with localized names, category totals and relative proportions, preserving underlying database counts.
- Double-clicking a family tree name in the sidebar opens that tree's Research Journal (P/F/Q archive); single click selects the tree and keyboard selection is unchanged.
- No database migration; App Store screenshots and metadata retained.

### 1.1.0-dev12 — App Store screenshots (2026-10-31)

Added the three supplied App Store screenshots plus the overview thumbnail unmodified. Registered absolute HTTPS screenshot URLs in app metadata, pointing to public files under the former public screenshot directory (no longer used) on the GitHub `main` branch once uploaded. No data/schema changes.

## 1.1.0-dev11 — 2026-10-31
- Removed the outdated informational “Dialogs and controls” card from application settings, without changing existing controls or stored data.

### 1.1.0-dev10 — Unified import routing

- GEDCOM 7 / GEDZIP now imports directly into a newly created tree; separate native backup restore remains available.
- Support ZIP-wrapped GEDCOM (`gedcom.ged`) and clear diagnostics for wrong ZIP types.
- Preflight validation runs before creating a tree; existing trees are never overwritten by native restore.

## 1.1.0-dev9 — 2026-10-31
- Optional toolbar record summary (off by default) and configurable, saved legend position across the app.
- No database migration.

## 1.1.0-dev9 — 2026-10-30
- Add state filters for combined legacy/current Q tasks (all, planned, in progress, waiting for verification, done, rejected), with live counts and per-tree filter memory.
- Search and status/outcome filters for searches, evidence and proposals, action type for audit history, plus status/verification filters in the P/F/Q archive. Filtering precedes the result limit; no data or schema changes.

## 1.1.0-dev7
- Read-only historic Q task reconciliation preflight with collision detection and zero DB writes.

## 1.1.0-dev7 (2026-10-30)
- Unified read-only legacy Q task projection and active journal task view, with person filtering and ID-legend layout fix.
- No database or archive-format changes.

## 1.1.0-dev7 (2026-10-30)
- Searchable legacy P/F/Q source records in the Journal with provenance-preserving IDs.
- Protected lazy image gallery for stored GEDZIP scans and portraits; source links and per-person detail previews.
- Documentation and tests, with no database migration required.

## 1.1.0-dev4 — 2026-10-30

- Export výzkumného deníku do JSON v1 (úkoly, hledání a důkazy); chráněno kontrolou přístupu ke stromu.
- Opakovaný import JSON exportu do stejného rodokmenu přeskočí existující položky; není to náhrada úplné zálohy.
- Dokumentace úplného ZIP v2, samostatného deníku JSON v1 a badatelského vlákna.
- Beze změn databázového schématu, úplné zálohy v2 a instalačních 16 kroků.

## 1.1.0-dev4 — 2026-10-30
- Fixed MySQL aggregate queries for statistics and missing Dashboard widget JavaScript.
- Added a reviewed, idempotent JSON research-journal import for tasks, searches, and candidate evidence. No automatic changes to genealogy facts.
- Database and native backup v2 unchanged; no new migration.

## 1.1.0-dev4 — 2026-10-30
- Added **Statistics** beside Change history in the Research Journal, and read-only reports for one tree or all trees owned by the user.
- Live row counts for all 13 database tables, a final simple sum, and breakdowns by type/status without double counting.
- Full audit history count (not limited to the 500-item preview) and owner-only scope for global totals.
- No database schema changes, migrations or native ZIP v2 format changes. Preserves 16-step live installer.
- Added PHP execution tests and UI/authorization regression checks.

## 1.1.0-dev1 — 2026-10-30
- Research journal (tasks, search log, evidence, proposals, history).
- Append-only audit for ordinary manual graph edits; safe person change revert creates a new audit entry.
- Native backup v2 includes all 13 tables and portable references. Legacy v1 import deliberately unsupported.
- One-time developer NAS migration script with dry-run and explicit apply; no genealogical records deleted.
- GEDCOM 7 remains an interchange format. Live NC35 deployment must still be tested.

## 1.0.1-dev6 — 2026-10-30
- Each family tree now has one ellipsis action launcher opening a floating context menu with owner/editor permission checks.
- The header zoom shows only − / percentage / +, with mobile percentage support.
- Fixed status clipping below sticky actions across GEDCOM, native ZIP import/export and bulk deletion dialogs.
- Restored the native ZIP backup import UI accidentally removed in the previous UI refactor.
- Added UI regression tests; no database migration or Shared App Core changes.

## 1.0.1-dev6 — 2026-10-30
Fixed native ZIP export, reorganized per-tree actions and global app menu, compact tabbed settings (About last), dialog focus/checkbox styling scoped to Core overlays, transactional deletion of owned trees with typed confirmation, preserved live installer progress. Locally checked; NAS visual QA pending.

# Changelog

# 1.0.1-dev6 — 2026-10-30

- Fixed immediate NAS installer progress: 16 one-line steps are written to the original stderr while command logs remain isolated.
- Added streaming progress and failure diagnostics tests.
- Import/export and database model remain unchanged.

# 1.0.1-dev2 — 2026-10-30

- Separate Import and Export, GEDCOM 7 download and existing GEDCOM 7/GEDZIP import.
- Versioned full FamilyTree ZIP archive for one or all owned trees, records, media, and sharing.
- Safe preflight and restore into new trees with remapped IDs and opt-in share reactivation.
- Live 16-step installer progress.

## 1.0.0 — 2026-10-20

First public source release for Nextcloud 35.

### Features
- Interactive genealogy, relationships and events
- Research records, photos, documents and GEDCOM 7 / GEDZIP import
- Sharing with access permissions

### Compatibility
- Nextcloud 35.
- Requires Hacesoft Shared App Core 0.18.8 or newer.
