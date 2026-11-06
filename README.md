# Loredo’s Automobile – Webseite

Webseite für den Gebrauchtwagenhandel Loredo’s Automobile in Bad Berneck.

Die Seite besteht nur aus einfachen Dateien. Es gibt keine Datenbank und
keinen Baukasten, und gebaut werden muss nichts. Mit PHP (z. B. bei Hostinger)
verschickt das Kontaktformular E-Mails; ohne PHP (GitHub Pages) schicken Kunden
die vorbereitete Anfrage per WhatsApp oder E-Mail.

- **Fahrzeuge pflegen:** `fahrzeuge.js` (Text) und `fahrzeuge/<Nummer>/` (Fotos)
- **Anleitung:** [ANLEITUNG.md](ANLEITUNG.md)

## Online

**https://loredosautomobile.de** bei Hostinger, automatisch aus diesem Repository
(Zweig `main`). Änderungen sind kurz nach dem Speichern online.
Einrichtung und Umzug auf eine eigene Domain: siehe [ANLEITUNG.md](ANLEITUNG.md).

## Online-Link auf claude.ai

Die Seite ist zusätzlich als einzelne Datei unter
**https://claude.ai/artifact/M64J5Hc9ddDudxSD9UsVmK** online.

- `claude-vorschau.html` ist genau diese Seite (Fotos aus `fahrzeuge/`).
- `werkzeuge/bauen.sh` baut sie nach Änderungen neu.
- Beides muss beim Hochladen auf eine eigene Domain nicht mit hochgeladen werden.
