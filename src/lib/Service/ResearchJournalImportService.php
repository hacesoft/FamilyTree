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
 * CZ: Jednorázový i opakovaný bezpečný import strukturovaného výzkumného deníku.
 * Jen úkoly, hledání a kandidátní důkazy; žádné změny genealogických faktů.
 */
final class ResearchJournalImportService {
    private const TABLES = [
        'tasks' => 'hc_familytree_research_tasks',
        'searches' => 'hc_familytree_search_log',
        'evidence' => 'hc_familytree_evidence',
    ];
    private const MAXIMUM = ['tasks'=>500, 'searches'=>1000, 'evidence'=>500];

    /**
 * @brief Inicializuje instanci a propojí předané závislosti.
 * @param IDBConnection $oDb Databázové připojení.
 * @param ResearchJournalService $oJournal Služba výzkumného deníku.
 * @return void Konstruktor nevrací návratovou hodnotu.
 */
public function __construct(private IDBConnection $oDb, private ResearchJournalService $oJournal) {}

    /**
 * @brief Načte stabilní identifikátor původu položky výzkumného deníku.
 * @param int $nTreeId Jednoznačný identifikátor rodokmenu, k němuž se vztahuje operace.
 * @param string $sNamespace Vstupní parametr „namespace“ pro operaci sourceUid.
 * @param string $sKind Vstupní parametr „kind“ pro operaci sourceUid.
 * @param string $sSourceId Vstupní parametr „sourceId“ pro operaci sourceUid.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
    private static function sourceUid(int $nTreeId, string $sNamespace, string $sKind, string $sSourceId): string {
        return substr(hash('sha256', "hc-ft-journal-v1\0".$nTreeId."\0".$sNamespace."\0".$sKind."\0".$sSourceId), 0, 32);
    }
    /**
 * @brief Ověří a normalizuje textové pole importovaného deníku.
 * @param array $aData Zpracovávaná data.
 * @param string $sKey Vstupní parametr „key“ pro operaci text.
 * @param int $nMax Vstupní parametr „max“ pro operaci text.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
    private static function text(array $aData, string $sKey, int $nMax=2000): string {
        $sValue=$aData[$sKey]??'';
        if(!is_string($sValue) || mb_strlen($sValue)>$nMax)throw new \InvalidArgumentException('Invalid or excessively long value: '.$sKey);
        return trim($sValue);
    }
    /**
 * @brief Ověří hodnotu výběrového pole vůči povoleným možnostem.
 * @param array $aData Zpracovávaná data.
 * @param string $sKey Vstupní parametr „key“ pro operaci choice.
 * @param array $aAllowed Vstupní parametr „allowed“ pro operaci choice.
 * @param string $sDefault Vstupní parametr „default“ pro operaci choice.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
    private static function choice(array $aData,string $sKey,array $aAllowed,string $sDefault):string {
        $sValue=self::text($aData,$sKey,64) ?: $sDefault;
        if(!in_array($sValue,$aAllowed,true))throw new \InvalidArgumentException('Invalid value: '.$sKey);
        return $sValue;
    }
    /**
 * @brief Ověří adresu odkazu obsaženého v importovaném deníku.
 * @param array $aData Zpracovávaná data.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
    private static function url(array $aData):string {
        $sValue=self::text($aData,'source_url',1024);
        if($sValue!=='' && (!(filter_var($sValue,FILTER_VALIDATE_URL)) || !in_array(strtolower((string)parse_url($sValue,PHP_URL_SCHEME)),['https','http'],true)))
            throw new \InvalidArgumentException('Invalid archive URL.');
        return $sValue;
    }
    /**
 * @brief Předem analyzuje importovaný výzkumný deník bez zapsání změn.
 * @param int $nTreeId Jednoznačný identifikátor rodokmenu, k němuž se vztahuje operace.
 * @param array $aDocument Vstupní parametr „document“ pro operaci inspect.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
    public function inspect(int $nTreeId,array $aDocument):array {
        if(strlen(ResearchJournalService::json($aDocument))>1024*1024)throw new \InvalidArgumentException('Research journal exceeds 1 MiB.');
        if(($aDocument['format']??null)!=='hc-familytree-research-journal' || ($aDocument['formatVersion']??null)!==1)
            throw new \InvalidArgumentException('Invalid research journal format or version.');
        $sNamespace=$aDocument['source']??null;
        if(!is_string($sNamespace)||!preg_match('/^[a-zA-Z0-9._-]{1,80}$/D',$sNamespace))throw new \InvalidArgumentException('Invalid source dataset label.');
        // CZ: Reimport exportu do stejného stromu nezakládá duplicity.
        $oOrigin=$aDocument['origin_tree']??'';
        if(!is_string($oOrigin)||($oOrigin!==''&&!preg_match('/^[a-f0-9]{32}$/D',$oOrigin)))
            throw new \InvalidArgumentException('Invalid original family tree identifier.');
        $oSameOrigin=false;
        if($oOrigin!==''){
            // CZ: Identitu stromu ověřujeme pouze u exportu s origin_tree.
            // Starší běžné importní JSONy nevyžadují další databázový dotaz.
            $oTreeQuery=$this->oDb->getQueryBuilder();
            $oTreeQuery->select('stable_id')->from('hc_familytree_trees')
                ->where($oTreeQuery->expr()->eq('id',$oTreeQuery->createNamedParameter($nTreeId)));
            $oTreeStable=(string)($oTreeQuery->executeQuery()->fetchOne() ?: '');
            $oSameOrigin=$oTreeStable!==''&&hash_equals($oTreeStable,$oOrigin);
        }
        foreach(self::TABLES as $sKind=>$oTable){
            if(!isset($aDocument[$sKind]))$aDocument[$sKind]=[];
            if(!is_array($aDocument[$sKind])||!array_is_list($aDocument[$sKind])||count($aDocument[$sKind])>self::MAXIMUM[$sKind])
                throw new \InvalidArgumentException('Invalid record count or structure: '.$sKind);
        }
        $oExisting=[];
        foreach(self::TABLES as $sKind=>$sTable){
            $oExisting[$sKind]=[];
            foreach($this->oJournal->rows($sTable,$nTreeId) as $oRow)$oExisting[$sKind][(string)$oRow['stable_id']]=true;
        }
        $oOut=['source'=>$sNamespace,'counts'=>[],'items'=>[],'total_new'=>0,'total_existing'=>0,'warning'=>'Import does not alter people, relationships, events or existing records. Imported evidence cannot be automatically marked as verified.'];
        $oIncomingIds=[];
        foreach(self::TABLES as $sKind=>$sTable){
            $oSeen=[];$oOut['items'][$sKind]=[];$oOut['counts'][$sKind]=['new'=>0,'existing'=>0];
            foreach($aDocument[$sKind] as $aEntry){
                if(!is_array($aEntry))throw new \InvalidArgumentException('Invalid record in '.$sKind);
                $nId=self::text($aEntry,'source_id',96);
                if($nId==='' || !preg_match('/^[a-zA-Z0-9._:-]{1,96}$/D',$nId))throw new \InvalidArgumentException('Missing or invalid source_id in '.$sKind);
                if(isset($oSeen[$nId]))throw new \InvalidArgumentException('Duplicate source_id in file: '.$nId);
                $oSeen[$nId]=true;
                $sUid=($oSameOrigin && isset($oExisting[$sKind][$nId])) ? $nId : self::sourceUid($nTreeId,$sNamespace,$sKind,$nId);
                $oRow=$this->normalize($sKind,$aEntry);
                $oRow['stable_id']=$sUid;
                $oRow['source_id']=$nId;
                $oRow['existing']=isset($oExisting[$sKind][$sUid]);
                $oOut['counts'][$sKind][$oRow['existing']?'existing':'new']++;
                $oOut['items'][$sKind][]=$oRow;
                $oIncomingIds[$sKind][$nId]=$sUid;
            }
        }
        foreach(['searches','evidence'] as $sKind){
            foreach($oOut['items'][$sKind] as &$oRow){
                if($oRow['task_ref']===''){$oRow['task_uid']='';continue;}
                $sUid=$oIncomingIds['tasks'][$oRow['task_ref']]??($oSameOrigin && isset($oExisting['tasks'][$oRow['task_ref']]) ? $oRow['task_ref'] : self::sourceUid($nTreeId,$sNamespace,'tasks',$oRow['task_ref']));
                if(!isset($oIncomingIds['tasks'][$oRow['task_ref']])&&!isset($oExisting['tasks'][$sUid]))
                    throw new \InvalidArgumentException('Missing task for record '.$oRow['source_id'].': '.$oRow['task_ref']);
                $oRow['task_uid']=$sUid;
            }
            unset($oRow);
        }
        foreach($oOut['counts'] as $oV){$oOut['total_new']+=$oV['new'];$oOut['total_existing']+=$oV['existing'];}
        return $oOut;
    }
    /**
 * @brief Normalizuje research journal import service používané v ResearchJournalImportService.
 * @param string $sKind Vstupní parametr „kind“ pro operaci normalize.
 * @param array $aEntry Vstupní parametr „entry“ pro operaci normalize.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
    private function normalize(string $sKind,array $aEntry):array {
        if($sKind==='tasks'){
            $sTitle=self::text($aEntry,'title',255);
            if($sTitle==='')throw new \InvalidArgumentException('Empty task title.');
            $oPersons=$aEntry['person_refs']??[];
            if(!is_array($oPersons)||!array_is_list($oPersons)||count($oPersons)>100)throw new \InvalidArgumentException('Invalid person_refs.');
            foreach($oPersons as $oPerson)if(!is_string($oPerson)||mb_strlen($oPerson)>64)throw new \InvalidArgumentException('Invalid reference to person.');
            return ['title'=>$sTitle,'status'=>self::choice($aEntry,'status',['planned','in_progress','waiting_verify','done','rejected'],'planned'),
                'priority'=>self::choice($aEntry,'priority',['low','normal','high'],'normal'),
                'hypothesis'=>self::text($aEntry,'hypothesis',12000),'next_action'=>self::text($aEntry,'next_action',12000),'person_refs'=>$oPersons];
        }
        $oTaskRef=self::text($aEntry,'task_ref',96);
        if($sKind==='searches'){
            $oQuery=self::text($aEntry,'query_text',16000);
            if($oQuery==='')throw new \InvalidArgumentException('Empty search description.');
            return ['task_ref'=>$oTaskRef,'query_text'=>$oQuery,'source_url'=>self::url($aEntry),
                'outcome'=>self::choice($aEntry,'outcome',['unverified','no_result','candidate','found','rejected'],'unverified'),
                'notes'=>self::text($aEntry,'notes',16000)];
        }
        $sStatus=self::choice($aEntry,'status',['candidate','transcribed','rejected'],'candidate');
        return ['task_ref'=>$oTaskRef,'status'=>$sStatus,'archive'=>self::text($aEntry,'archive',255),
            'signature'=>self::text($aEntry,'signature',128),'source_url'=>self::url($aEntry),
            'image_number'=>self::text($aEntry,'image_number',64),'transcription'=>self::text($aEntry,'transcription',20000),
            'notes'=>self::text($aEntry,'notes',16000),'confidence_label'=>self::text($aEntry,'confidence_label',32)];
    }
    /**
 * @brief Provede uložení předem ověřených položek výzkumného deníku.
 * @param int $nTreeId Jednoznačný identifikátor rodokmenu, k němuž se vztahuje operace.
 * @param array $aDocument Vstupní parametr „document“ pro operaci apply.
 * @param string $sActor Identifikátor uživatele, který provedl změnu.
 * @param bool $bExternalTransaction Při true transakci zahajuje a potvrzuje volající.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
    public function apply(int $nTreeId,array $aDocument,string $sActor,bool $bExternalTransaction=false):array {
        if (!$bExternalTransaction) $this->oDb->beginTransaction();
        try{
            $oReport=$this->inspect($nTreeId,$aDocument);
            $nNow=time();
            foreach(self::TABLES as $sKind=>$sTable){
                foreach($oReport['items'][$sKind] as $oItem){
                    if($oItem['existing'])continue;
                    $sSourceId=$oItem['source_id'];$sUid=$oItem['stable_id'];
                    unset($oItem['source_id'],$oItem['existing'],$oItem['task_ref']);
                    $sTaskUid=$oItem['task_uid']??'';unset($oItem['task_uid']);
                    $aData=['tree_id'=>$nTreeId,'stable_id'=>$sUid];
                    if($sKind==='tasks'){
                        $oPersons=$oItem['person_refs'];unset($oItem['person_refs']);
                        $aData+= $oItem;
                        $aData+=['person_refs_json'=>ResearchJournalService::json($oPersons),'created_by'=>$sActor,'updated_by'=>$sActor,'created_at'=>$nNow,'updated_at'=>$nNow];
                    } elseif($sKind==='searches'){
                        $aData+= $oItem;
                        $aData+=['task_uid'=>$sTaskUid,'actor_uid'=>$sActor,'created_at'=>$nNow];
                    } else {
                        $aData+= $oItem;
                        $aData+=['task_uid'=>$sTaskUid,'metadata_json'=>ResearchJournalService::json(['import_source'=>$oReport['source'],'source_id'=>$sSourceId,'verification'=>'requires_manual_review']),
                            'created_by'=>$sActor,'created_at'=>$nNow,'updated_at'=>$nNow];
                    }
                    $nId=$this->oJournal->insert($sTable,$aData);
                    $oAfter=$this->oJournal->row($sTable,$nId);
                    $this->oJournal->audit($nTreeId,$sTable,$sUid,'create',$sActor,null,$oAfter,'Import výzkumného deníku '.$oReport['source'].' / '.$sSourceId);
                }
            }
            if (!$bExternalTransaction) $this->oDb->commit();
            unset($oReport['items']);
            return $oReport;
        }catch(\Throwable $oError){if (!$bExternalTransaction) $this->oDb->rollBack();throw $oError;}
    }
}
