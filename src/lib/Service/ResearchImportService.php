<?php
declare(strict_types=1);
/**
 * @file Kód aplikace FamilyTree pro Nextcloud.
 * Maďarská notace proměnných: s = string, n = int/float,
 * b = bool, a = array, o = objekt nebo hodnota mixed,
 * fn = funkce/callback, h = reference na element (převážně v JavaScriptu).
 * Prefixed identifiers are internal; wire-format keys, route names and public
 * Nextcloud API names are stable contractual identifiers.
 */

namespace OCA\HcFamilyTree\Service;

use OCP\AppFramework\Http\DataDisplayResponse;
use OCP\AppFramework\Http\JSONResponse;
use OCP\AppFramework\Http\Response;
use OCP\Files\File;
use OCP\Files\Folder;
use OCP\Files\IRootFolder;
use OCP\Files\NotFoundException;
use OCP\IDBConnection;
use OCP\IRequest;

/** Import GEDCOM 7 / GEDZIP while retaining the original evidence and file. */
final class ResearchImportService {
    private const TABLE = 'hc_familytree_research';
    private const TYPES = [
        'persons' => 'person_id', 'relationships' => 'relationship_id',
        'events' => 'event_id', 'facts' => 'fact_id', 'sources' => 'source_id',
        'citations' => 'citation_id', 'media' => 'media_id',
        'places' => 'place_id', 'research' => 'research_id',
        'research_facts' => 'fact_id', 'notes' => 'note_id',
        'note_links' => 'note_link_id', 'families' => 'family_id',
    ];
    private const IMAGES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    /**
 * @brief Inicializuje instanci a propojí předané závislosti.
 * @param IDBConnection $oDb Databázové připojení.
 * @param IRequest $oRequest Objekt HTTP požadavku.
 * @param IRootFolder $oRootFolder Kořenový adresář souborů Nextcloudu.
 * @return void Konstruktor nevrací návratovou hodnotu.
 */
public function __construct(
        private IDBConnection $oDb,
        private IRequest $oRequest,
        private IRootFolder $oRootFolder,
    ) {}

    /**
 * @brief Načte požadované řádky z databáze a vrátí je aplikaci.
 * @param string $sTable Název databázové tabulky.
 * @param array $aWhere Vstupní parametr „where“ pro operaci rows.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
    private function rows(string $sTable, array $aWhere): array {
        $oQ = $this->oDb->getQueryBuilder()->select('*')->from($sTable);
        foreach ($aWhere as $sKey => $sValue) $oQ->andWhere($oQ->expr()->eq($sKey, $oQ->createNamedParameter($sValue)));
        return $oQ->executeQuery()->fetchAllAssociative();
    }

    /**
 * @brief Vloží research import service používané v ResearchImportService.
 * @param string $sTable Název databázové tabulky.
 * @param array $aData Zpracovávaná data.
 * @return int Vypočtená číselná hodnota nebo identifikátor dle významu operace.
 */
    private function insert(string $sTable, array $aData): int {
        if (!isset($aData['stable_id'])) $aData['stable_id'] = ResearchJournalService::uid();
        $oQ = $this->oDb->getQueryBuilder()->insert($sTable);
        foreach ($aData as $sKey => $sValue) $oQ->setValue($sKey, $oQ->createNamedParameter($sValue));
        $oQ->executeStatement();
        return (int)$this->oDb->lastInsertId($sTable);
    }

    /**
 * @brief Aktualizuje research import service používané v ResearchImportService.
 * @param string $sTable Název databázové tabulky.
 * @param int $nId Identifikátor cílového záznamu.
 * @param array $aData Zpracovávaná data.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
    private function update(string $sTable, int $nId, array $aData): void {
        $oQ = $this->oDb->getQueryBuilder()->update($sTable);
        foreach ($aData as $sKey => $sValue) $oQ->set($sKey, $oQ->createNamedParameter($sValue));
        $oQ->where($oQ->expr()->eq('id', $oQ->createNamedParameter($nId)))->executeStatement();
    }

    /**
 * @brief Určí nebo normalizuje původ importovaného badatelského záznamu.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
    private function origin(): string {
        $sOrigin = trim((string)$this->oRequest->getParam('origin', 'genealogie'));
        if (!preg_match('/^[a-zA-Z0-9_-]{1,64}$/D', $sOrigin)) {
            throw new \InvalidArgumentException('Import label may contain only letters, digits, _ and -.');
        }
        return $sOrigin;
    }

    /**
 * @brief Vyhodnotí režim zpracování importovaných dat a příslušná pravidla.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
    private function mode(): string {
        $sMode = (string)$this->oRequest->getParam('mode', 'new');
        if (!in_array($sMode, ['new', 'update'], true)) throw new \InvalidArgumentException('Invalid import mode.');
        return $sMode;
    }

    /**
 * @brief Načte nebo připraví strukturu importovaného badatelského balíčku.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
    private function package(): array {
        $oUploaded = $this->oRequest->getUploadedFile('package');
        if (!is_array($oUploaded) || ($oUploaded['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK
            || !is_file((string)($oUploaded['tmp_name'] ?? ''))) {
            throw new \InvalidArgumentException('Vyberte GEDCOM 7 (.ged) nebo GEDZIP (.gdz).');
        }
        $sPath = (string)$oUploaded['tmp_name'];
        $nSize = (int)($oUploaded['size'] ?? 0);
        if ($nSize < 1 || $nSize > 64 * 1024 * 1024) throw new \InvalidArgumentException('The package must be smaller than 64 MB.');
        $sName = strtolower((string)($oUploaded['name'] ?? ''));
        $sSource = file_get_contents($sPath);
        if (!is_string($sSource)) throw new \InvalidArgumentException('File cannot be read.');
        $aFiles = [];
        if (str_ends_with($sName, '.ged') || str_ends_with($sName, '.gedcom')) {
            $oGed = $sSource;
            $bGedzip = false;
        } elseif (str_ends_with($sName, '.gdz') || str_ends_with($sName, '.zip')) {
            $bGedzip = true;
            if (!class_exists(\ZipArchive::class)) throw new \InvalidArgumentException('PHP ZIP extension is missing on the server.');
            $oZip = new \ZipArchive();
            if ($oZip->open($sPath) !== true) throw new \InvalidArgumentException('Cannot open ZIP archive.');
            try {
                if ($oZip->numFiles > 300) throw new \InvalidArgumentException('Archive contains too many files.');
                $oGed = null; $nTotal = 0;
                for ($nI = 0; $nI < $oZip->numFiles; $nI++) {
                    $oStat = $oZip->statIndex($nI);
                    if ($oStat === false) throw new \InvalidArgumentException('Invalid archive entry.');
                    $oEntry = $oStat['name'];
                    if (str_contains($oEntry, '\\') || str_starts_with($oEntry, '/')
                        || preg_match('~(^|/)\.{1,2}(/|$)|[\x00-\x1f]~', $oEntry)) {
                        throw new \InvalidArgumentException('Archive contains an unsafe path.');
                    }
                    $oBytes = (int)$oStat['size']; $nTotal += $oBytes;
                    if ($nTotal > 96 * 1024 * 1024 || $oBytes > 16 * 1024 * 1024) {
                        throw new \InvalidArgumentException('Unpacked archive is too large.');
                    }
                    if (method_exists($oZip, 'getExternalAttributesIndex') && $oZip->getExternalAttributesIndex($nI, $oOpsys, $oAttributes)
                        && ((($oAttributes >> 16) & 0170000) === 0120000)) {
                        throw new \InvalidArgumentException('Symbolic links in archives are not allowed.');
                    }
                    if (str_ends_with($oEntry, '/')) continue;
                    if (array_key_exists($oEntry, $aFiles)) throw new \InvalidArgumentException('Archive contains a duplicate path.');
                    $sContent = $oZip->getFromIndex($nI);
                    if (!is_string($sContent) || strlen($sContent) !== $oBytes) throw new \InvalidArgumentException('File in archive cannot be read.');
                    $aFiles[$oEntry] = $sContent;
                }
                $oGed = $aFiles['gedcom.ged'] ?? null;
                unset($aFiles['gedcom.ged']);
                if (!is_string($oGed)) throw new \InvalidArgumentException('GEDZIP is missing root-level gedcom.ged.');
            } finally { $oZip->close(); }
        } else {
            throw new \InvalidArgumentException('GEDCOM 7 (.ged, .gedcom) or GEDZIP (.gdz, .zip with gedcom.ged) is supported.');
        }
        Gedcom7Package::validateFiles($oGed, $aFiles, $bGedzip);
        $oParsed = Gedcom7Package::parse($oGed, $aFiles, $bGedzip);
        return $oParsed + ['source' => $sSource, 'filename' => $bGedzip ? (str_ends_with($sName, '.zip') ? 'zip' : 'gdz') : 'ged'];
    }

    /**
 * @brief Vyhledá odpovídající existující záznam před případným importem.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @param string $sOrigin Vstupní parametr „origin“ pro operaci existing.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
    private function existing(int $nTreeId, string $sOrigin): array {
        $oMap = [];
        foreach ($this->rows(self::TABLE, ['tree_id' => $nTreeId, 'origin_key' => $sOrigin]) as $aRow) {
            $oMap[$aRow['entity_type']][$aRow['external_id']] = $aRow;
        }
        return $oMap;
    }

    /**
 * @brief Ověří research import service používané v ResearchImportService.
 * @param array $aData Zpracovávaná data.
 * @param array $aMedia Vstupní parametr „media“ pro operaci validate.
 * @param array $aExisting Vstupní parametr „existing“ pro operaci validate.
 * @param string $sMode Vstupní parametr „mode“ pro operaci validate.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
    private function validate(array $aData, array $aMedia, array $aExisting, string $sMode, int $nTreeId): array {
        if (($aData['format'] ?? '') !== 'FamilySearch GEDCOM 7') throw new \InvalidArgumentException('Invalid GEDCOM 7.');
        if ($sMode === 'new' && ($aExisting || $this->rows('hc_familytree_people', ['tree_id' => $nTreeId]))) {
            throw new \InvalidArgumentException('A new import requires an empty family tree. Select update by UID for this dataset.');
        }
        if ($sMode === 'update' && !$aExisting) {
            throw new \InvalidArgumentException('Pro aktualizaci nejprve naimportujte tuto sadu do rodokmenu.');
        }
        $aIds = []; $oCounts = []; $oNew = []; $oUnchanged = []; $oChanged = [];
        foreach (self::TYPES as $sType => $oIdField) {
            if (!isset($aData[$sType]) || !is_array($aData[$sType]) || !array_is_list($aData[$sType]) || count($aData[$sType]) > 5000) {
                throw new \InvalidArgumentException('Missing or invalid table: ' . $sType . '.');
            }
            $oCounts[$sType] = count($aData[$sType]); $oNew[$sType] = 0; $oUnchanged[$sType] = 0; $oChanged[$sType] = 0;
            foreach ($aData[$sType] as $oRecord) {
                $nId = $oRecord[$oIdField] ?? null;
                if (!is_array($oRecord) || !is_string($nId) || !preg_match('/^[A-Za-z][A-Za-z0-9_-]{0,63}$/D', $nId)
                    || isset($aIds[$sType][$nId]) || strlen(json_encode($oRecord, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)) > 60000) {
                    throw new \InvalidArgumentException('Invalid or duplicate identifier in table ' . $sType . '.');
                }
                $aIds[$sType][$nId] = true;
                if (!isset($aExisting[$sType][$nId])) $oNew[$sType]++;
                elseif (json_decode((string)$aExisting[$sType][$nId]['payload_json'], true) === $oRecord) $oUnchanged[$sType]++;
                else {
                    if ($sMode === 'update' && in_array($sType, ['persons', 'families'], true)
                        && (string)($oRecord['uid'] ?? '') === '') {
                        throw new \InvalidArgumentException(strtr('Modified record {type} cannot be synchronized safely without a UID.', ['{type}' => $sType]));
                    }
                    $oChanged[$sType]++;
                }
            }
        }
        $oRemoved = [];
        foreach (self::TYPES as $sType => $oUnusedType) $oRemoved[$sType] = count(array_diff_key($aExisting[$sType] ?? [], $aIds[$sType] ?? []));
        if (!$oCounts['persons']) throw new \InvalidArgumentException('Import contains no people.');
        $oKnown = [];
        foreach (self::TYPES as $sType => $oUnusedType) $oKnown[$sType] = ($aIds[$sType] ?? []) + array_fill_keys(array_keys($aExisting[$sType] ?? []), true);
        $oAssertRefs = static /**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param string $sRaw Vstupní hodnota $sRaw použitá v callbacku.
 * @param string $sType Vstupní hodnota $sType použitá v callbacku.
 * @return mixed Výsledek callbacku pro volající operaci.
 */
function (string $sRaw, string $sType) use ($oKnown): void {
            foreach (explode('|', $sRaw) as $oRef) {
                if ($oRef === '' || !isset($oKnown[$sType][$oRef])) throw new \InvalidArgumentException('Missing reference ' . $sType . ': ' . $oRef);
            }
        };
        foreach ($aData['relationships'] as $aR) {
            $oAssertRefs((string)($aR['person1_id'] ?? ''), 'persons');
            $oAssertRefs((string)($aR['person2_id'] ?? ''), 'persons');
            if (!empty($aR['source_id'])) $oAssertRefs((string)$aR['source_id'], 'sources');
            if (!in_array($aR['relationship_type'] ?? null, ['parent_child', 'spouse'], true)
                || $aR['person1_id'] === $aR['person2_id']) throw new \InvalidArgumentException('Invalid relationship.');
            foreach (['start_date','end_date'] as $sField) if (strlen((string)($aR[$sField] ?? '')) > 32) throw new \InvalidArgumentException('Relationship date is too long.');
        }
        $oParentCount = [];
        foreach ($aData['relationships'] as $aR) if ($aR['relationship_type'] === 'parent_child' && ($aR['verification_status'] ?? '') !== 'disproven') {
            $oChild = $aR['person2_id']; $oParentCount[$oChild] = ($oParentCount[$oChild] ?? 0) + 1;
        }
        $oParentConflicts = array_filter($oParentCount, static /**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param int $nCount Vstupní hodnota $nCount použitá v callbacku.
 * @return bool Výsledek callbacku pro volající operaci.
 */
fn(int $nCount): bool => $nCount > 2);
        foreach ($aData['events'] as $aR) {
            $oAssertRefs((string)($aR['person_id'] ?? ''), 'persons');
            if (!empty($aR['source_id'])) $oAssertRefs((string)$aR['source_id'], 'sources');
            if (strlen((string)($aR['date_value'] ?? '')) > 32 || strlen((string)($aR['place'] ?? '')) > 255) throw new \InvalidArgumentException('Event date or place is too long.');
        }
        foreach ($aData['facts'] as $aR) {
            $oAssertRefs((string)($aR['subject_id'] ?? ''), ($aR['subject_type'] ?? '') === 'relationship' ? 'relationships' : 'persons');
            if (!empty($aR['source_id'])) $oAssertRefs((string)$aR['source_id'], 'sources');
        }
        foreach ($aData['families'] as $aR) {
            foreach (($aR['parent_ids'] ?? []) as $nId) $oAssertRefs((string)$nId, 'persons');
            foreach (($aR['child_ids'] ?? []) as $nId) $oAssertRefs((string)$nId, 'persons');
        }
        $sLinkedType = static /**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param string $sType Vstupní hodnota $sType použitá v callbacku.
 * @return string Výsledek callbacku pro volající operaci.
 */
fn(string $sType): string => match ($sType) {
            'event' => 'events', 'family' => 'families', 'source' => 'sources',
            'citation' => 'citations', 'research_facts' => 'research_facts',
            'person' => 'persons', default => throw new \InvalidArgumentException('Unknown owner type: ' . $sType),
        };
        foreach ($aData['citations'] as $aR) {
            $oAssertRefs((string)($aR['source_id'] ?? ''), 'sources');
            $oAssertRefs((string)($aR['linked_entity_id'] ?? ''), $sLinkedType((string)($aR['linked_entity_type'] ?? '')));
        }
        foreach ($aData['research_facts'] as $aR) {
            if (($aR['owner_type'] ?? '') !== 'unlinked') $oAssertRefs((string)($aR['owner_id'] ?? ''), $sLinkedType((string)$aR['owner_type']));
            if (!empty($aR['source_id'])) $oAssertRefs((string)$aR['source_id'], 'sources');
            if (!empty($aR['citation_id'])) $oAssertRefs((string)$aR['citation_id'], 'citations');
        }
        foreach ($aData['notes'] as $aR) foreach ($aR['source_links'] ?? [] as $nId) $oAssertRefs((string)$nId, 'sources');
        foreach ($aData['note_links'] as $aR) {
            $oAssertRefs((string)($aR['note_id'] ?? ''), 'notes');
            if (($aR['owner_type'] ?? '') !== 'unlinked') {
                $oAssertRefs((string)($aR['owner_id'] ?? ''), $sLinkedType((string)($aR['owner_type'] ?? '')));
            }
        }
        $oMissing = []; $oAvailable = []; $oRemote = [];
        foreach ($aData['media'] as $aR) {
            $sPath = (string)($aR['file_name'] ?? '');
            $bIsRemote = preg_match('~^(https?|ftp)://~i', $sPath) === 1;
            if (!$bIsRemote && (str_starts_with($sPath, '/') || str_contains($sPath, '\\')
                || preg_match('~(^|/)\.{1,2}(/|$)|[\x00-\x1f]~', $sPath) || $sPath === '')) {
                throw new \InvalidArgumentException('Invalid media path.');
            }
            if (!empty($aR['source_id'])) $oAssertRefs((string)$aR['source_id'], 'sources');
            if (($aR['linked_entity_type'] ?? '') !== 'unlinked') {
                $oAssertRefs((string)($aR['linked_entity_id'] ?? ''), $sLinkedType((string)($aR['linked_entity_type'] ?? '')));
            }
            if ($bIsRemote) { $oRemote[] = $sPath; continue; }
            if (($aR['supported'] ?? true) === false) continue;
            if (!isset($aMedia[$sPath])) { $oMissing[] = $sPath; continue; }
            $sContent = $aMedia[$sPath];
            $oMime = is_string($sContent) ? (new \finfo(FILEINFO_MIME_TYPE))->buffer($sContent) : '';
            if (!is_string($sContent) || strlen($sContent) > 16 * 1024 * 1024
                || !in_array($oMime, self::IMAGES, true)
                || (!empty($aR['form']) && strtolower((string)$aR['form']) !== $oMime)
                || !in_array(strtolower(pathinfo($sPath, PATHINFO_EXTENSION)), ['jpg','jpeg','png','gif','webp'], true)
                || (!empty($aR['sha256']) && !hash_equals(strtolower((string)$aR['sha256']), hash('sha256', $sContent)))) {
                throw new \InvalidArgumentException('Image is invalid or its checksum does not match: ' . $sPath);
            }
            $oAvailable[] = $sPath;
        }
        foreach ($aData['research'] as $aR) {
            if (!empty($aR['source_id'])) $oAssertRefs((string)$aR['source_id'], 'sources');
            foreach ($aR['target_person_ids'] ?? [] as $nId) $oAssertRefs((string)$nId, 'persons');
        }
        foreach ($aData['persons'] as $aP) {
            foreach (['given_names','surname_best','birth_surname','sex','birth_date','death_date','birth_place','death_place','occupations'] as $sField) {
                if (!is_string($aP[$sField] ?? '') || strlen((string)($aP[$sField] ?? '')) > 255) throw new \InvalidArgumentException('Person field is too long: ' . $sField);
            }
        }
        if ($oMissing) throw new \InvalidArgumentException('Local media file is missing: ' . implode(', ', array_slice($oMissing, 0, 3)));
        $oUnknownNotes = count(array_filter($aData['notes'], static /**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param array $aR Vstupní hodnota $aR použitá v callbacku.
 * @return bool Výsledek callbacku pro volající operaci.
 */
fn(array $aR): bool => $aR['kind'] === 'other'));
        $oVariants = count(array_filter($aData['relationships'], static /**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param array $aR Vstupní hodnota $aR použitá v callbacku.
 * @return bool Výsledek callbacku pro volající operaci.
 */
fn(array $aR): bool => in_array($aR['verification_status'] ?? '', ['challenged','disproven','conflict'], true)));
        $oVariants += count(array_filter($aData['research_facts'], static /**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param array $aR Vstupní hodnota $aR použitá v callbacku.
 * @return bool Výsledek callbacku pro volající operaci.
 */
fn(array $aR): bool => str_contains(strtolower((string)$aR['verification_status']), 'conflict')));
        $oAlternatives = [];
        foreach ($aData['facts'] as $aR) if (($aR['predicate'] ?? '') === 'NAME') {
            $oAlternatives['name:' . $aR['subject_id']] = ($oAlternatives['name:' . $aR['subject_id']] ?? 0) + 1;
        }
        foreach ($aData['events'] as $aR) {
            $sKey = 'event:' . $aR['person_id'] . ':' . $aR['event_type'];
            $oAlternatives[$sKey] = ($oAlternatives[$sKey] ?? 0) + 1;
        }
        foreach ($oAlternatives as $nCount) $oVariants += max(0, $nCount - 1);
        $aChanges = [];
        foreach (self::TYPES as $sType => $oUnusedType) if ($oNew[$sType] || $oChanged[$sType] || $oRemoved[$sType]) {
            $aChanges[$sType] = ['new' => $oNew[$sType], 'changed' => $oChanged[$sType], 'absent_in_file' => $oRemoved[$sType]];
        }
        return compact('counts', 'new', 'unchanged', 'changed', 'removed', 'missing', 'available', 'remote', 'parentConflicts', 'unknownNotes', 'variants', 'changes');
    }

    /**
 * @brief Připraví náhled research import service používané v ResearchImportService.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
    public function preview(int $nTreeId): array {
        $oPackage = $this->package(); $sOrigin = $this->origin(); $sMode = $this->mode();
        $oResult = $this->validate($oPackage['data'], $oPackage['media'], $this->existing($nTreeId, $sOrigin), $sMode, $nTreeId);
        return ['origin' => $sOrigin, 'format' => 'GEDCOM 7' . ($oPackage['filename'] !== 'ged' ? ' / GEDZIP' : ''),
            'sha256' => hash('sha256', $oPackage['source']), 'mode' => $sMode,
            'warnings' => $oPackage['warnings']] + $oResult;
    }

    /**
 * @brief Převede položku importu na interní badatelský záznam.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @param string $sOrigin Vstupní parametr „origin“ pro operaci record.
 * @param string $sType Vstupní parametr „type“ pro operaci record.
 * @param string $sExternalId Identifikátor příslušného záznamu.
 * @param array $aPayload Vstupní parametr „payload“ pro operaci record.
 * @param ?int $nNativeId Identifikátor příslušného záznamu.
 * @return int Vypočtená číselná hodnota nebo identifikátor dle významu operace.
 */
    private function record(int $nTreeId, string $sOrigin, string $sType, string $sExternalId, array $aPayload, ?int $nNativeId): int {
        return $this->insert(self::TABLE, ['tree_id' => $nTreeId, 'origin_key' => $sOrigin,
            'entity_type' => $sType, 'external_id' => $sExternalId, 'native_id' => $nNativeId,
            'payload_json' => $this->encode($aPayload),
            'media_path' => '']);
    }

    /**
 * @brief Serializuje předanou hodnotu do přenosového formátu.
 * @param array $aPayload Vstupní parametr „payload“ pro operaci encode.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
    private function encode(array $aPayload): string {
        return json_encode($aPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    }

    /**
 * @brief Sestaví nebo normalizuje pole údajů importované osoby.
 * @param array $aP Vstupní parametr „p“ pro operaci personFields.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
    private function personFields(array $aP): array {
        return ['given_name' => $aP['given_names'] ?? '', 'surname' => $aP['surname_best'] ?? '',
            'birth_surname' => $aP['birth_surname'] ?? '', 'gender' => ['M'=>'male','F'=>'female'][$aP['sex'] ?? ''] ?? 'other',
            'birth_date' => $aP['birth_date'] ?? '', 'death_date' => $aP['death_date'] ?? '',
            'birth_place' => $aP['birth_place'] ?? '', 'death_place' => $aP['death_place'] ?? '',
            'occupation' => $aP['occupations'] ?? '', 'notes' => $aP['notes'] ?? '',
            'is_living' => ($aP['living_status'] ?? '') === 'deceased' ? 0 : 1];
    }

    /**
 * @brief Zpracuje osobu z importovaného výzkumného podkladu.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @param array $aP Vstupní parametr „p“ pro operaci person.
 * @return int Vypočtená číselná hodnota nebo identifikátor dle významu operace.
 */
    private function person(int $nTreeId, array $aP): int {
        $aFields = $this->personFields($aP) + ['photo_url' => ''];
        foreach ($aFields as $sKey => $sValue) {
            if ($sKey === 'is_living') continue;
            $nLimit = $sKey === 'photo_url' ? 1024 : ($sKey === 'notes' ? 60000 : 255);
            if (!is_string($sValue) || strlen($sValue) > $nLimit) throw new \InvalidArgumentException('Person field is too long: ' . $sKey);
        }
        return $this->insert('hc_familytree_people', $aFields + ['tree_id' => $nTreeId,
            'created_at' => time(), 'updated_at' => time()]);
    }

    /**
 * @brief Zpracuje genealogickou vazbu mezi osobami z importu.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @param array $aR Vstupní parametr „r“ pro operaci relation.
 * @param array $aPeople Seznam genealogických osob určených ke zpracování.
 * @return int Vypočtená číselná hodnota nebo identifikátor dle významu operace.
 */
    private function relation(int $nTreeId, array $aR, array $aPeople): int {
        $oFirst = $aPeople[$aR['person1_id']]; $oSecond = $aPeople[$aR['person2_id']];
        $sType = $aR['relationship_type'] === 'spouse' ? 'partner' : 'parent';
        foreach ($this->rows('hc_familytree_relations', ['tree_id' => $nTreeId, 'type' => $sType]) as $oOld) {
            if (((int)$oOld['person1_id'] === $oFirst && (int)$oOld['person2_id'] === $oSecond)
                || ($sType === 'partner' && (int)$oOld['person1_id'] === $oSecond && (int)$oOld['person2_id'] === $oFirst)) return (int)$oOld['id'];
        }
        return $this->insert('hc_familytree_relations', ['tree_id' => $nTreeId, 'person1_id' => $oFirst,
            'person2_id' => $oSecond, 'type' => $sType, 'start_date' => (string)($aR['start_date'] ?? ''),
            'end_date' => (string)($aR['end_date'] ?? ''), 'notes' => (string)($aR['notes'] ?? '')]);
    }

    /**
 * @brief Získá identifikátory rodičů vybraných pro danou osobu.
 * @param array $aRelations Vstupní parametr „relations“ pro operaci selectedParentIds.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
    private function selectedParentIds(array $aRelations): array {
        $oByChild = [];
        foreach ($aRelations as $aR) if ($aR['relationship_type'] === 'parent_child'
            && ($aR['verification_status'] ?? '') !== 'disproven'
            && empty($aR['absent_in_current_file'])) $oByChild[$aR['person2_id']][] = $aR;
        $oSelected = [];
        foreach ($oByChild as $oOptions) {
            usort($oOptions, static /**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param array $aA Vstupní hodnota $aA použitá v callbacku.
 * @param array $aB Vstupní hodnota $aB použitá v callbacku.
 * @return int Výsledek callbacku pro volající operaci.
 */
function (array $aA, array $aB): int {
                $oScore = static /**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param array $aR Vstupní hodnota $aR použitá v callbacku.
 * @return int Výsledek callbacku pro volající operaci.
 */
fn(array $aR): int => (str_starts_with((string)($aR['verification_status'] ?? ''), 'confirmed_primary') ? 1000 : 0)
                    + (($aR['verification_status'] ?? '') === 'proven' ? 1000 : 0)
                    + (($aR['verification_status'] ?? '') === 'challenged' ? -500 : 0)
                    + (str_contains((string)($aR['verification_status'] ?? ''), 'conflict') ? -1000 : 0);
                return ($oScore($aB) <=> $oScore($aA)) ?: strcmp($aA['relationship_id'], $aB['relationship_id']);
            });
            foreach (array_slice($oOptions, 0, 2) as $aR) $oSelected[$aR['relationship_id']] = true;
        }
        return $oSelected;
    }

    /**
 * @brief Vybere vztahy, které smějí být zahrnuty do aktuálního zobrazení.
 * @param array $aNativeRows Vstupní parametr „nativeRows“ pro operaci visibleRelations.
 * @param array $aResearchRows Vstupní parametr „researchRows“ pro operaci visibleRelations.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
    public function visibleRelations(array $aNativeRows, array $aResearchRows): array {
        $oByOrigin = [];
        foreach ($aResearchRows as $aRow) if ($aRow['entity_type'] === 'relationships') {
            $oByOrigin[$aRow['origin_key']][] = $aRow;
        }
        $oSuppressed = []; $oDisplayed = []; $oStatuses = [];
        foreach ($oByOrigin as $aRecords) {
            $aRelations = array_map(static /**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param array $aR Vstupní hodnota $aR použitá v callbacku.
 * @return array Výsledek callbacku pro volající operaci.
 */
fn(array $aR): array => $aR['data'], $aRecords);
            $oSelected = $this->selectedParentIds($aRelations);
            foreach ($aRecords as $aRow) {
                $nNativeId = (int)$aRow['native_id'];
                if (!$nNativeId) continue;
                $bActive = empty($aRow['data']['absent_in_current_file']) && ($aRow['data']['relationship_type'] === 'spouse'
                    || isset($oSelected[$aRow['external_id']]));
                if ($bActive) {
                    $oDisplayed[$nNativeId] = true;
                    $oStatuses[$nNativeId][] = $aRow['data']['verification_status'] ?? 'unverified';
                }
                else $oSuppressed[$nNativeId] = true;
            }
        }
        $bVisible = array_values(array_filter($aNativeRows,
            static /**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param array $aRow Vstupní hodnota $aRow použitá v callbacku.
 * @return bool Výsledek callbacku pro volající operaci.
 */
fn(array $aRow): bool => !isset($oSuppressed[(int)$aRow['id']]) || isset($oDisplayed[(int)$aRow['id']])));
        foreach ($bVisible as &$aRow) if (isset($oStatuses[(int)$aRow['id']])) {
            $aRow['research_status'] = count(array_filter($oStatuses[(int)$aRow['id']],
                static /**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param string $sStatus Vstupní hodnota $sStatus použitá v callbacku.
 * @return bool Výsledek callbacku pro volající operaci.
 */
fn(string $sStatus): bool => $sStatus !== 'challenged')) === 0 ? 'challenged' : 'other';
        }
        unset($aRow);
        return $bVisible;
    }

    /**
 * @brief Zpracuje genealogickou událost ze zdrojového importu.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @param array $aE Vstupní parametr „e“ pro operaci event.
 * @param int $nPersonId Identifikátor osoby.
 * @return int Vypočtená číselná hodnota nebo identifikátor dle významu operace.
 */
    private function event(int $nTreeId, array $aE, int $nPersonId): int {
        $sType = (string)($aE['event_type'] ?? 'other');
        $sTitle = match ($sType) {
            'birth', 'birt' => 'Birth', 'marriage', 'marr' => 'Svatba',
            'baptism', 'bapm', 'chr' => 'Baptism', 'death', 'deat' => 'Death',
            'occupation', 'occu' => 'Occupation', default => 'Event',
        };
        $oDescription = trim((string)($aE['description'] ?? '') . "\n" . (string)($aE['notes'] ?? ''));
        return $this->insert('hc_familytree_events', ['tree_id' => $nTreeId, 'person_id' => $nPersonId,
            'type' => substr($sType, 0, 64), 'title' => $sTitle,
            'event_date' => (string)($aE['date_value'] ?? ''), 'place' => (string)($aE['place'] ?? ''),
            'description' => $oDescription]);
    }

    /**
 * @brief Sestaví nebo normalizuje údaje importované genealogické události.
 * @param array $aE Vstupní parametr „e“ pro operaci eventFields.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
    private function eventFields(array $aE): array {
        $sType = (string)($aE['event_type'] ?? 'other');
        $sTitle = match ($sType) {
            'birth', 'birt' => 'Birth', 'marriage', 'marr' => 'Svatba',
            'baptism', 'bapm', 'chr' => 'Baptism', 'death', 'deat' => 'Death',
            'occupation', 'occu' => 'Occupation', default => 'Event',
        };
        return ['type' => substr($sType, 0, 64), 'title' => $sTitle,
            'event_date' => (string)($aE['date_value'] ?? ''), 'place' => (string)($aE['place'] ?? ''),
            'description' => trim((string)($aE['description'] ?? '') . "\n" . (string)($aE['notes'] ?? ''))];
    }

    /**
 * @brief Obnoví projekci badatelských údajů nad aktuálními záznamy.
 * @param string $sTable Název databázové tabulky.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @param int $nNativeId Identifikátor příslušného záznamu.
 * @param array $aBefore Původní stav záznamu, nebo null.
 * @param array $aAfter Nový stav záznamu, nebo null.
 * @param array $aWarnings Vstupní parametr „warnings“ pro operaci refreshProjection.
 * @param string $sLabel Vstupní parametr „label“ pro operaci refreshProjection.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
    private function refreshProjection(string $sTable, int $nTreeId, int $nNativeId, array $aBefore, array $aAfter,
        array &$aWarnings, string $sLabel): void {
        $aRow = $this->rows($sTable, ['id' => $nNativeId, 'tree_id' => $nTreeId])[0] ?? null;
        if (!$aRow) return;
        foreach ($aBefore as $sKey => $sValue) if ((string)($aRow[$sKey] ?? '') !== (string)$sValue) {
            $aWarnings[] = strtr('Manually adjusted {item} was preserved; its research record was updated.', ['{item}' => $sLabel]);
            return;
        }
        $aChanges = [];
        foreach ($aAfter as $sKey => $sValue) if ((string)$sValue !== (string)($aBefore[$sKey] ?? '')) $aChanges[$sKey] = $sValue;
        if ($aChanges) $this->update($sTable, $nNativeId, $aChanges + ($sTable === 'hc_familytree_people' ? ['updated_at' => time()] : []));
    }

    /**
 * @brief Importuje research import service používané v ResearchImportService.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @param string $sOwnerUid Identifikátor příslušného záznamu.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
    public function import(int $nTreeId, string $sOwnerUid): array {
        $oPackage = $this->package(); $sOrigin = $this->origin(); $sMode = $this->mode(); $aData = $oPackage['data'];
        $oApproved = (string)$this->oRequest->getParam('preview_sha256', '');
        if ($oApproved === '' || !hash_equals(hash('sha256', $oPackage['source']), $oApproved)) {
            throw new \InvalidArgumentException('File changed since preview. Run validation again.');
        }
        $aExisting = $this->existing($nTreeId, $sOrigin);
        $oPreview = $this->validate($aData, $oPackage['media'], $aExisting, $sMode, $nTreeId);
        try { $this->saveBackup($sOwnerUid, $nTreeId, $sOrigin, $oPackage['source'], $oPackage['filename']); }
        catch (\Throwable) { throw new \InvalidArgumentException('Original GEDCOM/GEDZIP cannot be archived in Files. Import was not started.'); }
        $aWarnings = $oPackage['warnings']; $oMediaStored = 0; $oMediaPaths = []; $aNewFiles = [];
        try {
            foreach ($aData['media'] as $aM) {
                $sContent = $oPackage['media'][$aM['file_name']] ?? null;
                if ($sContent === null) continue;
                $oOld = $aExisting['media'][$aM['media_id']] ?? null;
                if ($oOld && $oOld['media_path'] !== '' && json_decode((string)$oOld['payload_json'], true) === $aM) {
                    try {
                        $oSaved = $this->oRootFolder->getUserFolder($sOwnerUid)->get($oOld['media_path']);
                        if ($oSaved instanceof File && hash_equals($aM['sha256'], hash('sha256', (string)$oSaved->getContent()))) {
                            $oMediaPaths[$aM['media_id']] = $oOld['media_path']; continue;
                        }
                    } catch (NotFoundException) {}
                }
                $oBeforeFiles = count($aNewFiles);
                $sPath = $this->saveMedia($sOwnerUid, $nTreeId, $aM, $sContent, $aNewFiles);
                $oMediaPaths[$aM['media_id']] = $sPath;
                if (count($aNewFiles) > $oBeforeFiles) $oMediaStored++;
            }
        } catch (\Throwable $oError) {
            $this->removeStaged($sOwnerUid, $aNewFiles);
            throw new \InvalidArgumentException('Media cannot be saved safely: ' . $oError->getMessage());
        }
        $aPeople = []; $oCreated = array_fill_keys(array_keys(self::TYPES), 0);
        $oUpdated = array_fill_keys(array_keys(self::TYPES), 0);
        $oSelectedParents = $this->selectedParentIds($aData['relationships']);
        $oStarted = false;
        try {
            $this->oDb->beginTransaction(); $oStarted = true;
            foreach ($aData['persons'] as $aP) {
                $nId = $aP['person_id']; $oOld = $aExisting['persons'][$nId] ?? null;
                $oNative = (int)($oOld['native_id'] ?? 0);
                if ($oNative && !$this->rows('hc_familytree_people', ['id' => $oNative, 'tree_id' => $nTreeId])) $oNative = 0;
                if (!$oNative) {
                    $oNative = $this->person($nTreeId, $aP);
                    if ($oOld) $this->update(self::TABLE, (int)$oOld['id'], ['native_id' => $oNative]);
                    else { $this->record($nTreeId, $sOrigin, 'persons', $nId, $aP, $oNative); $oCreated['persons']++; }
                }
                if ($oOld && json_decode((string)$oOld['payload_json'], true) !== $aP) {
                    $aBefore = json_decode((string)$oOld['payload_json'], true);
                    $this->refreshProjection('hc_familytree_people', $nTreeId, $oNative,
                        $this->personFields($aBefore), $this->personFields($aP), $aWarnings, 'osoby ' . $nId);
                    $this->update(self::TABLE, (int)$oOld['id'], ['payload_json' => $this->encode($aP)]);
                    $oUpdated['persons']++;
                }
                $aPeople[$nId] = $oNative;
            }
            foreach ($aExisting['persons'] ?? [] as $nId => $oOld) {
                if (!isset($aPeople[$nId]) && !empty($oOld['native_id'])
                    && $this->rows('hc_familytree_people', ['id' => $oOld['native_id'], 'tree_id' => $nTreeId])) $aPeople[$nId] = (int)$oOld['native_id'];
            }
            foreach ($aData['relationships'] as $aR) {
                $nId = $aR['relationship_id'];
                $oOld = $aExisting['relationships'][$nId] ?? null;
                if ($oOld) {
                    $aBefore = json_decode((string)$oOld['payload_json'], true);
                    $oDesired = $aR['relationship_type'] === 'spouse' || isset($oSelectedParents[$nId]);
                    if ($oDesired && !$oOld['native_id']) {
                        $oNewNative = $this->relation($nTreeId, $aR, $aPeople);
                        $this->update(self::TABLE, (int)$oOld['id'], ['native_id' => $oNewNative]);
                    }
                    if ($oOld['native_id'] && ($aBefore['person1_id'] !== $aR['person1_id']
                        || $aBefore['person2_id'] !== $aR['person2_id']
                        || $aBefore['relationship_type'] !== $aR['relationship_type'])) {
                        throw new \InvalidArgumentException(strtr('Changing relationship members {id} requires manual review; no changes were imported.', ['{id}' => $nId]));
                    }
                    if ($aBefore !== $aR) {
                        $this->update(self::TABLE, (int)$oOld['id'], ['payload_json' => $this->encode($aR)]);
                        $oUpdated['relationships']++;
                    }
                    continue;
                }
                $oNative = $aR['relationship_type'] === 'parent_child' && !isset($oSelectedParents[$nId])
                    ? null : $this->relation($nTreeId, $aR, $aPeople);
                $this->record($nTreeId, $sOrigin, 'relationships', $nId, $aR, $oNative); $oCreated['relationships']++;
            }
            foreach ($aData['events'] as $aE) {
                $nId = $aE['event_id'];
                $oOld = $aExisting['events'][$nId] ?? null;
                if ($oOld) {
                    $aBefore = json_decode((string)$oOld['payload_json'], true);
                    if ($aBefore !== $aE) {
                        if ($oOld['native_id']) $this->refreshProjection('hc_familytree_events', $nTreeId,
                            (int)$oOld['native_id'], $this->eventFields($aBefore), $this->eventFields($aE), $aWarnings, 'event ' . $nId);
                        $this->update(self::TABLE, (int)$oOld['id'], ['payload_json' => $this->encode($aE)]);
                        $oUpdated['events']++;
                        if (str_contains((string)$aE['person_id'], '|')) $aWarnings[] = strtr('Shared event {item} also appears for another person; review it in the research records.', ['{item}' => $nId]);
                    }
                    continue;
                }
                $oNative = null;
                foreach (explode('|', (string)$aE['person_id']) as $oPerson) {
                    $nEventId = $this->event($nTreeId, $aE, $aPeople[$oPerson]);
                    $oNative ??= $nEventId;
                }
                $this->record($nTreeId, $sOrigin, 'events', $nId, $aE, $oNative); $oCreated['events']++;
            }
            foreach (['facts', 'sources', 'citations', 'media', 'places', 'research',
                'research_facts', 'notes', 'note_links', 'families'] as $sType) {
                foreach ($aData[$sType] as $aR) {
                    $nId = $aR[self::TYPES[$sType]];
                    $oOld = $aExisting[$sType][$nId] ?? null;
                    $sPath = $sType === 'media' ? ($oMediaPaths[$nId] ?? '') : '';
                    if ($oOld) {
                        $aFields = [];
                        if (json_decode((string)$oOld['payload_json'], true) !== $aR) {
                            $aFields['payload_json'] = $this->encode($aR); $oUpdated[$sType]++;
                        }
                        if ($sPath !== '' && $oOld['media_path'] !== $sPath) $aFields['media_path'] = $sPath;
                        if ($aFields) $this->update(self::TABLE, (int)$oOld['id'], $aFields);
                    } else {
                        $oNative = $this->record($nTreeId, $sOrigin, $sType, $nId, $aR, null);
                        if ($sPath !== '') $this->update(self::TABLE, $oNative, ['media_path' => $sPath]);
                        $oCreated[$sType]++;
                    }
                }
            }
            if ($sMode === 'update') foreach (self::TYPES as $sType => $sKey) {
                $oPresent = array_fill_keys(array_column($aData[$sType], $sKey), true);
                foreach ($aExisting[$sType] ?? [] as $nId => $oOld) if (!isset($oPresent[$nId])) {
                    $oPrevious = json_decode((string)$oOld['payload_json'], true);
                    if (empty($oPrevious['absent_in_current_file'])) {
                        $oPrevious['absent_in_current_file'] = true;
                        $this->update(self::TABLE, (int)$oOld['id'], ['payload_json' => $this->encode($oPrevious)]);
                    }
                }
            }
            $oHeader = array_diff_key($aData, self::TYPES);
            $oHeader['source_sha256'] = hash('sha256', $oPackage['source']);
            $oManifest = $aExisting['package']['manifest'] ?? null;
            if ($oManifest) $this->update(self::TABLE, (int)$oManifest['id'], ['payload_json' => $this->encode($oHeader)]);
            else $this->record($nTreeId, $sOrigin, 'package', 'manifest', $oHeader, null);
            $oTree = $this->rows('hc_familytree_trees', ['id' => $nTreeId])[0];
            $aFields = ['updated_at' => time()];
            if (empty($oTree['root_person_id'])) $aFields['root_person_id'] = reset($aPeople);
            $this->update('hc_familytree_trees', $nTreeId, $aFields);
            $oReport = ['created' => $oCreated, 'updated' => $oUpdated, 'unchanged' => $oPreview['unchanged'],
            'removed_retained' => $oPreview['removed'], 'counts' => $oPreview['counts'],
            'unknown_notes' => $oPreview['unknownNotes'], 'variants' => $oPreview['variants'],
            'missing_media' => $oPreview['missing'], 'mode' => $sMode,
            'warnings' => $aWarnings, 'origin' => $sOrigin, 'completed_at' => gmdate('c'),
            'tree_people' => count($this->rows('hc_familytree_people', ['tree_id' => $nTreeId])),
            'tree_relationships' => count($this->visibleRelations(
                $this->rows('hc_familytree_relations', ['tree_id' => $nTreeId]), $this->records($nTreeId))),
            'media_stored' => $oMediaStored,
            'backup_path' => 'Rodokmen/Import/' . $nTreeId . '/' . $sOrigin . '-' . hash('sha256', $oPackage['source']) . '.' . $oPackage['filename']];
            $oOldReport = $this->existing($nTreeId, $sOrigin)['import_report']['last'] ?? null;
            if ($oOldReport) $this->update(self::TABLE, (int)$oOldReport['id'], ['payload_json' => $this->encode($oReport)]);
            else $this->record($nTreeId, $sOrigin, 'import_report', 'last', $oReport, null);
            $this->oDb->commit();
        } catch (\Throwable $oError) {
            if ($oStarted) $this->oDb->rollBack();
            $this->removeStaged($sOwnerUid, $aNewFiles); throw $oError;
        }
        return $oReport;
    }

    /**
 * @brief Určí cílovou složku podkladů importu.
 * @param Folder $oParent Vstupní parametr „parent“ pro operaci folder.
 * @param string $sName Vstupní parametr „name“ pro operaci folder.
 * @return Folder Objekt složky ve správě souborů Nextcloudu.
 */
    private function folder(Folder $oParent, string $sName): Folder {
        try { $oNode = $oParent->get($sName); if ($oNode instanceof Folder) return $oNode; }
        catch (NotFoundException) { return $oParent->newFolder($sName); }
        throw new \RuntimeException('Import path is not a directory.');
    }

    /**
 * @brief Importuje folder používané v ResearchImportService.
 * @param string $sOwnerUid Identifikátor příslušného záznamu.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @return Folder Objekt složky ve správě souborů Nextcloudu.
 */
    private function importFolder(string $sOwnerUid, int $nTreeId): Folder {
        $oRoot = $this->oRootFolder->getUserFolder($sOwnerUid);
        return $this->folder($this->folder($this->folder($oRoot, 'Rodokmen'), 'Import'), (string)$nTreeId);
    }

    /**
 * @brief Uloží backup používané v ResearchImportService.
 * @param string $sOwnerUid Identifikátor příslušného záznamu.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @param string $sOrigin Vstupní parametr „origin“ pro operaci saveBackup.
 * @param string $sSource Vstupní parametr „source“ pro operaci saveBackup.
 * @param string $sExtension Vstupní parametr „extension“ pro operaci saveBackup.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
    private function saveBackup(string $sOwnerUid, int $nTreeId, string $sOrigin, string $sSource, string $sExtension): void {
        $oFolder = $this->importFolder($sOwnerUid, $nTreeId);
        $sName = $sOrigin . '-' . hash('sha256', $sSource) . '.' . $sExtension;
        if (!$oFolder->nodeExists($sName)) $oFolder->newFile($sName, $sSource);
    }

    /**
 * @brief Uloží media používané v ResearchImportService.
 * @param string $sOwnerUid Identifikátor příslušného záznamu.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @param array $aM Vstupní parametr „m“ pro operaci saveMedia.
 * @param string $sContent Vstupní parametr „content“ pro operaci saveMedia.
 * @param array $aNewFiles Vstupní parametr „newFiles“ pro operaci saveMedia.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
    private function saveMedia(string $sOwnerUid, int $nTreeId, array $aM, string $sContent, array &$aNewFiles): string {
        $oFolder = $this->folder($this->importFolder($sOwnerUid, $nTreeId), 'media');
        $sExtension = strtolower(pathinfo($aM['file_name'], PATHINFO_EXTENSION));
        if (!in_array($sExtension, ['jpg', 'jpeg', 'png', 'gif', 'webp'], true)) {
            throw new \InvalidArgumentException('Invalid image extension.');
        }
        $sName = substr(hash('sha256', $sContent), 0, 32) . '-' . basename($aM['file_name']);
        $sPath = 'Rodokmen/Import/' . $nTreeId . '/media/' . $sName;
        if ($oFolder->nodeExists($sName)) {
            if (hash('sha256', (string)$oFolder->get($sName)->getContent()) !== hash('sha256', $sContent)) {
                throw new \RuntimeException('A file with the same name already exists with different contents.');
            }
        } else {
            $oFolder->newFile($sName, $sContent);
            $aNewFiles[] = $sPath;
        }
        return $sPath;
    }

    /**
 * @brief Odebere staged používané v ResearchImportService.
 * @param string $sOwnerUid Identifikátor příslušného záznamu.
 * @param array $aPaths Vstupní parametr „paths“ pro operaci removeStaged.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
    private function removeStaged(string $sOwnerUid, array $aPaths): void {
        foreach ($aPaths as $sPath) try {
            $this->oRootFolder->getUserFolder($sOwnerUid)->get($sPath)->delete();
        } catch (\Throwable) { /* Retained outside the database and safe to retry. */ }
    }

    /**
 * @brief Shromáždí záznamy určené ke zpracování nebo promítnutí do databáze.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
    public function records(int $nTreeId): array {
        return array_map(static /**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param array $aRow Vstupní hodnota $aRow použitá v callbacku.
 * @return array Výsledek callbacku pro volající operaci.
 */
function (array $aRow): array {
            $aRow['data'] = json_decode((string)$aRow['payload_json'], true);
            unset($aRow['payload_json']);
            return $aRow;
        }, $this->rows(self::TABLE, ['tree_id' => $nTreeId]));
    }

    /**
 * @brief Připraví údaje připojeného média pro bezpečné zobrazení.
 * @param array $aRow Vstupní parametr „row“ pro operaci displayMedia.
 * @param string $sOwnerUid Identifikátor příslušného záznamu.
 * @return Response HTTP odpověď předaná klientovi.
 */
    public function displayMedia(array $aRow, string $sOwnerUid): Response {
        if ($aRow['entity_type'] !== 'media' || $aRow['media_path'] === '') return new JSONResponse(['error' => 'Image is missing.'], 404);
        try { $oNode = $this->oRootFolder->getUserFolder($sOwnerUid)->get($aRow['media_path']); }
        catch (NotFoundException) { return new JSONResponse(['error' => 'Image is missing.'], 404); }
        if (!$oNode instanceof File || $oNode->getSize() > 16 * 1024 * 1024) return new JSONResponse(['error' => 'Image is missing.'], 404);
        $sContent = (string)$oNode->getContent();
        $oMime = (new \finfo(FILEINFO_MIME_TYPE))->buffer($sContent);
        if (!in_array($oMime, self::IMAGES, true)) return new JSONResponse(['error' => 'Image is missing.'], 404);
        return new DataDisplayResponse($sContent, 200, ['Content-Type' => $oMime,
            'X-Content-Type-Options' => 'nosniff', 'Cache-Control' => 'private, no-store']);
    }
}
