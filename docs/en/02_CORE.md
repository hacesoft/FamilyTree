[Česky](../cz/02_CORE.md)

# Shared App Core integration

FamilyTree 1.0.0 requires `hc_shared_app_core` version 0.18.8 or newer (contract `hc-shared-app-core-v1`, API version 1). The dependency is declared in `appinfo/hc_shared_app_core.json` and checked on startup.

The UI uses `core.layout.observe`, `core.dialogs`, `core.notifications`, `core.toolbar`, `core.picker` and `core.editor`. Person notes are stored by FamilyTree's own API. The note editor currently has no dedicated image-upload endpoint; use the document attachment workflow for images.

FamilyTree domain services manage people, relations, tree permissions and GEDCOM import. `l10n/` translations follow the user's Nextcloud language without rewriting stored data.
