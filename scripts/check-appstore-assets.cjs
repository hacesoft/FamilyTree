#!/usr/bin/env node
'use strict';
/**
 * Hacesoft App Store assets – blokující kontrola lokálního sestavení.
 *
 * Vstupy:
 *   argv[2] = kořen projektu se src/ a docs/;
 *   argv[3] = volitelný kořen sestavené runtime aplikace;
 *   argv[4] = volitelný kořen veřejného full-source projektu.
 * Výstup: PASS pouze při shodě schválených hashů, XML metadat, PNG a SVG.
 * Veřejná HTTPS dostupnost je samostatná POST-PUBLISH kontrola.
 */
const nodeFs = require('node:fs');
const nodePath = require('node:path');
const nodeCrypto = require('node:crypto');
const nodeZlib = require('node:zlib');

const oRoot = nodePath.resolve(process.argv[2] || nodePath.join(__dirname, '..'));
const oRuntime = process.argv[3] ? nodePath.resolve(process.argv[3]) : null;
const oPublic = process.argv[4] ? nodePath.resolve(process.argv[4]) : null;
const aErrors = [];
const sConfigPath = nodePath.join(oRoot, 'scripts/appstore-approved-assets.json');
const nMaxScreenshotSize = 2 * 1024 * 1024;
let oManifest;
try {oManifest = JSON.parse(nodeFs.readFileSync(sConfigPath, 'utf8'));}
catch (oError) {process.stderr.write(`FAIL: Nelze načíst schválené grafické podklady: ${oError.message}\n`); process.exit(1);}

/** Bezpečně přečte soubor pouze z určeného kořene, bez symlinků a útěků mimo něj. */
function fReadFile(oBase, sRelative) {
  if (typeof sRelative !== 'string' || !/^[\w./-]+$/.test(sRelative) || sRelative.startsWith('/') || sRelative.split('/').includes('..'))
    throw new Error(`Neplatná relativní cesta: ${sRelative}`);
  const sFull = nodePath.resolve(oBase, sRelative);
  if (sFull === oBase || !sFull.startsWith(oBase + nodePath.sep)) throw new Error(`Cesta mimo projekt: ${sRelative}`);
  let sCurrent = oBase;
  for (const sPart of sRelative.split('/')) {
    sCurrent = nodePath.join(sCurrent, sPart);
    if (nodeFs.lstatSync(sCurrent).isSymbolicLink()) throw new Error(`Zakázaný symlink: ${sRelative}`);
  }
  if (!nodeFs.statSync(sFull).isFile()) throw new Error(`Chybí soubor: ${sRelative}`);
  return nodeFs.readFileSync(sFull);
}
/** Porovná obsah souboru s majitelem schváleným SHA-256. */
function fValidateHash(oBase, sRelative, sExpected) {
  const oBytes = fReadFile(oBase, sRelative);
  const sActual = nodeCrypto.createHash('sha256').update(oBytes).digest('hex');
  if (!/^[a-f0-9]{64}$/.test(sExpected) || sActual !== sExpected)
    throw new Error(`Neschválený či změněný obrázek ${sRelative}: SHA-256 ${sActual}, očekáváno ${sExpected}`);
  return oBytes;
}
/** Vrací CRC-32 pro kontrolu všech PNG chunků. */
function fCrc32(oBytes) {
  let nCrc = 0xffffffff;
  for (const nByte of oBytes) {
    nCrc ^= nByte;
    for (let nIndex = 0; nIndex < 8; nIndex++) nCrc = (nCrc >>> 1) ^ ((nCrc & 1) ? 0xedb88320 : 0);
  }
  return (nCrc ^ 0xffffffff) >>> 0;
}
/** Zkontroluje celou PNG strukturu a rozměry; nikdy obrázek nepřekóduje. */
function fValidatePng(oBytes, sName, oExpected) {
  if (!oBytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) throw new Error(`${sName}: neplatná hlavička PNG`);
  if (oBytes.length > nMaxScreenshotSize && oExpected) throw new Error(`${sName}: screenshot překračuje 2 MiB`);
  let nPosition = 8; let bIHDR = false; let bIEND = false; let nIdat = 0;
  while (nPosition < oBytes.length) {
    if (nPosition + 12 > oBytes.length) throw new Error(`${sName}: poškozený PNG chunk`);
    const nLength = oBytes.readUInt32BE(nPosition);
    if (nLength > oBytes.length - nPosition - 12) throw new Error(`${sName}: uříznutý PNG chunk`);
    const sChunk = oBytes.toString('ascii', nPosition + 4, nPosition + 8);
    const nDataBegin = nPosition + 8; const nDataEnd = nDataBegin + nLength;
    const nCrc = oBytes.readUInt32BE(nDataEnd);
    if (fCrc32(oBytes.subarray(nPosition + 4, nDataEnd)) !== nCrc) throw new Error(`${sName}: chybné CRC v chunku ${sChunk}`);
    if (sChunk === 'IHDR') {
      if (bIHDR || nPosition !== 8 || nLength !== 13) throw new Error(`${sName}: neplatný IHDR`);
      bIHDR = true;
      const nWidth = oBytes.readUInt32BE(nDataBegin);
      const nHeight = oBytes.readUInt32BE(nDataBegin + 4);
      if (nWidth < 1 || nHeight < 1 || nWidth > 10000 || nHeight > 10000) throw new Error(`${sName}: neplatné rozměry PNG`);
      if (oExpected && (nWidth !== oExpected.width || nHeight !== oExpected.height))
        throw new Error(`${sName}: změněné rozměry ${nWidth}x${nHeight}`);
    }
    if (sChunk === 'IDAT') nIdat++;
    if (sChunk === 'IEND') {if (nLength !== 0) throw new Error(`${sName}: neplatný IEND`); bIEND = true; nPosition = nDataEnd + 4; break;}
    nPosition = nDataEnd + 4;
  }
  if (!bIHDR || !bIEND || !nIdat || nPosition !== oBytes.length) throw new Error(`${sName}: neúplný PNG soubor`);
}
/** Minimální striktní XML validace SVG bez doplňkových npm balíčků. */
function fValidateSvg(oBytes, sName) {
  const sXml = oBytes.toString('utf8');
  if (Buffer.from(sXml, 'utf8').compare(oBytes) !== 0) throw new Error(`${sName}: neplatné UTF-8`);
  if (/<!DOCTYPE|<!ENTITY|<script\b|<foreignObject\b|<iframe\b|\son[a-z]+\s*=|(?:href|xlink:href)\s*=\s*['"](?:https?:|data:|javascript:)/i.test(sXml))
    throw new Error(`${sName}: externí odkazy nebo aktivní SVG obsah`);
  const aTags = sXml.match(/<\?[^>]*\?>|<!--[^]*?-->|<!\[CDATA\[[^]*?\]\]>|<\/?[A-Za-z_][^>]*>/g) || [];
  const sRemaining = sXml.replace(/<\?[^>]*\?>|<!--[^]*?-->|<!\[CDATA\[[^]*?\]\]>|<\/?[A-Za-z_][^>]*>/g, '');
  if (sRemaining.includes('<') || sRemaining.includes('>')) throw new Error(`${sName}: neplatná XML syntaxe`);
  const aStack = []; let nRoots = 0;
  for (const sTag of aTags) {
    if (sTag.startsWith('<?') || sTag.startsWith('<!--') || sTag.startsWith('<![')) continue;
    const bEnd = sTag.startsWith('</');
    const sNameTag = sTag.match(/^<\/?([A-Za-z_][\w:.-]*)/)[1];
    if (bEnd) {
      if (!/^<\/[\w:.-]+\s*>$/.test(sTag) || aStack.pop() !== sNameTag) throw new Error(`${sName}: neuzavřená značka ${sNameTag}`);
    } else {
      if (!aStack.length) {nRoots++; if (sNameTag !== 'svg') throw new Error(`${sName}: kořenem není svg`);}
      if (!/\/$/.test(sTag.slice(0,-1))) aStack.push(sNameTag);
    }
  }
  if (nRoots !== 1 || aStack.length || !/<svg\s[^>]*xmlns\s*=\s*["']http:\/\/www\.w3\.org\/2000\/svg["']/.test(sXml))
    throw new Error(`${sName}: SVG není platně uzavřeno nebo chybí namespace`);
}
/** Jedinou kontrolu zabalí do konkrétní chyby; na konci se zastaví při kterémkoli FAIL. */
function fCheck(sLabel, fAction) {
  try {fAction(); process.stdout.write(`PASS: ${sLabel}\n`);}
  catch (oError) {aErrors.push(`${sLabel}: ${oError.message}`); process.stderr.write(`FAIL: ${sLabel}: ${oError.message}\n`);}
}

fCheck('ID aplikace a seznam schválených obrázků', () => {
  const sInfo = fReadFile(oRoot, 'src/appinfo/info.xml').toString('utf8');
  const sAppId = (sInfo.match(/<id>([^<]+)<\/id>/)||[])[1];
  if (oManifest.schemaVersion !== 1 || sAppId !== oManifest.appId || !Array.isArray(oManifest.runtimeAssets) || !oManifest.runtimeAssets.length || !Array.isArray(oManifest.screenshots) || !oManifest.screenshots.length)
    throw new Error('Manifest nesouhlasí s appinfo/info.xml nebo není úplný');
  const aIcon = oManifest.runtimeAssets.filter(oItem => oItem.runtime === 'img/app.svg' && oItem.source === 'src/img/app.svg');
  if (aIcon.length !== 1) throw new Error('Chybí právě jedna schválená img/app.svg');
  if (!/<icon>app\.svg<\/icon>/.test(sInfo)) throw new Error('Nextcloud navigace neodkazuje na app.svg');
});
for (const oItem of oManifest.runtimeAssets) {
  fCheck(`Schválená ikona/grafika ${oItem.source}`, () => {
    const oBytes = fValidateHash(oRoot, oItem.source, oItem.sha256);
    if (oItem.format === 'svg') fValidateSvg(oBytes, oItem.source);
    else if (oItem.format === 'png') fValidatePng(oBytes, oItem.source);
    else throw new Error('Nepodporovaný formát');
    if (oRuntime) {
      const oRuntimeBytes = fValidateHash(oRuntime, oItem.runtime, oItem.sha256);
      if (!oRuntimeBytes.equals(oBytes)) throw new Error('Sestavení změnilo grafický soubor');
    }
    if (oPublic) fValidateHash(oPublic, 'src/'+oItem.runtime, oItem.sha256);
  });
}
for (const oEntry of oManifest.screenshots) {
  fCheck(`Schválený screenshot ${oEntry.source}`, () => {
    const oBytes = fValidateHash(oRoot, oEntry.source, oEntry.sha256);
    fValidatePng(oBytes, oEntry.source, oEntry);
    if (oBytes.length > nMaxScreenshotSize) throw new Error('Překročen limit Nextcloud App Store 2 MiB');
    if (oPublic) fValidateHash(oPublic, oEntry.source, oEntry.sha256);
    if (oEntry.thumbnail) {
      const oSmall = fValidateHash(oRoot, oEntry.thumbnail.source, oEntry.thumbnail.sha256);
      fValidatePng(oSmall, oEntry.thumbnail.source, oEntry.thumbnail);
      if (oSmall.length > nMaxScreenshotSize) throw new Error('Malý náhled je příliš velký');
      if (oPublic) fValidateHash(oPublic, oEntry.thumbnail.source, oEntry.thumbnail.sha256);
    }
  });
}
fCheck('Screenshot metadata v info.xml a runtime TAR vstupu', () => {
  const oInfoBytes = fReadFile(oRoot, 'src/appinfo/info.xml');
  const sInfo = oInfoBytes.toString('utf8');
  const aFound = [...sInfo.matchAll(/<screenshot(?:\s+small-thumbnail="([^"]+)")?\s*>([^<]+)<\/screenshot>/g)];
  if (aFound.length !== oManifest.screenshots.length) throw new Error(`Nesouhlasí počet screenshotů: ${aFound.length}`);
  aFound.forEach((aMatch, nIndex) => {
    const oEntry = oManifest.screenshots[nIndex];
    const sUrl = aMatch[2].trim();
    const sSmall = aMatch[1] || null;
    if (!sUrl.startsWith('https://') || sUrl !== oEntry.url) throw new Error(`Neplatná URL screenshotu #${nIndex+1}: ${sUrl}`);
    if (sSmall !== (oEntry.thumbnail ? oEntry.thumbnail.url : null)) throw new Error(`Neplatný malý náhled #${nIndex+1}`);
    // Vždy svázat URL s OVĚŘENOU relativní cestou souboru, ne jen s editovatelným manifestem.
    // Tím nelze skrýt chybnou GitHub cestu současnou změnou XML a JSON manifestu.
    const sBaseUrl = 'https://raw.githubusercontent.com/hacesoft/FamilyTree/main/';
    if (sUrl !== sBaseUrl + oEntry.source) throw new Error(`URL screenshotu #${nIndex+1} neodpovídá cestě souboru`);
    if (oEntry.thumbnail && sSmall !== sBaseUrl + oEntry.thumbnail.source)
      throw new Error(`URL malého náhledu #${nIndex+1} neodpovídá cestě souboru`);
    for (const sValue of [sUrl, sSmall].filter(Boolean)) {
      const oUrl = new URL(sValue);
      if (oUrl.hostname !== 'raw.githubusercontent.com' || oUrl.pathname.includes('/../')) throw new Error('Neočekávaný externí hostitel nebo cesta');
    }
  });
  if (oRuntime && !fReadFile(oRuntime, 'appinfo/info.xml').equals(oInfoBytes)) throw new Error('Runtime neobsahuje stejná metadata jako zdroj');
  if (oPublic && !fReadFile(oPublic, 'src/appinfo/info.xml').equals(oInfoBytes)) throw new Error('Veřejný zdroj neobsahuje stejná metadata');
});
fCheck('Hlavní schválený screenshot v obou README', () => {
  // README ukazuje skutečný strom, zatímco první obrázek App Storu je schválené logo.
  const sExpected = oManifest.readmeMainScreenshot;
  if (!oManifest.screenshots.some(oItem => oItem.source === sExpected))
    throw new Error('Hlavní README screenshot není součástí schválené galerie');
  for (const sReadme of ['README.md','README_CZ.md']) {
    const sText = fReadFile(oRoot, sReadme).toString('utf8');
    if (!sText.includes(`](${sExpected})`)) throw new Error(`${sReadme} neodkazuje na hlavní obrázek`);
    if (oPublic && !fReadFile(oPublic, sReadme).equals(Buffer.from(sText))) throw new Error(`Veřejné ${sReadme} se liší`);
  }
});
if (aErrors.length) {process.stderr.write(`BLOCKING: Grafické podklady HDS/CP21: ${aErrors.length} chyb. Vydání zastaveno.\n`); process.exit(1);}
process.stdout.write('PASS: Lokální grafické podklady, schválené hashe, metadata a výstupy jsou ověřené.\n');
process.stdout.write('PENDING: Veřejné HTTPS URL a zobrazení v App Storu ověřit po zveřejnění na GitHubu.\n');
