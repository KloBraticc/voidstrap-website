---
title: Get the source
description: Clone Voidstrap and install the SDK every desktop build needs.
---

## Clone

```bash
git clone --recurse-submodules https://github.com/KloBraticc/Voidstrap.git
cd Voidstrap
```

Already cloned without submodules? Run:

```bash
git submodule update --init --recursive
```

:::tip
On Windows, use a short path such as `C:\src\Voidstrap` to avoid path length errors.
:::

## Install .NET

Desktop builds need the [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0), version **10.0.403 or a newer stable 10.0 release**, as pinned in `global.json`. The runtime alone cannot build the app.

```bash
dotnet --version
```

The first build downloads NuGet packages and takes a while. Run commands from the repository root unless a page says otherwise.

## What can build what

| App | Build hosts | Targets |
| --- | --- | --- |
| [Windows](/build/windows/) | Windows | x64 |
| [Linux](/build/linux/) | Linux or Windows. macOS can cross publish the executable. | x64 and ARM64, glibc or musl |
| [macOS](/build/macos/) | macOS, Windows or Linux. Windows disk images use WSL 2. | Intel and Apple silicon |
| [Android](/build/android/) | Windows, Linux or macOS with the NDK host tools | ARM64, ARMv7 and x64 in each APK |
