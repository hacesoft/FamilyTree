# FamilyTree journal interchange format (v1)

FamilyTree 1.1.0-dev7 supports **import and export** of `hc-familytree-research-journal` JSON, `formatVersion: 1`, through the selected tree's **Research Journal** dialog. This is a **research interchange**, not a full backup. Its top-level keys are `format`, `formatVersion`, `source`, optional `origin_tree`, `tasks`, `searches`, `evidence`.

Task fields: `source_id`, `title`, `status` (`planned`, `in_progress`, `waiting_verify`, `done`, `rejected`), `priority` (`low`, `normal`, `high`), `person_refs`, `hypothesis`, `next_action`. Search fields: `source_id`, `task_ref`, `query_text`, `outcome` (`unverified`, `no_result`, `candidate`, `found`, `rejected`), `source_url`, `notes`. Evidence fields: `source_id`, `task_ref`, `status` (`candidate`, `transcribed`, `rejected`), `archive`, `signature`, `source_url`, `image_number`, `transcription`, `notes`, `confidence_label`.

A `source` namespace and the `source_id` identify import rows: importing the same batch twice skips already imported entries. No existing rows are overwritten. `task_ref` resolves to a task's source ID from the same namespace. External `verified` evidence is never accepted. Exported locally verified evidence is downgraded to `transcribed` and flagged for renewed manual review. Neither facts nor relationships nor events are changed by this importer.

Limit: JSON 1 MiB; up to 500 tasks, 1000 searches and 500 evidence items in one file. JSON export contains neither audit history nor proposals nor attachments. Use the **full native ZIP v2** for all 13 tables and local file attachments; full restore creates new trees. GEDCOM 7 is for genealogy interchange and is not a complete backup. See Czech [full specification](../cz/FORMATY_IMPORT_EXPORT.md).


## Legacy Q identifiers

Native ZIP v2 includes original imported research and person's notes. JSON journal v1 exports
only editable journal tasks, searches and evidence; it does not duplicate archived Q records.
Preserve source IDs such as `Q0002` and original person references (`P0010`) for new contributions.
Same-looking Q identifiers from unrelated archives must not be silently merged. A person's
historical Q is displayed in the unified Tasks view without mutating the original note.

