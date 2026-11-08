# Lokalizace serverových hlášení

Server používá anglické zdrojové klíče. Uživatelské zprávy s odpovídajícím katalogem se před překladem nesmějí odvozovat z uložených genealogických dat.

Při převodu **není dovoleno** měnit historické identifikátory či poznámky, například prefix `Import výzkumného deníku ` používaný při rekonstrukci původních úkolů. Starší české odpovědi zůstávají interpretovatelné přes `legacy-l10n-keys.json`, i když server nově vrací anglické zdrojové věty.

Dynamické zprávy byly převedeny na anglické šablony s pojmenovanými parametry a klientské rozhraní umí parametrizované serverové odpovědi přeložit. Kontrola všech 11 jazyků zatím zůstává neuzavřená kvůli 600 chybějícím starším překladům v každém z devíti dalších jazyků.
