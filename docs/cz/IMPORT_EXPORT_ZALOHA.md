# Úplná záloha FamilyTree, GEDCOM a export/import výzkumného deníku

Kompletní normativní specifikaci obou formátů a bezpečný postup obnovy obsahuje **[FORMATY_IMPORT_EXPORT.md](FORMATY_IMPORT_EXPORT.md)**.

- **ZIP v2** (`hc-familytree-native-backup`): kompletní data 13 tabulek a dostupné soubory, vhodné pro zálohování; import vytváří **nové rodokmeny**.
- **Deník JSON v1** (`hc-familytree-research-journal`): pouze úkoly, hledání a důkazy; import do vybraného stromu s náhledem bez změny genealogických faktů. Nově je možný i samostatný export deníku.
- **GEDCOM 7 / GEDZIP:** genealogická výměna, nikoli úplná záloha soukromých dat FamilyTree.

V aktuálním UI už nejsou samostatná spodní tlačítka Import/Export: používají se plovoucí nabídky **⋯** v hlavičce aplikace a u každého rodokmenu.

Pro přípravu importního JSON v externích nástrojích použijte veřejnou [specifikaci formátu](FORMATY_IMPORT_EXPORT.md).

## Jednotný import od verze 1.1.0-dev11

V nabídce aplikace **⋯ → Import rodokmenu / zálohy** i u jednotlivého stromu se otevře volba typu souboru:

1. **GEDCOM 7 / GEDZIP:** `.ged`, `.gedcom`, `.gdz` a `.zip` s `gedcom.ged` v kořeni archivu. Ze souboru lze **založit nový rodokmen přímo v importním dialogu**, bez předchozího vytvoření prázdného stromu. Existující rodokmen je možné aktualizovat podle UID samostatnou volbou. Import má kontrolní náhled.
2. **Úplná záloha FamilyTree:** pouze původní `.zip` vytvořený nativním exportem FamilyTree (`manifest.json`, `data.json`, `files/<SHA256>`). Obnoví rodokmeny pod novými ID. Nepřepisuje existující data.

Některé ZIPy mohou obsahovat obvyklé přílohy a tabulky nad rámec GEDCOMu; ty zůstávají součástí archivovaného originálu, ale do genealogických tabulek se importují **jen údaje, které skutečně zpracovává parser GEDCOM 7**. Libovolný ZIP bez GEDCOMu ani bez nativního manifestu není podporován.

Při importu do **nového** rodokmenu se nejprve ověří celý soubor a poté se založí strom. Pokud server během zápisu ohlásí chybu nebo přeruší spojení, vytvořený strom se preventivně nemaže, protože jeho data už mohla být částečně/úplně přijata; nejprve zkontrolujte výsledek.
