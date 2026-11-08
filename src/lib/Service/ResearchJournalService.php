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

/** Research journal is separate from genealogy facts. All access is enforced by GenealogyService. */
final class ResearchJournalService {
    /**
 * @brief Inicializuje instanci a propojí předané závislosti.
 * @param IDBConnection $oDb Databázové připojení.
 * @return void Konstruktor nevrací návratovou hodnotu.
 */
public function __construct(private IDBConnection $oDb) {}
    /**
 * @brief Vytvoří nový náhodný stabilní identifikátor.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
    public static function uid(): string { return bin2hex(random_bytes(16)); }
    /**
 * @brief Serializuje předanou hodnotu do přenosového formátu.
 * @param mixed $sValue Vstupní hodnota pro převod, ověření či formátování.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
    public static function json(mixed $sValue): string { return json_encode($sValue, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE | JSON_THROW_ON_ERROR); }
    /**
 * @brief Vrátí řádky výzkumného deníku konkrétního rodokmenu, řazené od nejnovějšího.
 * @param string $sTable Název databázové tabulky.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
    public function rows(string $sTable, int $nTreeId): array {
        $oQ=$this->oDb->getQueryBuilder();
        $oQ->select('*')->from($sTable)->where($oQ->expr()->eq('tree_id',$oQ->createNamedParameter($nTreeId)))->orderBy('id','DESC');
        return $oQ->executeQuery()->fetchAllAssociative();
    }
    /**
 * @brief Načte konkrétní záznam výzkumného deníku podle databázového ID.
 * @param string $sTable Název databázové tabulky.
 * @param int $nId Identifikátor cílového záznamu.
 * @return ?array Strukturované výsledky operace; u volitelného návratu může být null.
 */
    public function row(string $sTable,int $nId): ?array {
        $oQ=$this->oDb->getQueryBuilder();
        $oQ->select('*')->from($sTable)->where($oQ->expr()->eq('id',$oQ->createNamedParameter($nId)));
        return $oQ->executeQuery()->fetchAssociative() ?: null;
    }
    /**
 * @brief Vloží záznam výzkumného deníku a vrátí jeho nové databázové ID.
 * @param string $sTable Název databázové tabulky.
 * @param array $aData Zpracovávaná data.
 * @return int Vypočtená číselná hodnota nebo identifikátor dle významu operace.
 */
    public function insert(string $sTable,array $aData): int {
        $oQ=$this->oDb->getQueryBuilder()->insert($sTable);
        foreach($aData as $sKey=>$sValue)$oQ->setValue($sKey,$oQ->createNamedParameter($sValue));
        $oQ->executeStatement();return (int)$this->oDb->lastInsertId($sTable);
    }
    /**
 * @brief Upraví uvedené sloupce již existujícího záznamu výzkumného deníku.
 * @param string $sTable Název databázové tabulky.
 * @param int $nId Identifikátor cílového záznamu.
 * @param array $aData Zpracovávaná data.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
    public function update(string $sTable,int $nId,array $aData): void {
        $oQ=$this->oDb->getQueryBuilder()->update($sTable);
        foreach($aData as $sKey=>$sValue)$oQ->set($sKey,$oQ->createNamedParameter($sValue));
        $oQ->where($oQ->expr()->eq('id',$oQ->createNamedParameter($nId)))->executeStatement();
    }
    /**
 * @brief Vrátí auditní historii změn vztahující se k výzkumnému deníku.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
    public function history(int $nTreeId): array {return array_slice($this->rows('hc_familytree_history',$nTreeId),0,500);}
    /**
 * @brief Uloží append-only historii změny včetně původních a nových hodnot a důvodu.
 * @param int $nTreeId Jednoznačný identifikátor rodokmenu, k němuž se vztahuje operace.
 * @param string $sEntityType Vstupní parametr „entityType“ pro operaci audit.
 * @param string $sEntityUid Vstupní parametr „entityUid“ pro operaci audit.
 * @param string $sAction Vstupní parametr „action“ pro operaci audit.
 * @param string $sActor Identifikátor uživatele, který provedl změnu.
 * @param ?array $aBefore Původní stav záznamu, nebo null.
 * @param ?array $aAfter Nový stav záznamu, nebo null.
 * @param string $sReason Textové zdůvodnění změny pro auditní historii.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
    public function audit(int $nTreeId,string $sEntityType,string $sEntityUid,string $sAction,string $sActor,?array $aBefore,?array $aAfter,string $sReason=''): void {
        $this->insert('hc_familytree_history',[
            'tree_id'=>$nTreeId,'entity_type'=>$sEntityType,'entity_uid'=>$sEntityUid,'action'=>$sAction,
            'actor_uid'=>$sActor,'before_json'=>$aBefore===null?null:self::json($aBefore),
            'after_json'=>$aAfter===null?null:self::json($aAfter),'reason'=>mb_substr($sReason,0,2000), 'created_at'=>time(),
        ]);
    }
    /**
 * @brief Dohledá zdrojové identifikátory importovaných úkolů v neměnné auditní historii.
 * @param int $nTreeId Jednoznačný identifikátor rodokmenu, k němuž se vztahuje operace.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
    private function taskOrigins(int $nTreeId): array {
        $oQuery=$this->oDb->getQueryBuilder();
        $oQuery->select('entity_uid','reason')->from('hc_familytree_history')
            ->where($oQuery->expr()->eq('tree_id',$oQuery->createNamedParameter($nTreeId)))
            ->andWhere($oQuery->expr()->eq('entity_type',$oQuery->createNamedParameter('hc_familytree_research_tasks')))
            ->andWhere($oQuery->expr()->eq('action',$oQuery->createNamedParameter('create')));
        $oOrigins=[];
        foreach($oQuery->executeQuery()->fetchAllAssociative() as $aHistory){
            if(preg_match('~^Import výzkumného deníku (.+) / ([a-zA-Z0-9._:-]+)$~u',(string)$aHistory['reason'],$aParts)){
                $oOrigins[(string)$aHistory['entity_uid']]=['source_id'=>$aParts[2],'import_source'=>$aParts[1]];
            }
        }
        return $oOrigins;
    }
    /**
 * @brief Sestaví výzkumný deník se seznamy úkolů, hledání, důkazů, návrhů a historie.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
    public function journal(int $nTreeId): array {
        $aTasks=$this->rows('hc_familytree_research_tasks',$nTreeId);
        $oOrigins=$this->taskOrigins($nTreeId);
        foreach($aTasks as &$oTask){
            $oSource=$oOrigins[(string)$oTask['stable_id']]??null;
            if($oSource!==null){$oTask['source_id']=$oSource['source_id'];$oTask['import_source']=$oSource['import_source'];}
        }
        unset($oTask);
        return ['tasks'=>$aTasks,
            'searches'=>$this->rows('hc_familytree_search_log',$nTreeId),
            'evidence'=>$this->rows('hc_familytree_evidence',$nTreeId),
            'proposals'=>$this->rows('hc_familytree_proposals',$nTreeId),
            'history'=>$this->history($nTreeId)];
    }
}
