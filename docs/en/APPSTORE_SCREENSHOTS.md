# Nextcloud App Store screenshots

The full-source project keeps the original screenshot images in `docs/images/appstore/` without resizing or recompression:

- `01-overview.png` (2044 × 1020); `01-overview-small.png` (1187 × 715) is the user-provided preview.
- `02-journal.png` (965 × 820) shows the Research Journal task view.
- `03-photographs.png` (968 × 830) shows saved photos and scans.

Before publishing to the Nextcloud App Store, commit these files alongside the updated `src/appinfo/info.xml` on the **public repository `hacesoft/FamilyTree`, branch `main`**, preserving repository-root `docs/images/appstore/` paths. Check that all four `raw.githubusercontent.com` HTTPS URLs resolve to images (not 404). The App Store reads these public URLs, not local screenshot files inside the Nextcloud installation. Only `src/` is the deployable runtime.

The first `<screenshot>` uses a dedicated `small-thumbnail` URL; the two remaining screenshots omit that optional attribute. A main screenshot must be no larger than 2 MiB. Screenshots do not need a universal pixel size; do not force downscaling. Review displayed data for any privacy risks before publishing.
