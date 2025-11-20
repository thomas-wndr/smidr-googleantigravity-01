# Smidr OpenAI Agent Interface

Dette prosjektet er et web-grensesnitt for en OpenAI Agent, designet for å kjøre på **Hostinger Shared Hosting** (eller hvilken som helst standard PHP-webserver).

Det bruker **OpenAI ChatKit** for selve chat-opplevelsen, men med en tilpasset backend for sikker autentisering.

## 📂 Prosjektstruktur

- **`public/`**: Denne mappen inneholder alle filene som skal lastes opp til webserveren (`public_html`).
  - `index.html`: Hovedsiden. Inneholder HTML-strukturen og laster inn fonter/scripts.
  - `style.css`: Stilsettet. Definerer utseendet (hvit boks, runde hjørner, sentrert tekst, Inter font).
  - `script.js`: Frontend-logikken. Laster inn `<openai-chatkit>`-elementet og henter sesjonstoken fra backend.
  - `chat.php`: Backend-scriptet. Fungerer som et mellomledd for å generere sikre sesjonstokens fra OpenAI uten å eksponere API-nøkkelen din.
- **`.env.example`**: Mal for miljøvariabler.

## 🚀 Hvordan få dette til å fungere (Deployment Guide)

### 1. Forberedelser
Du trenger:
- En **OpenAI API Key** (fra platform.openai.com).
- En **Workflow ID** (fra OpenAI Agent Builder).
- Tilgang til filbehandleren på din webserver (f.eks. Hostinger File Manager).

### 2. Opplasting av filer
1. Gå til din webservers filbehandler (vanligvis mappen `public_html`).
2. Last opp **innholdet** av `public/`-mappen (`index.html`, `style.css`, `script.js`, `chat.php`) direkte til `public_html`.
   - *Viktig*: Ikke last opp selve mappen "public", men filene inni den.

### 3. Konfigurasjon (.env)
1. Opprett en ny fil på serveren din som heter `.env` (husk punktum først).
   - *Sikkerhetstips*: Det er best å legge denne filen i mappen **over** `public_html` slik at den ikke er tilgjengelig fra nettet. Hvis du må legge den i `public_html`, sørg for å beskytte den (f.eks. med `.htaccess`).
2. Lim inn følgende innhold og fyll ut dine nøkler:
   ```ini
   OPENAI_API_KEY=sk-din-nøkkel-her
   WORKFLOW_ID=wf_din-workflow-id-her
   ```

### 4. Hvordan det fungerer (Teknisk)

#### Backend (`chat.php`)
Siden Hostinger Shared Hosting ikke støtter Node.js servere "out of the box", bruker vi PHP.
- Scriptet ser etter `.env`-filen (både i mappen over og i samme mappe).
- Det mottar en forespørsel fra frontend.
- Det bruker `curl` for å snakke med OpenAI's API (`https://api.openai.com/v1/chatkit/sessions`).
- Det returnerer en `client_secret` (sesjonstoken) tilbake til frontend.

#### Frontend (`script.js` & `index.html`)
- Vi bruker den offisielle ChatKit-scriptet fra OpenAI's CDN.
- `script.js` venter på at `<openai-chatkit>`-elementet skal bli definert av nettleseren.
- Når det er klart, kaller den `setOptions` og forteller ChatKit hvordan den skal hente sesjonstokenet (ved å kalle `chat.php`).
- Dette gjør at chatten fungerer sikkert uten at API-nøkkelen din noen gang sendes til brukerens nettleser.

## 🛠 Feilsøking

### "Square" / Tom boks vises
- Dette betyr at CSS lastes, men ChatKit-widgeten ikke starter.
- Sjekk nettleserens konsoll (F12).
- Hvis du ser 401/403/500 feil på `chat.php`: Sjekk at `.env`-filen eksisterer og har riktige nøkler.
- Hvis du ser "openai-chatkit is not defined": Sjekk at du ikke har noen adblockere som blokkerer OpenAI's CDN.

### Endringer vises ikke
- Nettleseren cacher ofte CSS og JS filer hardt.
- Prøv å åpne siden i Incognito/Privat modus, eller tving en oppdatering med `Ctrl + Shift + R`.

### 403 Forbidden på nettsiden
- Sjekk at du har en `index.html` fil direkte i `public_html` mappen.

---
*Generert av Antigravity Agent - 20.11.2025*