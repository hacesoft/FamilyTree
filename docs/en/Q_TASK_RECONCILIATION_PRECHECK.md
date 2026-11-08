# Safe read-only preflight before reconciling historic Q tasks

The command in `scripts/inspect-q-before-repair.php` checks the current FamilyTree database without writing anything. It compares historic Q identifiers from imported research rows and person notes with currently imported research-journal tasks, using the import audit trail to recover `source_id`.

Run on a backed-up development NAS after installing the version with v2 journal tables:

```sh
sudo docker cp scripts/QTaskInspector.php nextcloud-app:/tmp/QTaskInspector.php
sudo docker cp scripts/inspect-q-before-repair.php nextcloud-app:/tmp/inspect-q-before-repair.php
sudo docker exec -u root nextcloud-app chmod 644 /tmp/QTaskInspector.php /tmp/inspect-q-before-repair.php
sudo docker exec -u www-data nextcloud-app php /tmp/inspect-q-before-repair.php --tree-id=2
```

Replace the tree ID with the actual numeric ID. Review linked, historic-only, journal-only and ambiguous/collision groups. Task IDs that happen to match across distinct origins are **not** proof of identity. Never re-import or delete the production tree as a shortcut. A write-capable reconciliation tool must be designed and validated against the actual report and original source data.
