<?php
declare(strict_types=1);
namespace OCA\HcFamilyTree\Dashboard;
use OCA\HcFamilyTree\AppInfo\Application; use OCP\Dashboard\IWidget; use OCP\IURLGenerator; use OCP\IL10N; use OCP\Util;
class FamilyTreeWidget implements IWidget {
 public function __construct(private IURLGenerator $url, private IL10N $l10n){}
 public function getId():string{return 'hc_familytree';} public function getTitle():string{return $this->l10n->t('Rodokmen');}
 public function getOrder():int{return 20;} public function getIconClass():string{return 'icon-family';}
 public function getUrl():?string{return $this->url->linkToRoute('hc_familytree.page.index');}
 public function load():void{Util::addScript(Application::APP_ID,'dashboard-1.0.0');}
}
