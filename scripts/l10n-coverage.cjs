#!/usr/bin/env node
'use strict';
// Localization health report and strict release gate; no external network calls.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'src/l10n');
const locales = ['en','cs','de','es','fr','it','nl','pl','pt','sk','uk'];
const aliases = ['pt_PT'];
const source = JSON.parse(fs.readFileSync(path.join(dir, 'en.json'),'utf8')).translations;
const keys = Object.keys(source);
const sourceKeys = new Set(keys);
const strict = process.argv.includes('--strict');
const placeholders = s => [...String(s).matchAll(/\{[a-zA-Z_][\w-]*\}|%\d*\$?[ds]|%n/g)].map(x=>x[0]).sort();
const isEqual = (a,b) => JSON.stringify(a)===JSON.stringify(b);
let failed=false;
for (const lang of locales) {
 const jsonFile=path.join(dir,lang+'.json');
 const jsFile=path.join(dir,lang+'.js');
 if(!fs.existsSync(jsonFile)||!fs.existsSync(jsFile)) {console.error(`${lang}: missing JS/JSON catalog`);failed=true;continue;}
 const json=JSON.parse(fs.readFileSync(jsonFile,'utf8'));
 const dict=json.translations;
 if(!dict || typeof dict!=='object' || typeof json.pluralForm!=='string') {console.error(`${lang}: invalid catalog`);failed=true;continue;}
 const captured=[];
 vm.runInNewContext(fs.readFileSync(jsFile,'utf8'), {OC:{L10N:{register:(appid,trans,plural)=>captured.push({appid,trans,plural})}}}, {timeout:3000});
 if(captured.length!==1 || captured[0].appid!=='hc_familytree' || !isEqual(captured[0].trans,dict) || captured[0].plural!==json.pluralForm) {
  console.error(`${lang}: JS and JSON catalogs differ`);failed=true;
 }
 for(const [key,translated] of Object.entries(dict)) {
  if(!sourceKeys.has(key)) {console.error(`${lang}: orphan key ${JSON.stringify(key)}`);failed=true;}
  if(typeof translated!=='string'||!translated.trim()) {console.error(`${lang}: empty translation ${JSON.stringify(key)}`);failed=true;continue;}
  if(source[key] && !isEqual(placeholders(source[key]),placeholders(translated))) {
   console.error(`${lang}: placeholder mismatch ${JSON.stringify(key)}`);failed=true;
  }
 }
 const covered=keys.filter(key=>key in dict).length;
 const untranslated=keys.length-covered;
 const pct=100*covered/keys.length;
 console.log(`${lang}: ${covered}/${keys.length} checked entries (${pct.toFixed(1)}%), missing ${untranslated}`);
 if(strict && untranslated) failed=true;
}
// Verify official Nextcloud locale aliases without counting them as additional languages.
for (const alias of aliases) {
 const sourceLocale = alias==='pt_PT'?'pt':null;
 if(!sourceLocale)continue;
 for(const ext of ['.js','.json']) {
  if(fs.readFileSync(path.join(dir,alias+ext),'utf8')!==fs.readFileSync(path.join(dir,sourceLocale+ext),'utf8')) {
   console.error(`${alias}: alias differs from ${sourceLocale}`); failed=true;
  }
 }
}
if(failed){console.error(strict?'L10N STRICT: translation coverage incomplete or invalid.':'L10N AUDIT: invalid translation catalog.');process.exit(1);}
console.log(strict?'L10N STRICT: all locales complete.':'L10N AUDIT: all shipped entries valid; use --strict to require 100% translated keys.');
