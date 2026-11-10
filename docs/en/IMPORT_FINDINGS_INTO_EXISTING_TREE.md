# Import research findings into an existing family tree (1.1.5)

This additive import is different from GEDCOM UID synchronization and native ZIP restoration. It can add new people, proven family links, events, images and append-only research journal entries to an existing tree.

1. Create a complete FamilyTree native backup, and back up your Nextcloud database and files.
2. Open an existing **editable** family tree, then choose **Import → Import findings into the existing family tree (.zip)**.
3. Select a findings bundle ZIP (for example `familytree-findings-example.zip`), not an individual journal JSON file.
4. Preview matched/new people, relationships, events, images, journal entries, warnings and conflicts. Manually match ambiguous identities using stable person IDs, then preview again.
5. Only if there are no conflicts, confirm that you reviewed the plan and made a backup, and apply the import.
6. Review imported documents, genealogy, journal, evidence and audit history afterwards.

The bundle contains exactly one GEDZIP (`.gdz`) including root `gedcom.ged`; it may contain `mapovani_existujicich_osob.json`, a research journal import JSON (`*_DENIK_IMPORT.json` or `01_IMPORT_DO_STAVAJICIHO_DENIKU.json`), and `dukazy/` images and optional checksum list. Maximum outer upload size: 64 MiB.

**Safety:** Stable identifiers, not names, determine existing-person matches. Existing facts are never overwritten; unclear matches and conflicts block the import. Parents cannot exceed two or form a cycle. Unverified partnerships are retained for review. Evidence remains unverified until a researcher reviews it. Media are privately stored in the owner's Nextcloud Files; imported journal records remain append-only. The operation uses a database transaction and cleans up newly created files on failure. A backup is still required.

The separate **Import research journal (JSON)** feature only imports journal records and does not modify the tree or attach pictures.
