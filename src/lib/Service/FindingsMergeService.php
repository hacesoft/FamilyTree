<?php
declare(strict_types=1);
/**
 * @file Bezpečný, inkrementální import badatelských nálezů do existujícího stromu.
 * Typové prefixy: s = řetězec, n = číslo, b = bool, a = pole, o = objekt, fn = callback.
 * Externí klíče GEDCOM/JSON a veřejná rozhraní se nepřejmenovávají.
 * Import je doplňovací: nikdy nemaže ani neoznačuje nezmíněné osoby jako nepřítomné.
 */
namespace OCA\HcFamilyTree\Service;

use OCP\Files\Folder;
use OCP\Files\IRootFolder;
use OCP\Files\NotFoundException;
use OCP\IDBConnection;
use OCP\IRequest;

final class FindingsMergeService {
    private const MAX_UPLOAD = 64 * 1024 * 1024;
    private const MAX_UNPACKED = 112 * 1024 * 1024;
    private const MAX_FILE = 16 * 1024 * 1024;
    private const IMAGES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    private const PREFIX = 'findings-';

    /**
     * @brief Připojí úložiště, databázi a existující append-only import deníku.
     * @param IRequest $oRequest HTTP požadavek s archivem a potvrzením.
     * @param IDBConnection $oDb Databázové připojení Nextcloudu.
     * @param IRootFolder $oRoot Kořenové soubory Nextcloudu.
     * @param ResearchJournalImportService $oJournalImport Importér výzkumného deníku.
     * @param ResearchJournalService $oJournal Historie a datové operace.
     */
    public function __construct(
        private IRequest $oRequest,
        private IDBConnection $oDb,
        private IRootFolder $oRoot,
        private ResearchJournalImportService $oJournalImport,
        private ResearchJournalService $oJournal,
    ) {}

    /**
     * @brief Načte všechny řádky daného stromu nebo tabulky pro deterministický plán.
     * @param string $sTable Tabulka FamilyTree.
     * @param array $aWhere Sloupcové podmínky (pouze interně zadané klíče).
     * @return array Databázové záznamy.
     */
    private function rows(string $sTable, array $aWhere): array {
        $oQ = $this->oDb->getQueryBuilder()->select('*')->from($sTable);
        foreach ($aWhere as $sKey => $oValue) {
            $oQ->andWhere($oQ->expr()->eq($sKey, $oQ->createNamedParameter($oValue)));
        }
        return $oQ->executeQuery()->fetchAllAssociative();
    }

    /**
     * @brief Vloží nový záznam se stabilním ID a auditní historií.
     * @param string $sTable Cílová tabulka.
     * @param array $aData Kontrolovaná data pro vložení.
     * @param int $nTreeId Identifikátor stromu.
     * @param string $sActor Přihlášený uživatel.
     * @return int Interní ID nového záznamu.
     */
    private function insert(string $sTable, array $aData, int $nTreeId, string $sActor): int {
        if (!isset($aData['stable_id'])) $aData['stable_id'] = ResearchJournalService::uid();
        $oQ = $this->oDb->getQueryBuilder()->insert($sTable);
        foreach ($aData as $sKey => $oValue) $oQ->setValue($sKey, $oQ->createNamedParameter($oValue));
        $oQ->executeStatement();
        $nId = (int)$this->oDb->lastInsertId($sTable);
        $oRow = $this->rows($sTable, ['id' => $nId])[0] ?? null;
        if ($oRow !== null) $this->oJournal->audit($nTreeId, $sTable, (string)$aData['stable_id'], 'create', $sActor, null, $oRow, 'Doplnění badatelského nálezu');
        return $nId;
    }

    /**
     * @brief Bezpečně otevře ZIP, ověří cesty, limity a načte jeho soubory.
     * @param string $sPath Cesta k uploadovanému souboru nebo dočasnému ZIP.
     * @param int $nLimit Nejvyšší povolený celkový rozbalený objem.
     * @return array Mapa cesty na nezměněné bajty souboru.
     */
    private function readZip(string $sPath, int $nLimit): array {
        if (!class_exists(\ZipArchive::class)) throw new \InvalidArgumentException('Na serveru chybí rozšíření PHP ZIP.');
        $oZip = new \ZipArchive();
        if ($oZip->open($sPath) !== true) throw new \InvalidArgumentException('ZIP se nepodařilo otevřít.');
        try {
            if ($oZip->numFiles < 1 || $oZip->numFiles > 250) throw new \InvalidArgumentException('Nepovolený počet položek v ZIP.');
            $aFiles = []; $nTotal = 0;
            for ($nI = 0; $nI < $oZip->numFiles; $nI++) {
                $aStat = $oZip->statIndex($nI);
                if ($aStat === false) throw new \InvalidArgumentException('ZIP obsahuje nečitelnou položku.');
                $sName = (string)$aStat['name'];
                if ($sName === '' || str_starts_with($sName, '/') || str_contains($sName, '\\')
                    || preg_match('~(^|/)\.{1,2}(/|$)|[\x00-\x1f]~', $sName)) {
                    throw new \InvalidArgumentException('ZIP obsahuje nebezpečnou cestu.');
                }
                if (method_exists($oZip, 'getExternalAttributesIndex')
                    && $oZip->getExternalAttributesIndex($nI, $nSystem, $nAttributes)
                    && ((($nAttributes >> 16) & 0170000) === 0120000)) {
                    throw new \InvalidArgumentException('Symbolické odkazy v ZIP nejsou povoleny.');
                }
                if (str_ends_with($sName, '/')) continue;
                $nSize = (int)$aStat['size'];
                $nTotal += $nSize;
                if ($nSize > self::MAX_FILE || $nTotal > $nLimit || isset($aFiles[$sName])) {
                    throw new \InvalidArgumentException('ZIP je příliš velký nebo obsahuje duplicitní cestu.');
                }
                $sData = $oZip->getFromIndex($nI);
                if (!is_string($sData) || strlen($sData) !== $nSize) {
                    throw new \InvalidArgumentException('Poškozená položka ZIP: ' . $sName);
                }
                $aFiles[$sName] = $sData;
            }
            return $aFiles;
        } finally { $oZip->close(); }
    }

    /**
     * @brief Zpracuje jedinečný ZIP nálezů včetně vnořeného GEDZIP a JSON deníku.
     * @return array Ověřený balíček, hash a rozebraná genealogie.
     */
    private function package(): array {
        $aUpload = $this->oRequest->getUploadedFile('findings');
        if (!is_array($aUpload) || ($aUpload['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK
            || !is_file((string)($aUpload['tmp_name'] ?? ''))) {
            throw new \InvalidArgumentException('Vyberte ZIP s genealogickými nálezy.');
        }
        $sPath = (string)$aUpload['tmp_name'];
        $nSize = filesize($sPath);
        if (!is_int($nSize) || $nSize < 1 || $nSize > self::MAX_UPLOAD || !preg_match('/\.zip$/i', (string)($aUpload['name'] ?? ''))) {
            throw new \InvalidArgumentException('Balíček musí být ZIP do 64 MiB.');
        }
        $aFiles = $this->readZip($sPath, self::MAX_UNPACKED);
        $aGdzFiles = array_filter(array_keys($aFiles), static fn(string $sName): bool => str_ends_with(strtolower($sName), '.gdz'));
        if (count($aGdzFiles) !== 1) throw new \InvalidArgumentException('Balíček musí obsahovat právě jeden GEDZIP (.gdz).');
        $sGdz = $aFiles[array_values($aGdzFiles)[0]];
        $sTmp = tempnam(sys_get_temp_dir(), 'hc-ft-merge-');
        if ($sTmp === false) throw new \RuntimeException('Nelze připravit dočasný GEDZIP.');
        try {
            if (file_put_contents($sTmp, $sGdz) !== strlen($sGdz)) throw new \RuntimeException('Nelze přečíst GEDZIP.');
            $aGedFiles = $this->readZip($sTmp, 64 * 1024 * 1024);
        } finally { @unlink($sTmp); }
        $sGed = $aGedFiles['gedcom.ged'] ?? null;
        if (!is_string($sGed)) throw new \InvalidArgumentException('GEDZIP neobsahuje gedcom.ged v kořeni.');
        unset($aGedFiles['gedcom.ged']);
        Gedcom7Package::validateFiles($sGed, $aGedFiles, true);
        $aGed = Gedcom7Package::parse($sGed, $aGedFiles, true);
        $aMap = json_decode($aFiles['mapovani_existujicich_osob.json'] ?? '{}', true, 32, JSON_THROW_ON_ERROR);
        if (!is_array($aMap)) throw new \InvalidArgumentException('Neplatné mapování existujících osob.');
        $aJournal = null;
        foreach ($aFiles as $sName => $sContent) {
            if (str_ends_with($sName, '_DENIK_IMPORT.json') || str_contains($sName, 'IMPORT_DO_STAVAJICIHO_DENIKU.json')) {
                if ($aJournal !== null) throw new \InvalidArgumentException('Více souborů importu deníku v ZIP.');
                $aJournal = json_decode($sContent, true, 32, JSON_THROW_ON_ERROR);
                if (!is_array($aJournal)) throw new \InvalidArgumentException('Neplatný JSON výzkumného deníku.');
            }
        }
        $aPictures = [];
        foreach ($aFiles as $sName => $sContent) {
            if (!str_starts_with($sName, 'dukazy/') || !preg_match('/\.(jpe?g|png|gif|webp)$/i', $sName)) continue;
            $aPictures[$sName] = $sContent;
        }
        // Binární média GEDZIP mají přednost; pracovní fotografie z vnějšího ZIP zůstanou oddělené.
        foreach ($aGed['data']['media'] as $aMedium) {
            $sName = (string)($aMedium['file_name'] ?? '');
            if (!isset($aGedFiles[$sName])) throw new \InvalidArgumentException('Chybí binární důkaz ' . $sName);
            $sSha = hash('sha256', $aGedFiles[$sName]);
            if (!hash_equals((string)($aMedium['sha256'] ?? ''), $sSha)) throw new \InvalidArgumentException('Neshoda SHA-256: ' . $sName);
            $aPictures[$sName] = $aGedFiles[$sName];
        }
        if (isset($aFiles['dukazy/SHA256SUMS.txt'])) {
            foreach (preg_split('/\r?\n/', $aFiles['dukazy/SHA256SUMS.txt']) as $sLine) {
                if ($sLine === '') continue;
                if (!preg_match('/^([a-f0-9]{64})  ([^\r\n]+)$/D', $sLine, $aMatch)
                    || !isset($aFiles['dukazy/'.$aMatch[2]])
                    || !hash_equals($aMatch[1], hash('sha256', $aFiles['dukazy/'.$aMatch[2]]))) {
                    throw new \InvalidArgumentException('Nesouhlasí kontrolní součet archivního snímku.');
                }
            }
        }
        foreach ($aPictures as $sName => $sContent) {
            if (strlen($sContent) > self::MAX_FILE || !in_array((string)(new \finfo(FILEINFO_MIME_TYPE))->buffer($sContent), self::IMAGES, true)) {
                throw new \InvalidArgumentException('Neplatný důkazní obrázek: ' . $sName);
            }
        }
        return ['sha256' => hash_file('sha256', $sPath), 'ged' => $aGed['data'], 'map' => $aMap,
            'journal' => $aJournal, 'pictures' => $aPictures, 'warnings' => $aGed['warnings']];
    }

    /**
     * @brief Rozřeší ručně schválená přiřazení osob podle stabilních ID.
     * @return array Mapa externí GEDCOM osoby na cílové stabilní ID.
     */
    private function manualMatches(): array {
        $sJson = (string)$this->oRequest->getParam('manual_matches', '{}');
        if (strlen($sJson) > 8192) throw new \InvalidArgumentException('Příliš mnoho ručních mapování.');
        $aMap = json_decode($sJson, true, 8, JSON_THROW_ON_ERROR);
        if (!is_array($aMap) || count($aMap) > 100) throw new \InvalidArgumentException('Neplatné ruční mapování.');
        foreach ($aMap as $sSource => $sTarget) {
            if (!preg_match('/^P[a-zA-Z0-9_-]{1,63}$/D', (string)$sSource)
                || !is_string($sTarget) || !preg_match('/^[a-f0-9]{32}$/D', $sTarget)) {
                throw new \InvalidArgumentException('Neplatná dvojice stabilních identifikátorů.');
            }
        }
        return $aMap;
    }

    /**
     * @brief Sestaví nedestruktivní plán na základě přesných ID a obsahu existujícího stromu.
     * @param int $nTreeId Cílový strom.
     * @param array $aPackage Rozebraný ZIP s podklady.
     * @param array $aManual Ručně potvrzené identifikátory existujících osob.
     * @return array Plán vytvoření, zachování, konfliktů a importu deníku.
     */
    private function plan(int $nTreeId, array $aPackage, array $aManual): array {
        $aPeople = $this->rows('hc_familytree_people', ['tree_id' => $nTreeId]);
        $aRelations = $this->rows('hc_familytree_relations', ['tree_id' => $nTreeId]);
        $aEvents = $this->rows('hc_familytree_events', ['tree_id' => $nTreeId]);
        $aExistingResearch = $this->rows('hc_familytree_research', ['tree_id' => $nTreeId]);
        $aStable = []; $aNames = []; $aPreviousUid = [];
        foreach ($aPeople as $aP) {
            $aStable[(string)$aP['stable_id']] = $aP;
            $sKey = mb_strtolower(trim((string)$aP['given_name'].' '.(string)$aP['surname']));
            $aNames[$sKey][] = $aP;
        }
        foreach ($aExistingResearch as $aR) {
            if ($aR['entity_type'] !== 'persons' || !(int)$aR['native_id']) continue;
            $aData = json_decode((string)$aR['payload_json'], true);
            if (is_array($aData) && !empty($aData['uid'])) $aPreviousUid[$aData['uid']] = (int)$aR['native_id'];
        }
        $aPeoplePlan = []; $aMatched = []; $aWarnings = []; $aConflicts = []; $aUsedTargets = [];
        foreach ($aPackage['ged']['persons'] as $aPerson) {
            $sSource = (string)$aPerson['person_id'];
            $sUid = (string)($aPerson['uid'] ?? '');
            $aReferenced = null;
            foreach ($aPackage['map'] as $sOld => $aOld) {
                if (!is_array($aOld) || ($aOld['gedcom_import_id'] ?? '') !== $sSource) continue;
                if (isset($aReferenced)) throw new \InvalidArgumentException('Duplicitní mapování zdrojové osoby.');
                $aReferenced = $aOld;
                if (($aOld['gedcom_uid'] ?? '') !== $sUid) {
                    throw new \InvalidArgumentException('UID osoby se neshoduje s mapováním: '.$sSource);
                }
                if (isset($aManual[$sSource])) break;
            }
            $sTarget = $aManual[$sSource] ?? ($aReferenced['person_stable_id'] ?? '');
            if ($sTarget !== '' && !preg_match('/^[a-f0-9]{32}$/D', (string)$sTarget)) {
                throw new \InvalidArgumentException('Chybný stabilní identifikátor v mapování.');
            }
            $aTarget = $sTarget !== '' ? ($aStable[$sTarget] ?? null) : null;
            if ($sTarget !== '' && !$aTarget) $aConflicts[] = 'Osoba '.$sSource.': mapované stabilní ID ve vybraném stromu neexistuje.';
            if ($sTarget === '' && $sUid !== '' && isset($aPreviousUid[$sUid])) {
                foreach ($aPeople as $aOld) if ((int)$aOld['id'] === $aPreviousUid[$sUid]) $aTarget = $aOld;
            }
            $sName = trim((string)($aPerson['given_names'] ?? '').' '.(string)($aPerson['surname_best'] ?? ''));
            if (!$aTarget && $sTarget === '') {
                $aCandidates = $aNames[mb_strtolower($sName)] ?? [];
                if ($aCandidates) $aConflicts[] = 'Osoba '.$sName.' může již existovat. Vyber odpovídající osobu ručně; automatické spojení podle jména není dovoleno.';
            }
            if ($aTarget) {
                $nNative = (int)$aTarget['id'];
                if (isset($aUsedTargets[$nNative])) $aConflicts[] = 'Dvě osoby ze souboru směřují na jednu existující osobu: '.$sName;
                $aUsedTargets[$nNative] = true;
                $aMatched[$sSource] = $nNative;
                $sExisting = trim((string)$aTarget['given_name'].' '.(string)$aTarget['surname']);
                if (mb_strtolower($sExisting) !== mb_strtolower($sName)) {
                    $aWarnings[] = 'Jméno '.$sName.' / '.$sExisting.' se liší; původní jméno se nepřepisuje.';
                }
                $sAction = 'existing';
            } else {
                $sAction = 'create';
            }
            $aPeoplePlan[$sSource] = ['source_id' => $sSource, 'uid' => $sUid, 'name' => $sName,
                'action' => $sAction, 'native_id' => $aTarget ? (int)$aTarget['id'] : null,
                'stable_id' => $aTarget['stable_id'] ?? null, 'data' => $aPerson];
        }
        // Nelze zaměnit zdrojový soubor jiné rodiny a ručně jej přiřadit k nesouvisejícím záznamům.
        foreach ($aManual as $sSource => $sTarget) if (!isset($aPeoplePlan[$sSource])) $aConflicts[] = 'Ruční mapování se odkazuje na neexistující osobu '.$sSource;
        $aRelationPlan = [];
        foreach ($aPackage['ged']['relationships'] as $aRelation) {
            $sOne = (string)$aRelation['person1_id']; $sTwo = (string)$aRelation['person2_id'];
            if (!isset($aPeoplePlan[$sOne], $aPeoplePlan[$sTwo])) throw new \InvalidArgumentException('Vazba odkazuje na neexistující osobu.');
            $sType = $aRelation['relationship_type'] === 'spouse' ? 'partner' : 'parent';
            $bMarriageEvent = false;
            if ($sType === 'partner') foreach ($aPackage['ged']['events'] as $aEvent) {
                $aOwners = explode('|', (string)($aEvent['person_id'] ?? ''));
                if (($aEvent['event_type'] ?? '') === 'marr' && in_array($sOne, $aOwners, true)
                    && in_array($sTwo, $aOwners, true) && !empty($aEvent['date_value']) && !empty($aEvent['source_id'])) {
                    $bMarriageEvent = true;
                    break;
                }
            }
            $bUnverifiedCouple = $sType === 'partner'
                && ($aRelation['verification_status'] ?? '') === 'unverified' && !$bMarriageEvent;
            $nOne = $aMatched[$sOne] ?? 0; $nTwo = $aMatched[$sTwo] ?? 0;
            $bFound = false; $nParents = 0;
            foreach ($aRelations as $aOld) {
                if ((string)$aOld['type'] === 'parent' && $nTwo && (int)$aOld['person2_id'] === $nTwo) $nParents++;
                if ($nOne && $nTwo && (string)$aOld['type'] === $sType
                    && (int)$aOld['person1_id'] === $nOne && (int)$aOld['person2_id'] === $nTwo) $bFound = true;
                if ($nOne && $nTwo && $sType === 'partner' && (string)$aOld['type'] === $sType
                    && (int)$aOld['person1_id'] === $nTwo && (int)$aOld['person2_id'] === $nOne) $bFound = true;
            }
            if ($sType === 'parent' && !$bFound && $nParents >= 2) $aConflicts[] = 'Dítě '.$aPeoplePlan[$sTwo]['name'].' má již dva rodiče; nové rodičovství vyžaduje ruční prověření.';
            $aRelationPlan[] = ['data' => $aRelation, 'action' => $bFound ? 'existing' : ($bUnverifiedCouple ? 'review' : 'create'),
                'names' => $aPeoplePlan[$sOne]['name'].' → '.$aPeoplePlan[$sTwo]['name']];
        }
        // Omezit dvě rodičovské vazby na dítě a zakázat genealogické cykly.
        $aProjectedParents=[]; $aParentGraph=[];
        foreach ($aRelations as $aOld) if (($aOld['type'] ?? '') === 'parent') {
            $sParent='id:'.$aOld['person1_id']; $sChild='id:'.$aOld['person2_id'];
            $aProjectedParents[$sChild][$sParent]=true;
            $aParentGraph[$sParent][$sChild]=true;
        }
        $aNewEdges=[];
        foreach ($aRelationPlan as $aR) if ($aR['action']==='create' && $aR['data']['relationship_type']==='parent_child') {
            $sParentSource=$aR['data']['person1_id'];$sChildSource=$aR['data']['person2_id'];
            $sParent=isset($aMatched[$sParentSource])?'id:'.$aMatched[$sParentSource]:'new:'.$sParentSource;
            $sChild=isset($aMatched[$sChildSource])?'id:'.$aMatched[$sChildSource]:'new:'.$sChildSource;
            $aProjectedParents[$sChild][$sParent]=true;
            $aNewEdges[]=[$sParent,$sChild];
        }
        foreach ($aProjectedParents as $sChild => $aParents) if (count($aParents)>2) {
            $aConflicts[]='Osoba '.$sChild.' by měla po importu více než dva rodiče.';
        }
        foreach ($aNewEdges as [$sParent,$sChild]) {
            $aPending=[$sChild];$aVisited=[];$bCycle=false;
            while ($aPending) {
                $sNext=array_pop($aPending);
                if ($sNext===$sParent) {$bCycle=true;break;}
                if (isset($aVisited[$sNext])) continue;
                $aVisited[$sNext]=true;
                foreach ($aParentGraph[$sNext]??[] as $sDescendant=>$_) $aPending[]=$sDescendant;
            }
            if ($bCycle) $aConflicts[]='Nová vazba by vytvořila cyklus rodičovství.';
            $aParentGraph[$sParent][$sChild]=true;
        }
        $aEventPlan = [];
        foreach ($aPackage['ged']['events'] as $aEvent) {
            $aOwners = explode('|', (string)$aEvent['person_id']);
            $sKind = $this->eventType((string)$aEvent['event_type']);
            $sDate = $this->date((string)$aEvent['date_value']);
            foreach ($aOwners as $sSource) {
                if (!isset($aPeoplePlan[$sSource])) throw new \InvalidArgumentException('Událost odkazuje na neexistující osobu.');
                $nNative = $aMatched[$sSource] ?? 0;
                $bFound = false; $bDifferent = false;
                foreach ($aEvents as $aOld) {
                    if (!$nNative || (int)$aOld['person_id'] !== $nNative || (string)$aOld['type'] !== $sKind) continue;
                    if ($this->date((string)$aOld['event_date']) === $sDate && mb_strtolower(trim((string)$aOld['place'])) === mb_strtolower(trim((string)$aEvent['place']))) $bFound = true;
                    else $bDifferent = true;
                }
                if ($bDifferent && !$bFound && in_array($sKind, ['birth','death'], true)) {
                    $aWarnings[] = 'Jiná existující událost '.$sKind.' u '.$aPeoplePlan[$sSource]['name'].' zůstává beze změny; návrh se přeskočí.';
                }
                $aEventPlan[] = ['source_id'=>(string)$aEvent['event_id'], 'person'=>$sSource,
                    'action'=>$bFound?'existing':($bDifferent && in_array($sKind,['birth','death'],true)?'review':'create'),
                    'type'=>$sKind, 'date'=>$sDate, 'place'=>(string)$aEvent['place'], 'data'=>$aEvent];
            }
        }
        $aJournalReport = $aPackage['journal'] === null ? null : $this->oJournalImport->inspect($nTreeId, $aPackage['journal']);
        $aCounters = ['persons_new' => count(array_filter($aPeoplePlan, static fn(array $aR): bool => $aR['action'] === 'create')),
            'persons_existing' => count($aMatched),
            'relations_new' => count(array_filter($aRelationPlan, static fn(array $aR): bool => $aR['action'] === 'create')),
            'events_new' => count(array_filter($aEventPlan, static fn(array $aR): bool => $aR['action'] === 'create')),
            'pictures' => count(array_unique(array_map(static fn(string $sData): string => hash('sha256', $sData), $aPackage['pictures']))),
            'journal_new' => (int)($aJournalReport['total_new'] ?? 0),
            'journal_existing' => (int)($aJournalReport['total_existing'] ?? 0)];
        return ['people' => $aPeoplePlan, 'relations' => $aRelationPlan, 'events' => $aEventPlan,
            'journal_report' => $aJournalReport, 'warnings' => array_merge($aPackage['warnings'], $aWarnings),
            'conflicts' => array_values(array_unique($aConflicts)), 'counts' => $aCounters];
    }

    /**
     * @brief Sjednotí typ události GEDCOM s typem používaným stromem.
     * @param string $sType Kód GEDCOM.
     * @return string Název interního typu události.
     */
    private function eventType(string $sType): string {
        return ['birt'=>'birth','deat'=>'death','marr'=>'marriage','chr'=>'christening','bapm'=>'baptism','occu'=>'occupation','resi'=>'residence'][$sType] ?? $sType;
    }

    /**
     * @brief Převádí běžné přesné GEDCOM datum na ISO, neurčité datum ponechá.
     * @param string $sDate Vstupní datum z GEDCOM nebo stromu.
     * @return string Datum normalizované pro bezpečné porovnání.
     */
    private function date(string $sDate): string {
        $sDate = trim($sDate);
        if (preg_match('/^(\d{1,2}) (JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC) (\d{4})$/i', $sDate, $aMatch)) {
            $aMonths = ['JAN'=>1,'FEB'=>2,'MAR'=>3,'APR'=>4,'MAY'=>5,'JUN'=>6,'JUL'=>7,'AUG'=>8,'SEP'=>9,'OCT'=>10,'NOV'=>11,'DEC'=>12];
            return sprintf('%04d-%02d-%02d', (int)$aMatch[3], $aMonths[strtoupper($aMatch[2])], (int)$aMatch[1]);
        }
        return $sDate;
    }

    /**
     * @brief Z nálezu vytvoří přesně stejný kontrolní otisk pro preview i apply.
     * @param int $nTreeId Cílový rodokmen.
     * @return array Plán a balíček přepočtené z aktuálních dat.
     */
    private function prepare(int $nTreeId): array {
        $aPackage = $this->package();
        $aManual = $this->manualMatches();
        $aPlan = $this->plan($nTreeId, $aPackage, $aManual);
        $aPublic = ['sha256'=>$aPackage['sha256'],'tree_id'=>$nTreeId,'counts'=>$aPlan['counts'],
            'people'=>array_values(array_map(static fn(array $aRow): array => array_diff_key($aRow, ['data'=>true]), $aPlan['people'])),
            'relations'=>array_map(static fn(array $aRow): array => ['names'=>$aRow['names'],'action'=>$aRow['action']], $aPlan['relations']),
            'events'=>array_map(static fn(array $aRow): array => array_diff_key($aRow, ['data'=>true]), $aPlan['events']),
            'warnings'=>$aPlan['warnings'],'conflicts'=>$aPlan['conflicts']];
        $aPublic['plan_sha256'] = hash('sha256', json_encode($aPublic, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR));
        return ['package'=>$aPackage,'plan'=>$aPlan,'preview'=>$aPublic];
    }

    /**
     * @brief Vrátí návrh bez jakýchkoli změn původního rodokmenu.
     * @param int $nTreeId Cílový rodokmen.
     * @return array Přehled osob, vazeb, událostí a deníku s otiskem schválení.
     */
    public function preview(int $nTreeId): array { return $this->prepare($nTreeId)['preview']; }

    /**
     * @brief Vytvoří podadresář pro import, aniž se dotkne již existujících souborů.
     * @param Folder $oParent Rodičovská složka.
     * @param string $sName Název pouze interně definované složky.
     * @return Folder Cílová složka.
     */
    private function folder(Folder $oParent, string $sName): Folder {
        try { $oExisting = $oParent->get($sName); if ($oExisting instanceof Folder) return $oExisting; }
        catch (NotFoundException) { return $oParent->newFolder($sName); }
        throw new \InvalidArgumentException('Soubor blokuje vytvoření složky pro důkazy.');
    }

    /**
     * @brief Zapíše snímky podle SHA-256 do soukromých Souborů vlastníka a eviduje nové cesty.
     * @param string $sOwnerUID Uživatelský identifikátor vlastníka stromu.
     * @param int $nTreeId Identifikátor stromu.
     * @param array $aPictures Obsah jednotlivých obrázků.
     * @param array $aNewFiles Výstupní seznam souborů vytvořených importem pro případ vrácení.
     * @return array Mapa původních cest na cesty Nextcloud Files.
     */
    private function savePictures(string $sOwnerUID, int $nTreeId, array $aPictures, array &$aNewFiles): array {
        $oRoot = $this->oRoot->getUserFolder($sOwnerUID);
        $oFolder = $this->folder($this->folder($this->folder($this->folder($oRoot, 'Rodokmen'), 'Import'), (string)$nTreeId), 'nalezy');
        $aStored = [];
        foreach ($aPictures as $sName => $sContent) {
            $sFilename = hash('sha256', $sContent).'.'.strtolower(pathinfo($sName, PATHINFO_EXTENSION));
            $sPath = 'Rodokmen/Import/'.$nTreeId.'/nalezy/'.$sFilename;
            if ($oFolder->nodeExists($sFilename)) {
                if (!hash_equals(hash('sha256', $sContent), hash('sha256', (string)$oFolder->get($sFilename)->getContent()))) {
                    throw new \InvalidArgumentException('Kolize souboru důkazu: '.$sFilename);
                }
            } else {
                $oFolder->newFile($sFilename, $sContent);
                $aNewFiles[] = $sPath;
            }
            $aStored[$sName] = $sPath;
        }
        return $aStored;
    }

    /**
     * @brief Odstraní výhradně nové soubory vytvořené neúspěšným importem.
     * @param string $sOwnerUID Vlastník souborů.
     * @param array $aPaths Nově vytvořené cesty, nikoli existující před importem.
     */
    private function rollbackPictures(string $sOwnerUID, array $aPaths): void {
        $oRoot = $this->oRoot->getUserFolder($sOwnerUID);
        foreach ($aPaths as $sPath) {
            try { $oRoot->get($sPath)->delete(); }
            catch (NotFoundException) {}
        }
    }

    /**
     * @brief Zaznamená původ GEDCOM entity do výzkumné vrstvy bez přepsání jiných sad.
     * @param int $nTreeId Rodokmen.
     * @param string $sOrigin Identifikátor importní dávky.
     * @param string $sType Typ entity.
     * @param string $sSourceID Externí ID.
     * @param array $aPayload Nezměněný záznam původu.
     * @param ?int $nNativeID ID propojeného nativního záznamu.
     * @param string $sActor Identifikátor autora.
     * @param string $sMediaPath Volitelná cesta uloženého média.
     */
    private function record(int $nTreeId, string $sOrigin, string $sType, string $sSourceID, array $aPayload, ?int $nNativeID, string $sActor, string $sMediaPath=''): void {
        $aRows = $this->rows('hc_familytree_research', ['tree_id'=>$nTreeId,'origin_key'=>$sOrigin,'entity_type'=>$sType,'external_id'=>$sSourceID]);
        if ($aRows) return;
        $this->insert('hc_familytree_research', ['tree_id'=>$nTreeId,'origin_key'=>$sOrigin,'entity_type'=>$sType,
            'external_id'=>$sSourceID,'native_id'=>$nNativeID,'payload_json'=>ResearchJournalService::json($aPayload),'media_path'=>$sMediaPath],$nTreeId,$sActor);
    }

    /**
     * @brief Dohledá osoby přímo nebo pramenně spojené se snímkem GEDCOM.
     * @param array $aMedium Záznam média obsahující linked_entity_type a linked_entity_id.
     * @param array $aGed Rozebraná genealogie se vztahy, rodinami a událostmi.
     * @return array Množina zdrojových identifikátorů osob pro dokumentační vazbu.
     */
    private function linkedPeople(array $aMedium, array $aGed): array {
        $sKind = (string)($aMedium['linked_entity_type'] ?? '');
        $sEntity = (string)($aMedium['linked_entity_id'] ?? '');
        $sSource = (string)($aMedium['source_id'] ?? '');
        if ($sKind === 'source' && $sSource === '') $sSource = $sEntity;
        $aPeople = [];
        if ($sKind === 'person' && $sEntity !== '') $aPeople[$sEntity] = true;
        if ($sKind === 'family') foreach ($aGed['families'] ?? [] as $aFamily) {
            if ((string)($aFamily['family_id'] ?? '') !== $sEntity) continue;
            foreach (array_merge($aFamily['parent_ids'] ?? [], $aFamily['child_ids'] ?? []) as $sPerson) {
                $aPeople[(string)$sPerson] = true;
            }
        }
        foreach ($aGed['events'] ?? [] as $aEvent) {
            if ($sKind === 'event' && (string)($aEvent['event_id'] ?? '') === $sEntity
                || ($sSource !== '' && (string)($aEvent['source_id'] ?? '') === $sSource)) {
                foreach (explode('|', (string)$aEvent['person_id']) as $sPerson) $aPeople[$sPerson] = true;
            }
        }
        foreach ($aGed['relationships'] ?? [] as $aRelation) {
            if ($sSource === '' || (string)($aRelation['source_id'] ?? '') !== $sSource) continue;
            $aPeople[(string)$aRelation['person1_id']] = true;
            $aPeople[(string)$aRelation['person2_id']] = true;
        }
        return $aPeople;
    }

    /**
     * @brief Aplikuje schválený plán atomicky s deníkem; konflikty nic nepřepisují.
     * @param int $nTreeId Rodokmen s oprávněním editace ověřeným řadičem.
     * @param string $sOwnerUID Vlastník souborů stromu.
     * @param string $sActor Aktuálně přihlášený uživatel.
     * @return array Souhrn skutečně vložených dat.
     */
    public function apply(int $nTreeId, string $sOwnerUID, string $sActor): array {
        if ((string)$this->oRequest->getParam('confirm','') !== 'yes') throw new \InvalidArgumentException('Import musí být výslovně potvrzen.');
        $aPrepared = $this->prepare($nTreeId);
        $aPreview = $aPrepared['preview']; $aPlan = $aPrepared['plan']; $aPackage = $aPrepared['package'];
        $sHash = (string)$this->oRequest->getParam('preview_sha256','');
        if (!preg_match('/^[a-f0-9]{64}$/D', $sHash) || !hash_equals($aPreview['plan_sha256'], $sHash)) {
            throw new \InvalidArgumentException('Soubor nebo rodokmen se po náhledu změnil. Zopakuj kontrolu.');
        }
        if ($aPlan['conflicts']) throw new \InvalidArgumentException('Import obsahuje konflikty. Nejprve je vyřeš v náhledu.');
        $aNewFiles = []; $bTransaction = false;
        try {
            $aPaths = $this->savePictures($sOwnerUID,$nTreeId,$aPackage['pictures'],$aNewFiles);
            $this->oDb->beginTransaction(); $bTransaction = true;
            $sOrigin = self::PREFIX.substr($aPackage['sha256'],0,32);
            $aNative = []; $nNow = time();
            $aResult = ['created_people'=>0,'created_relations'=>0,'created_events'=>0,'documents'=>0,'journal_new'=>0,'journal_existing'=>0,'source_sha256'=>$aPackage['sha256']];
            foreach ($aPlan['people'] as $sSource => $aEntry) {
                $aP = $aEntry['data'];
                if ($aEntry['action'] === 'existing') $nNative = (int)$aEntry['native_id'];
                else {
                    $nNative = $this->insert('hc_familytree_people', ['tree_id'=>$nTreeId,
                        'given_name'=>(string)$aP['given_names'],'surname'=>(string)$aP['surname_best'],
                        'birth_surname'=>(string)($aP['birth_surname']??''), 'gender'=>['M'=>'male','F'=>'female'][$aP['sex']??'']??'other',
                        'birth_date'=>$this->date((string)($aP['birth_date']??'')),
                        'death_date'=>$this->date((string)($aP['death_date']??'')),
                        'birth_place'=>(string)($aP['birth_place']??''),'death_place'=>(string)($aP['death_place']??''),
                        'occupation'=>(string)($aP['occupations']??''), 'photo_url'=>'',
                        'notes'=>(string)($aP['notes']??''), 'is_living'=>($aP['living_status']??'')==='deceased'?0:1,
                        'created_at'=>$nNow,'updated_at'=>$nNow],$nTreeId,$sActor);
                    $aResult['created_people']++;
                }
                $aNative[$sSource]=$nNative;
                $this->record($nTreeId,$sOrigin,'persons',$sSource,$aP,$nNative,$sActor);
            }
            foreach ($aPlan['relations'] as $aR) {
                $aData=$aR['data']; $nOne=$aNative[$aData['person1_id']];$nTwo=$aNative[$aData['person2_id']];
                $nRel = null;
                if ($aR['action'] === 'create') {
                    $nRel=$this->insert('hc_familytree_relations',['tree_id'=>$nTreeId,'person1_id'=>$nOne,'person2_id'=>$nTwo,
                        'type'=>$aData['relationship_type']==='spouse'?'partner':'parent',
                        'start_date'=>'','end_date'=>'','notes'=>(string)($aData['notes']??'')],$nTreeId,$sActor);
                    $aResult['created_relations']++;
                }
                $this->record($nTreeId,$sOrigin,'relationships',(string)$aData['relationship_id'],$aData,$nRel,$sActor);
            }
            foreach ($aPlan['events'] as $aE) {
                $aData=$aE['data']; $nEvent=null;
                if ($aE['action'] === 'create') {
                    $nEvent=$this->insert('hc_familytree_events',['tree_id'=>$nTreeId,'person_id'=>$aNative[$aE['person']],
                        'type'=>$aE['type'],'title'=>$aE['type'],'event_date'=>$aE['date'],'place'=>$aE['place'],
                        'description'=>(string)($aData['description']??'')],$nTreeId,$sActor);
                    $aResult['created_events']++;
                }
                $this->record($nTreeId,$sOrigin,'events',(string)$aE['source_id'].':'.$aE['person'],$aData,$nEvent,$sActor);
            }
            foreach ($aPackage['ged']['sources'] as $aSource) $this->record($nTreeId,$sOrigin,'sources',(string)$aSource['source_id'],$aSource,null,$sActor);
            // Obrazové důkazy zachovat v dokumentech stromu i ve výzkumné vrstvě.
            uksort($aPaths, static fn(string $sA, string $sB): int => (int)str_starts_with($sA, 'dukazy/') <=> (int)str_starts_with($sB, 'dukazy/'));
            foreach ($aPaths as $sName => $sPath) {
                $aExistingDoc=$this->rows('hc_familytree_documents',['tree_id'=>$nTreeId,'file_path'=>$sPath]);
                if ($aExistingDoc) continue;
                $bWorking = str_starts_with($sName,'dukazy/'); // Externí obrázek bez přímé vazby GEDCOM je pracovní důkaz, nikoli potvrzený fakt.
                $aMedium=null; $aArchiveSource=null;
                if (str_starts_with($sName,'media/')) {
                    foreach ($aPackage['ged']['media'] as $aM) if (($aM['file_name']??'')===$sName) $aMedium=$aM;
                    foreach ($aPackage['ged']['sources'] as $aSource) if (($aSource['source_id']??'')===($aMedium['linked_entity_id']??null)) $aArchiveSource=$aSource;
                }
                $sTitle = basename($sName);
                $nDoc=$this->insert('hc_familytree_documents',['tree_id'=>$nTreeId,'person_id'=>null,'title'=>$sTitle,
                    'document_type'=>$bWorking?'working_scan':'source_scan', 'document_date'=>'', 'place'=>'',
                    'archive'=>(string)($aArchiveSource['archive']??'Moravský zemský archiv'),
                    'signature'=>'','source'=>(string)($aArchiveSource['url']??''),
                    'mime_type'=>(new \finfo(FILEINFO_MIME_TYPE))->buffer($aPackage['pictures'][$sName]),
                    'file_path'=>$sPath,'description'=>$bWorking?'PRACOVNÍ, NEOVĚŘENÝ SNÍMEK – bez vazby na fakta.':'Původní archivní obrázek importovaného nálezu.',
                    'created_at'=>$nNow,'updated_at'=>$nNow],$nTreeId,$sActor);
                $aResult['documents']++;
                // Obrazy označené jako důkazy k rodině se propojí s příslušnými osobami z GEDCOM zdrojů.
                if (!$bWorking && str_starts_with($sName,'media/')) {
                    if ($aMedium !== null) {
                        $aOwners=$this->linkedPeople($aMedium, $aPackage['ged']);
                        foreach ($aOwners as $sOwner => $_) if (isset($aNative[$sOwner]))
                            $this->insert('hc_familytree_doc_links',['tree_id'=>$nTreeId,'document_id'=>$nDoc,
                                'link_type'=>'person','target_id'=>$aNative[$sOwner]],$nTreeId,$sActor);
                    }
                }
            }
            foreach ($aPackage['ged']['media'] as $aMedium) $this->record($nTreeId,$sOrigin,'media',(string)$aMedium['media_id'],
                $aMedium,null,$sActor,$aPaths[$aMedium['file_name']]??'');
            if ($aPackage['journal'] !== null) {
                // Jedna databázová transakce pro genealogii i doplnění deníku.
                $aJournalReport=$this->oJournalImport->apply($nTreeId,$aPackage['journal'],$sActor,true);
                $aResult['journal_new']=$aJournalReport['total_new'];
                $aResult['journal_existing']=$aJournalReport['total_existing'];
            }
            $this->oJournal->audit($nTreeId,'findings_import',ResearchJournalService::uid(),'import',$sActor,null,$aResult,'Potvrzený nedestruktivní import nálezů');
            $this->oDb->commit(); $bTransaction = false;
            return $aResult;
        } catch (\Throwable $oError) {
            if ($bTransaction) $this->oDb->rollBack();
            $this->rollbackPictures($sOwnerUID,$aNewFiles);
            throw $oError;
        }
    }
}
