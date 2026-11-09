[Česky](../cz/01_INSTALACE.md)

# Installing FamilyTree 1.1.2

## 1. Official installation (recommended)

**Ordinary users should use Nextcloud Administration → Apps.** Nextcloud retrieves the officially published, cryptographically signed TAR.GZ and checks its integrity. This is the supported path for installation and future updates.

1. Use **Nextcloud 35** and an administrator account.
2. Under **Apps**, install and enable `hc_shared_app_core` **0.18.8 or newer**.
3. Find **FamilyTree** (`hc_familytree`) and install/enable it: https://apps.nextcloud.com/apps/hc_familytree.
4. Open it from the Nextcloud navigation menu. Back up the database and files before upgrades.

GitHub provides **source code**, not the primary installation workflow. GitHub source ZIPs and unsigned staging TAR.GZ files are **not** equivalent to the signed package distributed by Nextcloud. Until version 1.1.2 is actually published to the App Store it must not be described as available through that channel.

## 2. Development/test installer — Docker / NAS only

`sudo sh install.sh` is **not intended for normal users**. It is an advanced tool for developers, testers and administrators of a specific Docker-based Nextcloud deployment. Back up the database and attached files first.

Extract the **complete source repository** outside `custom_apps`; from its root run:

```sh
sudo sh install.sh
```

This script deploys `src/`, finds the web/cron containers, checks the Shared App Core dependency, validates PHP and schema, and activates the application. It may create missing database structures. It is not a portable generic Nextcloud installer, it does not sign releases, and it is not a replacement for normal Nextcloud updates.

The installer prints **16 progress steps** immediately, for example:

```text
[01/16] Kontrola opravneni a Dockeru ..... OK
[02/16] Vyhledani kontejneru Nextcloud ..... OK
...
[16/16] Overeni instalovane verze a souhrn ..... OK
```

On failure it reports diagnostics. For recovery and code backup details see [installer recovery](INSTALLER_RECOVERY.md). `uninstall.sh` is likewise a Docker administrator tool rather than the recommended uninstall path.

## 3. Official publication (release manager)

`sh build-release.sh` produces an **unsigned runtime ZIP** (`release/hc_familytree-1.1.2.zip`) required by Publisher CP21, an unsigned staging TAR.GZ, and exactly one public **`hc_familytree-1.1.2-full-source.zip`** for Publisher CP21. None is a signed App Store release. Following mandatory HDS and CP21 checks, the release manager must use Hacesoft Publisher to sign the installed application code (producing `appinfo/signature.json`), re-pack the final TAR.GZ, sign **the whole TAR.GZ**, and submit the HTTPS download URL and archive signature to the Nextcloud App Store. **Do not publish an unsigned staging artifact.** See [official Nextcloud instructions](https://nextcloudappstore.readthedocs.io/en/latest/developer.html).
