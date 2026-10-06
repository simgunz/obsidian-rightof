#!/usr/bin/env bash
# Open Obsidian on a throwaway vault that has this plugin installed.
# Usage: scripts/sandbox.sh [dir]   (default: a new temp dir)
# RIGHTOF_CDP_PORT=9222 also opens a Chrome DevTools Protocol port for automation.
set -euo pipefail

repo=$(cd "$(dirname "$0")/.." && pwd)
dir=${1:-$(mktemp -d)}
vault=$dir/vault
config=$dir/config
plugin=$vault/.obsidian/plugins/rightof

mkdir -p "$plugin" "$config"
cp "$repo"/tests/vault/*.md "$vault/"
for file in main.js manifest.json styles.css; do
	ln -sf "$repo/$file" "$plugin/$file"
done
echo '["rightof"]' > "$vault/.obsidian/community-plugins.json"

# A separate user-data-dir keeps the sandbox away from your real vaults and settings.
id=$(printf '%s' "$vault" | sha256sum | cut -c1-16)
printf '{"updateDisabled":true,"vaults":{"%s":{"path":"%s","ts":%s,"open":true}}}\n' \
	"$id" "$vault" "$(date +%s000)" > "$config/obsidian.json"

echo "Vault: $vault"
flags=(--user-data-dir="$config")
if [[ -n ${RIGHTOF_CDP_PORT:-} ]]; then
	flags+=(--remote-debugging-port="$RIGHTOF_CDP_PORT")
fi
exec obsidian "${flags[@]}"
