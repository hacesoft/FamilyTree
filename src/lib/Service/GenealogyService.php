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
namespace OCA\HcFamilyTree\Service;
use OCP\AppFramework\Http\DataResponse; use OCP\AppFramework\Http\JSONResponse; use OCP\AppFramework\Http\Response; use OCP\IDBConnection; use OCP\IGroupManager; use OCP\IL10N; use OCP\IRequest; use OCP\IUserManager; use OCP\IUserSession;
class GenealogyService {
 private string $sUid;
 /**
 * @brief Inicializuje instanci a propojí předané závislosti.
 * @param IRequest $oRequest Objekt HTTP požadavku.
 * @param IDBConnection $oDb Databázové připojení.
 * @param IUserSession $oUs Vstupní parametr „us“ pro operaci __construct.
 * @param IGroupManager $oGroups Správce uživatelských skupin Nextcloudu.
 * @param IUserManager $oUsers Správce uživatelských účtů Nextcloudu.
 * @param IL10N $oL10n Překladová služba Nextcloudu.
 * @param ResearchImportService $oResearch Vstupní parametr „research“ pro operaci __construct.
 * @param NativeArchiveService $oNative Vstupní parametr „native“ pro operaci __construct.
 * @param ResearchJournalService $oJournal Služba výzkumného deníku.
 * @param FamilyTreeStatisticsService $oStatistics Vstupní parametr „statistics“ pro operaci __construct.
 * @param ResearchJournalImportService $oJournalImport Vstupní parametr „journalImport“ pro operaci __construct.
 * @return void Konstruktor nevrací návratovou hodnotu.
 */
public function __construct(private IRequest $oRequest,private IDBConnection $oDb,IUserSession $oUs,private IGroupManager $oGroups,private IUserManager $oUsers,private IL10N $oL10n,private ResearchImportService $oResearch,private NativeArchiveService $oNative,private ResearchJournalService $oJournal,private FamilyTreeStatisticsService $oStatistics,private ResearchJournalImportService $oJournalImport){$this->sUid=$oUs->getUser()?->getUID()??'';}
 /**
 * @brief Načte seznam databázových záznamů odpovídajících sloupcovým podmínkám.
 * @param string $sTable Název databázové tabulky.
 * @param array $aWhere Vstupní parametr „where“ pro operaci rows.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
 private function rows(string $sTable,array $aWhere=[]):array{$oQ=$this->oDb->getQueryBuilder();$oQ->select('*')->from($sTable);foreach($aWhere as $nK=>$oV)$oQ->andWhere($oQ->expr()->eq($nK,$oQ->createNamedParameter($oV)));return $oQ->executeQuery()->fetchAllAssociative();}
 /**
 * @brief Vyhledá jeden záznam podle číselného ID a vrátí null, pokud neexistuje.
 * @param string $sTable Název databázové tabulky.
 * @param int $nId Identifikátor cílového záznamu.
 * @return ?array Strukturované výsledky operace; u volitelného návratu může být null.
 */
 private function row(string $sTable,int $nId):?array{$oR=$this->rows($sTable,['id'=>$nId]);return $oR[0]??null;}
 /**
 * @brief Ověří, zda má aktuální uživatel potřebné oprávnění ke stromu.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @param bool $bEdit Příznak, zda je pro operaci vyžadováno oprávnění zápisu.
 * @return bool True při splnění podmínky, jinak false.
 */
 private function can(int $nTreeId,bool $bEdit=false):bool{$oTree=$this->row('hc_familytree_trees',$nTreeId);if(!$oTree)return false;if($oTree['owner_uid']===$this->sUid)return true;$sUser=$this->oUsers->get($this->sUid);foreach($this->rows('hc_familytree_shares',['tree_id'=>$nTreeId]) as $oS){$bMatch=$oS['share_type']==='user'&&$oS['share_with']===$this->sUid;if($oS['share_type']==='group'&&$sUser){$oG=$this->oGroups->get($oS['share_with']);$bMatch=$oG?->inGroup($sUser)??false;}if($bMatch&&(!$bEdit||$oS['permission']==='edit'))return true;}return false;}
 /**
 * @brief Vloží záznam s trvalým ID a do append-only historie zaznamená vytvoření.
 * @param string $sTable Název databázové tabulky.
 * @param array $aData Zpracovávaná data.
 * @return int Vypočtená číselná hodnota nebo identifikátor dle významu operace.
 */
 private function insert(string $sTable,array $aData):int{
  if($sTable!=='hc_familytree_history' && !isset($aData['stable_id']))$aData['stable_id']=ResearchJournalService::uid();
  $oQ=$this->oDb->getQueryBuilder();$oQ->insert($sTable);foreach($aData as $nK=>$oV)$oQ->setValue($nK,$oQ->createNamedParameter($oV));$oQ->executeStatement();
  $nId=(int)$this->oDb->lastInsertId($sTable);
  $oRow=$this->row($sTable,$nId);
  if($oRow && isset($oRow['tree_id']) && $sTable!=='hc_familytree_history')$this->oJournal->audit((int)$oRow['tree_id'],$sTable,(string)$oRow['stable_id'],'create',$this->sUid,null,$oRow);
  if($oRow && $sTable==='hc_familytree_trees')$this->oJournal->audit($nId,$sTable,(string)$oRow['stable_id'],'create',$this->sUid,null,$oRow);
  return $nId;
 }
 /**
 * @brief Aktualizuje záznam a při skutečné změně přidá auditní záznam předchozího i nového stavu.
 * @param string $sTable Název databázové tabulky.
 * @param int $nId Identifikátor cílového záznamu.
 * @param array $aData Zpracovávaná data.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
 private function update(string $sTable,int $nId,array $aData):void{
  $oBefore=$this->row($sTable,$nId);
  $oQ=$this->oDb->getQueryBuilder();$oQ->update($sTable);foreach($aData as $nK=>$oV)$oQ->set($nK,$oQ->createNamedParameter($oV));$oQ->where($oQ->expr()->eq('id',$oQ->createNamedParameter($nId)));$oQ->executeStatement();
  $oAfter=$this->row($sTable,$nId);
  if($oBefore&&$oAfter&&$oBefore!=$oAfter)$this->oJournal->audit((int)($oAfter['tree_id']??$nId),$sTable,(string)($oBefore['stable_id']??''),'update',$this->sUid,$oBefore,$oAfter,(string)$this->oRequest->getParam('change_reason',''));
 }
 /**
 * @brief Odstraní určený záznam a uloží auditní událost mazání.
 * @param string $sTable Název databázové tabulky.
 * @param int $nId Identifikátor cílového záznamu.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
 private function delete(string $sTable,int $nId):void{
  $oBefore=$this->row($sTable,$nId);
  $oQ=$this->oDb->getQueryBuilder();$oQ->delete($sTable)->where($oQ->expr()->eq('id',$oQ->createNamedParameter($nId)))->executeStatement();
  if($oBefore && $sTable!=='hc_familytree_history')$this->oJournal->audit((int)($oBefore['tree_id']??$nId),$sTable,(string)($oBefore['stable_id']??''),'delete',$this->sUid,$oBefore,null,(string)$this->oRequest->getParam('change_reason',''));
 }
 /**
 * @brief Načte parametry aktuálního HTTP požadavku.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
 private function body():array{return $this->oRequest->getParams();}
 /**
 * @brief Vrátí odpověď se zamítnutím přístupu bez zpřístupnění cizích dat.
 * @return JSONResponse HTTP odpověď s výsledkem ve formátu JSON.
 */
 private function deny():JSONResponse{return new JSONResponse(['error'=>$this->oL10n->t('Access denied.')],403);}
  /**
 * @brief Spočítá statistiky osob, vazeb a záznamů pro vybraný rodokmen.
 * @param int $nTreeId Jednoznačný identifikátor rodokmenu, k němuž se vztahuje operace.
 * @return DataResponse HTTP odpověď Nextcloudu s daty nebo oznámením chyby.
 */
  public function treeStatistics(int $nTreeId):DataResponse{
   if(!$this->can($nTreeId))return $this->deny();
   $oTree=$this->row('hc_familytree_trees',$nTreeId);
   return new DataResponse($this->oStatistics->report([$nTreeId],'tree',(string)$oTree['name']));
  }
  /**
 * @brief Připraví agregované statistiky rodokmenů vlastněných přihlášeným uživatelem.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
  public function ownedStatistics():DataResponse{
   if($this->sUid==='')return $this->deny();
   $aIds=array_map(static /**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param mixed $oTree Vstupní hodnota $oTree použitá v callbacku.
 * @return mixed Výsledek callbacku pro volající operaci.
 */
fn($oTree)=>(int)$oTree['id'],$this->rows('hc_familytree_trees',['owner_uid'=>$this->sUid]));
   return new DataResponse($this->oStatistics->report($aIds,'owned','All my family trees'));
  }
  /**
 * @brief Vrátí souhrnná data pro přehledový widget FamilyTree.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
  public function dashboard():DataResponse{$aTrees=$this->rows('hc_familytree_trees',['owner_uid'=>$this->sUid]);$aPeople=0;$oRecent=[];foreach($aTrees as $oT){$oPs=$this->rows('hc_familytree_people',['tree_id'=>$oT['id']]);$aPeople+=count($oPs);foreach($oPs as $oP)$oRecent[]=$oP;}usort($oRecent,/**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param mixed $nA Vstupní hodnota $nA použitá v callbacku.
 * @param mixed $aB Vstupní hodnota $aB použitá v callbacku.
 * @return mixed Výsledek callbacku pro volající operaci.
 */
fn($nA,$aB)=>(int)$aB['updated_at']<=>(int)$nA['updated_at']);return new DataResponse(['trees'=>count($aTrees),'people'=>$aPeople,'recent'=>array_slice(array_map(/**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param mixed $oP Vstupní hodnota $oP použitá v callbacku.
 * @return mixed Výsledek callbacku pro volající operaci.
 */
fn($oP)=>['id'=>$oP['id'],'name'=>trim($oP['given_name'].' '.$oP['surname']),'birthDate'=>$oP['birth_date']],$oRecent),0,3)]);}
  /**
 * @brief Vrátí rodokmeny přístupné aktuálnímu uživateli podle oprávnění.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
  public function trees():DataResponse{$bVisible=[];foreach($this->rows('hc_familytree_trees') as $oTree){$nTreeId=(int)$oTree['id'];if(!$this->can($nTreeId))continue;$oTree['canEdit']=$this->can($nTreeId,true);$oTree['isOwner']=$oTree['owner_uid']===$this->sUid;$oTree['people_count']=count($this->rows('hc_familytree_people',['tree_id'=>$nTreeId]));$bVisible[]=$oTree;}usort($bVisible,/**
 * @brief Zpracuje anonymní callback při importu, kontrole nebo převodu dat FamilyTree; vstupní data nepřepisuje bez volající operace.
 * @param mixed $nA Vstupní hodnota $nA použitá v callbacku.
 * @param mixed $aB Vstupní hodnota $aB použitá v callbacku.
 * @return mixed Výsledek callbacku pro volající operaci.
 */
fn($nA,$aB)=>(int)$aB['updated_at']<=>(int)$nA['updated_at']);return new DataResponse($bVisible);}
  /**
 * @brief Vytvoří tree pro oprávněně přístupný rodokmen.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
  public function createTree():DataResponse{$aB=$this->body();$sName=trim((string)($aB['name']??''));if($sName==='')return new JSONResponse(['error'=>$this->oL10n->t('A name is required.')],400);$nNow=time();$nId=$this->insert('hc_familytree_trees',['owner_uid'=>$this->sUid,'name'=>$sName,'description'=>(string)($aB['description']??''),'root_person_id'=>null,'created_at'=>$nNow,'updated_at'=>$nNow]);return new DataResponse($this->row('hc_familytree_trees',$nId));}
  /**
 * @brief Načte vybraný rodokmen a jeho záznamy se zohledněním přístupových práv.
 * @param int $nId Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
  public function tree(int $nId):DataResponse{
   if(!$this->can($nId))return $this->deny();
   $oTree=$this->row('hc_familytree_trees',$nId);
   $oResearch=$this->oResearch->records($nId);
   $aRelations=$this->oResearch->visibleRelations($this->rows('hc_familytree_relations',['tree_id'=>$nId]),$oResearch);
   return new DataResponse(['tree'=>$oTree,'people'=>$this->rows('hc_familytree_people',['tree_id'=>$nId]),
    'relationships'=>$aRelations,'events'=>$this->rows('hc_familytree_events',['tree_id'=>$nId]),
    'documents'=>$this->rows('hc_familytree_documents',['tree_id'=>$nId]),
    'documentLinks'=>$this->rows('hc_familytree_doc_links',['tree_id'=>$nId]),'research'=>$oResearch,
    'shares'=>$oTree['owner_uid']===$this->sUid?$this->rows('hc_familytree_shares',['tree_id'=>$nId]):[],
    'canEdit'=>$this->can($nId,true),'isOwner'=>$oTree['owner_uid']===$this->sUid]);
  }

  /**
 * @brief Aktualizuje tree pro oprávněně přístupný rodokmen.
 * @param int $nId Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
  public function updateTree(int $nId):DataResponse{if(!$this->can($nId,true))return $this->deny();$aB=$this->body();$oD=['updated_at'=>time()];foreach(['name','description','root_person_id'] as $nK)if(array_key_exists($nK,$aB))$oD[$nK]=$aB[$nK];$this->update('hc_familytree_trees',$nId,$oD);return new DataResponse($this->row('hc_familytree_trees',$nId));}
  /**
 * @brief Odstraní tree pro oprávněně přístupný rodokmen.
 * @param int $nId Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
  public function deleteTree(int $nId):DataResponse{$oT=$this->row('hc_familytree_trees',$nId);if(!$oT||$oT['owner_uid']!==$this->sUid)return $this->deny();foreach(['hc_familytree_proposals','hc_familytree_evidence','hc_familytree_search_log','hc_familytree_research_tasks','hc_familytree_history','hc_familytree_research','hc_familytree_doc_links','hc_familytree_relations','hc_familytree_events','hc_familytree_documents','hc_familytree_shares','hc_familytree_people'] as $sTable){$oQ=$this->oDb->getQueryBuilder();$oQ->delete($sTable)->where($oQ->expr()->eq('tree_id',$oQ->createNamedParameter($nId)))->executeStatement();}{ $oQ=$this->oDb->getQueryBuilder();$oQ->delete('hc_familytree_trees')->where($oQ->expr()->eq('id',$oQ->createNamedParameter($nId)))->executeStatement(); }return new DataResponse(['ok'=>true]);}
  /**
 * @brief Odstraní all trees pro oprávněně přístupný rodokmen.
 * @return DataResponse HTTP odpověď Nextcloudu s daty nebo oznámením chyby.
 */
  public function deleteAllTrees():DataResponse{
    if($this->sUid==='')return $this->deny();
    $aIds=[];foreach($this->rows('hc_familytree_trees',['owner_uid'=>$this->sUid]) as $oTree)$aIds[]=(int)$oTree['id'];
    $this->oDb->beginTransaction();
    try{foreach($aIds as $nId){$oResult=$this->deleteTree($nId);if($oResult->getStatus()!==200)throw new \RuntimeException('One of the family trees could not be deleted.');}$this->oDb->commit();}
    catch(\Throwable $oError){$this->oDb->rollBack();throw $oError;}
    return new DataResponse(['ok'=>true,'count'=>count($aIds)]);
  }
  /**
 * @brief Připraví náhled research new výzkumného deníku se zachováním původních tvrzení a auditní historie.
 * @return Response HTTP odpověď Nextcloudu s daty nebo oznámením chyby.
 */
  public function previewResearchNew():Response{
   if($this->sUid==='')return $this->deny();
   if((string)$this->oRequest->getParam('mode','new')!=='new')return new JSONResponse(['error'=>'Creating a new family tree requires new mode.'],400);
   try{return new DataResponse($this->oResearch->preview(0));}
   catch(\InvalidArgumentException $oError){return new JSONResponse(['error'=>$oError->getMessage()],400);}
  }
  /**
 * @brief Připraví náhled research výzkumného deníku se zachováním původních tvrzení a auditní historie.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @return Response HTTP odpověď předaná klientovi.
 */
  public function previewResearch(int $nTreeId):Response{if(!$this->can($nTreeId,true))return $this->deny();try{return new DataResponse($this->oResearch->preview($nTreeId));}catch(\InvalidArgumentException $oE){return new JSONResponse(['error'=>$oE->getMessage()],400);}}
  /**
 * @brief Exportuje gedcom pro přenos genealogických dat GEDCOM 7.
 * @param int $nTreeId Jednoznačný identifikátor rodokmenu, k němuž se vztahuje operace.
 * @return Response HTTP odpověď Nextcloudu s daty nebo oznámením chyby.
 */
  public function exportGedcom(int $nTreeId):Response{
   if(!$this->can($nTreeId))return $this->deny();
   $oResearch=$this->oResearch->records($nTreeId);
   $aRelations=$this->oResearch->visibleRelations($this->rows('hc_familytree_relations',['tree_id'=>$nTreeId]),$oResearch);
   try{
    $aData=Gedcom7Exporter::render(
     $this->rows('hc_familytree_people',['tree_id'=>$nTreeId]),
     $aRelations,
     $this->rows('hc_familytree_events',['tree_id'=>$nTreeId])
    );
   }catch(\InvalidArgumentException $oError){return new JSONResponse(['error'=>$oError->getMessage()],422);}
   return new \OCP\AppFramework\Http\DataDisplayResponse($aData,200,[
    'Content-Type'=>'text/plain; charset=utf-8',
    'Content-Disposition'=>'attachment; filename="hc_familytree-'.$nTreeId.'.ged"',
    'X-Content-Type-Options'=>'nosniff','Cache-Control'=>'private, no-store',
   ]);
  }
  /**
 * @brief Exportuje native nativního archivu FamilyTree se zachováním identifikátorů a kontrol integrity.
 * @return Response HTTP odpověď Nextcloudu s daty nebo oznámením chyby.
 */
  public function exportNative():Response{
   if($this->sUid==='')return $this->deny();
   $sRaw=$this->oRequest->getParam('treeId',null);
   if($sRaw!==null && (!ctype_digit((string)$sRaw) || (int)$sRaw<1))return new JSONResponse(['error'=>'Invalid family tree.'],400);
   try{$oResult=$this->oNative->export($this->sUid,$sRaw===null?null:(int)$sRaw);}
   catch(\InvalidArgumentException $oError){return new JSONResponse(['error'=>$oError->getMessage()],422);}
   return new \OCP\AppFramework\Http\DataDisplayResponse($oResult['archive'],200,[
    'Content-Type'=>'application/zip','Content-Disposition'=>'attachment; filename="'.$oResult['filename'].'"',
    'X-Content-Type-Options'=>'nosniff','Cache-Control'=>'private, no-store'
   ]);
  }
  /**
 * @brief Připraví náhled native nativního archivu FamilyTree se zachováním identifikátorů a kontrol integrity.
 * @return Response HTTP odpověď předaná klientovi.
 */
  public function previewNative():Response{
   if($this->sUid==='')return $this->deny();
   try{return new DataResponse($this->oNative->preview());}
   catch(\InvalidArgumentException|\JsonException $oError){return new JSONResponse(['error'=>$oError->getMessage()],422);}
  }
  /**
 * @brief Importuje native nativního archivu FamilyTree se zachováním identifikátorů a kontrol integrity.
 * @return Response HTTP odpověď předaná klientovi.
 */
  public function importNative():Response{
   if($this->sUid==='')return $this->deny();
   try{return new DataResponse($this->oNative->restore($this->sUid,(string)$this->oRequest->getParam('restore_shares','0')==='1'));}
   catch(\InvalidArgumentException|\JsonException $oError){return new JSONResponse(['error'=>$oError->getMessage()],422);}
  }
  /**
 * @brief Importuje research výzkumného deníku se zachováním původních tvrzení a auditní historie.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @return Response HTTP odpověď předaná klientovi.
 */
  public function importResearch(int $nTreeId):Response{
   if(!$this->can($nTreeId,true))return $this->deny();
   $aTables=['hc_familytree_people','hc_familytree_relations','hc_familytree_events','hc_familytree_research'];$oPrevious=[];
   foreach($aTables as $sTable)foreach($this->rows($sTable,['tree_id'=>$nTreeId]) as $oRow)$oPrevious[$sTable][(int)$oRow['id']]=$oRow;
   try{$oResult=$this->oResearch->import($nTreeId,(string)$this->row('hc_familytree_trees',$nTreeId)['owner_uid']);
    foreach($aTables as $sTable)foreach($this->rows($sTable,['tree_id'=>$nTreeId]) as $oRow){
     $oBefore=$oPrevious[$sTable][(int)$oRow['id']]??null;
     if($oBefore===$oRow)continue;
     $this->oJournal->audit($nTreeId,$sTable,(string)($oRow['stable_id']??''),$oBefore===null?'create':'update',$this->sUid,$oBefore,$oRow,'GEDCOM import');
    }
    $this->oJournal->audit($nTreeId,'gedcom_import',ResearchJournalService::uid(),'import',$this->sUid,null,['summary'=>$oResult]);
    return new DataResponse($oResult);
   }catch(\InvalidArgumentException $oE){return new JSONResponse(['error'=>$oE->getMessage()],400);}
  }
  /**
 * @brief Zprostředkuje chráněné načtení média přiřazeného k výzkumnému záznamu.
 * @param int $nId Identifikátor cílového záznamu.
 * @return Response HTTP odpověď předaná klientovi.
 */
  public function researchMedia(int $nId):Response{$oR=$this->row('hc_familytree_research',$nId);if(!$oR||!$this->can((int)$oR['tree_id']))return $this->deny();$oTree=$this->row('hc_familytree_trees',(int)$oR['tree_id']);return $this->oResearch->displayMedia($oR,(string)$oTree['owner_uid']);}
 /**
 * @brief Získá výzkumný deník a související úkoly, hledání a důkazy rodokmenu.
 * @param int $nTreeId Jednoznačný identifikátor rodokmenu, k němuž se vztahuje operace.
 * @return DataResponse HTTP odpověď Nextcloudu s daty nebo oznámením chyby.
 */
 public function journal(int $nTreeId):DataResponse{if(!$this->can($nTreeId))return $this->deny();return new DataResponse($this->oJournal->journal($nTreeId));}
 /**
 * @brief Exportuje journal výzkumného deníku se zachováním původních tvrzení a auditní historie.
 * @param int $nTreeId Jednoznačný identifikátor rodokmenu, k němuž se vztahuje operace.
 * @return Response HTTP odpověď Nextcloudu s daty nebo oznámením chyby.
 */
 public function exportJournal(int $nTreeId):Response {
  if(!$this->can($nTreeId))return $this->deny();
  $oTree=$this->row('hc_familytree_trees',$nTreeId);
  try{
   $oDocument=ResearchJournalInterchange::export(
    (string)$oTree['stable_id'],
    $this->oJournal->rows('hc_familytree_research_tasks',$nTreeId),
    $this->oJournal->rows('hc_familytree_search_log',$nTreeId),
    $this->oJournal->rows('hc_familytree_evidence',$nTreeId)
   );
   $sJson=json_encode($oDocument,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
   return new \OCP\AppFramework\Http\DataDisplayResponse($sJson,200,[
    'Content-Type'=>'application/json; charset=utf-8',
    'Content-Disposition'=>'attachment; filename="hc-familytree-journal-'.$nTreeId.'-'.gmdate('Ymd-His').'.json"',
    'Cache-Control'=>'private, no-store','X-Content-Type-Options'=>'nosniff'
   ]);
  }catch(\InvalidArgumentException|\JsonException $oError){return new JSONResponse(['error'=>$oError->getMessage()],422);}
 }
 /**
 * @brief Importuje journal preview výzkumného deníku se zachováním původních tvrzení a auditní historie.
 * @param int $nTreeId Jednoznačný identifikátor rodokmenu, k němuž se vztahuje operace.
 * @return Response HTTP odpověď Nextcloudu s daty nebo oznámením chyby.
 */
 public function importJournalPreview(int $nTreeId):Response {
  if(!$this->can($nTreeId,true))return $this->deny();
  $oDocument=$this->oRequest->getParam('document',null);
  if(!is_array($oDocument))return new JSONResponse(['error'=>'Valid journal JSON is missing.'],400);
  try{
   $oReport=$this->oJournalImport->inspect($nTreeId,$oDocument);
   unset($oReport['items']);
   $oReport['sha256']=hash('sha256',ResearchJournalService::json($oDocument));
   return new DataResponse($oReport);
  }catch(\InvalidArgumentException $oError){return new JSONResponse(['error'=>$oError->getMessage()],400);}
 }
 /**
 * @brief Importuje journal apply výzkumného deníku se zachováním původních tvrzení a auditní historie.
 * @param int $nTreeId Jednoznačný identifikátor rodokmenu, k němuž se vztahuje operace.
 * @return Response HTTP odpověď Nextcloudu s daty nebo oznámením chyby.
 */
 public function importJournalApply(int $nTreeId):Response {
  if(!$this->can($nTreeId,true))return $this->deny();
  $oDocument=$this->oRequest->getParam('document',null);
  $sSha=(string)$this->oRequest->getParam('preview_sha256','');
  if(!is_array($oDocument)||!preg_match('/^[0-9a-f]{64}$/D',$sSha)||!hash_equals(hash('sha256',ResearchJournalService::json($oDocument)),$sSha))
   return new JSONResponse(['error'=>'File was not validated or has changed since preview.'],409);
  try{return new DataResponse($this->oJournalImport->apply($nTreeId,$oDocument,$this->sUid));}
  catch(\InvalidArgumentException $oError){return new JSONResponse(['error'=>$oError->getMessage()],400);}
 }

 /**
 * @brief Vytvoří textovou reprezentaci výzkumného deníku pro zobrazení nebo export.
 * @param array $aBody Vstupní parametr „body“ pro operaci journalText.
 * @param string $sKey Vstupní parametr „key“ pro operaci journalText.
 * @param int $nMax Vstupní parametr „max“ pro operaci journalText.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
 private function journalText(array $aBody,string $sKey,int $nMax=2000):string{return mb_substr(trim((string)($aBody[$sKey]??'')),0,$nMax);}
 /**
 * @brief Prověří, zda adresa použitá ve výzkumném deníku splňuje pravidla bezpečného odkazu.
 * @param string $sUrl Vstupní parametr „url“ pro operaci validJournalUrl.
 * @return bool True při splnění podmínky, jinak false.
 */
 private function validJournalUrl(string $sUrl):bool{return $sUrl===''||(strlen($sUrl)<=1024&&filter_var($sUrl,FILTER_VALIDATE_URL)!==false&&in_array(strtolower(parse_url($sUrl,PHP_URL_SCHEME)??''),['https','http'],true));}
 /**
 * @brief Vytvoří journal task výzkumného deníku se zachováním původních tvrzení a auditní historie.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
 public function createJournalTask(int $nTreeId):DataResponse{
  if(!$this->can($nTreeId,true))return $this->deny();$aB=$this->body();$sTitle=$this->journalText($aB,'title',255);
  if($sTitle==='')return new JSONResponse(['error'=>'Research task title is required.'],400);
  $sStatus=(string)($aB['status']??'planned');if(!in_array($sStatus,['planned','in_progress','waiting_verify','done','rejected'],true))return new JSONResponse(['error'=>'Invalid task status.'],400);
  $oPriority=(string)($aB['priority']??'normal');if(!in_array($oPriority,['low','normal','high'],true))return new JSONResponse(['error'=>'Invalid priority.'],400);
  $nNow=time();$sUid=ResearchJournalService::uid();$nId=$this->oJournal->insert('hc_familytree_research_tasks',[
   'tree_id'=>$nTreeId,'stable_id'=>$sUid,'title'=>$sTitle,'status'=>$sStatus,'priority'=>$oPriority,
   'hypothesis'=>$this->journalText($aB,'hypothesis',12000),'next_action'=>$this->journalText($aB,'next_action',12000),
   'person_refs_json'=>'[]','created_by'=>$this->sUid,'updated_by'=>$this->sUid,'created_at'=>$nNow,'updated_at'=>$nNow]);
  $oRow=$this->oJournal->row('hc_familytree_research_tasks',$nId);$this->oJournal->audit($nTreeId,'research_task',$sUid,'create',$this->sUid,null,$oRow);return new DataResponse($oRow);
 }
 /**
 * @brief Aktualizuje journal task výzkumného deníku se zachováním původních tvrzení a auditní historie.
 * @param int $nId Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
 public function updateJournalTask(int $nId):DataResponse{
  $oOld=$this->oJournal->row('hc_familytree_research_tasks',$nId);if(!$oOld||!$this->can((int)$oOld['tree_id'],true))return $this->deny();$aB=$this->body();
  $aFields=[];foreach(['title','hypothesis','next_action'] as $oF)if(array_key_exists($oF,$aB))$aFields[$oF]=$this->journalText($aB,$oF,$oF==='title'?255:12000);
  if(isset($aFields['title'])&&$aFields['title']==='')return new JSONResponse(['error'=>'Empty task title.'],400);
  foreach(['status'=>['planned','in_progress','waiting_verify','done','rejected'],'priority'=>['low','normal','high']] as $oF=>$bAllowed)if(array_key_exists($oF,$aB)){if(!in_array($aB[$oF],$bAllowed,true))return new JSONResponse(['error'=>'Invalid value: '.$oF],400);$aFields[$oF]=$aB[$oF];}
  $aFields['updated_by']=$this->sUid;$aFields['updated_at']=time();$this->oJournal->update('hc_familytree_research_tasks',$nId,$aFields);
  $oRow=$this->oJournal->row('hc_familytree_research_tasks',$nId);$this->oJournal->audit((int)$oOld['tree_id'],'research_task',(string)$oOld['stable_id'],'update',$this->sUid,$oOld,$oRow);return new DataResponse($oRow);
 }
 /**
 * @brief Přidá search log používané v GenealogyService.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
 public function addSearchLog(int $nTreeId):DataResponse{
  if(!$this->can($nTreeId,true))return $this->deny();$aB=$this->body();$oQuery=$this->journalText($aB,'query_text',16000);
  if($oQuery==='')return new JSONResponse(['error'=>'Search description is required.'],400);
  $oOutcome=(string)($aB['outcome']??'unverified');if(!in_array($oOutcome,['unverified','no_result','candidate','found','rejected'],true))return new JSONResponse(['error'=>'Invalid search outcome.'],400);
  $sUrl=$this->journalText($aB,'source_url',1024);if(!$this->validJournalUrl($sUrl))return new JSONResponse(['error'=>'Invalid source URL.'],400);
  $sTaskUid=$this->journalText($aB,'task_uid',64);
  if($sTaskUid!==''&&!$this->journalUidExists('hc_familytree_research_tasks',$nTreeId,$sTaskUid))return new JSONResponse(['error'=>'Task does not belong to this family tree.'],400);
  $sUid=ResearchJournalService::uid();$nId=$this->oJournal->insert('hc_familytree_search_log',[
   'tree_id'=>$nTreeId,'stable_id'=>$sUid,'task_uid'=>$sTaskUid,'query_text'=>$oQuery,'source_url'=>$sUrl,
   'outcome'=>$oOutcome,'notes'=>$this->journalText($aB,'notes',16000),'actor_uid'=>$this->sUid,'created_at'=>time()]);
  $oRow=$this->oJournal->row('hc_familytree_search_log',$nId);$this->oJournal->audit($nTreeId,'search_log',$sUid,'create',$this->sUid,null,$oRow);return new DataResponse($oRow);
 }
 /**
 * @brief Zjistí, zda identifikátor položky výzkumného deníku již existuje.
 * @param string $sTable Název databázové tabulky.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @param string $sUid Stabilní identifikátor uživatele nebo záznamu.
 * @return bool True při splnění podmínky, jinak false.
 */
 private function journalUidExists(string $sTable,int $nTreeId,string $sUid):bool{
  foreach($this->oJournal->rows($sTable,$nTreeId) as $oR)if(($oR['stable_id']??'')===$sUid)return true;return false;
 }
 /**
 * @brief Přidá evidence používané v GenealogyService.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
 public function addEvidence(int $nTreeId):DataResponse{
  if(!$this->can($nTreeId,true))return $this->deny();$aB=$this->body();$sStatus=(string)($aB['status']??'candidate');
  if(!in_array($sStatus,['candidate','transcribed','verified','rejected'],true))return new JSONResponse(['error'=>'Invalid evidence status.'],400);
  $sUrl=$this->journalText($aB,'source_url',1024);if(!$this->validJournalUrl($sUrl))return new JSONResponse(['error'=>'Invalid archive URL.'],400);
  $sTaskUid=$this->journalText($aB,'task_uid',64);if($sTaskUid!==''&&!$this->journalUidExists('hc_familytree_research_tasks',$nTreeId,$sTaskUid))return new JSONResponse(['error'=>'Task is not in this family tree.'],400);
  $sUid=ResearchJournalService::uid();$nId=$this->oJournal->insert('hc_familytree_evidence',[
   'tree_id'=>$nTreeId,'stable_id'=>$sUid,'task_uid'=>$sTaskUid,'status'=>$sStatus,
   'archive'=>$this->journalText($aB,'archive',255),'signature'=>$this->journalText($aB,'signature',128),
   'source_url'=>$sUrl,'image_number'=>$this->journalText($aB,'image_number',64),
   'transcription'=>$this->journalText($aB,'transcription',20000),'notes'=>$this->journalText($aB,'notes',16000),
   'confidence_label'=>$this->journalText($aB,'confidence_label',32),'metadata_json'=>'{}',
   'created_by'=>$this->sUid,'created_at'=>time(),'updated_at'=>time()]);
  $oRow=$this->oJournal->row('hc_familytree_evidence',$nId);$this->oJournal->audit($nTreeId,'evidence',$sUid,'create',$this->sUid,null,$oRow);return new DataResponse($oRow);
 }
 /**
 * @brief Přidá proposal používané v GenealogyService.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
 public function addProposal(int $nTreeId):DataResponse{
  if(!$this->can($nTreeId,true))return $this->deny();$aB=$this->body();
  if(($aB['target_type']??'')!=='person')return new JSONResponse(['error'=>'Only person-detail changes can be proposed at present.'],400);
  $sUid=$this->journalText($aB,'target_uid',64);$oPerson=null;
  foreach($this->rows('hc_familytree_people',['tree_id'=>$nTreeId]) as $oRow)if((string)$oRow['stable_id']===$sUid){$oPerson=$oRow;break;}
  if(!$oPerson)return new JSONResponse(['error'=>'Target person does not exist.'],400);
  $sField=(string)($aB['field']??'');$bAllowed=['given_name','surname','birth_surname','birth_date','death_date','birth_place','death_place','occupation','notes'];
  if(!in_array($sField,$bAllowed,true))return new JSONResponse(['error'=>'Disallowed proposal field.'],400);
  $oAfter=$this->journalText($aB,'value',$sField==='notes'?16000:255);
  $sEvidenceUid=$this->journalText($aB,'evidence_uid',64);
  if($sEvidenceUid!==''&&!$this->journalUidExists('hc_familytree_evidence',$nTreeId,$sEvidenceUid))return new JSONResponse(['error'=>'Evidence does not belong to this family tree.'],400);
  $oChange=[$sField=>['before'=>(string)($oPerson[$sField]??''),'after'=>$oAfter]];
  $sNewUid=ResearchJournalService::uid();$nId=$this->oJournal->insert('hc_familytree_proposals',[
   'tree_id'=>$nTreeId,'stable_id'=>$sNewUid,'target_type'=>'person','target_uid'=>$sUid,
   'changes_json'=>ResearchJournalService::json($oChange),'evidence_uid'=>$sEvidenceUid,'status'=>'pending',
   'reason'=>$this->journalText($aB,'reason',3000),'created_by'=>$this->sUid,'reviewer_uid'=>'',
   'created_at'=>time(),'reviewed_at'=>0]);
  $oRow=$this->oJournal->row('hc_familytree_proposals',$nId);$this->oJournal->audit($nTreeId,'proposal',$sNewUid,'create',$this->sUid,null,$oRow);return new DataResponse($oRow);
 }
 /**
 * @brief Provede kontrolované vyhodnocení návrhu změny genealogického tvrzení.
 * @param int $nId Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
 public function reviewProposal(int $nId):DataResponse{
  $oProposal=$this->oJournal->row('hc_familytree_proposals',$nId);if(!$oProposal||!$this->can((int)$oProposal['tree_id'],true))return $this->deny();
  $oDecision=(string)$this->oRequest->getParam('decision','');if(!in_array($oDecision,['approve','postpone','reject'],true))return new JSONResponse(['error'=>'Invalid decision.'],400);
  if($oProposal['status']!=='pending')return new JSONResponse(['error'=>'Proposal has already been resolved.'],409);
  $nTreeId=(int)$oProposal['tree_id'];$aChanges=json_decode((string)$oProposal['changes_json'],true);
  $oPerson=null;foreach($this->rows('hc_familytree_people',['tree_id'=>$nTreeId]) as $oRow)if((string)$oRow['stable_id']===(string)$oProposal['target_uid']){$oPerson=$oRow;break;}
  if(!$oPerson)return new JSONResponse(['error'=>'Person no longer exists.'],409);
  $oNewData=[];
  foreach($aChanges as $sField=>$oDiff){if(!in_array($sField,['given_name','surname','birth_surname','birth_date','death_date','birth_place','death_place','occupation','notes'],true)||!is_array($oDiff)||!array_key_exists('after',$oDiff))return new JSONResponse(['error'=>'Invalid proposal.'],400);
   if((string)($oPerson[$sField]??'')!==(string)$oDiff['before'])return new JSONResponse(['error'=>'Person has changed since the proposal. Create a new proposal.'],409);
   $oNewData[$sField]=(string)$oDiff['after'];
  }
  if($oDecision==='approve'){
   $sEvidenceUid=(string)($oProposal['evidence_uid']??'');$bVerified=false;
   foreach($this->oJournal->rows('hc_familytree_evidence',$nTreeId) as $oEv)if($oEv['stable_id']===$sEvidenceUid && $oEv['status']==='verified')$bVerified=true;
   if(!$bVerified)return new JSONResponse(['error'=>'Approval requires linked verified evidence.'],422);
  }
  $this->oDb->beginTransaction();
  try{
   if($oDecision==='approve')$this->update('hc_familytree_people',(int)$oPerson['id'],$oNewData);
   $this->oJournal->update('hc_familytree_proposals',$nId,['status'=>['approve'=>'approved','postpone'=>'postponed','reject'=>'rejected'][$oDecision],'reviewer_uid'=>$this->sUid,'reviewed_at'=>time()]);
   $oAfter=$this->oJournal->row('hc_familytree_proposals',$nId);
   $this->oJournal->audit($nTreeId,'proposal',(string)$oProposal['stable_id'],'review',$this->sUid,$oProposal,$oAfter,$oDecision);
   $this->oDb->commit();
  }catch(\Throwable $oError){$this->oDb->rollBack();throw $oError;}
  return new DataResponse($oAfter);
 }
 /**
 * @brief Vrátí zpět history používané v GenealogyService.
 * @param int $nId Identifikátor konkrétního záznamu v databázi.
 * @return DataResponse HTTP odpověď Nextcloudu s daty nebo oznámením chyby.
 */
 public function revertHistory(int $nId):DataResponse{
  $oEvent=$this->oJournal->row('hc_familytree_history',$nId);if(!$oEvent||!$this->can((int)$oEvent['tree_id'],true))return $this->deny();
  if($oEvent['action']!=='update'||$oEvent['entity_type']!=='hc_familytree_people')return new JSONResponse(['error'=>'Only updates to person details can be reverted.'],422);
  $oBefore=json_decode((string)$oEvent['before_json'],true);$oAfter=json_decode((string)$oEvent['after_json'],true);
  if(!is_array($oBefore)||!is_array($oAfter))return new JSONResponse(['error'=>'History record does not contain complete values.'],422);
  $nTarget=null;foreach($this->rows('hc_familytree_people',['tree_id'=>$oEvent['tree_id']]) as $oRow)if((string)$oRow['stable_id']===(string)$oEvent['entity_uid']){$nTarget=$oRow;break;}
  if(!$nTarget)return new JSONResponse(['error'=>'Original person no longer exists.'],409);
  $aFields=['given_name','surname','birth_surname','birth_date','death_date','birth_place','death_place','occupation','notes','gender','is_living'];$aChanges=[];
  foreach($aFields as $sField)if(($oBefore[$sField]??null)!==($oAfter[$sField]??null)){
   if((string)($nTarget[$sField]??'')!==(string)($oAfter[$sField]??''))return new JSONResponse(['error'=>'Person values have changed; automatic reversal would be unsafe.'],409);
   $aChanges[$sField]=$oBefore[$sField];
  }
  if(!$aChanges)return new JSONResponse(['error'=>'Record has no reversible values.'],422);
  $this->oDb->beginTransaction();try{$this->update('hc_familytree_people',(int)$nTarget['id'],$aChanges);$this->oJournal->audit((int)$oEvent['tree_id'],'hc_familytree_people',(string)$oEvent['entity_uid'],'revert',$this->sUid,$nTarget,$this->row('hc_familytree_people',(int)$nTarget['id']),'Revert history #'.$nId);$this->oDb->commit();}catch(\Throwable $oE){$this->oDb->rollBack();throw $oE;}
  return new DataResponse(['ok'=>true]);
 }
 /**
 * @brief Načte nebo sestaví údaje osoby pro genealogické operace.
 * @param array $aB Vstupní parametr „b“ pro operaci personData.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
 private function personData(array $aB):array{$oD=[];foreach(['given_name','surname','birth_surname','gender','birth_date','death_date','birth_place','death_place','occupation','photo_url','notes'] as $nK)$oD[$nK]=(string)($aB[$nK]??'');$oD['is_living']=!empty($aB['is_living'])?1:0;return $oD;}
  /**
 * @brief Vytvoří person používané v GenealogyService.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
  public function createPerson(int $nTreeId):DataResponse{if(!$this->can($nTreeId,true))return $this->deny();$aB=$this->body();if(trim((string)($aB['given_name']??''))===''&&trim((string)($aB['surname']??''))==='')return new JSONResponse(['error'=>$this->oL10n->t('Enter a first or last name.')],400);$oD=$this->personData($aB)+['tree_id'=>$nTreeId,'created_at'=>time(),'updated_at'=>time()];$nId=$this->insert('hc_familytree_people',$oD);$oTree=$this->row('hc_familytree_trees',$nTreeId);if(empty($oTree['root_person_id']))$this->update('hc_familytree_trees',$nTreeId,['root_person_id'=>$nId,'updated_at'=>time()]);return new DataResponse($this->row('hc_familytree_people',$nId));}
  /**
 * @brief Aktualizuje person používané v GenealogyService.
 * @param int $nId Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
  public function updatePerson(int $nId):DataResponse{$oP=$this->row('hc_familytree_people',$nId);if(!$oP||!$this->can((int)$oP['tree_id'],true))return $this->deny();$oD=$this->personData($this->body());if(trim($oD['given_name'])===''&&trim($oD['surname'])==='')return new JSONResponse(['error'=>$this->oL10n->t('Enter a first or last name.')],400);$oD['updated_at']=time();$this->update('hc_familytree_people',$nId,$oD);return new DataResponse($this->row('hc_familytree_people',$nId));}

  /**
 * @brief Vytvoří child používané v GenealogyService.
 * @param int $nTreeId Jednoznačný identifikátor rodokmenu, k němuž se vztahuje operace.
 * @return DataResponse HTTP odpověď Nextcloudu s daty nebo oznámením chyby.
 */
  public function createChild(int $nTreeId):DataResponse{
   if(!$this->can($nTreeId,true))return $this->deny();
   $aB=$this->body();$oFirst=(int)($aB['parent1_id']??0);$oSecond=(int)($aB['parent2_id']??0);
   $oParent=$this->row('hc_familytree_people',$oFirst);
   if(!$oParent||(int)$oParent['tree_id']!==$nTreeId||$oSecond===$oFirst)return new JSONResponse(['error'=>$this->oL10n->t('Invalid parent.')],400);
   if($oSecond){$oOther=$this->row('hc_familytree_people',$oSecond);if(!$oOther||(int)$oOther['tree_id']!==$nTreeId)return new JSONResponse(['error'=>$this->oL10n->t('Invalid parent.')],400);}
   $aData=$this->personData($aB);
   if(trim($aData['given_name'])===''&&trim($aData['surname'])==='')return new JSONResponse(['error'=>$this->oL10n->t('Enter a first or last name.')],400);
   $nNow=time();$aData+=['tree_id'=>$nTreeId,'created_at'=>$nNow,'updated_at'=>$nNow];
   $this->oDb->beginTransaction();
   try{
    $sChildId=$this->insert('hc_familytree_people',$aData);
    foreach(array_filter([$oFirst,$oSecond]) as $nParentId){
     $this->insert('hc_familytree_relations',['tree_id'=>$nTreeId,'person1_id'=>$nParentId,'person2_id'=>$sChildId,'type'=>'parent','start_date'=>'','end_date'=>'','notes'=>'']);
    }
    $this->oDb->commit();
   }catch(\Throwable $oError){$this->oDb->rollBack();throw $oError;}
   return new DataResponse($this->row('hc_familytree_people',$sChildId));
  }
  /**
 * @brief Nastaví parents používané v GenealogyService.
 * @param int $nId Identifikátor konkrétního záznamu v databázi.
 * @return DataResponse HTTP odpověď Nextcloudu s daty nebo oznámením chyby.
 */
  public function setParents(int $nId):DataResponse{
   $oChild=$this->row('hc_familytree_people',$nId);
   if(!$oChild||!$this->can((int)$oChild['tree_id'],true))return $this->deny();
   $nTreeId=(int)$oChild['tree_id'];$aBody=$this->body();
   $oFirst=(int)($aBody['parent1_id']??0);$oSecond=(int)($aBody['parent2_id']??0);
   if($oFirst===0||$oFirst===$oSecond)return new JSONResponse(['error'=>$this->oL10n->t('Choose one or two different parents.')],400);
   foreach([$oFirst,$oSecond] as $nParentId){
    if(!$nParentId)continue;
    $oParent=$this->row('hc_familytree_people',$nParentId);
    if($nParentId===$nId||!$oParent||(int)$oParent['tree_id']!==$nTreeId)return new JSONResponse(['error'=>$this->oL10n->t('Invalid parent.')],400);
   }
   $aRelations=$this->rows('hc_familytree_relations',['tree_id'=>$nTreeId,'type'=>'parent']);
   $aDescendants=[$nId];
   for($nI=0;$nI<count($aDescendants);$nI++){
    foreach($aRelations as $oRelation){
     if((int)$oRelation['person1_id']!==$aDescendants[$nI])continue;
     $oNext=(int)$oRelation['person2_id'];
     if(!in_array($oNext,$aDescendants,true))$aDescendants[]=$oNext;
    }
   }
   if(in_array($oFirst,$aDescendants,true)||($oSecond&&in_array($oSecond,$aDescendants,true)))return new JSONResponse(['error'=>$this->oL10n->t('A parent cannot be this person’s descendant.')],400);
   $oWanted=array_filter([$oFirst,$oSecond]);
   $this->oDb->beginTransaction();
   try{
    foreach($aRelations as $oRelation){
     if((int)$oRelation['person2_id']!==$nId||in_array((int)$oRelation['person1_id'],$oWanted,true))continue;
     $this->deleteLinksFor('relation',(int)$oRelation['id']);
     $this->delete('hc_familytree_relations',(int)$oRelation['id']);
    }
    foreach($oWanted as $nParentId){
     $bExists=false;
     foreach($aRelations as $oRelation)if((int)$oRelation['person1_id']===$nParentId&&(int)$oRelation['person2_id']===$nId){$bExists=true;break;}
     if(!$bExists)$this->insert('hc_familytree_relations',['tree_id'=>$nTreeId,'person1_id'=>$nParentId,'person2_id'=>$nId,'type'=>'parent','start_date'=>'','end_date'=>'','notes'=>'']);
    }
    $this->oDb->commit();
   }catch(\Throwable $oError){$this->oDb->rollBack();throw $oError;}
   return new DataResponse(['ok'=>true,'person'=>$this->row('hc_familytree_people',$nId)]);
  }
  /**
 * @brief Přesune person používané v GenealogyService.
 * @param int $nId Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
  public function movePerson(int $nId):DataResponse{$oP=$this->row('hc_familytree_people',$nId);if(!$oP||!$this->can((int)$oP['tree_id'],true))return $this->deny();$aB=$this->body();$nX=max(-100000,min(100000,(int)($aB['x']??0)));$nY=max(-100000,min(100000,(int)($aB['y']??0)));$this->update('hc_familytree_people',$nId,['layout_x'=>$nX,'layout_y'=>$nY,'updated_at'=>time()]);return new DataResponse($this->row('hc_familytree_people',$nId));}
  /**
 * @brief Přesune people používané v GenealogyService.
 * @param int $nTreeId Jednoznačný identifikátor rodokmenu, k němuž se vztahuje operace.
 * @return DataResponse HTTP odpověď Nextcloudu s daty nebo oznámením chyby.
 */
  public function movePeople(int $nTreeId):DataResponse{
   if(!$this->can($nTreeId,true))return $this->deny();
   $aPositions=$this->body()['positions']??null;
   if(!is_array($aPositions)||!array_is_list($aPositions)||count($aPositions)<2||count($aPositions)>5000)return new JSONResponse(['error'=>$this->oL10n->t('Invalid person selection.')],400);
   $bValid=[];
   foreach($aPositions as $oItem){
    if(!is_array($oItem)||!isset($oItem['id'],$oItem['x'],$oItem['y']))return new JSONResponse(['error'=>$this->oL10n->t('Invalid person position.')],400);
    $nId=filter_var($oItem['id']??null,FILTER_VALIDATE_INT);
    $nX=filter_var($oItem['x']??null,FILTER_VALIDATE_INT);
    $nY=filter_var($oItem['y']??null,FILTER_VALIDATE_INT);
    if($nId===false||$nId<1||$nX===false||$nY===false||abs($nX)>100000||abs($nY)>100000||isset($bValid[$nId]))return new JSONResponse(['error'=>$this->oL10n->t('Invalid person position.')],400);
    $oPerson=$this->row('hc_familytree_people',$nId);
    if(!$oPerson||(int)$oPerson['tree_id']!==$nTreeId)return new JSONResponse(['error'=>$this->oL10n->t('Person does not belong to this family tree.')],400);
    $bValid[$nId]=['x'=>$nX,'y'=>$nY];
   }
   $this->oDb->beginTransaction();
   try{foreach($bValid as $nId=>$oPoint)$this->update('hc_familytree_people',$nId,['layout_x'=>$oPoint['x'],'layout_y'=>$oPoint['y'],'updated_at'=>time()]);$this->oDb->commit();}
   catch(\Throwable $oError){$this->oDb->rollBack();throw $oError;}
   return new DataResponse(['ok'=>true,'moved'=>count($bValid)]);
  }
  /**
 * @brief Obnoví layout používané v GenealogyService.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
  public function resetLayout(int $nTreeId):DataResponse{if(!$this->can($nTreeId,true))return $this->deny();$this->oDb->beginTransaction();try{foreach($this->rows('hc_familytree_people',['tree_id'=>$nTreeId]) as $oPerson)if($oPerson['layout_x']!==null||$oPerson['layout_y']!==null)$this->update('hc_familytree_people',(int)$oPerson['id'],['layout_x'=>null,'layout_y'=>null]);$this->oDb->commit();}catch(\Throwable $oError){$this->oDb->rollBack();throw $oError;}return new DataResponse(['ok'=>true]);}
  /**
 * @brief Odstraní person používané v GenealogyService.
 * @param int $nId Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
  public function deletePerson(int $nId):DataResponse{$oP=$this->row('hc_familytree_people',$nId);if(!$oP||!$this->can((int)$oP['tree_id'],true))return $this->deny();$this->deleteLinksFor('person',$nId);foreach($this->rows('hc_familytree_events',['person_id'=>$nId]) as $oE)$this->deleteLinksFor('event',(int)$oE['id']);foreach($this->rows('hc_familytree_relations',['tree_id'=>$oP['tree_id']]) as $oR)if((int)$oR['person1_id']===$nId||(int)$oR['person2_id']===$nId)$this->deleteLinksFor('relation',(int)$oR['id']);foreach($this->rows('hc_familytree_events',['person_id'=>$nId]) as $oEvent)$this->delete('hc_familytree_events',(int)$oEvent['id']);foreach($this->rows('hc_familytree_relations',['tree_id'=>$oP['tree_id']]) as $oRelation)if((int)$oRelation['person1_id']===$nId||(int)$oRelation['person2_id']===$nId)$this->delete('hc_familytree_relations',(int)$oRelation['id']);$this->delete('hc_familytree_people',$nId);return new DataResponse(['ok'=>true]);}
  /**
 * @brief Vytvoří relation používané v GenealogyService.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
  public function createRelation(int $nTreeId):DataResponse{if(!$this->can($nTreeId,true))return $this->deny();$aB=$this->body();$nA=(int)($aB['person1_id']??0);$oC=(int)($aB['person2_id']??0);$sType=(string)($aB['type']??'');$oPa=$this->row('hc_familytree_people',$nA);$oPb=$this->row('hc_familytree_people',$oC);if(!$nA||!$oC||$nA===$oC||!in_array($sType,['parent','partner'],true)||!$oPa||!$oPb||(int)$oPa['tree_id']!==$nTreeId||(int)$oPb['tree_id']!==$nTreeId)return new JSONResponse(['error'=>$this->oL10n->t('Invalid relationship.')],400);foreach($this->rows('hc_familytree_relations',['tree_id'=>$nTreeId,'type'=>$sType]) as $oExisting){$oSame=(int)$oExisting['person1_id']===$nA&&(int)$oExisting['person2_id']===$oC;$oReverse=$sType==='partner'&&(int)$oExisting['person1_id']===$oC&&(int)$oExisting['person2_id']===$nA;if($oSame||$oReverse){$oExisting['alreadyExisted']=true;return new DataResponse($oExisting);}}$nId=$this->insert('hc_familytree_relations',['tree_id'=>$nTreeId,'person1_id'=>$nA,'person2_id'=>$oC,'type'=>$sType,'start_date'=>(string)($aB['start_date']??''),'end_date'=>(string)($aB['end_date']??''),'notes'=>(string)($aB['notes']??'')]);$oCreated=$this->row('hc_familytree_relations',$nId);$oCreated['alreadyExisted']=false;return new DataResponse($oCreated);}
  /**
 * @brief Odstraní relation používané v GenealogyService.
 * @param int $nId Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
  public function deleteRelation(int $nId):DataResponse{$oR=$this->row('hc_familytree_relations',$nId);if(!$oR||!$this->can((int)$oR['tree_id'],true))return $this->deny();$this->deleteLinksFor('relation',$nId);$this->delete('hc_familytree_relations',$nId);return new DataResponse(['ok'=>true]);}
  /**
 * @brief Vytvoří event používané v GenealogyService.
 * @param int $nPersonId Identifikátor osoby.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
  public function createEvent(int $nPersonId):DataResponse{$oP=$this->row('hc_familytree_people',$nPersonId);if(!$oP||!$this->can((int)$oP['tree_id'],true))return $this->deny();$aB=$this->body();$nId=$this->insert('hc_familytree_events',['tree_id'=>$oP['tree_id'],'person_id'=>$nPersonId,'type'=>(string)($aB['type']??'other'),'title'=>(string)($aB['title']??''),'event_date'=>(string)($aB['event_date']??''),'place'=>(string)($aB['place']??''),'description'=>(string)($aB['description']??'')]);return new DataResponse($this->row('hc_familytree_events',$nId));}
  /**
 * @brief Odstraní event používané v GenealogyService.
 * @param int $nId Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
  public function deleteEvent(int $nId):DataResponse{$oE=$this->row('hc_familytree_events',$nId);if(!$oE||!$this->can((int)$oE['tree_id'],true))return $this->deny();$this->deleteLinksFor('event',$nId);$this->delete('hc_familytree_events',$nId);return new DataResponse(['ok'=>true]);}
 /**
 * @brief Odstraní links for používané v GenealogyService.
 * @param string $sType Vstupní parametr „type“ pro operaci deleteLinksFor.
 * @param int $nTarget Vstupní parametr „target“ pro operaci deleteLinksFor.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
 private function deleteLinksFor(string $sType,int $nTarget):void{$oQ=$this->oDb->getQueryBuilder();$oQ->delete('hc_familytree_doc_links')->where($oQ->expr()->eq('link_type',$oQ->createNamedParameter($sType)))->andWhere($oQ->expr()->eq('target_id',$oQ->createNamedParameter($nTarget)))->executeStatement();}
 /**
 * @brief Načte nebo sestaví údaje připojeného dokumentu pro genealogické operace.
 * @param array $aB Vstupní parametr „b“ pro operaci documentData.
 * @return array Strukturované výsledky operace; u volitelného návratu může být null.
 */
 private function documentData(array $aB):array{$oD=[];foreach(['title','document_type','document_date','place','archive','signature','source','file_path','mime_type','description'] as $nK)$oD[$nK]=trim((string)($aB[$nK]??''));return $oD;}
 /**
 * @brief Uloží document links používané v GenealogyService.
 * @param int $nDocumentId Identifikátor příslušného záznamu.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @param array $aLinks Vstupní parametr „links“ pro operaci saveDocumentLinks.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
 private function saveDocumentLinks(int $nDocumentId,int $nTreeId,array $aLinks):void{$oQ=$this->oDb->getQueryBuilder();$oQ->delete('hc_familytree_doc_links')->where($oQ->expr()->eq('document_id',$oQ->createNamedParameter($nDocumentId)))->executeStatement();foreach($aLinks as $oLink){$sType=(string)($oLink['type']??'');$nTarget=(int)($oLink['id']??0);$sTable=['person'=>'hc_familytree_people','event'=>'hc_familytree_events','relation'=>'hc_familytree_relations'][$sType]??'';$oRow=$sTable?$this->row($sTable,$nTarget):null;if(!$oRow||(int)$oRow['tree_id']!==$nTreeId)continue;$this->insert('hc_familytree_doc_links',['document_id'=>$nDocumentId,'tree_id'=>$nTreeId,'link_type'=>$sType,'target_id'=>$nTarget]);}}
  /**
 * @brief Vytvoří tree document pro oprávněně přístupný rodokmen.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
  public function createTreeDocument(int $nTreeId):DataResponse{if(!$this->can($nTreeId,true))return $this->deny();$aB=$this->body();$oD=$this->documentData($aB);if($oD['title']===''||$oD['file_path']==='')return new JSONResponse(['error'=>$this->oL10n->t('A title and a file are required.')],400);$nNow=time();$oD+=['tree_id'=>$nTreeId,'person_id'=>null,'created_at'=>$nNow,'updated_at'=>$nNow];$nId=$this->insert('hc_familytree_documents',$oD);$this->saveDocumentLinks($nId,$nTreeId,(array)($aB['links']??[]));return new DataResponse(['document'=>$this->row('hc_familytree_documents',$nId),'links'=>$this->rows('hc_familytree_doc_links',['document_id'=>$nId])]);}
  /**
 * @brief Aktualizuje document používané v GenealogyService.
 * @param int $nId Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
  public function updateDocument(int $nId):DataResponse{$oOld=$this->row('hc_familytree_documents',$nId);if(!$oOld||!$this->can((int)$oOld['tree_id'],true))return $this->deny();$aB=$this->body();$oD=$this->documentData($aB);if($oD['title']===''||$oD['file_path']==='')return new JSONResponse(['error'=>$this->oL10n->t('A title and a file are required.')],400);$oD['updated_at']=time();$this->update('hc_familytree_documents',$nId,$oD);$this->saveDocumentLinks($nId,(int)$oOld['tree_id'],(array)($aB['links']??[]));return new DataResponse(['document'=>$this->row('hc_familytree_documents',$nId),'links'=>$this->rows('hc_familytree_doc_links',['document_id'=>$nId])]);}
  /**
 * @brief Odstraní document používané v GenealogyService.
 * @param int $nId Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
  public function deleteDocument(int $nId):DataResponse{$oD=$this->row('hc_familytree_documents',$nId);if(!$oD||!$this->can((int)$oD['tree_id'],true))return $this->deny();$oQ=$this->oDb->getQueryBuilder();$oQ->delete('hc_familytree_doc_links')->where($oQ->expr()->eq('document_id',$oQ->createNamedParameter($nId)))->executeStatement();$this->delete('hc_familytree_documents',$nId);return new DataResponse(['ok'=>true]);}
  /**
 * @brief Uloží share používané v GenealogyService.
 * @param int $nTreeId Identifikátor rodokmenu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
  public function saveShare(int $nTreeId):DataResponse{$oT=$this->row('hc_familytree_trees',$nTreeId);if(!$oT||$oT['owner_uid']!==$this->sUid)return $this->deny();$aB=$this->body();$sType=(string)($aB['share_type']??'user');$oWith=(string)($aB['share_with']??'');$bValid=$sType==='user'?$this->oUsers->userExists($oWith):($sType==='group'&&$this->oGroups->groupExists($oWith));if($oWith===''||!$bValid)return new JSONResponse(['error'=>$this->oL10n->t('Invalid user or group.')],400);$oPermission=($aB['permission']??'view')==='edit'?'edit':'view';foreach($this->rows('hc_familytree_shares',['tree_id'=>$nTreeId]) as $oShare)if($oShare['share_type']===$sType&&$oShare['share_with']===$oWith){$this->update('hc_familytree_shares',(int)$oShare['id'],['permission'=>$oPermission]);return new DataResponse($this->row('hc_familytree_shares',(int)$oShare['id']));}$nId=$this->insert('hc_familytree_shares',['tree_id'=>$nTreeId,'share_type'=>$sType,'share_with'=>$oWith,'permission'=>$oPermission]);return new DataResponse($this->row('hc_familytree_shares',$nId));}
  /**
 * @brief Odstraní share používané v GenealogyService.
 * @param int $nId Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
  public function deleteShare(int $nId):DataResponse{$oS=$this->row('hc_familytree_shares',$nId);$oT=$oS?$this->row('hc_familytree_trees',(int)$oS['tree_id']):null;if(!$oT||$oT['owner_uid']!==$this->sUid)return $this->deny();$this->delete('hc_familytree_shares',$nId);return new DataResponse(['ok'=>true]);}
}
