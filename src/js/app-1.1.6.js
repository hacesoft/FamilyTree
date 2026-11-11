/**
 * @file Hlavní rozhraní rodokmenu, výzkumného deníku a importů.
 * Používané prefixy maďarské notace (Czech / English):
 * - o = objekt / object (např. oRoot, oCore),
 * - s = řetězec / string (např. sTitle, sHtml),
 * - n = číslo / number (např. nIndex),
 * - b = logická hodnota / boolean,
 * - a = pole / array,
 * - fn = funkce nebo callback / function,
 * - h = odkaz na prvek / handle (pokud je použit).
 * Názvy datových polí, CSS tříd, ID prvků a překladových klíčů jsou veřejné kontrakty,
 * a proto se maďarská notace týká pouze lokálních proměnných, nikoli těchto klíčů.
 */
(/** @h05-inline
 * @brief Provede vloženou callback operaci ve zpracovávaném rodokmenu.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>{'use strict';
const sAPP='hc_familytree',fnValue=/**
 * @brief Vyhledá v dokumentu HTML prvek podle jeho identifikátoru.
 * @param {string} sId Textový parametr sId předaný operaci.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */ sId=>document.getElementById(sId),fnEsc=/**
 * @brief Převede nebezpečné HTML znaky na entity pro bezpečné vložení textu.
 * @param {unknown} oS Hodnota, jejíž HTML znaky mají být bezpečně zakódovány.
 * @returns {string} Výsledek uvedené operace nebo informace o jejím dokončení.
 */ oS=>String(oS??'').replace(/[&<>'"]/g,/** @h05-inline
 * @brief Vytvoří náhradní text pro odpovídající část řetězce.
 * @param {string} sC Hodnota sC předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sC=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[sC]));
// Translate only the static HTML chunks. User names and saved notes remain untouched.
// English is a supported source-locale fallback. Nextcloud may not load en.js when its
// own source language is English, so never leave Czech labels untranslated.
const sAppLanguage=String(document.getElementById(sAPP)?.dataset.appLanguage||window.OC?.getLanguage?.()||document.documentElement.lang||'en').toLowerCase();
// Anglický fallback je samotný kanonický anglický klíč; EN slovník není třeba duplikovat.

// English source strings are canonical. Legacy Czech keys are normalized only for
// imported older server messages and older static snippets during migration.
const oLegacyKeyMap=/* LEGACY_KEYS_START */{
  " nelze spustit": " cannot be started",
  " Zkontrolujte vytvořený rodokmen před opakováním; aplikace nic automaticky nemaže.": " Check the new tree before retrying; the app does not delete it automatically.",
  "Aktualizovat tuto sadu podle UID": "Update this dataset by UID",
  "Aktualizováno:": "Updated:",
  "Aktuální deník": "Current journal",
  "Aktuální počty databázových záznamů": "Current database record counts",
  "Aktuálně otevřený rodokmen:": "Currently open family tree:",
  "Aktuálně otevřený strom: osoby, vztahy, události a poznámky. Není to úplná záloha.": "Currently open tree: people, relationships, events and notes. This is not a complete backup.",
  "Aplikace nemůže pokračovat, protože Shared App Core není nainstalované, povolené nebo neodpovídá.": "The app cannot continue because Shared App Core is missing, disabled, or incompatible.",
  "Aplikaci": "the app",
  "Archiv": "Archive",
  "Archiv nelze znovu otevřít.": "Cannot reopen the archive.",
  "Archiv obsahuje duplicitní cestu.": "Archive contains a duplicate path.",
  "Archiv obsahuje nebezpečnou cestu.": "Archive contains an unsafe path.",
  "Archiv obsahuje příliš mnoho souborů.": "Archive contains too many files.",
  "Archiv P/F/Q": "Archive P/F/Q",
  "Archiv překračuje velikostní limit.": "Archive exceeds the size limit.",
  "Archiv ZIP nelze otevřít.": "Cannot open ZIP archive.",
  "Archivní nález": "Archive finding",
  "Archivní údaje osoby": "Archived person records",
  "Automaticky srovnat karty": "Arrange cards automatically",
  "Automaticky srovnat karty?": "Arrange cards automatically?",
  "Badatelská tvrzení": "Research claims",
  "badatelská tvrzení": "research claims",
  "Badatelská tvrzení F": "Research claims F",
  "badatelských tvrzení": "of research claims",
  "Balíček musí být menší než 64 MB.": "The package must be smaller than 64 MB.",
  "Balíček neobsahuje odkazovaný soubor: ": "Package does not contain the referenced file: ",
  "Bez druhého rodiče": "No second parent",
  "Bez důkazu – pouze koncept": "No evidence – draft only",
  "Bez poznámek": "No notes",
  "Bez přiřazeného úkolu": "No assigned task",
  "Bez uvedeného stavu": "Unspecified status",
  "Bez uvedeného typu": "Unspecified type",
  "Beze změny:": "Unchanged:",
  "Budou odstraněny všechny osoby, vztahy, události a odkazy na dokumenty.": "All people, relationships, events, and document links will be removed.",
  "Bydliště": "Residence",
  [
    "Běžný ZIP lze otevřít jako GEDZIP, pokud obsahuje GEDCOM 7 v souboru gedcom.ged. Libovolné " +
    "archivy ZIP podporované nejsou."
  ]: (
    "An ordinary ZIP can be imported as GEDZIP if it contains GEDCOM 7 in a root-level " +
    "gedcom.ged file. Arbitrary ZIP archives are not supported."
  ),
  "C – citace": "C – citations",
  "Celkem položek (prostý součet)": "Total records (simple sum)",
  "Celý strom": "Entire tree",
  "Cesta k importu není složka.": "Import path is not a directory.",
  "Chybí místní soubor média: ": "Local media file is missing: ",
  "Chybí nebo je neplatná tabulka ": "Missing or invalid table: ",
  "Chybí nebo je neplatné source_id v ": "Missing or invalid source_id in ",
  "Chybí obousměrný odkaz FAMC u ": "Missing reciprocal FAMC link for ",
  "Chybí obousměrný odkaz FAMS u ": "Missing reciprocal FAMS link for ",
  "Chybí platný JSON deníku.": "Valid journal JSON is missing.",
  "Chybí soubor přílohy.": "Attachment file is missing.",
  "Chybí stabilní identifikátor. Nejprve spusťte jednorázovou migraci: ": "Stable identifier is missing. Run the one-time migration first: ",
  "Chybějící obrázky": "Missing images",
  "Chybějící obrázky:": "Missing images:",
  "chybějící soubory:": "missing files:",
  "chybějící:": "missing:",
  "Citace": "Citations",
  "citace": "citations",
  "Citace / médium: sken, dokument, fotografie": "Citation / media: scan, document, photograph",
  "Co a kde jsem hledal(a)": "What and where I searched",
  "create": "Created",
  "Cíl importu": "Import destination",
  "Cílová osoba neexistuje.": "Target person does not exist.",
  "Cílový adresář koliduje se souborem.": "Destination directory conflicts with an existing file.",
  "Další akce": "More actions",
  "Další fakta": "Other facts",
  "Další krok": "Next step",
  "Další ověřitelný krok": "Next verifiable step",
  "Databázová část zálohy je příliš velká.": "The database part of the backup is too large.",
  [
    "Databázové záznamy, vazby, výzkumné varianty, sdílení a soubory dostupné ve Files. Externí " +
    "URL jsou uložené jako odkazy."
  ]: (
    "Database records, connections, research variants, sharing, and files accessible in " +
    "Nextcloud Files. External URLs remain links."
  ),
  "Datum": "Date",
  "Datum dokumentu": "Document date",
  "Datum narození": "Date of birth",
  "Datum úmrtí": "Date of death",
  "delete": "Deleted",
  "Deník byl připraven ke stažení.": "The journal is ready for download.",
  "Deník hledání": "Search log",
  "Deník je pro JSON přenos větší než 1 MiB; použijte úplnou ZIP zálohu v2.": "Journal exceeds 1 MiB for JSON transfer; use a complete ZIP backup v2.",
  "Do": "To",
  "Dokument": "Document",
  "Dokument nemá v záloze svůj soubor: ": "The document file is missing from the backup: ",
  "Dokument odkazuje na neznámou osobu.": "Document references an unknown person.",
  "Dokumenty": "Documents",
  "dokumentů": "documents",
  "Domů": "Home",
  "Dopis": "Letter",
  "Druhý rodič": "Second parent",
  "Druhý rodič / partner": "Second parent / partner",
  "Duplicitní GEDCOM identifikátor ": "Duplicate GEDCOM identifier ",
  "Duplicitní nebo nebezpečná položka ZIPu.": "Duplicate or unsafe ZIP entry.",
  "Duplicitní source_id v souboru: ": "Duplicate source_id in file: ",
  "Duplicitní stabilní ID napříč tabulkami.": "Duplicate stable ID across tables.",
  "Duplicitní výzkumný úkol.": "Duplicate research task.",
  "Dvojklikem otevřít výzkumný deník": "Double-click to open the research journal",
  "Dítě": "Child",
  "Dítě lze později upravit stejně jako ostatní osoby.": "You can edit the child later like any other person.",
  "Dítě se nepodařilo přidat: ": "Could not add child: ",
  "Dítě:": "Child:",
  "dřívějších záznamů v novém souboru chybí; zůstanou zachovány k ruční kontrole.": "previous records are absent from the new file; they will be retained for manual review.",
  "Důkaz nepatří do rodokmenu.": "Evidence does not belong to this family tree.",
  "Důkaz odkazuje na chybějící úkol.": "Evidence references a missing task.",
  "Důkazy": "Evidence",
  "E – události": "E – events",
  "evidovaných médií": "registered media",
  "Export": "Export",
  "Export deníku překročil limit 1 MiB.": "Journal export exceeded the 1 MiB limit.",
  "Export GEDCOM": "Export GEDCOM",
  "Export obsahuje základní osoby a vazby. Výzkumná tvrzení se v tomto formátu nepřenášejí.": "The export contains basic people and relationships. Research assertions are not included.",
  "Export rodokmenu": "Export family trees",
  "Export všech mých rodokmenů": "Export all my family trees",
  "Exportovat tento rodokmen": "Export this family tree",
  "Exportovat výzkumný deník (JSON)": "Export research journal (JSON)",
  "F – jednotlivá tvrzení": "F – individual claims",
  "FamilyTree": "FamilyTree",
  "Formát:": "Format:",
  "Fotografie": "Photograph",
  "Fotografie osob a připojené dokumenty": "Person photographs and attached documents",
  "GEDCOM 7 (.ged)": "GEDCOM 7 (.ged)",
  "GEDCOM 7 / GEDZIP (.ged, .gedcom, .gdz, .zip)": "GEDCOM 7 / GEDZIP (.ged, .gedcom, .gdz, .zip)",
  "GEDCOM 7 musí mít kódování UTF-8.": "GEDCOM 7 must use UTF-8 encoding.",
  "GEDCOM import / export": "GEDCOM import / export",
  "GEDCOM je prázdný.": "The GEDCOM file is empty.",
  "GEDCOM musí být UTF-8 a menší než 5 MB.": "GEDCOM must use UTF-8 and be smaller than 5 MB.",
  "GEDCOM musí začínat HEAD a končit TRLR.": "GEDCOM must begin with HEAD and end with TRLR.",
  [
    "GEDCOM není úplná záloha. Výzkumné varianty, citace a přílohy ze Souborů Nextcloudu se " +
    "nepřenášejí. Export databázi nemění."
  ]: (
    "GEDCOM is not a complete backup. Research alternatives, citations, and Nextcloud Files " +
    "attachments are not included. Export does not change the database."
  ),
  "GEDCOM neobsahuje žádnou osobu.": "GEDCOM contains no people.",
  "GEDCOM překračuje limit 5 MB.": "GEDCOM exceeds the 5 MB limit.",
  "Generace": "Generation",
  "Historie nemá úplné hodnoty.": "History record does not contain complete values.",
  "Historie změn": "Change history",
  "Hledat ID, jméno, signaturu, knihu nebo text": "Search ID, person, archive signature, book or text",
  "Hledat osobu": "Search for a person",
  "Hledat uživatele nebo skupinu": "Search for a user or group",
  "Hledat uživatele nebo skupinu…": "Search for a user or group…",
  "Hledat v záznamech": "Search entries",
  "Hledat úkol nebo Q ID": "Search task or Q ID",
  "Hledání": "Searches",
  "Hledání odkazuje na chybějící úkol.": "Search references a missing task.",
  "Hodnoty osoby se od změny liší, automatické vrácení není bezpečné.": "Person values have changed; automatic reversal would be unsafe.",
  "Hotovo": "Completed",
  "Hypotéza": "Hypothesis",
  "Identifikátor na vnořeném řádku GEDCOM.": "Identifier on a nested GEDCOM line.",
  "Import": "Import",
  "Import / export": "Import / export",
  "Import databází": "Import databases",
  "Import GEDCOM 7 / GEDZIP": "Import GEDCOM 7 / GEDZIP",
  [
    "Import genealogických údajů a přiložených obrázků. Můžete rovnou vytvořit nový rodokmen " +
    "nebo importovat do otevřeného stromu."
  ]: (
    "Import genealogical records and attached images. Create a new family tree directly, or " +
    "import into the currently open tree."
  ),
  "Import je uložen, ale obnovení stromu se nepodařilo: ": "The import was saved, but the tree could not be refreshed: ",
  "Import nemá zobrazené vazby; zkontrolujte rodiny FAM a Výzkumné záznamy.": "The import has no displayed links; check FAM families and research records.",
  [
    "Import nemění osoby, vztahy, události ani existující záznamy. Důkazy z importu nelze " +
    "automaticky označit jako ověřené."
  ]: (
    "Import does not alter people, relationships, events or existing records. Imported evidence " +
    "cannot be automatically marked as verified."
  ),
  "Import neobsahuje žádnou osobu.": "Import contains no people.",
  "Import přidá osoby do aktuálního rodokmenu. Před ostrým importem doporučujeme samostatný prázdný rodokmen.": "Import adds people to the current family tree. Test on a separate empty tree first.",
  [
    "Import přidává údaje do právě otevřeného stromu. Stejná sada a ID se při opakování " +
    "neduplikují. Odlišný obsah pod stejným ID se nepřepíše."
  ]: (
    "Import adds to the open tree. Reimporting the same collection and IDs does not duplicate " +
    "data. A changed record with an existing ID is not overwritten."
  ),
  "Import rodokmenu": "Import family trees",
  "Import rodokmenu / zálohy": "Import family tree / backup",
  "Import rodokmenu nebo zálohy": "Import family tree or backup",
  "Import selhal.": "Import failed.",
  "Import výzkumného deníku": "Import research journal",
  "Import výzkumného deníku ": "Research journal import ",
  "Importní sada": "Import package",
  "Importní soubor je neplatný.": "The import file is invalid.",
  "Importované výzkumné záznamy": "Imported research records",
  "importovaných sad": "imported sets",
  "Importovat": "Import now",
  "Importovat do otevřeného rodokmenu": "Import into the open family tree",
  "Importovat do otevřeného rodokmenu:": "Import into the open family tree:",
  "Importovat do prázdného stromu": "Import into an empty tree",
  "Importovat do tohoto rodokmenu": "Import into this family tree",
  "Importovat GEDCOM": "Import GEDCOM",
  "Importovat jako nový rodokmen": "Import as a new family tree",
  "Importovat výzkumný deník (JSON)": "Import research journal (JSON)",
  "Importovat zkontrolovaná data": "Import reviewed data",
  "Importovat zkontrolované záznamy": "Import reviewed records",
  "Importováno nových záznamů: ": "New entries imported: ",
  "Importováno osob: ": "People imported: ",
  [
    "Importuje pouze výzkumné úkoly, průběh hledání a kandidátní důkazy. Osoby, vztahy, " +
    "události ani původní tvrzení nemění."
  ]: (
    "Imports only research tasks, searches, and candidate evidence. People, relationships, " +
    "events, and existing assertions are not modified."
  ),
  [
    "Jen archiv vytvořený funkcí „Export úplné zálohy FamilyTree“. Obnova kopíruje původní " +
    "stromy pod novými ID, nic nepřepisuje."
  ]: (
    "Only archives created by the complete FamilyTree backup export. Restoration creates " +
    "separate trees with new IDs and overwrites nothing."
  ),
  "jen pro čtení": "read-only",
  "Jiná": "Other",
  "Jiná událost": "Other event",
  "Jiný dokument": "Other document",
  "Jistota (slovní hodnocení)": "Confidence (text assessment)",
  "Již existují": "Already present",
  "Již existující záznamy:": "Existing records:",
  "Jméno": "First name",
  [
    "JSON zachová osoby, vztahy, události i všechna tvrzení, prameny, citace a odkazy na média. " +
    "ZIP může navíc obsahovat obrázky ve složce"
  ]: (
    "JSON keeps people, relationships, events, assertions, sources, citations, and media links. " +
    "ZIP may also contain images in"
  ),
  "Kandidát": "Candidate",
  "Karty byly automaticky srovnány.": "Cards were arranged automatically.",
  "Karty nastavení": "Settings tabs",
  "Každé tvrzení zůstává samostatně, včetně rozdílných variant.": "Each assertion remains separate, including conflicting variants.",
  [
    "Každé tvrzení zůstává samostatně, včetně rozdílných variant. Kódy P, F, Q a další lze " +
    "vyhledávat ve Výzkumném deníku."
  ]: (
    "Each claim is preserved separately, including conflicting variants. Search for P, F, Q and " +
    "other IDs in the Research Journal."
  ),
  [
    "Každý databázový záznam je v součtu právě jednou. Počet rodokmenů se počítá jako jedna " +
    "položka na strom. Podrobné rozdělení níže se již nepřičítá. Historie zahrnuje všechny " +
    "uložené záznamy, nejen posledních 500 zobrazených."
  ]: (
    "Each database row is counted exactly once. Each tree is counted as one record. The " +
    "breakdown below does not add to the total. History includes all stored records, not just " +
    "the latest 500 shown."
  ),
  "Konfliktní varianty se neslučují.": "Conflicting variants are kept separately.",
  "Konfliktní vazby a tvrzení:": "Conflicting relationships and claims:",
  "Konflikty:": "Conflicts:",
  "Kontrola dat:": "Data validation:",
  "Kontrolní součet přílohy nesouhlasí.": "Attachment checksum does not match.",
  "Kontroluji import…": "Checking import…",
  "Kontroluji výzkumný deník…": "Checking research journal…",
  "Kořen aplikace hc_familytree nebyl nalezen.": "FamilyTree application root was not found.",
  "Kořenová osoba v záloze neexistuje.": "Root person in backup does not exist.",
  "Křest": "Baptism",
  "Křestní list": "Baptism certificate",
  "Legenda vazeb": "Relationship legend",
  "lokálně uložených obrazových souborů": "locally saved images",
  "M – skeny a fotografie": "M – scans and photographs",
  "Matrika": "Registry",
  "Matriky a fotografie": "Registers and photographs",
  "Mažu rodokmeny…": "Deleting family trees…",
  "MIME typ": "MIME type",
  "Mobil a dotyk": "Mobile and touch",
  "Mobilní práce se stromem": "Using the tree on mobile",
  "Muž": "Man",
  "Média": "Media",
  "média": "media",
  "Média nelze bezpečně uložit: ": "Media cannot be saved safely: ",
  "Médium {name} ({type}) je evidováno; náhled je dostupný jen pro obrázky.": "Media {name} ({type}) is recorded; previews are available only for images.",
  "Místa": "Places",
  "místa": "places",
  "Místo": "Place",
  "Místo narození": "Place of birth",
  "Místo úmrtí": "Place of death",
  "Může upravovat": "Can edit",
  "Na mobilu odemknout přesouvání karet": "Unlock card movement on mobile",
  "Nabídka aplikace": "Application menu",
  "Najetím na čáru zobrazíte konkrétní osoby a vztah.": "Hover over a line to see the people and their relationship.",
  "Nalezeno": "Found",
  "Naposledy upravené": "Recently updated",
  "např. 12. 3. 1948": "e.g. 12 Mar 1948",
  "např. 12. 3. 2020": "e.g. 12 Mar 2020",
  "např. potvrzený originál": "e.g. verified original",
  "Například P0027, F00274, Q0003, 12437…": "For example P0027, F00274, Q0003, 12437…",
  "Narození": "Birth",
  "Nastavení": "Settings",
  "Nastavení a informace": "Settings and information",
  "Nastavení aplikace": "Application settings",
  "Nastavit rodiče": "Set parents",
  "Navrhnout změnu osoby": "Propose a person change",
  "Navrhovaná hodnota": "Proposed value",
  "Načtení rodokmenů selhalo.": "Could not load family trees.",
  "Načíst náhled externí fotografie": "Load external photo preview",
  "Načítání rodokmenu…": "Loading family tree…",
  "Nebezpečná nebo neplatná cesta souboru: ": "Unsafe or invalid file path: ",
  "Nebyl nahrán platný archiv FamilyTree.": "No valid FamilyTree archive was uploaded.",
  "Neexistující odkaz ": "Missing reference ",
  "Neexistující úkol pro záznam ": "Missing task for record ",
  "Nejdříve otevřete rodokmen, který chcete exportovat do GEDCOM.": "Open the family tree that you want to export to GEDCOM first.",
  "Nejdříve přidejte další osobu.": "Add another person first.",
  "Nejdříve vyberte uživatele nebo skupinu.": "Select a user or group first.",
  "Nejdříve vytvořte partnerský vztah.": "Create a partnership first.",
  "Nejdříve vytvořte událost, například Svatba.": "Create an event, such as a marriage, first.",
  [
    "Nejdříve zobrazíme náhled. Stejnou zdrojovou sadu lze bezpečně importovat opakovaně: již " +
    "přítomné položky se přeskočí. Stav ověřeno nelze získat pouhým importem."
  ]: (
    "Preview comes first. Re-importing the same source safely skips existing entries. Imported " +
    "evidence cannot automatically become verified."
  ),
  "Nelze smazat jeden z rodokmenů.": "One of the family trees could not be deleted.",
  "Nelze vytvořit dočasný archiv.": "Cannot create a temporary archive.",
  "Nemáte oprávnění upravovat tento rodokmen.": "You do not have permission to edit this family tree.",
  "Nemáte vlastní rodokmen k zálohování.": "You have no owned family trees to back up.",
  "Nemáte žádné vlastní rodokmeny ke smazání.": "You do not own any family trees to delete.",
  "Nenalezeno": "Not found",
  [
    "Neodvolatelně odstraníte všechny své rodokmeny, osoby, vztahy, dokumentové vazby a " +
    "sdílení. Cizí sdílené stromy zůstanou zachované."
  ]: (
    "This permanently deletes all family trees you own, including people, relationships, " +
    "document links and shares. Trees shared with you by other owners will remain."
  ),
  "Neověřeno": "Unverified",
  "neověřeno": "unverified",
  "Neplatná cesta k médiu.": "Invalid media path.",
  "Neplatná cílová cesta.": "Invalid destination path.",
  "Neplatná databázová hodnota v ": "Invalid database value in ",
  "Neplatná hodnota: ": "Invalid value: ",
  "Neplatná lokální cesta média: ": "Invalid local media path: ",
  "Neplatná nebo příliš dlouhá hodnota: ": "Invalid or excessively long value: ",
  "Neplatná položka ZIPu.": "Invalid ZIP entry.",
  "Neplatná priorita.": "Invalid priority.",
  "Neplatná přípona obrázku.": "Invalid image extension.",
  "Neplatná tabulka: ": "Invalid table: ",
  "Neplatná URL zdroje.": "Invalid source URL.",
  "Neplatná vazba dokumentu.": "Invalid document link.",
  "Neplatná úroveň nebo konec GEDCOM na řádku ": "Invalid GEDCOM level or ending at line ",
  "Neplatné identifikátory osob.": "Invalid person identifiers.",
  "Neplatné nebo duplicitní ID v ": "Invalid or duplicate ID in ",
  "Neplatné nebo duplicitní soubory v záloze.": "Invalid or duplicate files in backup.",
  "Neplatné odkazy osob ve výzkumném úkolu.": "Invalid person references in research task.",
  "Neplatné označení zdrojové sady.": "Invalid source dataset label.",
  "Neplatné person_refs.": "Invalid person_refs.",
  "Neplatné rozhodnutí.": "Invalid decision.",
  "Neplatný archivní odkaz.": "Invalid archive URL.",
  "Neplatný export deníku.": "Invalid journal export.",
  "Neplatný GEDCOM 7.": "Invalid GEDCOM 7.",
  "Neplatný identifikátor původního rodokmenu.": "Invalid original family tree identifier.",
  "Neplatný nebo duplicitní identifikátor v tabulce ": "Invalid or duplicate identifier in table ",
  "Neplatný nebo lokální odkaz na fotografii": "Invalid or local photograph URL",
  "Neplatný návrh.": "Invalid proposal.",
  "Neplatný odkaz na ": "Invalid reference to ",
  "Neplatný odkaz na osobu.": "Invalid reference to person.",
  "Neplatný počet nebo struktura záznamů: ": "Invalid record count or structure: ",
  "Neplatný režim importu.": "Invalid import mode.",
  "Neplatný rodič.": "Invalid parent.",
  "Neplatný rodokmen.": "Invalid family tree.",
  "Neplatný stav důkazu.": "Invalid evidence status.",
  "Neplatný stav úkolu.": "Invalid task status.",
  "Neplatný uživatel nebo skupina.": "Invalid user or group.",
  "Neplatný vztah.": "Invalid relationship.",
  "Neplatný výsledek hledání.": "Invalid search outcome.",
  "Neplatný záznam v ": "Invalid record in ",
  "Neplatný řádek GEDCOM ": "Invalid GEDCOM line ",
  "Nepovolené pole návrhu.": "Disallowed proposal field.",
  "Nepovolený soubor nebo cesta v ZIPu.": "Disallowed file or path in the ZIP archive.",
  "nepřítomných v souboru": "absent from file",
  "Nesouhlasí obousměrné vazby INDI/FAM u ": "Reciprocal INDI/FAM links do not match for ",
  "Nesprávný formát nebo verze výzkumného deníku.": "Invalid research journal format or version.",
  "Neuvedeno": "Unspecified",
  "Nezařazení": "Unassigned",
  "Neznámá osoba": "Unknown person",
  "Neznámé poznámky:": "Unknown notes:",
  "Neznámý nebo nepodporovaný formát zálohy FamilyTree.": "Unknown or unsupported FamilyTree backup format.",
  "Neznámý stav FAMC.STAT: ": "Unknown FAMC.STAT status: ",
  "Neznámý typ vlastníka: ": "Unknown owner type: ",
  "Neúplná záloha.": "Incomplete backup.",
  "Neúplné databázové tabulky FamilyTree v archivu.": "Incomplete FamilyTree database tables in archive.",
  "Normalizace:": "Normalized:",
  "Normální": "Normal",
  "Nová událost": "New event",
  "Nové": "New",
  "Nové osoby:": "New people:",
  "Nové vztahy:": "New relationships:",
  "Nové:": "New:",
  "Nový import vyžaduje prázdný rodokmen. Pro tuto sadu zvolte aktualizaci podle UID.": "A new import requires an empty family tree. Select update by UID for this dataset.",
  "Nový rodokmen": "New family tree",
  [
    "Nový rodokmen se vytvoří teprve po úspěšné kontrole souboru a po vašem potvrzení importu. " +
    "Při aktualizaci se údaje porovnávají podle UID; nepřítomné záznamy se automaticky nemažou."
  ]: (
    "A new tree is created only after the file passes validation and you confirm the import. " +
    "Updates match records by UID and do not automatically delete missing records."
  ),
  "Nový rodokmen vyžaduje režim new.": "Creating a new family tree requires new mode.",
  "Nový výzkumný úkol": "New research task",
  "Nově uložené obrázky:": "Images saved:",
  "Náhled fotografie": "Photograph preview",
  "Nálezy a důkazy": "Findings and evidence",
  "Nápověda": "Help",
  "Nástroje rodokmenu": "Family tree tools",
  "Návrh byl již vyřízen.": "Proposal has already been resolved.",
  "Návrh na osobu": "Person proposal",
  "Návrh odkazuje na cizí důkaz.": "Proposal references evidence from another family tree.",
  "Návrh odkazuje na neznámou osobu.": "Proposal references an unknown person.",
  "Návrhy a rozpory": "Proposals and conflicts",
  "Návrhy změn": "Change proposals",
  "Název": "Name",
  "Název a soubor jsou povinné.": "A title and a file are required.",
  "Název je povinný.": "A name is required.",
  "Název nového rodokmenu": "New family tree name",
  "Název rodokmenu": "Family tree name",
  "Název výzkumného úkolu je povinný.": "Research task title is required.",
  "Název, signatura, text, osoba…": "Title, signature, text, person…",
  "Nízká": "Low",
  "Některá osoba má více než dva zobrazené rodiče. GEDCOM export by ztratil vazby.": "A person has more than two visible parents. GEDCOM export would lose links.",
  "O aplikaci": "About",
  "Obnova by přepsala existující soubor: ": "Restore would overwrite an existing file: ",
  "Obnova vytvoří nové rodokmeny, nic nepřepíše.": "Restore creates new trees without overwriting existing records.",
  [
    "Obnova vytvoří nové stromy. Stávající data se nepřepisují. Sdílení se zapne jen na " +
    "výslovnou žádost."
  ]: (
    "Restoring creates new family trees. Existing data will not be overwritten. Sharing is " +
    "re-enabled only when explicitly requested."
  ),
  "Obnovení": "Restoration",
  "obnovení": "restore",
  "Obnovených rodokmenů:": "Restored family trees:",
  "Obnovených rodokmenů: ": "Restored family trees: ",
  "Obnovit jako nové rodokmeny": "Restore as new family trees",
  "Obnovit výchozí polohu legendy": "Reset legend position",
  "Obnovit zálohu FamilyTree": "Restore FamilyTree backup",
  "Obnovit úplnou zálohu FamilyTree (.zip)": "Restore a full FamilyTree backup (.zip)",
  "Obnoví interní záznamy včetně výzkumných variant, propojení, dokumentů a uložených médií.": "Restores internal records including research variants, references, documents, and stored media.",
  "obrázek": "image",
  "Obrázek chybí.": "Image is missing.",
  "Obrázek není platný nebo nesouhlasí kontrolní součet: ": "Image is invalid or its checksum does not match: ",
  "obrázky": "images",
  "Obrázky a dokumenty": "Images and documents",
  "Obrázky v archivu:": "Images in archive:",
  "Obsah archivu překračuje velikostní limit.": "Archive contents exceed the size limit.",
  "Od": "From",
  "Oddací list": "Marriage certificate",
  "Oddálit": "Zoom out",
  "Odebrat": "Remove",
  "Odebrat další rodičovské vazby?": "Remove additional parent links?",
  "Odebrat dokument z rodokmenu?": "Remove document from the family tree?",
  "Odkaz na zdroj": "Source URL",
  "Odkazy poznámek": "Note references",
  "Odloženo": "Postponed",
  "Odložit": "Postpone",
  "Opakovat rozmístění (Ctrl+Y)": "Redo layout (Ctrl+Y)",
  "Oprávnění": "Permission",
  "Osiřelý záznam: ": "Orphaned record: ",
  "osob": "people",
  "osob a": "people and",
  "osob:": "people:",
  "Osoba": "Person",
  "Osoba a její vztahy budou odstraněny.": "The person and their relationships will be deleted.",
  "Osoba bez známých vazeb": "Person with no known connections",
  "Osoba již neexistuje.": "Person no longer exists.",
  "Osoba se od návrhu změnila. Vytvořte nový návrh.": "Person has changed since the proposal. Create a new proposal.",
  "Osoba – přenosné ID původního rodokmenu": "Person – original portable family-tree identifier",
  "Osobu se nepodařilo uložit: ": "Could not save person: ",
  "Osoby": "People",
  "osoby": "persons",
  [
    "Osoby jsou uložené, ale mezi nimi nejsou zobrazené vazby. Zkontrolujte, zda GEDCOM " +
    "obsahuje rodiny FAM, a podívejte se na výzkumné varianty vztahů."
  ]: (
    "People were saved, but no links are displayed. Check whether the GEDCOM has FAM families " +
    "and review the research relationship variants."
  ),
  [
    "Osoby, základní vztahy, události a poznámky. Výzkumná tvrzení, interní ID a přílohy nejsou " +
    "plně přenositelné."
  ]: (
    "People, basic relationships, events, and notes. Research assertions, internal IDs, and " +
    "attachments are not fully portable."
  ),
  "Ostatní nové záznamy:": "Other new records:",
  "Otevřít": "Open",
  "Otevřít archivní pramen": "Open archival source",
  "Otevřít archivovaný originál v Souborech": "Open the archived source file in Files",
  "Otevřít fotografii osoby": "Open person photograph",
  "Otevřít nabídku": "Open menu",
  "Otevřít originál": "Open original",
  "Otevřít osobu": "Open person",
  "Otevřít pramen": "Open source document",
  "Otevřít Rodokmen": "Open Family Tree",
  "Otevřít uložený sken / fotografii": "Open saved scan / photograph",
  "Otevřít v Souborech Nextcloud": "Open in Nextcloud Files",
  "Otevřít výzkumné záznamy": "Open research records",
  "Otevřít všechny výzkumné záznamy osoby v deníku": "Open all research records for this person in the journal",
  "Otevřít zdroj": "Open source",
  "Otevřít úkoly této osoby v deníku": "Open this person's tasks in journal",
  "Otevřít ↗": "Open ↗",
  "Ovládání stromu": "Tree controls",
  "Ovládání zobrazení": "View controls",
  "Ověřeno": "Verified",
  "Označení importu smí obsahovat jen písmena, číslice, _ a -.": "Import label may contain only letters, digits, _ and -.",
  "Označení sady": "Dataset identifier",
  "P – osoby": "P – people",
  "Partner / manžel": "Partner / spouse",
  "Partnerství": "Partnership",
  "Plánováno": "Planned",
  "Podporován je GEDCOM 7 (.ged, .gedcom) nebo GEDZIP (.gdz, .zip s gedcom.ged).": "GEDCOM 7 (.ged, .gedcom) or GEDZIP (.gdz, .zip with gedcom.ged) is supported.",
  "Podporován je jen FamilySearch GEDCOM 7.0.": "Only FamilySearch GEDCOM 7.0 is supported.",
  "Podrobné rozdělení podle typů a stavů": "Breakdown by type and status",
  "Pohlaví": "Gender",
  "Pohřeb": "Burial",
  "Pokračovat": "Continue",
  "Pokusy": "Search attempts",
  "Polohu se nepodařilo uložit: ": "Could not save position: ",
  "Polohy karet se mezitím změnily. Načtěte strom znovu.": "Card positions have changed. Reload the tree.",
  "Popis": "Description",
  "Popis hledání je povinný.": "Search description is required.",
  "Poslední import sady": "Last import of set",
  "Potvrzením se změní údaje osoby. Ověřený důkaz je povinný.": "Approval will modify person data. Linked verified evidence is required.",
  "Pouze otevřený rodokmen": "Only the open family tree",
  "Pouze čtení": "View only",
  "Povolit přesouvání legendy po celé pracovní oblasti": "Allow moving the legend anywhere in the workspace",
  "Povolání": "Occupation",
  "Poznámka": "Note",
  "Poznámka {item} nemá rozpoznatelný řádek Fxxxxx; celý text je zachován.": "Note {item} has no recognizable Fxxxxx line; its entire text is preserved.",
  "Poznámky": "Notes",
  "poznámky": "notes",
  "Poznámky / ostatní výzkumná data": "Notes / other research data",
  "Poznámky a rozpory": "Notes and conflicts",
  "Počet": "Count",
  "Počet záznamů v kategorii": "Records in category",
  "Poškozená databázová data.": "Corrupted database data.",
  "Poškozená databázová část zálohy.": "The database part of the backup is corrupted.",
  "Poškozená metadata důkazu.": "Corrupted evidence metadata.",
  "Poškozené odkazy výzkumného úkolu.": "Corrupted research task references.",
  "Poškozený návrh změny.": "Corrupted change proposal.",
  "Poškozený výzkumný JSON v záloze.": "Corrupted research JSON in backup.",
  "Požadované soubory aplikace nebo Shared App Core se nepodařilo načíst.": "Required application or Shared App Core files could not be loaded.",
  "Pramen či matrika, signatura, archivační informace": "Source or register with archive signature and metadata",
  "Prameny": "Sources",
  "prameny": "sources",
  "Prameny a jistota": "Sources and evidence",
  "Pravým tlačítkem označte skupinu; Shift + tažením ji přesunete": "Right-click to select a group; Shift-drag to move it",
  "Pravým tlačítkem upravíte výběr; Shift + tažení přesune skupinu a uvolní místo.": "Right-click to adjust the selection; Shift-drag moves the group and opens space.",
  "Priorita": "Priority",
  "Pro GEDCOM nejprve otevřete prázdný rodokmen s oprávněním upravovat.": "For GEDCOM, first open an empty family tree where you can edit.",
  "Pro potvrzení napište SMAZAT": "Type SMAZAT to confirm",
  "Probíhá": "In progress",
  "Prostý součet řádků 13 tabulek. Podskupiny se nepřičítají znovu. Součet není počet osob.": "Simple sum of rows across 13 tables. Subgroups are not counted again. The total is not the number of people.",
  "První rodič": "First parent",
  "Práva": "Rights",
  "Prázdný název úkolu.": "Empty task title.",
  "Prázdný popis hledání.": "Empty search description.",
  "Prázdný začátek GEDCOM.": "Empty GEDCOM header.",
  "Přenos a záloha rodokmenů": "Family tree import, export and backup",
  "Přepis zápisu": "Record transcription",
  "Přepsáno": "Transcribed",
  "Přesunout legendu": "Move legend",
  [
    "Přesunutou legendu lze umístit i na volné místo v postranním panelu nebo na liště. Poloha " +
    "se ukládá v tomto prohlížeči."
  ]: (
    "The legend can also be placed in unused sidebar or toolbar space. Its position is saved in " +
    "this browser."
  ),
  "Přetažením změnit polohu": "Drag to reposition",
  "Přiblížit": "Zoom in",
  "Přidat": "Add",
  "Přidat dítě": "Add child",
  "Přidat důkaz": "Add evidence",
  "Přidat nález nebo důkaz": "Add finding or evidence",
  "Přidat osobu": "Add person",
  "Přidat událost": "Add event",
  "Přidat vybraného uživatele nebo skupinu": "Add selected user or group",
  "Přidat vztah": "Add relationship",
  "Přidat úkol": "Add task",
  "Přidáno záznamů:": "Records added:",
  "Přiložené obrázky:": "Attached images:",
  "přiložených souborů:": "attached files:",
  "Připojit dokument": "Attach document",
  "Připojit k osobám": "Link to people",
  "Připojit k událostem": "Link to events",
  "Připojit ke vztahům a svazkům": "Link to relationships and unions",
  "Připojte dokument alespoň k jedné osobě, události nebo svazku.": "Link the document to at least one person, event, or union.",
  "Připravuji export…": "Preparing export…",
  "Příjmení": "Last name",
  "Příliš dlouhé datum nebo místo události.": "Event date or place is too long.",
  "Příliš dlouhé datum vztahu.": "Relationship date is too long.",
  "Příliš dlouhé pole osoby: ": "Person field is too long: ",
  "Příliš hluboká složka výzkumných příloh.": "Research attachment folder nesting is too deep.",
  "Příliš mnoho položek v archivu.": "Too many items in the archive.",
  "Příliš mnoho příloh; záloha se nevytvořila.": "Too many attachments; backup was not created.",
  "Příliš mnoho souborů v záloze.": "Too many files in backup.",
  "Příloha překračuje deklarovanou velikost.": "Attachment exceeds its declared size.",
  "Přílohu nelze ověřit.": "Cannot verify the attachment.",
  "Přímý odkaz": "Direct link",
  "Přístup byl odepřen.": "Access denied.",
  "Původní archiv – pouze ke čtení": "Legacy archive – read-only",
  "Původní GEDCOM/GEDZIP nelze archivovat do Souborů. Import se nespustil.": "Original GEDCOM/GEDZIP cannot be archived in Files. Import was not started.",
  "Původní osoba již neexistuje.": "Original person no longer exists.",
  [
    "Původní P, F, Q, S a další identifikátory jsou převzaté přímo z uloženého výzkumu. Nic se " +
    "nepřepisuje a nevytvářejí se duplicity."
  ]: (
    "Original P, F, Q, S and other IDs are read directly from saved research. Nothing is " +
    "overwritten or duplicated."
  ),
  [
    "Původní Q a aktuální deník se zobrazují společně. Původní text zůstává nezměněný; shodné " +
    "úkoly jsou pouze propojené."
  ]: (
    "Historical Q and current journal tasks are shown together. Original texts remain " +
    "unchanged; matching tasks are linked for display only."
  ),
  "Původní soubor v Nextcloudu zůstane zachován.": "The original Nextcloud file will be kept.",
  "Původní text": "Original text",
  "Původní tvrzení": "Original claim",
  "původních záznamů": "source records",
  "Q – výzkumné úkoly": "Q – research tasks",
  "Q0002, sňatek, matrika…": "Q0002, marriage, register…",
  "R – vztahy": "R – relationships",
  "Report importu": "Import report",
  "restore": "Restored",
  "revert": "Reverted",
  "Režim pro otevřený rodokmen": "Mode for the open family tree",
  "Rodinná data zůstanou ve vašem Nextcloudu.": "Your family data stays in your Nextcloud.",
  "Rodinné vazby": "Family relationships",
  "Rodiny": "Families",
  "rodiny": "families",
  "Rodič": "Parent",
  "Rodič / dítě": "Parent / child",
  "Rodič a dítě": "Parent and child",
  "Rodič nemůže být potomkem této osoby.": "A parent cannot be this person’s descendant.",
  "Rodič:": "Parent:",
  "Rodiče": "Parents",
  "Rodiče nejsou ve stromu uvedeni": "No parents are entered in this tree",
  "Rodiče se nepodařilo uložit: ": "Could not save parents: ",
  "Rodičovská vazba": "Parent link",
  "Rodičovská vazba neověřená": "Parent link is unverified",
  "Rodičovská vazba sporná": "Parent link is disputed",
  "Rodičovská větev": "Parent-child branch",
  "Rodičovské vazby mají zdroj, ale nejsou všechny ověřené": "Parent links have sources, but are not all verified",
  "Rodičovský vztah": "Parent-child relationship",
  "Rodné příjmení": "Birth surname",
  "Rodné příjmení: ": "Birth surname: ",
  "Rodný list": "Birth certificate",
  "Rodokmen": "Family Tree",
  "Rodokmen byl vytvořen, ale import nebyl potvrzen: ": "The family tree was created, but the import could not be confirmed: ",
  "Rodokmen nelze načíst.": "Family Tree could not be loaded.",
  "Rodokmen nemá stabilní ID.": "Family tree has no stable ID.",
  "Rodokmen používá soukromá data uložená v databázi Nextcloudu.": "Family Tree stores private data in the Nextcloud database.",
  "Rodokmen se nepodařilo vytvořit: ": "Could not create family tree: ",
  "Rodokmen zatím není sdílen.": "This family tree is not shared yet.",
  "Rodokmen zůstane beze změny.": "The family tree will remain unchanged.",
  "Rodokmen: %s": "Family tree: %s",
  "Rodokmeny": "Trees",
  "rodokmenů": "family trees",
  "Rozbalený archiv je příliš velký.": "Unpacked archive is too large.",
  "Rozbalený obsah je příliš velký.": "Uncompressed content is too large.",
  "Rozdíly podle typu záznamu": "Differences by record type",
  "Rozmístění se nepodařilo obnovit: ": "Could not restore card positions: ",
  "Rozsah zálohy": "Backup scope",
  "Rozsah úplné zálohy": "Full backup scope",
  "Rozvod": "Divorce",
  "Ruční posuny všech karet budou odstraněny.": "Manual card positions will be removed.",
  "Ruční posuny všech karet budou odstraněny. Rozmístění můžete vrátit přes Ctrl+Z.": "Manual card positions will be removed. Press Ctrl+Z to undo.",
  "Ručně upravené zobrazení {item} zůstalo zachováno; výzkumný záznam je aktualizován.": "Manually adjusted {item} was preserved; its research record was updated.",
  "S – prameny a knihy": "S – archival books and sources",
  "Samostatná větev": "Separate branch",
  "Samostatné tvrzení o údaji osoby, vztahu nebo události; různé varianty zůstávají vedle sebe": "Individual claim about a person, relationship or event; variants remain separate",
  "Schváleno": "Approved",
  "Schválení vyžaduje navázaný ověřený důkaz.": "Approval requires linked verified evidence.",
  "Schválit (vyžaduje ověřený důkaz)": "Approve (verified evidence required)",
  "Sdílení": "Shares",
  [
    "Sdílení je v archivu uložené vždy. Bez zaškrtnutí se při obnově neaktivuje. Z důvodu " +
    "ochrany dat nejsou do zálohy stahovány soubory z externích URL."
  ]: (
    "Share records are always included in the archive. They are not reactivated unless you opt " +
    "in. External URLs are not fetched into the backup."
  ),
  "Sdílení rodokmenu": "Family tree sharing",
  "sdílení:": "shares:",
  "Sdílený uživatel nebo skupina již neexistuje: ": "Shared user or group no longer exists: ",
  "Server nemá rozšíření PHP ZIP.": "PHP ZIP extension is missing on the server.",
  "Server nevrátil archiv ZIP.": "The server did not return a ZIP archive.",
  "Server nevrátil platný archiv FamilyTree.": "The server did not return a valid FamilyTree archive.",
  "Server nevrátil platný GEDCOM.": "The server did not return a valid GEDCOM file.",
  "Shared App Core je zastaralé": "Shared App Core is outdated",
  "Signatura": "Archive reference",
  "Skutečná velikost": "Actual size",
  "Smazat": "Delete",
  "Smazat celý rodokmen?": "Delete entire family tree?",
  "Smazat osobu?": "Delete person?",
  "Smazat rodokmen": "Delete family tree",
  "Smazat všechny moje rodokmeny": "Delete all my family trees",
  "Smazat všechny moje rodokmeny?": "Delete all my family trees?",
  "Smazání": "Deletion",
  "Snímek": "Image",
  "Soubor": "File",
  "Soubor chybí nebo je příliš velký: ": "File is missing or too large: ",
  "Soubor GEDCOM byl připraven ke stažení.": "The GEDCOM file is ready for download.",
  "Soubor musí obsahovat nejvýše 1 MiB dat.": "File must be at most 1 MiB.",
  "Soubor nebyl zkontrolován nebo se od náhledu změnil.": "File was not validated or has changed since preview.",
  "Soubor nelze přečíst pro úplnou zálohu: ": "Cannot read file for complete backup: ",
  "Soubor nelze přečíst.": "File cannot be read.",
  "Soubor nelze přidat do ZIPu.": "Cannot add file to ZIP.",
  "Soubor neobsahuje platný JSON objekt.": "File is not a valid JSON object.",
  "Soubor překračuje limit 48 MiB: ": "File exceeds the 48 MiB limit: ",
  "Soubor se od náhledu změnil. Spusťte kontrolu znovu.": "File changed since preview. Run validation again.",
  "Soubor stejného jména už existuje s jiným obsahem.": "A file with the same name already exists with different contents.",
  "Soubor v archivu nelze přečíst.": "File in archive cannot be read.",
  "Soubor v Nextcloudu": "File in Nextcloud",
  "Soubor výzkumného deníku (JSON)": "Research journal file (JSON)",
  "soubor zatím chybí": "file not yet available",
  "Soubor zálohy": "Backup file",
  "Soubor zálohy byl během obnovy poškozen.": "The backup file was damaged during restore.",
  "Sourozenci": "Siblings",
  "Součet příloh překračuje limit úplné zálohy.": "Total attachments exceed the complete backup limit.",
  "Společná událost {item} má další zobrazení u druhé osoby; ověřte je ve výzkumných údajích.": "Shared event {item} also appears for another person; review it in the research records.",
  "Společná větev dětí a rodičů": "Shared child-parent branch",
  "Společní rodiče": "Shared parents",
  "Spouštím aplikaci…": "Starting app…",
  "Srovnat": "Arrange",
  "standardní tvrzení": "standard claims",
  "standardních tvrzení": "of standard claims",
  "Statistiky": "Statistics",
  "Statistiky rodokmenu": "Tree statistics",
  "Statistiky všech mých rodokmenů": "Statistics for all my trees",
  "Stav": "Status",
  "Stav / ověření": "Status / verification",
  "Stav ověření": "Verification status",
  "Stav: import dokončen": "Status: import complete",
  "Strom nyní obsahuje:": "The tree now contains:",
  "Strom se nepodařilo uspořádat: ": "Could not arrange the tree: ",
  "Stromů:": "Trees:",
  "Stáhne osoby a vztahy ve formátu GEDCOM UTF-8.": "Download people and relationships as GEDCOM UTF-8.",
  "Stáhnout .ged": "Download .ged",
  "Stáhnout Shared App Core": "Download Shared App Core",
  "Stáhnout soubor": "Download file",
  [
    "Stáhněte aktuálně zobrazený rodokmen jako GEDCOM 7 (.ged, UTF-8). Export zahrnuje osoby, " +
    "rodičovské a partnerské vazby, základní události a textové poznámky."
  ]: (
    "Download the currently displayed family tree as GEDCOM 7 (.ged, UTF-8). The export " +
    "includes people, parent and partner links, basic events, and text notes."
  ),
  "Svatba": "Marriage",
  "Svazek": "Union",
  "Symbolické odkazy v archivu nejsou povolené.": "Symbolic links in archives are not allowed.",
  "Symbolické odkazy v záloze nejsou povolené.": "Symbolic links are not allowed in backups.",
  "Sčítání lidu": "Census",
  "Tato osoba je rodičem vybrané osoby": "This person is the selected person’s parent",
  [
    "Tato osoba má více než dva rodičovské záznamy. Další vazby zůstanou ve výzkumné historii, " +
    "ale ruční uložení rodičů je odebere ze stromu."
  ]: (
    "This person has more than two parent records. Additional links stay in research history, " +
    "but saving parents removes them from the graph."
  ),
  "Tento vztah už existuje.": "This relationship already exists.",
  "Tento ZIP obsahuje GEDCOM (GEDZIP), nikoli úplnou zálohu FamilyTree. Zvolte Import GEDCOM 7 / GEDZIP.": "This ZIP contains GEDCOM (GEDZIP), not a complete FamilyTree backup. Choose Import GEDCOM 7 / GEDZIP.",
  "Test notification": "Test notification",
  "Toto je GEDCOM/GEDZIP, nikoli úplná záloha FamilyTree. Vraťte se a vyberte import GEDCOM 7 / GEDZIP.": "This is GEDCOM/GEDZIP, not a complete FamilyTree backup. Go back and choose GEDCOM 7 / GEDZIP import.",
  "Tvrzení": "Assertions",
  "tvrzení": "assertions",
  "Typ": "Type",
  "Typ akce": "Action type",
  "Typ záznamu": "Record type",
  "Táhněte jednu z označených karet pro společný posun.": "Drag one selected card to move the group.",
  "uchováno v původním archivu": "preserved in the original archive",
  "Událost": "Event",
  "Událost odkazuje na neznámou osobu.": "Event references an unknown person.",
  "Události": "Events",
  "události": "events",
  "Události a jejich původ": "Events and provenance",
  "Ukládá se odkaz na existující soubor. Smazání dokumentu z rodokmenu původní soubor nesmaže.": "A link to the existing file is saved. Removing this document does not delete the original file.",
  "Ukládám rodokmen…": "Saving family tree…",
  "Ukládám zkontrolované výzkumné záznamy…": "Importing reviewed research entries…",
  "Ukládám…": "Saving…",
  "Uložení nahradí dosavadní rodičovské vazby této osoby. Jiných vztahů se nedotkne.": "Saving replaces this person’s existing parent links; other relationships stay unchanged.",
  "uložených popisů pramenů": "saved source descriptions",
  "Uložit": "Save",
  "Uložit dokument": "Save document",
  "Uložit návrh (bez změny rodokmenu)": "Save proposal (do not change the tree)",
  "Uložit rodiče": "Save parents",
  "update": "Updated",
  "Upozornění": "Warnings",
  "Upravit": "Edit",
  "Upravit dokument": "Edit document",
  "Upravit jméno a údaje": "Edit name and details",
  "Upravit osobu": "Edit person",
  "Upravit rodokmen": "Edit family tree",
  "Upravit stav / další krok": "Edit status / next step",
  "Upravit výzkumný úkol": "Edit research task",
  "URL fotografie": "Photo URL",
  "Uspořádat": "Organize",
  "Uspořádat strom": "Arrange tree",
  "Uspořádat strom?": "Arrange the tree?",
  "V archivu zachováno z předchozí verze:": "Retained from the previous version in the archive:",
  "V GEDZIP chybí gedcom.ged v kořeni.": "GEDZIP is missing root-level gedcom.ged.",
  "Vadná položka archivu.": "Invalid archive entry.",
  "Vazba na důkaz": "Linked evidence",
  "Vazby dokumentů": "Document links",
  "Vazby poznámek": "Note links",
  "vazby poznámek": "note links",
  "Ve stromu se zobrazí dvě nejlépe doložené, další varianty zůstanou ve výzkumných záznamech.": "The two best-supported links appear in the tree; other alternatives remain in research records.",
  "Ve stromu se zobrazí dvě nejlépe doložené, ostatní zůstanou ve výzkumných záznamech.": "The two best supported links appear in the tree; other variants remain in the research records.",
  "Volba ovlivní značky u osob ve stromu v tomto prohlížeči.": "This setting controls verification markers on people in the tree in this browser.",
  "Vrácení vytvoří nový auditní záznam a nesmaže původní historii.": "Reverting creates a new audit entry without deleting the original history.",
  "Vrácení změny": "Reverted change",
  "Vrátit": "Revert",
  "Vrátit lze pouze aktualizaci údajů osoby.": "Only updates to person details can be reverted.",
  "Vrátit rozmístění (Ctrl+Z)": "Undo layout (Ctrl+Z)",
  "Vrátit tuto změnu": "Revert this change",
  "Vrátit změnu osoby?": "Revert person change?",
  "Vyberte .ged, .gdz nebo .zip s gedcom.ged.": "Select a .ged, .gdz, or .zip archive containing gedcom.ged.",
  "Vyberte archiv ZIP.": "Select a ZIP archive.",
  "Vyberte dokument": "Select document",
  [
    "Vyberte formát exportu. Vlastní archiv je určený pro úplnou zálohu a pozdější obnovu v " +
    "FamilyTree. GEDCOM 7 slouží pro přenos do jiných genealogických aplikací."
  ]: (
    "Choose an export format. The native archive is for complete backup and restore in " +
    "FamilyTree; GEDCOM 7 is for exchange with other genealogy software."
  ),
  [
    "Vyberte formát exportu. Úplná záloha FamilyTree slouží pro pozdější obnovu všech vlastních " +
    "dat; GEDCOM 7 pro výměnu mezi genealogickými programy."
  ]: (
    "Choose an export format. A full FamilyTree backup allows you to restore all your own data " +
    "later; GEDCOM 7 exchanges data with other genealogy programs."
  ),
  [
    "Vyberte GEDCOM 7 (.ged, .gedcom) nebo GEDZIP (.gdz či .zip s gedcom.ged). Před importem " +
    "zobrazíme počty osob, vztahů a médií. Existující rodokmeny se samy nepřepisují."
  ]: (
    "Select GEDCOM 7 (.ged, .gedcom) or GEDZIP (.gdz or .zip containing gedcom.ged). A preview " +
    "shows people, relationships and media counts. Existing trees are not overwritten " +
    "automatically."
  ),
  "Vyberte GEDCOM soubor.": "Select a GEDCOM file.",
  "Vyberte jednoho nebo dva různé rodiče.": "Choose one or two different parents.",
  "Vyberte JSON nebo ZIP.": "Select a JSON or ZIP file.",
  "Vyberte partnera dané osoby.": "Choose this person’s partner.",
  [
    "Vyberte původní ZIP vytvořený aplikací FamilyTree. Všechny stromy, osoby a soubory se " +
    "obnoví pod novými ID. Existující data zůstanou beze změny."
  ]: (
    "Select the original FamilyTree ZIP. All trees, people and files are restored under new " +
    "IDs. Existing data remains unchanged."
  ),
  "Vyberte rodiče": "Choose a parent",
  "Vyberte rodokmen": "Select a family tree",
  "Vyberte soubor JSON.": "Select a JSON file.",
  [
    "Vyberte typ importu. Úplná záloha FamilyTree obnoví všechny uložené rodokmeny ze ZIPu jako " +
    "nové, bez přepsání současných údajů."
  ]: (
    "Choose an import type. A full FamilyTree backup restores all trees as new trees without " +
    "overwriting existing records."
  ),
  "Vyberte, co obsahuje importovaný soubor. Pouhá přípona ZIP neurčuje jeho formát.": "Select the type of imported file. A ZIP extension alone does not identify the format.",
  "vybraných osob": "selected people",
  "Vybrat osobu": "Select person",
  "Vybrat skupinu": "Select group",
  "Vybrat ze Souborů": "Choose from Files",
  "Vyplňte název nového rodokmenu.": "Enter a name for the new family tree.",
  "Vysoká": "High",
  "Vytvoření": "Creation",
  "Vytvořit": "Create",
  "Vytvořit nový rodokmen": "Create a new family tree",
  "Vyřídit návrh změny?": "Review proposed change?",
  "vzdálené odkazy:": "remote links:",
  "Vzdělání": "Education",
  "Vztah / událost; zachované původní ID importní sady": "Relationship / event; original dataset identifier preserved",
  "Vztah odkazuje na neznámou osobu.": "Relationship references an unknown person.",
  "Vztah se nepodařilo přidat: ": "Could not add relationship: ",
  "Vztahy": "Relationships",
  "vztahy": "relationships",
  "Vztahy a varianty": "Relationships and variants",
  "Více než dvě rodičovské vazby:": "More than two parent links:",
  "Výběr souboru není dostupný; vložte cestu ručně.": "File picker is unavailable; enter the path manually.",
  "Výchozí generace": "Root generation",
  "Výchozí osoba": "Root person",
  "Výchozí stav: vypnuto. Počty se zobrazí v nástrojové liště místo plochy rodokmenu.": "Off by default. Counts appear in the toolbar instead of on the family tree canvas.",
  "Výsledek": "Outcome",
  "Výsledek hledání": "Search outcome",
  "Výsledek importu": "Import result",
  "výzkum": "research",
  "Výzkumná tvrzení": "Research assertions",
  "Výzkumná varianta bez spojnice": "Research variant without a graph link",
  "Výzkumné médium chybí v záloze.": "Research media is missing from backup.",
  "Výzkumné záznamy": "Research records",
  "Výzkumné záznamy zůstanou zachované, ale další vazby ze stromu zmizí.": "Research records remain, but additional links disappear from the graph.",
  "Výzkumné údaje": "Research evidence",
  "Výzkumné úkoly": "Research tasks",
  "Výzkumné úkoly Q": "Research tasks Q",
  "výzkumný archiv": "research archive",
  "Výzkumný deník": "Research journal",
  "Výzkumný deník přesahuje 1 MiB.": "Research journal exceeds 1 MiB.",
  "Výzkumný import JSON / ZIP": "Research import JSON / ZIP",
  [
    "Výzkumný přenos, ne úplná záloha: nezahrnuje genealogická fakta, návrhy změn, audit ani " +
    "média. Dříve ručně ověřené nálezy je při importu do jiného stromu nutné znovu prověřit."
  ]: (
    "Research transfer, not a full backup: genealogical facts, change proposals, history and " +
    "media are not included. Previously verified findings must be reviewed again when imported " +
    "into another tree."
  ),
  "Výzkumný záznam má neplatnou projekci.": "Research record has invalid projection.",
  "Výzkumný záznam odkazuje na cizí úkol.": "Research record references a task in another tree.",
  "Výzkumný úkol, jeho stav, pokusy a další kroky": "Research task, status, attempts and next steps",
  "výzkumných variant vztahů": "research relationship variants",
  "Význam identifikátorů a jejich historie": "Meaning of identifiers and their history",
  [
    "Význam určuje typ záznamu v původní importní sadě, nikoliv pouze první písmeno. ID jsou " +
    "přiřazena k původu, například origin_key. SQL ID není přenosné genealogické ID."
  ]: (
    "Record type from the original import determines meaning, not just the first letter. IDs " +
    "are scoped to their origin_key. SQL IDs are not portable genealogy IDs."
  ),
  "větví": "branches",
  "všech záznamů:": "total records:",
  [
    "Všechny interní záznamy vlastních rodokmenů, výzkumné varianty, sdílení, lokální soubory a " +
    "jejich kontrolní součty."
  ]: (
    "All internal records of your family trees, research variants, sharing records, local files " +
    "and their checksums."
  ),
  "Všechny moje rodokmeny": "All my family trees",
  "Všechny moje rodokmeny (úplná databáze)": "All my family trees (complete database)",
  "Všechny osoby": "All persons",
  "Všechny stavy": "All statuses",
  "Všechny typy": "All types",
  "Všechny zobrazené rodičovské vazby jsou ověřené": "All displayed parent links are verified",
  "Zadejte jméno nebo příjmení.": "Enter a first or last name.",
  "Založte první rodokmen": "Create your first family tree",
  "Zamítnout": "Reject",
  "Zamítnuto": "Rejected",
  "Zaměstnání": "Employment",
  "Zapnuto: táhněte kartu jedním prstem. Prázdným plátnem posouváte strom.": "When enabled, drag a card with one finger. Drag empty canvas to pan the tree.",
  "Zapsat do deníku": "Save search log",
  "Zatím bez dokumentů.": "No documents yet.",
  "Zatím bez vztahů.": "No relationships yet.",
  "Zatím lze navrhovat změny údajů osoby.": "Only person-detail changes can be proposed at present.",
  "Zatím nejsou k dispozici podrobné údaje.": "No detailed statistics are available yet.",
  "Zatím zde nejsou žádné záznamy.": "No records yet.",
  "Zatím zde nejsou žádné úkoly.": "There are no tasks yet.",
  "Zavřít": "Close",
  "Zavřít nabídku": "Close menu",
  "Zaznamenat hledání": "Record search",
  [
    "Zde jsou původní skeny a fotografie uložené z importovaných archivů. Náhledy se načítají z " +
    "chráněného úložiště Nextcloudu. Externí odkazy nejsou stahovány automaticky."
  ]: (
    "Original scans and photos from imported archives. Thumbnails use protected Nextcloud " +
    "storage. Remote links are never fetched automatically."
  ),
  "Zdroj / odkaz": "Source / link",
  "Zdrojová sada": "Source collection",
  "Zdůvodnění": "Rationale",
  "ZIP nelze dokončit.": "Cannot finish ZIP.",
  "ZIP nelze přečíst.": "Cannot read ZIP.",
  "ZIP obsahuje nepopsané soubory.": "ZIP contains unlisted files.",
  "Zkontrolovat soubor": "Preview file",
  "Zkontrolovat zálohu": "Verify backup",
  "Zkusit znovu": "Try again",
  "Změna členů vztahu ": "Changing relationship members ",
  "Změněné záznamy přeskočené kvůli shodnému ID:": "Changed records skipped because of an existing ID:",
  "Změněné záznamy se stejným ID zůstaly v původní podobě; nový soubor je archivován.": "Changed records with an existing ID were kept as before; the new source file was archived.",
  "Změněné:": "Changed:",
  "Změněný záznam ": "Modified record ",
  "změněných záznamů se stejným ID se nepřepíše.": "changed records with existing IDs will not be overwritten.",
  [
    "Značka u jména hodnotí vazbu k rodičům: ★ ověřená, ◇ se zdrojem, ? neověřená, ! sporná, · " +
    "bez zadaných rodičů."
  ]: (
    "The badge by a name describes parent links: ★ verified, ◇ sourced, ? unverified, ! " +
    "disputed, · no parents entered."
  ),
  "Znovu aktivovat sdílení s existujícími uživateli a skupinami (volitelné)": "Reactivate shares to existing users and groups (optional)",
  "Zobrazeno": "Shown",
  "Zobrazeno ve stromu": "Shown in tree",
  "Zobrazení": "Appearance",
  "Zobrazení stromu": "Tree appearance",
  "zobrazených vztahů": "displayed relationships",
  "zobrazených vztahů.": "displayed relationships.",
  "zobrazených úkolů": "visible tasks",
  "Zobrazit celý strom": "Show entire tree",
  "Zobrazit přehled osob, vztahů a větví v horní liště": "Show people, relationships and branches summary in the top bar",
  "Zobrazit značky ověření u jmen": "Show parent-link verification badges by names",
  "Zpochybněná rodičovská vazba": "Challenged parent link",
  "zpochybněná vazba": "challenged link",
  "Zrušit": "Cancel",
  "Zrušit výběr": "Clear selection",
  "Záloha byla připravena ke stažení.": "Backup is ready to download.",
  "Záloha neobsahuje žádný rodokmen.": "Backup contains no family trees.",
  "Záloha obsahuje příliš mnoho záznamů.": "Backup contains too many records.",
  "Záloha ověřena.": "Backup verified.",
  "Záloha se od náhledu změnila. Zkontrolujte ji znovu.": "Backup has changed since preview. Verify it again.",
  [
    "Záloha se vytvoří beze změny databáze. Současný jednosouborový formát podporuje nejvýše 48 " +
    "MiB na přílohu, 256 MiB příloh celkem a 3 000 příloh. Externí webové odkazy zůstávají " +
    "odkazy."
  ]: (
    "The backup is created without modifying the database. The current single-file format " +
    "supports up to 48 MiB per attachment, 256 MiB of attachments in total and 3,000 " +
    "attachments. External website links are stored as references."
  ),
  "Záznam neobsahuje vratitelné údaje.": "Record has no reversible values.",
  "Záznam v2 nemá platné stabilní ID: ": "Record v2 has no valid stable ID: ",
  "Záznam {item} je uchován v původním souboru.": "Record {item} is retained in the original file.",
  "Záznamy hledání": "Search log records",
  "Záznamy nepřítomné v novém souboru zůstaly zachovány. Jejich odstranění vyžaduje ruční kontrolu.": "Records absent from the new file were preserved. Removing them requires manual review.",
  "Záznamy:": "Records:",
  "{name} vyžaduje Core {required} nebo novější. Nainstalováno je {installed}.": "{name} requires Core {required} or newer. Installed: {installed}.",
  "Údaj": "Field",
  "Údaje jsou přečtené, ale úkol nebyl dokončen.": "Records were read, but the task was not completed.",
  "Úkol": "Task",
  "Úkol není v tomto stromu.": "Task is not in this family tree.",
  "Úkol nepatří do rodokmenu.": "Task does not belong to this family tree.",
  "Úkoly": "Tasks",
  "úkoly": "tasks",
  "úkolů": "of tasks",
  "Úmrtní list": "Death certificate",
  "Úmrtí": "Death",
  "Úplnou zálohu konkrétního rodokmenu může vytvořit pouze vlastník.": "Only the owner can create a complete backup of a particular family tree.",
  "Úplná záloha FamilyTree (.zip)": "Complete FamilyTree backup (.zip)",
  "Úplná záloha FamilyTree (ZIP)": "Full FamilyTree backup (ZIP)",
  "Úprava": "Update",
  "Čeká na ověření": "Awaiting verification",
  "Čeká na schválení": "Pending review",
  "Čtení přílohy selhalo.": "Failed to read the attachment.",
  "Číslo snímku": "Image number",
  "Žena": "Woman",
  "Žijící osoba": "Living person",
  "Žádné odpovídající záznamy.": "No matching records.",
  "⬆ Import": "⬆ Import",
  "⬆ Import / obnova": "⬆ Import / Restore",
  "⬇ Export": "⬇ Export"
}/* LEGACY_KEYS_END */;
const oCzechCatalog=/* CS_CATALOG_START */{
  " cannot be started": " nelze spustit",
  " Check the new tree before retrying; the app does not delete it automatically.": " Zkontrolujte vytvořený rodokmen před opakováním; aplikace nic automaticky nemaže.",
  "Update this dataset by UID": "Aktualizovat tuto sadu podle UID",
  "Updated:": "Aktualizováno:",
  "Current journal": "Aktuální deník",
  "Current database record counts": "Aktuální počty databázových záznamů",
  "Currently open family tree:": "Aktuálně otevřený rodokmen:",
  "Currently open tree: people, relationships, events and notes. This is not a complete backup.": "Aktuálně otevřený strom: osoby, vztahy, události a poznámky. Není to úplná záloha.",
  "The app cannot continue because Shared App Core is missing, disabled, or incompatible.": "Aplikace nemůže pokračovat, protože Shared App Core není nainstalované, povolené nebo neodpovídá.",
  "the app": "Aplikaci",
  "Archive": "Archiv",
  "Cannot reopen the archive.": "Archiv nelze znovu otevřít.",
  "Archive contains a duplicate path.": "Archiv obsahuje duplicitní cestu.",
  "Archive contains an unsafe path.": "Archiv obsahuje nebezpečnou cestu.",
  "Archive contains too many files.": "Archiv obsahuje příliš mnoho souborů.",
  "Archive P/F/Q": "Archiv P/F/Q",
  "Archive exceeds the size limit.": "Archiv překračuje velikostní limit.",
  "Cannot open ZIP archive.": "Archiv ZIP nelze otevřít.",
  "Archive finding": "Archivní nález",
  "Archived person records": "Archivní údaje osoby",
  "Arrange cards automatically": "Automaticky srovnat karty",
  "Arrange cards automatically?": "Automaticky srovnat karty?",
  "Research claims": "Badatelská tvrzení",
  "research claims": "badatelská tvrzení",
  "Research claims F": "Badatelská tvrzení F",
  "of research claims": "badatelských tvrzení",
  "The package must be smaller than 64 MB.": "Balíček musí být menší než 64 MB.",
  "Package does not contain the referenced file: ": "Balíček neobsahuje odkazovaný soubor: ",
  "No second parent": "Bez druhého rodiče",
  "No evidence – draft only": "Bez důkazu – pouze koncept",
  "No notes": "Bez poznámek",
  "No assigned task": "Bez přiřazeného úkolu",
  "Unspecified status": "Bez uvedeného stavu",
  "Unspecified type": "Bez uvedeného typu",
  "Unchanged:": "Beze změny:",
  "All people, relationships, events, and document links will be removed.": "Budou odstraněny všechny osoby, vztahy, události a odkazy na dokumenty.",
  "Residence": "Bydliště",
  [
    "An ordinary ZIP can be imported as GEDZIP if it contains GEDCOM 7 in a root-level " +
    "gedcom.ged file. Arbitrary ZIP archives are not supported."
  ]: (
    "Běžný ZIP lze otevřít jako GEDZIP, pokud obsahuje GEDCOM 7 v souboru gedcom.ged. Libovolné " +
    "archivy ZIP podporované nejsou."
  ),
  "C – citations": "C – citace",
  "Total records (simple sum)": "Celkem položek (prostý součet)",
  "Entire tree": "Celý strom",
  "Import path is not a directory.": "Cesta k importu není složka.",
  "Local media file is missing: ": "Chybí místní soubor média: ",
  "Missing or invalid table: ": "Chybí nebo je neplatná tabulka ",
  "Missing or invalid source_id in ": "Chybí nebo je neplatné source_id v ",
  "Missing reciprocal FAMC link for ": "Chybí obousměrný odkaz FAMC u ",
  "Missing reciprocal FAMS link for ": "Chybí obousměrný odkaz FAMS u ",
  "Valid journal JSON is missing.": "Chybí platný JSON deníku.",
  "Attachment file is missing.": "Chybí soubor přílohy.",
  "Stable identifier is missing. Run the one-time migration first: ": "Chybí stabilní identifikátor. Nejprve spusťte jednorázovou migraci: ",
  "Missing images": "Chybějící obrázky",
  "Missing images:": "Chybějící obrázky:",
  "missing files:": "chybějící soubory:",
  "missing:": "chybějící:",
  "Citations": "Citace",
  "citations": "citace",
  "Citation / media: scan, document, photograph": "Citace / médium: sken, dokument, fotografie",
  "What and where I searched": "Co a kde jsem hledal(a)",
  "Created": "create",
  "Import destination": "Cíl importu",
  "Target person does not exist.": "Cílová osoba neexistuje.",
  "Destination directory conflicts with an existing file.": "Cílový adresář koliduje se souborem.",
  "More actions": "Další akce",
  "Other facts": "Další fakta",
  "Next step": "Další krok",
  "Next verifiable step": "Další ověřitelný krok",
  "The database part of the backup is too large.": "Databázová část zálohy je příliš velká.",
  [
    "Database records, connections, research variants, sharing, and files accessible in " +
    "Nextcloud Files. External URLs remain links."
  ]: (
    "Databázové záznamy, vazby, výzkumné varianty, sdílení a soubory dostupné ve Files. Externí " +
    "URL jsou uložené jako odkazy."
  ),
  "Date": "Datum",
  "Document date": "Datum dokumentu",
  "Date of birth": "Datum narození",
  "Date of death": "Datum úmrtí",
  "Deleted": "delete",
  "The journal is ready for download.": "Deník byl připraven ke stažení.",
  "Search log": "Deník hledání",
  "Journal exceeds 1 MiB for JSON transfer; use a complete ZIP backup v2.": "Deník je pro JSON přenos větší než 1 MiB; použijte úplnou ZIP zálohu v2.",
  "To": "Do",
  "Document": "Dokument",
  "The document file is missing from the backup: ": "Dokument nemá v záloze svůj soubor: ",
  "Document references an unknown person.": "Dokument odkazuje na neznámou osobu.",
  "Documents": "Dokumenty",
  "documents": "dokumentů",
  "Home": "Domů",
  "Letter": "Dopis",
  "Second parent": "Druhý rodič",
  "Second parent / partner": "Druhý rodič / partner",
  "Duplicate GEDCOM identifier ": "Duplicitní GEDCOM identifikátor ",
  "Duplicate or unsafe ZIP entry.": "Duplicitní nebo nebezpečná položka ZIPu.",
  "Duplicate source_id in file: ": "Duplicitní source_id v souboru: ",
  "Duplicate stable ID across tables.": "Duplicitní stabilní ID napříč tabulkami.",
  "Duplicate research task.": "Duplicitní výzkumný úkol.",
  "Double-click to open the research journal": "Dvojklikem otevřít výzkumný deník",
  "Child": "Dítě",
  "You can edit the child later like any other person.": "Dítě lze později upravit stejně jako ostatní osoby.",
  "Could not add child: ": "Dítě se nepodařilo přidat: ",
  "Child:": "Dítě:",
  "previous records are absent from the new file; they will be retained for manual review.": "dřívějších záznamů v novém souboru chybí; zůstanou zachovány k ruční kontrole.",
  "Evidence does not belong to this family tree.": "Důkaz nepatří do rodokmenu.",
  "Evidence references a missing task.": "Důkaz odkazuje na chybějící úkol.",
  "Evidence": "Důkazy",
  "E – events": "E – události",
  "registered media": "evidovaných médií",
  "Export": "Export",
  "Journal export exceeded the 1 MiB limit.": "Export deníku překročil limit 1 MiB.",
  "Export GEDCOM": "Export GEDCOM",
  "The export contains basic people and relationships. Research assertions are not included.": "Export obsahuje základní osoby a vazby. Výzkumná tvrzení se v tomto formátu nepřenášejí.",
  "Export family trees": "Export rodokmenu",
  "Export all my family trees": "Export všech mých rodokmenů",
  "Export this family tree": "Exportovat tento rodokmen",
  "Export research journal (JSON)": "Exportovat výzkumný deník (JSON)",
  "F – individual claims": "F – jednotlivá tvrzení",
  "FamilyTree": "Rodokmen",
  "Format:": "Formát:",
  "Photograph": "Fotografie",
  "Person photographs and attached documents": "Fotografie osob a připojené dokumenty",
  "GEDCOM 7 (.ged)": "GEDCOM 7 (.ged)",
  "GEDCOM 7 / GEDZIP (.ged, .gedcom, .gdz, .zip)": "GEDCOM 7 / GEDZIP (.ged, .gedcom, .gdz, .zip)",
  "GEDCOM 7 must use UTF-8 encoding.": "GEDCOM 7 musí mít kódování UTF-8.",
  "GEDCOM import / export": "GEDCOM import / export",
  "The GEDCOM file is empty.": "GEDCOM je prázdný.",
  "GEDCOM must use UTF-8 and be smaller than 5 MB.": "GEDCOM musí být UTF-8 a menší než 5 MB.",
  "GEDCOM must begin with HEAD and end with TRLR.": "GEDCOM musí začínat HEAD a končit TRLR.",
  [
    "GEDCOM is not a complete backup. Research alternatives, citations, and Nextcloud Files " +
    "attachments are not included. Export does not change the database."
  ]: (
    "GEDCOM není úplná záloha. Výzkumné varianty, citace a přílohy ze Souborů Nextcloudu se " +
    "nepřenášejí. Export databázi nemění."
  ),
  "GEDCOM contains no people.": "GEDCOM neobsahuje žádnou osobu.",
  "GEDCOM exceeds the 5 MB limit.": "GEDCOM překračuje limit 5 MB.",
  "Generation": "Generace",
  "History record does not contain complete values.": "Historie nemá úplné hodnoty.",
  "Change history": "Historie změn",
  "Search ID, person, archive signature, book or text": "Hledat ID, jméno, signaturu, knihu nebo text",
  "Search for a person": "Hledat osobu",
  "Search for a user or group": "Hledat uživatele nebo skupinu",
  "Search for a user or group…": "Hledat uživatele nebo skupinu…",
  "Search entries": "Hledat v záznamech",
  "Search task or Q ID": "Hledat úkol nebo Q ID",
  "Searches": "Hledání",
  "Search references a missing task.": "Hledání odkazuje na chybějící úkol.",
  "Person values have changed; automatic reversal would be unsafe.": "Hodnoty osoby se od změny liší, automatické vrácení není bezpečné.",
  "Completed": "Hotovo",
  "Hypothesis": "Hypotéza",
  "Identifier on a nested GEDCOM line.": "Identifikátor na vnořeném řádku GEDCOM.",
  "Import": "Import",
  "Import / export": "Import / export",
  "Import databases": "Import databází",
  "Import GEDCOM 7 / GEDZIP": "Import GEDCOM 7 / GEDZIP",
  [
    "Import genealogical records and attached images. Create a new family tree directly, or " +
    "import into the currently open tree."
  ]: (
    "Import genealogických údajů a přiložených obrázků. Můžete rovnou vytvořit nový rodokmen " +
    "nebo importovat do otevřeného stromu."
  ),
  "The import was saved, but the tree could not be refreshed: ": "Import je uložen, ale obnovení stromu se nepodařilo: ",
  "The import has no displayed links; check FAM families and research records.": "Import nemá zobrazené vazby; zkontrolujte rodiny FAM a Výzkumné záznamy.",
  [
    "Import does not alter people, relationships, events or existing records. Imported evidence " +
    "cannot be automatically marked as verified."
  ]: (
    "Import nemění osoby, vztahy, události ani existující záznamy. Důkazy z importu nelze " +
    "automaticky označit jako ověřené."
  ),
  "Import contains no people.": "Import neobsahuje žádnou osobu.",
  "Import adds people to the current family tree. Test on a separate empty tree first.": "Import přidá osoby do aktuálního rodokmenu. Před ostrým importem doporučujeme samostatný prázdný rodokmen.",
  [
    "Import adds to the open tree. Reimporting the same collection and IDs does not duplicate " +
    "data. A changed record with an existing ID is not overwritten."
  ]: (
    "Import přidává údaje do právě otevřeného stromu. Stejná sada a ID se při opakování " +
    "neduplikují. Odlišný obsah pod stejným ID se nepřepíše."
  ),
  "Import family trees": "Import rodokmenu",
  "Import family tree / backup": "Import rodokmenu / zálohy",
  "Import family tree or backup": "Import rodokmenu nebo zálohy",
  "Import failed.": "Import selhal.",
  "Import research journal": "Import výzkumného deníku",
  "Research journal import ": "Import výzkumného deníku ",
  "Import package": "Importní sada",
  "The import file is invalid.": "Importní soubor je neplatný.",
  "Imported research records": "Importované výzkumné záznamy",
  "imported sets": "importovaných sad",
  "Import now": "Importovat",
  "Import into the open family tree": "Importovat do otevřeného rodokmenu",
  "Import into the open family tree:": "Importovat do otevřeného rodokmenu:",
  "Import into an empty tree": "Importovat do prázdného stromu",
  "Import into this family tree": "Importovat do tohoto rodokmenu",
  "Import GEDCOM": "Importovat GEDCOM",
  "Import as a new family tree": "Importovat jako nový rodokmen",
  "Import research journal (JSON)": "Importovat výzkumný deník (JSON)",
  "Import reviewed data": "Importovat zkontrolovaná data",
  "Import reviewed records": "Importovat zkontrolované záznamy",
  "New entries imported: ": "Importováno nových záznamů: ",
  "People imported: ": "Importováno osob: ",
  [
    "Imports only research tasks, searches, and candidate evidence. People, relationships, " +
    "events, and existing assertions are not modified."
  ]: (
    "Importuje pouze výzkumné úkoly, průběh hledání a kandidátní důkazy. Osoby, vztahy, " +
    "události ani původní tvrzení nemění."
  ),
  [
    "Only archives created by the complete FamilyTree backup export. Restoration creates " +
    "separate trees with new IDs and overwrites nothing."
  ]: (
    "Jen archiv vytvořený funkcí „Export úplné zálohy FamilyTree“. Obnova kopíruje původní " +
    "stromy pod novými ID, nic nepřepisuje."
  ),
  "read-only": "jen pro čtení",
  "Other": "Jiná",
  "Other event": "Jiná událost",
  "Other document": "Jiný dokument",
  "Confidence (text assessment)": "Jistota (slovní hodnocení)",
  "Already present": "Již existují",
  "Existing records:": "Již existující záznamy:",
  "First name": "Jméno",
  [
    "JSON keeps people, relationships, events, assertions, sources, citations, and media links. " +
    "ZIP may also contain images in"
  ]: (
    "JSON zachová osoby, vztahy, události i všechna tvrzení, prameny, citace a odkazy na média. " +
    "ZIP může navíc obsahovat obrázky ve složce"
  ),
  "Candidate": "Kandidát",
  "Cards were arranged automatically.": "Karty byly automaticky srovnány.",
  "Settings tabs": "Karty nastavení",
  "Each assertion remains separate, including conflicting variants.": "Každé tvrzení zůstává samostatně, včetně rozdílných variant.",
  [
    "Each claim is preserved separately, including conflicting variants. Search for P, F, Q and " +
    "other IDs in the Research Journal."
  ]: (
    "Každé tvrzení zůstává samostatně, včetně rozdílných variant. Kódy P, F, Q a další lze " +
    "vyhledávat ve Výzkumném deníku."
  ),
  [
    "Each database row is counted exactly once. Each tree is counted as one record. The " +
    "breakdown below does not add to the total. History includes all stored records, not just " +
    "the latest 500 shown."
  ]: (
    "Každý databázový záznam je v součtu právě jednou. Počet rodokmenů se počítá jako jedna " +
    "položka na strom. Podrobné rozdělení níže se již nepřičítá. Historie zahrnuje všechny " +
    "uložené záznamy, nejen posledních 500 zobrazených."
  ),
  "Conflicting variants are kept separately.": "Konfliktní varianty se neslučují.",
  "Conflicting relationships and claims:": "Konfliktní vazby a tvrzení:",
  "Conflicts:": "Konflikty:",
  "Data validation:": "Kontrola dat:",
  "Attachment checksum does not match.": "Kontrolní součet přílohy nesouhlasí.",
  "Checking import…": "Kontroluji import…",
  "Checking research journal…": "Kontroluji výzkumný deník…",
  "FamilyTree application root was not found.": "Kořen aplikace hc_familytree nebyl nalezen.",
  "Root person in backup does not exist.": "Kořenová osoba v záloze neexistuje.",
  "Baptism": "Křest",
  "Baptism certificate": "Křestní list",
  "Relationship legend": "Legenda vazeb",
  "locally saved images": "lokálně uložených obrazových souborů",
  "M – scans and photographs": "M – skeny a fotografie",
  "Registry": "Matrika",
  "Registers and photographs": "Matriky a fotografie",
  "Deleting family trees…": "Mažu rodokmeny…",
  "MIME type": "MIME typ",
  "Mobile and touch": "Mobil a dotyk",
  "Using the tree on mobile": "Mobilní práce se stromem",
  "Man": "Muž",
  "Media": "Média",
  "media": "média",
  "Media cannot be saved safely: ": "Média nelze bezpečně uložit: ",
  "Media {name} ({type}) is recorded; previews are available only for images.": "Médium {name} ({type}) je evidováno; náhled je dostupný jen pro obrázky.",
  "Places": "Místa",
  "places": "místa",
  "Place": "Místo",
  "Place of birth": "Místo narození",
  "Place of death": "Místo úmrtí",
  "Can edit": "Může upravovat",
  "Unlock card movement on mobile": "Na mobilu odemknout přesouvání karet",
  "Application menu": "Nabídka aplikace",
  "Hover over a line to see the people and their relationship.": "Najetím na čáru zobrazíte konkrétní osoby a vztah.",
  "Found": "Nalezeno",
  "Recently updated": "Naposledy upravené",
  "e.g. 12 Mar 1948": "např. 12. 3. 1948",
  "e.g. 12 Mar 2020": "např. 12. 3. 2020",
  "e.g. verified original": "např. potvrzený originál",
  "For example P0027, F00274, Q0003, 12437…": "Například P0027, F00274, Q0003, 12437…",
  "Birth": "Narození",
  "Settings": "Nastavení",
  "Settings and information": "Nastavení a informace",
  "Application settings": "Nastavení aplikace",
  "Set parents": "Nastavit rodiče",
  "Propose a person change": "Navrhnout změnu osoby",
  "Proposed value": "Navrhovaná hodnota",
  "Could not load family trees.": "Načtení rodokmenů selhalo.",
  "Load external photo preview": "Načíst náhled externí fotografie",
  "Loading family tree…": "Načítání rodokmenu…",
  "Unsafe or invalid file path: ": "Nebezpečná nebo neplatná cesta souboru: ",
  "No valid FamilyTree archive was uploaded.": "Nebyl nahrán platný archiv FamilyTree.",
  "Missing reference ": "Neexistující odkaz ",
  "Missing task for record ": "Neexistující úkol pro záznam ",
  "Open the family tree that you want to export to GEDCOM first.": "Nejdříve otevřete rodokmen, který chcete exportovat do GEDCOM.",
  "Add another person first.": "Nejdříve přidejte další osobu.",
  "Select a user or group first.": "Nejdříve vyberte uživatele nebo skupinu.",
  "Create a partnership first.": "Nejdříve vytvořte partnerský vztah.",
  "Create an event, such as a marriage, first.": "Nejdříve vytvořte událost, například Svatba.",
  [
    "Preview comes first. Re-importing the same source safely skips existing entries. Imported " +
    "evidence cannot automatically become verified."
  ]: (
    "Nejdříve zobrazíme náhled. Stejnou zdrojovou sadu lze bezpečně importovat opakovaně: již " +
    "přítomné položky se přeskočí. Stav ověřeno nelze získat pouhým importem."
  ),
  "One of the family trees could not be deleted.": "Nelze smazat jeden z rodokmenů.",
  "Cannot create a temporary archive.": "Nelze vytvořit dočasný archiv.",
  "You do not have permission to edit this family tree.": "Nemáte oprávnění upravovat tento rodokmen.",
  "You have no owned family trees to back up.": "Nemáte vlastní rodokmen k zálohování.",
  "You do not own any family trees to delete.": "Nemáte žádné vlastní rodokmeny ke smazání.",
  "Not found": "Nenalezeno",
  [
    "This permanently deletes all family trees you own, including people, relationships, " +
    "document links and shares. Trees shared with you by other owners will remain."
  ]: (
    "Neodvolatelně odstraníte všechny své rodokmeny, osoby, vztahy, dokumentové vazby a " +
    "sdílení. Cizí sdílené stromy zůstanou zachované."
  ),
  "Unverified": "Neověřeno",
  "unverified": "neověřeno",
  "Invalid media path.": "Neplatná cesta k médiu.",
  "Invalid destination path.": "Neplatná cílová cesta.",
  "Invalid database value in ": "Neplatná databázová hodnota v ",
  "Invalid value: ": "Neplatná hodnota: ",
  "Invalid local media path: ": "Neplatná lokální cesta média: ",
  "Invalid or excessively long value: ": "Neplatná nebo příliš dlouhá hodnota: ",
  "Invalid ZIP entry.": "Neplatná položka ZIPu.",
  "Invalid priority.": "Neplatná priorita.",
  "Invalid image extension.": "Neplatná přípona obrázku.",
  "Invalid table: ": "Neplatná tabulka: ",
  "Invalid source URL.": "Neplatná URL zdroje.",
  "Invalid document link.": "Neplatná vazba dokumentu.",
  "Invalid GEDCOM level or ending at line ": "Neplatná úroveň nebo konec GEDCOM na řádku ",
  "Invalid person identifiers.": "Neplatné identifikátory osob.",
  "Invalid or duplicate ID in ": "Neplatné nebo duplicitní ID v ",
  "Invalid or duplicate files in backup.": "Neplatné nebo duplicitní soubory v záloze.",
  "Invalid person references in research task.": "Neplatné odkazy osob ve výzkumném úkolu.",
  "Invalid source dataset label.": "Neplatné označení zdrojové sady.",
  "Invalid person_refs.": "Neplatné person_refs.",
  "Invalid decision.": "Neplatné rozhodnutí.",
  "Invalid archive URL.": "Neplatný archivní odkaz.",
  "Invalid journal export.": "Neplatný export deníku.",
  "Invalid GEDCOM 7.": "Neplatný GEDCOM 7.",
  "Invalid original family tree identifier.": "Neplatný identifikátor původního rodokmenu.",
  "Invalid or duplicate identifier in table ": "Neplatný nebo duplicitní identifikátor v tabulce ",
  "Invalid or local photograph URL": "Neplatný nebo lokální odkaz na fotografii",
  "Invalid proposal.": "Neplatný návrh.",
  "Invalid reference to ": "Neplatný odkaz na ",
  "Invalid reference to person.": "Neplatný odkaz na osobu.",
  "Invalid record count or structure: ": "Neplatný počet nebo struktura záznamů: ",
  "Invalid import mode.": "Neplatný režim importu.",
  "Invalid parent.": "Neplatný rodič.",
  "Invalid family tree.": "Neplatný rodokmen.",
  "Invalid evidence status.": "Neplatný stav důkazu.",
  "Invalid task status.": "Neplatný stav úkolu.",
  "Invalid user or group.": "Neplatný uživatel nebo skupina.",
  "Invalid relationship.": "Neplatný vztah.",
  "Invalid search outcome.": "Neplatný výsledek hledání.",
  "Invalid record in ": "Neplatný záznam v ",
  "Invalid GEDCOM line ": "Neplatný řádek GEDCOM ",
  "Disallowed proposal field.": "Nepovolené pole návrhu.",
  "Disallowed file or path in the ZIP archive.": "Nepovolený soubor nebo cesta v ZIPu.",
  "absent from file": "nepřítomných v souboru",
  "Reciprocal INDI/FAM links do not match for ": "Nesouhlasí obousměrné vazby INDI/FAM u ",
  "Invalid research journal format or version.": "Nesprávný formát nebo verze výzkumného deníku.",
  "Unspecified": "Neuvedeno",
  "Unassigned": "Nezařazení",
  "Unknown person": "Neznámá osoba",
  "Unknown notes:": "Neznámé poznámky:",
  "Unknown or unsupported FamilyTree backup format.": "Neznámý nebo nepodporovaný formát zálohy FamilyTree.",
  "Unknown FAMC.STAT status: ": "Neznámý stav FAMC.STAT: ",
  "Unknown owner type: ": "Neznámý typ vlastníka: ",
  "Incomplete backup.": "Neúplná záloha.",
  "Incomplete FamilyTree database tables in archive.": "Neúplné databázové tabulky FamilyTree v archivu.",
  "Normalized:": "Normalizace:",
  "Normal": "Normální",
  "New event": "Nová událost",
  "New": "Nové",
  "New people:": "Nové osoby:",
  "New relationships:": "Nové vztahy:",
  "New:": "Nové:",
  "A new import requires an empty family tree. Select update by UID for this dataset.": "Nový import vyžaduje prázdný rodokmen. Pro tuto sadu zvolte aktualizaci podle UID.",
  "New family tree": "Nový rodokmen",
  [
    "A new tree is created only after the file passes validation and you confirm the import. " +
    "Updates match records by UID and do not automatically delete missing records."
  ]: (
    "Nový rodokmen se vytvoří teprve po úspěšné kontrole souboru a po vašem potvrzení importu. " +
    "Při aktualizaci se údaje porovnávají podle UID; nepřítomné záznamy se automaticky nemažou."
  ),
  "Creating a new family tree requires new mode.": "Nový rodokmen vyžaduje režim new.",
  "New research task": "Nový výzkumný úkol",
  "Images saved:": "Nově uložené obrázky:",
  "Photograph preview": "Náhled fotografie",
  "Findings and evidence": "Nálezy a důkazy",
  "Help": "Nápověda",
  "Family tree tools": "Nástroje rodokmenu",
  "Proposal has already been resolved.": "Návrh byl již vyřízen.",
  "Person proposal": "Návrh na osobu",
  "Proposal references evidence from another family tree.": "Návrh odkazuje na cizí důkaz.",
  "Proposal references an unknown person.": "Návrh odkazuje na neznámou osobu.",
  "Proposals and conflicts": "Návrhy a rozpory",
  "Change proposals": "Návrhy změn",
  "Name": "Název",
  "A title and a file are required.": "Název a soubor jsou povinné.",
  "A name is required.": "Název je povinný.",
  "New family tree name": "Název nového rodokmenu",
  "Family tree name": "Název rodokmenu",
  "Research task title is required.": "Název výzkumného úkolu je povinný.",
  "Title, signature, text, person…": "Název, signatura, text, osoba…",
  "Low": "Nízká",
  "A person has more than two visible parents. GEDCOM export would lose links.": "Některá osoba má více než dva zobrazené rodiče. GEDCOM export by ztratil vazby.",
  "About": "O aplikaci",
  "Restore would overwrite an existing file: ": "Obnova by přepsala existující soubor: ",
  "Restore creates new trees without overwriting existing records.": "Obnova vytvoří nové rodokmeny, nic nepřepíše.",
  [
    "Restoring creates new family trees. Existing data will not be overwritten. Sharing is " +
    "re-enabled only when explicitly requested."
  ]: (
    "Obnova vytvoří nové stromy. Stávající data se nepřepisují. Sdílení se zapne jen na " +
    "výslovnou žádost."
  ),
  "Restoration": "Obnovení",
  "restore": "obnovení",
  "Restored family trees:": "Obnovených rodokmenů:",
  "Restored family trees: ": "Obnovených rodokmenů: ",
  "Restore as new family trees": "Obnovit jako nové rodokmeny",
  "Reset legend position": "Obnovit výchozí polohu legendy",
  "Restore FamilyTree backup": "Obnovit zálohu FamilyTree",
  "Restore a full FamilyTree backup (.zip)": "Obnovit úplnou zálohu FamilyTree (.zip)",
  "Restores internal records including research variants, references, documents, and stored media.": "Obnoví interní záznamy včetně výzkumných variant, propojení, dokumentů a uložených médií.",
  "image": "obrázek",
  "Image is missing.": "Obrázek chybí.",
  "Image is invalid or its checksum does not match: ": "Obrázek není platný nebo nesouhlasí kontrolní součet: ",
  "images": "obrázky",
  "Images and documents": "Obrázky a dokumenty",
  "Images in archive:": "Obrázky v archivu:",
  "Archive contents exceed the size limit.": "Obsah archivu překračuje velikostní limit.",
  "From": "Od",
  "Marriage certificate": "Oddací list",
  "Zoom out": "Oddálit",
  "Remove": "Odebrat",
  "Remove additional parent links?": "Odebrat další rodičovské vazby?",
  "Remove document from the family tree?": "Odebrat dokument z rodokmenu?",
  "Source URL": "Odkaz na zdroj",
  "Note references": "Odkazy poznámek",
  "Postponed": "Odloženo",
  "Postpone": "Odložit",
  "Redo layout (Ctrl+Y)": "Opakovat rozmístění (Ctrl+Y)",
  "Permission": "Oprávnění",
  "Orphaned record: ": "Osiřelý záznam: ",
  "people": "osob",
  "people and": "osob a",
  "people:": "osob:",
  "Person": "Osoba",
  "The person and their relationships will be deleted.": "Osoba a její vztahy budou odstraněny.",
  "Person with no known connections": "Osoba bez známých vazeb",
  "Person no longer exists.": "Osoba již neexistuje.",
  "Person has changed since the proposal. Create a new proposal.": "Osoba se od návrhu změnila. Vytvořte nový návrh.",
  "Person – original portable family-tree identifier": "Osoba – přenosné ID původního rodokmenu",
  "Could not save person: ": "Osobu se nepodařilo uložit: ",
  "People": "Osoby",
  "persons": "osoby",
  [
    "People were saved, but no links are displayed. Check whether the GEDCOM has FAM families " +
    "and review the research relationship variants."
  ]: (
    "Osoby jsou uložené, ale mezi nimi nejsou zobrazené vazby. Zkontrolujte, zda GEDCOM " +
    "obsahuje rodiny FAM, a podívejte se na výzkumné varianty vztahů."
  ),
  [
    "People, basic relationships, events, and notes. Research assertions, internal IDs, and " +
    "attachments are not fully portable."
  ]: (
    "Osoby, základní vztahy, události a poznámky. Výzkumná tvrzení, interní ID a přílohy nejsou " +
    "plně přenositelné."
  ),
  "Other new records:": "Ostatní nové záznamy:",
  "Open": "Otevřít",
  "Open archival source": "Otevřít archivní pramen",
  "Open the archived source file in Files": "Otevřít archivovaný originál v Souborech",
  "Open person photograph": "Otevřít fotografii osoby",
  "Open menu": "Otevřít nabídku",
  "Open original": "Otevřít originál",
  "Open person": "Otevřít osobu",
  "Open source document": "Otevřít pramen",
  "Open Family Tree": "Otevřít Rodokmen",
  "Open saved scan / photograph": "Otevřít uložený sken / fotografii",
  "Open in Nextcloud Files": "Otevřít v Souborech Nextcloud",
  "Open research records": "Otevřít výzkumné záznamy",
  "Open all research records for this person in the journal": "Otevřít všechny výzkumné záznamy osoby v deníku",
  "Open source": "Otevřít zdroj",
  "Open this person's tasks in journal": "Otevřít úkoly této osoby v deníku",
  "Open ↗": "Otevřít ↗",
  "Tree controls": "Ovládání stromu",
  "View controls": "Ovládání zobrazení",
  "Verified": "Ověřeno",
  "Import label may contain only letters, digits, _ and -.": "Označení importu smí obsahovat jen písmena, číslice, _ a -.",
  "Dataset identifier": "Označení sady",
  "P – people": "P – osoby",
  "Partner / spouse": "Partner / manžel",
  "Partnership": "Partnerství",
  "Planned": "Plánováno",
  "GEDCOM 7 (.ged, .gedcom) or GEDZIP (.gdz, .zip with gedcom.ged) is supported.": "Podporován je GEDCOM 7 (.ged, .gedcom) nebo GEDZIP (.gdz, .zip s gedcom.ged).",
  "Only FamilySearch GEDCOM 7.0 is supported.": "Podporován je jen FamilySearch GEDCOM 7.0.",
  "Breakdown by type and status": "Podrobné rozdělení podle typů a stavů",
  "Gender": "Pohlaví",
  "Burial": "Pohřeb",
  "Continue": "Pokračovat",
  "Search attempts": "Pokusy",
  "Could not save position: ": "Polohu se nepodařilo uložit: ",
  "Card positions have changed. Reload the tree.": "Polohy karet se mezitím změnily. Načtěte strom znovu.",
  "Description": "Popis",
  "Search description is required.": "Popis hledání je povinný.",
  "Last import of set": "Poslední import sady",
  "Approval will modify person data. Linked verified evidence is required.": "Potvrzením se změní údaje osoby. Ověřený důkaz je povinný.",
  "Only the open family tree": "Pouze otevřený rodokmen",
  "View only": "Pouze čtení",
  "Allow moving the legend anywhere in the workspace": "Povolit přesouvání legendy po celé pracovní oblasti",
  "Occupation": "Povolání",
  "Note": "Poznámka",
  "Note {item} has no recognizable Fxxxxx line; its entire text is preserved.": "Poznámka {item} nemá rozpoznatelný řádek Fxxxxx; celý text je zachován.",
  "Notes": "Poznámky",
  "notes": "poznámky",
  "Notes / other research data": "Poznámky / ostatní výzkumná data",
  "Notes and conflicts": "Poznámky a rozpory",
  "Count": "Počet",
  "Records in category": "Počet záznamů v kategorii",
  "Corrupted database data.": "Poškozená databázová data.",
  "The database part of the backup is corrupted.": "Poškozená databázová část zálohy.",
  "Corrupted evidence metadata.": "Poškozená metadata důkazu.",
  "Corrupted research task references.": "Poškozené odkazy výzkumného úkolu.",
  "Corrupted change proposal.": "Poškozený návrh změny.",
  "Corrupted research JSON in backup.": "Poškozený výzkumný JSON v záloze.",
  "Required application or Shared App Core files could not be loaded.": "Požadované soubory aplikace nebo Shared App Core se nepodařilo načíst.",
  "Source or register with archive signature and metadata": "Pramen či matrika, signatura, archivační informace",
  "Sources": "Prameny",
  "sources": "prameny",
  "Sources and evidence": "Prameny a jistota",
  "Right-click to select a group; Shift-drag to move it": "Pravým tlačítkem označte skupinu; Shift + tažením ji přesunete",
  "Right-click to adjust the selection; Shift-drag moves the group and opens space.": "Pravým tlačítkem upravíte výběr; Shift + tažení přesune skupinu a uvolní místo.",
  "Priority": "Priorita",
  "For GEDCOM, first open an empty family tree where you can edit.": "Pro GEDCOM nejprve otevřete prázdný rodokmen s oprávněním upravovat.",
  "Type SMAZAT to confirm": "Pro potvrzení napište SMAZAT",
  "In progress": "Probíhá",
  "Simple sum of rows across 13 tables. Subgroups are not counted again. The total is not the number of people.": "Prostý součet řádků 13 tabulek. Podskupiny se nepřičítají znovu. Součet není počet osob.",
  "First parent": "První rodič",
  "Rights": "Práva",
  "Empty task title.": "Prázdný název úkolu.",
  "Empty search description.": "Prázdný popis hledání.",
  "Empty GEDCOM header.": "Prázdný začátek GEDCOM.",
  "Family tree import, export and backup": "Přenos a záloha rodokmenů",
  "Record transcription": "Přepis zápisu",
  "Transcribed": "Přepsáno",
  "Move legend": "Přesunout legendu",
  [
    "The legend can also be placed in unused sidebar or toolbar space. Its position is saved in " +
    "this browser."
  ]: (
    "Přesunutou legendu lze umístit i na volné místo v postranním panelu nebo na liště. Poloha " +
    "se ukládá v tomto prohlížeči."
  ),
  "Drag to reposition": "Přetažením změnit polohu",
  "Zoom in": "Přiblížit",
  "Add": "Přidat",
  "Add child": "Přidat dítě",
  "Add evidence": "Přidat důkaz",
  "Add finding or evidence": "Přidat nález nebo důkaz",
  "Add person": "Přidat osobu",
  "Add event": "Přidat událost",
  "Add selected user or group": "Přidat vybraného uživatele nebo skupinu",
  "Add relationship": "Přidat vztah",
  "Add task": "Přidat úkol",
  "Records added:": "Přidáno záznamů:",
  "Attached images:": "Přiložené obrázky:",
  "attached files:": "přiložených souborů:",
  "Attach document": "Připojit dokument",
  "Link to people": "Připojit k osobám",
  "Link to events": "Připojit k událostem",
  "Link to relationships and unions": "Připojit ke vztahům a svazkům",
  "Link the document to at least one person, event, or union.": "Připojte dokument alespoň k jedné osobě, události nebo svazku.",
  "Preparing export…": "Připravuji export…",
  "Last name": "Příjmení",
  "Event date or place is too long.": "Příliš dlouhé datum nebo místo události.",
  "Relationship date is too long.": "Příliš dlouhé datum vztahu.",
  "Person field is too long: ": "Příliš dlouhé pole osoby: ",
  "Research attachment folder nesting is too deep.": "Příliš hluboká složka výzkumných příloh.",
  "Too many items in the archive.": "Příliš mnoho položek v archivu.",
  "Too many attachments; backup was not created.": "Příliš mnoho příloh; záloha se nevytvořila.",
  "Too many files in backup.": "Příliš mnoho souborů v záloze.",
  "Attachment exceeds its declared size.": "Příloha překračuje deklarovanou velikost.",
  "Cannot verify the attachment.": "Přílohu nelze ověřit.",
  "Direct link": "Přímý odkaz",
  "Access denied.": "Přístup byl odepřen.",
  "Legacy archive – read-only": "Původní archiv – pouze ke čtení",
  "Original GEDCOM/GEDZIP cannot be archived in Files. Import was not started.": "Původní GEDCOM/GEDZIP nelze archivovat do Souborů. Import se nespustil.",
  "Original person no longer exists.": "Původní osoba již neexistuje.",
  [
    "Original P, F, Q, S and other IDs are read directly from saved research. Nothing is " +
    "overwritten or duplicated."
  ]: (
    "Původní P, F, Q, S a další identifikátory jsou převzaté přímo z uloženého výzkumu. Nic se " +
    "nepřepisuje a nevytvářejí se duplicity."
  ),
  [
    "Historical Q and current journal tasks are shown together. Original texts remain " +
    "unchanged; matching tasks are linked for display only."
  ]: (
    "Původní Q a aktuální deník se zobrazují společně. Původní text zůstává nezměněný; shodné " +
    "úkoly jsou pouze propojené."
  ),
  "The original Nextcloud file will be kept.": "Původní soubor v Nextcloudu zůstane zachován.",
  "Original text": "Původní text",
  "Original claim": "Původní tvrzení",
  "source records": "původních záznamů",
  "Q – research tasks": "Q – výzkumné úkoly",
  "Q0002, marriage, register…": "Q0002, sňatek, matrika…",
  "R – relationships": "R – vztahy",
  "Import report": "Report importu",
  "Restored": "restore",
  "Reverted": "revert",
  "Mode for the open family tree": "Režim pro otevřený rodokmen",
  "Your family data stays in your Nextcloud.": "Rodinná data zůstanou ve vašem Nextcloudu.",
  "Family relationships": "Rodinné vazby",
  "Families": "Rodiny",
  "families": "rodiny",
  "Parent": "Rodič",
  "Parent / child": "Rodič / dítě",
  "Parent and child": "Rodič a dítě",
  "A parent cannot be this person’s descendant.": "Rodič nemůže být potomkem této osoby.",
  "Parent:": "Rodič:",
  "Parents": "Rodiče",
  "No parents are entered in this tree": "Rodiče nejsou ve stromu uvedeni",
  "Could not save parents: ": "Rodiče se nepodařilo uložit: ",
  "Parent link": "Rodičovská vazba",
  "Parent link is unverified": "Rodičovská vazba neověřená",
  "Parent link is disputed": "Rodičovská vazba sporná",
  "Parent-child branch": "Rodičovská větev",
  "Parent links have sources, but are not all verified": "Rodičovské vazby mají zdroj, ale nejsou všechny ověřené",
  "Parent-child relationship": "Rodičovský vztah",
  "Birth surname": "Rodné příjmení",
  "Birth surname: ": "Rodné příjmení: ",
  "Birth certificate": "Rodný list",
  "Family Tree": "Rodokmen",
  "The family tree was created, but the import could not be confirmed: ": "Rodokmen byl vytvořen, ale import nebyl potvrzen: ",
  "Family Tree could not be loaded.": "Rodokmen nelze načíst.",
  "Family tree has no stable ID.": "Rodokmen nemá stabilní ID.",
  "Family Tree stores private data in the Nextcloud database.": "Rodokmen používá soukromá data uložená v databázi Nextcloudu.",
  "Could not create family tree: ": "Rodokmen se nepodařilo vytvořit: ",
  "This family tree is not shared yet.": "Rodokmen zatím není sdílen.",
  "The family tree will remain unchanged.": "Rodokmen zůstane beze změny.",
  "Family tree: %s": "Rodokmen: %s",
  "Trees": "Rodokmeny",
  "family trees": "rodokmenů",
  "Unpacked archive is too large.": "Rozbalený archiv je příliš velký.",
  "Uncompressed content is too large.": "Rozbalený obsah je příliš velký.",
  "Differences by record type": "Rozdíly podle typu záznamu",
  "Could not restore card positions: ": "Rozmístění se nepodařilo obnovit: ",
  "Backup scope": "Rozsah zálohy",
  "Full backup scope": "Rozsah úplné zálohy",
  "Divorce": "Rozvod",
  "Manual card positions will be removed.": "Ruční posuny všech karet budou odstraněny.",
  "Manual card positions will be removed. Press Ctrl+Z to undo.": "Ruční posuny všech karet budou odstraněny. Rozmístění můžete vrátit přes Ctrl+Z.",
  "Manually adjusted {item} was preserved; its research record was updated.": "Ručně upravené zobrazení {item} zůstalo zachováno; výzkumný záznam je aktualizován.",
  "S – archival books and sources": "S – prameny a knihy",
  "Separate branch": "Samostatná větev",
  "Individual claim about a person, relationship or event; variants remain separate": "Samostatné tvrzení o údaji osoby, vztahu nebo události; různé varianty zůstávají vedle sebe",
  "Approved": "Schváleno",
  "Approval requires linked verified evidence.": "Schválení vyžaduje navázaný ověřený důkaz.",
  "Approve (verified evidence required)": "Schválit (vyžaduje ověřený důkaz)",
  "Shares": "Sdílení",
  [
    "Share records are always included in the archive. They are not reactivated unless you opt " +
    "in. External URLs are not fetched into the backup."
  ]: (
    "Sdílení je v archivu uložené vždy. Bez zaškrtnutí se při obnově neaktivuje. Z důvodu " +
    "ochrany dat nejsou do zálohy stahovány soubory z externích URL."
  ),
  "Family tree sharing": "Sdílení rodokmenu",
  "shares:": "sdílení:",
  "Shared user or group no longer exists: ": "Sdílený uživatel nebo skupina již neexistuje: ",
  "PHP ZIP extension is missing on the server.": "Server nemá rozšíření PHP ZIP.",
  "The server did not return a ZIP archive.": "Server nevrátil archiv ZIP.",
  "The server did not return a valid FamilyTree archive.": "Server nevrátil platný archiv FamilyTree.",
  "The server did not return a valid GEDCOM file.": "Server nevrátil platný GEDCOM.",
  "Shared App Core is outdated": "Shared App Core je zastaralé",
  "Archive reference": "Signatura",
  "Actual size": "Skutečná velikost",
  "Delete": "Smazat",
  "Delete entire family tree?": "Smazat celý rodokmen?",
  "Delete person?": "Smazat osobu?",
  "Delete family tree": "Smazat rodokmen",
  "Delete all my family trees": "Smazat všechny moje rodokmeny",
  "Delete all my family trees?": "Smazat všechny moje rodokmeny?",
  "Deletion": "Smazání",
  "Image": "Snímek",
  "File": "Soubor",
  "File is missing or too large: ": "Soubor chybí nebo je příliš velký: ",
  "The GEDCOM file is ready for download.": "Soubor GEDCOM byl připraven ke stažení.",
  "File must be at most 1 MiB.": "Soubor musí obsahovat nejvýše 1 MiB dat.",
  "File was not validated or has changed since preview.": "Soubor nebyl zkontrolován nebo se od náhledu změnil.",
  "Cannot read file for complete backup: ": "Soubor nelze přečíst pro úplnou zálohu: ",
  "File cannot be read.": "Soubor nelze přečíst.",
  "Cannot add file to ZIP.": "Soubor nelze přidat do ZIPu.",
  "File is not a valid JSON object.": "Soubor neobsahuje platný JSON objekt.",
  "File exceeds the 48 MiB limit: ": "Soubor překračuje limit 48 MiB: ",
  "File changed since preview. Run validation again.": "Soubor se od náhledu změnil. Spusťte kontrolu znovu.",
  "A file with the same name already exists with different contents.": "Soubor stejného jména už existuje s jiným obsahem.",
  "File in archive cannot be read.": "Soubor v archivu nelze přečíst.",
  "File in Nextcloud": "Soubor v Nextcloudu",
  "Research journal file (JSON)": "Soubor výzkumného deníku (JSON)",
  "file not yet available": "soubor zatím chybí",
  "Backup file": "Soubor zálohy",
  "The backup file was damaged during restore.": "Soubor zálohy byl během obnovy poškozen.",
  "Siblings": "Sourozenci",
  "Total attachments exceed the complete backup limit.": "Součet příloh překračuje limit úplné zálohy.",
  "Shared event {item} also appears for another person; review it in the research records.": "Společná událost {item} má další zobrazení u druhé osoby; ověřte je ve výzkumných údajích.",
  "Shared child-parent branch": "Společná větev dětí a rodičů",
  "Shared parents": "Společní rodiče",
  "Starting app…": "Spouštím aplikaci…",
  "Arrange": "Srovnat",
  "standard claims": "standardní tvrzení",
  "of standard claims": "standardních tvrzení",
  "Statistics": "Statistiky",
  "Tree statistics": "Statistiky rodokmenu",
  "Statistics for all my trees": "Statistiky všech mých rodokmenů",
  "Status": "Stav",
  "Status / verification": "Stav / ověření",
  "Verification status": "Stav ověření",
  "Status: import complete": "Stav: import dokončen",
  "The tree now contains:": "Strom nyní obsahuje:",
  "Could not arrange the tree: ": "Strom se nepodařilo uspořádat: ",
  "Trees:": "Stromů:",
  "Download people and relationships as GEDCOM UTF-8.": "Stáhne osoby a vztahy ve formátu GEDCOM UTF-8.",
  "Download .ged": "Stáhnout .ged",
  "Download Shared App Core": "Stáhnout Shared App Core",
  "Download file": "Stáhnout soubor",
  [
    "Download the currently displayed family tree as GEDCOM 7 (.ged, UTF-8). The export " +
    "includes people, parent and partner links, basic events, and text notes."
  ]: (
    "Stáhněte aktuálně zobrazený rodokmen jako GEDCOM 7 (.ged, UTF-8). Export zahrnuje osoby, " +
    "rodičovské a partnerské vazby, základní události a textové poznámky."
  ),
  "Marriage": "Svatba",
  "Union": "Svazek",
  "Symbolic links in archives are not allowed.": "Symbolické odkazy v archivu nejsou povolené.",
  "Symbolic links are not allowed in backups.": "Symbolické odkazy v záloze nejsou povolené.",
  "Census": "Sčítání lidu",
  "This person is the selected person’s parent": "Tato osoba je rodičem vybrané osoby",
  [
    "This person has more than two parent records. Additional links stay in research history, " +
    "but saving parents removes them from the graph."
  ]: (
    "Tato osoba má více než dva rodičovské záznamy. Další vazby zůstanou ve výzkumné historii, " +
    "ale ruční uložení rodičů je odebere ze stromu."
  ),
  "This relationship already exists.": "Tento vztah už existuje.",
  "This ZIP contains GEDCOM (GEDZIP), not a complete FamilyTree backup. Choose Import GEDCOM 7 / GEDZIP.": "Tento ZIP obsahuje GEDCOM (GEDZIP), nikoli úplnou zálohu FamilyTree. Zvolte Import GEDCOM 7 / GEDZIP.",
  "Test notification": "Testovací oznámení",
  "This is GEDCOM/GEDZIP, not a complete FamilyTree backup. Go back and choose GEDCOM 7 / GEDZIP import.": "Toto je GEDCOM/GEDZIP, nikoli úplná záloha FamilyTree. Vraťte se a vyberte import GEDCOM 7 / GEDZIP.",
  "Assertions": "Tvrzení",
  "assertions": "tvrzení",
  "Type": "Typ",
  "Action type": "Typ akce",
  "Record type": "Typ záznamu",
  "Drag one selected card to move the group.": "Táhněte jednu z označených karet pro společný posun.",
  "preserved in the original archive": "uchováno v původním archivu",
  "Event": "Událost",
  "Event references an unknown person.": "Událost odkazuje na neznámou osobu.",
  "Events": "Události",
  "events": "události",
  "Events and provenance": "Události a jejich původ",
  "A link to the existing file is saved. Removing this document does not delete the original file.": "Ukládá se odkaz na existující soubor. Smazání dokumentu z rodokmenu původní soubor nesmaže.",
  "Saving family tree…": "Ukládám rodokmen…",
  "Importing reviewed research entries…": "Ukládám zkontrolované výzkumné záznamy…",
  "Saving…": "Ukládám…",
  "Saving replaces this person’s existing parent links; other relationships stay unchanged.": "Uložení nahradí dosavadní rodičovské vazby této osoby. Jiných vztahů se nedotkne.",
  "saved source descriptions": "uložených popisů pramenů",
  "Save": "Uložit",
  "Save document": "Uložit dokument",
  "Save proposal (do not change the tree)": "Uložit návrh (bez změny rodokmenu)",
  "Save parents": "Uložit rodiče",
  "Updated": "update",
  "Warnings": "Upozornění",
  "Edit": "Upravit",
  "Edit document": "Upravit dokument",
  "Edit name and details": "Upravit jméno a údaje",
  "Edit person": "Upravit osobu",
  "Edit family tree": "Upravit rodokmen",
  "Edit status / next step": "Upravit stav / další krok",
  "Edit research task": "Upravit výzkumný úkol",
  "Photo URL": "URL fotografie",
  "Organize": "Uspořádat",
  "Arrange tree": "Uspořádat strom",
  "Arrange the tree?": "Uspořádat strom?",
  "Retained from the previous version in the archive:": "V archivu zachováno z předchozí verze:",
  "GEDZIP is missing root-level gedcom.ged.": "V GEDZIP chybí gedcom.ged v kořeni.",
  "Invalid archive entry.": "Vadná položka archivu.",
  "Linked evidence": "Vazba na důkaz",
  "Document links": "Vazby dokumentů",
  "Note links": "Vazby poznámek",
  "note links": "vazby poznámek",
  "The two best-supported links appear in the tree; other alternatives remain in research records.": "Ve stromu se zobrazí dvě nejlépe doložené, další varianty zůstanou ve výzkumných záznamech.",
  "The two best supported links appear in the tree; other variants remain in the research records.": "Ve stromu se zobrazí dvě nejlépe doložené, ostatní zůstanou ve výzkumných záznamech.",
  "This setting controls verification markers on people in the tree in this browser.": "Volba ovlivní značky u osob ve stromu v tomto prohlížeči.",
  "Reverting creates a new audit entry without deleting the original history.": "Vrácení vytvoří nový auditní záznam a nesmaže původní historii.",
  "Reverted change": "Vrácení změny",
  "Revert": "Vrátit",
  "Only updates to person details can be reverted.": "Vrátit lze pouze aktualizaci údajů osoby.",
  "Undo layout (Ctrl+Z)": "Vrátit rozmístění (Ctrl+Z)",
  "Revert this change": "Vrátit tuto změnu",
  "Revert person change?": "Vrátit změnu osoby?",
  "Select a .ged, .gdz, or .zip archive containing gedcom.ged.": "Vyberte .ged, .gdz nebo .zip s gedcom.ged.",
  "Select a ZIP archive.": "Vyberte archiv ZIP.",
  "Select document": "Vyberte dokument",
  [
    "Choose an export format. The native archive is for complete backup and restore in " +
    "FamilyTree; GEDCOM 7 is for exchange with other genealogy software."
  ]: (
    "Vyberte formát exportu. Vlastní archiv je určený pro úplnou zálohu a pozdější obnovu v " +
    "FamilyTree. GEDCOM 7 slouží pro přenos do jiných genealogických aplikací."
  ),
  [
    "Choose an export format. A full FamilyTree backup allows you to restore all your own data " +
    "later; GEDCOM 7 exchanges data with other genealogy programs."
  ]: (
    "Vyberte formát exportu. Úplná záloha FamilyTree slouží pro pozdější obnovu všech vlastních " +
    "dat; GEDCOM 7 pro výměnu mezi genealogickými programy."
  ),
  [
    "Select GEDCOM 7 (.ged, .gedcom) or GEDZIP (.gdz or .zip containing gedcom.ged). A preview " +
    "shows people, relationships and media counts. Existing trees are not overwritten " +
    "automatically."
  ]: (
    "Vyberte GEDCOM 7 (.ged, .gedcom) nebo GEDZIP (.gdz či .zip s gedcom.ged). Před importem " +
    "zobrazíme počty osob, vztahů a médií. Existující rodokmeny se samy nepřepisují."
  ),
  "Select a GEDCOM file.": "Vyberte GEDCOM soubor.",
  "Choose one or two different parents.": "Vyberte jednoho nebo dva různé rodiče.",
  "Select a JSON or ZIP file.": "Vyberte JSON nebo ZIP.",
  "Choose this person’s partner.": "Vyberte partnera dané osoby.",
  [
    "Select the original FamilyTree ZIP. All trees, people and files are restored under new " +
    "IDs. Existing data remains unchanged."
  ]: (
    "Vyberte původní ZIP vytvořený aplikací FamilyTree. Všechny stromy, osoby a soubory se " +
    "obnoví pod novými ID. Existující data zůstanou beze změny."
  ),
  "Choose a parent": "Vyberte rodiče",
  "Select a family tree": "Vyberte rodokmen",
  "Select a JSON file.": "Vyberte soubor JSON.",
  [
    "Choose an import type. A full FamilyTree backup restores all trees as new trees without " +
    "overwriting existing records."
  ]: (
    "Vyberte typ importu. Úplná záloha FamilyTree obnoví všechny uložené rodokmeny ze ZIPu jako " +
    "nové, bez přepsání současných údajů."
  ),
  "Select the type of imported file. A ZIP extension alone does not identify the format.": "Vyberte, co obsahuje importovaný soubor. Pouhá přípona ZIP neurčuje jeho formát.",
  "selected people": "vybraných osob",
  "Select person": "Vybrat osobu",
  "Select group": "Vybrat skupinu",
  "Choose from Files": "Vybrat ze Souborů",
  "Enter a name for the new family tree.": "Vyplňte název nového rodokmenu.",
  "High": "Vysoká",
  "Creation": "Vytvoření",
  "Create": "Vytvořit",
  "Create a new family tree": "Vytvořit nový rodokmen",
  "Review proposed change?": "Vyřídit návrh změny?",
  "remote links:": "vzdálené odkazy:",
  "Education": "Vzdělání",
  "Relationship / event; original dataset identifier preserved": "Vztah / událost; zachované původní ID importní sady",
  "Relationship references an unknown person.": "Vztah odkazuje na neznámou osobu.",
  "Could not add relationship: ": "Vztah se nepodařilo přidat: ",
  "Relationships": "Vztahy",
  "relationships": "vztahy",
  "Relationships and variants": "Vztahy a varianty",
  "More than two parent links:": "Více než dvě rodičovské vazby:",
  "File picker is unavailable; enter the path manually.": "Výběr souboru není dostupný; vložte cestu ručně.",
  "Root generation": "Výchozí generace",
  "Root person": "Výchozí osoba",
  "Off by default. Counts appear in the toolbar instead of on the family tree canvas.": "Výchozí stav: vypnuto. Počty se zobrazí v nástrojové liště místo plochy rodokmenu.",
  "Outcome": "Výsledek",
  "Search outcome": "Výsledek hledání",
  "Import result": "Výsledek importu",
  "research": "výzkum",
  "Research assertions": "Výzkumná tvrzení",
  "Research variant without a graph link": "Výzkumná varianta bez spojnice",
  "Research media is missing from backup.": "Výzkumné médium chybí v záloze.",
  "Research records": "Výzkumné záznamy",
  "Research records remain, but additional links disappear from the graph.": "Výzkumné záznamy zůstanou zachované, ale další vazby ze stromu zmizí.",
  "Research evidence": "Výzkumné údaje",
  "Research tasks": "Výzkumné úkoly",
  "Research tasks Q": "Výzkumné úkoly Q",
  "research archive": "výzkumný archiv",
  "Research journal": "Výzkumný deník",
  "Research journal exceeds 1 MiB.": "Výzkumný deník přesahuje 1 MiB.",
  "Research import JSON / ZIP": "Výzkumný import JSON / ZIP",
  [
    "Research transfer, not a full backup: genealogical facts, change proposals, history and " +
    "media are not included. Previously verified findings must be reviewed again when imported " +
    "into another tree."
  ]: (
    "Výzkumný přenos, ne úplná záloha: nezahrnuje genealogická fakta, návrhy změn, audit ani " +
    "média. Dříve ručně ověřené nálezy je při importu do jiného stromu nutné znovu prověřit."
  ),
  "Research record has invalid projection.": "Výzkumný záznam má neplatnou projekci.",
  "Research record references a task in another tree.": "Výzkumný záznam odkazuje na cizí úkol.",
  "Research task, status, attempts and next steps": "Výzkumný úkol, jeho stav, pokusy a další kroky",
  "research relationship variants": "výzkumných variant vztahů",
  "Meaning of identifiers and their history": "Význam identifikátorů a jejich historie",
  [
    "Record type from the original import determines meaning, not just the first letter. IDs " +
    "are scoped to their origin_key. SQL IDs are not portable genealogy IDs."
  ]: (
    "Význam určuje typ záznamu v původní importní sadě, nikoliv pouze první písmeno. ID jsou " +
    "přiřazena k původu, například origin_key. SQL ID není přenosné genealogické ID."
  ),
  "branches": "větví",
  "total records:": "všech záznamů:",
  [
    "All internal records of your family trees, research variants, sharing records, local files " +
    "and their checksums."
  ]: (
    "Všechny interní záznamy vlastních rodokmenů, výzkumné varianty, sdílení, lokální soubory a " +
    "jejich kontrolní součty."
  ),
  "All my family trees": "Všechny moje rodokmeny",
  "All my family trees (complete database)": "Všechny moje rodokmeny (úplná databáze)",
  "All persons": "Všechny osoby",
  "All statuses": "Všechny stavy",
  "All types": "Všechny typy",
  "All displayed parent links are verified": "Všechny zobrazené rodičovské vazby jsou ověřené",
  "Enter a first or last name.": "Zadejte jméno nebo příjmení.",
  "Create your first family tree": "Založte první rodokmen",
  "Reject": "Zamítnout",
  "Rejected": "Zamítnuto",
  "Employment": "Zaměstnání",
  "When enabled, drag a card with one finger. Drag empty canvas to pan the tree.": "Zapnuto: táhněte kartu jedním prstem. Prázdným plátnem posouváte strom.",
  "Save search log": "Zapsat do deníku",
  "No documents yet.": "Zatím bez dokumentů.",
  "No relationships yet.": "Zatím bez vztahů.",
  "Only person-detail changes can be proposed at present.": "Zatím lze navrhovat změny údajů osoby.",
  "No detailed statistics are available yet.": "Zatím nejsou k dispozici podrobné údaje.",
  "No records yet.": "Zatím zde nejsou žádné záznamy.",
  "There are no tasks yet.": "Zatím zde nejsou žádné úkoly.",
  "Close": "Zavřít",
  "Close menu": "Zavřít nabídku",
  "Record search": "Zaznamenat hledání",
  [
    "Original scans and photos from imported archives. Thumbnails use protected Nextcloud " +
    "storage. Remote links are never fetched automatically."
  ]: (
    "Zde jsou původní skeny a fotografie uložené z importovaných archivů. Náhledy se načítají z " +
    "chráněného úložiště Nextcloudu. Externí odkazy nejsou stahovány automaticky."
  ),
  "Source / link": "Zdroj / odkaz",
  "Source collection": "Zdrojová sada",
  "Rationale": "Zdůvodnění",
  "Cannot finish ZIP.": "ZIP nelze dokončit.",
  "Cannot read ZIP.": "ZIP nelze přečíst.",
  "ZIP contains unlisted files.": "ZIP obsahuje nepopsané soubory.",
  "Preview file": "Zkontrolovat soubor",
  "Verify backup": "Zkontrolovat zálohu",
  "Try again": "Zkusit znovu",
  "Changing relationship members ": "Změna členů vztahu ",
  "Changed records skipped because of an existing ID:": "Změněné záznamy přeskočené kvůli shodnému ID:",
  "Changed records with an existing ID were kept as before; the new source file was archived.": "Změněné záznamy se stejným ID zůstaly v původní podobě; nový soubor je archivován.",
  "Changed:": "Změněné:",
  "Modified record ": "Změněný záznam ",
  "changed records with existing IDs will not be overwritten.": "změněných záznamů se stejným ID se nepřepíše.",
  [
    "The badge by a name describes parent links: ★ verified, ◇ sourced, ? unverified, ! " +
    "disputed, · no parents entered."
  ]: (
    "Značka u jména hodnotí vazbu k rodičům: ★ ověřená, ◇ se zdrojem, ? neověřená, ! sporná, · " +
    "bez zadaných rodičů."
  ),
  "Reactivate shares to existing users and groups (optional)": "Znovu aktivovat sdílení s existujícími uživateli a skupinami (volitelné)",
  "Shown": "Zobrazeno",
  "Shown in tree": "Zobrazeno ve stromu",
  "Appearance": "Zobrazení",
  "Tree appearance": "Zobrazení stromu",
  "displayed relationships": "zobrazených vztahů",
  "displayed relationships.": "zobrazených vztahů.",
  "visible tasks": "zobrazených úkolů",
  "Show entire tree": "Zobrazit celý strom",
  "Show people, relationships and branches summary in the top bar": "Zobrazit přehled osob, vztahů a větví v horní liště",
  "Show parent-link verification badges by names": "Zobrazit značky ověření u jmen",
  "Challenged parent link": "Zpochybněná rodičovská vazba",
  "challenged link": "zpochybněná vazba",
  "Cancel": "Zrušit",
  "Clear selection": "Zrušit výběr",
  "Backup is ready to download.": "Záloha byla připravena ke stažení.",
  "Backup contains no family trees.": "Záloha neobsahuje žádný rodokmen.",
  "Backup contains too many records.": "Záloha obsahuje příliš mnoho záznamů.",
  "Backup verified.": "Záloha ověřena.",
  "Backup has changed since preview. Verify it again.": "Záloha se od náhledu změnila. Zkontrolujte ji znovu.",
  [
    "The backup is created without modifying the database. The current single-file format " +
    "supports up to 48 MiB per attachment, 256 MiB of attachments in total and 3,000 " +
    "attachments. External website links are stored as references."
  ]: (
    "Záloha se vytvoří beze změny databáze. Současný jednosouborový formát podporuje nejvýše 48 " +
    "MiB na přílohu, 256 MiB příloh celkem a 3 000 příloh. Externí webové odkazy zůstávají " +
    "odkazy."
  ),
  "Record has no reversible values.": "Záznam neobsahuje vratitelné údaje.",
  "Record v2 has no valid stable ID: ": "Záznam v2 nemá platné stabilní ID: ",
  "Record {item} is retained in the original file.": "Záznam {item} je uchován v původním souboru.",
  "Search log records": "Záznamy hledání",
  "Records absent from the new file were preserved. Removing them requires manual review.": "Záznamy nepřítomné v novém souboru zůstaly zachovány. Jejich odstranění vyžaduje ruční kontrolu.",
  "Records:": "Záznamy:",
  "{name} requires Core {required} or newer. Installed: {installed}.": "{name} vyžaduje Core {required} nebo novější. Nainstalováno je {installed}.",
  "Field": "Údaj",
  "Records were read, but the task was not completed.": "Údaje jsou přečtené, ale úkol nebyl dokončen.",
  "Task": "Úkol",
  "Task is not in this family tree.": "Úkol není v tomto stromu.",
  "Task does not belong to this family tree.": "Úkol nepatří do rodokmenu.",
  "Tasks": "Úkoly",
  "tasks": "úkoly",
  "of tasks": "úkolů",
  "Death certificate": "Úmrtní list",
  "Death": "Úmrtí",
  "Only the owner can create a complete backup of a particular family tree.": "Úplnou zálohu konkrétního rodokmenu může vytvořit pouze vlastník.",
  "Complete FamilyTree backup (.zip)": "Úplná záloha FamilyTree (.zip)",
  "Full FamilyTree backup (ZIP)": "Úplná záloha FamilyTree (ZIP)",
  "Update": "Úprava",
  "Awaiting verification": "Čeká na ověření",
  "Pending review": "Čeká na schválení",
  "Failed to read the attachment.": "Čtení přílohy selhalo.",
  "Image number": "Číslo snímku",
  "Woman": "Žena",
  "Living person": "Žijící osoba",
  "No matching records.": "Žádné odpovídající záznamy.",
  "⬆ Import": "⬆ Import",
  "⬆ Import / Restore": "⬆ Import / obnova",
  "⬇ Export": "⬇ Export"
}/* CS_CATALOG_END */;
/**
 * @brief Přeloží anglický klíč podle aktivního jazyka a použije anglický fallback.
 * @param {unknown} oS2 Anglický překladový klíč nebo text určený k překladu.
 * @returns {string} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnTr=oS2=>{
 const sSource=String(oS2??'');
 const sKey=Object.prototype.hasOwnProperty.call(oCzechCatalog,sSource)
    ? sSource // Kanonický anglický klíč má přednost před historickou českou aliasovou mapou.
    : (Object.prototype.hasOwnProperty.call(oLegacyKeyMap,sSource)?oLegacyKeyMap[sSource]:sSource);
 const oNative=typeof window.t==='function'?window.t(sAPP,sKey):sKey;
 if(oNative!==sKey)return oNative;
 // Missing translations fall back to the English source; never to Czech.
 if(sAppLanguage.startsWith('cs'))return oCzechCatalog[sKey]??sKey;
 return sKey;
};
/**
 * @brief Přeloží serverové hlášení a zachová identifikátory nebo neznámý text beze změny.
 * @param {unknown} oS3 Serverová zpráva, která se má převést na lokalizovaný text.
 * @returns {string} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnTrServer=oS3=>{const sSource2=String(oS3??'');const oExact=fnTr(sSource2);if(oExact!==sSource2)return oExact;
 // Backend warnings may append a filename, GEDCOM identifier or line number.
 for(const sKey2 of aServerMessagePrefixes){if(sSource2.startsWith(sKey2)&&sSource2.length>sKey2.length)return fnTr(sKey2)+sSource2.slice(sKey2.length)}
 let oMatch;
   // Server uses canonical English error templates. Keep the variable portion unchanged.
  if((oMatch=/^Modified record (.+) cannot be synchronized safely without a UID\.$/u.exec(sSource2)))
    return fnTr('Modified record {type} cannot be synchronized safely without a UID.').replace('{type}',oMatch[1]);
  if((oMatch=/^Changing relationship members (.+) requires manual review; no changes were imported\.$/u.exec(sSource2)))
    return fnTr('Changing relationship members {id} requires manual review; no changes were imported.').replace('{id}',oMatch[1]);
  if((oMatch=/^Manually adjusted (.+) was preserved; its research record was updated\.$/u.exec(sSource2)))
    return fnTr('Manually adjusted {item} was preserved; its research record was updated.').replace('{item}',oMatch[1]);
  if((oMatch=/^Shared event (.+) also appears for another person; review it in the research records\.$/u.exec(sSource2)))
    return fnTr('Shared event {item} also appears for another person; review it in the research records.').replace('{item}',oMatch[1]);
  if((oMatch=/^Record (.+) is retained in the original file\.$/u.exec(sSource2)))
    return fnTr('Record {item} is retained in the original file.').replace('{item}',oMatch[1]);
  if((oMatch=/^Note (.+) has no recognizable Fxxxxx line; its entire text is preserved\.$/u.exec(sSource2)))
    return fnTr('Note {item} has no recognizable Fxxxxx line; its entire text is preserved.').replace('{item}',oMatch[1]);
  if((oMatch=/^Media (.+) \(([^()]*)\) is recorded; previews are available only for images\.$/u.exec(sSource2)))
    return fnTr('Media {name} ({type}) is recorded; previews are available only for images.').replace('{name}',oMatch[1]).replace('{type}',oMatch[2]);
  if(sAppLanguage.startsWith('cs'))return sSource2;
  if((oMatch=/^Ručně upravené zobrazení (.+) zůstalo zachováno; výzkumný záznam je aktualizován\.$/u.exec(sSource2)))
   return fnTr("Manually adjusted {item} was preserved; its research record was updated.").replace('{item}',oMatch[1].replace(/^události /,'event ').replace(/^osoby /,'person '));
  if((oMatch=/^Společná událost (.+) má další zobrazení u druhé osoby; ověřte je ve výzkumných údajích\.$/u.exec(sSource2)))
   return fnTr("Shared event {item} also appears for another person; review it in the research records.").replace('{item}',oMatch[1]);
  if((oMatch=/^Médium (.+) \(([^()]*)\) je evidováno; náhled je dostupný jen pro obrázky\.$/u.exec(sSource2)))
   return fnTr("Media {name} ({type}) is recorded; previews are available only for images.").replace('{name}',oMatch[1]).replace('{type}',oMatch[2]);
  if((oMatch=/^Záznam (.+) je uchován v původním souboru\.$/u.exec(sSource2)))
   return fnTr("Record {item} is retained in the original file.").replace('{item}',oMatch[1]);
  if((oMatch=/^Poznámka (.+) nemá rozpoznatelný řádek Fxxxxx; celý text je zachován\.$/u.exec(sSource2)))
   return fnTr("Note {item} has no recognizable Fxxxxx line; its entire text is preserved.").replace('{item}',oMatch[1]);
return sSource2;
};
const aServerMessagePrefixes=/* SERVER_PREFIX_START */["Chybí stabilní identifikátor. Nejprve spusťte jednorázovou migraci: ",
  "Obrázek není platný nebo nesouhlasí kontrolní součet: ","Neplatný nebo duplicitní identifikátor v tabulce ",
  "Sdílený uživatel nebo skupina již neexistuje: ","Neplatná úroveň nebo konec GEDCOM na řádku ","Nebezpečná nebo neplatná cesta souboru: ",
  "Soubor nelze přečíst pro úplnou zálohu: ","Neplatný počet nebo struktura záznamů: ","Nesouhlasí obousměrné vazby INDI/FAM u ",
  "Balíček neobsahuje odkazovaný soubor: ","Obnova by přepsala existující soubor: ","Neplatná nebo příliš dlouhá hodnota: ",
  "Dokument nemá v záloze svůj soubor: ","Chybí nebo je neplatné source_id v ","Soubor chybí nebo je příliš velký: ",
  "Záznam v2 nemá platné stabilní ID: ","Duplicitní GEDCOM identifikátor ","Duplicitní source_id v souboru: ",
  "Soubor překračuje limit 48 MiB: ","Chybí nebo je neplatná tabulka ","Chybí obousměrný odkaz FAMC u ",
  "Chybí obousměrný odkaz FAMS u ","Neplatná databázová hodnota v ","Neplatná lokální cesta média: ","Neplatné nebo duplicitní ID v ",
  "Média nelze bezpečně uložit: ","Neexistující úkol pro záznam ","Chybí místní soubor média: ","Příliš dlouhé pole osoby: ",
  "Import výzkumného deníku ","Neznámý stav FAMC.STAT: ","Neznámý typ vlastníka: ","Neplatný řádek GEDCOM ",
  "Neexistující odkaz ","Změna členů vztahu ","Neplatná hodnota: ","Neplatná tabulka: ","Neplatný odkaz na ",
  "Neplatný záznam v ","Osiřelý záznam: ","Rodné příjmení: ","Změněný záznam "]/* SERVER_PREFIX_END */;
/**
 * @brief Přeloží pouze statické textové úseky HTML, nikoliv uživatelské údaje.
 * @param {unknown} oChunk Kontextová hodnota oChunk potřebná pro daný výpočet.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnLocalizeStatic=oChunk=>oChunk.replace(/>([^<>]*)</g,/** @h05-inline
 * @brief Vytvoří náhradní text pro odpovídající část řetězce.
 * @param {unknown} oWhole Hodnota oWhole předaná callbacku.
 * @param {unknown} oRaw Hodnota oRaw předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oWhole,oRaw)=>{
 const oMatch2=/^(\s*[^\p{L}\p{N}]*)(.*?)(\s*)$/u.exec(oRaw);
 return oMatch2&&oMatch2[2]?`>${oMatch2[1]}${fnTr(oMatch2[2])}${oMatch2[3]}<`:oWhole;
}).replace(/(placeholder|title|aria-label)="([^"]*)"/g,/** @h05-inline
 * @brief Vytvoří náhradní text pro odpovídající část řetězce.
 * @param {unknown} oWhole2 Hodnota oWhole2 předaná callbacku.
 * @param {string} sAttr Hodnota sAttr předaná callbacku.
 * @param {string} sValue Hodnota sValue předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oWhole2,sAttr,sValue)=>`${sAttr}="${fnTr(sValue)}"`);
const fnLoc=fnLocalizeStatic;
/**
 * @brief Sestaví HTML ze statických fragmentů s lokalizací popisků.
 * @param {unknown[]} aParts Kolekce aParts se zpracovávanými záznamy.
 * @param {unknown[]} aValues Kolekce aValues se zpracovávanými záznamy.
 * @returns {string} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnHtml=(aParts,...aValues)=>aParts.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oPart Hodnota oPart předaná callbacku.
 * @param {number} nIndex Hodnota nIndex předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oPart,nIndex)=>fnLoc(oPart)+(nIndex<aValues.length?aValues[nIndex]:'')).join('');
const oCore=window.HcSharedAppCore;oCore.assertCompatible('0.18.8');const oLogger=oCore.logger;
const oRoot=fnValue(sAPP);if(!oRoot)throw new Error(fnTr("FamilyTree application root was not found."));
oRoot.className='hc-familytree-app hc-shared-app-core-layout';
oRoot.innerHTML=fnHtml`<div class="hc-shared-app-core-layout__content hc-familytree-shell">
 <aside id="hc-familytree-sidebar" class="hc-familytree-sidebar hc-shared-app-core-panel" aria-label="Trees"><div class="hc-familytree-brand">\
<span class="hc-familytree-logo">🌳</span><div class="hc-familytree-brand-copy"><h2>Family Tree</h2><small>v${
    fnEsc(oRoot.dataset.appVersion||'')}</small></div><button id="hc-familytree-sidebar-more" type="button" aria-label="Application menu" title="Application menu">⋯</button>\
<button id="hc-familytree-close-nav" type="button" aria-label="Close menu">×</button></div><button id="hc-familytree-new-tree" class="primary"><span aria-hidden="true">＋\
</span><span class="hc-familytree-button-label">New family tree</span></button><div id="hc-familytree-tree-list" class="hc-familytree-tree-list hc-shared-app-core-scroll-area"></div></aside>
 <main class="hc-familytree-main hc-shared-app-core-view"><header class="hc-familytree-toolbar hc-shared-app-core-layout__toolbar">\
<button id="hc-familytree-open-nav" type="button" aria-controls="hc-familytree-sidebar" aria-expanded="false" aria-label="Open menu">☰</button><div>\
<h1 id="hc-familytree-title">Select a family tree</h1><p id="hc-familytree-subtitle"></p></div>\
<output id="hc-familytree-toolbar-status" class="hc-familytree-toolbar-status" aria-live="off" hidden></output><div class="hc-familytree-actions">\
<input id="hc-familytree-search" type="search" placeholder="Search for a person"><nav id="hc-familytree-core-toolbar"></nav></div></header>\
<div id="hc-familytree-empty" class="hc-familytree-empty hc-shared-app-core-scroll-area"><span>🌱</span><h2>Create your first family tree</h2>\
<p>Your family data stays in your Nextcloud.</p></div><div id="hc-familytree-stage" class="hc-familytree-stage" hidden>\
<div id="hc-familytree-canvas-wrap" class="hc-familytree-canvas-wrap hc-shared-app-core-surface hc-shared-app-core-scroll-area"><div class="hc-familytree-pan">\
<div id="hc-familytree-canvas" class="hc-familytree-canvas"></div></div></div><div class="hc-familytree-view-controls" aria-label="Tree controls">\
<button id="hc-familytree-zoom-out" type="button" aria-label="Zoom out">−</button><button id="hc-familytree-zoom-label" type="button" title="Actual size">100 %</button>\
<button id="hc-familytree-zoom-in" type="button" aria-label="Zoom in">+</button><button id="hc-familytree-fit" type="button">Entire tree</button>\
<button id="hc-familytree-reflow" type="button" hidden>Arrange tree</button>\
<button id="hc-familytree-select" type="button" aria-pressed="false" title="Right-click to select a group; Shift-drag to move it">Select group</button></div>\
<div id="hc-familytree-tree-status" class="hc-familytree-tree-status" role="status"></div>\
<div id="hc-familytree-selection-status" class="hc-familytree-selection-status" hidden><span></span><button id="hc-familytree-clear-selection" type="button">Clear selection\
</button></div><details class="hc-familytree-legend"><summary>Relationship legend</summary><div><span class="hc-familytree-legend-line siblings"></span> Siblings</div><div>\
<span class="hc-familytree-legend-line branch"></span> Shared child-parent branch</div><div><span class="hc-familytree-legend-line parent"></span> Parent link</div><div>\
<span class="hc-familytree-legend-line partner"></span> Partnership</div><div><span class="hc-familytree-legend-line challenged"></span> Challenged parent link</div>\
<small>Hover over a line to see the people and their relationship.</small></details><div id="hc-familytree-marquee" class="hc-familytree-marquee" hidden></div></div></main>
</div><div id="hc-familytree-tree-menu" class="hc-familytree-popover hc-familytree-tree-popover" role="menu" aria-label="${fnTr("Family tree tools")
    }" hidden></div><div id="hc-familytree-sidebar-menu" class="hc-familytree-popover" hidden><button data-app-action="settings">⚙ Settings</button>\
<button data-app-action="statistics">📊 Statistics for all my trees</button><button data-app-action="import-all">⬆ Import family tree / backup</button>\
<button data-app-action="export-all">⬇ Export all my family trees</button><button data-app-action="delete-all" class="danger">🗑 Delete all my family trees</button></div>`;
/**
 * @brief Odešle autentizovaný HTTP požadavek na API FamilyTree, ověří stav odpovědi a vrátí data.
 * @param {string} sPath Textový parametr sPath předaný operaci.
 * @param {unknown} oO Volitelná nastavení HTTP požadavku (metoda, tělo, hlavičky).
 * @returns {Promise<unknown>} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnApi=async(sPath,oO={})=>{const oHeaders={requesttoken:OC.requestToken,...(oO.body instanceof FormData?{}:{'Content-Type':'application/json'}),...(oO.headers||{})};
    const oR=await fetch(OC.generateUrl('/apps/'+sAPP+sPath),{cache:'no-store',...oO,headers: oHeaders});const sText=await oR.text();let oD={};try{oD=sText?JSON.parse(sText):{}}catch(oValue){}if(!oR.ok){
    const oDetail=typeof oD.error==='string'&&oD.error.trim()?oD.error.trim():(oR.statusText?.trim()||('HTTP '+oR.status));throw Error(fnTrServer(oDetail))}return oD};
oRoot.insertAdjacentHTML('beforeend',fnLoc("<button id=\"hc-familytree-nav-backdrop\" type=\"button\" tabindex=\"-1\" aria-label=\"Close menu\" hidden></button>"));
oRoot.querySelector('.hc-familytree-legend').insertAdjacentHTML('beforeend',fnLoc("<small>The badge by a name describes parent links: ★ verified, ◇ sourced, ? unverified, ! disputed, · no parents entered.</small>"));
const hViewControls=oRoot.querySelector('.hc-familytree-view-controls');
hViewControls.id='hc-familytree-view-controls';
hViewControls.insertAdjacentHTML('afterend',
    fnLoc(("<button id=\"hc-familytree-view-toggle\" class=\"hc-familytree-view-toggle\" type=\"button\" " +
    "aria-controls=\"hc-familytree-view-controls\" aria-expanded=\"false\" aria-label=\"View controls\" " +
    "title=\"View controls\">☷</button>")));
const hLegend=oRoot.querySelector('.hc-familytree-legend');
 fnValue('hc-familytree-tree-status').hidden=true; // CZ: Přehled přesunut do lišty; výchozí zobrazení je vypnuté.
hLegend.querySelector('summary').insertAdjacentHTML('afterend',fnLoc("<button id=\"hc-familytree-legend-handle\" type=\"button\" aria-label=\"Move legend\" title=\"Move legend\">⠿</button>"));

const hNavButton=fnValue('hc-familytree-open-nav'),oSidebar=fnValue('hc-familytree-sidebar'),oBackdrop=fnValue('hc-familytree-nav-backdrop');
//*****************************************************************************
/**
 * @brief Nastaví nav open v uživatelském rozhraní FamilyTree.
 * @param {boolean} bOpen Vstupní hodnota open; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function setNavOpen(bOpen) { oSidebar.classList.toggle('is-open', bOpen); oBackdrop.hidden = !bOpen; hNavButton.setAttribute('aria-expanded', String(bOpen)); if (bOpen)
    fnValue('hc-familytree-close-nav').focus();
else
    hNavButton.focus(); }
hNavButton.onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>setNavOpen(true);fnValue('hc-familytree-close-nav').onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>setNavOpen(false);oBackdrop.onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>setNavOpen(false);
oRoot.addEventListener('keydown',/** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @param {unknown} oE Hodnota oE předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
oE=>{if(oE.key==='Escape'&&oSidebar.classList.contains('is-open')){oE.preventDefault();setNavOpen(false)}});
let aTrees=[],oState=null,nCurrent=0,bSelected=null,oToolbarController=null,bSelectionMode=false;
const oSelectedIds=new Set();
const oLayoutHistory=new Map();let bLayoutBusy=false;
//*****************************************************************************
/**
 * @brief Zpracuje signature v uživatelském rozhraní FamilyTree.
 * @param {object} oTreeState Vstupní hodnota treeState; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function layoutSignature(oTreeState) {
    return [oTreeState.tree.root_person_id,
        oTreeState.people.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oPerson Hodnota oPerson předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oPerson => +oPerson.id).sort(/** @h05-inline
 * @brief Porovná dvě položky pro určení jejich pořadí.
 * @param {unknown} oA Hodnota oA předaná callbacku.
 * @param {unknown} oB Hodnota oB předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oA, oB) => oA - oB).join(','),
        oTreeState.relationships.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oRelation Hodnota oRelation předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oRelation => [oRelation.id, oRelation.type, oRelation.person1_id, oRelation.person2_id].join(':')).sort().join(',')].join('|');
}
//*****************************************************************************
/**
 * @brief Zpracuje historii for v uživatelském rozhraní FamilyTree.
 * @param {number} nTreeId Vstupní hodnota treeId; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {object} oTreeState2 Vstupní hodnota treeState; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function layoutHistoryFor(nTreeId, oTreeState2) {
    if (!oTreeState2)
        return null;
    const oSignature = layoutSignature(oTreeState2);
    let oHistory = oLayoutHistory.get(nTreeId);
    if (!oHistory || oHistory.signature !== oSignature) {
        oHistory = { signature: oSignature, undo: [], redo: [] };
        oLayoutHistory.set(nTreeId, oHistory);
    }
    return oHistory;
}
//*****************************************************************************
/**
 * @brief Vrátí aktuální rozložení historii v uživatelském rozhraní FamilyTree.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function currentLayoutHistory() { return layoutHistoryFor(nCurrent, oState); }
//*****************************************************************************
/**
 * @brief Aktualizuje historii buttons v uživatelském rozhraní FamilyTree.
 * @returns {void} Funkce nevrací hodnotu.
 */
function updateHistoryButtons(){
 const oHistory2=currentLayoutHistory(),bEditable=!!oState?.canEdit&&!bLayoutBusy;
 const hUndo=oRoot.querySelector('[data-action="undo-layout"]'),hRedo=oRoot.querySelector('[data-action="redo-layout"]');
 if(hUndo)hUndo.disabled=!bEditable||!oHistory2?.undo.length;
 if(hRedo)hRedo.disabled=!bEditable||!oHistory2?.redo.length;
}
//*****************************************************************************
/**
 * @brief Zaznamená rozložení change v uživatelském rozhraní FamilyTree.
 * @param {unknown} oBefore Vstupní hodnota before; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {unknown} oAfter Vstupní hodnota after; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {number} nTreeId2 Vstupní hodnota treeId; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {object} oTreeState3 Vstupní hodnota treeState; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function recordLayoutChange(oBefore, oAfter, nTreeId2 = nCurrent, oTreeState3 = oState) {
    if (!oBefore.length)
        return;
    const oHistory3 = layoutHistoryFor(nTreeId2, oTreeState3);
    if (!oHistory3)
        return;
    oHistory3.undo.push({ before: oBefore, after: oAfter });
    if (oHistory3.undo.length > 50)
        oHistory3.undo.shift();
    oHistory3.redo.length = 0;
    updateHistoryButtons();
}
//*****************************************************************************
/**
 * @brief Zpracuje rozložení positions v uživatelském rozhraní FamilyTree.
 * @param {Array<unknown>} aPositions Vstupní hodnota positions; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {number} nTreeId3 Vstupní hodnota treeId; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {Promise<unknown>} Hodnota použitá volající částí rozhraní.
 */
async function persistLayoutPositions(aPositions, nTreeId3 = nCurrent) {
    if (aPositions.length === 1)
        await fnApi('/api/people/' + aPositions[0].id + '/position', { method: 'PUT', body: JSON.stringify(aPositions[0]) });
    else if (aPositions.length > 1)
        await fnApi('/api/trees/' + nTreeId3 + '/positions', { method: 'POST', body: JSON.stringify({ positions: aPositions }) });
}
//*****************************************************************************
/**
 * @brief Zpracuje rozložení historii v uživatelském rozhraní FamilyTree.
 * @param {unknown} oDirection Vstupní hodnota direction; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {Promise<unknown>} Hodnota použitá volající částí rozhraní.
 */
async function travelLayoutHistory(oDirection) {
    if (!oState?.canEdit || bLayoutBusy)
        return;
    const oHistory4 = currentLayoutHistory(), oFrom = oDirection === 'undo' ? oHistory4.undo : oHistory4.redo;
    if (!oFrom.length)
        return;
    const oChange = oFrom.at(-1), oExpected = oDirection === 'undo' ? oChange.after : oChange.before, oPositions = oDirection === 'undo' ? oChange.before : oChange.after;
    if (oExpected.some(/** @h05-inline
 * @brief Ověří, zda prvek kolekce vyhovuje požadované podmínce.
 * @param {unknown} oItem Hodnota oItem předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oItem => { const oPerson2 = byId(oItem.id); return !oPerson2 || (+oPerson2.layout_x || 0) !== oItem.x || (+oPerson2.layout_y || 0) !== oItem.y; })) {
        oHistory4.undo.length = 0;
        oHistory4.redo.length = 0;
        updateHistoryButtons();
        fnToast(fnTr("Card positions have changed. Reload the tree."), 'warning');
        return;
    }
    const nTreeAtStart = nCurrent, oTreeState4 = oState;
    bLayoutBusy = true;
    updateHistoryButtons();
    try {
        await persistLayoutPositions(oPositions, nTreeAtStart);
        for (const oItem2 of oPositions) {
            const oPerson3 = oTreeState4.people.find(/** @h05-inline
 * @brief Vyhledá první záznam splňující danou podmínku.
 * @param {string} sValue2 Hodnota sValue2 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sValue2 => +sValue2.id === oItem2.id);
            oPerson3.layout_x = oItem2.x;
            oPerson3.layout_y = oItem2.y;
        }
        oFrom.pop();
        (oDirection === 'undo' ? oHistory4.redo : oHistory4.undo).push(oChange);
        if (nCurrent === nTreeAtStart) {
            if (oState === oTreeState4)
                render();
            else
                await selectTree(nTreeAtStart);
        }
    }
    catch (oError2) {
        fnToast(fnTr("Could not restore card positions: ") + oError2.message, 'error');
    }
    finally {
        bLayoutBusy = false;
        updateHistoryButtons();
    }
}
document.addEventListener('keydown',/** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @param {unknown} oEvent Hodnota oEvent předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
oEvent=>{
 if(!(oEvent.ctrlKey||oEvent.metaKey)||oEvent.altKey||!oState?.canEdit||oDialogController)return;
 const oTarget=oEvent.target;
 if(oTarget!==document.body&&!oRoot.contains(oTarget))return;
 if(oTarget.closest?.('input, textarea, select, [contenteditable], [role="textbox"]'))return;
 const sKey3=oEvent.key.toLowerCase(),oDirection2=sKey3==='z'?(oEvent.shiftKey?'redo':'undo'):sKey3==='y'&&!oEvent.shiftKey?'redo':null;
 if(oDirection2&&!bLayoutBusy&&(oDirection2==='undo'?currentLayoutHistory().undo:currentLayoutHistory().redo).length){
  oEvent.preventDefault();void travelLayoutHistory(oDirection2);
 }
});
/**
 * @brief Vytvoří seznam dostupných akcí v liště aplikace.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnToolbarActions=()=>[
 {id:"add-person",label:fnTr("Add person"),icon:"＋",variant:"primary",hidden:!oState?.canEdit,onClick:/** @h05-inline
 * @brief Provede vloženou callback operaci ve zpracovávaném rodokmenu.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>personForm(null)},
 {id:"home",label:fnTr("Home"),icon:"⌂",compact:true,hidden:!oState,onClick:/** @h05-inline
 * @brief Provede vloženou callback operaci ve zpracovávaném rodokmenu.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>resetTreeView()},
 {id:"zoom-out",label:fnTr("Zoom out"),icon:"−",title:fnTr("Zoom out"),compact:true,hidden:!oState,onClick:/** @h05-inline
 * @brief Provede vloženou callback operaci ve zpracovávaném rodokmenu.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>{const hR=oTreeView.getBoundingClientRect();zoomTree(nTreeZoom/1.25,hR.left+hR.width/2,hR.top+hR.height/2)}},
 {id:"zoom-label",label:Math.round(nTreeZoom*100)+' %',compact:true,hidden:!oState,onClick:/** @h05-inline
 * @brief Provede vloženou callback operaci ve zpracovávaném rodokmenu.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>resetTreeView()},
 {id:"zoom-in",label:fnTr("Zoom in"),icon:"＋",compact:true,hidden:!oState,onClick:/** @h05-inline
 * @brief Provede vloženou callback operaci ve zpracovávaném rodokmenu.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>{const hR2=oTreeView.getBoundingClientRect();zoomTree(nTreeZoom*1.25,hR2.left+hR2.width/2,hR2.top+hR2.height/2)}},
 {id:"reflow",label:fnTr("Arrange tree"),icon:"↺",compact:true,hidden:!oState?.canEdit,onClick:/** @h05-inline
 * @brief Provede vloženou callback operaci ve zpracovávaném rodokmenu.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>reflowTree()},
 {id:"fit",label:fnTr("Entire tree"),icon:"⌗",compact:true,hidden:!oState,onClick:/** @h05-inline
 * @brief Provede vloženou callback operaci ve zpracovávaném rodokmenu.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>fitTree()},
 {id:"select",label:fnTr("Select group"),icon:"⬚",compact:true,hidden:!oState,onClick:/** @h05-inline
 * @brief Provede vloženou callback operaci ve zpracovávaném rodokmenu.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>toggleSelectionMode()},
];
// Běžné úspěšné uložení proběhne tiše. Oznámení je vyhrazené pro chybu, varování nebo výsledek dlouhé operace.
/**
 * @brief Zobrazí uživatelské upozornění s odpovídající úrovní závažnosti.
 * @param {string} sMessage Textový parametr sMessage předaný operaci.
 * @param {string} sType Textový parametr sType předaný operaci.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnToast=(sMessage,sType='success')=>{if(sType==='success')return null;sMessage=fnTrServer(sMessage);const fnNotify=oCore.notifications[sType]||oCore.notifications.info;
    return fnNotify.call(oCore.notifications,sMessage,{dedupeKey:'hc_familytree:'+sType+':'+sMessage,cooldownMs:1800})};
/**
 * @brief Převede data formuláře na jednoduchou mapu hodnot.
 * @param {unknown} oF Kontextová hodnota oF potřebná pro daný výpočet.
 * @returns {FormData} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnFormData=oF=>Object.fromEntries(new FormData(oF).entries());
let oDialogController=null,oAboutController=null,fnModalCleanup=null;
//*****************************************************************************
/**
 * @brief Zpracuje dialog v uživatelském rozhraní FamilyTree.
 * @returns {void} Funkce nevrací hodnotu.
 */
function cleanupModal() { fnModalCleanup?.(); fnModalCleanup = null; if (oAboutController) {
    oAboutController.destroy();
    oAboutController = null;
} }
//*****************************************************************************
/**
 * @brief Otevře dialog v uživatelském rozhraní FamilyTree.
 * @param {string} sTitle Vstupní hodnota sTitle; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {string} sHtml Vstupní hodnota sHtml; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function openModal(sTitle, sHtml) { if (oDialogController)
    oDialogController.close('replace'); cleanupModal(); const oBody = document.createElement('div'); oBody.id = 'hc-familytree-modal-body';
     oBody.className = 'hc-familytree-core-dialog-body'; oBody.innerHTML = sHtml; oDialogController = oCore.dialogs.open({ title: sTitle, content: oBody, size: 'large',
     closeLabel: fnTr("Close") }); const oOpened = oDialogController; oOpened.closed.then(/** @h05-inline
 * @brief Zpracuje úspěšné dokončení asynchronního požadavku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
() => { if (oDialogController === oOpened) {
    cleanupModal();
    oDialogController = null;
} }); return oBody; }
//*****************************************************************************
/**
 * @brief Zavře dialog v uživatelském rozhraní FamilyTree.
 * @returns {void} Funkce nevrací hodnotu.
 */
function closeModal() { cleanupModal(); oDialogController?.close('application'); oDialogController = null; }
/**
 * @brief Otevře potvrzovací dialog prostřednictvím Shared App Core.
 * @param {unknown} oOptions Kontextová hodnota oOptions potřebná pro daný výpočet.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnConfirmDialog=oOptions=>oCore.dialogs.confirm(oOptions);
oCore.about.register({id:sAPP,name:fnTr("Family Tree"),version:oRoot.dataset.appVersion,repository:'https://github.com/hacesoft/familytree',
    releaseNotes:'https://github.com/hacesoft/familytree/releases',documentation:'https://github.com/hacesoft/familytree#readme',core:'>=0.18.8'});
//*****************************************************************************
/**
 * @brief Popíše rodokmen item v uživatelském rozhraní FamilyTree.
 * @param {object} oTree Vstupní hodnota tree; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function describeTreeItem(oTree) { const aBits = []; if (oTree.description)
    aBits.push(fnEsc(oTree.description)); aBits.push((+oTree.people_count || 0) + ' ' + fnTr("people")); if (!oTree.canEdit)
    aBits.push(fnTr("read-only")); return aBits.join(' · '); }
// One compact three-dot action launcher per tree. The popup is rendered outside the scrolling sidebar.
//*****************************************************************************
/**
 * @brief Zpracuje action nabídku v uživatelském rozhraní FamilyTree.
 * @param {object} oTree2 Vstupní hodnota tree; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function treeActionMenu(oTree2){
 const bCanEdit=!!oTree2.canEdit,bOwner=!!oTree2.isOwner;
 return [
  bCanEdit?'<button type="button" role="menuitem" data-tree-tool="edit">✏️ '+fnTr("Edit family tree")+'</button>':'',
  bOwner?'<button type="button" role="menuitem" data-tree-tool="share">👥 '+fnTr("Shares")+'</button>':'',
  bCanEdit?'<button type="button" role="menuitem" data-tree-tool="import">⬆ '+fnTr("Import into this family tree")+'</button>':'',
  '<button type="button" role="menuitem" data-tree-tool="export">⬇ '+fnTr("Export this family tree")+'</button>',
  '<button type="button" role="menuitem" data-tree-tool="research">🔎 '+fnTr("Research records")+'</button>',
  '<button type="button" role="menuitem" data-tree-tool="journal">📖 '+fnTr("Research journal")+'</button>',
  '<button type="button" role="menuitem" data-tree-tool="statistics">📊 '+fnTr("Tree statistics")+'</button>',
  bCanEdit?'<button type="button" role="menuitem" data-tree-tool="reflow">↺ '+fnTr("Arrange tree")+'</button>':'',
  bOwner?'<button type="button" role="menuitem" data-tree-tool="delete" class="danger">🗑 '+fnTr("Delete family tree")+'</button>':'',
 ].join('');
}
//*****************************************************************************
/**
 * @brief Načte rodokmeny v uživatelském rozhraní FamilyTree.
 * @returns {Promise<unknown>} Hodnota použitá volající částí rozhraní.
 */
async function loadTrees() { aTrees = await fnApi('/api/trees'); fnValue('hc-familytree-tree-menu').hidden = true; fnValue('hc-familytree-tree-list').innerHTML = aTrees.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oT Hodnota oT předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oT => 
    fnHtml `<section class="hc-familytree-tree-item ${+oT.id === nCurrent ? 'active' : ''}" data-tree-wrap="${oT.id}"><button type="button" data-tree="${oT.id}" class="hc-familytree-tree-main ${
    +oT.id === nCurrent ? 'active' : ''}" title="${fnTr("Double-click to open the research journal")}"><span>🌳</span><span><strong>${fnEsc(oT.name)}</strong><small>${describeTreeItem(oT)
    }</small></span></button><button type="button" class="hc-familytree-tree-more" data-tree-menu-toggle="${oT.id}" aria-label="${fnTr("Family tree tools")}: ${fnEsc(oT.name)
    }" aria-haspopup="menu" aria-expanded="false" title="${fnTr("Family tree tools")}: ${fnEsc(oT.name)}">⋯</button>\
</section>`).join(''); fnValue('hc-familytree-empty').hidden = aTrees.length > 0; if (!nCurrent && aTrees[0])
    await selectTree(+aTrees[0].id); }
//*****************************************************************************
/**
 * @brief Vybere rodokmen v uživatelském rozhraní FamilyTree.
 * @param {number} nId Vstupní hodnota id; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {Promise<unknown>} Hodnota použitá volající částí rozhraní.
 */
async function selectTree(nId) { const bFirstOrDifferent = !oState || nCurrent !== nId; nCurrent = nId; oState = await fnApi('/api/trees/' + nId); bSelected = null; oSelectedIds.clear(); if (bFirstOrDifferent) {
    nTreeZoom = 1;
    nTreePanX = 0;
    nTreePanY = 0;
    bMobileViewMenuOpen = false;
    applyTreeScale();
    positionTree();
} render(); if (bFirstOrDifferent)
    requestAnimationFrame(/** @h05-inline
 * @brief Aktualizuje vykreslení při následujícím obnovovacím snímku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
() => { if (isTouchTree())
        focusMobileTree();
    else
        fitTree(); }); if (oSidebar.classList.contains('is-open'))
    setNavOpen(false); await loadTrees(); }
//*****************************************************************************
/**
 * @brief Vyhledá id v uživatelském rozhraní FamilyTree.
 * @param {number} nId2 Vstupní hodnota id; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function byId(nId2) { return oState?.people.find(/** @h05-inline
 * @brief Vyhledá první záznam splňující danou podmínku.
 * @param {unknown} oP Hodnota oP předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oP => +oP.id === +nId2); }
//*****************************************************************************
/**
 * @brief Zpracuje rows v uživatelském rozhraní FamilyTree.
 * @param {string} sType2 Vstupní hodnota type; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function researchRows(sType2) { return (oState?.research || []).filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oR2 Hodnota oR2 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oR2 => oR2.entity_type === sType2); }
//*****************************************************************************
/**
 * @brief Zpracuje osobu ids v uživatelském rozhraní FamilyTree.
 * @param {number} nId3 Vstupní hodnota id; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function importedPersonIds(nId3) { return new Set(researchRows('persons').filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oR3 Hodnota oR3 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oR3 => +oR3.native_id === +nId3).map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR4 Hodnota oR4 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR4 => oR4.origin_key + '/' + oR4.external_id)); }
//*****************************************************************************
/**
 * @brief Zpracuje média url v uživatelském rozhraní FamilyTree.
 * @param {number} nId4 Vstupní hodnota id; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function researchMediaUrl(nId4) { return OC.generateUrl('/apps/' + sAPP + '/api/research/media/' + nId4); }
//*****************************************************************************
/**
 * @brief Zpracuje photo v uživatelském rozhraní FamilyTree.
 * @param {unknown} oP2 Vstupní hodnota p; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function importedPhoto(oP2) { const aIds = importedPersonIds(oP2.id); return researchRows('media').find(/** @h05-inline
 * @brief Vyhledá první záznam splňující danou podmínku.
 * @param {unknown} oR5 Hodnota oR5 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR5 => 
    oR5.media_path && aIds.has(oR5.origin_key + '/' + oR5.data.linked_entity_id) && /^(person_photo|portrait|photograph)$/.test(oR5.data.media_type || '')); }
//*****************************************************************************
/**
 * @brief Zpracuje links v uživatelském rozhraní FamilyTree.
 * @param {number} nId5 Vstupní hodnota id; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function docLinks(nId5) { return (oState.documentLinks || []).filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {number} nX Hodnota nX předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
nX => +nX.document_id === +nId5); }
//*****************************************************************************
/**
 * @brief Zpracuje for v uživatelském rozhraní FamilyTree.
 * @param {string} sType3 Vstupní hodnota type; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {number} nId6 Vstupní hodnota id; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function docsFor(sType3, nId6) { const aIds2 = new Set((oState.documentLinks || []).filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {number} nX2 Hodnota nX2 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
nX2 => nX2.link_type === sType3 && +nX2.target_id === +nId6).map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {number} nX3 Hodnota nX3 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
nX3 => +nX3.document_id)); return oState.documents.filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {number} nX4 Hodnota nX4 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
nX4 => aIds2.has(+nX4.id)); }
//*****************************************************************************
/**
 * @brief Zpracuje url v uživatelském rozhraní FamilyTree.
 * @param {string} sPath2 Vstupní hodnota path; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function fileUrl(sPath2) { let sClean = String(sPath2 || ''); while (sClean.startsWith('/'))
    sClean = sClean.slice(1); const aParts2 = sClean.split('/'), sFile = aParts2.pop() || '', sDir = '/' + aParts2.join('/'); return OC.generateUrl('/apps/files/?dir={dir}&openfile={file}', { dir: sDir, file: sFile }); }
//*****************************************************************************
/**
 * @brief Zpracuje name v uživatelském rozhraní FamilyTree.
 * @param {unknown} oR6 Vstupní hodnota r; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function relationName(oR6) { const oA2 = byId(oR6.person1_id), oB2 = byId(oR6.person2_id); return (oA2 ? oA2.given_name + ' ' + oA2.surname : '') + ' — ' + (oB2 ? oB2.given_name + ' ' + oB2.surname : ''); }
//*****************************************************************************
/**
 * @brief Vrátí interval let narození a úmrtí osoby pro stručnou vizitku.
 * @param {unknown} oP3 Vstupní hodnota p; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function years(oP3) { /**
 * @brief Získá ze zadané datumové hodnoty rok pro přehled života osoby.
 * @param {unknown} oS4 Datum, z něhož se má získat čtyřciferný rok.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnY = oS4 => oS4 ? String(oS4).match(/\d{4}/)?.[0] || oS4 : ''; return [fnY(oP3.birth_date), fnY(oP3.death_date)].filter(Boolean).join('–'); }
//*****************************************************************************
/**
 * @brief Zpracuje důkaz v uživatelském rozhraní FamilyTree.
 * @param {number} nId7 Vstupní hodnota id; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function relationshipEvidence(nId7) {
    const aParents = oState.relationships.filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oRelation2 Hodnota oRelation2 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oRelation2 => oRelation2.type === 'parent' && +oRelation2.person2_id === +nId7);
    if (!aParents.length)
        return { kind: 'none', symbol: '·', label: fnTr("No parents are entered in this tree") };
    const aStatus = aParents.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oRelation3 Hodnota oRelation3 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oRelation3 => {
        const aRecords = researchRows('relationships').filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oRow Hodnota oRow předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oRow => +oRow.native_id === +oRelation3.id && !oRow.data.absent_in_current_file);
        if (!aRecords.length)
            return 'unverified';
        const aValues2 = aRecords.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oRow2 Hodnota oRow2 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oRow2 => String(oRow2.data.verification_status || 'unverified').toLowerCase());
        if (aValues2.some(/** @h05-inline
 * @brief Ověří, zda prvek kolekce vyhovuje požadované podmínce.
 * @param {string} sValue3 Hodnota sValue3 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
sValue3 => ['challenged', 'disproven', 'conflict'].some(/** @h05-inline
 * @brief Ověří, zda prvek kolekce vyhovuje požadované podmínce.
 * @param {string} sWord Hodnota sWord předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
sWord => sValue3.includes(sWord))))
            return 'challenged';
        if (aValues2.every(/** @h05-inline
 * @brief Ověří podmínku pro jednotlivý prvek kontrolované kolekce.
 * @param {string} sValue4 Hodnota sValue4 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
sValue4 => sValue4 === 'proven' || sValue4.startsWith('confirmed_primary')))
            return 'verified';
        if (aRecords.every(/** @h05-inline
 * @brief Ověří podmínku pro jednotlivý prvek kontrolované kolekce.
 * @param {unknown} oRow3 Hodnota oRow3 předaná callbacku.
 * @param {number} nIndex2 Hodnota nIndex2 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
(oRow3, nIndex2) => aValues2[nIndex2] === 'proven' || aValues2[nIndex2].startsWith('confirmed_primary') ||
            (!!oRow3.data.source_id && (aValues2[nIndex2].startsWith('confirmed_') || aValues2[nIndex2] === 'cited'))))
            return 'cited';
        return 'unverified';
    });
    if (aStatus.includes('challenged'))
        return { kind: 'challenged', symbol: '!', label: fnTr("Parent link is disputed") };
    if (aStatus.every(/** @h05-inline
 * @brief Ověří podmínku pro jednotlivý prvek kontrolované kolekce.
 * @param {string} sValue5 Hodnota sValue5 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
sValue5 => sValue5 === 'verified'))
        return { kind: 'verified', symbol: '★', label: fnTr("All displayed parent links are verified") };
    if (aStatus.every(/** @h05-inline
 * @brief Ověří podmínku pro jednotlivý prvek kontrolované kolekce.
 * @param {string} sValue6 Hodnota sValue6 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
sValue6 => sValue6 === 'verified' || sValue6 === 'cited'))
        return { kind: 'cited', symbol: '◇', label: fnTr("Parent links have sources, but are not all verified") };
    return { kind: 'unverified', symbol: '?', label: fnTr("Parent link is unverified") };
}
//*****************************************************************************
/**
 * @brief Zpracuje kartu v uživatelském rozhraní FamilyTree.
 * @param {unknown} oP4 Vstupní hodnota p; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {number} nX5 Vstupní hodnota x; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {number} nY Vstupní hodnota y; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function card(oP4, nX5, nY) {
    const oImported = importedPhoto(oP4), oPhoto = oP4.photo_url ? fnHtml `<img src="${fnEsc(oP4.photo_url)}" alt="">` : oImported ? fnHtml `<img src="${fnEsc(researchMediaUrl(oImported.id))
    }" alt="">` : fnHtml `<span class="hc-familytree-avatar">${oP4.gender === 'female' ? '👩' : oP4.gender === 'male' ? '👨' : '👤'}</span>`;
    const nDx = Number.isFinite(+oP4.layout_x) ? +oP4.layout_x : 0, nDy = Number.isFinite(+oP4.layout_y) ? +oP4.layout_y : 0, oEvidence = relationshipEvidence(oP4.id);
    return fnHtml `<button class="hc-familytree-person ${+oP4.id === +oState.tree.root_person_id ? 'root' : ''} ${oSelectedIds.has(+oP4.id) ? 'selected' : ''}" data-person="${oP4.id}" style="left:${
    Math.round(nX5)}px;top:${Math.round(nY)}px;--hc-familytree-dx:${nDx}px;--hc-familytree-dy:${nDy}px" title="${oState.canEdit ? fnTr("Drag to reposition") : ''}">${oPhoto
    }<span class="hc-familytree-person-info"><span class="hc-familytree-person-title"><strong>${fnEsc((oP4.given_name + ' ' + oP4.surname).trim())
    }</strong><span class="hc-familytree-evidence-badge ${oEvidence.kind}" role="img" aria-label="${fnEsc(oEvidence.label)}" title="${fnEsc(oEvidence.label)}">${oEvidence.symbol
    }</span></span><small>${fnEsc(years(oP4) || oP4.birth_place || '')}</small></span></button>`;
}
//*****************************************************************************
/**
 * @brief Zpracuje path v uživatelském rozhraní FamilyTree.
 * @param {unknown} oA3 Vstupní hodnota a; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {unknown} oB3 Vstupní hodnota b; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {string} sType4 Vstupní hodnota type; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function connectionPath(oA3, oB3, sType4) {
    const nDx2 = oB3.cx - oA3.cx, nDy2 = oB3.cy - oA3.cy;
    const bHorizontal = sType4 === 'partner' ? Math.abs(nDx2) >= Math.abs(nDy2) : Math.abs(nDx2) > Math.max(120, Math.abs(nDy2) * 1.5);
    if (bHorizontal) {
        const bRight = nDx2 >= 0, oStartX = bRight ? oA3.right : oA3.left, oEndX = bRight ? oB3.left : oB3.right;
        if (Math.abs(nDy2) < 1)
            return `M ${oStartX} ${oA3.cy} H ${oEndX}`;
        const nMiddle = (oStartX + oEndX) / 2;
        return `M ${oStartX} ${oA3.cy} H ${nMiddle} V ${oB3.cy} H ${oEndX}`;
    }
    const bDown = nDy2 >= 0, oStartY = bDown ? oA3.bottom : oA3.top, oEndY = bDown ? oB3.top : oB3.bottom, nMidY = (oStartY + oEndY) / 2;
    return `M ${oA3.cx} ${oStartY} V ${nMidY} H ${oB3.cx} V ${oEndY}`;
}
//*****************************************************************************
/**
 * @brief Zpracuje label v uživatelském rozhraní FamilyTree.
 * @param {number} nId8 Vstupní hodnota id; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function relationshipLabel(nId8) { const oPerson4 = byId(nId8); return oPerson4 ? (oPerson4.given_name + ' ' + oPerson4.surname).trim() : fnTr("Unknown person"); }
//*****************************************************************************
/**
 * @brief Zpracuje odkaz v uživatelském rozhraní FamilyTree.
 * @param {string} sPath3 Vstupní hodnota path; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {string} sKind Vstupní hodnota kind; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {string} sLabel Vstupní hodnota label; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {unknown} oExtra Vstupní hodnota extra; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function svgLink(sPath3, sKind, sLabel, oExtra = '') {
    return fnHtml `<g class="hc-familytree-link ${sKind} ${oExtra}"><path class="hc-familytree-link-line" d="${sPath3}"/><path class="hc-familytree-link-hit" d="${sPath3
    }" tabindex="0" role="img" aria-label="${fnEsc(sLabel)}"><title>${fnEsc(sLabel)}</title></path></g>`;
}
//*****************************************************************************
/**
 * @brief Zpracuje connections v uživatelském rozhraní FamilyTree.
 * @param {unknown} aPoints Vstupní hodnota points; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function familyConnections(aPoints) {
    const oByChild = new Map(), aPartners = [];
    for (const oRelation4 of oState.relationships) {
        const nA = +oRelation4.person1_id, nB = +oRelation4.person2_id;
        if (!aPoints.has(String(nA)) || !aPoints.has(String(nB)))
            continue;
        if (oRelation4.type === 'parent') {
            if (!oByChild.has(nB))
                oByChild.set(nB, new Map());
            oByChild.get(nB).set(nA, oRelation4);
        }
        else if (oRelation4.type === 'partner')
            aPartners.push(oRelation4);
    }
    const oFamilies = new Map();
    for (const [oChild, oParentRows] of oByChild) {
        const aParents2 = [...oParentRows.keys()].sort(/** @h05-inline
 * @brief Porovná dvě položky pro určení jejich pořadí.
 * @param {unknown} oA4 Hodnota oA4 předaná callbacku.
 * @param {unknown} oB4 Hodnota oB4 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oA4, oB4) => oA4 - oB4), sKey4 = aParents2.join('|');
        if (!oFamilies.has(sKey4))
            oFamilies.set(sKey4, { parents: aParents2, children: [], relations: new Map() });
        const oFamily = oFamilies.get(sKey4);
        oFamily.children.push(oChild);
        for (const [sId2, oRelation5] of oParentRows)
            oFamily.relations.set(sId2 + '|' + oChild, oRelation5);
    }
    // Overlapping family intervals on the same generation get distinct rails.
    // This keeps horizontal and vertical links from merging into a false union.
    const aRoutes = [...oFamilies.values()].map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oFamily2 Hodnota oFamily2 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oFamily2 => {
        const aChildren = oFamily2.children.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {string} sId3 Hodnota sId3 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sId3 => aPoints.get(String(sId3))).sort(/** @h05-inline
 * @brief Porovná dvě položky pro určení jejich pořadí.
 * @param {unknown} oA5 Hodnota oA5 předaná callbacku.
 * @param {unknown} oB5 Hodnota oB5 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oA5, oB5) => oA5.cx - oB5.cx);
        const aParents3 = oFamily2.parents.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {string} sId4 Hodnota sId4 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sId4 => aPoints.get(String(sId4))).sort(/** @h05-inline
 * @brief Porovná dvě položky pro určení jejich pořadí.
 * @param {unknown} oA6 Hodnota oA6 předaná callbacku.
 * @param {unknown} oB6 Hodnota oB6 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oA6, oB6) => oA6.cx - oB6.cx);
        const aAll = [...aChildren, ...aParents3];
        return { family: oFamily2, children: aChildren, parents: aParents3, row: Math.round(aChildren[0].top / 80),
            lo: Math.min(...aAll.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oPoint Hodnota oPoint předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oPoint => oPoint.cx)), hi: Math.max(...aAll.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oPoint2 Hodnota oPoint2 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oPoint2 => oPoint2.cx)), lane: 0 };
    }).sort(/** @h05-inline
 * @brief Porovná dvě položky pro určení jejich pořadí.
 * @param {unknown} oA7 Hodnota oA7 předaná callbacku.
 * @param {unknown} oB7 Hodnota oB7 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oA7, oB7) => oA7.row - oB7.row || oA7.lo - oB7.lo);
    const oRails = new Map();
    for (const oRoute of aRoutes) {
        const oLanes = oRails.get(oRoute.row) || [];
        while (oLanes[oRoute.lane]?.some(/** @h05-inline
 * @brief Ověří, zda prvek kolekce vyhovuje požadované podmínce.
 * @param {unknown} oOther Hodnota oOther předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oOther => oRoute.lo <= oOther.hi + 28 && oRoute.hi >= oOther.lo - 28))
            oRoute.lane++;
        (oLanes[oRoute.lane] ??= []).push(oRoute);
        oRails.set(oRoute.row, oLanes);
    }
    const oParentUses = new Map();
    for (const oRoute2 of aRoutes) {
        oRoute2.parentOffsets = new Map();
        for (const sId5 of oRoute2.family.parents) {
            if (!oParentUses.has(sId5))
                oParentUses.set(sId5, []);
            oParentUses.get(sId5).push(oRoute2);
        }
    }
    for (const [sId6, oUses] of oParentUses) {
        oUses.sort(/** @h05-inline
 * @brief Porovná dvě položky pro určení jejich pořadí.
 * @param {unknown} oA8 Hodnota oA8 předaná callbacku.
 * @param {unknown} oB8 Hodnota oB8 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oA8, oB8) => oA8.children.reduce(/** @h05-inline
 * @brief Aktualizuje akumulátor podle dalšího prvku kolekce.
 * @param {unknown} oSum Hodnota oSum předaná callbacku.
 * @param {unknown} oPoint3 Hodnota oPoint3 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oSum, oPoint3) => oSum + oPoint3.cx, 0) / oA8.children.length -
            oB8.children.reduce(/** @h05-inline
 * @brief Aktualizuje akumulátor podle dalšího prvku kolekce.
 * @param {unknown} oSum2 Hodnota oSum2 předaná callbacku.
 * @param {unknown} oPoint4 Hodnota oPoint4 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oSum2, oPoint4) => oSum2 + oPoint4.cx, 0) / oB8.children.length);
        oUses.forEach(/** @h05-inline
 * @brief Zpracuje jeden prvek kolekce při průchodu záznamy.
 * @param {unknown} oRoute3 Hodnota oRoute3 předaná callbacku.
 * @param {number} nIndex3 Hodnota nIndex3 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
(oRoute3, nIndex3) => oRoute3.parentOffsets.set(sId6, (nIndex3 - (oUses.length - 1) / 2) * 18));
    }
    let sMarkup = '';
    for (const { family: oFamily3, children: aChildren2, parents: aParents4, lane: nLane, parentOffsets: oParentOffsets } of aRoutes) {
        const sParentNames = oFamily3.parents.map(relationshipLabel).join(' + ');
        const sChildNames = oFamily3.children.map(relationshipLabel).join(', ');
        const bChildrenAbove = Math.max(...aChildren2.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oP5 Hodnota oP5 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oP5 => oP5.cy)) < Math.min(...aParents4.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oP6 Hodnota oP6 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oP6 => oP6.cy));
        const nRailOffset = nLane * 18;
        const nChildY = bChildrenAbove ? Math.max(...aChildren2.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oP7 Hodnota oP7 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oP7 => oP7.bottom)) + 28 + nRailOffset : Math.min(...aChildren2.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oP8 Hodnota oP8 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oP8 => oP8.top)) - 28 - nRailOffset;
        const nParentY = bChildrenAbove ? Math.min(...aParents4.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oP9 Hodnota oP9 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oP9 => oP9.top)) - 28 - nRailOffset : Math.max(...aParents4.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oP10 Hodnota oP10 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oP10 => oP10.bottom)) + 28 + nRailOffset;
        const nChildCenter = (aChildren2[0].cx + aChildren2.at(-1).cx) / 2;
        const aParentAnchors = oFamily3.parents.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {string} sId7 Hodnota sId7 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sId7 => aPoints.get(String(sId7)).cx + (oParentOffsets.get(sId7) || 0)).sort(/** @h05-inline
 * @brief Porovná dvě položky pro určení jejich pořadí.
 * @param {unknown} oA9 Hodnota oA9 předaná callbacku.
 * @param {unknown} oB9 Hodnota oB9 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oA9, oB9) => oA9 - oB9);
        const nParentCenter = (aParentAnchors[0] + aParentAnchors.at(-1)) / 2;
        // The cards themselves join a sibling row. Connect the side ports at their
        // vertical centers and drop the shared stem through a gap between cards.
        const oAlignedSiblings = aChildren2.length > 1 && aChildren2.every(/** @h05-inline
 * @brief Ověří podmínku pro jednotlivý prvek kontrolované kolekce.
 * @param {unknown} oP11 Hodnota oP11 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oP11 => Math.abs(oP11.cy - aChildren2[0].cy) < 1) &&
            aChildren2.slice(1).every(/** @h05-inline
 * @brief Ověří podmínku pro jednotlivý prvek kontrolované kolekce.
 * @param {unknown} oP12 Hodnota oP12 předaná callbacku.
 * @param {number} nIndex4 Hodnota nIndex4 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
(oP12, nIndex4) => oP12.left > aChildren2[nIndex4].right);
        const nGapIndex = Math.floor((aChildren2.length - 1) / 2);
        const nBranchX = oAlignedSiblings ? (aChildren2[nGapIndex].right + aChildren2[nGapIndex + 1].left) / 2 : nChildCenter;
        const sChildSegments = oAlignedSiblings ?
            aChildren2.slice(1).map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oP13 Hodnota oP13 předaná callbacku.
 * @param {number} nIndex5 Hodnota nIndex5 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oP13, nIndex5) => `M ${aChildren2[nIndex5].right} ${oP13.cy} H ${oP13.left}`).join(' ') + ` M ${nBranchX} ${aChildren2[0].cy} V ${nChildY}` :
            aChildren2.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oP14 Hodnota oP14 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oP14 => `M ${oP14.cx} ${bChildrenAbove ? oP14.bottom : oP14.top} V ${nChildY}`).join(' ') +
                (aChildren2.length > 1 ? ` M ${aChildren2[0].cx} ${nChildY} H ${aChildren2.at(-1).cx}` : '');
        sMarkup += svgLink(sChildSegments, 'siblings', aChildren2.length > 1 ? `${fnTr("Siblings")}: ${sChildNames}. ${fnTr("Shared parents")}: ${sParentNames}` :
            `${fnTr("Child")}: ${sChildNames}. ${fnTr("Parents")}: ${sParentNames}`);
        const bAligned = Math.abs(nBranchX - nParentCenter) < 1;
        sMarkup += svgLink(`M ${nBranchX} ${nChildY} V ${nParentY}${bAligned ? '' : ` H ${nParentCenter}`}`, 'branch', `${fnTr("Parent-child branch")}: ${sParentNames} → ${sChildNames}`);
        for (const sId8 of oFamily3.parents) {
            const oPoint5 = aPoints.get(String(sId8));
            const oUncertain = oFamily3.children.some(/** @h05-inline
 * @brief Ověří, zda prvek kolekce vyhovuje požadované podmínce.
 * @param {unknown} oChild2 Hodnota oChild2 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oChild2 => oFamily3.relations.get(sId8 + '|' + oChild2)?.research_status === 'challenged');
            const oAnchorX = oPoint5.cx + (oParentOffsets.get(sId8) || 0);
            const sParentPath = `M ${nParentCenter} ${nParentY} H ${oAnchorX} V ${bChildrenAbove ? oPoint5.top : oPoint5.bottom}`;
            const sLabel2 = `${fnTr("Parent")}: ${relationshipLabel(sId8)} → ${sChildNames}${oUncertain ? ' · ' + fnTr("challenged link") : ''}`;
            sMarkup += svgLink(sParentPath, 'parent', sLabel2, oUncertain ? 'challenged' : '');
        }
    }
    for (const oRelation6 of aPartners) {
        const oA10 = aPoints.get(String(oRelation6.person1_id)), oB10 = aPoints.get(String(oRelation6.person2_id));
        sMarkup += svgLink(connectionPath(oA10, oB10, 'partner'), 'partner', `${fnTr("Partnership")}: ${relationshipLabel(+oRelation6.person1_id)} ↔ ${relationshipLabel(+oRelation6.person2_id)}`);
    }
    return sMarkup;
}
let nConnectionFrame=0;
const oConnectionObserver=typeof ResizeObserver==='function'?new ResizeObserver(/** @h05-inline
 * @brief Provede vloženou callback operaci ve zpracovávaném rodokmenu.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>{
 if(!oDrag)spaceRenderedCards(fnValue('hc-familytree-canvas'));
 scheduleConnections();
}):null;
//*****************************************************************************
/**
 * @brief Naplánuje connections v uživatelském rozhraní FamilyTree.
 * @returns {void} Funkce nevrací hodnotu.
 */
function scheduleConnections() { if (nConnectionFrame)
    return; nConnectionFrame = requestAnimationFrame(/** @h05-inline
 * @brief Aktualizuje vykreslení při následujícím obnovovacím snímku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
() => { nConnectionFrame = 0; drawConnections(); }); }
//*****************************************************************************
/**
 * @brief Zpracuje connection cards v uživatelském rozhraní FamilyTree.
 * @returns {void} Funkce nevrací hodnotu.
 */
function observeConnectionCards() { if (!oConnectionObserver)
    return; oConnectionObserver.disconnect(); const bCanvas = fnValue('hc-familytree-canvas'); oConnectionObserver.observe(bCanvas); bCanvas.querySelectorAll('[data-person]').forEach(/** @h05-inline
 * @brief Zpracuje jeden prvek kolekce při průchodu záznamy.
 * @param {unknown} oCard Hodnota oCard předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
oCard => oConnectionObserver.observe(oCard)); }
//*****************************************************************************
/**
 * @brief Vykreslí connections v uživatelském rozhraní FamilyTree.
 * @returns {void} Funkce nevrací hodnotu.
 */
function drawConnections() {
    const bCanvas2 = fnValue('hc-familytree-canvas'), hSvg = bCanvas2.querySelector('.hc-familytree-connections');
    if (!hSvg || !oState)
        return;
    // The SVG is absolutely positioned; its previous dimensions must not inflate scrollWidth.
    hSvg.style.width = '0px';
    hSvg.style.height = '0px';
    const hBox = bCanvas2.getBoundingClientRect(), nScale = nTreeZoom, aPoints2 = new Map();
    bCanvas2.querySelectorAll('[data-person]').forEach(/** @h05-inline
 * @brief Zpracuje jeden prvek kolekce při průchodu záznamy.
 * @param {HTMLElement} hEl Hodnota hEl předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
hEl => {
        const hR3 = hEl.getBoundingClientRect(), nLeft = (hR3.left - hBox.left) / nScale, nTop = (hR3.top - hBox.top) / nScale, nRight = (hR3.right - hBox.left) / nScale, nBottom = (hR3.bottom - hBox.top) / nScale;
        aPoints2.set(hEl.dataset.person, { left: nLeft, top: nTop, right: nRight, bottom: nBottom, cx: (nLeft + nRight) / 2, cy: (nTop + nBottom) / 2 });
    });
    const aBounds = [...aPoints2.values()];
    const nW = Math.ceil(Math.max(bCanvas2.scrollWidth, bCanvas2.clientWidth, ...aBounds.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oP15 Hodnota oP15 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oP15 => oP15.right + 24)));
    const nH = Math.ceil(Math.max(bCanvas2.scrollHeight, bCanvas2.clientHeight, ...aBounds.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oP16 Hodnota oP16 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oP16 => oP16.bottom + 24)));
    hSvg.setAttribute('viewBox', `0 0 ${nW} ${nH}`);
    hSvg.setAttribute('width', nW);
    hSvg.setAttribute('height', nH);
    hSvg.style.width = nW + 'px';
    hSvg.style.height = nH + 'px';
    hSvg.innerHTML = familyConnections(aPoints2);
}
// Partner groups share a generation. A sibling group is kept together within it.
// These positions only affect the view; no genealogy or saved offsets are changed.
//*****************************************************************************
/**
 * @brief Zpracuje rozložení v uživatelském rozhraní FamilyTree.
 * @param {Array<unknown>} aPeople Vstupní hodnota people; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {Array<unknown>} aRelationships Vstupní hodnota relationships; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {unknown} oRootId Vstupní hodnota rootId; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {unknown} oViewWidth Vstupní hodnota viewWidth; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function graphLayout(aPeople, aRelationships, oRootId, oViewWidth) {
    const nCardWidth = 210, nStepX = 236, nStepY = 276, nGroupGap = 54;
    const oPersonMap = new Map(aPeople.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oP17 Hodnota oP17 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oP17 => [+oP17.id, oP17]));
    const oOriginal = new Map(aPeople.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oP18 Hodnota oP18 předaná callbacku.
 * @param {number} nIndex6 Hodnota nIndex6 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oP18, nIndex6) => [+oP18.id, nIndex6]));
    const aAdjacent = new Map(aPeople.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oP19 Hodnota oP19 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oP19 => [+oP19.id, []]));
    const aParents5 = new Map(aPeople.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oP20 Hodnota oP20 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oP20 => [+oP20.id, []]));
    const aChildren3 = new Map(aPeople.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oP21 Hodnota oP21 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oP21 => [+oP21.id, []]));
    const aPartners2 = new Map(aPeople.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oP22 Hodnota oP22 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oP22 => [+oP22.id, []]));
    const oRepresentative = new Map(aPeople.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oP23 Hodnota oP23 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oP23 => [+oP23.id, +oP23.id]));
    /**
 * @brief Najde zástupce uzlu v algoritmu sjednocených množin.
 * @param {string} sId9 Textový parametr sId9 předaný operaci.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnFind = sId9 => { let oCurrent = sId9; while (oRepresentative.get(oCurrent) !== oCurrent)
        oCurrent = oRepresentative.get(oCurrent); return oCurrent; };
    /**
 * @brief Spojí dvě navzájem související množiny při sestavování genealogického grafu.
 * @param {unknown} oA11 Identifikátor prvního uzlu pro sloučení množin.
 * @param {unknown} oB11 Identifikátor druhého uzlu pro sloučení množin.
 * @returns {void} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnJoin = (oA11, oB11) => { const nLeft2 = fnFind(oA11), nRight2 = fnFind(oB11); if (nLeft2 !== nRight2)
        oRepresentative.set(nRight2, nLeft2); };
    for (const oRelation7 of aRelationships) {
        const nA2 = +oRelation7.person1_id, nB2 = +oRelation7.person2_id;
        if (nA2 === nB2 || !oPersonMap.has(nA2) || !oPersonMap.has(nB2))
            continue;
        aAdjacent.get(nA2).push(nB2);
        aAdjacent.get(nB2).push(nA2);
        if (oRelation7.type === 'partner') {
            fnJoin(nA2, nB2);
            aPartners2.get(nA2).push(nB2);
            aPartners2.get(nB2).push(nA2);
        }
        else if (oRelation7.type === 'parent') {
            aParents5.get(nB2).push(nA2);
            aChildren3.get(nA2).push(nB2);
        }
    }
    // Two recorded parents of the same child belong together on the row even if
    // the source does not explicitly call them partners. This is layout-only:
    // it never creates a marriage/partner relationship or a green connector.
    for (const aParentIds of aParents5.values()) {
        const aPair = [...new Set(aParentIds)];
        if (aPair.length !== 2)
            continue;
        const [oA12, oB12] = aPair;
        if (!aPartners2.get(oA12).includes(oB12)) {
            aPartners2.get(oA12).push(oB12);
            aPartners2.get(oB12).push(oA12);
        }
    }
    const oSeen = new Set(), aComponents = [];
    for (const oPerson5 of aPeople) {
        const nStart = +oPerson5.id;
        if (oSeen.has(nStart))
            continue;
        const aIds3 = [], aQueue = [nStart];
        oSeen.add(nStart);
        for (let nN = 0; nN < aQueue.length; nN++) {
            const nId9 = aQueue[nN];
            aIds3.push(nId9);
            for (const oNext of aAdjacent.get(nId9))
                if (!oSeen.has(oNext)) {
                    oSeen.add(oNext);
                    aQueue.push(oNext);
                }
        }
        aComponents.push(aIds3);
    }
    aComponents.sort(/** @h05-inline
 * @brief Porovná dvě položky pro určení jejich pořadí.
 * @param {unknown[]} aA Hodnota aA předaná callbacku.
 * @param {unknown[]} aB Hodnota aB předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(aA, aB) => Number(aB.includes(+oRootId)) - Number(aA.includes(+oRootId)) || aB.length - aA.length || oOriginal.get(aA[0]) - oOriginal.get(aB[0]));
    const aBlocks = [];
    for (const aIds4 of aComponents) {
        const oMembers = new Set(aIds4), oGroupEdges = new Map();
        for (const nId10 of aIds4)
            oGroupEdges.set(fnFind(nId10), []);
        for (const nId11 of aIds4)
            for (const oParent of aParents5.get(nId11))
                if (oMembers.has(oParent) && fnFind(nId11) !== fnFind(oParent)) {
                    oGroupEdges.get(fnFind(nId11)).push({ id: fnFind(oParent), delta: 1 });
                    oGroupEdges.get(fnFind(oParent)).push({ id: fnFind(nId11), delta: -1 });
                }
        const nAnchor = oMembers.has(+oRootId) ? +oRootId :
            (aIds4.filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {number} nId12 Hodnota nId12 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
nId12 => !aChildren3.get(nId12).some(/** @h05-inline
 * @brief Ověří, zda prvek kolekce vyhovuje požadované podmínce.
 * @param {unknown} oChild3 Hodnota oChild3 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oChild3 => oMembers.has(oChild3))).sort(/** @h05-inline
 * @brief Porovná dvě položky pro určení jejich pořadí.
 * @param {number} nA3 Hodnota nA3 předaná callbacku.
 * @param {number} nB3 Hodnota nB3 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(nA3, nB3) => oOriginal.get(nA3) - oOriginal.get(nB3))[0] ?? aIds4[0]);
        const oGroupRanks = new Map([[fnFind(nAnchor), 0]]), aQueue2 = [fnFind(nAnchor)];
        for (let nN2 = 0; nN2 < aQueue2.length; nN2++)
            for (const oEdge of oGroupEdges.get(aQueue2[nN2]) || []) {
                if (!oGroupRanks.has(oEdge.id)) {
                    oGroupRanks.set(oEdge.id, oGroupRanks.get(aQueue2[nN2]) + oEdge.delta);
                    aQueue2.push(oEdge.id);
                }
            }
        const oRanks = new Map(aIds4.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {number} nId13 Hodnota nId13 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
nId13 => [nId13, oGroupRanks.get(fnFind(nId13)) ?? 0]));
        // Partnership cycles may put a child in the same partner group as a parent.
        // Respect parent-child direction first; a conflicting partnership can use
        // a stepped connector across rows instead of reversing a generation.
        const oIndegree = new Map(aIds4.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {number} nId14 Hodnota nId14 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
nId14 => [nId14, aParents5.get(nId14).filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oParent2 Hodnota oParent2 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oParent2 => oMembers.has(oParent2)).length]));
        const aAncestryQueue = aIds4.filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {number} nId15 Hodnota nId15 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
nId15 => oIndegree.get(nId15) === 0);
        for (let nI = 0; nI < aAncestryQueue.length; nI++) {
            const nParent = aAncestryQueue[nI];
            for (const oChild4 of aChildren3.get(nParent)) {
                if (!oMembers.has(oChild4))
                    continue;
                oRanks.set(oChild4, Math.min(oRanks.get(oChild4), oRanks.get(nParent) - 1));
                oIndegree.set(oChild4, oIndegree.get(oChild4) - 1);
                if (oIndegree.get(oChild4) === 0)
                    aAncestryQueue.push(oChild4);
            }
        }
        const aValues3 = [...oRanks.values()], nMinRank = Math.min(...aValues3), nMaxRank = Math.max(...aValues3);
        const oLayers = new Map(), nX6 = new Map();
        for (const nId16 of aIds4) {
            const nRank = oRanks.get(nId16);
            if (!oLayers.has(nRank))
                oLayers.set(nRank, []);
            oLayers.get(nRank).push(nId16);
        }
        const oUnits = new Map();
        for (const [nRank2, oRow4] of oLayers) {
            const oSiblings = new Map();
            for (const sId10 of oRow4) {
                const aParentIds2 = [...new Set(aParents5.get(sId10).filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oParent3 Hodnota oParent3 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oParent3 => oMembers.has(oParent3)))].sort(/** @h05-inline
 * @brief Porovná dvě položky pro určení jejich pořadí.
 * @param {unknown} oA13 Hodnota oA13 předaná callbacku.
 * @param {unknown} oB13 Hodnota oB13 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oA13, oB13) => oA13 - oB13);
                const sKey5 = aParentIds2.length ? aParentIds2.join('|') : 'single:' + sId10;
                if (!oSiblings.has(sKey5))
                    oSiblings.set(sKey5, []);
                oSiblings.get(sKey5).push(sId10);
            }
            const aGroups = [...oSiblings.values()].map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oGroup Hodnota oGroup předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oGroup => ({
                ids: oGroup.sort(/** @h05-inline
 * @brief Porovná dvě položky pro určení jejich pořadí.
 * @param {unknown} oA14 Hodnota oA14 předaná callbacku.
 * @param {unknown} oB14 Hodnota oB14 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oA14, oB14) => oOriginal.get(oA14) - oOriginal.get(oB14)),
                order: Math.min(...oGroup.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {string} sId11 Hodnota sId11 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sId11 => oOriginal.get(sId11))),
            })).sort(/** @h05-inline
 * @brief Porovná dvě položky pro určení jejich pořadí.
 * @param {unknown} oA15 Hodnota oA15 předaná callbacku.
 * @param {unknown} oB15 Hodnota oB15 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oA15, oB15) => oA15.order - oB15.order);
            oUnits.set(nRank2, aGroups);
            let nCursor = 0;
            for (const oGroup2 of aGroups) {
                for (const sId12 of oGroup2.ids) {
                    nX6.set(sId12, nCursor);
                    nCursor += nStepX;
                }
                nCursor += nGroupGap;
            }
            const nMidpoint = (Math.min(...oRow4.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {string} sId13 Hodnota sId13 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sId13 => nX6.get(sId13))) + Math.max(...oRow4.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {string} sId14 Hodnota sId14 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sId14 => nX6.get(sId14)))) / 2;
            for (const sId15 of oRow4)
                nX6.set(sId15, nX6.get(sId15) - nMidpoint);
        }
        /**
 * @brief Vypočítá průměrnou hodnotu potřebnou pro rozložení grafu.
 * @param {unknown} oList Kontextová hodnota oList potřebná pro daný výpočet.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnAvg = oList => oList.reduce(/** @h05-inline
 * @brief Aktualizuje akumulátor podle dalšího prvku kolekce.
 * @param {unknown} oSum3 Hodnota oSum3 předaná callbacku.
 * @param {string} sValue7 Hodnota sValue7 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oSum3, sValue7) => oSum3 + sValue7, 0) / oList.length;
        let bUsePartnerClusters = true;
        /**
 * @brief Uspořádá položky genealogického grafu pro vykreslení.
 * @param {number} nRank3 Číselný parametr nRank3 pro výpočet nebo výběr.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnArrange = nRank3 => {
            const aGroups2 = oUnits.get(nRank3);
            if (!aGroups2?.length)
                return;
            /**
 * @brief Určí požadovanou pozici grafového uzlu pro automatické uspořádání.
 * @param {unknown} oGroup3 Kontextová hodnota oGroup3 potřebná pro daný výpočet.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnDesired = oGroup3 => {
                const aNeighborXs = [];
                for (const sId16 of oGroup3.ids) {
                    for (const oNeighbor of [...aParents5.get(sId16), ...aChildren3.get(sId16)])
                        if (oMembers.has(oNeighbor) && oRanks.get(oNeighbor) !== nRank3)
                            aNeighborXs.push(nX6.get(oNeighbor));
                    for (const oNeighbor2 of aPartners2.get(sId16))
                        if (oMembers.has(oNeighbor2) && oRanks.get(oNeighbor2) === nRank3)
                            aNeighborXs.push(nX6.get(oNeighbor2));
                }
                return aNeighborXs.length ? .8 * fnAvg(aNeighborXs) + .2 * fnAvg(oGroup3.ids.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {string} sId17 Hodnota sId17 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sId17 => nX6.get(sId17))) : fnAvg(oGroup3.ids.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {string} sId18 Hodnota sId18 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sId18 => nX6.get(sId18)));
            };
            const oTargets = new Map(aGroups2.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oGroup4 Hodnota oGroup4 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oGroup4 => [oGroup4, fnDesired(oGroup4)]));
            const oOwner = new Map(aGroups2.flatMap(/** @h05-inline
 * @brief Provede vloženou callback operaci ve zpracovávaném rodokmenu.
 * @param {unknown} oGroup5 Hodnota oGroup5 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oGroup5 => oGroup5.ids.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {string} sId19 Hodnota sId19 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sId19 => [sId19, oGroup5])));
            const oRepresentative2 = new Map(aGroups2.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oGroup6 Hodnota oGroup6 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oGroup6 => [oGroup6, oGroup6]));
            /**
 * @brief Vyhledá zástupce skupiny v rozmísťovacím algoritmu.
 * @param {unknown} oGroup7 Kontextová hodnota oGroup7 potřebná pro daný výpočet.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnFindGroup = oGroup7 => { while (oRepresentative2.get(oGroup7) !== oGroup7)
                oGroup7 = oRepresentative2.get(oGroup7); return oGroup7; };
            if (bUsePartnerClusters)
                for (const oGroup8 of aGroups2)
                    for (const sId20 of oGroup8.ids)
                        for (const oPartner of aPartners2.get(sId20)) {
                            const oOther2 = oOwner.get(oPartner);
                            if (!oOther2 || oOther2 === oGroup8)
                                continue;
                            const oA16 = fnFindGroup(oGroup8), oB16 = fnFindGroup(oOther2);
                            if (oA16 !== oB16)
                                oRepresentative2.set(oB16, oA16);
                        }
            const oClusterMap = new Map();
            for (const oGroup9 of aGroups2) {
                const sKey6 = fnFindGroup(oGroup9);
                if (!oClusterMap.has(sKey6))
                    oClusterMap.set(sKey6, []);
                oClusterMap.get(sKey6).push(oGroup9);
            }
            const aClusters = [...oClusterMap.values()].map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oMembers2 Hodnota oMembers2 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oMembers2 => {
                oMembers2.sort(/** @h05-inline
 * @brief Porovná dvě položky pro určení jejich pořadí.
 * @param {unknown} oA17 Hodnota oA17 předaná callbacku.
 * @param {unknown} oB17 Hodnota oB17 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oA17, oB17) => fnAvg(oA17.ids.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {string} sId21 Hodnota sId21 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sId21 => nX6.get(sId21))) - fnAvg(oB17.ids.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {string} sId22 Hodnota sId22 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sId22 => nX6.get(sId22))) || oA17.order - oB17.order);
                const aSpans = oMembers2.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oGroup10 Hodnota oGroup10 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oGroup10 => (oGroup10.ids.length - 1) * nStepX / 2), aLocal = [0];
                for (let nI2 = 1; nI2 < oMembers2.length; nI2++)
                    aLocal.push(aLocal[nI2 - 1] + aSpans[nI2 - 1] + aSpans[nI2] + nStepX);
                const nCenter = (aLocal[0] - aSpans[0] + aLocal.at(-1) + aSpans.at(-1)) / 2;
                const nSpan = (aLocal.at(-1) + aSpans.at(-1) - aLocal[0] + aSpans[0]) / 2;
                for (let nI3 = 0; nI3 < aLocal.length; nI3++)
                    aLocal[nI3] -= nCenter;
                const oGroupIndex = new Map(oMembers2.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oGroup11 Hodnota oGroup11 předaná callbacku.
 * @param {number} nI4 Hodnota nI4 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oGroup11, nI4) => [oGroup11, nI4]));
                for (const [nI5, oGroup12] of oMembers2.entries())
                    if (oGroup12.ids.length > 1) {
                        /**
 * @brief Spočítá hodnotu penalizace při hledání vhodného rozložení.
 * @param {unknown[]} aIds5 Kolekce aIds5 se zpracovávanými záznamy.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnCost = aIds5 => aIds5.reduce(/** @h05-inline
 * @brief Aktualizuje akumulátor podle dalšího prvku kolekce.
 * @param {unknown} oSum4 Hodnota oSum4 předaná callbacku.
 * @param {string} sId23 Hodnota sId23 předaná callbacku.
 * @param {number} nIndex7 Hodnota nIndex7 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oSum4, sId23, nIndex7) => {
                            const nPosition = aLocal[nI5] + (nIndex7 - (aIds5.length - 1) / 2) * nStepX;
                            return oSum4 + aPartners2.get(sId23).reduce(/** @h05-inline
 * @brief Aktualizuje akumulátor podle dalšího prvku kolekce.
 * @param {number} nTotal Hodnota nTotal předaná callbacku.
 * @param {unknown} oOther3 Hodnota oOther3 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(nTotal, oOther3) => {
                                const oPartnerIndex = oGroupIndex.get(oOwner.get(oOther3));
                                return nTotal + (oPartnerIndex === undefined ? 0 : Math.abs(nPosition - aLocal[oPartnerIndex]));
                            }, 0);
                        }, 0);
                        if (fnCost([...oGroup12.ids].reverse()) + 1 < fnCost(oGroup12.ids))
                            oGroup12.ids.reverse();
                    }
                return { members: oMembers2, local: aLocal, span: nSpan, target: fnAvg(oMembers2.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oGroup13 Hodnota oGroup13 předaná callbacku.
 * @param {number} nI6 Hodnota nI6 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oGroup13, nI6) => oTargets.get(oGroup13) - aLocal[nI6])),
                    order: Math.min(...oMembers2.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oGroup14 Hodnota oGroup14 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oGroup14 => oGroup14.order)) };
            }).sort(/** @h05-inline
 * @brief Porovná dvě položky pro určení jejich pořadí.
 * @param {unknown[]} aA2 Hodnota aA2 předaná callbacku.
 * @param {unknown[]} aB2 Hodnota aB2 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(aA2, aB2) => aA2.target - aB2.target || aA2.order - aB2.order);
            aGroups2.splice(0, aGroups2.length, ...aClusters.flatMap(/** @h05-inline
 * @brief Provede vloženou callback operaci ve zpracovávaném rodokmenu.
 * @param {unknown[]} aCluster Hodnota aCluster předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
aCluster => aCluster.members));
            // Keep partner groups together. Project whole clusters toward their family
            // with a gap between unrelated links in the same generation.
            const aOffsets = [0];
            for (let nI7 = 1; nI7 < aClusters.length; nI7++)
                aOffsets.push(aOffsets[nI7 - 1] + aClusters[nI7 - 1].span + aClusters[nI7].span + nStepX + nGroupGap);
            const aPools = [];
            for (let nI8 = 0; nI8 < aClusters.length; nI8++) {
                const nValue = aClusters[nI8].target - aOffsets[nI8];
                aPools.push({ start: nI8, end: nI8, sum: nValue, count: 1, mean: nValue });
                while (aPools.length > 1 && aPools.at(-2).mean > aPools.at(-1).mean) {
                    const oLast = aPools.pop(), oPrevious = aPools.at(-1);
                    oPrevious.end = oLast.end;
                    oPrevious.sum += oLast.sum;
                    oPrevious.count += oLast.count;
                    oPrevious.mean = oPrevious.sum / oPrevious.count;
                }
            }
            for (const oPool of aPools)
                for (let nI9 = oPool.start; nI9 <= oPool.end; nI9++) {
                    const nCenter2 = oPool.mean + aOffsets[nI9], aCluster2 = aClusters[nI9];
                    aCluster2.members.forEach(/** @h05-inline
 * @brief Zpracuje jeden prvek kolekce při průchodu záznamy.
 * @param {unknown} oGroup15 Hodnota oGroup15 předaná callbacku.
 * @param {number} nJ Hodnota nJ předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
(oGroup15, nJ) => oGroup15.ids.forEach(/** @h05-inline
 * @brief Zpracuje jeden prvek kolekce při průchodu záznamy.
 * @param {string} sId24 Hodnota sId24 předaná callbacku.
 * @param {number} nIndex8 Hodnota nIndex8 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
(sId24, nIndex8) => nX6.set(sId24, nCenter2 + aCluster2.local[nJ] + (nIndex8 - (oGroup15.ids.length - 1) / 2) * nStepX)));
                }
        };
        const oInitialX = new Map(nX6), oInitialUnits = new Map([...oUnits].map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} arg0 Rozbalovaný parametr [nRank4, aGroups3] se vstupními údaji.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
([nRank4, aGroups3]) => [nRank4, aGroups3.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oGroup16 Hodnota oGroup16 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oGroup16 => ({ ids: [...oGroup16.ids], order: oGroup16.order }))]));
        let oBestPositions = null, nBestScore = Infinity;
        for (const bClustered of [true, false]) {
            bUsePartnerClusters = bClustered;
            nX6.clear();
            for (const [sId25, sValue8] of oInitialX)
                nX6.set(sId25, sValue8);
            for (const [nRank5, aGroups4] of oInitialUnits)
                oUnits.set(nRank5, aGroups4.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oGroup17 Hodnota oGroup17 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oGroup17 => ({ ids: [...oGroup17.ids], order: oGroup17.order })));
            for (let nPass = 0; nPass < 8; nPass++) {
                for (let nRank6 = nMinRank; nRank6 <= nMaxRank; nRank6++)
                    fnArrange(nRank6);
                for (let nRank7 = nMaxRank; nRank7 >= nMinRank; nRank7--)
                    fnArrange(nRank7);
            }
            let nScore = 0;
            for (const nId17 of aIds4) {
                for (const oChild5 of aChildren3.get(nId17))
                    if (oMembers.has(oChild5)) {
                        const nDistance = Math.abs(nX6.get(nId17) - nX6.get(oChild5));
                        nScore += nDistance + 4 * Math.max(0, nDistance - 700);
                    }
                for (const oPartner2 of aPartners2.get(nId17))
                    if (nId17 < oPartner2 && oMembers.has(oPartner2)) {
                        const nDistance2 = Math.abs(nX6.get(nId17) - nX6.get(oPartner2));
                        nScore += 1.2 * nDistance2 + 4 * Math.max(0, nDistance2 - 700);
                    }
            }
            nScore += .25 * (Math.max(...nX6.values()) - Math.min(...nX6.values()));
            if (nScore < nBestScore) {
                nBestScore = nScore;
                oBestPositions = new Map(nX6);
            }
        }
        nX6.clear();
        for (const [sId26, sValue9] of oBestPositions)
            nX6.set(sId26, sValue9);
        const oFamilyRanges = new Map();
        for (const nId18 of aIds4) {
            const aParentIds3 = [...new Set(aParents5.get(nId18).filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oParent4 Hodnota oParent4 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oParent4 => oMembers.has(oParent4)))].sort(/** @h05-inline
 * @brief Porovná dvě položky pro určení jejich pořadí.
 * @param {unknown} oA18 Hodnota oA18 předaná callbacku.
 * @param {unknown} oB18 Hodnota oB18 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oA18, oB18) => oA18 - oB18);
            if (!aParentIds3.length)
                continue;
            const sKey7 = oRanks.get(nId18) + '|' + aParentIds3.join('|');
            if (!oFamilyRanges.has(sKey7))
                oFamilyRanges.set(sKey7, { rank: oRanks.get(nId18), positions: [] });
            oFamilyRanges.get(sKey7).positions.push(nX6.get(nId18), ...aParentIds3.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oParent5 Hodnota oParent5 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oParent5 => nX6.get(oParent5)));
        }
        const oRangesByRank = new Map(), oLaneCount = new Map();
        for (const oFamily4 of oFamilyRanges.values()) {
            const oRange = { lo: Math.min(...oFamily4.positions), hi: Math.max(...oFamily4.positions) };
            if (!oRangesByRank.has(oFamily4.rank))
                oRangesByRank.set(oFamily4.rank, []);
            oRangesByRank.get(oFamily4.rank).push(oRange);
        }
        for (const [nRank8, oRanges] of oRangesByRank) {
            const aLanes = [];
            for (const oRange2 of oRanges.sort(/** @h05-inline
 * @brief Porovná dvě položky pro určení jejich pořadí.
 * @param {unknown} oA19 Hodnota oA19 předaná callbacku.
 * @param {unknown} oB19 Hodnota oB19 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oA19, oB19) => oA19.lo - oB19.lo)) {
                let nLane2 = 0;
                while (aLanes[nLane2]?.some(/** @h05-inline
 * @brief Ověří, zda prvek kolekce vyhovuje požadované podmínce.
 * @param {unknown} oOther4 Hodnota oOther4 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oOther4 => oRange2.lo <= oOther4.hi + 28 && oRange2.hi >= oOther4.lo - 28))
                    nLane2++;
                (aLanes[nLane2] ??= []).push(oRange2);
            }
            oLaneCount.set(nRank8, aLanes.length);
        }
        const oRowOffsets = new Map([[nMinRank, 0]]);
        for (let nRank9 = nMinRank + 1; nRank9 <= nMaxRank; nRank9++)
            oRowOffsets.set(nRank9, oRowOffsets.get(nRank9 - 1) + Math.max(nStepY, 180 + 36 * ((oLaneCount.get(nRank9 - 1) || 1) - 1)));
        const nMinX = Math.min(...nX6.values()), nMaxX = Math.max(...nX6.values());
        aBlocks.push({ ids: aIds4, layers: oLayers, x: nX6, minX: nMinX, minRank: nMinRank, maxRank: nMaxRank, rowOffsets: oRowOffsets, width: nMaxX - nMinX + nCardWidth + 80, height: oRowOffsets.get(nMaxRank) + 192 });
    }
    const aNodes = [], aLabels = [], nLimit = Math.max(900, oViewWidth - 80);
    let nCursorX = 40, nCursorY = 40, nRowHeight = 0, nRight3 = 0;
    for (const [nIndex9, aBlock] of aBlocks.entries()) {
        if (nCursorX > 40 && nCursorX + aBlock.width > nLimit + 40) {
            nCursorY += nRowHeight + 60;
            nCursorX = 40;
            nRowHeight = 0;
        }
        const nBaseX = nIndex9 === 0 && aBlock.ids.length > 1 ? Math.max(nCursorX, (oViewWidth - aBlock.width) / 2) : nCursorX;
        if (nIndex9 === 0 && aBlock.ids.length > 1)
            nCursorX = nLimit + 80;
        else
            nCursorX += aBlock.width + 40;
        nRowHeight = Math.max(nRowHeight, aBlock.height);
        nRight3 = Math.max(nRight3, nBaseX + aBlock.width);
        if (aBlocks.length > 1)
            aLabels.push({ x: nBaseX + 12, y: nCursorY + 8, text: aBlock.ids.length === 1 ? fnTr("Person with no known connections") : fnTr("Separate branch") });
        for (const [nRank10, oRow5] of aBlock.layers) {
            const nTop2 = nCursorY + 76 + aBlock.rowOffsets.get(nRank10);
            if (aBlock.ids.length > 1)
                aLabels.push({ x: nBaseX + 12, y: nTop2 - 29, text: `${fnTr("Generation")} ${nRank10 - aBlock.minRank + 1}`, generation: true });
            for (const sId27 of oRow5)
                aNodes.push({ person: oPersonMap.get(sId27), x: nBaseX + 40 + aBlock.x.get(sId27) - aBlock.minX, y: nTop2 });
        }
    }
    const nMinNodeX = Math.min(40, ...aNodes.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {number} nN3 Hodnota nN3 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
nN3 => nN3.x + (+nN3.person.layout_x || 0)));
    const nMinNodeY = Math.min(40, ...aNodes.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {number} nN4 Hodnota nN4 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
nN4 => nN4.y + (+nN4.person.layout_y || 0)));
    const nShiftX = Math.max(0, 40 - nMinNodeX), nShiftY = Math.max(0, 40 - nMinNodeY);
    for (const hNode of aNodes) {
        hNode.x += nShiftX;
        hNode.y += nShiftY;
    }
    for (const sLabel3 of aLabels) {
        sLabel3.x += nShiftX;
        sLabel3.y += nShiftY;
    }
    const nWidth = Math.max(oViewWidth, nRight3 + nShiftX + 40, ...aNodes.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {number} nN5 Hodnota nN5 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
nN5 => nN5.x + (+nN5.person.layout_x || 0) + nCardWidth + 40));
    const nHeight = Math.max(nCursorY + nRowHeight + nShiftY + 40, ...aNodes.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {number} nN6 Hodnota nN6 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
nN6 => nN6.y + (+nN6.person.layout_y || 0) + 125));
    return { nodes: aNodes, labels: aLabels, width: nWidth, height: nHeight, branches: aBlocks.length };
}
//*****************************************************************************
/**
 * @brief Zarovná nearby rows v uživatelském rozhraní FamilyTree.
 * @param {Array<unknown>} aPeople2 Vstupní hodnota people; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {Array<unknown>} aRelationships2 Vstupní hodnota relationships; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {Array<unknown>} aNodes2 Vstupní hodnota nodes; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function alignNearbyRows(aPeople2, aRelationships2, aNodes2) {
    const oById = new Map(aNodes2.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {HTMLElement} hNode2 Hodnota hNode2 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
hNode2 => [+hNode2.person.id, hNode2])), oAdjacent = new Map(aPeople2.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oPerson6 Hodnota oPerson6 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oPerson6 => [+oPerson6.id, new Set()]));
    /**
 * @brief Propojí odpovídající sousední uzly v pomocném grafu.
 * @param {unknown} oA20 Identifikátor prvního uzlu pro propojení.
 * @param {unknown} oB20 Identifikátor druhého uzlu pro propojení.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnJoin2 = (oA20, oB20) => { if (!oById.has(oA20) || !oById.has(oB20) || Math.abs(oById.get(oA20).y - oById.get(oB20).y) > 1)
        return; oAdjacent.get(oA20).add(oB20); oAdjacent.get(oB20).add(oA20); };
    const oSiblingFamilies = new Map();
    for (const oRelation8 of aRelationships2) {
        const nA4 = +oRelation8.person1_id, nB4 = +oRelation8.person2_id;
        if (oRelation8.type === 'partner')
            fnJoin2(nA4, nB4);
        else if (oRelation8.type === 'parent' && oById.has(nA4) && oById.has(nB4)) {
            if (!oSiblingFamilies.has(nB4))
                oSiblingFamilies.set(nB4, []);
            oSiblingFamilies.get(nB4).push(nA4);
        }
    }
    const oSiblingGroups = new Map();
    for (const [oChild6, aParents6] of oSiblingFamilies) {
        const sKey8 = [...new Set(aParents6)].sort(/** @h05-inline
 * @brief Porovná dvě položky pro určení jejich pořadí.
 * @param {unknown} oA21 Hodnota oA21 předaná callbacku.
 * @param {unknown} oB21 Hodnota oB21 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oA21, oB21) => oA21 - oB21).join('|');
        if (!oSiblingGroups.has(sKey8))
            oSiblingGroups.set(sKey8, []);
        oSiblingGroups.get(sKey8).push(oChild6);
    }
    for (const aChildren4 of oSiblingGroups.values())
        for (let nI10 = 1; nI10 < aChildren4.length; nI10++)
            fnJoin2(aChildren4[0], aChildren4[nI10]);
    const oSeen2 = new Set();
    let bChanged = false;
    for (const nId19 of oAdjacent.keys()) {
        if (oSeen2.has(nId19))
            continue;
        const aComponent = [], aQueue3 = [nId19];
        oSeen2.add(nId19);
        for (let nI11 = 0; nI11 < aQueue3.length; nI11++) {
            const nMember = aQueue3[nI11];
            aComponent.push(nMember);
            for (const oOther5 of oAdjacent.get(nMember))
                if (!oSeen2.has(oOther5)) {
                    oSeen2.add(oOther5);
                    aQueue3.push(oOther5);
                }
        }
        const aSorted = aComponent.sort(/** @h05-inline
 * @brief Porovná dvě položky pro určení jejich pořadí.
 * @param {number} nA5 Hodnota nA5 předaná callbacku.
 * @param {number} nB5 Hodnota nB5 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(nA5, nB5) => (oById.get(nA5).y + (+oById.get(nA5).person.layout_y || 0)) - (oById.get(nB5).y + (+oById.get(nB5).person.layout_y || 0)));
        for (let nStart2 = 0; nStart2 < aSorted.length;) {
            const oFirst = oById.get(aSorted[nStart2]), oFirstY = oFirst.y + (+oFirst.person.layout_y || 0);
            let nEnd = nStart2 + 1;
            while (nEnd < aSorted.length && oById.get(aSorted[nEnd]).y + (+oById.get(aSorted[nEnd]).person.layout_y || 0) - oFirstY <= 18)
                nEnd++;
            if (nEnd - nStart2 > 1) {
                const oAnchor = aSorted.slice(nStart2, nEnd).map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {number} nMember2 Hodnota nMember2 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
nMember2 => oById.get(nMember2)).sort(/** @h05-inline
 * @brief Porovná dvě položky pro určení jejich pořadí.
 * @param {unknown} oA22 Hodnota oA22 předaná callbacku.
 * @param {unknown} oB22 Hodnota oB22 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oA22, oB22) => Math.abs(+oA22.person.layout_y || 0) - Math.abs(+oB22.person.layout_y || 0))[0];
                const oTarget2 = oAnchor.y + (+oAnchor.person.layout_y || 0);
                for (const nMember3 of aSorted.slice(nStart2, nEnd)) {
                    const hNode3 = oById.get(nMember3), nOffset = Math.round(oTarget2 - hNode3.y);
                    if ((+hNode3.person.layout_y || 0) !== nOffset) {
                        hNode3.person.layout_y = nOffset;
                        bChanged = true;
                    }
                }
            }
            nStart2 = nEnd;
        }
    }
    return bChanged;
}
// Preserve each row's order while making room for cards that render wider than
// the nominal width used by graphLayout (names, badges, fonts or browser CSS).
//*****************************************************************************
/**
 * @brief Rozmístí cards v uživatelském rozhraní FamilyTree.
 * @param {Array<unknown>} aCards Vstupní hodnota cards; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {unknown} oGap Vstupní hodnota gap; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function spaceCards(aCards, oGap = 18) {
    const aOrdered = [...aCards].sort(/** @h05-inline
 * @brief Porovná dvě položky pro určení jejich pořadí.
 * @param {unknown} oA23 Hodnota oA23 předaná callbacku.
 * @param {unknown} oB23 Hodnota oB23 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oA23, oB23) => oA23.x - oB23.x || oA23.y - oB23.y || oA23.id - oB23.id);
    const oPositions2 = new Map();
    for (let nIndex10 = 0; nIndex10 < aOrdered.length; nIndex10++) {
        const oCurrent2 = aOrdered[nIndex10];
        let nX7 = oCurrent2.x;
        for (let nPrevious = 0; nPrevious < nIndex10; nPrevious++) {
            const oOther6 = aOrdered[nPrevious], nLeft3 = oPositions2.get(oOther6.id);
            if (oCurrent2.y < oOther6.y + oOther6.h && oCurrent2.y + oCurrent2.h > oOther6.y)
                nX7 = Math.max(nX7, nLeft3 + oOther6.w + oGap);
        }
        oPositions2.set(oCurrent2.id, nX7);
    }
    return oPositions2;
}
//*****************************************************************************
/**
 * @brief Rozmístí rendered cards v uživatelském rozhraní FamilyTree.
 * @param {object} bCanvas3 Vstupní hodnota canvas; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function spaceRenderedCards(bCanvas3) {
    if (!oState || !bCanvas3)
        return;
    const nScale2 = nTreeZoom;
    const aCards2 = [...bCanvas3.querySelectorAll('[data-person]')].map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {HTMLElement} hEl2 Hodnota hEl2 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
hEl2 => {
        const nId20 = +hEl2.dataset.person, oPerson7 = byId(nId20), nDx3 = +oPerson7.layout_x || 0, nDy3 = +oPerson7.layout_y || 0;
        const hRect = hEl2.getBoundingClientRect();
        return { id: nId20, el: hEl2, dx: nDx3, x: (Number.parseFloat(hEl2.style.left) || 0) + nDx3, y: (Number.parseFloat(hEl2.style.top) || 0) + nDy3,
            w: Math.max(hEl2.offsetWidth || 0, hEl2.scrollWidth || 0, hRect.width / nScale2 || 0, 210),
            h: Math.max(hEl2.offsetHeight || 0, hEl2.scrollHeight || 0, hRect.height / nScale2 || 0, 78) };
    });
    if (!aCards2.length)
        return;
    const oPositions3 = spaceCards(aCards2);
    for (const oCard2 of aCards2) {
        const nX8 = oPositions3.get(oCard2.id);
        if (nX8 > oCard2.x + .5)
            oCard2.el.style.left = Math.ceil(nX8 - oCard2.dx) + 'px';
    }
    const nRight4 = Math.max(...aCards2.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oCard3 Hodnota oCard3 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oCard3 => oPositions3.get(oCard3.id) + oCard3.w)) + 40;
    bCanvas3.style.width = Math.max(Number.parseFloat(bCanvas3.style.width) || 0, Math.ceil(nRight4)) + 'px';
}
//*****************************************************************************
/**
 * @brief Aktualizuje výběr ui v uživatelském rozhraní FamilyTree.
 * @returns {void} Funkce nevrací hodnotu.
 */
function updateSelectionUI() {
    const nCount = oSelectedIds.size, oBar = fnValue('hc-familytree-selection-status');
    oBar.hidden = !nCount;
    oBar.querySelector('span').textContent = `${nCount} ${fnTr("selected people")} · ${fnTr("Right-click to adjust the selection; Shift-drag moves the group and opens space.")}`;
    fnValue('hc-familytree-select').setAttribute('aria-pressed', String(bSelectionMode));
    fnValue('hc-familytree-select').classList.toggle('active', bSelectionMode);
    fnValue('hc-familytree-canvas').querySelectorAll('[data-person]').forEach(/** @h05-inline
 * @brief Zpracuje jeden prvek kolekce při průchodu záznamy.
 * @param {HTMLElement} hEl3 Hodnota hEl3 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
hEl3 => hEl3.classList.toggle('selected', oSelectedIds.has(+hEl3.dataset.person)));
}
//*****************************************************************************
/**
 * @brief Vrátí aktuální rodokmen name v uživatelském rozhraní FamilyTree.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function currentTreeName() { return oState?.tree?.name || ''; }
//*****************************************************************************
/**
 * @brief Přepne výběr mode v uživatelském rozhraní FamilyTree.
 * @returns {void} Funkce nevrací hodnotu.
 */
function toggleSelectionMode(){bSelectionMode=!bSelectionMode;oSelectedIds.clear();updateSelectionUI();oToolbarController?.update(fnToolbarActions());scheduleConnections()}
//*****************************************************************************
/**
 * @brief Vykreslí dílčí část aplikace v uživatelském rozhraní FamilyTree.
 * @returns {void} Funkce nevrací hodnotu.
 */
function render(){if(!oState)return;
 syncViewControls();
 fnValue('hc-familytree-title').textContent=oState.tree.name;
 fnValue('hc-familytree-subtitle').textContent=oState.tree.description||`${oState.people.length} ${fnTr("people")}`;
 oToolbarController?.update(fnToolbarActions());fnValue('hc-familytree-empty').hidden=true;fnValue('hc-familytree-stage').hidden=false;
 fnValue('hc-familytree-reflow').hidden=!oState.canEdit;
 const bCanvas4=fnValue('hc-familytree-canvas'),oQ=fnValue('hc-familytree-search').value.trim().toLocaleLowerCase();
 let oLayout=graphLayout(oState.people,oState.relationships,oState.tree.root_person_id,fnValue('hc-familytree-canvas-wrap').clientWidth);
 if(alignNearbyRows(oState.people,oState.relationships,oLayout.nodes))oLayout=graphLayout(oState.people,oState.relationships,oState.tree.root_person_id,fnValue('hc-familytree-canvas-wrap').clientWidth);
 bCanvas4.style.width=Math.ceil(oLayout.width)+'px';bCanvas4.style.height=Math.ceil(oLayout.height)+'px';
 bCanvas4.classList.toggle('hide-evidence-badges',!bShowEvidenceBadges);
 const aGenerationYs=[...new Set(oLayout.labels.filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {string} sLabel4 Hodnota sLabel4 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
sLabel4=>sLabel4.generation).map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {string} sLabel5 Hodnota sLabel5 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sLabel5=>Math.round(sLabel5.y+8)))];
 bCanvas4.innerHTML=aGenerationYs.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {number} nY2 Hodnota nY2 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
nY2=>`<div class="hc-familytree-generation-line" style="top:${nY2}px" aria-hidden="true"></div>`).join('')+
  fnLoc("<svg class=\"hc-familytree-connections\" role=\"group\" aria-label=\"Family relationships\"></svg>")+
  oLayout.labels.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {string} sLabel6 Hodnota sLabel6 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sLabel6=>fnHtml`<div class="hc-familytree-graph-label" style="left:${Math.round(sLabel6.x)}px;top:${Math.round(sLabel6.y)}px">${fnEsc(sLabel6.text)}</div>`).join('')+
  oLayout.nodes.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {HTMLElement} hNode4 Hodnota hNode4 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
hNode4=>card(hNode4.person,hNode4.x,hNode4.y)).join('')+'<div class="hc-familytree-snap-guide" hidden aria-hidden="true"></div>';
 spaceRenderedCards(bCanvas4);
 if(oQ)bCanvas4.querySelectorAll('[data-person]').forEach(/** @h05-inline
 * @brief Zpracuje jeden prvek kolekce při průchodu záznamy.
 * @param {HTMLElement} hEl4 Hodnota hEl4 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
hEl4=>{const oP24=byId(+hEl4.dataset.person);hEl4.classList.toggle('dimmed',!(oP24.given_name+' '+oP24.surname).toLocaleLowerCase().includes(oQ))});
 const oImported2=researchRows('persons').length,oVariantCount=researchRows('relationships').filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oR7 Hodnota oR7 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oR7=>!oR7.native_id).length,oImports=researchRows('package').length;
 fnValue('hc-familytree-tree-status').textContent=`${oState.people.length} ${fnTr("people")} · ${oState.relationships.length} ${fnTr("displayed relationships")} · ${oLayout.branches} ${fnTr("branches")
    }`+(oImports?` · ${oImports} ${fnTr("imported sets")}`:'')+(oVariantCount?` · ${oVariantCount} ${fnTr("research relationship variants")}`:'')+(oImported2&&!oState.relationships.length?` · ${
    fnTr("The import has no displayed links; check FAM families and research records.")}`:'');
  fnValue('hc-familytree-toolbar-status').textContent=fnValue('hc-familytree-tree-status').textContent;
  fnValue('hc-familytree-toolbar-status').hidden=!bShowToolbarSummary;
  oRoot.classList.add('has-active-tree');
  updateSelectionUI();updateHistoryButtons();observeConnectionCards();scheduleConnections();requestAnimationFrame(restoreLegendPosition);
}
//*****************************************************************************
/**
 * @brief Spustí rodokmen action v uživatelském rozhraní FamilyTree.
 * @param {number} nTreeId4 Vstupní hodnota treeId; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {string} sAction Vstupní hodnota action; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {Promise<unknown>} Hodnota použitá volající částí rozhraní.
 */
async function runTreeAction(nTreeId4,sAction){if(nTreeId4&&nTreeId4!==nCurrent)await selectTree(nTreeId4);if(sAction==='edit')return treeEdit();if(sAction==='share')return shares();
    if(sAction==='import')return showImportChoice();if(sAction==='export')return showExportChoice('current');if(sAction==='research')return openResearchJournal('archive');
    if(sAction==='journal')return openResearchJournal();if(sAction==='statistics')return openResearchJournal('statistics');if(sAction==='delete')return deleteTree();if(sAction==='reflow')return reflowTree()}
//*****************************************************************************
/**
 * @brief Zavře rodokmen action nabídku v uživatelském rozhraní FamilyTree.
 * @param {boolean} bRestoreFocus Vstupní hodnota restoreFocus; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function closeTreeActionMenu(bRestoreFocus=false){
 const oMenu=fnValue('hc-familytree-tree-menu'),nTreeId5=Number(oMenu.dataset.treeId)||0;
 oMenu.hidden=true;oMenu.replaceChildren();delete oMenu.dataset.treeId;
 oRoot.querySelectorAll('[data-tree-menu-toggle]').forEach(/** @h05-inline
 * @brief Zpracuje jeden prvek kolekce při průchodu záznamy.
 * @param {unknown} oBtn Hodnota oBtn předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
oBtn=>oBtn.setAttribute('aria-expanded','false'));
 if(bRestoreFocus&&nTreeId5)oRoot.querySelector(`[data-tree-menu-toggle="${nTreeId5}"]`)?.focus();
}
//*****************************************************************************
/**
 * @brief Přepne rodokmen action nabídku v uživatelském rozhraní FamilyTree.
 * @param {number} nTreeId6 Vstupní hodnota treeId; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {object} oAnchor2 Vstupní hodnota anchor; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function toggleTreeActionMenu(nTreeId6,oAnchor2){
 const oMenu2=fnValue('hc-familytree-tree-menu');
 if(!oMenu2.hidden&&Number(oMenu2.dataset.treeId)===nTreeId6){closeTreeActionMenu();return}
 const oTree3=aTrees.find(/** @h05-inline
 * @brief Vyhledá první záznam splňující danou podmínku.
 * @param {unknown} oItem3 Hodnota oItem3 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oItem3=>Number(oItem3.id)===nTreeId6);
 if(!oTree3){closeTreeActionMenu();return}
 fnValue('hc-familytree-sidebar-menu').hidden=true;
 closeTreeActionMenu();
 oMenu2.dataset.treeId=String(nTreeId6);oMenu2.innerHTML=treeActionMenu(oTree3);oMenu2.hidden=false;
 oAnchor2.setAttribute('aria-expanded','true');positionPopover(oMenu2,oAnchor2,278);
}
// CZ: Výběr stromu zůstává na kliknutí, dvojklik na jeho názvu otevírá deník.
// Krátké odložení kliknutí zabrání překreslení položky před událostí dblclick.
let oPendingTreeClick=null;
/**
 * @brief Zjistí podmínku cancel pending tree click používanou při zpracování rodokmenu.
 * @returns {boolean} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnCancelPendingTreeClick=()=>{if(oPendingTreeClick!==null){clearTimeout(oPendingTreeClick);oPendingTreeClick=null}};
fnValue('hc-familytree-tree-list').onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @param {unknown} oE2 Hodnota oE2 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oE2=>{
 const hToggle=oE2.target.closest('[data-tree-menu-toggle]');
 if(hToggle){fnCancelPendingTreeClick();oE2.preventDefault();oE2.stopPropagation();toggleTreeActionMenu(Number(hToggle.dataset.treeMenuToggle),hToggle);return}
 const hButton=oE2.target.closest('[data-tree]');
 if(!hButton)return;
 closeTreeActionMenu();
 const nTreeId7=Number(hButton.dataset.tree);
 fnCancelPendingTreeClick();
 // CZ: Klávesnice (Enter/mezerník) nemá mouse click count, výběr je okamžitý.
 if(oE2.detail===0){if(nTreeId7!==nCurrent)void selectTree(nTreeId7).catch(/** @h05-inline
 * @brief Ošetří chybu asynchronní operace.
 * @param {unknown} oError3 Hodnota oError3 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oError3=>fnToast(oError3.message,'error'));return}
 if(nTreeId7===nCurrent)return;
 oPendingTreeClick=setTimeout(/** @h05-inline
 * @brief Provede odloženou akci po uplynutí požadovaného intervalu.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
()=>{
  oPendingTreeClick=null;
  void selectTree(nTreeId7).catch(/** @h05-inline
 * @brief Ošetří chybu asynchronní operace.
 * @param {unknown} oError4 Hodnota oError4 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oError4=>fnToast(oError4.message,'error'));
 },350);
};
fnValue('hc-familytree-tree-list').addEventListener('dblclick',/** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @param {unknown} oE3 Hodnota oE3 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
async oE3=>{
 const hButton2=oE3.target.closest('[data-tree]');
 if(!hButton2)return;
 oE3.preventDefault();fnCancelPendingTreeClick();closeTreeActionMenu();
 const nTreeId8=Number(hButton2.dataset.tree);
 try{
  if(nTreeId8!==nCurrent)await selectTree(nTreeId8);
  await openResearchJournal('archive');
 }catch(oError5){fnToast(oError5.message,'error')}
});
fnValue('hc-familytree-tree-menu').onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @param {unknown} oE4 Hodnota oE4 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async oE4=>{
 const sAction2=oE4.target.closest('[data-tree-tool]')?.dataset.treeTool,nTreeId9=Number(fnValue('hc-familytree-tree-menu').dataset.treeId);
 if(!sAction2||!nTreeId9)return;
 closeTreeActionMenu();
 try{await runTreeAction(nTreeId9,sAction2)}catch(oError6){fnToast(oError6.message,'error')}
};
fnValue('hc-familytree-tree-list').addEventListener('scroll',/** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
()=>closeTreeActionMenu(),{passive:true});
fnValue('hc-familytree-search').oninput=render;
fnValue('hc-familytree-new-tree').onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>{openModal(fnTr("New family tree"),
    fnHtml`<form id="hc-familytree-tree-form" class="hc-familytree-form"><label>Name<input name="name" required autofocus></label><label>Description\
<textarea name="description"></textarea></label><div class="hc-familytree-form-actions"><button type="button" data-close>Cancel</button><button class="primary">Create</button></div></form>`);
    fnValue('hc-familytree-tree-form').onsubmit=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @param {unknown} oE5 Hodnota oE5 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async oE5=>{oE5.preventDefault();const oForm=oE5.target,hButton3=oForm.querySelector('button.primary'),oOriginal2=hButton3.textContent;hButton3.disabled=true;
    hButton3.textContent=fnTr("Saving…");try{const oT2=await fnApi('/api/trees',{method:'POST',body:JSON.stringify(fnFormData(oForm))});closeModal();await selectTree(+oT2.id)}catch(oError7){
    fnToast(fnTr("Could not create family tree: ")+oError7.message,'error');hButton3.disabled=false;hButton3.textContent=oOriginal2}}};
//*****************************************************************************
/**
 * @brief Zpracuje formulář v uživatelském rozhraní FamilyTree.
 * @param {unknown} oP25 Vstupní hodnota p; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function personForm(oP25){oP25=oP25||{is_living:1,gender:'other'};openModal(oP25.id?fnTr("Edit person"):fnTr("Add person"),
    fnHtml`<form id="hc-familytree-person-form" class="hc-familytree-form"><div class="hc-familytree-photo-preview">${oP25.photo_url?fnHtml`<img src="${fnEsc(oP25.photo_url)}">`:'👤'
    }</div><div class="hc-familytree-grid"><label>First name<input name="given_name" value="${fnEsc(oP25.given_name)}"></label><label>Last name<input name="surname" value="${fnEsc(oP25.surname)
    }"></label><label>Birth surname<input name="birth_surname" value="${fnEsc(oP25.birth_surname)
    }"></label><label>Gender<select name="gender"><option value="other">Unspecified</option><option value="female" ${oP25.gender==='female'?'selected':''}>Woman</option><option value="male" ${
    oP25.gender==='male'?'selected':''}>Man</option></select></label><label>Date of birth<input name="birth_date" value="${fnEsc(oP25.birth_date)
    }" placeholder="e.g. 12 Mar 1948"></label><label>Place of birth<input name="birth_place" value="${fnEsc(oP25.birth_place)}"></label><label>Date of death<input name="death_date" value="${
    fnEsc(oP25.death_date)}"></label><label>Place of death<input name="death_place" value="${fnEsc(oP25.death_place)}"></label><label>Occupation<input name="occupation" value="${fnEsc(oP25.occupation)
    }"></label><label>Photo URL<input name="photo_url" value="${fnEsc(oP25.photo_url)}"></label></div><label class="hc-familytree-check"><input type="checkbox" name="is_living" ${
    +oP25.is_living?'checked':''}> Living person</label><label>Notes</label><div id="hc-familytree-notes-editor"></div><textarea name="notes" hidden>${fnEsc(oP25.notes)
    }</textarea><div class="hc-familytree-form-actions">${oP25.id?fnLoc("<button type=\"button\" class=\"danger\" id=\"hc-familytree-delete-person\">Delete</button>"):''
    }<button type="button" data-close>Cancel</button><button class="primary">Save</button></div></form>`);const oNotesEditor=oCore.editor.create(fnValue('hc-familytree-notes-editor'),
    {value:String(oP25.notes||''),label:fnTr("Notes"),onChange:/** @h05-inline
 * @brief Provede vloženou callback operaci ve zpracovávaném rodokmenu.
 * @param {string} sValue10 Hodnota sValue10 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sValue10=>{fnValue('hc-familytree-person-form').elements.notes.value=sValue10}});fnModalCleanup=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>oNotesEditor.destroy();
    document.querySelector('[data-close]').onclick=closeModal;fnValue('hc-familytree-person-form').onsubmit=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @param {unknown} oE6 Hodnota oE6 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async oE6=>{oE6.preventDefault();const oD2=fnFormData(oE6.target);
    oD2.is_living=oE6.target.is_living.checked;const hButton4=oE6.target.querySelector('button.primary'),oOriginal3=hButton4.textContent;hButton4.disabled=true;hButton4.textContent=fnTr("Saving…");
    try{await fnApi(oP25.id?'/api/people/'+oP25.id:'/api/trees/'+nCurrent+'/people',{method:oP25.id?'PUT':'POST',body:JSON.stringify(oD2)});closeModal();await selectTree(nCurrent)}catch(oError8){
    fnToast(fnTr("Could not save person: ")+oError8.message,'error');hButton4.disabled=false;hButton4.textContent=oOriginal3}};if(oP25.id)fnValue('hc-familytree-delete-person').onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async()=>{
    if(await fnConfirmDialog({title:fnTr("Delete person?"),message:fnTr("The person and their relationships will be deleted."),confirmLabel:fnTr("Delete"),cancelLabel:fnTr("Cancel"),danger:true})){
    await fnApi('/api/people/'+oP25.id,{method:'DELETE'});closeModal();await selectTree(nCurrent)}}}
let oDrag=null,bSuppressCardClick=false,bCanvasGesture=null,bRightSelectionDragged=false;
// Touch gestures affect only the tree. One finger moves it; two fingers change its
// scale without resizing the whole Nextcloud page or interfering with mouse edits.
const oTreeView=fnValue('hc-familytree-canvas-wrap'),hTreeCanvas=fnValue('hc-familytree-canvas'),oTouches=new Map();
const oTreePanLayer=hTreeCanvas.parentElement;
let nTreeZoom=1,nTreePanX=0,nTreePanY=0,oPinch=null,bGestureMoved=false;
let bMobileViewMenuOpen=false;
let bAllowTouchCardDrag=false;try{bAllowTouchCardDrag=localStorage.getItem('hc_familytree:touch-card-drag')==='1'}catch(oValue2){}
let bShowEvidenceBadges=true;try{bShowEvidenceBadges=localStorage.getItem('hc_familytree:evidence-badges')!=='0'}catch(oValue3){}
 let bShowToolbarSummary=false;try{bShowToolbarSummary=localStorage.getItem('hc_familytree:toolbar-summary')==='1'}catch(oValue4){}
 let bAllowLegendDrag=true;try{bAllowLegendDrag=localStorage.getItem('hc_familytree:legend-draggable')!=='0'}catch(oValue5){}
 //*****************************************************************************
/**
 * @brief Synchronizuje legendu drag setting v uživatelském rozhraní FamilyTree.
 * @returns {void} Funkce nevrací hodnotu.
 */
function syncLegendDragSetting(){hLegend.classList.toggle('drag-disabled',!bAllowLegendDrag);fnValue('hc-familytree-legend-handle').hidden=!bAllowLegendDrag;}
 syncLegendDragSetting();
//*****************************************************************************
/**
 * @brief Zjistí, zda touch rodokmen v uživatelském rozhraní FamilyTree.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function isTouchTree(){return window.matchMedia('(max-width:760px)').matches}
// CZ: Posun a přiblížení se týkají pouze vnitřní vrstvy. Viewport se nikdy neškáluje.
//*****************************************************************************
/**
 * @brief Umístí rodokmen v uživatelském rozhraní FamilyTree.
 * @returns {void} Funkce nevrací hodnotu.
 */
function positionTree(){oTreePanLayer.style.transform=`translate3d(${nTreePanX}px,${nTreePanY}px,0) scale(${nTreeZoom})`}
//*****************************************************************************
/**
 * @brief Aktualizuje přiblížení label v uživatelském rozhraní FamilyTree.
 * @returns {void} Funkce nevrací hodnotu.
 */
function updateZoomLabel(){fnValue('hc-familytree-zoom-label').textContent=Math.round(nTreeZoom*100)+' %';oToolbarController?.update(fnToolbarActions())}
//*****************************************************************************
/**
 * @brief Použije rodokmen scale v uživatelském rozhraní FamilyTree.
 * @returns {void} Funkce nevrací hodnotu.
 */
function applyTreeScale(){
 // CZ: CSS zoom by měnil layoutové rozměry a zmenšoval viditelnou plochu.
 // Jediná transformace vnitřní vrstvy platí pro PC, dotyk a obě barevná témata.
 hTreeCanvas.style.zoom='1';hTreeCanvas.style.transform='';
 positionTree();
}
//*****************************************************************************
/**
 * @brief Synchronizuje pohled controls v uživatelském rozhraní FamilyTree.
 * @returns {void} Funkce nevrací hodnotu.
 */
function syncViewControls(){
 const oMobile=isTouchTree(),oToggle=fnValue('hc-familytree-view-toggle');
 oToggle.hidden=!oMobile;hViewControls.hidden=oMobile&&!bMobileViewMenuOpen;
 oToggle.setAttribute('aria-expanded',String(oMobile&&bMobileViewMenuOpen));
}
//*****************************************************************************
/**
 * @brief Nastaví mobile pohled nabídku v uživatelském rozhraní FamilyTree.
 * @param {boolean} bOpen2 Vstupní hodnota open; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function setMobileViewMenu(bOpen2){bMobileViewMenuOpen=!!bOpen2&&isTouchTree();syncViewControls()}
//*****************************************************************************
/**
 * @brief Zpracuje mobile rodokmen v uživatelském rozhraní FamilyTree.
 * @param {unknown} oPreferredZoom Vstupní hodnota preferredZoom; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function focusMobileTree(oPreferredZoom){
 if(!oState||!oTreeView.clientWidth||!oTreeView.clientHeight)return;
 nTreeZoom=oPreferredZoom??Math.min(1,Math.max(.8,(oTreeView.clientWidth-24)/300));
 applyTreeScale();
 const hRoot=hTreeCanvas.querySelector(`[data-person="${+oState.tree.root_person_id}"]`)||hTreeCanvas.querySelector('[data-person]');
 if(!hRoot)return;
 const oPerson8=byId(+hRoot.dataset.person);
 const nX9=(Number.parseFloat(hRoot.style.left)||0)+(+oPerson8.layout_x||0),nY3=(Number.parseFloat(hRoot.style.top)||0)+(+oPerson8.layout_y||0);
 nTreePanX=Math.round(oTreeView.clientWidth/2-(nX9+(hRoot.offsetWidth||174)/2)*nTreeZoom);
 nTreePanY=Math.round(oTreeView.clientHeight*.27-nY3*nTreeZoom);
 positionTree();updateZoomLabel();scheduleConnections();
}
//*****************************************************************************
/**
 * @brief Obnoví rodokmen pohled v uživatelském rozhraní FamilyTree.
 * @returns {void} Funkce nevrací hodnotu.
 */
function resetTreeView(){
 if(isTouchTree()){focusMobileTree(1);return}
 nTreeZoom=1;nTreePanX=0;nTreePanY=0;applyTreeScale();updateZoomLabel();scheduleConnections();
}
//*****************************************************************************
/**
 * @brief Změní přiblížení rodokmen v uživatelském rozhraní FamilyTree.
 * @param {unknown} oNext2 Vstupní hodnota next; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {number} nClientX Vstupní hodnota clientX; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {number} nClientY Vstupní hodnota clientY; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function zoomTree(oNext2,nClientX,nClientY){
 const nTarget=Math.max(.02,Math.min(3.5,oNext2));if(Math.abs(nTarget-nTreeZoom)<.005)return;
 const hRect2=oTreeView.getBoundingClientRect(),nX10=nClientX-hRect2.left,nY4=nClientY-hRect2.top,nRatio=nTarget/nTreeZoom;
 // CZ: Ukotvit bod pod kurzorem; šířka a výška viewportu jsou stále stejné.
 nTreePanX=nX10-(nX10-nTreePanX)*nRatio;nTreePanY=nY4-(nY4-nTreePanY)*nRatio;
 nTreeZoom=nTarget;applyTreeScale();updateZoomLabel();scheduleConnections();
}
//*****************************************************************************
/**
 * @brief Přizpůsobí rodokmen v uživatelském rozhraní FamilyTree.
 * @returns {void} Funkce nevrací hodnotu.
 */
function fitTree(){
 if(!oState||!oTreeView.clientWidth||!oTreeView.clientHeight)return;
 const nWidth2=Number.parseFloat(hTreeCanvas.style.width)||hTreeCanvas.scrollWidth;
 const nHeight2=Number.parseFloat(hTreeCanvas.style.height)||hTreeCanvas.scrollHeight;
 if(nWidth2<=0||nHeight2<=0)return;
 const nTarget2=Math.max(.02,Math.min(1,(oTreeView.clientWidth-28)/nWidth2,(oTreeView.clientHeight-28)/nHeight2));
 nTreeZoom=nTarget2;
 nTreePanX=Math.round((oTreeView.clientWidth-nWidth2*nTarget2)/2);
 nTreePanY=Math.round((oTreeView.clientHeight-nHeight2*nTarget2)/2);
 applyTreeScale();updateZoomLabel();scheduleConnections();
}
fnValue('hc-familytree-view-toggle').onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>setMobileViewMenu(!bMobileViewMenuOpen);
hViewControls.addEventListener('click',/** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @param {unknown} oEvent2 Hodnota oEvent2 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
oEvent2=>{if(isTouchTree()&&oEvent2.target.closest('button'))setMobileViewMenu(false)});
oTreeView.addEventListener('pointerdown',/** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
()=>{if(bMobileViewMenuOpen)setMobileViewMenu(false)});
document.addEventListener('pointerdown',/** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @param {unknown} oEvent3 Hodnota oEvent3 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
oEvent3=>{if(bMobileViewMenuOpen&&!hViewControls.contains(oEvent3.target)&&!fnValue('hc-familytree-view-toggle').contains(oEvent3.target))setMobileViewMenu(false)});
document.addEventListener('keydown',/** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @param {unknown} oEvent4 Hodnota oEvent4 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
oEvent4=>{if(oEvent4.key==='Escape'&&bMobileViewMenuOpen){setMobileViewMenu(false);fnValue('hc-familytree-view-toggle').focus()}});
const oLegendHandle=fnValue('hc-familytree-legend-handle'),oLegendStage=fnValue('hc-familytree-stage');
let oLegendDrag=null,oLegendSaved=null;
try{const oSaved=JSON.parse(localStorage.getItem('hc_familytree:legend-position-workspace')||'null');if(oSaved&&Number.isFinite(oSaved.x)&&Number.isFinite(oSaved.y))oLegendSaved=oSaved}catch(oValue6){}
// CZ: Souřadnice patří celé aplikaci, nikoliv jen viewportu kreslícího plátna.
// Legenda se po prvním přesunu stane přímým potomkem kořene (překryje i boční panel a lištu).
//*****************************************************************************
/**
 * @brief Zpracuje bounds v uživatelském rozhraní FamilyTree.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function legendBounds(){return {x:Math.max(8,oRoot.clientWidth-hLegend.offsetWidth-8),y:Math.max(8,oRoot.clientHeight-hLegend.offsetHeight-8)}}
//*****************************************************************************
/**
 * @brief Umístí legendu v uživatelském rozhraní FamilyTree.
 * @param {number} nX11 Vstupní hodnota x; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {number} nY5 Vstupní hodnota y; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function placeLegend(nX11,nY5){
 if(hLegend.parentElement!==oRoot)oRoot.appendChild(hLegend);
 hLegend.classList.add('is-moved');
 const oBound=legendBounds();
 hLegend.style.left=Math.round(Math.max(8,Math.min(oBound.x,nX11)))+'px';
 hLegend.style.top=Math.round(Math.max(8,Math.min(oBound.y,nY5)))+'px';
 hLegend.style.right='auto';hLegend.style.bottom='auto';
}
//*****************************************************************************
/**
 * @brief Zpracuje reset position v uživatelském rozhraní FamilyTree.
 * @returns {void} Funkce nevrací hodnotu.
 */
function legendResetPosition(){
 oLegendSaved=null;try{localStorage.removeItem('hc_familytree:legend-position-workspace')}catch(oValue7){}
 if(hLegend.parentElement!==oLegendStage)oLegendStage.insertBefore(hLegend,fnValue('hc-familytree-marquee'));
 hLegend.classList.remove('is-moved');hLegend.style.left='';hLegend.style.top='';hLegend.style.right='';hLegend.style.bottom='';
}
//*****************************************************************************
/**
 * @brief Obnoví legendu position v uživatelském rozhraní FamilyTree.
 * @returns {void} Funkce nevrací hodnotu.
 */
function restoreLegendPosition(){
 if(!oLegendSaved||!oLegendStage.clientWidth||!oRoot.clientWidth||oLegendDrag)return;
 const oBound2=legendBounds();placeLegend(8+oLegendSaved.x*(oBound2.x-8),8+oLegendSaved.y*(oBound2.y-8));
}
//*****************************************************************************
/**
 * @brief Uloží legendu position v uživatelském rozhraní FamilyTree.
 * @returns {void} Funkce nevrací hodnotu.
 */
function saveLegendPosition(){
 const oBound3=legendBounds();oLegendSaved={x:Math.max(0,Math.min(1,(parseFloat(hLegend.style.left)-8)/Math.max(1,oBound3.x-8))),y:Math.max(0,Math.min(1,(parseFloat(hLegend.style.top)-8)/Math.max(1,oBound3.y-8)))};
 try{localStorage.setItem('hc_familytree:legend-position-workspace',JSON.stringify(oLegendSaved))}catch(oValue8){}
}
oLegendHandle.addEventListener('pointerdown',/** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @param {unknown} oEvent5 Hodnota oEvent5 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
oEvent5=>{
 if(!bAllowLegendDrag||oEvent5.button!==0)return;
 const hBox2=hLegend.getBoundingClientRect(),hRootBox=oRoot.getBoundingClientRect();
 oLegendDrag={id:oEvent5.pointerId,x:oEvent5.clientX,y:oEvent5.clientY,left:hBox2.left-hRootBox.left,top:hBox2.top-hRootBox.top,moved:false};
 oEvent5.preventDefault();oEvent5.stopPropagation();
});
// CZ: Posloucháme okno, protože úchyt během přesunu změní rodičovský element.
window.addEventListener('pointermove',/** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @param {unknown} oEvent6 Hodnota oEvent6 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
oEvent6=>{
 if(!oLegendDrag||oLegendDrag.id!==oEvent6.pointerId)return;
 const nDx4=oEvent6.clientX-oLegendDrag.x,nDy4=oEvent6.clientY-oLegendDrag.y;
 if(!oLegendDrag.moved&&Math.hypot(nDx4,nDy4)<4)return;
 oLegendDrag.moved=true;placeLegend(oLegendDrag.left+nDx4,oLegendDrag.top+nDy4);
 oEvent6.preventDefault();
},{passive:false});
//*****************************************************************************
/**
 * @brief Dokončí legendu drag v uživatelském rozhraní FamilyTree.
 * @param {object} oEvent7 Vstupní hodnota event; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function finishLegendDrag(oEvent7){
 if(!oLegendDrag||oLegendDrag.id!==oEvent7.pointerId)return;
 const oMoved=oLegendDrag.moved;oLegendDrag=null;
 if(oMoved)saveLegendPosition();
}
window.addEventListener('pointerup',finishLegendDrag);
window.addEventListener('pointercancel',finishLegendDrag);
hLegend.addEventListener('toggle',/** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
()=>requestAnimationFrame(restoreLegendPosition));
fnValue('hc-familytree-zoom-in').onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>{const hR4=oTreeView.getBoundingClientRect();zoomTree(nTreeZoom*1.25,hR4.left+hR4.width/2,hR4.top+hR4.height/2)};
fnValue('hc-familytree-zoom-out').onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>{const hR5=oTreeView.getBoundingClientRect();zoomTree(nTreeZoom/1.25,hR5.left+hR5.width/2,hR5.top+hR5.height/2)};
fnValue('hc-familytree-zoom-label').onclick=resetTreeView;
fnValue('hc-familytree-fit').onclick=fitTree;
//*****************************************************************************
/**
 * @brief Přepočítá rodokmen v uživatelském rozhraní FamilyTree.
 * @returns {Promise<unknown>} Hodnota použitá volající částí rozhraní.
 */
async function reflowTree(){
 if(!oState?.canEdit||bLayoutBusy)return;
 const nTreeAtStart2=nCurrent,oTreeState5=oState;
 bLayoutBusy=true;updateHistoryButtons();
 try{
  const aMoved=oTreeState5.people.filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oPerson9 Hodnota oPerson9 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oPerson9=>(+oPerson9.layout_x||0)!==0||(+oPerson9.layout_y||0)!==0);
  if(aMoved.length&&!await fnConfirmDialog({title:fnTr("Arrange the tree?"),message:fnTr("Manual card positions will be removed. Press Ctrl+Z to undo."),confirmLabel:fnTr("Organize"),cancelLabel:fnTr("Cancel")}))return;
  if(nCurrent!==nTreeAtStart2||oState!==oTreeState5)return;
  if(aMoved.length){
   const aBefore=aMoved.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oPerson10 Hodnota oPerson10 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oPerson10=>({id:+oPerson10.id,x:+oPerson10.layout_x||0,y:+oPerson10.layout_y||0}));
   await fnApi('/api/trees/'+nTreeAtStart2+'/layout/reset',{method:'POST',body:'{}'});
   for(const oPerson11 of aMoved){oPerson11.layout_x=0;oPerson11.layout_y=0}
   recordLayoutChange(aBefore,aBefore.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oItem4 Hodnota oItem4 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oItem4=>({id:oItem4.id,x:0,y:0})),nTreeAtStart2,oTreeState5);
  }
  if(nCurrent===nTreeAtStart2)await selectTree(nTreeAtStart2);
 }catch(oError9){fnToast(fnTr("Could not arrange the tree: ")+oError9.message,'error')}
 finally{bLayoutBusy=false;updateHistoryButtons()}
}
fnValue('hc-familytree-reflow').onclick=reflowTree;
fnValue('hc-familytree-select').onclick=toggleSelectionMode;
fnValue('hc-familytree-clear-selection').onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>{oSelectedIds.clear();updateSelectionUI()};
oTreeView.addEventListener('wheel',/** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @param {unknown} oE7 Hodnota oE7 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
oE7=>{if(!oE7.deltaY)return;oE7.preventDefault();const nDelta=oE7.deltaY*(oE7.deltaMode===1?16:oE7.deltaMode===2?oTreeView.clientHeight:1);
    zoomTree(nTreeZoom*Math.exp(-Math.max(-240,Math.min(240,nDelta))*.002),oE7.clientX,oE7.clientY)},{passive:false});
oTreeView.addEventListener('pointerdown',/** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @param {unknown} oE8 Hodnota oE8 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
oE8=>{if(oE8.pointerType!=='touch'||oE8.target.closest('input,select,textarea'))return;oTouches.set(oE8.pointerId,{x:oE8.clientX,y:oE8.clientY});
    if(oTouches.size===2){const [oA24,oB24]=[...oTouches.values()];oPinch={distance:Math.hypot(oA24.x-oB24.x,oA24.y-oB24.y),zoom:nTreeZoom}}});
oTreeView.addEventListener('pointermove',/** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @param {unknown} oE9 Hodnota oE9 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
oE9=>{if(!oTouches.has(oE9.pointerId))return;const oPrev=oTouches.get(oE9.pointerId);oTouches.set(oE9.pointerId,{x:oE9.clientX,y:oE9.clientY});
    const nDx5=oE9.clientX-oPrev.x,nDy5=oE9.clientY-oPrev.y;if(Math.abs(nDx5)+Math.abs(nDy5)<=1)return;try{oTreeView.setPointerCapture(oE9.pointerId)}catch(oValue9){}bGestureMoved=true;if(oTouches.size===2&&oPinch){
    const [oA25,oB25]=[...oTouches.values()],nDistance3=Math.hypot(oA25.x-oB25.x,oA25.y-oB25.y);if(oPinch.distance>0)zoomTree(oPinch.zoom*nDistance3/oPinch.distance,(oA25.x+oB25.x)/2,(oA25.y+oB25.y)/2)}else if(oTouches.size===1){
    nTreePanX+=nDx5;nTreePanY+=nDy5;positionTree()}});
/**
 * @brief Ukončí dotykové ovládání stromu a připraví stav pro další gesto.
 * @param {unknown} oE10 Kontextová hodnota oE10 potřebná pro daný výpočet.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnEndTreeTouch=oE10=>{if(!oTouches.has(oE10.pointerId))return;oTouches.delete(oE10.pointerId);if(oTouches.size<2)oPinch=null;if(bGestureMoved){bSuppressCardClick=true;
    setTimeout(/** @h05-inline
 * @brief Provede odloženou akci po uplynutí požadovaného intervalu.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
()=>{bSuppressCardClick=false;bGestureMoved=false},80)}};
window.addEventListener('pointerup',fnEndTreeTouch);window.addEventListener('pointercancel',fnEndTreeTouch);
// Work in canvas coordinates so the same collision rules hold at every zoom.
//*****************************************************************************
/**
 * @brief Zpracuje skupinu to row v uživatelském rozhraní FamilyTree.
 * @param {Array<unknown>} aEntries Vstupní hodnota entries; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {unknown} bActive Vstupní hodnota active; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {number} nDx6 Vstupní hodnota dx; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {number} nDy6 Vstupní hodnota dy; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function snapGroupToRow(aEntries,bActive,nDx6,nDy6){
 let oNearest=null;
 for(const bMoving of aEntries){
  if(!bActive.has(bMoving.id))continue;
  const nLeft4=bMoving.baseX+bMoving.x+nDx6,nRight5=nLeft4+bMoving.w,nTop3=bMoving.baseY+bMoving.y+nDy6;
  for(const oNeighbor3 of aEntries){
   if(bActive.has(oNeighbor3.id))continue;
   const oOtherLeft=oNeighbor3.baseX+oNeighbor3.x,oOtherRight=oOtherLeft+oNeighbor3.w;
   const nHorizontalGap=Math.max(0,oOtherLeft-nRight5,nLeft4-oOtherRight);
   if(nHorizontalGap>110)continue;
   const oOtherTop=oNeighbor3.baseY+oNeighbor3.y,nDifference=oOtherTop-nTop3;
   if(Math.abs(nDifference)>18)continue;
   const nScore2=Math.abs(nDifference)+nHorizontalGap/30;
   if(!oNearest||nScore2<oNearest.score)oNearest={score: nScore2,difference: nDifference,guideY:oOtherTop+oNeighbor3.h/2};
  }
 }
 return oNearest?{dx: nDx6,dy:nDy6+oNearest.difference,guideY:oNearest.guideY}:{dx: nDx6,dy: nDy6,guideY:null};
}
//*****************************************************************************
/**
 * @brief Připraví room for skupinu v uživatelském rozhraní FamilyTree.
 * @param {Array<unknown>} aEntries2 Vstupní hodnota entries; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {unknown} bActive2 Vstupní hodnota active; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {number} nDx7 Vstupní hodnota dx; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {number} nDy7 Vstupní hodnota dy; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function makeRoomForGroup(aEntries2,bActive2,nDx7,nDy7){
 const oPlaced=new Map(aEntries2.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oEntry Hodnota oEntry předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oEntry=>[oEntry.id,{x:oEntry.baseX+oEntry.x,y:oEntry.baseY+oEntry.y,w:oEntry.w,h:oEntry.h}]));
 const aMoving=aEntries2.filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oEntry2 Hodnota oEntry2 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oEntry2=>bActive2.has(oEntry2.id));
 if(!aMoving.length)return oPlaced;
 nDx7=Math.max(nDx7,24-Math.min(...aMoving.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oEntry3 Hodnota oEntry3 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oEntry3=>oPlaced.get(oEntry3.id).x)));
 nDy7=Math.max(nDy7,24-Math.min(...aMoving.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oEntry4 Hodnota oEntry4 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oEntry4=>oPlaced.get(oEntry4.id).y)));
 for(const oEntry5 of aMoving){oPlaced.get(oEntry5.id).x+=nDx7;oPlaced.get(oEntry5.id).y+=nDy7}
 const oAxis=Math.abs(nDx7)>=Math.abs(nDy7)?'x':'y',oDirection3=(oAxis==='x'?nDx7:nDy7)<0?-1:1,nGap=18;
 const oAffected=new Set(aMoving.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oEntry6 Hodnota oEntry6 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oEntry6=>oEntry6.id));
 for(let nPass2=0;nPass2<aEntries2.length*2;nPass2++){
  let bChanged2=false;
  for(const sSource3 of aEntries2){
   if(!oAffected.has(sSource3.id))continue;
   const oA26=oPlaced.get(sSource3.id);
   for(const oTarget3 of aEntries2){
    if(bActive2.has(oTarget3.id)||oTarget3.id===sSource3.id)continue;
    const oB26=oPlaced.get(oTarget3.id);
    if(oA26.x>=oB26.x+oB26.w+nGap||oA26.x+oA26.w+nGap<=oB26.x||oA26.y>=oB26.y+oB26.h+nGap||oA26.y+oA26.h+nGap<=oB26.y)continue;
    const oRequired=oDirection3>0?oA26[oAxis]+(oAxis==='x'?oA26.w:oA26.h)+nGap:oA26[oAxis]-(oAxis==='x'?oB26.w:oB26.h)-nGap;
    if(oDirection3*(oRequired-oB26[oAxis])<=.5)continue;
    oB26[oAxis]=oRequired;oAffected.add(oTarget3.id);bChanged2=true;
   }
  }
  if(!bChanged2)break;
 }
 // Keep the newly opened space reachable at the left and top canvas edges.
 const nMinX2=Math.min(...[...oPlaced.values()].map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oPoint6 Hodnota oPoint6 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oPoint6=>oPoint6.x)),nMinY=Math.min(...[...oPlaced.values()].map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oPoint7 Hodnota oPoint7 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oPoint7=>oPoint7.y));
 if(nMinX2<24||nMinY<24)for(const oPoint8 of oPlaced.values()){
  oPoint8.x+=Math.max(0,24-nMinX2);oPoint8.y+=Math.max(0,24-nMinY);
 }
 return oPlaced;
}
//*****************************************************************************
/**
 * @brief Zahájí kartu drag v uživatelském rozhraní FamilyTree.
 * @param {unknown} oE11 Vstupní hodnota e; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {unknown} aIds6 Vstupní hodnota ids; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {unknown} oCaptureTarget Vstupní hodnota captureTarget; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function beginCardDrag(oE11,aIds6,oCaptureTarget){
 const bActive3=new Set(aIds6),aEntries3=[...hTreeCanvas.querySelectorAll('[data-person]')].map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oCard4 Hodnota oCard4 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oCard4=>{
  const nId21=+oCard4.dataset.person,oPerson12=byId(nId21),hBounds=oCard4.getBoundingClientRect();
  return {id: nId21,person: oPerson12,card: oCard4,baseX:Number.parseFloat(oCard4.style.left)||0,baseY:Number.parseFloat(oCard4.style.top)||0,
   x:+oPerson12.layout_x||0,y:+oPerson12.layout_y||0,w:hBounds.width/nTreeZoom||oCard4.offsetWidth||210,h:hBounds.height/nTreeZoom||oCard4.offsetHeight||78};
 });
 oDrag={id:oE11.pointerId,startX:oE11.clientX,startY:oE11.clientY,moved:false,active: bActive3,entries: aEntries3,placed:null};
 oCaptureTarget.setPointerCapture?.(oE11.pointerId);
 if(oE11.shiftKey)oE11.preventDefault();
}
//*****************************************************************************
/**
 * @brief Připraví náhled kartu drag v uživatelském rozhraní FamilyTree.
 * @param {unknown} oCurrentDrag Vstupní hodnota currentDrag; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {number} nDx8 Vstupní hodnota dx; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {number} nDy8 Vstupní hodnota dy; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function previewCardDrag(oCurrentDrag,nDx8,nDy8){
 const oSnap=snapGroupToRow(oCurrentDrag.entries,oCurrentDrag.active,nDx8,nDy8);
 const hGuide=hTreeCanvas.querySelector('.hc-familytree-snap-guide');
 if(hGuide){hGuide.hidden=oSnap.guideY===null;if(oSnap.guideY!==null)hGuide.style.top=Math.round(oSnap.guideY)+'px'}
 const oPlaced2=makeRoomForGroup(oCurrentDrag.entries,oCurrentDrag.active,oSnap.dx,oSnap.dy);oCurrentDrag.placed=oPlaced2;
 for(const oEntry7 of oCurrentDrag.entries){
  const oPoint9=oPlaced2.get(oEntry7.id),nX12=Math.round(oPoint9.x-oEntry7.baseX),nY6=Math.round(oPoint9.y-oEntry7.baseY);
  oEntry7.person.layout_x=nX12;oEntry7.person.layout_y=nY6;
  oEntry7.card.style.setProperty('--hc-familytree-dx',nX12+'px');oEntry7.card.style.setProperty('--hc-familytree-dy',nY6+'px');
  oEntry7.card.classList.toggle('dragging',oCurrentDrag.active.has(oEntry7.id));
  oEntry7.card.classList.toggle('pushed',!oCurrentDrag.active.has(oEntry7.id)&&(nX12!==oEntry7.x||nY6!==oEntry7.y));
 }
 const nRight6=Math.max(...[...oPlaced2.values()].map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oPoint10 Hodnota oPoint10 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oPoint10=>oPoint10.x+oPoint10.w))+40;
 const nBottom2=Math.max(...[...oPlaced2.values()].map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oPoint11 Hodnota oPoint11 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oPoint11=>oPoint11.y+oPoint11.h))+40;
 hTreeCanvas.style.width=Math.max(Number.parseFloat(hTreeCanvas.style.width)||0,Math.ceil(nRight6))+'px';
 hTreeCanvas.style.height=Math.max(Number.parseFloat(hTreeCanvas.style.height)||0,Math.ceil(nBottom2))+'px';
 scheduleConnections();
}
oTreeView.addEventListener('pointerdown',/** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @param {unknown} oE12 Hodnota oE12 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
oE12=>{if(oE12.pointerType!=='mouse'||![0,2].includes(oE12.button)||bLayoutBusy)return;
 if(oE12.button===2)bRightSelectionDragged=false;
 if(oE12.target.closest('[data-person]'))return;
 if(oE12.button===0&&oE12.shiftKey&&oSelectedIds.size&&oState?.canEdit){beginCardDrag(oE12,[...oSelectedIds],oTreeView);return}
 const hStage=fnValue('hc-familytree-stage').getBoundingClientRect();bCanvasGesture={id:oE12.pointerId,button:oE12.button,mode:oE12.button===2||oE12.shiftKey?'select':'pan',x:oE12.clientX,y:oE12.clientY,
    left:nTreePanX,top:nTreePanY,stage: hStage,moved:false,add:oE12.ctrlKey||oE12.metaKey};
 oTreeView.setPointerCapture?.(oE12.pointerId);if(bCanvasGesture.mode==='select'){oTreeView.classList.add('is-selecting');oE12.preventDefault()}else oTreeView.classList.add('is-panning')});
oTreeView.addEventListener('pointermove',/** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @param {unknown} oE13 Hodnota oE13 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
oE13=>{const oG=bCanvasGesture;if(!oG||oG.id!==oE13.pointerId)return;
 if(Math.hypot(oE13.clientX-oG.x,oE13.clientY-oG.y)>5)oG.moved=true;
 if(oG.mode==='pan'){nTreePanX=oG.left+oE13.clientX-oG.x;nTreePanY=oG.top+oE13.clientY-oG.y;positionTree();return}
 const oBox=fnValue('hc-familytree-marquee');oBox.hidden=false;oBox.style.left=Math.min(oG.x,oE13.clientX)-oG.stage.left+'px';oBox.style.top=Math.min(oG.y,oE13.clientY)-oG.stage.top+'px';
    oBox.style.width=Math.abs(oE13.clientX-oG.x)+'px';oBox.style.height=Math.abs(oE13.clientY-oG.y)+'px';
});
//*****************************************************************************
/**
 * @brief Ukončí canvas gesture v uživatelském rozhraní FamilyTree.
 * @param {unknown} oE14 Vstupní hodnota e; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function endCanvasGesture(oE14){const oG2=bCanvasGesture;if(!oG2||oG2.id!==oE14.pointerId)return;bCanvasGesture=null;oTreeView.classList.remove('is-panning','is-selecting');fnValue('hc-familytree-marquee').hidden=true;
 if(oG2.button===2&&oG2.moved)bRightSelectionDragged=true;
 if(oG2.mode==='select'&&oG2.moved){if(!oG2.add)oSelectedIds.clear();const nLeft5=Math.min(oG2.x,oE14.clientX),nRight7=Math.max(oG2.x,oE14.clientX),nTop4=Math.min(oG2.y,oE14.clientY),nBottom3=Math.max(oG2.y,oE14.clientY);
  hTreeCanvas.querySelectorAll('[data-person]').forEach(/** @h05-inline
 * @brief Zpracuje jeden prvek kolekce při průchodu záznamy.
 * @param {HTMLElement} hEl5 Hodnota hEl5 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
hEl5=>{const hR6=hEl5.getBoundingClientRect();if(hR6.left<nRight7&&hR6.right>nLeft5&&hR6.top<nBottom3&&hR6.bottom>nTop4)oSelectedIds.add(+hEl5.dataset.person)});updateSelectionUI()}
 else if(!oG2.moved&&!oE14.target.closest?.('[data-person]')){oSelectedIds.clear();updateSelectionUI()}
}
window.addEventListener('pointerup',endCanvasGesture);window.addEventListener('pointercancel',endCanvasGesture);
oTreeView.addEventListener('contextmenu',/** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @param {unknown} oE15 Hodnota oE15 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
oE15=>{
 oE15.preventDefault();if(bRightSelectionDragged){bRightSelectionDragged=false;return}
 const hCard=oE15.target.closest?.('[data-person]');if(!hCard)return;
 const nId22=+hCard.dataset.person;if(oSelectedIds.has(nId22))oSelectedIds.delete(nId22);else oSelectedIds.add(nId22);updateSelectionUI();
});
hTreeCanvas.addEventListener('pointerdown',/** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @param {unknown} oE16 Hodnota oE16 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
oE16=>{const hCard2=oE16.target.closest('[data-person]');
    if(!hCard2||!oState?.canEdit||bLayoutBusy||oE16.button!==0||!(oE16.pointerType==='mouse'||(oE16.pointerType==='touch'&&(bAllowTouchCardDrag||bSelectionMode)&&isTouchTree())))return;
 oE16.stopPropagation();const nId23=+hCard2.dataset.person,aIds7=oSelectedIds.has(nId23)?[...oSelectedIds]:[nId23];
 beginCardDrag(oE16,aIds7,hCard2);
});
oTreeView.addEventListener('pointermove',/** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @param {unknown} oE17 Hodnota oE17 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
oE17=>{if(!oDrag||oDrag.id!==oE17.pointerId)return;const nDx9=oE17.clientX-oDrag.startX,nDy9=oE17.clientY-oDrag.startY;
 if(!oDrag.moved&&Math.hypot(nDx9,nDy9)<5)return;oDrag.moved=true;
 previewCardDrag(oDrag,nDx9/nTreeZoom,nDy9/nTreeZoom);
});
oTreeView.addEventListener('pointerup',/** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @param {unknown} oE18 Hodnota oE18 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
async oE18=>{if(!oDrag||oDrag.id!==oE18.pointerId)return;const bDone=oDrag;oDrag=null;if(!bDone.moved)return;
 previewCardDrag(bDone,(oE18.clientX-bDone.startX)/nTreeZoom,(oE18.clientY-bDone.startY)/nTreeZoom);
 bSuppressCardClick=true;oE18.preventDefault();
 const aPositions2=bDone.entries.filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oEntry8 Hodnota oEntry8 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oEntry8=>oEntry8.person.layout_x!==oEntry8.x||oEntry8.person.layout_y!==oEntry8.y)
  .map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oEntry9 Hodnota oEntry9 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oEntry9=>({id:oEntry9.id,x:oEntry9.person.layout_x,y:oEntry9.person.layout_y}));
 const aBefore2=aPositions2.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oItem5 Hodnota oItem5 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oItem5=>{const oEntry10=bDone.entries.find(/** @h05-inline
 * @brief Vyhledá první záznam splňující danou podmínku.
 * @param {string} sValue11 Hodnota sValue11 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sValue11=>sValue11.id===oItem5.id);return {id:oItem5.id,x:oEntry10.x,y:oEntry10.y}});
 const nTreeAtStart3=nCurrent,oTreeState6=oState;
 bLayoutBusy=true;updateHistoryButtons();
 try{
  await persistLayoutPositions(aPositions2,nTreeAtStart3);
  recordLayoutChange(aBefore2,aPositions2,nTreeAtStart3,oTreeState6);
  if(nCurrent===nTreeAtStart3){if(oState===oTreeState6)render();else await selectTree(nTreeAtStart3)}
 }catch(oError10){for(const oEntry11 of bDone.entries){oEntry11.person.layout_x=oEntry11.x;oEntry11.person.layout_y=oEntry11.y}if(nCurrent===nTreeAtStart3){if(oState===oTreeState6)render();
    else await selectTree(nTreeAtStart3)}fnToast(fnTr("Could not save position: ")+oError10.message,'error')}
 finally{bLayoutBusy=false;updateHistoryButtons()}
 setTimeout(/** @h05-inline
 * @brief Provede odloženou akci po uplynutí požadovaného intervalu.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
()=>bSuppressCardClick=false,0);
});
oTreeView.addEventListener('pointercancel',/** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
()=>{if(oDrag){for(const oEntry12 of oDrag.entries){oEntry12.person.layout_x=oEntry12.x;oEntry12.person.layout_y=oEntry12.y}oDrag=null;render()}});
hTreeCanvas.onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @param {unknown} oE19 Hodnota oE19 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oE19=>{if(bSuppressCardClick)return;const hB=oE19.target.closest('[data-person]');if(!hB)return;
 const nId24=+hB.dataset.person;if(bSelectionMode||oE19.ctrlKey||oE19.metaKey){if(oSelectedIds.has(nId24))oSelectedIds.delete(nId24);else oSelectedIds.add(nId24);updateSelectionUI();return}personDetail(nId24)
};
oRoot.addEventListener('keydown',/** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @param {unknown} oE20 Hodnota oE20 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
oE20=>{if(oE20.key==='Escape'&&oSelectedIds.size){oSelectedIds.clear();updateSelectionUI()}});
//*****************************************************************************
/**
 * @brief Zpracuje row v uživatelském rozhraní FamilyTree.
 * @param {number} nX13 Vstupní hodnota x; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function documentRow(nX13){return fnHtml`<div class="hc-familytree-document"><div class="hc-familytree-doc-icon">${nX13.mime_type?.includes('pdf')?'📕':nX13.mime_type?.startsWith('image/')?'🖼️':'📄'
    }</div><div><a href="${fnEsc(fileUrl(nX13.file_path))}" target="_blank" rel="noopener"><b>${fnEsc(nX13.title)}</b></a><small>${fnEsc(nX13.document_type||fnTr("Document"))}${
    nX13.document_date?' · '+fnEsc(nX13.document_date):''}${nX13.place?' · '+fnEsc(nX13.place):''}</small><small>${fnEsc(nX13.archive||'')}${nX13.signature?' · sign. '+fnEsc(nX13.signature):''}</small></div>${
    oState.canEdit?fnHtml`<div class="hc-familytree-doc-actions"><button data-edit-doc="${nX13.id}" title="Edit">✏️</button><button data-del-doc="${nX13.id}" title="Delete">×</button></div>`:''}</div>`}
//*****************************************************************************
/**
 * @brief Ověří bezpečnost pramen url v uživatelském rozhraní FamilyTree.
 * @param {unknown} sValue12 Vstupní hodnota value; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function safeSourceUrl(sValue12){try{const sUrl=new URL(sValue12);return ['http:','https:'].includes(sUrl.protocol)?sUrl.href:''}catch{return ''}}
// CZ: Náhled vytváříme jen pro lokálně uložené obrázky. Server při každém požadavku
// ověřuje přístup ke stromu, MIME a velikost. Externí adresy necháváme jako odkazy.
//*****************************************************************************
/**
 * @brief Zpracuje média preview v uživatelském rozhraní FamilyTree.
 * @param {object} oRecord Vstupní hodnota record; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function researchMediaPreview(oRecord){
 if(!oRecord?.media_path)return '';
 const sUrl2=researchMediaUrl(oRecord.id),sName=oRecord.data?.title||oRecord.data?.file_name||oRecord.external_id;
 return fnHtml`<a class="hc-familytree-media-thumbnail" href="${fnEsc(sUrl2)}" target="_blank" rel="noopener" title="${fnEsc(sName)}"><img src="${fnEsc(sUrl2)}" loading="lazy" alt="${fnEsc(sName)}"></a>`;
}
//*****************************************************************************
/**
 * @brief Zpracuje archivní identity v uživatelském rozhraní FamilyTree.
 * @param {object} oRecord2 Vstupní hodnota record; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function legacyIdentity(oRecord2){
 const oData=oRecord2.data||{};
 if(oRecord2.entity_type==='research_facts')return oData.external_fact_id||oRecord2.external_id;
 if(oRecord2.entity_type==='research')return oData.external_task_id||oRecord2.external_id;
 return oRecord2.external_id||oRecord2.stable_id||('DB '+oRecord2.id);
}
//*****************************************************************************
/**
 * @brief Zpracuje archivní kind v uživatelském rozhraní FamilyTree.
 * @param {object} oRecord3 Vstupní hodnota record; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function legacyKind(oRecord3){
 return {persons:'P – osoby',research_facts:'F – jednotlivá tvrzení',research:'Q – výzkumné úkoly',sources:'S – prameny a knihy',citations:'C – citace',media:'M – skeny a fotografie',
    events:'E – události',relationships:'R – vztahy',families:'Rodiny',facts:'Další fakta',places:'Místa',notes:'Poznámky',note_links:'Vazby poznámek',package:'Importní sada',
    import_report:'Report importu'}[oRecord3.entity_type]||oRecord3.entity_type;
}
// CZ: Původní úkoly Q mohou být pouze v poznámkách osob. Zobrazujeme je jako
// read-only projekci a nezakládáme v databázi duplicitní výzkumné úkoly.
//*****************************************************************************
/**
 * @brief Zpracuje archivní výzkum tasks v uživatelském rozhraní FamilyTree.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function legacyResearchTasks(){
 // CZ: Promítneme původní Q bez INSERT/UPDATE. Klíč tvoří původ + označení Q.
 // Rozdílné původy se neslučují bez jednoznačné vazby; neměníme state.research.
 const aTasks=researchRows('research').map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oRow6 Hodnota oRow6 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oRow6=>({...oRow6,data:{...(oRow6.data||{})},native_person_ids:[]}));
 const oByPerson=new Map((oState?.people||[]).map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oP26 Hodnota oP26 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oP26=>[+oP26.id,importedPersonIds(oP26.id)]));
 /**
 * @brief Sestaví normalizovaný klíč pro kód záznamu.
 * @param {unknown} oRow7 Kontextová hodnota oRow7 potřebná pro daný výpočet.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnCodeKey=oRow7=>String(legacyIdentity(oRow7)||'').trim().toUpperCase();
 for(const oPerson13 of oState?.people||[]){
  const sNotes=String(oPerson13.notes||'').replace(/\r\n?/g,'\n');
  const aHeaders=[...sNotes.matchAll(/(?:^|\n)[ \t]*Výzkumný[ \t]+úkol[ \t]+(Q\d{3,8})[ \t]*[—–-][ \t]*([^\n]*)/gim)];
  for(let nI12=0;nI12<aHeaders.length;nI12++){
   const oMatch3=aHeaders[nI12],sCode=oMatch3[1].toUpperCase();
   const sFragment=sNotes.slice(oMatch3.index,aHeaders[nI12+1]?.index??sNotes.length);
   /**
 * @brief Získá z formuláře nebo objektu hodnotu zvoleného pole.
 * @param {string} sName2 Textový parametr sName2 předaný operaci.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnField=sName2=>{
    const oLine=sFragment.match(new RegExp('(?:^|\\n)[ \\t]*'+sName2+'[ \\t]*:[ \\t]*([^\\n]*)','i'));
    return (oLine?.[1]||'').trim();
   };
   const aRelated=aTasks.filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oT3 Hodnota oT3 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oT3=>fnCodeKey(oT3)===sCode);
   // Vybereme jednoznačně odpovídající historickou položku podle propojení P.
   const aLinked=aRelated.filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oT4 Hodnota oT4 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oT4=>(oT4.data.target_person_ids||[]).some(/** @h05-inline
 * @brief Ověří, zda prvek kolekce vyhovuje požadované podmínce.
 * @param {unknown} oRef Hodnota oRef předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oRef=>oByPerson.get(+oPerson13.id)?.has(oT4.origin_key+'/'+oRef)));
   const oExisting=aLinked.length===1?aLinked[0]:(aRelated.length===1?aRelated[0]:null);
   if(oExisting){
    if(!oExisting.native_person_ids.includes(+oPerson13.id))oExisting.native_person_ids.push(+oPerson13.id);
    for(const [sKey9,sLabel7] of [['attempts','Pokusy'],['result','Výsledek'],['next_step','Další krok'],['checkpoint','CHECKPOINT'],['target_text','Cíl']]){
     if(!oExisting.data[sKey9]&&fnField(sLabel7))oExisting.data[sKey9]=fnField(sLabel7);
    }
    continue;
   }
   // Když existuje více Q stejného čísla, necháváme archivní položky oddělené.
   const aRow={id:'notes:'+oPerson13.id+':'+sCode,entity_type:'research',origin_key:'person-notes:'+oPerson13.id,external_id:sCode,native_person_ids:[+oPerson13.id],data:{external_task_id:sCode,
    title:oMatch3[2].trim(),question:oMatch3[2].trim(),status:fnField('Stav').replace(/[. ]+$/,'').toLowerCase()||'unknown',attempts:fnField('Pokusy'),result:fnField('Výsledek'),
    next_step:fnField('Další krok'),checkpoint:fnField('CHECKPOINT'),target_text:fnField('Cíl'),from_person_notes:true}};
   aTasks.push(aRow);
  }
 }
 // Výslovné target_person_ids propojí Q s nativními osobami, i když v poznámce Q není.
 for(const oTask of aTasks){
  for(const [sId28,oRefs] of oByPerson){
   if(oTask.native_person_ids.includes(sId28))continue;
   if((oTask.data.target_person_ids||[]).some(/** @h05-inline
 * @brief Ověří, zda prvek kolekce vyhovuje požadované podmínce.
 * @param {unknown} oRef2 Hodnota oRef2 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oRef2=>oRefs.has(oTask.origin_key+'/'+oRef2)))oTask.native_person_ids.push(sId28);
  }
 }
 return aTasks;
}
//*****************************************************************************
/**
 * @brief Zpracuje archivní osobu native id v uživatelském rozhraní FamilyTree.
 * @param {object} oRecord4 Vstupní hodnota record; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function legacyPersonNativeId(oRecord4){
 if(oRecord4.native_person_ids?.length)return +oRecord4.native_person_ids[0];
 if(oRecord4.entity_type==='persons')return +oRecord4.native_id||0;
 const oData2=oRecord4.data||{},sOrigin=oRecord4.origin_key;
 const aImportedIds=[oData2.subject_id,oData2.owner_id,oData2.person_id,oData2.linked_entity_id,oData2.person1_id,oData2.person2_id].filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oV Hodnota oV předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oV=>typeof oV==='string'||typeof oV==='number');
 const aPeople3=researchRows('persons');
 for(const sValue13 of aImportedIds){
  for(const sRaw of String(sValue13).split('|')){
   const oPerson14=aPeople3.find(/** @h05-inline
 * @brief Vyhledá první záznam splňující danou podmínku.
 * @param {unknown} oP27 Hodnota oP27 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oP27=>oP27.origin_key===sOrigin&&oP27.external_id===sRaw);
   if(oPerson14?.native_id)return +oPerson14.native_id;
  }
 }
 return 0;
}
//*****************************************************************************
/**
 * @brief Zpracuje archivní záznam text v uživatelském rozhraní FamilyTree.
 * @param {object} oRecord5 Vstupní hodnota record; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function legacyRecordText(oRecord5){
 const aValues4=[legacyIdentity(oRecord5),legacyKind(oRecord5),oRecord5.origin_key,oRecord5.external_id];
 // CZ: Výchozí hledání zahrnuje signatury, lokátory, přepisy i externí ID.
 try{aValues4.push(JSON.stringify(oRecord5.data||{}))}catch(oValue10){}
 return aValues4.join(' ').toLocaleLowerCase('cs');
}
//*****************************************************************************
/**
 * @brief Zpracuje archivní osobu options v uživatelském rozhraní FamilyTree.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function legacyPersonOptions(){
 return (oState?.people||[]).map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oP28 Hodnota oP28 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oP28=>{
  const aIdentities=[...importedPersonIds(oP28.id)].map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {number} nX14 Hodnota nX14 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
nX14=>nX14.split('/').pop());
  return fnHtml`<option value="${oP28.id}">${fnEsc((oP28.given_name+' '+oP28.surname).trim())}${aIdentities.length?' · '+fnEsc(aIdentities.join(', ')):''}</option>`;
 }).join('');
}
//*****************************************************************************
/**
 * @brief Zpracuje archivní pramen for v uživatelském rozhraní FamilyTree.
 * @param {object} oRecord6 Vstupní hodnota record; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function legacySourceFor(oRecord6){
 const sOrigin2=oRecord6.origin_key,oSourceId=oRecord6.data?.source_id;
 return oSourceId?researchRows('sources').find(/** @h05-inline
 * @brief Vyhledá první záznam splňující danou podmínku.
 * @param {unknown} oR8 Hodnota oR8 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR8=>oR8.origin_key===sOrigin2&&oR8.external_id===oSourceId):null;
}
//*****************************************************************************
/**
 * @brief Zpracuje archivní média item v uživatelském rozhraní FamilyTree.
 * @param {object} oRecord7 Vstupní hodnota record; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function legacyMediaItem(oRecord7){
 const sTitle2=oRecord7.data?.title||oRecord7.data?.file_name||legacyIdentity(oRecord7);
 const sSource4=legacySourceFor(oRecord7),oSourceUrl=safeSourceUrl(oRecord7.data?.url||sSource4?.data?.url||'');
 const oLocal=oRecord7.media_path?researchMediaUrl(oRecord7.id):'';
 const sType5=oRecord7.data?.media_type||oRecord7.data?.form||fnTr("image");
 return fnHtml`<article class="hc-familytree-media-card">${researchMediaPreview(oRecord7)}<div class="hc-familytree-media-description"><strong>${fnEsc(sTitle2)}</strong><small>${
    fnEsc(legacyIdentity(oRecord7))} · ${fnEsc(sType5)}</small>${sSource4?fnHtml`<small>${fnEsc([sSource4.data?.archive,sSource4.data?.signatura,sSource4.data?.title].filter(Boolean).join(' · '))}</small>`:''}${
    oRecord7.data?.rights?fnHtml`<small>${fnTr("Rights")}: ${fnEsc(oRecord7.data.rights)}</small>`:''}<div class="hc-familytree-media-links">${oLocal?fnHtml`<a href="${fnEsc(oLocal)
    }" target="_blank" rel="noopener">${fnTr("Open saved scan / photograph")}</a>`:''}${oSourceUrl?fnHtml`<a href="${fnEsc(oSourceUrl)}" target="_blank" rel="noopener noreferrer">${
    fnTr("Open archival source")}</a>`:''}</div></div></article>`;
}
//*****************************************************************************
/**
 * @brief Zpracuje archivní záznam stav v uživatelském rozhraní FamilyTree.
 * @param {object} oRecord8 Vstupní hodnota record; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function legacyRecordStatus(oRecord8){
 // CZ: Archiv obsahuje více typů záznamů; stav úkolu a ověření tvrzení
 // jsou odlišné pojmy, filtr je ale smí prohledávat stejným výběrem.
 const oData3=oRecord8.data||{};
 return fnJournalNormalizeStatus(oData3.status||oData3.verification_status||oData3.research_status||'');
}
//*****************************************************************************
/**
 * @brief Zpracuje archivní výzkumný deník pohled v uživatelském rozhraní FamilyTree.
 * @param {string} sKind2 Vstupní hodnota kind; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function legacyJournalView(sKind2){
 const aAll2=(oState?.research||[]).filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oR9 Hodnota oR9 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oR9=>sKind2==='media'?oR9.entity_type==='media':!['import_report','package','research'].includes(oR9.entity_type)).concat(sKind2==='archive'?legacyResearchTasks():[]);
 const aSources=researchRows('sources'),oMedia=researchRows('media');
 return fnHtml`<div class="hc-familytree-legacy-journal" data-legacy-view="${sKind2}">
 <p class="hc-familytree-hint">${sKind2==='media'?
    fnTr("Original scans and photos from imported archives. Thumbnails use protected Nextcloud storage. Remote links are never fetched automatically."):
    fnTr("Original P, F, Q, S and other IDs are read directly from saved research. Nothing is overwritten or duplicated.")}</p>
 <div class="hc-familytree-legacy-filters"><label>${fnTr("Search ID, person, archive signature, book or text")}<input type="search" data-legacy-search placeholder="${
    fnTr("For example P0027, F00274, Q0003, 12437…")}"></label><label>${fnTr("Person")}<select data-legacy-person><option value="">${fnTr("All persons")}</option>${legacyPersonOptions()
    }</select></label>${sKind2!=='media'?fnHtml`<label>${fnTr("Record type")}<select data-legacy-kind><option value="">${fnTr("All types")}</option>${
    [...new Set(aAll2.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR10 Hodnota oR10 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR10=>oR10.entity_type))].sort().map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {string} sType6 Hodnota sType6 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sType6=>fnHtml`<option value="${fnEsc(sType6)}">${fnEsc(legacyKind({entity_type:sType6}))}</option>`).join('')}</select></label>`:''}${
    sKind2==='archive'?fnHtml`<label>${fnTr("Status / verification")}<select data-legacy-status>${journalStatusFilterOptions(aAll2.map(legacyRecordStatus))}</select></label>`:''}</div>
 ${sKind2==='archive'?fnHtml`<details class="hc-familytree-identity-legend"><summary>${fnTr("Meaning of identifiers and their history")}</summary><dl><div><dt>P</dt><dd>${
    fnTr("Person – original portable family-tree identifier")}</dd></div><div><dt>F</dt><dd>${fnTr("Individual claim about a person, relationship or event; variants remain separate")
    }</dd></div><div><dt>Q</dt><dd>${fnTr("Research task, status, attempts and next steps")}</dd></div><div><dt>S</dt><dd>${fnTr("Source or register with archive signature and metadata")
    }</dd></div><div><dt>C / M</dt><dd>${fnTr("Citation / media: scan, document, photograph")}</dd></div><div><dt>R / E</dt><dd>${
    fnTr("Relationship / event; original dataset identifier preserved")}</dd></div></dl><small>${
    fnTr("Record type from the original import determines meaning, not just the first letter. IDs are scoped to their origin_key. SQL IDs are not portable genealogy IDs.")}</small></details>`:''}
 <p class="hc-familytree-hint" data-legacy-count role="status"></p><div data-legacy-results class="hc-familytree-legacy-results"></div>
 ${sKind2==='media'?fnHtml`<p class="hc-familytree-hint">${aSources.length} ${fnTr("saved source descriptions")} · ${oMedia.filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oR11 Hodnota oR11 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oR11=>oR11.media_path).length} ${fnTr("locally saved images")} · ${
    oMedia.length} ${fnTr("registered media")}</p><details><summary>${fnTr("Person photographs and attached documents")}</summary><div class="hc-familytree-media-grid">${
    (oState?.people||[]).filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oP29 Hodnota oP29 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oP29=>oP29.photo_url).map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oP30 Hodnota oP30 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oP30=>{const oU=safeSourceUrl(oP30.photo_url);return fnHtml`<article class="hc-familytree-media-card" data-media-native-person="${oP30.id}"><strong>${
    fnEsc((oP30.given_name+' '+oP30.surname).trim())}</strong>${oU?fnHtml`${new URL(oU).origin===window.location.origin?fnHtml`<a class="hc-familytree-media-thumbnail" href="${fnEsc(oU)
    }" target="_blank" rel="noopener"><img src="${fnEsc(oU)}" loading="lazy" alt="${fnEsc((oP30.given_name+' '+oP30.surname).trim())}"></a>`:fnHtml`<button type="button" data-load-external-photo="${fnEsc(oU)
    }">${fnTr("Load external photo preview")}</button>`}<a href="${fnEsc(oU)}" target="_blank" rel="noopener noreferrer">${fnTr("Open person photograph")}</a>`:fnHtml`<small>${
    fnTr("Invalid or local photograph URL")}</small>`}</article>`}).join('')}${(oState?.documents||[]).map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oDoc Hodnota oDoc předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oDoc=>fnHtml`<article class="hc-familytree-media-card" data-media-native-document="${oDoc.id
    }"><strong>${fnEsc(oDoc.title)}</strong><small>${fnEsc([oDoc.archive,oDoc.signature,oDoc.document_type].filter(Boolean).join(' · '))}</small>${oDoc.file_path?fnHtml`<a href="${
    fnEsc(fileUrl(oDoc.file_path))}" target="_blank" rel="noopener">${fnTr("Open in Nextcloud Files")}</a>`:''}</article>`).join('')}</div></details>`:''}
 </div>`;
}
//*****************************************************************************
/**
 * @brief Zpracuje legacy výzkumný deník v uživatelském rozhraní FamilyTree.
 * @param {object} oBody2 Vstupní hodnota body; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {string} sKind3 Vstupní hodnota kind; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function activateLegacyJournal(oBody2,sKind3){
 const hWidget=oBody2.querySelector('[data-legacy-view]');if(!hWidget)return;
 const aAll3=(oState?.research||[]).filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oR12 Hodnota oR12 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oR12=>sKind3==='media'?oR12.entity_type==='media':!['import_report','package','research'].includes(oR12.entity_type)).concat(sKind3==='archive'?legacyResearchTasks():[]);
 const hSearch=hWidget.querySelector('[data-legacy-search]'),hPerson=hWidget.querySelector('[data-legacy-person]'),hType=hWidget.querySelector('[data-legacy-kind]'),
    hStatus=hWidget.querySelector('[data-legacy-status]'),hResults=hWidget.querySelector('[data-legacy-results]'),hCount=hWidget.querySelector('[data-legacy-count]');
 const oSaved2=journalSavedFilter(sKind3);if(oSaved2.search)hSearch.value=oSaved2.search;if(oSaved2.person)hPerson.value=oSaved2.person;if(hType&&oSaved2.type)hType.value=oSaved2.type;if(hStatus&&oSaved2.status)hStatus.value=oSaved2.status;
 /**
 * @brief Překreslí zobrazené výsledky podle aktuálního stavu.
 * @returns {void} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnRender=()=>{
  const oNeedle=hSearch.value.trim().toLocaleLowerCase('cs'),nPersonId=Number(hPerson.value)||0,oSelectedType=hType?.value||'',oSelectedStatus=hStatus?.value||'';
  Object.assign(oSaved2,{search:hSearch.value,person:hPerson.value,type:oSelectedType,status:oSelectedStatus});
  const oPersonMedia=nPersonId&&sKind3==='media'?new Set(researchFor(nPersonId).media.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR13 Hodnota oR13 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR13=>oR13.id)):null;
  const aMatching=aAll3.filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oR14 Hodnota oR14 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oR14=>{
   if(oSelectedType&&oR14.entity_type!==oSelectedType)return false;
   if(oSelectedStatus&&legacyRecordStatus(oR14)!==oSelectedStatus)return false;
   if(oNeedle&&!legacyRecordText(oR14).includes(oNeedle))return false;
   if(nPersonId){
    if(oPersonMedia)return oPersonMedia.has(oR14.id);
    if(oR14.entity_type==='research'){
     const oRefs2=importedPersonIds(nPersonId);
     if(!oR14.native_person_ids?.includes(nPersonId)&&!(oR14.data?.target_person_ids||[]).some(/** @h05-inline
 * @brief Ověří, zda prvek kolekce vyhovuje požadované podmínce.
 * @param {string} sId29 Hodnota sId29 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
sId29=>oRefs2.has(oR14.origin_key+'/'+sId29)))return false;
    }else if(legacyPersonNativeId(oR14)!==nPersonId)return false;
   }
   return true;
  });
  const aShown=aMatching.slice(0,sKind3==='media'?60:120);
  // CZ: Při filtraci podle osoby omezit také její fotografie a dokumenty.
  if(sKind3==='media'){
   const oLinkedDocuments=nPersonId?new Set(docsFor('person',nPersonId).map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oDoc2 Hodnota oDoc2 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oDoc2=>+oDoc2.id)):null;
   hWidget.querySelectorAll('[data-media-native-person]').forEach(/** @h05-inline
 * @brief Zpracuje jeden prvek kolekce při průchodu záznamy.
 * @param {unknown} oItem6 Hodnota oItem6 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
oItem6=>{oItem6.hidden=!!nPersonId&&+oItem6.dataset.mediaNativePerson!==nPersonId});
   hWidget.querySelectorAll('[data-media-native-document]').forEach(/** @h05-inline
 * @brief Zpracuje jeden prvek kolekce při průchodu záznamy.
 * @param {unknown} oItem7 Hodnota oItem7 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
oItem7=>{oItem7.hidden=!!oLinkedDocuments&&!oLinkedDocuments.has(+oItem7.dataset.mediaNativeDocument)});
  }
  hCount.textContent=`${fnTr("Found")}: ${aMatching.length} · ${fnTr("Shown")}: ${aShown.length} / ${aAll3.length}`;
  hResults.innerHTML=aShown.length?(sKind3==='media'?fnHtml`<div class="hc-familytree-media-grid">${aShown.map(legacyMediaItem).join('')}</div>`:aShown.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR15 Hodnota oR15 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR15=>{
   const oD3=oR15.data||{},sName3=oD3.preferred_name||oD3.title||oD3.raw_value||oD3.question||oD3.value||oD3.name||oD3.file_name||oD3.transcription||oD3.full_text||'';
   const sId30=legacyIdentity(oR15),oPersonId=legacyPersonNativeId(oR15),sSource5=legacySourceFor(oR15),sUrl3=safeSourceUrl(oD3.url||sSource5?.data?.url||'');
   return fnHtml`<article class="hc-familytree-journal-item"><div class="hc-familytree-journal-item-head"><strong>${fnEsc(sId30)} · ${fnEsc(legacyKind(oR15))}</strong><small>${fnEsc(oR15.origin_key)
    }</small></div><p>${fnEsc(String(sName3).slice(0,600))}</p>${oR15.entity_type==='research'?fnHtml`<small>${fnTr("Status")}: ${fnEsc(fnTr(oJournalStatusNames[oD3.status]||oD3.status||'—'))}${
    oD3.checkpoint?' · '+fnEsc(oD3.checkpoint):''}</small>${oD3.attempts?fnHtml`<p>${fnTr("Search attempts")}: ${fnEsc(oD3.attempts)}</p>`:''}${oD3.result?fnHtml`<p>${fnTr("Outcome")}: ${fnEsc(oD3.result)}</p>`:''}${
    oD3.next_step?fnHtml`<p>${fnTr("Next step")}: ${fnEsc(oD3.next_step)}</p>`:''}`:''}${oD3.verification_status?fnHtml`<small>${fnEsc(oD3.verification_status)}${
    oD3.confidence_percent==null?'':' · '+fnEsc(oD3.confidence_percent)+' %'}</small>`:''}${oD3.locator?fnHtml`<small>${fnEsc(oD3.locator)}</small>`:''}${sSource5?fnHtml`<small>${
    fnEsc([sSource5.data?.archive,sSource5.data?.signatura,sSource5.data?.title].filter(Boolean).join(' · '))}</small>`:''}${sUrl3?fnHtml`<a href="${fnEsc(sUrl3)}" target="_blank" rel="noopener noreferrer">${
    fnTr("Open source document")}</a>`:''}${oPersonId?fnHtml`<button type="button" data-legacy-open-person="${oPersonId}">${fnTr("Open person")}</button>`:''}${
    oR15.entity_type==='research_facts'?fnHtml`<details><summary>${fnTr("Original claim")}</summary><p>${fnEsc(oD3.original_text||'')}</p></details>`:''}</article>`;
  }).join('')):fnHtml`<p class="hc-familytree-hint">${fnTr("No matching records.")}</p>`;
  hResults.querySelectorAll('[data-legacy-open-person]').forEach(/** @h05-inline
 * @brief Zpracuje jeden prvek kolekce při průchodu záznamy.
 * @param {unknown} oBtn2 Hodnota oBtn2 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
oBtn2=>oBtn2.onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>personDetail(+oBtn2.dataset.legacyOpenPerson));
 };
 hWidget.querySelectorAll('[data-load-external-photo]').forEach(/** @h05-inline
 * @brief Zpracuje jeden prvek kolekce při průchodu záznamy.
 * @param {HTMLElement} hButton5 Hodnota hButton5 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
hButton5=>hButton5.onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>{
  const sUrl4=safeSourceUrl(hButton5.dataset.loadExternalPhoto);if(!sUrl4)return;
  // CZ: Externí web se kontaktuje pouze na výslovné kliknutí uživatele.
  const hImg=document.createElement('img');hImg.loading='lazy';hImg.referrerPolicy='no-referrer';hImg.alt=fnTr("Photograph preview");hImg.src=sUrl4;
  const hLink=document.createElement('a');hLink.href=sUrl4;hLink.target='_blank';hLink.rel='noopener noreferrer';hLink.className='hc-familytree-media-thumbnail';hLink.append(hImg);hButton5.replaceWith(hLink);
 });
 hSearch.oninput=fnRender;hPerson.onchange=fnRender;if(hType)hType.onchange=fnRender;if(hStatus)hStatus.onchange=fnRender;fnRender();
}

//*****************************************************************************
/**
 * @brief Zpracuje for v uživatelském rozhraní FamilyTree.
 * @param {number} nId25 Vstupní hodnota id; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function researchFor(nId25){
 const aIds8=importedPersonIds(nId25);
 /**
 * @brief Zjistí podmínku has person používanou při zpracování rodokmenu.
 * @param {unknown} oR16 Kontextová hodnota oR16 potřebná pro daný výpočet.
 * @param {string} sValue14 Textový parametr sValue14 předaný operaci.
 * @returns {boolean} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnHasPerson=(oR16,sValue14)=>String(sValue14||'').split('|').some(/** @h05-inline
 * @brief Ověří, zda prvek kolekce vyhovuje požadované podmínce.
 * @param {string} sX Hodnota sX předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
sX=>aIds8.has(oR16.origin_key+'/'+sX));
 const aRelationships3=researchRows('relationships').filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oR17 Hodnota oR17 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oR17=>fnHasPerson(oR17,oR17.data.person1_id)||fnHasPerson(oR17,oR17.data.person2_id));
 const oRels=new Set(aRelationships3.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR18 Hodnota oR18 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR18=>oR18.origin_key+'/'+oR18.external_id));
 const aEvents=researchRows('events').filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oR19 Hodnota oR19 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oR19=>fnHasPerson(oR19,oR19.data.person_id));
 const oEventIds=new Set(aEvents.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR20 Hodnota oR20 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR20=>oR20.origin_key+'/'+oR20.external_id));
 const aFamilies=researchRows('families').filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oR21 Hodnota oR21 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oR21=>oR21.data.parent_ids?.some(/** @h05-inline
 * @brief Ověří, zda prvek kolekce vyhovuje požadované podmínce.
 * @param {number} nX15 Hodnota nX15 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
nX15=>fnHasPerson(oR21,nX15))||oR21.data.child_ids?.some(/** @h05-inline
 * @brief Ověří, zda prvek kolekce vyhovuje požadované podmínce.
 * @param {number} nX16 Hodnota nX16 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
nX16=>fnHasPerson(oR21,nX16)));
 const aFamilyIds=new Set(aFamilies.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR22 Hodnota oR22 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR22=>oR22.origin_key+'/'+oR22.external_id));
 const aResearchFacts=researchRows('research_facts').filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oR23 Hodnota oR23 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oR23=>oR23.data.owner_type==='event'?oEventIds.has(oR23.origin_key+'/'+oR23.data.owner_id):oR23.data.owner_type==='family'?
    aFamilyIds.has(oR23.origin_key+'/'+oR23.data.owner_id):oR23.data.owner_type==='person'&&fnHasPerson(oR23,oR23.data.owner_id));
 const oFactIds=new Set(aResearchFacts.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR24 Hodnota oR24 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR24=>oR24.origin_key+'/'+oR24.external_id));
 /**
 * @brief Zjistí související záznamy pro vykreslení vazeb v rodokmenu.
 * @param {unknown} oR25 Kontextová hodnota oR25 potřebná pro daný výpočet.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnLinked=oR25=>oR25.data.linked_entity_type==='event'?oEventIds.has(oR25.origin_key+'/'+oR25.data.linked_entity_id):oR25.data.linked_entity_type==='family'?
    aFamilyIds.has(oR25.origin_key+'/'+oR25.data.linked_entity_id):oR25.data.linked_entity_type==='research_facts'?oFactIds.has(oR25.origin_key+'/'+oR25.data.linked_entity_id):
    oR25.data.linked_entity_type==='person'&&fnHasPerson(oR25,oR25.data.linked_entity_id);
 const aCitations=researchRows('citations').filter(fnLinked);
 const oCitationIds=new Set(aCitations.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR26 Hodnota oR26 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR26=>oR26.origin_key+'/'+oR26.external_id));
 const oSourceIds=new Set(aCitations.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR27 Hodnota oR27 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR27=>oR27.origin_key+'/'+oR27.data.source_id));
 const aNoteLinks=researchRows('note_links').filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oR28 Hodnota oR28 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oR28=>oR28.data.owner_type==='event'?oEventIds.has(oR28.origin_key+'/'+oR28.data.owner_id):oR28.data.owner_type==='family'?
    aFamilyIds.has(oR28.origin_key+'/'+oR28.data.owner_id):oR28.data.owner_type==='person'&&fnHasPerson(oR28,oR28.data.owner_id));
 const oNoteIds=new Set(aNoteLinks.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR29 Hodnota oR29 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR29=>oR29.origin_key+'/'+oR29.data.note_id));
 return {
  people:researchRows('persons').filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oR30 Hodnota oR30 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oR30=>aIds8.has(oR30.origin_key+'/'+oR30.external_id)),
  relationships: aRelationships3,families: aFamilies,researchFacts: aResearchFacts,
  facts:researchRows('facts').filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oR31 Hodnota oR31 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oR31=>oR31.data.subject_type==='relationship'?oRels.has(oR31.origin_key+'/'+oR31.data.subject_id):fnHasPerson(oR31,oR31.data.subject_id)),
  events: aEvents,
  citations: aCitations,
  media:researchRows('media').filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oR32 Hodnota oR32 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oR32=>fnLinked(oR32)||oCitationIds.has(oR32.origin_key+'/'+oR32.data.citation_id)||oSourceIds.has(oR32.origin_key+'/'+oR32.data.source_id)),
  tasks:legacyResearchTasks().filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oR33 Hodnota oR33 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oR33=>oR33.native_person_ids?.includes(+nId25)||oR33.data.target_person_ids?.some(/** @h05-inline
 * @brief Ověří, zda prvek kolekce vyhovuje požadované podmínce.
 * @param {number} nX17 Hodnota nX17 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
nX17=>fnHasPerson(oR33,nX17))||researchRows('notes').some(/** @h05-inline
 * @brief Ověří, zda prvek kolekce vyhovuje požadované podmínce.
 * @param {number} nN7 Hodnota nN7 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
nN7=>
    nN7.origin_key===oR33.origin_key&&nN7.data.xref===oR33.data.snote_xref&&oNoteIds.has(nN7.origin_key+'/'+nN7.external_id))),
  notes:researchRows('notes').filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oR34 Hodnota oR34 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oR34=>oNoteIds.has(oR34.origin_key+'/'+oR34.external_id))
 };
}
//*****************************************************************************
/**
 * @brief Zpracuje detail v uživatelském rozhraní FamilyTree.
 * @param {number} nId26 Vstupní hodnota id; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function researchDetail(nId26){
 const oOwn=researchFor(nId26);if(!oOwn.people.length)return;
 const oSourceMap=new Map(researchRows('sources').map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR35 Hodnota oR35 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR35=>[oR35.origin_key+'/'+oR35.external_id,oR35]));
 /**
 * @brief Vytvoří textový popisek source label pro zobrazení v genealogickém rozhraní.
 * @param {string} sKey10 Textový parametr sKey10 předaný operaci.
 * @param {string} sOrigin3 Textový parametr sOrigin3 předaný operaci.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnSourceLabel=(sKey10,sOrigin3)=>{const oS5=oSourceMap.get(sOrigin3+'/'+sKey10);return oS5?fnHtml`<small>${fnEsc(oS5.data.title||sKey10)}${oS5.data.signatura?' · '+fnEsc(oS5.data.signatura):''}\
</small>`:sKey10?fnHtml`<small>${fnEsc(sKey10)}</small>`:''};
 /**
 * @brief Vytvoří textový popisek status pro zobrazení v genealogickém rozhraní.
 * @param {unknown} oR36 Kontextová hodnota oR36 potřebná pro daný výpočet.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnStatus=(oR36)=>fnHtml`<small>${fnEsc(fnTr(oR36.data.verification_status||'neověřeno'))}${oR36.data.confidence_percent==null?'':' · '+fnEsc(oR36.data.confidence_percent)+' %'}</small>`;
 const hSection=document.createElement('section');hSection.className='hc-familytree-research';
 hSection.innerHTML=fnHtml`<h3>${fnTr("Archived person records")} · ${fnEsc(oOwn.people.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oP31 Hodnota oP31 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oP31=>oP31.external_id).join(', '))}</h3><p class="hc-familytree-hint">${
    fnTr("Each claim is preserved separately, including conflicting variants. Search for P, F, Q and other IDs in the Research Journal.")}</p>
 <details><summary>${fnTr("Relationships and variants")} (${oOwn.relationships.length})</summary>${oOwn.relationships.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR37 Hodnota oR37 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR37=>
   fnHtml`<div class="hc-familytree-research-row"><b>${fnEsc(oR37.data.relationship_type)} · ${fnEsc(oR37.external_id)}</b>${fnStatus(oR37)}${fnSourceLabel(oR37.data.source_id,
   oR37.origin_key)}<small>${oR37.native_id&&oState.relationships.some(/** @h05-inline
 * @brief Ověří, zda prvek kolekce vyhovuje požadované podmínce.
 * @param {number} nX18 Hodnota nX18 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
nX18=>+nX18.id===+oR37.native_id)?fnTr("Shown in tree"):fnTr("Research variant without a graph link")}</small>${oR37.data.notes?fnHtml`<p>${
    fnEsc(oR37.data.notes)}</p>`:''}</div>`).join('')}</details>
 <details><summary>${fnTr("Assertions")} (${oOwn.facts.length})</summary>${oOwn.facts.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR38 Hodnota oR38 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR38=>fnHtml`<div class="hc-familytree-research-row"><b>${fnEsc(oR38.data.predicate)}:</b> ${fnEsc(oR38.data.value)
    }${fnStatus(oR38)}${fnSourceLabel(oR38.data.source_id,
   oR38.origin_key)}${oR38.data.citation_detail?fnHtml`<small>${fnEsc(oR38.data.citation_detail)}</small>`:''}${oR38.data.notes?fnHtml`<small>${fnEsc(oR38.data.notes)}</small>`:''}</div>`).join('')}</details>
 <details open><summary>${fnTr("Research claims F")} (${oOwn.researchFacts.length})</summary>${oOwn.researchFacts.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR39 Hodnota oR39 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR39=>
   fnHtml`<div class="hc-familytree-research-row"><b>${fnEsc(oR39.data.external_fact_id)} · ${fnEsc(oR39.data.fact_type)}:</b> ${fnEsc(oR39.data.raw_value)}${fnStatus(oR39)}${
    oR39.data.normalized_value?fnHtml`<small>${fnTr("Normalized:")} ${fnEsc(oR39.data.normalized_value)}</small>`:''}${fnSourceLabel(oR39.data.source_id,
   oR39.origin_key)}${oR39.data.locator?fnHtml`<small>${fnEsc(oR39.data.locator)}</small>`:''}<details><summary>Original text</summary><p>${fnEsc(oR39.data.original_text)}</p></details></div>`).join('')}</details>
 <details><summary>${fnTr("Events and provenance")} (${oOwn.events.length})</summary>${oOwn.events.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR40 Hodnota oR40 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR40=>
   fnHtml`<div class="hc-familytree-research-row"><b>${fnEsc(oR40.data.event_type)}</b> · ${fnEsc(oR40.data.date_value)} · ${fnEsc(oR40.data.place)}${fnStatus(oR40)}${fnSourceLabel(oR40.data.source_id,
   oR40.origin_key)}${oR40.data.description?fnHtml`<small>${fnEsc(oR40.data.description)}</small>`:''}</div>`).join('')}</details>
 <details><summary>${fnTr("Citations")} (${oOwn.citations.length})</summary>${oOwn.citations.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR41 Hodnota oR41 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR41=>fnHtml`<div class="hc-familytree-research-row">${fnSourceLabel(oR41.data.source_id,
   oR41.origin_key)}<small>${fnEsc(oR41.data.locator)}${oR41.data.quay!==''&&oR41.data.quay!=null?' · QUAY '+fnEsc(oR41.data.quay):''}</small><p>${fnEsc(oR41.data.transcription)}</p>${oR41.data.notes?fnHtml`<small>${
    fnEsc(oR41.data.notes)}</small>`:''}</div>`).join('')}</details>
 <details open><summary>${fnTr("Images and documents")} (${oOwn.media.length})</summary>${oOwn.media.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR42 Hodnota oR42 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR42=>{const oU2=safeSourceUrl(oR42.data.url);
    return fnHtml`<div class="hc-familytree-research-row hc-familytree-person-media-row">${researchMediaPreview(oR42)}<div>${oR42.media_path?fnHtml`<a href="${fnEsc(researchMediaUrl(oR42.id))
    }" target="_blank" rel="noopener"><b>${fnEsc(oR42.data.title||oR42.data.file_name)}</b> ↗</a>`:oU2?fnHtml`<a href="${fnEsc(oU2)}" target="_blank" rel="noopener noreferrer"><b>${
    fnEsc(oR42.data.title||oR42.data.file_name)}</b> ↗</a>`:fnHtml`<b>${fnEsc(oR42.data.title||oR42.data.file_name)}</b> · ${
    oR42.data.supported===false?fnTr("preserved in the original archive"):fnTr("file not yet available")}`}<small>${fnEsc(oR42.data.file_name)} · ${fnEsc(oR42.data.rights||'')}</small>${
    fnSourceLabel(oR42.data.source_id,oR42.origin_key)}</div></div>`}).join('')}</details>
 ${oOwn.tasks.length?fnHtml`<details><summary>${fnTr("Research tasks Q")} (${oOwn.tasks.length})</summary><button type="button" data-person-open-tasks="${nId26}">${
    fnTr("Open this person's tasks in journal")}</button>${oOwn.tasks.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR43 Hodnota oR43 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR43=>fnHtml`<div class="hc-familytree-research-row"><b>${fnEsc(oR43.data.external_task_id||oR43.external_id)} · ${fnEsc(oR43.data.status)
    } · ${fnEsc(oR43.data.checkpoint)}</b><p>${fnEsc(oR43.data.title||oR43.data.question)}</p><small>${fnEsc(oR43.data.next_step)}</small><small>${fnEsc(oR43.data.target_text||'')}</small></div>`).join('')}</details>`:''}
 <details><summary>${fnTr("Notes")} (${oOwn.notes.length})</summary>${oOwn.notes.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR44 Hodnota oR44 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR44=>fnHtml`<div class="hc-familytree-research-row"><b>${fnEsc(oR44.data.xref||'NOTE')} · ${
    fnEsc(oR44.data.kind||'other')}</b><p>${fnEsc(oR44.data.full_text)}</p>${fnSourceLabel(oR44.data.source_links?.[0],oR44.origin_key)}</div>`).join('')}</details>`;
 fnValue('hc-familytree-modal-body').querySelector('.hc-familytree-tabs')?.append(hSection);
}
//*****************************************************************************
/**
 * @brief Importuje report markup v uživatelském rozhraní FamilyTree.
 * @param {object} oReport Vstupní hodnota report; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function importReportMarkup(oReport){
 /**
 * @brief Spočítá součet položek ve zpracovávané kolekci.
 * @param {unknown[]} aValues5 Kolekce aValues5 se zpracovávanými záznamy.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnTotal=aValues5=>Object.values(aValues5||{}).reduce(/** @h05-inline
 * @brief Aktualizuje akumulátor podle dalšího prvku kolekce.
 * @param {unknown} oSum5 Hodnota oSum5 předaná callbacku.
 * @param {number} nCount2 Hodnota nCount2 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oSum5,nCount2)=>oSum5+(+nCount2||0),0);
 const oCreated=oReport.created||{},oUnchanged=fnTotal(oReport.unchanged),oUpdated=fnTotal(oReport.updated),oRetained=fnTotal(oReport.removed_retained),oMissing=oReport.missing_media||[],oWarnings=oReport.warnings||[];
 return fnHtml`<div class="hc-familytree-import-report"><p><b>${fnTr("Status: import complete")}</b>${oReport.completed_at?' · '+fnEsc(new Date(oReport.completed_at).toLocaleString()):''}</p>
 <p><b>${fnTr("New people:")}</b> ${+oCreated.persons||0} · <b>${fnTr("New relationships:")}</b> ${+oCreated.relationships||0} · <b>${fnTr("Other new records:")}</b> ${
    Math.max(0,fnTotal(oCreated)-(+oCreated.persons||0)-(+oCreated.relationships||0))}</p>
 <p>${fnTr("Unchanged:")} ${oUnchanged} · ${fnTr("Updated:")} ${oUpdated} · ${fnTr("Retained from the previous version in the archive:")} ${oRetained} · ${fnTr("Images saved:")} ${+oReport.media_stored||0}</p>
 <p>${fnTr("Data validation:")} ${Object.entries(oReport.counts||{}).map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} arg0 Rozbalovaný parametr [sKey11,sValue15] se vstupními údaji.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
([sKey11,sValue15])=>fnHtml`${fnEsc(sKey11)} ${+sValue15||0}`).join(' · ')} · ${fnTr("Unknown notes:")} ${+oReport.unknown_notes||0} · ${
    fnTr("Conflicting relationships and claims:")} ${+oReport.variants||0}</p>
 <p><b>${fnTr("The tree now contains:")}</b> ${+oReport.tree_people||0} ${fnTr("people and")} ${+oReport.tree_relationships||0} ${fnTr("displayed relationships.")}</p>
 ${oReport.tree_people>1&&!oReport.tree_relationships?fnHtml`<p class="hc-familytree-import-warning">${
    fnTr("People were saved, but no links are displayed. Check whether the GEDCOM has FAM families and review the research relationship variants.")}</p>`:''}
 ${oRetained?fnHtml`<p class="hc-familytree-import-warning">${fnTr("Records absent from the new file were preserved. Removing them requires manual review.")}</p>`:''}
 ${oReport.backup_path?fnHtml`<p><a href="${fnEsc(fileUrl(oReport.backup_path))}" target="_blank" rel="noopener">${fnTr("Open the archived source file in Files")} ↗</a></p>`:''}
 ${oMissing.length?fnHtml`<details><summary>${fnTr("Missing images")} (${oMissing.length})</summary><ul>${oMissing.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {string} sName4 Hodnota sName4 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sName4=>fnHtml`<li>${fnEsc(sName4)}</li>`).join('')}</ul></details>`:''}
 ${oWarnings.length?fnHtml`<details><summary>${fnTr("Warnings")} (${oWarnings.length})</summary><ul>${oWarnings.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {string} sMessage2 Hodnota sMessage2 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sMessage2=>fnHtml`<li>${fnEsc(fnTrServer(sMessage2))}</li>`).join('')}</ul></details>`:''}</div>`;
}
//*****************************************************************************
/**
 * @brief Zobrazí import report v uživatelském rozhraní FamilyTree.
 * @param {object} oReport2 Vstupní hodnota report; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function showImportReport(oReport2){openModal(fnTr("Import result"),importReportMarkup(oReport2)+fnLoc("<p><button id=\"hc-familytree-show-research\" type=\"button\">Open research records</button></p>"));
 fnValue('hc-familytree-show-research').onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>openResearchJournal('archive')}
//*****************************************************************************
/**
 * @brief Zpracuje overview v uživatelském rozhraní FamilyTree.
 * @returns {void} Funkce nevrací hodnotu.
 */
function researchOverview(){
 const aRecords2=(oState.research||[]).filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oR45 Hodnota oR45 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oR45=>oR45.entity_type!=='import_report'),aSources2=researchRows('sources'),oPlaces=researchRows('places'),aTasks2=researchRows('research'),
    oPackages=researchRows('package'),oReports=researchRows('import_report'),oNotes=researchRows('notes'),oFacts=researchRows('research_facts'),oMedia2=researchRows('media');
 openModal(fnTr("Research records"),fnHtml`<div class="hc-familytree-research"><p>${aRecords2.length} ${fnTr("source records")}; ${researchRows('facts').length} ${fnTr("of standard claims")}; ${
    oFacts.length} ${fnTr("of research claims")}. ${fnTr("Conflicting variants are kept separately.")}</p>
 ${oPackages.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR46 Hodnota oR46 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR46=>fnHtml`<p><b>${fnEsc(oR46.origin_key)}</b> · ${fnEsc(oR46.data.format||'výzkumný archiv')}</p>`).join('')}
 ${oReports.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR47 Hodnota oR47 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR47=>fnHtml`<details open><summary>${fnTr("Last import of set")} ${fnEsc(oR47.origin_key)}</summary>${importReportMarkup(oR47.data)}</details>`).join('')}
 <details open><summary>${fnTr("Sources")} (${aSources2.length})</summary>${aSources2.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR48 Hodnota oR48 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR48=>{const oU3=safeSourceUrl(oR48.data.url);
   return fnHtml`<div class="hc-familytree-research-row"><b>${fnEsc(oR48.external_id)} · ${fnEsc(oR48.data.title)}</b><small>${fnEsc([oR48.data.archive,
   oR48.data.fond,oR48.data.signatura,oR48.data.page,oR48.data.scan].filter(Boolean).join(' · '))}</small>${oU3?fnHtml`<a href="${fnEsc(oU3)}" target="_blank" rel="noopener noreferrer">${
    fnTr("Open source document")} ↗</a>`:''}</div>`}).join('')}</details>
 <details><summary>${fnTr("Media")} (${oMedia2.length})</summary>${oMedia2.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR49 Hodnota oR49 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR49=>{const oU4=oR49.media_path?researchMediaUrl(oR49.id):safeSourceUrl(oR49.data.url);
   return fnHtml`<div class="hc-familytree-research-row"><b>${fnEsc(oR49.data.title||oR49.data.file_name)}</b><small>${fnEsc(oR49.data.file_name)} · ${fnEsc(oR49.data.form||'')} · ${fnEsc(oR49.data.rights||'')
    }</small>${oU4?fnHtml`<a href="${fnEsc(oU4)}" target="_blank" rel="noopener noreferrer">Open ↗</a>`:''}</div>`}).join('')}</details>
 <details><summary>${fnTr("Research claims")} (${oFacts.length})</summary>${oFacts.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR50 Hodnota oR50 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR50=>fnHtml`<div class="hc-familytree-research-row"><b>${fnEsc(oR50.data.external_fact_id||oR50.external_id)} · ${
    fnEsc(oR50.data.fact_type)}</b><p>${fnEsc(oR50.data.raw_value)}</p><small>${fnEsc(oR50.data.verification_status)}${oR50.data.locator?' · '+fnEsc(oR50.data.locator):''}</small></div>`).join('')}</details>
 <details><summary>${fnTr("Places")} (${oPlaces.length})</summary>${oPlaces.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR51 Hodnota oR51 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR51=>fnHtml`<div class="hc-familytree-research-row"><b>${fnEsc(oR51.data.catalog_id||oR51.external_id)} · ${fnEsc(oR51.data.name)
    }</b><small>${fnEsc([oR51.data.current_municipality,
   oR51.data.district,oR51.data.region,oR51.data.country].filter(Boolean).join(' · '))}</small><small>${fnEsc(oR51.data.historical_names||'')}</small><details><summary>Original text</summary><p>${
    fnEsc(oR51.data.original_text||'')}</p></details></div>`).join('')}</details>
 <details><summary>${fnTr("Research tasks")} (${aTasks2.length})</summary>${aTasks2.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR52 Hodnota oR52 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR52=>fnHtml`<div class="hc-familytree-research-row"><b>${fnEsc(oR52.data.external_task_id||oR52.external_id)} · ${
    fnEsc(oR52.data.checkpoint)} · ${fnEsc(oR52.data.status)}</b><p>${fnEsc(oR52.data.title||oR52.data.question)}</p><small>${fnEsc(oR52.data.attempts||'')} · ${fnEsc(oR52.data.result||'')}</small><small>${
    fnEsc(oR52.data.next_step)}</small><small>${fnEsc(oR52.data.target_text||'')}</small></div>`).join('')}</details>
 <details><summary>${fnTr("Notes / other research data")} (${oNotes.length})</summary>${oNotes.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR53 Hodnota oR53 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR53=>fnHtml`<div class="hc-familytree-research-row"><b>${fnEsc(oR53.data.xref||'NOTE')} · ${
    fnEsc(oR53.data.kind||'other')}</b><p>${fnEsc(oR53.data.full_text)}</p></div>`).join('')}</details></div>`);
}
const oSystemEventTitles=new Set(['Narození','Svatba','Křest','Úmrtí','Povolání','Událost']);
/**
 * @brief Vytvoří textový popisek event title pro zobrazení v genealogickém rozhraní.
 * @param {string} sValue16 Textový parametr sValue16 předaný operaci.
 * @returns {string} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnEventTitle=sValue16=>oSystemEventTitles.has(sValue16)?fnTr(sValue16):sValue16;
//*****************************************************************************
/**
 * @brief Zpracuje detail v uživatelském rozhraní FamilyTree.
 * @param {number} nId27 Vstupní hodnota id; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function personDetail(nId27){const oP32=byId(nId27),aEv=oState.events.filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {number} nX19 Hodnota nX19 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
nX19=>+nX19.person_id===nId27),oDocs=docsFor('person',nId27),aRels=oState.relationships.filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {number} nX20 Hodnota nX20 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
nX20=>
    +nX20.person1_id===nId27||+nX20.person2_id===nId27);bSelected=nId27;const oImportedPhoto=researchFor(nId27).media.find(/** @h05-inline
 * @brief Vyhledá první záznam splňující danou podmínku.
 * @param {unknown} oR54 Hodnota oR54 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR54=>oR54.data.media_type==='person_photo'&&(oR54.media_path||safeSourceUrl(oR54.data.url)));
    const oPortrait=oP32.photo_url||(oImportedPhoto?.media_path?researchMediaUrl(oImportedPhoto.id):safeSourceUrl(oImportedPhoto?.data.url||''));
    openModal((oP32.given_name+' '+oP32.surname).trim(),fnHtml`<div class="hc-familytree-detail">${
    oState.canEdit?fnLoc(("<div class=\"hc-familytree-person-actions\"><button type=\"button\" id=\"hc-familytree-edit-person\" " +
    "class=\"primary\">✏️ Edit name and details</button><button type=\"button\" " +
    "id=\"hc-familytree-add-child\">＋ Add child</button><button type=\"button\" " +
    "id=\"hc-familytree-set-parents\">⇧ Nastavit rodiče</button></div>")):
    ''}<div class="hc-familytree-profile">${oPortrait?fnHtml`<img src="${fnEsc(oPortrait)}">`:fnLoc('<span>👤</span>')}<div><b>${fnEsc(years(oP32))}</b><p>${fnEsc(oP32.birth_place)}</p><p>${fnEsc(oP32.occupation)
    }</p></div></div><div id="hc-familytree-note-preview" class="hc-familytree-notes"></div><div class="hc-familytree-tabs"><h3>Relationships</h3>${
    aRels.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR55 Hodnota oR55 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR55=>fnHtml`<div class="hc-familytree-row"><span>${oR55.type==='parent'?(+oR55.person2_id===nId27?fnTr("Parent"):fnTr("Child")):fnTr("Partnership")}: <b>${
    fnEsc((/** @h05-inline
 * @brief Provede vloženou callback operaci ve zpracovávaném rodokmenu.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>{const nX21=byId(+oR55.person1_id===nId27?oR55.person2_id:oR55.person1_id);return nX21?(nX21.given_name+' '+nX21.surname):''})())}</b><small>${docsFor('relation',oR55.id).length} ${fnTr("documents")
    }</small></span>${oState.canEdit?fnHtml`<button data-del-rel="${oR55.id}">×</button>`:''}</div>`).join('')||fnLoc("<p>No relationships yet.</p>")}${
    oState.canEdit?fnLoc("<button id=\"hc-familytree-add-rel\">＋ Add relationship</button>"):''}<h3>Events</h3>${aEv.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {number} nX22 Hodnota nX22 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
nX22=>fnHtml`<div class="hc-familytree-row"><span><b>${
    fnEsc(fnEventTitle(nX22.title||nX22.type))}</b><small>${fnEsc(nX22.event_date)} · ${fnEsc(nX22.place)} · ${docsFor('event',nX22.id).length} ${fnTr("documents")}</small></span>${
    oState.canEdit?fnHtml`<button data-del-event="${nX22.id}">×</button>`:''}</div>`).join('')}${oState.canEdit?fnLoc("<button id=\"hc-familytree-add-event\">＋ Add event</button>"):''
    }<h3>Documents</h3>${oDocs.map(documentRow).join('')||fnLoc("<p>No documents yet.</p>")}${oState.canEdit?fnLoc("<button id=\"hc-familytree-add-doc\">＋ Attach document</button>"):''
    }</div></div>`);fnValue('hc-familytree-note-preview').replaceChildren(oCore.editor.render(oP32.notes||fnTr("No notes")));researchDetail(nId27);
 const hPersonArchive=fnValue('hc-familytree-modal-body').querySelector('.hc-familytree-research');
 if(hPersonArchive){hPersonArchive.insertAdjacentHTML('afterbegin',fnHtml`<button type="button" id="hc-familytree-person-open-journal">${
    fnTr("Open all research records for this person in the journal")}</button>`);fnValue('hc-familytree-person-open-journal').onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>openResearchJournal('archive',nId27)}
 fnValue('hc-familytree-modal-body').onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @param {unknown} oE21 Hodnota oE21 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async oE21=>{if(oE21.target.closest('[data-person-open-tasks]'))return openResearchJournal('tasks',nId27);const hEdit=oE21.target.closest('[data-edit-doc]');
    if(hEdit)return docForm(oP32,oState.documents.find(/** @h05-inline
 * @brief Vyhledá první záznam splňující danou podmínku.
 * @param {number} nX23 Hodnota nX23 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
nX23=>+nX23.id===+hEdit.dataset.editDoc));let sPath4;if(oE21.target.dataset.delRel)sPath4='/api/relationships/'+oE21.target.dataset.delRel;
    if(oE21.target.dataset.delEvent)sPath4='/api/events/'+oE21.target.dataset.delEvent;if(oE21.target.dataset.delDoc&&await fnConfirmDialog({title:fnTr("Remove document from the family tree?"),
    message:fnTr("The original Nextcloud file will be kept."),confirmLabel:fnTr("Remove"),cancelLabel:fnTr("Cancel"),danger:true}))sPath4='/api/documents/'+oE21.target.dataset.delDoc;
    if(sPath4){await fnApi(sPath4,{method:'DELETE'});await selectTree(nCurrent);personDetail(nId27)}};if(oState.canEdit){fnValue('hc-familytree-edit-person').onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>personForm(oP32);
    fnValue('hc-familytree-add-child').onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>childForm(oP32);fnValue('hc-familytree-set-parents').onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>parentsForm(oP32);fnValue('hc-familytree-add-rel').onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>relationForm(oP32);
    fnValue('hc-familytree-add-event').onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>eventForm(oP32);fnValue('hc-familytree-add-doc').onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>docForm(oP32)}}
//*****************************************************************************
/**
 * @brief Zpracuje formulář v uživatelském rozhraní FamilyTree.
 * @param {unknown} oP33 Vstupní hodnota p; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function parentsForm(oP33){
 const aParents7=oState.relationships.filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oR56 Hodnota oR56 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oR56=>oR56.type==='parent'&&+oR56.person2_id===+oP33.id).map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR57 Hodnota oR57 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR57=>+oR57.person1_id);
 const aOthers=oState.people.filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {number} nX24 Hodnota nX24 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
nX24=>+nX24.id!==+oP33.id);
 if(!aOthers.length)return fnToast(fnTr("Add another person first."),'warning');
 /**
 * @brief Sestaví dostupné volby ovládacího prvku.
 * @param {boolean} bSelected2 Přepínač bSelected2, který určuje chování.
 * @param {HTMLElement} hEmptyLabel Ovládací či HTML prvek hEmptyLabel.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnOptions=(bSelected2,hEmptyLabel)=>fnHtml`<option value="0">${fnTr(hEmptyLabel)}</option>${aOthers.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {number} nX25 Hodnota nX25 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
nX25=>fnHtml`<option value="${nX25.id}" ${+nX25.id===bSelected2?'selected':''}>${
    fnEsc((nX25.given_name+' '+nX25.surname).trim())}</option>`).join('')}`;
 openModal(fnTr("Set parents"),fnHtml`<form id="hc-familytree-parents-form" class="hc-familytree-form"><p>${fnTr("Child:")} <strong>${fnEsc((oP33.given_name+' '+oP33.surname).trim())}</strong></p>${
    aParents7.length>2?fnHtml`<p class="hc-familytree-import-warning">${
    fnTr("This person has more than two parent records. Additional links stay in research history, but saving parents removes them from the graph.")}</p>`:''
    }<label>First parent<select name="parent1_id" required>${fnOptions(aParents7[0]||0,'Vyberte rodiče')}</select></label><label>Second parent<select name="parent2_id">${
    fnOptions(aParents7[1]||0,'Bez druhého rodiče')}</select></label><p class="hc-familytree-hint">${fnTr("Saving replaces this person’s existing parent links; other relationships stay unchanged.")
    }</p><div class="hc-familytree-form-actions"><button type="button" data-close>Cancel</button><button type="submit" class="primary">Save parents</button></div></form>`);
 fnValue('hc-familytree-parents-form').onsubmit=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @param {unknown} oE22 Hodnota oE22 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async oE22=>{oE22.preventDefault();const oForm2=oE22.target,oD4=fnFormData(oForm2),hButton6=oForm2.querySelector('button.primary');
    if(!+oD4.parent1_id||+oD4.parent1_id===+oD4.parent2_id)return fnToast(fnTr("Choose one or two different parents."),'error');
    if(aParents7.length>2&&!await fnConfirmDialog({title:fnTr("Remove additional parent links?"),message:fnTr("Research records remain, but additional links disappear from the graph."),
    confirmLabel:fnTr("Save parents"),cancelLabel:fnTr("Cancel"),danger:true}))return;hButton6.disabled=true;try{await fnApi('/api/people/'+oP33.id+'/parents',{method:'POST',body:JSON.stringify(oD4)});
    await selectTree(nCurrent);personDetail(+oP33.id)}catch(oError11){fnToast(fnTr("Could not save parents: ")+oError11.message,'error');hButton6.disabled=false}};
}
//*****************************************************************************
/**
 * @brief Zpracuje formulář v uživatelském rozhraní FamilyTree.
 * @param {unknown} oP34 Vstupní hodnota p; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function childForm(oP34){
 const oPartnerIds=new Set(oState.relationships.filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oR58 Hodnota oR58 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oR58=>oR58.type==='partner'&&(+oR58.person1_id===+oP34.id||+oR58.person2_id===+oP34.id)).map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oR59 Hodnota oR59 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oR59=>+oR59.person1_id===+oP34.id?+oR59.person2_id:+oR59.person1_id));
 const aPartners3=oState.people.filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {number} nX26 Hodnota nX26 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
nX26=>+nX26.id!==+oP34.id).sort(/** @h05-inline
 * @brief Porovná dvě položky pro určení jejich pořadí.
 * @param {unknown} oA27 Hodnota oA27 předaná callbacku.
 * @param {unknown} oB27 Hodnota oB27 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oA27,oB27)=>Number(oPartnerIds.has(+oB27.id))-Number(oPartnerIds.has(+oA27.id)));const aPreferred=aPartners3.filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {number} nX27 Hodnota nX27 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
nX27=>oPartnerIds.has(+nX27.id));
 openModal(fnTr("Add child"),fnHtml`<form id="hc-familytree-child-form" class="hc-familytree-form"><p>${fnTr("Parent:")} <strong>${fnEsc((oP34.given_name+' '+oP34.surname).trim())
    }</strong></p><label>Second parent / partner<select name="parent2_id"><option value="0">No second parent</option>${aPartners3.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {number} nX28 Hodnota nX28 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
nX28=>fnHtml`<option value="${nX28.id}" ${
    aPreferred.length===1&&+nX28.id===+aPreferred[0].id?'selected':''}>${fnEsc((nX28.given_name+' '+nX28.surname).trim())}</option>`).join('')
    }</select></label><div class="hc-familytree-grid"><label>First name<input name="given_name" autocomplete="off"></label><label>Last name<input name="surname" value="${fnEsc(oP34.surname)
    }" autocomplete="off"></label><label>Gender<select name="gender"><option value="other">Unspecified</option><option value="female">Woman</option><option value="male">Man\
</option></select></label><label>Date of birth<input name="birth_date" placeholder="e.g. 12 Mar 2020"></label></div><p class="hc-familytree-hint">${
    fnTr("You can edit the child later like any other person.")
    }</p><div class="hc-familytree-form-actions"><button type="button" data-close>Cancel</button><button type="submit" class="primary">Add child</button></div></form>`);
 fnValue('hc-familytree-child-form').onsubmit=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @param {unknown} oE23 Hodnota oE23 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async oE23=>{oE23.preventDefault();const oForm3=oE23.target,oD5=fnFormData(oForm3),hButton7=oForm3.querySelector('button.primary'),oOriginal4=hButton7.textContent;
    oD5.parent1_id=+oP34.id;oD5.is_living=true;if(!String(oD5.given_name||'').trim()&&!String(oD5.surname||'').trim())return fnToast(fnTr("Enter a first or last name."),'error');hButton7.disabled=true;
    hButton7.textContent=fnTr("Saving…");try{const oChild7=await fnApi('/api/trees/'+nCurrent+'/children',{method:'POST',body:JSON.stringify(oD5)});closeModal();await selectTree(nCurrent);
    personDetail(+oChild7.id)}catch(oError12){fnToast(fnTr("Could not add child: ")+oError12.message,'error');hButton7.disabled=false;hButton7.textContent=oOriginal4}};
}
//*****************************************************************************
/**
 * @brief Zpracuje formulář v uživatelském rozhraní FamilyTree.
 * @param {unknown} oP35 Vstupní hodnota p; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function relationForm(oP35){const aOthers2=oState.people.filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {number} nX29 Hodnota nX29 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
nX29=>+nX29.id!==+oP35.id);if(!aOthers2.length)return fnToast(fnTr("Add another person first."),'warning');
    openModal(fnTr("Add relationship"),fnHtml`<form id="hc-familytree-rel-form" class="hc-familytree-form"><label>Type<select name="type">\
<option value="parent">This person is the selected person’s parent</option><option value="partner">Partner / spouse</option></select></label><label>Person<select name="person2_id">${
    aOthers2.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {number} nX30 Hodnota nX30 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
nX30=>fnHtml`<option value="${nX30.id}">${fnEsc(nX30.given_name+' '+nX30.surname)}</option>`).join('')
    }</select></label><label>From<input name="start_date"></label><label>To<input name="end_date"></label><label>Note<textarea name="notes"></textarea></label>\
<div class="hc-familytree-form-actions"><button type="button" data-close>Cancel</button><button type="submit" class="primary">Add</button></div></form>`);
    fnValue('hc-familytree-rel-form').onsubmit=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @param {unknown} oE24 Hodnota oE24 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async oE24=>{oE24.preventDefault();const oForm4=oE24.target,hButton8=oForm4.querySelector('button.primary'),oOriginal5=hButton8.textContent,oD6=fnFormData(oForm4);
    oD6.person1_id=oP35.id;hButton8.disabled=true;hButton8.textContent=fnTr("Saving…");try{const oResult=await fnApi('/api/trees/'+nCurrent+'/relationships',{method:'POST',body:JSON.stringify(oD6)});
    await selectTree(nCurrent);personDetail(+oP35.id);if(oResult.alreadyExisted)fnToast(fnTr("This relationship already exists."),'warning')}catch(oError13){
    fnToast(fnTr("Could not add relationship: ")+oError13.message,'error');hButton8.disabled=false;hButton8.textContent=oOriginal5}}}
//*****************************************************************************
/**
 * @brief Zpracuje formulář v uživatelském rozhraní FamilyTree.
 * @param {unknown} oP36 Vstupní hodnota p; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function eventForm(oP36){openModal(fnTr("New event"),
    fnHtml`<form id="hc-familytree-event-form" class="hc-familytree-form"><label>Type<select name="type"><option value="birth">Birth</option><option value="marriage">Marriage\
</option><option value="residence">Residence</option><option value="education">Education</option><option value="work">Employment</option><option value="other">Other</option>\
</select></label><label>Name<input name="title" required></label><label>Date<input name="event_date"></label><label>Place<input name="place"></label><label>Description\
<textarea name="description"></textarea></label><div class="hc-familytree-form-actions"><button class="primary">Add</button></div></form>`);
    fnValue('hc-familytree-event-form').onsubmit=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @param {unknown} oE25 Hodnota oE25 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async oE25=>{oE25.preventDefault();await fnApi('/api/people/'+oP36.id+'/events',{method:'POST',body:JSON.stringify(fnFormData(oE25.target))});await selectTree(nCurrent);personDetail(+oP36.id)}}
//*****************************************************************************
/**
 * @brief Zpracuje formulář v uživatelském rozhraní FamilyTree.
 * @param {unknown} oP37 Vstupní hodnota p; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {unknown} oDoc3 Vstupní hodnota doc; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function docForm(oP37,oDoc3=null){oDoc3=oDoc3||{};const oLinked=new Set(oDoc3.id?docLinks(oDoc3.id).map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {number} nX31 Hodnota nX31 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
nX31=>nX31.link_type+':'+nX31.target_id):['person:'+oP37.id]);
    openModal(oDoc3.id?fnTr("Edit document"):fnTr("Attach document"),
    fnHtml`<form id="hc-familytree-doc-form" class="hc-familytree-form"><div class="hc-familytree-grid"><label>Name<input name="title" value="${fnEsc(oDoc3.title)
    }" required></label><label>Type<select name="document_type">${['Rodný list','Oddací list','Úmrtní list','Křestní list','Sčítání lidu','Matrika','Fotografie','Dopis',
    'Jiný dokument'].map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {string} sX2 Hodnota sX2 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sX2=>fnHtml`<option value="${fnEsc(sX2)}" ${oDoc3.document_type===sX2?'selected':''}>${fnTr(sX2)}</option>`).join('')
    }</select></label><label>Document date<input name="document_date" value="${fnEsc(oDoc3.document_date)}"></label><label>Place<input name="place" value="${fnEsc(oDoc3.place)
    }"></label><label>Archive<input name="archive" value="${fnEsc(oDoc3.archive)}"></label><label>Archive reference<input name="signature" value="${fnEsc(oDoc3.signature)
    }"></label><label>Source / link<input name="source" value="${fnEsc(oDoc3.source)}"></label><label>MIME type<input name="mime_type" value="${fnEsc(oDoc3.mime_type)
    }" placeholder="application/pdf"></label></div><label>File in Nextcloud<div class="hc-familytree-file-line"><input id="hc-familytree-file-path" name="file_path" value="${fnEsc(oDoc3.file_path)
    }" placeholder="/Rodokmen/Dokumenty/list.pdf" required><button type="button" id="hc-familytree-pick-file">Choose from Files</button></div></label><label>Description<textarea name="description">${
    fnEsc(oDoc3.description)}</textarea></label><fieldset class="hc-familytree-links"><legend>Link to people</legend>${
    oState.people.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {number} nX32 Hodnota nX32 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
nX32=>fnHtml`<label><input type="checkbox" data-link="person" value="${nX32.id}" ${oLinked.has('person:'+nX32.id)?'checked':''}> ${fnEsc(nX32.given_name+' '+nX32.surname)}</label>`).join('')
    }</fieldset><fieldset class="hc-familytree-links"><legend>Link to events</legend>${oState.events.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {number} nX33 Hodnota nX33 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
nX33=>fnHtml`<label><input type="checkbox" data-link="event" value="${nX33.id}" ${
    oLinked.has('event:'+nX33.id)?'checked':''}> ${fnEsc(fnEventTitle(nX33.title||nX33.type))} · ${fnEsc(nX33.event_date)}</label>`).join('')||fnLoc("<p>Create an event, such as a marriage, first.</p>")
    }</fieldset><fieldset class="hc-familytree-links"><legend>Link to relationships and unions</legend>${
    oState.relationships.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {number} nX34 Hodnota nX34 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
nX34=>fnHtml`<label><input type="checkbox" data-link="relation" value="${nX34.id}" ${oLinked.has('relation:'+nX34.id)?'checked':''}> ${
    nX34.type==='partner'?fnTr("Union"):fnTr("Parent-child relationship")}: ${fnEsc(relationName(nX34))}</label>`).join('')||fnLoc("<p>Create a partnership first.</p>")
    }</fieldset><p class="hc-familytree-hint">A link to the existing file is saved. Removing this document does not delete the original file.</p>\
<div class="hc-familytree-form-actions"><button type="button" data-close>Cancel</button><button class="primary">Save document</button></div></form>`);
    fnValue('hc-familytree-pick-file').onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>{if(OC.dialogs?.filepicker){OC.dialogs.filepicker(fnTr("Select document"),/** @h05-inline
 * @brief Provede vloženou callback operaci ve zpracovávaném rodokmenu.
 * @param {string} sPath5 Hodnota sPath5 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sPath5=>{if(sPath5)fnValue('hc-familytree-file-path').value=Array.isArray(sPath5)?
    sPath5[0]:sPath5},false,null,true)}else fnToast(fnTr("File picker is unavailable; enter the path manually."),'error')};fnValue('hc-familytree-doc-form').onsubmit=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @param {unknown} oE26 Hodnota oE26 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async oE26=>{oE26.preventDefault();
    const oD7=fnFormData(oE26.target);oD7.links=[...oE26.target.querySelectorAll('[data-link]:checked')].map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {number} nX35 Hodnota nX35 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
nX35=>({type:nX35.dataset.link,id:+nX35.value}));
    if(!oD7.links.length)return fnToast(fnTr("Link the document to at least one person, event, or union."),'error');await fnApi(oDoc3.id?'/api/documents/'+oDoc3.id:'/api/trees/'+nCurrent+'/documents',
    {method:oDoc3.id?'PUT':'POST',body:JSON.stringify(oD7)});await selectTree(nCurrent);personDetail(+oP37.id)}}
//*****************************************************************************
/**
 * @brief Zpracuje edit v uživatelském rozhraní FamilyTree.
 * @returns {void} Funkce nevrací hodnotu.
 */
function treeEdit(){openModal(fnTr("Edit family tree"),fnHtml`<form id="hc-familytree-tree-edit" class="hc-familytree-form"><label>Name<input name="name" value="${fnEsc(oState.tree.name)
    }"></label><label>Description<textarea name="description">${fnEsc(oState.tree.description)}</textarea></label><label>Root person<select name="root_person_id">${
    oState.people.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oP38 Hodnota oP38 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oP38=>fnHtml`<option value="${oP38.id}" ${+oP38.id===+oState.tree.root_person_id?'selected':''}>${fnEsc(oP38.given_name+' '+oP38.surname)}</option>`).join('')
    }</select></label><div class="hc-familytree-form-actions"><button class="primary">Save</button></div></form>`);fnValue('hc-familytree-tree-edit').onsubmit=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @param {unknown} oE27 Hodnota oE27 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async oE27=>{oE27.preventDefault();
    await fnApi('/api/trees/'+nCurrent,{method:'PUT',body:JSON.stringify(fnFormData(oE27.target))});closeModal();await selectTree(nCurrent)}}
//*****************************************************************************
/**
 * @brief Odstraní rodokmen v uživatelském rozhraní FamilyTree.
 * @returns {Promise<unknown>} Hodnota použitá volající částí rozhraní.
 */
async function deleteTree(){if(oState.isOwner&&await fnConfirmDialog({title:fnTr("Delete entire family tree?"),
    message:fnTr("All people, relationships, events, and document links will be removed."),confirmLabel:fnTr("Delete family tree"),cancelLabel:fnTr("Cancel"),danger:true})){
    await fnApi('/api/trees/'+nCurrent,{method:'DELETE'});oLayoutHistory.delete(nCurrent);nCurrent=0;oState=null;fnValue('hc-familytree-stage').hidden=true;oRoot.classList.remove('has-active-tree');
    fnValue('hc-familytree-toolbar-status').hidden=true;await loadTrees()}}
//*****************************************************************************
/**
 * @brief Otevře dialog sdílení vybraného rodokmenu a zobrazí přístupová oprávnění.
 * @returns {void} Funkce nevrací hodnotu.
 */
function shares(){openModal(fnTr("Family tree sharing"),fnHtml`<div class="hc-familytree-share-list">${oState.shares.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oS6 Hodnota oS6 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oS6=>fnHtml`<div class="hc-familytree-row"><span>${
    oS6.share_type==='group'?'👥':'👤'} <b>${fnEsc(oS6.share_with)}</b><small>${oS6.permission==='edit'?fnTr("Can edit"):fnTr("View only")}</small></span><button data-del-share="${oS6.id
    }">×</button></div>`).join('')||fnLoc("<p>This family tree is not shared yet.</p>")
    }</div><div id="hc-familytree-core-picker"></div><label>Permission<select id="hc-familytree-share-permission"><option value="view">View only</option>\
<option value="edit">Can edit</option></select></label><div class="hc-familytree-form-actions"><button id="hc-familytree-add-share" class="primary">Add selected user or group</button></div>`);
    const oPicker=oCore.picker.create(fnValue('hc-familytree-core-picker'),{endpoint:OC.generateUrl('/apps/hc_shared_app_core/api/v1/sharees'),types:['user','group'],multiple:false,
    placeholder:fnTr("Search for a user or group…")});fnModalCleanup=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>oPicker.destroy();fnValue('hc-familytree-add-share').onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async()=>{const oSelected=oPicker.selected()[0];
    if(!oSelected)return fnToast(fnTr("Select a user or group first."),'warning');await fnApi('/api/trees/'+nCurrent+'/shares',{method:'POST',body:JSON.stringify({share_type:oSelected.type,
    share_with:oSelected.id,permission:fnValue('hc-familytree-share-permission').value})});closeModal();await selectTree(nCurrent);shares()};fnValue('hc-familytree-modal-body').onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @param {unknown} oE28 Hodnota oE28 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async oE28=>{
    if(oE28.target.dataset.delShare){await fnApi('/api/shares/'+oE28.target.dataset.delShare,{method:'DELETE'});closeModal();await selectTree(nCurrent);shares()}}}
//*****************************************************************************
/**
 * @brief Zpracuje box v uživatelském rozhraní FamilyTree.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function viewportBox(){const oVv=window.visualViewport;return oVv?{left:oVv.offsetLeft,top:oVv.offsetTop,width:oVv.width,height:oVv.height}:{left:0,top:0,width:innerWidth,height:innerHeight}}
//*****************************************************************************
/**
 * @brief Umístí vyskakovací panel v uživatelském rozhraní FamilyTree.
 * @param {object} oPop Vstupní hodnota pop; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {object} oAnchor3 Vstupní hodnota anchor; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {unknown} oPreferredWidth Vstupní hodnota preferredWidth; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function positionPopover(oPop,oAnchor3,oPreferredWidth){if(!oPop||!oAnchor3)return;const oVp=viewportBox(),nMargin=12,nWidth3=Math.min(oPreferredWidth,Math.max(240,oVp.width-nMargin*2)),
    hR7=oAnchor3.getBoundingClientRect();oPop.style.width=nWidth3+'px';const nHeight3=Math.min(oPop.offsetHeight||260,oVp.height-nMargin*2),nLeft6=Math.max(oVp.left+nMargin,Math.min(hR7.right-nWidth3,
    oVp.left+oVp.width-nWidth3-nMargin)),nTop5=Math.max(oVp.top+nMargin,Math.min(hR7.bottom+6,oVp.top+oVp.height-nHeight3-nMargin));oPop.style.left=nLeft6+'px';oPop.style.top=nTop5+'px'}
//*****************************************************************************
/**
 * @brief Stáhne archiv blob v uživatelském rozhraní FamilyTree.
 * @param {object} oBlob Vstupní hodnota blob; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {string} sFilename Vstupní hodnota filename; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function downloadArchiveBlob(oBlob,sFilename){
 const sHref=URL.createObjectURL(oBlob);
 try{const hLink2=document.createElement('a');hLink2.href=sHref;hLink2.download=sFilename;document.body.appendChild(hLink2);hLink2.click();hLink2.remove()}
 finally{setTimeout(/** @h05-inline
 * @brief Provede odloženou akci po uplynutí požadovaného intervalu.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
()=>URL.revokeObjectURL(sHref),60000)}
}
//*****************************************************************************
/**
 * @brief Zobrazí export choice v uživatelském rozhraní FamilyTree.
 * @param {unknown} oInitialScope Vstupní hodnota initialScope; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function showExportChoice(oInitialScope='all'){
 // Full native backup is also available before opening a tree; GEDCOM requires a selected one.
 const bTreeSelected=!!nCurrent&&!!oState,bOwnedTreeSelected=bTreeSelected&&!!oState.isOwner,oCurrentName=currentTreeName();
 openModal(fnTr("Export family trees"),fnHtml`<div class="hc-familytree-gedcom hc-familytree-transfer-dialog">
 <p>Choose an export format. A full FamilyTree backup allows you to restore all your own data later; GEDCOM 7 exchanges data with other genealogy programs.</p>
 ${bTreeSelected?fnHtml`<div class="hc-familytree-transfer-card"><strong>${fnTr("Currently open family tree:")}</strong><div>${fnEsc(oCurrentName)}</div></div>`:''}
 <div class="hc-familytree-transfer-choice">
 <label><input type="radio" name="hc-transfer-export-format" value="native" checked><strong> Full FamilyTree backup (ZIP)</strong>\
<small>All internal records of your family trees, research variants, sharing records, local files and their checksums.</small></label>
 <label><input type="radio" name="hc-transfer-export-format" value="gedcom" ${bTreeSelected?'':'disabled'
    }><strong> GEDCOM 7 (.ged)</strong><small>Currently open tree: people, relationships, events and notes. This is not a complete backup.</small></label></div>
 <label id="hc-transfer-scope-wrap">Full backup scope<select id="hc-transfer-export-scope"><option value="all">All my family trees</option>${
    bOwnedTreeSelected?`<option value="current">Pouze otevřený rodokmen: ${fnEsc(oCurrentName)}</option>`:''}</select></label>
 <p class="hc-familytree-hint">The backup is created without modifying the database. The current single-file format supports up to 48 MiB per attachment, 256 MiB of\
 attachments in total and 3,000 attachments. External website links are stored as references.</p>
 <p id="hc-transfer-export-status" class="hc-familytree-transfer-status" role="status" aria-live="polite"></p>
 <div class="hc-familytree-form-actions"><button type="button" data-close>Cancel</button><button type="button" class="primary" id="hc-transfer-export-start">Download file</button></div></div>`);
 const aButtons=[...document.querySelectorAll('input[name="hc-transfer-export-format"]')];
 const oScope=fnValue('hc-transfer-scope-wrap'),sStatus=fnValue('hc-transfer-export-status'),nStart3=fnValue('hc-transfer-export-start');
 if(oInitialScope==='current'&&bOwnedTreeSelected)fnValue('hc-transfer-export-scope').value='current';
 /**
 * @brief Zjistí aktuálně vybraný formát pro export.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnChosen=()=>aButtons.find(/** @h05-inline
 * @brief Vyhledá první záznam splňující danou podmínku.
 * @param {number} nX36 Hodnota nX36 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
nX36=>nX36.checked)?.value||'native';
 /**
 * @brief Aktualizuje související ovládací prvky formuláře.
 * @returns {void} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnUpdate=()=>{oScope.hidden=fnChosen()!=='native';nStart3.textContent=fnChosen()==='gedcom'?fnTr("Download .ged"):fnTr("Download file")};
 aButtons.forEach(/** @h05-inline
 * @brief Zpracuje jeden prvek kolekce při průchodu záznamy.
 * @param {unknown} oB28 Hodnota oB28 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
oB28=>oB28.addEventListener('change',fnUpdate));fnUpdate();
 nStart3.onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async()=>{
  const sFormat=fnChosen();nStart3.disabled=true;sStatus.textContent=fnTr("Preparing export…");
  try{
   if(sFormat==='gedcom'){
    if(!bTreeSelected)throw Error(fnTr("Open the family tree that you want to export to GEDCOM first."));
    closeModal();exportGedcom();return;
   }
   const oScopeValue=fnValue('hc-transfer-export-scope').value;
   if(oScopeValue==='current'&&!bOwnedTreeSelected)throw Error(fnTr("Only the owner can create a complete backup of a particular family tree."));
   const sPath6='/api/backups/native'+(oScopeValue==='current'?'?treeId='+encodeURIComponent(nCurrent):'');
   const oResponse=await fetch(OC.generateUrl('/apps/'+sAPP+sPath6),{credentials:'same-origin',cache:'no-store',headers:{Accept:'application/zip'}});
   if(!oResponse.ok){let sMessage3='HTTP '+oResponse.status;try{sMessage3=(await oResponse.json()).error||sMessage3}catch(oValue11){}throw Error(fnTrServer(sMessage3))}
   const oBlob2=await oResponse.blob();
   if(oBlob2.size<100||oBlob2.size>300*1024*1024)throw Error(fnTr("The server did not return a valid FamilyTree archive."));
   const oSignature2=new Uint8Array(await oBlob2.slice(0,4).arrayBuffer());
   if(oSignature2[0]!==80||oSignature2[1]!==75||oSignature2[2]!==3||oSignature2[3]!==4)throw Error(fnTr("The server did not return a ZIP archive."));
   const sHeader=oResponse.headers.get('Content-Disposition')||'';
   const sServerFilename=sHeader.match(/filename="(hc-familytree-backup-[0-9]{8}-[0-9]{6}\.zip)"/i)?.[1];
   downloadArchiveBlob(oBlob2,sServerFilename||'hc-familytree-backup-'+new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'.zip');
   sStatus.textContent=fnTr("Backup is ready to download.");
  }catch(oError14){sStatus.textContent=oError14.message;fnToast(oError14.message,'error')}
  finally{nStart3.disabled=false}
 };
}
// CZ: Jediný vstup importu ze společné nabídky i z kontextu stromu.
// GEDCOM/GEDZIP je přenos genealogie; nativní ZIP je plná záloha FamilyTree.
//*****************************************************************************
/**
 * @brief Zobrazí import choice v uživatelském rozhraní FamilyTree.
 * @returns {void} Funkce nevrací hodnotu.
 */
function showImportChoice(){
 openModal(fnTr("Import family tree or backup"),fnHtml`<div class="hc-familytree-gedcom hc-familytree-transfer-dialog">
 <p>Select the type of imported file. A ZIP extension alone does not identify the format.</p>
 <div class="hc-familytree-transfer-choice">
 <label><input name="hc-transfer-import-format" type="radio" value="gedcom" checked><strong> GEDCOM 7 / GEDZIP (.ged, .gedcom, .gdz, .zip)</strong>\
<small>Import genealogical records and attached images. Create a new family tree directly, or import into the currently open tree.</small></label>
 ${oState?.canEdit ? fnHtml`<label><input name="hc-transfer-import-format" type="radio" value="findings"><strong> Import findings into the existing family tree (.zip)</strong>\
<small>Preview matched people, new relatives, events, evidence images and research journal; no duplicates or overwriting.</small></label>` : ''}
 <label><input name="hc-transfer-import-format" type="radio" value="native"><strong> Complete FamilyTree backup (.zip)</strong>\
<small>Only archives created by the complete FamilyTree backup export. Restoration creates separate trees with new IDs and overwrites nothing.</small></label></div>
 <p class="hc-familytree-hint">An ordinary ZIP can be imported as GEDZIP if it contains GEDCOM 7 in a root-level gedcom.ged file. Arbitrary ZIP archives are not supported.</p>
 <div class="hc-familytree-form-actions"><button type="button" data-close>Cancel</button><button type="button" id="hc-transfer-import-next" class="primary">Continue</button></div></div>`);
 fnValue('hc-transfer-import-next').onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>{
  const sImportFormat=document.querySelector('input[name="hc-transfer-import-format"]:checked')?.value;
  if(sImportFormat==='findings')findingsImportDialog();else if(sImportFormat==='native')importNativeDialog();else gedcom();
 };
}
//*****************************************************************************
/**
 * @brief Otevře nedestruktivní import nálezů s kontrolou osob, vztahů, snímků a deníku.
 * @returns {void} Dialog bez změny dat před výslovným potvrzením uživatele.
 */
function findingsImportDialog() {
 if(!nCurrent||!oState?.canEdit){fnToast(fnTr('Select an editable family tree.'),'warning');return;}
 const nTargetTree=nCurrent;
 openModal(fnTr('Import findings into the existing family tree'),fnHtml`<div class="hc-familytree-gedcom hc-familytree-transfer-dialog">
 <p>The original family tree is preserved. Exact stable IDs match existing people; uncertain identities require manual matching. Other people are never removed or marked as missing.</p>
 <p><strong>${fnEsc(currentTreeName())}</strong></p>
 <label>Research findings ZIP<input id="hc-findings-file" type="file" accept=".zip,application/zip"></label>
 <button id="hc-findings-preview" type="button">Preview findings</button>
 <div id="hc-findings-plan" class="hc-familytree-transfer-status" role="status" aria-live="polite"></div>
 <label class="hc-familytree-transfer-checkbox"><input id="hc-findings-confirm" type="checkbox" disabled> I have reviewed the plan and backed up this family tree.</label>
 <p class="hc-familytree-hint">The importer adds people, verified relationships, events, research journal and images. Existing facts are not overwritten. Unverified partnerships and conflicting birth dates stay for manual review.</p>
 <div class="hc-familytree-form-actions"><button type="button" data-close>Cancel</button><button id="hc-findings-apply" type="button" class="primary" disabled>Import approved findings</button></div>
 </div>`);
 const hFile=fnValue('hc-findings-file'),hPreview=fnValue('hc-findings-preview'),hPlan=fnValue('hc-findings-plan'),hConfirm=fnValue('hc-findings-confirm'),hApply=fnValue('hc-findings-apply');
 let oApproved=null;
 const oMatches={};
 /**
  * @brief Zruší předchozí schválení při změně balíčku nebo ručního přiřazení.
  * @returns {void} Bez návratové hodnoty.
  */
 const fnReset=()=>{oApproved=null;hApply.disabled=true;hConfirm.disabled=true;hConfirm.checked=false};
 hFile.onchange=()=>{fnReset();hPlan.replaceChildren()};
 /**
  * @brief Připraví upload a předá ručně přiřazené stabilní identifikátory.
  * @param {string} sHash Otisk potvrzeného plánu, prázdný při preview.
  * @returns {FormData} Formulář pro serverovou kontrolu.
  */
 const fnBody=(sHash='')=>{const oForm=new FormData();
  if(hFile.files[0])oForm.append('findings',hFile.files[0]);
  oForm.append('manual_matches',JSON.stringify(oMatches));
  if(sHash){oForm.append('preview_sha256',sHash);oForm.append('confirm','yes')}
  return oForm;
 };
 hConfirm.onchange=()=>{hApply.disabled=!oApproved||!hConfirm.checked};
 hPreview.onclick=async()=>{
  if(!hFile.files.length)return fnToast(fnTr('Select a ZIP archive.'),'warning');
  fnReset();hPreview.disabled=true;hPlan.textContent=fnTr('Checking import…');
  try{
   const oReport=await fnApi('/api/trees/'+nTargetTree+'/findings/preview',{method:'POST',body:fnBody()});
   const oC=oReport.counts;
   const sHeading=`<p><strong>${fnTr('Preview findings')}</strong> ·
      ${fnTr('new people')}: ${+oC.persons_new}, ${fnTr('existing people')}: ${+oC.persons_existing},
      ${fnTr('new relationships')}: ${+oC.relations_new}, ${fnTr('new events')}: ${+oC.events_new},
      ${fnTr('images')}: ${+oC.pictures}, ${fnTr('journal records')}: ${+oC.journal_new}
      (${+oC.journal_existing} ${fnTr('existing')}).</p>`;
   const sOptions=(oState.people||[]).map(oPerson=>`<option value="${fnEsc(oPerson.stable_id||'')}">${fnEsc([oPerson.given_name,oPerson.surname].filter(Boolean).join(' ')+' · '+(oPerson.stable_id||''))}</option>`).join('');
   const sPeople=(oReport.people||[]).map(oPerson=>{
    const sValue=oMatches[oPerson.source_id]||'';
    return `<tr><td>${fnEsc(oPerson.name)}</td>
      <td>${oPerson.action==='existing'?fnTr('Matches existing person'):fnTr('Create person')}</td>
      <td><select data-findings-match="${fnEsc(oPerson.source_id)}">
        <option value="">${fnTr('Use automatic mapping')}</option>${sOptions}</select></td></tr>`;
   }).join('');
   const sConflicts=(oReport.conflicts||[]).map(sText=>`<li>${fnEsc(sText)}</li>`).join('');
   const sWarnings=(oReport.warnings||[]).map(sText=>`<li>${fnEsc(sText)}</li>`).join('');
   const sRelations=(oReport.relations||[]).map(oRelation=>`<li>${fnEsc(oRelation.names)} (${fnEsc(oRelation.action)})</li>`).join('');
   hPlan.innerHTML=sHeading+
    `<p><strong>${fnTr('People and matching')}</strong></p><div style="overflow:auto"><table><thead>
      <tr><th>${fnTr('Person')}</th><th>${fnTr('Action')}</th><th>${fnTr('Manual match')}</th></tr>
      </thead><tbody>${sPeople}</tbody></table></div>`+
    `<details><summary>${fnTr('Relationships for review')}</summary><ul>${sRelations}</ul></details>`+
    (sConflicts?`<p><strong>${fnTr('Conflicts – import blocked')}</strong></p><ul>${sConflicts}</ul>`:'')+
    (sWarnings?`<p><strong>${fnTr('Warnings')}</strong></p><ul>${sWarnings}</ul>`:'')+
    `<p>${fnTr('Existing persons and events will not be overwritten. A repeat import skips existing journal records and files.')}</p>`;
   for(const hSelect of hPlan.querySelectorAll('select[data-findings-match]')){
    const sSource=hSelect.dataset.findingsMatch;
    hSelect.value=oMatches[sSource]||'';
    hSelect.onchange=()=>{if(hSelect.value)oMatches[sSource]=hSelect.value;else delete oMatches[sSource];fnReset()};
   }
   if(!(oReport.conflicts||[]).length){oApproved={file:hFile.files[0],hash:oReport.plan_sha256};hConfirm.disabled=false;}
  }catch(oError){hPlan.textContent=oError.message;fnToast(oError.message,'error')}
  finally{hPreview.disabled=false}
 };
 hApply.onclick=async()=>{
  if(!oApproved||oApproved.file!==hFile.files[0]||!hConfirm.checked||nTargetTree!==nCurrent)return;
  hApply.disabled=true;hPlan.textContent=fnTr('Importing approved findings…');
  try{
   const oDone=await fnApi('/api/trees/'+nTargetTree+'/findings/apply',{method:'POST',body:fnBody(oApproved.hash)});
   closeModal();await loadTrees();await selectTree(nTargetTree);
   fnToast(fnTr('Findings imported')+`: ${+oDone.created_people} ${fnTr('new people')}, ${+oDone.created_relations} ${fnTr('new relationships')}, ${+oDone.documents} ${fnTr('images')}, ${+oDone.journal_new} ${fnTr('journal records')}.`);
  }catch(oError){hPlan.textContent=oError.message;fnToast(oError.message,'error');fnReset()}
 };
}

//*****************************************************************************
/**
 * @brief Importuje native dialog v uživatelském rozhraní FamilyTree.
 * @returns {void} Funkce nevrací hodnotu.
 */
function importNativeDialog(){
 openModal(fnTr("Restore FamilyTree backup"),fnHtml`<div class="hc-familytree-gedcom hc-familytree-transfer-dialog">
 <p>Select the original FamilyTree ZIP. All trees, people and files are restored under new IDs. Existing data remains unchanged.</p>
 <label>Backup file<input id="hc-native-backup-file" type="file" accept=".zip,application/zip"></label>
 <button type="button" id="hc-native-backup-preview">Verify backup</button>
 <div id="hc-native-backup-summary" class="hc-familytree-transfer-status" role="status" aria-live="polite"></div>
 <label class="hc-familytree-transfer-checkbox"><input type="checkbox" id="hc-native-backup-shares"> Reactivate shares to existing users and groups (optional)</label>
 <p class="hc-familytree-hint">Share records are always included in the archive. They are not reactivated unless you opt in. External URLs are not fetched into the backup.</p>
 <div class="hc-familytree-form-actions"><button type="button" data-close>Cancel</button>\
<button type="button" class="primary" id="hc-native-backup-restore" disabled>Restore as new family trees</button></div></div>`);
 const oFile=fnValue('hc-native-backup-file'),oPreview=fnValue('hc-native-backup-preview'),oRestore=fnValue('hc-native-backup-restore'),oSummary=fnValue('hc-native-backup-summary'),oShares=fnValue('hc-native-backup-shares');
 let oApproved=null;
 oFile.onchange=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>{oApproved=null;oRestore.disabled=true;oSummary.replaceChildren()};
 /**
 * @brief Připraví pole formuláře podle záznamu a jeho nastavení.
 * @param {string} sHash Textový parametr sHash předaný operaci.
 * @returns {FormData} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnForm=(sHash='')=>{const oF2=new FormData();if(oFile.files[0])oF2.append('backup',oFile.files[0]);if(sHash)oF2.append('preview_sha256',sHash);oF2.append('restore_shares',oShares.checked?'1':'0');return oF2};
 oPreview.onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async()=>{
  if(!oFile.files.length)return fnToast(fnTr("Select a ZIP archive."),'warning');
  if(/\.(?:gdz|ged|gedcom)$/i.test(oFile.files[0].name)){oSummary.textContent=fnTr("This is GEDCOM/GEDZIP, not a complete FamilyTree backup. Go back and choose GEDCOM 7 / GEDZIP import.");return;}
  oPreview.disabled=true;oSummary.textContent=fnTr("Checking import…");
  try{const oResult2=await fnApi('/api/backups/native/preview',{method:'POST',body:fnForm()});
   oApproved={file:oFile.files[0],sha256:oResult2.sha256};oRestore.disabled=false;
   oSummary.innerHTML=fnHtml`<p><strong>Backup verified.</strong> ${fnTr("Trees:")} ${+oResult2.trees}, ${fnTr("people:")} ${+oResult2.people}, ${fnTr("total records:")} ${+oResult2.records}, ${
    fnTr("attached files:")} ${+oResult2.files}, ${fnTr("shares:")} ${+oResult2.shares}.</p><p>Restore creates new trees without overwriting existing records.</p>`;
  }catch(oError15){oApproved=null;oRestore.disabled=true;oSummary.textContent=oError15.message;fnToast(oError15.message,'error')}
  finally{oPreview.disabled=false}
 };
 oRestore.onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async()=>{
  if(!oApproved||oApproved.file!==oFile.files[0])return;
  oRestore.disabled=true;oSummary.textContent=fnTr("Saving family tree…");
  try{
   const oResult3=await fnApi('/api/backups/native/import',{method:'POST',body:fnForm(oApproved.sha256)});
   closeModal();await loadTrees();
   if(oResult3.trees?.[0]?.id)await selectTree(+oResult3.trees[0].id);
   fnToast(fnTr("Restored family trees:")+' '+(oResult3.trees?.length||0)+' · '+fnTr("people:")+' '+oResult3.people);
  }catch(oError16){oSummary.textContent=oError16.message;fnToast(oError16.message,'error');oRestore.disabled=false}
 };
}

//*****************************************************************************
/**
 * @brief Exportuje gedcom v uživatelském rozhraní FamilyTree.
 * @returns {void} Funkce nevrací hodnotu.
 */
function exportGedcom(){
 if(!oState||!nCurrent)return;
 openModal(fnTr("Export GEDCOM"),fnHtml`<div class="hc-familytree-gedcom">
 <p><strong>${fnTr("Currently open family tree:")}</strong> ${fnEsc(currentTreeName())
    }</p><p>Download the currently displayed family tree as GEDCOM 7 (.ged, UTF-8). The export includes people, parent and partner links, basic events, and text notes.</p>
 <p class="hc-familytree-hint">GEDCOM is not a complete backup. Research alternatives, citations, and Nextcloud Files attachments are not included. Export does not change the database.</p>
 <div id="hc-familytree-export-status" class="hc-familytree-transfer-status" role="status" aria-live="polite"></div>
 <div class="hc-familytree-form-actions"><button type="button" data-close>Cancel</button><button type="button" id="hc-familytree-export-download" class="primary">Download .ged</button></div></div>`);
 const hButton9=fnValue('hc-familytree-export-download'),sStatus2=fnValue('hc-familytree-export-status');
 hButton9.onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async()=>{
  hButton9.disabled=true;sStatus2.textContent=fnTr("Preparing export…");
  try{
   const oResponse2=await fetch(OC.generateUrl('/apps/'+sAPP+'/api/trees/'+nCurrent+'/export/gedcom'),{cache:'no-store',credentials:'same-origin',headers:{Accept:'text/plain'}});
   if(!oResponse2.ok){let sMessage4='HTTP '+oResponse2.status;try{const oError17=await oResponse2.json();sMessage4=oError17.error||sMessage4}catch(oValue12){}throw Error(fnTrServer(sMessage4))}
   const oFile2=await oResponse2.blob();
   if(!oFile2.size||oFile2.size>5*1024*1024||!(await oFile2.slice(0,100).text()).startsWith('0 HEAD'))throw Error(fnTr("The server did not return a valid GEDCOM file."));
   const sHref2=URL.createObjectURL(oFile2);
   try{const hAnchor=document.createElement('a');hAnchor.href=sHref2;hAnchor.download='hc_familytree-'+nCurrent+'.ged';document.body.appendChild(hAnchor);hAnchor.click();hAnchor.remove()}
   finally{setTimeout(/** @h05-inline
 * @brief Provede odloženou akci po uplynutí požadovaného intervalu.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
()=>URL.revokeObjectURL(sHref2),60000)}
   sStatus2.textContent=fnTr("The GEDCOM file is ready for download.");
  }catch(oError18){sStatus2.textContent=oError18.message;fnToast(oError18.message,'error')}
  finally{hButton9.disabled=false}
 };
}
// CZ: Přímý import .ged/.gdz/.zip do nového rodokmenu po předběžné kontrole
// nebo import do již otevřeného rodokmenu (nová sada / aktualizace podle UID).
//*****************************************************************************
/**
 * @brief Otevře dialog importu GEDCOM 7 nebo GEDZIP včetně náhledu a výběru cílového rodokmenu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function gedcom(){
 const bCanCurrent=!!nCurrent&&!!oState?.canEdit;
 openModal(fnTr("Import GEDCOM 7 / GEDZIP"),fnHtml`<div class="hc-familytree-gedcom hc-familytree-transfer-dialog">
 <p>Select GEDCOM 7 (.ged, .gedcom) or GEDZIP (.gdz or .zip containing gedcom.ged). A preview shows people, relationships and media counts. Existing trees are not overwritten automatically.</p>
 <label>File<input id="hc-familytree-research-file" type="file" accept=".ged,.gedcom,.gdz,.zip,text/plain,application/zip"></label>
 <label>Import destination<select id="hc-familytree-import-destination"><option value="new">Create a new family tree</option>${
    bCanCurrent?fnHtml`<option value="current">Importovat do otevřeného rodokmenu: ${fnEsc(currentTreeName())}</option>`:''}</select></label>
 <label id="hc-familytree-new-name-wrap">New family tree name<input id="hc-familytree-new-import-name" type="text" maxlength="200" placeholder="Family tree name"></label>
 <label>Dataset identifier<input id="hc-familytree-research-origin" value="genealogie" maxlength="64" pattern="[A-Za-z0-9_-]+"></label>
 <label id="hc-familytree-research-mode-wrap">Mode for the open family tree<select id="hc-familytree-research-mode"><option value="new">Import into an empty tree</option>\
<option value="update">Update this dataset by UID</option></select></label>
 <p class="hc-familytree-hint">A new tree is created only after the file passes validation and you confirm the import. Updates match records by UID and do not automatically delete missing records.</p>
 <button id="hc-familytree-research-preview" type="button">Preview file</button>
 <div id="hc-familytree-research-preview-result" class="hc-familytree-transfer-status" role="status" aria-live="polite"></div>
 <div class="hc-familytree-form-actions"><button type="button" data-close>Cancel</button>\
<button id="hc-familytree-research-import" class="primary" type="button" disabled>Import as a new family tree</button></div></div>`);
 const oFile3=fnValue('hc-familytree-research-file'),oDestination=fnValue('hc-familytree-import-destination'),oNewName=fnValue('hc-familytree-new-import-name'),oNameWrap=fnValue('hc-familytree-new-name-wrap'),
    sOrigin4=fnValue('hc-familytree-research-origin'),oMode=fnValue('hc-familytree-research-mode'),oModeWrap=fnValue('hc-familytree-research-mode-wrap'),hPreviewButton=fnValue('hc-familytree-research-preview'),
    hImportButton=fnValue('hc-familytree-research-import'),oResult4=fnValue('hc-familytree-research-preview-result');
 /**
 * @brief Ověří, zda aktuální datový záznam obsahuje informaci o původu.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnCurrentHasOrigin=()=>researchRows('package').some(/** @h05-inline
 * @brief Ověří, zda prvek kolekce vyhovuje požadované podmínce.
 * @param {unknown} oR60 Hodnota oR60 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oR60=>oR60.origin_key===sOrigin4.value.trim());
 let oApproved2=null,bNameAutofilled=false;
 /**
 * @brief Vrátí ovládací prvky dialogu na výchozí stav.
 * @returns {void} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnReset=()=>{oApproved2=null;hImportButton.disabled=true;oResult4.replaceChildren()};
 /**
 * @brief Ověří, zda je jako cíl importu vybrán nový rodokmen.
 * @returns {boolean} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnIsNew=()=>oDestination.value==='new';
 /**
 * @brief Aktualizuje stav sync destination bez změny uložených genealogických dat.
 * @returns {void} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnSyncDestination=()=>{oNameWrap.hidden=!fnIsNew();oModeWrap.hidden=fnIsNew();oMode.value=fnIsNew()?'new':fnCurrentHasOrigin()?'update':'new';
    hImportButton.textContent=fnIsNew()?fnTr("Import as a new family tree"):fnTr("Import into the open family tree");fnReset()};
 oDestination.onchange=fnSyncDestination;
 oFile3.onchange=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>{
  if(oFile3.files[0]&&(!oNewName.value.trim()||bNameAutofilled)){
   oNewName.value=oFile3.files[0].name.replace(/\.(ged|gedcom|gdz|zip)$/i,'').replace(/[_-]+/g,' ').trim().slice(0,200)||fnTr("New family tree");bNameAutofilled=true;
  }
  fnReset();
 };
 oNewName.oninput=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>{bNameAutofilled=false;fnReset()};sOrigin4.oninput=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>{if(!fnIsNew())oMode.value=fnCurrentHasOrigin()?'update':'new';fnReset()};oMode.onchange=fnReset;
 fnSyncDestination();
 /**
 * @brief Vytvoří FormData pro odeslání importu a připojí kontrolní součet náhledu.
 * @param {string} sHash2 Textový parametr sHash2 předaný operaci.
 * @returns {FormData} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnBody=(sHash2='')=>{const oData4=new FormData();oData4.append('package',oFile3.files[0]);oData4.append('origin',sOrigin4.value.trim());oData4.append('mode',fnIsNew()?'new':oMode.value);
    if(sHash2)oData4.append('preview_sha256',sHash2);return oData4};
 hPreviewButton.onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async()=>{
  if(!oFile3.files.length)return fnToast(fnTr("Select a .ged, .gdz, or .zip archive containing gedcom.ged."),'warning');
  if(fnIsNew()&&!oNewName.value.trim()){oResult4.textContent=fnTr("Enter a name for the new family tree.");return;}
  hPreviewButton.disabled=true;oResult4.textContent=fnTr("Checking import…");
  try{
   const nTargetId=nCurrent;
   if(!fnIsNew()&&(!bCanCurrent||!nTargetId))throw Error(fnTr("You do not have permission to edit this family tree."));
   const oData5=await fnApi(fnIsNew()?'/api/import/gedcom/preview':'/api/trees/'+nTargetId+'/research/preview',{method:'POST',body:fnBody()});
   oApproved2={file:oFile3.files[0],origin:sOrigin4.value.trim(),mode:fnIsNew()?'new':oMode.value,hash:oData5.sha256,destination:oDestination.value,name:oNewName.value.trim(),treeId:nTargetId};
   const oLabels={persons:fnTr("persons"),families:fnTr("families"),relationships:fnTr("relationships"),events:fnTr("events"),facts:fnTr("standard claims"),research_facts:fnTr("research claims"),
    sources:fnTr("sources"),citations:fnTr("citations"),media:fnTr("media"),places:fnTr("places"),research:fnTr("tasks"),notes:fnTr("notes"),note_links:fnTr("note links")};
   const sCounts=Object.entries(oData5.counts).map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} arg0 Rozbalovaný parametr [sKey12,nCount3] se vstupními údaji.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
([sKey12,nCount3])=>`${oLabels[sKey12]||sKey12}: ${nCount3}`).join(' · ');
   const oChanged=Object.values(oData5.changed).reduce(/** @h05-inline
 * @brief Aktualizuje akumulátor podle dalšího prvku kolekce.
 * @param {unknown} oSum6 Hodnota oSum6 předaná callbacku.
 * @param {number} nN8 Hodnota nN8 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oSum6,nN8)=>oSum6+nN8,0),oRemoved=Object.values(oData5.removed||{}).reduce(/** @h05-inline
 * @brief Aktualizuje akumulátor podle dalšího prvku kolekce.
 * @param {unknown} oSum7 Hodnota oSum7 předaná callbacku.
 * @param {number} nN9 Hodnota nN9 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oSum7,nN9)=>oSum7+nN9,0);
   oResult4.innerHTML=fnHtml`<p><b>${fnTr("Format:")}</b> ${fnEsc(oData5.format)} · <b>${fnTr("Records:")}</b> ${fnEsc(sCounts)}</p><p>${fnTr("Attached images:")} ${oData5.available.length}; ${
    fnTr("remote links:")} ${oData5.remote?.length||0}; ${fnTr("missing:")} ${oData5.missing.length}.</p>
   <p>${fnTr("New:")} ${Object.values(oData5.new).reduce(/** @h05-inline
 * @brief Aktualizuje akumulátor podle dalšího prvku kolekce.
 * @param {unknown} oSum8 Hodnota oSum8 předaná callbacku.
 * @param {number} nN10 Hodnota nN10 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oSum8,nN10)=>oSum8+nN10,0)} · ${fnTr("Changed:")} ${oChanged} · ${fnTr("Unchanged:")} ${Object.values(oData5.unchanged).reduce(/** @h05-inline
 * @brief Aktualizuje akumulátor podle dalšího prvku kolekce.
 * @param {unknown} oSum9 Hodnota oSum9 předaná callbacku.
 * @param {number} nN11 Hodnota nN11 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oSum9,nN11)=>oSum9+nN11,0)} · ${
    fnTr("Unknown notes:")} ${+oData5.unknownNotes||0} · ${fnTr("Conflicts:")} ${+oData5.variants||0}</p>
   ${Object.keys(oData5.changes||{}).length?fnHtml`<details><summary>${fnTr("Differences by record type")}</summary><ul>${Object.entries(oData5.changes).map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} arg0 Rozbalovaný parametr [sKey13,oC] se vstupními údaji.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
([sKey13,oC])=>fnHtml`<li>${
    fnEsc(oLabels[sKey13]||sKey13)}: +${+oC.new||0}, Δ${+oC.changed||0}, ${+oC.absent_in_file||0} ${fnTr("absent from file")}</li>`).join('')}</ul></details>`:''}
   ${oData5.missing.length?fnHtml`<details><summary>${fnTr("Missing images")}</summary><ul>${oData5.missing.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {string} sName5 Hodnota sName5 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sName5=>fnHtml`<li>${fnEsc(sName5)}</li>`).join('')}</ul></details>`:''}
   ${Object.keys(oData5.parentConflicts||{}).length?fnHtml`<p class="hc-familytree-import-warning">${fnTr("More than two parent links:")} ${
    fnEsc(Object.entries(oData5.parentConflicts).map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} arg0 Rozbalovaný parametr [sId31,nN12] se vstupními údaji.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
([sId31,nN12])=>`${sId31} (${nN12})`).join(', '))}.\
 ${fnTr("The two best-supported links appear in the tree; other alternatives remain in research records.")}</p>`:''}
   ${oRemoved?fnHtml`<p class="hc-familytree-import-warning">${oRemoved} ${fnTr("previous records are absent from the new file; they will be retained for manual review.")}</p>`:''}
   ${oData5.warnings?.length?fnHtml`<details><summary>${fnTr("Warnings")} (${oData5.warnings.length})</summary><ul>${oData5.warnings.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {number} nX37 Hodnota nX37 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
nX37=>fnHtml`<li>${fnEsc(fnTrServer(nX37))}</li>`).join('')}</ul></details>`:''}`;
   hImportButton.disabled=false;
  }catch(oError19){fnReset();oResult4.textContent=oError19.message;fnToast(oError19.message,'error')}
  finally{hPreviewButton.disabled=false}
 };
 hImportButton.onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async()=>{
  if(!oApproved2||oFile3.files[0]!==oApproved2.file||sOrigin4.value.trim()!==oApproved2.origin||oApproved2.mode!==(fnIsNew()?'new':
    oMode.value)||oApproved2.destination!==oDestination.value||oApproved2.name!==oNewName.value.trim()||(!fnIsNew()&&oApproved2.treeId!==nCurrent))return fnReset();
  hImportButton.disabled=true;oResult4.textContent=fnTr("Saving family tree…");
  let nCreatedTree=0;
  try{
   let oImportTreeId=oApproved2.treeId;
   if(fnIsNew()){
    const oT5=await fnApi('/api/trees',{method:'POST',body:JSON.stringify({name:oApproved2.name,description:'GEDCOM 7 / GEDZIP import'})});
    nCreatedTree=+oT5.id;oImportTreeId=nCreatedTree;
   }
   const bDone2=await fnApi('/api/trees/'+oImportTreeId+'/research/import',{method:'POST',body:fnBody(oApproved2.hash)});
   oApproved2=null;closeModal();
   try{await selectTree(oImportTreeId)}catch(oError20){fnToast(fnTr("The import was saved, but the tree could not be refreshed: ")+oError20.message,'warning')}
   showImportReport(bDone2);
  }catch(oError21){
   if(nCreatedTree){
    oResult4.textContent=fnTr("The family tree was created, but the import could not be confirmed: ")+oError21.message+fnTr(" Check the new tree before retrying; the app does not delete it automatically.");
    try{await selectTree(nCreatedTree)}catch(oValue13){try{await loadTrees()}catch(oValue14){}}
   }else{oResult4.textContent=oError21.message}
   oApproved2=null;hImportButton.disabled=true;fnToast(oError21.message,'error');
  }
 };
}

// Výzkumný deník je oddělen od genealogických faktů. Kandidáti nikdy nemění rodokmen automaticky.
let sLastJournalTab='archive';
const oJournalTabNames={archive:'Archiv P/F/Q',media:'Matriky a fotografie',tasks:'Úkoly',searches:'Deník hledání',evidence:'Nálezy a důkazy',proposals:'Návrhy a rozpory',history:'Historie změn',statistics:'Statistiky'};
const oJournalStatusNames={planned:'Plánováno',in_progress:'Probíhá',waiting_verify:'Čeká na ověření',done:'Hotovo',rejected:'Zamítnuto',no_result:'Nenalezeno',unverified:'Neověřeno',
    candidate:'Kandidát',found:'Nalezeno',transcribed:'Přepsáno',verified:'Ověřeno',pending:'Čeká na schválení',approved:'Schváleno',postponed:'Odloženo'};
/**
 * @brief Vygeneruje možnosti stavů pro filtr výzkumného deníku.
 * @param {unknown[]} aValues6 Kolekce aValues6 se zpracovávanými záznamy.
 * @param {boolean} bSelected3 Přepínač bSelected3, který určuje chování.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnJournalOptions=(aValues6,bSelected3)=>aValues6.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {string} sValue17 Hodnota sValue17 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sValue17=>fnHtml`<option value="${fnEsc(sValue17)}" ${sValue17===bSelected3?'selected':''}>${fnEsc(fnTr(oJournalStatusNames[sValue17]||sValue17))}</option>`).join('');
// CZ: Stavové filtry čtou skutečně uložené hodnoty. Původní zápisy Q mohou
// mít velká písmena (DONE) nebo nestandardní status a nesmějí se ztratit.
/**
 * @brief Převede stav deníku na normalizovaný vyhledávací klíč.
 * @param {string} sValue18 Textový parametr sValue18 předaný operaci.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnJournalNormalizeStatus=sValue18=>String(sValue18??'').trim().toLowerCase()||'__none__';
/**
 * @brief Vrátí lokalizovaný popisek konkrétního stavu výzkumného deníku.
 * @param {string} sValue19 Textový parametr sValue19 předaný operaci.
 * @returns {string} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnJournalStatusLabel=sValue19=>sValue19==='__none__'?fnTr("Unspecified status"):fnTr(oJournalStatusNames[sValue19]||sValue19);
//*****************************************************************************
/**
 * @brief Zpracuje deník stav filter options v uživatelském rozhraní FamilyTree.
 * @param {unknown} aValues7 Vstupní hodnota values; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {unknown} {includeAll: bIncludeAll=false} Vstupní hodnota {includeAll=false}; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function journalStatusFilterOptions(aValues7,{includeAll: bIncludeAll=false}={}){
 const oSet=new Set(aValues7.map(fnJournalNormalizeStatus));
 if(bIncludeAll)for(const sStatus3 of ['planned','in_progress','waiting_verify','done','rejected'])oSet.add(sStatus3);
 const aSorted2=[...oSet].sort(/** @h05-inline
 * @brief Porovná dvě položky pro určení jejich pořadí.
 * @param {unknown} oA28 Hodnota oA28 předaná callbacku.
 * @param {unknown} oB29 Hodnota oB29 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(oA28,oB29)=>fnJournalStatusLabel(oA28).localeCompare(fnJournalStatusLabel(oB29),sAppLanguage.startsWith('cs')?'cs':'en'));
 return fnHtml`<option value="">${fnTr("All statuses")}</option>`+aSorted2.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {string} sStatus4 Hodnota sStatus4 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sStatus4=>fnHtml`<option value="${fnEsc(sStatus4)}">${fnEsc(fnJournalStatusLabel(sStatus4))}</option>`).join('');
}
// CZ: Změna stromu nesmí přenést vybraný filtr do jiného rodokmenu.
let nJournalFilterTreeId=0;
const oJournalFilterState={};
//*****************************************************************************
/**
 * @brief Zpracuje deník saved filter v uživatelském rozhraní FamilyTree.
 * @param {unknown} oTab Vstupní hodnota tab; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function journalSavedFilter(oTab){
 if(nJournalFilterTreeId!==nCurrent){for(const sKey14 of Object.keys(oJournalFilterState))delete oJournalFilterState[sKey14];nJournalFilterTreeId=nCurrent}
 return oJournalFilterState[oTab]||(oJournalFilterState[oTab]={});
}
/**
 * @brief Sestaví HTML volby výzkumného úkolu.
 * @param {unknown[]} aTasks3 Kolekce aTasks3 se zpracovávanými záznamy.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnTaskChooser=(aTasks3)=>fnHtml`<option value="">${fnTr("No assigned task")}</option>`+aTasks3.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oTask2 Hodnota oTask2 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oTask2=>fnHtml`<option value="${fnEsc(oTask2.stable_id)}">${fnEsc(oTask2.title)}</option>`).join('');
//*****************************************************************************
/**
 * @brief Zpracuje deník formulář for v uživatelském rozhraní FamilyTree.
 * @param {unknown} oTab2 Vstupní hodnota tab; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {unknown} oJournal Vstupní hodnota journal; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function journalFormFor(oTab2,oJournal){
 if(!oState?.canEdit)return '';
 if(oTab2==='tasks')return fnHtml`<form id="hc-familytree-journal-form" class="hc-familytree-journal-form" data-kind="tasks"><h3>${fnTr("New research task")}</h3><label>${fnTr("Name")
    }<input name="title" maxlength="255" required></label><div class="hc-familytree-grid"><label>${fnTr("Status")}<select name="status">${
    fnJournalOptions(['planned','in_progress','waiting_verify','done','rejected'],'planned')}</select></label><label>${fnTr("Priority")}<select name="priority"><option value="normal">${
    fnTr("Normal")}</option><option value="high">${fnTr("High")}</option><option value="low">${fnTr("Low")}</option></select></label></div><label>${fnTr("Hypothesis")
    }<textarea name="hypothesis" rows="2"></textarea></label><label>${fnTr("Next verifiable step")
    }<textarea name="next_action" rows="2"></textarea></label><button class="primary" type="submit">${fnTr("Add task")}</button></form>`;
 if(oTab2==='searches')return fnHtml`<form id="hc-familytree-journal-form" class="hc-familytree-journal-form" data-kind="searches"><h3>${fnTr("Record search")}</h3><label>${
    fnTr("What and where I searched")}<textarea name="query_text" required rows="2"></textarea></label><div class="hc-familytree-grid"><label>${fnTr("Task")}<select name="task_uid">${
    fnTaskChooser(oJournal.tasks)}</select></label><label>${fnTr("Outcome")}<select name="outcome">${fnJournalOptions(['unverified','no_result','candidate','found','rejected'],'unverified')
    }</select></label></div><label>${fnTr("Source URL")}<input name="source_url" type="url" placeholder="https://..."></label><label>${fnTr("Note")
    }<textarea name="notes" rows="2"></textarea></label><button class="primary" type="submit">${fnTr("Save search log")}</button></form>`;
 if(oTab2==='evidence')return fnHtml`<form id="hc-familytree-journal-form" class="hc-familytree-journal-form" data-kind="evidence"><h3>${fnTr("Add finding or evidence")
    }</h3><div class="hc-familytree-grid"><label>${fnTr("Task")}<select name="task_uid">${fnTaskChooser(oJournal.tasks)}</select></label><label>${fnTr("Verification status")}<select name="status">${
    fnJournalOptions(['candidate','transcribed','verified','rejected'],'candidate')}</select></label><label>${fnTr("Archive")}<input name="archive" maxlength="255"></label><label>${
    fnTr("Archive reference")}<input name="signature" maxlength="128"></label><label>${fnTr("Image number")}<input name="image_number" maxlength="64"></label><label>${
    fnTr("Confidence (text assessment)")}<input name="confidence_label" maxlength="32" placeholder="e.g. verified original"></label></div><label>${fnTr("Direct link")
    }<input name="source_url" type="url"></label><label>${fnTr("Record transcription")}<textarea name="transcription" rows="3"></textarea></label><label>${fnTr("Notes and conflicts")
    }<textarea name="notes" rows="2"></textarea></label><button class="primary" type="submit">${fnTr("Add evidence")}</button></form>`;
 if(oTab2==='proposals')return fnHtml`<form id="hc-familytree-journal-form" class="hc-familytree-journal-form" data-kind="proposals"><h3>${fnTr("Propose a person change")}</h3><label>${
    fnTr("Person")}<select name="target_uid" required><option value="">${fnTr("Select person")}</option>${(oState?.people||[]).map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oP39 Hodnota oP39 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oP39=>fnHtml`<option value="${fnEsc(oP39.stable_id||'')}">${
    fnEsc((oP39.given_name+' '+oP39.surname).trim())}</option>`).join('')}</select></label><input type="hidden" name="target_type" value="person"><label>${fnTr("Field")}<select name="field">${
    ['given_name','surname','birth_surname','birth_date','death_date','birth_place','death_place','occupation','notes'].map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {string} sX3 Hodnota sX3 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sX3=>fnHtml`<option value="${sX3}">${
    fnEsc(fnTr(({given_name:'Jméno',surname:'Příjmení',birth_surname:'Rodné příjmení',birth_date:'Datum narození',death_date:'Datum úmrtí',birth_place:'Místo narození',death_place:'Místo úmrtí',
    occupation:'Povolání',notes:'Poznámky'})[sX3]||sX3))}</option>`).join('')}</select></label><label>${fnTr("Proposed value")}<textarea name="value" rows="2"></textarea></label><label>${
    fnTr("Linked evidence")}<select name="evidence_uid"><option value="">${fnTr("No evidence – draft only")}</option>${oJournal.evidence.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oE29 Hodnota oE29 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oE29=>fnHtml`<option value="${fnEsc(oE29.stable_id)}">${
    fnEsc(oE29.signature||oE29.archive||oE29.stable_id)} (${fnEsc(fnTr(oJournalStatusNames[oE29.status]||oE29.status))})</option>`).join('')}</select></label><label>${fnTr("Rationale")
    }<textarea name="reason" rows="2"></textarea></label><button class="primary" type="submit">${fnTr("Save proposal (do not change the tree)")}</button></form>`;
 return '';
}
const oStatisticsLabels={trees:'Rodokmeny',people:'Osoby',relations:'Vztahy',events:'Události',documents:'Dokumenty',document_links:'Vazby dokumentů',shares:'Sdílení',
    research_records:'Importované výzkumné záznamy',tasks:'Výzkumné úkoly',searches:'Záznamy hledání',evidence:'Nálezy a důkazy',proposals:'Návrhy změn',history:'Historie změn'};
/**
 * @brief Zformátuje statistickou hodnotu podle aktuálního jazyka.
 * @param {string} sValue20 Textový parametr sValue20 předaný operaci.
 * @returns {string} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnStatNumber=sValue20=>new Intl.NumberFormat(sAppLanguage.startsWith('cs')?'cs-CZ':sAppLanguage).format(Number(sValue20)||0);
// CZ: Technické kódy v databázi neměnit; pouze je srozumitelně pojmenovat v přehledu.
const oStatisticsTypeLabels={
 relations:{parent:'Rodič a dítě',partner:'Partnerství'},
 events:{birt:'Narození',birth:'Narození',bapm:'Křest',baptism:'Křest',chr:'Křest',chri:'Křest',marr:'Svatba',marriage:'Svatba',deat:'Úmrtí',death:'Úmrtí',buri:'Pohřeb',burial:'Pohřeb',
    even:'Jiná událost',other:'Jiná událost',resi:'Bydliště',residence:'Bydliště',occu:'Povolání',occupation:'Povolání',div:'Rozvod',divorce:'Rozvod'},
 research_records:{persons:'Osoby',person:'Osoby',families:'Rodiny',relationships:'Vztahy',events:'Události',media:'Média',sources:'Prameny',citations:'Citace',
    research_facts:'Výzkumná tvrzení',notes:'Poznámky',note_links:'Odkazy poznámek',places:'Místa',documents:'Dokumenty'},
 history:{create:'Vytvoření',insert:'Vytvoření',update:'Úprava',delete:'Smazání',restore:'Obnovení',revert:'Vrácení změny',import:'Import'}
};
/**
 * @brief Vrátí uživatelský popisek pro typ statistického záznamu.
 * @param {unknown} oGroup18 Kontextová hodnota oGroup18 potřebná pro daný výpočet.
 * @param {string} sValue21 Textový parametr sValue21 předaný operaci.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnStatisticsTypeLabel=(oGroup18,sValue21)=>{
 const sRaw2=String(sValue21??'').trim();
 if(!sRaw2||sRaw2==='(neuvedeno)'||sRaw2==='__none__')return fnTr("Unspecified type");
 const sCode2=sRaw2.toLocaleLowerCase('en');
 return fnTr(oStatisticsTypeLabels[oGroup18]?.[sCode2]||oJournalStatusNames[sCode2]||sRaw2.replaceAll('_',' '));
};
const oStatisticsIcons={relations:'♧',events:'◇',research_records:'▤',tasks:'✓',searches:'⌕',evidence:'✧',proposals:'↔',history:'↶'};
// CZ: Podrobnosti jsou čteny přímo ze statistik API; žádné počty se zde nesčítají do celkového součtu.
//*****************************************************************************
/**
 * @brief Zpracuje breakdown kartu v uživatelském rozhraní FamilyTree.
 * @param {unknown} sKey15 Vstupní hodnota key; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {unknown} aRows Vstupní hodnota rows; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function statisticsBreakdownCard(sKey15,aRows){
 const aEntries4=Object.entries(aRows||{}).map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} arg0 Rozbalovaný parametr [sName6,nCount4] se vstupními údaji.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
([sName6,nCount4])=>({name: sName6,count:Math.max(0,Number(nCount4)||0)}));
 if(!aEntries4.length)return '';
 const nTotal2=aEntries4.reduce(/** @h05-inline
 * @brief Aktualizuje akumulátor podle dalšího prvku kolekce.
 * @param {number} nSum Hodnota nSum předaná callbacku.
 * @param {unknown} oRow8 Hodnota oRow8 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(nSum,oRow8)=>nSum+oRow8.count,0);
 return fnHtml`<article class="hc-familytree-stats-card">
  <header class="hc-familytree-stats-card-header"><span class="hc-familytree-stats-card-icon" aria-hidden="true">${oStatisticsIcons[sKey15]||'▥'}</span><h4>${fnTr(oStatisticsLabels[sKey15]||sKey15)
    }</h4><span class="hc-familytree-stats-card-total" title="${fnTr("Records in category")}">${fnStatNumber(nTotal2)}</span></header>
  <ul class="hc-familytree-stats-card-list">${aEntries4.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} arg0 Rozbalovaný parametr {name: sName7,count: nCount5} se vstupními údaji.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
({name: sName7,count: nCount5})=>{
   const nPercentage=nTotal2>0?Math.min(100,100*nCount5/nTotal2):0;
   return fnHtml`<li class="hc-familytree-stats-card-row"><div class="hc-familytree-stats-card-line"><span class="hc-familytree-stats-card-label" title="${fnEsc(fnStatisticsTypeLabel(sKey15,sName7))
    }">${fnEsc(fnStatisticsTypeLabel(sKey15,sName7))}</span><span class="hc-familytree-stats-card-value">${fnStatNumber(nCount5)}<small>${Math.round(nPercentage)
    } %</small></span></div><div class="hc-familytree-stats-card-track" aria-hidden="true"><span style="width:${nPercentage.toFixed(2)}%"></span></div></li>`;
  }).join('')}</ul>
 </article>`;
}
//*****************************************************************************
/**
 * @brief Zpracuje content v uživatelském rozhraní FamilyTree.
 * @param {unknown} oStat Vstupní hodnota stat; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function statisticsContent(oStat){
 const oCounts=oStat.counts||{},aGroups5=oStat.breakdowns||{};
 const sCards=Object.entries(aGroups5).filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} arg0 Rozbalovaný parametr [,aRows2] se vstupními údaji.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
([,aRows2])=>Object.keys(aRows2||{}).length).map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} arg0 Rozbalovaný parametr [sKey16,aRows3] se vstupními údaji.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
([sKey16,aRows3])=>statisticsBreakdownCard(sKey16,aRows3)).join('');
 return fnHtml`<section class="hc-familytree-statistics" aria-label="${fnTr("Tree statistics")}">
  <div class="hc-familytree-stats-heading"><h3>${fnTr("Statistics")}: ${fnEsc(oStat.title||'')}</h3><span>${fnTr("Current database record counts")}</span></div>
  <table class="hc-familytree-stats-table"><thead><tr><th scope="col">${fnTr("Record type")}</th><th scope="col">${fnTr("Count")}</th></tr></thead><tbody>
   ${Object.entries(oStatisticsLabels).map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} arg0 Rozbalovaný parametr [sKey17,sLabel8] se vstupními údaji.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
([sKey17,sLabel8])=>fnHtml`<tr><th scope="row">${fnTr(sLabel8)}</th><td>${fnStatNumber(oCounts[sKey17])}</td></tr>`).join('')}
   <tr class="hc-familytree-stats-total"><th scope="row">${fnTr("Total records (simple sum)")}</th><td>${fnStatNumber(oStat.total)}</td></tr>
  </tbody></table>
  <p class="hc-familytree-hint">${fnTr("Each database row is counted exactly once. Each tree is counted as one record. The breakdown below does not add to the total. History includes all stored records, not just the latest 500 shown.")
    }</p>
  <details class="hc-familytree-stats-breakdown"><summary>${fnTr("Breakdown by type and status")}</summary>
   <div class="hc-familytree-stats-cards">${sCards||fnHtml`<p class="hc-familytree-hint">${fnTr("No detailed statistics are available yet.")}</p>`}</div>
  </details>
 </section>`;
}
//*****************************************************************************
/**
 * @brief Otevře owned statistics v uživatelském rozhraní FamilyTree.
 * @returns {Promise<unknown>} Hodnota použitá volající částí rozhraní.
 */
async function openOwnedStatistics(){
 try{const oData6=await fnApi('/api/statistics/owned');openModal(fnTr("Statistics for all my trees"),statisticsContent(oData6))}
 catch(oError22){fnToast(oError22.message,'error')}
}
//*****************************************************************************
/**
 * @brief Zpracuje deník úkol pramen id v uživatelském rozhraní FamilyTree.
 * @param {unknown} oTask3 Vstupní hodnota task; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function journalTaskSourceId(oTask3){
 // CZ: Importér úkolu ukládá původní Q do auditního reason; backend jej vrací jako source_id.
 return String(oTask3.source_id||'').trim().toUpperCase();
}
//*****************************************************************************
/**
 * @brief Zpracuje deník úkol osobu ids v uživatelském rozhraní FamilyTree.
 * @param {unknown} oTask4 Vstupní hodnota task; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function journalTaskPersonIds(oTask4){
 let aRefs=[];
 try{aRefs=JSON.parse(oTask4.person_refs_json||'[]')}catch(oValue15){}
 if(!Array.isArray(aRefs))return [];
 const aIds9=[];
 for(const oPerson15 of oState?.people||[]){
  const aNames=importedPersonIds(oPerson15.id);
  if(aRefs.some(/** @h05-inline
 * @brief Ověří, zda prvek kolekce vyhovuje požadované podmínce.
 * @param {unknown} oRef3 Hodnota oRef3 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oRef3=>[...aNames].some(/** @h05-inline
 * @brief Ověří, zda prvek kolekce vyhovuje požadované podmínce.
 * @param {string} sKey18 Hodnota sKey18 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
sKey18=>sKey18.endsWith('/'+oRef3))))aIds9.push(+oPerson15.id);
 }
 return aIds9;
}
//*****************************************************************************
/**
 * @brief Zpracuje deník úkol items v uživatelském rozhraní FamilyTree.
 * @param {unknown} oJournal2 Vstupní hodnota journal; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function journalTaskItems(oJournal2){
 const oLegacy=legacyResearchTasks(),oUsed=new Set(),aItems=[];
 for(const oTask5 of oJournal2.tasks||[]){
  const oCode=journalTaskSourceId(oTask5),aPeople4=journalTaskPersonIds(oTask5);
  const aCandidates=oLegacy.filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oRow9 Hodnota oRow9 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oRow9=>String(legacyIdentity(oRow9)).trim().toUpperCase()===oCode);
  // CZ: stejné Q z různých sad je potenciální kolize. Slučujeme pouze
  // při jednoznačném kandidátu; pokud existuje více, požadujeme vazbu na osobu.
  const aOverlapping=aCandidates.filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oRow10 Hodnota oRow10 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oRow10=>oRow10.native_person_ids.some(/** @h05-inline
 * @brief Ověří, zda prvek kolekce vyhovuje požadované podmínce.
 * @param {string} sId32 Hodnota sId32 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
sId32=>aPeople4.includes(sId32)));
  const oMatch4=aOverlapping.length===1?aOverlapping[0]:(aCandidates.length===1?aCandidates[0]:null);
  if(oMatch4)oUsed.add(oMatch4);
  const aPersonIds=[...new Set([...aPeople4,...(oMatch4?.native_person_ids||[])])];
  aItems.push({code:oCode||oTask5.stable_id?.slice(0,12)||'',title:oTask5.title,status:oTask5.status,details:oTask5.hypothesis||'',attempts:oMatch4?.data?.attempts||'',result:oMatch4?.data?.result||'',
    next:oTask5.next_action||oMatch4?.data?.next_step||'',checkpoint:oMatch4?.data?.checkpoint||'',origin:'journal',personIds: aPersonIds,taskId:oTask5.id,priority:oTask5.priority,source:oMatch4?.origin_key||''});
 }
 for(const oTask6 of oLegacy){
  if(oUsed.has(oTask6))continue;
  const oD8=oTask6.data||{};
  aItems.push({code:legacyIdentity(oTask6),title:oD8.title||oD8.question||'',status:oD8.status||'unknown',details:oD8.target_text||'',attempts:oD8.attempts||'',result:oD8.result||'',next:oD8.next_step||'',
    checkpoint:oD8.checkpoint||'',origin:'legacy',personIds:oTask6.native_person_ids||[],taskId:null,priority:'',source:oTask6.origin_key});
 }
 aItems.sort(/** @h05-inline
 * @brief Porovná dvě položky pro určení jejich pořadí.
 * @param {unknown[]} aA3 Hodnota aA3 předaná callbacku.
 * @param {unknown[]} aB3 Hodnota aB3 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(aA3,aB3)=>String(aA3.code).localeCompare(String(aB3.code),'cs',{numeric:true})||String(aA3.source).localeCompare(String(aB3.source),'cs'));
 return aItems;
}
//*****************************************************************************
/**
 * @brief Zpracuje deník úkol browser v uživatelském rozhraní FamilyTree.
 * @param {unknown} oJournal3 Vstupní hodnota journal; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function journalTaskBrowser(oJournal3){
 const aItems2=journalTaskItems(oJournal3);
 const sRows=aItems2.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oItem8 Hodnota oItem8 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oItem8=>fnHtml`<article class="hc-familytree-journal-item hc-familytree-task-card" data-task-person-ids="${fnEsc('|'+oItem8.personIds.join('|')+'|')}" data-task-status="${
    fnEsc(fnJournalNormalizeStatus(oItem8.status))}"><div class="hc-familytree-journal-item-head"><strong>${fnEsc(oItem8.code)} · ${fnEsc(oItem8.title)}</strong><span>${
    fnEsc(fnTr(oJournalStatusNames[oItem8.status]||oItem8.status))}</span></div><small>${oItem8.origin==='legacy'?fnTr("Legacy archive – read-only"):fnTr("Current journal")}${
    oItem8.source?' · '+fnEsc(oItem8.source):''}${oItem8.checkpoint?' · '+fnEsc(oItem8.checkpoint):''}</small>${oItem8.details?fnHtml`<p>${fnEsc(oItem8.details)}</p>`:''}${oItem8.attempts?fnHtml`<p><strong>${
    fnTr("Search attempts")}:</strong> ${fnEsc(oItem8.attempts)}</p>`:''}${oItem8.result?fnHtml`<p><strong>${fnTr("Outcome")}:</strong> ${fnEsc(oItem8.result)}</p>`:''}${oItem8.next?fnHtml`<p><strong>${
    fnTr("Next step")}:</strong> ${fnEsc(oItem8.next)}</p>`:''}${oItem8.personIds.length?fnHtml`<div class="hc-familytree-task-persons">${oItem8.personIds.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {string} sId33 Hodnota sId33 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sId33=>{const oP40=byId(sId33);
    return oP40?fnHtml`<button type="button" data-task-open-person="${sId33}">${fnEsc((oP40.given_name+' '+oP40.surname).trim())}</button>`:''}).join('')}</div>`:''}${
    oItem8.taskId&&oState.canEdit?fnHtml`<div class="hc-familytree-journal-actions"><button type="button" data-journal-edit-task="${oItem8.taskId}">${fnTr("Edit status / next step")}\
</button></div>`:''}</article>`).join('');
 return fnHtml`<div data-journal-task-browser class="hc-familytree-journal-task-browser"><p class="hc-familytree-hint">${
    fnTr("Historical Q and current journal tasks are shown together. Original texts remain unchanged; matching tasks are linked for display only.")
    }</p><div class="hc-familytree-journal-task-filters"><label>${fnTr("Search task or Q ID")
    }<input type="search" data-journal-task-search placeholder="Q0002, marriage, register…"></label><label>${fnTr("Person")}<select data-journal-task-person><option value="">${fnTr("All persons")
    }</option>${legacyPersonOptions()}</select></label><label>${fnTr("Status")}<select data-journal-task-status>${journalStatusFilterOptions(aItems2.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oItem9 Hodnota oItem9 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oItem9=>oItem9.status),{includeAll:true})
    }</select></label></div><p data-journal-task-count class="hc-familytree-hint">${aItems2.length} ${fnTr("of tasks")}</p><div class="hc-familytree-journal-task-results">${sRows||fnHtml`<p>${
    fnTr("There are no tasks yet.")}</p>`}</div></div>`;
}
//*****************************************************************************
/**
 * @brief Zpracuje výzkumný deník úkol browser v uživatelském rozhraní FamilyTree.
 * @param {object} oBody3 Vstupní hodnota body; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {number} nPersonId2 Vstupní hodnota personId; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function activateJournalTaskBrowser(oBody3,nPersonId2=0){
 const hWidget2=oBody3.querySelector('[data-journal-task-browser]');if(!hWidget2)return;
 const hSearch2=hWidget2.querySelector('[data-journal-task-search]'),hPerson2=hWidget2.querySelector('[data-journal-task-person]'),hStatus2=hWidget2.querySelector('[data-journal-task-status]'),
    hCount2=hWidget2.querySelector('[data-journal-task-count]');
 const oSaved3=journalSavedFilter('tasks');if(oSaved3.search)hSearch2.value=oSaved3.search;if(oSaved3.person)hPerson2.value=oSaved3.person;if(oSaved3.status)hStatus2.value=oSaved3.status;
 /**
 * @brief Aktualizuje stav update2 bez změny uložených genealogických dat.
 * @returns {void} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnUpdate2=()=>{const nId28=+hPerson2.value||0,oQ2=hSearch2.value.trim().toLocaleLowerCase('cs'),oSelectedStatus2=hStatus2.value;
  Object.assign(oSaved3,{search:hSearch2.value,person:hPerson2.value,status:oSelectedStatus2});
  let nVisible=0;
  hWidget2.querySelectorAll('.hc-familytree-task-card').forEach(/** @h05-inline
 * @brief Zpracuje jeden prvek kolekce při průchodu záznamy.
 * @param {unknown} oCard5 Hodnota oCard5 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
oCard5=>{const oMatchPerson=!nId28||oCard5.dataset.taskPersonIds.includes('|'+nId28+'|');
    const oMatchSearch=!oQ2||oCard5.textContent.toLocaleLowerCase('cs').includes(oQ2);oCard5.hidden=!(oMatchPerson&&oMatchSearch&&(!oSelectedStatus2||oCard5.dataset.taskStatus===oSelectedStatus2));if(!oCard5.hidden)nVisible++});
  hCount2.textContent=nVisible+' '+fnTr("visible tasks");
 };
 hSearch2.oninput=fnUpdate2;hPerson2.onchange=fnUpdate2;hStatus2.onchange=fnUpdate2;if(nPersonId2)hPerson2.value=String(nPersonId2);fnUpdate2();
 hWidget2.querySelectorAll('[data-task-open-person]').forEach(/** @h05-inline
 * @brief Zpracuje jeden prvek kolekce při průchodu záznamy.
 * @param {HTMLElement} hButton10 Hodnota hButton10 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
hButton10=>hButton10.onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>personDetail(+hButton10.dataset.taskOpenPerson));
}
//*****************************************************************************
/**
 * @brief Zpracuje deník row markup v uživatelském rozhraní FamilyTree.
 * @param {unknown} oTab3 Vstupní hodnota tab; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {unknown} aRows4 Vstupní hodnota rows; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function journalRowMarkup(oTab3,aRows4){
 if(oTab3==='tasks')return journalTaskBrowser(journal);
 // CZ: Výsledky jsou už vyfiltrovány volajícím; žádný záznam se nemaže. 
 if(!aRows4.length)return fnHtml`<p class="hc-familytree-hint">${fnTr("No records yet.")}</p>`;
 return aRows4.slice(0,150).map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oRow11 Hodnota oRow11 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oRow11=>{
  if(oTab3==='tasks')return fnHtml`<article class="hc-familytree-journal-item"><div class="hc-familytree-journal-item-head"><strong>${fnEsc(oRow11.title)}</strong><span>${
    fnEsc(fnTr(oJournalStatusNames[oRow11.status]||oRow11.status))}</span></div><p>${fnEsc(oRow11.hypothesis||'')}</p><small>${fnEsc(oRow11.next_action||'')} · ${fnEsc(oRow11.priority||'')}</small>${
    oState.canEdit?fnHtml`<div class="hc-familytree-journal-actions"><button type="button" data-journal-edit-task="${oRow11.id}">${fnTr("Edit status / next step")}</button></div>`:''}</article>`;
  if(oTab3==='searches')return fnHtml`<article class="hc-familytree-journal-item"><div class="hc-familytree-journal-item-head"><strong>${fnEsc(fnTr(oJournalStatusNames[oRow11.outcome]||oRow11.outcome))
    }</strong><small>${fnEsc(oRow11.actor_uid)} · ${new Date(Number(oRow11.created_at)*1000).toLocaleString()}</small></div><p>${fnEsc(oRow11.query_text)}</p>${oRow11.source_url?fnHtml`<a href="${
    fnEsc(oRow11.source_url)}" target="_blank" rel="noopener noreferrer">${fnTr("Open source")}</a>`:''}<small>${fnEsc(oRow11.notes||'')}</small></article>`;
  if(oTab3==='evidence')return fnHtml`<article class="hc-familytree-journal-item"><div class="hc-familytree-journal-item-head"><strong>${fnEsc(oRow11.archive||fnTr("Archive finding"))} · ${
    fnEsc(oRow11.signature||'')}</strong><span>${fnEsc(fnTr(oJournalStatusNames[oRow11.status]||oRow11.status))}</span></div><small>${fnTr("Image")}: ${fnEsc(oRow11.image_number||'—')}</small><p>${
    fnEsc(oRow11.transcription||'')}</p>${oRow11.source_url?fnHtml`<a href="${fnEsc(oRow11.source_url)}" target="_blank" rel="noopener noreferrer">${fnTr("Open original")}</a>`:''}\
<small>${fnEsc(oRow11.notes||'')}</small></article>`;
  if(oTab3==='proposals'){let oDiff={};try{oDiff=JSON.parse(oRow11.changes_json||'{}')}catch(oValue16){
    }return fnHtml`<article class="hc-familytree-journal-item"><div class="hc-familytree-journal-item-head"><strong>${fnTr("Person proposal")} ${fnEsc(oRow11.target_uid)}</strong><span>${
    fnEsc(fnTr(oJournalStatusNames[oRow11.status]||oRow11.status))}</span></div>${Object.entries(oDiff).map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} arg0 Rozbalovaný parametr [sField,oChange2] se vstupními údaji.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
([sField,oChange2])=>fnHtml`<p><b>${fnEsc(sField)}</b>: <del>${fnEsc(oChange2.before||'—')
    }</del> → <strong>${fnEsc(oChange2.after||'—')}</strong></p>`).join('')}<small>${fnEsc(oRow11.reason||'')}</small>${
    oRow11.status==='pending'&&oState.canEdit?fnHtml`<div class="hc-familytree-journal-actions"><button data-journal-review="${oRow11.id}" data-journal-decision="approve" class="primary">${
    fnTr("Approve (verified evidence required)")}</button><button data-journal-review="${oRow11.id}" data-journal-decision="postpone">${fnTr("Postpone")}</button><button data-journal-review="${oRow11.id
    }" data-journal-decision="reject">${fnTr("Reject")}</button></div>`:''}</article>`;}
  let oBefore2={},oAfter2={};try{oBefore2=JSON.parse(oRow11.before_json||'{}');oAfter2=JSON.parse(oRow11.after_json||'{}')}catch(oValue17){}
  const aModified=Object.keys(oAfter2||{}).filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {string} sKey19 Hodnota sKey19 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
sKey19=>['given_name','surname','birth_surname','birth_date','death_date','birth_place','death_place','occupation','notes'].includes(sKey19)&&oBefore2?.[sKey19]!==oAfter2?.[sKey19]);
  return fnHtml`<article class="hc-familytree-journal-item"><div class="hc-familytree-journal-item-head"><strong>${fnEsc(fnTr(oRow11.action))} · ${fnEsc(fnTr(oRow11.entity_type))}</strong><small>${
    fnEsc(oRow11.actor_uid)} · ${new Date(Number(oRow11.created_at)*1000).toLocaleString()}</small></div>${aModified.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {string} sK Hodnota sK předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sK=>fnHtml`<p><b>${fnEsc(sK)}</b>: ${fnEsc(String(oBefore2[sK]??'—').slice(0,130))} → ${
    fnEsc(String(oAfter2[sK]??'—').slice(0,130))}</p>`).join('')}<small>${fnEsc(oRow11.reason||'')} · ${fnEsc(oRow11.entity_uid)}</small>${
    oRow11.action==='update'&&oRow11.entity_type==='hc_familytree_people'&&oState.canEdit?fnHtml`<div class="hc-familytree-journal-actions"><button data-journal-revert="${oRow11.id}">${
    fnTr("Revert this change")}</button></div>`:''}</article>`;
 }).join('');
}
// CZ: Ostatní karty deníku jsou filtrovány PŘED limitem zobrazení;
// jinak by uživatel nemohl dohledat starší hledání či auditní události.
/**
 * @brief Připraví řádky pravidelného výpisu výzkumného deníku.
 * @param {unknown} oTab4 Kontextová hodnota oTab4 potřebná pro daný výpočet.
 * @param {unknown} oJournal4 Kontextová hodnota oJournal4 potřebná pro daný výpočet.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnJournalRegularRows=(oTab4,oJournal4)=>oTab4==='searches'?oJournal4.searches:oTab4==='evidence'?oJournal4.evidence:oTab4==='proposals'?oJournal4.proposals:oJournal4.history;
/**
 * @brief Sestaví nebo ověří popis stavu položky výzkumného deníku.
 * @param {unknown} oTab5 Kontextová hodnota oTab5 potřebná pro daný výpočet.
 * @param {unknown} oRow12 Kontextová hodnota oRow12 potřebná pro daný výpočet.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnJournalRegularStatus=(oTab5,oRow12)=>fnJournalNormalizeStatus(oTab5==='searches'?oRow12.outcome:oTab5==='history'?oRow12.action:oRow12.status);
//*****************************************************************************
/**
 * @brief Zpracuje deník rows v uživatelském rozhraní FamilyTree.
 * @param {unknown} oTab6 Vstupní hodnota tab; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {unknown} oJournal5 Vstupní hodnota journal; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {unknown} Hodnota použitá volající částí rozhraní.
 */
function journalRows(oTab6,oJournal5){
 if(oTab6==='tasks')return journalTaskBrowser(oJournal5);
 const aRows5=fnJournalRegularRows(oTab6,oJournal5),aStates=aRows5.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oRow13 Hodnota oRow13 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oRow13=>fnJournalRegularStatus(oTab6,oRow13));
 const sLabel9=oTab6==='history'?fnTr("Action type"):oTab6==='searches'?fnTr("Search outcome"):fnTr("Status");
 return fnHtml`<div class="hc-familytree-journal-record-browser" data-journal-record-browser="${oTab6}"><div class="hc-familytree-journal-record-filters"><label>${fnTr("Search entries")
    }<input type="search" data-journal-record-search placeholder="${fnTr("Title, signature, text, person…")}"></label><label>${sLabel9}<select data-journal-record-status>${
    journalStatusFilterOptions(aStates)}</select></label></div><p class="hc-familytree-hint" data-journal-record-count role="status"></p>\
<div class="hc-familytree-journal-record-results" data-journal-record-results></div></div>`;
}
//*****************************************************************************
/**
 * @brief Zpracuje výzkumný deník records v uživatelském rozhraní FamilyTree.
 * @param {object} oBody4 Vstupní hodnota body; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {unknown} oTab7 Vstupní hodnota tab; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {unknown} oJournal6 Vstupní hodnota journal; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function activateJournalRecords(oBody4,oTab7,oJournal6){
 const hWidget3=oBody4.querySelector('[data-journal-record-browser]');if(!hWidget3)return;
 const hSearch3=hWidget3.querySelector('[data-journal-record-search]'),hStatus3=hWidget3.querySelector('[data-journal-record-status]'),
    hResults2=hWidget3.querySelector('[data-journal-record-results]'),hCount3=hWidget3.querySelector('[data-journal-record-count]');
 const aRows6=fnJournalRegularRows(oTab7,oJournal6),oSaved4=journalSavedFilter(oTab7);
 if(oSaved4.search)hSearch3.value=oSaved4.search;if(oSaved4.status)hStatus3.value=oSaved4.status;
 /**
 * @brief Vykreslí příslušnou část uživatelského rozhraní na základě dostupných dat.
 * @returns {void} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnRender2=()=>{
  const oNeedle2=hSearch3.value.trim().toLocaleLowerCase('cs'),bSelected4=hStatus3.value;
  Object.assign(oSaved4,{search:hSearch3.value,status:bSelected4});
  const aMatching2=aRows6.filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oRow14 Hodnota oRow14 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oRow14=>(!bSelected4||fnJournalRegularStatus(oTab7,oRow14)===bSelected4)&&(!oNeedle2||JSON.stringify(oRow14).toLocaleLowerCase('cs').includes(oNeedle2)));
  const aShown2=aMatching2.slice(0,150);
  hCount3.textContent=fnTr("Found")+': '+aMatching2.length+' · '+fnTr("Shown")+': '+aShown2.length+' / '+aRows6.length;
  hResults2.innerHTML=journalRowMarkup(oTab7,aShown2);
  // CZ: Akční tlačítka návrhů a historie se po překreslení znovu naváží.
  attachJournalRowActions(oBody4,oTab7,oJournal6);
 };
 hSearch3.oninput=fnRender2;hStatus3.onchange=fnRender2;fnRender2();
}
//*****************************************************************************
/**
 * @brief Exportuje výzkum výzkumný deník soubor v uživatelském rozhraní FamilyTree.
 * @returns {Promise<unknown>} Hodnota použitá volající částí rozhraní.
 */
async function exportResearchJournalFile(){
 if(!nCurrent||!oState)return;
 const nTreeId10=nCurrent;
 try{
  const oResponse3=await fetch(OC.generateUrl('/apps/'+sAPP+'/api/trees/'+nTreeId10+'/journal/export'),{credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'}});
  if(!oResponse3.ok){let sError='HTTP '+oResponse3.status;try{sError=(await oResponse3.json()).error||sError}catch(oValue18){}throw Error(sError)}
  const oBlob3=await oResponse3.blob();
  if(oBlob3.size>1024*1024)throw Error(fnTr("Journal export exceeded the 1 MiB limit."));
  const oDocumentData=JSON.parse(await oBlob3.text());
  if(oDocumentData.format!=='hc-familytree-research-journal'||oDocumentData.formatVersion!==1)throw Error(fnTr("Invalid journal export."));
  downloadArchiveBlob(new Blob([JSON.stringify(oDocumentData,null,2)],{type:'application/json;charset=utf-8'}),`hc-familytree-journal-${nTreeId10}-${new Date().toISOString().slice(0,10)}.json`);
  fnToast(fnTr("The journal is ready for download."),'success');
 }catch(oError23){fnToast(oError23.message,'error')}
}
//*****************************************************************************
/**
 * @brief Importuje výzkum výzkumný deník soubor v uživatelském rozhraní FamilyTree.
 * @returns {Promise<unknown>} Hodnota použitá volající částí rozhraní.
 */
async function importResearchJournalFile(){
 if(!nCurrent||!oState?.canEdit)return;
 const nTreeId11=nCurrent,oTreeName=currentTreeName();
 openModal(fnTr("Import research journal")+' · '+oTreeName,fnHtml`<div class="hc-familytree-journal-import hc-familytree-transfer-dialog">
 <p>${fnTr("Imports only research tasks, searches, and candidate evidence. People, relationships, events, and existing assertions are not modified.")}</p>
 <label>${fnTr("Research journal file (JSON)")}<input id="hc-familytree-journal-import-file" type="file" accept=".json,application/json"></label>
 <p class="hc-familytree-hint">${fnTr("Preview comes first. Re-importing the same source safely skips existing entries. Imported evidence cannot automatically become verified.")}</p>
 <div id="hc-familytree-journal-import-status" class="hc-familytree-transfer-status" role="status" aria-live="polite"></div>
 <div class="hc-familytree-form-actions"><button type="button" data-close>${fnTr("Cancel")}</button><button type="button" id="hc-familytree-journal-import-preview">${fnTr("Preview file")
    }</button><button type="button" id="hc-familytree-journal-import-apply" class="primary" disabled>${fnTr("Import reviewed records")}</button></div></div>`);
 const hInput=fnValue('hc-familytree-journal-import-file'),sStatus5=fnValue('hc-familytree-journal-import-status'),hPreviewButton2=fnValue('hc-familytree-journal-import-preview'),hApplyButton=fnValue('hc-familytree-journal-import-apply');
 let oApproved3=null;
 hInput.onchange=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>{oApproved3=null;hApplyButton.disabled=true;sStatus5.textContent=''};
 hPreviewButton2.onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async()=>{
  const oFile4=hInput.files?.[0];
  if(!oFile4)return sStatus5.textContent=fnTr("Select a JSON file.");
  if(oFile4.size>1024*1024||oFile4.size<2)return sStatus5.textContent=fnTr("File must be at most 1 MiB.");
  hPreviewButton2.disabled=true;sStatus5.textContent=fnTr("Checking research journal…");
  try{
   const oDocumentData2=JSON.parse(await oFile4.text());
   if(!oDocumentData2||typeof oDocumentData2!=='object'||Array.isArray(oDocumentData2))throw Error(fnTr("File is not a valid JSON object."));
   const oResult5=await fnApi('/api/trees/'+nTreeId11+'/journal/import/preview',{method:'POST',body:JSON.stringify({document:oDocumentData2})});
   oApproved3={document:oDocumentData2,sha256:oResult5.sha256,file: oFile4};
   sStatus5.innerHTML=fnHtml`<strong>${fnTr("Source collection")}: ${fnEsc(oResult5.source)}</strong><p>${fnTr("New")}: ${Number(oResult5.total_new)||0} · ${fnTr("Already present")}: ${
    Number(oResult5.total_existing)||0}</p><p>${fnTr("Tasks")}: +${Number(oResult5.counts.tasks.new)||0} / ${Number(oResult5.counts.tasks.existing)||0} · ${fnTr("Searches")}: +${
    Number(oResult5.counts.searches.new)||0} / ${Number(oResult5.counts.searches.existing)||0} · ${fnTr("Evidence")}: +${Number(oResult5.counts.evidence.new)||0} / ${
    Number(oResult5.counts.evidence.existing)||0}</p><p>${fnEsc(oResult5.warning)}</p>`;
   hApplyButton.disabled=!(Number(oResult5.total_new)>0);
  }catch(oError24){oApproved3=null;sStatus5.textContent=oError24.message||fnTr("The import file is invalid.");hApplyButton.disabled=true}
  finally{hPreviewButton2.disabled=false}
 };
 hApplyButton.onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async()=>{
  if(!oApproved3||hInput.files?.[0]!==oApproved3.file)return;
  hApplyButton.disabled=true;sStatus5.textContent=fnTr("Importing reviewed research entries…");
  try{
   const oResult6=await fnApi('/api/trees/'+nTreeId11+'/journal/import/apply',{method:'POST',body:JSON.stringify({document:oApproved3.document,preview_sha256:oApproved3.sha256})});
   closeModal();fnToast(fnTr("New entries imported: ")+oResult6.total_new, 'success');await openResearchJournal('tasks');
  }catch(oError25){sStatus5.textContent=oError25.message||fnTr("Import failed.");hApplyButton.disabled=false}
 };
}
//*****************************************************************************
/**
 * @brief Zpracuje výzkumný deník row actions v uživatelském rozhraní FamilyTree.
 * @param {object} oBody5 Vstupní hodnota body; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {unknown} oTab8 Vstupní hodnota tab; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {unknown} oJournal7 Vstupní hodnota journal; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {void} Funkce nevrací hodnotu.
 */
function attachJournalRowActions(oBody5,oTab8,oJournal7){
 const nTreeId12=nCurrent,hErrorStatus=oBody5.querySelector('#hc-familytree-journal-status');
 oBody5.querySelectorAll('[data-journal-review]').forEach(/** @h05-inline
 * @brief Zpracuje jeden prvek kolekce při průchodu záznamy.
 * @param {HTMLElement} hButton11 Hodnota hButton11 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
hButton11=>hButton11.onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async()=>{
  const nId29=+hButton11.dataset.journalReview,oDecision=hButton11.dataset.journalDecision;
  if(!(await fnConfirmDialog({title:fnTr("Review proposed change?"),message:oDecision==='approve'?fnTr("Approval will modify person data. Linked verified evidence is required."):
    fnTr("The family tree will remain unchanged."),confirmLabel:fnTr("Continue"),cancelLabel:fnTr("Cancel")})))return;
  try{await fnApi('/api/journal/proposals/'+nId29+'/review',{method:'POST',body:JSON.stringify({decision: oDecision})});if(oDecision==='approve')await selectTree(nTreeId12);
    await openResearchJournal('proposals')}catch(oError26){hErrorStatus.textContent=oError26.message;fnToast(oError26.message,'error')}
 });
 oBody5.querySelectorAll('[data-journal-revert]').forEach(/** @h05-inline
 * @brief Zpracuje jeden prvek kolekce při průchodu záznamy.
 * @param {HTMLElement} hButton12 Hodnota hButton12 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
hButton12=>hButton12.onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async()=>{
  if(!(await fnConfirmDialog({title:fnTr("Revert person change?"),message:fnTr("Reverting creates a new audit entry without deleting the original history."),confirmLabel:fnTr("Revert"),cancelLabel:fnTr("Cancel")})))return;
  try{await fnApi('/api/journal/history/'+hButton12.dataset.journalRevert+'/revert',{method:'POST',body:'{}'});await selectTree(nTreeId12);await openResearchJournal('history')}catch(oError27){
    hErrorStatus.textContent=oError27.message;fnToast(oError27.message,'error')}
 });
}
//*****************************************************************************
/**
 * @brief Otevře výzkum výzkumný deník v uživatelském rozhraní FamilyTree.
 * @param {unknown} oTab9 Vstupní hodnota tab; význam odpovídá zpracovávanému prvku nebo stavu.
 * @param {number} nPersonId3 Vstupní hodnota personId; význam odpovídá zpracovávanému prvku nebo stavu.
 * @returns {Promise<unknown>} Hodnota použitá volající částí rozhraní.
 */
async function openResearchJournal(oTab9=sLastJournalTab,nPersonId3=0){
 if(!nCurrent||!oState)return;
 const nTreeId13=nCurrent;
 sLastJournalTab=Object.hasOwn(oJournalTabNames,oTab9)?oTab9:'archive';
 const bIsLegacy=sLastJournalTab==='archive'||sLastJournalTab==='media';
 let oJournal8=null,oStat2=null;
 try{
  if(sLastJournalTab==='statistics')oStat2=await fnApi('/api/trees/'+nTreeId13+'/statistics');
  else if(!bIsLegacy)oJournal8=await fnApi('/api/trees/'+nTreeId13+'/journal');
 }catch(oError28){fnToast(oError28.message,'error');return}
 const oDisplay=bIsLegacy?legacyJournalView(sLastJournalTab):(sLastJournalTab==='statistics'?statisticsContent(oStat2):
    fnHtml`<div class="hc-familytree-journal-content"><div class="hc-familytree-journal-list">${journalRows(sLastJournalTab,oJournal8)}</div>${journalFormFor(sLastJournalTab,oJournal8)}</div>`);
 const oBody6=openModal(fnTr("Research journal")+' · '+currentTreeName(),fnHtml`<div class="hc-familytree-journal"><div class="hc-familytree-journal-tabs" role="tablist">${
    Object.entries(oJournalTabNames).map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} arg0 Rozbalovaný parametr [sKey20,sLabel10] se vstupními údaji.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
([sKey20,sLabel10])=>fnHtml`<button type="button" role="tab" data-journal-tab="${sKey20}" aria-selected="${sKey20===sLastJournalTab?'true':'false'}" class="${
    sKey20===sLastJournalTab?'active':''}">${fnTr(sLabel10)}</button>`).join('')}</div><div class="hc-familytree-journal-import-control">${
    oState.canEdit?fnHtml`<button type="button" id="hc-familytree-journal-import-open">⬆ ${fnTr("Import research journal (JSON)")}</button>`:''
    }<button type="button" id="hc-familytree-journal-export-open">⬇ ${fnTr("Export research journal (JSON)")}</button></div>${oDisplay
    }<div id="hc-familytree-journal-status" class="hc-familytree-transfer-status" role="status" aria-live="polite"></div></div>`);
 if(bIsLegacy){activateLegacyJournal(oBody6,sLastJournalTab);if(nPersonId3){const hPicker=oBody6.querySelector('[data-legacy-person]');hPicker.value=String(nPersonId3);hPicker.dispatchEvent(new Event('change'))}}
 if(sLastJournalTab==='tasks')activateJournalTaskBrowser(oBody6,nPersonId3);
 if(!bIsLegacy&&sLastJournalTab!=='tasks'&&sLastJournalTab!=='statistics')activateJournalRecords(oBody6,sLastJournalTab,oJournal8);
 const hErrorStatus2=oBody6.querySelector('#hc-familytree-journal-status');
 oBody6.querySelectorAll('[data-journal-tab]').forEach(/** @h05-inline
 * @brief Zpracuje jeden prvek kolekce při průchodu záznamy.
 * @param {HTMLElement} hButton13 Hodnota hButton13 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
hButton13=>hButton13.onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>openResearchJournal(hButton13.dataset.journalTab));
 oBody6.querySelector('#hc-familytree-journal-import-open')?.addEventListener('click',importResearchJournalFile);
 oBody6.querySelector('#hc-familytree-journal-export-open')?.addEventListener('click',exportResearchJournalFile);
 const hForm=oBody6.querySelector('#hc-familytree-journal-form');
 if(hForm)hForm.onsubmit=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @param {unknown} oEvent8 Hodnota oEvent8 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async oEvent8=>{
  oEvent8.preventDefault();const hButton14=hForm.querySelector('button[type="submit"]');hButton14.disabled=true;
  const oData7=fnFormData(hForm),sPath7={tasks:'tasks',searches:'searches',evidence:'evidence',proposals:'proposals'}[hForm.dataset.kind];
  try{await fnApi('/api/trees/'+nTreeId13+'/journal/'+sPath7,{method:'POST',body:JSON.stringify(oData7)});await openResearchJournal(sLastJournalTab)}
  catch(oError29){hErrorStatus2.textContent=oError29.message;fnToast(oError29.message,'error');hButton14.disabled=false}
 };
 attachJournalRowActions(oBody6,sLastJournalTab,oJournal8);
 oBody6.querySelectorAll('[data-journal-edit-task]').forEach(/** @h05-inline
 * @brief Zpracuje jeden prvek kolekce při průchodu záznamy.
 * @param {HTMLElement} hButton15 Hodnota hButton15 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
hButton15=>hButton15.onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>{
  const oTask7=oJournal8.tasks.find(/** @h05-inline
 * @brief Vyhledá první záznam splňující danou podmínku.
 * @param {unknown} oT6 Hodnota oT6 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oT6=>+oT6.id===+hButton15.dataset.journalEditTask);if(!oTask7)return;
  openModal(fnTr("Edit research task"),fnHtml`<form id="hc-familytree-edit-task" class="hc-familytree-journal-form"><label>${fnTr("Name")}<input name="title" value="${fnEsc(oTask7.title)
    }" required></label><label>${fnTr("Status")}<select name="status">${fnJournalOptions(['planned','in_progress','waiting_verify','done','rejected'],oTask7.status)}</select></label><label>${
    fnTr("Next step")}<textarea name="next_action">${fnEsc(oTask7.next_action||'')}</textarea></label><div class="hc-familytree-form-actions"><button type="button" data-close>${fnTr("Cancel")
    }</button><button class="primary">${fnTr("Save")}</button></div></form>`);
  fnValue('hc-familytree-edit-task').onsubmit=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @param {unknown} oEvent9 Hodnota oEvent9 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async oEvent9=>{oEvent9.preventDefault();try{await fnApi('/api/journal/tasks/'+oTask7.id,{method:'PUT',body:JSON.stringify(fnFormData(oEvent9.target))});
    await openResearchJournal('tasks')}catch(oError30){fnToast(oError30.message,'error')}};
 });
}

//*****************************************************************************
/**
 * @brief Otevře nastavení dialog v uživatelském rozhraní FamilyTree.
 * @returns {void} Funkce nevrací hodnotu.
 */
function openSettingsDialog(){openModal(fnTr("Application settings"),
    fnHtml`<div class="hc-familytree-settings-dialog"><p>Family Tree stores private data in the Nextcloud database.</p><div class="hc-familytree-settings-tabs" role="tablist" aria-label="${
    fnTr("Settings tabs")}"><button type="button" class="active" role="tab" aria-selected="true" data-settings-tab="display">${fnTr("Appearance")
    }</button><button type="button" role="tab" aria-selected="false" data-settings-tab="touch">${fnTr("Mobile and touch")
    }</button><button type="button" role="tab" aria-selected="false" data-settings-tab="about">${fnTr("About")
    }</button></div><section class="hc-familytree-settings-panel active" data-settings-panel="display"><div class="hc-familytree-settings-card"><h3>${fnTr("Tree appearance")
    }</h3><label class="hc-familytree-touch-option"><input id="hc-familytree-evidence-toggle" type="checkbox" ${bShowEvidenceBadges?'checked':''}> ${
    fnTr("Show parent-link verification badges by names")}</label><label class="hc-familytree-touch-option"><input id="hc-familytree-toolbar-summary-toggle" type="checkbox" ${
    bShowToolbarSummary?'checked':''}> ${fnTr("Show people, relationships and branches summary in the top bar")}</label><p class="hc-familytree-hint">${
    fnTr("Off by default. Counts appear in the toolbar instead of on the family tree canvas.")
    }</p><label class="hc-familytree-touch-option"><input id="hc-familytree-legend-drag-toggle" type="checkbox" ${bAllowLegendDrag?'checked':''}> ${
    fnTr("Allow moving the legend anywhere in the workspace")}</label><p class="hc-familytree-hint">${
    fnTr("The legend can also be placed in unused sidebar or toolbar space. Its position is saved in this browser.")}</p><button id="hc-familytree-legend-reset" type="button">${
    fnTr("Reset legend position")}</button><p class="hc-familytree-hint">${fnTr("This setting controls verification markers on people in the tree in this browser.")
    }</p></div></section><section class="hc-familytree-settings-panel" data-settings-panel="touch" hidden><div class="hc-familytree-settings-card"><h3>${fnTr("Using the tree on mobile")
    }</h3><label class="hc-familytree-touch-option"><input id="hc-familytree-touch-drag" type="checkbox" ${bAllowTouchCardDrag?'checked':''}> ${fnTr("Unlock card movement on mobile")
    }</label><p class="hc-familytree-hint">${fnTr("When enabled, drag a card with one finger. Drag empty canvas to pan the tree.")
    }</p></div></section><section class="hc-familytree-settings-panel" data-settings-panel="about" hidden><div class="hc-familytree-settings-card">\
<div id="hc-familytree-about"></div></div></section></div>`);
    /**
 * @brief Aktivuje vybranou záložku rozhraní a aktualizuje její zobrazení.
 * @param {string} sName8 Textový parametr sName8 předaný operaci.
 * @returns {void} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnSwitchTab=sName8=>{fnValue('hc-familytree-modal-body').querySelectorAll('[data-settings-tab]').forEach(/** @h05-inline
 * @brief Zpracuje jeden prvek kolekce při průchodu záznamy.
 * @param {unknown} oBtn3 Hodnota oBtn3 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
oBtn3=>{const bActive4=oBtn3.dataset.settingsTab===sName8;
    oBtn3.classList.toggle('active',bActive4);oBtn3.setAttribute('aria-selected',String(bActive4))});fnValue('hc-familytree-modal-body').querySelectorAll('[data-settings-panel]').forEach(/** @h05-inline
 * @brief Zpracuje jeden prvek kolekce při průchodu záznamy.
 * @param {HTMLElement} hPanel Hodnota hPanel předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
hPanel=>{
    const bActive5=hPanel.dataset.settingsPanel===sName8;hPanel.hidden=!bActive5;hPanel.classList.toggle('active',bActive5)})};fnValue('hc-familytree-touch-drag').onchange=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @param {unknown} oE30 Hodnota oE30 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oE30=>{
    bAllowTouchCardDrag=oE30.target.checked;try{localStorage.setItem('hc_familytree:touch-card-drag',bAllowTouchCardDrag?'1':'0')}catch(oValue19){}};fnValue('hc-familytree-evidence-toggle').onchange=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @param {unknown} oE31 Hodnota oE31 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oE31=>{
    bShowEvidenceBadges=oE31.target.checked;hTreeCanvas.classList.toggle('hide-evidence-badges',!bShowEvidenceBadges);try{localStorage.setItem('hc_familytree:evidence-badges',bShowEvidenceBadges?'1':
    '0')}catch(oValue20){}};fnValue('hc-familytree-toolbar-summary-toggle').onchange=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @param {unknown} oE32 Hodnota oE32 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oE32=>{bShowToolbarSummary=oE32.target.checked;fnValue('hc-familytree-toolbar-status').hidden=!bShowToolbarSummary||!oState;
    try{localStorage.setItem('hc_familytree:toolbar-summary',bShowToolbarSummary?'1':'0')}catch(oValue21){}};fnValue('hc-familytree-legend-drag-toggle').onchange=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @param {unknown} oE33 Hodnota oE33 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oE33=>{bAllowLegendDrag=oE33.target.checked;
    syncLegendDragSetting();try{localStorage.setItem('hc_familytree:legend-draggable',bAllowLegendDrag?'1':'0')}catch(oValue22){}};fnValue('hc-familytree-legend-reset').onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>legendResetPosition();
    fnValue('hc-familytree-modal-body').querySelectorAll('[data-settings-tab]').forEach(/** @h05-inline
 * @brief Zpracuje jeden prvek kolekce při průchodu záznamy.
 * @param {unknown} oBtn4 Hodnota oBtn4 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
oBtn4=>oBtn4.onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>fnSwitchTab(oBtn4.dataset.settingsTab));
    oAboutController=oCore.about.mount(fnValue('hc-familytree-about'),{requiredCoreVersion:'0.18.8',heading:fnTr("About")})}
//*****************************************************************************
/**
 * @brief Odstraní all rodokmeny v uživatelském rozhraní FamilyTree.
 * @returns {Promise<unknown>} Hodnota použitá volající částí rozhraní.
 */
async function deleteAllTrees(){
 const aOwned=aTrees.filter(/** @h05-inline
 * @brief Rozhodne, zda záznam splňuje podmínku a má zůstat ve výsledku.
 * @param {unknown} oTree4 Hodnota oTree4 předaná callbacku.
 * @returns {boolean} Výsledná hodnota nebo dokončení callbacku.
 */
oTree4=>oTree4.isOwner);
 if(!aOwned.length)return fnToast(fnTr("You do not own any family trees to delete."),'warning');
 openModal(fnTr("Delete all my family trees?"),fnHtml`<form id="hc-familytree-delete-all-form" class="hc-familytree-form"><p>${
    fnTr("This permanently deletes all family trees you own, including people, relationships, document links and shares. Trees shared with you by other owners will remain.")
    }</p><p class="hc-familytree-danger-note"><strong>${aOwned.length} ${fnTr("family trees")}</strong> · ${aOwned.map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oTree5 Hodnota oTree5 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oTree5=>fnEsc(oTree5.name)).join(', ')}</p><label>${fnTr("Type SMAZAT to confirm")
    }<input type="text" id="hc-familytree-delete-all-confirm" autocomplete="off" spellcheck="false" required></label>\
<p id="hc-familytree-delete-all-status" class="hc-familytree-transfer-status" role="status" aria-live="polite"></p><div class="hc-familytree-form-actions"><button type="button" data-close>${
    fnTr("Cancel")}</button><button type="submit" id="hc-familytree-delete-all-submit" class="danger" disabled>${fnTr("Delete all my family trees")}</button></div></form>`);
 const hInput2=fnValue('hc-familytree-delete-all-confirm'),oSubmit=fnValue('hc-familytree-delete-all-submit'),sStatus6=fnValue('hc-familytree-delete-all-status');
 hInput2.addEventListener('input',/** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
()=>{oSubmit.disabled=hInput2.value.trim()!=='SMAZAT'});
 fnValue('hc-familytree-delete-all-form').onsubmit=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @param {unknown} oEvent10 Hodnota oEvent10 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async oEvent10=>{oEvent10.preventDefault();if(hInput2.value.trim()!=='SMAZAT')return;oSubmit.disabled=true;
    sStatus6.textContent=fnTr("Deleting family trees…");try{await fnApi('/api/trees',{method:'DELETE'});closeModal();oLayoutHistory.clear();nCurrent=0;oState=null;oSelectedIds.clear();
    fnValue('hc-familytree-stage').hidden=true;oRoot.classList.remove('has-active-tree');fnValue('hc-familytree-toolbar-status').hidden=true;await loadTrees()}catch(oError31){
    sStatus6.textContent=oError31.message;fnToast(oError31.message,'error');oSubmit.disabled=false}};
}
//*****************************************************************************
/**
 * @brief Přepne sidebar nabídku v uživatelském rozhraní FamilyTree.
 * @returns {void} Funkce nevrací hodnotu.
 */
function toggleSidebarMenu(){closeTreeActionMenu();const oMenu3=fnValue('hc-familytree-sidebar-menu'),oAnchor4=fnValue('hc-familytree-sidebar-more');oMenu3.hidden=!oMenu3.hidden;if(!oMenu3.hidden)positionPopover(oMenu3,oAnchor4,320)}
fnValue('hc-familytree-sidebar-more').onclick=toggleSidebarMenu;fnValue('hc-familytree-sidebar-menu').onclick=/** @h05-inline
 * @brief Zpracuje událost přiřazenou příslušnému ovládacímu prvku.
 * @param {unknown} oE34 Hodnota oE34 předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async oE34=>{const sAction3=oE34.target.closest('[data-app-action]')?.dataset.appAction;
    fnValue('hc-familytree-sidebar-menu').hidden=true;if(sAction3==='settings')openSettingsDialog();if(sAction3==='statistics')await openOwnedStatistics();if(sAction3==='import-all')showImportChoice();
    if(sAction3==='export-all')showExportChoice('all');if(sAction3==='delete-all')await deleteAllTrees()};document.addEventListener('click',/** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @param {unknown} oE35 Hodnota oE35 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
oE35=>{if(oE35.target.matches('[data-close]'))closeModal();
    const oMenu4=fnValue('hc-familytree-sidebar-menu');if(!oMenu4.hidden&&!oMenu4.contains(oE35.target)&&!oE35.target.closest('#hc-familytree-sidebar-more'))oMenu4.hidden=true;
    const oTreeMenu=fnValue('hc-familytree-tree-menu');if(!oTreeMenu.hidden&&!oTreeMenu.contains(oE35.target)&&!oE35.target.closest('[data-tree-menu-toggle]'))closeTreeActionMenu()});
    document.addEventListener('keydown',/** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @param {unknown} oE36 Hodnota oE36 předaná callbacku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
oE36=>{if(oE36.key==='Escape'&&!fnValue('hc-familytree-tree-menu').hidden){oE36.preventDefault();
    closeTreeActionMenu(true)}else if(oE36.key==='Escape'&&!fnValue('hc-familytree-sidebar-menu').hidden){oE36.preventDefault();fnValue('hc-familytree-sidebar-menu').hidden=true;fnValue('hc-familytree-sidebar-more')?.focus()}});
oToolbarController=oCore.toolbar.create(fnValue("hc-familytree-core-toolbar"),{ariaLabel:fnTr("Family tree tools"),actions:fnToolbarActions()});
let oPreviousTouchMode=isTouchTree();
const oLayoutController=oCore.layout.observe(oRoot,{topOffset:50,onResize:/** @h05-inline
 * @brief Provede vloženou callback operaci ve zpracovávaném rodokmenu.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
()=>{
 const oMobile2=isTouchTree();syncViewControls();restoreLegendPosition();
 if(oMobile2!==oPreviousTouchMode){oPreviousTouchMode=oMobile2;applyTreeScale();if(oState)requestAnimationFrame(/** @h05-inline
 * @brief Aktualizuje vykreslení při následujícím obnovovacím snímku.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
()=>oMobile2?focusMobileTree():fitTree())}
 scheduleConnections();
}});window.addEventListener('pagehide',/** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
()=>{cleanupModal();oCore.dialogs.closeAll();oCore.notifications.clear();oLayoutController.destroy();oConnectionObserver?.disconnect();
    cancelAnimationFrame(nConnectionFrame);oToolbarController?.destroy()},{once:true});
loadTrees().catch(/** @h05-inline
 * @brief Ošetří chybu asynchronní operace.
 * @param {unknown} oError Hodnota oError předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oError=>{oLogger.error(fnTr("Could not load family trees."),oError);fnToast(oError.message,'error')});
})(); 
