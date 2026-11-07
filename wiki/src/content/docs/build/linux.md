---
title: Build on Linux
description: Publish the Linux executable, release packages, or a Nix build.
---

Most people only need **Requirements** and **Publish**. The rest is for other targets and release packages.

## Requirements

The [.NET SDK](/build/setup/#install-net), Bash, a C compiler, and [Rust](https://rustup.rs). On Ubuntu or Debian:

```bash
sudo apt-get update
sudo apt-get install build-essential python3-venv
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Rust builds `libvoidimage.so`, which Voidstrap needs to show any picture. The build stops with an error if it cannot build it.

## Publish

```bash
dotnet publish src/Voidstrap.Cross/Voidstrap.Cross.csproj \
  -c Release -r linux-x64 --self-contained true \
  -o PublishedBuilds/Linux-x64 \
  -p:EnableWindowsTargeting=true \
  -p:DebugType=none -p:DebugSymbols=false
```

Output: `PublishedBuilds/Linux-x64/Voidstrap`. Keep the published files together. .NET is included, but compatible graphics and system libraries must be installed.

:::note
Build only this project on Linux or macOS. The full solution requires Windows.
:::

## Other targets

Change `linux-x64` and the output folder to `linux-arm64`, `linux-musl-x64` or `linux-musl-arm64`.

Cross compiling needs a C compiler for the target: `gcc-aarch64-linux-gnu` for ARM64 or `gcc-x86-64-linux-gnu` for x64 on Ubuntu or Debian. Set `VOIDSTRAP_EDITOR_COMPILER` to use another one.

Musl targets, cross compiling and older glibc versions use `cargo-zigbuild`. The build installs it into `~/.cache/voidstrap/zigbuild` when Python 3 with `venv` is available.

## Release packages

To make `.tar.gz`, `.deb`, `.rpm`, `.AppImage` and `.flatpak` files, install [PowerShell 7](https://learn.microsoft.com/en-us/powershell/scripting/install/linux-overview) and the packaging tools:

```bash
sudo apt-get install build-essential curl ca-certificates binutils dpkg rpm flatpak flatpak-builder
```

```bash
pwsh -NoProfile -File ./publish-all.ps1 -Only linux-x64 -LinuxPackages -NoPause
```

Output: `PublishedBuilds/Linux`. The first run downloads the AppImage tools, supporting libraries, and the Flatpak runtime and SDK. Musl targets only produce a `.tar.gz`.

## From Windows

Install WSL with the packaging tools and Rust inside it, and .NET on Windows. The build uses the distribution named `Ubuntu`; add `-p:VoidstrapWslDistro=<name>` for another.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\publish-all.ps1 -Only linux-x64 -LinuxPackages -NoPause
```

Without WSL, omit `-LinuxPackages` to allow a plain executable. Git Bash alone cannot create the full glibc package set.

## Nix

With [Nix](https://nixos.org/download) and flakes enabled:

```bash
nix build .#voidstrap-git
```

This builds your checkout, while `.#voidstrap` builds the latest release. Output: `result/bin/voidstrap`. Run `nix develop` for a shell with every build dependency.

After changing package references, update the lock in `nix/deps.json`:

```bash
nix build .#voidstrap.fetch-deps && ./result nix/deps.json
```
