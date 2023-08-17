#!/usr/bin/env bash

if [[ -z "${TELEGRAM_API_KEY}" || -z "${BASE_URL}" || -z "${TELEGRAM_SECRET_TOKEN}" ]]; then
  echo "Skipping setting up of telegram webhook since the required env variables are not set"
else
  curl -X "POST" "https://api.telegram.org/${TELEGRAM_API_KEY}/setWebhook" -d "{\"url\": \"${BASE_URL}/api/telegram/webhook\", \"secret_token\": \"${TELEGRAM_SECRET_TOKEN}\"}"  -H 'Content-Type: application/json; charset=utf-8'
fi
