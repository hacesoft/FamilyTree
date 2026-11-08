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

/** Read GEDCOM 7 into the application's private evidence records. The uploaded GEDCOM is also retained verbatim. */
final class Gedcom7Package {
    private array $aNodes = [];
    private array $aRecords = [];
    private array $aData = [];
    private array $aMedia = [];
    private array $aWarnings = [];
    private array $aFiles = [];
    private bool $bGedzip = false;
    private array $aMediaPaths = [];
    private array $aCapturedNotes = [];

    /**
 * @brief Inicializuje instanci a propojí předané závislosti.
 * @return void Konstruktor nevrací návratovou hodnotu.
 */
public function __construct() {}

    /**
 * @brief Zkontroluje a rozebere vložený GEDCOM 7 či GEDZIP do interních struktur osob, událostí a médií.
 * @param string $sText Textový obsah.
 * @param array $aFiles Součásti importovaného archivu.
 * @param bool $bGedzip Příznak formátu GEDZIP.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
    public static function parse(string $sText, array $aFiles, bool $bGedzip): array {
        $oParser = new self();
        $oParser->aFiles = $aFiles;
        $oParser->bGedzip = $bGedzip;
        $oParser->read($sText);
        $oParser->convert();
        return ['data' => $oParser->aData, 'media' => $oParser->aMedia, 'warnings' => array_values(array_unique($oParser->aWarnings))];
    }

    /**
 * @brief Odvodí gedcom7package používané v Gedcom7Package.
 * @param string $sPrefix Rozlišovací předpona stabilního identifikátoru.
 * @param string $sValue Vstupní hodnota pro převod, ověření či formátování.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
    private static function id(string $sPrefix, string $sValue): string {
        return $sPrefix . substr(hash('sha256', $sValue), 0, 24);
    }

    /**
 * @brief Přečte řádky GEDCOM a vytvoří strom záznamů s ověřenými úrovněmi a značkami.
 * @param string $sText Textový obsah.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
    private function read(string $sText): void {
        if (strlen($sText) > 5 * 1024 * 1024 || !preg_match('//u', $sText)) {
            throw new \InvalidArgumentException('GEDCOM must use UTF-8 and be smaller than 5 MB.');
        }
        $sText = preg_replace('/^\xEF\xBB\xBF/', '', $sText);
        $oStack = []; $oTrailer = false;
        foreach (preg_split('/\r\n|\n|\r/', $sText) as $nNumber => $nLine) {
            if ($nLine === '' && $nNumber === 0) throw new \InvalidArgumentException('Empty GEDCOM header.');
            if ($nLine === '') continue;
            if (!preg_match('/^(\d+) (?:@([^@\s]+)@ )?([A-Za-z0-9_]+)(?: (.*))?$/Du', $nLine, $oM)) {
                throw new \InvalidArgumentException('Invalid GEDCOM line ' . ($nNumber + 1) . '.');
            }
            $nLevel = (int)$oM[1];
            if ($nLevel > 100 || ($nLevel && !isset($oStack[$nLevel - 1])) || $oTrailer) {
                throw new \InvalidArgumentException('Invalid GEDCOM level or ending at line ' . ($nNumber + 1) . '.');
            }
            $sId = $oM[2] ?? ''; $sTag = $oM[3];
            if ($nLevel && $sId !== '') throw new \InvalidArgumentException('Identifier on a nested GEDCOM line.');
            if ($nLevel === 0 && $sTag === 'TRLR') $oTrailer = true;
            $oParent = $nLevel ? $oStack[$nLevel - 1] : null;
            $nIndex = count($this->aNodes);
            $this->aNodes[] = ['tag' => $sTag, 'id' => $sId, 'value' => str_replace('@@', '@', $oM[4] ?? ''),
                'raw' => $nLine, 'children' => [], 'parent' => $oParent];
            if ($oParent !== null) $this->aNodes[$oParent]['children'][] = $nIndex;
            if ($nLevel === 0) {
                if ($sId !== '') {
                    if (isset($this->aRecords[$sId])) throw new \InvalidArgumentException('Duplicate GEDCOM identifier ' . $sId . '.');
                    $this->aRecords[$sId] = $nIndex;
                }
                $this->aData['_top'][] = $nIndex;
            }
            $oStack[$nLevel] = $nIndex;
            foreach (array_keys($oStack) as $oOld) if ($oOld > $nLevel) unset($oStack[$oOld]);
        }
        $oTop = $this->aData['_top'] ?? [];
        if (!$oTrailer || count($oTop) < 3 || $this->aNodes[$oTop[0]]['tag'] !== 'HEAD'
            || $this->aNodes[end($oTop)]['tag'] !== 'TRLR') {
            throw new \InvalidArgumentException('GEDCOM must begin with HEAD and end with TRLR.');
        }
        $oGedc = $this->one($oTop[0], 'GEDC');
        $oVersion = $oGedc !== null ? $this->one($oGedc, 'VERS') : null;
        if ($oVersion === null || !preg_match('/^7\.0(?:\.\d+)?$/D', $this->value($oVersion))) {
            throw new \InvalidArgumentException('Only FamilySearch GEDCOM 7.0 is supported.');
        }
        $oCharset = $this->field($oTop[0], 'CHAR');
        if ($oCharset !== '' && strtoupper($oCharset) !== 'UTF-8') {
            throw new \InvalidArgumentException('GEDCOM 7 must use UTF-8 encoding.');
        }
        foreach ($this->aNodes as $oNode) {
            $oExpected = ['FAMC' => 'FAM', 'FAMS' => 'FAM', 'HUSB' => 'INDI', 'WIFE' => 'INDI',
                'CHIL' => 'INDI', 'SNOTE' => 'SNOTE'][$oNode['tag']] ?? null;
            if ($oNode['tag'] === 'SOUR' && $oNode['parent'] !== null && $this->aNodes[$oNode['parent']]['tag'] !== 'HEAD') $oExpected = 'SOUR';
            if ($oNode['tag'] === 'OBJE' && $oNode['value'] !== '') $oExpected = 'OBJE';
            if ($oNode['tag'] === 'REPO' && $oNode['value'] !== '') $oExpected = 'REPO';
            if ($oExpected !== null && $oNode['parent'] !== null) $this->pointer($oNode['value'], $oExpected);
        }
    }

    /**
 * @brief Najde podřízené uzly GEDCOM podle požadovaného typu značky.
 * @param int $nIndex Index uzlu v interním stromu GEDCOM.
 * @param string $sTag Značka typu pole nebo události GEDCOM.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
    private function children(int $nIndex, string $sTag): array {
        return array_values(array_filter($this->aNodes[$nIndex]['children'], /**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param int $nI Vstupní hodnota $nI použitá v callbacku.
 * @return bool Výsledek callbacku pro volající operaci.
 */
fn(int $nI): bool => $this->aNodes[$nI]['tag'] === $sTag));
    }

    /**
 * @brief Vrátí první odpovídající podřízený uzel GEDCOM, pokud existuje.
 * @param int $nIndex Index uzlu v interním stromu GEDCOM.
 * @param string $sTag Značka typu pole nebo události GEDCOM.
 * @return ?int Výsledek typu ?int vrácený volajícímu.
 */
    private function one(int $nIndex, string $sTag): ?int { return $this->children($nIndex, $sTag)[0] ?? null; }
    /**
 * @brief Přečte textovou hodnotu vybraného uzlu GEDCOM.
 * @param ?int $nIndex Index uzlu v interním stromu GEDCOM.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
    private function value(?int $nIndex): string { return $nIndex === null ? '' : $this->aNodes[$nIndex]['value']; }
    /**
 * @brief Přečte hodnotu požadovaného pole v podstromu GEDCOM.
 * @param int $nIndex Index uzlu v interním stromu GEDCOM.
 * @param string $sTag Značka typu pole nebo události GEDCOM.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
    private function field(int $nIndex, string $sTag): string { return $this->value($this->one($nIndex, $sTag)); }

    /**
 * @brief Vyřeší referenci GEDCOM na konkrétní uzel a ověří její použitelnost.
 * @param string $sRaw Původní nezpracovaný řetězec ze zdroje.
 * @param string $sTag Značka typu pole nebo události GEDCOM.
 * @return int Vypočtená číselná hodnota nebo identifikátor dle významu operace.
 */
    private function pointer(string $sRaw, string $sTag): int {
        if (!preg_match('/^@([^@\s]+)@$/D', $sRaw, $oM)
            || !isset($this->aRecords[$oM[1]]) || $this->aNodes[$this->aRecords[$oM[1]]]['tag'] !== $sTag) {
            throw new \InvalidArgumentException('Invalid reference to ' . $sTag . ': ' . $sRaw);
        }
        return $this->aRecords[$oM[1]];
    }

    /**
 * @brief Sestaví textovou hodnotu a pokračovací řádky uzlu GEDCOM.
 * @param int $nIndex Index uzlu v interním stromu GEDCOM.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
    private function text(int $nIndex): string {
        $oResult = $this->value($nIndex);
        foreach ($this->aNodes[$nIndex]['children'] as $oChild) {
            if ($this->aNodes[$oChild]['tag'] === 'CONT') $oResult .= "\n" . $this->value($oChild);
            if ($this->aNodes[$oChild]['tag'] === 'CONC') $oResult .= $this->value($oChild);
        }
        return $oResult;
    }

    /**
 * @brief Zachová původní strukturu příslušného podstromu GEDCOM pro přenos.
 * @param int $nIndex Index uzlu v interním stromu GEDCOM.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
    private function rawSubtree(int $nIndex): string {
        $aLines = [$this->aNodes[$nIndex]['raw']];
        foreach ($this->aNodes[$nIndex]['children'] as $oChild) $aLines[] = $this->rawSubtree($oChild);
        return implode("\n", $aLines);
    }

    /**
 * @brief Vyhledá poznámky zadaného uzlu a přiřadí je záznamům importu.
 * @param int $nIndex Index uzlu v interním stromu GEDCOM.
 * @param string $sOwnerType Vstupní parametr „ownerType“ pro operaci captureNotes.
 * @param string $sOwnerId Vstupní parametr „ownerId“ pro operaci captureNotes.
 * @param string $sKey Vstupní parametr „key“ pro operaci captureNotes.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
    private function captureNotes(int $nIndex, string $sOwnerType, string $sOwnerId, string $sKey): void {
        foreach ($this->aNodes[$nIndex]['children'] as $nOrdinal => $oNote) {
            $sTag = $this->aNodes[$oNote]['tag'];
            if ($sTag !== 'NOTE' && $sTag !== 'SNOTE') continue;
            $this->aCapturedNotes[$oNote] = true;
            $oShared = $sTag === 'SNOTE' ? $this->pointer($this->value($oNote), 'SNOTE') : null;
            $oTarget = $oShared ?? $oNote;
            $sXref = $oShared === null ? '' : $this->aNodes[$oShared]['id'];
            $sId = self::id('N', $oShared === null ? $sKey . ':note:' . $nOrdinal : $this->recordKey($oShared));
            if ($oShared === null) $this->storeNote($oTarget, $sId, '');
            $this->aData['note_links'][] = ['note_link_id' => self::id('K', $sKey . ':link:' . $nOrdinal),
                'note_id' => $sId, 'owner_type' => $sOwnerType, 'owner_id' => $sOwnerId,
                'snote_xref' => $sXref];
        }
    }

    /**
 * @brief Uloží přečtenou GEDCOM poznámku do výsledných dat.
 * @param int $nIndex Index uzlu v interním stromu GEDCOM.
 * @param string $sId Identifikátor cílového záznamu.
 * @param string $sXref Vstupní parametr „xref“ pro operaci storeNote.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
    private function storeNote(int $nIndex, string $sId, string $sXref): void {
        $aSourceIds = [];
        foreach ($this->children($nIndex, 'SOUR') as $oSource) {
            $aSourceIds[] = $this->sourceId($this->pointer($this->value($oSource), 'SOUR'));
        }
        $this->aData['notes'][] = ['note_id' => $sId, 'xref' => $sXref,
            'full_text' => $this->text($nIndex), 'source_links' => $aSourceIds,
            'kind' => preg_match('/^NF_/', $sXref) ? 'research_facts' :
                (preg_match('/^NP_/', $sXref) ? 'place_catalog' :
                    (preg_match('/^NR_/', $sXref) ? 'research_task' : 'other')),
            'raw_subtree' => $this->rawSubtree($nIndex), 'uid' => $this->field($nIndex, 'UID')];
    }

    /**
 * @brief Sestaví obsah poznámek přiřazených k uzlu GEDCOM.
 * @param int $nIndex Index uzlu v interním stromu GEDCOM.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
    private function notes(int $nIndex): string {
        $aParts = [];
        foreach ($this->children($nIndex, 'NOTE') as $oNote) $aParts[] = $this->text($oNote);
        foreach ($this->children($nIndex, 'SNOTE') as $oNote) $aParts[] = $this->text($this->pointer($this->value($oNote), 'SNOTE'));
        return implode("\n", array_filter($aParts, static /**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param string $oV Vstupní hodnota $oV použitá v callbacku.
 * @return bool Výsledek callbacku pro volající operaci.
 */
fn(string $oV): bool => $oV !== ''));
    }

    /**
 * @brief Získá stabilní identifikační klíč z UID nebo původní identifikace záznamu.
 * @param int $nIndex Index uzlu v interním stromu GEDCOM.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
    private function recordKey(int $nIndex): string {
        return $this->field($nIndex, 'UID') ?: $this->aNodes[$nIndex]['id'];
    }

    /**
 * @brief Sestaví stabilní identifikátor importované osoby.
 * @param int $nIndex Index uzlu v interním stromu GEDCOM.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
    private function personId(int $nIndex): string { return self::id('P', $this->recordKey($nIndex)); }
    /**
 * @brief Sestaví stabilní identifikátor importovaného pramene.
 * @param int $nIndex Index uzlu v interním stromu GEDCOM.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
    private function sourceId(int $nIndex): string { return self::id('S', $this->recordKey($nIndex)); }

    /**
 * @brief Vyhledá pramen citovaný konkrétním uzlem GEDCOM.
 * @param int $nIndex Index uzlu v interním stromu GEDCOM.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
    private function sourceFor(int $nIndex): string {
        $oFirst = $this->one($nIndex, 'SOUR');
        if ($oFirst === null) return '';
        return $this->sourceId($this->pointer($this->value($oFirst), 'SOUR'));
    }

    /**
 * @brief Načte citace pramenů, jejich lokalizaci a přepis k navázané entitě.
 * @param int $nIndex Index uzlu v interním stromu GEDCOM.
 * @param string $sEntityType Vstupní parametr „entityType“ pro operaci citations.
 * @param string $sEntityId Identifikátor příslušného záznamu.
 * @param string $sKey Vstupní parametr „key“ pro operaci citations.
 * @param string $sLocatorFallback Vstupní parametr „locatorFallback“ pro operaci citations.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
    private function citations(int $nIndex, string $sEntityType, string $sEntityId, string $sKey, string $sLocatorFallback = ''): void {
        foreach ($this->children($nIndex, 'SOUR') as $nOrdinal => $oCitation) {
            $oSource = $this->pointer($this->value($oCitation), 'SOUR');
            $sCitationId = self::id('C', $sKey . ':citation:' . $nOrdinal);
            $aData = $this->one($oCitation, 'DATA');
            $oTranscription = $aData === null ? '' : implode("\n", array_map(/**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param int $nI Vstupní hodnota $nI použitá v callbacku.
 * @return string Výsledek callbacku pro volající operaci.
 */
fn(int $nI): string => $this->text($nI), $this->children($aData, 'TEXT')));
            $this->aData['citations'][] = ['citation_id' => $sCitationId, 'source_id' => $this->sourceId($oSource),
                'linked_entity_type' => $sEntityType, 'linked_entity_id' => $sEntityId,
                'locator' => $this->field($oCitation, 'PAGE') ?: $sLocatorFallback, 'transcription' => $oTranscription,
                'transcription_status' => '', 'quay' => $this->field($oCitation, 'QUAY'),
                'notes' => $this->notes($oCitation)];
            $this->captureNotes($oCitation, 'citation', $sCitationId, $sKey . ':citation:' . $nOrdinal);
            $this->attachments($oCitation, $sEntityType, $sEntityId, $sKey . ':citation:' . $nOrdinal,
                $this->sourceId($oSource), $sCitationId);
            $this->attachments($oSource, $sEntityType, $sEntityId, $sKey . ':citation:' . $nOrdinal . ':source',
                $this->sourceId($oSource), $sCitationId);
        }
    }

    /**
 * @brief Normalizuje relativní cestu média a odmítne nebezpečné odkazy na soubory.
 * @param string $sRaw Původní nezpracovaný řetězec ze zdroje.
 * @return ?string Výsledný text, případně null, není-li dostupný.
 */
    private function filePath(string $sRaw): ?string {
        if (preg_match('~^(https?|ftp)://~i', $sRaw)) return null;
        if (str_contains($sRaw, ':') || str_starts_with($sRaw, '/') || str_contains($sRaw, '\\')
            || strpbrk($sRaw, '?#') !== false || $sRaw === '') {
            throw new \InvalidArgumentException('Invalid local media path: ' . $sRaw);
        }
        $sPath = rawurldecode($sRaw);
        if (str_contains($sPath, '\\') || str_starts_with($sPath, '/')
            || preg_match('~(^|/)\.{1,2}(/|$)|[\x00-\x1f]~', $sPath)
            || !preg_match('//u', $sPath)) throw new \InvalidArgumentException('Invalid local media path: ' . $sRaw);
        return $sPath;
    }

    /**
 * @brief Projde odkazy OBJE a připojí související média k genealogickému záznamu.
 * @param int $nIndex Index uzlu v interním stromu GEDCOM.
 * @param string $sEntityType Vstupní parametr „entityType“ pro operaci attachments.
 * @param string $sEntityId Identifikátor příslušného záznamu.
 * @param string $sKey Vstupní parametr „key“ pro operaci attachments.
 * @param string $sSourceId Identifikátor příslušného záznamu.
 * @param string $sCitationId Identifikátor příslušného záznamu.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
    private function attachments(int $nIndex, string $sEntityType, string $sEntityId, string $sKey,
        string $sSourceId = '', string $sCitationId = ''): void {
        foreach ($this->children($nIndex, 'OBJE') as $nOrdinal => $oLink) {
            $nObject = $this->value($oLink) !== '' ? $this->pointer($this->value($oLink), 'OBJE') : $oLink;
            $this->mediaObject($nObject, $sEntityType, $sEntityId, $sKey, $nOrdinal, $sSourceId, $sCitationId);
        }
    }

    /**
 * @brief Načte údaje média FILE a propojí je s osobou, událostí nebo citací.
 * @param int $nObject Vstupní parametr „object“ pro operaci mediaObject.
 * @param string $sEntityType Vstupní parametr „entityType“ pro operaci mediaObject.
 * @param string $sEntityId Identifikátor příslušného záznamu.
 * @param string $sKey Vstupní parametr „key“ pro operaci mediaObject.
 * @param int $nOrdinal Vstupní parametr „ordinal“ pro operaci mediaObject.
 * @param string $sSourceId Identifikátor příslušného záznamu.
 * @param string $sCitationId Identifikátor příslušného záznamu.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
    private function mediaObject(int $nObject, string $sEntityType, string $sEntityId, string $sKey,
        int $nOrdinal, string $sSourceId = '', string $sCitationId = ''): void {
        foreach ($this->children($nObject, 'FILE') as $oFileOrdinal => $oFile) {
            $sRaw = $this->value($oFile);
            $sPath = $this->filePath($sRaw);
            $oForm = $this->field($oFile, 'FORM');
            $sMediaType = $this->one($oFile, 'FORM');
            $sKind = $sMediaType === null ? '' : $this->field($sMediaType, 'MEDI');
            $oSupported = $oForm === '' || in_array(strtolower($oForm), ['image/jpeg','image/png','image/gif','image/webp'], true);
            if (!$oSupported) $this->aWarnings[] = strtr('Media {name} ({type}) is recorded; previews are available only for images.', ['{name}' => $sRaw, '{type}' => $oForm]);
            $sId = self::id('M', $sKey . ':media:' . $nOrdinal . ':' . $oFileOrdinal);
            $oContent = $sPath === null ? null : ($this->aFiles[$sPath] ?? null);
            if ($oSupported && $sPath !== null && $oContent !== null && !isset($this->aMediaPaths[$sPath])) {
                $this->aMediaPaths[$sPath] = true;
                $this->aMedia[$sPath] = $oContent;
            }
            $this->aData['media'][] = ['media_id' => $sId, 'file_name' => $sPath ?? $sRaw,
                'media_type' => $sKind === 'PHOTO' ? 'person_photo' : 'source_scan',
                'title' => $this->field($oFile, 'TITL') ?: $this->field($nObject, 'TITL') ?: $this->notes($nObject) ?: basename($sRaw),
                'linked_entity_type' => $sEntityType, 'linked_entity_id' => $sEntityId,
                'source_id' => $sSourceId, 'citation_id' => $sCitationId,
                'form' => $oForm, 'sha256' => $oContent !== null ? hash('sha256', $oContent) : '',
                'url' => $sPath === null ? $sRaw : '', 'supported' => $oSupported,
                'original_file' => $sRaw, 'rights' => $this->field($nObject, 'RESN'),
                'origin' => $this->notes($nObject), 'uid' => $this->field($nObject, 'UID'),
                'raw_subtree' => $this->rawSubtree($nObject)];
        }
    }

    /**
 * @brief Převede událost GEDCOM na normalizovaný záznam genealogické události.
 * @param int $nIndex Index uzlu v interním stromu GEDCOM.
 * @param string $sKey Vstupní parametr „key“ pro operaci event.
 * @param string $sPersons Vstupní parametr „persons“ pro operaci event.
 * @param string $sKind Vstupní parametr „kind“ pro operaci event.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
    private function event(int $nIndex, string $sKey, string $sPersons, string $sKind): void {
        $sId = self::id('E', $this->field($nIndex, 'UID') ?: $sKey);
        $oPlace = $this->one($nIndex, 'PLAC');
        $this->aData['events'][] = ['event_id' => $sId, 'person_id' => $sPersons, 'event_type' => strtolower($sKind),
            'date_value' => $this->field($nIndex, 'DATE'), 'place' => $this->value($oPlace),
            'description' => $this->field($nIndex, 'TYPE') ?: $this->value($nIndex),
            'notes' => $this->notes($nIndex), 'source_id' => $this->sourceFor($nIndex),
            'verification_status' => $this->sourceFor($nIndex) === '' ? 'unverified' : 'cited',
            'uid' => $this->field($nIndex, 'UID'), 'raw_subtree' => $this->rawSubtree($nIndex)];
        $this->captureNotes($nIndex, 'event', $sId, $sKey);
        $this->citations($nIndex, 'event', $sId, $sKey);
        $this->attachments($nIndex, 'event', $sId, $sKey, $this->sourceFor($nIndex));
    }

    /**
 * @brief Převede načtené záznamy GEDCOM na datové struktury FamilyTree bez zápisu do databáze.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
    private function convert(): void {
        $this->aData = ['schema_version' => '1.0', 'format' => 'FamilySearch GEDCOM 7',
            'persons' => [], 'relationships' => [], 'events' => [], 'facts' => [], 'sources' => [],
            'citations' => [], 'media' => [], 'places' => [], 'research' => [],
            'research_facts' => [], 'notes' => [], 'note_links' => [], 'families' => []];
        foreach ($this->aRecords as $nIndex) if ($this->aNodes[$nIndex]['tag'] === 'SNOTE') {
            $this->storeNote($nIndex, self::id('N', $this->recordKey($nIndex)), $this->aNodes[$nIndex]['id']);
        }
        foreach ($this->aRecords as $nIndex) if ($this->aNodes[$nIndex]['tag'] === 'SOUR') {
            $oRepoRaw = $this->field($nIndex, 'REPO');
            $oRepository = $oRepoRaw === '' ? null : $this->pointer($oRepoRaw, 'REPO');
            $this->aData['sources'][] = ['source_id' => $this->sourceId($nIndex), 'title' => $this->field($nIndex, 'TITL') ?: $this->aNodes[$nIndex]['id'],
                'archive' => $oRepository === null ? '' : ($this->field($oRepository, 'NAME') ?: $oRepoRaw),
                'repository_xref' => $oRepoRaw, 'url' => $this->field($nIndex, 'WWW'),
                'notes' => $this->notes($nIndex), 'author' => $this->field($nIndex, 'AUTH'),
                'publication' => $this->field($nIndex, 'PUBL'), 'text' => $this->field($nIndex, 'TEXT'),
                'uid' => $this->field($nIndex, 'UID'), 'raw_subtree' => $this->rawSubtree($nIndex)];
            $this->captureNotes($nIndex, 'source', $this->sourceId($nIndex), $this->recordKey($nIndex));
            $this->attachments($nIndex, 'source', $this->sourceId($nIndex), $this->recordKey($nIndex));
        }
        $oIndividualEvents = ['BIRT','CHR','BAPM','DEAT','BURI','CREM','ADOP','EVEN','OCCU','RESI','IMMI','EMIG','GRAD','RETI','CENS','NATU','PROB','WILL','BLES','BARM','BASM','CHRA','CONF','FCOM','ORDN','EDUC','RELI','TITL','DSCR'];
        foreach ($this->aRecords as $nIndex) if ($this->aNodes[$nIndex]['tag'] === 'INDI') {
            $sKey = $this->recordKey($nIndex); $sId = $this->personId($nIndex);
            $oNames = $this->children($nIndex, 'NAME'); $sName = $oNames[0] ?? null;
            $oGiven = $sName === null ? '' : $this->field($sName, 'GIVN');
            $oSurname = $sName === null ? '' : $this->field($sName, 'SURN');
            if ($sName !== null && (!$oGiven || !$oSurname) && preg_match('~^(.*?)\s*/(.*?)/~u', $this->value($sName), $oM)) {
                $oGiven = $oGiven ?: trim($oM[1]); $oSurname = $oSurname ?: trim($oM[2]);
            }
            $oBirth = $this->one($nIndex, 'BIRT'); $oDeath = $this->one($nIndex, 'DEAT');
            $this->aData['persons'][] = ['person_id' => $sId, 'given_names' => $oGiven, 'surname_best' => $oSurname,
                'birth_surname' => '', 'sex' => $this->field($nIndex, 'SEX'),
                'birth_date' => $oBirth === null ? '' : $this->field($oBirth, 'DATE'),
                'birth_place' => $oBirth === null ? '' : $this->field($oBirth, 'PLAC'),
                'death_date' => $oDeath === null ? '' : $this->field($oDeath, 'DATE'),
                'death_place' => $oDeath === null ? '' : $this->field($oDeath, 'PLAC'),
                'occupations' => '', 'living_status' => $oDeath === null ? 'unknown' : 'deceased',
                'verification_status' => $this->sourceFor($nIndex) === '' ? 'unverified' : 'cited',
                'notes' => $this->notes($nIndex), 'uid' => $this->field($nIndex, 'UID'),
                'xref' => $this->aNodes[$nIndex]['id'], 'raw_subtree' => $this->rawSubtree($nIndex)];
            $this->captureNotes($nIndex, 'person', $sId, $sKey);
            $this->citations($nIndex, 'person', $sId, $sKey);
            $this->attachments($nIndex, 'person', $sId, $sKey);
            foreach ($oNames as $nOrdinal => $oNameNode) {
                $this->aData['facts'][] = ['fact_id' => self::id('F', $sKey . ':name:' . $nOrdinal),
                    'subject_type' => 'person', 'subject_id' => $sId, 'predicate' => 'NAME',
                    'value' => $this->value($oNameNode), 'verification_status' => $this->sourceFor($oNameNode) === '' ? 'unverified' : 'cited',
                    'source_id' => $this->sourceFor($oNameNode), 'notes' => $this->notes($oNameNode),
                    'raw_subtree' => $this->rawSubtree($oNameNode), 'preferred' => $nOrdinal === 0];
                $this->citations($oNameNode, 'person', $sId, $sKey . ':name:' . $nOrdinal);
                $this->captureNotes($oNameNode, 'person', $sId, $sKey . ':name:' . $nOrdinal);
            }
            foreach ($this->aNodes[$nIndex]['children'] as $nOrdinal => $oPart) {
                $sTag = $this->aNodes[$oPart]['tag'];
                if (in_array($sTag, $oIndividualEvents, true)) $this->event($oPart, $sKey . ':event:' . $nOrdinal, $sId, $sTag);
                elseif (!in_array($sTag, ['NAME','SEX','UID','FAMC','FAMS','OBJE','SOUR','NOTE','SNOTE','CHAN','CREA','RESN','EXID','REFN','RIN'], true)) {
                    $this->aData['facts'][] = ['fact_id' => self::id('F', $sKey . ':fact:' . $nOrdinal),
                        'subject_type' => 'person', 'subject_id' => $sId, 'predicate' => $sTag,
                        'value' => $this->value($oPart), 'verification_status' => $this->sourceFor($oPart) === '' ? 'unverified' : 'cited',
                        'source_id' => $this->sourceFor($oPart), 'notes' => $this->notes($oPart),
                        'raw_subtree' => $this->rawSubtree($oPart)];
                    $this->citations($oPart, 'person', $sId, $sKey . ':fact:' . $nOrdinal);
                    $this->captureNotes($oPart, 'person', $sId, $sKey . ':fact:' . $nOrdinal);
                }
            }
        }
        if (!$this->aData['persons']) throw new \InvalidArgumentException('GEDCOM contains no people.');
        foreach ($this->aRecords as $nIndex) if ($this->aNodes[$nIndex]['tag'] === 'FAM') $this->family($nIndex);
        $oReferencedObjects = [];
        foreach ($this->aNodes as $oNode) if ($oNode['tag'] === 'OBJE' && $oNode['parent'] !== null && $oNode['value'] !== '') {
            $oReferencedObjects[$this->pointer($oNode['value'], 'OBJE')] = true;
        }
        foreach ($this->aRecords as $nIndex) if ($this->aNodes[$nIndex]['tag'] === 'OBJE' && !isset($oReferencedObjects[$nIndex])) {
            $this->mediaObject($nIndex, 'unlinked', '', $this->recordKey($nIndex), 0);
        }
        foreach ($this->aRecords as $nIndex) if ($this->aNodes[$nIndex]['tag'] === 'INDI') {
            foreach (['FAMC' => 'CHIL', 'FAMS' => 'SPOUSE'] as $sTag => $oRole) {
                foreach ($this->children($nIndex, $sTag) as $oLink) {
                    $oFamily = $this->pointer($this->value($oLink), 'FAM');
                    $oMembers = $oRole === 'CHIL' ? $this->children($oFamily, 'CHIL') : array_merge($this->children($oFamily, 'HUSB'), $this->children($oFamily, 'WIFE'));
                    if (!in_array($nIndex, array_map(/**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param int $oMember Vstupní hodnota $oMember použitá v callbacku.
 * @return int Výsledek callbacku pro volající operaci.
 */
fn(int $oMember): int => $this->pointer($this->value($oMember), 'INDI'), $oMembers), true)) {
                        throw new \InvalidArgumentException('Reciprocal INDI/FAM links do not match for ' . $this->aNodes[$nIndex]['id'] . '.');
                    }
                }
            }
        }
        $this->captureRemainingNotes();
        $this->convertSharedNotes();
        // A copy of the complete GEDCOM/GEDZIP is saved separately. These are the standard
        // records represented in the application; uncommon substructures remain in the original.
        $this->aWarnings[] = 'The original GEDCOM/GEDZIP and unknown substructures remain in an archived copy of the original.';
        foreach ($this->aRecords as $nIndex) if (!in_array($this->aNodes[$nIndex]['tag'], ['INDI','FAM','SOUR','OBJE','REPO','SNOTE','SUBM'], true)) {
            $this->aWarnings[] = strtr('Record {item} is retained in the original file.', ['{item}' => $this->aNodes[$nIndex]['tag']]);
        }
    }

    /**
 * @brief Připojí zbývající poznámky GEDCOM, které nebyly při předchozích konverzích spotřebovány.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
    private function captureRemainingNotes(): void {
        foreach ($this->aNodes as $nIndex => $oNode) {
            if ($oNode['parent'] === null || !in_array($oNode['tag'], ['NOTE', 'SNOTE'], true)
                || isset($this->aCapturedNotes[$nIndex])) continue;
            $oAncestor = $oNode['parent'];
            while ($this->aNodes[$oAncestor]['parent'] !== null) $oAncestor = $this->aNodes[$oAncestor]['parent'];
            $oRoot = $this->aNodes[$oAncestor];
            $oShared = $oNode['tag'] === 'SNOTE' ? $this->pointer($oNode['value'], 'SNOTE') : null;
            $sNoteId = self::id('N', $oShared === null ? $oRoot['id'] . ':inline:' . $nIndex : $this->recordKey($oShared));
            if ($oShared === null) $this->storeNote($nIndex, $sNoteId, '');
            $sOwnerType = match ($oRoot['tag']) {
                'INDI' => 'person', 'FAM' => 'family', 'SOUR' => 'source', default => 'unlinked',
            };
            $sOwnerId = match ($sOwnerType) {
                'person' => $this->personId($oAncestor), 'family' => self::id('H', $this->recordKey($oAncestor)),
                'source' => $this->sourceId($oAncestor), default => '',
            };
            $this->aData['note_links'][] = ['note_link_id' => self::id('K', $oRoot['id'] . ':inline-link:' . $nIndex),
                'note_id' => $sNoteId, 'owner_type' => $sOwnerType, 'owner_id' => $sOwnerId,
                'owner_xref' => $oRoot['id'], 'snote_xref' => $oShared === null ? '' : $this->aNodes[$oShared]['id']];
        }
    }

    /**
 * @brief Převede rodinné vazby GEDCOM na identifikátory osob a vztahy.
 * @param int $nIndex Index uzlu v interním stromu GEDCOM.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
    private function family(int $nIndex): void {
        $sKey = $this->recordKey($nIndex);
        $sFamilyId = self::id('H', $sKey);
        $aParents = [];
        foreach (['HUSB','WIFE'] as $sTag) foreach ($this->children($nIndex, $sTag) as $oPart) {
            $oParent = $this->pointer($this->value($oPart), 'INDI');
            $aParents[] = $this->personId($oParent);
            if (!in_array($nIndex, array_map(/**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param int $oLink Vstupní hodnota $oLink použitá v callbacku.
 * @return int Výsledek callbacku pro volající operaci.
 */
fn(int $oLink): int => $this->pointer($this->value($oLink), 'FAM'), $this->children($oParent, 'FAMS')), true)) {
                throw new \InvalidArgumentException('Missing reciprocal FAMS link for ' . $this->aNodes[$oParent]['id'] . '.');
            }
        }
        if (count($aParents) === 2) {
            $this->aData['relationships'][] = ['relationship_id' => self::id('R', $sKey . ':spouse'),
                'person1_id' => $aParents[0], 'person2_id' => $aParents[1], 'relationship_type' => 'spouse',
                'source_id' => $this->sourceFor($nIndex), 'verification_status' => 'unverified', 'notes' => $this->notes($nIndex)];
        }
        $aChildren = [];
        foreach ($this->children($nIndex, 'CHIL') as $oChildNode) {
            $aChildren[] = $this->personId($this->pointer($this->value($oChildNode), 'INDI'));
        }
        $this->aData['families'][] = ['family_id' => $sFamilyId, 'uid' => $this->field($nIndex, 'UID'),
            'xref' => $this->aNodes[$nIndex]['id'], 'parent_ids' => $aParents, 'child_ids' => $aChildren,
            'notes' => $this->notes($nIndex), 'raw_subtree' => $this->rawSubtree($nIndex)];
        $this->captureNotes($nIndex, 'family', $sFamilyId, $sKey);
        $this->citations($nIndex, 'family', $sFamilyId, $sKey . ':family');
        $this->attachments($nIndex, 'family', $sFamilyId, $sKey . ':family');
        foreach ($this->children($nIndex, 'CHIL') as $oChildNode) {
            $oChild = $this->pointer($this->value($oChildNode), 'INDI');
            $sChildId = $this->personId($oChild); $sStatus = 'unverified'; $oLinked = false; $oPedigree = '';
            foreach ($this->children($oChild, 'FAMC') as $oLink) if ($this->pointer($this->value($oLink), 'FAM') === $nIndex) {
                $oLinked = true; $sStatus = strtolower($this->field($oLink, 'STAT') ?: 'unverified');
                $oPedigree = $this->field($oLink, 'PEDI');
                $this->captureNotes($oLink, 'person', $sChildId, $sKey . ':child:' . $sChildId);
                break;
            }
            if (!$oLinked) throw new \InvalidArgumentException('Missing reciprocal FAMC link for ' . $this->aNodes[$oChild]['id'] . '.');
            if (!in_array(strtoupper($sStatus), ['PROVEN', 'CHALLENGED', 'DISPROVEN', 'UNVERIFIED'], true)) {
                throw new \InvalidArgumentException('Unknown FAMC.STAT status: ' . $sStatus);
            }
            foreach ($aParents as $oParent) $this->aData['relationships'][] = [
                'relationship_id' => self::id('R', $sKey . ':parent:' . $oParent . ':' . $sChildId),
                'person1_id' => $oParent, 'person2_id' => $sChildId, 'relationship_type' => 'parent_child',
                'source_id' => $this->sourceFor($nIndex), 'verification_status' => strtolower($sStatus),
                'pedigree' => $oPedigree, 'notes' => $this->notes($nIndex)];
        }
        $oMembers = implode('|', array_unique($aParents));
        foreach ($this->aNodes[$nIndex]['children'] as $nOrdinal => $oPart) {
            $sTag = $this->aNodes[$oPart]['tag'];
            if (in_array($sTag, ['MARR','DIV','ENGA','MARB','MARC','MARL','MARS','ANUL','CENS','EVEN','RESI'], true) && $oMembers !== '') {
                $this->event($oPart, $sKey . ':event:' . $nOrdinal, $oMembers, $sTag);
            }
        }
    }

    /**
 * @brief Zpracuje sdílené poznámky GEDCOM a propojí je s odpovídajícími osobami a záznamy.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
    private function convertSharedNotes(): void {
        $aLinks = [];
        foreach ($this->aData['note_links'] as $oLink) $aLinks[$oLink['note_id']][] = $oLink;
        $oAliases = [];
        foreach ($this->aRecords as $nIndex) if ($this->aNodes[$nIndex]['tag'] === 'INDI') {
            foreach ([$this->aNodes[$nIndex]['id'], $this->field($nIndex, 'UID')] as $oAlias) {
                if ($oAlias !== '') $oAliases[$oAlias][] = $this->personId($nIndex);
                if (preg_match('/(?:^|_)(P[0-9]+)$/D', $oAlias, $oM)) $oAliases[$oM[1]][] = $this->personId($nIndex);
            }
        }
        foreach ($this->aData['notes'] as &$oNote) {
            $sId = $oNote['note_id']; $sXref = $oNote['xref'];
            $oNote['owner_links'] = array_map(static /**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param array $oLink Vstupní hodnota $oLink použitá v callbacku.
 * @return array Výsledek callbacku pro volající operaci.
 */
fn(array $oLink): array => [
                'owner_type' => $oLink['owner_type'], 'owner_id' => $oLink['owner_id']], $aLinks[$sId] ?? []);
            if ($sXref === '') continue;
            $nIndex = $this->aRecords[$sXref]; $oBody = $oNote['full_text'];
            if ($oNote['kind'] === 'research_facts') {
                $oPieces = []; $oCurrent = null;
                foreach (explode("\n", $oBody) as $nLine) {
                    if (preg_match('/^\s*(F[0-9]+)\s*[—-]\s*(.*)$/uD', $nLine, $oM)) {
                        if ($oCurrent !== null) $oPieces[] = $oCurrent;
                        $oCurrent = ['code' => $oM[1], 'text' => $oM[2], 'original_text' => $nLine];
                    } elseif ($oCurrent !== null) {
                        $oCurrent['text'] .= "\n" . $nLine;
                        $oCurrent['original_text'] .= "\n" . $nLine;
                    }
                }
                if ($oCurrent !== null) $oPieces[] = $oCurrent;
                if (!$oPieces) $this->aWarnings[] = strtr('Note {item} has no recognizable Fxxxxx line; its entire text is preserved.', ['{item}' => $sXref]);
                foreach ($oPieces as $oPart) {
                    $aParts = preg_split('/\s*;\s*/u', $oPart['text']);
                    $oHead = array_shift($aParts);
                    preg_match('/^\s*([^:\n]+):\s*(.*)$/us', $oHead, $oFirst);
                    $aFields = [];
                    foreach ($aParts as $oItem) if (preg_match('/^\s*([^:\n]+):\s*(.*)$/us', $oItem, $bMatch)) {
                        $aFields[mb_strtolower(trim($bMatch[1]))] = trim($bMatch[2]);
                    }
                    $oOwners = array_values(array_filter($aLinks[$sId] ?? [],
                        static /**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param array $oL Vstupní hodnota $oL použitá v callbacku.
 * @return bool Výsledek callbacku pro volající operaci.
 */
fn(array $oL): bool => in_array($oL['owner_type'], ['person','family','event'], true)));
                    if (!$oOwners) $oOwners = [['owner_type' => 'unlinked', 'owner_id' => '']];
                    $oUniqueOwners = [];
                    foreach ($oOwners as $oOwner) $oUniqueOwners[$oOwner['owner_type'] . ':' . $oOwner['owner_id']] = $oOwner;
                    foreach ($oUniqueOwners as $oOwner) {
                        $sFactId = self::id('V', $this->recordKey($nIndex) . ':' . $oPart['code'] . ':' . $oOwner['owner_id']);
                        $sKey = $this->recordKey($nIndex) . ':fact:' . $oPart['code'] . ':' . $oOwner['owner_id'];
                        $sCitationId = $this->one($nIndex, 'SOUR') === null ? '' : self::id('C', $sKey . ':citation:0');
                        $this->aData['research_facts'][] = [
                            'fact_id' => $sFactId, 'external_fact_id' => $oPart['code'],
                            'owner_type' => $oOwner['owner_type'], 'owner_id' => $oOwner['owner_id'],
                            'fact_type' => trim($oFirst[1] ?? ''), 'raw_value' => trim($oFirst[2] ?? $oHead),
                            'normalized_value' => $aFields['normalizace'] ?? '',
                            'verification_status' => $aFields['stav'] ?? 'unverified',
                            'confidence_percent' => isset($aFields['jistota']) && preg_match('/\b(100|[0-9]{1,2})\s*%?/u', $aFields['jistota'], $oConfidence)
                                ? (int)$oConfidence[1] : null,
                            'source_id' => $this->sourceFor($nIndex), 'citation_id' => $sCitationId,
                            'locator' => $aFields['lokátor'] ?? '', 'note' => $oPart['text'],
                            'snote_xref' => $sXref, 'original_text' => $oPart['original_text']];
                        $this->citations($nIndex, 'research_facts', $sFactId, $sKey, $aFields['lokátor'] ?? '');
                    }
                }
            } elseif ($oNote['kind'] === 'place_catalog') {
                preg_match('/^Místo\s+(L[0-9]+):\s*([^\n]+)/u', $oBody, $oMain);
                $aFields = [];
                foreach (preg_split('/[;\n]/u', $oBody) as $nLine) {
                    if (preg_match('/^\s*([^:]+):\s*(.+)$/u', $nLine, $oM)) $aFields[mb_strtolower(trim($oM[1]))] = trim($oM[2], " \t\r\n.");
                }
                $this->aData['places'][] = [
                    'place_id' => self::id('L', $this->recordKey($nIndex)),
                    'catalog_id' => $oMain[1] ?? '', 'name' => isset($oMain[2]) ? rtrim(trim($oMain[2]), '.') : '',
                    'current_municipality' => $aFields['současná obec'] ?? '',
                    'district' => $aFields['okres'] ?? '', 'region' => $aFields['kraj'] ?? '',
                    'country' => $aFields['země'] ?? '', 'historical_names' => $aFields['historické názvy'] ?? '',
                    'place_type' => $aFields['typ'] ?? '', 'note' => $oBody, 'latitude' => null,
                    'longitude' => null, 'verification_status' => null,
                    'snote_xref' => $sXref, 'original_text' => $oBody];
            } elseif ($oNote['kind'] === 'research_task') {
                preg_match('/^Výzkumný úkol\s+(Q[0-9]+)\s*[—-]\s*([^\n]+)/u', $oBody, $oMain);
                $aFields = [];
                foreach (explode("\n", $oBody) as $nLine) if (preg_match('/^\s*([^:]+):\s*(.*)$/u', $nLine, $oM)) {
                    $aFields[mb_strtolower(trim($oM[1]))] = trim($oM[2]);
                }
                $oTarget = $aFields['cíl'] ?? '';
                $oPersonIds = [];
                foreach ($aLinks[$sId] ?? [] as $oLink) if ($oLink['owner_type'] === 'person') $oPersonIds[$oLink['owner_id']] = true;
                if (preg_match_all('/\bP[0-9]+\b/u', $oTarget, $oCodes)) foreach ($oCodes[0] as $sCode) {
                    $bMatches = array_unique($oAliases[$sCode] ?? []);
                    if (count($bMatches) === 1) $oPersonIds[reset($bMatches)] = true;
                }
                $this->aData['research'][] = [
                    'research_id' => self::id('Q', $this->recordKey($nIndex)),
                    'external_task_id' => $oMain[1] ?? '', 'title' => trim($oMain[2] ?? strtok($oBody, "\n")),
                    'question' => trim($oMain[2] ?? strtok($oBody, "\n")),
                    'status' => rtrim($aFields['stav'] ?? 'PLANNED', '.'),
                    'attempts' => $aFields['pokusy'] ?? '', 'result' => $aFields['výsledek'] ?? '',
                    'next_step' => $aFields['další krok'] ?? '', 'checkpoint' => $aFields['checkpoint'] ?? '',
                    'target_text' => $oTarget, 'target_person_ids' => array_keys($oPersonIds),
                    'source_id' => $this->sourceFor($nIndex), 'snote_xref' => $sXref,
                    'original_text' => $oBody];
            }
        }
        unset($oNote);
    }

    /**
 * @brief Ověří referenční cesty médií v GEDCOM/GEDZIP a odmítne nebezpečný nebo neúplný archiv.
 * @param string $sText Textový obsah.
 * @param array $aFiles Součásti importovaného archivu.
 * @param bool $bGedzip Příznak formátu GEDZIP.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
    public static function validateFiles(string $sText, array $aFiles, bool $bGedzip): void {
        $oParser = new self(); $oParser->aFiles = $aFiles; $oParser->bGedzip = $bGedzip; $oParser->read($sText);
        foreach ($oParser->aNodes as $oNode) if ($oNode['parent'] !== null
            && (($oNode['tag'] === 'FILE' && $oParser->aNodes[$oNode['parent']]['tag'] === 'OBJE')
                || ($oNode['tag'] === 'TRAN' && $oParser->aNodes[$oNode['parent']]['tag'] === 'FILE'))) {
            $sPath = $oParser->filePath($oNode['value']);
            if ($sPath !== null && !array_key_exists($sPath, $aFiles)) {
                throw new \InvalidArgumentException('Package does not contain the referenced file: ' . $sPath);
            }
        }
    }
}
