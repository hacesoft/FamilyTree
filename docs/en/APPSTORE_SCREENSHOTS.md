# FamilyTree 1.1.3 – Nextcloud App Store imagery

The Nextcloud Talk (`spreed`) reference separates navigation icons (`img/app.svg`) from App Store images (HTTPS screenshot URLs from `appinfo/info.xml`). Merely storing an image under `img/` will not make it appear in the App Store gallery.

For FamilyTree, the approved color SVG icon remains `src/img/app.svg` in public source and `img/app.svg` in the installed runtime. The app catalogue card and the first gallery slide now both use **the real family-tree overview** `src/img/01-overview.png`, without a `small-thumbnail` override. The other screenshots are `src/img/02-journal.png` and `src/img/03-photographs.png`.

All three files are byte-identical copies of the approved originals under `docs/images/appstore/`; the original `src/img/app-store.png` and `menu-preview.png` remain untouched as supplemental branding. The official signed TAR.GZ contains `img/` under the application root, but the App Store gallery loads the public HTTPS URLs in the metadata rather than image files in the archive.

**Deployment order:** commit new `src/img` screenshots and `src/appinfo/info.xml` to the repository root on GitHub `main`; verify the three raw URLs with HTTP 200 and matching SHA-256 (`node scripts/check-appstore-public-urls.cjs`); build, sign and register 1.1.3 through Publisher; inspect card and gallery on the public Nextcloud App Store after cache refresh. The online check must remain PENDING until the GitHub files are uploaded and reachable. Do not claim a successful public rendering test from a local build alone.
