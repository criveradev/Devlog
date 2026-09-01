#!/bin/sh

set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
compose_file="$script_dir/../../docker-compose.yml"
project_name="devlog-backend-test"

cleanup() {
    trap - EXIT HUP INT TERM
    docker compose -f "$compose_file" -p "$project_name" --profile test down --volumes --remove-orphans
}

trap cleanup EXIT HUP INT TERM

docker compose \
    -f "$compose_file" \
    -p "$project_name" \
    --profile test \
    up \
    --build \
    --abort-on-container-exit \
    --exit-code-from test \
    test
