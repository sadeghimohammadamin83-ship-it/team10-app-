#!/bin/sh
# Builds dist/Amikat.exe — a single portable Windows app.
# Needs Go 1.21+ and go-winres (go install github.com/tc-hib/go-winres@latest).
set -e
cd "$(dirname "$0")"
rm -rf site && mkdir -p site dist
for item in index.html site.webmanifest css js img fonts models; do cp -R "../$item" site/; done
WINRES="$(go env GOPATH)/bin/go-winres"
"$WINRES" simply --arch amd64 --icon ../img/icon-512.png --manifest gui \
  --product-name "Amikat" --file-description "Amikat — Architecture & Data Center Portfolio" \
  --product-version 1.0.0 --file-version 1.0.0 --copyright "© 2026 MohammadAmin Sadeghi" --original-filename Amikat.exe
GOOS=windows GOARCH=amd64 go vet .
GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -trimpath -ldflags "-H windowsgui -s -w" -o dist/Amikat.exe .
rm -rf site
ls -la dist
