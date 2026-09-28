# 实跑 Flask/FastAPI 参考中的 safe_return_to()。策略见 vectors.json.policy。
import json, re, sys
from urllib.parse import urlsplit, urljoin

# === 与 references 中片段逐字一致 ===
_ENCODED = re.compile(r"%(2e|2f|5c|25)", re.IGNORECASE)

def safe_return_to(value, request_origin, fallback="/"):
    """Return an absolute same-origin URL for a user-supplied `next`/`return_to`, or `fallback`."""
    if not isinstance(value, str) or not value or len(value) > 2048:
        return fallback
    # 1. Raw-string policy: path-absolute, not // or /\, no control/whitespace chars, no backslash,
    #    no percent-encoded . / \ % (any case), no . or .. segments. Legitimate targets never need these.
    if value[0] != "/" or value[1:2] in ("/", "\\"):
        return fallback
    if any(ord(c) <= 0x20 or ord(c) == 0x7F for c in value) or "\\" in value or _ENCODED.search(value):
        return fallback
    if any(seg in (".", "..") for seg in re.split(r"[?#]", value, maxsplit=1)[0].split("/")):
        return fallback
    # 2. Resolve against the request origin and compare scheme + netloc (urlsplit treats //host as authority).
    parts = urlsplit(value)
    if parts.scheme or parts.netloc:
        return fallback
    base = urlsplit(request_origin)
    joined = urlsplit(urljoin(request_origin, value))
    if (joined.scheme, joined.netloc) != (base.scheme, base.netloc) or joined.scheme not in ("http", "https"):
        return fallback
    # 3. Re-check the normalized path and return the absolute URL (never re-serialize to a relative string).
    if joined.path.startswith("//"):
        return fallback
    return joined.geturl()

data = json.load(open("vectors.json")); base = data["base"]; fail = 0
def nav_origin(s):
    p = urlsplit(urljoin(base, s)); return f"{p.scheme}://{p.netloc}"
for v in data["attack"]:
    out = safe_return_to(v, base); ok = out == "/"; fail += 0 if ok else 1
    print(json.dumps({"kind": "attack", "input": v, "output": out, "pass": ok}, ensure_ascii=False))
for v in data["benign"]:
    out = safe_return_to(v, base); p = urlsplit(out)
    ok = out.startswith(base) and nav_origin(out) == base and not p.path.startswith("//")
    fail += 0 if ok else 1
    print(json.dumps({"kind": "benign", "input": v, "output": out, "pass": ok}, ensure_ascii=False))
print(json.dumps({"python": sys.version.split()[0], "total": len(data["attack"]) + len(data["benign"]), "attack": len(data["attack"]), "benign": len(data["benign"]), "failures": fail}))
sys.exit(1 if fail else 0)
