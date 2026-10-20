<?php
declare(strict_types=1);
namespace OCA\HcFamilyTree\AppInfo;
use OCA\HcFamilyTree\Dashboard\FamilyTreeWidget;
use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IRegistrationContext;
final class Application extends App implements IBootstrap {
    public const APP_ID = 'hc_familytree';
    public const VERSION = '1.0.0';
    public function __construct() { parent::__construct(self::APP_ID); }
    public function register(IRegistrationContext $context): void { $context->registerDashboardWidget(FamilyTreeWidget::class); }
    public function boot(IBootContext $context): void {}
}
