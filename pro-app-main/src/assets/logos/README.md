# Tenant Logos

Place tenant logo files in this directory, named by `org_id`.

## Naming convention

```
{org_id}.png
```

| org_id | File | Tenant |
|--------|------|--------|
| `tps`  | `tps.png` | Toronto Police Service |

## Requirements

- Format: PNG with transparent background preferred
- Size: aim for at least 200×200 px; the UI renders at 36 px height
- The `logo` field in `src/tenants/{org_id}.js` should reference the file as `/assets/logos/{org_id}.png`

## Adding a new tenant logo

1. Drop `{org_id}.png` into this directory
2. Set `logo: '/assets/logos/{org_id}.png'` in `src/tenants/{org_id}.js`
3. If `logo` is `null`, the app falls back to the default Pocket Procedures logo
