[English](../en/02_CORE.md)

# Integrace se Shared App Core

Rodokmen 1.0.0 vyžaduje `hc_shared_app_core` verze 0.18.8 nebo novější (API kontrakt `hc-shared-app-core-v1`, API verze 1). Závislost je uvedena v `appinfo/hc_shared_app_core.json` a ověřuje se při spuštění aplikace.

Rozhraní používá `core.layout.observe`, `core.dialogs`, `core.notifications`, `core.toolbar`, `core.picker` a `core.editor`. Poznámky osob se ukládají přes vlastní API Rodokmenu, nikoliv přímo do Core. Editor zatím nemá samostatný endpoint pro nahrávání obrázků v poznámkách; přílohy lze spravovat přes dokumenty.

Vlastní data osob, rodin, vztahů, práv a importů GEDCOM spravují doménové služby Rodokmenu. Používají se překlady v `l10n/` a jazyk z Nextcloudu; uložená data se změnou jazyka nepřepisují.
