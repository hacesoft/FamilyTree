/**
 * @file Hlídání dostupnosti a kompatibility Hacesoft Shared App Core.
 * Spouští aplikaci až po ověření backendu a načtení odpovídajících assetů.
 *
 * Použité prefixy maďarské notace - Hungarian notation:
 * - o = objekt (object); např. oStatus, oOptions, oElement.
 * - s = řetězec (string); např. sVersion, sUrl.
 * - n = číslo (number); např. nAttempt, nDelay.
 * - b = logická hodnota (boolean); např. bCompatible.
 * - fn = funkce / callback (function); např. fnResolve.
 */
(/** @h05-inline
 * @brief Provede vloženou callback operaci ve zpracovávaném rodokmenu.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
function () {
    'use strict';

    const sAPPID = 'hc_familytree';

    //*************************************************************************
    /**
     * @brief Porovná dvě verze ve formátu major.minor.patch.
     * @param {string} sVersion Skutečná verze nainstalovaného Core.
     * @param {string} sRequired Požadovaná minimální verze Core.
     * @returns {boolean} True, pokud je instalovaná verze dostatečně nová.
     */
    function isVersionAtLeast(sVersion, sRequired) {
        /**
         * @brief Rozloží číslo verze do tří číselných složek.
         * @param {string} sValue Verze v textovém formátu.
         * @returns {number[]|null} Trojice čísel, nebo null pro neplatnou verzi.
         */
        function parseVersion(sValue) {
            const oMatch = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(sValue);
            return oMatch ? [Number(oMatch[1]), Number(oMatch[2]), Number(oMatch[3])] : null;
        }
        const aInstalled = parseVersion(sVersion);
        const aRequired = parseVersion(sRequired);
        if (!aInstalled || !aRequired) return false;
        for (let nIndex = 0; nIndex < 3; nIndex += 1) {
            if (aInstalled[nIndex] > aRequired[nIndex]) return true;
            if (aInstalled[nIndex] < aRequired[nIndex]) return false;
        }
        return true;
    }

    //*************************************************************************
    /**
     * @brief Počká zadaný počet milisekund před dalším pokusem o připojení.
     * @param {number} nDelay Čekání v milisekundách.
     * @returns {Promise<void>} Příslib dokončeného čekání.
     */
    function delay(nDelay) {
        return new Promise(/** @h05-inline
 * @brief Provede vloženou callback operaci ve zpracovávaném rodokmenu.
 * @param {Function} fnResolve Hodnota fnResolve předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
fnResolve => window.setTimeout(fnResolve, nDelay));
    }

    //*************************************************************************
    /**
     * @brief Přidá k URL verzi pro správnou invalidaci cache prohlížeče.
     * @param {string} sUrl Původní adresa assetu.
     * @param {string} sVersion Verze assetu.
     * @returns {string} URL s parametrem v.
     */
    function withVersion(sUrl, sVersion) {
        const oUrl = new URL(sUrl, window.location.href);
        oUrl.searchParams.set('v', sVersion);
        return oUrl.toString();
    }

    //*************************************************************************
    /**
     * @brief Asynchronně připojí JavaScriptový soubor do dokumentu.
     * @param {string} sUrl Adresa JavaScriptového souboru.
     * @returns {Promise<void>} Příslib dokončení, odmítne se při chybě načtení.
     */
    function loadScript(sUrl) {
        return new Promise(/** @h05-inline
 * @brief Provede vloženou callback operaci ve zpracovávaném rodokmenu.
 * @param {Function} fnResolve Hodnota fnResolve předaná callbacku.
 * @param {Function} fnReject Hodnota fnReject předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(fnResolve, fnReject) => {
            const oScript = document.createElement('script');
            oScript.src = sUrl;
            oScript.defer = true;
            oScript.addEventListener('load', /** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
() => fnResolve(), { once: true });
            oScript.addEventListener('error', /** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
() => fnReject(new Error('Script load failed.')), { once: true });
            document.head.append(oScript);
        });
    }

    //*************************************************************************
    /**
     * @brief Asynchronně připojí stylový soubor do dokumentu.
     * @param {string} sUrl Adresa CSS souboru.
     * @returns {Promise<void>} Příslib dokončení, odmítne se při chybě načtení.
     */
    function loadStylesheet(sUrl) {
        return new Promise(/** @h05-inline
 * @brief Provede vloženou callback operaci ve zpracovávaném rodokmenu.
 * @param {Function} fnResolve Hodnota fnResolve předaná callbacku.
 * @param {Function} fnReject Hodnota fnReject předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
(fnResolve, fnReject) => {
            const oLink = document.createElement('link');
            oLink.rel = 'stylesheet';
            oLink.href = sUrl;
            oLink.addEventListener('load', /** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
() => fnResolve(), { once: true });
            oLink.addEventListener('error', /** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
() => fnReject(new Error('Stylesheet load failed.')), { once: true });
            document.head.append(oLink);
        });
    }

    //*************************************************************************
    /**
     * @brief Zobrazí indikátor spouštění, pokud kontrola Core stále probíhá.
     * @param {object} oOptions Nastavení Guardu včetně kořenového elementu.
     * @returns {void} Změní obsah DOM, nevrací hodnotu.
     */
    function showLoading(oOptions) {
        if (oOptions.element.dataset.coreGuardState !== 'checking') return;
        const oSection = document.createElement('section');
        oSection.className = 'hc-shared-app-core-guard-loading';
        oSection.setAttribute('role', 'status');
        oSection.setAttribute('aria-live', 'polite');
        const oSpinner = document.createElement('span');
        oSpinner.className = 'hc-shared-app-core-guard-loading__spinner';
        oSpinner.setAttribute('aria-hidden', 'true');
        const oLabel = document.createElement('span');
        oLabel.textContent = window.t(sAPPID, 'Starting app…');
        oSection.append(oSpinner, oLabel);
        oOptions.element.replaceChildren(oSection);
    }

    //*************************************************************************
    /**
     * @brief Zobrazí informaci o selhání, odkaz na Core a tlačítko pro opakování.
     * @param {object} oOptions Nastavení Guardu a kořenový element.
     * @param {string} sTitle Nadpis chyby.
     * @param {string} sMessage Podrobný popis problému.
     * @param {string} sDownloadUrl Adresa potřebné verze Core.
     * @returns {void} Nahradí obsah aplikace chybovým panelem.
     */
    function showFailure(oOptions, sTitle, sMessage, sDownloadUrl) {
        const oSection = document.createElement('section');
        oSection.className = 'hc-shared-app-core-guard';
        oSection.setAttribute('role', 'alert');
        const oHeading = document.createElement('h1');
        oHeading.textContent = sTitle;
        const oDetail = document.createElement('p');
        oDetail.textContent = sMessage;
        const oActions = document.createElement('div');
        oActions.className = 'hc-shared-app-core-guard__actions';
        const oDownload = document.createElement('a');
        oDownload.href = sDownloadUrl;
        oDownload.target = '_blank';
        oDownload.rel = 'noopener noreferrer';
        oDownload.textContent = window.t(sAPPID, 'Download Shared App Core');
        const oRetry = document.createElement('button');
        oRetry.type = 'button';
        oRetry.textContent = window.t(sAPPID, 'Try again');
        oRetry.addEventListener('click', /** @h05-inline
 * @brief Obslouží uživatelskou událost a aktualizuje příslušný stav.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
() => window.location.reload());
        oActions.append(oDownload, oRetry);
        oSection.append(oHeading, oDetail, oActions);
        oOptions.element.dataset.coreGuardState = 'failed';
        oOptions.element.setAttribute('aria-busy', 'false');
        oOptions.element.replaceChildren(oSection);
    }

    //*************************************************************************
    /**
     * @brief Ověří verzi Core, načte kompatibilní assety a následně spustí aplikaci.
     * @param {object} oOptions Guard konfigurace z data-* atributů, včetně verzí a URL.
     * @returns {Promise<boolean>} True po úspěšném startu, false při chybě.
     */
    async function startCoreGuard(oOptions) {
        const nAttempts = Math.max(1, oOptions.attempts ?? 5);
        const nRetryDelay = Math.max(100, oOptions.retryDelayMs ?? 800);
        const nStaleAttempts = Math.max(1, oOptions.staleVersionAttempts ?? 30);
        const nStaleRetryDelay = Math.max(250, oOptions.staleVersionRetryDelayMs ?? 2000);
        const nLoadingDelay = Math.max(0, oOptions.loadingDelayMs ?? 600);
        const nRequiredApiVersion = Math.max(1, oOptions.requiredApiVersion ?? 1);
        oOptions.element.dataset.coreGuardState = 'checking';
        oOptions.element.setAttribute('aria-busy', 'true');
        const nLoadingTimer = window.setTimeout(/** @h05-inline
 * @brief Provede odloženou akci po uplynutí požadovaného intervalu.
 * @returns {void} Výsledná hodnota nebo dokončení callbacku.
 */
() => showLoading(oOptions), nLoadingDelay);
        /**
 * @brief Zruší přechodový stav načítání a vyčistí související indikátor.
 * @returns {unknown} Výsledek uvedené operace nebo informace o jejím dokončení.
 */
const fnClearLoading = () => window.clearTimeout(nLoadingTimer);
        let oStatus = null;
        let nAttempt = 0;
        let nStaleAttempt = 0;
        for (;;) {
            let oFound = null;
            try {
                const oStatusUrl = new URL(oOptions.statusUrl, window.location.href);
                oStatusUrl.searchParams.set('_guard', String(Date.now()));
                const oResponse = await fetch(oStatusUrl.toString(), {
                    credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' }
                });
                if (oResponse.ok) {
                    const oData = await oResponse.json();
                    if (oData.app === 'hc_shared_app_core' && oData.contract === 'hc-shared-app-core-v1' && oData.version) {
                        oFound = oData;
                    }
                }
            } catch { /* Dočasná chyba při čekání na připravenost serveru. */ }
            if (oFound?.version) {
                oStatus = oFound;
                if (isVersionAtLeast(oFound.version, oOptions.requiredVersion) || ++nStaleAttempt >= nStaleAttempts) break;
                await delay(nStaleRetryDelay);
                continue;
            }
            if (++nAttempt >= nAttempts) break;
            await delay(nRetryDelay * nAttempt);
        }
        if (!oStatus?.version) {
            fnClearLoading();
            showFailure(oOptions, oOptions.appName + window.t(sAPPID, ' cannot be started'),
                window.t(sAPPID, 'The app cannot continue because Shared App Core is missing, disabled, or incompatible.'), oOptions.downloadUrl);
            return false;
        }
        if (!isVersionAtLeast(oStatus.version, oOptions.requiredVersion)) {
            fnClearLoading();
            showFailure(oOptions, window.t(sAPPID, 'Shared App Core is outdated'),
                window.t(sAPPID, '{name} requires Core {required} or newer. Installed: {installed}.', {
                    name: oOptions.appName, required: oOptions.requiredVersion, installed: oStatus.version
                }), oStatus.downloadUrl ?? oOptions.downloadUrl);
            return false;
        }
        try {
            await Promise.all([
                loadStylesheet(withVersion(oOptions.coreStyleUrl, oStatus.version)),
                loadScript(withVersion(oOptions.coreScriptUrl, oStatus.version))
            ]);
            const oCore = window.HcSharedAppCore;
            if (!oCore || oCore.version !== oStatus.version || oCore.apiVersion !== (oStatus.apiVersion ?? nRequiredApiVersion) || oCore.apiVersion < nRequiredApiVersion) {
                throw new Error('Core frontend and backend contract mismatch.');
            }
            await loadScript(withVersion(oOptions.appScriptUrl, oOptions.appVersion ?? oOptions.requiredVersion));
            fnClearLoading();
            oOptions.element.dataset.coreGuardState = 'ready';
            oOptions.element.setAttribute('aria-busy', 'false');
            return true;
        } catch {
            fnClearLoading();
            showFailure(oOptions, oOptions.appName + window.t(sAPPID, ' cannot be started'),
                window.t(sAPPID, 'Required application or Shared App Core files could not be loaded.'), oOptions.downloadUrl);
            return false;
        }
    }

    const oRoot = document.querySelector('[data-hc-shared-app-core-guard]');
    if (oRoot) {
        startCoreGuard({
            element: oRoot,
            appName: oRoot.dataset.appName ?? window.t(sAPPID, 'the app'),
            appVersion: oRoot.dataset.appVersion,
            requiredVersion: oRoot.dataset.requiredCoreVersion ?? '0.1.0',
            statusUrl: oRoot.dataset.coreStatusUrl ?? '',
            coreStyleUrl: oRoot.dataset.coreStyleUrl ?? '',
            coreScriptUrl: oRoot.dataset.coreScriptUrl ?? '',
            appScriptUrl: oRoot.dataset.appScriptUrl ?? '',
            downloadUrl: oRoot.dataset.coreDownloadUrl ?? 'https://github.com/hacesoft/core',
            loadingDelayMs: Number(oRoot.dataset.coreLoadingDelayMs ?? 600),
            staleVersionAttempts: Number(oRoot.dataset.coreStaleVersionAttempts ?? 30),
            staleVersionRetryDelayMs: Number(oRoot.dataset.coreStaleVersionRetryDelayMs ?? 2000),
            requiredApiVersion: Number(oRoot.dataset.requiredCoreApiVersion ?? 1)
        });
    }
})();
