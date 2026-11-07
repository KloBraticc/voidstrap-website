export const links = {
  github: "https://github.com/KloBraticc/Voidstrap",
  releases: "https://github.com/KloBraticc/Voidstrap/releases/latest",
  contributors: "https://github.com/KloBraticc/Voidstrap/graphs/contributors",
  discord: "https://discord.gg/5tJBqBH8ck",
  wiki: "https://wiki.voidstrapp.pages.dev"
};

const sh = "curl -fsSL https://voidstrapp.pages.dev/install.sh | sh";

export const packages = [
  { id: "windows", label: "Windows", cmd: "irm https://voidstrapp.pages.dev/quick-install | iex", note: "Run in PowerShell. Windows 10 and above." },
  { id: "macos", label: "MacOS", cmd: `${sh} -s -- macos`, note: "Run in Terminal. Detects Apple silicon or Intel, verifies the latest build and installs it to your Applications folder. macOS support is in testing." },
  { id: "auto", label: "Linux (auto)", cmd: sh, note: "The installer detects your distro and CPU, then verifies the latest package." },
  { id: "deb", label: "DEB", cmd: `${sh} -s -- deb`, note: "Debian, Ubuntu, Linux Mint and Pop!_OS." },
  { id: "rpm", label: "RPM", cmd: `${sh} -s -- rpm`, note: "Fedora and openSUSE." },
  { id: "aur", label: "Arch", cmd: `${sh} -s -- aur`, note: "Arch, Manjaro and EndeavourOS. Needs base-devel." },
  { id: "flatpak", label: "Flatpak", cmd: `${sh} -s -- flatpak`, note: "Any distro with Flatpak. Installs for your user only." },
  { id: "appimage", label: "AppImage", cmd: `${sh} -s -- appimage`, note: "Most distros. Needs libfuse2." },
  { id: "portable", label: "Portable", cmd: `${sh} -s -- portable`, note: "Any glibc distro. No root needed." },
  { id: "portable-musl", label: "musl", cmd: `${sh} -s -- portable-musl`, note: "Alpine and other musl distros. No root needed." }
];

export const platforms = ["windows", "apple", "linux", "android"];
