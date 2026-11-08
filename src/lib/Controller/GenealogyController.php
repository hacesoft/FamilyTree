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
namespace OCA\HcFamilyTree\Controller;
use OCA\HcFamilyTree\AppInfo\Application;
use OCA\HcFamilyTree\Service\GenealogyService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\Attribute\NoAdminRequired;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Http\Response;
use OCP\AppFramework\Http\Attribute\NoCSRFRequired;
use OCP\IRequest;
/** Parametry $treeId, $id a $personId jsou názvy proměnných navázané na
 * Nextcloud route placeholders. Jde o veřejný kontrakt; povinná výjimka H05.
 */
final class GenealogyController extends Controller {
    /**
 * @brief Inicializuje API kontroler a předá mu službu genealogických dat.
 * @param IRequest $oRequest Objekt HTTP požadavku.
 * @param GenealogyService $oService Služba pro přístup ke genealogickým datům a ověřování oprávnění.
 * @return void Konstruktor nevrací návratovou hodnotu.
 */
public function __construct(IRequest $oRequest, private GenealogyService $oService) { parent::__construct(Application::APP_ID, $oRequest); }
    /**
 * @brief Vrátí statistiky jednoho přístupného rodokmenu.
 * @param int $treeId Identifikátor rodokmenu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function treeStatistics(int $treeId): DataResponse { return $this->oService->treeStatistics($treeId); }
    /**
 * @brief Vrátí souhrnné statistiky rodokmenů vlastněných aktuálním uživatelem.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function ownedStatistics(): DataResponse { return $this->oService->ownedStatistics(); }
    /**
 * @brief Vrátí agregované údaje pro přehledový widget.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function dashboard(): DataResponse { return $this->oService->dashboard(); }
    /**
 * @brief Vrátí seznam rodokmenů, ke kterým má uživatel přístup.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function trees(): DataResponse { return $this->oService->trees(); }
    /**
 * @brief Spustí odstranění rodokmenů vlastněných aktuálním uživatelem.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function deleteAllTrees(): DataResponse { return $this->oService->deleteAllTrees(); }
    /**
 * @brief Založí rodokmen podle dat aktuálního požadavku.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function createTree(): DataResponse { return $this->oService->createTree(); }
    /**
 * @brief Načte osoby, vazby a výzkumné údaje vybraného rodokmenu.
 * @param int $id Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function tree(int $id): DataResponse { return $this->oService->tree($id); }
    /**
 * @brief Upraví základní nastavení vybraného rodokmenu.
 * @param int $id Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function updateTree(int $id): DataResponse { return $this->oService->updateTree($id); }
    /**
 * @brief Odstraní vybraný rodokmen po kontrole vlastnictví.
 * @param int $id Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function deleteTree(int $id): DataResponse { return $this->oService->deleteTree($id); }
    /**
 * @brief Načte úkoly, hledání, důkazy a historii výzkumného deníku.
 * @param int $treeId Identifikátor rodokmenu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function journal(int $treeId): DataResponse { return $this->oService->journal($treeId); }
    /**
 * @brief Vrátí deník jako JSON bez změn databáze.
 * @param int $treeId Identifikátor rodokmenu.
 * @return Response HTTP odpověď předaná klientovi.
 */
    #[NoAdminRequired] #[NoCSRFRequired] public function exportJournal(int $treeId): Response { return $this->oService->exportJournal($treeId); }
    /**
 * @brief Zkontroluje JSON deníku bez provedení zápisu.
 * @param int $treeId Identifikátor rodokmenu.
 * @return Response HTTP odpověď předaná klientovi.
 */
    #[NoAdminRequired] public function importJournalPreview(int $treeId): Response { return $this->oService->importJournalPreview($treeId); }
    /**
 * @brief Potvrdí a provede import dříve prověřeného výzkumného deníku.
 * @param int $treeId Identifikátor rodokmenu.
 * @return Response HTTP odpověď předaná klientovi.
 */
    #[NoAdminRequired] public function importJournalApply(int $treeId): Response { return $this->oService->importJournalApply($treeId); }
    /**
 * @brief Vytvoří úkol výzkumu v určeném rodokmenu.
 * @param int $treeId Identifikátor rodokmenu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function createJournalTask(int $treeId): DataResponse { return $this->oService->createJournalTask($treeId); }
    /**
 * @brief Aktualizuje existující výzkumný úkol.
 * @param int $id Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function updateJournalTask(int $id): DataResponse { return $this->oService->updateJournalTask($id); }
    /**
 * @brief Přidá záznam o provedeném hledání.
 * @param int $treeId Identifikátor rodokmenu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function addSearchLog(int $treeId): DataResponse { return $this->oService->addSearchLog($treeId); }
    /**
 * @brief Přidá nový badatelský důkaz.
 * @param int $treeId Identifikátor rodokmenu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function addEvidence(int $treeId): DataResponse { return $this->oService->addEvidence($treeId); }
    /**
 * @brief Uloží návrh změny genealogického údaje.
 * @param int $treeId Identifikátor rodokmenu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function addProposal(int $treeId): DataResponse { return $this->oService->addProposal($treeId); }
    /**
 * @brief Provede rozhodnutí o navržené změně.
 * @param int $id Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function reviewProposal(int $id): DataResponse { return $this->oService->reviewProposal($id); }
    /**
 * @brief Vytvoří kompenzační změnu při vrácení historické úpravy.
 * @param int $id Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function revertHistory(int $id): DataResponse { return $this->oService->revertHistory($id); }
    /**
 * @brief Založí osobu ve vybraném rodokmenu.
 * @param int $treeId Identifikátor rodokmenu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function createPerson(int $treeId): DataResponse { return $this->oService->createPerson($treeId); }
    /**
 * @brief Založí dítě a jeho rodinné vazby.
 * @param int $treeId Identifikátor rodokmenu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function createChild(int $treeId): DataResponse { return $this->oService->createChild($treeId); }
    /**
 * @brief Nastaví rodiče osoby s ověřením oprávnění.
 * @param int $id Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function setParents(int $id): DataResponse { return $this->oService->setParents($id); }
    /**
 * @brief Aktualizuje údaje osoby.
 * @param int $id Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function updatePerson(int $id): DataResponse { return $this->oService->updatePerson($id); }
    /**
 * @brief Uloží novou polohu osoby v grafu.
 * @param int $id Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function movePerson(int $id): DataResponse { return $this->oService->movePerson($id); }
    /**
 * @brief Přesune skupinu osob v grafu atomicky.
 * @param int $treeId Identifikátor rodokmenu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function movePeople(int $treeId): DataResponse { return $this->oService->movePeople($treeId); }
    /**
 * @brief Obnoví výchozí rozložení osob v rodokmenu.
 * @param int $treeId Identifikátor rodokmenu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function resetLayout(int $treeId): DataResponse { return $this->oService->resetLayout($treeId); }
    /**
 * @brief Odstraní osobu za podmínek genealogické služby.
 * @param int $id Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function deletePerson(int $id): DataResponse { return $this->oService->deletePerson($id); }
    /**
 * @brief Založí příbuzenský nebo partnerský vztah.
 * @param int $treeId Identifikátor rodokmenu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function createRelation(int $treeId): DataResponse { return $this->oService->createRelation($treeId); }
    /**
 * @brief Odstraní zvolený příbuzenský vztah.
 * @param int $id Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function deleteRelation(int $id): DataResponse { return $this->oService->deleteRelation($id); }
    /**
 * @brief Přidá životní událost k osobě.
 * @param int $personId Identifikátor osoby.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function createEvent(int $personId): DataResponse { return $this->oService->createEvent($personId); }
    /**
 * @brief Odstraní životní událost.
 * @param int $id Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function deleteEvent(int $id): DataResponse { return $this->oService->deleteEvent($id); }
    /**
 * @brief Připojí nový dokument k rodokmenu.
 * @param int $treeId Identifikátor rodokmenu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function createTreeDocument(int $treeId): DataResponse { return $this->oService->createTreeDocument($treeId); }
    /**
 * @brief Upraví metadata a vazby existujícího dokumentu.
 * @param int $id Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function updateDocument(int $id): DataResponse { return $this->oService->updateDocument($id); }
    /**
 * @brief Odstraní evidenci dokumentu podle oprávnění.
 * @param int $id Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function deleteDocument(int $id): DataResponse { return $this->oService->deleteDocument($id); }
    /**
 * @brief Uloží oprávnění sdílení rodokmenu.
 * @param int $treeId Identifikátor rodokmenu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function saveShare(int $treeId): DataResponse { return $this->oService->saveShare($treeId); }
    /**
 * @brief Zruší zvolené sdílení.
 * @param int $id Identifikátor cílového záznamu.
 * @return DataResponse HTTP odpověď s výslednými daty nebo chybovou zprávou ve formátu JSON.
 */
    #[NoAdminRequired] public function deleteShare(int $id): DataResponse { return $this->oService->deleteShare($id); }
    /**
 * @brief Zkontroluje import GEDCOM/GEDZIP určený pro nový strom.
 * @return Response HTTP odpověď předaná klientovi.
 */
    #[NoAdminRequired] public function previewResearchNew(): Response { return $this->oService->previewResearchNew(); }
    /**
 * @brief Připraví náhled importu výzkumných dat do existujícího stromu.
 * @param int $treeId Identifikátor rodokmenu.
 * @return Response HTTP odpověď předaná klientovi.
 */
    #[NoAdminRequired] public function previewResearch(int $treeId): Response { return $this->oService->previewResearch($treeId); }
    /**
 * @brief Provede potvrzený import GEDCOM/GEDZIP.
 * @param int $treeId Identifikátor rodokmenu.
 * @return Response HTTP odpověď předaná klientovi.
 */
    #[NoAdminRequired] public function importResearch(int $treeId): Response { return $this->oService->importResearch($treeId); }
    /**
 * @brief Vygeneruje úplnou nativní ZIP zálohu bez změny dat.
 * @return Response HTTP odpověď předaná klientovi.
 */
    #[NoAdminRequired] #[NoCSRFRequired] public function exportNative(): Response { return $this->oService->exportNative(); }
    /**
 * @brief Předběžně ověří nativní ZIP zálohu.
 * @return Response HTTP odpověď předaná klientovi.
 */
    #[NoAdminRequired] public function previewNative(): Response { return $this->oService->previewNative(); }
    /**
 * @brief Obnoví zálohu jako nové kopie rodokmenů.
 * @return Response HTTP odpověď předaná klientovi.
 */
    #[NoAdminRequired] public function importNative(): Response { return $this->oService->importNative(); }
    /**
 * @brief Vygeneruje GEDCOM 7 pro vybraný rodokmen.
 * @param int $treeId Identifikátor rodokmenu.
 * @return Response HTTP odpověď předaná klientovi.
 */
    #[NoAdminRequired] #[NoCSRFRequired] public function exportGedcom(int $treeId): Response { return $this->oService->exportGedcom($treeId); }
    /**
 * @brief Vrátí médium výzkumu pouze oprávněnému uživateli.
 * @param int $id Identifikátor cílového záznamu.
 * @return Response HTTP odpověď předaná klientovi.
 */
    #[NoAdminRequired] #[NoCSRFRequired] public function researchMedia(int $id): Response { return $this->oService->researchMedia($id); }
}
