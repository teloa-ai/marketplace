// 实跑 Go 参考中的 safeReturnTo()：所有攻击向量必须回退；放行值必须是同源路径引用且清洗后不以 // 开头。
package main

import (
	"encoding/json"
	"fmt"
	"net/url"
	"os"
	"path"
	"regexp"
	"strings"
)

// === 与 references 中片段逐字一致 ===
func safeReturnTo(raw, fallback string) string {
	if raw == "" || len(raw) > 2048 || raw[0] != '/' || (len(raw) > 1 && (raw[1] == '/' || raw[1] == '\\')) {
		return fallback
	}
	// 1. Raw-string policy: no control/whitespace chars, no backslash, no percent-encoded . / \ % (any case), no . or .. segments.
	for _, r := range raw {
		if r <= 0x20 || r == 0x7f || r == '\\' {
			return fallback
		}
	}
	if encodedSpecial.MatchString(raw) {
		return fallback
	}
	pathPart := raw
	if i := strings.IndexAny(pathPart, "?#"); i >= 0 {
		pathPart = pathPart[:i]
	}
	for _, seg := range strings.Split(pathPart, "/") {
		if seg == "." || seg == ".." {
			return fallback
		}
	}
	// 2. Parse: a same-origin path reference has no scheme, opaque part, host or userinfo.
	u, err := url.Parse(raw)
	if err != nil || u.Scheme != "" || u.Opaque != "" || u.Host != "" || u.User != nil {
		return fallback
	}
	// 3. Re-check the cleaned path and rebuild the reference from parsed parts (never echo the raw input).
	// Note: path.Clean also drops a trailing slash ("/a/b/" -> "/a/b"); re-append it after the checks if your routes distinguish the two.
	p := path.Clean(u.Path)
	if !strings.HasPrefix(p, "/") || strings.HasPrefix(p, "//") {
		return fallback
	}
	return (&url.URL{Path: p, RawQuery: u.RawQuery, Fragment: u.Fragment}).String()
}

var encodedSpecial = regexp.MustCompile(`(?i)%(2e|2f|5c|25)`)

type vectors struct {
	Base   string   `json:"base"`
	Attack []string `json:"attack"`
	Benign []string `json:"benign"`
}

func navOrigin(base, s string) string {
	b, _ := url.Parse(base)
	r, err := b.Parse(s)
	if err != nil {
		return "PARSE-ERROR"
	}
	return r.Scheme + "://" + r.Host
}

func main() {
	data, err := os.ReadFile("../vectors.json")
	if err != nil {
		panic(err)
	}
	var v vectors
	if err := json.Unmarshal(data, &v); err != nil {
		panic(err)
	}
	fail := 0
	for _, a := range v.Attack {
		out := safeReturnTo(a, "/")
		ok := out == "/"
		if !ok {
			fail++
		}
		j, _ := json.Marshal(map[string]any{"kind": "attack", "input": a, "output": out, "pass": ok})
		fmt.Println(string(j))
	}
	for _, b := range v.Benign {
		out := safeReturnTo(b, "/")
		ok := (b == "/" || out != "/") && navOrigin(v.Base, out) == v.Base && !strings.HasPrefix(out, "//") && !strings.HasPrefix(out, `/\`)
		if !ok {
			fail++
		}
		j, _ := json.Marshal(map[string]any{"kind": "benign", "input": b, "output": out, "navOrigin": navOrigin(v.Base, out), "pass": ok})
		fmt.Println(string(j))
	}
	j, _ := json.Marshal(map[string]any{"total": len(v.Attack) + len(v.Benign), "failures": fail})
	fmt.Println(string(j))
	if fail > 0 {
		os.Exit(1)
	}
}
