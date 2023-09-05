#!/usr/bin/env sh

cd packages/db || exit
pnpm db:migrate
pnpm db:seed
cd ../../apps/nextjs || exit

service cron start
node server.js
