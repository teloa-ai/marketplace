# R2 N4：Python 3.13+ 按位置传 re.split 的 maxsplit 会触发 DeprecationWarning；改成关键字后无告警。
import re, sys, warnings
out = {"python": sys.version.split()[0]}
for label, call in (("positional", lambda: re.split(r"[?#]", "/a?b#c", 1)), ("keyword", lambda: re.split(r"[?#]", "/a?b#c", maxsplit=1))):
    with warnings.catch_warnings(record=True) as w:
        warnings.simplefilter("always")
        res = call()
    out[label] = {"result": res, "warnings": [f"{x.category.__name__}: {x.message}" for x in w]}
print(out)
sys.exit(0 if out["positional"]["warnings"] and not out["keyword"]["warnings"] else 1)
