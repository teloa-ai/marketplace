# R2：从 references 的 Markdown 代码块机械提取被测片段，避免手抄与文档漂移。
# 用法：python3 -B extract.py（在本目录运行）；随后 node run.mjs、python3 -B run.py、(cd go && go run .)、tsc 类型检查见 README。
import os, re, sys

here = os.path.dirname(os.path.abspath(__file__))
refs = os.path.join(here, "..", "..", "..", "..", "..", "artifacts", "skills", "openai.security-best-practices", "1.0.0", "references")


def block(md, marker, lang):
    """返回 md 中含 marker 的第一个 ```lang 代码块（去掉 2 空格列表缩进）。"""
    text = open(os.path.join(refs, md), encoding="utf-8").read()
    for m in re.finditer(r"^  ```" + lang + r"\n(.*?)^  ```\n", text, re.S | re.M):
        if marker in m.group(1):
            return "".join(l[2:] if l.startswith("  ") else l.lstrip(" ") for l in m.group(1).splitlines(True))
    sys.exit(f"marker not found: {md} {marker}")


def until(src, last_line):
    """截到（含）第一处 last_line 为止。"""
    i = src.index(last_line) + len(last_line)
    return src[:i] + "\n"


def write(name, content):
    with open(os.path.join(here, name), "w", encoding="utf-8") as f:
        f.write(content)


react = block("javascript-typescript-react-web-frontend-security.md", "function safeReturnTo(value: unknown, fallback", "ts")
write("react.ts", react + "export { safeReturnTo, sameOriginPath };\n")

nxt = block("javascript-typescript-nextjs-web-server-security.md", 'from "next/server"', "ts")
write("nextjs-full.ts", nxt)  # 整块（含 import 与 GET 处理器），仅用于 tsc --strict 类型检查
fn_start = nxt.index("function safeReturnTo(")
fn = until(nxt[fn_start:], "\n  return url.href;\n}")
write("nextjs.ts", fn + "\nexport { safeReturnTo };\n")  # 运行时只取函数体

flask = until(block("python-flask-web-server-security.md", "def safe_return_to", "python"), "    return joined.geturl()")
fastapi = until(block("python-fastapi-web-server-security.md", "def safe_return_to", "python"), "    return joined.geturl()")
write("flask.py", flask)
write("fastapi.py", fastapi)

go = block("golang-general-backend-security.md", "func safeReturnTo(raw", "go")
write("go_doc.go.txt", go)
main_path = os.path.join(here, "go", "main.go")
main = open(main_path, encoding="utf-8").read()
a = main.index("func safeReturnTo(")
b = main.index("type vectors struct")
with open(main_path, "w", encoding="utf-8") as f:
    f.write(main[:a] + go + "\n" + main[b:])

print({"react.ts": len(react), "nextjs-full.ts": len(nxt), "nextjs.ts": len(fn), "flask==fastapi": flask == fastapi, "go": len(go)})
