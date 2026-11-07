---
title: Build on Windows
description: Build and publish the Windows desktop app.
---

## Requirements

- Windows 10 or 11, 64 bit
- The [.NET SDK](/build/setup/#install-net)
- [Rust](https://rustup.rs) with the MSVC toolchain, which builds the native libraries
- Visual Studio C++ build tools with CMake, and the Windows SDK
- Initialized submodules

## Build

```powershell
dotnet build Voidstrap.sln -c Release
```

Output: `src\Voidstrap.App\bin\Release\net10.0-windows\win-x64\Voidstrap.exe`

## Publish a single exe

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\publish-all.ps1 -Only windows -NoPause
```

Output: `PublishedBuilds\Windows\Voidstrap.exe`. Running it requires the [.NET 10 Desktop Runtime](https://dotnet.microsoft.com/download/dotnet/10.0).

## Sign with SignPath (optional)

Running `publish-all.ps1` with no arguments builds every release target and signs `Voidstrap.exe` through the GitHub Actions build. It needs:

1. A `SIGNPATH_API_TOKEN` repository Actions secret
2. [GitHub CLI](https://cli.github.com/), signed in with `gh auth login`
3. A clean checkout of the latest `main` commit

Without SignPath, use `-Only windows` as shown above.
