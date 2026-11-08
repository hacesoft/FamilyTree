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

/**
 * Export the visible, editable family graph to FamilySearch GEDCOM 7.0.
 * This is a portable genealogy exchange, NOT a full research/media backup.
 * No database mutations, file access or external requests occur here.
 */
final class Gedcom7Exporter {
    /**
 * @brief Ošetří skalární text pro bezpečný zápis do GEDCOM 7: sjednotí konce řádků, odstraní řídicí znaky a escapuje znak @.
 * @param mixed $sValue Vstupní hodnota pro převod, ověření či formátování.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
    private static function scalar(mixed $sValue): string {
        $sValue = str_replace(["\r\n", "\r"], "\n", (string)($sValue ?? ''));
        // Strip prohibited controls, including characters that could produce a GEDCOM injection.
        $sValue = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $sValue) ?? '';
        return str_replace('@', '@@', $sValue);
    }

    /**
 * @brief Připojí pole GEDCOM na zadané úrovni a víceřádkový obsah rozdělí do pokračovacích záznamů CONT.
 * @param array $aLines Výstupní řádky přenosového formátu GEDCOM, předané referencí.
 * @param int $nLevel Úroveň hierarchie záznamu GEDCOM.
 * @param string $sTag Značka typu pole nebo události GEDCOM.
 * @param mixed $sValue Vstupní hodnota pro převod, ověření či formátování.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
    private static function field(array &$aLines, int $nLevel, string $sTag, mixed $sValue): void {
        $sValue = trim(self::scalar($sValue));
        if ($sValue === '') return;
        $aParts = explode("\n", $sValue);
        $aLines[] = $nLevel . ' ' . $sTag . ' ' . array_shift($aParts);
        foreach ($aParts as $oPart) $aLines[] = ($nLevel + 1) . ' CONT' . ($oPart !== '' ? ' ' . $oPart : '');
    }

    /**
 * @brief Převede platné datum ISO YYYY-MM-DD na zápis GEDCOM; ostatní známé formáty ponechá beze změny.
 * @param mixed $sValue Vstupní hodnota pro převod, ověření či formátování.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
    private static function date(mixed $sValue): string {
        $sValue = trim((string)($sValue ?? ''));
        // Common Nextcloud dates are ISO strings; convert only exact dates.
        if (preg_match('/^(\d{4})-(\d{2})-(\d{2})$/D', $sValue, $oM)
            && checkdate((int)$oM[2], (int)$oM[3], (int)$oM[1])) {
            return (int)$oM[3] . ' ' . ['','JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][(int)$oM[2]] . ' ' . $oM[1];
        }
        return $sValue;
    }

    /**
 * @brief Vloží událost GEDCOM včetně typu, data, místa a poznámky, pokud má alespoň jeden údaj.
 * @param array $aLines Výstupní řádky přenosového formátu GEDCOM, předané referencí.
 * @param string $sTag Značka typu pole nebo události GEDCOM.
 * @param string $sDate Datum události předané ve formátu FamilyTree.
 * @param string $sPlace Místo související s genealogickou událostí.
 * @param string $sNote Poznámka, která se má vložit do záznamu.
 * @param string $sType Vstupní parametr „type“ pro operaci event.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
    private static function event(array &$aLines, string $sTag, string $sDate, string $sPlace, string $sNote = '', string $sType = ''): void {
        if ($sDate === '' && $sPlace === '' && $sNote === '' && $sType === '') return;
        $aLines[] = '1 ' . $sTag;
        self::field($aLines, 2, 'TYPE', $sType);
        self::field($aLines, 2, 'DATE', self::date($sDate));
        self::field($aLines, 2, 'PLAC', $sPlace);
        self::field($aLines, 2, 'NOTE', $sNote);
    }

    /**
 * @brief Vygeneruje přenosný text GEDCOM 7 ze zadaných osob, vazeb a událostí; ověří identifikátory a neodstraní data.
 * @param array<int,array<string,mixed>> $aPeople Seznam genealogických osob určených ke zpracování.
 * @param array<int,array<string,mixed>> $aRelationships Visible, non-disproven graph edges
 * @param array<int,array<string,mixed>> $aEvents Seznam genealogických událostí, které mají být zpracovány.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
    public static function render(array $aPeople, array $aRelationships, array $aEvents): string {
        $sPeopleById = [];
        foreach ($aPeople as $oPerson) {
            $nId = (int)($oPerson['id'] ?? 0);
            if ($nId <= 0 || isset($sPeopleById[$nId])) throw new \InvalidArgumentException('Invalid person identifiers.');
            $sPeopleById[$nId] = $oPerson;
        }
        if (!$sPeopleById) throw new \InvalidArgumentException('Rodokmen neobsahuje osoby k exportu.');
        ksort($sPeopleById, SORT_NUMERIC);

        $oParentIds = [];
        $oCouples = [];
        foreach ($aRelationships as $oEdge) {
            $nA = (int)($oEdge['person1_id'] ?? 0);
            $nB = (int)($oEdge['person2_id'] ?? 0);
            if (!$nA || !$nB || $nA === $nB || !isset($sPeopleById[$nA], $sPeopleById[$nB])) continue;
            if (($oEdge['type'] ?? '') === 'parent') {
                $oParentIds[$nB][$nA] = $nA;
            } elseif (($oEdge['type'] ?? '') === 'partner') {
                $oPair = [$nA,$nB]; sort($oPair, SORT_NUMERIC);
                $oCouples[implode(':', $oPair)] = $oPair;
            }
        }
        // A GEDCOM family can have at most two parents. Do not silently drop a third.
        foreach ($oParentIds as $aParents) if (count($aParents) > 2) {
            throw new \InvalidArgumentException('A person has more than two visible parents. GEDCOM export would lose links.');
        }
        $aFamilies = [];
        foreach ($oCouples as $sKey => $oPair) $aFamilies[$sKey] = ['parents' => $oPair, 'children' => []];
        foreach ($oParentIds as $sChildId => $aParents) {
            $oPair = array_values($aParents); sort($oPair, SORT_NUMERIC);
            $sKey = implode(':', $oPair);
            $aFamilies[$sKey] ??= ['parents' => $oPair, 'children' => []];
            $aFamilies[$sKey]['children'][(int)$sChildId] = (int)$sChildId;
        }
        ksort($aFamilies, SORT_STRING);
        $oFamilyXrefs = []; $oAsParent = []; $oAsChild = []; $nNumber = 0;
        foreach ($aFamilies as $sKey => $oFamily) {
            $oXref = '@F' . (++$nNumber) . '@';
            $oFamilyXrefs[$sKey] = $oXref;
            foreach ($oFamily['parents'] as $nId) $oAsParent[$nId][$oXref] = $oXref;
            foreach ($oFamily['children'] as $nId) $oAsChild[$nId][$oXref] = $oXref;
        }
        $aLines = ['0 HEAD','1 SOUR HcFamilyTree','1 GEDC','2 VERS 7.0','1 CHAR UTF-8'];
        foreach ($sPeopleById as $nId => $oPerson) {
            $aLines[] = '0 @I' . $nId . '@ INDI';
            $oGiven = trim((string)($oPerson['given_name'] ?? ''));
            $oSurname = trim((string)($oPerson['surname'] ?? ''));
            self::field($aLines, 1, 'NAME', $oGiven . ' /' . $oSurname . '/');
            $oGender = strtolower((string)($oPerson['gender'] ?? ''));
            if ($oGender === 'male') $aLines[] = '1 SEX M';
            elseif ($oGender === 'female') $aLines[] = '1 SEX F';
            self::event($aLines, 'BIRT', (string)($oPerson['birth_date'] ?? ''), (string)($oPerson['birth_place'] ?? ''));
            self::event($aLines, 'DEAT', (string)($oPerson['death_date'] ?? ''), (string)($oPerson['death_place'] ?? ''));
            self::field($aLines, 1, 'OCCU', $oPerson['occupation'] ?? '');
            self::field($aLines, 1, 'NOTE', $oPerson['notes'] ?? '');
            if (trim((string)($oPerson['birth_surname'] ?? '')) !== '') {
                self::field($aLines, 1, 'NOTE', 'Rodné příjmení: ' . $oPerson['birth_surname']);
            }
            foreach ($oAsChild[$nId] ?? [] as $oXref) $aLines[] = '1 FAMC ' . $oXref;
            foreach ($oAsParent[$nId] ?? [] as $oXref) $aLines[] = '1 FAMS ' . $oXref;
            foreach ($aEvents as $oEvent) {
                if ((int)($oEvent['person_id'] ?? 0) !== $nId) continue;
                $sTag = strtoupper((string)($oEvent['type'] ?? ''));
                if (!preg_match('/^(BAPM|BURI|CHR|CENS|CONF|CREM|GRAD|IMMI|EMIG|NATU|PROB|RETI|RESI)$/D', $sTag)) $sTag = 'EVEN';
                self::event($aLines, $sTag, (string)($oEvent['event_date'] ?? ''), (string)($oEvent['place'] ?? ''), (string)($oEvent['description'] ?? ''), $sTag === 'EVEN' ? (string)($oEvent['title'] ?? $oEvent['type'] ?? '') : '');
            }
        }
        foreach ($aFamilies as $sKey => $oFamily) {
            $aLines[] = '0 ' . $oFamilyXrefs[$sKey] . ' FAM';
            $aParents = $oFamily['parents'];
            // GEDCOM convention: HUSB/WIFE are roles, not biological assertions.
            if (count($aParents) === 2 && strtolower((string)($sPeopleById[$aParents[0]]['gender'] ?? '')) === 'female'
                && strtolower((string)($sPeopleById[$aParents[1]]['gender'] ?? '')) === 'male') $aParents = array_reverse($aParents);
            foreach ($aParents as $nIndex => $nParentId) {
                $oGender = strtolower((string)($sPeopleById[$nParentId]['gender'] ?? ''));
                $oRole = $oGender === 'female' && (count($aParents) === 1 || $nIndex === 1) ? 'WIFE' : ($nIndex === 0 ? 'HUSB' : 'WIFE');
                $aLines[] = '1 ' . $oRole . ' @I' . $nParentId . '@';
            }
            ksort($oFamily['children'], SORT_NUMERIC);
            foreach ($oFamily['children'] as $sChildId) $aLines[] = '1 CHIL @I' . $sChildId . '@';
        }
        $aLines[] = '0 TRLR';
        $oResult = implode("\r\n", $aLines) . "\r\n";
        if (strlen($oResult) > 5 * 1024 * 1024) throw new \InvalidArgumentException('GEDCOM exceeds the 5 MB limit.');
        return $oResult;
    }
}
