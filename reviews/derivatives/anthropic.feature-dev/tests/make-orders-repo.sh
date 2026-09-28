#!/bin/sh
# Scratch repository for review-pr and feature-dev: a tiny order service with guidelines and tests.
# With "review" as $2 it also leaves a staged change, an unstaged change and an untracked new file to review.
set -e
R="$1"; mkdir -p "$R"; cd "$R"
git init -q -b main; git config user.name Sample; git config user.email sample@example.invalid
mkdir -p orders tests
cat > AGENTS.md <<'MD'
# Project guidelines
- Never swallow exceptions: log them with `log.exception(...)` and re-raise, or return an explicit error.
- Money is always an integer number of cents.
- Every public function has a test in tests/.
MD
cat > orders/__init__.py <<'PY'
PY
cat > orders/log.py <<'PY'
import logging

log = logging.getLogger("orders")
PY
cat > orders/service.py <<'PY'
from orders.log import log


def order_total(items):
    """Return the order total in cents."""
    return sum(item["price_cents"] * item["qty"] for item in items)


def load_order(store, order_id):
    order = store.get(order_id)
    if order is None:
        raise KeyError(order_id)
    return order
PY
cat > tests/test_service.py <<'PY'
from orders.service import order_total


def test_order_total_counts_quantity():
    assert order_total([{"price_cents": 250, "qty": 2}]) == 500
PY
git add -A; git commit -q -m "feat: order totals and loading"
if [ "$2" = review ]; then
cat > orders/service.py <<'PY'
from orders.log import log


def order_total(items):
    """Return the order total in cents."""
    return sum(item["price_cents"] * item["qty"] for item in items)


def load_order(store, order_id):
    try:
        return store[order_id]
    except Exception:
        return None


def apply_coupon(total_cents, coupon):
    # Returns the discounted total in dollars.
    if coupon.percent > 100:
        coupon.percent = 100
    return total_cents - total_cents * coupon.percent // 100
PY
git add orders/service.py
cat > orders/coupon.py <<'PY'
class Coupon:
    """A percentage coupon. percent is always between 0 and 100."""

    def __init__(self, code, percent):
        self.code = code
        self.percent = percent
PY
cat >> tests/test_service.py <<'PY'


def test_order_total_empty():
    assert order_total([]) == 0
PY
fi
