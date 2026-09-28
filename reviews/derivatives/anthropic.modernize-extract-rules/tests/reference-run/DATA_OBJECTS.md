# Data objects: billing

| Name | Fields (type) | Used by | Location |
| --- | --- | --- | --- |
| account (dict / accounts row) | id (text), status (OPEN, DELINQUENT, CHARGED_OFF), balance (number), credit_limit (number) | RULE-004, RULE-006, RULE-007, RULE-008 | `db.py:10` (columns), `validation.py:12-17`, `lifecycle.py:5-21` |
