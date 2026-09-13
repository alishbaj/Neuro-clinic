#!/bin/sh
# Serve the site at http://localhost:8000 (or the port given as the first argument).
cd "$(dirname "$0")" || exit 1
PORT="${1:-8000}"
echo "Neuro Longevity Care running at http://localhost:$PORT  (Ctrl+C to stop)"
exec python3 -m http.server "$PORT" --bind 127.0.0.1
