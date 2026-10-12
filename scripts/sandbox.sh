#!/usr/bin/env bash
# Open Obsidian on a throwaway vault that has this plugin installed.
# Usage: scripts/sandbox.sh [dir]   (default: a new temp dir)
# RIGHTOF_CDP_PORT=9222 also opens a Chrome DevTools Protocol port for automation.
set -euo pipefail

repo=$(cd "$(dirname "$0")/.." && pwd)
dir=$(realpath -m "${1:-$(mktemp -d)}")
vault=$dir/vault
config=$dir/config
plugin=$vault/.obsidian/plugins/rightof

if [[ ! -f $repo/main.js ]]; then
	echo "main.js is missing: run 'npm run build' first." >&2
	exit 1
fi
if ! command -v obsidian >/dev/null; then
	echo "The 'obsidian' command is not on PATH." >&2
	exit 1
fi

mkdir -p "$plugin" "$config"
cp "$repo"/tests/vault/*.md "$vault/"
for file in main.js manifest.json styles.css; do
	ln -sf "$repo/$file" "$plugin/$file"
done
echo '["rightof"]' > "$vault/.obsidian/community-plugins.json"

# A separate user-data-dir keeps the sandbox away from your real vaults and settings.
VAULT="$vault" node -e '
	const id = require("node:crypto").createHash("sha256").update(process.env.VAULT).digest("hex").slice(0, 16);
	const vaults = { [id]: { path: process.env.VAULT, ts: Date.now(), open: true } };
	console.log(JSON.stringify({ updateDisabled: true, vaults }));
' > "$config/obsidian.json"

echo "Vault: $vault"
flags=(--user-data-dir="$config")
if [[ -n ${RIGHTOF_CDP_PORT:-} ]]; then
	flags+=(--remote-debugging-port="$RIGHTOF_CDP_PORT")
fi
exec obsidian "${flags[@]}"
