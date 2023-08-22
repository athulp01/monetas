#!/usr/bin/env sh

cd packages/db || exit
pnpm db:migrate
pnpm db:seed
cd ../../apps/nextjs || exit
node server.js

. setup-telegram.sh