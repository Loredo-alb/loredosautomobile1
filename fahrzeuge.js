/*
  ================================================================
  FAHRZEUGBESTAND – Loredo’s Automobile
  ================================================================

  In dieser Datei stehen alle Fahrzeuge, die auf der Webseite
  angezeigt werden. Sie brauchen keine Programmierkenntnisse:
  Jedes Fahrzeug ist ein Textblock aus Zeilen "Feld: Wert".

  SO GEHT'S
  ---------
  1. Neues Fahrzeug: Einen vorhandenen Block kopieren (von "Nummer:"
     bis zur Trennlinie "-----"), GANZ OBEN einfügen und die Werte
     ändern. Oben stehende Fahrzeuge erscheinen zuerst.
  2. Jedes Fahrzeug braucht eine eigene Nummer (z. B. 1007).
  3. Fotos: Ordner "fahrzeuge/1007" anlegen, Fotos als 1.jpg, 2.jpg,
     3.jpg ... hochladen und unten "Fotos: 3" eintragen (Anzahl).
     Das erste Foto ist das Titelbild.
  4. Reserviert:  "Status: reserviert"  (wird mit Hinweis angezeigt)
     Verkauft:    "Status: verkauft"    (verschwindet aus der Liste)
  5. Fahrzeuge werden durch eine Zeile mit "-----" getrennt.

  REGELN
  ------
  - "Beschreibung:" immer als LETZTES Feld. Alles danach bis zur
    Trennlinie gehört zur Beschreibung (auch mehrere Zeilen).
  - Ausstattung mit Komma trennen.
  - Preis und Kilometer ohne "€" bzw. "km" (Punkte sind erlaubt).
  - Mehrwertsteuer: "ausweisbar" oder "differenzbesteuert".
  - Leistung mit Einheit, z. B. "110 kW (150 PS)" oder nur "110 kW".
  - Leere Felder dürfen fehlen. Eigene Felder (z. B. "Garantie: ...")
    erscheinen automatisch in den technischen Daten.
  - Bitte keine Backticks (`) verwenden.

  Ausführliche Anleitung: ANLEITUNG.md
  ================================================================
*/

window.FAHRZEUGE = String.raw`

Nummer: 1001
Status: verfügbar
Marke: Audi
Modell: A3 2.0 TDI Ambition
Preis: 7.499
Mehrwertsteuer: differenzbesteuert
Erstzulassung: 04/2009
Kilometer: 140.000
Kraftstoff: Diesel
Getriebe: Schaltgetriebe
Leistung: 103 kW (140 PS)
Karosserie: Limousine
Farbe: Schwarz
Innenausstattung: Stoff
Türen: 5
Vorbesitzer: 2
HU bis: 04/2028
Zustand: Unbeschädigtes Fahrzeug
Bereifung: 8-fach bereift
Ausstattung: Anhängerkupplung, Klimaautomatik, Sitzheizung, Tempomat, Einparkhilfe hinten, Leichtmetallfelgen, Sportpaket, Sportsitze, Sportfahrwerk, Nebelscheinwerfer, Tagfahrlicht, Dachreling, Getönte Scheiben, Bordcomputer, Radio mit MP3, Elektrische Fensterheber, Elektrische Seitenspiegel, Mittelarmlehne, Teilbare Rücksitzbank, Isofix, Fahrer- und Beifahrerairbag, Seiten- und Kopfairbags, ABS, ESP, Traktionskontrolle, Servolenkung, Zentralverriegelung, Wegfahrsperre, Partikelfilter, Nichtraucherfahrzeug, Scheckheftgepflegt
Fotos: 12
Beschreibung: Zum Verkauf steht ein zuverlässiger und sportlicher Audi A3 mit dem beliebten, durchzugsstarken 2.0 TDI Motor (140 PS). Das Fahrzeug befindet sich in einem sehr gepflegten Zustand und ist 8-fach bereift.

Auf Wunsch kann zusätzlich eine Garantie erworben werden.

-----

`;
