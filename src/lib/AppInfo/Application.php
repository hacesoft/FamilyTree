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
namespace OCA\HcFamilyTree\AppInfo;
use OCA\HcFamilyTree\Dashboard\FamilyTreeWidget;
use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IRegistrationContext;
final class Application extends App implements IBootstrap {
    public const APP_ID = 'hc_familytree';
    /**
 * @brief Inicializuje instanci a propojí předané závislosti.
 * @return void Konstruktor nevrací návratovou hodnotu.
 */
public function __construct() { parent::__construct(self::APP_ID); }
    /**
 * @brief Zaregistruje widget rodokmenu do rozhraní Nextcloudu při registraci aplikace.
 * @param IRegistrationContext $oContext Vstupní parametr „context“ pro operaci register.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
    public function register(IRegistrationContext $oContext): void { $oContext->registerDashboardWidget(FamilyTreeWidget::class); }
    /**
 * @brief Dokončí inicializaci aplikace v bootovací fázi Nextcloudu.
 * @param IBootContext $oContext Vstupní parametr „context“ pro operaci boot.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
    public function boot(IBootContext $oContext): void {}
}
