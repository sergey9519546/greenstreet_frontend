#!/bin/bash
# Self-restarting production server wrapper for DSCR Deal Desk v11.14
# Uses bun + standalone build for maximum stability
cd /home/z/my-project

# Ensure standalone build has static + public assets
if [ ! -d .next/standalone/.next/static ]; then
  cp -r .next/static .next/standalone/.next/ 2>/dev/null
fi
if [ ! -d .next/standalone/public ]; then
  cp -r public .next/standalone/ 2>/dev/null
fi

# Trap all signals and restart
trap '' HUP INT TERM

while true; do
  PORT=3000 NODE_ENV=production bun .next/standalone/server.js >> server.log 2>&1
  echo "[$(date)] Server exited, restarting in 2s..." >> server.log
  sleep 2
done
