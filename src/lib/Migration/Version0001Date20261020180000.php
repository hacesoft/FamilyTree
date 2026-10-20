<?php

declare(strict_types=1);

namespace OCA\HcFamilyTree\Migration;

use Closure;
use OCP\DB\ISchemaWrapper;
use OCP\DB\Types;
use OCP\Migration\IOutput;
use OCP\Migration\SimpleMigrationStep;

/**
 * Baseline v1. Non-destructive: creates missing tables/fields/indexes only.
 * Uses Nextcloud's prefix-aware schema wrapper; existing family data are retained.
 */
final class Version0001Date20261020180000 extends SimpleMigrationStep {
    public function changeSchema(IOutput $output, Closure $schemaClosure, array $options): ?ISchemaWrapper {
        /** @var ISchemaWrapper $schema */
        $schema = $schemaClosure();
        $addColumn = static function ($table, string $name, string $type, array $options = []): void {
            if (!$table->hasColumn($name)) $table->addColumn($name, $type, $options);
        };
        $addIndex = static function ($table, array $columns, string $name, bool $unique = false): void {
            if (!$table->hasIndex($name)) {
                if ($unique) $table->addUniqueIndex($columns, $name);
                else $table->addIndex($columns, $name);
            }
        };
        $setPrimaryKey = static function ($table, array $columns): void {
            if ($table->getPrimaryKey() === null) $table->setPrimaryKey($columns);
        };
        // hc_familytree_trees
        {
        $table = $schema->hasTable('hc_familytree_trees') ? $schema->getTable('hc_familytree_trees') : $schema->createTable('hc_familytree_trees');
                    $addColumn($table, 'id', Types::BIGINT, ['autoincrement' => true, 'notnull' => true, 'unsigned' => true]);
                    $addColumn($table, 'owner_uid', Types::STRING, ['length' => 64]);
                    $addColumn($table, 'name', Types::STRING, ['length' => 255]);
                    $addColumn($table, 'description', Types::TEXT, ['notnull' => false]);
                    $addColumn($table, 'root_person_id', Types::BIGINT, ['notnull' => false, 'unsigned' => true]);
                    $addColumn($table, 'created_at', Types::BIGINT);
                    $addColumn($table, 'updated_at', Types::BIGINT);
                    $setPrimaryKey($table, ['id']);
                    $addIndex($table, ['owner_uid'], 'hc_ft_tree_owner');
        }
        
        // hc_familytree_people
        {
        $table = $schema->hasTable('hc_familytree_people') ? $schema->getTable('hc_familytree_people') : $schema->createTable('hc_familytree_people');
                    $addColumn($table, 'id', Types::BIGINT, ['autoincrement' => true, 'notnull' => true, 'unsigned' => true]);
                    $addColumn($table, 'tree_id', Types::BIGINT, ['unsigned' => true]);
                    foreach (['given_name', 'surname', 'birth_surname', 'gender', 'birth_date', 'death_date', 'birth_place', 'death_place', 'occupation'] as $name) {
                        $addColumn($table, $name, Types::STRING, ['length' => 255, 'default' => '']);
                    }
                    $addColumn($table, 'photo_url', Types::STRING, ['length' => 1024, 'default' => '']);
                    $addColumn($table, 'is_living', Types::BOOLEAN, ['default' => true]);
                    $addColumn($table, 'notes', Types::TEXT, ['notnull' => false]);
                    $addColumn($table, 'layout_x', Types::INTEGER, ['notnull' => false]);
                    $addColumn($table, 'layout_y', Types::INTEGER, ['notnull' => false]);
                    $addColumn($table, 'created_at', Types::BIGINT);
                    $addColumn($table, 'updated_at', Types::BIGINT);
                    $setPrimaryKey($table, ['id']);
                    $addIndex($table, ['tree_id'], 'hc_ft_person_tree');
                    $addIndex($table, ['tree_id', 'surname'], 'hc_ft_person_name');
        }
        
        // hc_familytree_relations
        {
        $table = $schema->hasTable('hc_familytree_relations') ? $schema->getTable('hc_familytree_relations') : $schema->createTable('hc_familytree_relations');
                    $addColumn($table, 'id', Types::BIGINT, ['autoincrement' => true, 'notnull' => true, 'unsigned' => true]);
                    $addColumn($table, 'tree_id', Types::BIGINT, ['unsigned' => true]);
                    $addColumn($table, 'person1_id', Types::BIGINT, ['unsigned' => true]);
                    $addColumn($table, 'person2_id', Types::BIGINT, ['unsigned' => true]);
                    $addColumn($table, 'type', Types::STRING, ['length' => 32]);
                    $addColumn($table, 'start_date', Types::STRING, ['length' => 32, 'default' => '']);
                    $addColumn($table, 'end_date', Types::STRING, ['length' => 32, 'default' => '']);
                    $addColumn($table, 'notes', Types::TEXT, ['notnull' => false]);
                    $setPrimaryKey($table, ['id']);
                    $addIndex($table, ['tree_id'], 'hc_ft_rel_tree');
                    $addIndex($table, ['tree_id', 'person1_id', 'person2_id', 'type'], 'hc_ft_rel_unique', true);
        }
        
        // hc_familytree_events
        {
        $table = $schema->hasTable('hc_familytree_events') ? $schema->getTable('hc_familytree_events') : $schema->createTable('hc_familytree_events');
                    $addColumn($table, 'id', Types::BIGINT, ['autoincrement' => true, 'notnull' => true, 'unsigned' => true]);
                    $addColumn($table, 'tree_id', Types::BIGINT, ['unsigned' => true]);
                    $addColumn($table, 'person_id', Types::BIGINT, ['unsigned' => true]);
                    $addColumn($table, 'type', Types::STRING, ['length' => 64]);
                    $addColumn($table, 'title', Types::STRING, ['length' => 255]);
                    $addColumn($table, 'event_date', Types::STRING, ['length' => 32, 'default' => '']);
                    $addColumn($table, 'place', Types::STRING, ['length' => 255, 'default' => '']);
                    $addColumn($table, 'description', Types::TEXT, ['notnull' => false]);
                    $setPrimaryKey($table, ['id']);
                    $addIndex($table, ['person_id'], 'hc_ft_event_person');
        }
        
        // hc_familytree_documents
        {
        $table = $schema->hasTable('hc_familytree_documents') ? $schema->getTable('hc_familytree_documents') : $schema->createTable('hc_familytree_documents');
                    $addColumn($table, 'id', Types::BIGINT, ['autoincrement' => true, 'notnull' => true, 'unsigned' => true]);
                    $addColumn($table, 'tree_id', Types::BIGINT, ['unsigned' => true]);
                    $addColumn($table, 'person_id', Types::BIGINT, ['notnull' => false, 'unsigned' => true]);
                    $addColumn($table, 'title', Types::STRING, ['length' => 255]);
                    foreach (['document_type' => 64, 'document_date' => 32, 'place' => 255, 'archive' => 255, 'signature' => 255, 'source' => 1024, 'mime_type' => 127] as $name => $length) {
                        $addColumn($table, $name, Types::STRING, ['length' => $length, 'notnull' => false]);
                    }
                    $addColumn($table, 'file_path', Types::STRING, ['length' => 1024]);
                    $addColumn($table, 'description', Types::TEXT, ['notnull' => false]);
                    $addColumn($table, 'created_at', Types::BIGINT, ['default' => 0]);
                    $addColumn($table, 'updated_at', Types::BIGINT, ['default' => 0]);
                    $setPrimaryKey($table, ['id']);
                    $addIndex($table, ['tree_id'], 'hc_ft_doc_tree');
                    $addIndex($table, ['person_id'], 'hc_ft_doc_person');
        }
        
        // hc_familytree_doc_links
        {
        $table = $schema->hasTable('hc_familytree_doc_links') ? $schema->getTable('hc_familytree_doc_links') : $schema->createTable('hc_familytree_doc_links');
                    $addColumn($table, 'id', Types::BIGINT, ['autoincrement' => true, 'notnull' => true, 'unsigned' => true]);
                    $addColumn($table, 'document_id', Types::BIGINT, ['unsigned' => true]);
                    $addColumn($table, 'tree_id', Types::BIGINT, ['unsigned' => true]);
                    $addColumn($table, 'link_type', Types::STRING, ['length' => 16]);
                    $addColumn($table, 'target_id', Types::BIGINT, ['unsigned' => true]);
                    $setPrimaryKey($table, ['id']);
                    $addIndex($table, ['tree_id'], 'hc_ft_dl_tree');
                    $addIndex($table, ['document_id'], 'hc_ft_dl_doc');
                    $addIndex($table, ['document_id', 'link_type', 'target_id'], 'hc_ft_dl_unique', true);
        }
        
        // hc_familytree_shares
        {
        $table = $schema->hasTable('hc_familytree_shares') ? $schema->getTable('hc_familytree_shares') : $schema->createTable('hc_familytree_shares');
                    $addColumn($table, 'id', Types::BIGINT, ['autoincrement' => true, 'notnull' => true, 'unsigned' => true]);
                    $addColumn($table, 'tree_id', Types::BIGINT, ['unsigned' => true]);
                    $addColumn($table, 'share_type', Types::STRING, ['length' => 16]);
                    $addColumn($table, 'share_with', Types::STRING, ['length' => 64]);
                    $addColumn($table, 'permission', Types::STRING, ['length' => 16, 'default' => 'view']);
                    $setPrimaryKey($table, ['id']);
                    $addIndex($table, ['tree_id', 'share_type', 'share_with'], 'hc_ft_share_unique', true);
        }
        
        // Lossless research records keep the source IDs and every variant alongside the
        // existing editable graph. A reimport with the same origin and ID is idempotent.
        {
        $table = $schema->hasTable('hc_familytree_research') ? $schema->getTable('hc_familytree_research') : $schema->createTable('hc_familytree_research');
                    $addColumn($table, 'id', Types::BIGINT, ['autoincrement' => true, 'notnull' => true, 'unsigned' => true]);
                    $addColumn($table, 'tree_id', Types::BIGINT, ['unsigned' => true]);
                    $addColumn($table, 'origin_key', Types::STRING, ['length' => 64]);
                    $addColumn($table, 'entity_type', Types::STRING, ['length' => 24]);
                    $addColumn($table, 'external_id', Types::STRING, ['length' => 64]);
                    $addColumn($table, 'native_id', Types::BIGINT, ['notnull' => false, 'unsigned' => true]);
                    $addColumn($table, 'payload_json', Types::TEXT);
                    $addColumn($table, 'media_path', Types::STRING, ['length' => 1024, 'default' => '']);
                    $setPrimaryKey($table, ['id']);
                    $addIndex($table, ['tree_id'], 'hc_ft_research_tree');
                    $addIndex($table, ['tree_id', 'origin_key', 'entity_type', 'external_id'], 'hc_ft_research_origin', true);
        }
        
        return $schema;
    }
}
