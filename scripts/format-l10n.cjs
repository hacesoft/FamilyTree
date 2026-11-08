#!/usr/bin/env node
'use strict';
// Hacesoft source rule: canonical EN keys, readable Nextcloud JS/JSON catalogs.
const fs = require('node:fs');
const path = require('node:path');
const dir = path.resolve(__dirname, '../src/l10n');
for (const name of fs.readdirSync(dir).filter(name => name.endsWith('.json')).sort()) {
  const locale = name.slice(0, -'.json'.length);
  const file = path.join(dir, name);
  const catalog = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!catalog.translations || typeof catalog.pluralForm !== 'string') throw Error(`Invalid catalog ${name}`);
  fs.writeFileSync(file, JSON.stringify(catalog, null, 2) + '\n');
  const values = JSON.stringify(catalog.translations, null, 2)
    .split('\n').map((line, i) => i ? '  ' + line : '  ' + line).join('\n');
  fs.writeFileSync(path.join(dir, locale + '.js'),
    'OC.L10N.register(\n  "hc_familytree",\n' + values + ',\n  ' + JSON.stringify(catalog.pluralForm) + '\n);\n');
  console.log('Formatted', locale, Object.keys(catalog.translations).length, 'entries');
}
