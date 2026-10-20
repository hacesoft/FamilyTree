<?php

declare(strict_types=1);

use OCP\Util;

// Záměrně pouze nezávislý Guard a CSS aplikace. Core ani hlavní JS se zde nenačítají.
Util::addScript('hc_familytree', 'core-guard');
Util::addStyle('hc_familytree', 'style-1.0.0');
?>
<div
    id="hc_familytree"
    data-hc-shared-app-core-guard
    data-app-name="<?php p($l->t('Rodokmen')); ?>"
    data-app-version="<?php p($_['appVersion']); ?>"
    data-required-core-version="<?php p($_['requiredCoreVersion']); ?>"
    data-required-core-api-version="<?php p($_['requiredCoreApiVersion']); ?>"
    data-core-loading-delay-ms="600"
    data-core-stale-version-attempts="30"
    data-core-stale-version-retry-delay-ms="2000"
    data-core-status-url="<?php p($_['coreStatusUrl']); ?>"
    data-core-style-url="<?php p($_['coreStyleUrl']); ?>"
    data-core-script-url="<?php p($_['coreScriptUrl']); ?>"
    data-app-script-url="<?php p($_['appScriptUrl']); ?>"
    data-core-download-url="<?php p($_['coreDownloadUrl']); ?>"
></div>
