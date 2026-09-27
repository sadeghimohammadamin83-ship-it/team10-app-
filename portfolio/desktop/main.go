// Amikat — the portfolio as a portable Windows app.
//
// One .exe, nothing to install: the whole site is embedded and served on a
// fixed local address (so saved theme, language and sign-in survive restarts),
// shown in a WebView2 window. WebView2 ships with Windows 10 and 11.
//
// Build (from Linux or Windows):  ./build_exe.sh
package main

import (
	"embed"
	"io"
	"io/fs"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"strings"
	"syscall"
	"time"
	"unsafe"

	webview2 "github.com/jchv/go-webview2"
)

//go:embed site
var siteFiles embed.FS

const (
	title = "Amikat — Architecture & Data Center Portfolio"
	addr  = "127.0.0.1:47823" // fixed, so the page origin (and its storage) is the same every run
	start = "/"
)

var mimeTypes = map[string]string{
	".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
	".json": "application/json", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml",
	".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8",
}

func serve(ln net.Listener) {
	sub, _ := fs.Sub(siteFiles, "site")
	files := http.FileServer(http.FS(sub))
	// Content types are set explicitly: Windows' registry can map .js to text/plain.
	http.Serve(ln, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if t, ok := mimeTypes[strings.ToLower(path.Ext(r.URL.Path))]; ok {
			w.Header().Set("Content-Type", t)
		}
		w.Header().Set("Cache-Control", "no-cache")
		files.ServeHTTP(w, r)
	}))
}

// alreadyRunning reports whether another copy of this app already serves the site.
func alreadyRunning() bool {
	c := http.Client{Timeout: 2 * time.Second}
	res, err := c.Get("http://" + addr + start)
	if err != nil {
		return false
	}
	defer res.Body.Close()
	b, _ := io.ReadAll(io.LimitReader(res.Body, 4096))
	return strings.Contains(string(b), "Amikat")
}

func openExternal(raw string) {
	u, err := url.Parse(raw)
	if err != nil {
		return
	}
	switch strings.ToLower(u.Scheme) {
	case "http", "https", "mailto", "tel":
		exec.Command("rundll32", "url.dll,FileProtocolHandler", u.String()).Start()
	}
}

var (
	user32         = syscall.NewLazyDLL("user32.dll")
	kernel32       = syscall.NewLazyDLL("kernel32.dll")
	procMessageBox = user32.NewProc("MessageBoxW")
	procLoadImage  = user32.NewProc("LoadImageW")
	procSendMsg    = user32.NewProc("SendMessageW")
	procModule     = kernel32.NewProc("GetModuleHandleW")
)

func messageBox(text string) {
	t, _ := syscall.UTF16PtrFromString(text)
	c, _ := syscall.UTF16PtrFromString(title)
	procMessageBox.Call(0, uintptr(unsafe.Pointer(t)), uintptr(unsafe.Pointer(c)), 0x40)
}

// setWindowIcon applies the embedded app icon (icon group #1) at both window sizes.
func setWindowIcon(hwnd uintptr) {
	inst, _, _ := procModule.Call(0)
	const iconID, imageIcon, lrShared, wmSetIcon = 1, 1, 0x8000, 0x80
	for _, size := range []struct{ kind, px uintptr }{{0, 16}, {1, 32}} {
		h, _, _ := procLoadImage.Call(inst, iconID, imageIcon, size.px, size.px, lrShared)
		if h != 0 {
			procSendMsg.Call(hwnd, wmSetIcon, size.kind, h)
		}
	}
}

func main() {
	base := "http://" + addr
	if ln, err := net.Listen("tcp", addr); err == nil {
		go serve(ln)
	} else if !alreadyRunning() {
		// The fixed port is taken by something else: fall back to any free port.
		ln, err := net.Listen("tcp", "127.0.0.1:0")
		if err != nil {
			messageBox("Could not start: no local port is available.")
			return
		}
		base = "http://" + ln.Addr().String()
		go serve(ln)
	}

	data := filepath.Join(os.Getenv("LOCALAPPDATA"), "Amikat")
	w := webview2.NewWithOptions(webview2.WebViewOptions{
		AutoFocus: true,
		DataPath:  data,
		WindowOptions: webview2.WindowOptions{
			Title: title, Width: 1360, Height: 880, Center: true, IconId: 1,
		},
	})
	if w == nil {
		messageBox("This app needs Microsoft Edge WebView2, which is built into Windows 10 and 11.\n\n" +
			"It seems to be missing on this computer. Install it from:\nhttps://go.microsoft.com/fwlink/p/?LinkId=2124703\n\nthen open the app again.")
		openExternal("https://go.microsoft.com/fwlink/p/?LinkId=2124703")
		return
	}
	defer w.Destroy()
	setWindowIcon(uintptr(w.Window()))
	w.Bind("openExternal", openExternal)
	w.Navigate(base + start)
	w.Run()
}
