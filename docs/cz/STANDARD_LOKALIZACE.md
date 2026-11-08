# Standard lokalizace Hacesoft (všechny aplikace Nextcloud)

- **Angličtina (EN)** je výchozí a zdrojový jazyk včetně záložního zobrazení (fallback). **Čeština (`cs`)** je plnohodnotný překlad; použije se jazyk účtu Nextcloudu, pokud je podporovaný.
- Veškeré uživatelské texty z JavaScriptu i PHP (dialogy, upozornění, chyby, validační hlášení, widgety, popisy pro přístupnost, import i export) musí procházet lokalizačním systémem Nextcloudu a být udržované v `l10n/*.json` / `*.js`.
- Nové zdrojové řetězce psát v angličtině. Používat překladové funkce `t()` v JavaScriptu a `IL10N->t()` v PHP a pojmenované parametry místo skládání vět.
- Pokud překlad chybí, zobrazit původní anglickou větu, nikoli automaticky češtinu.
- Uživatelsky vložená genealogická data, jména, přepisy matrik, poznámky, citace, místa a importované soubory se nesmějí automaticky překládat.
- Před veřejným vydáním testovat `en`, `cs` a nepodporovaný jazyk, shodu obou katalogů i uživatelské chybové zprávy.

## FamilyTree 1.1.0-dev20 – převod na anglické klíče

Všech **848 zdrojových překladových klíčů je již anglických**. `en.json` obsahuje anglické klíče i hodnoty, `cs.json` stejné anglické klíče s českými hodnotami a ostatní jazyky používají stejné zdrojové klíče. Soubory `l10n/*.js` jsou nově čitelně naformátované (každý překlad zvlášť) a shodují se s JSON. Formát znovu sjednotí `npm run format:l10n`.

V JavaScriptu byly převedeny překladové funkce a řada statických HTML textů. **Přechodová kompatibilní vrstva** dočasně převádí starší české zprávy z PHP a zbývající starší statické texty na anglické klíče. Historické genealogické údaje, staré přepisy a názvy se nesmějí hromadně nahrazovat. Část starších PHP hlášení a zdrojových textů UI ještě vyžaduje samostatné dočištění; samotná správná struktura katalogů nezaručuje úplnou lokalizaci za běhu.

## Podporované jazykové katalogy

Jazyky: `en`, `cs`, `de`, `es`, `fr`, `it`, `nl`, `pl`, `pt`, `sk`, `uk`. Nové jazyky mají ověřené překlady tam, kde jsou dostupné; chybějící položky se zobrazí v angličtině. Před veřejným vydáním je nutná **100% kontrola pokrytí** i jazyková revize. Kontrolní příkazy: `npm run l10n:coverage` a `npm run l10n:strict`. Nedokončený katalog se nesmí vydávat za úplný překlad.

`pt_PT` je alias evropské portugalštiny pro Nextcloud (`pt`).
