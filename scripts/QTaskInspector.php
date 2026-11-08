<?php
declare(strict_types=1);
/**
 * FamilyTree: read-only comparison of legacy Q task identifiers and journal tasks.
 * CZ: Původní tvrzení, importované zdroje ani deník se zde neupravují.
 */
final class QTaskInspector {
    /** CZ: Vrátí původní Q z archivních řádků a textových poznámek osob. */
    public static function inspect(array $people, array $research, array $journal, array $history): array {
        $externalPeople=[];
        foreach($research as $record){
            if(($record['entity_type']??'')!=='persons'||empty($record['native_id']))continue;
            $externalPeople[(string)($record['origin_key']??'').'/'.(string)($record['external_id']??'')]=(int)$record['native_id'];
        }
        $legacy=[];
        foreach($research as $record){
            if(($record['entity_type']??'')!=='research')continue;
            $data=json_decode((string)($record['payload_json']??'{}'),true);
            if(!is_array($data))continue;
            $code=strtoupper(trim((string)($data['external_task_id']??$record['external_id']??'')));
            if(!preg_match('/^Q[0-9]{3,8}$/D',$code))continue;
            $origin=(string)($record['origin_key']??'');
            $key=$origin.'/'.$code;
            $persons=[];
            foreach(($data['target_person_ids']??[]) as $ref){
                $person=$externalPeople[$origin.'/'.(string)$ref]??null;
                if($person!==null)$persons[$person]=true;
            }
            $legacy[$key]=[
                'code'=>$code,'origin'=>$origin,'source'=>'research','persons'=>$persons,
                'title'=>trim((string)($data['title']??$data['question']??'')),
                'status'=>strtolower(trim((string)($data['status']??'unknown'))),
                'attempts'=>trim((string)($data['attempts']??'')),
                'result'=>trim((string)($data['result']??'')),
                'next_step'=>trim((string)($data['next_step']??'')),
            ];
        }
        foreach($people as $person){
            $native=(int)($person['id']??0);
            $notes=str_replace(["\r\n","\r"],"\n",(string)($person['notes']??''));
            if(!preg_match_all('/(?:^|\n)[ \t]*Výzkumný[ \t]+úkol[ \t]+(Q[0-9]{3,8})[ \t]*[—–-][ \t]*([^\n]*)/iu',$notes,$hits,PREG_OFFSET_CAPTURE))continue;
            foreach($hits[1] as $index=>$hit){
                $code=strtoupper($hit[0]);
                $from=$hits[0][$index][1];
                $to=$hits[0][$index+1][1]??strlen($notes);
                $fragment=substr($notes,$from,$to-$from);
                $field=static function(string $name)use($fragment):string{
                    $pattern='/^\s*'.preg_quote($name,'/').'\s*:\s*([^\n]*)/miu';
                    return preg_match($pattern,$fragment,$match)?rtrim(trim($match[1]),'. '):'';
                };
                $candidateKeys=[];
                foreach($legacy as $key=>$item)if($item['code']===$code&&$item['source']==='research')$candidateKeys[]=$key;
                $matched=[];
                foreach($candidateKeys as $key)if(isset($legacy[$key]['persons'][$native]))$matched[]=$key;
                if(count($matched)===1)$key=$matched[0];
                elseif(count($candidateKeys)===1)$key=$candidateKeys[0];
                else $key='person-notes:'.$native.'/'.$code;
                if(!isset($legacy[$key])){
                    $legacy[$key]=['code'=>$code,'origin'=>'person-notes:'.$native,'source'=>'notes','persons'=>[],
                        'title'=>trim((string)$hits[2][$index][0]),'status'=>strtolower($field('Stav'))?:'unknown',
                        'attempts'=>$field('Pokusy'),'result'=>$field('Výsledek'),'next_step'=>$field('Další krok')];
                }
                $legacy[$key]['persons'][$native]=true;
                if($legacy[$key]['title']==='')$legacy[$key]['title']=trim((string)$hits[2][$index][0]);
                foreach(['attempts'=>'Pokusy','result'=>'Výsledek','next_step'=>'Další krok'] as $f=>$label){
                    if($legacy[$key][$f]==='')$legacy[$key][$f]=$field($label);
                }
            }
        }
        $imported=[];
        foreach($history as $entry){
            if(($entry['entity_type']??'')!=='hc_familytree_research_tasks'||($entry['action']??'')!=='create')continue;
            if(preg_match('~^Import výzkumného deníku (.+) / ([a-zA-Z0-9._:-]+)$~u',(string)($entry['reason']??''),$found)){
                $imported[(string)$entry['entity_uid']]=['source'=>$found[1],'code'=>strtoupper($found[2])];
            }
        }
        $codes=[];
        foreach($legacy as $item){$codes[$item['code']]['legacy'][]=$item;}
        foreach($journal as $task){
            $code=$imported[(string)($task['stable_id']??'')]['code']??'';
            if(!preg_match('/^Q[0-9]{3,8}$/D',$code))continue;
            $refs=json_decode((string)($task['person_refs_json']??'[]'),true);
            $codes[$code]['journal'][]=['id'=>(int)($task['id']??0),'source'=>$imported[(string)$task['stable_id']]['source'],'refs'=>is_array($refs)?$refs:[],
                'status'=>(string)($task['status']??''),'title'=>(string)($task['title']??'')];
        }
        ksort($codes,SORT_NATURAL);
        $items=[];$counts=['already_linked'=>0,'legacy_only'=>0,'journal_only'=>0,'collision'=>0];
        foreach($codes as $code=>$group){
            $old=$group['legacy']??[];$new=$group['journal']??[];
            $origins=array_unique(array_column($old,'origin'));
            if(count($old)>1||count($new)>1)$status='collision';
            elseif(count($old)===1&&count($new)===1)$status='already_linked';
            elseif($old)$status='legacy_only';
            else $status='journal_only';
            $counts[$status]++;
            $items[]=['code'=>$code,'status'=>$status,'sources'=>array_values($origins),'legacy'=>$old,'journal'=>$new];
        }
        return ['counts'=>$counts,'items'=>$items,'unknown_journal_tasks'=>count($journal)-array_sum(array_map(static fn($row)=>count($row['journal']??[]),$codes))];
    }
}
