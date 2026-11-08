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
namespace OCA\HcFamilyTree\Dashboard;
use OCA\HcFamilyTree\AppInfo\Application; use OCP\Dashboard\IWidget; use OCP\IURLGenerator; use OCP\IL10N; use OCP\Util;
class FamilyTreeWidget implements IWidget {
 /**
 * @brief Inicializuje instanci a propojí předané závislosti.
 * @param IURLGenerator $oUrl Vstupní parametr „url“ pro operaci __construct.
 * @param IL10N $oL10n Překladová služba Nextcloudu.
 * @return void Konstruktor nevrací návratovou hodnotu.
 */
public function __construct(private IURLGenerator $oUrl, private IL10N $oL10n){}
 /**
 * @brief Vrátí stabilní identifikátor dashboardového widgetu nebo aplikace.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
 public function getId():string{return 'hc_familytree';} /**
 * @brief Vrátí zobrazovaný název dashboardového widgetu.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
public function getTitle():string{return $this->oL10n->t('FamilyTree');}
 /**
 * @brief Vrátí order používané v FamilyTreeWidget.
 * @return int Vypočtená číselná hodnota nebo identifikátor dle významu operace.
 */
 public function getOrder():int{return 20;} /**
 * @brief Vrátí CSS třídu ikony dashboardového widgetu.
 * @return string Výsledný text nebo přenosová reprezentace dat.
 */
public function getIconClass():string{return 'icon-family';}
 /**
 * @brief Vrátí odkaz pro otevření aplikace FamilyTree.
 * @return ?string Textový výsledek, nebo null pokud není dostupný.
 */
 public function getUrl():?string{return $this->oUrl->linkToRoute('hc_familytree.page.index');}
 /**
 * @brief Načte family tree widget používané v FamilyTreeWidget.
 * @return void Bez návratové hodnoty; případné změny jsou popsány účelem metody.
 */
 public function load():void{Util::addScript(Application::APP_ID,'dashboard-1.1.1');}
}
