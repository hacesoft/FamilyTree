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
    /**
 * @brief Vytvoří nebo upraví tabulky genealogické aplikace při úvodní databázové migraci.
 * @param IOutput $oOutput Vstupní parametr „output“ pro operaci changeSchema.
 * @param Closure $fnSchemaClosure Vstupní parametr „schemaClosure“ pro operaci changeSchema.
 * @param array $aOptions Vstupní parametr „options“ pro operaci changeSchema.
 * @return ?ISchemaWrapper Databázové schéma, nebo null není-li dostupné.
 */
    public function changeSchema(IOutput $oOutput, Closure $fnSchemaClosure, array $aOptions): ?ISchemaWrapper {
        /** @var ISchemaWrapper $oSchema */
        $oSchema = $fnSchemaClosure();
        $oAddColumn = static /**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param mixed $sTable Vstupní hodnota $sTable použitá v callbacku.
 * @param string $sName Vstupní hodnota $sName použitá v callbacku.
 * @param string $sType Vstupní hodnota $sType použitá v callbacku.
 * @param array $aOptions Vstupní hodnota $aOptions použitá v callbacku.
 * @return void Výsledek callbacku pro volající operaci.
 */
function ($sTable, string $sName, string $sType, array $aOptions = []): void {
            if (!$sTable->hasColumn($sName)) $sTable->addColumn($sName, $sType, $aOptions);
        };
        $oAddIndex = static /**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param mixed $sTable Vstupní hodnota $sTable použitá v callbacku.
 * @param array $aColumns Vstupní hodnota $aColumns použitá v callbacku.
 * @param string $sName Vstupní hodnota $sName použitá v callbacku.
 * @param bool $bUnique Vstupní hodnota $bUnique použitá v callbacku.
 * @return void Výsledek callbacku pro volající operaci.
 */
function ($sTable, array $aColumns, string $sName, bool $bUnique = false): void {
            if (!$sTable->hasIndex($sName)) {
                if ($bUnique) $sTable->addUniqueIndex($aColumns, $sName);
                else $sTable->addIndex($aColumns, $sName);
            }
        };
        $sSetPrimaryKey = static /**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param mixed $sTable Vstupní hodnota $sTable použitá v callbacku.
 * @param array $aColumns Vstupní hodnota $aColumns použitá v callbacku.
 * @return void Výsledek callbacku pro volající operaci.
 */
function ($sTable, array $aColumns): void {
            if ($sTable->getPrimaryKey() === null) $sTable->setPrimaryKey($aColumns);
        };
        // hc_familytree_trees
        {
        $sTable = $oSchema->hasTable('hc_familytree_trees') ? $oSchema->getTable('hc_familytree_trees') : $oSchema->createTable('hc_familytree_trees');
                    $oAddColumn($sTable, 'id', Types::BIGINT, ['autoincrement' => true, 'notnull' => true, 'unsigned' => true]);
                    $oAddColumn($sTable, 'owner_uid', Types::STRING, ['length' => 64]);
                    $oAddColumn($sTable, 'name', Types::STRING, ['length' => 255]);
                    $oAddColumn($sTable, 'description', Types::TEXT, ['notnull' => false]);
                    $oAddColumn($sTable, 'root_person_id', Types::BIGINT, ['notnull' => false, 'unsigned' => true]);
                    $oAddColumn($sTable, 'created_at', Types::BIGINT);
                    $oAddColumn($sTable, 'updated_at', Types::BIGINT);
                    $sSetPrimaryKey($sTable, ['id']);
                    $oAddIndex($sTable, ['owner_uid'], 'hc_ft_tree_owner');
        }
        
        // hc_familytree_people
        {
        $sTable = $oSchema->hasTable('hc_familytree_people') ? $oSchema->getTable('hc_familytree_people') : $oSchema->createTable('hc_familytree_people');
                    $oAddColumn($sTable, 'id', Types::BIGINT, ['autoincrement' => true, 'notnull' => true, 'unsigned' => true]);
                    $oAddColumn($sTable, 'tree_id', Types::BIGINT, ['unsigned' => true]);
                    foreach (['given_name', 'surname', 'birth_surname', 'gender', 'birth_date', 'death_date', 'birth_place', 'death_place', 'occupation'] as $sName) {
                        $oAddColumn($sTable, $sName, Types::STRING, ['length' => 255, 'default' => '']);
                    }
                    $oAddColumn($sTable, 'photo_url', Types::STRING, ['length' => 1024, 'default' => '']);
                    $oAddColumn($sTable, 'is_living', Types::BOOLEAN, ['default' => true]);
                    $oAddColumn($sTable, 'notes', Types::TEXT, ['notnull' => false]);
                    $oAddColumn($sTable, 'layout_x', Types::INTEGER, ['notnull' => false]);
                    $oAddColumn($sTable, 'layout_y', Types::INTEGER, ['notnull' => false]);
                    $oAddColumn($sTable, 'created_at', Types::BIGINT);
                    $oAddColumn($sTable, 'updated_at', Types::BIGINT);
                    $sSetPrimaryKey($sTable, ['id']);
                    $oAddIndex($sTable, ['tree_id'], 'hc_ft_person_tree');
                    $oAddIndex($sTable, ['tree_id', 'surname'], 'hc_ft_person_name');
        }
        
        // hc_familytree_relations
        {
        $sTable = $oSchema->hasTable('hc_familytree_relations') ? $oSchema->getTable('hc_familytree_relations') : $oSchema->createTable('hc_familytree_relations');
                    $oAddColumn($sTable, 'id', Types::BIGINT, ['autoincrement' => true, 'notnull' => true, 'unsigned' => true]);
                    $oAddColumn($sTable, 'tree_id', Types::BIGINT, ['unsigned' => true]);
                    $oAddColumn($sTable, 'person1_id', Types::BIGINT, ['unsigned' => true]);
                    $oAddColumn($sTable, 'person2_id', Types::BIGINT, ['unsigned' => true]);
                    $oAddColumn($sTable, 'type', Types::STRING, ['length' => 32]);
                    $oAddColumn($sTable, 'start_date', Types::STRING, ['length' => 32, 'default' => '']);
                    $oAddColumn($sTable, 'end_date', Types::STRING, ['length' => 32, 'default' => '']);
                    $oAddColumn($sTable, 'notes', Types::TEXT, ['notnull' => false]);
                    $sSetPrimaryKey($sTable, ['id']);
                    $oAddIndex($sTable, ['tree_id'], 'hc_ft_rel_tree');
                    $oAddIndex($sTable, ['tree_id', 'person1_id', 'person2_id', 'type'], 'hc_ft_rel_unique', true);
        }
        
        // hc_familytree_events
        {
        $sTable = $oSchema->hasTable('hc_familytree_events') ? $oSchema->getTable('hc_familytree_events') : $oSchema->createTable('hc_familytree_events');
                    $oAddColumn($sTable, 'id', Types::BIGINT, ['autoincrement' => true, 'notnull' => true, 'unsigned' => true]);
                    $oAddColumn($sTable, 'tree_id', Types::BIGINT, ['unsigned' => true]);
                    $oAddColumn($sTable, 'person_id', Types::BIGINT, ['unsigned' => true]);
                    $oAddColumn($sTable, 'type', Types::STRING, ['length' => 64]);
                    $oAddColumn($sTable, 'title', Types::STRING, ['length' => 255]);
                    $oAddColumn($sTable, 'event_date', Types::STRING, ['length' => 32, 'default' => '']);
                    $oAddColumn($sTable, 'place', Types::STRING, ['length' => 255, 'default' => '']);
                    $oAddColumn($sTable, 'description', Types::TEXT, ['notnull' => false]);
                    $sSetPrimaryKey($sTable, ['id']);
                    $oAddIndex($sTable, ['person_id'], 'hc_ft_event_person');
        }
        
        // hc_familytree_documents
        {
        $sTable = $oSchema->hasTable('hc_familytree_documents') ? $oSchema->getTable('hc_familytree_documents') : $oSchema->createTable('hc_familytree_documents');
                    $oAddColumn($sTable, 'id', Types::BIGINT, ['autoincrement' => true, 'notnull' => true, 'unsigned' => true]);
                    $oAddColumn($sTable, 'tree_id', Types::BIGINT, ['unsigned' => true]);
                    $oAddColumn($sTable, 'person_id', Types::BIGINT, ['notnull' => false, 'unsigned' => true]);
                    $oAddColumn($sTable, 'title', Types::STRING, ['length' => 255]);
                    foreach (['document_type' => 64, 'document_date' => 32, 'place' => 255, 'archive' => 255, 'signature' => 255, 'source' => 1024, 'mime_type' => 127] as $sName => $nLength) {
                        $oAddColumn($sTable, $sName, Types::STRING, ['length' => $nLength, 'notnull' => false]);
                    }
                    $oAddColumn($sTable, 'file_path', Types::STRING, ['length' => 1024]);
                    $oAddColumn($sTable, 'description', Types::TEXT, ['notnull' => false]);
                    $oAddColumn($sTable, 'created_at', Types::BIGINT, ['default' => 0]);
                    $oAddColumn($sTable, 'updated_at', Types::BIGINT, ['default' => 0]);
                    $sSetPrimaryKey($sTable, ['id']);
                    $oAddIndex($sTable, ['tree_id'], 'hc_ft_doc_tree');
                    $oAddIndex($sTable, ['person_id'], 'hc_ft_doc_person');
        }
        
        // hc_familytree_doc_links
        {
        $sTable = $oSchema->hasTable('hc_familytree_doc_links') ? $oSchema->getTable('hc_familytree_doc_links') : $oSchema->createTable('hc_familytree_doc_links');
                    $oAddColumn($sTable, 'id', Types::BIGINT, ['autoincrement' => true, 'notnull' => true, 'unsigned' => true]);
                    $oAddColumn($sTable, 'document_id', Types::BIGINT, ['unsigned' => true]);
                    $oAddColumn($sTable, 'tree_id', Types::BIGINT, ['unsigned' => true]);
                    $oAddColumn($sTable, 'link_type', Types::STRING, ['length' => 16]);
                    $oAddColumn($sTable, 'target_id', Types::BIGINT, ['unsigned' => true]);
                    $sSetPrimaryKey($sTable, ['id']);
                    $oAddIndex($sTable, ['tree_id'], 'hc_ft_dl_tree');
                    $oAddIndex($sTable, ['document_id'], 'hc_ft_dl_doc');
                    $oAddIndex($sTable, ['document_id', 'link_type', 'target_id'], 'hc_ft_dl_unique', true);
        }
        
        // hc_familytree_shares
        {
        $sTable = $oSchema->hasTable('hc_familytree_shares') ? $oSchema->getTable('hc_familytree_shares') : $oSchema->createTable('hc_familytree_shares');
                    $oAddColumn($sTable, 'id', Types::BIGINT, ['autoincrement' => true, 'notnull' => true, 'unsigned' => true]);
                    $oAddColumn($sTable, 'tree_id', Types::BIGINT, ['unsigned' => true]);
                    $oAddColumn($sTable, 'share_type', Types::STRING, ['length' => 16]);
                    $oAddColumn($sTable, 'share_with', Types::STRING, ['length' => 64]);
                    $oAddColumn($sTable, 'permission', Types::STRING, ['length' => 16, 'default' => 'view']);
                    $sSetPrimaryKey($sTable, ['id']);
                    $oAddIndex($sTable, ['tree_id', 'share_type', 'share_with'], 'hc_ft_share_unique', true);
        }
        
        // Lossless research records keep the source IDs and every variant alongside the
        // existing editable graph. A reimport with the same origin and ID is idempotent.
        {
        $sTable = $oSchema->hasTable('hc_familytree_research') ? $oSchema->getTable('hc_familytree_research') : $oSchema->createTable('hc_familytree_research');
                    $oAddColumn($sTable, 'id', Types::BIGINT, ['autoincrement' => true, 'notnull' => true, 'unsigned' => true]);
                    $oAddColumn($sTable, 'tree_id', Types::BIGINT, ['unsigned' => true]);
                    $oAddColumn($sTable, 'origin_key', Types::STRING, ['length' => 64]);
                    $oAddColumn($sTable, 'entity_type', Types::STRING, ['length' => 24]);
                    $oAddColumn($sTable, 'external_id', Types::STRING, ['length' => 64]);
                    $oAddColumn($sTable, 'native_id', Types::BIGINT, ['notnull' => false, 'unsigned' => true]);
                    $oAddColumn($sTable, 'payload_json', Types::TEXT);
                    $oAddColumn($sTable, 'media_path', Types::STRING, ['length' => 1024, 'default' => '']);
                    $sSetPrimaryKey($sTable, ['id']);
                    $oAddIndex($sTable, ['tree_id'], 'hc_ft_research_tree');
                    $oAddIndex($sTable, ['tree_id', 'origin_key', 'entity_type', 'external_id'], 'hc_ft_research_origin', true);
        }
        
        // v2 research diary, permanent audit history and portable stable identifiers.
        // Baseline stays Version0001; an existing developer installation is repaired by ensure-schema.
        foreach (['hc_familytree_trees','hc_familytree_people','hc_familytree_relations','hc_familytree_events','hc_familytree_documents','hc_familytree_doc_links','hc_familytree_shares','hc_familytree_research'] as $sName) {
            $sTable = $oSchema->getTable($sName);
            $oAddColumn($sTable, 'stable_id', Types::STRING, ['length' => 64, 'notnull' => false]);
            $oAddIndex($sTable, ['stable_id'], 'hc_ft_stable_' . substr(md5($sName), 0, 8));
        }
        {
            $sTable = $oSchema->hasTable('hc_familytree_history') ? $oSchema->getTable('hc_familytree_history') : $oSchema->createTable('hc_familytree_history');
            $oAddColumn($sTable, 'id', Types::BIGINT, ['autoincrement'=>true, 'notnull'=>true, 'unsigned'=>true]);
            $oAddColumn($sTable, 'tree_id', Types::BIGINT, ['notnull'=>false]);
            $oAddColumn($sTable, 'entity_type', Types::STRING, ['notnull'=>false, 'length'=>40]);
            $oAddColumn($sTable, 'entity_uid', Types::STRING, ['notnull'=>false, 'length'=>64]);
            $oAddColumn($sTable, 'action', Types::STRING, ['notnull'=>false, 'length'=>24]);
            $oAddColumn($sTable, 'actor_uid', Types::STRING, ['notnull'=>false, 'length'=>64]);
            $oAddColumn($sTable, 'before_json', Types::TEXT, ['notnull'=>false]);
            $oAddColumn($sTable, 'after_json', Types::TEXT, ['notnull'=>false]);
            $oAddColumn($sTable, 'reason', Types::TEXT, ['notnull'=>false]);
            $oAddColumn($sTable, 'created_at', Types::BIGINT, ['notnull'=>false]);
            $sSetPrimaryKey($sTable, ['id']);
            $oAddIndex($sTable, ['tree_id'], 'hc_ft_v2_0_tree');
        }
        {
            $sTable = $oSchema->hasTable('hc_familytree_research_tasks') ? $oSchema->getTable('hc_familytree_research_tasks') : $oSchema->createTable('hc_familytree_research_tasks');
            $oAddColumn($sTable, 'id', Types::BIGINT, ['autoincrement'=>true, 'notnull'=>true, 'unsigned'=>true]);
            $oAddColumn($sTable, 'tree_id', Types::BIGINT, ['notnull'=>false]);
            $oAddColumn($sTable, 'stable_id', Types::STRING, ['notnull'=>false, 'length'=>64]);
            $oAddColumn($sTable, 'title', Types::STRING, ['notnull'=>false, 'length'=>255]);
            $oAddColumn($sTable, 'status', Types::STRING, ['notnull'=>false, 'length'=>32]);
            $oAddColumn($sTable, 'priority', Types::STRING, ['notnull'=>false, 'length'=>16]);
            $oAddColumn($sTable, 'hypothesis', Types::TEXT, ['notnull'=>false]);
            $oAddColumn($sTable, 'next_action', Types::TEXT, ['notnull'=>false]);
            $oAddColumn($sTable, 'person_refs_json', Types::TEXT, ['notnull'=>false]);
            $oAddColumn($sTable, 'created_by', Types::STRING, ['notnull'=>false, 'length'=>64]);
            $oAddColumn($sTable, 'updated_by', Types::STRING, ['notnull'=>false, 'length'=>64]);
            $oAddColumn($sTable, 'created_at', Types::BIGINT, ['notnull'=>false]);
            $oAddColumn($sTable, 'updated_at', Types::BIGINT, ['notnull'=>false]);
            $sSetPrimaryKey($sTable, ['id']);
            $oAddIndex($sTable, ['tree_id'], 'hc_ft_v2_1_tree');
            $oAddIndex($sTable, ['stable_id'], 'hc_ft_v2_1_uuid');
        }
        {
            $sTable = $oSchema->hasTable('hc_familytree_search_log') ? $oSchema->getTable('hc_familytree_search_log') : $oSchema->createTable('hc_familytree_search_log');
            $oAddColumn($sTable, 'id', Types::BIGINT, ['autoincrement'=>true, 'notnull'=>true, 'unsigned'=>true]);
            $oAddColumn($sTable, 'tree_id', Types::BIGINT, ['notnull'=>false]);
            $oAddColumn($sTable, 'stable_id', Types::STRING, ['notnull'=>false, 'length'=>64]);
            $oAddColumn($sTable, 'task_uid', Types::STRING, ['notnull'=>false, 'length'=>64]);
            $oAddColumn($sTable, 'query_text', Types::TEXT, ['notnull'=>false]);
            $oAddColumn($sTable, 'source_url', Types::STRING, ['notnull'=>false, 'length'=>1024]);
            $oAddColumn($sTable, 'outcome', Types::STRING, ['notnull'=>false, 'length'=>32]);
            $oAddColumn($sTable, 'notes', Types::TEXT, ['notnull'=>false]);
            $oAddColumn($sTable, 'actor_uid', Types::STRING, ['notnull'=>false, 'length'=>64]);
            $oAddColumn($sTable, 'created_at', Types::BIGINT, ['notnull'=>false]);
            $sSetPrimaryKey($sTable, ['id']);
            $oAddIndex($sTable, ['tree_id'], 'hc_ft_v2_2_tree');
            $oAddIndex($sTable, ['stable_id'], 'hc_ft_v2_2_uuid');
        }
        {
            $sTable = $oSchema->hasTable('hc_familytree_evidence') ? $oSchema->getTable('hc_familytree_evidence') : $oSchema->createTable('hc_familytree_evidence');
            $oAddColumn($sTable, 'id', Types::BIGINT, ['autoincrement'=>true, 'notnull'=>true, 'unsigned'=>true]);
            $oAddColumn($sTable, 'tree_id', Types::BIGINT, ['notnull'=>false]);
            $oAddColumn($sTable, 'stable_id', Types::STRING, ['notnull'=>false, 'length'=>64]);
            $oAddColumn($sTable, 'task_uid', Types::STRING, ['notnull'=>false, 'length'=>64]);
            $oAddColumn($sTable, 'status', Types::STRING, ['notnull'=>false, 'length'=>24]);
            $oAddColumn($sTable, 'archive', Types::STRING, ['notnull'=>false, 'length'=>255]);
            $oAddColumn($sTable, 'signature', Types::STRING, ['notnull'=>false, 'length'=>128]);
            $oAddColumn($sTable, 'source_url', Types::STRING, ['notnull'=>false, 'length'=>1024]);
            $oAddColumn($sTable, 'image_number', Types::STRING, ['notnull'=>false, 'length'=>64]);
            $oAddColumn($sTable, 'transcription', Types::TEXT, ['notnull'=>false]);
            $oAddColumn($sTable, 'notes', Types::TEXT, ['notnull'=>false]);
            $oAddColumn($sTable, 'confidence_label', Types::STRING, ['notnull'=>false, 'length'=>32]);
            $oAddColumn($sTable, 'metadata_json', Types::TEXT, ['notnull'=>false]);
            $oAddColumn($sTable, 'created_by', Types::STRING, ['notnull'=>false, 'length'=>64]);
            $oAddColumn($sTable, 'created_at', Types::BIGINT, ['notnull'=>false]);
            $oAddColumn($sTable, 'updated_at', Types::BIGINT, ['notnull'=>false]);
            $sSetPrimaryKey($sTable, ['id']);
            $oAddIndex($sTable, ['tree_id'], 'hc_ft_v2_3_tree');
            $oAddIndex($sTable, ['stable_id'], 'hc_ft_v2_3_uuid');
        }
        {
            $sTable = $oSchema->hasTable('hc_familytree_proposals') ? $oSchema->getTable('hc_familytree_proposals') : $oSchema->createTable('hc_familytree_proposals');
            $oAddColumn($sTable, 'id', Types::BIGINT, ['autoincrement'=>true, 'notnull'=>true, 'unsigned'=>true]);
            $oAddColumn($sTable, 'tree_id', Types::BIGINT, ['notnull'=>false]);
            $oAddColumn($sTable, 'stable_id', Types::STRING, ['notnull'=>false, 'length'=>64]);
            $oAddColumn($sTable, 'target_type', Types::STRING, ['notnull'=>false, 'length'=>32]);
            $oAddColumn($sTable, 'target_uid', Types::STRING, ['notnull'=>false, 'length'=>64]);
            $oAddColumn($sTable, 'changes_json', Types::TEXT, ['notnull'=>false]);
            $oAddColumn($sTable, 'evidence_uid', Types::STRING, ['notnull'=>false, 'length'=>64]);
            $oAddColumn($sTable, 'status', Types::STRING, ['notnull'=>false, 'length'=>24]);
            $oAddColumn($sTable, 'reason', Types::TEXT, ['notnull'=>false]);
            $oAddColumn($sTable, 'created_by', Types::STRING, ['notnull'=>false, 'length'=>64]);
            $oAddColumn($sTable, 'reviewer_uid', Types::STRING, ['notnull'=>false, 'length'=>64]);
            $oAddColumn($sTable, 'created_at', Types::BIGINT, ['notnull'=>false]);
            $oAddColumn($sTable, 'reviewed_at', Types::BIGINT, ['notnull'=>false]);
            $sSetPrimaryKey($sTable, ['id']);
            $oAddIndex($sTable, ['tree_id'], 'hc_ft_v2_4_tree');
            $oAddIndex($sTable, ['stable_id'], 'hc_ft_v2_4_uuid');
        }
        return $oSchema;
    }
}
