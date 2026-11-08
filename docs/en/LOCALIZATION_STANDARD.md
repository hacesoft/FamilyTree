# Hacesoft localization standard (all Nextcloud apps)

- **English (EN)** is the source language and mandatory default fallback. Czech (`cs`) is a fully supported translation; use Nextcloud account language when a locale is available.
- Every user-facing message (PHP and JS, modal, status, validation, error, notification, accessibility label, import/export and widget) must be translated through Nextcloud i18n using text keys in `l10n/*.json` / `*.js`. No new hard-coded localized UI text.
- New source strings must be written in English. Prefer Nextcloud `t('hc_familytree', 'Source string')` in JavaScript and `IL10N->t('Source string')` in PHP. Use named placeholders, not string concatenation.
- When a translation is missing, the app must display its original English string. No Czech fallback for other locales.
- Never automatically translate persons, historical documents, notes, place names, citations, imported GEDCOM records or archived texts. Keep imported content intact.
- Preserve a single app-version source in `appinfo/info.xml`, with matching release assets. Run the bilingual catalog audit and runtime checks in `cs`, `en`, and an unsupported locale before each release.

## FamilyTree 1.1.0-dev20 – English source-key migration

All 848 translation keys were migrated from Czech to **canonical English source strings** in `en.json`, `cs.json` and the nine additional locales. `en.json` maps English keys to English values; `cs.json` maps the same keys to Czech values. All `l10n/*.js` files are readable, multiline Nextcloud catalogs matching their JSON counterparts. Run `npm run format:l10n` to maintain that format.

Existing JS translation calls and many static HTML labels were migrated to English source strings. A **temporary isolated compatibility mapping** remains in the main JavaScript for older PHP errors, Czech phrases embedded in historical research notes and remaining old UI fragments. Do not migrate genealogical content, archived text or imported data; those are not localization keys. Some legacy PHP diagnostic text and UI source fragments still require a separate code-level migration; a canonical translation catalog does not by itself prove complete runtime localization.

## Localized language set

Supported locale catalogs: `en`, `cs`, `de`, `es`, `fr`, `it`, `nl`, `pl`, `pt`, `sk`, `uk`. New locales use reviewed translations where available and **English fallback** for the remaining strings; publishing requires a strict 100% coverage check and native-speaker review. Run `npm run l10n:coverage` for accurate coverage, and `npm run l10n:strict` before publication. Do not call an incomplete catalog fully translated. Nextcloud’s catalog is used directly by JavaScript and PHP.

`pt_PT` is provided as the European Portuguese Nextcloud locale alias for `pt`.
