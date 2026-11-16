# Gym Builder - Web App Palestra & Schede

Web App moderna, reattiva e ottimizzata per mobile, progettata per la palestra con:
- Calcolo automatico delle schede in base ai macchinari posseduti.
- Sistema multi-account integrato con salvataggio dati persistente e sincronizzabile con Git.
- Calcolo dei carichi base di partenza in proporzione al peso corporeo e allo stile di vita (sedentario, moderato, attivo).
- Modulazione dei tempi di recupero e ripetizioni in base all'obiettivo (ipertrofia, forza, dimagrimento, mantenimento, ricomposizione).
- Video tecnici vettoriali CAD stilizzati con simulazione biomeccanica, angoli articolari, vettori e attivazione muscolare (nessun video esterno da YouTube).
- Avvio e tracciamento dell'allenamento direttamente dalla schermata "Scheda" con timer di recupero sonoro e registro pesi per serie.
- Design scuro minimalista ad alto contrasto: Nero, Grigio Scuro e Arancione fluo. Zero emoji.

---

## 1. Avvio Rapido Locale

### Opzione rapida su Windows
Fai doppio clic sul file `Avvia-GymApp.bat`.

### Da terminale
```bash
npm install
npm run dev
```
La web app sarà attiva su `http://localhost:5173/`.

---

## 2. Come Pubblicare la Web App su GitHub

Il progetto include già la configurazione per GitHub Pages (`base: './'` in `vite.config.ts`) e una GitHub Action automatica in `.github/workflows/deploy.yml`.

1. Crea un repository vuoto su [GitHub](https://github.com/new) (es. `GymApp`).
2. Dal terminale nella cartella del progetto esegui:
   ```bash
   git add .
   git commit -m "Setup GymApp Web App"
   git remote add origin https://github.com/TUO-USERNAME/GymApp.git
   git branch -M main
   git push -u origin main
   ```
3. Su GitHub vai in **Settings** -> **Pages** -> **Build and deployment**:
   - Sotto **Source**, seleziona **GitHub Actions**.
4. In automatico la GitHub Action compilerà e pubblicherà la tua Web App all'indirizzo:
   `https://TUO-USERNAME.github.io/GymApp/`

---

## 3. Gestione Account e Dati con Git

- L'app permette di creare più profili atleti (es. "Alessandro", "Marco", ecc.). Ciascun account mantiene la propria scheda, peso corporeo, stile di vita e storico dei carichi.
- Per salvare tutti i dati dei vari account su Git:
  1. Clicca sul pulsante dell'account in alto a destra.
  2. Clicca su **"Esporta JSON per Git"**.
  3. Salva il file nella cartella del repository ed esegui `git add . && git commit -m "Backup dati schede" && git push`.
  4. Su qualsiasi dispositivo potrai cliccare **"Ripristina JSON da Git"** per caricare istantaneamente tutti i profili e le schede aggiornate.
