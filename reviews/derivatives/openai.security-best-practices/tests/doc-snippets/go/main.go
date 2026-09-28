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

func main() {
	data, err := os.ReadFile("../../vectors.json")
	if err != nil {
		panic(err)
	}
	var v vectors
	if err := json.Unmarshal(data, &v); err != nil {
		panic(err)
	}
	b, _ := url.Parse(v.Base)
	fail, n := 0, 0
	for _, a := range v.Attack {
		n++
		if safeReturnTo(a, "/") != "/" {
			fail++
			fmt.Println("FAIL attack", a)
		}
	}
	for _, g := range v.Benign {
		n++
		out := safeReturnTo(g, "/")
		r, err := b.Parse(out)
		if err != nil || r.Scheme+"://"+r.Host != v.Base || strings.HasPrefix(out, "//") || (g != "/" && out == "/") {
			fail++
			fmt.Println("FAIL benign", g, out)
		}
	}
	j, _ := json.Marshal(map[string]any{"source": "doc-extracted go snippet", "checks": n, "failures": fail})
	fmt.Println(string(j))
	if fail > 0 {
		os.Exit(1)
	}
}
