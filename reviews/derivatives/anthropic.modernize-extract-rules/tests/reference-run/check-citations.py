"""Prints the cited lines of every RULE card so each citation can be checked, and fails if a masked credential leaked."""
import re, sys, pathlib
root = pathlib.Path(sys.argv[1]); rules = pathlib.Path(sys.argv[2]).read_text()
assert 'Pr0dSecret2019' not in rules, 'credential value leaked'
for rid, name, src in re.findall(r'### (RULE-\d+): (.*)\n(?:.*\n){2}\*\*Source:\*\* `([^`]+)`', rules):
    path, rng = src.split(':'); a, _, b = rng.partition('-'); a, b = int(a), int(b or a)
    lines = (root / path).read_text().split('\n')
    assert 1 <= a <= b <= len(lines), (rid, src)
    print(f'{rid} {name} [{src}]'); print('\n'.join(f'   {i}: {lines[i-1]}' for i in range(a, b + 1)))
print('citations in range; no credential value')
