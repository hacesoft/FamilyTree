<?php
declare(strict_types=1);
/** One-time migration for the owner's development NAS. NEVER deletes genealogical rows.
 * Run in the nextcloud-app container as www-data after a MariaDB/Files backup.
 * Usage: php migrate-research-v2.php                 (dry-run)
 *        php migrate-research-v2.php --apply         (write missing stable IDs)
 */
require '/var/www/html/lib/base.php';
$db=\OC::$server->get(\OCP\IDBConnection::class);
$apply=in_array('--apply',$argv??[],true);
$tables=['hc_familytree_trees','hc_familytree_people','hc_familytree_relations','hc_familytree_events',
         'hc_familytree_documents','hc_familytree_doc_links','hc_familytree_shares','hc_familytree_research'];
$counts=[];
foreach ($tables as $table) {
    $q=$db->getQueryBuilder()->select('id','stable_id')->from($table);
    $rows=$q->executeQuery()->fetchAllAssociative();
    $missing=array_filter($rows,static fn($row)=>empty($row['stable_id']));
    $counts[$table]=count($missing);
    fprintf(STDERR,"[CHECK] %s: %d záznamů, %d bez stabilního ID\n",$table,count($rows),count($missing));
}
if (!$apply) { fwrite(STDERR,"DRY-RUN: Bez zápisu. Před --apply zazálohujte MariaDB i soubory.\n"); exit(0); }
$db->beginTransaction();
try {
    foreach ($tables as $table) {
        $q=$db->getQueryBuilder()->select('id','stable_id')->from($table);
        foreach ($q->executeQuery()->fetchAllAssociative() as $row) {
            if (!empty($row['stable_id'])) continue;
            $id=bin2hex(random_bytes(16));
            $u=$db->getQueryBuilder();
            $u->update($table)->set('stable_id',$u->createNamedParameter($id))
              ->where($u->expr()->eq('id',$u->createNamedParameter($row['id'])));
            $u->executeStatement();
        }
        fprintf(STDERR,"[OK] %s: doplněno %d identifikátorů\n",$table,$counts[$table]);
    }
    $db->commit();
} catch (\Throwable $error) { $db->rollBack(); throw $error; }
foreach ($tables as $table) {
    $q=$db->getQueryBuilder();
    $q->select('id')->from($table)->where($q->expr()->orX(
      $q->expr()->isNull('stable_id'),
      $q->expr()->eq('stable_id',$q->createNamedParameter(''))));
    if ($q->executeQuery()->fetchOne()!==false) throw new \RuntimeException('Migrace nebyla úplná: '.$table);
}
fwrite(STDERR,"HOTOVO: stabilní ID doplněna, původní osoby, vztahy a výzkum zachovány.\n");
