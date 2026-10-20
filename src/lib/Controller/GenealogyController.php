<?php
declare(strict_types=1);
namespace OCA\HcFamilyTree\Controller;
use OCA\HcFamilyTree\AppInfo\Application;
use OCA\HcFamilyTree\Service\GenealogyService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\Attribute\NoAdminRequired;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Http\Response;
use OCP\AppFramework\Http\Attribute\NoCSRFRequired;
use OCP\IRequest;
final class GenealogyController extends Controller {
    public function __construct(IRequest $request, private GenealogyService $service) { parent::__construct(Application::APP_ID, $request); }
    #[NoAdminRequired] public function dashboard(): DataResponse { return $this->service->dashboard(); }
    #[NoAdminRequired] public function trees(): DataResponse { return $this->service->trees(); }
    #[NoAdminRequired] public function createTree(): DataResponse { return $this->service->createTree(); }
    #[NoAdminRequired] public function tree(int $id): DataResponse { return $this->service->tree($id); }
    #[NoAdminRequired] public function updateTree(int $id): DataResponse { return $this->service->updateTree($id); }
    #[NoAdminRequired] public function deleteTree(int $id): DataResponse { return $this->service->deleteTree($id); }
    #[NoAdminRequired] public function createPerson(int $treeId): DataResponse { return $this->service->createPerson($treeId); }
    #[NoAdminRequired] public function createChild(int $treeId): DataResponse { return $this->service->createChild($treeId); }
    #[NoAdminRequired] public function setParents(int $id): DataResponse { return $this->service->setParents($id); }
    #[NoAdminRequired] public function updatePerson(int $id): DataResponse { return $this->service->updatePerson($id); }
    #[NoAdminRequired] public function movePerson(int $id): DataResponse { return $this->service->movePerson($id); }
    #[NoAdminRequired] public function movePeople(int $treeId): DataResponse { return $this->service->movePeople($treeId); }
    #[NoAdminRequired] public function resetLayout(int $treeId): DataResponse { return $this->service->resetLayout($treeId); }
    #[NoAdminRequired] public function deletePerson(int $id): DataResponse { return $this->service->deletePerson($id); }
    #[NoAdminRequired] public function createRelation(int $treeId): DataResponse { return $this->service->createRelation($treeId); }
    #[NoAdminRequired] public function deleteRelation(int $id): DataResponse { return $this->service->deleteRelation($id); }
    #[NoAdminRequired] public function createEvent(int $personId): DataResponse { return $this->service->createEvent($personId); }
    #[NoAdminRequired] public function deleteEvent(int $id): DataResponse { return $this->service->deleteEvent($id); }
    #[NoAdminRequired] public function createTreeDocument(int $treeId): DataResponse { return $this->service->createTreeDocument($treeId); }
    #[NoAdminRequired] public function updateDocument(int $id): DataResponse { return $this->service->updateDocument($id); }
    #[NoAdminRequired] public function deleteDocument(int $id): DataResponse { return $this->service->deleteDocument($id); }
    #[NoAdminRequired] public function saveShare(int $treeId): DataResponse { return $this->service->saveShare($treeId); }
    #[NoAdminRequired] public function deleteShare(int $id): DataResponse { return $this->service->deleteShare($id); }
    #[NoAdminRequired] public function previewResearch(int $treeId): Response { return $this->service->previewResearch($treeId); }
    #[NoAdminRequired] public function importResearch(int $treeId): Response { return $this->service->importResearch($treeId); }
    #[NoAdminRequired] #[NoCSRFRequired] public function researchMedia(int $id): Response { return $this->service->researchMedia($id); }
}
