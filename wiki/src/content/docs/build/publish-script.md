---
title: Release script
description: What publish-all.ps1 builds and the options you will use most.
---

`publish-all.ps1` builds release outputs into `PublishedBuilds`. Linux and macOS need PowerShell 7; Windows supports Windows PowerShell and PowerShell 7.

## Choosing targets

Pass one or more values to `-Only`, separated by commas:

`windows`, `linux-x64`, `linux-arm64`, `linux-musl-x64`, `linux-musl-arm64`, `osx-x64`, `osx-arm64`, `android`, `nix`, `all`

The default is `all`.

## Common options

| Option | Effect |
| --- | --- |
| `-Configuration Debug` | Build Debug instead of Release |
| `-NoPause` | Do not wait for Enter when finished |
| `-LinuxPackages` | Require the full Linux package set, and fail if tools are missing |
| `-AppImage` | Build only an AppImage for the Linux target |
| `-SkipAppImage` | Build the other Linux packages without AppImage |

Without `-LinuxPackages`, the script may fall back to a plain executable. Check the notes it prints at the end.

## Output

| Target | Folder |
| --- | --- |
| Windows | `PublishedBuilds/Windows` |
| Linux | `PublishedBuilds/Linux` |
| macOS | `PublishedBuilds/macOS` |
| Android | `PublishedBuilds/Android` |

The version comes from `VoidstrapVersion` in `Directory.Build.props`.
