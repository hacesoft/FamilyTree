<?php
declare(strict_types=1);

namespace OCA\HcFamilyTree\Service;

use OCP\AppFramework\Http\DataDisplayResponse;
use OCP\AppFramework\Http\JSONResponse;
use OCP\AppFramework\Http\Response;
use OCP\Files\File;
use OCP\Files\Folder;
use OCP\Files\IRootFolder;
use OCP\Files\NotFoundException;
use OCP\IDBConnection;
use OCP\IRequest;

/** Import GEDCOM 7 / GEDZIP while retaining the original evidence and file. */
final class ResearchImportService {
    private const TABLE = 'hc_familytree_research';
    private const TYPES = [
        'persons' => 'person_id', 'relationships' => 'relationship_id',
        'events' => 'event_id', 'facts' => 'fact_id', 'sources' => 'source_id',
        'citations' => 'citation_id', 'media' => 'media_id',
        'places' => 'place_id', 'research' => 'research_id',
        'research_facts' => 'fact_id', 'notes' => 'note_id',
        'note_links' => 'note_link_id', 'families' => 'family_id',
    ];
    private const IMAGES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    public function __construct(
        private IDBConnection $db,
        private IRequest $request,
        private IRootFolder $rootFolder,
    ) {}

    private function rows(string $table, array $where): array {
        $q = $this->db->getQueryBuilder()->select('*')->from($table);
        foreach ($where as $key => $value) $q->andWhere($q->expr()->eq($key, $q->createNamedParameter($value)));
        return $q->executeQuery()->fetchAllAssociative();
    }

    private function insert(string $table, array $data): int {
        $q = $this->db->getQueryBuilder()->insert($table);
        foreach ($data as $key => $value) $q->setValue($key, $q->createNamedParameter($value));
        $q->executeStatement();
        return (int)$this->db->lastInsertId($table);
    }

    private function update(string $table, int $id, array $data): void {
        $q = $this->db->getQueryBuilder()->update($table);
        foreach ($data as $key => $value) $q->set($key, $q->createNamedParameter($value));
        $q->where($q->expr()->eq('id', $q->createNamedParameter($id)))->executeStatement();
    }

    private function origin(): string {
        $origin = trim((string)$this->request->getParam('origin', 'genealogie'));
        if (!preg_match('/^[a-zA-Z0-9_-]{1,64}$/D', $origin)) {
            throw new \InvalidArgumentException('Označení importu smí obsahovat jen písmena, číslice, _ a -.');
        }
        return $origin;
    }

    private function mode(): string {
        $mode = (string)$this->request->getParam('mode', 'new');
        if (!in_array($mode, ['new', 'update'], true)) throw new \InvalidArgumentException('Neplatný režim importu.');
        return $mode;
    }

    /** GEDZIP is read by index, never extracted onto the server's filesystem. */
    private function package(): array {
        $uploaded = $this->request->getUploadedFile('package');
        if (!is_array($uploaded) || ($uploaded['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK
            || !is_file((string)($uploaded['tmp_name'] ?? ''))) {
            throw new \InvalidArgumentException('Vyberte GEDCOM 7 (.ged) nebo GEDZIP (.gdz).');
        }
        $path = (string)$uploaded['tmp_name'];
        $size = (int)($uploaded['size'] ?? 0);
        if ($size < 1 || $size > 64 * 1024 * 1024) throw new \InvalidArgumentException('Balíček musí být menší než 64 MB.');
        $name = strtolower((string)($uploaded['name'] ?? ''));
        $source = file_get_contents($path);
        if (!is_string($source)) throw new \InvalidArgumentException('Soubor nelze přečíst.');
        $files = [];
        if (str_ends_with($name, '.ged') || str_ends_with($name, '.gedcom')) {
            $ged = $source;
            $gedzip = false;
        } elseif (str_ends_with($name, '.gdz')) {
            $gedzip = true;
            if (!class_exists(\ZipArchive::class)) throw new \InvalidArgumentException('Server nemá rozšíření PHP ZIP.');
            $zip = new \ZipArchive();
            if ($zip->open($path) !== true) throw new \InvalidArgumentException('Archiv ZIP nelze otevřít.');
            try {
                if ($zip->numFiles > 300) throw new \InvalidArgumentException('Archiv obsahuje příliš mnoho souborů.');
                $ged = null; $total = 0;
                for ($i = 0; $i < $zip->numFiles; $i++) {
                    $stat = $zip->statIndex($i);
                    if ($stat === false) throw new \InvalidArgumentException('Vadná položka archivu.');
                    $entry = $stat['name'];
                    if (str_contains($entry, '\\') || str_starts_with($entry, '/')
                        || preg_match('~(^|/)\.{1,2}(/|$)|[\x00-\x1f]~', $entry)) {
                        throw new \InvalidArgumentException('Archiv obsahuje nebezpečnou cestu.');
                    }
                    $bytes = (int)$stat['size']; $total += $bytes;
                    if ($total > 96 * 1024 * 1024 || $bytes > 16 * 1024 * 1024) {
                        throw new \InvalidArgumentException('Rozbalený archiv je příliš velký.');
                    }
                    if (method_exists($zip, 'getExternalAttributesIndex') && $zip->getExternalAttributesIndex($i, $opsys, $attributes)
                        && ((($attributes >> 16) & 0170000) === 0120000)) {
                        throw new \InvalidArgumentException('Symbolické odkazy v archivu nejsou povolené.');
                    }
                    if (str_ends_with($entry, '/')) continue;
                    if (array_key_exists($entry, $files)) throw new \InvalidArgumentException('Archiv obsahuje duplicitní cestu.');
                    $content = $zip->getFromIndex($i);
                    if (!is_string($content) || strlen($content) !== $bytes) throw new \InvalidArgumentException('Soubor v archivu nelze přečíst.');
                    $files[$entry] = $content;
                }
                $ged = $files['gedcom.ged'] ?? null;
                unset($files['gedcom.ged']);
                if (!is_string($ged)) throw new \InvalidArgumentException('V GEDZIP chybí gedcom.ged v kořeni.');
            } finally { $zip->close(); }
        } else {
            throw new \InvalidArgumentException('Podporován je jen GEDCOM 7 (.ged) nebo GEDZIP (.gdz).');
        }
        Gedcom7Package::validateFiles($ged, $files, $gedzip);
        $parsed = Gedcom7Package::parse($ged, $files, $gedzip);
        return $parsed + ['source' => $source, 'filename' => $gedzip ? 'gdz' : 'ged'];
    }

    private function existing(int $treeId, string $origin): array {
        $map = [];
        foreach ($this->rows(self::TABLE, ['tree_id' => $treeId, 'origin_key' => $origin]) as $row) {
            $map[$row['entity_type']][$row['external_id']] = $row;
        }
        return $map;
    }

    private function validate(array $data, array $media, array $existing, string $mode, int $treeId): array {
        if (($data['format'] ?? '') !== 'FamilySearch GEDCOM 7') throw new \InvalidArgumentException('Neplatný GEDCOM 7.');
        if ($mode === 'new' && ($existing || $this->rows('hc_familytree_people', ['tree_id' => $treeId]))) {
            throw new \InvalidArgumentException('Nový import vyžaduje prázdný rodokmen. Pro tuto sadu zvolte aktualizaci podle UID.');
        }
        if ($mode === 'update' && !$existing) {
            throw new \InvalidArgumentException('Pro aktualizaci nejprve naimportujte tuto sadu do rodokmenu.');
        }
        $ids = []; $counts = []; $new = []; $unchanged = []; $changed = [];
        foreach (self::TYPES as $type => $idField) {
            if (!isset($data[$type]) || !is_array($data[$type]) || !array_is_list($data[$type]) || count($data[$type]) > 5000) {
                throw new \InvalidArgumentException('Chybí nebo je neplatná tabulka ' . $type . '.');
            }
            $counts[$type] = count($data[$type]); $new[$type] = 0; $unchanged[$type] = 0; $changed[$type] = 0;
            foreach ($data[$type] as $record) {
                $id = $record[$idField] ?? null;
                if (!is_array($record) || !is_string($id) || !preg_match('/^[A-Za-z][A-Za-z0-9_-]{0,63}$/D', $id)
                    || isset($ids[$type][$id]) || strlen(json_encode($record, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)) > 60000) {
                    throw new \InvalidArgumentException('Neplatný nebo duplicitní identifikátor v tabulce ' . $type . '.');
                }
                $ids[$type][$id] = true;
                if (!isset($existing[$type][$id])) $new[$type]++;
                elseif (json_decode((string)$existing[$type][$id]['payload_json'], true) === $record) $unchanged[$type]++;
                else {
                    if ($mode === 'update' && in_array($type, ['persons', 'families'], true)
                        && (string)($record['uid'] ?? '') === '') {
                        throw new \InvalidArgumentException('Změněný záznam ' . $type . ' bez UID nelze bezpečně synchronizovat.');
                    }
                    $changed[$type]++;
                }
            }
        }
        $removed = [];
        foreach (self::TYPES as $type => $_) $removed[$type] = count(array_diff_key($existing[$type] ?? [], $ids[$type] ?? []));
        if (!$counts['persons']) throw new \InvalidArgumentException('Import neobsahuje žádnou osobu.');
        $known = [];
        foreach (self::TYPES as $type => $_) $known[$type] = ($ids[$type] ?? []) + array_fill_keys(array_keys($existing[$type] ?? []), true);
        $assertRefs = static function (string $raw, string $type) use ($known): void {
            foreach (explode('|', $raw) as $ref) {
                if ($ref === '' || !isset($known[$type][$ref])) throw new \InvalidArgumentException('Neexistující odkaz ' . $type . ': ' . $ref);
            }
        };
        foreach ($data['relationships'] as $r) {
            $assertRefs((string)($r['person1_id'] ?? ''), 'persons');
            $assertRefs((string)($r['person2_id'] ?? ''), 'persons');
            if (!empty($r['source_id'])) $assertRefs((string)$r['source_id'], 'sources');
            if (!in_array($r['relationship_type'] ?? null, ['parent_child', 'spouse'], true)
                || $r['person1_id'] === $r['person2_id']) throw new \InvalidArgumentException('Neplatný vztah.');
            foreach (['start_date','end_date'] as $field) if (strlen((string)($r[$field] ?? '')) > 32) throw new \InvalidArgumentException('Příliš dlouhé datum vztahu.');
        }
        $parentCount = [];
        foreach ($data['relationships'] as $r) if ($r['relationship_type'] === 'parent_child' && ($r['verification_status'] ?? '') !== 'disproven') {
            $child = $r['person2_id']; $parentCount[$child] = ($parentCount[$child] ?? 0) + 1;
        }
        $parentConflicts = array_filter($parentCount, static fn(int $count): bool => $count > 2);
        foreach ($data['events'] as $r) {
            $assertRefs((string)($r['person_id'] ?? ''), 'persons');
            if (!empty($r['source_id'])) $assertRefs((string)$r['source_id'], 'sources');
            if (strlen((string)($r['date_value'] ?? '')) > 32 || strlen((string)($r['place'] ?? '')) > 255) throw new \InvalidArgumentException('Příliš dlouhé datum nebo místo události.');
        }
        foreach ($data['facts'] as $r) {
            $assertRefs((string)($r['subject_id'] ?? ''), ($r['subject_type'] ?? '') === 'relationship' ? 'relationships' : 'persons');
            if (!empty($r['source_id'])) $assertRefs((string)$r['source_id'], 'sources');
        }
        foreach ($data['families'] as $r) {
            foreach (($r['parent_ids'] ?? []) as $id) $assertRefs((string)$id, 'persons');
            foreach (($r['child_ids'] ?? []) as $id) $assertRefs((string)$id, 'persons');
        }
        $linkedType = static fn(string $type): string => match ($type) {
            'event' => 'events', 'family' => 'families', 'source' => 'sources',
            'citation' => 'citations', 'research_facts' => 'research_facts',
            'person' => 'persons', default => throw new \InvalidArgumentException('Neznámý typ vlastníka: ' . $type),
        };
        foreach ($data['citations'] as $r) {
            $assertRefs((string)($r['source_id'] ?? ''), 'sources');
            $assertRefs((string)($r['linked_entity_id'] ?? ''), $linkedType((string)($r['linked_entity_type'] ?? '')));
        }
        foreach ($data['research_facts'] as $r) {
            if (($r['owner_type'] ?? '') !== 'unlinked') $assertRefs((string)($r['owner_id'] ?? ''), $linkedType((string)$r['owner_type']));
            if (!empty($r['source_id'])) $assertRefs((string)$r['source_id'], 'sources');
            if (!empty($r['citation_id'])) $assertRefs((string)$r['citation_id'], 'citations');
        }
        foreach ($data['notes'] as $r) foreach ($r['source_links'] ?? [] as $id) $assertRefs((string)$id, 'sources');
        foreach ($data['note_links'] as $r) {
            $assertRefs((string)($r['note_id'] ?? ''), 'notes');
            if (($r['owner_type'] ?? '') !== 'unlinked') {
                $assertRefs((string)($r['owner_id'] ?? ''), $linkedType((string)($r['owner_type'] ?? '')));
            }
        }
        $missing = []; $available = []; $remote = [];
        foreach ($data['media'] as $r) {
            $path = (string)($r['file_name'] ?? '');
            $isRemote = preg_match('~^(https?|ftp)://~i', $path) === 1;
            if (!$isRemote && (str_starts_with($path, '/') || str_contains($path, '\\')
                || preg_match('~(^|/)\.{1,2}(/|$)|[\x00-\x1f]~', $path) || $path === '')) {
                throw new \InvalidArgumentException('Neplatná cesta k médiu.');
            }
            if (!empty($r['source_id'])) $assertRefs((string)$r['source_id'], 'sources');
            if (($r['linked_entity_type'] ?? '') !== 'unlinked') {
                $assertRefs((string)($r['linked_entity_id'] ?? ''), $linkedType((string)($r['linked_entity_type'] ?? '')));
            }
            if ($isRemote) { $remote[] = $path; continue; }
            if (($r['supported'] ?? true) === false) continue;
            if (!isset($media[$path])) { $missing[] = $path; continue; }
            $content = $media[$path];
            $mime = is_string($content) ? (new \finfo(FILEINFO_MIME_TYPE))->buffer($content) : '';
            if (!is_string($content) || strlen($content) > 16 * 1024 * 1024
                || !in_array($mime, self::IMAGES, true)
                || (!empty($r['form']) && strtolower((string)$r['form']) !== $mime)
                || !in_array(strtolower(pathinfo($path, PATHINFO_EXTENSION)), ['jpg','jpeg','png','gif','webp'], true)
                || (!empty($r['sha256']) && !hash_equals(strtolower((string)$r['sha256']), hash('sha256', $content)))) {
                throw new \InvalidArgumentException('Obrázek není platný nebo nesouhlasí kontrolní součet: ' . $path);
            }
            $available[] = $path;
        }
        foreach ($data['research'] as $r) {
            if (!empty($r['source_id'])) $assertRefs((string)$r['source_id'], 'sources');
            foreach ($r['target_person_ids'] ?? [] as $id) $assertRefs((string)$id, 'persons');
        }
        foreach ($data['persons'] as $p) {
            foreach (['given_names','surname_best','birth_surname','sex','birth_date','death_date','birth_place','death_place','occupations'] as $field) {
                if (!is_string($p[$field] ?? '') || strlen((string)($p[$field] ?? '')) > 255) throw new \InvalidArgumentException('Příliš dlouhé pole osoby: ' . $field);
            }
        }
        if ($missing) throw new \InvalidArgumentException('Chybí místní soubor média: ' . implode(', ', array_slice($missing, 0, 3)));
        $unknownNotes = count(array_filter($data['notes'], static fn(array $r): bool => $r['kind'] === 'other'));
        $variants = count(array_filter($data['relationships'], static fn(array $r): bool => in_array($r['verification_status'] ?? '', ['challenged','disproven','conflict'], true)));
        $variants += count(array_filter($data['research_facts'], static fn(array $r): bool => str_contains(strtolower((string)$r['verification_status']), 'conflict')));
        $alternatives = [];
        foreach ($data['facts'] as $r) if (($r['predicate'] ?? '') === 'NAME') {
            $alternatives['name:' . $r['subject_id']] = ($alternatives['name:' . $r['subject_id']] ?? 0) + 1;
        }
        foreach ($data['events'] as $r) {
            $key = 'event:' . $r['person_id'] . ':' . $r['event_type'];
            $alternatives[$key] = ($alternatives[$key] ?? 0) + 1;
        }
        foreach ($alternatives as $count) $variants += max(0, $count - 1);
        $changes = [];
        foreach (self::TYPES as $type => $_) if ($new[$type] || $changed[$type] || $removed[$type]) {
            $changes[$type] = ['new' => $new[$type], 'changed' => $changed[$type], 'absent_in_file' => $removed[$type]];
        }
        return compact('counts', 'new', 'unchanged', 'changed', 'removed', 'missing', 'available', 'remote', 'parentConflicts', 'unknownNotes', 'variants', 'changes');
    }

    public function preview(int $treeId): array {
        $package = $this->package(); $origin = $this->origin(); $mode = $this->mode();
        $result = $this->validate($package['data'], $package['media'], $this->existing($treeId, $origin), $mode, $treeId);
        return ['origin' => $origin, 'format' => 'GEDCOM 7' . ($package['filename'] === 'gdz' ? ' / GEDZIP' : ''),
            'sha256' => hash('sha256', $package['source']), 'mode' => $mode,
            'warnings' => $package['warnings']] + $result;
    }

    private function record(int $treeId, string $origin, string $type, string $externalId, array $payload, ?int $nativeId): int {
        return $this->insert(self::TABLE, ['tree_id' => $treeId, 'origin_key' => $origin,
            'entity_type' => $type, 'external_id' => $externalId, 'native_id' => $nativeId,
            'payload_json' => $this->encode($payload),
            'media_path' => '']);
    }

    private function encode(array $payload): string {
        return json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    }

    private function personFields(array $p): array {
        return ['given_name' => $p['given_names'] ?? '', 'surname' => $p['surname_best'] ?? '',
            'birth_surname' => $p['birth_surname'] ?? '', 'gender' => ['M'=>'male','F'=>'female'][$p['sex'] ?? ''] ?? 'other',
            'birth_date' => $p['birth_date'] ?? '', 'death_date' => $p['death_date'] ?? '',
            'birth_place' => $p['birth_place'] ?? '', 'death_place' => $p['death_place'] ?? '',
            'occupation' => $p['occupations'] ?? '', 'notes' => $p['notes'] ?? '',
            'is_living' => ($p['living_status'] ?? '') === 'deceased' ? 0 : 1];
    }

    private function person(int $treeId, array $p): int {
        $fields = $this->personFields($p) + ['photo_url' => ''];
        foreach ($fields as $key => $value) {
            if ($key === 'is_living') continue;
            $limit = $key === 'photo_url' ? 1024 : ($key === 'notes' ? 60000 : 255);
            if (!is_string($value) || strlen($value) > $limit) throw new \InvalidArgumentException('Příliš dlouhé pole osoby: ' . $key);
        }
        return $this->insert('hc_familytree_people', $fields + ['tree_id' => $treeId,
            'created_at' => time(), 'updated_at' => time()]);
    }

    private function relation(int $treeId, array $r, array $people): int {
        $first = $people[$r['person1_id']]; $second = $people[$r['person2_id']];
        $type = $r['relationship_type'] === 'spouse' ? 'partner' : 'parent';
        foreach ($this->rows('hc_familytree_relations', ['tree_id' => $treeId, 'type' => $type]) as $old) {
            if (((int)$old['person1_id'] === $first && (int)$old['person2_id'] === $second)
                || ($type === 'partner' && (int)$old['person1_id'] === $second && (int)$old['person2_id'] === $first)) return (int)$old['id'];
        }
        return $this->insert('hc_familytree_relations', ['tree_id' => $treeId, 'person1_id' => $first,
            'person2_id' => $second, 'type' => $type, 'start_date' => (string)($r['start_date'] ?? ''),
            'end_date' => (string)($r['end_date'] ?? ''), 'notes' => (string)($r['notes'] ?? '')]);
    }

    /** Keep every relationship record, but choose at most two parents for the displayed graph. */
    private function selectedParentIds(array $relations): array {
        $byChild = [];
        foreach ($relations as $r) if ($r['relationship_type'] === 'parent_child'
            && ($r['verification_status'] ?? '') !== 'disproven'
            && empty($r['absent_in_current_file'])) $byChild[$r['person2_id']][] = $r;
        $selected = [];
        foreach ($byChild as $options) {
            usort($options, static function (array $a, array $b): int {
                $score = static fn(array $r): int => (str_starts_with((string)($r['verification_status'] ?? ''), 'confirmed_primary') ? 1000 : 0)
                    + (($r['verification_status'] ?? '') === 'proven' ? 1000 : 0)
                    + (($r['verification_status'] ?? '') === 'challenged' ? -500 : 0)
                    + (str_contains((string)($r['verification_status'] ?? ''), 'conflict') ? -1000 : 0);
                return ($score($b) <=> $score($a)) ?: strcmp($a['relationship_id'], $b['relationship_id']);
            });
            foreach (array_slice($options, 0, 2) as $r) $selected[$r['relationship_id']] = true;
        }
        return $selected;
    }

    /** A disproven or nonselected imported parent remains in evidence, but has no graph edge. */
    public function visibleRelations(array $nativeRows, array $researchRows): array {
        $byOrigin = [];
        foreach ($researchRows as $row) if ($row['entity_type'] === 'relationships') {
            $byOrigin[$row['origin_key']][] = $row;
        }
        $suppressed = []; $displayed = []; $statuses = [];
        foreach ($byOrigin as $records) {
            $relations = array_map(static fn(array $r): array => $r['data'], $records);
            $selected = $this->selectedParentIds($relations);
            foreach ($records as $row) {
                $nativeId = (int)$row['native_id'];
                if (!$nativeId) continue;
                $active = empty($row['data']['absent_in_current_file']) && ($row['data']['relationship_type'] === 'spouse'
                    || isset($selected[$row['external_id']]));
                if ($active) {
                    $displayed[$nativeId] = true;
                    $statuses[$nativeId][] = $row['data']['verification_status'] ?? 'unverified';
                }
                else $suppressed[$nativeId] = true;
            }
        }
        $visible = array_values(array_filter($nativeRows,
            static fn(array $row): bool => !isset($suppressed[(int)$row['id']]) || isset($displayed[(int)$row['id']])));
        foreach ($visible as &$row) if (isset($statuses[(int)$row['id']])) {
            $row['research_status'] = count(array_filter($statuses[(int)$row['id']],
                static fn(string $status): bool => $status !== 'challenged')) === 0 ? 'challenged' : 'other';
        }
        unset($row);
        return $visible;
    }

    private function event(int $treeId, array $e, int $personId): int {
        $type = (string)($e['event_type'] ?? 'other');
        $title = match ($type) {
            'birth', 'birt' => 'Narození', 'marriage', 'marr' => 'Svatba',
            'baptism', 'bapm', 'chr' => 'Křest', 'death', 'deat' => 'Úmrtí',
            'occupation', 'occu' => 'Povolání', default => 'Událost',
        };
        $description = trim((string)($e['description'] ?? '') . "\n" . (string)($e['notes'] ?? ''));
        return $this->insert('hc_familytree_events', ['tree_id' => $treeId, 'person_id' => $personId,
            'type' => substr($type, 0, 64), 'title' => $title,
            'event_date' => (string)($e['date_value'] ?? ''), 'place' => (string)($e['place'] ?? ''),
            'description' => $description]);
    }

    private function eventFields(array $e): array {
        $type = (string)($e['event_type'] ?? 'other');
        $title = match ($type) {
            'birth', 'birt' => 'Narození', 'marriage', 'marr' => 'Svatba',
            'baptism', 'bapm', 'chr' => 'Křest', 'death', 'deat' => 'Úmrtí',
            'occupation', 'occu' => 'Povolání', default => 'Událost',
        };
        return ['type' => substr($type, 0, 64), 'title' => $title,
            'event_date' => (string)($e['date_value'] ?? ''), 'place' => (string)($e['place'] ?? ''),
            'description' => trim((string)($e['description'] ?? '') . "\n" . (string)($e['notes'] ?? ''))];
    }

    private function refreshProjection(string $table, int $treeId, int $nativeId, array $before, array $after,
        array &$warnings, string $label): void {
        $row = $this->rows($table, ['id' => $nativeId, 'tree_id' => $treeId])[0] ?? null;
        if (!$row) return;
        foreach ($before as $key => $value) if ((string)($row[$key] ?? '') !== (string)$value) {
            $warnings[] = 'Ručně upravené zobrazení ' . $label . ' zůstalo zachováno; výzkumný záznam je aktualizován.';
            return;
        }
        $changes = [];
        foreach ($after as $key => $value) if ((string)$value !== (string)($before[$key] ?? '')) $changes[$key] = $value;
        if ($changes) $this->update($table, $nativeId, $changes + ($table === 'hc_familytree_people' ? ['updated_at' => time()] : []));
    }

    public function import(int $treeId, string $ownerUid): array {
        $package = $this->package(); $origin = $this->origin(); $mode = $this->mode(); $data = $package['data'];
        $approved = (string)$this->request->getParam('preview_sha256', '');
        if ($approved === '' || !hash_equals(hash('sha256', $package['source']), $approved)) {
            throw new \InvalidArgumentException('Soubor se od náhledu změnil. Spusťte kontrolu znovu.');
        }
        $existing = $this->existing($treeId, $origin);
        $preview = $this->validate($data, $package['media'], $existing, $mode, $treeId);
        try { $this->saveBackup($ownerUid, $treeId, $origin, $package['source'], $package['filename']); }
        catch (\Throwable) { throw new \InvalidArgumentException('Původní GEDCOM/GEDZIP nelze archivovat do Souborů. Import se nespustil.'); }
        $warnings = $package['warnings']; $mediaStored = 0; $mediaPaths = []; $newFiles = [];
        try {
            foreach ($data['media'] as $m) {
                $content = $package['media'][$m['file_name']] ?? null;
                if ($content === null) continue;
                $old = $existing['media'][$m['media_id']] ?? null;
                if ($old && $old['media_path'] !== '' && json_decode((string)$old['payload_json'], true) === $m) {
                    try {
                        $saved = $this->rootFolder->getUserFolder($ownerUid)->get($old['media_path']);
                        if ($saved instanceof File && hash_equals($m['sha256'], hash('sha256', (string)$saved->getContent()))) {
                            $mediaPaths[$m['media_id']] = $old['media_path']; continue;
                        }
                    } catch (NotFoundException) {}
                }
                $beforeFiles = count($newFiles);
                $path = $this->saveMedia($ownerUid, $treeId, $m, $content, $newFiles);
                $mediaPaths[$m['media_id']] = $path;
                if (count($newFiles) > $beforeFiles) $mediaStored++;
            }
        } catch (\Throwable $error) {
            $this->removeStaged($ownerUid, $newFiles);
            throw new \InvalidArgumentException('Média nelze bezpečně uložit: ' . $error->getMessage());
        }
        $people = []; $created = array_fill_keys(array_keys(self::TYPES), 0);
        $updated = array_fill_keys(array_keys(self::TYPES), 0);
        $selectedParents = $this->selectedParentIds($data['relationships']);
        $started = false;
        try {
            $this->db->beginTransaction(); $started = true;
            foreach ($data['persons'] as $p) {
                $id = $p['person_id']; $old = $existing['persons'][$id] ?? null;
                $native = (int)($old['native_id'] ?? 0);
                if ($native && !$this->rows('hc_familytree_people', ['id' => $native, 'tree_id' => $treeId])) $native = 0;
                if (!$native) {
                    $native = $this->person($treeId, $p);
                    if ($old) $this->update(self::TABLE, (int)$old['id'], ['native_id' => $native]);
                    else { $this->record($treeId, $origin, 'persons', $id, $p, $native); $created['persons']++; }
                }
                if ($old && json_decode((string)$old['payload_json'], true) !== $p) {
                    $before = json_decode((string)$old['payload_json'], true);
                    $this->refreshProjection('hc_familytree_people', $treeId, $native,
                        $this->personFields($before), $this->personFields($p), $warnings, 'osoby ' . $id);
                    $this->update(self::TABLE, (int)$old['id'], ['payload_json' => $this->encode($p)]);
                    $updated['persons']++;
                }
                $people[$id] = $native;
            }
            foreach ($existing['persons'] ?? [] as $id => $old) {
                if (!isset($people[$id]) && !empty($old['native_id'])
                    && $this->rows('hc_familytree_people', ['id' => $old['native_id'], 'tree_id' => $treeId])) $people[$id] = (int)$old['native_id'];
            }
            foreach ($data['relationships'] as $r) {
                $id = $r['relationship_id'];
                $old = $existing['relationships'][$id] ?? null;
                if ($old) {
                    $before = json_decode((string)$old['payload_json'], true);
                    $desired = $r['relationship_type'] === 'spouse' || isset($selectedParents[$id]);
                    if ($desired && !$old['native_id']) {
                        $newNative = $this->relation($treeId, $r, $people);
                        $this->update(self::TABLE, (int)$old['id'], ['native_id' => $newNative]);
                    }
                    if ($old['native_id'] && ($before['person1_id'] !== $r['person1_id']
                        || $before['person2_id'] !== $r['person2_id']
                        || $before['relationship_type'] !== $r['relationship_type'])) {
                        throw new \InvalidArgumentException('Změna členů vztahu ' . $id . ' vyžaduje ruční kontrolu původní spojnice. Import neprovedl žádný zápis.');
                    }
                    if ($before !== $r) {
                        $this->update(self::TABLE, (int)$old['id'], ['payload_json' => $this->encode($r)]);
                        $updated['relationships']++;
                    }
                    continue;
                }
                $native = $r['relationship_type'] === 'parent_child' && !isset($selectedParents[$id])
                    ? null : $this->relation($treeId, $r, $people);
                $this->record($treeId, $origin, 'relationships', $id, $r, $native); $created['relationships']++;
            }
            foreach ($data['events'] as $e) {
                $id = $e['event_id'];
                $old = $existing['events'][$id] ?? null;
                if ($old) {
                    $before = json_decode((string)$old['payload_json'], true);
                    if ($before !== $e) {
                        if ($old['native_id']) $this->refreshProjection('hc_familytree_events', $treeId,
                            (int)$old['native_id'], $this->eventFields($before), $this->eventFields($e), $warnings, 'události ' . $id);
                        $this->update(self::TABLE, (int)$old['id'], ['payload_json' => $this->encode($e)]);
                        $updated['events']++;
                        if (str_contains((string)$e['person_id'], '|')) $warnings[] = 'Společná událost ' . $id . ' má další zobrazení u druhé osoby; ověřte je ve výzkumných údajích.';
                    }
                    continue;
                }
                $native = null;
                foreach (explode('|', (string)$e['person_id']) as $person) {
                    $eventId = $this->event($treeId, $e, $people[$person]);
                    $native ??= $eventId;
                }
                $this->record($treeId, $origin, 'events', $id, $e, $native); $created['events']++;
            }
            foreach (['facts', 'sources', 'citations', 'media', 'places', 'research',
                'research_facts', 'notes', 'note_links', 'families'] as $type) {
                foreach ($data[$type] as $r) {
                    $id = $r[self::TYPES[$type]];
                    $old = $existing[$type][$id] ?? null;
                    $path = $type === 'media' ? ($mediaPaths[$id] ?? '') : '';
                    if ($old) {
                        $fields = [];
                        if (json_decode((string)$old['payload_json'], true) !== $r) {
                            $fields['payload_json'] = $this->encode($r); $updated[$type]++;
                        }
                        if ($path !== '' && $old['media_path'] !== $path) $fields['media_path'] = $path;
                        if ($fields) $this->update(self::TABLE, (int)$old['id'], $fields);
                    } else {
                        $native = $this->record($treeId, $origin, $type, $id, $r, null);
                        if ($path !== '') $this->update(self::TABLE, $native, ['media_path' => $path]);
                        $created[$type]++;
                    }
                }
            }
            if ($mode === 'update') foreach (self::TYPES as $type => $key) {
                $present = array_fill_keys(array_column($data[$type], $key), true);
                foreach ($existing[$type] ?? [] as $id => $old) if (!isset($present[$id])) {
                    $previous = json_decode((string)$old['payload_json'], true);
                    if (empty($previous['absent_in_current_file'])) {
                        $previous['absent_in_current_file'] = true;
                        $this->update(self::TABLE, (int)$old['id'], ['payload_json' => $this->encode($previous)]);
                    }
                }
            }
            $header = array_diff_key($data, self::TYPES);
            $header['source_sha256'] = hash('sha256', $package['source']);
            $manifest = $existing['package']['manifest'] ?? null;
            if ($manifest) $this->update(self::TABLE, (int)$manifest['id'], ['payload_json' => $this->encode($header)]);
            else $this->record($treeId, $origin, 'package', 'manifest', $header, null);
            $tree = $this->rows('hc_familytree_trees', ['id' => $treeId])[0];
            $fields = ['updated_at' => time()];
            if (empty($tree['root_person_id'])) $fields['root_person_id'] = reset($people);
            $this->update('hc_familytree_trees', $treeId, $fields);
            $report = ['created' => $created, 'updated' => $updated, 'unchanged' => $preview['unchanged'],
            'removed_retained' => $preview['removed'], 'counts' => $preview['counts'],
            'unknown_notes' => $preview['unknownNotes'], 'variants' => $preview['variants'],
            'missing_media' => $preview['missing'], 'mode' => $mode,
            'warnings' => $warnings, 'origin' => $origin, 'completed_at' => gmdate('c'),
            'tree_people' => count($this->rows('hc_familytree_people', ['tree_id' => $treeId])),
            'tree_relationships' => count($this->visibleRelations(
                $this->rows('hc_familytree_relations', ['tree_id' => $treeId]), $this->records($treeId))),
            'media_stored' => $mediaStored,
            'backup_path' => 'Rodokmen/Import/' . $treeId . '/' . $origin . '-' . hash('sha256', $package['source']) . '.' . $package['filename']];
            $oldReport = $this->existing($treeId, $origin)['import_report']['last'] ?? null;
            if ($oldReport) $this->update(self::TABLE, (int)$oldReport['id'], ['payload_json' => $this->encode($report)]);
            else $this->record($treeId, $origin, 'import_report', 'last', $report, null);
            $this->db->commit();
        } catch (\Throwable $error) {
            if ($started) $this->db->rollBack();
            $this->removeStaged($ownerUid, $newFiles); throw $error;
        }
        return $report;
    }

    private function folder(Folder $parent, string $name): Folder {
        try { $node = $parent->get($name); if ($node instanceof Folder) return $node; }
        catch (NotFoundException) { return $parent->newFolder($name); }
        throw new \RuntimeException('Cesta k importu není složka.');
    }

    private function importFolder(string $ownerUid, int $treeId): Folder {
        $root = $this->rootFolder->getUserFolder($ownerUid);
        return $this->folder($this->folder($this->folder($root, 'Rodokmen'), 'Import'), (string)$treeId);
    }

    private function saveBackup(string $ownerUid, int $treeId, string $origin, string $source, string $extension): void {
        $folder = $this->importFolder($ownerUid, $treeId);
        $name = $origin . '-' . hash('sha256', $source) . '.' . $extension;
        if (!$folder->nodeExists($name)) $folder->newFile($name, $source);
    }

    private function saveMedia(string $ownerUid, int $treeId, array $m, string $content, array &$newFiles): string {
        $folder = $this->folder($this->importFolder($ownerUid, $treeId), 'media');
        $extension = strtolower(pathinfo($m['file_name'], PATHINFO_EXTENSION));
        if (!in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'], true)) {
            throw new \InvalidArgumentException('Neplatná přípona obrázku.');
        }
        $name = substr(hash('sha256', $content), 0, 32) . '-' . basename($m['file_name']);
        $path = 'Rodokmen/Import/' . $treeId . '/media/' . $name;
        if ($folder->nodeExists($name)) {
            if (hash('sha256', (string)$folder->get($name)->getContent()) !== hash('sha256', $content)) {
                throw new \RuntimeException('Soubor stejného jména už existuje s jiným obsahem.');
            }
        } else {
            $folder->newFile($name, $content);
            $newFiles[] = $path;
        }
        return $path;
    }

    private function removeStaged(string $ownerUid, array $paths): void {
        foreach ($paths as $path) try {
            $this->rootFolder->getUserFolder($ownerUid)->get($path)->delete();
        } catch (\Throwable) { /* Retained outside the database and safe to retry. */ }
    }

    public function records(int $treeId): array {
        return array_map(static function (array $row): array {
            $row['data'] = json_decode((string)$row['payload_json'], true);
            unset($row['payload_json']);
            return $row;
        }, $this->rows(self::TABLE, ['tree_id' => $treeId]));
    }

    public function displayMedia(array $row, string $ownerUid): Response {
        if ($row['entity_type'] !== 'media' || $row['media_path'] === '') return new JSONResponse(['error' => 'Obrázek chybí.'], 404);
        try { $node = $this->rootFolder->getUserFolder($ownerUid)->get($row['media_path']); }
        catch (NotFoundException) { return new JSONResponse(['error' => 'Obrázek chybí.'], 404); }
        if (!$node instanceof File || $node->getSize() > 16 * 1024 * 1024) return new JSONResponse(['error' => 'Obrázek chybí.'], 404);
        $content = (string)$node->getContent();
        $mime = (new \finfo(FILEINFO_MIME_TYPE))->buffer($content);
        if (!in_array($mime, self::IMAGES, true)) return new JSONResponse(['error' => 'Obrázek chybí.'], 404);
        return new DataDisplayResponse($content, 200, ['Content-Type' => $mime,
            'X-Content-Type-Options' => 'nosniff', 'Cache-Control' => 'private, no-store']);
    }
}
