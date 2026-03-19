#!/usr/bin/env bash
# Deploy The Branch to the-branch.surge.sh
set -e
cd "$(dirname "$0")"

DOMAIN="LLM_Lecture_ZGZ26.surge.sh"

# If SURGE_TOKEN is set, deploy non-interactively (no email prompt).
if [ -n "${SURGE_TOKEN:-}" ]; then
  npx surge . "$DOMAIN" --token "$SURGE_TOKEN"
else
  npx surge . "$DOMAIN"
fi
