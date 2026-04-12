#!/usr/bin/env bash
# Deploy the whole project folder to Surge (static hosting).
#
# - Site root "/" is the deck: index.html (+ slides.md, slides-viz.js, …).
# - The interactive explainer lives at: /artifacts/explorer/
# - Archived full deck (if present): /backup/pre-rebuild-2026-04-09/index.html
#   Example: https://YOUR_DOMAIN.surge.sh/backup/pre-rebuild-2026-04-09/
#
# Troubleshooting "Deployment did not succeed":
# - Surge hostnames must be valid DNS labels: use lowercase letters, digits, and
#   hyphens only — underscores (e.g. LLM_Lecture_...) are invalid and often fail.
# - Non-interactive: export SURGE_TOKEN from https://surge.sh/account (then rerun).
# - Debug: SURGE_DEBUG=1 ./deploy.sh  (prints Surge's internal log)
#
set -e
cd "$(dirname "$0")"

# Override if needed: SURGE_DOMAIN=my-deck.surge.sh ./deploy.sh
DOMAIN="${SURGE_DOMAIN:-llm-lecture-zgz26.surge.sh}"

# Surge is unstable on very new Node versions (e.g. v23).
# Force Node 20 for the deploy command to avoid runtime crashes.
SURGE_CMD=(npx -y -p node@20 -p surge surge)

# If SURGE_TOKEN is set, deploy non-interactively (no email prompt).
SURGE_EXTRA=()
if [ -n "${SURGE_DEBUG:-}" ]; then
  SURGE_EXTRA+=(--debug)
fi

if [ -n "${SURGE_TOKEN:-}" ]; then
  "${SURGE_CMD[@]}" . "$DOMAIN" --token "$SURGE_TOKEN" "${SURGE_EXTRA[@]}"
else
  "${SURGE_CMD[@]}" . "$DOMAIN" "${SURGE_EXTRA[@]}"
fi
