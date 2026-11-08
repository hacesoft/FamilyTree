# Native backup and journal interchange

**Native ZIP v2** (`hc-familytree-native-backup`, `formatVersion: 2`): full export of all 13 FamilyTree tables of owned trees, including research history/proposals, and accessible local attachments. ZIP root contains `manifest.json` with checksums and `data.json` containing all ordered tables, plus `files/<sha256>` blobs. Import previews and checks integrity, then restores as **new** trees; it never overwrites existing trees. External URLs are retained as references, not downloaded. Limits: 40 MiB data JSON, 48 MiB per attachment, 256 MiB attachments total, 3000 files. v1 ZIP restores are not supported in the development v2 schema. Back up private data securely.

**Research journal JSON v1** (`hc-familytree-research-journal`, `formatVersion: 1`): import/export of tasks, searches and evidence only. It does not contain genealogy facts, audit history, proposals or attachments, and does not update existing records when reimported. See [RESEARCH_JOURNAL_FORMAT.md](RESEARCH_JOURNAL_FORMAT.md).

**GEDCOM 7 / GEDZIP** is an interchange format, not the complete archive. Access full backup import/export via the app's top-left `⋯` menu and current tree's `⋯` context menu, not old bottom sidebar buttons.

## Unified import (1.1.0-dev11)

Open **⋯ → Import family tree / backup** and choose GEDCOM 7 / GEDZIP (`.ged`, `.gedcom`, `.gdz`, or `.zip` containing `gedcom.ged` at its root) or the complete native FamilyTree backup (`.zip` with the documented FamilyTree manifest). GEDCOM can create a **new tree** directly after preflight, or import into an editable selected tree. Native backup restoration always creates separate trees and retains current records. An arbitrary ZIP is not a recognized import format. Only GEDCOM structures supported by the parser are projected into the database; auxiliary archive files remain in the archived original.
