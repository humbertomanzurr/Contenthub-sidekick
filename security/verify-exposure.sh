#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# Proves — from outside, as an anonymous stranger — whether this database is
# exposed. Reads the project URL and anon key straight out of the shipped
# source, because that is exactly what an attacker would do.
#
#   ./security/verify-exposure.sh
#
# BEFORE security/rls.sql:  rows come back. That is the vulnerability.
# AFTER  security/rls.sql:  every table is refused outright (401/403) and so
#                           is the write probe. A table still returning rows
#                           was missed. Note that a table which is merely
#                           EMPTY also reads as 0 rows — that is why the SQL
#                           revokes the anon grants, so protection shows up
#                           as a refusal rather than as an empty list.
#
# Run it from the repo root. Read-only apart from one PATCH deliberately
# aimed at an all-zeroes uuid, which matches nothing and changes nothing.
# ═══════════════════════════════════════════════════════════════════════════
set -uo pipefail
cd "$(dirname "$0")/.."

SRC=src/lib/supabase.jsx
URL=$(grep -o 'https://[a-z0-9]*\.supabase\.co' "$SRC" | head -1)
KEY=$(grep -o 'eyJ[A-Za-z0-9._-]*' "$SRC" | head -1)
[ -n "$URL" ] && [ -n "$KEY" ] || { echo "could not read URL/key from $SRC"; exit 1; }

TABLES="workspaces workspace_members profiles agency_clients agency_videos
        agency_targets agency_card_notes creator_videos creator_goals campaigns"

echo "Anonymous probe of $URL"
echo "using the anon key from $SRC — no login, no password."
echo
printf "  %-22s %8s   %s\n" TABLE ROWS VERDICT
printf "  %-22s %8s   %s\n" "----------------------" "--------" "-------"

leaked=0
for t in $TABLES; do
  hdr=$(curl -s -D - -o /dev/null "$URL/rest/v1/$t?select=*" \
        -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
        -H "Range: 0-0" -H "Prefer: count=exact" --max-time 20)
  code=$(printf '%s' "$hdr" | head -1 | awk '{print $2}')
  n=$(printf '%s' "$hdr" | grep -i '^content-range' | sed 's|.*/||' | tr -d '\r ')
  case "$code" in
    401|403)     verdict="protected (refused)"; n="-" ;;
    404)         verdict="table absent";        n="-" ;;
    200|206)
      if [ "${n:-0}" = "0" ] || [ -z "${n:-}" ]; then verdict="protected (0 rows)"
      else verdict="!! LEAKING $n ROWS"; leaked=$((leaked+1)); fi ;;
    *)           verdict="unexpected HTTP $code"; n="${n:--}" ;;
  esac
  printf "  %-22s %8s   %s\n" "$t" "${n:--}" "$verdict"
done

echo
NIL=00000000-0000-0000-0000-000000000000
w=$(curl -s -o /dev/null -w '%{http_code}' -X PATCH \
    "$URL/rest/v1/agency_videos?id=eq.$NIL" \
    -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
    -H "Content-Type: application/json" -d '{"title":"probe"}' --max-time 20)
if [ "$w" = "401" ] || [ "$w" = "403" ]; then
  echo "  anonymous write:      refused (HTTP $w)  — correct"
else
  echo "  anonymous write:      !! ACCEPTED (HTTP $w) — strangers can still write"
  leaked=$((leaked+1))
fi

echo
if [ "$leaked" -eq 0 ]; then
  echo "PASS — nothing reachable anonymously."
else
  echo "FAIL — $leaked check(s) still exposed. Do not consider this closed."
  exit 1
fi
