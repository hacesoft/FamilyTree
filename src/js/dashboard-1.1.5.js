/**
 * @file Dashboardový widget pro souhrn rodokmenů.
 * Maďarská notace: s = řetězec, n = číslo, b = boolean, a = pole,
 * o = objekt, fn = funkce a h = HTML prvek.
 */
(/** @h05-inline
 * @brief Provede vloženou callback operaci ve zpracovávaném rodokmenu.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
() => {
    'use strict';
    const sAPP = 'hc_familytree';
    const oFallback = {
        "Recently updated": "Recently updated",
        "Could not load family trees.": "Could not load family trees.",
        "people": "people",
        "family trees": "family trees"
    };
    const sLanguage = String(window.OC?.getLanguage?.() || document.documentElement.lang || 'en').toLowerCase();
    /**
     * @brief Překládá systémový popisek pomocí katalogu Nextcloudu a anglického fallbacku.
     * @param {string} sLabel Anglický zdrojový klíč.
     * @returns {string} Lokalizovaný text.
     */
    const fnTr = sLabel => {
        // Nextcloud handles Czech and all other available locale catalogs.
        const oTranslated = typeof window.t === 'function' ? window.t(sAPP, sLabel) : sLabel;
        return oTranslated !== sLabel ? oTranslated : (oFallback[sLabel] || sLabel);
    };
    /**
     * @brief Zabezpečuje text pro vložení do HTML bez interpretace značek.
     * @param {unknown} sText Vstupní hodnota z datové odpovědi.
     * @returns {string} HTML-escapovaný text.
     */
    const fnEsc = sText => String(sText ?? '').replace(/[&<>"']/g, /** @h05-inline
 * @brief Vytvoří náhradní text pro odpovídající část řetězce.
 * @param {string} sChar Hodnota sChar předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
sChar => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[sChar]);
    /**
     * @brief Načítá souhrn rodokmenů pro widget a vykresluje bezpečný náhled.
     * @param {HTMLElement} element Kořenový prvek widgetu.
     * @returns {Promise<void>} Dokončení vykreslení nebo zobrazení chybové zprávy.
     */
    OCA.Dashboard.register(sAPP, /** @h05-inline
 * @brief Provede vloženou callback operaci ve zpracovávaném rodokmenu.
 * @param {HTMLElement} hElement Hodnota hElement předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
async (hElement) => {
        const sUrl = OC.generateUrl('/apps/hc_familytree/');
        hElement.textContent = fnTr("Loading family tree…");
        try {
            const oResponse = await fetch(OC.generateUrl('/apps/hc_familytree/api/dashboard'), {
                headers: { requesttoken: OC.requestToken },
            });
            if (!oResponse.ok)
                throw new Error(`HTTP ${oResponse.status}`);
            const oData = await oResponse.json();
            hElement.innerHTML = `<div style="padding:16px"><div style="display:flex;gap:24px;margin-bottom:14px">
        <span><b style="font-size:24px">${fnEsc(oData.trees)}</b><br>${fnTr("family trees")}</span>
        <span><b style="font-size:24px">${fnEsc(oData.people)}</b><br>${fnTr("people")}</span>
        </div><b>${fnTr("Recently updated")}</b>
        ${(oData.recent || []).map(/** @h05-inline
 * @brief Převede prvek kolekce na hodnotu pro vykreslení či další zpracování.
 * @param {unknown} oPerson Hodnota oPerson předaná callbacku.
 * @returns {unknown} Výsledná hodnota nebo dokončení callbacku.
 */
oPerson => `<div style="padding:7px 0;border-bottom:1px solid var(--color-border)">👤 ${fnEsc(oPerson.name)}</div>`).join('')}
        <a class="button primary" style="margin-top:14px" href="${fnEsc(sUrl)}">${fnTr("Open Family Tree")}</a></div>`;
        }
        catch {
            hElement.textContent = fnTr("Family Tree could not be loaded.");
        }
    });
})();
