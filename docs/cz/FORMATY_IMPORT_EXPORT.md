# FamilyTree — závazné formáty importu a exportu (1.1.0-dev7)

## Rychlý výběr formátu

| Formát | Co obsahuje | Co neobsahuje | Vhodný účel |
|---|---|---|---|
| **Úplná záloha FamilyTree ZIP v2** | Všechny tabulky vlastněných rodokmenů, 13 typů záznamů včetně historie, návrhů, výzkumných tvrzení; dostupné lokální přílohy | Data jiných uživatelů; externí weby; nastavení pouze v localStorage | Bezpečná záloha a obnova |
| **Deník JSON v1** | Výzkumné úkoly, pokusy o hledání, kandidátní či přepsané důkazy | Osoby, vztahy, události, historické SQL auditní záznamy, návrhy změn, přílohy | Výzkumná vlákna a přenos průběžných výsledků |
| **GEDCOM 7 (.ged)** | Standardizované osoby, vztahy, události a poznámky | Garanci úplného přenosu vlastních polí, archivu, historie a médií | Výměna mezi genealogickými programy |
| **GEDZIP (.gdz)** | GEDCOM a podporovaná média podle obsahu archivu | Garantovanou úplnou zálohu FamilyTree | Import z jiných genealogických nástrojů |

## A. Úplná nativní záloha ZIP — `hc-familytree-native-backup`, `formatVersion: 2`

Ve stromu: **⋯ u názvu rodokmenu → Export**, v hlavičce aplikace: **⋯ → Export všech mých rodokmenů**. Zvolit „Úplná záloha FamilyTree“ a rozsah **pouze aktuální vlastní rodokmen** / **všechny vlastní rodokmeny**. Před stažením zkontrolovat název otevřeného rodokmenu. Čtecí přístup k cizímu sdílenému rodokmenu neopravňuje k úplné záloze; jeho GEDCOM lze exportovat podle udělených práv.

Struktura:

```text
hc-familytree-backup-YYYYMMDD-HHMMSS.zip
├── manifest.json
├── data.json
└── files/
    └── <64 hex znaků>   (0 až 3000 souborů; pouze dostupné lokální přílohy)
```

`manifest.json` má například tyto atributy (nejde o skutečnou zálohu):

```json
{
  "format":"hc-familytree-native-backup",
  "formatVersion":2,
  "appId":"hc_familytree",
  "createdAt":"2026-10-30T18:00:00+00:00",
  "sourceVersion":"1.1.0-dev7",
  "treeCount":1,
  "dataSha256":"<SHA-256 textu data.json>",
  "files":[]
}
```

Každý záznam v `files` obsahuje `treeId`, `sourcePath`, `zipPath`, `size` a `sha256`. `data.json` je objekt `{ "tables": { ... } }`, ve kterém musí být **v přesném pořadí** těchto 13 tabulek kompletní databázové řádky:

```text
hc_familytree_trees
hc_familytree_people
hc_familytree_relations
hc_familytree_events
hc_familytree_documents
hc_familytree_doc_links
hc_familytree_shares
hc_familytree_research
hc_familytree_history
hc_familytree_research_tasks
hc_familytree_search_log
hc_familytree_evidence
hc_familytree_proposals
```

Čísla SQL `id` jsou lokální; pro přenosové odkazy používat stabilní `stable_id` / původní genealogická ID. Při obnově **jako nové rodokmeny** se interní i stabilní identifikátory přemapují včetně vazeb. Jde o obnovu kopií, **ne synchronizaci ani aktualizaci existujícího stromu**. Nelze ji bezpečně použít k „doplnění pár osob“ do existujícího stromu.

**Postup importu ZIP:** `⋯` v hlavičce aplikace → Import databází → Obnovit úplnou zálohu; nahrát ZIP → **Zkontrolovat zálohu** (kontroly hashů, tabulek, vazeb, oprávnění a souborů) → potvrdit vytvoření nových rodokmenů. Sdílení vyžaduje výslovný souhlas. Stará záloha s `formatVersion: 1` se ve vývojovém schématu v2 neobnovuje; jednorázový převod starých dat se provádí na původním NASu před vytvořením nové zálohy.

**Omezení:** databázové JSON max. 40 MiB; každý soubor max. 48 MiB; součet příloh max. 256 MiB; max. 3000 souborů. Archiv nedoplňuje soubory z externích URL. Nedostupné lokální soubory vyvolají chybu — ne tichý částečný export. ZIP může obsahovat informace o žijících osobách: nepublikovat jej a uložit šifrovaně.

## B. Výzkumný deník JSON — `hc-familytree-research-journal`, `formatVersion: 1`

**Import:** ⋯ u cílového rodokmenu → Výzkumný deník → **Importovat výzkumný deník (JSON)** → zvolit soubor → **Zkontrolovat soubor** → zkontrolovat počty *nových* a *existujících* → **Importovat zkontrolované záznamy**.

**Export:** na stejné obrazovce **Exportovat výzkumný deník (JSON)**. Zahrnuje jen `tasks`, `searches`, `evidence` a informace pro přenos; nejde o úplnou zálohu. U importu do jiného stromu se ručně ověřené důkazy bezpečně sníží na stav `transcribed`, aby nehrozilo automatické schvalování změn na základě přenesené důvěry.

Příklad minimálního importního dokumentu (hypotetický případ):

```json
{
  "format": "hc-familytree-research-journal",
  "formatVersion": 1,
  "source": "research-20261030-issue-001",
  "tasks": [
    {"source_id":"Q001", "title":"Ověřit sňatek v matrice", "status":"in_progress", "priority":"high", "person_refs":["P0001"], "hypothesis":"Možný sňatek před rokem 1850", "next_action":"Prohlédnout přímo skeny"}
  ],
  "searches": [
    {"source_id":"S001", "task_ref":"Q001", "query_text":"Katalog nalezl kandidátní matriku; skeny nebyly otevřeny", "outcome":"candidate", "source_url":"https://example.org/catalog", "notes":"Bez ověřeného matričního zápisu"}
  ],
  "evidence": [
    {"source_id":"E001", "task_ref":"Q001", "status":"candidate", "archive":"Archiv", "signature":"12345", "source_url":"https://example.org/catalog", "image_number":"", "transcription":"", "notes":"Pouze katalogový kandidát", "confidence_label":"katalog"}
  ]
}
```

`source` je **stabilní identifikátor výzkumné sady** (povolené ASCII znaky `a-z A-Z 0-9 . _ -`, 1–80 znaků), `source_id` stabilní klíč záznamu v rámci sady (1–96 znaků, navíc `:`). Opakovaný import stejného `source` + `source_id` + typ je bez duplicit a **nikdy nepřepisuje existující záznam**. Pro nový pokus hledání zvolit nové `source_id`. Pro editaci existujícího úkolu použít editor v aplikaci. `task_ref` musí odpovídat `source_id` některého úkolu z téže sady (nebo úkolu již importovaného toutéž sadou). `person_refs` jsou genealogické identifikátory z výzkumu, **nikoliv automatické SQL vazby**; nemanipulovat s nimi podle odhadů.

Povolené hodnoty:

- `tasks.status`: `planned`, `in_progress`, `waiting_verify`, `done`, `rejected`; `priority`: `low`, `normal`, `high`.
- `searches.outcome`: `unverified`, `no_result`, `candidate`, `found`, `rejected`.
- `evidence.status`: `candidate`, `transcribed`, `rejected`. **Externí import nesmí zadat `verified`**. Stav po ručním ověření v aplikaci smí být jiný.

**Pravidlo důkazů:** katalog potvrzuje pouze existenci knihy; ne konkrétní sňatek. `no_result` použít jen po skutečném prohlédnutí přesně určených snímků a období. Po pouhém pokusu otevřít web zvolit `unverified`. Nevytvářet osoby/vztahy/události z hypotézy, neznámé údaje nechávat prázdné. Důkaz smí obsahovat URL, číslo skenu, přesný přepis, datum hledání, zdůvodnění a slovní jistotu v dostupných polích.

**Omezení:** JSON max. 1 MiB, 500 úkolů, 1000 hledání, 500 důkazů na jeden import. Náhled ani import nikdy nemění genealogické osoby, vztahy a události. Import vytváří auditní záznamy o nových položkách. Záznamy historie a návrhy změn se přenášejí **pouze úplným ZIPem v2**. Soubor deníku není automatická obnova historie. Exportuje-li stejný strom vlastní deník a opět jej načte, původní existující položky se přeskočí; import do jiného stromu založí nové položky.

### Co se stávajícími `hc_familytree_research`

Tabulka obsahuje **výzkumná tvrzení a projekce importu GEDCOM**, nikoliv seznam úkolů. Původních několik tisíc řádků se **nemigruje 1:1** do deníku: vytvořily by se falešné úkoly a duplikované nálezy. Již známé otevřené otázky a ověřitelné pokusy shrnout do samostatného deníkového JSONu (výběr ze zpráv), importovat ho pomocí náhledu. Veškerá originální tvrzení zůstávají beze změny a jsou součástí nativního ZIPu v2.

## C. Struktura pro genealogické vlákno

Závazné zadání je v `docs/cz/POKYNY_PRO_VYZKUMNE_VLAKNO.md`. Posílat **dva soubory:** čitelný Markdown a strojově importovatelný JSON deníku v1; seznam ověřených změn genealogických faktů uvést jen jako návrhy k ručnímu posouzení, nikdy jako příkaz k automatickému přepsání.

## Propojení původního archivu P/F/Q a galerie

Verze 1.1.0-dev7 přidává do Výzkumného deníku pouze čtecí přehled **Archiv P/F/Q** a **Matriky a fotografie**. Původní tvrzení F, osoby P, úkoly Q, katalogy S, citace, média a další položky se zobrazují přímo z výzkumné vrstvy. Do deníkového JSON v1 se *nevkládají automaticky*, protože mají jinou sémantiku. Běžný JSON není zálohou skenů, fotografií ani všech tvrzení. Úplný ZIP v2 je obsahuje podle pravidel archivu. Podrobný návod: `ARCHIV_OSOB_A_MEDII.md`.


## Význam Q a rozdíl mezi úplnou zálohou a deníkem

V nativní záloze **ZIP v2** jsou všechny původní importované záznamy,
poznámky s texty výzkumných úkolů Q, soubory a audit. Po obnově tak lze původní úkoly
znovu zobrazit jako čtecí projekci, aniž by vznikly duplicitní databázové řádky.

Samostatný **JSON deníku v1** obsahuje jen skutečné editovatelné úkoly z nového
výzkumného deníku, hledání a důkazy. Staré Q, které existují jen v poznámkách,
se do něj **samy nekopírují**. Má-li badatelské vlákno úkol aktualizovat,
musí použít stejné `source_id` (např. `Q0002`) a doplnit `person_refs` (např. `P0010`),
aby aplikace mohla v UI zobrazit informace společně. Pravidla bezpečného importu JSON,
původních ID a auditování jsou nadále platná; JSON import **neslučuje ani nepřepisuje**
staré poznámky nebo genealogická fakta.

