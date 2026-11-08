# Interní kontrolní postup HDS — FamilyTree 1.1.1

**Interní materiál určený pouze pro Publisher / vývojové kontroly, nepatří do veřejného GitHub ZIPu.** Aktuální požadovaný standard: **HDS 1.2.1**; závazný vydávací profil: **Publisher CP21**. Autoritativní verze aplikace je `src/appinfo/info.xml`.

Původní lokální testy `npm run check` a `npm run l10n:strict` kontrolují zdroje a překladové katalogy, ale **nenahrazují HDS 1.2.1 ani Publisher CP21**. Kontrolor HDS se spouští pouze z ověřené externí instalace. Je-li k dispozici a podporuje tento profil, lze pro vývojovou diagnostiku použít:

```sh
HDS_CHECKER=/cesta/k/HDS/scripts/hacesoft_standard_check.py sh scripts/check-hds.sh --profile release
```

Vydání musí zastavit každé blokující selhání či neuzavřenou ruční bránu. **Toto není certifikát ani výsledek auditu.** Před publikací zkontrolovat plný funkční provoz na NC35, instalaci a upgrade, integrity podpis, dostupnost App Store screenshot URL, práva a bezpečnost. Odkazy screenshotů jsou v metadatech uvedeny jako veřejné URL do repozitáře FamilyTree. Při závěrečném vydání Publisher ověřuje jejich dosažitelnost; dřívější údaj o všech chybějících snímcích HTTP 404 nebyl správný.
