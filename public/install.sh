#!/bin/sh
set -eu

REPO="KloBraticc/Voidstrap"
API="https://api.github.com/repos/$REPO/releases/latest"
APP_ID="io.github.KloBraticc.Voidstrap"

say() { printf '\033[36m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[33mwarning:\033[0m %s\n' "$*" >&2; }
die() { printf '\033[31merror:\033[0m %s\n' "$*" >&2; exit 1; }
has() { command -v "$1" >/dev/null 2>&1; }

usage() {
    echo "Usage: curl -fsSL https://voidstrapp.pages.dev/install.sh | sh -s -- [PACKAGE] [--no-launch]"
    echo "Packages: auto (default), macos, appimage, flatpak, deb, rpm, aur, portable, portable-musl"
}

fetch() {
    if has curl; then
        curl -fL --proto '=https' --tlsv1.2 --retry 3 --connect-timeout 20 -sS -o "$2" "$1"
    elif has wget; then
        wget -q --https-only --tries=3 -O "$2" "$1"
    else
        die "curl or wget is required."
    fi
}

sha256() {
    if has sha256sum; then sha256sum "$1" | cut -d' ' -f1
    elif has shasum; then shasum -a 256 "$1" | cut -d' ' -f1
    elif has openssl; then openssl dgst -sha256 "$1" | sed 's/.*= *//'
    else die "sha256sum, shasum or openssl is required to verify the download."
    fi
}

as_root() {
    if [ "$(id -u)" -eq 0 ]; then "$@"
    elif has sudo; then sudo "$@"
    elif has doas; then doas "$@"
    else die "This package needs root. Install sudo or run as root."
    fi
}

is_musl() {
    ldd --version 2>&1 | grep -qi musl && return 0
    for f in /lib/ld-musl-*.so.1; do [ -e "$f" ] && return 0; done
    return 1
}

pick_auto() {
    if is_musl; then echo portable-musl
    elif has pacman; then
        if has makepkg && has fakeroot; then echo aur; else echo portable; fi
    elif has apt-get && has dpkg; then echo deb
    elif has dnf || has zypper || has yum; then echo rpm
    elif has flatpak; then echo flatpak
    else echo portable
    fi
}

release_tag() { tr -d ' \t\r\n' <"$1" | grep -o '"tag_name":"[^"]*"' | head -n1 | cut -d'"' -f4; }

asset_digest() {
    tr -d ' \t\r\n' <"$1" | tr ',{}' '\n\n\n' |
        awk -v want="\"name\":\"$2\"" '$0 == want { found = 1 } found && /^"digest":"sha256:/ { sub(/^"digest":"sha256:/, ""); sub(/"$/, ""); print; exit }'
}

desktop_entry() {
    cat <<EOF
[Desktop Entry]
Type=Application
Name=Voidstrap
GenericName=Roblox Bootstrapper
Comment=Customize and launch Roblox through Sober on Linux
Exec="$1" %u
Icon=$2
Terminal=false
Categories=Game;
Keywords=roblox;voidstrap;bootstrapper;sober;
StartupNotify=true
StartupWMClass=voidstrap
MimeType=x-scheme-handler/roblox;x-scheme-handler/roblox-player;x-scheme-handler/roblox-studio;x-scheme-handler/roblox-studio-auth;x-scheme-handler/voidstrap;
Actions=LaunchRoblox;LaunchRobloxStudio;Settings;

[Desktop Action LaunchRoblox]
Name=Launch Roblox
Exec="$1" -player

[Desktop Action LaunchRobloxStudio]
Name=Launch Roblox Studio
Exec="$1" -studio

[Desktop Action Settings]
Name=Voidstrap Settings
Exec="$1" -settings
EOF
}

link_user_install() {
    mkdir -p "$BIN_DIR" "$DATA_DIR/applications"
    ln -sf "$1" "$BIN_DIR/voidstrap"
    desktop_entry "$1" "$2" >"$DATA_DIR/applications/$APP_ID.desktop"
    has update-desktop-database && update-desktop-database "$DATA_DIR/applications" >/dev/null 2>&1 || true
    case ":$PATH:" in
        *":$BIN_DIR:"*) ;;
        *) warn "$BIN_DIR is not on your PATH. Add it to run 'voidstrap' from a terminal." ;;
    esac
    LAUNCH="$1"
}

install_portable() {
    say "Installing to $INSTALL_DIR"
    mkdir -p "$TMP/extract"
    tar -xzf "$1" -C "$TMP/extract"
    [ -x "$TMP/extract/Voidstrap/Voidstrap" ] || die "The archive does not contain the Voidstrap binary."
    mkdir -p "$INSTALL_DIR"
    rm -rf "$INSTALL_DIR/app" "$INSTALL_DIR/Voidstrap.AppImage"
    mv "$TMP/extract/Voidstrap" "$INSTALL_DIR/app"
    icon_src="$INSTALL_DIR/app/share/icons/hicolor/256x256/apps/$APP_ID.png"
    icon="$APP_ID"
    if [ -f "$icon_src" ]; then
        mkdir -p "$DATA_DIR/icons/hicolor/256x256/apps"
        cp -f "$icon_src" "$DATA_DIR/icons/hicolor/256x256/apps/"
    fi
    link_user_install "$INSTALL_DIR/app/Voidstrap" "$icon"
}

install_appimage() {
    if ! { ldconfig -p 2>/dev/null | grep -q 'libfuse\.so\.2'; } && [ ! -e /usr/lib/libfuse.so.2 ] && [ ! -e /usr/lib64/libfuse.so.2 ]; then
        warn "libfuse2 was not found. AppImages need it to start. Install libfuse2 or use the 'portable' package."
    fi
    say "Installing to $INSTALL_DIR"
    mkdir -p "$INSTALL_DIR"
    rm -rf "$INSTALL_DIR/app"
    mv -f "$1" "$INSTALL_DIR/Voidstrap.AppImage"
    chmod 755 "$INSTALL_DIR/Voidstrap.AppImage"
    link_user_install "$INSTALL_DIR/Voidstrap.AppImage" "$APP_ID"
}

install_flatpak() {
    has flatpak || die "Flatpak is not installed. See https://flatpak.org/setup/ or pick another package."
    say "Adding Flathub for the runtime"
    flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
    say "Installing the Flatpak bundle"
    flatpak install --user -y --noninteractive --bundle "$1"
    LAUNCH=flatpak
}

install_deb() {
    has apt-get || die "apt-get was not found. The DEB package is for Debian, Ubuntu, Mint and Pop!_OS."
    say "Installing the DEB package (you may be asked for your password)"
    chmod 755 "$TMP"
    chmod 644 "$1"
    as_root env DEBIAN_FRONTEND=noninteractive apt-get install -y "$1"
    LAUNCH="voidstrap"
}

install_rpm() {
    say "Installing the RPM package (you may be asked for your password)"
    if has dnf; then as_root dnf install -y "$1"
    elif has zypper; then as_root zypper --non-interactive install --allow-unsigned-rpm "$1"
    elif has yum; then as_root yum install -y "$1"
    else die "dnf, zypper or yum was not found. The RPM package is for Fedora and openSUSE."
    fi
    LAUNCH="voidstrap"
}

install_aur() {
    has pacman || die "pacman was not found. The AUR package is for Arch Linux and derivatives."
    has makepkg && has fakeroot || die "makepkg needs base-devel. Run: sudo pacman -S --needed base-devel"
    [ "$(id -u)" -ne 0 ] || die "makepkg cannot run as root. Run this as your normal user."
    mkdir -p "$TMP/aur"
    tar -xzf "$1" -C "$TMP/aur"
    [ -f "$TMP/aur/PKGBUILD" ] || die "The AUR metadata does not contain a PKGBUILD."
    say "Building and installing voidstrap-bin (you may be asked for your password)"
    (cd "$TMP/aur" && makepkg -si --noconfirm --needed)
    LAUNCH="voidstrap"
}

install_macos() {
    APPS_DIR="$HOME/Applications"
    say "Installing to $APPS_DIR"
    mkdir -p "$TMP/extract" "$APPS_DIR"
    tar -xzf "$1" -C "$TMP/extract"
    [ -x "$TMP/extract/Voidstrap.app/Contents/MacOS/Voidstrap" ] || die "The archive does not contain Voidstrap.app."
    if pgrep -x Voidstrap >/dev/null 2>&1; then
        say "Closing the running Voidstrap instance"
        pkill -x Voidstrap || true
        sleep 2
    fi
    rm -rf "$APPS_DIR/Voidstrap.app"
    mv "$TMP/extract/Voidstrap.app" "$APPS_DIR/Voidstrap.app"
    has xattr && xattr -dr com.apple.quarantine "$APPS_DIR/Voidstrap.app" 2>/dev/null || true
    LAUNCH="$APPS_DIR/Voidstrap.app"
}

main() {
    PACKAGE=auto
    NO_LAUNCH=0
    for arg in "$@"; do
        case "$arg" in
            --no-launch) NO_LAUNCH=1 ;;
            -h | --help) usage; exit 0 ;;
            auto | macos | appimage | flatpak | deb | rpm | aur | portable | portable-musl) PACKAGE=$arg ;;
            *) usage >&2; die "Unknown option: $arg" ;;
        esac
    done

    case "$(uname -s)" in
        Darwin)
            case "$PACKAGE" in auto | macos) PACKAGE=macos ;; *) die "The $PACKAGE package is for Linux. On macOS run the command without a package name." ;; esac ;;
        Linux)
            [ "$PACKAGE" != macos ] || die "The macos package is for macOS. Pick a Linux package or run the command without a package name." ;;
        *) die "This installer is for macOS and Linux. On Windows run: irm https://voidstrapp.pages.dev/quick-install | iex" ;;
    esac

    MACHINE=$(uname -m)
    [ "$PACKAGE" = macos ] && [ "$(sysctl -n sysctl.proc_translated 2>/dev/null || echo 0)" = 1 ] && MACHINE=arm64

    case "$MACHINE" in
        x86_64 | amd64) ARCH_GNU=x86_64 ARCH_DEB=amd64 ARCH_TAR=x64 ;;
        aarch64 | arm64) ARCH_GNU=aarch64 ARCH_DEB=arm64 ARCH_TAR=arm64 ;;
        *) die "Unsupported processor: $MACHINE. Voidstrap is built for x86_64 and ARM64." ;;
    esac

    [ "$PACKAGE" = auto ] && PACKAGE=$(pick_auto) && say "Detected package: $PACKAGE"

    DATA_DIR=${XDG_DATA_HOME:-$HOME/.local/share}
    BIN_DIR="$HOME/.local/bin"
    INSTALL_DIR="$DATA_DIR/voidstrap"
    [ "$(id -u)" -ne 0 ] || case "$PACKAGE" in appimage | portable | portable-musl) warn "Installing as root puts Voidstrap in root's home folder. Run as your normal user instead." ;; esac

    TMP=$(mktemp -d)
    trap 'rm -rf "$TMP"' EXIT
    trap 'exit 130' INT TERM

    say "Checking the latest Voidstrap release"
    fetch "$API" "$TMP/release.json" || die "Could not reach GitHub. Check your connection and try again."
    TAG=$(release_tag "$TMP/release.json")
    printf '%s' "$TAG" | grep -Eq '^v?[0-9A-Za-z][0-9A-Za-z._-]{0,63}$' || die "The latest release has an unexpected name."
    VERSION=${TAG#v}

    case "$PACKAGE" in
        macos) ASSET="Voidstrap-osx-${ARCH_TAR}.tar.gz" ;;
        appimage) ASSET="Voidstrap_${VERSION}_${ARCH_GNU}.AppImage" ;;
        flatpak) ASSET="Voidstrap_${VERSION}_${ARCH_GNU}.flatpak" ;;
        deb) ASSET="Voidstrap_${VERSION}_${ARCH_DEB}.deb" ;;
        rpm) ASSET="Voidstrap_${VERSION}_${ARCH_GNU}.rpm" ;;
        portable) ASSET="Voidstrap_${VERSION}_linux-${ARCH_TAR}.tar.gz" ;;
        portable-musl) ASSET="Voidstrap_${VERSION}_linux-musl-${ARCH_TAR}.tar.gz" ;;
        aur) ASSET="Voidstrap_AUR_metadata.tar.gz" ;;
    esac

    EXPECTED=$(asset_digest "$TMP/release.json" "$ASSET")
    echo "$EXPECTED" | grep -Eq '^[0-9a-f]{64}$' || die "$TAG has no verifiable $ASSET. See https://github.com/KloBraticc/Voidstrap/releases/latest for manual downloads."

    FILE="$TMP/$ASSET"
    say "Downloading $ASSET ($TAG)"
    fetch "https://github.com/$REPO/releases/download/$TAG/$ASSET" "$FILE" || die "The download failed. Try again in a moment."
    [ "$(sha256 "$FILE")" = "$EXPECTED" ] || die "The download checksum does not match the published release."
    say "Checksum verified"

    LAUNCH=""
    case "$PACKAGE" in
        macos) install_macos "$FILE" ;;
        appimage) install_appimage "$FILE" ;;
        flatpak) install_flatpak "$FILE" ;;
        deb) install_deb "$FILE" ;;
        rpm) install_rpm "$FILE" ;;
        aur) install_aur "$FILE" ;;
        portable | portable-musl) install_portable "$FILE" ;;
    esac

    printf '\033[32mVoidstrap %s installed successfully.\033[0m\n' "$VERSION"

    if [ "$NO_LAUNCH" -eq 0 ] && [ "$PACKAGE" = macos ]; then
        say "Starting Voidstrap"
        open "$LAUNCH" || warn "Could not start Voidstrap. Open it from your Applications folder."
    elif [ "$NO_LAUNCH" -eq 0 ] && [ -n "$LAUNCH" ] && { [ -n "${DISPLAY:-}" ] || [ -n "${WAYLAND_DISPLAY:-}" ]; }; then
        say "Starting Voidstrap"
        if [ "$LAUNCH" = flatpak ]; then
            nohup flatpak run "$APP_ID" >/dev/null 2>&1 &
        else
            nohup "$LAUNCH" >/dev/null 2>&1 &
        fi
    fi
}

main "$@"
