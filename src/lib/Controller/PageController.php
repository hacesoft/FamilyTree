<?php
declare(strict_types=1);
namespace OCA\HcFamilyTree\Controller;
use OCA\HcFamilyTree\AppInfo\Application;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\Attribute\NoAdminRequired;
use OCP\AppFramework\Http\Attribute\NoCSRFRequired;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IRequest;
use OCP\IURLGenerator;
final class PageController extends Controller {
    public function __construct(IRequest $request, private IURLGenerator $urlGenerator) { parent::__construct(Application::APP_ID, $request); }
    #[NoAdminRequired]
    #[NoCSRFRequired]
    public function index(): TemplateResponse {
        $aContract = json_decode((string)file_get_contents(__DIR__ . '/../../appinfo/hc_shared_app_core.json'), true, 512, JSON_THROW_ON_ERROR);
        return new TemplateResponse(Application::APP_ID, 'main', [
            'appVersion' => Application::VERSION,
            'requiredCoreVersion' => (string)$aContract['requiredVersion'],
            'requiredCoreApiVersion' => (int)$aContract['requiredApiVersion'],
            'coreDownloadUrl' => (string)$aContract['downloadUrl'],
            'coreStatusUrl' => $this->urlGenerator->linkTo('', 'index.php/apps/hc_shared_app_core/api/v1/status'),
            'coreStyleUrl' => $this->urlGenerator->linkTo('hc_shared_app_core', 'css/workspace.css'),
            'coreScriptUrl' => $this->urlGenerator->linkTo('hc_shared_app_core', 'js/hc_shared_app_core.js'),
            'appScriptUrl' => $this->urlGenerator->linkTo(Application::APP_ID, 'js/app-1.0.0.js'),
        ]);
    }
}
