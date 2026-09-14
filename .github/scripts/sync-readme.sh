#!/usr/bin/env bash
set -euo pipefail

expected="${GITHUB_SHA:?GITHUB_SHA must identify the checked commit}"
test "$(git rev-parse HEAD)" = "$expected"

master_sha() {
  git ls-remote --exit-code origin refs/heads/master | cut -f1
}

remote_sha="$(master_sha)"
if [ "$remote_sha" != "$expected" ]; then
  echo "Master advanced; its CI run will regenerate the README."
  exit 0
fi

cp -- "$1" README.md
if git diff --quiet -- README.md; then
  exit 0
fi

git add -- README.md
git -c user.name='github-actions[bot]' \
  -c user.email='41898282+github-actions[bot]@users.noreply.github.com' \
  -c core.hooksPath=/dev/null commit --only -m 'docs: regenerate README table' -- README.md

if ! git -c core.hooksPath=/dev/null push origin HEAD:refs/heads/master; then
  remote_sha="$(master_sha)"
  if [ "$remote_sha" != "$expected" ]; then
    echo "Master advanced during synchronization; leaving the newer commit intact."
    exit 0
  fi
  echo "README push failed. Check branch permissions and rerun the failed job." >&2
  exit 1
fi
