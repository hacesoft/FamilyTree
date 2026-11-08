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

use OCP\Files\File;
use OCP\Files\Folder;
use OCP\Files\IRootFolder;
use OCP\IDBConnection;
use OCP\App\IAppManager;
use OCP\IGroupManager;
use OCP\IRequest;
use OCP\IUserManager;

/** Exact FamilyTree database rows + owner-accessible Files. No writes during export. */
final class NativeArchiveService {
    /**
 * @brief Inicializuje instanci a propojí předané závislosti.
 * @param IDBConnection $oDb Databázové připojení.
 * @param IRootFolder $oRootFolder Kořenový adresář souborů Nextcloudu.
 * @param IRequest $oRequest Objekt HTTP požadavku.
 * @param IUserManager $oUsers Správce uživatelských účtů Nextcloudu.
 * @param IGroupManager $oGroups Správce uživatelských skupin Nextcloudu.
 * @param IAppManager $oAppManager Vstupní parametr „appManager“ pro operaci __construct.
 * @return void Konstruktor nevrací návratovou hodnotu.
 */
public function __construct(private IDBConnection $oDb, private IRootFolder $oRootFolder,
        private IRequest $oRequest, private IUserManager $oUsers, private IGroupManager $oGroups,
        private IAppManager $oAppManager) {}

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
 * @brief Vloží native archive service používané v NativeArchiveService.
 * @param string $sTable Název databázové tabulky.
 * @param array $aData Zpracovávaná data.
 * @return int Vypočtená číselná hodnota nebo identifikátor dle významu operace.
 */
    private function insert(string $sTable, array $aData): int {
        $oQ = $this->oDb->getQueryBuilder()->insert($sTable);
        foreach ($aData as $sKey => $sValue) $oQ->setValue($sKey, $oQ->createNamedParameter($sValue));
        $oQ->executeStatement();
        return (int)$this->oDb->lastInsertId($sTable);
    }
    /**
 * @brief Aktualizuje native archive service používané v NativeArchiveService.
 * @param int $nId Identifikátor cílového záznamu.
 * @param string $sTable Název databázové tabulky.
 * @param array $aData Zpracovávaná data.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
    private function update(int $nId, string $sTable, array $aData): void {
        if (!$aData) return;
        $oQ = $this->oDb->getQueryBuilder()->update($sTable);
        foreach ($aData as $sKey => $sValue) $oQ->set($sKey, $oQ->createNamedParameter($sValue));
        $oQ->where($oQ->expr()->eq('id', $oQ->createNamedParameter($nId)))->executeStatement();
    }
    /**
 * @brief Ukončí zpracování neplatného archivu s vysvětlující výjimkou.
 * @param string $sMessage Vstupní parametr „message“ pro operaci fail.
 * @return never Nevrací se; provede ukončení řídicího toku.
 */
    private static function fail(string $sMessage): never { throw new \InvalidArgumentException($sMessage); }
    /**
 * @brief Ověří bezpečnost relativní cesty a odmítne nebezpečné souborové cesty.
 * @param string $sValue Vstupní hodnota pro převod, ověření či formátování.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
    private static function safeRelative(string $sValue): string {
        $oResult = ltrim(trim($sValue), '/');
        if (!NativeArchiveFormat::safePath($oResult)) self::fail('Unsafe or invalid file path: ' . $sValue);
        return $oResult;
    }

    /**
 * @brief Exportuje native archive service používané v NativeArchiveService.
 * @param string $sUid Vstupní parametr „uid“ pro operaci export.
 * @param ?int $nSelectedTreeId Vstupní parametr „selectedTreeId“ pro operaci export.
 * @return array filename:string, trees:int, files:int}
 */
    public function export(string $sUid, ?int $nSelectedTreeId): array {
        $aTrees = $this->rows('hc_familytree_trees', ['owner_uid' => $sUid]);
        if ($nSelectedTreeId !== null) $aTrees = array_values(array_filter($aTrees, static /**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param mixed $oTree Vstupní hodnota $oTree použitá v callbacku.
 * @return mixed Výsledek callbacku pro volající operaci.
 */
fn($oTree) => (int)$oTree['id'] === $nSelectedTreeId));
        if (!$aTrees) self::fail('You have no owned family trees to back up.');
        $aTables = array_fill_keys(NativeArchiveFormat::TABLES, []);
        $aTables['hc_familytree_trees'] = $aTrees;
        $oRoot = $this->oRootFolder->getUserFolder($sUid);
        $aFiles = []; $oTotalBytes = 0;
        foreach ($aTrees as $oTree) {
            $nTreeId = (int)$oTree['id'];
            foreach (array_slice(NativeArchiveFormat::TABLES, 1) as $sTable) {
                foreach ($this->rows($sTable, ['tree_id' => $nTreeId]) as $oRow) $aTables[$sTable][] = $oRow;
            }
        }
        $oStagedPaths = [];
        $sAddPath = static /**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param int $nTreeId Vstupní hodnota $nTreeId použitá v callbacku.
 * @param string $sPath Vstupní hodnota $sPath použitá v callbacku.
 * @return mixed Výsledek callbacku pro volající operaci.
 */
function (int $nTreeId, string $sPath) use (&$oStagedPaths): void {
            $oRel = self::safeRelative($sPath);
            $oStagedPaths[$nTreeId][$oRel] = $oRel;
        };
        foreach ($aTables['hc_familytree_documents'] as $oDocument) {
            $sPath = (string)($oDocument['file_path'] ?? '');
            if ($sPath !== '' && !filter_var($sPath, FILTER_VALIDATE_URL)) $sAddPath((int)$oDocument['tree_id'], $sPath);
        }
        foreach ($aTables['hc_familytree_research'] as $aResearch) {
            if (($aResearch['media_path'] ?? '') !== '') $sAddPath((int)$aResearch['tree_id'], (string)$aResearch['media_path']);
        }
        foreach ($aTables['hc_familytree_people'] as $oPerson) {
            $oPhoto = (string)($oPerson['photo_url'] ?? '');
            // URLs are preserved as references, never fetched from third-party hosts.
            if ($oPhoto !== '' && (str_starts_with($oPhoto, 'Rodokmen/') || str_starts_with($oPhoto, '/Rodokmen/'))) {
                $sAddPath((int)$oPerson['tree_id'], $oPhoto);
            }
        }
        foreach ($aTrees as $oTree) {
            $nTreeId = (int)$oTree['id'];
            $oBase = 'Rodokmen/Import/' . $nTreeId;
            try { $oFolder = $oRoot->get($oBase); }
            catch (\OCP\Files\NotFoundException) { $oFolder = null; }
            if ($oFolder instanceof Folder) $this->scanFolder($oFolder, $oBase, $nTreeId, $oStagedPaths);
        }
        $oTmp = tempnam(sys_get_temp_dir(), 'hc_ft_');
        if ($oTmp === false) throw new \RuntimeException('Cannot create a temporary archive.');
        $oZip = new \ZipArchive();
        if ($oZip->open($oTmp, \ZipArchive::OVERWRITE | \ZipArchive::CREATE) !== true) {
            @unlink($oTmp); throw new \RuntimeException('ZIP nelze sestavit.');
        }
        $oZipOpen = true;
        try {
            foreach ($oStagedPaths as $nTreeId => $aPaths) foreach ($aPaths as $sPath) {
                if (count($aFiles) >= NativeArchiveFormat::MAX_FILES) self::fail('Too many attachments; backup was not created.');
                try { $oNode = $oRoot->get($sPath); }
                catch (\Throwable) { self::fail('Cannot read file for complete backup: ' . $sPath); }
                if (!$oNode instanceof File || $oNode->getSize() > NativeArchiveFormat::MAX_FILE_BYTES)
                    self::fail('File is missing or too large: ' . $sPath);
                $oContents = (string)$oNode->getContent();
                $nSize = strlen($oContents); $oTotalBytes += $nSize;
                if ($nSize > NativeArchiveFormat::MAX_FILE_BYTES) self::fail('File exceeds the 48 MiB limit: ' . $sPath);
                if ($oTotalBytes > NativeArchiveFormat::MAX_TOTAL_BYTES) self::fail('Total attachments exceed the complete backup limit.');
                $sArchivePath = 'files/' . hash('sha256', $nTreeId . ':' . $sPath);
                if (!$oZip->addFromString($sArchivePath, $oContents)) throw new \RuntimeException('Cannot add file to ZIP.');
                $aFiles[] = ['treeId' => (int)$nTreeId, 'sourcePath' => $sPath, 'zipPath' => $sArchivePath,
                    'size' => $nSize, 'sha256' => hash('sha256', $oContents)];
            }
            $aData = ['tables' => $aTables];
            $sJson = json_encode($aData, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE | JSON_THROW_ON_ERROR);
            if (strlen($sJson) > NativeArchiveFormat::MAX_DATA_BYTES) self::fail('The database part of the backup is too large.');
            $oManifest = ['format' => NativeArchiveFormat::ID, 'formatVersion' => NativeArchiveFormat::VERSION,
                'appId' => 'hc_familytree', 'createdAt' => gmdate('c'), 'sourceVersion' => $this->oAppManager->getAppVersion('hc_familytree'),
                'treeCount' => count($aTrees), 'dataSha256' => hash('sha256', $sJson), 'files' => $aFiles,
                'info' => 'Complete FamilyTree records and owner-accessible local attachments; external URLs remain references.'];
            NativeArchiveFormat::validate($aData, $oManifest);
            $oZip->addFromString('data.json', $sJson);
            $oZip->addFromString('manifest.json', json_encode($oManifest, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR));
            if (!$oZip->close()) throw new \RuntimeException('Cannot finish ZIP.');
            $oZipOpen = false;
            $oBytes = file_get_contents($oTmp);
            if (!is_string($oBytes)) throw new \RuntimeException('Cannot read ZIP.');
            return ['archive' => $oBytes, 'filename' => 'hc-familytree-backup-' . gmdate('Ymd-His') . '.zip',
                'trees' => count($aTrees), 'files' => count($aFiles)];
        } finally {
            if ($oZipOpen) @$oZip->close();
            @unlink($oTmp);
        }
    }

    /**
 * @brief Projede složku příloh a přidá její bezpečné souborové cesty do zálohy.
 * @param Folder $oFolder Vstupní parametr „folder“ pro operaci scanFolder.
 * @param string $sRelative Vstupní parametr „relative“ pro operaci scanFolder.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @param array $aPaths Vstupní parametr „paths“ pro operaci scanFolder.
 * @param int $nDepth Vstupní parametr „depth“ pro operaci scanFolder.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
    private function scanFolder(Folder $oFolder, string $sRelative, int $nTreeId, array &$aPaths, int $nDepth = 0): void {
        if ($nDepth > 8) self::fail('Research attachment folder nesting is too deep.');
        foreach ($oFolder->getDirectoryListing() as $oNode) {
            $sPath = $sRelative . '/' . $oNode->getName();
            if ($oNode instanceof Folder) $this->scanFolder($oNode, $sPath, $nTreeId, $aPaths, $nDepth + 1);
            elseif ($oNode instanceof File) $aPaths[$nTreeId][self::safeRelative($sPath)] = self::safeRelative($sPath);
        }
    }

    /**
 * @brief Zpracuje archivovaný soubor a jeho cílové umístění při obnově zálohy.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
    private function archiveUpload(): array {
        $oUpload = $this->oRequest->getUploadedFile('backup');
        if (!is_array($oUpload) || ($oUpload['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK || !is_file((string)($oUpload['tmp_name'] ?? ''))) {
            self::fail('No valid FamilyTree archive was uploaded.');
        }
        if ((int)($oUpload['size'] ?? 0) > NativeArchiveFormat::MAX_ARCHIVE_BYTES) self::fail('Archive exceeds the size limit.');
        $oZip = new \ZipArchive();
        if ($oZip->open((string)$oUpload['tmp_name']) !== true) self::fail('Cannot read ZIP.');
        try {
            if ($oZip->numFiles > NativeArchiveFormat::MAX_FILES + 2) self::fail('Too many items in the archive.');
            // CZ: Chybne zvoleny GEDZIP odlisime od poskozene nativni zalohy.
            if ($oZip->locateName('gedcom.ged') !== false) self::fail('This ZIP contains GEDCOM (GEDZIP), not a complete FamilyTree backup. Choose Import GEDCOM 7 / GEDZIP.');
            $oKnown = []; $oUncompressed = 0;
            for ($nI=0; $nI<$oZip->numFiles; $nI++) {
                $oSt = $oZip->statIndex($nI);
                if (!$oSt) self::fail('Invalid ZIP entry.');
                $sName = $oSt['name'];
                if (!in_array($sName, ['manifest.json', 'data.json'], true) && !preg_match('~^files/[a-f0-9]{64}$~D', $sName)) self::fail('Disallowed file or path in the ZIP archive.');
                if (isset($oKnown[$sName]) || $oSt['size'] > NativeArchiveFormat::MAX_TOTAL_BYTES) self::fail('Duplicate or unsafe ZIP entry.');
                $oKnown[$sName] = $oSt['size']; $oUncompressed += $oSt['size'];
                if ($oUncompressed > NativeArchiveFormat::MAX_TOTAL_BYTES + NativeArchiveFormat::MAX_DATA_BYTES + 1048576) self::fail('Uncompressed content is too large.');
                if ($oZip->getExternalAttributesIndex($nI, $oOpsys, $oAttributes)
                    && (($oAttributes >> 16) & 0170000) === 0120000) self::fail('Symbolic links are not allowed in backups.');
            }
            if (!isset($oKnown['manifest.json'],$oKnown['data.json']) || $oKnown['data.json'] > NativeArchiveFormat::MAX_DATA_BYTES || $oKnown['manifest.json'] > 1048576) self::fail('Incomplete backup.');
            $oManifest = json_decode((string)$oZip->getFromName('manifest.json'), true, 64, JSON_THROW_ON_ERROR);
            $sRaw = (string)$oZip->getFromName('data.json');
            if (!is_array($oManifest) || !hash_equals((string)($oManifest['dataSha256'] ?? ''), hash('sha256', $sRaw))) self::fail('The database part of the backup is corrupted.');
            $aData = json_decode($sRaw, true, 64, JSON_THROW_ON_ERROR);
            if (!is_array($aData)) self::fail('Corrupted database data.');
            NativeArchiveFormat::validate($aData, $oManifest);
            if (count($oKnown) !== count($oManifest['files']) + 2) self::fail('ZIP contains unlisted files.');
            foreach ($oManifest['files'] as $oFile) {
                if (!isset($oKnown[$oFile['zipPath']]) || $oKnown[$oFile['zipPath']] !== $oFile['size']) self::fail('Attachment file is missing.');
                $oStream = $oZip->getStream($oFile['zipPath']);
                if (!is_resource($oStream)) self::fail('Cannot verify the attachment.');
                $oCtx = hash_init('sha256'); $oReceived = 0;
                while (!feof($oStream)) {
                    $oChunk = fread($oStream, 65536);
                    if ($oChunk === false) self::fail('Failed to read the attachment.');
                    $oReceived += strlen($oChunk);
                    if ($oReceived > $oFile['size']) self::fail('Attachment exceeds its declared size.');
                    hash_update($oCtx, $oChunk);
                }
                fclose($oStream);
                if ($oReceived !== $oFile['size'] || !hash_equals($oFile['sha256'], hash_final($oCtx))) self::fail('Attachment checksum does not match.');
            }
            return ['data' => $aData, 'manifest' => $oManifest, 'path' => (string)$oUpload['tmp_name']];
        } finally { $oZip->close(); }
    }

    /**
 * @brief Připraví náhled native archive service používané v NativeArchiveService.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
    public function preview(): array {
        $oArchive = $this->archiveUpload();
        $aTables = $oArchive['data']['tables'];
        return ['format' => NativeArchiveFormat::ID, 'trees' => count($aTables['hc_familytree_trees']),
            'people' => count($aTables['hc_familytree_people']), 'records' => array_sum(array_map('count', $aTables)),
            'files' => count($oArchive['manifest']['files']), 'shares' => count($aTables['hc_familytree_shares']),
            'sha256' => hash_file('sha256', $oArchive['path']),
            'note' => 'Restoring creates new family trees. Existing data will not be overwritten. Sharing is re-enabled only when explicitly requested.'];
    }

    /**
 * @brief Obnoví native archive service používané v NativeArchiveService.
 * @param string $sUid Vstupní parametr „uid“ pro operaci restore.
 * @param bool $bRestoreShares Vstupní parametr „restoreShares“ pro operaci restore.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
    public function restore(string $sUid, bool $bRestoreShares): array {
        $oArchive = $this->archiveUpload();
        $oApproved = (string)$this->oRequest->getParam('preview_sha256','');
        if (strlen($oApproved) !== 64 || !hash_equals(hash_file('sha256',$oArchive['path']), $oApproved)) self::fail('Backup has changed since preview. Verify it again.');
        $aTables = $oArchive['data']['tables'];
        $oMaps = []; $oRestored = []; $oFilesCreated = []; $oPathMaps = []; $oStableMaps=[];
        $oOwner = $this->oRootFolder->getUserFolder($sUid);
        $oZip = new \ZipArchive();
        if ($oZip->open($oArchive['path']) !== true) self::fail('Cannot reopen the archive.');
        $oTransaction = false;
        try {
            $this->oDb->beginTransaction(); $oTransaction = true;
            foreach ($aTables['hc_familytree_trees'] as $oRow) {
                $sOldId = (int)$oRow['id'];
                unset($oRow['id']);
                $oRow['owner_uid'] = $sUid;
                $oStableMaps[$sOldId][(string)$oRow['stable_id']]=ResearchJournalService::uid();
                $oRow['stable_id']=$oStableMaps[$sOldId][(string)$oRow['stable_id']];
                $oRootOld = $oRow['root_person_id'] ?? null;
                $oRow['root_person_id'] = null;
                $sNewId = $this->insert('hc_familytree_trees', $oRow);
                $oMaps['hc_familytree_trees'][$sOldId] = $sNewId;
                $oRestored[] = ['oldTreeId' => $sOldId, 'treeId' => $sNewId, 'root' => $oRootOld];
            }
            // Store all imported data files in a controlled namespace before committing DB rows.
            foreach ($oArchive['manifest']['files'] as $oFile) {
                $oSourceTree = (int)$oFile['treeId'];
                $oNewTree = $oMaps['hc_familytree_trees'][$oSourceTree];
                $oOriginal = $oFile['sourcePath'];
                $sPrefix = 'Rodokmen/Import/' . $oSourceTree . '/';
                if (str_starts_with($oOriginal,$sPrefix)) {
                    $oDest = 'Rodokmen/Import/' . $oNewTree . '/' . substr($oOriginal,strlen($sPrefix));
                } else {
                    $oDest = 'Rodokmen/Obnova/' . $oNewTree . '/' . hash('sha256',$oOriginal) . '-' . basename($oOriginal);
                }
                $sContent = $oZip->getFromName($oFile['zipPath']);
                if (!is_string($sContent) || !hash_equals($oFile['sha256'],hash('sha256',$sContent))) self::fail('The backup file was damaged during restore.');
                $this->newFile($oOwner,$oDest,$sContent);
                $oFilesCreated[] = $oDest;
                $oPathMaps[$oSourceTree][$oOriginal] = $oDest;
            }
            foreach (['hc_familytree_people','hc_familytree_relations','hc_familytree_events','hc_familytree_documents','hc_familytree_doc_links','hc_familytree_research','hc_familytree_shares'] as $sTable) {
                // Insert dependent entities only after their referenced parent records exist.
                if ($sTable === 'hc_familytree_relations' || $sTable === 'hc_familytree_events' || $sTable === 'hc_familytree_documents' || $sTable === 'hc_familytree_doc_links' || $sTable === 'hc_familytree_research') continue;
                if ($sTable === 'hc_familytree_shares' && !$bRestoreShares) continue;
                foreach ($aTables[$sTable] as $oRow) {
                    $oOld = (int)$oRow['id']; $oOldTree = (int)$oRow['tree_id'];
                    unset($oRow['id']); $oRow['tree_id'] = $oMaps['hc_familytree_trees'][$oOldTree];
                    $oOldStable=(string)$oRow['stable_id'];$oRow['stable_id']=ResearchJournalService::uid();
                    $oStableMaps[$oOldTree][$oOldStable]=$oRow['stable_id'];
                    if ($sTable === 'hc_familytree_shares') {
                        $sType = (string)$oRow['share_type']; $oWith = (string)$oRow['share_with'];
                        if (!(($sType==='user' && $this->oUsers->userExists($oWith)) || ($sType==='group' && $this->oGroups->groupExists($oWith)))) {
                            self::fail('Shared user or group no longer exists: ' . $oWith);
                        }
                    }
                    if ($sTable === 'hc_familytree_people') {
                        $oPhoto=(string)($oRow['photo_url']??'');
                        if ($oPhoto!=='' && isset($oPathMaps[$oOldTree][ltrim($oPhoto,'/')])) $oRow['photo_url']=$oPathMaps[$oOldTree][ltrim($oPhoto,'/')];
                    }
                    $oMaps[$sTable][$oOld] = $this->insert($sTable,$oRow);
                }
            }
            foreach (['hc_familytree_relations','hc_familytree_events','hc_familytree_documents','hc_familytree_doc_links','hc_familytree_research'] as $sTable) {
                foreach ($aTables[$sTable] as $oRow) {
                    $oOld = (int)$oRow['id']; $oOldTree=(int)$oRow['tree_id'];
                    unset($oRow['id']); $oRow['tree_id']=$oMaps['hc_familytree_trees'][$oOldTree];
                    $oOldStable=(string)$oRow['stable_id'];$oRow['stable_id']=ResearchJournalService::uid();
                    $oStableMaps[$oOldTree][$oOldStable]=$oRow['stable_id'];
                    if ($sTable==='hc_familytree_relations') {
                        $oRow['person1_id']=$oMaps['hc_familytree_people'][$oRow['person1_id']];
                        $oRow['person2_id']=$oMaps['hc_familytree_people'][$oRow['person2_id']];
                    } elseif ($sTable==='hc_familytree_events') {
                        $oRow['person_id']=$oMaps['hc_familytree_people'][$oRow['person_id']];
                    } elseif ($sTable==='hc_familytree_documents') {
                        if (!empty($oRow['person_id'])) $oRow['person_id']=$oMaps['hc_familytree_people'][$oRow['person_id']];
                        $sPath=(string)($oRow['file_path']??'');
                        if ($sPath!=='' && isset($oPathMaps[$oOldTree][ltrim($sPath,'/')])) $oRow['file_path']=$oPathMaps[$oOldTree][ltrim($sPath,'/')];
                    } elseif ($sTable==='hc_familytree_doc_links') {
                        $oRow['document_id']=$oMaps['hc_familytree_documents'][$oRow['document_id']];
                        $oTarget=['person'=>'hc_familytree_people','event'=>'hc_familytree_events','relation'=>'hc_familytree_relations'][$oRow['link_type']];
                        $oRow['target_id']=$oMaps[$oTarget][$oRow['target_id']];
                    } elseif ($sTable==='hc_familytree_research') {
                        $oKind=['persons'=>'hc_familytree_people','relationships'=>'hc_familytree_relations','events'=>'hc_familytree_events'][$oRow['entity_type']]??null;
                        if ($oKind && !empty($oRow['native_id'])) $oRow['native_id']=$oMaps[$oKind][$oRow['native_id']];
                        $sPath=(string)($oRow['media_path']??'');
                        if ($sPath!=='') $oRow['media_path']=$oPathMaps[$oOldTree][ltrim($sPath,'/')];
                    }
                    $oMaps[$sTable][$oOld]=$this->insert($sTable,$oRow);
                }
            }
            // Keep the research diary and historical snapshots in the same archive.
            // Rebind portable references when restoring as NEW trees on this server.
            foreach (['hc_familytree_research_tasks','hc_familytree_search_log','hc_familytree_evidence','hc_familytree_proposals','hc_familytree_history'] as $sTable) {
                foreach ($aTables[$sTable] as $oOriginal) {
                    $oRow=$oOriginal;$oOldTree=(int)$oRow['tree_id'];unset($oRow['id']);
                    $oRow['tree_id']=$oMaps['hc_familytree_trees'][$oOldTree];
                    if (isset($oRow['stable_id'])) {
                        $oOldStable=(string)$oRow['stable_id'];$oRow['stable_id']=ResearchJournalService::uid();
                        $oStableMaps[$oOldTree][$oOldStable]=$oRow['stable_id'];
                    }
                    // References to tasks/evidence/proposals are fixed in the second pass.
                    $oMaps[$sTable][(int)$oOriginal['id']]=$this->insert($sTable,$oRow);
                }
            }
            // Resolve cross-record stable references once all rows have been inserted.
            foreach (['hc_familytree_search_log'=>['task_uid'], 'hc_familytree_evidence'=>['task_uid'],
                      'hc_familytree_proposals'=>['target_uid','evidence_uid'], 'hc_familytree_history'=>['entity_uid']] as $sTable=>$aFields) {
                foreach ($aTables[$sTable] as $oOldRow) {
                    $oOldTree=(int)$oOldRow['tree_id'];$aChanges=[];
                    foreach ($aFields as $sField) {
                        $oRef=(string)($oOldRow[$sField]??'');
                        if ($oRef!==''&&isset($oStableMaps[$oOldTree][$oRef])) $aChanges[$sField]=$oStableMaps[$oOldTree][$oRef];
                    }
                    if ($aChanges)$this->update($oMaps[$sTable][(int)$oOldRow['id']],$sTable,$aChanges);
                }
            }
            foreach ($oRestored as $oTree) {
                if (!empty($oTree['root'])) $this->update($oTree['treeId'],'hc_familytree_trees',[
                    'root_person_id'=>$oMaps['hc_familytree_people'][$oTree['root']]]);
            }
            $this->oDb->commit(); $oTransaction=false;
            return ['ok'=>true,'trees'=>array_map(static /**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param mixed $oT Vstupní hodnota $oT použitá v callbacku.
 * @return mixed Výsledek callbacku pro volající operaci.
 */
fn($oT)=>['id'=>$oT['treeId']],$oRestored),
                'people'=>count($aTables['hc_familytree_people']), 'files'=>count($oFilesCreated),
                'sharesRestored'=>$bRestoreShares ? count($aTables['hc_familytree_shares']):0];
        } catch (\Throwable $oError) {
            if ($oTransaction) $this->oDb->rollBack();
            foreach (array_reverse($oFilesCreated) as $sPath) {
                try { $oOwner->get($sPath)->delete(); } catch (\Throwable) {}
            }
            throw $oError;
        } finally { $oZip->close(); }
    }

    /**
 * @brief Vytvoří nový soubor pro obnovenou přílohu v uživatelském úložišti.
 * @param Folder $oOwner Vstupní parametr „owner“ pro operaci newFile.
 * @param string $sRelative Vstupní parametr „relative“ pro operaci newFile.
 * @param string $sContent Vstupní parametr „content“ pro operaci newFile.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
    private function newFile(Folder $oOwner, string $sRelative, string $sContent): void {
        if (!NativeArchiveFormat::safePath($sRelative)) self::fail('Invalid destination path.');
        $aParts=explode('/',$sRelative);$sName=array_pop($aParts);$oParent=$oOwner;
        foreach ($aParts as $oPart) {
            if (!$oParent->nodeExists($oPart)) $oParent=$oParent->newFolder($oPart);
            else { $oParent=$oParent->get($oPart); if (!$oParent instanceof Folder) self::fail('Destination directory conflicts with an existing file.'); }
        }
        if ($oParent->nodeExists($sName)) self::fail('Restore would overwrite an existing file: ' . $sRelative);
        $oParent->newFile($sName,$sContent);
    }
}
