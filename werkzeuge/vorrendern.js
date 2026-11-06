// Öffnet claude-vorschau.html einmal im Browser und speichert die fertig
// gerenderte Fahrzeugliste, damit sie fest in die Seite eingesetzt werden kann.
// Aufruf: node vorrendern.js <adresse> <ausgabe.json>
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  await p.goto(process.argv[2]); await p.waitForTimeout(800);
  const d = await p.evaluate(() => ({
    bereichKlasse: document.getElementById('fahrzeuge').className,
    liste: document.getElementById('liste').outerHTML,
    zahl: document.getElementById('ergebnis-zahl').innerHTML,
    klammer: (document.querySelector('[data-anzahl-klammer]') || {}).textContent || ''
  }));
  fs.writeFileSync(process.argv[3], JSON.stringify(d));
  await b.close();
})();
