---
title: Build for macOS
description: Package Voidstrap for Intel and Apple silicon.
---

## Requirements

The [.NET SDK](/build/setup/#install-net), [PowerShell 7](https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell) and Bash. On a Mac, also install [Rust](https://rustup.rs) and the Xcode Command Line Tools:

```bash
xcode-select --install
```

## Build on a Mac

```bash
pwsh -NoProfile -File ./publish-all.ps1 -Only osx-arm64,osx-x64 -NoPause
```

This creates a `.dmg` and `.zip` per architecture in `PublishedBuilds/macOS`. `Voidstrap-osx-arm64` is Apple silicon and `Voidstrap-osx-x64` is Intel. Each contains `Voidstrap.app` with .NET included.

## Signing

Local packages use ad hoc signing without notarization.

| Variable | Effect |
| --- | --- |
| `MACOS_SIGN_IDENTITY` | Sign with your Developer ID |
| `MACOS_NOTARY_PROFILE` | Also notarize, using this notarytool keychain profile |

## From Windows or Linux

Install `genisoimage` (inside WSL 2 on Windows), then run the same command. It produces a `.dmg` and `.tar.gz` per architecture.

These `.dmg` files are uncompressed ISO 9660 images; native Mac builds create compressed UDIF images. Git Bash alone can only create the `.tar.gz` bundles.
