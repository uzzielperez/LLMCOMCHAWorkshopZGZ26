#!/usr/bin/env bash
# Deploy The Branch to the-branch.surge.sh
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
