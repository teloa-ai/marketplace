# Credential inventory: billing (gitignored; not for sharing)

| Masked preview | Location | Type | Grants | Production or test | Advice |
| --- | --- | --- | --- | --- | --- |
| `post****` | `billing/db.py:4` | database connection string with password | the `billing` database on db-prod.internal | looks like production (host name) | rotate now, move to a secret store |
