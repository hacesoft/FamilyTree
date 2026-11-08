# Nextcloud App Store screenshots

The App Store gallery starts with the original approved branding image `src/img/app-store.png` (512 × 512) and its existing `src/img/menu-preview.png` thumbnail (64 × 64). These are separate from the runtime icon `img/app.svg`. The three original UI screenshots follow in the gallery. Both README files continue to display only the tree-view screenshot.

The full-source project keeps the original screenshot images in `docs/images/appstore/` without resizing or recompression:

- `01-overview.png` (2044 × 1020); `01-overview-small.png` (1187 × 715) is the user-provided preview.
- `02-journal.png` (965 × 820) shows the Research Journal task view.
- `03-photographs.png` (968 × 830) shows saved photos and scans.

Before publishing to the Nextcloud App Store, commit these files alongside the updated `src/appinfo/info.xml` on the **public repository `hacesoft/FamilyTree`, branch `main`**, preserving repository-root `docs/images/appstore/` paths. Check all six `raw.githubusercontent.com` HTTPS image URLs (including the logo and its thumbnail) return valid images (not 404). The repository owner confirmed the `src/img/app-store.png` link works; other URLs still require public verification. The App Store reads these public URLs, not local screenshot files inside the Nextcloud installation. Only `src/` is the deployable runtime.

The first two `<screenshot>` elements each use a dedicated `small-thumbnail` URL; the remaining two omit it. A main screenshot must be no larger than 2 MiB. Screenshots do not need a universal pixel size; do not force downscaling. Review displayed data for any privacy risks before publishing.

## Approved asset integrity gate (HDS / CP21)

Do not redraw, resize or replace the approved FamilyTree icon or screenshots. The public reference `scripts/appstore-approved-assets.json` pins the original file hashes and the expected screenshot URLs. Run `node scripts/check-appstore-assets.cjs .` to verify local source images, screenshot metadata and both README image links. `sh build-release.sh` additionally checks the built `img/app.svg` in the runtime ZIP and TAR.GZ and the unchanged screenshots in the public full-source ZIP. An invalid or modified asset blocks packaging.

Changing this reference manifest is not a substitute for owner approval. Public HTTPS image reachability and actual rendering in the Nextcloud App Store are **post-publication** checks: report them as pending until independently verified. The App Store retrieves screenshots by HTTPS using `info.xml`; copying all screenshots into the runtime TAR.GZ is not required.

The Publisher input ZIP **does not publish files to GitHub**. Deploy the complete public source tree at the repository root and republish the official signed release before expecting updated App Store metadata to be shown.
