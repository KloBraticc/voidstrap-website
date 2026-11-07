---
title: Project layout
description: Where the code lives in the Voidstrap repository.
---

| Path | Contents |
| --- | --- |
| `src/Voidstrap.App` | The shared desktop application |
| `src/Voidstrap.Cross` | Compiles the shared app for Linux and macOS |
| `src/Voidstrap.Core` | Core library |
| `src/Voidstrap.Platform.*` | Platform abstractions and per platform code |
| `src/Voidstrap.Desktop.*` | Desktop hosts per platform |
| `src/ClientServer` | Client server solution, built on its own |
| `src/StudioPlugin` | Roblox Studio plugin |
| `src/VirtualDisplay` | Virtual display helper |
| `native` | Rust and native libraries such as `voidimage`, `voidpkg`, `framepacer` and `rishade` |
| `android` | The Android app |
| `external` | Submodules and bundled dependencies |
| `build/Packaging` | Linux, Flatpak, Arch and macOS packaging scripts |
| `nix` | Nix package support |

User facing text belongs in `src/Voidstrap.App/Resources/Strings.resx`, with translations in the `Strings.<language>.resx` files beside it.

## Sending a change

1. Fork the repository and branch from `main`.
2. Keep the pull request to one fix or feature.
3. Run the [relevant checks](/contributing/checks/).
4. Open it against `main`, and say what changed, why, and how you tested it. Add screenshots for UI changes.

The full policy is in [CONTRIBUTING.md](https://github.com/KloBraticc/Voidstrap/blob/main/CONTRIBUTING.md).
