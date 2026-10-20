(()=>{'use strict';
const APP='hc_familytree',$=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
// Translate only the static HTML chunks. User names and saved notes remain untouched.
const tr=s=>typeof window.t==='function'?window.t(APP,s):s;
const localizeStatic=chunk=>chunk.replace(/>([^<>]*)</g,(whole,raw)=>{
 const match=/^(\s*[^\p{L}\p{N}]*)(.*?)(\s*)$/u.exec(raw);
 return match&&match[2]?`>${match[1]}${tr(match[2])}${match[3]}<`:whole;
}).replace(/(placeholder|title|aria-label)="([^"]*)"/g,(whole,attr,value)=>`${attr}="${tr(value)}"`);
const loc=localizeStatic;
const html=(parts,...values)=>parts.map((part,index)=>loc(part)+(index<values.length?values[index]:'')).join('');
const oCore=window.HcSharedAppCore;oCore.assertCompatible('0.18.8');const oLogger=oCore.logger;
const oRoot=$(APP);if(!oRoot)throw new Error('Kořen aplikace hc_familytree nebyl nalezen.');
oRoot.className='hc-familytree-app hc-shared-app-core-layout';
oRoot.innerHTML=html`<div class="hc-shared-app-core-layout__content hc-familytree-shell">
 <aside id="hc-familytree-sidebar" class="hc-familytree-sidebar hc-shared-app-core-panel" aria-label="Rodokmeny"><div class="hc-familytree-brand"><span class="hc-familytree-logo">🌳</span><div><h2>Rodokmen</h2><small>v1.0.0</small></div><button id="hc-familytree-close-nav" type="button" aria-label="Zavřít nabídku">×</button></div><button id="hc-familytree-new-tree" class="primary"><span aria-hidden="true">＋</span><span class="hc-familytree-button-label">Nový rodokmen</span></button><div id="hc-familytree-tree-list" class="hc-familytree-tree-list hc-shared-app-core-scroll-area"></div><button id="hc-familytree-settings" class="hc-familytree-quiet"><span aria-hidden="true">⚙</span><span class="hc-familytree-button-label">Nastavení</span></button></aside>
 <main class="hc-familytree-main hc-shared-app-core-view"><header class="hc-familytree-toolbar hc-shared-app-core-layout__toolbar"><button id="hc-familytree-open-nav" type="button" aria-controls="hc-familytree-sidebar" aria-expanded="false" aria-label="Otevřít nabídku">☰</button><div><h1 id="hc-familytree-title">Vyberte rodokmen</h1><p id="hc-familytree-subtitle"></p></div><div class="hc-familytree-actions"><input id="hc-familytree-search" type="search" placeholder="Hledat osobu"><nav id="hc-familytree-core-toolbar"></nav></div></header><div id="hc-familytree-empty" class="hc-familytree-empty hc-shared-app-core-scroll-area"><span>🌱</span><h2>Založte první rodokmen</h2><p>Rodinná data zůstanou ve vašem Nextcloudu.</p></div><div id="hc-familytree-stage" class="hc-familytree-stage" hidden><div id="hc-familytree-canvas-wrap" class="hc-familytree-canvas-wrap hc-shared-app-core-surface hc-shared-app-core-scroll-area"><div class="hc-familytree-pan"><div id="hc-familytree-canvas" class="hc-familytree-canvas"></div></div></div><div class="hc-familytree-view-controls" aria-label="Ovládání stromu"><button id="hc-familytree-zoom-out" type="button" aria-label="Oddálit">−</button><button id="hc-familytree-zoom-label" type="button" title="Skutečná velikost">100 %</button><button id="hc-familytree-zoom-in" type="button" aria-label="Přiblížit">+</button><button id="hc-familytree-fit" type="button">Celý strom</button><button id="hc-familytree-reflow" type="button" hidden>Uspořádat strom</button><button id="hc-familytree-select" type="button" aria-pressed="false" title="Pravým tlačítkem označte skupinu; Shift + tažením ji přesunete">Vybrat skupinu</button></div><div id="hc-familytree-tree-status" class="hc-familytree-tree-status" role="status"></div><div id="hc-familytree-selection-status" class="hc-familytree-selection-status" hidden><span></span><button id="hc-familytree-clear-selection" type="button">Zrušit výběr</button></div><details class="hc-familytree-legend"><summary>Legenda vazeb</summary><div><span class="hc-familytree-legend-line siblings"></span> Sourozenci</div><div><span class="hc-familytree-legend-line branch"></span> Společná větev dětí a rodičů</div><div><span class="hc-familytree-legend-line parent"></span> Rodičovská vazba</div><div><span class="hc-familytree-legend-line partner"></span> Partnerství</div><div><span class="hc-familytree-legend-line challenged"></span> Zpochybněná rodičovská vazba</div><small>Najetím na čáru zobrazíte konkrétní osoby a vztah.</small></details><div id="hc-familytree-marquee" class="hc-familytree-marquee" hidden></div></div></main>
</div><div id="hc-familytree-menu" class="hc-familytree-popover" hidden><button data-action="edit-tree">✏️ Upravit rodokmen</button><button data-action="share">👥 Sdílení</button><button data-action="gedcom">↕ Import / export</button><button data-action="research">🔎 Výzkumné záznamy</button><button data-action="reset-layout">↺ Automaticky srovnat karty</button><button data-action="delete-tree" class="danger">🗑 Smazat rodokmen</button></div>`;
const api=async(path,o={})=>{const headers={requesttoken:OC.requestToken,...(o.body instanceof FormData?{}:{'Content-Type':'application/json'}),...(o.headers||{})};const r=await fetch(OC.generateUrl('/apps/'+APP+path),{cache:'no-store',...o,headers});const text=await r.text();let d={};try{d=text?JSON.parse(text):{}}catch(_){}if(!r.ok)throw Error(d.error||r.statusText);return d};
oRoot.insertAdjacentHTML('beforeend','<button id="hc-familytree-nav-backdrop" type="button" tabindex="-1" aria-label="Zavřít nabídku" hidden></button>');
oRoot.querySelector('.hc-familytree-legend').insertAdjacentHTML('beforeend',loc('<small>Značka u jména hodnotí vazbu k rodičům: ★ ověřená, ◇ se zdrojem, ? neověřená, ! sporná, · bez zadaných rodičů.</small>'));
const viewControls=oRoot.querySelector('.hc-familytree-view-controls');
viewControls.id='hc-familytree-view-controls';
viewControls.insertAdjacentHTML('afterend',loc('<button id="hc-familytree-view-toggle" class="hc-familytree-view-toggle" type="button" aria-controls="hc-familytree-view-controls" aria-expanded="false" aria-label="Ovládání zobrazení" title="Ovládání zobrazení">☷</button>'));
const legend=oRoot.querySelector('.hc-familytree-legend');
legend.querySelector('summary').insertAdjacentHTML('afterend',loc('<button id="hc-familytree-legend-handle" type="button" aria-label="Přesunout legendu" title="Přesunout legendu">⠿</button>'));
oRoot.querySelector('[data-action="reset-layout"]').insertAdjacentHTML('beforebegin',loc('<button type="button" data-action="undo-layout" disabled>↶ Vrátit rozmístění (Ctrl+Z)</button><button type="button" data-action="redo-layout" disabled>↷ Opakovat rozmístění (Ctrl+Y)</button>'));
const navButton=$('hc-familytree-open-nav'),sidebar=$('hc-familytree-sidebar'),backdrop=$('hc-familytree-nav-backdrop');
function setNavOpen(open){sidebar.classList.toggle('is-open',open);backdrop.hidden=!open;navButton.setAttribute('aria-expanded',String(open));if(open)$('hc-familytree-close-nav').focus();else navButton.focus()}
navButton.onclick=()=>setNavOpen(true);$('hc-familytree-close-nav').onclick=()=>setNavOpen(false);backdrop.onclick=()=>setNavOpen(false);
oRoot.addEventListener('keydown',e=>{if(e.key==='Escape'&&sidebar.classList.contains('is-open')){e.preventDefault();setNavOpen(false)}});
let trees=[],state=null,current=0,selected=null,oToolbarController=null,selectionMode=false;
const selectedIds=new Set();
const layoutHistory=new Map();let layoutBusy=false;
function layoutSignature(treeState){
 return [treeState.tree.root_person_id,
  treeState.people.map(person=>+person.id).sort((a,b)=>a-b).join(','),
  treeState.relationships.map(relation=>[relation.id,relation.type,relation.person1_id,relation.person2_id].join(':')).sort().join(',')].join('|');
}
function layoutHistoryFor(treeId,treeState){
 if(!treeState)return null;
 const signature=layoutSignature(treeState);let history=layoutHistory.get(treeId);
 if(!history||history.signature!==signature){history={signature,undo:[],redo:[]};layoutHistory.set(treeId,history)}
 return history;
}
function currentLayoutHistory(){return layoutHistoryFor(current,state)}
function updateHistoryButtons(){
 const history=currentLayoutHistory(),editable=!!state?.canEdit&&!layoutBusy;
 oRoot.querySelector('[data-action="undo-layout"]').disabled=!editable||!history?.undo.length;
 oRoot.querySelector('[data-action="redo-layout"]').disabled=!editable||!history?.redo.length;
}
function recordLayoutChange(before,after,treeId=current,treeState=state){
 if(!before.length)return;
 const history=layoutHistoryFor(treeId,treeState);if(!history)return;
 history.undo.push({before,after});if(history.undo.length>50)history.undo.shift();
 history.redo.length=0;updateHistoryButtons();
}
async function persistLayoutPositions(positions,treeId=current){
 if(positions.length===1)await api('/api/people/'+positions[0].id+'/position',{method:'PUT',body:JSON.stringify(positions[0])});
 else if(positions.length>1)await api('/api/trees/'+treeId+'/positions',{method:'POST',body:JSON.stringify({positions})});
}
async function travelLayoutHistory(direction){
 if(!state?.canEdit||layoutBusy)return;
 const history=currentLayoutHistory(),from=direction==='undo'?history.undo:history.redo;
 if(!from.length)return;
 const change=from.at(-1),expected=direction==='undo'?change.after:change.before,positions=direction==='undo'?change.before:change.after;
 if(expected.some(item=>{const person=byId(item.id);return !person||(+person.layout_x||0)!==item.x||(+person.layout_y||0)!==item.y})){
  history.undo.length=0;history.redo.length=0;updateHistoryButtons();
  toast(tr('Polohy karet se mezitím změnily. Načtěte strom znovu.'),'warning');return;
 }
 const treeAtStart=current,treeState=state;
 layoutBusy=true;updateHistoryButtons();
 try{
  await persistLayoutPositions(positions,treeAtStart);
  for(const item of positions){const person=treeState.people.find(value=>+value.id===item.id);person.layout_x=item.x;person.layout_y=item.y}
  from.pop();(direction==='undo'?history.redo:history.undo).push(change);
  if(current===treeAtStart){if(state===treeState)render();else await selectTree(treeAtStart)}
 }catch(error){toast(tr('Rozmístění se nepodařilo obnovit: ')+error.message,'error')}
 finally{layoutBusy=false;updateHistoryButtons()}
}
document.addEventListener('keydown',event=>{
 if(!(event.ctrlKey||event.metaKey)||event.altKey||!state?.canEdit||oDialogController)return;
 const target=event.target;
 if(target!==document.body&&!oRoot.contains(target))return;
 if(target.closest?.('input, textarea, select, [contenteditable], [role="textbox"]'))return;
 const key=event.key.toLowerCase(),direction=key==='z'?(event.shiftKey?'redo':'undo'):key==='y'&&!event.shiftKey?'redo':null;
 if(direction&&!layoutBusy&&(direction==='undo'?currentLayoutHistory().undo:currentLayoutHistory().redo).length){
  event.preventDefault();void travelLayoutHistory(direction);
 }
});
const toolbarActions=()=>[
 {id:"fit",label:tr("Zobrazit celý strom"),icon:"⌗",compact:true,onClick:()=>fitTree()},
 {id:"add-person",label:tr("Přidat osobu"),icon:"＋",variant:"primary",hidden:!state?.canEdit,onClick:()=>personForm(null)},
 {id:"more",label:tr("Další akce"),icon:"⋮",compact:true,onClick:()=>toggleMoreMenu()},
];
// Běžné úspěšné uložení proběhne tiše. Oznámení je vyhrazené pro chybu, varování nebo výsledek dlouhé operace.
const toast=(sMessage,sType='success')=>{if(sType==='success')return null;const fnNotify=oCore.notifications[sType]||oCore.notifications.info;return fnNotify.call(oCore.notifications,sMessage,{dedupeKey:'hc_familytree:'+sType+':'+sMessage,cooldownMs:1800})};
const formData=f=>Object.fromEntries(new FormData(f).entries());
let oDialogController=null,oAboutController=null,fnModalCleanup=null;
function cleanupModal(){fnModalCleanup?.();fnModalCleanup=null;if(oAboutController){oAboutController.destroy();oAboutController=null}}
function openModal(sTitle,sHtml){if(oDialogController)oDialogController.close('replace');cleanupModal();const oBody=document.createElement('div');oBody.id='hc-familytree-modal-body';oBody.className='hc-familytree-core-dialog-body';oBody.innerHTML=sHtml;oDialogController=oCore.dialogs.open({title:sTitle,content:oBody,size:'large',closeLabel:tr('Zavřít')});const oOpened=oDialogController;oOpened.closed.then(()=>{if(oDialogController===oOpened){cleanupModal();oDialogController=null}});return oBody}
function closeModal(){cleanupModal();oDialogController?.close('application');oDialogController=null}
const confirmDialog=oOptions=>oCore.dialogs.confirm(oOptions);
oCore.about.register({id:APP,name:tr('Rodokmen'),version:'1.0.0',repository:'https://github.com/hacesoft/FamilyTree',releaseNotes:'https://github.com/hacesoft/FamilyTree/releases',documentation:'https://github.com/hacesoft/FamilyTree#readme',core:'>=0.18.8'});
async function loadTrees(){trees=await api('/api/trees');$('hc-familytree-tree-list').innerHTML=trees.map(t=>html`<button data-tree="${t.id}" class="${+t.id===current?'active':''}"><span>🌳</span><span><strong>${esc(t.name)}</strong><small>${esc(t.description||'')}</small></span></button>`).join('');$('hc-familytree-empty').hidden=trees.length>0;if(!current&&trees[0])await selectTree(+trees[0].id)}
async function selectTree(id){const firstOrDifferent=!state||current!==id;current=id;state=await api('/api/trees/'+id);selected=null;selectedIds.clear();if(firstOrDifferent){treeZoom=1;treePanX=0;treePanY=0;mobileViewMenuOpen=false;applyTreeScale();positionTree()}render();if(firstOrDifferent)requestAnimationFrame(()=>{if(isTouchTree())focusMobileTree();else fitTree()});if(sidebar.classList.contains('is-open'))setNavOpen(false);await loadTrees()}
function byId(id){return state?.people.find(p=>+p.id===+id)}
function researchRows(type){return (state?.research||[]).filter(r=>r.entity_type===type)}
function importedPersonIds(id){return new Set(researchRows('persons').filter(r=>+r.native_id===+id).map(r=>r.origin_key+'/'+r.external_id))}
function researchMediaUrl(id){return OC.generateUrl('/apps/'+APP+'/api/research/media/'+id)}
function importedPhoto(p){const ids=importedPersonIds(p.id);return researchRows('media').find(r=>r.media_path&&ids.has(r.origin_key+'/'+r.data.linked_entity_id)&&/^(person_photo|portrait|photograph)$/.test(r.data.media_type||''))}
function docLinks(id){return (state.documentLinks||[]).filter(x=>+x.document_id===+id)}
function docsFor(type,id){const ids=new Set((state.documentLinks||[]).filter(x=>x.link_type===type&&+x.target_id===+id).map(x=>+x.document_id));return state.documents.filter(x=>ids.has(+x.id))}
function fileUrl(path){let clean=String(path||'');while(clean.startsWith('/'))clean=clean.slice(1);const parts=clean.split('/'),file=parts.pop()||'',dir='/'+parts.join('/');return OC.generateUrl('/apps/files/?dir={dir}&openfile={file}',{dir,file})}
function relationName(r){const a=byId(r.person1_id),b=byId(r.person2_id);return (a?a.given_name+' '+a.surname:'')+' — '+(b?b.given_name+' '+b.surname:'')}
function years(p){const y=s=>s?String(s).match(/\d{4}/)?.[0]||s:'';return [y(p.birth_date),y(p.death_date)].filter(Boolean).join('–')}
function relationshipEvidence(id){
 const parents=state.relationships.filter(relation=>relation.type==='parent'&&+relation.person2_id===+id);
 if(!parents.length)return {kind:'none',symbol:'·',label:tr('Rodiče nejsou ve stromu uvedeni')};
 const status=parents.map(relation=>{
  const records=researchRows('relationships').filter(row=>+row.native_id===+relation.id&&!row.data.absent_in_current_file);
  if(!records.length)return 'unverified';
  const values=records.map(row=>String(row.data.verification_status||'unverified').toLowerCase());
  if(values.some(value=>['challenged','disproven','conflict'].some(word=>value.includes(word))))return 'challenged';
  if(values.every(value=>value==='proven'||value.startsWith('confirmed_primary')))return 'verified';
  if(records.every((row,index)=>values[index]==='proven'||values[index].startsWith('confirmed_primary')||
   (!!row.data.source_id&&(values[index].startsWith('confirmed_')||values[index]==='cited'))))return 'cited';
  return 'unverified';
 });
 if(status.includes('challenged'))return {kind:'challenged',symbol:'!',label:tr('Rodičovská vazba sporná')};
 if(status.every(value=>value==='verified'))return {kind:'verified',symbol:'★',label:tr('Všechny zobrazené rodičovské vazby jsou ověřené')};
 if(status.every(value=>value==='verified'||value==='cited'))return {kind:'cited',symbol:'◇',label:tr('Rodičovské vazby mají zdroj, ale nejsou všechny ověřené')};
 return {kind:'unverified',symbol:'?',label:tr('Rodičovská vazba neověřená')};
}
function card(p,x,y){
 const imported=importedPhoto(p),photo=p.photo_url?html`<img src="${esc(p.photo_url)}" alt="">`:imported?html`<img src="${esc(researchMediaUrl(imported.id))}" alt="">`:html`<span class="hc-familytree-avatar">${p.gender==='female'?'👩':p.gender==='male'?'👨':'👤'}</span>`;
 const dx=Number.isFinite(+p.layout_x)?+p.layout_x:0,dy=Number.isFinite(+p.layout_y)?+p.layout_y:0,evidence=relationshipEvidence(p.id);
 return html`<button class="hc-familytree-person ${+p.id===+state.tree.root_person_id?'root':''} ${selectedIds.has(+p.id)?'selected':''}" data-person="${p.id}" style="left:${Math.round(x)}px;top:${Math.round(y)}px;--hc-familytree-dx:${dx}px;--hc-familytree-dy:${dy}px" title="${state.canEdit?tr('Přetažením změnit polohu'):''}">${photo}<span class="hc-familytree-person-info"><span class="hc-familytree-person-title"><strong>${esc((p.given_name+' '+p.surname).trim())}</strong><span class="hc-familytree-evidence-badge ${evidence.kind}" role="img" aria-label="${esc(evidence.label)}" title="${esc(evidence.label)}">${evidence.symbol}</span></span><small>${esc(years(p)||p.birth_place||'')}</small></span></button>`;
}
function connectionPath(a,b,type){
 const dx=b.cx-a.cx,dy=b.cy-a.cy;
 const horizontal=type==='partner'?Math.abs(dx)>=Math.abs(dy):Math.abs(dx)>Math.max(120,Math.abs(dy)*1.5);
 if(horizontal){
  const right=dx>=0,startX=right?a.right:a.left,endX=right?b.left:b.right;
  if(Math.abs(dy)<1)return `M ${startX} ${a.cy} H ${endX}`;
  const middle=(startX+endX)/2;
  return `M ${startX} ${a.cy} H ${middle} V ${b.cy} H ${endX}`;
 }
 const down=dy>=0,startY=down?a.bottom:a.top,endY=down?b.top:b.bottom,midY=(startY+endY)/2;
 return `M ${a.cx} ${startY} V ${midY} H ${b.cx} V ${endY}`;
}
function relationshipLabel(id){const person=byId(id);return person?(person.given_name+' '+person.surname).trim():tr('Neznámá osoba')}
function svgLink(path,kind,label,extra=''){
 return html`<g class="hc-familytree-link ${kind} ${extra}"><path class="hc-familytree-link-line" d="${path}"/><path class="hc-familytree-link-hit" d="${path}" tabindex="0" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title></path></g>`;
}
function familyConnections(points){
 const byChild=new Map(),partners=[];
 for(const relation of state.relationships){
  const a=+relation.person1_id,b=+relation.person2_id;
  if(!points.has(String(a))||!points.has(String(b)))continue;
  if(relation.type==='parent'){
   if(!byChild.has(b))byChild.set(b,new Map());
   byChild.get(b).set(a,relation);
  }else if(relation.type==='partner')partners.push(relation);
 }
 const families=new Map();
 for(const [child,parentRows] of byChild){
  const parents=[...parentRows.keys()].sort((a,b)=>a-b),key=parents.join('|');
  if(!families.has(key))families.set(key,{parents,children:[],relations:new Map()});
  const family=families.get(key);family.children.push(child);
  for(const [id,relation] of parentRows)family.relations.set(id+'|'+child,relation);
 }
 // Overlapping family intervals on the same generation get distinct rails.
 // This keeps horizontal and vertical links from merging into a false union.
 const routes=[...families.values()].map(family=>{
  const children=family.children.map(id=>points.get(String(id))).sort((a,b)=>a.cx-b.cx);
  const parents=family.parents.map(id=>points.get(String(id))).sort((a,b)=>a.cx-b.cx);
  const all=[...children,...parents];
  return {family,children,parents,row:Math.round(children[0].top/80),
   lo:Math.min(...all.map(point=>point.cx)),hi:Math.max(...all.map(point=>point.cx)),lane:0};
 }).sort((a,b)=>a.row-b.row||a.lo-b.lo);
 const rails=new Map();
 for(const route of routes){
  const lanes=rails.get(route.row)||[];
  while(lanes[route.lane]?.some(other=>route.lo<=other.hi+28&&route.hi>=other.lo-28))route.lane++;
  (lanes[route.lane]??=[]).push(route);
  rails.set(route.row,lanes);
 }
 const parentUses=new Map();
 for(const route of routes){
  route.parentOffsets=new Map();
  for(const id of route.family.parents){if(!parentUses.has(id))parentUses.set(id,[]);parentUses.get(id).push(route)}
 }
 for(const [id,uses] of parentUses){
  uses.sort((a,b)=>a.children.reduce((sum,point)=>sum+point.cx,0)/a.children.length-
   b.children.reduce((sum,point)=>sum+point.cx,0)/b.children.length);
  uses.forEach((route,index)=>route.parentOffsets.set(id,(index-(uses.length-1)/2)*18));
 }
 let markup='';
 for(const {family,children,parents,lane,parentOffsets} of routes){
  const parentNames=family.parents.map(relationshipLabel).join(' + ');
  const childNames=family.children.map(relationshipLabel).join(', ');
  const childrenAbove=Math.max(...children.map(p=>p.cy))<Math.min(...parents.map(p=>p.cy));
  const railOffset=lane*18;
  const childY=childrenAbove?Math.max(...children.map(p=>p.bottom))+28+railOffset:Math.min(...children.map(p=>p.top))-28-railOffset;
  const parentY=childrenAbove?Math.min(...parents.map(p=>p.top))-28-railOffset:Math.max(...parents.map(p=>p.bottom))+28+railOffset;
  const childCenter=(children[0].cx+children.at(-1).cx)/2;
  const parentAnchors=family.parents.map(id=>points.get(String(id)).cx+(parentOffsets.get(id)||0)).sort((a,b)=>a-b);
  const parentCenter=(parentAnchors[0]+parentAnchors.at(-1))/2;
  // The cards themselves join a sibling row. Connect the side ports at their
  // vertical centers and drop the shared stem through a gap between cards.
  const alignedSiblings=children.length>1&&children.every(p=>Math.abs(p.cy-children[0].cy)<1)&&
   children.slice(1).every((p,index)=>p.left>children[index].right);
  const gapIndex=Math.floor((children.length-1)/2);
  const branchX=alignedSiblings?(children[gapIndex].right+children[gapIndex+1].left)/2:childCenter;
  const childSegments=alignedSiblings?
   children.slice(1).map((p,index)=>`M ${children[index].right} ${p.cy} H ${p.left}`).join(' ')+` M ${branchX} ${children[0].cy} V ${childY}`:
   children.map(p=>`M ${p.cx} ${childrenAbove?p.bottom:p.top} V ${childY}`).join(' ')+
    (children.length>1?` M ${children[0].cx} ${childY} H ${children.at(-1).cx}`:'');
  markup+=svgLink(childSegments,'siblings',
   children.length>1?`${tr('Sourozenci')}: ${childNames}. ${tr('Společní rodiče')}: ${parentNames}`:
    `${tr('Dítě')}: ${childNames}. ${tr('Rodiče')}: ${parentNames}`);
  const aligned=Math.abs(branchX-parentCenter)<1;
  markup+=svgLink(`M ${branchX} ${childY} V ${parentY}${aligned?'':` H ${parentCenter}`}`,'branch',
   `${tr('Rodičovská větev')}: ${parentNames} → ${childNames}`);
  for(const id of family.parents){
   const point=points.get(String(id));
   const uncertain=family.children.some(child=>family.relations.get(id+'|'+child)?.research_status==='challenged');
   const anchorX=point.cx+(parentOffsets.get(id)||0);
   const parentPath=`M ${parentCenter} ${parentY} H ${anchorX} V ${childrenAbove?point.top:point.bottom}`;
   const label=`${tr('Rodič')}: ${relationshipLabel(id)} → ${childNames}${uncertain?' · '+tr('zpochybněná vazba'):''}`;
   markup+=svgLink(parentPath,'parent',label,uncertain?'challenged':'');
  }
 }
 for(const relation of partners){
  const a=points.get(String(relation.person1_id)),b=points.get(String(relation.person2_id));
  markup+=svgLink(connectionPath(a,b,'partner'),'partner',
   `${tr('Partnerství')}: ${relationshipLabel(+relation.person1_id)} ↔ ${relationshipLabel(+relation.person2_id)}`);
 }
 return markup;
}
let connectionFrame=0;
const connectionObserver=typeof ResizeObserver==='function'?new ResizeObserver(()=>{
 if(!drag)spaceRenderedCards($('hc-familytree-canvas'));
 scheduleConnections();
}):null;
function scheduleConnections(){if(connectionFrame)return;connectionFrame=requestAnimationFrame(()=>{connectionFrame=0;drawConnections()})}
function observeConnectionCards(){if(!connectionObserver)return;connectionObserver.disconnect();const canvas=$('hc-familytree-canvas');connectionObserver.observe(canvas);canvas.querySelectorAll('[data-person]').forEach(card=>connectionObserver.observe(card))}
function drawConnections(){
 const canvas=$('hc-familytree-canvas'),svg=canvas.querySelector('.hc-familytree-connections');
 if(!svg||!state)return;
 // The SVG is absolutely positioned; its previous dimensions must not inflate scrollWidth.
 svg.style.width='0px';svg.style.height='0px';
 const box=canvas.getBoundingClientRect(),scale=isTouchTree()?treeZoom:Number.parseFloat(canvas.style.zoom)||1,points=new Map();
 canvas.querySelectorAll('[data-person]').forEach(el=>{
  const r=el.getBoundingClientRect(),left=(r.left-box.left)/scale,top=(r.top-box.top)/scale,right=(r.right-box.left)/scale,bottom=(r.bottom-box.top)/scale;
  points.set(el.dataset.person,{left,top,right,bottom,cx:(left+right)/2,cy:(top+bottom)/2});
 });
 const bounds=[...points.values()];
 const w=Math.ceil(Math.max(canvas.scrollWidth,canvas.clientWidth,...bounds.map(p=>p.right+24)));
 const h=Math.ceil(Math.max(canvas.scrollHeight,canvas.clientHeight,...bounds.map(p=>p.bottom+24)));
 svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.setAttribute('width',w);svg.setAttribute('height',h);
 svg.style.width=w+'px';svg.style.height=h+'px';
 svg.innerHTML=familyConnections(points);
}
// Partner groups share a generation. A sibling group is kept together within it.
// These positions only affect the view; no genealogy or saved offsets are changed.
function graphLayout(people,relationships,rootId,viewWidth){
 const cardWidth=210,stepX=236,stepY=276,groupGap=54;
 const personMap=new Map(people.map(p=>[+p.id,p]));
 const original=new Map(people.map((p,index)=>[+p.id,index]));
 const adjacent=new Map(people.map(p=>[+p.id,[]]));
 const parents=new Map(people.map(p=>[+p.id,[]]));
 const children=new Map(people.map(p=>[+p.id,[]]));
 const partners=new Map(people.map(p=>[+p.id,[]]));
 const representative=new Map(people.map(p=>[+p.id,+p.id]));
 const find=id=>{let current=id;while(representative.get(current)!==current)current=representative.get(current);return current};
 const join=(a,b)=>{const left=find(a),right=find(b);if(left!==right)representative.set(right,left)};
 for(const relation of relationships){
  const a=+relation.person1_id,b=+relation.person2_id;
  if(a===b||!personMap.has(a)||!personMap.has(b))continue;
  adjacent.get(a).push(b);adjacent.get(b).push(a);
  if(relation.type==='partner'){
   join(a,b);partners.get(a).push(b);partners.get(b).push(a);
  }else if(relation.type==='parent'){
   parents.get(b).push(a);children.get(a).push(b);
  }
 }
 // Two recorded parents of the same child belong together on the row even if
 // the source does not explicitly call them partners. This is layout-only:
 // it never creates a marriage/partner relationship or a green connector.
 for(const parentIds of parents.values()){
  const pair=[...new Set(parentIds)];
  if(pair.length!==2)continue;
  const [a,b]=pair;
  if(!partners.get(a).includes(b)){
   partners.get(a).push(b);partners.get(b).push(a);
  }
 }
 const seen=new Set(),components=[];
 for(const person of people){
  const start=+person.id;if(seen.has(start))continue;
  const ids=[],queue=[start];seen.add(start);
  for(let n=0;n<queue.length;n++){const id=queue[n];ids.push(id);
   for(const next of adjacent.get(id))if(!seen.has(next)){seen.add(next);queue.push(next)}
  }
  components.push(ids);
 }
 components.sort((a,b)=>Number(b.includes(+rootId))-Number(a.includes(+rootId))||b.length-a.length||original.get(a[0])-original.get(b[0]));
 const blocks=[];
 for(const ids of components){
  const members=new Set(ids),groupEdges=new Map();
  for(const id of ids)groupEdges.set(find(id),[]);
  for(const id of ids)for(const parent of parents.get(id))if(members.has(parent)&&find(id)!==find(parent)){
   groupEdges.get(find(id)).push({id:find(parent),delta:1});
   groupEdges.get(find(parent)).push({id:find(id),delta:-1});
  }
  const anchor=members.has(+rootId)?+rootId:
   (ids.filter(id=>!children.get(id).some(child=>members.has(child))).sort((a,b)=>original.get(a)-original.get(b))[0]??ids[0]);
  const groupRanks=new Map([[find(anchor),0]]),queue=[find(anchor)];
  for(let n=0;n<queue.length;n++)for(const edge of groupEdges.get(queue[n])||[]){
   if(!groupRanks.has(edge.id)){groupRanks.set(edge.id,groupRanks.get(queue[n])+edge.delta);queue.push(edge.id)}
  }
  const ranks=new Map(ids.map(id=>[id,groupRanks.get(find(id))??0]));
  // Partnership cycles may put a child in the same partner group as a parent.
  // Respect parent-child direction first; a conflicting partnership can use
  // a stepped connector across rows instead of reversing a generation.
  const indegree=new Map(ids.map(id=>[id,parents.get(id).filter(parent=>members.has(parent)).length]));
  const ancestryQueue=ids.filter(id=>indegree.get(id)===0);
  for(let i=0;i<ancestryQueue.length;i++){
   const parent=ancestryQueue[i];
   for(const child of children.get(parent)){
    if(!members.has(child))continue;
    ranks.set(child,Math.min(ranks.get(child),ranks.get(parent)-1));
    indegree.set(child,indegree.get(child)-1);
    if(indegree.get(child)===0)ancestryQueue.push(child);
   }
  }
  const values=[...ranks.values()],minRank=Math.min(...values),maxRank=Math.max(...values);
  const layers=new Map(),x=new Map();
  for(const id of ids){const rank=ranks.get(id);if(!layers.has(rank))layers.set(rank,[]);layers.get(rank).push(id)}
  const units=new Map();
  for(const [rank,row] of layers){
   const siblings=new Map();
   for(const id of row){
    const parentIds=[...new Set(parents.get(id).filter(parent=>members.has(parent)))].sort((a,b)=>a-b);
    const key=parentIds.length?parentIds.join('|'):'single:'+id;
    if(!siblings.has(key))siblings.set(key,[]);
    siblings.get(key).push(id);
   }
   const groups=[...siblings.values()].map(group=>({
    ids:group.sort((a,b)=>original.get(a)-original.get(b)),
    order:Math.min(...group.map(id=>original.get(id))),
   })).sort((a,b)=>a.order-b.order);
   units.set(rank,groups);
   let cursor=0;
   for(const group of groups){for(const id of group.ids){x.set(id,cursor);cursor+=stepX}cursor+=groupGap}
   const midpoint=(Math.min(...row.map(id=>x.get(id)))+Math.max(...row.map(id=>x.get(id))))/2;
   for(const id of row)x.set(id,x.get(id)-midpoint);
  }
  const avg=list=>list.reduce((sum,value)=>sum+value,0)/list.length;
  let usePartnerClusters=true;
  const arrange=rank=>{
   const groups=units.get(rank);if(!groups?.length)return;
   const desired=group=>{const neighborXs=[];
    for(const id of group.ids){
     for(const neighbor of [...parents.get(id),...children.get(id)])if(members.has(neighbor)&&ranks.get(neighbor)!==rank)neighborXs.push(x.get(neighbor));
     for(const neighbor of partners.get(id))if(members.has(neighbor)&&ranks.get(neighbor)===rank)neighborXs.push(x.get(neighbor));
    }
    return neighborXs.length ? .8*avg(neighborXs)+.2*avg(group.ids.map(id=>x.get(id))) : avg(group.ids.map(id=>x.get(id)));
   };
   const targets=new Map(groups.map(group=>[group,desired(group)]));
   const owner=new Map(groups.flatMap(group=>group.ids.map(id=>[id,group])));
   const representative=new Map(groups.map(group=>[group,group]));
   const findGroup=group=>{while(representative.get(group)!==group)group=representative.get(group);return group};
   if(usePartnerClusters)for(const group of groups)for(const id of group.ids)for(const partner of partners.get(id)){
    const other=owner.get(partner);if(!other||other===group)continue;
    const a=findGroup(group),b=findGroup(other);if(a!==b)representative.set(b,a);
   }
   const clusterMap=new Map();
   for(const group of groups){const key=findGroup(group);if(!clusterMap.has(key))clusterMap.set(key,[]);clusterMap.get(key).push(group)}
   const clusters=[...clusterMap.values()].map(members=>{
    members.sort((a,b)=>avg(a.ids.map(id=>x.get(id)))-avg(b.ids.map(id=>x.get(id)))||a.order-b.order);
    const spans=members.map(group=>(group.ids.length-1)*stepX/2),local=[0];
    for(let i=1;i<members.length;i++)local.push(local[i-1]+spans[i-1]+spans[i]+stepX);
    const center=(local[0]-spans[0]+local.at(-1)+spans.at(-1))/2;
    const span=(local.at(-1)+spans.at(-1)-local[0]+spans[0])/2;
    for(let i=0;i<local.length;i++)local[i]-=center;
    const groupIndex=new Map(members.map((group,i)=>[group,i]));
    for(const [i,group] of members.entries())if(group.ids.length>1){
     const cost=ids=>ids.reduce((sum,id,index)=>{
      const position=local[i]+(index-(ids.length-1)/2)*stepX;
      return sum+partners.get(id).reduce((total,other)=>{
       const partnerIndex=groupIndex.get(owner.get(other));
       return total+(partnerIndex===undefined?0:Math.abs(position-local[partnerIndex]));
      },0);
     },0);
     if(cost([...group.ids].reverse())+1<cost(group.ids))group.ids.reverse();
    }
    return {members,local,span,target:avg(members.map((group,i)=>targets.get(group)-local[i])),
     order:Math.min(...members.map(group=>group.order))};
   }).sort((a,b)=>a.target-b.target||a.order-b.order);
   groups.splice(0,groups.length,...clusters.flatMap(cluster=>cluster.members));
   // Keep partner groups together. Project whole clusters toward their family
   // with a gap between unrelated links in the same generation.
   const offsets=[0];
   for(let i=1;i<clusters.length;i++)offsets.push(offsets[i-1]+clusters[i-1].span+clusters[i].span+stepX+groupGap);
   const pools=[];
   for(let i=0;i<clusters.length;i++){
    const value=clusters[i].target-offsets[i];
    pools.push({start:i,end:i,sum:value,count:1,mean:value});
    while(pools.length>1&&pools.at(-2).mean>pools.at(-1).mean){
     const last=pools.pop(),previous=pools.at(-1);
     previous.end=last.end;previous.sum+=last.sum;previous.count+=last.count;previous.mean=previous.sum/previous.count;
    }
   }
   for(const pool of pools)for(let i=pool.start;i<=pool.end;i++){
    const center=pool.mean+offsets[i],cluster=clusters[i];
    cluster.members.forEach((group,j)=>group.ids.forEach((id,index)=>
     x.set(id,center+cluster.local[j]+(index-(group.ids.length-1)/2)*stepX)));
   }
  };
  const initialX=new Map(x),initialUnits=new Map([...units].map(([rank,groups])=>
   [rank,groups.map(group=>({ids:[...group.ids],order:group.order}))]));
  let bestPositions=null,bestScore=Infinity;
  for(const clustered of [true,false]){
   usePartnerClusters=clustered;x.clear();for(const [id,value] of initialX)x.set(id,value);
   for(const [rank,groups] of initialUnits)units.set(rank,groups.map(group=>({ids:[...group.ids],order:group.order})));
   for(let pass=0;pass<8;pass++){
    for(let rank=minRank;rank<=maxRank;rank++)arrange(rank);
    for(let rank=maxRank;rank>=minRank;rank--)arrange(rank);
   }
   let score=0;
   for(const id of ids){
    for(const child of children.get(id))if(members.has(child)){
     const distance=Math.abs(x.get(id)-x.get(child));score+=distance+4*Math.max(0,distance-700);
    }
    for(const partner of partners.get(id))if(id<partner&&members.has(partner)){
     const distance=Math.abs(x.get(id)-x.get(partner));score+=1.2*distance+4*Math.max(0,distance-700);
    }
   }
   score+=.25*(Math.max(...x.values())-Math.min(...x.values()));
   if(score<bestScore){bestScore=score;bestPositions=new Map(x)}
  }
  x.clear();for(const [id,value] of bestPositions)x.set(id,value);
  const familyRanges=new Map();
  for(const id of ids){
   const parentIds=[...new Set(parents.get(id).filter(parent=>members.has(parent)))].sort((a,b)=>a-b);
   if(!parentIds.length)continue;
   const key=ranks.get(id)+'|'+parentIds.join('|');
   if(!familyRanges.has(key))familyRanges.set(key,{rank:ranks.get(id),positions:[]});
   familyRanges.get(key).positions.push(x.get(id),...parentIds.map(parent=>x.get(parent)));
  }
  const rangesByRank=new Map(),laneCount=new Map();
  for(const family of familyRanges.values()){
   const range={lo:Math.min(...family.positions),hi:Math.max(...family.positions)};
   if(!rangesByRank.has(family.rank))rangesByRank.set(family.rank,[]);
   rangesByRank.get(family.rank).push(range);
  }
  for(const [rank,ranges] of rangesByRank){
   const lanes=[];
   for(const range of ranges.sort((a,b)=>a.lo-b.lo)){
    let lane=0;while(lanes[lane]?.some(other=>range.lo<=other.hi+28&&range.hi>=other.lo-28))lane++;
    (lanes[lane]??=[]).push(range);
   }
   laneCount.set(rank,lanes.length);
  }
  const rowOffsets=new Map([[minRank,0]]);
  for(let rank=minRank+1;rank<=maxRank;rank++)
   rowOffsets.set(rank,rowOffsets.get(rank-1)+Math.max(stepY,180+36*((laneCount.get(rank-1)||1)-1)));
  const minX=Math.min(...x.values()),maxX=Math.max(...x.values());
  blocks.push({ids,layers,x,minX,minRank,maxRank,rowOffsets,width:maxX-minX+cardWidth+80,height:rowOffsets.get(maxRank)+192});
 }
 const nodes=[],labels=[],limit=Math.max(900,viewWidth-80);let cursorX=40,cursorY=40,rowHeight=0,right=0;
 for(const [index,block] of blocks.entries()){
  if(cursorX>40&&cursorX+block.width>limit+40){cursorY+=rowHeight+60;cursorX=40;rowHeight=0}
  const baseX=index===0&&block.ids.length>1?Math.max(cursorX,(viewWidth-block.width)/2):cursorX;
  if(index===0&&block.ids.length>1)cursorX=limit+80;else cursorX+=block.width+40;
  rowHeight=Math.max(rowHeight,block.height);right=Math.max(right,baseX+block.width);
  if(blocks.length>1)labels.push({x:baseX+12,y:cursorY+8,text:block.ids.length===1?tr('Osoba bez známých vazeb'):tr('Samostatná větev')});
  for(const [rank,row] of block.layers){
   const top=cursorY+76+block.rowOffsets.get(rank);
   if(block.ids.length>1)labels.push({x:baseX+12,y:top-29,text:`${tr('Generace')} ${rank-block.minRank+1}`,generation:true});
   for(const id of row)nodes.push({person:personMap.get(id),x:baseX+40+block.x.get(id)-block.minX,y:top});
  }
 }
 const minNodeX=Math.min(40,...nodes.map(n=>n.x+(+n.person.layout_x||0)));
 const minNodeY=Math.min(40,...nodes.map(n=>n.y+(+n.person.layout_y||0)));
 const shiftX=Math.max(0,40-minNodeX),shiftY=Math.max(0,40-minNodeY);
 for(const node of nodes){node.x+=shiftX;node.y+=shiftY}
 for(const label of labels){label.x+=shiftX;label.y+=shiftY}
 const width=Math.max(viewWidth,right+shiftX+40,...nodes.map(n=>n.x+(+n.person.layout_x||0)+cardWidth+40));
 const height=Math.max(cursorY+rowHeight+shiftY+40,...nodes.map(n=>n.y+(+n.person.layout_y||0)+125));
 return {nodes,labels,width,height,branches:blocks.length};
}
function alignNearbyRows(people,relationships,nodes){
 const byId=new Map(nodes.map(node=>[+node.person.id,node])),adjacent=new Map(people.map(person=>[+person.id,new Set()]));
 const join=(a,b)=>{if(!byId.has(a)||!byId.has(b)||Math.abs(byId.get(a).y-byId.get(b).y)>1)return;adjacent.get(a).add(b);adjacent.get(b).add(a)};
 const siblingFamilies=new Map();
 for(const relation of relationships){
  const a=+relation.person1_id,b=+relation.person2_id;
  if(relation.type==='partner')join(a,b);
  else if(relation.type==='parent'&&byId.has(a)&&byId.has(b)){
   if(!siblingFamilies.has(b))siblingFamilies.set(b,[]);
   siblingFamilies.get(b).push(a);
  }
 }
 const siblingGroups=new Map();
 for(const [child,parents] of siblingFamilies){const key=[...new Set(parents)].sort((a,b)=>a-b).join('|');if(!siblingGroups.has(key))siblingGroups.set(key,[]);siblingGroups.get(key).push(child)}
 for(const children of siblingGroups.values())for(let i=1;i<children.length;i++)join(children[0],children[i]);
 const seen=new Set();let changed=false;
 for(const id of adjacent.keys()){
  if(seen.has(id))continue;
  const component=[],queue=[id];seen.add(id);
  for(let i=0;i<queue.length;i++){const member=queue[i];component.push(member);for(const other of adjacent.get(member))if(!seen.has(other)){seen.add(other);queue.push(other)}}
  const sorted=component.sort((a,b)=>(byId.get(a).y+(+byId.get(a).person.layout_y||0))-(byId.get(b).y+(+byId.get(b).person.layout_y||0)));
  for(let start=0;start<sorted.length;){
   const first=byId.get(sorted[start]),firstY=first.y+(+first.person.layout_y||0);let end=start+1;
   while(end<sorted.length&&byId.get(sorted[end]).y+(+byId.get(sorted[end]).person.layout_y||0)-firstY<=18)end++;
   if(end-start>1){
    const anchor=sorted.slice(start,end).map(member=>byId.get(member)).sort((a,b)=>Math.abs(+a.person.layout_y||0)-Math.abs(+b.person.layout_y||0))[0];
    const target=anchor.y+(+anchor.person.layout_y||0);
    for(const member of sorted.slice(start,end)){
     const node=byId.get(member),offset=Math.round(target-node.y);
     if((+node.person.layout_y||0)!==offset){node.person.layout_y=offset;changed=true}
    }
   }
   start=end;
  }
 }
 return changed;
}
// Preserve each row's order while making room for cards that render wider than
// the nominal width used by graphLayout (names, badges, fonts or browser CSS).
function spaceCards(cards,gap=18){
 const ordered=[...cards].sort((a,b)=>a.x-b.x||a.y-b.y||a.id-b.id);
 const positions=new Map();
 for(let index=0;index<ordered.length;index++){
  const current=ordered[index];let x=current.x;
  for(let previous=0;previous<index;previous++){
   const other=ordered[previous],left=positions.get(other.id);
   if(current.y<other.y+other.h&&current.y+current.h>other.y)
    x=Math.max(x,left+other.w+gap);
  }
  positions.set(current.id,x);
 }
 return positions;
}
function spaceRenderedCards(canvas){
 if(!state||!canvas)return;
 const scale=isTouchTree()?treeZoom:Number.parseFloat(canvas.style.zoom)||1;
 const cards=[...canvas.querySelectorAll('[data-person]')].map(el=>{
  const id=+el.dataset.person,person=byId(id),dx=+person.layout_x||0,dy=+person.layout_y||0;
  const rect=el.getBoundingClientRect();
  return {id,el,dx,x:(Number.parseFloat(el.style.left)||0)+dx,y:(Number.parseFloat(el.style.top)||0)+dy,
   w:Math.max(el.offsetWidth||0,el.scrollWidth||0,rect.width/scale||0,210),
   h:Math.max(el.offsetHeight||0,el.scrollHeight||0,rect.height/scale||0,78)};
 });
 if(!cards.length)return;
 const positions=spaceCards(cards);
 for(const card of cards){
  const x=positions.get(card.id);
  if(x>card.x+.5)card.el.style.left=Math.ceil(x-card.dx)+'px';
 }
 const right=Math.max(...cards.map(card=>positions.get(card.id)+card.w))+40;
 canvas.style.width=Math.max(Number.parseFloat(canvas.style.width)||0,Math.ceil(right))+'px';
}
function updateSelectionUI(){
 const count=selectedIds.size,bar=$('hc-familytree-selection-status');bar.hidden=!count;
 bar.querySelector('span').textContent=`${count} ${tr('vybraných osob')} · ${tr('Pravým tlačítkem upravíte výběr; Shift + tažení přesune skupinu a uvolní místo.')}`;
 $('hc-familytree-select').setAttribute('aria-pressed',String(selectionMode));
 $('hc-familytree-select').classList.toggle('active',selectionMode);
 $('hc-familytree-canvas').querySelectorAll('[data-person]').forEach(el=>el.classList.toggle('selected',selectedIds.has(+el.dataset.person)));
}
function render(){if(!state)return;
 syncViewControls();
 $('hc-familytree-title').textContent=state.tree.name;
 $('hc-familytree-subtitle').textContent=state.tree.description||`${state.people.length} ${tr('osob')}`;
 oToolbarController?.update(toolbarActions());$('hc-familytree-empty').hidden=true;$('hc-familytree-stage').hidden=false;
 $('hc-familytree-reflow').hidden=!state.canEdit;
 const canvas=$('hc-familytree-canvas'),q=$('hc-familytree-search').value.trim().toLocaleLowerCase();
 let layout=graphLayout(state.people,state.relationships,state.tree.root_person_id,$('hc-familytree-canvas-wrap').clientWidth);
 if(alignNearbyRows(state.people,state.relationships,layout.nodes))layout=graphLayout(state.people,state.relationships,state.tree.root_person_id,$('hc-familytree-canvas-wrap').clientWidth);
 canvas.style.width=Math.ceil(layout.width)+'px';canvas.style.height=Math.ceil(layout.height)+'px';
 canvas.classList.toggle('hide-evidence-badges',!showEvidenceBadges);
 const generationYs=[...new Set(layout.labels.filter(label=>label.generation).map(label=>Math.round(label.y+8)))];
 canvas.innerHTML=generationYs.map(y=>`<div class="hc-familytree-generation-line" style="top:${y}px" aria-hidden="true"></div>`).join('')+
  loc('<svg class="hc-familytree-connections" role="group" aria-label="Rodinné vazby"></svg>')+
  layout.labels.map(label=>html`<div class="hc-familytree-graph-label" style="left:${Math.round(label.x)}px;top:${Math.round(label.y)}px">${esc(label.text)}</div>`).join('')+
  layout.nodes.map(node=>card(node.person,node.x,node.y)).join('')+'<div class="hc-familytree-snap-guide" hidden aria-hidden="true"></div>';
 spaceRenderedCards(canvas);
 if(q)canvas.querySelectorAll('[data-person]').forEach(el=>{const p=byId(+el.dataset.person);el.classList.toggle('dimmed',!(p.given_name+' '+p.surname).toLocaleLowerCase().includes(q))});
 const imported=researchRows('persons').length,variantCount=researchRows('relationships').filter(r=>!r.native_id).length,imports=researchRows('package').length;
 $('hc-familytree-tree-status').textContent=`${state.people.length} ${tr('osob')} · ${state.relationships.length} ${tr('zobrazených vztahů')} · ${layout.branches} ${tr('větví')}`+(imports?` · ${imports} ${tr('importovaných sad')}`:'')+(variantCount?` · ${variantCount} ${tr('výzkumných variant vztahů')}`:'')+(imported&&!state.relationships.length?` · ${tr('Import nemá zobrazené vazby; zkontrolujte rodiny FAM a Výzkumné záznamy.')}`:'');
 updateSelectionUI();updateHistoryButtons();observeConnectionCards();scheduleConnections();requestAnimationFrame(restoreLegendPosition);
}
$('hc-familytree-tree-list').onclick=e=>{const b=e.target.closest('[data-tree]');if(b)selectTree(+b.dataset.tree)};
$('hc-familytree-search').oninput=render;
$('hc-familytree-new-tree').onclick=()=>{openModal(tr('Nový rodokmen'),html`<form id="hc-familytree-tree-form" class="hc-familytree-form"><label>Název<input name="name" required autofocus></label><label>Popis<textarea name="description"></textarea></label><div class="hc-familytree-form-actions"><button type="button" data-close>Zrušit</button><button class="primary">Vytvořit</button></div></form>`);$('hc-familytree-tree-form').onsubmit=async e=>{e.preventDefault();const form=e.target,button=form.querySelector('button.primary'),original=button.textContent;button.disabled=true;button.textContent=tr('Ukládám…');try{const t=await api('/api/trees',{method:'POST',body:JSON.stringify(formData(form))});closeModal();await selectTree(+t.id)}catch(error){toast(tr('Rodokmen se nepodařilo vytvořit: ')+error.message,'error');button.disabled=false;button.textContent=original}}};
function personForm(p){p=p||{is_living:1,gender:'other'};openModal(p.id?tr('Upravit osobu'):tr('Přidat osobu'),html`<form id="hc-familytree-person-form" class="hc-familytree-form"><div class="hc-familytree-photo-preview">${p.photo_url?html`<img src="${esc(p.photo_url)}">`:'👤'}</div><div class="hc-familytree-grid"><label>Jméno<input name="given_name" value="${esc(p.given_name)}"></label><label>Příjmení<input name="surname" value="${esc(p.surname)}"></label><label>Rodné příjmení<input name="birth_surname" value="${esc(p.birth_surname)}"></label><label>Pohlaví<select name="gender"><option value="other">Neuvedeno</option><option value="female" ${p.gender==='female'?'selected':''}>Žena</option><option value="male" ${p.gender==='male'?'selected':''}>Muž</option></select></label><label>Datum narození<input name="birth_date" value="${esc(p.birth_date)}" placeholder="např. 12. 3. 1948"></label><label>Místo narození<input name="birth_place" value="${esc(p.birth_place)}"></label><label>Datum úmrtí<input name="death_date" value="${esc(p.death_date)}"></label><label>Místo úmrtí<input name="death_place" value="${esc(p.death_place)}"></label><label>Povolání<input name="occupation" value="${esc(p.occupation)}"></label><label>URL fotografie<input name="photo_url" value="${esc(p.photo_url)}"></label></div><label class="hc-familytree-check"><input type="checkbox" name="is_living" ${+p.is_living?'checked':''}> Žijící osoba</label><label>Poznámky</label><div id="hc-familytree-notes-editor"></div><textarea name="notes" hidden>${esc(p.notes)}</textarea><div class="hc-familytree-form-actions">${p.id?loc('<button type="button" class="danger" id="hc-familytree-delete-person">Smazat</button>'):''}<button type="button" data-close>Zrušit</button><button class="primary">Uložit</button></div></form>`);const oNotesEditor=oCore.editor.create($('hc-familytree-notes-editor'),{value:String(p.notes||''),label:tr('Poznámky'),onChange:value=>{$('hc-familytree-person-form').elements.notes.value=value}});fnModalCleanup=()=>oNotesEditor.destroy();document.querySelector('[data-close]').onclick=closeModal;$('hc-familytree-person-form').onsubmit=async e=>{e.preventDefault();const d=formData(e.target);d.is_living=e.target.is_living.checked;const button=e.target.querySelector('button.primary'),original=button.textContent;button.disabled=true;button.textContent=tr('Ukládám…');try{await api(p.id?'/api/people/'+p.id:'/api/trees/'+current+'/people',{method:p.id?'PUT':'POST',body:JSON.stringify(d)});closeModal();await selectTree(current)}catch(error){toast(tr('Osobu se nepodařilo uložit: ')+error.message,'error');button.disabled=false;button.textContent=original}};if(p.id)$('hc-familytree-delete-person').onclick=async()=>{if(await confirmDialog({title:tr('Smazat osobu?'),message:tr('Osoba a její vztahy budou odstraněny.'),confirmLabel:tr('Smazat'),cancelLabel:tr('Zrušit'),danger:true})){await api('/api/people/'+p.id,{method:'DELETE'});closeModal();await selectTree(current)}}}
let drag=null,suppressCardClick=false,canvasGesture=null,rightSelectionDragged=false;
// Touch gestures affect only the tree. One finger moves it; two fingers change its
// scale without resizing the whole Nextcloud page or interfering with mouse edits.
const treeView=$('hc-familytree-canvas-wrap'),treeCanvas=$('hc-familytree-canvas'),touches=new Map();
const treePanLayer=treeCanvas.parentElement;
let treeZoom=1,treePanX=0,treePanY=0,pinch=null,gestureMoved=false;
let mobileViewMenuOpen=false;
let allowTouchCardDrag=false;try{allowTouchCardDrag=localStorage.getItem('hc_familytree:touch-card-drag')==='1'}catch(_){}
let showEvidenceBadges=true;try{showEvidenceBadges=localStorage.getItem('hc_familytree:evidence-badges')!=='0'}catch(_){}
function isTouchTree(){return window.matchMedia('(max-width:760px)').matches}
function positionTree(){treePanLayer.style.transform=`translate3d(${treePanX}px,${treePanY}px,0)`}
function updateZoomLabel(){$('hc-familytree-zoom-label').textContent=Math.round(treeZoom*100)+' %'}
function applyTreeScale(){
 const mobile=isTouchTree();
 // CSS zoom changes layout dimensions. A transform keeps the mobile viewport
 // fixed while only the tree drawing changes scale.
 treeCanvas.style.zoom=mobile?'1':String(treeZoom);
 treeCanvas.style.transform=mobile?`scale(${treeZoom})`:'';
 treeCanvas.style.transformOrigin='0 0';
}
function syncViewControls(){
 const mobile=isTouchTree(),toggle=$('hc-familytree-view-toggle');
 toggle.hidden=!mobile;viewControls.hidden=mobile&&!mobileViewMenuOpen;
 toggle.setAttribute('aria-expanded',String(mobile&&mobileViewMenuOpen));
}
function setMobileViewMenu(open){mobileViewMenuOpen=!!open&&isTouchTree();syncViewControls()}
function focusMobileTree(preferredZoom){
 if(!state||!treeView.clientWidth||!treeView.clientHeight)return;
 treeZoom=preferredZoom??Math.min(1,Math.max(.8,(treeView.clientWidth-24)/300));
 applyTreeScale();
 const root=treeCanvas.querySelector(`[data-person="${+state.tree.root_person_id}"]`)||treeCanvas.querySelector('[data-person]');
 if(!root)return;
 const person=byId(+root.dataset.person);
 const x=(Number.parseFloat(root.style.left)||0)+(+person.layout_x||0),y=(Number.parseFloat(root.style.top)||0)+(+person.layout_y||0);
 treePanX=Math.round(treeView.clientWidth/2-(x+(root.offsetWidth||174)/2)*treeZoom);
 treePanY=Math.round(treeView.clientHeight*.27-y*treeZoom);
 positionTree();updateZoomLabel();scheduleConnections();
}
function resetTreeView(){if(isTouchTree()){focusMobileTree(1);return}treeZoom=1;treePanX=0;treePanY=0;applyTreeScale();positionTree();treeView.scrollLeft=0;treeView.scrollTop=0;updateZoomLabel();scheduleConnections()}
function zoomTree(next,clientX,clientY){const target=Math.max(.02,Math.min(3.5,next));if(Math.abs(target-treeZoom)<.005)return;const rect=treeView.getBoundingClientRect(),x=clientX-rect.left,y=clientY-rect.top,ratio=target/treeZoom;if(isTouchTree()){treePanX=x-(x-treePanX)*ratio;treePanY=y-(y-treePanY)*ratio;treeZoom=target;applyTreeScale();positionTree()}else{const oldLeft=treeView.scrollLeft,oldTop=treeView.scrollTop;treeZoom=target;applyTreeScale();treeView.scrollLeft=(oldLeft+x)*ratio-x;treeView.scrollTop=(oldTop+y)*ratio-y}updateZoomLabel();scheduleConnections()}
function fitTree(){if(!state||!treeView.clientWidth||!treeView.clientHeight)return;const width=Number.parseFloat(treeCanvas.style.width)||treeCanvas.scrollWidth,height=Number.parseFloat(treeCanvas.style.height)||treeCanvas.scrollHeight;const target=Math.max(.02,Math.min(1,(treeView.clientWidth-28)/width,(treeView.clientHeight-28)/height));treeZoom=target;applyTreeScale();updateZoomLabel();if(isTouchTree()){treePanX=Math.max(0,Math.round((treeView.clientWidth-width*target)/2));treePanY=Math.max(0,Math.round((treeView.clientHeight-height*target)/2));positionTree()}else{treePanX=0;treePanY=0;positionTree();treeView.scrollLeft=Math.max(0,(width*target-treeView.clientWidth)/2);treeView.scrollTop=Math.max(0,(height*target-treeView.clientHeight)/2)}scheduleConnections()}
$('hc-familytree-view-toggle').onclick=()=>setMobileViewMenu(!mobileViewMenuOpen);
viewControls.addEventListener('click',event=>{if(isTouchTree()&&event.target.closest('button'))setMobileViewMenu(false)});
treeView.addEventListener('pointerdown',()=>{if(mobileViewMenuOpen)setMobileViewMenu(false)});
document.addEventListener('pointerdown',event=>{if(mobileViewMenuOpen&&!viewControls.contains(event.target)&&!$('hc-familytree-view-toggle').contains(event.target))setMobileViewMenu(false)});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&mobileViewMenuOpen){setMobileViewMenu(false);$('hc-familytree-view-toggle').focus()}});
const legendHandle=$('hc-familytree-legend-handle'),legendStage=$('hc-familytree-stage');
let legendDrag=null,legendSaved=null;
try{const saved=JSON.parse(localStorage.getItem('hc_familytree:legend-position')||'null');if(saved&&Number.isFinite(saved.x)&&Number.isFinite(saved.y))legendSaved=saved}catch(_){}
function legendBounds(){return {x:Math.max(8,legendStage.clientWidth-legend.offsetWidth-8),y:Math.max(8,legendStage.clientHeight-legend.offsetHeight-8)}}
function placeLegend(x,y){
 const bound=legendBounds();legend.classList.add('is-moved');
 legend.style.left=Math.round(Math.max(8,Math.min(bound.x,x)))+'px';
 legend.style.top=Math.round(Math.max(8,Math.min(bound.y,y)))+'px';
 legend.style.right='auto';legend.style.bottom='auto';
}
function restoreLegendPosition(){if(!legendSaved||!legendStage.clientWidth||!legendStage.clientHeight||legendDrag)return;const bound=legendBounds();placeLegend(8+legendSaved.x*(bound.x-8),8+legendSaved.y*(bound.y-8))}
legendHandle.addEventListener('pointerdown',event=>{
 if(event.button!==0)return;
 const stage=legendStage.getBoundingClientRect(),box=legend.getBoundingClientRect();
 legendDrag={id:event.pointerId,x:event.clientX,y:event.clientY,left:box.left-stage.left,top:box.top-stage.top,moved:false};
 legendHandle.setPointerCapture?.(event.pointerId);event.preventDefault();event.stopPropagation();
});
legendHandle.addEventListener('pointermove',event=>{
 if(!legendDrag||legendDrag.id!==event.pointerId)return;
 const dx=event.clientX-legendDrag.x,dy=event.clientY-legendDrag.y;
 if(!legendDrag.moved&&Math.hypot(dx,dy)<4)return;
 legendDrag.moved=true;placeLegend(legendDrag.left+dx,legendDrag.top+dy);
});
function finishLegendDrag(event){if(!legendDrag||legendDrag.id!==event.pointerId)return;const moved=legendDrag.moved;legendDrag=null;if(!moved)return;
 const bound=legendBounds();legendSaved={x:(parseFloat(legend.style.left)-8)/Math.max(1,bound.x-8),y:(parseFloat(legend.style.top)-8)/Math.max(1,bound.y-8)};
 try{localStorage.setItem('hc_familytree:legend-position',JSON.stringify(legendSaved))}catch(_){}
}
legendHandle.addEventListener('pointerup',finishLegendDrag);
legendHandle.addEventListener('pointercancel',finishLegendDrag);
legend.addEventListener('toggle',()=>requestAnimationFrame(restoreLegendPosition));
$('hc-familytree-zoom-in').onclick=()=>{const r=treeView.getBoundingClientRect();zoomTree(treeZoom*1.25,r.left+r.width/2,r.top+r.height/2)};
$('hc-familytree-zoom-out').onclick=()=>{const r=treeView.getBoundingClientRect();zoomTree(treeZoom/1.25,r.left+r.width/2,r.top+r.height/2)};
$('hc-familytree-zoom-label').onclick=resetTreeView;
$('hc-familytree-fit').onclick=fitTree;
async function reflowTree(){
 if(!state?.canEdit||layoutBusy)return;
 const treeAtStart=current,treeState=state;
 layoutBusy=true;updateHistoryButtons();
 try{
  const moved=treeState.people.filter(person=>(+person.layout_x||0)!==0||(+person.layout_y||0)!==0);
  if(moved.length&&!await confirmDialog({title:tr('Uspořádat strom?'),message:tr('Ruční posuny všech karet budou odstraněny. Rozmístění můžete vrátit přes Ctrl+Z.'),confirmLabel:tr('Uspořádat'),cancelLabel:tr('Zrušit')}))return;
  if(current!==treeAtStart||state!==treeState)return;
  if(moved.length){
   const before=moved.map(person=>({id:+person.id,x:+person.layout_x||0,y:+person.layout_y||0}));
   await api('/api/trees/'+treeAtStart+'/layout/reset',{method:'POST',body:'{}'});
   for(const person of moved){person.layout_x=0;person.layout_y=0}
   recordLayoutChange(before,before.map(item=>({id:item.id,x:0,y:0})),treeAtStart,treeState);
  }
  if(current===treeAtStart)await selectTree(treeAtStart);
 }catch(error){toast(tr('Strom se nepodařilo uspořádat: ')+error.message,'error')}
 finally{layoutBusy=false;updateHistoryButtons()}
}
$('hc-familytree-reflow').onclick=reflowTree;
$('hc-familytree-select').onclick=()=>{selectionMode=!selectionMode;updateSelectionUI()};
$('hc-familytree-clear-selection').onclick=()=>{selectedIds.clear();updateSelectionUI()};
treeView.addEventListener('wheel',e=>{if(!e.deltaY)return;e.preventDefault();const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?treeView.clientHeight:1);zoomTree(treeZoom*Math.exp(-Math.max(-240,Math.min(240,delta))*.002),e.clientX,e.clientY)},{passive:false});
treeView.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'||e.target.closest('input,select,textarea'))return;touches.set(e.pointerId,{x:e.clientX,y:e.clientY});if(touches.size===2){const [a,b]=[...touches.values()];pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom:treeZoom}}});
treeView.addEventListener('pointermove',e=>{if(!touches.has(e.pointerId))return;const prev=touches.get(e.pointerId);touches.set(e.pointerId,{x:e.clientX,y:e.clientY});const dx=e.clientX-prev.x,dy=e.clientY-prev.y;if(Math.abs(dx)+Math.abs(dy)<=1)return;try{treeView.setPointerCapture(e.pointerId)}catch(_){}gestureMoved=true;if(touches.size===2&&pinch){const [a,b]=[...touches.values()],distance=Math.hypot(a.x-b.x,a.y-b.y);if(pinch.distance>0)zoomTree(pinch.zoom*distance/pinch.distance,(a.x+b.x)/2,(a.y+b.y)/2)}else if(touches.size===1){if(isTouchTree()){treePanX+=dx;treePanY+=dy;positionTree()}else{treeView.scrollLeft-=dx;treeView.scrollTop-=dy}}});
const endTreeTouch=e=>{if(!touches.has(e.pointerId))return;touches.delete(e.pointerId);if(touches.size<2)pinch=null;if(gestureMoved){suppressCardClick=true;setTimeout(()=>{suppressCardClick=false;gestureMoved=false},80)}};
window.addEventListener('pointerup',endTreeTouch);window.addEventListener('pointercancel',endTreeTouch);
// Work in canvas coordinates so the same collision rules hold at every zoom.
function snapGroupToRow(entries,active,dx,dy){
 let nearest=null;
 for(const moving of entries){
  if(!active.has(moving.id))continue;
  const left=moving.baseX+moving.x+dx,right=left+moving.w,top=moving.baseY+moving.y+dy;
  for(const neighbor of entries){
   if(active.has(neighbor.id))continue;
   const otherLeft=neighbor.baseX+neighbor.x,otherRight=otherLeft+neighbor.w;
   const horizontalGap=Math.max(0,otherLeft-right,left-otherRight);
   if(horizontalGap>110)continue;
   const otherTop=neighbor.baseY+neighbor.y,difference=otherTop-top;
   if(Math.abs(difference)>18)continue;
   const score=Math.abs(difference)+horizontalGap/30;
   if(!nearest||score<nearest.score)nearest={score,difference,guideY:otherTop+neighbor.h/2};
  }
 }
 return nearest?{dx,dy:dy+nearest.difference,guideY:nearest.guideY}:{dx,dy,guideY:null};
}
function makeRoomForGroup(entries,active,dx,dy){
 const placed=new Map(entries.map(entry=>[entry.id,{x:entry.baseX+entry.x,y:entry.baseY+entry.y,w:entry.w,h:entry.h}]));
 const moving=entries.filter(entry=>active.has(entry.id));
 if(!moving.length)return placed;
 dx=Math.max(dx,24-Math.min(...moving.map(entry=>placed.get(entry.id).x)));
 dy=Math.max(dy,24-Math.min(...moving.map(entry=>placed.get(entry.id).y)));
 for(const entry of moving){placed.get(entry.id).x+=dx;placed.get(entry.id).y+=dy}
 const axis=Math.abs(dx)>=Math.abs(dy)?'x':'y',direction=(axis==='x'?dx:dy)<0?-1:1,gap=18;
 const affected=new Set(moving.map(entry=>entry.id));
 for(let pass=0;pass<entries.length*2;pass++){
  let changed=false;
  for(const source of entries){
   if(!affected.has(source.id))continue;
   const a=placed.get(source.id);
   for(const target of entries){
    if(active.has(target.id)||target.id===source.id)continue;
    const b=placed.get(target.id);
    if(a.x>=b.x+b.w+gap||a.x+a.w+gap<=b.x||a.y>=b.y+b.h+gap||a.y+a.h+gap<=b.y)continue;
    const required=direction>0?a[axis]+(axis==='x'?a.w:a.h)+gap:a[axis]-(axis==='x'?b.w:b.h)-gap;
    if(direction*(required-b[axis])<=.5)continue;
    b[axis]=required;affected.add(target.id);changed=true;
   }
  }
  if(!changed)break;
 }
 // Keep the newly opened space reachable at the left and top canvas edges.
 const minX=Math.min(...[...placed.values()].map(point=>point.x)),minY=Math.min(...[...placed.values()].map(point=>point.y));
 if(minX<24||minY<24)for(const point of placed.values()){
  point.x+=Math.max(0,24-minX);point.y+=Math.max(0,24-minY);
 }
 return placed;
}
function beginCardDrag(e,ids,captureTarget){
 const active=new Set(ids),entries=[...treeCanvas.querySelectorAll('[data-person]')].map(card=>{
  const id=+card.dataset.person,person=byId(id),bounds=card.getBoundingClientRect();
  return {id,person,card,baseX:Number.parseFloat(card.style.left)||0,baseY:Number.parseFloat(card.style.top)||0,
   x:+person.layout_x||0,y:+person.layout_y||0,w:bounds.width/treeZoom||card.offsetWidth||210,h:bounds.height/treeZoom||card.offsetHeight||78};
 });
 drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,moved:false,active,entries,placed:null};
 captureTarget.setPointerCapture?.(e.pointerId);
 if(e.shiftKey)e.preventDefault();
}
function previewCardDrag(currentDrag,dx,dy){
 const snap=snapGroupToRow(currentDrag.entries,currentDrag.active,dx,dy);
 const guide=treeCanvas.querySelector('.hc-familytree-snap-guide');
 if(guide){guide.hidden=snap.guideY===null;if(snap.guideY!==null)guide.style.top=Math.round(snap.guideY)+'px'}
 const placed=makeRoomForGroup(currentDrag.entries,currentDrag.active,snap.dx,snap.dy);currentDrag.placed=placed;
 for(const entry of currentDrag.entries){
  const point=placed.get(entry.id),x=Math.round(point.x-entry.baseX),y=Math.round(point.y-entry.baseY);
  entry.person.layout_x=x;entry.person.layout_y=y;
  entry.card.style.setProperty('--hc-familytree-dx',x+'px');entry.card.style.setProperty('--hc-familytree-dy',y+'px');
  entry.card.classList.toggle('dragging',currentDrag.active.has(entry.id));
  entry.card.classList.toggle('pushed',!currentDrag.active.has(entry.id)&&(x!==entry.x||y!==entry.y));
 }
 const right=Math.max(...[...placed.values()].map(point=>point.x+point.w))+40;
 const bottom=Math.max(...[...placed.values()].map(point=>point.y+point.h))+40;
 treeCanvas.style.width=Math.max(Number.parseFloat(treeCanvas.style.width)||0,Math.ceil(right))+'px';
 treeCanvas.style.height=Math.max(Number.parseFloat(treeCanvas.style.height)||0,Math.ceil(bottom))+'px';
 scheduleConnections();
}
treeView.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||![0,2].includes(e.button)||layoutBusy)return;
 if(e.button===2)rightSelectionDragged=false;
 if(e.target.closest('[data-person]'))return;
 if(e.button===0&&e.shiftKey&&selectedIds.size&&state?.canEdit){beginCardDrag(e,[...selectedIds],treeView);return}
 const stage=$('hc-familytree-stage').getBoundingClientRect();canvasGesture={id:e.pointerId,button:e.button,mode:e.button===2||e.shiftKey?'select':'pan',x:e.clientX,y:e.clientY,left:treeView.scrollLeft,top:treeView.scrollTop,stage,moved:false,add:e.ctrlKey||e.metaKey};
 treeView.setPointerCapture?.(e.pointerId);if(canvasGesture.mode==='select'){treeView.classList.add('is-selecting');e.preventDefault()}else treeView.classList.add('is-panning')});
treeView.addEventListener('pointermove',e=>{const g=canvasGesture;if(!g||g.id!==e.pointerId)return;
 if(Math.hypot(e.clientX-g.x,e.clientY-g.y)>5)g.moved=true;
 if(g.mode==='pan'){treeView.scrollLeft=g.left+g.x-e.clientX;treeView.scrollTop=g.top+g.y-e.clientY;return}
 const box=$('hc-familytree-marquee');box.hidden=false;box.style.left=Math.min(g.x,e.clientX)-g.stage.left+'px';box.style.top=Math.min(g.y,e.clientY)-g.stage.top+'px';box.style.width=Math.abs(e.clientX-g.x)+'px';box.style.height=Math.abs(e.clientY-g.y)+'px';
});
function endCanvasGesture(e){const g=canvasGesture;if(!g||g.id!==e.pointerId)return;canvasGesture=null;treeView.classList.remove('is-panning','is-selecting');$('hc-familytree-marquee').hidden=true;
 if(g.button===2&&g.moved)rightSelectionDragged=true;
 if(g.mode==='select'&&g.moved){if(!g.add)selectedIds.clear();const left=Math.min(g.x,e.clientX),right=Math.max(g.x,e.clientX),top=Math.min(g.y,e.clientY),bottom=Math.max(g.y,e.clientY);
  treeCanvas.querySelectorAll('[data-person]').forEach(el=>{const r=el.getBoundingClientRect();if(r.left<right&&r.right>left&&r.top<bottom&&r.bottom>top)selectedIds.add(+el.dataset.person)});updateSelectionUI()}
 else if(!g.moved&&!e.target.closest?.('[data-person]')){selectedIds.clear();updateSelectionUI()}
}
window.addEventListener('pointerup',endCanvasGesture);window.addEventListener('pointercancel',endCanvasGesture);
treeView.addEventListener('contextmenu',e=>{
 e.preventDefault();if(rightSelectionDragged){rightSelectionDragged=false;return}
 const card=e.target.closest?.('[data-person]');if(!card)return;
 const id=+card.dataset.person;if(selectedIds.has(id))selectedIds.delete(id);else selectedIds.add(id);updateSelectionUI();
});
treeCanvas.addEventListener('pointerdown',e=>{const card=e.target.closest('[data-person]');if(!card||!state?.canEdit||layoutBusy||e.button!==0||!(e.pointerType==='mouse'||(e.pointerType==='touch'&&(allowTouchCardDrag||selectionMode)&&isTouchTree())))return;
 e.stopPropagation();const id=+card.dataset.person,ids=selectedIds.has(id)?[...selectedIds]:[id];
 beginCardDrag(e,ids,card);
});
treeView.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.startX,dy=e.clientY-drag.startY;
 if(!drag.moved&&Math.hypot(dx,dy)<5)return;drag.moved=true;
 previewCardDrag(drag,dx/treeZoom,dy/treeZoom);
});
treeView.addEventListener('pointerup',async e=>{if(!drag||drag.id!==e.pointerId)return;const done=drag;drag=null;if(!done.moved)return;
 previewCardDrag(done,(e.clientX-done.startX)/treeZoom,(e.clientY-done.startY)/treeZoom);
 suppressCardClick=true;e.preventDefault();
 const positions=done.entries.filter(entry=>entry.person.layout_x!==entry.x||entry.person.layout_y!==entry.y)
  .map(entry=>({id:entry.id,x:entry.person.layout_x,y:entry.person.layout_y}));
 const before=positions.map(item=>{const entry=done.entries.find(value=>value.id===item.id);return {id:item.id,x:entry.x,y:entry.y}});
 const treeAtStart=current,treeState=state;
 layoutBusy=true;updateHistoryButtons();
 try{
  await persistLayoutPositions(positions,treeAtStart);
  recordLayoutChange(before,positions,treeAtStart,treeState);
  if(current===treeAtStart){if(state===treeState)render();else await selectTree(treeAtStart)}
 }catch(error){for(const entry of done.entries){entry.person.layout_x=entry.x;entry.person.layout_y=entry.y}if(current===treeAtStart){if(state===treeState)render();else await selectTree(treeAtStart)}toast(tr('Polohu se nepodařilo uložit: ')+error.message,'error')}
 finally{layoutBusy=false;updateHistoryButtons()}
 setTimeout(()=>suppressCardClick=false,0);
});
treeView.addEventListener('pointercancel',()=>{if(drag){for(const entry of drag.entries){entry.person.layout_x=entry.x;entry.person.layout_y=entry.y}drag=null;render()}});
treeCanvas.onclick=e=>{if(suppressCardClick)return;const b=e.target.closest('[data-person]');if(!b)return;
 const id=+b.dataset.person;if(selectionMode||e.ctrlKey||e.metaKey){if(selectedIds.has(id))selectedIds.delete(id);else selectedIds.add(id);updateSelectionUI();return}personDetail(id)
};
oRoot.addEventListener('keydown',e=>{if(e.key==='Escape'&&selectedIds.size){selectedIds.clear();updateSelectionUI()}});
function documentRow(x){return html`<div class="hc-familytree-document"><div class="hc-familytree-doc-icon">${x.mime_type?.includes('pdf')?'📕':x.mime_type?.startsWith('image/')?'🖼️':'📄'}</div><div><a href="${esc(fileUrl(x.file_path))}" target="_blank" rel="noopener"><b>${esc(x.title)}</b></a><small>${esc(x.document_type||tr('Dokument'))}${x.document_date?' · '+esc(x.document_date):''}${x.place?' · '+esc(x.place):''}</small><small>${esc(x.archive||'')}${x.signature?' · sign. '+esc(x.signature):''}</small></div>${state.canEdit?html`<div class="hc-familytree-doc-actions"><button data-edit-doc="${x.id}" title="Upravit">✏️</button><button data-del-doc="${x.id}" title="Smazat">×</button></div>`:''}</div>`}
function safeSourceUrl(value){try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)?url.href:''}catch{return ''}}
function researchFor(id){
 const ids=importedPersonIds(id);
 const hasPerson=(r,value)=>String(value||'').split('|').some(x=>ids.has(r.origin_key+'/'+x));
 const relationships=researchRows('relationships').filter(r=>hasPerson(r,r.data.person1_id)||hasPerson(r,r.data.person2_id));
 const rels=new Set(relationships.map(r=>r.origin_key+'/'+r.external_id));
 const events=researchRows('events').filter(r=>hasPerson(r,r.data.person_id));
 const eventIds=new Set(events.map(r=>r.origin_key+'/'+r.external_id));
 const families=researchRows('families').filter(r=>r.data.parent_ids?.some(x=>hasPerson(r,x))||r.data.child_ids?.some(x=>hasPerson(r,x)));
 const familyIds=new Set(families.map(r=>r.origin_key+'/'+r.external_id));
 const researchFacts=researchRows('research_facts').filter(r=>r.data.owner_type==='event'?eventIds.has(r.origin_key+'/'+r.data.owner_id):r.data.owner_type==='family'?familyIds.has(r.origin_key+'/'+r.data.owner_id):r.data.owner_type==='person'&&hasPerson(r,r.data.owner_id));
 const factIds=new Set(researchFacts.map(r=>r.origin_key+'/'+r.external_id));
 const linked=r=>r.data.linked_entity_type==='event'?eventIds.has(r.origin_key+'/'+r.data.linked_entity_id):r.data.linked_entity_type==='family'?familyIds.has(r.origin_key+'/'+r.data.linked_entity_id):r.data.linked_entity_type==='research_facts'?factIds.has(r.origin_key+'/'+r.data.linked_entity_id):r.data.linked_entity_type==='person'&&hasPerson(r,r.data.linked_entity_id);
 const citations=researchRows('citations').filter(linked);
 const citationIds=new Set(citations.map(r=>r.origin_key+'/'+r.external_id));
 const sourceIds=new Set(citations.map(r=>r.origin_key+'/'+r.data.source_id));
 const noteLinks=researchRows('note_links').filter(r=>r.data.owner_type==='event'?eventIds.has(r.origin_key+'/'+r.data.owner_id):r.data.owner_type==='family'?familyIds.has(r.origin_key+'/'+r.data.owner_id):r.data.owner_type==='person'&&hasPerson(r,r.data.owner_id));
 const noteIds=new Set(noteLinks.map(r=>r.origin_key+'/'+r.data.note_id));
 return {
  people:researchRows('persons').filter(r=>ids.has(r.origin_key+'/'+r.external_id)),
  relationships,families,researchFacts,
  facts:researchRows('facts').filter(r=>r.data.subject_type==='relationship'?rels.has(r.origin_key+'/'+r.data.subject_id):hasPerson(r,r.data.subject_id)),
  events,
  citations,
  media:researchRows('media').filter(r=>linked(r)||citationIds.has(r.origin_key+'/'+r.data.citation_id)||sourceIds.has(r.origin_key+'/'+r.data.source_id)),
  tasks:researchRows('research').filter(r=>r.data.target_person_ids?.some(x=>hasPerson(r,x))||researchRows('notes').some(n=>n.origin_key===r.origin_key&&n.data.xref===r.data.snote_xref&&noteIds.has(n.origin_key+'/'+n.external_id))),
  notes:researchRows('notes').filter(r=>noteIds.has(r.origin_key+'/'+r.external_id))
 };
}
function researchDetail(id){
 const own=researchFor(id);if(!own.people.length)return;
 const sourceMap=new Map(researchRows('sources').map(r=>[r.origin_key+'/'+r.external_id,r]));
 const sourceLabel=(key,origin)=>{const s=sourceMap.get(origin+'/'+key);return s?html`<small>${esc(s.data.title||key)}${s.data.signatura?' · '+esc(s.data.signatura):''}</small>`:key?html`<small>${esc(key)}</small>`:''};
 const status=(r)=>html`<small>${esc(r.data.verification_status||'neověřeno')}${r.data.confidence_percent==null?'':' · '+esc(r.data.confidence_percent)+' %'}</small>`;
 const section=document.createElement('section');section.className='hc-familytree-research';
 section.innerHTML=html`<h3>Výzkumné údaje</h3><p class="hc-familytree-hint">Každé tvrzení zůstává samostatně, včetně rozdílných variant.</p>
 <details><summary>Vztahy a varianty (${own.relationships.length})</summary>${own.relationships.map(r=>html`<div class="hc-familytree-research-row"><b>${esc(r.data.relationship_type)} · ${esc(r.external_id)}</b>${status(r)}${sourceLabel(r.data.source_id,r.origin_key)}<small>${r.native_id&&state.relationships.some(x=>+x.id===+r.native_id)?tr('Zobrazeno ve stromu'):tr('Výzkumná varianta bez spojnice')}</small>${r.data.notes?html`<p>${esc(r.data.notes)}</p>`:''}</div>`).join('')}</details>
 <details><summary>Tvrzení (${own.facts.length})</summary>${own.facts.map(r=>html`<div class="hc-familytree-research-row"><b>${esc(r.data.predicate)}:</b> ${esc(r.data.value)}${status(r)}${sourceLabel(r.data.source_id,r.origin_key)}${r.data.citation_detail?html`<small>${esc(r.data.citation_detail)}</small>`:''}${r.data.notes?html`<small>${esc(r.data.notes)}</small>`:''}</div>`).join('')}</details>
 <details open><summary>Badatelská tvrzení (${own.researchFacts.length})</summary>${own.researchFacts.map(r=>html`<div class="hc-familytree-research-row"><b>${esc(r.data.external_fact_id)} · ${esc(r.data.fact_type)}:</b> ${esc(r.data.raw_value)}${status(r)}${r.data.normalized_value?html`<small>Normalizace: ${esc(r.data.normalized_value)}</small>`:''}${sourceLabel(r.data.source_id,r.origin_key)}${r.data.locator?html`<small>${esc(r.data.locator)}</small>`:''}<details><summary>Původní text</summary><p>${esc(r.data.original_text)}</p></details></div>`).join('')}</details>
 <details><summary>Události a jejich původ (${own.events.length})</summary>${own.events.map(r=>html`<div class="hc-familytree-research-row"><b>${esc(r.data.event_type)}</b> · ${esc(r.data.date_value)} · ${esc(r.data.place)}${status(r)}${sourceLabel(r.data.source_id,r.origin_key)}${r.data.description?html`<small>${esc(r.data.description)}</small>`:''}</div>`).join('')}</details>
 <details><summary>Citace (${own.citations.length})</summary>${own.citations.map(r=>html`<div class="hc-familytree-research-row">${sourceLabel(r.data.source_id,r.origin_key)}<small>${esc(r.data.locator)}${r.data.quay!==''&&r.data.quay!=null?' · QUAY '+esc(r.data.quay):''}</small><p>${esc(r.data.transcription)}</p>${r.data.notes?html`<small>${esc(r.data.notes)}</small>`:''}</div>`).join('')}</details>
 <details open><summary>Obrázky a dokumenty (${own.media.length})</summary>${own.media.map(r=>{const u=safeSourceUrl(r.data.url);return html`<div class="hc-familytree-research-row">${r.media_path?html`<a href="${esc(researchMediaUrl(r.id))}" target="_blank" rel="noopener"><b>${esc(r.data.title)}</b> ↗</a>`:u?html`<a href="${esc(u)}" target="_blank" rel="noopener noreferrer"><b>${esc(r.data.title)}</b> ↗</a>`:html`<b>${esc(r.data.title)}</b> · ${r.data.supported===false?tr('uchováno v původním archivu'):tr('soubor zatím chybí')}`}<small>${esc(r.data.file_name)} · ${esc(r.data.rights||'')}</small>${sourceLabel(r.data.source_id,r.origin_key)}</div>`}).join('')}</details>
 ${own.tasks.length?html`<details><summary>Výzkumné úkoly (${own.tasks.length})</summary>${own.tasks.map(r=>html`<div class="hc-familytree-research-row"><b>${esc(r.data.status)} · ${esc(r.data.checkpoint)}</b><p>${esc(r.data.title||r.data.question)}</p><small>${esc(r.data.next_step)}</small><small>${esc(r.data.target_text||'')}</small></div>`).join('')}</details>`:''}
 <details><summary>Poznámky (${own.notes.length})</summary>${own.notes.map(r=>html`<div class="hc-familytree-research-row"><b>${esc(r.data.xref||'NOTE')} · ${esc(r.data.kind||'other')}</b><p>${esc(r.data.full_text)}</p>${sourceLabel(r.data.source_links?.[0],r.origin_key)}</div>`).join('')}</details>`;
 $('hc-familytree-modal-body').querySelector('.hc-familytree-tabs')?.append(section);
}
function importReportMarkup(report){
 const total=values=>Object.values(values||{}).reduce((sum,count)=>sum+(+count||0),0);
 const created=report.created||{},unchanged=total(report.unchanged),updated=total(report.updated),retained=total(report.removed_retained),missing=report.missing_media||[],warnings=report.warnings||[];
 return html`<div class="hc-familytree-import-report"><p><b>${tr('Stav: import dokončen')}</b>${report.completed_at?' · '+esc(new Date(report.completed_at).toLocaleString()):''}</p>
 <p><b>${tr('Nové osoby:')}</b> ${+created.persons||0} · <b>${tr('Nové vztahy:')}</b> ${+created.relationships||0} · <b>${tr('Ostatní nové záznamy:')}</b> ${Math.max(0,total(created)-(+created.persons||0)-(+created.relationships||0))}</p>
 <p>${tr('Beze změny:')} ${unchanged} · ${tr('Aktualizováno:')} ${updated} · ${tr('V archivu zachováno z předchozí verze:')} ${retained} · ${tr('Nově uložené obrázky:')} ${+report.media_stored||0}</p>
 <p>${tr('Kontrola dat:')} ${Object.entries(report.counts||{}).map(([key,value])=>html`${esc(key)} ${+value||0}`).join(' · ')} · ${tr('Neznámé poznámky:')} ${+report.unknown_notes||0} · ${tr('Konfliktní vazby a tvrzení:')} ${+report.variants||0}</p>
 <p><b>${tr('Strom nyní obsahuje:')}</b> ${+report.tree_people||0} ${tr('osob a')} ${+report.tree_relationships||0} ${tr('zobrazených vztahů.')}</p>
 ${report.tree_people>1&&!report.tree_relationships?html`<p class="hc-familytree-import-warning">${tr('Osoby jsou uložené, ale mezi nimi nejsou zobrazené vazby. Zkontrolujte, zda GEDCOM obsahuje rodiny FAM, a podívejte se na výzkumné varianty vztahů.')}</p>`:''}
 ${retained?html`<p class="hc-familytree-import-warning">${tr('Záznamy nepřítomné v novém souboru zůstaly zachovány. Jejich odstranění vyžaduje ruční kontrolu.')}</p>`:''}
 ${report.backup_path?html`<p><a href="${esc(fileUrl(report.backup_path))}" target="_blank" rel="noopener">${tr('Otevřít archivovaný originál v Souborech')} ↗</a></p>`:''}
 ${missing.length?html`<details><summary>${tr('Chybějící obrázky')} (${missing.length})</summary><ul>${missing.map(name=>html`<li>${esc(name)}</li>`).join('')}</ul></details>`:''}
 ${warnings.length?html`<details><summary>${tr('Upozornění')} (${warnings.length})</summary><ul>${warnings.map(message=>html`<li>${esc(message)}</li>`).join('')}</ul></details>`:''}</div>`;
}
function showImportReport(report){openModal(tr('Výsledek importu'),importReportMarkup(report)+loc('<p><button id="hc-familytree-show-research" type="button">Otevřít výzkumné záznamy</button></p>'));
 $('hc-familytree-show-research').onclick=researchOverview}
function researchOverview(){
 const records=(state.research||[]).filter(r=>r.entity_type!=='import_report'),sources=researchRows('sources'),places=researchRows('places'),tasks=researchRows('research'),packages=researchRows('package'),reports=researchRows('import_report'),notes=researchRows('notes'),facts=researchRows('research_facts'),media=researchRows('media');
 openModal(tr('Výzkumné záznamy'),html`<div class="hc-familytree-research"><p>${records.length} ${tr('původních záznamů')}; ${researchRows('facts').length} ${tr('standardních tvrzení')}; ${facts.length} ${tr('badatelských tvrzení')}. ${tr('Konfliktní varianty se neslučují.')}</p>
 ${packages.map(r=>html`<p><b>${esc(r.origin_key)}</b> · ${esc(r.data.format||'výzkumný archiv')}</p>`).join('')}
 ${reports.map(r=>html`<details open><summary>${tr('Poslední import sady')} ${esc(r.origin_key)}</summary>${importReportMarkup(r.data)}</details>`).join('')}
 <details open><summary>Prameny (${sources.length})</summary>${sources.map(r=>{const u=safeSourceUrl(r.data.url);return html`<div class="hc-familytree-research-row"><b>${esc(r.external_id)} · ${esc(r.data.title)}</b><small>${esc([r.data.archive,r.data.fond,r.data.signatura,r.data.page,r.data.scan].filter(Boolean).join(' · '))}</small>${u?html`<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${tr('Otevřít pramen')} ↗</a>`:''}</div>`}).join('')}</details>
 <details><summary>Média (${media.length})</summary>${media.map(r=>{const u=r.media_path?researchMediaUrl(r.id):safeSourceUrl(r.data.url);return html`<div class="hc-familytree-research-row"><b>${esc(r.data.title||r.data.file_name)}</b><small>${esc(r.data.file_name)} · ${esc(r.data.form||'')} · ${esc(r.data.rights||'')}</small>${u?html`<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">Otevřít ↗</a>`:''}</div>`}).join('')}</details>
 <details><summary>Badatelská tvrzení (${facts.length})</summary>${facts.map(r=>html`<div class="hc-familytree-research-row"><b>${esc(r.data.external_fact_id||r.external_id)} · ${esc(r.data.fact_type)}</b><p>${esc(r.data.raw_value)}</p><small>${esc(r.data.verification_status)}${r.data.locator?' · '+esc(r.data.locator):''}</small></div>`).join('')}</details>
 <details><summary>Místa (${places.length})</summary>${places.map(r=>html`<div class="hc-familytree-research-row"><b>${esc(r.data.catalog_id||r.external_id)} · ${esc(r.data.name)}</b><small>${esc([r.data.current_municipality,r.data.district,r.data.region,r.data.country].filter(Boolean).join(' · '))}</small><small>${esc(r.data.historical_names||'')}</small><details><summary>Původní text</summary><p>${esc(r.data.original_text||'')}</p></details></div>`).join('')}</details>
 <details><summary>Výzkumné úkoly (${tasks.length})</summary>${tasks.map(r=>html`<div class="hc-familytree-research-row"><b>${esc(r.data.external_task_id||r.external_id)} · ${esc(r.data.checkpoint)} · ${esc(r.data.status)}</b><p>${esc(r.data.title||r.data.question)}</p><small>${esc(r.data.attempts||'')} · ${esc(r.data.result||'')}</small><small>${esc(r.data.next_step)}</small><small>${esc(r.data.target_text||'')}</small></div>`).join('')}</details>
 <details><summary>Poznámky / ostatní výzkumná data (${notes.length})</summary>${notes.map(r=>html`<div class="hc-familytree-research-row"><b>${esc(r.data.xref||'NOTE')} · ${esc(r.data.kind||'other')}</b><p>${esc(r.data.full_text)}</p></div>`).join('')}</details></div>`);
}
function personDetail(id){const p=byId(id),ev=state.events.filter(x=>+x.person_id===id),docs=docsFor('person',id),rels=state.relationships.filter(x=>+x.person1_id===id||+x.person2_id===id);selected=id;const importedPhoto=researchFor(id).media.find(r=>r.data.media_type==='person_photo'&&(r.media_path||safeSourceUrl(r.data.url)));const portrait=p.photo_url||(importedPhoto?.media_path?researchMediaUrl(importedPhoto.id):safeSourceUrl(importedPhoto?.data.url||''));openModal((p.given_name+' '+p.surname).trim(),html`<div class="hc-familytree-detail">${state.canEdit?loc('<div class="hc-familytree-person-actions"><button type="button" id="hc-familytree-edit-person" class="primary">✏️ Upravit jméno a údaje</button><button type="button" id="hc-familytree-add-child">＋ Přidat dítě</button><button type="button" id="hc-familytree-set-parents">⇧ Nastavit rodiče</button></div>'):''}<div class="hc-familytree-profile">${portrait?html`<img src="${esc(portrait)}">`:loc('<span>👤</span>')}<div><b>${esc(years(p))}</b><p>${esc(p.birth_place)}</p><p>${esc(p.occupation)}</p></div></div><div id="hc-familytree-note-preview" class="hc-familytree-notes"></div><div class="hc-familytree-tabs"><h3>Vztahy</h3>${rels.map(r=>html`<div class="hc-familytree-row"><span>${r.type==='parent'?(+r.person2_id===id?tr('Rodič'):tr('Dítě')):tr('Partnerství')}: <b>${esc((()=>{const x=byId(+r.person1_id===id?r.person2_id:r.person1_id);return x?(x.given_name+' '+x.surname):''})())}</b><small>${docsFor('relation',r.id).length} ${tr('dokumentů')}</small></span>${state.canEdit?html`<button data-del-rel="${r.id}">×</button>`:''}</div>`).join('')||loc('<p>Zatím bez vztahů.</p>')}${state.canEdit?loc('<button id="hc-familytree-add-rel">＋ Přidat vztah</button>'):''}<h3>Události</h3>${ev.map(x=>html`<div class="hc-familytree-row"><span><b>${esc(x.title||x.type)}</b><small>${esc(x.event_date)} · ${esc(x.place)} · ${docsFor('event',x.id).length} ${tr('dokumentů')}</small></span>${state.canEdit?html`<button data-del-event="${x.id}">×</button>`:''}</div>`).join('')}${state.canEdit?loc('<button id="hc-familytree-add-event">＋ Přidat událost</button>'):''}<h3>Dokumenty</h3>${docs.map(documentRow).join('')||loc('<p>Zatím bez dokumentů.</p>')}${state.canEdit?loc('<button id="hc-familytree-add-doc">＋ Připojit dokument</button>'):''}</div></div>`);$('hc-familytree-note-preview').replaceChildren(oCore.editor.render(p.notes||tr('Bez poznámek')));researchDetail(id);$('hc-familytree-modal-body').onclick=async e=>{const edit=e.target.closest('[data-edit-doc]');if(edit)return docForm(p,state.documents.find(x=>+x.id===+edit.dataset.editDoc));let path;if(e.target.dataset.delRel)path='/api/relationships/'+e.target.dataset.delRel;if(e.target.dataset.delEvent)path='/api/events/'+e.target.dataset.delEvent;if(e.target.dataset.delDoc&&await confirmDialog({title:tr('Odebrat dokument z rodokmenu?'),message:tr('Původní soubor v Nextcloudu zůstane zachován.'),confirmLabel:tr('Odebrat'),cancelLabel:tr('Zrušit'),danger:true}))path='/api/documents/'+e.target.dataset.delDoc;if(path){await api(path,{method:'DELETE'});await selectTree(current);personDetail(id)}};if(state.canEdit){$('hc-familytree-edit-person').onclick=()=>personForm(p);$('hc-familytree-add-child').onclick=()=>childForm(p);$('hc-familytree-set-parents').onclick=()=>parentsForm(p);$('hc-familytree-add-rel').onclick=()=>relationForm(p);$('hc-familytree-add-event').onclick=()=>eventForm(p);$('hc-familytree-add-doc').onclick=()=>docForm(p)}}
function parentsForm(p){
 const parents=state.relationships.filter(r=>r.type==='parent'&&+r.person2_id===+p.id).map(r=>+r.person1_id);
 const others=state.people.filter(x=>+x.id!==+p.id);
 if(!others.length)return toast(tr('Nejdříve přidejte další osobu.'),'warning');
 const options=(selected,emptyLabel)=>html`<option value="0">${tr(emptyLabel)}</option>${others.map(x=>html`<option value="${x.id}" ${+x.id===selected?'selected':''}>${esc((x.given_name+' '+x.surname).trim())}</option>`).join('')}`;
 openModal(tr('Nastavit rodiče'),html`<form id="hc-familytree-parents-form" class="hc-familytree-form"><p>${tr('Dítě:')} <strong>${esc((p.given_name+' '+p.surname).trim())}</strong></p>${parents.length>2?html`<p class="hc-familytree-import-warning">${tr('Tato osoba má více než dva rodičovské záznamy. Další vazby zůstanou ve výzkumné historii, ale ruční uložení rodičů je odebere ze stromu.')}</p>`:''}<label>První rodič<select name="parent1_id" required>${options(parents[0]||0,'Vyberte rodiče')}</select></label><label>Druhý rodič<select name="parent2_id">${options(parents[1]||0,'Bez druhého rodiče')}</select></label><p class="hc-familytree-hint">${tr('Uložení nahradí dosavadní rodičovské vazby této osoby. Jiných vztahů se nedotkne.')}</p><div class="hc-familytree-form-actions"><button type="button" data-close>Zrušit</button><button type="submit" class="primary">Uložit rodiče</button></div></form>`);
 $('hc-familytree-parents-form').onsubmit=async e=>{e.preventDefault();const form=e.target,d=formData(form),button=form.querySelector('button.primary');if(!+d.parent1_id||+d.parent1_id===+d.parent2_id)return toast(tr('Vyberte jednoho nebo dva různé rodiče.'),'error');if(parents.length>2&&!await confirmDialog({title:tr('Odebrat další rodičovské vazby?'),message:tr('Výzkumné záznamy zůstanou zachované, ale další vazby ze stromu zmizí.'),confirmLabel:tr('Uložit rodiče'),cancelLabel:tr('Zrušit'),danger:true}))return;button.disabled=true;try{await api('/api/people/'+p.id+'/parents',{method:'POST',body:JSON.stringify(d)});await selectTree(current);personDetail(+p.id)}catch(error){toast(tr('Rodiče se nepodařilo uložit: ')+error.message,'error');button.disabled=false}};
}
function childForm(p){
 const partnerIds=new Set(state.relationships.filter(r=>r.type==='partner'&&(+r.person1_id===+p.id||+r.person2_id===+p.id)).map(r=>+r.person1_id===+p.id?+r.person2_id:+r.person1_id));
 const partners=state.people.filter(x=>+x.id!==+p.id).sort((a,b)=>Number(partnerIds.has(+b.id))-Number(partnerIds.has(+a.id)));const preferred=partners.filter(x=>partnerIds.has(+x.id));
 openModal(tr('Přidat dítě'),html`<form id="hc-familytree-child-form" class="hc-familytree-form"><p>${tr('Rodič:')} <strong>${esc((p.given_name+' '+p.surname).trim())}</strong></p><label>Druhý rodič / partner<select name="parent2_id"><option value="0">Bez druhého rodiče</option>${partners.map(x=>html`<option value="${x.id}" ${preferred.length===1&&+x.id===+preferred[0].id?'selected':''}>${esc((x.given_name+' '+x.surname).trim())}</option>`).join('')}</select></label><div class="hc-familytree-grid"><label>Jméno<input name="given_name" autocomplete="off"></label><label>Příjmení<input name="surname" value="${esc(p.surname)}" autocomplete="off"></label><label>Pohlaví<select name="gender"><option value="other">Neuvedeno</option><option value="female">Žena</option><option value="male">Muž</option></select></label><label>Datum narození<input name="birth_date" placeholder="např. 12. 3. 2020"></label></div><p class="hc-familytree-hint">${tr('Dítě lze později upravit stejně jako ostatní osoby.')}</p><div class="hc-familytree-form-actions"><button type="button" data-close>Zrušit</button><button type="submit" class="primary">Přidat dítě</button></div></form>`);
 $('hc-familytree-child-form').onsubmit=async e=>{e.preventDefault();const form=e.target,d=formData(form),button=form.querySelector('button.primary'),original=button.textContent;d.parent1_id=+p.id;d.is_living=true;if(!String(d.given_name||'').trim()&&!String(d.surname||'').trim())return toast(tr('Zadejte jméno nebo příjmení.'),'error');button.disabled=true;button.textContent=tr('Ukládám…');try{const child=await api('/api/trees/'+current+'/children',{method:'POST',body:JSON.stringify(d)});closeModal();await selectTree(current);personDetail(+child.id)}catch(error){toast(tr('Dítě se nepodařilo přidat: ')+error.message,'error');button.disabled=false;button.textContent=original}};
}
function relationForm(p){const others=state.people.filter(x=>+x.id!==+p.id);if(!others.length)return toast(tr('Nejdříve přidejte další osobu.'),'warning');openModal(tr('Přidat vztah'),html`<form id="hc-familytree-rel-form" class="hc-familytree-form"><label>Typ<select name="type"><option value="parent">Tato osoba je rodičem vybrané osoby</option><option value="partner">Partner / manžel</option></select></label><label>Osoba<select name="person2_id">${others.map(x=>html`<option value="${x.id}">${esc(x.given_name+' '+x.surname)}</option>`).join('')}</select></label><label>Od<input name="start_date"></label><label>Do<input name="end_date"></label><label>Poznámka<textarea name="notes"></textarea></label><div class="hc-familytree-form-actions"><button type="button" data-close>Zrušit</button><button type="submit" class="primary">Přidat</button></div></form>`);$('hc-familytree-rel-form').onsubmit=async e=>{e.preventDefault();const form=e.target,button=form.querySelector('button.primary'),original=button.textContent,d=formData(form);d.person1_id=p.id;button.disabled=true;button.textContent=tr('Ukládám…');try{const result=await api('/api/trees/'+current+'/relationships',{method:'POST',body:JSON.stringify(d)});await selectTree(current);personDetail(+p.id);if(result.alreadyExisted)toast(tr('Tento vztah už existuje.'),'warning')}catch(error){toast(tr('Vztah se nepodařilo přidat: ')+error.message,'error');button.disabled=false;button.textContent=original}}}
function eventForm(p){openModal(tr('Nová událost'),html`<form id="hc-familytree-event-form" class="hc-familytree-form"><label>Typ<select name="type"><option value="birth">Narození</option><option value="marriage">Svatba</option><option value="residence">Bydliště</option><option value="education">Vzdělání</option><option value="work">Zaměstnání</option><option value="other">Jiná</option></select></label><label>Název<input name="title" required></label><label>Datum<input name="event_date"></label><label>Místo<input name="place"></label><label>Popis<textarea name="description"></textarea></label><div class="hc-familytree-form-actions"><button class="primary">Přidat</button></div></form>`);$('hc-familytree-event-form').onsubmit=async e=>{e.preventDefault();await api('/api/people/'+p.id+'/events',{method:'POST',body:JSON.stringify(formData(e.target))});await selectTree(current);personDetail(+p.id)}}
function docForm(p,doc=null){doc=doc||{};const linked=new Set(doc.id?docLinks(doc.id).map(x=>x.link_type+':'+x.target_id):['person:'+p.id]);openModal(doc.id?tr('Upravit dokument'):tr('Připojit dokument'),html`<form id="hc-familytree-doc-form" class="hc-familytree-form"><div class="hc-familytree-grid"><label>Název<input name="title" value="${esc(doc.title)}" required></label><label>Typ<select name="document_type">${['Rodný list','Oddací list','Úmrtní list','Křestní list','Sčítání lidu','Matrika','Fotografie','Dopis','Jiný dokument'].map(x=>html`<option value="${esc(x)}" ${doc.document_type===x?'selected':''}>${tr(x)}</option>`).join('')}</select></label><label>Datum dokumentu<input name="document_date" value="${esc(doc.document_date)}"></label><label>Místo<input name="place" value="${esc(doc.place)}"></label><label>Archiv<input name="archive" value="${esc(doc.archive)}"></label><label>Signatura<input name="signature" value="${esc(doc.signature)}"></label><label>Zdroj / odkaz<input name="source" value="${esc(doc.source)}"></label><label>MIME typ<input name="mime_type" value="${esc(doc.mime_type)}" placeholder="application/pdf"></label></div><label>Soubor v Nextcloudu<div class="hc-familytree-file-line"><input id="hc-familytree-file-path" name="file_path" value="${esc(doc.file_path)}" placeholder="/Rodokmen/Dokumenty/list.pdf" required><button type="button" id="hc-familytree-pick-file">Vybrat ze Souborů</button></div></label><label>Popis<textarea name="description">${esc(doc.description)}</textarea></label><fieldset class="hc-familytree-links"><legend>Připojit k osobám</legend>${state.people.map(x=>html`<label><input type="checkbox" data-link="person" value="${x.id}" ${linked.has('person:'+x.id)?'checked':''}> ${esc(x.given_name+' '+x.surname)}</label>`).join('')}</fieldset><fieldset class="hc-familytree-links"><legend>Připojit k událostem</legend>${state.events.map(x=>html`<label><input type="checkbox" data-link="event" value="${x.id}" ${linked.has('event:'+x.id)?'checked':''}> ${esc(x.title||x.type)} · ${esc(x.event_date)}</label>`).join('')||loc('<p>Nejdříve vytvořte událost, například Svatba.</p>')}</fieldset><fieldset class="hc-familytree-links"><legend>Připojit ke vztahům a svazkům</legend>${state.relationships.map(x=>html`<label><input type="checkbox" data-link="relation" value="${x.id}" ${linked.has('relation:'+x.id)?'checked':''}> ${x.type==='partner'?tr('Svazek'):tr('Rodičovský vztah')}: ${esc(relationName(x))}</label>`).join('')||loc('<p>Nejdříve vytvořte partnerský vztah.</p>')}</fieldset><p class="hc-familytree-hint">Ukládá se odkaz na existující soubor. Smazání dokumentu z rodokmenu původní soubor nesmaže.</p><div class="hc-familytree-form-actions"><button type="button" data-close>Zrušit</button><button class="primary">Uložit dokument</button></div></form>`);$('hc-familytree-pick-file').onclick=()=>{if(OC.dialogs?.filepicker){OC.dialogs.filepicker(tr('Vyberte dokument'),path=>{if(path)$('hc-familytree-file-path').value=Array.isArray(path)?path[0]:path},false,null,true)}else toast(tr('Výběr souboru není dostupný; vložte cestu ručně.'),'error')};$('hc-familytree-doc-form').onsubmit=async e=>{e.preventDefault();const d=formData(e.target);d.links=[...e.target.querySelectorAll('[data-link]:checked')].map(x=>({type:x.dataset.link,id:+x.value}));if(!d.links.length)return toast(tr('Připojte dokument alespoň k jedné osobě, události nebo svazku.'),'error');await api(doc.id?'/api/documents/'+doc.id:'/api/trees/'+current+'/documents',{method:doc.id?'PUT':'POST',body:JSON.stringify(d)});await selectTree(current);personDetail(+p.id)}}
function toggleMoreMenu(){const m=$('hc-familytree-menu'),anchor=document.querySelector('[data-toolbar-action="more"]');m.hidden=!m.hidden;if(!m.hidden)positionPopover(m,anchor,260)}
$('hc-familytree-menu').onclick=async e=>{const a=e.target.closest('[data-action]')?.dataset.action;$('hc-familytree-menu').hidden=true;if(a==='edit-tree')treeEdit();if(a==='share')shares();if(a==='gedcom')gedcom();if(a==='research')researchOverview();if(a==='delete-tree')deleteTree();if(a==='undo-layout')await travelLayoutHistory('undo');if(a==='redo-layout')await travelLayoutHistory('redo');if(a==='reset-layout')await reflowTree()};
function treeEdit(){openModal(tr('Upravit rodokmen'),html`<form id="hc-familytree-tree-edit" class="hc-familytree-form"><label>Název<input name="name" value="${esc(state.tree.name)}"></label><label>Popis<textarea name="description">${esc(state.tree.description)}</textarea></label><label>Výchozí osoba<select name="root_person_id">${state.people.map(p=>html`<option value="${p.id}" ${+p.id===+state.tree.root_person_id?'selected':''}>${esc(p.given_name+' '+p.surname)}</option>`).join('')}</select></label><div class="hc-familytree-form-actions"><button class="primary">Uložit</button></div></form>`);$('hc-familytree-tree-edit').onsubmit=async e=>{e.preventDefault();await api('/api/trees/'+current,{method:'PUT',body:JSON.stringify(formData(e.target))});closeModal();await selectTree(current)}}
async function deleteTree(){if(state.isOwner&&await confirmDialog({title:tr('Smazat celý rodokmen?'),message:tr('Budou odstraněny všechny osoby, vztahy, události a odkazy na dokumenty.'),confirmLabel:tr('Smazat rodokmen'),cancelLabel:tr('Zrušit'),danger:true})){await api('/api/trees/'+current,{method:'DELETE'});layoutHistory.delete(current);current=0;state=null;$('hc-familytree-stage').hidden=true;await loadTrees()}}
function shares(){openModal(tr('Sdílení rodokmenu'),html`<div class="hc-familytree-share-list">${state.shares.map(s=>html`<div class="hc-familytree-row"><span>${s.share_type==='group'?'👥':'👤'} <b>${esc(s.share_with)}</b><small>${s.permission==='edit'?tr('Může upravovat'):tr('Pouze čtení')}</small></span><button data-del-share="${s.id}">×</button></div>`).join('')||loc('<p>Rodokmen zatím není sdílen.</p>')}</div><div id="hc-familytree-core-picker"></div><label>Oprávnění<select id="hc-familytree-share-permission"><option value="view">Pouze čtení</option><option value="edit">Může upravovat</option></select></label><div class="hc-familytree-form-actions"><button id="hc-familytree-add-share" class="primary">Přidat vybraného uživatele nebo skupinu</button></div>`);const oPicker=oCore.picker.create($('hc-familytree-core-picker'),{endpoint:OC.generateUrl('/apps/hc_shared_app_core/api/v1/sharees'),types:['user','group'],multiple:false,placeholder:tr('Hledat uživatele nebo skupinu…')});fnModalCleanup=()=>oPicker.destroy();$('hc-familytree-add-share').onclick=async()=>{const oSelected=oPicker.selected()[0];if(!oSelected)return toast(tr('Nejdříve vyberte uživatele nebo skupinu.'),'warning');await api('/api/trees/'+current+'/shares',{method:'POST',body:JSON.stringify({share_type:oSelected.type,share_with:oSelected.id,permission:$('hc-familytree-share-permission').value})});closeModal();await selectTree(current);shares()};$('hc-familytree-modal-body').onclick=async e=>{if(e.target.dataset.delShare){await api('/api/shares/'+e.target.dataset.delShare,{method:'DELETE'});closeModal();await selectTree(current);shares()}}}
function viewportBox(){const vv=window.visualViewport;return vv?{left:vv.offsetLeft,top:vv.offsetTop,width:vv.width,height:vv.height}:{left:0,top:0,width:innerWidth,height:innerHeight}}
function positionPopover(pop,anchor,preferredWidth){if(!pop||!anchor)return;const vp=viewportBox(),margin=12,width=Math.min(preferredWidth,Math.max(240,vp.width-margin*2)),r=anchor.getBoundingClientRect();pop.style.width=width+'px';const height=Math.min(pop.offsetHeight||260,vp.height-margin*2),left=Math.max(vp.left+margin,Math.min(r.right-width,vp.left+vp.width-width-margin)),top=Math.max(vp.top+margin,Math.min(r.bottom+6,vp.top+vp.height-height-margin));pop.style.left=left+'px';pop.style.top=top+'px'}
function gedcom(){
 openModal(tr('Import GEDCOM 7 / GEDZIP'),html`<div class="hc-familytree-gedcom">
 <p>Vyberte GEDCOM 7 (.ged), nebo GEDZIP (.gdz) s obrázky. Osoby, vztahy, rozporné varianty, citace a poznámky se uloží do rodokmenu; původní soubor se také archivuje.</p>
 <label>Soubor<input id="hc-familytree-research-file" type="file" accept=".ged,.gedcom,.gdz,text/plain,application/zip"></label>
 <label>Označení sady<input id="hc-familytree-research-origin" value="genealogie" maxlength="64" pattern="[A-Za-z0-9_-]+"></label>
 <label>Režim<select id="hc-familytree-research-mode"><option value="new">Importovat do prázdného stromu</option><option value="update">Aktualizovat tuto sadu podle UID</option></select></label>
 <p class="hc-familytree-hint">Aktualizace porovnává stabilní UID ve stejné sadě. Ručně změněné údaje zůstávají zachovány a nepřítomné záznamy se nemažou bez kontroly. Náhled ukáže rozdíly.</p>
 <button id="hc-familytree-research-preview" type="button" ${state.canEdit?'':'disabled'}>Zkontrolovat soubor</button>
 <div id="hc-familytree-research-preview-result" role="status" aria-live="polite"></div>
 <button id="hc-familytree-research-import" class="primary" type="button" disabled>Importovat zkontrolovaná data</button></div>`);
 const file=$('hc-familytree-research-file'),origin=$('hc-familytree-research-origin'),mode=$('hc-familytree-research-mode'),previewButton=$('hc-familytree-research-preview'),importButton=$('hc-familytree-research-import'),result=$('hc-familytree-research-preview-result');
 if(researchRows('package').some(r=>r.origin_key===origin.value))mode.value='update';
 let approved=null;
 const reset=()=>{approved=null;importButton.disabled=true;result.replaceChildren()};
 file.onchange=reset;origin.oninput=reset;mode.onchange=reset;
 const body=(hash='')=>{const data=new FormData();data.append('package',file.files[0]);data.append('origin',origin.value.trim());data.append('mode',mode.value);if(hash)data.append('preview_sha256',hash);return data};
 previewButton.onclick=async()=>{
  if(!file.files.length)return toast(tr('Vyberte .ged nebo .gdz.'),'warning');
  previewButton.disabled=true;result.textContent=tr('Kontroluji import…');
  try{
   const data=await api('/api/trees/'+current+'/research/preview',{method:'POST',body:body()});
   approved={file:file.files[0],origin:origin.value.trim(),mode:mode.value,hash:data.sha256};
   const labels={persons:tr('osoby'),families:tr('rodiny'),relationships:tr('vztahy'),events:tr('události'),facts:tr('standardní tvrzení'),research_facts:tr('badatelská tvrzení'),sources:tr('prameny'),citations:tr('citace'),media:tr('média'),places:tr('místa'),research:tr('úkoly'),notes:tr('poznámky'),note_links:tr('vazby poznámek')};
   const counts=Object.entries(data.counts).map(([key,count])=>`${labels[key]||key}: ${count}`).join(' · ');
   const changed=Object.values(data.changed).reduce((sum,n)=>sum+n,0),removed=Object.values(data.removed||{}).reduce((sum,n)=>sum+n,0);
   result.innerHTML=html`<p><b>${tr('Formát:')}</b> ${esc(data.format)} · <b>${tr('Záznamy:')}</b> ${esc(counts)}</p><p>${tr('Přiložené obrázky:')} ${data.available.length}; ${tr('vzdálené odkazy:')} ${data.remote?.length||0}; ${tr('chybějící:')} ${data.missing.length}.</p>
   <p>${tr('Nové:')} ${Object.values(data.new).reduce((sum,n)=>sum+n,0)} · ${tr('Změněné:')} ${changed} · ${tr('Beze změny:')} ${Object.values(data.unchanged).reduce((sum,n)=>sum+n,0)} · ${tr('Neznámé poznámky:')} ${+data.unknownNotes||0} · ${tr('Konflikty:')} ${+data.variants||0}</p>
   ${Object.keys(data.changes||{}).length?html`<details open><summary>${tr('Rozdíly podle typu záznamu')}</summary><ul>${Object.entries(data.changes).map(([key,c])=>html`<li>${esc(labels[key]||key)}: +${+c.new||0}, Δ${+c.changed||0}, ${+c.absent_in_file||0} ${tr('nepřítomných v souboru')}</li>`).join('')}</ul></details>`:''}
   ${data.missing.length?html`<details><summary>${tr('Chybějící obrázky')}</summary><ul>${data.missing.map(name=>html`<li>${esc(name)}</li>`).join('')}</ul></details>`:''}
   ${Object.keys(data.parentConflicts||{}).length?html`<p class="hc-familytree-import-warning">${tr('Více než dvě rodičovské vazby:')} ${esc(Object.entries(data.parentConflicts).map(([id,n])=>`${id} (${n})`).join(', '))}. ${tr('Ve stromu se zobrazí dvě nejlépe doložené, další varianty zůstanou ve výzkumných záznamech.')}</p>`:''}
   ${removed?html`<p class="hc-familytree-import-warning">${removed} ${tr('dřívějších záznamů v novém souboru chybí; zůstanou zachovány k ruční kontrole.')}</p>`:''}
   ${data.warnings?.length?html`<details><summary>${tr('Upozornění')} (${data.warnings.length})</summary><ul>${data.warnings.map(x=>html`<li>${esc(x)}</li>`).join('')}</ul></details>`:''}`;
   importButton.disabled=false;
  }catch(error){reset();result.textContent=error.message;toast(error.message,'error')}
  finally{previewButton.disabled=false}
 };
 importButton.onclick=async()=>{
  if(!approved||file.files[0]!==approved.file||origin.value.trim()!==approved.origin||mode.value!==approved.mode)return reset();
  importButton.disabled=true;result.textContent=tr('Ukládám rodokmen…');
  try{
   const done=await api('/api/trees/'+current+'/research/import',{method:'POST',body:body(approved.hash)});
   approved=null;closeModal();
   try{await selectTree(current)}catch(error){toast(tr('Import je uložen, ale obnovení stromu se nepodařilo: ')+error.message,'warning')}
   showImportReport(done);
  }catch(error){result.textContent=error.message;importButton.disabled=false;toast(error.message,'error')}
 };
}

$('hc-familytree-settings').onclick=()=>{openModal(tr('Nastavení a informace'),html`<p>Rodokmen používá soukromá data uložená v databázi Nextcloudu.</p><label class="hc-familytree-touch-option"><input id="hc-familytree-touch-drag" type="checkbox" ${allowTouchCardDrag?'checked':''}> ${tr('Na mobilu odemknout přesouvání karet')}</label><p class="hc-familytree-hint">${tr('Zapnuto: táhněte kartu jedním prstem. Prázdným plátnem posouváte strom.')}</p><label class="hc-familytree-touch-option"><input id="hc-familytree-evidence-toggle" type="checkbox" ${showEvidenceBadges?'checked':''}> ${tr('Zobrazit značky ověření u jmen')}</label><div id="hc-familytree-about"></div>`);$('hc-familytree-touch-drag').onchange=e=>{allowTouchCardDrag=e.target.checked;try{localStorage.setItem('hc_familytree:touch-card-drag',allowTouchCardDrag?'1':'0')}catch(_){}};$('hc-familytree-evidence-toggle').onchange=e=>{showEvidenceBadges=e.target.checked;treeCanvas.classList.toggle('hide-evidence-badges',!showEvidenceBadges);try{localStorage.setItem('hc_familytree:evidence-badges',showEvidenceBadges?'1':'0')}catch(_){}};oAboutController=oCore.about.mount($('hc-familytree-about'),{requiredCoreVersion:'0.18.8',heading:tr('O aplikaci')})};document.addEventListener('click',e=>{if(e.target.matches('[data-close]'))closeModal()});
document.addEventListener('click',e=>{const menu=$('hc-familytree-menu');if(!menu.hidden&&!menu.contains(e.target)&&!e.target.closest('[data-toolbar-action="more"]'))menu.hidden=true});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('hc-familytree-menu').hidden){e.preventDefault();$('hc-familytree-menu').hidden=true;document.querySelector('[data-toolbar-action="more"]')?.focus()}});
oToolbarController=oCore.toolbar.create($("hc-familytree-core-toolbar"),{ariaLabel:tr("Nástroje rodokmenu"),actions:toolbarActions()});
let previousTouchMode=isTouchTree();
const oLayoutController=oCore.layout.observe(oRoot,{topOffset:50,onResize:()=>{
 const mobile=isTouchTree();syncViewControls();restoreLegendPosition();
 if(mobile!==previousTouchMode){previousTouchMode=mobile;applyTreeScale();if(state)requestAnimationFrame(()=>mobile?focusMobileTree():fitTree())}
 scheduleConnections();
}});window.addEventListener('pagehide',()=>{cleanupModal();oCore.dialogs.closeAll();oCore.notifications.clear();oLayoutController.destroy();connectionObserver?.disconnect();cancelAnimationFrame(connectionFrame);oToolbarController?.destroy()},{once:true});
loadTrees().catch(oError=>{oLogger.error(tr('Načtení rodokmenů selhalo.'),oError);toast(oError.message,'error')});
})(); 
