# Lišta a legenda – FamilyTree 1.1.0-dev9

V nabídce aplikace ⋯ → **Nastavení → Zobrazení** lze nastavit:

- **Zobrazit přehled osob, vztahů a větví v horní liště**: výchozí stav vypnuto. V liště se po zapnutí objeví počty osob, zobrazených vztahů a větví a dostupné počty importních sad či výzkumných variant. Původní překryvné počítadlo v ploše stromu je skryto.
- **Povolit přesouvání legendy po celé pracovní oblasti**: výchozí stav zapnuto. Úchyt ⠿ přesouvá legendu i na volné místo v levém panelu nebo horní liště. Po vypnutí zůstává legenda na své pozici, ale úchyt zmizí.
- **Obnovit výchozí polohu legendy**: smaže uloženou polohu a vrátí legendu do pravého dolního rohu plochy rodokmenu.

Poloha se ukládá **pro tento prohlížeč** pomocí localStorage, stejně jako dosavadní nastavení zobrazení. Při změně velikosti okna se pozice omezí na pracovní oblast aplikace, aby legenda nezmizela mimo obrazovku. Dříve uložená poloha legendy se nepřevádí. Nové umístění je potřeba nastavit znovu.

Žádná z těchto voleb neupravuje genealogická data a není potřeba databázová migrace.

## Přiblížení a zobrazení celého rodokmenu

Celá pracovní plocha zůstává při všech úrovních oddálení stejně velká. Měřítko se mění pouze u vnitřní kresby stromu prostřednictvím transformace. Tlačítko **Celý strom** zachovává proporce a vystředí strom do dostupné plochy s okrajem 14 px. Podporována je myš, kolečko, dotykové posunutí a pinch zoom. Nejde o změnu dat ani vzhledu jednotlivých uzlů; platí stejně pro světlý a tmavý motiv.
