[🇨🇿 Česky](../cz/03_DATA.md) | [🇬🇧 English](03_DATA.md)

# GEDCOM 7 / GEDZIP evidence

The app imports FamilySearch GEDCOM 7 (`.ged`) and GEDZIP (`.gdz`), with `gedcom.ged` at the archive root. Local `FILE` references must resolve to safe paths and actual archive entries. Supported JPEG, PNG, GIF and WebP images are checked by content and stored in Files before database changes. Missing or invalid images abort the import. Unsupported media retain metadata and remain in the archived original.

Create an empty tree, open **⋮ → Import GEDCOM 7 / GEDZIP**, choose **Import into an empty tree**, a file and a stable origin key, then inspect the preview. It includes people, families, events, assertions, citations, media, places, tasks, notes, unknown notes and differences. Confirm the checked package to import. The original file is archived in **Files/Rodokmen/Import/tree ID/**. The upload hash is checked again on confirmation.

For a later complete package choose **Update this origin by UID** in the same tree. Stable GEDCOM `UID` identifies people and families; a changed record without UID cannot be safely synchronized. Existing manual edits to the displayed person or event are retained and reported. Records absent from the newer package remain marked for review; their imported relationship edges are hidden. A change to the members of an existing displayed relationship stops for manual review. Repeating an unchanged upload does not duplicate people.

Repeated standard `NAME`, `BIRT` and `MARR` structures remain separate variants. `FAMC.STAT CHALLENGED` is drawn with a dashed edge, while `DISPROVEN` remains evidence without an edge. Sources and citations with `PAGE`, `DATA.TEXT` and `QUAY` remain separate; `QUAY` is not a research confidence percentage. Shared standard `SNOTE` records named `NF_`, `NP_` and `NR_` are interpreted as research facts, a place catalog and tasks. Every original note text and owner link is retained, including unknown `NOTE/SNOTE`. The first standard structure may be displayed as preferred; confidence does not automatically select it.

The original GEDCOM/GEDZIP is retained byte for byte for archival use. A full GEDZIP re-export is not yet available. Back up both the Nextcloud database and Files. With a PHP CLI, run `php scripts/test-gedcom-research.php` from the source project to check the research note mapping and missing-media rejection. The installer lints all PHP files on the target server before activating the app.
