# GastroPrime production layout

## Source of truth on this server
- Backend source: `/root/gastroprime/backend`
- Frontend source: `/root/gastroprime/frontend`
- Deployed frontend assets: `/var/www/gastroprime`
- Running backend process: `pm2` app `gastro-api`

## Important
The top-level files and folders in `/root/gastroprime` such as `/src`, `/public`, `/prisma`, `/package.json`, `/vite.config.ts` are legacy leftovers from an older/manual deploy flow.
They are not treated as the source of truth anymore and are intentionally ignored in git.

Loose files in `/root/*.ts` are also stale manual copies and should not be used as the canonical backend source.

## Goal
Keep future production edits inside `backend/` and `frontend/`, then rebuild/redeploy from there.

## Deploy command
Run from the server:
- `/root/gastroprime/scripts/deploy-prod.sh`

This pulls `origin/main`, rebuilds backend and frontend, syncs frontend files to `/var/www/gastroprime`, restarts `gastro-api`, and saves the PM2 process list.

## Archived legacy files
On 2026-04-18, the legacy top-level app copy and stale loose TypeScript files were moved to:
- `/root/_gastroprime_legacy_archive_20260418-235157`
