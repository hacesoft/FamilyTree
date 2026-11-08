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

use OCP\IDBConnection;

/**
 * Read-only database statistics for one visible tree or all trees owned by a user.
 * Each database record is counted exactly once. Breakdown groups never add to total.
 */
final class FamilyTreeStatisticsService {
    /** Stable, explicit ordering; names used internally, never received from HTTP. */
    public const TABLES = [
        'trees' => 'hc_familytree_trees',
        'people' => 'hc_familytree_people',
        'relations' => 'hc_familytree_relations',
        'events' => 'hc_familytree_events',
        'documents' => 'hc_familytree_documents',
        'document_links' => 'hc_familytree_doc_links',
        'shares' => 'hc_familytree_shares',
        'research_records' => 'hc_familytree_research',
        'tasks' => 'hc_familytree_research_tasks',
        'searches' => 'hc_familytree_search_log',
        'evidence' => 'hc_familytree_evidence',
        'proposals' => 'hc_familytree_proposals',
        'history' => 'hc_familytree_history',
    ];
    private const BREAKDOWNS = [
        'relations' => 'type',
        'events' => 'type',
        'research_records' => 'entity_type',
        'tasks' => 'status',
        'searches' => 'outcome',
        'evidence' => 'status',
        'proposals' => 'status',
        'history' => 'action',
    ];

    /**
 * @brief Inicializuje instanci a propojí předané závislosti.
 * @param IDBConnection $oDb Databázové připojení.
 * @return void Konstruktor nevrací návratovou hodnotu.
 */
public function __construct(private IDBConnection $oDb) {}

    /**
 * @brief Spočítá family tree statistics service používané v FamilyTreeStatisticsService.
 * @param string $sTable Název databázové tabulky používané operací.
 * @param int $nTreeId Jednoznačný identifikátor rodokmenu, k němuž se vztahuje operace.
 * @return int Vypočtená číselná hodnota nebo identifikátor dle významu operace.
 */
    private function count(string $sTable, int $nTreeId): int {
        $oQ = $this->oDb->getQueryBuilder();
        $oQ->selectAlias($oQ->func()->count('*'), 'total')->from($sTable);
        if ($sTable === 'hc_familytree_trees') {
            $oQ->where($oQ->expr()->eq('id', $oQ->createNamedParameter($nTreeId)));
        } else {
            $oQ->where($oQ->expr()->eq('tree_id', $oQ->createNamedParameter($nTreeId)));
        }
        return (int)$oQ->executeQuery()->fetchOne();
    }

    /**
 * @brief Rozdělí záznamy do skupin a spočítá jejich četnosti.
 * @param string $sTable Název databázové tabulky.
 * @param string $sColumn Vstupní parametr „column“ pro operaci grouped.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
    private function grouped(string $sTable, string $sColumn, int $nTreeId): array {
        $oQ = $this->oDb->getQueryBuilder();
        $oQ->select($sColumn)->selectAlias($oQ->func()->count('*'), 'total')->from($sTable)
          ->where($oQ->expr()->eq('tree_id', $oQ->createNamedParameter($nTreeId)))
          ->groupBy($sColumn)->orderBy($sColumn, 'ASC');
        $oResult = [];
        foreach ($oQ->executeQuery()->fetchAllAssociative() as $oRow) {
            $sLabel = trim((string)($oRow[$sColumn] ?? ''));
            $oResult[$sLabel !== '' ? $sLabel : '(neuvedeno)'] = (int)$oRow['total'];
        }
        return $oResult;
    }

    /**
 * @brief Sečte počty položek ve vyhodnocovaných statistických skupinách.
 * @param array $aCounts Vstupní parametr „counts“ pro operaci sumCounts.
 * @return int Vypočtená číselná hodnota nebo identifikátor dle významu operace.
 */
    public static function sumCounts(array $aCounts): int {
        $oSum = 0;
        foreach (self::TABLES as $sKey => $oTable) {
            $nCount = $aCounts[$sKey] ?? 0;
            $oSum += max(0, (int)$nCount);
        }
        return $oSum;
    }

    /**
 * @brief Sestaví strukturovaný statistický přehled pro rodokmen.
 * @param int[] $aTreeIds Identifikátory rodokmenů předem ověřené volající službou.
 * @param string $sScope Vstupní parametr „scope“ pro operaci report.
 * @param string $sTitle Vstupní parametr „title“ pro operaci report.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
    public function report(array $aTreeIds, string $sScope, string $sTitle): array {
        $aCounts = array_fill_keys(array_keys(self::TABLES), 0);
        $oBreakdowns = array_fill_keys(array_keys(self::BREAKDOWNS), []);
        $aIds = array_values(array_unique(array_map('intval', $aTreeIds)));
        foreach ($aIds as $nTreeId) {
            if ($nTreeId <= 0) continue;
            foreach (self::TABLES as $sName => $sTable) {
                $aCounts[$sName] += $this->count($sTable, $nTreeId);
            }
            foreach (self::BREAKDOWNS as $sName => $sColumn) {
                foreach ($this->grouped(self::TABLES[$sName], $sColumn, $nTreeId) as $sValue => $nCount) {
                    $oBreakdowns[$sName][$sValue] = ($oBreakdowns[$sName][$sValue] ?? 0) + $nCount;
                }
            }
        }
        foreach ($oBreakdowns as &$oGroup) ksort($oGroup, SORT_NATURAL);
        unset($oGroup);
        return [
            'scope' => $sScope,
            'title' => $sTitle,
            'tree_count' => $aCounts['trees'],
            'counts' => $aCounts,
            'breakdowns' => $oBreakdowns,
            'total' => self::sumCounts($aCounts),
            'calculated_at' => time(),
            'definition' => 'Simple sum of rows across 13 tables. Subgroups are not counted again. The total is not the number of people.',
        ];
    }
}
