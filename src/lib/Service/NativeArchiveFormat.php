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

/** Portable, explicit, versioned representation of all FamilyTree database rows. */
final class NativeArchiveFormat {
    public const ID = 'hc-familytree-native-backup';
    public const VERSION = 2;
    public const TABLES = [
        'hc_familytree_trees', 'hc_familytree_people', 'hc_familytree_relations',
        'hc_familytree_events', 'hc_familytree_documents', 'hc_familytree_doc_links',
        'hc_familytree_shares', 'hc_familytree_research',
        'hc_familytree_history', 'hc_familytree_research_tasks', 'hc_familytree_search_log',
        'hc_familytree_evidence', 'hc_familytree_proposals',
    ];
    public const MAX_ROWS = 300000;
    public const MAX_DATA_BYTES = 40 * 1024 * 1024;
    public const MAX_FILE_BYTES = 48 * 1024 * 1024;
    public const MAX_TOTAL_BYTES = 256 * 1024 * 1024;
    // ZIP contains attachments PLUS data.json and ZIP metadata. Never reject our own valid export.
    public const MAX_ARCHIVE_BYTES = self::MAX_TOTAL_BYTES + self::MAX_DATA_BYTES + 1024 * 1024;
    public const MAX_FILES = 3000;

    /**
 * @brief Ověří native archive format používané v NativeArchiveFormat.
 * @param array $aData Datová struktura přijímaná nebo vracená funkcí.
 * @param array $aManifest Vstupní parametr „manifest“ pro operaci validate.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
    public static function validate(array $aData, array $aManifest): void {
        if (($aManifest['format'] ?? null) !== self::ID || ($aManifest['formatVersion'] ?? null) !== self::VERSION
            || ($aManifest['appId'] ?? null) !== 'hc_familytree' || !isset($aManifest['files']) || !is_array($aManifest['files']) || !array_is_list($aManifest['files'])) {
            throw new \InvalidArgumentException('Unknown or unsupported FamilyTree backup format.');
        }
        $aTables = $aData['tables'] ?? null;
        if (!is_array($aTables) || array_keys($aTables) !== self::TABLES) {
            throw new \InvalidArgumentException('Incomplete FamilyTree database tables in archive.');
        }
        $aIds = []; $nTotal = 0;
        foreach (self::TABLES as $sTable) {
            $aRows = $aTables[$sTable];
            if (!is_array($aRows) || !array_is_list($aRows)) throw new \InvalidArgumentException('Invalid table: ' . $sTable);
            $nTotal += count($aRows);
            if ($nTotal > self::MAX_ROWS) throw new \InvalidArgumentException('Backup contains too many records.');
            foreach ($aRows as $oRow) {
                $nId = $oRow['id'] ?? null;
                if (!is_array($oRow) || !self::validId($nId) || isset($aIds[$sTable][(string)$nId])) {
                    throw new \InvalidArgumentException('Invalid or duplicate ID in ' . $sTable);
                }
                foreach ($oRow as $sKey => $sValue) {
                    if (!is_string($sKey) || !preg_match('/^[a-z][a-z0-9_]{0,63}$/D', $sKey) || !(is_scalar($sValue) || $sValue === null)) {
                        throw new \InvalidArgumentException('Invalid database value in ' . $sTable);
                    }
                }
                $aIds[$sTable][(string)$nId] = true;
            }
        }
        if (!$aTables['hc_familytree_trees']) throw new \InvalidArgumentException('Backup contains no family trees.');
        $oTreeIds = $aIds['hc_familytree_trees'];
        foreach (array_slice(self::TABLES, 1) as $sTable) foreach ($aTables[$sTable] as $oRow) {
            if (!self::validId($oRow['tree_id'] ?? null) || !isset($oTreeIds[(string)$oRow['tree_id']])) {
                throw new \InvalidArgumentException('Orphaned record: ' . $sTable);
            }
        }
        $oOwnerTree = [];
        foreach (array_slice(self::TABLES, 1) as $sTable) foreach ($aTables[$sTable] as $oRow) $oOwnerTree[$sTable][(string)$oRow['id']] = (string)$oRow['tree_id'];
        $oSameTree = static /**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param string $sTable Vstupní hodnota $sTable použitá v callbacku.
 * @param mixed $sTargetId Vstupní hodnota $sTargetId použitá v callbacku.
 * @param mixed $nTreeId Vstupní hodnota $nTreeId použitá v callbacku.
 * @return mixed Výsledek callbacku pro volající operaci.
 */
function (string $sTable, mixed $sTargetId, mixed $nTreeId) use ($oOwnerTree): bool {
            return isset($oOwnerTree[$sTable][(string)$sTargetId]) && $oOwnerTree[$sTable][(string)$sTargetId] === (string)$nTreeId;
        };
        $aPeople = $aIds['hc_familytree_people'] ?? [];
        $aEvents = $aIds['hc_familytree_events'] ?? [];
        $aRelations = $aIds['hc_familytree_relations'] ?? [];
        $aDocuments = $aIds['hc_familytree_documents'] ?? [];
        foreach ($aTables['hc_familytree_trees'] as $oRow) {
            if (!self::nullableRef($oRow['root_person_id'] ?? null, $aPeople) || (!empty($oRow['root_person_id']) && !$oSameTree('hc_familytree_people', $oRow['root_person_id'], $oRow['id']))) throw new \InvalidArgumentException('Root person in backup does not exist.');
        }
        foreach ($aTables['hc_familytree_relations'] as $oRow) {
            if (!self::nullableRef($oRow['person1_id'] ?? null, $aPeople, false) || !self::nullableRef($oRow['person2_id'] ?? null, $aPeople, false) || !$oSameTree('hc_familytree_people', $oRow['person1_id'], $oRow['tree_id']) || !$oSameTree('hc_familytree_people', $oRow['person2_id'], $oRow['tree_id'])) throw new \InvalidArgumentException('Relationship references an unknown person.');
        }
        foreach ($aTables['hc_familytree_events'] as $oRow) {
            if (!self::nullableRef($oRow['person_id'] ?? null, $aPeople, false) || !$oSameTree('hc_familytree_people', $oRow['person_id'], $oRow['tree_id'])) throw new \InvalidArgumentException('Event references an unknown person.');
        }
        foreach ($aTables['hc_familytree_documents'] as $oRow) {
            if (!self::nullableRef($oRow['person_id'] ?? null, $aPeople) || (!empty($oRow['person_id']) && !$oSameTree('hc_familytree_people', $oRow['person_id'], $oRow['tree_id']))) throw new \InvalidArgumentException('Document references an unknown person.');
        }
        foreach ($aTables['hc_familytree_doc_links'] as $oRow) {
            $sType = $oRow['link_type'] ?? '';
            $oTargets = ['person' => $aPeople, 'event' => $aEvents, 'relation' => $aRelations];
            if (!self::nullableRef($oRow['document_id'] ?? null, $aDocuments, false) || !isset($oTargets[$sType])
                || !self::nullableRef($oRow['target_id'] ?? null, $oTargets[$sType], false) || !$oSameTree('hc_familytree_documents', $oRow['document_id'], $oRow['tree_id']) || !$oSameTree(['person'=>'hc_familytree_people','event'=>'hc_familytree_events','relation'=>'hc_familytree_relations'][$sType], $oRow['target_id'], $oRow['tree_id'])) throw new \InvalidArgumentException('Invalid document link.');
        }
        foreach ($aTables['hc_familytree_research'] as $oRow) {
            if (!isset($oRow['payload_json']) || !is_string($oRow['payload_json']) || !is_array(json_decode($oRow['payload_json'], true))) {
                throw new \InvalidArgumentException('Corrupted research JSON in backup.');
            }
            $oKind = (string)($oRow['entity_type'] ?? '');
            $oTarget = match ($oKind) { 'persons' => $aPeople, 'relationships' => $aRelations, 'events' => $aEvents, default => [] };
            if ($oTarget && (!self::nullableRef($oRow['native_id'] ?? null, $oTarget) || (!empty($oRow['native_id']) && !$oSameTree(['persons'=>'hc_familytree_people','relationships'=>'hc_familytree_relations','events'=>'hc_familytree_events'][$oKind], $oRow['native_id'], $oRow['tree_id'])))) throw new \InvalidArgumentException('Research record has invalid projection.');
        }
        // v2 preserves every diary table. No v1 compatibility: only backups of the new schema are accepted.
        foreach (array_slice(self::TABLES,0,8) as $sTable) foreach ($aTables[$sTable] as $oRow) {
            if (empty($oRow['stable_id']) || !preg_match('/^[a-f0-9]{32}$/D',(string)$oRow['stable_id'])) {
                throw new \InvalidArgumentException('Stable identifier is missing. Run the one-time migration first: '.$sTable);
            }
        }
        foreach ($aTables['hc_familytree_research_tasks'] as $oRow) {
            if (!is_array(json_decode((string)($oRow['person_refs_json']??''),true))) throw new \InvalidArgumentException('Corrupted research task references.');
        }
        foreach ($aTables['hc_familytree_evidence'] as $oRow) {
            if (!is_array(json_decode((string)($oRow['metadata_json']??''),true))) throw new \InvalidArgumentException('Corrupted evidence metadata.');
        }
        foreach ($aTables['hc_familytree_proposals'] as $oRow) {
            if (!is_array(json_decode((string)($oRow['changes_json']??''),true))) throw new \InvalidArgumentException('Corrupted change proposal.');
        }
        // No ambiguous stable ID may be silently remapped during restoration.
        $oSeenStable=[];
        foreach (self::TABLES as $sTable) {
            if ($sTable==='hc_familytree_history') continue; // history entries reference existing entity IDs.
            foreach ($aTables[$sTable] as $oRow) {
                if (empty($oRow['stable_id']) || !preg_match('/^[a-f0-9]{32}$/D',(string)$oRow['stable_id']))
                    throw new \InvalidArgumentException('Record v2 has no valid stable ID: '.$sTable);
                $sTreeKey=(string)($oRow['tree_id']??$oRow['id']);
                if (isset($oSeenStable[$sTreeKey][(string)$oRow['stable_id']]))
                    throw new \InvalidArgumentException('Duplicate stable ID across tables.');
                $oSeenStable[$sTreeKey][(string)$oRow['stable_id']]=true;
            }
        }
        // Each diary reference must remain within its own tree. Stable IDs are portable across SQL migrations.
        $oTaskRefs=[];$oEvidenceRefs=[];$oPersonRefs=[];
        foreach ($aTables['hc_familytree_research_tasks'] as $oRow) {
            if (isset($oTaskRefs[(string)$oRow['tree_id']][(string)$oRow['stable_id']])) throw new \InvalidArgumentException('Duplicate research task.');
            $oTaskRefs[(string)$oRow['tree_id']][(string)$oRow['stable_id']]=true;
        }
        foreach ($aTables['hc_familytree_evidence'] as $oRow) $oEvidenceRefs[(string)$oRow['tree_id']][(string)$oRow['stable_id']]=true;
        foreach ($aTables['hc_familytree_people'] as $oRow) $oPersonRefs[(string)$oRow['tree_id']][(string)$oRow['stable_id']]=true;
        foreach (['hc_familytree_search_log','hc_familytree_evidence'] as $sTable)foreach($aTables[$sTable] as $oRow) {
            $oRef=(string)($oRow['task_uid']??'');
            if ($oRef!==''&&!isset($oTaskRefs[(string)$oRow['tree_id']][$oRef]))throw new \InvalidArgumentException('Research record references a task in another tree.');
        }
        foreach ($aTables['hc_familytree_proposals'] as $oRow) {
            $oTid=(string)$oRow['tree_id'];
            if (($oRow['target_type']??'')!=='person'||!isset($oPersonRefs[$oTid][(string)($oRow['target_uid']??'')]))throw new \InvalidArgumentException('Proposal references an unknown person.');
            if (!empty($oRow['evidence_uid'])&&!isset($oEvidenceRefs[$oTid][(string)$oRow['evidence_uid']]))throw new \InvalidArgumentException('Proposal references evidence from another family tree.');
        }
        if (count($aManifest['files']) > self::MAX_FILES) throw new \InvalidArgumentException('Too many files in backup.');
        $oSeen = []; $oPaths = []; $oBytes = 0;
        foreach ($aManifest['files'] as $oFile) {
            if (!is_array($oFile) || !isset($oFile['zipPath'],$oFile['sourcePath'],$oFile['treeId'],$oFile['size'],$oFile['sha256'])
                || !is_string($oFile['zipPath']) || !preg_match('~^files/[a-f0-9]{64}$~D', $oFile['zipPath'])
                || !is_string($oFile['sourcePath']) || !self::safePath($oFile['sourcePath'])
                || !self::validId($oFile['treeId']) || !isset($oTreeIds[(string)$oFile['treeId']])
                || !is_int($oFile['size']) || $oFile['size'] < 0 || $oFile['size'] > self::MAX_FILE_BYTES
                || !is_string($oFile['sha256']) || !preg_match('/^[a-f0-9]{64}$/D', $oFile['sha256'])
                || isset($oSeen[$oFile['zipPath']]) || isset($oPaths[$oFile['treeId']][$oFile['sourcePath']])) {
                throw new \InvalidArgumentException('Invalid or duplicate files in backup.');
            }
            $oSeen[$oFile['zipPath']] = true;
            $oPaths[$oFile['treeId']][$oFile['sourcePath']] = true;
            $oBytes += $oFile['size'];
            if ($oBytes > self::MAX_TOTAL_BYTES) throw new \InvalidArgumentException('Archive contents exceed the size limit.');
        }
        foreach ($aTables['hc_familytree_documents'] as $oDoc) {
            $oP = trim((string)($oDoc['file_path'] ?? ''));
            if ($oP !== '' && !filter_var($oP, FILTER_VALIDATE_URL) && !isset($oPaths[$oDoc['tree_id']][ltrim($oP,'/')])) {
                throw new \InvalidArgumentException('The document file is missing from the backup: ' . $oP);
            }
        }
        foreach ($aTables['hc_familytree_research'] as $oR) {
            if (($oR['media_path'] ?? '') !== '' && !isset($oPaths[$oR['tree_id']][ltrim((string)$oR['media_path'],'/')])) {
                throw new \InvalidArgumentException('Research media is missing from backup.');
            }
        }
    }

    /**
 * @brief Ověří identifikátor záznamu vůči povolenému formátu nativní zálohy.
 * @param mixed $nId Identifikátor cílového záznamu.
 * @return bool True při splnění podmínky, jinak false.
 */
    public static function validId(mixed $nId): bool {
        return (is_int($nId) || (is_string($nId) && ctype_digit($nId))) && (int)$nId > 0 && (string)(int)$nId === (string)$nId;
    }
    /**
 * @brief Zkontroluje volitelný odkaz na jiný záznam a připustí prázdnou hodnotu.
 * @param mixed $nId Identifikátor cílového záznamu.
 * @param array $aIds Vstupní parametr „ids“ pro operaci nullableRef.
 * @param bool $bNullable Vstupní parametr „nullable“ pro operaci nullableRef.
 * @return bool True při splnění podmínky, jinak false.
 */
    private static function nullableRef(mixed $nId, array $aIds, bool $bNullable = true): bool {
        return $bNullable && ($nId === null || $nId === '' || $nId === 0 || $nId === '0') || self::validId($nId) && isset($aIds[(string)$nId]);
    }
    /**
 * @brief Ověří, že cesta v archivu neumožňuje traversal ani nepovolený zápis.
 * @param string $sPath Vstupní parametr „path“ pro operaci safePath.
 * @return bool True při splnění podmínky, jinak false.
 */
    public static function safePath(string $sPath): bool {
        if ($sPath === '' || strlen($sPath) > 1024 || str_starts_with($sPath, '/') || str_contains($sPath, chr(92)) || preg_match('/[\x00-\x1f\x7f]/', $sPath)) return false;
        foreach (explode('/', $sPath) as $oPart) if ($oPart === '' || $oPart === '.' || $oPart === '..') return false;
        return true;
    }
}
