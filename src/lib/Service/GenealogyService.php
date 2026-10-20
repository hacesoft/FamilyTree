<?php
declare(strict_types=1);
namespace OCA\HcFamilyTree\Service;
use OCP\AppFramework\Http\DataResponse; use OCP\AppFramework\Http\JSONResponse; use OCP\AppFramework\Http\Response; use OCP\IDBConnection; use OCP\IGroupManager; use OCP\IL10N; use OCP\IRequest; use OCP\IUserManager; use OCP\IUserSession;
class GenealogyService {
 private string $uid;
 public function __construct(private IRequest $request,private IDBConnection $db,IUserSession $us,private IGroupManager $groups,private IUserManager $users,private IL10N $l10n,private ResearchImportService $research){$this->uid=$us->getUser()?->getUID()??'';}
 private function rows(string $table,array $where=[]):array{$q=$this->db->getQueryBuilder();$q->select('*')->from($table);foreach($where as $k=>$v)$q->andWhere($q->expr()->eq($k,$q->createNamedParameter($v)));return $q->executeQuery()->fetchAllAssociative();}
 private function row(string $table,int $id):?array{$r=$this->rows($table,['id'=>$id]);return $r[0]??null;}
 private function can(int $treeId,bool $edit=false):bool{$tree=$this->row('hc_familytree_trees',$treeId);if(!$tree)return false;if($tree['owner_uid']===$this->uid)return true;$user=$this->users->get($this->uid);foreach($this->rows('hc_familytree_shares',['tree_id'=>$treeId]) as $s){$match=$s['share_type']==='user'&&$s['share_with']===$this->uid;if($s['share_type']==='group'&&$user){$g=$this->groups->get($s['share_with']);$match=$g?->inGroup($user)??false;}if($match&&(!$edit||$s['permission']==='edit'))return true;}return false;}
 private function insert(string $table,array $data):int{$q=$this->db->getQueryBuilder();$q->insert($table);foreach($data as $k=>$v)$q->setValue($k,$q->createNamedParameter($v));$q->executeStatement();return (int)$this->db->lastInsertId($table);}
 private function update(string $table,int $id,array $data):void{$q=$this->db->getQueryBuilder();$q->update($table);foreach($data as $k=>$v)$q->set($k,$q->createNamedParameter($v));$q->where($q->expr()->eq('id',$q->createNamedParameter($id)));$q->executeStatement();}
 private function delete(string $table,int $id):void{$q=$this->db->getQueryBuilder();$q->delete($table)->where($q->expr()->eq('id',$q->createNamedParameter($id)))->executeStatement();}
 private function body():array{return $this->request->getParams();}
 private function deny():JSONResponse{return new JSONResponse(['error'=>$this->l10n->t('Přístup byl odepřen.')],403);}
  public function dashboard():DataResponse{$trees=$this->rows('hc_familytree_trees',['owner_uid'=>$this->uid]);$people=0;$recent=[];foreach($trees as $t){$ps=$this->rows('hc_familytree_people',['tree_id'=>$t['id']]);$people+=count($ps);foreach($ps as $p)$recent[]=$p;}usort($recent,fn($a,$b)=>(int)$b['updated_at']<=>(int)$a['updated_at']);return new DataResponse(['trees'=>count($trees),'people'=>$people,'recent'=>array_slice(array_map(fn($p)=>['id'=>$p['id'],'name'=>trim($p['given_name'].' '.$p['surname']),'birthDate'=>$p['birth_date']],$recent),0,3)]);}
  public function trees():DataResponse{$visible=[];foreach($this->rows('hc_familytree_trees') as $tree)if($this->can((int)$tree['id']))$visible[]=$tree;usort($visible,fn($a,$b)=>(int)$b['updated_at']<=>(int)$a['updated_at']);return new DataResponse($visible);}
  public function createTree():DataResponse{$b=$this->body();$name=trim((string)($b['name']??''));if($name==='')return new JSONResponse(['error'=>$this->l10n->t('Název je povinný.')],400);$now=time();$id=$this->insert('hc_familytree_trees',['owner_uid'=>$this->uid,'name'=>$name,'description'=>(string)($b['description']??''),'root_person_id'=>null,'created_at'=>$now,'updated_at'=>$now]);return new DataResponse($this->row('hc_familytree_trees',$id));}
  public function tree(int $id):DataResponse{
   if(!$this->can($id))return $this->deny();
   $tree=$this->row('hc_familytree_trees',$id);
   $research=$this->research->records($id);
   $relations=$this->research->visibleRelations($this->rows('hc_familytree_relations',['tree_id'=>$id]),$research);
   return new DataResponse(['tree'=>$tree,'people'=>$this->rows('hc_familytree_people',['tree_id'=>$id]),
    'relationships'=>$relations,'events'=>$this->rows('hc_familytree_events',['tree_id'=>$id]),
    'documents'=>$this->rows('hc_familytree_documents',['tree_id'=>$id]),
    'documentLinks'=>$this->rows('hc_familytree_doc_links',['tree_id'=>$id]),'research'=>$research,
    'shares'=>$tree['owner_uid']===$this->uid?$this->rows('hc_familytree_shares',['tree_id'=>$id]):[],
    'canEdit'=>$this->can($id,true),'isOwner'=>$tree['owner_uid']===$this->uid]);
  }

  public function updateTree(int $id):DataResponse{if(!$this->can($id,true))return $this->deny();$b=$this->body();$d=['updated_at'=>time()];foreach(['name','description','root_person_id'] as $k)if(array_key_exists($k,$b))$d[$k]=$b[$k];$this->update('hc_familytree_trees',$id,$d);return new DataResponse($this->row('hc_familytree_trees',$id));}
  public function deleteTree(int $id):DataResponse{$t=$this->row('hc_familytree_trees',$id);if(!$t||$t['owner_uid']!==$this->uid)return $this->deny();foreach(['hc_familytree_research','hc_familytree_doc_links','hc_familytree_relations','hc_familytree_events','hc_familytree_documents','hc_familytree_shares','hc_familytree_people'] as $table){$q=$this->db->getQueryBuilder();$q->delete($table)->where($q->expr()->eq('tree_id',$q->createNamedParameter($id)))->executeStatement();}$this->delete('hc_familytree_trees',$id);return new DataResponse(['ok'=>true]);}
  public function previewResearch(int $treeId):Response{if(!$this->can($treeId,true))return $this->deny();try{return new DataResponse($this->research->preview($treeId));}catch(\InvalidArgumentException $e){return new JSONResponse(['error'=>$e->getMessage()],400);}}
  public function importResearch(int $treeId):Response{if(!$this->can($treeId,true))return $this->deny();try{return new DataResponse($this->research->import($treeId,(string)$this->row('hc_familytree_trees',$treeId)['owner_uid']));}catch(\InvalidArgumentException $e){return new JSONResponse(['error'=>$e->getMessage()],400);}}
  public function researchMedia(int $id):Response{$r=$this->row('hc_familytree_research',$id);if(!$r||!$this->can((int)$r['tree_id']))return $this->deny();$tree=$this->row('hc_familytree_trees',(int)$r['tree_id']);return $this->research->displayMedia($r,(string)$tree['owner_uid']);}
 private function personData(array $b):array{$d=[];foreach(['given_name','surname','birth_surname','gender','birth_date','death_date','birth_place','death_place','occupation','photo_url','notes'] as $k)$d[$k]=(string)($b[$k]??'');$d['is_living']=!empty($b['is_living'])?1:0;return $d;}
  public function createPerson(int $treeId):DataResponse{if(!$this->can($treeId,true))return $this->deny();$b=$this->body();if(trim((string)($b['given_name']??''))===''&&trim((string)($b['surname']??''))==='')return new JSONResponse(['error'=>$this->l10n->t('Zadejte jméno nebo příjmení.')],400);$d=$this->personData($b)+['tree_id'=>$treeId,'created_at'=>time(),'updated_at'=>time()];$id=$this->insert('hc_familytree_people',$d);$tree=$this->row('hc_familytree_trees',$treeId);if(empty($tree['root_person_id']))$this->update('hc_familytree_trees',$treeId,['root_person_id'=>$id,'updated_at'=>time()]);return new DataResponse($this->row('hc_familytree_people',$id));}
  public function updatePerson(int $id):DataResponse{$p=$this->row('hc_familytree_people',$id);if(!$p||!$this->can((int)$p['tree_id'],true))return $this->deny();$d=$this->personData($this->body());if(trim($d['given_name'])===''&&trim($d['surname'])==='')return new JSONResponse(['error'=>$this->l10n->t('Zadejte jméno nebo příjmení.')],400);$d['updated_at']=time();$this->update('hc_familytree_people',$id,$d);return new DataResponse($this->row('hc_familytree_people',$id));}

  /** Create the person and both parent links in one database transaction. */
  public function createChild(int $treeId):DataResponse{
   if(!$this->can($treeId,true))return $this->deny();
   $b=$this->body();$first=(int)($b['parent1_id']??0);$second=(int)($b['parent2_id']??0);
   $parent=$this->row('hc_familytree_people',$first);
   if(!$parent||(int)$parent['tree_id']!==$treeId||$second===$first)return new JSONResponse(['error'=>$this->l10n->t('Neplatný rodič.')],400);
   if($second){$other=$this->row('hc_familytree_people',$second);if(!$other||(int)$other['tree_id']!==$treeId)return new JSONResponse(['error'=>$this->l10n->t('Neplatný rodič.')],400);}
   $data=$this->personData($b);
   if(trim($data['given_name'])===''&&trim($data['surname'])==='')return new JSONResponse(['error'=>$this->l10n->t('Zadejte jméno nebo příjmení.')],400);
   $now=time();$data+=['tree_id'=>$treeId,'created_at'=>$now,'updated_at'=>$now];
   $this->db->beginTransaction();
   try{
    $childId=$this->insert('hc_familytree_people',$data);
    foreach(array_filter([$first,$second]) as $parentId){
     $this->insert('hc_familytree_relations',['tree_id'=>$treeId,'person1_id'=>$parentId,'person2_id'=>$childId,'type'=>'parent','start_date'=>'','end_date'=>'','notes'=>'']);
    }
    $this->db->commit();
   }catch(\Throwable $error){$this->db->rollBack();throw $error;}
   return new DataResponse($this->row('hc_familytree_people',$childId));
  }
  /** Assign one or two existing parents to an existing person, preserving unchanged links. */
  public function setParents(int $id):DataResponse{
   $child=$this->row('hc_familytree_people',$id);
   if(!$child||!$this->can((int)$child['tree_id'],true))return $this->deny();
   $treeId=(int)$child['tree_id'];$body=$this->body();
   $first=(int)($body['parent1_id']??0);$second=(int)($body['parent2_id']??0);
   if($first===0||$first===$second)return new JSONResponse(['error'=>$this->l10n->t('Vyberte jednoho nebo dva různé rodiče.')],400);
   foreach([$first,$second] as $parentId){
    if(!$parentId)continue;
    $parent=$this->row('hc_familytree_people',$parentId);
    if($parentId===$id||!$parent||(int)$parent['tree_id']!==$treeId)return new JSONResponse(['error'=>$this->l10n->t('Neplatný rodič.')],400);
   }
   $relations=$this->rows('hc_familytree_relations',['tree_id'=>$treeId,'type'=>'parent']);
   $descendants=[$id];
   for($i=0;$i<count($descendants);$i++){
    foreach($relations as $relation){
     if((int)$relation['person1_id']!==$descendants[$i])continue;
     $next=(int)$relation['person2_id'];
     if(!in_array($next,$descendants,true))$descendants[]=$next;
    }
   }
   if(in_array($first,$descendants,true)||($second&&in_array($second,$descendants,true)))return new JSONResponse(['error'=>$this->l10n->t('Rodič nemůže být potomkem této osoby.')],400);
   $wanted=array_filter([$first,$second]);
   $this->db->beginTransaction();
   try{
    foreach($relations as $relation){
     if((int)$relation['person2_id']!==$id||in_array((int)$relation['person1_id'],$wanted,true))continue;
     $this->deleteLinksFor('relation',(int)$relation['id']);
     $this->delete('hc_familytree_relations',(int)$relation['id']);
    }
    foreach($wanted as $parentId){
     $exists=false;
     foreach($relations as $relation)if((int)$relation['person1_id']===$parentId&&(int)$relation['person2_id']===$id){$exists=true;break;}
     if(!$exists)$this->insert('hc_familytree_relations',['tree_id'=>$treeId,'person1_id'=>$parentId,'person2_id'=>$id,'type'=>'parent','start_date'=>'','end_date'=>'','notes'=>'']);
    }
    $this->db->commit();
   }catch(\Throwable $error){$this->db->rollBack();throw $error;}
   return new DataResponse(['ok'=>true,'person'=>$this->row('hc_familytree_people',$id)]);
  }
  public function movePerson(int $id):DataResponse{$p=$this->row('hc_familytree_people',$id);if(!$p||!$this->can((int)$p['tree_id'],true))return $this->deny();$b=$this->body();$x=max(-100000,min(100000,(int)($b['x']??0)));$y=max(-100000,min(100000,(int)($b['y']??0)));$this->update('hc_familytree_people',$id,['layout_x'=>$x,'layout_y'=>$y,'updated_at'=>time()]);return new DataResponse($this->row('hc_familytree_people',$id));}
  /** Move a selected group atomically; graph relationships remain unchanged. */
  public function movePeople(int $treeId):DataResponse{
   if(!$this->can($treeId,true))return $this->deny();
   $positions=$this->body()['positions']??null;
   if(!is_array($positions)||!array_is_list($positions)||count($positions)<2||count($positions)>5000)return new JSONResponse(['error'=>$this->l10n->t('Neplatný výběr osob.')],400);
   $valid=[];
   foreach($positions as $item){
    if(!is_array($item)||!isset($item['id'],$item['x'],$item['y']))return new JSONResponse(['error'=>$this->l10n->t('Neplatná poloha osoby.')],400);
    $id=filter_var($item['id']??null,FILTER_VALIDATE_INT);
    $x=filter_var($item['x']??null,FILTER_VALIDATE_INT);
    $y=filter_var($item['y']??null,FILTER_VALIDATE_INT);
    if($id===false||$id<1||$x===false||$y===false||abs($x)>100000||abs($y)>100000||isset($valid[$id]))return new JSONResponse(['error'=>$this->l10n->t('Neplatná poloha osoby.')],400);
    $person=$this->row('hc_familytree_people',$id);
    if(!$person||(int)$person['tree_id']!==$treeId)return new JSONResponse(['error'=>$this->l10n->t('Osoba do tohoto rodokmenu nepatří.')],400);
    $valid[$id]=['x'=>$x,'y'=>$y];
   }
   $this->db->beginTransaction();
   try{foreach($valid as $id=>$point)$this->update('hc_familytree_people',$id,['layout_x'=>$point['x'],'layout_y'=>$point['y'],'updated_at'=>time()]);$this->db->commit();}
   catch(\Throwable $error){$this->db->rollBack();throw $error;}
   return new DataResponse(['ok'=>true,'moved'=>count($valid)]);
  }
  public function resetLayout(int $treeId):DataResponse{if(!$this->can($treeId,true))return $this->deny();$q=$this->db->getQueryBuilder();$q->update('hc_familytree_people')->set('layout_x',$q->createNamedParameter(null))->set('layout_y',$q->createNamedParameter(null))->where($q->expr()->eq('tree_id',$q->createNamedParameter($treeId)))->executeStatement();return new DataResponse(['ok'=>true]);}
  public function deletePerson(int $id):DataResponse{$p=$this->row('hc_familytree_people',$id);if(!$p||!$this->can((int)$p['tree_id'],true))return $this->deny();$this->deleteLinksFor('person',$id);foreach($this->rows('hc_familytree_events',['person_id'=>$id]) as $e)$this->deleteLinksFor('event',(int)$e['id']);foreach($this->rows('hc_familytree_relations',['tree_id'=>$p['tree_id']]) as $r)if((int)$r['person1_id']===$id||(int)$r['person2_id']===$id)$this->deleteLinksFor('relation',(int)$r['id']);$q=$this->db->getQueryBuilder();$q->delete('hc_familytree_events')->where($q->expr()->eq('person_id',$q->createNamedParameter($id)))->executeStatement();$q=$this->db->getQueryBuilder();$q->delete('hc_familytree_relations')->where($q->expr()->orX($q->expr()->eq('person1_id',$q->createNamedParameter($id)),$q->expr()->eq('person2_id',$q->createNamedParameter($id))))->executeStatement();$this->delete('hc_familytree_people',$id);return new DataResponse(['ok'=>true]);}
  public function createRelation(int $treeId):DataResponse{if(!$this->can($treeId,true))return $this->deny();$b=$this->body();$a=(int)($b['person1_id']??0);$c=(int)($b['person2_id']??0);$type=(string)($b['type']??'');$pa=$this->row('hc_familytree_people',$a);$pb=$this->row('hc_familytree_people',$c);if(!$a||!$c||$a===$c||!in_array($type,['parent','partner'],true)||!$pa||!$pb||(int)$pa['tree_id']!==$treeId||(int)$pb['tree_id']!==$treeId)return new JSONResponse(['error'=>$this->l10n->t('Neplatný vztah.')],400);foreach($this->rows('hc_familytree_relations',['tree_id'=>$treeId,'type'=>$type]) as $existing){$same=(int)$existing['person1_id']===$a&&(int)$existing['person2_id']===$c;$reverse=$type==='partner'&&(int)$existing['person1_id']===$c&&(int)$existing['person2_id']===$a;if($same||$reverse){$existing['alreadyExisted']=true;return new DataResponse($existing);}}$id=$this->insert('hc_familytree_relations',['tree_id'=>$treeId,'person1_id'=>$a,'person2_id'=>$c,'type'=>$type,'start_date'=>(string)($b['start_date']??''),'end_date'=>(string)($b['end_date']??''),'notes'=>(string)($b['notes']??'')]);$created=$this->row('hc_familytree_relations',$id);$created['alreadyExisted']=false;return new DataResponse($created);}
  public function deleteRelation(int $id):DataResponse{$r=$this->row('hc_familytree_relations',$id);if(!$r||!$this->can((int)$r['tree_id'],true))return $this->deny();$this->deleteLinksFor('relation',$id);$this->delete('hc_familytree_relations',$id);return new DataResponse(['ok'=>true]);}
  public function createEvent(int $personId):DataResponse{$p=$this->row('hc_familytree_people',$personId);if(!$p||!$this->can((int)$p['tree_id'],true))return $this->deny();$b=$this->body();$id=$this->insert('hc_familytree_events',['tree_id'=>$p['tree_id'],'person_id'=>$personId,'type'=>(string)($b['type']??'other'),'title'=>(string)($b['title']??''),'event_date'=>(string)($b['event_date']??''),'place'=>(string)($b['place']??''),'description'=>(string)($b['description']??'')]);return new DataResponse($this->row('hc_familytree_events',$id));}
  public function deleteEvent(int $id):DataResponse{$e=$this->row('hc_familytree_events',$id);if(!$e||!$this->can((int)$e['tree_id'],true))return $this->deny();$this->deleteLinksFor('event',$id);$this->delete('hc_familytree_events',$id);return new DataResponse(['ok'=>true]);}
 private function deleteLinksFor(string $type,int $target):void{$q=$this->db->getQueryBuilder();$q->delete('hc_familytree_doc_links')->where($q->expr()->eq('link_type',$q->createNamedParameter($type)))->andWhere($q->expr()->eq('target_id',$q->createNamedParameter($target)))->executeStatement();}
 private function documentData(array $b):array{$d=[];foreach(['title','document_type','document_date','place','archive','signature','source','file_path','mime_type','description'] as $k)$d[$k]=trim((string)($b[$k]??''));return $d;}
 private function saveDocumentLinks(int $documentId,int $treeId,array $links):void{$q=$this->db->getQueryBuilder();$q->delete('hc_familytree_doc_links')->where($q->expr()->eq('document_id',$q->createNamedParameter($documentId)))->executeStatement();foreach($links as $link){$type=(string)($link['type']??'');$target=(int)($link['id']??0);$table=['person'=>'hc_familytree_people','event'=>'hc_familytree_events','relation'=>'hc_familytree_relations'][$type]??'';$row=$table?$this->row($table,$target):null;if(!$row||(int)$row['tree_id']!==$treeId)continue;$this->insert('hc_familytree_doc_links',['document_id'=>$documentId,'tree_id'=>$treeId,'link_type'=>$type,'target_id'=>$target]);}}
  public function createTreeDocument(int $treeId):DataResponse{if(!$this->can($treeId,true))return $this->deny();$b=$this->body();$d=$this->documentData($b);if($d['title']===''||$d['file_path']==='')return new JSONResponse(['error'=>$this->l10n->t('Název a soubor jsou povinné.')],400);$now=time();$d+=['tree_id'=>$treeId,'person_id'=>null,'created_at'=>$now,'updated_at'=>$now];$id=$this->insert('hc_familytree_documents',$d);$this->saveDocumentLinks($id,$treeId,(array)($b['links']??[]));return new DataResponse(['document'=>$this->row('hc_familytree_documents',$id),'links'=>$this->rows('hc_familytree_doc_links',['document_id'=>$id])]);}
  public function updateDocument(int $id):DataResponse{$old=$this->row('hc_familytree_documents',$id);if(!$old||!$this->can((int)$old['tree_id'],true))return $this->deny();$b=$this->body();$d=$this->documentData($b);if($d['title']===''||$d['file_path']==='')return new JSONResponse(['error'=>$this->l10n->t('Název a soubor jsou povinné.')],400);$d['updated_at']=time();$this->update('hc_familytree_documents',$id,$d);$this->saveDocumentLinks($id,(int)$old['tree_id'],(array)($b['links']??[]));return new DataResponse(['document'=>$this->row('hc_familytree_documents',$id),'links'=>$this->rows('hc_familytree_doc_links',['document_id'=>$id])]);}
  public function deleteDocument(int $id):DataResponse{$d=$this->row('hc_familytree_documents',$id);if(!$d||!$this->can((int)$d['tree_id'],true))return $this->deny();$q=$this->db->getQueryBuilder();$q->delete('hc_familytree_doc_links')->where($q->expr()->eq('document_id',$q->createNamedParameter($id)))->executeStatement();$this->delete('hc_familytree_documents',$id);return new DataResponse(['ok'=>true]);}
  public function saveShare(int $treeId):DataResponse{$t=$this->row('hc_familytree_trees',$treeId);if(!$t||$t['owner_uid']!==$this->uid)return $this->deny();$b=$this->body();$type=(string)($b['share_type']??'user');$with=(string)($b['share_with']??'');$valid=$type==='user'?$this->users->userExists($with):($type==='group'&&$this->groups->groupExists($with));if($with===''||!$valid)return new JSONResponse(['error'=>$this->l10n->t('Neplatný uživatel nebo skupina.')],400);$permission=($b['permission']??'view')==='edit'?'edit':'view';foreach($this->rows('hc_familytree_shares',['tree_id'=>$treeId]) as $share)if($share['share_type']===$type&&$share['share_with']===$with){$this->update('hc_familytree_shares',(int)$share['id'],['permission'=>$permission]);return new DataResponse($this->row('hc_familytree_shares',(int)$share['id']));}$id=$this->insert('hc_familytree_shares',['tree_id'=>$treeId,'share_type'=>$type,'share_with'=>$with,'permission'=>$permission]);return new DataResponse($this->row('hc_familytree_shares',$id));}
  public function deleteShare(int $id):DataResponse{$s=$this->row('hc_familytree_shares',$id);$t=$s?$this->row('hc_familytree_trees',(int)$s['tree_id']):null;if(!$t||$t['owner_uid']!==$this->uid)return $this->deny();$this->delete('hc_familytree_shares',$id);return new DataResponse(['ok'=>true]);}
}
