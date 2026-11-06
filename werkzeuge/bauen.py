# Baut aus der Webseite die Datei claude-vorschau.html: eine einzige Seite für
# den claude.ai-Link. Fahrzeugdetails, Impressum und Datenschutz werden zu
# Ansichten über die #-Adresse; Logo, Schrift, Gestaltung und Programm sind
# eingebettet, die Fotos liegen weiter unter fahrzeuge/.
# Aufruf über werkzeuge/bauen.sh
import base64, os, re
Q = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + "/"
lies = lambda p: open(Q + p, encoding="utf-8").read()
def daten(p, typ):
    return "data:" + typ + ";base64," + base64.b64encode(open(Q + p, "rb").read()).decode()

idx = lies("index.html")
def teil(text, start, ende):
    a = text.index(start); b = text.index(ende, a) + len(ende); return text[a:b]
def innen(text, start, ende):
    a = text.index(start) + len(start); b = text.index(ende, a); return text[a:b]

css = lies("style.css").replace('url("fonts/archivo.woff2")', 'url("' + daten("fonts/archivo.woff2", "font/woff2") + '")')
css += '\nbody::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 31; background: #fff; }\n'

logo = daten("img/logo.svg", "image/svg+xml")
logo_w = daten("img/logo-weiss.svg", "image/svg+xml")
platz = daten("img/platzhalter-auto.svg", "image/svg+xml")

sprite = teil(idx, '<svg width="0" height="0"', '</svg>\n')
kopf = teil(idx, '<header class="kopf">', '</header>').replace('<a class="logo" href="./"', '<a class="logo" href="#start"')
fuss = teil(idx, '<footer class="fuss">', '</footer>')
leiste = teil(idx, '<nav class="leiste"', '</nav>')
main = innen(idx, '<main id="inhalt">', '</main>')
k = main.index('<section class="abschnitt" id="kontakt"')
start_teil, kontakt = main[:k], main[k:]
start_teil = start_teil.replace('<section class="start" aria-labelledby="titel">', '<section class="start" id="start" aria-labelledby="titel">', 1)

impressum = innen(lies("impressum.html"), '<main id="inhalt" class="wrap recht">', '</main>')
datenschutz = innen(lies("datenschutz.html"), '<main id="inhalt" class="wrap recht">', '</main>')
# Diese Fassung liegt auf claude.ai, nicht auf GitHub Pages: Abschnitt Hosting anpassen
_a = datenschutz.index("  <h2>3. Hosting über GitHub Pages</h2>"); _b = datenschutz.index("  <h2>4. Kontaktformular</h2>")
datenschutz = datenschutz[:_a] + '''  <h2>3. Bereitstellung der Seite über claude.ai</h2>
  <p>Diese Webseite wird über die Plattform claude.ai bereitgestellt, einen Dienst von Anthropic (für Nutzer in der EU: Anthropic Ireland, Limited, Dublin, Irland). Beim Aufruf der Seite verarbeitet der Anbieter technisch notwendige Verbindungsdaten, zum Beispiel Ihre IP-Adresse, Datum und Uhrzeit des Abrufs und den Browsertyp. Dabei können Daten auch in die USA übertragen werden.</p>
  <p>Das ist erforderlich, um die Seite auszuliefern und ihre Sicherheit zu gewährleisten. Rechtsgrundlage ist unser berechtigtes Interesse an einem funktionsfähigen Webauftritt (Art. 6 Abs. 1 lit. f DSGVO). Welche Daten der Anbieter dabei erhebt, ob er Cookies setzt und wie lange er Daten speichert, regelt seine <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noopener">Datenschutzerklärung</a>.</p>
  <p>Die Verbindung zu dieser Webseite ist verschlüsselt (HTTPS), damit Ihre Eingaben nicht von Dritten mitgelesen werden können.</p>

''' + datenschutz[_b:]
for _x, _y in [("GitHub für das Hosting", "Anthropic für die Bereitstellung der Seite"),
               ("Diese Webseite setzt keine Cookies und verwendet keine", "Diese Webseite selbst setzt keine Cookies und verwendet keine")]:
    assert datenschutz.count(_x) == 1, _x
    datenschutz = datenschutz.replace(_x, _y)
assert "GitHub" not in datenschutz

inhalt = f'''<title>Loredo’s Automobile</title>
<style>
{css}</style>
<script>document.body.className = "mit-leiste"; document.body.setAttribute("data-seite", "start"); document.body.setAttribute("data-einzelseite", "");</script>
<a class="skip" href="#inhalt">Zum Inhalt springen</a>

{sprite}
{kopf}

<main id="inhalt">
<div data-ansicht="start">
{start_teil}</div>

<div data-ansicht="fahrzeug" hidden>
  <div class="wrap">
    <a class="zurueck" id="zurueck" href="#fahrzeuge"><svg class="i"><use href="#i-links"/></svg>Alle Fahrzeuge</a>
    <div id="detail"></div>
  </div>
</div>

<div class="wrap recht" data-ansicht="impressum" hidden>
{impressum}
</div>

<div class="wrap recht" data-ansicht="datenschutz" hidden>
{datenschutz}
</div>

{kontakt}
</main>

{fuss}

{leiste}

<script>
{lies("fahrzeuge.js")}
</script>
<script>
{lies("app.js").replace('src="img/platzhalter-auto.svg"', 'src="' + platz + '"')}
</script>
'''
for a, b in [('href="impressum.html"', 'href="#impressum"'), ('href="datenschutz.html"', 'href="#datenschutz"'),
             ('href="./#', 'href="#'), ('src="img/logo.svg"', 'src="' + logo + '"'), ('src="img/logo-weiss.svg"', 'src="' + logo_w + '"')]:
    inhalt = inhalt.replace(a, b)

# Prüfungen: keine Verweise auf lokale Dateien außer den Fahrzeugfotos
reste = [r for r in re.findall(r'(?:href|src)="(?!#|data:|https://|tel:|mailto:|' + "'" + r')[^"]+"', inhalt)]
reste += re.findall(r'url\("(?!data:)[^"]+"\)', inhalt)
assert not reste, reste
assert "<!doctype" not in inhalt.lower() and "<body" not in inhalt.lower()
open(Q + "claude-vorschau.html", "w", encoding="utf-8").write(inhalt)
# Testfassung mit dem Rahmen, den claude.ai beim Veröffentlichen um die Seite legt
geruest = ('<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
           '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>')
open(Q + ".vorschau-test.html", "w", encoding="utf-8").write(geruest + inhalt + "</body></html>")
print("claude-vorschau.html gebaut:", len(inhalt.encode()) // 1024, "KB")
