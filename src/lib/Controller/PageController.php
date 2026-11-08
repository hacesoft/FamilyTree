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
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\Attribute\NoAdminRequired;
use OCP\AppFramework\Http\Attribute\NoCSRFRequired;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IRequest;
use OCP\App\IAppManager;
use OCP\IURLGenerator;
final class PageController extends Controller {
    /**
 * @brief Inicializuje instanci a propojí předané závislosti.
 * @param IRequest $oRequest Objekt HTTP požadavku.
 * @param IURLGenerator $oUrlGenerator Vstupní parametr „urlGenerator“ pro operaci __construct.
 * @param IAppManager $oAppManager Vstupní parametr „appManager“ pro operaci __construct.
 * @return void Konstruktor nevrací návratovou hodnotu.
 */
public function __construct(IRequest $oRequest, private IURLGenerator $oUrlGenerator, private IAppManager $oAppManager) { parent::__construct(Application::APP_ID, $oRequest); }
    /**
 * @brief Připraví úvodní stránku aplikace FamilyTree pro vykreslení v Nextcloudu.
 * @return TemplateResponse HTTP odpověď s vykreslenou šablonou stránky.
 */
    #[NoAdminRequired]
    #[NoCSRFRequired]
    public function index(): TemplateResponse {
        $aContract = json_decode((string)file_get_contents(__DIR__ . '/../../appinfo/hc_shared_app_core.json'), true, 512, JSON_THROW_ON_ERROR);
        return new TemplateResponse(Application::APP_ID, 'main', [
            'appVersion' => $this->oAppManager->getAppVersion(Application::APP_ID),
            'requiredCoreVersion' => (string)$aContract['requiredVersion'],
            'requiredCoreApiVersion' => (int)$aContract['requiredApiVersion'],
            'coreDownloadUrl' => (string)$aContract['downloadUrl'],
            'coreStatusUrl' => $this->oUrlGenerator->linkTo('', 'index.php/apps/hc_shared_app_core/api/v1/status'),
            'coreStyleUrl' => $this->oUrlGenerator->linkTo('hc_shared_app_core', 'css/workspace.css'),
            'coreScriptUrl' => $this->oUrlGenerator->linkTo('hc_shared_app_core', 'js/hc_shared_app_core.js'),
            'appScriptUrl' => $this->oUrlGenerator->linkTo(Application::APP_ID, 'js/app-1.1.1.js'),
        ]);
    }
}
