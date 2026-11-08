<?php
declare(strict_types=1);
/**
 * CZ: Bezpečný DRY-RUN před jednorázovým sjednocením výzkumných úkolů Q.
 * V databázi se neprovede ŽÁDNÝ INSERT, UPDATE ani DELETE.
 *
 * sudo docker cp scripts/QTaskInspector.php nextcloud-app:/tmp/QTaskInspector.php
 * sudo docker cp scripts/inspect-q-before-repair.php nextcloud-app:/tmp/inspect-q-before-repair.php
 * sudo docker exec -u root nextcloud-app chmod 644 /tmp/QTaskInspector.php /tmp/inspect-q-before-repair.php
 * sudo docker exec -u www-data nextcloud-app php /tmp/inspect-q-before-repair.php --tree-id=2
 */
require '/var/www/html/lib/base.php';
require __DIR__.'/QTaskInspector.php';
if(PHP_SAPI!=='cli'){fwrite(STDERR,"Pouze CLI.\n");exit(2);}
$treeId=0;
foreach($argv as $argument){
    if(preg_match('/^--tree-id=([0-9]{1,12})$/D',$argument,$match))$treeId=(int)$match[1];
    elseif($argument!==$argv[0]){fwrite(STDERR,"Neplatný argument. Povolen je pouze --tree-id=ID.\n");exit(2);}
}
if($treeId<1){fwrite(STDERR,"Použití: php inspect-q-before-repair.php --tree-id=2\n");exit(2);}
$db=\OC::$server->get(\OCP\IDBConnection::class);
$read=static function(string $table,array $filters) use($db):array{
    $q=$db->getQueryBuilder();$q->select('*')->from($table);
    foreach($filters as $key=>$value)$q->andWhere($q->expr()->eq($key,$q->createNamedParameter($value)));
    return $q->executeQuery()->fetchAllAssociative();
};
$trees=$read('hc_familytree_trees',['id'=>$treeId]);
if(count($trees)!==1){fwrite(STDERR,"Rodokmen s tímto ID neexistuje.\n");exit(2);}
fprintf(STDOUT,"[01/06] Rodokmen #%d: %s ..... OK\n",$treeId,$trees[0]['name']);
$people=$read('hc_familytree_people',['tree_id'=>$treeId]);
fprintf(STDOUT,"[02/06] Načtení osob: %d ..... OK\n",count($people));
$research=$read('hc_familytree_research',['tree_id'=>$treeId]);
fprintf(STDOUT,"[03/06] Načtení původního archivu: %d ..... OK\n",count($research));
$tasks=$read('hc_familytree_research_tasks',['tree_id'=>$treeId]);
fprintf(STDOUT,"[04/06] Načtení aktuálního deníku: %d ..... OK\n",count($tasks));
$history=$read('hc_familytree_history',['tree_id'=>$treeId]);
fprintf(STDOUT,"[05/06] Načtení auditních vazeb: %d ..... OK\n",count($history));
$report=QTaskInspector::inspect($people,$research,$tasks,$history);
printf("[06/06] Porovnání původních a nových Q ..... OK\n\n");
$labels=['already_linked'=>'Již jednoznačně propojeno','legacy_only'=>'Pouze v původním archivu','journal_only'=>'Pouze v novém deníku','collision'=>'NEJASNÁ SHODA – NEMĚNIT'];
foreach($report['items'] as $item){
    $descriptions=[];
    foreach($item['legacy'] as $legacy){
        $descriptions[]=$legacy['origin'].' / '.implode(',',array_keys($legacy['persons']));
    }
    $current=array_map(static fn($t)=>'#'.$t['id'].' ['.$t['source'].']',$item['journal']);
    printf("%-10s %-31s archiv=%d deník=%d %s %s\n",
        $item['code'],$labels[$item['status']],count($item['legacy']),count($item['journal']),
        $descriptions?'(archiv '.implode('; ',$descriptions).')':'',
        $current?'(deník '.implode('; ',$current).')':'');
}
print("\nSOUHRN:\n");
foreach($labels as $key=>$label)printf("  %-32s %d\n",$label,$report['counts'][$key]);
printf("  Úkolů v deníku bez kódu Q:    %d\n",$report['unknown_journal_tasks']);
print("\nDRY-RUN: NIC NEBYLO ZMĚNĚNO. Neprovádějte ruční SQL slučování podle samotného čísla Q.\n");
