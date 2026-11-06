# Webseite Loredo’s Automobile – Anleitung zur Pflege

Die Webseite besteht nur aus einfachen Dateien. Es gibt keine Datenbank, kein
Baukasten-System und keine monatlichen Zusatzkosten. Für die tägliche Pflege
brauchen Sie nur **eine Datei** (`fahrzeuge.js`) und den Ordner **`fahrzeuge/`**
für die Fotos.

Diese Webseite ist vollständig eigenständig und hat keine Verbindung zu einer
anderen Webseite.

---

## 1. Überblick der Dateien

| Datei / Ordner      | Wozu                                                    | Ändern?            |
|---------------------|---------------------------------------------------------|--------------------|
| `fahrzeuge.js`      | **Alle Fahrzeuge** (Text, Preise, Ausstattung)          | **Ja, regelmäßig** |
| `fahrzeuge/`        | **Fotos**, ein Unterordner pro Fahrzeug                 | **Ja, regelmäßig** |
| `index.html`        | Startseite mit Fahrzeugliste, Über uns, Kontakt         | selten             |
| `fahrzeug.html`     | Detailseite eines Fahrzeugs (wird automatisch befüllt)  | nein               |
| `impressum.html`    | Impressum                                               | bei Änderungen     |
| `datenschutz.html`  | Datenschutzerklärung                                    | bei Änderungen     |
| `kontakt.php`       | Verschickt das Kontaktformular per E-Mail               | einmalig prüfen    |
| `style.css`         | Farben und Gestaltung                                   | nein               |
| `app.js`            | Technik für Liste, Filter, Fotos und Formular           | nein               |
| `img/`, `fonts/`    | Logo, Symbol und Schrift                                | nein               |

---

## 2. Neues Fahrzeug einstellen

1. **Fotos vorbereiten**
   - Format **JPG** (keine HEIC-Dateien vom iPhone, siehe Tipp unten).
   - Am besten **querformatig (4:3)** fotografieren, das erste Foto ist das Titelbild.
   - Fotos vorher verkleinern, ideal etwa **1600 Pixel Breite** und unter 400 KB.
     Große Handyfotos (3–5 MB) machen die Seite auf dem Handy langsam.
   - Dateien der Reihe nach benennen: `1.jpg`, `2.jpg`, `3.jpg` …
     (Kleinschreibung beachten: `1.jpg`, nicht `1.JPG`.)

2. **Fotos hochladen**
   - Im Ordner `fahrzeuge/` einen neuen Ordner mit der Fahrzeugnummer anlegen,
     z. B. `fahrzeuge/1007/`.
   - Die Fotos dort hineinladen.

3. **Fahrzeug in `fahrzeuge.js` eintragen**
   - Datei öffnen, einen vorhandenen Fahrzeug-Block kopieren (von `Nummer:` bis
     einschließlich der Trennlinie `-----`).
   - **Ganz oben** einfügen (direkt unter `` window.FAHRZEUGE = String.raw` ``).
     Oben stehende Fahrzeuge erscheinen zuerst.
   - Werte anpassen. Beispiel:

```
Nummer: 1007
Status: verfügbar
Marke: Audi
Modell: A4 Avant 2.0 TDI S line
Preis: 23.490
Mehrwertsteuer: differenzbesteuert
Erstzulassung: 08/2020
Kilometer: 96.500
Kraftstoff: Diesel
Getriebe: Automatik
Leistung: 140 kW (190 PS)
Karosserie: Kombi
Farbe: Mythosschwarz Metallic
Türen: 5
Sitze: 5
Vorbesitzer: 1
HU bis: 08/2027
Schadstoffklasse: Euro 6d-TEMP
Unfallfrei: ja
Ausstattung: Navigationssystem, Sitzheizung vorn, Rückfahrkamera, Anhängerkupplung
Fotos: 12
Beschreibung: Scheckheftgepflegt, Zahnriemen neu bei 90.000 km.
Zweiter Satz Winterräder auf Alufelgen inklusive.

-----
```

4. **Datei speichern und hochladen**, fertig. Das Fahrzeug erscheint sofort in
   der Liste, in den Filtern und im Auswahlfeld des Kontaktformulars.

### Die Felder im Einzelnen

| Feld               | Beispiel                       | Hinweis                                                          |
|--------------------|--------------------------------|------------------------------------------------------------------|
| `Nummer`           | `1007`                         | **Pflicht**, jede Nummer nur einmal. Gleich wie der Fotoordner.  |
| `Status`           | `verfügbar`                    | `verfügbar`, `reserviert` oder `verkauft`                        |
| `Marke`, `Modell`  | `Audi`, `A4 Avant 2.0 TDI`     | Ergeben zusammen die Überschrift                                 |
| `Preis`            | `23.490`                       | Ohne €-Zeichen. Leer lassen = „Preis auf Anfrage“                |
| `Mehrwertsteuer`   | `differenzbesteuert`           | `differenzbesteuert` (§ 25a) oder `ausweisbar`                   |
| `Erstzulassung`    | `08/2020`                      | Monat/Jahr                                                       |
| `Kilometer`        | `96.500`                       | Ohne „km“                                                        |
| `Leistung`         | `140 kW (190 PS)`              | Mit Einheit. Nur `140 kW` geht auch, PS wird dann berechnet      |
| `Kraftstoff`       | `Diesel`                       | Immer gleich schreiben, damit der Filter sauber bleibt           |
| `Getriebe`         | `Automatik`                    | z. B. `Automatik` oder `Schaltgetriebe`                          |
| `Karosserie`       | `Kombi`                        | z. B. `Limousine`, `Kombi`, `Kleinwagen`, `SUV`, `Cabrio`, `Van` |
| `Unfallfrei`       | `ja`                           | `ja` oder `nein`. Vorschäden in der Beschreibung genau nennen    |
| `Ausstattung`      | `Navi, Sitzheizung, …`         | Mit Komma trennen. Die ersten 3 erscheinen in der Liste          |
| `Fotos`            | `12`                           | Anzahl der Fotos `1.jpg` bis `12.jpg`. `0` = Platzhalter         |
| `Beschreibung`     | Freitext                       | **Immer als letztes Feld**, darf mehrere Zeilen haben            |

Weitere mögliche Felder: `Hubraum`, `Antrieb`, `Innenausstattung`,
`Umweltplakette`. Sie können auch **eigene Felder** anlegen, z. B.
`Garantie: 12 Monate` oder `Reifen: Ganzjahresreifen neu`. Diese erscheinen
automatisch in den technischen Daten.

---

## 3. Fahrzeug reservieren, Preis ändern, verkaufen

- **Reserviert:** `Status: reserviert` → bleibt sichtbar, mit orangem Hinweis „Reserviert“.
- **Preis ändern:** Zahl bei `Preis:` ändern.
- **Verkauft:** `Status: verkauft` → verschwindet sofort aus der Liste.
  Wer noch einen alten Link hat, sieht „bereits verkauft“.
  Später können Sie den ganzen Block und den Fotoordner löschen.

---

## 4. Wenige Fahrzeuge

Solange weniger als 4 Fahrzeuge im Angebot sind, blendet die Seite Suche und
Filter automatisch aus. Ein einzelnes Fahrzeug wird als breite Karte gezeigt.
Ab 4 Fahrzeugen erscheinen Suche und Filter wieder von selbst.

---

## 5. Webseite online stellen

### Aktuell: GitHub Pages (kostenlos)

Die Seite läuft unter **https://loredosautomobile.de** (über GitHub Pages; die
Datei `CNAME` legt die Domain fest, die DNS-Einträge stehen bei Hostinger).
Jede Änderung, die auf GitHub im Zweig `main` gespeichert wird (neues
Fahrzeug, Fotos, Preise), ist nach 1 bis 2 Minuten automatisch online.

- Das Kontaktformular verschickt hier keine E-Mails selbst (GitHub kann kein
  PHP). Kunden schicken die vorbereitete Nachricht per WhatsApp oder E-Mail ab.
- Die Datenschutzerklärung ist auf GitHub Pages eingestellt.

Einmalig einzurichten (auf github.com im Browser, nicht in der App):
1. **Settings** → **Pages** → bei **Source** „Deploy from a branch“, Branch
   **main**, Ordner **/ (root)** → **Save**.
2. Bei Hostinger unter **Domains → loredosautomobile.de → DNS-Einträge**:
   - alte A-Einträge für **@** löschen, dann 4 neue A-Einträge mit Name **@**:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - alten Eintrag für **www** löschen, dann CNAME mit Name **www** auf
     `loredo-alb.github.io`
   - MX-Einträge (E-Mail) nicht anfassen.
3. Wenn bei GitHub unter **Pages** „DNS check successful“ steht:
   **Enforce HTTPS** einschalten.

### Später: eigene Domain bei Hostinger (mit E-Mail-Formular)

1. Eine **eigene Domain** registrieren, z. B. `loredos-automobile.de`, und ein
   Webhosting-Paket **mit PHP** wählen (für das Kontaktformular).
2. **Alle Dateien und Unterordner** in das Hauptverzeichnis der Domain
   hochladen, bei Hostinger in `public_html` über den Dateimanager.
   `README.md` und `ANLEITUNG.md` müssen nicht mit hochgeladen werden.
3. **SSL/HTTPS aktivieren** (bei Hostinger kostenlos, ein Klick).
4. **Datenschutzerklärung anpassen:** Abschnitt 3 (Hosting) und 4
   (Kontaktformular) auf Hostinger und den E-Mail-Versand umstellen.
5. **Kontaktformular testen:** Eine Testanfrage senden und prüfen, ob die E-Mail
   ankommt (auch im Spam-Ordner nachsehen). Falls nicht: bei Hostinger ein
   Postfach der eigenen Domain anlegen (z. B. `anfrage@loredos-automobile.de`)
   und in `kontakt.php` bei `ABSENDER` eintragen.
6. Bei **Google Unternehmensprofil** (Google Maps) die neue Webseite eintragen.

---

## 6. Rechtliches: kurz prüfen

- **Impressum:** Bei Eintragung ins Handelsregister (z. B. als „e. K.“)
  müssen Registergericht und Registernummer ergänzt werden.
- **Datenschutz:** Die Erklärung geht von GitHub Pages als Webhoster und einem
  Outlook-Postfach aus. Bei einem anderen Anbieter den Abschnitt „Hosting“
  bzw. „E-Mail“ anpassen. Wenn Sie später Google Maps einbetten, Statistik-Tools
  oder Social-Media-Plugins einbauen, muss die Erklärung erweitert werden (und
  meist ein Cookie-Banner her). Derzeit ist das **nicht** nötig.
- **Preise:** Immer Endpreise angeben (Preisangabenverordnung). Die Seite zeigt
  automatisch „differenzbesteuert nach § 25a UStG“ bzw. „MwSt. ausweisbar“.
- **Fahrzeugangaben:** Bekannte Vorschäden und Mängel immer angeben. Was in der
  Anzeige steht, kann als vereinbarte Beschaffenheit gelten.
- **Fernabsatz:** Wird ein Kaufvertrag ausschließlich per Telefon, E-Mail oder
  WhatsApp geschlossen (ohne Besuch vor Ort), kann ein Privatkunde ein
  14-tägiges Widerrufsrecht haben. Die Widerrufsbelehrung gehört dann in den
  Vertrag.

Diese Hinweise ersetzen keine Rechtsberatung. Im Zweifel kurz bei der IHK
oder einem Anwalt nachfragen.

---

## 7. Tipps

- **iPhone-Fotos als JPG:** Einstellungen → Kamera → Formate → „Maximale
  Kompatibilität“. Dann speichert das iPhone JPG statt HEIC.
- **Fotos verkleinern:** z. B. mit der kostenlosen Seite squoosh.app oder einer
  Bildverkleinerungs-App, Breite 1600 Pixel, Qualität ca. 75 %.
- **Fehler in `fahrzeuge.js`?** Wenn die Liste plötzlich leer ist, fehlt meist
  das Zeichen `` ` `` (Backtick) am Anfang oder Ende der Fahrzeugliste. Diese
  zwei Zeichen nie löschen und im Text selbst keine Backticks verwenden.
- **Farben ändern:** In `style.css` ganz oben unter `:root` (z. B. `--accent`
  für die rote Akzentfarbe).
- **Telefonnummer oder E-Mail ändern:** In allen `.html`-Dateien, in `app.js`
  (oben bei `FIRMA`) und in `kontakt.php` (`EMPFAENGER`).
