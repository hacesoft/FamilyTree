# Obrázky pro Nextcloud App Store – FamilyTree 1.1.6

**Ikona pro aplikaci:** `src/img/app.svg` (ve vydaném TAR.GZ jako `img/app.svg`). Zůstává bitově nezměněná a je jediným distribuovaným grafickým souborem aplikace.

**Screenshoty App Storu:** Výhradně uživatelem schválené soubory `01.png`, `02.png`, `03.png`, veřejně uložené **mimo vydávací archivy** ve složce `screenshot/` v kořeni GitHub repozitáře `hacesoft/familytree` na větvi `main`.

- https://raw.githubusercontent.com/hacesoft/familytree/main/screenshot/01.png
- https://raw.githubusercontent.com/hacesoft/familytree/main/screenshot/02.png
- https://raw.githubusercontent.com/hacesoft/familytree/main/screenshot/03.png

První obrázek slouží i jako `small-thumbnail` karty obchodu. Žádné PNG se **nepřidává** do Publisher vstupního ZIPu, GitHub full-source ZIPu ani runtime TAR.GZ; Publisher je negeneruje ani nepřekóduje. V obou README je odkaz na `screenshot/01.png` – na GitHubu funguje po ručním nahrání screenshotů, v samostatném staženém zdrojovém ZIPu nebude obrázek uložen.

## Povinný postup vydání

1. Vytvořit na GitHubu v kořeni repozitáře složku **`screenshot/`** a ručně do ní nahrát původní tři schválené PNG. Neměnit obsah, název, poměr stran ani metadata.
2. Ověřit dostupnost, PNG strukturu, rozměry a SHA-256 přes `node scripts/check-appstore-public-urls.cjs`. Původní schválené hashe jsou v `scripts/appstore-approved-assets.json`.
3. Teprve po PASS kontroly veřejných URL zaregistrovat novou podepsanou verzi v Nextcloud App Storu. Pokud URL nejsou dostupná, stav je **BLOCKING**, nikoli PASS.
4. Po publikaci samostatně zkontrolovat galerii a obrazovou cache `usercontent.apps.nextcloud.com`. Správné metadata sama nezaručují načtení screenshotů.

**Certifikát:** Přejmenování GitHub repozitáře samo o sobě nevyžaduje nový podpisový certifikát; rozhodující je stabilní ID `hc_familytree`. Při případném přejmenování aktualizovat všechny GitHub URL a znovu vydat podepsanou aplikaci.
