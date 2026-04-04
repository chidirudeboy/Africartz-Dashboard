# GitHub Actions + Vercel

This repo uses:
- GitHub Actions for CI
- Vercel for preview and production deployments

## Workflow Files

- `.github/workflows/ci.yml`
- `.github/workflows/vercel-deploy.yml`

## Branch Flow

- `development` -> CI + preview deployment
- pull requests targeting `development` or `production` -> CI + preview deployment
- `production` -> CI + production deployment

## Local Build Check

Use this before pushing deployment-sensitive changes:

```bash
npm run build:prod
```

## Required Setup

Configure your deployment platform and repository secrets outside committed docs.

## Notes

- The workflow source of truth is the YAML files in `.github/workflows/`.
- Keep sensitive deployment values out of committed documentation.
