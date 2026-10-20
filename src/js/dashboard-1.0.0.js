(() => {
  'use strict'
  const APP = 'hc_familytree'
  const tr = label => typeof window.t === 'function' ? window.t(APP, label) : label
  const esc = text => String(text ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char])

  OCA.Dashboard.register(APP, async element => {
    const url = OC.generateUrl('/apps/hc_familytree/')
    element.textContent = tr('Načítání rodokmenu…')
    try {
      const response = await fetch(OC.generateUrl('/apps/hc_familytree/api/dashboard'), {
        headers: { requesttoken: OC.requestToken },
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      element.innerHTML = `<div style="padding:16px"><div style="display:flex;gap:24px;margin-bottom:14px">
        <span><b style="font-size:24px">${esc(data.trees)}</b><br>${tr('rodokmenů')}</span>
        <span><b style="font-size:24px">${esc(data.people)}</b><br>${tr('osob')}</span>
        </div><b>${tr('Naposledy upravené')}</b>
        ${(data.recent || []).map(person => `<div style="padding:7px 0;border-bottom:1px solid var(--color-border)">👤 ${esc(person.name)}</div>`).join('')}
        <a class="button primary" style="margin-top:14px" href="${esc(url)}">${tr('Otevřít Rodokmen')}</a></div>`
    } catch {
      element.textContent = tr('Rodokmen nelze načíst.')
    }
  })
})()
