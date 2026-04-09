#!/usr/bin/env bash
# Deploy the whole project folder to Surge (static hosting).
#
# - Site root "/" is the deck: index.html (+ slides.md, slides-viz.js, …).
# - The interactive explainer lives at: /artifacts/explorer/  (index.html there).
#   Full URL: https://YOUR_DOMAIN.surge.sh/artifacts/explorer/
#
set -e
cd "$(dirname "$0")"

DOMAIN="LLM_Lecture_ZGZ26.surge.sh"

# Surge is unstable on very new Node versions (e.g. v23).
# Force Node 20 for the deploy command to avoid runtime crashes.
SURGE_CMD=(npx -y -p node@20 -p surge surge)

# If SURGE_TOKEN is set, deploy non-interactively (no email prompt).
if [ -n "${SURGE_TOKEN:-}" ]; then
  "${SURGE_CMD[@]}" . "$DOMAIN" --token "$SURGE_TOKEN"
else
  "${SURGE_CMD[@]}" . "$DOMAIN"
fi
