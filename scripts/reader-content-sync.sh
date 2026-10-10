#!/usr/bin/env bash
# Sync Reader's RAG knowledge base on daedalus from the site repo.
#
# The GitHub repo (main) is the source of truth for content/. This pulls it,
# copies the published knowledge-base files into ~/reader-agent/content, and
# re-runs ingestion when anything changed. Drafts (`published: false`) are
# never ingested. Intended to run from jreader's crontab every 5 minutes:
#
#   */5 * * * * $HOME/reader-content-sync/reader-content-sync.sh >> $HOME/reader-content-sync/sync.log 2>&1
#
# Usage: reader-content-sync.sh [--force] [--dry-run]
set -euo pipefail

REPO_URL="https://github.com/jamesreader/Jamesreader.dev.git"
BRANCH="main"
BASE="$HOME/reader-content-sync"
REPO="$BASE/repo"
AGENT="$HOME/reader-agent"
TARGET="$AGENT/content"
STAMP="$BASE/last-synced-tree"
COLLECTIONS=(projects experience philosophy blog)

FORCE=0
DRY_RUN=0
for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    --dry-run) DRY_RUN=1 ;;
    *) echo "unknown arg: $arg" >&2; exit 2 ;;
  esac
done

log() { echo "$(date -Is) $*"; }

mkdir -p "$BASE/backups"
exec 9>"$BASE/.lock"
flock -n 9 || { log "another sync is running; skipping"; exit 0; }

if [ ! -d "$REPO/.git" ]; then
  git clone --quiet --depth 1 --branch "$BRANCH" "$REPO_URL" "$REPO"
fi
git -C "$REPO" fetch --quiet --depth 1 origin "$BRANCH"
git -C "$REPO" reset --quiet --hard "origin/$BRANCH"

# Tree hash of content/ changes only when content changes.
tree=$(git -C "$REPO" rev-parse "HEAD:content")
if [ "$FORCE" -eq 0 ] && [ -f "$STAMP" ] && [ "$(cat "$STAMP")" = "$tree" ]; then
  exit 0
fi

staging=$(mktemp -d)
trap 'rm -rf "$staging"' EXIT

for c in "${COLLECTIONS[@]}"; do
  src="$REPO/content/$c"
  [ -d "$src" ] || continue
  mkdir -p "$staging/$c"
  for f in "$src"/*.md "$src"/*.mdx; do
    [ -f "$f" ] || continue
    # Skip drafts: a `published: false` line inside the frontmatter block.
    if awk 'NR==1 && $0!="---"{exit 1} NR>1 && $0=="---"{exit 1} /^published:[[:space:]]*false[[:space:]]*$/{found=1; exit 0} END{exit found?0:1}' "$f"; then
      continue
    fi
    cp "$f" "$staging/$c/"
  done
done

if diff -rq --exclude='*.bak-*' "$staging" "$TARGET" >/dev/null 2>&1 && [ "$FORCE" -eq 0 ]; then
  echo "$tree" > "$STAMP"
  log "repo moved (tree $tree) but published knowledge base unchanged; nothing to ingest"
  exit 0
fi

log "changes for $tree:"
diff -rq --exclude='*.bak-*' "$staging" "$TARGET" || true

if [ "$DRY_RUN" -eq 1 ]; then
  log "dry run; not applying"
  exit 0
fi

backup="$BASE/backups/content-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$backup" -C "$AGENT" content
ls -1t "$BASE"/backups/content-*.tar.gz | tail -n +31 | xargs -r rm -f

rsync -a --delete --exclude='*.bak-*' "$staging/" "$TARGET/"

cd "$AGENT"
if ! CONTENT_DIR="$TARGET" venv/bin/python -m ingestion.ingest; then
  log "ingest FAILED; restoring $backup and re-ingesting previous content"
  rm -rf "$TARGET"
  tar -xzf "$backup" -C "$AGENT"
  CONTENT_DIR="$TARGET" venv/bin/python -m ingestion.ingest || log "re-ingest of previous content also failed"
  exit 1
fi

echo "$tree" > "$STAMP"
log "synced and ingested tree $tree"
