// R2 m4：path.Clean 会去掉结尾斜杠。
package main

import (
	"fmt"
	"path"
)

func main() {
	for _, p := range []string{"/a/b/", "/a/b", "/"} {
		fmt.Printf("path.Clean(%q) = %q\n", p, path.Clean(p))
	}
}
