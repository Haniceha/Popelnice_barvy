# Moje popelnice ♻️

Jednoduchá responzivní webová aplikace v češtině pro přehled svozu čtyř barev popelnic: žluté, černé, modré a hnědé.

## Co aplikace umí
- Týdenní přehled s přepínáním mezi týdny.
- Nastavení pravidelného svozu zvlášť pro sudé a liché týdny.
- Výjimky pro konkrétní týden.
- Uložení nastavení do `localStorage` v prohlížeči, takže zůstane zachované po opětovném otevření na stejném zařízení a ve stejném prohlížeči.
- Čtyři PNG piktogramy v adresáři `assets/`.
- Responzivní zobrazení pro mobil i počítač.

> **Důležité:** Výchozí kombinace barev v `app.js` je pouze ukázková. Nastav si skutečné dny svozu podle kalendáře své obce. Aplikace sama nestahuje obecní harmonogram.

## Soubory
- `index.html` – struktura stránky.
- `style.css` – vzhled a responzivní rozložení.
- `app.js` – chování aplikace a ukládání nastavení.
- `config.json` – přehled barev, názvů a výchozích kombinací pro dokumentaci/konfiguraci.
- `assets/` – piktogramy popelnic.

## Nahrání na GitHub
1. Vytvoř na GitHubu nový repozitář, například `moje-popelnice`.
2. Nahraj **všechny soubory a složky** z tohoto balíčku do kořene repozitáře.
3. Otevři v repozitáři **Settings → Pages**.
4. V části **Build and deployment** zvol `Deploy from a branch`, vyber větev `main` a složku `/ (root)`, potom ulož.
5. Po dokončení publikace se zobrazí adresa webu.

## Spuštění lokálně
Otevři `index.html` v moderním prohlížeči. Pro lokální testování lze také použít rozšíření Live Server ve VS Code.

## Ukládání a soukromí
Nastavení se ukládá pouze do místního úložiště prohlížeče. Nesynchronizuje se automaticky mezi zařízeními a po vymazání dat webu v prohlížeči se může ztratit.

## Úprava výchozích barev
V souboru `app.js` najdi `defaults`:
```js
defaults: { even: ['zluta', 'cerna'], odd: ['modra', 'hneda'] }
```
Uprav seznamy podle potřeby. Uživatel si pak může nastavení změnit také přímo v aplikaci.
