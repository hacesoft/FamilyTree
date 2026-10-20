<?php
declare(strict_types=1);

namespace OCA\HcFamilyTree\Service;

/** Read GEDCOM 7 into the application's private evidence records. The uploaded GEDCOM is also retained verbatim. */
final class Gedcom7Package {
    private array $nodes = [];
    private array $records = [];
    private array $data = [];
    private array $media = [];
    private array $warnings = [];
    private array $files = [];
    private bool $gedzip = false;
    private array $mediaPaths = [];
    private array $capturedNotes = [];

    private function __construct() {}

    public static function parse(string $text, array $files, bool $gedzip): array {
        $parser = new self();
        $parser->files = $files;
        $parser->gedzip = $gedzip;
        $parser->read($text);
        $parser->convert();
        return ['data' => $parser->data, 'media' => $parser->media, 'warnings' => array_values(array_unique($parser->warnings))];
    }

    private static function id(string $prefix, string $value): string {
        return $prefix . substr(hash('sha256', $value), 0, 24);
    }

    private function read(string $text): void {
        if (strlen($text) > 5 * 1024 * 1024 || !preg_match('//u', $text)) {
            throw new \InvalidArgumentException('GEDCOM musí být UTF-8 a menší než 5 MB.');
        }
        $text = preg_replace('/^\xEF\xBB\xBF/', '', $text);
        $stack = []; $trailer = false;
        foreach (preg_split('/\r\n|\n|\r/', $text) as $number => $line) {
            if ($line === '' && $number === 0) throw new \InvalidArgumentException('Prázdný začátek GEDCOM.');
            if ($line === '') continue;
            if (!preg_match('/^(\d+) (?:@([^@\s]+)@ )?([A-Za-z0-9_]+)(?: (.*))?$/Du', $line, $m)) {
                throw new \InvalidArgumentException('Neplatný řádek GEDCOM ' . ($number + 1) . '.');
            }
            $level = (int)$m[1];
            if ($level > 100 || ($level && !isset($stack[$level - 1])) || $trailer) {
                throw new \InvalidArgumentException('Neplatná úroveň nebo konec GEDCOM na řádku ' . ($number + 1) . '.');
            }
            $id = $m[2] ?? ''; $tag = $m[3];
            if ($level && $id !== '') throw new \InvalidArgumentException('Identifikátor na vnořeném řádku GEDCOM.');
            if ($level === 0 && $tag === 'TRLR') $trailer = true;
            $parent = $level ? $stack[$level - 1] : null;
            $index = count($this->nodes);
            $this->nodes[] = ['tag' => $tag, 'id' => $id, 'value' => str_replace('@@', '@', $m[4] ?? ''),
                'raw' => $line, 'children' => [], 'parent' => $parent];
            if ($parent !== null) $this->nodes[$parent]['children'][] = $index;
            if ($level === 0) {
                if ($id !== '') {
                    if (isset($this->records[$id])) throw new \InvalidArgumentException('Duplicitní GEDCOM identifikátor ' . $id . '.');
                    $this->records[$id] = $index;
                }
                $this->data['_top'][] = $index;
            }
            $stack[$level] = $index;
            foreach (array_keys($stack) as $old) if ($old > $level) unset($stack[$old]);
        }
        $top = $this->data['_top'] ?? [];
        if (!$trailer || count($top) < 3 || $this->nodes[$top[0]]['tag'] !== 'HEAD'
            || $this->nodes[end($top)]['tag'] !== 'TRLR') {
            throw new \InvalidArgumentException('GEDCOM musí začínat HEAD a končit TRLR.');
        }
        $gedc = $this->one($top[0], 'GEDC');
        $version = $gedc !== null ? $this->one($gedc, 'VERS') : null;
        if ($version === null || !preg_match('/^7\.0(?:\.\d+)?$/D', $this->value($version))) {
            throw new \InvalidArgumentException('Podporován je jen FamilySearch GEDCOM 7.0.');
        }
        $charset = $this->field($top[0], 'CHAR');
        if ($charset !== '' && strtoupper($charset) !== 'UTF-8') {
            throw new \InvalidArgumentException('GEDCOM 7 musí mít kódování UTF-8.');
        }
        foreach ($this->nodes as $node) {
            $expected = ['FAMC' => 'FAM', 'FAMS' => 'FAM', 'HUSB' => 'INDI', 'WIFE' => 'INDI',
                'CHIL' => 'INDI', 'SNOTE' => 'SNOTE'][$node['tag']] ?? null;
            if ($node['tag'] === 'SOUR' && $node['parent'] !== null && $this->nodes[$node['parent']]['tag'] !== 'HEAD') $expected = 'SOUR';
            if ($node['tag'] === 'OBJE' && $node['value'] !== '') $expected = 'OBJE';
            if ($node['tag'] === 'REPO' && $node['value'] !== '') $expected = 'REPO';
            if ($expected !== null && $node['parent'] !== null) $this->pointer($node['value'], $expected);
        }
    }

    private function children(int $index, string $tag): array {
        return array_values(array_filter($this->nodes[$index]['children'], fn(int $i): bool => $this->nodes[$i]['tag'] === $tag));
    }

    private function one(int $index, string $tag): ?int { return $this->children($index, $tag)[0] ?? null; }
    private function value(?int $index): string { return $index === null ? '' : $this->nodes[$index]['value']; }
    private function field(int $index, string $tag): string { return $this->value($this->one($index, $tag)); }

    private function pointer(string $raw, string $tag): int {
        if (!preg_match('/^@([^@\s]+)@$/D', $raw, $m)
            || !isset($this->records[$m[1]]) || $this->nodes[$this->records[$m[1]]]['tag'] !== $tag) {
            throw new \InvalidArgumentException('Neplatný odkaz na ' . $tag . ': ' . $raw);
        }
        return $this->records[$m[1]];
    }

    private function text(int $index): string {
        $result = $this->value($index);
        foreach ($this->nodes[$index]['children'] as $child) {
            if ($this->nodes[$child]['tag'] === 'CONT') $result .= "\n" . $this->value($child);
            if ($this->nodes[$child]['tag'] === 'CONC') $result .= $this->value($child);
        }
        return $result;
    }

    private function rawSubtree(int $index): string {
        $lines = [$this->nodes[$index]['raw']];
        foreach ($this->nodes[$index]['children'] as $child) $lines[] = $this->rawSubtree($child);
        return implode("\n", $lines);
    }

    /** Every shared or inline note and every owner link is retained independently of parsing conventions. */
    private function captureNotes(int $index, string $ownerType, string $ownerId, string $key): void {
        foreach ($this->nodes[$index]['children'] as $ordinal => $note) {
            $tag = $this->nodes[$note]['tag'];
            if ($tag !== 'NOTE' && $tag !== 'SNOTE') continue;
            $this->capturedNotes[$note] = true;
            $shared = $tag === 'SNOTE' ? $this->pointer($this->value($note), 'SNOTE') : null;
            $target = $shared ?? $note;
            $xref = $shared === null ? '' : $this->nodes[$shared]['id'];
            $id = self::id('N', $shared === null ? $key . ':note:' . $ordinal : $this->recordKey($shared));
            if ($shared === null) $this->storeNote($target, $id, '');
            $this->data['note_links'][] = ['note_link_id' => self::id('K', $key . ':link:' . $ordinal),
                'note_id' => $id, 'owner_type' => $ownerType, 'owner_id' => $ownerId,
                'snote_xref' => $xref];
        }
    }

    private function storeNote(int $index, string $id, string $xref): void {
        $sourceIds = [];
        foreach ($this->children($index, 'SOUR') as $source) {
            $sourceIds[] = $this->sourceId($this->pointer($this->value($source), 'SOUR'));
        }
        $this->data['notes'][] = ['note_id' => $id, 'xref' => $xref,
            'full_text' => $this->text($index), 'source_links' => $sourceIds,
            'kind' => preg_match('/^NF_/', $xref) ? 'research_facts' :
                (preg_match('/^NP_/', $xref) ? 'place_catalog' :
                    (preg_match('/^NR_/', $xref) ? 'research_task' : 'other')),
            'raw_subtree' => $this->rawSubtree($index), 'uid' => $this->field($index, 'UID')];
    }

    private function notes(int $index): string {
        $parts = [];
        foreach ($this->children($index, 'NOTE') as $note) $parts[] = $this->text($note);
        foreach ($this->children($index, 'SNOTE') as $note) $parts[] = $this->text($this->pointer($this->value($note), 'SNOTE'));
        return implode("\n", array_filter($parts, static fn(string $v): bool => $v !== ''));
    }

    private function recordKey(int $index): string {
        return $this->field($index, 'UID') ?: $this->nodes[$index]['id'];
    }

    private function personId(int $index): string { return self::id('P', $this->recordKey($index)); }
    private function sourceId(int $index): string { return self::id('S', $this->recordKey($index)); }

    private function sourceFor(int $index): string {
        $first = $this->one($index, 'SOUR');
        if ($first === null) return '';
        return $this->sourceId($this->pointer($this->value($first), 'SOUR'));
    }

    private function citations(int $index, string $entityType, string $entityId, string $key, string $locatorFallback = ''): void {
        foreach ($this->children($index, 'SOUR') as $ordinal => $citation) {
            $source = $this->pointer($this->value($citation), 'SOUR');
            $citationId = self::id('C', $key . ':citation:' . $ordinal);
            $data = $this->one($citation, 'DATA');
            $transcription = $data === null ? '' : implode("\n", array_map(fn(int $i): string => $this->text($i), $this->children($data, 'TEXT')));
            $this->data['citations'][] = ['citation_id' => $citationId, 'source_id' => $this->sourceId($source),
                'linked_entity_type' => $entityType, 'linked_entity_id' => $entityId,
                'locator' => $this->field($citation, 'PAGE') ?: $locatorFallback, 'transcription' => $transcription,
                'transcription_status' => '', 'quay' => $this->field($citation, 'QUAY'),
                'notes' => $this->notes($citation)];
            $this->captureNotes($citation, 'citation', $citationId, $key . ':citation:' . $ordinal);
            $this->attachments($citation, $entityType, $entityId, $key . ':citation:' . $ordinal,
                $this->sourceId($source), $citationId);
            $this->attachments($source, $entityType, $entityId, $key . ':citation:' . $ordinal . ':source',
                $this->sourceId($source), $citationId);
        }
    }

    /** URL paths are percent-encoded in GEDCOM and unescaped in GEDZIP filenames. */
    private function filePath(string $raw): ?string {
        if (preg_match('~^(https?|ftp)://~i', $raw)) return null;
        if (str_contains($raw, ':') || str_starts_with($raw, '/') || str_contains($raw, '\\')
            || strpbrk($raw, '?#') !== false || $raw === '') {
            throw new \InvalidArgumentException('Neplatná lokální cesta média: ' . $raw);
        }
        $path = rawurldecode($raw);
        if (str_contains($path, '\\') || str_starts_with($path, '/')
            || preg_match('~(^|/)\.{1,2}(/|$)|[\x00-\x1f]~', $path)
            || !preg_match('//u', $path)) throw new \InvalidArgumentException('Neplatná lokální cesta média: ' . $raw);
        return $path;
    }

    private function attachments(int $index, string $entityType, string $entityId, string $key,
        string $sourceId = '', string $citationId = ''): void {
        foreach ($this->children($index, 'OBJE') as $ordinal => $link) {
            $object = $this->value($link) !== '' ? $this->pointer($this->value($link), 'OBJE') : $link;
            $this->mediaObject($object, $entityType, $entityId, $key, $ordinal, $sourceId, $citationId);
        }
    }

    private function mediaObject(int $object, string $entityType, string $entityId, string $key,
        int $ordinal, string $sourceId = '', string $citationId = ''): void {
        foreach ($this->children($object, 'FILE') as $fileOrdinal => $file) {
            $raw = $this->value($file);
            $path = $this->filePath($raw);
            $form = $this->field($file, 'FORM');
            $mediaType = $this->one($file, 'FORM');
            $kind = $mediaType === null ? '' : $this->field($mediaType, 'MEDI');
            $supported = $form === '' || in_array(strtolower($form), ['image/jpeg','image/png','image/gif','image/webp'], true);
            if (!$supported) $this->warnings[] = 'Médium ' . $raw . ' (' . $form . ') je evidováno; náhled je dostupný jen pro obrázky.';
            $id = self::id('M', $key . ':media:' . $ordinal . ':' . $fileOrdinal);
            $content = $path === null ? null : ($this->files[$path] ?? null);
            if ($supported && $path !== null && $content !== null && !isset($this->mediaPaths[$path])) {
                $this->mediaPaths[$path] = true;
                $this->media[$path] = $content;
            }
            $this->data['media'][] = ['media_id' => $id, 'file_name' => $path ?? $raw,
                'media_type' => $kind === 'PHOTO' ? 'person_photo' : 'source_scan',
                'title' => $this->field($file, 'TITL') ?: $this->field($object, 'TITL') ?: $this->notes($object) ?: basename($raw),
                'linked_entity_type' => $entityType, 'linked_entity_id' => $entityId,
                'source_id' => $sourceId, 'citation_id' => $citationId,
                'form' => $form, 'sha256' => $content !== null ? hash('sha256', $content) : '',
                'url' => $path === null ? $raw : '', 'supported' => $supported,
                'original_file' => $raw, 'rights' => $this->field($object, 'RESN'),
                'origin' => $this->notes($object), 'uid' => $this->field($object, 'UID'),
                'raw_subtree' => $this->rawSubtree($object)];
        }
    }

    private function event(int $index, string $key, string $persons, string $kind): void {
        $id = self::id('E', $this->field($index, 'UID') ?: $key);
        $place = $this->one($index, 'PLAC');
        $this->data['events'][] = ['event_id' => $id, 'person_id' => $persons, 'event_type' => strtolower($kind),
            'date_value' => $this->field($index, 'DATE'), 'place' => $this->value($place),
            'description' => $this->field($index, 'TYPE') ?: $this->value($index),
            'notes' => $this->notes($index), 'source_id' => $this->sourceFor($index),
            'verification_status' => $this->sourceFor($index) === '' ? 'unverified' : 'cited',
            'uid' => $this->field($index, 'UID'), 'raw_subtree' => $this->rawSubtree($index)];
        $this->captureNotes($index, 'event', $id, $key);
        $this->citations($index, 'event', $id, $key);
        $this->attachments($index, 'event', $id, $key, $this->sourceFor($index));
    }

    private function convert(): void {
        $this->data = ['schema_version' => '1.0', 'format' => 'FamilySearch GEDCOM 7',
            'persons' => [], 'relationships' => [], 'events' => [], 'facts' => [], 'sources' => [],
            'citations' => [], 'media' => [], 'places' => [], 'research' => [],
            'research_facts' => [], 'notes' => [], 'note_links' => [], 'families' => []];
        foreach ($this->records as $index) if ($this->nodes[$index]['tag'] === 'SNOTE') {
            $this->storeNote($index, self::id('N', $this->recordKey($index)), $this->nodes[$index]['id']);
        }
        foreach ($this->records as $index) if ($this->nodes[$index]['tag'] === 'SOUR') {
            $repoRaw = $this->field($index, 'REPO');
            $repository = $repoRaw === '' ? null : $this->pointer($repoRaw, 'REPO');
            $this->data['sources'][] = ['source_id' => $this->sourceId($index), 'title' => $this->field($index, 'TITL') ?: $this->nodes[$index]['id'],
                'archive' => $repository === null ? '' : ($this->field($repository, 'NAME') ?: $repoRaw),
                'repository_xref' => $repoRaw, 'url' => $this->field($index, 'WWW'),
                'notes' => $this->notes($index), 'author' => $this->field($index, 'AUTH'),
                'publication' => $this->field($index, 'PUBL'), 'text' => $this->field($index, 'TEXT'),
                'uid' => $this->field($index, 'UID'), 'raw_subtree' => $this->rawSubtree($index)];
            $this->captureNotes($index, 'source', $this->sourceId($index), $this->recordKey($index));
            $this->attachments($index, 'source', $this->sourceId($index), $this->recordKey($index));
        }
        $individualEvents = ['BIRT','CHR','BAPM','DEAT','BURI','CREM','ADOP','EVEN','OCCU','RESI','IMMI','EMIG','GRAD','RETI','CENS','NATU','PROB','WILL','BLES','BARM','BASM','CHRA','CONF','FCOM','ORDN','EDUC','RELI','TITL','DSCR'];
        foreach ($this->records as $index) if ($this->nodes[$index]['tag'] === 'INDI') {
            $key = $this->recordKey($index); $id = $this->personId($index);
            $names = $this->children($index, 'NAME'); $name = $names[0] ?? null;
            $given = $name === null ? '' : $this->field($name, 'GIVN');
            $surname = $name === null ? '' : $this->field($name, 'SURN');
            if ($name !== null && (!$given || !$surname) && preg_match('~^(.*?)\s*/(.*?)/~u', $this->value($name), $m)) {
                $given = $given ?: trim($m[1]); $surname = $surname ?: trim($m[2]);
            }
            $birth = $this->one($index, 'BIRT'); $death = $this->one($index, 'DEAT');
            $this->data['persons'][] = ['person_id' => $id, 'given_names' => $given, 'surname_best' => $surname,
                'birth_surname' => '', 'sex' => $this->field($index, 'SEX'),
                'birth_date' => $birth === null ? '' : $this->field($birth, 'DATE'),
                'birth_place' => $birth === null ? '' : $this->field($birth, 'PLAC'),
                'death_date' => $death === null ? '' : $this->field($death, 'DATE'),
                'death_place' => $death === null ? '' : $this->field($death, 'PLAC'),
                'occupations' => '', 'living_status' => $death === null ? 'unknown' : 'deceased',
                'verification_status' => $this->sourceFor($index) === '' ? 'unverified' : 'cited',
                'notes' => $this->notes($index), 'uid' => $this->field($index, 'UID'),
                'xref' => $this->nodes[$index]['id'], 'raw_subtree' => $this->rawSubtree($index)];
            $this->captureNotes($index, 'person', $id, $key);
            $this->citations($index, 'person', $id, $key);
            $this->attachments($index, 'person', $id, $key);
            foreach ($names as $ordinal => $nameNode) {
                $this->data['facts'][] = ['fact_id' => self::id('F', $key . ':name:' . $ordinal),
                    'subject_type' => 'person', 'subject_id' => $id, 'predicate' => 'NAME',
                    'value' => $this->value($nameNode), 'verification_status' => $this->sourceFor($nameNode) === '' ? 'unverified' : 'cited',
                    'source_id' => $this->sourceFor($nameNode), 'notes' => $this->notes($nameNode),
                    'raw_subtree' => $this->rawSubtree($nameNode), 'preferred' => $ordinal === 0];
                $this->citations($nameNode, 'person', $id, $key . ':name:' . $ordinal);
                $this->captureNotes($nameNode, 'person', $id, $key . ':name:' . $ordinal);
            }
            foreach ($this->nodes[$index]['children'] as $ordinal => $part) {
                $tag = $this->nodes[$part]['tag'];
                if (in_array($tag, $individualEvents, true)) $this->event($part, $key . ':event:' . $ordinal, $id, $tag);
                elseif (!in_array($tag, ['NAME','SEX','UID','FAMC','FAMS','OBJE','SOUR','NOTE','SNOTE','CHAN','CREA','RESN','EXID','REFN','RIN'], true)) {
                    $this->data['facts'][] = ['fact_id' => self::id('F', $key . ':fact:' . $ordinal),
                        'subject_type' => 'person', 'subject_id' => $id, 'predicate' => $tag,
                        'value' => $this->value($part), 'verification_status' => $this->sourceFor($part) === '' ? 'unverified' : 'cited',
                        'source_id' => $this->sourceFor($part), 'notes' => $this->notes($part),
                        'raw_subtree' => $this->rawSubtree($part)];
                    $this->citations($part, 'person', $id, $key . ':fact:' . $ordinal);
                    $this->captureNotes($part, 'person', $id, $key . ':fact:' . $ordinal);
                }
            }
        }
        if (!$this->data['persons']) throw new \InvalidArgumentException('GEDCOM neobsahuje žádnou osobu.');
        foreach ($this->records as $index) if ($this->nodes[$index]['tag'] === 'FAM') $this->family($index);
        $referencedObjects = [];
        foreach ($this->nodes as $node) if ($node['tag'] === 'OBJE' && $node['parent'] !== null && $node['value'] !== '') {
            $referencedObjects[$this->pointer($node['value'], 'OBJE')] = true;
        }
        foreach ($this->records as $index) if ($this->nodes[$index]['tag'] === 'OBJE' && !isset($referencedObjects[$index])) {
            $this->mediaObject($index, 'unlinked', '', $this->recordKey($index), 0);
        }
        foreach ($this->records as $index) if ($this->nodes[$index]['tag'] === 'INDI') {
            foreach (['FAMC' => 'CHIL', 'FAMS' => 'SPOUSE'] as $tag => $role) {
                foreach ($this->children($index, $tag) as $link) {
                    $family = $this->pointer($this->value($link), 'FAM');
                    $members = $role === 'CHIL' ? $this->children($family, 'CHIL') : array_merge($this->children($family, 'HUSB'), $this->children($family, 'WIFE'));
                    if (!in_array($index, array_map(fn(int $member): int => $this->pointer($this->value($member), 'INDI'), $members), true)) {
                        throw new \InvalidArgumentException('Nesouhlasí obousměrné vazby INDI/FAM u ' . $this->nodes[$index]['id'] . '.');
                    }
                }
            }
        }
        $this->captureRemainingNotes();
        $this->convertSharedNotes();
        // A copy of the complete GEDCOM/GEDZIP is saved separately. These are the standard
        // records represented in the application; uncommon substructures remain in the original.
        $this->warnings[] = 'Původní GEDCOM/GEDZIP a neznámé podstruktury zůstávají v archivované kopii originálu.';
        foreach ($this->records as $index) if (!in_array($this->nodes[$index]['tag'], ['INDI','FAM','SOUR','OBJE','REPO','SNOTE','SUBM'], true)) {
            $this->warnings[] = 'Záznam ' . $this->nodes[$index]['tag'] . ' je uchován v původním souboru.';
        }
    }

    private function captureRemainingNotes(): void {
        foreach ($this->nodes as $index => $node) {
            if ($node['parent'] === null || !in_array($node['tag'], ['NOTE', 'SNOTE'], true)
                || isset($this->capturedNotes[$index])) continue;
            $ancestor = $node['parent'];
            while ($this->nodes[$ancestor]['parent'] !== null) $ancestor = $this->nodes[$ancestor]['parent'];
            $root = $this->nodes[$ancestor];
            $shared = $node['tag'] === 'SNOTE' ? $this->pointer($node['value'], 'SNOTE') : null;
            $noteId = self::id('N', $shared === null ? $root['id'] . ':inline:' . $index : $this->recordKey($shared));
            if ($shared === null) $this->storeNote($index, $noteId, '');
            $ownerType = match ($root['tag']) {
                'INDI' => 'person', 'FAM' => 'family', 'SOUR' => 'source', default => 'unlinked',
            };
            $ownerId = match ($ownerType) {
                'person' => $this->personId($ancestor), 'family' => self::id('H', $this->recordKey($ancestor)),
                'source' => $this->sourceId($ancestor), default => '',
            };
            $this->data['note_links'][] = ['note_link_id' => self::id('K', $root['id'] . ':inline-link:' . $index),
                'note_id' => $noteId, 'owner_type' => $ownerType, 'owner_id' => $ownerId,
                'owner_xref' => $root['id'], 'snote_xref' => $shared === null ? '' : $this->nodes[$shared]['id']];
        }
    }

    private function family(int $index): void {
        $key = $this->recordKey($index);
        $familyId = self::id('H', $key);
        $parents = [];
        foreach (['HUSB','WIFE'] as $tag) foreach ($this->children($index, $tag) as $part) {
            $parent = $this->pointer($this->value($part), 'INDI');
            $parents[] = $this->personId($parent);
            if (!in_array($index, array_map(fn(int $link): int => $this->pointer($this->value($link), 'FAM'), $this->children($parent, 'FAMS')), true)) {
                throw new \InvalidArgumentException('Chybí obousměrný odkaz FAMS u ' . $this->nodes[$parent]['id'] . '.');
            }
        }
        if (count($parents) === 2) {
            $this->data['relationships'][] = ['relationship_id' => self::id('R', $key . ':spouse'),
                'person1_id' => $parents[0], 'person2_id' => $parents[1], 'relationship_type' => 'spouse',
                'source_id' => $this->sourceFor($index), 'verification_status' => 'unverified', 'notes' => $this->notes($index)];
        }
        $children = [];
        foreach ($this->children($index, 'CHIL') as $childNode) {
            $children[] = $this->personId($this->pointer($this->value($childNode), 'INDI'));
        }
        $this->data['families'][] = ['family_id' => $familyId, 'uid' => $this->field($index, 'UID'),
            'xref' => $this->nodes[$index]['id'], 'parent_ids' => $parents, 'child_ids' => $children,
            'notes' => $this->notes($index), 'raw_subtree' => $this->rawSubtree($index)];
        $this->captureNotes($index, 'family', $familyId, $key);
        $this->citations($index, 'family', $familyId, $key . ':family');
        $this->attachments($index, 'family', $familyId, $key . ':family');
        foreach ($this->children($index, 'CHIL') as $childNode) {
            $child = $this->pointer($this->value($childNode), 'INDI');
            $childId = $this->personId($child); $status = 'unverified'; $linked = false; $pedigree = '';
            foreach ($this->children($child, 'FAMC') as $link) if ($this->pointer($this->value($link), 'FAM') === $index) {
                $linked = true; $status = strtolower($this->field($link, 'STAT') ?: 'unverified');
                $pedigree = $this->field($link, 'PEDI');
                $this->captureNotes($link, 'person', $childId, $key . ':child:' . $childId);
                break;
            }
            if (!$linked) throw new \InvalidArgumentException('Chybí obousměrný odkaz FAMC u ' . $this->nodes[$child]['id'] . '.');
            if (!in_array(strtoupper($status), ['PROVEN', 'CHALLENGED', 'DISPROVEN', 'UNVERIFIED'], true)) {
                throw new \InvalidArgumentException('Neznámý stav FAMC.STAT: ' . $status);
            }
            foreach ($parents as $parent) $this->data['relationships'][] = [
                'relationship_id' => self::id('R', $key . ':parent:' . $parent . ':' . $childId),
                'person1_id' => $parent, 'person2_id' => $childId, 'relationship_type' => 'parent_child',
                'source_id' => $this->sourceFor($index), 'verification_status' => strtolower($status),
                'pedigree' => $pedigree, 'notes' => $this->notes($index)];
        }
        $members = implode('|', array_unique($parents));
        foreach ($this->nodes[$index]['children'] as $ordinal => $part) {
            $tag = $this->nodes[$part]['tag'];
            if (in_array($tag, ['MARR','DIV','ENGA','MARB','MARC','MARL','MARS','ANUL','CENS','EVEN','RESI'], true) && $members !== '') {
                $this->event($part, $key . ':event:' . $ordinal, $members, $tag);
            }
        }
    }

    /** NF/NP/NR are XREF naming conventions on standard shared notes, not GEDCOM tags. */
    private function convertSharedNotes(): void {
        $links = [];
        foreach ($this->data['note_links'] as $link) $links[$link['note_id']][] = $link;
        $aliases = [];
        foreach ($this->records as $index) if ($this->nodes[$index]['tag'] === 'INDI') {
            foreach ([$this->nodes[$index]['id'], $this->field($index, 'UID')] as $alias) {
                if ($alias !== '') $aliases[$alias][] = $this->personId($index);
                if (preg_match('/(?:^|_)(P[0-9]+)$/D', $alias, $m)) $aliases[$m[1]][] = $this->personId($index);
            }
        }
        foreach ($this->data['notes'] as &$note) {
            $id = $note['note_id']; $xref = $note['xref'];
            $note['owner_links'] = array_map(static fn(array $link): array => [
                'owner_type' => $link['owner_type'], 'owner_id' => $link['owner_id']], $links[$id] ?? []);
            if ($xref === '') continue;
            $index = $this->records[$xref]; $body = $note['full_text'];
            if ($note['kind'] === 'research_facts') {
                $pieces = []; $current = null;
                foreach (explode("\n", $body) as $line) {
                    if (preg_match('/^\s*(F[0-9]+)\s*[—-]\s*(.*)$/uD', $line, $m)) {
                        if ($current !== null) $pieces[] = $current;
                        $current = ['code' => $m[1], 'text' => $m[2], 'original_text' => $line];
                    } elseif ($current !== null) {
                        $current['text'] .= "\n" . $line;
                        $current['original_text'] .= "\n" . $line;
                    }
                }
                if ($current !== null) $pieces[] = $current;
                if (!$pieces) $this->warnings[] = 'Poznámka ' . $xref . ' nemá rozpoznatelný řádek Fxxxxx; celý text je zachován.';
                foreach ($pieces as $part) {
                    $parts = preg_split('/\s*;\s*/u', $part['text']);
                    $head = array_shift($parts);
                    preg_match('/^\s*([^:\n]+):\s*(.*)$/us', $head, $first);
                    $fields = [];
                    foreach ($parts as $item) if (preg_match('/^\s*([^:\n]+):\s*(.*)$/us', $item, $match)) {
                        $fields[mb_strtolower(trim($match[1]))] = trim($match[2]);
                    }
                    $owners = array_values(array_filter($links[$id] ?? [],
                        static fn(array $l): bool => in_array($l['owner_type'], ['person','family','event'], true)));
                    if (!$owners) $owners = [['owner_type' => 'unlinked', 'owner_id' => '']];
                    $uniqueOwners = [];
                    foreach ($owners as $owner) $uniqueOwners[$owner['owner_type'] . ':' . $owner['owner_id']] = $owner;
                    foreach ($uniqueOwners as $owner) {
                        $factId = self::id('V', $this->recordKey($index) . ':' . $part['code'] . ':' . $owner['owner_id']);
                        $key = $this->recordKey($index) . ':fact:' . $part['code'] . ':' . $owner['owner_id'];
                        $citationId = $this->one($index, 'SOUR') === null ? '' : self::id('C', $key . ':citation:0');
                        $this->data['research_facts'][] = [
                            'fact_id' => $factId, 'external_fact_id' => $part['code'],
                            'owner_type' => $owner['owner_type'], 'owner_id' => $owner['owner_id'],
                            'fact_type' => trim($first[1] ?? ''), 'raw_value' => trim($first[2] ?? $head),
                            'normalized_value' => $fields['normalizace'] ?? '',
                            'verification_status' => $fields['stav'] ?? 'unverified',
                            'confidence_percent' => isset($fields['jistota']) && preg_match('/\b(100|[0-9]{1,2})\s*%?/u', $fields['jistota'], $confidence)
                                ? (int)$confidence[1] : null,
                            'source_id' => $this->sourceFor($index), 'citation_id' => $citationId,
                            'locator' => $fields['lokátor'] ?? '', 'note' => $part['text'],
                            'snote_xref' => $xref, 'original_text' => $part['original_text']];
                        $this->citations($index, 'research_facts', $factId, $key, $fields['lokátor'] ?? '');
                    }
                }
            } elseif ($note['kind'] === 'place_catalog') {
                preg_match('/^Místo\s+(L[0-9]+):\s*([^\n]+)/u', $body, $main);
                $fields = [];
                foreach (preg_split('/[;\n]/u', $body) as $line) {
                    if (preg_match('/^\s*([^:]+):\s*(.+)$/u', $line, $m)) $fields[mb_strtolower(trim($m[1]))] = trim($m[2], " \t\r\n.");
                }
                $this->data['places'][] = [
                    'place_id' => self::id('L', $this->recordKey($index)),
                    'catalog_id' => $main[1] ?? '', 'name' => isset($main[2]) ? rtrim(trim($main[2]), '.') : '',
                    'current_municipality' => $fields['současná obec'] ?? '',
                    'district' => $fields['okres'] ?? '', 'region' => $fields['kraj'] ?? '',
                    'country' => $fields['země'] ?? '', 'historical_names' => $fields['historické názvy'] ?? '',
                    'place_type' => $fields['typ'] ?? '', 'note' => $body, 'latitude' => null,
                    'longitude' => null, 'verification_status' => null,
                    'snote_xref' => $xref, 'original_text' => $body];
            } elseif ($note['kind'] === 'research_task') {
                preg_match('/^Výzkumný úkol\s+(Q[0-9]+)\s*[—-]\s*([^\n]+)/u', $body, $main);
                $fields = [];
                foreach (explode("\n", $body) as $line) if (preg_match('/^\s*([^:]+):\s*(.*)$/u', $line, $m)) {
                    $fields[mb_strtolower(trim($m[1]))] = trim($m[2]);
                }
                $target = $fields['cíl'] ?? '';
                $personIds = [];
                foreach ($links[$id] ?? [] as $link) if ($link['owner_type'] === 'person') $personIds[$link['owner_id']] = true;
                if (preg_match_all('/\bP[0-9]+\b/u', $target, $codes)) foreach ($codes[0] as $code) {
                    $matches = array_unique($aliases[$code] ?? []);
                    if (count($matches) === 1) $personIds[reset($matches)] = true;
                }
                $this->data['research'][] = [
                    'research_id' => self::id('Q', $this->recordKey($index)),
                    'external_task_id' => $main[1] ?? '', 'title' => trim($main[2] ?? strtok($body, "\n")),
                    'question' => trim($main[2] ?? strtok($body, "\n")),
                    'status' => rtrim($fields['stav'] ?? 'PLANNED', '.'),
                    'attempts' => $fields['pokusy'] ?? '', 'result' => $fields['výsledek'] ?? '',
                    'next_step' => $fields['další krok'] ?? '', 'checkpoint' => $fields['checkpoint'] ?? '',
                    'target_text' => $target, 'target_person_ids' => array_keys($personIds),
                    'source_id' => $this->sourceFor($index), 'snote_xref' => $xref,
                    'original_text' => $body];
            }
        }
        unset($note);
    }

    public static function validateFiles(string $text, array $files, bool $gedzip): void {
        $parser = new self(); $parser->files = $files; $parser->gedzip = $gedzip; $parser->read($text);
        foreach ($parser->nodes as $node) if ($node['parent'] !== null
            && (($node['tag'] === 'FILE' && $parser->nodes[$node['parent']]['tag'] === 'OBJE')
                || ($node['tag'] === 'TRAN' && $parser->nodes[$node['parent']]['tag'] === 'FILE'))) {
            $path = $parser->filePath($node['value']);
            if ($path !== null && !array_key_exists($path, $files)) {
                throw new \InvalidArgumentException('Balíček neobsahuje odkazovaný soubor: ' . $path);
            }
        }
    }
}
