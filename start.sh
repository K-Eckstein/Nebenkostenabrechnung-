#!/bin/bash
# Nebenkostenabrechnung starten
# Für Linux Mint / Ubuntu

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BROWSER=$(which xdg-open 2>/dev/null || which firefox 2>/dev/null || which google-chrome 2>/dev/null)

if [ -z "$BROWSER" ]; then
    echo "❌ Kein Browser gefunden!"
    echo "Bitte installiere einen Browser oder öffne die Datei manuell:"
    echo "$SCRIPT_DIR/dist/nebenkosten.html"
    exit 1
fi

echo "🏠 Starte Nebenkostenabrechnung..."
$BROWSER "$SCRIPT_DIR/dist/nebenkosten.html"
