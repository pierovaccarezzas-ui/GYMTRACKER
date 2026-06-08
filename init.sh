#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# init.sh — GymTrack PWA bootstrap & verification
# Run this at the start of every agent session. Must exit 0 before any new work.
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "══════════════════════════════════════════════════════════════════"
echo "  GymTrack PWA — Init & Verify"
echo "══════════════════════════════════════════════════════════════════"
echo ""
echo "==> Working directory: $PWD"

# ── 1. Sync dependencies ──────────────────────────────────────────────────
echo ""
echo "==> [1/4] Installing dependencies..."
npm install --prefer-offline --no-audit --no-fund 2>&1 | tail -3

# ── 2. Lint check ─────────────────────────────────────────────────────────
echo ""
echo "==> [2/4] Running lint..."
if npm run lint 2>&1 | tail -5; then
  echo "    ✅ Lint passed."
else
  echo "    ⚠️  Lint warnings found (non-blocking)."
fi

# ── 3. Build ──────────────────────────────────────────────────────────────
echo ""
echo "==> [3/4] Building production bundle..."
npm run build 2>&1 | tail -5

# ── 4. Verify PWA output ─────────────────────────────────────────────────
echo ""
echo "==> [4/4] Verifying build output..."

DIST_FILE="$ROOT_DIR/dist/index.html"
MANIFEST_FILE="$ROOT_DIR/dist/manifest.webmanifest"
SW_FILE="$ROOT_DIR/dist/sw.js"
ASSETS_DIR="$ROOT_DIR/dist/assets"

if [ ! -f "$DIST_FILE" ]; then
  echo "    ❌ FAIL: dist/index.html not found."
  exit 1
fi

if [ ! -f "$MANIFEST_FILE" ]; then
  echo "    ❌ FAIL: dist/manifest.webmanifest not found."
  exit 1
fi

if [ ! -f "$SW_FILE" ]; then
  echo "    ❌ FAIL: dist/sw.js not found."
  exit 1
fi

if [ ! -d "$ASSETS_DIR" ]; then
  echo "    ❌ FAIL: dist/assets directory not found."
  exit 1
fi

DIST_SIZE=$(wc -c < "$DIST_FILE" | tr -d ' ')

if grep -q 'id="root"' "$DIST_FILE"; then
  echo "    ✅ Root element found."
else
  echo "    ❌ FAIL: No <div id=\"root\"> in dist/index.html."
  exit 1
fi

if grep -q 'manifest.webmanifest' "$DIST_FILE"; then
  echo "    ✅ PWA manifest linked."
else
  echo "    ❌ FAIL: dist/index.html does not link manifest.webmanifest."
  exit 1
fi

if grep -q 'registerSW.js' "$DIST_FILE"; then
  echo "    ✅ Service worker registration found."
else
  echo "    ❌ FAIL: dist/index.html does not include registerSW.js."
  exit 1
fi

echo "    ✅ PWA artifacts found: manifest.webmanifest, sw.js, assets/."

echo ""
echo "══════════════════════════════════════════════════════════════════"
echo "  ✅ All checks passed. dist/index.html is $DIST_SIZE bytes."
echo "  Ready for PWA review and Vercel deployment."
echo "══════════════════════════════════════════════════════════════════"
