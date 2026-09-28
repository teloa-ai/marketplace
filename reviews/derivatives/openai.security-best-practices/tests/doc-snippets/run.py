# 实跑从 Flask / FastAPI 文档提取的 safe_return_to（应与 tests/python-safe-return-to.test.py 完全一致）
import json, sys, importlib.util, os
here = os.path.dirname(__file__)
data = json.load(open(os.path.join(here, "..", "vectors.json"))); base = data["base"]
fail = 0; n = 0
for name in ("flask", "fastapi"):
    spec = importlib.util.spec_from_file_location(name, os.path.join(here, name + ".py")); mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
    for v in data["attack"]:
        n += 1
        if mod.safe_return_to(v, base) != "/": fail += 1; print("FAIL", name, "attack", repr(v))
    for v in data["benign"]:
        n += 1
        out = mod.safe_return_to(v, base)
        if not out.startswith(base): fail += 1; print("FAIL", name, "benign", repr(v), out)
print(json.dumps({"source": "doc-extracted flask.py + fastapi.py", "checks": n, "failures": fail}))
sys.exit(1 if fail else 0)
