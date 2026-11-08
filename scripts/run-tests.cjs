#!/usr/bin/env node
'use strict';
const {spawnSync}=require('node:child_process');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const args=process.argv.slice(2);
if(args.some(a=>a!=='--run')){console.error('Unsupported test argument: '+args.join(' '));process.exit(2);}
// Nejdříve zkontroluj syntaxi skutečného zdrojového JavaScriptu. Samotné
// izolované testy nemusí parsovat celý hlavní soubor aplikace.
const sourceDirs=['src/js','src/l10n'];
for(const dir of sourceDirs){
  for(const name of fs.readdirSync(path.join(root,dir)).filter(n=>n.endsWith('.js'))){
    const file=path.join(root,dir,name);
    const check=spawnSync(process.execPath,['--check',file],{cwd:root,encoding:'utf8'});
    if(check.error || check.status!==0){
      console.error('JavaScript syntax check failed: '+file);
      console.error(check.stderr||check.error?.message||'Unknown error');
      process.exit(1);
    }
  }
}
const tests=fs.readdirSync(path.join(root,'tests')).filter(n=>n.endsWith('.test.cjs')).sort();
if(!tests.length){ console.error('No executable tests available'); process.exit(1); }
const result=spawnSync(process.execPath,['--test',...tests.map(n=>path.join(root,'tests',n))],{cwd:root,stdio:'inherit'});
if(result.error){console.error(result.error.message);process.exit(1);}
process.exit(result.status===null?1:result.status);
