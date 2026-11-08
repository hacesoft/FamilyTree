# Internal HDS release checks — FamilyTree 1.1.0

**Internal Publisher/developer reference; excluded from public GitHub source releases.** Required baseline: **HDS 1.2.1**, with **Publisher CP21** governing the release workflow. The authoritative application version is `src/appinfo/info.xml`.

`npm run check` and `npm run l10n:strict` provide automated source and catalog tests. They **do not replace HDS 1.2.1 or CP21 approval**. The independent external HDS checker may be used for development diagnostics when installed with support for this profile:

```sh
HDS_CHECKER=/path/to/HDS/scripts/hacesoft_standard_check.py sh scripts/check-hds.sh --profile release
```

Mandatory FAIL/WARN and unresolved manual gates are release blockers. This file is **not an audit certificate**. Verify real Nextcloud 35 installation and update, permissions and security, code/archive signatures, and public screenshot URLs. At source preparation time the App Store screenshot URLs returned 404 and require publication before release approval.
