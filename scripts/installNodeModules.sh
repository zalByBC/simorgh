#!/bin/bash
if [ "$1" = "--production" ]; then
  echo "Installing Simorgh's node modules"
  rm -rf node_modules | pnpm workspaces focus --all --production
  echo "Installing NextJS app node modules"
  cd ws-nextjs-app && rm -rf node_modules | pnpm workspaces focus --all --production
else
  echo "Installing Simorgh's node modules"
  rm -rf node_modules | pnpm install --immutable --check-cache
  echo "Installing NextJS app node modules"
  cd ws-nextjs-app && rm -rf node_modules | pnpm install --immutable --check-cache
fi
