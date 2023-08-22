#!/usr/bin/env sh

cd packages/db || exit
pnpm db:migrate
pnpm db:seed
cd ../../apps/nextjs || exit
. setup-telegram.sh

node server.js
