# Legacy identity and media browser

The **Research Journal → Archive P/F/Q** page shows existing `hc_familytree_research` entries without copying them into task tables. Search by original ID, person, fact, checkpoint, archive book, signature, and record type. P identifies a person, F an individual claim, Q a historical research task, S a source, and C/M citations/media. These are conventions only: the authoritative classification comes from `entity_type` and `origin_key`. Internal SQL IDs are not transferable research identities.

**Research Journal → Registers and Photos** displays locally saved GEDZIP scans and person photos with lazy-loaded thumbnails. All saved images use the permission-gated media route, which validates MIME and file size. Remote GEDZIP source URLs remain links, rather than auto-loaded thumbnails. External person photo previews require an explicit user click; same-origin photos may load directly. The person detail also displays its linked saved images, and cross-links into the journal's person filter. Pre-existing Nextcloud Files document links and external photo URLs remain accessible as links; this release does not implement uploading new photos.

The full native ZIP v2 holds research metadata, the 13 database tables, and eligible stored media. The standalone research journal JSON v1 includes tasks, searches and evidence, **not** legacy P/F/Q rows or binary media. See `RESEARCH_JOURNAL_FORMAT.md` and `IMPORT_EXPORT_BACKUP.md`.


## Unified research task Q view (since 1.1.0-dev7)

Legacy Q tasks may live in imported research rows or be embedded in a person's notes.
The **Tasks** tab displays a read-only projection of these alongside new editable journal tasks.
A uniquely identified legacy Q matching an imported current Q is presented as **one logical task**,
with the historical attempts, outcome, checkpoint and next action retained.
Where multiple distinct origins use the same Q without an unambiguous match, they remain separate.
Imported Q identifiers are recovered from the append-only audit record created by the JSON importer;
the internal stable ID is not the original Q identifier. No legacy rows are inserted, deleted or
rewritten to build this view. The Archive tab includes a Q filter; the person detail links to a
person-filtered Tasks tab. Physical task counts in Statistics are separate from projected tasks.

