# Setzt die vorgerenderte Fahrzeugliste fest in claude-vorschau.html ein,
# damit die Fahrzeuge auch ohne JavaScript und in Vorschaubildern sichtbar sind.
import json, os
Q = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + "/"
d = json.load(open(Q + "werkzeuge/.vorrendern.json", encoding="utf-8"))
assert d["zahl"] and 'class="karte"' in d["liste"], "Fahrzeugliste wurde nicht gerendert"
datei = Q + "claude-vorschau.html"
s = open(datei, encoding="utf-8").read()
for alt, neu in [
    ('<section class="abschnitt" id="fahrzeuge"', '<section class="' + d["bereichKlasse"] + '" id="fahrzeuge"'),
    ('<ul class="liste" id="liste"></ul>', d["liste"]),
    ('<p class="ergebnis-zahl" id="ergebnis-zahl" aria-live="polite"></p>', '<p class="ergebnis-zahl" id="ergebnis-zahl" aria-live="polite">' + d["zahl"] + '</p>'),
    ('<span data-anzahl-klammer></span>', '<span data-anzahl-klammer>' + d["klammer"] + '</span>'),
]:
    assert s.count(alt) == 1, alt
    s = s.replace(alt, neu)
open(datei, "w", encoding="utf-8").write(s)
os.remove(Q + "werkzeuge/.vorrendern.json")
print("Fahrzeugliste eingesetzt:", d["zahl"])
