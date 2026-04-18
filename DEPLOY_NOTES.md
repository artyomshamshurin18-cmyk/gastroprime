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
