---
title: Checks and code style
description: Commands to run before a pull request, and the code rules.
---

Run the checks for what you changed. A build passing on one system does not prove a feature works on the others.

## Desktop

Windows:

```powershell
dotnet build Voidstrap.sln -c Debug -warnaserror
```

Linux or macOS:

```bash
dotnet build src/Voidstrap.Cross/Voidstrap.Cross.csproj -c Debug -warnaserror
```

## Android

From `android` (use `.\gradlew.bat` on Windows):

```bash
./gradlew assemble lintPlayRelease lintDirectRelease
```

## Native archive or RiShade

On Windows, with the MSVC target:

```powershell
cargo test --manifest-path native/voidpkg/Cargo.toml --locked --target x86_64-pc-windows-msvc --target-dir "$env:TEMP\VoidstrapTests\voidpkg"
cargo test --manifest-path native/rishade/Cargo.toml --workspace --locked --target x86_64-pc-windows-msvc --target-dir "$env:TEMP\VoidstrapTests\rishade"
```

On Linux, omit `--target` and keep `--target-dir` outside the checkout.

## Code style

- Match the surrounding code, and add no code comments.
- Keep the build at zero warnings. Fix them rather than suppressing them.
- Put visible text in `Strings.resx`, and avoid dashes in UI text and log messages.
- Use named event handlers, and unsubscribe them on cleanup. Stop and dispose timers the same way.
- Reuse one static `HttpClient`, pass a `CancellationToken` to background loops, and use `await Task.Delay` over `Thread.Sleep`.
- Use `[LibraryImport]`, not `[DllImport]`.
- A new desktop feature must work on Linux, or be hidden there with the platform visibility helpers.
- Keep secrets, build output and personal configuration out of commits.
