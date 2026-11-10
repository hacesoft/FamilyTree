# Import badatelských nálezů do existujícího rodokmenu (1.1.5)

Tento režim slouží k **doplnění stávajícího rodokmenu** o nově dohledané osoby, rodiče, doložené partnerské vztahy, události, archivní obrázky a položky výzkumného deníku. **Není to** obnova úplné zálohy ani běžný GEDCOM import „aktualizovat podle UID“.

## Postup

1. Nejprve proveďte úplnou nativní ZIP zálohu rodokmenu a také zálohu databáze a Souborů Nextcloudu.
2. Otevřete správný existující strom, do kterého chcete doplnit nálezy, a zkontrolujte, že máte právo editace.
3. V hlavní nabídce aplikace nebo nabídce stromu zvolte **Import → Importovat nálezy do existujícího rodokmenu (ZIP)**.
4. Vyberte celý výzkumný ZIP, například `familytree-findings-example.zip` – **nikoli** jednotlivý JSON deníku.
5. Klikněte na **Zkontrolovat nálezy**. Zkontrolujte počet existujících a nových osob, vztahy, události, obrázky, nové a existující položky deníku a upozornění.
6. Nejasnou osobu lze přiřadit ručně ke stabilnímu ID ze stávajícího stromu. Po změně mapování vždy zopakujte náhled. Nepotvrzujte import, dokud jsou konflikty.
7. Potvrďte kontrolu a zálohu, potom klikněte na **Importovat schválené nálezy**.
8. Po importu projděte rodokmen, dokumenty, výzkumný deník, návrhy a historii. Především zkontrolujte rodiče a důkazy.

## Co je v ZIPu

Podporovaný **balíček nálezů** obsahuje přesně jeden `.gdz` s GEDCOM 7 (`gedcom.ged` v jeho kořeni), volitelný JSON `mapovani_existujicich_osob.json` se stabilními ID, volitelný `01_IMPORT_DO_STAVAJICIHO_DENIKU.json` nebo soubor končící `_DENIK_IMPORT.json` a volitelné obrázky v `dukazy/` (včetně `SHA256SUMS.txt`). Nejde o libovolný ZIP ani úplnou nativní zálohu. Velikost vstupního archivu nejvýše 64 MiB; součásti podléhají dalším limitům a kontrolám.

## Bezpečnost a omezení

- Přesná shoda stabilního ID umožňuje navázat na existující osobu. **Jméno samo o sobě není dostatečným důkazem totožnosti.** Pokud identifikátor chybí a jméno již existuje, import se zablokuje do ručního přiřazení.
- Existující údaje osob a událostí se **nepřepisují**; nová nebo odlišná tvrzení se zachovají ve výzkumné vrstvě. Neověřená partnerství bez doloženého sňatku se nevytvářejí automaticky.
- Rodinné vazby nesmějí vytvořit třetího rodiče nebo cyklus. Konflikty znamenají zastavení před zápisem.
- Snímky se ukládají soukromě do Souborů vlastníka stromu pod `Rodokmen/Import/<ID-stromu>/nalezy/`. Podle zdrojových vazeb se připojují k osobám; zbylé pracovní snímky zůstávají neověřenými dokumenty bez automatického potvrzení faktů.
- Výzkumný deník se importuje append-only; existující položky se přeskočí a jejich stav ověření se nemění.
- Potvrzený import používá databázovou transakci a při chybě se pokusí odstranit jen nově vytvořené soubory. **Nenahrazuje pravidelnou zálohu a neřeší automaticky všechny genealogické spory.**
- Opakovaný import stejného balíčku nesmí vytvářet další stejné osoby, vztahy, události ani dokumenty. Nové externí balíčky vždy předem prověřte.

**Zvlášť důležité:** JSON v samostatném dialogu „Import výzkumného deníku“ stále doplňuje pouze deník, nikoli osoby, vztahy nebo obrázky. Nový režim je samostatný importní průvodce v aplikaci FamilyTree 1.1.5.
