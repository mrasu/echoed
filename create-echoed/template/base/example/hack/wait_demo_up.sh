#!/bin/bash
set -u

source ./echoed-opentelemetry-demo/.env

if [ -z "$ENVOY_PORT" ]; then
  echo "ENVOY_PORT is not set"
  exit 1
fi

url="http://localhost:${ENVOY_PORT}"
status_code=0

max_attempts=20
attempt=1
while [ $attempt -le $max_attempts ]; do
  echo "Waiting for ${url} to become usable (attempt ${attempt} / ${max_attempts})"
  status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")

  if [ "$status_code" -eq 200 ]; then
    break
  fi

  ((attempt++))

  sleep 1
done

if [ "$status_code" -ne 200 ]; then
  echo "Failed to request ${url} after ${max_attempts} attempts"
  exit 1
fi
