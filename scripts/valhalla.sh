#!/usr/bin/env bash
# Start/stop a local Valhalla (pedestrian isochrones) on the clipped OSM extract in .cache/valhalla/custom_files
set -euo pipefail
NAME=metro-valhalla
IMAGE=ghcr.io/valhalla/valhalla-scripted:3.8.3
DIR="$(cd "$(dirname "$0")/.." && pwd)/.cache/valhalla/custom_files"

case "${1:-start}" in
  start)
    docker rm -f "$NAME" >/dev/null 2>&1 || true
    docker run -d --name "$NAME" -p 8002:8002 -v "$DIR:/custom_files" \
      -e serve_tiles=True -e build_elevation=False -e build_transit=False -e build_time_zones=True -e build_admins=True \
      "$IMAGE" >/dev/null
    echo "waiting for Valhalla tiles + service..."
    until curl -sf http://localhost:8002/status >/dev/null; do sleep 5; done
    curl -s http://localhost:8002/status; echo
    ;;
  stop) docker rm -f "$NAME" ;;
  *) echo "usage: $0 [start|stop]"; exit 1 ;;
esac
