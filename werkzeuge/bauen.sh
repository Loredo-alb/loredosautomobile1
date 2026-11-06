#!/bin/sh
# Baut claude-vorschau.html neu (nach jeder Änderung an Fahrzeugen oder Seiten).
# Braucht python3, node und Playwright mit Chromium.
set -e
cd "$(dirname "$0")/.."
python3 werkzeuge/bauen.py
python3 -m http.server 8799 --bind 127.0.0.1 >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null' EXIT
sleep 1
node werkzeuge/vorrendern.js http://127.0.0.1:8799/.vorschau-test.html werkzeuge/.vorrendern.json
python3 werkzeuge/einsetzen.py
rm -f .vorschau-test.html
