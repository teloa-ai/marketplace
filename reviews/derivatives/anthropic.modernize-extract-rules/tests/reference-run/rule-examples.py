# Executes the Given/When/Then example of each reference rule card against the sample code.
# Run from the billing/ directory of the sample workspace (make-billing-repo.sh).
import os, sys
sys.path.insert(0, os.getcwd())
from decimal import Decimal as D
import interest, validation, lifecycle, report
checks = [
 ("RULE-001", interest.monthly_interest(D("1250.00"), D("18.5")) == D("19.27")),
 ("RULE-001 edge", interest.monthly_interest(D("0"), D("18.5")) == D("0.00")),
 ("RULE-002", interest.late_fee(D("120.00"), 16) == D("12.00")),
 ("RULE-002 edge grace", interest.late_fee(D("120.00"), 15) == D("0.00")),
 ("RULE-002 edge full fee", interest.late_fee(D("250.00"), 20) == D("25.00")),
 ("RULE-003", validation.minimum_payment(500) == 20),
 ("RULE-003 edge small", validation.minimum_payment(12) == 12),
 ("RULE-004", report.statement_total({"balance": D("1250.00")}, D("18.5"), 10) == D("1269.27")),
 ("RULE-005", validation.valid_account_id("AC1234567") is False and validation.valid_account_id("AC12345678") is True),
 ("RULE-006", validation.can_purchase({"status": "OPEN", "balance": 900, "credit_limit": 1000}, 100) is True and validation.can_purchase({"status": "OPEN", "balance": 900, "credit_limit": 1000}, 101) is False),
 ("RULE-007", lifecycle.next_status({"status": "OPEN", "id": "AC00000001"}, 31) == "DELINQUENT"),
 ("RULE-007 edge terminal", lifecycle.next_status({"status": "CHARGED_OFF", "id": "AC00000001"}, 0) == "CHARGED_OFF"),
 ("RULE-008", lifecycle.apply_payment({"status": "DELINQUENT", "balance": 50}, 50) == {"status": "OPEN", "balance": 0}),
 ("refuted 90-day penalty (no penalty added)", report.statement_total({"balance": D("100.00")}, D("0"), 91) == D("110.00")),
]
for name, ok in checks: print(("PASS " if ok else "FAIL ") + name)
print(f"{sum(ok for _, ok in checks)}/{len(checks)} passed")
