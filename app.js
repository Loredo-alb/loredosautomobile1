/*
  Loredo’s Automobile – Fahrzeugliste, Detailseite und Kontaktformular.
  Die Fahrzeuge stehen in fahrzeuge.js. Hier muss normalerweise nichts
  geändert werden. Kontaktdaten für WhatsApp und E-Mail: siehe FIRMA.
*/
(function () {
  "use strict";

  var FIRMA = {
    name: "Loredo’s Automobile",
    telefon: "+4915228605629",
    telefonAnzeige: "01522 8605629",
    whatsapp: "4915228605629",
    email: "loredosautomobile@outlook.de"
  };

  var seite = document.body.getAttribute("data-seite");
  // Vorschau als eine einzige Datei: Unterseiten werden zu Ansichten (#fahrzeug-1004, #impressum ...)
  var EINZEL = document.body.hasAttribute("data-einzelseite");
  var geladen = Date.now();

  /* ---------- Fahrzeugdaten einlesen ---------- */

  var FELDER = {
    nummer: ["nummer", "nr", "fahrzeugnummer", "fahrzeugnr", "id"],
    status: ["status"],
    beispiel: ["beispiel", "muster"],
    marke: ["marke", "hersteller"],
    modell: ["modell"],
    preis: ["preis", "verkaufspreis"],
    mwst: ["mehrwertsteuer", "mwst", "steuer", "ust"],
    ez: ["erstzulassung", "ez", "baujahr"],
    km: ["kilometer", "kilometerstand", "km", "laufleistung"],
    kraftstoff: ["kraftstoff", "kraftstoffart", "treibstoff"],
    getriebe: ["getriebe", "getriebeart"],
    leistung: ["leistung", "leistungkw", "kw", "leistungps", "ps"],
    karosserie: ["karosserie", "fahrzeugart", "fahrzeugtyp", "kategorie", "karosserieform"],
    farbe: ["farbe", "aussenfarbe"],
    innen: ["innenausstattung", "innen", "polster"],
    tueren: ["tueren", "anzahltueren"],
    sitze: ["sitze", "sitzplaetze"],
    vorbesitzer: ["vorbesitzer", "fahrzeughalter", "halter", "anzahlhalter"],
    hu: ["hubis", "hu", "tuev", "tuevbis", "hauptuntersuchung"],
    hubraum: ["hubraum"],
    antrieb: ["antrieb", "antriebsart"],
    schadstoff: ["schadstoffklasse", "abgasnorm", "euronorm"],
    plakette: ["umweltplakette", "plakette"],
    unfallfrei: ["unfallfrei"],
    ausstattung: ["ausstattung", "extras", "sonderausstattung"],
    fotos: ["fotos", "bilder", "foto", "bild"],
    beschreibung: ["beschreibung", "bemerkung", "bemerkungen"]
  };
  var ALIAS = {};
  Object.keys(FELDER).forEach(function (k) { FELDER[k].forEach(function (a) { ALIAS[a] = k; }); });

  function schluessel(s) {
    return String(s || "").toLowerCase()
      .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
      .replace(/[^a-z0-9]/g, "");
  }

  function einlesen(text) {
    var bloecke = [], akt = null;
    String(text || "").replace(/\r/g, "").split("\n").forEach(function (zeile) {
      if (/^\s*-{3,}\s*$/.test(zeile)) { akt = null; return; }
      if (!akt) {
        if (!zeile.trim()) return;
        akt = { roh: {}, extra: [], text: [], inText: false, letztes: null };
        bloecke.push(akt);
      }
      if (akt.inText) { akt.text.push(zeile); return; }
      var m = zeile.match(/^\s*([A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß0-9 .\/()-]{0,30}?)\s*:\s?(.*)$/);
      if (m) {
        var alias = schluessel(m[1]), feld = ALIAS[alias], wert = m[2].trim();
        if (feld === "beschreibung") { akt.inText = true; akt.text.push(m[2]); return; }
        if (feld) {
          if (feld === "leistung" && /ps$/.test(alias) && /^\d+([.,]\d+)?$/.test(wert)) wert += " PS";
          akt.roh[feld] = wert; akt.letztes = { feld: feld };
        } else {
          akt.extra.push([m[1].trim(), wert]); akt.letztes = { extra: akt.extra.length - 1 };
        }
        return;
      }
      if (zeile.trim() && akt.letztes) {
        if (akt.letztes.feld) akt.roh[akt.letztes.feld] += (akt.letztes.feld === "ausstattung" ? ", " : " ") + zeile.trim();
        else akt.extra[akt.letztes.extra][1] += " " + zeile.trim();
      }
    });
    var nummern = {};
    return bloecke.map(function (b, i) { return fahrzeug(b, i); })
      .filter(function (v) { return v.marke || v.modell; })
      .filter(function (v) { if (nummern[v.nummer]) return false; nummern[v.nummer] = true; return true; });
  }

  function zahl(s) {
    var d = String(s || "").split(",")[0].replace(/[^\d]/g, "");
    return d ? parseInt(d, 10) : null;
  }
  function ja(s) { return /^(ja|j|yes|x|1|true|wahr)$/i.test(String(s || "").trim()); }
  function nein(s) { return /^(nein|n|no|0|false)$/i.test(String(s || "").trim()); }

  function datum(s) {
    s = String(s || "");
    var m = s.match(/(\d{1,2})\s*[\/.\-]\s*(\d{4})/);
    if (m) { var mo = Math.min(12, Math.max(1, parseInt(m[1], 10))); return { jahr: +m[2], monat: mo, text: (mo < 10 ? "0" : "") + mo + "/" + m[2] }; }
    m = s.match(/(\d{4})/);
    return m ? { jahr: +m[1], monat: 0, text: m[1] } : null;
  }

  function leistung(s) {
    if (!s) return null;
    var kw = s.match(/(\d+(?:[.,]\d+)?)\s*kw/i), ps = s.match(/(\d+(?:[.,]\d+)?)\s*ps/i);
    var k = kw ? parseFloat(kw[1].replace(",", ".")) : null;
    var p = ps ? parseFloat(ps[1].replace(",", ".")) : null;
    if (k === null && p === null) { var n = parseFloat(s.replace(",", ".")); if (!isNaN(n)) k = n; }
    if (k === null && p !== null) k = p / 1.35962;
    if (p === null && k !== null) p = k * 1.35962;
    return k ? { kw: Math.round(k), ps: Math.round(p) } : null;
  }

  function liste(s) {
    return String(s || "").split(/[,;\n]+/).map(function (x) { return x.replace(/^\s*[-•*]\s*/, "").trim(); }).filter(Boolean);
  }

  function fotos(s, nr) {
    s = String(s || "").trim();
    if (!s) return [];
    if (/^\d+$/.test(s)) {
      var n = Math.min(parseInt(s, 10), 60), out = [];
      for (var i = 1; i <= n; i++) out.push("fahrzeuge/" + nr + "/" + i + ".jpg");
      return out;
    }
    return liste(s).map(function (x) {
      return /^(https?:)?\/\//i.test(x) || x.indexOf("/") > -1 ? encodeURI(x) : "fahrzeuge/" + nr + "/" + encodeURIComponent(x);
    });
  }

  function fahrzeug(b, i) {
    var r = b.roh, v = {};
    v.nummer = String(r.nummer || "").replace(/[^\w-]/g, "") || String(i + 1);
    var st = schluessel(r.status);
    v.status = st.indexOf("verkauf") === 0 ? "verkauft" : st.indexOf("reserv") === 0 ? "reserviert" : "verfuegbar";
    v.beispiel = ja(r.beispiel);
    v.marke = r.marke || "";
    v.modell = r.modell || "";
    v.titel = (v.marke + " " + v.modell).trim();
    v.preis = zahl(r.preis);
    var mw = schluessel(r.mwst);
    v.mwst = /nicht|differenz|25a/.test(mw) ? "differenz" : /ausweis|regel|netto|19/.test(mw) ? "ausweisbar" : "";
    v.ez = datum(r.ez);
    v.km = zahl(r.km);
    v.leistung = leistung(r.leistung);
    ["kraftstoff", "getriebe", "karosserie", "farbe", "innen", "tueren", "sitze", "vorbesitzer", "hu", "hubraum", "antrieb", "schadstoff", "plakette"].forEach(function (k) { v[k] = r[k] || ""; });
    if (/^\d+$/.test(v.hubraum.replace(/\./g, ""))) v.hubraum = Number(v.hubraum.replace(/\./g, "")).toLocaleString("de-DE") + " cm³";
    v.unfallfrei = ja(r.unfallfrei) ? true : nein(r.unfallfrei) ? false : null;
    v.ausstattung = liste(r.ausstattung);
    v.fotos = fotos(r.fotos, v.nummer);
    v.beschreibung = b.text.join("\n").trim();
    v.extra = b.extra.filter(function (e) { return e[1]; });
    v.reihe = i;
    v.suche = schluessel([v.titel, v.kraftstoff, v.getriebe, v.karosserie, v.farbe, v.ausstattung.join(" "), v.nummer].join(" "));
    return v;
  }

  var ALLE = [];
  var datenFehler = false;
  if (seite === "start" || seite === "fahrzeug") try {
    if (typeof window.FAHRZEUGE !== "string") throw new Error("fahrzeuge.js fehlt");
    ALLE = einlesen(window.FAHRZEUGE);
  } catch (e) {
    datenFehler = true;
    if (window.console) console.error("Fahrzeugdaten konnten nicht gelesen werden:", e);
  }
  var ANGEBOT = ALLE.filter(function (v) { return v.status !== "verkauft"; });

  /* ---------- Darstellung ---------- */

  function esc(s) {
    return String(s === null || s === undefined ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function tausend(n) { return Number(n).toLocaleString("de-DE"); }
  function preisText(v) { return v.preis ? tausend(v.preis) + " €" : "Preis auf Anfrage"; }
  function kmText(v) { return v.km !== null ? tausend(v.km) + " km" : ""; }
  function leistungText(v) { return v.leistung ? v.leistung.kw + " kW (" + v.leistung.ps + " PS)" : ""; }
  function mwstKurz(v) { return v.mwst === "ausweisbar" ? "MwSt. ausweisbar" : v.mwst === "differenz" ? "Differenzbesteuert" : ""; }
  function mwstLang(v) {
    if (!v.preis) return v.mwst === "ausweisbar" ? "MwSt. ausweisbar" : v.mwst === "differenz" ? "Differenzbesteuert nach §\u00a025a UStG" : "";
    return v.mwst === "ausweisbar" ? "Endpreis inkl. 19 % MwSt., MwSt. ausweisbar"
      : v.mwst === "differenz" ? "Endpreis, differenzbesteuert nach § 25a UStG, MwSt. nicht ausweisbar"
      : "Endpreis";
  }
  function vorbesitzerText(v) { return v.vorbesitzer; }
  function icon(id, cls) { return '<svg class="i' + (cls ? " " + cls : "") + '" aria-hidden="true"><use href="#i-' + id + '"/></svg>'; }
  function link(v) { return EINZEL ? "#fahrzeug-" + v.nummer : "fahrzeug.html?nr=" + encodeURIComponent(v.nummer); }
  var LISTE = EINZEL ? "#fahrzeuge" : "./#fahrzeuge";
  function platzhalter() {
    return '<div class="platzhalter"><img src="img/platzhalter-auto.svg" alt=""><span>Fotos folgen</span></div>';
  }

  // Fehlende Fotos: in der Galerie überspringen, sonst Platzhalter zeigen
  var KAPUTT = {};
  document.addEventListener("error", function (e) {
    var img = e.target;
    if (!img || img.tagName !== "IMG" || !img.hasAttribute("data-foto")) return;
    var src = img.getAttribute("src");
    KAPUTT[src] = true;
    // Gleiches Foto in Galerie und Vorschaubildern entfernen
    var entfernt = false;
    document.querySelectorAll(".galerie-spur > button > img, .daumen > button > img").forEach(function (bild) {
      if (bild.getAttribute("src") !== src) return;
      var folie = bild.parentNode, reihe = folie.parentNode;
      if (reihe.classList.contains("daumen") || reihe.children.length > 1) { folie.remove(); entfernt = true; }
    });
    if (entfernt) document.dispatchEvent(new CustomEvent("galerie-geaendert"));
    if (!img.isConnected) return;
    var div = document.createElement("div");
    div.innerHTML = platzhalter();
    if (img.parentNode) img.parentNode.replaceChild(div.firstChild, img);
  }, true);

  function hinweise(v) {
    var h = "";
    if (v.status === "reserviert") h += '<span class="marke-hinweis reserviert">Reserviert</span>';
    if (v.status === "verkauft") h += '<span class="marke-hinweis verkauft">Verkauft</span>';
    if (v.beispiel) h += '<span class="marke-hinweis">Beispiel</span>';
    return h ? '<div class="marken">' + h + "</div>" : "";
  }

  function karte(v, sofort) {
    var bild = v.fotos.length
      ? '<img data-foto src="' + esc(v.fotos[0]) + '" alt="' + esc(v.titel) + '" width="800" height="600" decoding="async"' + (sofort ? "" : ' loading="lazy"') + ">"
      : platzhalter();
    var eck = [
      ["Erstzulassung", v.ez ? v.ez.text : ""],
      ["Kilometer", kmText(v)],
      ["Leistung", leistungText(v)],
      ["Kraftstoff", v.kraftstoff],
      ["Getriebe", v.getriebe],
      ["Vorbesitzer", vorbesitzerText(v)]
    ].filter(function (e) { return e[1]; });
    var extras = v.ausstattung.slice(0, 3).map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("");
    if (v.ausstattung.length > 3) extras += '<li class="mehr">+' + (v.ausstattung.length - 3) + " weitere</li>";
    return '<li><article class="karte">' +
      '<div class="karte-bild">' + bild + hinweise(v) +
        (v.fotos.length > 1 ? '<span class="foto-zahl">' + icon("kamera") + v.fotos.length + "</span>" : "") +
      "</div>" +
      '<div class="karte-text">' +
        '<h3 class="karte-titel"><a href="' + link(v) + '">' + esc(v.titel) + "</a></h3>" +
        (eck.length ? '<dl class="eckdaten">' + eck.map(function (e) { return "<div><dt>" + e[0] + "</dt><dd>" + esc(e[1]) + "</dd></div>"; }).join("") + "</dl>" : "") +
        (extras ? '<ul class="extras" aria-label="Ausstattung (Auszug)">' + extras + "</ul>" : "") +
        '<div class="karte-fuss"><div><span class="preis">' + preisText(v) + "</span>" +
          (mwstKurz(v) ? '<span class="preis-hinweis">' + mwstKurz(v) + "</span>" : "") + "</div>" +
          '<span class="weiter" aria-hidden="true">Details' + icon("rechts") + "</span></div>" +
      "</div></article></li>";
  }

  function fahrzeugBezeichnung(v) {
    return "Nr. " + v.nummer + " – " + v.titel + " – " + preisText(v).replace(" ", " ");
  }

  function waLink(text) { return "https://wa.me/" + FIRMA.whatsapp + "?text=" + encodeURIComponent(text); }

  /* ---------- Startseite: Liste und Filter ---------- */

  function startseite() {
    var el = {
      liste: document.getElementById("liste"),
      zahl: document.getElementById("ergebnis-zahl"),
      q: document.getElementById("f-q"),
      marke: document.getElementById("f-marke"),
      preis: document.getElementById("f-preis"),
      km: document.getElementById("f-km"),
      ez: document.getElementById("f-ez"),
      kraftstoff: document.getElementById("f-kraftstoff"),
      getriebe: document.getElementById("f-getriebe"),
      karosserie: document.getElementById("f-karosserie"),
      sort: document.getElementById("f-sort"),
      knopf: document.getElementById("filter-knopf"),
      feld: document.getElementById("filter-feld"),
      zaehler: document.getElementById("filter-zaehler"),
      fertig: document.getElementById("filter-fertig")
    };
    if (!el.liste) return;

    var anz = document.querySelector("[data-anzahl-klammer]");
    if (anz && ANGEBOT.length) anz.textContent = "(" + ANGEBOT.length + ")";

    if (datenFehler) {
      el.liste.outerHTML = '<div class="leer"><p><strong>Die Fahrzeugliste konnte nicht geladen werden.</strong></p><p>Bitte rufen Sie uns an: <a href="tel:' + FIRMA.telefon + '">' + FIRMA.telefonAnzeige + "</a></p></div>";
      return;
    }

    function optionen(select, werte) {
      werte.forEach(function (w) {
        var o = document.createElement("option");
        o.value = w[0]; o.textContent = w[1];
        select.appendChild(o);
      });
    }
    function verteilung(feld) {
      var z = {};
      ANGEBOT.forEach(function (v) { if (v[feld]) z[v[feld]] = (z[v[feld]] || 0) + 1; });
      return Object.keys(z).sort(function (a, b) { return a.localeCompare(b, "de"); }).map(function (k) { return [k, k + " (" + z[k] + ")"]; });
    }
    function stufen(feld, liste, einheit) {
      var max = Math.max.apply(null, ANGEBOT.map(function (v) { return v[feld] || 0; }).concat([0]));
      var out = [];
      for (var i = 0; i < liste.length; i++) { out.push([String(liste[i]), "bis " + tausend(liste[i]) + einheit]); if (liste[i] >= max) break; }
      return out;
    }
    optionen(el.marke, verteilung("marke"));
    optionen(el.kraftstoff, verteilung("kraftstoff"));
    optionen(el.getriebe, verteilung("getriebe"));
    optionen(el.karosserie, verteilung("karosserie"));
    optionen(el.preis, stufen("preis", [5000, 7500, 10000, 12500, 15000, 17500, 20000, 25000, 30000, 40000, 50000, 75000, 100000], " €"));
    optionen(el.km, stufen("km", [10000, 25000, 50000, 75000, 100000, 125000, 150000, 200000, 250000], " km"));
    var jahre = ANGEBOT.map(function (v) { return v.ez ? v.ez.jahr : 0; }).filter(Boolean);
    if (jahre.length) {
      var j = [], von = Math.min.apply(null, jahre), bis = Math.max.apply(null, jahre);
      for (var y = bis; y >= von; y--) j.push([String(y), "ab " + y]);
      optionen(el.ez, j);
    }

    var FILTER = ["marke", "preis", "km", "ez", "kraftstoff", "getriebe", "karosserie"];

    // Bei wenigen Fahrzeugen sind Suche und Filter überflüssig
    var bereich = document.getElementById("fahrzeuge");
    if (bereich) bereich.classList.toggle("wenige", ANGEBOT.length < 4);

    // Zustand aus der Adresse übernehmen (z. B. ?marke=BMW)
    var p = new URLSearchParams(EINZEL ? "" : location.search);
    ["q", "sort"].concat(FILTER).forEach(function (k) {
      var w = p.get(k);
      if (w === null || !el[k]) return;
      if (el[k].tagName === "SELECT" && !el[k].querySelector('option[value="' + w.replace(/"/g, '\\"') + '"]')) return;
      el[k].value = w;
    });

    function zustand() {
      var s = {};
      ["q", "sort"].concat(FILTER).forEach(function (k) { s[k] = el[k].value.trim(); });
      return s;
    }

    function passt(v, s) {
      if (s.marke && v.marke !== s.marke) return false;
      if (s.kraftstoff && v.kraftstoff !== s.kraftstoff) return false;
      if (s.getriebe && v.getriebe !== s.getriebe) return false;
      if (s.karosserie && v.karosserie !== s.karosserie) return false;
      if (s.preis && !(v.preis && v.preis <= +s.preis)) return false;
      if (s.km && !(v.km !== null && v.km <= +s.km)) return false;
      if (s.ez && !(v.ez && v.ez.jahr >= +s.ez)) return false;
      if (s.q) {
        var woerter = s.q.split(/\s+/).map(schluessel).filter(Boolean);
        for (var i = 0; i < woerter.length; i++) if (v.suche.indexOf(woerter[i]) === -1) return false;
      }
      return true;
    }

    function sortieren(a, b, art) {
      var unten = 1e12;
      if (art === "preis-auf") return (a.preis || unten) - (b.preis || unten);
      if (art === "preis-ab") return (b.preis || 0) - (a.preis || 0);
      if (art === "km-auf") return (a.km === null ? unten : a.km) - (b.km === null ? unten : b.km);
      if (art === "ez-ab") return (b.ez ? b.ez.jahr * 12 + b.ez.monat : 0) - (a.ez ? a.ez.jahr * 12 + a.ez.monat : 0);
      return a.reihe - b.reihe;
    }

    function zeigen() {
      var s = zustand();
      var treffer = ANGEBOT.filter(function (v) { return passt(v, s); })
        .sort(function (a, b) { return sortieren(a, b, s.sort) || a.reihe - b.reihe; });
      var aktiv = FILTER.filter(function (k) { return s[k]; }).length;

      if (!ANGEBOT.length) {
        el.liste.innerHTML = '<li class="leer"><p><strong>Zurzeit sind alle Fahrzeuge verkauft.</strong></p><p>Neue Fahrzeuge kommen laufend herein. Rufen Sie uns an: <a href="tel:' + FIRMA.telefon + '">' + FIRMA.telefonAnzeige + "</a></p></li>";
      } else if (!treffer.length) {
        el.liste.innerHTML = '<li class="leer"><p><strong>Kein passendes Fahrzeug gefunden.</strong></p><p>Ändern Sie die Filter oder fragen Sie uns direkt, oft haben wir Fahrzeuge, die noch nicht online sind: <a href="tel:' + FIRMA.telefon + '">' + FIRMA.telefonAnzeige + "</a></p></li>";
      } else {
        el.liste.innerHTML = treffer.map(function (v, i) { return karte(v, i < 2); }).join("");
      }
      el.liste.classList.toggle("einzeln", treffer.length === 1);

      var wort = treffer.length === 1 ? "Fahrzeug" : "Fahrzeuge";
      el.zahl.innerHTML = esc(treffer.length + " " + wort + (aktiv || s.q ? " gefunden" : " im Angebot")) +
        (aktiv || s.q ? '<button type="button" id="zuruecksetzen">Filter zurücksetzen</button>' : "");
      var z = document.getElementById("zuruecksetzen");
      if (z) z.addEventListener("click", zuruecksetzen);
      el.fertig.textContent = treffer.length + " " + wort + " anzeigen";
      el.zaehler.hidden = !aktiv;
      el.zaehler.textContent = aktiv;

      var q = new URLSearchParams();
      Object.keys(s).forEach(function (k) { if (s[k]) q.set(k, s[k]); });
      var qs = q.toString();
      if (!EINZEL) try { history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "") + location.hash); } catch (err) { /* ignorieren */ }
    }

    function zuruecksetzen() {
      ["q", "sort"].concat(FILTER).forEach(function (k) { el[k].value = ""; });
      zeigen();
    }

    var warte;
    el.q.addEventListener("input", function () { clearTimeout(warte); warte = setTimeout(zeigen, 150); });
    el.q.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); el.q.blur(); } });
    ["sort"].concat(FILTER).forEach(function (k) { el[k].addEventListener("change", zeigen); });

    el.knopf.addEventListener("click", function () {
      var auf = !el.feld.classList.contains("offen");
      el.feld.classList.toggle("offen", auf);
      el.knopf.setAttribute("aria-expanded", String(auf));
    });
    el.fertig.addEventListener("click", function () {
      el.feld.classList.remove("offen");
      el.knopf.setAttribute("aria-expanded", "false");
      el.zahl.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    zeigen();
  }

  /* ---------- Detailseite ---------- */

  function detailseite(nrVorgabe) {
    var ziel = document.getElementById("detail");
    if (!ziel) return;
    var nr = nrVorgabe !== undefined ? nrVorgabe : new URLSearchParams(location.search).get("nr");
    var v = null;
    for (var i = 0; i < ALLE.length; i++) if (ALLE[i].nummer === nr) v = ALLE[i];

    // "Zurück" führt zur Liste mit den zuvor gewählten Filtern
    var zurueck = document.getElementById("zurueck");
    if (zurueck && document.referrer && !EINZEL) {
      try {
        var ref = new URL(document.referrer);
        if (ref.origin === location.origin && /\/(index\.html)?$/.test(ref.pathname)) {
          var ankerGeklickt = false;
          window.addEventListener("hashchange", function () { ankerGeklickt = true; });
          ref.hash = "fahrzeuge";
          zurueck.href = ref.href;
          zurueck.addEventListener("click", function (e) {
            if (ankerGeklickt) return;
            e.preventDefault();
            history.back();
          });
        }
      } catch (err) { /* ignorieren */ }
    }

    if (!v) {
      document.title = "Fahrzeug nicht gefunden | " + FIRMA.name;
      ziel.innerHTML = '<div class="leer" style="margin:24px 0 48px"><p><strong>Dieses Fahrzeug ist nicht mehr im Angebot.</strong></p>' +
        '<p>Vermutlich wurde es bereits verkauft. <a href="' + LISTE + '">Zu allen Fahrzeugen</a> oder rufen Sie uns an: <a href="tel:' + FIRMA.telefon + '">' + FIRMA.telefonAnzeige + "</a></p></div>";
      return;
    }

    document.title = v.titel + " – " + preisText(v).replace(" ", " ") + " | " + FIRMA.name;
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", [v.titel, v.ez ? "EZ " + v.ez.text : "", kmText(v), leistungText(v), preisText(v)].filter(Boolean).join(", ").replace(/ /g, " ") + ". Jetzt bei " + FIRMA.name + " in Bad Berneck anfragen.");

    var waText = "Hallo, ich interessiere mich für den " + v.titel + " (Nr. " + v.nummer + ", " + preisText(v).replace(" ", " ") + ")." + (EINZEL ? "" : " " + location.href);
    document.querySelectorAll("[data-wa]").forEach(function (a) { a.href = waLink(waText); });

    var status = "";
    if (v.status === "reserviert") status = '<div class="status-box reserviert">Dieses Fahrzeug ist zurzeit reserviert. Fragen Sie gern nach, ob es wieder frei wird.</div>';
    if (v.status === "verkauft") status = '<div class="status-box verkauft">Dieses Fahrzeug ist bereits verkauft. <a href="' + LISTE + '" style="color:#fff">Zu den aktuellen Fahrzeugen</a></div>';
    if (v.beispiel) status += '<div class="status-box beispiel">Beispiel-Eintrag: zeigt, wie ein Fahrzeug auf der Seite dargestellt wird.</div>';

    var eck = [
      ["Erstzulassung", v.ez ? v.ez.text : ""],
      ["Kilometerstand", kmText(v)],
      ["Leistung", leistungText(v)],
      ["Kraftstoff", v.kraftstoff],
      ["Getriebe", v.getriebe],
      ["Vorbesitzer", vorbesitzerText(v)]
    ].filter(function (e) { return e[1]; });

    var daten = [
      ["Fahrzeugnummer", v.nummer],
      ["Marke", v.marke],
      ["Modell", v.modell],
      ["Fahrzeugart", v.karosserie],
      ["Erstzulassung", v.ez ? v.ez.text : ""],
      ["Kilometerstand", kmText(v)],
      ["Leistung", leistungText(v)],
      ["Hubraum", v.hubraum],
      ["Kraftstoff", v.kraftstoff],
      ["Getriebe", v.getriebe],
      ["Antrieb", v.antrieb],
      ["Farbe", v.farbe],
      ["Innenausstattung", v.innen],
      ["Türen", v.tueren],
      ["Sitzplätze", v.sitze],
      ["Vorbesitzer", v.vorbesitzer],
      ["HU bis", v.hu],
      ["Schadstoffklasse", v.schadstoff],
      ["Umweltplakette", v.plakette],
      ["Unfallfrei", v.unfallfrei === true ? "Ja" : v.unfallfrei === false ? "Nein" : ""]
    ].concat(v.extra).filter(function (e) { return e[1]; });

    var html = "";
    html += '<div class="detail">';

    // Galerie
    html += '<div class="detail-galerie">';
    if (v.fotos.length) {
      html += '<div class="galerie" data-foto-box><div class="galerie-spur" id="spur" tabindex="0" aria-label="Fotos, mit Pfeiltasten blättern">' +
        v.fotos.map(function (f, i) {
          return '<button type="button" data-index="' + i + '" aria-label="Foto ' + (i + 1) + " von " + v.fotos.length + ' vergrößern"><img data-foto src="' + esc(f) + '" alt="' + esc(v.titel) + " – Foto " + (i + 1) + '" width="1200" height="900" decoding="async"' + (i === 0 ? ' fetchpriority="high"' : ' loading="lazy"') + "></button>";
        }).join("") + "</div>" +
        (v.fotos.length > 1 ? '<button class="galerie-pfeil l" type="button" data-schritt="-1" aria-label="Vorheriges Foto">' + icon("links") + '</button><button class="galerie-pfeil r" type="button" data-schritt="1" aria-label="Nächstes Foto">' + icon("rechts") + '</button><span class="galerie-zahl" id="galerie-zahl">1 / ' + v.fotos.length + "</span>" : "") +
        hinweise(v) + "</div>";
      if (v.fotos.length > 1) {
        html += '<div class="daumen" id="daumen">' + v.fotos.map(function (f, i) {
          return '<button type="button" data-index="' + i + '"' + (i === 0 ? ' aria-current="true"' : "") + ' aria-label="Foto ' + (i + 1) + '"><img data-foto src="' + esc(f) + '" alt="" loading="lazy" decoding="async" width="160" height="120"></button>';
        }).join("") + "</div>";
      }
    } else {
      html += '<div class="galerie"><div class="galerie-spur">' + platzhalter() + "</div>" + hinweise(v) + "</div>";
    }
    html += "</div>";

    // Infobox
    html += '<div class="detail-info">' + status +
      "<h1>" + esc(v.titel) + "</h1>" +
      '<div class="detail-preis"><span class="preis">' + preisText(v) + '</span><span class="preis-hinweis">' + mwstLang(v) + "</span></div>" +
      (eck.length ? '<dl class="detail-eck">' + eck.map(function (e) { return "<div><dt>" + e[0] + "</dt><dd>" + esc(e[1]) + "</dd></div>"; }).join("") + "</dl>" : "") +
      '<div class="detail-knoepfe">' +
        '<a class="btn btn-dunkel" href="tel:' + FIRMA.telefon + '">' + icon("tel") + FIRMA.telefonAnzeige + " anrufen</a>" +
        '<a class="btn btn-hell btn-wa" href="' + esc(waLink(waText)) + '">' + icon("chat") + "WhatsApp</a>" +
        '<a class="btn btn-hell" href="#anfrage">' + icon("mail") + "Anfrage senden</a>" +
      "</div></div>";

    // Ausstattung, Daten, Beschreibung
    html += '<div class="detail-mehr">';
    if (v.ausstattung.length) {
      html += '<section class="detail-block"><h2>Ausstattung</h2><ul class="ausstattung">' +
        v.ausstattung.map(function (a) { return "<li>" + icon("haken") + "<span>" + esc(a) + "</span></li>"; }).join("") + "</ul></section>";
    }
    html += '<section class="detail-block"><h2>Technische Daten</h2><table class="daten"><tbody>' +
      daten.map(function (e) { return '<tr><th scope="row">' + esc(e[0]) + "</th><td>" + esc(e[1]) + "</td></tr>"; }).join("") + "</tbody></table></section>";
    if (v.beschreibung) {
      html += '<section class="detail-block"><h2>Beschreibung</h2><div class="beschreibung">' +
        v.beschreibung.split(/\n\s*\n/).map(function (abs) { return "<p>" + esc(abs.trim()).replace(/\n/g, "<br>") + "</p>"; }).join("") + "</div></section>";
    }
    html += '<p class="hinweis-box">Alle Angaben nach bestem Wissen. Irrtümer, Änderungen und Zwischenverkauf vorbehalten. Verbindlich sind allein die Angaben im Kaufvertrag.</p>';
    html += "</div></div>";

    ziel.innerHTML = html;

    var auswahl = document.querySelector("[data-fahrzeugwahl]");
    if (auswahl) auswahl.value = fahrzeugBezeichnung(v);
    var titel = document.getElementById("anfrage-titel");
    if (titel) titel.textContent = "Anfrage zu diesem Fahrzeug";

    if (v.fotos.length) galerie(v);
  }

  var galerieAktualisieren = null;
  document.addEventListener("galerie-geaendert", function () { if (galerieAktualisieren) galerieAktualisieren(); });

  function galerie(v) {
    var spur = document.getElementById("spur");
    var zahl = document.getElementById("galerie-zahl");
    var daumen = document.getElementById("daumen");
    if (!spur) return;
    var box = spur.parentNode;

    function n() { return spur.querySelectorAll(":scope > button").length; }
    function pos(liste, b) { return Array.prototype.indexOf.call(liste.children, b); }
    function index() { return Math.round(spur.scrollLeft / Math.max(1, spur.clientWidth)); }
    function gehe(i, sanft) {
      i = Math.max(0, Math.min(n() - 1, i));
      spur.scrollTo({ left: i * spur.clientWidth, behavior: sanft === false ? "auto" : "smooth" });
    }
    function aktualisieren() {
      var i = index(), anzahl = n();
      if (zahl) { zahl.textContent = (i + 1) + " / " + anzahl; zahl.hidden = anzahl < 2; }
      var l = box.querySelector(".galerie-pfeil.l"), r = box.querySelector(".galerie-pfeil.r");
      if (l) l.disabled = i === 0;
      if (r) r.disabled = i >= anzahl - 1;
      if (daumen) {
        daumen.hidden = daumen.children.length < 2;
        Array.prototype.forEach.call(daumen.children, function (b, j) {
          if (j === i) { b.setAttribute("aria-current", "true"); if (daumen.scrollWidth > daumen.clientWidth) daumen.scrollLeft = b.offsetLeft - daumen.clientWidth / 2 + b.offsetWidth / 2; }
          else b.removeAttribute("aria-current");
        });
      }
    }
    var t;
    spur.addEventListener("scroll", function () { clearTimeout(t); t = setTimeout(aktualisieren, 60); }, { passive: true });
    galerieAktualisieren = aktualisieren;
    box.querySelectorAll("[data-schritt]").forEach(function (b) {
      b.addEventListener("click", function () { gehe(index() + Number(b.getAttribute("data-schritt"))); });
    });
    spur.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); gehe(index() + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); gehe(index() - 1); }
    });
    if (daumen) daumen.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (b) gehe(pos(daumen, b));
    });
    spur.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (b && b.parentNode === spur) betrachter(v, pos(spur, b), function (i) { gehe(i, false); });
    });
    aktualisieren();
  }

  // Vollbild-Ansicht der Fotos
  function betrachter(v, start, zurueck) {
    if (typeof HTMLDialogElement === "undefined") return;
    var bilder = v.fotos.filter(function (f) { return !KAPUTT[f]; });
    if (!bilder.length) return;
    var d = document.createElement("dialog");
    d.className = "betrachter";
    d.setAttribute("aria-label", "Fotos " + v.titel);
    var n = bilder.length;
    d.innerHTML = '<div class="betrachter-spur">' + bilder.map(function (f, i) {
      return '<img src="' + esc(f) + '" alt="' + esc(v.titel) + " – Foto " + (i + 1) + '" loading="' + (Math.abs(i - start) < 2 ? "eager" : "lazy") + '" decoding="async">';
    }).join("") + "</div>" +
      '<button class="betrachter-zu" type="button" aria-label="Schließen">' + icon("zu") + "</button>" +
      (n > 1 ? '<button class="galerie-pfeil l" type="button" aria-label="Vorheriges Foto">' + icon("links") + '</button><button class="galerie-pfeil r" type="button" aria-label="Nächstes Foto">' + icon("rechts") + '</button><span class="galerie-zahl"></span>' : "");
    document.body.appendChild(d);
    var spur = d.querySelector(".betrachter-spur"), zahl = d.querySelector(".galerie-zahl");
    function index() { return Math.round(spur.scrollLeft / Math.max(1, spur.clientWidth)); }
    function gehe(i) { spur.scrollTo({ left: Math.max(0, Math.min(n - 1, i)) * spur.clientWidth, behavior: "smooth" }); }
    var zuletzt = start;
    function aktualisieren() {
      if (!d.open || !spur.clientWidth) return; // geschlossen: Position nicht überschreiben
      var i = index();
      zuletzt = i;
      if (zahl) zahl.textContent = (i + 1) + " / " + n;
      var l = d.querySelector(".galerie-pfeil.l"), r = d.querySelector(".galerie-pfeil.r");
      if (l) l.disabled = i === 0;
      if (r) r.disabled = i === n - 1;
    }
    spur.addEventListener("scroll", aktualisieren, { passive: true });
    d.querySelector(".betrachter-zu").addEventListener("click", function () { d.close(); });
    var l = d.querySelector(".galerie-pfeil.l"), r = d.querySelector(".galerie-pfeil.r");
    if (l) l.addEventListener("click", function () { gehe(index() - 1); });
    if (r) r.addEventListener("click", function () { gehe(index() + 1); });
    d.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); gehe(index() + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); gehe(index() - 1); }
    });
    d.addEventListener("close", function () {
      var i = zuletzt;
      document.documentElement.style.overflow = "";
      d.remove();
      if (zurueck) zurueck(i);
    });
    document.documentElement.style.overflow = "hidden";
    d.showModal();
    spur.scrollLeft = start * spur.clientWidth;
    aktualisieren();
  }

  /* ---------- Kontaktformular ---------- */

  function formular() {
    var form = document.getElementById("anfrage");
    if (!form) return;
    var meldung = form.querySelector(".meldung");
    var knopf = form.querySelector('button[type="submit"]');
    var auswahl = form.querySelector("[data-fahrzeugwahl]");
    function f(name) { return form.elements.namedItem(name); }

    if (auswahl) {
      ANGEBOT.forEach(function (v) {
        var o = document.createElement("option");
        o.value = o.textContent = fahrzeugBezeichnung(v);
        auswahl.appendChild(o);
      });
    }

    function zeige(art, html) {
      meldung.className = "meldung breit " + art;
      meldung.innerHTML = html;
      meldung.hidden = false;
    }

    // Häufige Tippfehler in E-Mail-Adressen still korrigieren (Leerzeichen, Komma statt Punkt, Punkt am Ende)
    function emailBereinigen(w) {
      w = String(w || "").replace(/\s+/g, "").replace(/,/g, ".").replace(/\.{2,}/g, ".").replace(/\.+$/, "");
      var at = w.lastIndexOf("@");
      return at > 0 ? w.slice(0, at + 1) + w.slice(at + 1).toLowerCase() : w;
    }

    // Fehler direkt am Feld anzeigen; verschwindet, sobald man das Feld ändert
    function feldFehler(name, text) {
      var feld = f(name);
      feld.classList.add("falsch");
      feld.setAttribute("aria-invalid", "true");
      var hinweis = feld.parentNode.querySelector(".feld-hinweis");
      if (!hinweis) { hinweis = document.createElement("small"); hinweis.className = "feld-hinweis"; feld.parentNode.appendChild(hinweis); }
      hinweis.textContent = text;
    }
    function fehlerWeg() {
      form.querySelectorAll(".falsch").forEach(function (el) { el.classList.remove("falsch"); el.removeAttribute("aria-invalid"); });
      form.querySelectorAll(".feld-hinweis").forEach(function (el) { el.remove(); });
      if (meldung.classList.contains("fehler")) meldung.hidden = true;
    }
    ["name", "telefon", "email"].forEach(function (n) { f(n).addEventListener("input", fehlerWeg); });

    // Rückmeldung nach Versand ohne JavaScript (kontakt.php leitet zurück)
    var p = new URLSearchParams(EINZEL ? "" : location.search);
    if (p.get("anfrage") === "ok") zeige("ok", "<strong>Vielen Dank!</strong> Ihre Anfrage ist bei uns angekommen. Wir melden uns so schnell wie möglich.");
    if (p.get("anfrage") === "fehler") zeige("fehler", 'Die Anfrage konnte nicht gesendet werden. Bitte rufen Sie uns an: <a href="tel:' + FIRMA.telefon + '">' + FIRMA.telefonAnzeige + "</a>");

    function nachrichtText(d) {
      return [
        "Anfrage über die Webseite",
        "",
        "Anliegen: " + d.anliegen,
        "Fahrzeug: " + (d.fahrzeug || "–"),
        "Name: " + d.name,
        "Telefon: " + (d.telefon || "–"),
        "E-Mail: " + (d.email || "–"),
        "",
        d.nachricht || ""
      ].join("\n").trim();
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (f("website").value) return;
      var d = {
        anliegen: f("anliegen").value,
        fahrzeug: auswahl ? auswahl.value : "",
        name: f("name").value.trim(),
        telefon: f("telefon").value.trim(),
        email: emailBereinigen(f("email").value),
        nachricht: f("nachricht").value.trim()
      };
      fehlerWeg();
      f("email").value = d.email;
      if (!d.name) { feldFehler("name", "Bitte Ihren Namen eingeben."); zeige("fehler", "Bitte geben Sie Ihren Namen an."); f("name").focus(); return; }
      if (!d.telefon && !d.email) { feldFehler("telefon", "Telefon oder E-Mail angeben, damit wir antworten können."); zeige("fehler", "Bitte geben Sie Telefon oder E-Mail an, damit wir Ihnen antworten können."); f("telefon").focus(); return; }
      if (d.email && !/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(d.email)) {
        feldFehler("email", "Bitte prüfen, z. B. name@outlook.de" + (d.telefon ? " – oder das Feld leer lassen." : "."));
        zeige("fehler", "Die E-Mail-Adresse ist unvollständig. Bitte korrigieren und erneut senden.");
        f("email").focus(); return;
      }

      var fd = new FormData(form);
      fd.set("fahrzeug", d.fahrzeug);
      fd.set("dauer", String(Date.now() - geladen));
      fd.set("seite", location.href);
      knopf.disabled = true;
      var alterText = knopf.innerHTML;
      knopf.textContent = "Wird gesendet …";

      function fertig() { knopf.disabled = false; knopf.innerHTML = alterText; }
      function ersatzweg() {
        // Ohne PHP (z. B. GitHub Pages oder Datei am PC): Nachricht vorbereiten, Versand per WhatsApp oder E-Mail
        var text = nachrichtText(d);
        var mail = "mailto:" + FIRMA.email + "?subject=" + encodeURIComponent("Anfrage: " + (d.fahrzeug || d.anliegen)) + "&body=" + encodeURIComponent(text);
        zeige("info", "<strong>Ihre Nachricht ist vorbereitet.</strong> Wählen Sie, wie Sie sie an uns schicken möchten:" +
          '<span class="meldung-knoepfe"><a class="btn btn-dunkel" href="' + esc(waLink(text)) + '" target="_blank" rel="noopener">' + icon("chat") + "Per WhatsApp senden</a>" +
          '<a class="btn btn-hell" href="' + esc(mail) + '">' + icon("mail") + "Per E-Mail senden</a></span>" +
          "Oder rufen Sie an: <strong>" + FIRMA.telefonAnzeige + "</strong> · E-Mail: " + esc(FIRMA.email));
        fertig();
      }

      if (EINZEL || location.protocol === "file:" || !window.fetch) { ersatzweg(); return; }
      fetch("kontakt.php", { method: "POST", body: fd, headers: { "X-Requested-With": "fetch", "Accept": "application/json" } })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }).then(function (j) { if (!r.ok || !j.ok) throw new Error("nicht gesendet"); }); })
        .then(function () {
          zeige("ok", "<strong>Vielen Dank, " + esc(d.name) + "!</strong> Ihre Anfrage wurde gesendet. Wir melden uns so schnell wie möglich. Eilt es? Dann rufen Sie an: <strong>" + FIRMA.telefonAnzeige + "</strong>");
          form.reset();
          if (auswahl && seite === "fahrzeug") auswahl.value = d.fahrzeug;
          fertig();
        })
        .catch(ersatzweg);
    });
  }

  /* ---------- Start ---------- */

  document.querySelectorAll("[data-jahr]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  formular();
  if (seite === "start") startseite();
  if (seite === "fahrzeug") detailseite();
  if (EINZEL) ansichten();

  /* ---------- Einzelseiten-Vorschau: Ansichten über die #-Adresse ---------- */

  function ansichten() {
    var titelStart = document.title;
    var auswahl = document.querySelector("[data-fahrzeugwahl]");
    document.querySelectorAll("[data-wa]").forEach(function (a) { a.setAttribute("data-wa", a.getAttribute("href")); });
    var aktuell = null, aktuellNr = null, vorher = null, startScroll = 0;
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    function nach(y) { window.scrollTo({ top: y, behavior: "instant" }); }
    window.addEventListener("scroll", function () { if (aktuell === "start") startScroll = window.scrollY; }, { passive: true });

    function zeigen() {
      var h = decodeURIComponent(location.hash.slice(1));
      var anker = h ? document.getElementById(h) : null;
      var gemeinsam = anker && !anker.closest("[data-ansicht]");
      var gemerkt = history.state && history.state.ansicht;
      var m = h.match(/^fahrzeug-([\w-]+)$/);
      var ziel = "start", nr = null;
      if (m) { ziel = "fahrzeug"; nr = m[1]; }
      else if (h === "impressum" || h === "datenschutz") ziel = h;
      else if (gemerkt) { ziel = gemerkt.ziel; nr = gemerkt.nr || null; }
      else if (gemeinsam && aktuell) { ziel = aktuell; nr = aktuellNr; }
      // Ansicht im Verlauf merken, damit "Zurück" im Browser genau dorthin führt
      try { history.replaceState({ ansicht: { ziel: ziel, nr: nr } }, ""); } catch (err) { /* ignorieren */ }
      if (ziel === aktuell && nr === aktuellNr) return;

      document.querySelectorAll("[data-ansicht]").forEach(function (el) { el.hidden = el.getAttribute("data-ansicht") !== ziel; });
      vorher = aktuell; aktuell = ziel; aktuellNr = nr;
      if (ziel === "fahrzeug") {
        detailseite(nr);
      } else {
        document.title = titelStart;
        document.querySelectorAll("[data-wa]").forEach(function (a) { a.href = a.getAttribute("data-wa"); });
        if (auswahl && vorher === "fahrzeug") auswahl.value = "";
      }
      if (ziel === "start" && gemerkt && vorher && vorher !== "start" && startScroll > 0) nach(startScroll);
      else if (anker) anker.scrollIntoView({ behavior: "instant" });
      else if (vorher) nach(0);
    }

    var zurueck = document.getElementById("zurueck");
    if (zurueck) zurueck.addEventListener("click", function (e) {
      if (vorher === "start") { e.preventDefault(); history.back(); }
    });
    window.addEventListener("hashchange", zeigen);
    zeigen();
  }
})();
