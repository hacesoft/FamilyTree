<?php
declare(strict_types=1);

// Re-run on EVERY install, including an interrupted install at the same version.
// Only append absent application tables, columns and indexes. Never drop data.
require '/var/www/html/lib/base.php';
$db = \OC::$server->get(\OCP\IDBConnection::class);
$prefix = (string)\OC::$server->get(\OCP\IConfig::class)->getSystemValue('dbtableprefix', 'oc_');
if (!preg_match('/^[A-Za-z0-9_]+$/D', $prefix)) {
    throw new \RuntimeException('Invalid Nextcloud table prefix');
}
$schema = $db->createSchema();
$changed = false;
$addColumn = static function ($table, string $name, string $type, array $options = []) use (&$changed): void {
    if (!$table->hasColumn($name)) {
        $table->addColumn($name, $type, $options);
        $changed = true;
    }
};
$addIndex = static function ($table, array $columns, string $name, bool $unique = false) use (&$changed): void {
    if (!$table->hasIndex($name)) {
        if ($unique) $table->addUniqueIndex($columns, $name);
        else $table->addIndex($columns, $name);
        $changed = true;
    }
};
$setPrimaryKey = static function ($table, array $columns) use (&$changed): void {
    if (!$table->hasPrimaryKey()) {
        $table->setPrimaryKey($columns);
        $changed = true;
    }
};

// hc_familytree_trees
if (!$schema->hasTable($prefix . 'hc_familytree_trees')) $changed = true;
{
$table = $schema->hasTable($prefix . 'hc_familytree_trees') ? $schema->getTable($prefix . 'hc_familytree_trees') : $schema->createTable($prefix . 'hc_familytree_trees');
            $addColumn($table, 'id', 'bigint', ['autoincrement' => true, 'notnull' => true, 'unsigned' => true]);
            $addColumn($table, 'owner_uid', 'string', ['length' => 64]);
            $addColumn($table, 'name', 'string', ['length' => 255]);
            $addColumn($table, 'description', 'text', ['notnull' => false]);
            $addColumn($table, 'root_person_id', 'bigint', ['notnull' => false, 'unsigned' => true]);
            $addColumn($table, 'created_at', 'bigint');
            $addColumn($table, 'updated_at', 'bigint');
            $setPrimaryKey($table, ['id']);
            $addIndex($table, ['owner_uid'], 'hc_ft_tree_owner');
}

// hc_familytree_people
if (!$schema->hasTable($prefix . 'hc_familytree_people')) $changed = true;
{
$table = $schema->hasTable($prefix . 'hc_familytree_people') ? $schema->getTable($prefix . 'hc_familytree_people') : $schema->createTable($prefix . 'hc_familytree_people');
            $addColumn($table, 'id', 'bigint', ['autoincrement' => true, 'notnull' => true, 'unsigned' => true]);
            $addColumn($table, 'tree_id', 'bigint', ['unsigned' => true]);
            foreach (['given_name', 'surname', 'birth_surname', 'gender', 'birth_date', 'death_date', 'birth_place', 'death_place', 'occupation'] as $name) {
                $addColumn($table, $name, 'string', ['length' => 255, 'default' => '']);
            }
            $addColumn($table, 'photo_url', 'string', ['length' => 1024, 'default' => '']);
            $addColumn($table, 'is_living', 'boolean', ['default' => true]);
            $addColumn($table, 'notes', 'text', ['notnull' => false]);
            $addColumn($table, 'layout_x', 'integer', ['notnull' => false]);
            $addColumn($table, 'layout_y', 'integer', ['notnull' => false]);
            $addColumn($table, 'created_at', 'bigint');
            $addColumn($table, 'updated_at', 'bigint');
            $setPrimaryKey($table, ['id']);
            $addIndex($table, ['tree_id'], 'hc_ft_person_tree');
            $addIndex($table, ['tree_id', 'surname'], 'hc_ft_person_name');
}

// hc_familytree_relations
if (!$schema->hasTable($prefix . 'hc_familytree_relations')) $changed = true;
{
$table = $schema->hasTable($prefix . 'hc_familytree_relations') ? $schema->getTable($prefix . 'hc_familytree_relations') : $schema->createTable($prefix . 'hc_familytree_relations');
            $addColumn($table, 'id', 'bigint', ['autoincrement' => true, 'notnull' => true, 'unsigned' => true]);
            $addColumn($table, 'tree_id', 'bigint', ['unsigned' => true]);
            $addColumn($table, 'person1_id', 'bigint', ['unsigned' => true]);
            $addColumn($table, 'person2_id', 'bigint', ['unsigned' => true]);
            $addColumn($table, 'type', 'string', ['length' => 32]);
            $addColumn($table, 'start_date', 'string', ['length' => 32, 'default' => '']);
            $addColumn($table, 'end_date', 'string', ['length' => 32, 'default' => '']);
            $addColumn($table, 'notes', 'text', ['notnull' => false]);
            $setPrimaryKey($table, ['id']);
            $addIndex($table, ['tree_id'], 'hc_ft_rel_tree');
            $addIndex($table, ['tree_id', 'person1_id', 'person2_id', 'type'], 'hc_ft_rel_unique', true);
}

// hc_familytree_events
if (!$schema->hasTable($prefix . 'hc_familytree_events')) $changed = true;
{
$table = $schema->hasTable($prefix . 'hc_familytree_events') ? $schema->getTable($prefix . 'hc_familytree_events') : $schema->createTable($prefix . 'hc_familytree_events');
            $addColumn($table, 'id', 'bigint', ['autoincrement' => true, 'notnull' => true, 'unsigned' => true]);
            $addColumn($table, 'tree_id', 'bigint', ['unsigned' => true]);
            $addColumn($table, 'person_id', 'bigint', ['unsigned' => true]);
            $addColumn($table, 'type', 'string', ['length' => 64]);
            $addColumn($table, 'title', 'string', ['length' => 255]);
            $addColumn($table, 'event_date', 'string', ['length' => 32, 'default' => '']);
            $addColumn($table, 'place', 'string', ['length' => 255, 'default' => '']);
            $addColumn($table, 'description', 'text', ['notnull' => false]);
            $setPrimaryKey($table, ['id']);
            $addIndex($table, ['person_id'], 'hc_ft_event_person');
}

// hc_familytree_documents
if (!$schema->hasTable($prefix . 'hc_familytree_documents')) $changed = true;
{
$table = $schema->hasTable($prefix . 'hc_familytree_documents') ? $schema->getTable($prefix . 'hc_familytree_documents') : $schema->createTable($prefix . 'hc_familytree_documents');
            $addColumn($table, 'id', 'bigint', ['autoincrement' => true, 'notnull' => true, 'unsigned' => true]);
            $addColumn($table, 'tree_id', 'bigint', ['unsigned' => true]);
            $addColumn($table, 'person_id', 'bigint', ['notnull' => false, 'unsigned' => true]);
            $addColumn($table, 'title', 'string', ['length' => 255]);
            foreach (['document_type' => 64, 'document_date' => 32, 'place' => 255, 'archive' => 255, 'signature' => 255, 'source' => 1024, 'mime_type' => 127] as $name => $length) {
                $addColumn($table, $name, 'string', ['length' => $length, 'notnull' => false]);
            }
            $addColumn($table, 'file_path', 'string', ['length' => 1024]);
            $addColumn($table, 'description', 'text', ['notnull' => false]);
            $addColumn($table, 'created_at', 'bigint', ['default' => 0]);
            $addColumn($table, 'updated_at', 'bigint', ['default' => 0]);
            $setPrimaryKey($table, ['id']);
            $addIndex($table, ['tree_id'], 'hc_ft_doc_tree');
            $addIndex($table, ['person_id'], 'hc_ft_doc_person');
}

// hc_familytree_doc_links
if (!$schema->hasTable($prefix . 'hc_familytree_doc_links')) $changed = true;
{
$table = $schema->hasTable($prefix . 'hc_familytree_doc_links') ? $schema->getTable($prefix . 'hc_familytree_doc_links') : $schema->createTable($prefix . 'hc_familytree_doc_links');
            $addColumn($table, 'id', 'bigint', ['autoincrement' => true, 'notnull' => true, 'unsigned' => true]);
            $addColumn($table, 'document_id', 'bigint', ['unsigned' => true]);
            $addColumn($table, 'tree_id', 'bigint', ['unsigned' => true]);
            $addColumn($table, 'link_type', 'string', ['length' => 16]);
            $addColumn($table, 'target_id', 'bigint', ['unsigned' => true]);
            $setPrimaryKey($table, ['id']);
            $addIndex($table, ['tree_id'], 'hc_ft_dl_tree');
            $addIndex($table, ['document_id'], 'hc_ft_dl_doc');
            $addIndex($table, ['document_id', 'link_type', 'target_id'], 'hc_ft_dl_unique', true);
}

// hc_familytree_shares
if (!$schema->hasTable($prefix . 'hc_familytree_shares')) $changed = true;
{
$table = $schema->hasTable($prefix . 'hc_familytree_shares') ? $schema->getTable($prefix . 'hc_familytree_shares') : $schema->createTable($prefix . 'hc_familytree_shares');
            $addColumn($table, 'id', 'bigint', ['autoincrement' => true, 'notnull' => true, 'unsigned' => true]);
            $addColumn($table, 'tree_id', 'bigint', ['unsigned' => true]);
            $addColumn($table, 'share_type', 'string', ['length' => 16]);
            $addColumn($table, 'share_with', 'string', ['length' => 64]);
            $addColumn($table, 'permission', 'string', ['length' => 16, 'default' => 'view']);
            $setPrimaryKey($table, ['id']);
            $addIndex($table, ['tree_id', 'share_type', 'share_with'], 'hc_ft_share_unique', true);
}

// Lossless research records keep the source IDs and every variant alongside the
// existing editable graph. A reimport with the same origin and ID is idempotent.
if (!$schema->hasTable($prefix . 'hc_familytree_research')) $changed = true;
{
$table = $schema->hasTable($prefix . 'hc_familytree_research') ? $schema->getTable($prefix . 'hc_familytree_research') : $schema->createTable($prefix . 'hc_familytree_research');
            $addColumn($table, 'id', 'bigint', ['autoincrement' => true, 'notnull' => true, 'unsigned' => true]);
            $addColumn($table, 'tree_id', 'bigint', ['unsigned' => true]);
            $addColumn($table, 'origin_key', 'string', ['length' => 64]);
            $addColumn($table, 'entity_type', 'string', ['length' => 24]);
            $addColumn($table, 'external_id', 'string', ['length' => 64]);
            $addColumn($table, 'native_id', 'bigint', ['notnull' => false, 'unsigned' => true]);
            $addColumn($table, 'payload_json', 'text');
            $addColumn($table, 'media_path', 'string', ['length' => 1024, 'default' => '']);
            $setPrimaryKey($table, ['id']);
            $addIndex($table, ['tree_id'], 'hc_ft_research_tree');
            $addIndex($table, ['tree_id', 'origin_key', 'entity_type', 'external_id'], 'hc_ft_research_origin', true);
}

$required = [];
foreach (['hc_familytree_trees', 'hc_familytree_people', 'hc_familytree_relations', 'hc_familytree_events', 'hc_familytree_documents', 'hc_familytree_doc_links', 'hc_familytree_shares', 'hc_familytree_research'] as $logical) {
    $table = $schema->getTable($prefix . $logical);
    $required[$logical] = ['columns' => array_keys($table->getColumns()), 'indexes' => array_diff(array_keys($table->getIndexes()), ['primary'])];
}

if ($changed) {
    $db->migrateToSchema($schema);
}
// Verify from a fresh snapshot; metadata in $schema alone is insufficient.
$verified = $db->createSchema();
foreach ($required as $logical => $parts) {
    $physical = $prefix . $logical;
    if (!$verified->hasTable($physical)) throw new \RuntimeException('Missing table: ' . $physical);
    $table = $verified->getTable($physical);
    foreach ($parts['columns'] as $column) {
        if (!$table->hasColumn($column)) throw new \RuntimeException('Missing column: ' . $physical . '.' . $column);
    }
    foreach ($parts['indexes'] as $index) {
        if (!$table->hasIndex($index)) throw new \RuntimeException('Missing index: ' . $physical . '.' . $index);
    }
}
echo "Database schema: OK (" . count($required) . " tables)\n";
