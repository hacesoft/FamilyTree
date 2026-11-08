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
 * CZ: Přenosná forma výzkumného deníku. Audit a návrhy se přenášejí jen úplnou zálohou v2.
 * Výstup lze importovat do jiného stromu bez znalosti interních SQL identifikátorů.
 */
final class ResearchJournalInterchange {
    /**
 * @brief Exportuje research journal interchange používané v ResearchJournalInterchange.
 * @param string $sTreeStable Vstupní parametr „treeStable“ pro operaci export.
 * @param array $aTasks Vstupní parametr „tasks“ pro operaci export.
 * @param array $aSearches Vstupní parametr „searches“ pro operaci export.
 * @param array $aEvidence Vstupní parametr „evidence“ pro operaci export.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
    public static function export(string $sTreeStable,array $aTasks,array $aSearches,array $aEvidence):array {
        if(!preg_match('/^[a-f0-9]{32}$/D',$sTreeStable))throw new \InvalidArgumentException('Family tree has no stable ID.');
        $oTaskIds=[];
        foreach($aTasks as $oRow)$oTaskIds[(string)$oRow['stable_id']]=true;
        $oDocument=[
            'format'=>'hc-familytree-research-journal',
            'formatVersion'=>1,
            'source'=>'familytree-export-'.$sTreeStable,
            'origin_tree'=>$sTreeStable,
            'notice'=>'Research transfer, not a full backup: genealogical facts, change proposals, history and media are not included. Previously verified findings must be reviewed again when imported into another tree.',
            'tasks'=>[], 'searches'=>[], 'evidence'=>[],
        ];
        foreach($aTasks as $oRow){
            $oRefs=json_decode((string)($oRow['person_refs_json']??'[]'),true);
            if(!is_array($oRefs)||!array_is_list($oRefs))throw new \InvalidArgumentException('Invalid person references in research task.');
            $oDocument['tasks'][]=[
                'source_id'=>(string)$oRow['stable_id'],'title'=>(string)$oRow['title'],
                'status'=>(string)$oRow['status'],'priority'=>(string)$oRow['priority'],
                'person_refs'=>$oRefs,'hypothesis'=>(string)($oRow['hypothesis']??''),
                'next_action'=>(string)($oRow['next_action']??''),
            ];
        }
        foreach($aSearches as $oRow){
            $oRef=(string)($oRow['task_uid']??'');
            if($oRef!==''&&!isset($oTaskIds[$oRef]))throw new \InvalidArgumentException('Search references a missing task.');
            $oDocument['searches'][]=[
                'source_id'=>(string)$oRow['stable_id'],'task_ref'=>$oRef,
                'query_text'=>(string)$oRow['query_text'], 'source_url'=>(string)($oRow['source_url']??''),
                'outcome'=>(string)$oRow['outcome'],'notes'=>(string)($oRow['notes']??''),
            ];
        }
        foreach($aEvidence as $oRow){
            $oRef=(string)($oRow['task_uid']??'');
            if($oRef!==''&&!isset($oTaskIds[$oRef]))throw new \InvalidArgumentException('Evidence references a missing task.');
            $bVerified=($oRow['status']??'')==='verified';
            $aNotes=(string)($oRow['notes']??'');
            if($bVerified)$aNotes.="\n[Export FamilyTree: původně ověřeno uživatelem; při přenosu vyžaduje nové ruční ověření.]";
            $oDocument['evidence'][]=[
                'source_id'=>(string)$oRow['stable_id'],'task_ref'=>$oRef,
                'status'=>$bVerified?'transcribed':(string)$oRow['status'],
                'archive'=>(string)($oRow['archive']??''),'signature'=>(string)($oRow['signature']??''),
                'source_url'=>(string)($oRow['source_url']??''), 'image_number'=>(string)($oRow['image_number']??''),
                'transcription'=>(string)($oRow['transcription']??''),'notes'=>$aNotes,
                'confidence_label'=>$bVerified?'requires_review':(string)($oRow['confidence_label']??''),
            ];
        }
        // Import preview accepts <=1 MiB and validates the same limits; never produce incompatible JSON.
        $sJson=ResearchJournalService::json($oDocument);
        if(strlen($sJson)>1024*1024)throw new \InvalidArgumentException('Journal exceeds 1 MiB for JSON transfer; use a complete ZIP backup v2.');
        return $oDocument;
    }
}
