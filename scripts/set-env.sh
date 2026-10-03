#!/bin/sh
# الاستخدام: sh scripts/set-env.sh https://xxxx.supabase.co ANON_KEY
[ -z "$2" ] && { echo "usage: sh scripts/set-env.sh <SUPABASE_URL> <ANON_KEY>"; exit 1; }
cd "$(dirname "$0")/.." && printf 'VITE_SUPABASE_URL=%s\nVITE_SUPABASE_ANON_KEY=%s\n' "$1" "$2" > .env && echo ".env written (local to this project only)"
