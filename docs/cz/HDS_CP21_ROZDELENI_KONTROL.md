# Kontroly HDS a Publisher CP21

- `npm run check`: lokální technická kontrola zdrojů a regresních testů. **Není to schválení vydání.**
- `npm run hds:baseline`: audit HDS 1.2.1 (vyžaduje `HDS_CHECKER`).
- `npm run hds:release`: přísná kontrola HDS 1.2.1, nesplněné brány blokují vydání.
- Publisher CP21: podpis, certifikát, ověření prostředí a publikační workflow; spouští se až v Publisheru. Bez jeho spuštění není CP21 ověřen.

Historický CP19 se nepoužívá jako aktuální schvalovací kritérium.
