---
title: Gentoo and NixOS
description: Install Voidstrap with the Gentoo overlay or the Nix flake.
---

## Gentoo

Voidstrap is in the [Voidstrap overlay](https://github.com/Pedrodroks34/voidstrap-overlay), maintained by Pedrodroks34. Run these as root.

1. Add the overlay:

   ```bash
   emerge --ask app-eselect/eselect-repository dev-vcs/git
   eselect repository add Voidstrap-Overlay git https://github.com/Pedrodroks34/voidstrap-overlay.git
   emaint sync --repo Voidstrap-Overlay
   ```

2. Allow Voidstrap and its .NET SDK. If `package.accept_keywords` is a file on your system, add both lines to it instead.

   ```bash
   mkdir -p /etc/portage/package.accept_keywords
   echo 'games-action/voidstrap ~amd64' > /etc/portage/package.accept_keywords/voidstrap
   echo 'dev-dotnet/dotnet-sdk-bin ~amd64' > /etc/portage/package.accept_keywords/dotnet-sdk-bin
   ```

3. Install:

   ```bash
   emerge --ask games-action/voidstrap
   ```

To update, run `emaint sync --repo Voidstrap-Overlay`, then step 3 again.

`games-action/voidstrap-9999` tracks the `main` branch for testing. Normal installs don't need it, and it may contain unreleased changes.

## NixOS and Nix

The flake supports `x86_64-linux` and `aarch64-linux`. It builds from source, so the first run takes a few minutes.

Try it once without installing:

```bash
nix run "git+https://github.com/KloBraticc/Voidstrap?submodules=1"
```

To install it on NixOS, add the flake and enable the module:

```nix
{
  inputs.voidstrap.url = "git+https://github.com/KloBraticc/Voidstrap?submodules=1";

  outputs = { nixpkgs, voidstrap, ... }: {
    nixosConfigurations.your-hostname = nixpkgs.lib.nixosSystem {
      modules = [
        voidstrap.nixosModules.default
        { programs.voidstrap.enable = true; }
      ];
    };
  };
}
```

To update, run `nix flake update voidstrap` and rebuild.

### Module options

| Option | What it does |
| --- | --- |
| `programs.voidstrap.enable` | Installs the command and launcher entry, and turns on graphics, Flatpak and `roblox://` links |
| `programs.voidstrap.openRobloxLinks` | Set to `false` to leave link handling alone |
| `programs.voidstrap.package` | Use another build, such as `voidstrap-git` |

### Good to know

- **Home Manager:** import `voidstrap.homeModules.default`. You still need `services.flatpak.enable = true` in your NixOS configuration.
- **Without the modules:** add `voidstrap.packages.${pkgs.stdenv.hostPlatform.system}.default` to your packages, and enable `hardware.graphics` and `services.flatpak` yourself.
- **Overlay:** `overlays.default` adds `pkgs.voidstrap`.
- **Use the `git+https` URL.** The `github:` scheme can't fetch submodules, so it fails with `input attribute 'submodules' not supported`.
