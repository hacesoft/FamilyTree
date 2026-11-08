[English](../en/01_INSTALLATION.md)

# Instalace FamilyTree 1.1.1

## 1. Oficiální instalace (doporučená)

**Běžný uživatel používá pouze administraci Nextcloudu → Aplikace.** Nextcloud instaluje oficiálně publikovaný, podepsaný TAR.GZ a kontroluje jeho integritu; tento postup umožňuje následné standardní aktualizace.

1. Požadavek: **Nextcloud 35** a oprávnění správce.
2. V **Aplikacích** nainstalujte a povolte `hc_shared_app_core` **0.18.8 nebo novější**.
3. Vyhledejte **FamilyTree / Rodokmen**, nainstalujte a povolte (`hc_familytree`). Odkaz: https://apps.nextcloud.com/apps/hc_familytree.
4. Otevřete aplikaci z hlavního menu. Před aktualizací zazálohujte databázi a soubory.

Repozitář GitHub je určen pro **zdrojové kódy**, nikoliv jako primární cesta instalace. GitHub ZIP ani nepodepsaný staging TAR.GZ nenahrazují podepsaný balíček v Nextcloud App Storu. Když verze 1.1.1 ještě není v App Storu, znamená to, že dosud nebyla publikována; nelze ji považovat za oficiální jen na základě staženého ZIPu.

## 2. Vývojářský/testovací instalátor — pouze Docker / NAS

`sudo sh install.sh` **není určen běžným uživatelům**. Slouží vývojářům, testerům a správcům specifického Docker prostředí, které mají pod kontrolou kontejnery Nextcloudu. Před prvním spuštěním zazálohujte databázi a připojené soubory.

Rozbalte **úplný zdrojový projekt** mimo `custom_apps` a z jeho kořene spusťte:

```sh
sudo sh install.sh
```

Skript využívá zdroje `src/`, vyhledá webový a případný cron kontejner, zkontroluje aktivní Shared App Core, nasadí kód, ověří PHP a potřebnou databázovou strukturu a aktivuje aplikaci. Umí vytvořit chybějící tabulky, sloupce a indexy. Není přenosný na libovolnou instalaci Nextcloudu, nepodepisuje aplikaci a nenahradí její standardní aktualizace v App Storu.

Instalátor živě vypisuje **16 kroků**, například:

```text
[01/16] Kontrola opravneni a Dockeru ..... OK
[02/16] Vyhledani kontejneru Nextcloud ..... OK
...
[16/16] Overeni instalovane verze a souhrn ..... OK
```

Při chybě vypíše diagnostiku. Více k opakování a záloze kódu: [obnova instalátoru](OPRAVA_INSTALACE.md). `uninstall.sh` je obdobně určen jen správcům Dockeru; není to běžný způsob odinstalace.

## 3. Výroba oficiálního vydání (správce vydání)

`sh build-release.sh` sestaví **nepodepsaný běhový ZIP** (`release/hc_familytree-1.1.1.zip`) pro Publisher CP21, nepodepsaný staging TAR.GZ a právě jeden veřejný **`hc_familytree-1.1.1-full-source.zip`** pro Publisher CP21. Všechny tyto archivy jsou mezivýstupy, nikoliv podepsané vydání. Po HDS a CP21 kontrolách musí vydavatel v Hacesoft Publisheru podepsat instalační kód pomocí certifikátu aplikace (vznikne `appinfo/signature.json`), vytvořit finální TAR.GZ, podepsat **celý archiv** a nahrát HTTPS URL plus podpis do Nextcloud App Storu. **Bez obou podpisových kroků nevydávat.** Viz [oficiální pravidla Nextcloudu](https://nextcloudappstore.readthedocs.io/en/latest/developer.html).
