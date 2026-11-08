#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
function fail(msg){ console.error('SOURCE CHECK: '+msg); process.exit(1); }
function run(cmd,args){
  const res=cp.spawnSync(cmd,args,{cwd:root,stdio:'inherit'});
  if(res.error) fail(cmd+': '+res.error.message);
  if(res.status!==0) fail(cmd+' '+args.join(' ')+' failed (exit '+res.status+')');
}
function walk(dir){
  if(!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
    const full=path.join(dir,e.name);
    if(e.isSymbolicLink()) fail('symlink not allowed in source: '+full);
    if(e.isDirectory()) return walk(full);
    return [full];
  });
}
const info=fs.readFileSync(path.join(root,'src/appinfo/info.xml'),'utf8');
function tag(name){const m=info.match(new RegExp('<'+name+'(?:\s[^>]*)?>([^<]+)</'+name+'>'));return m?.[1]?.trim()||'';}
const id=tag('id'),version=tag('version');
if(!/^hc_[a-z0-9_]+$/.test(id)||!/^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/.test(version)) fail('invalid app ID or version');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const lock=JSON.parse(fs.readFileSync(path.join(root,'package-lock.json'),'utf8'));
if(pkg.version!==version || lock.version!==version || lock.packages?.['']?.version!==version) fail('package versions differ from info.xml');
for(const f of ['README.md','README_CZ.md','LICENSE','CHANGELOG.md','install.sh','uninstall.sh','build-release.sh','src/img/app.svg']) if(!fs.existsSync(path.join(root,f))) fail('required file missing: '+f);
if(!info.includes('<summary lang="en">')||!info.includes('<summary lang="cs">')||!info.includes('<description lang="en">')||!info.includes('<description lang="cs">')) fail('CZ/EN metadata missing');
if(!info.includes('https://github.com/hacesoft/')) fail('GitHub metadata missing');
for (const [dir,ext,cmd,flag] of [['src/lib','.php','php','-l'],['src/templates','.php','php','-l'],['src/appinfo','.php','php','-l'],['src/js','.js','node','--check'],['src/l10n','.js','node','--check']]) {
  for(const f of walk(path.join(root,dir)).filter(p=>p.endsWith(ext))) run(cmd,[flag,f]);
}
for(const f of walk(path.join(root,'src')).filter(p=>p.endsWith('.php') && !p.includes('/lib/') && !p.includes('/templates/') && !p.includes('/appinfo/'))) run('php',['-l',f]);
for(const f of walk(path.join(root,'scripts')).filter(p=>p.endsWith('.sh'))) run('sh',['-n',f]);
for(const f of ['install.sh','uninstall.sh','build-release.sh']) run('sh',['-n',path.join(root,f)]);
for(const f of walk(path.join(root,'src/l10n')).filter(p=>p.endsWith('.json'))) {
  const data=JSON.parse(fs.readFileSync(f,'utf8'));
  if(!data.translations||typeof data.translations!=='object') fail('invalid translation shape: '+f);
}
run(process.execPath,[path.join(root,'scripts/run-tests.cjs')]);
// Public/stable releases require 100% real key coverage in all eleven languages.
// Development builds may contain partial translations but cannot claim full localization.
if (!/-dev\d*(?:[.-]|$)/.test(version)) run(process.execPath,[path.join(root,'scripts/l10n-coverage.cjs'),'--strict']);
else run(process.execPath,[path.join(root,'scripts/l10n-coverage.cjs')]);
console.log('Source checks passed for '+id+' '+version);
