[CmdletBinding()]
param(
    [ValidateSet("auto", "exe", "macos", "appimage", "flatpak", "deb", "rpm", "aur", "portable", "portable-musl")]
    [string]$Package = "auto",
    [string]$InstallDir,
    [switch]$NoLaunch,
    [switch]$NoPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$releaseApi = "https://api.github.com/repos/KloBraticc/Voidstrap/releases/latest"
$exeName = "Voidstrap.exe"
$stagedPath = $null

function Write-Step {
    param([string]$Message)
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Invoke-VoidstrapDownload {
    param(
        [string]$Uri,
        [string]$OutFile
    )

    for ($attempt = 1; $attempt -le 3; $attempt++) {
        try {
            Invoke-WebRequest -Uri $Uri -OutFile $OutFile -UseBasicParsing -MaximumRedirection 10 -TimeoutSec 120
            return
        } catch {
            if ($attempt -eq 3) {
                throw
            }
            Write-Warning "Download failed. Retrying ($attempt/3)..."
            Start-Sleep -Seconds 2
        }
    }
}

function Test-VoidstrapDownload {
    param(
        [string]$Path,
        [string]$ExpectedHash
    )

    $file = Get-Item -LiteralPath $Path
    if ($file.Length -lt 65536) {
        throw "The downloaded file is too small to be Voidstrap."
    }

    $stream = [System.IO.File]::OpenRead($Path)
    try {
        if ($stream.ReadByte() -ne 0x4D -or $stream.ReadByte() -ne 0x5A) {
            throw "The downloaded file is not a valid Windows executable."
        }
    } finally {
        $stream.Dispose()
    }

    $actualHash = (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash
    if ($actualHash -ine $ExpectedHash) {
        throw "The download checksum does not match the published release."
    }
}

function Add-VoidstrapToPath {
    param([string]$Directory)

    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    $entries = @($userPath -split ";" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    $present = @($entries | Where-Object { $_.Trim().TrimEnd("\") -ieq $Directory.TrimEnd("\") }).Count -gt 0

    if (-not $present) {
        $newPath = if ([string]::IsNullOrWhiteSpace($userPath)) { $Directory } else { "$userPath;$Directory" }
        [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    }

    $currentEntries = @($env:Path -split ";")
    if (@($currentEntries | Where-Object { $_.Trim().TrimEnd("\") -ieq $Directory.TrimEnd("\") }).Count -eq 0) {
        $env:Path = "$Directory;$env:Path"
    }
}

function Invoke-UnixInstall {
    $script = Join-Path ([System.IO.Path]::GetTempPath()) ("voidstrap-install-" + [Guid]::NewGuid().ToString("N") + ".sh")
    try {
        Write-Step "Fetching the macOS and Linux installer..."
        Invoke-VoidstrapDownload -Uri "https://voidstrapp.pages.dev/install.sh" -OutFile $script
        $shArgs = @($script)
        if ($Package -ne "exe") { $shArgs += $Package }
        if ($NoLaunch.IsPresent) { $shArgs += "--no-launch" }
        & sh @shArgs
        if ($LASTEXITCODE -ne 0) {
            throw "The installer exited with code $LASTEXITCODE."
        }
    } finally {
        Remove-Item -LiteralPath $script -Force -ErrorAction SilentlyContinue
    }
}

if ($env:OS -ne "Windows_NT") {
    if ($IsLinux -or $IsMacOS) {
        if ($Package -eq "exe") { throw "The exe package is for Windows. Run the command without -Package." }
        Invoke-UnixInstall
        return
    }
    throw "This platform is not supported yet."
}

if ($Package -notin @("auto", "exe")) {
    throw "The $Package package is for macOS or Linux. On Windows run the command without -Package."
}
if ([string]::IsNullOrWhiteSpace($InstallDir)) {
    $InstallDir = Join-Path $env:LOCALAPPDATA "Voidstrap"
}

try {
    if (-not [Environment]::Is64BitOperatingSystem) {
        throw "Voidstrap requires 64-bit Windows."
    }
    if ([Environment]::OSVersion.Version.Major -lt 10) {
        throw "Voidstrap requires Windows 10 or newer."
    }

    [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

    $InstallDir = [System.IO.Path]::GetFullPath($InstallDir)
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null

    $destination = Join-Path $InstallDir $exeName
    $stagedPath = Join-Path $InstallDir (".Voidstrap-" + [Guid]::NewGuid().ToString("N") + ".download")

    Write-Step "Checking the latest Voidstrap release..."
    $release = Invoke-RestMethod -Uri $releaseApi -Headers @{ "User-Agent" = "Voidstrap-Quick-Install" } -TimeoutSec 30
    $asset = @($release.assets | Where-Object { $_.name -ceq $exeName }) | Select-Object -First 1
    if (-not $asset -or $asset.digest -cnotmatch '^sha256:([a-fA-F0-9]{64})$') {
        throw "The latest release has no verifiable Windows download."
    }
    $expectedHash = $Matches[1]
    $downloadUri = [Uri]$asset.browser_download_url
    if ($downloadUri.Scheme -ne "https" -or $downloadUri.Host -ne "github.com" -or
        $downloadUri.AbsolutePath -notlike "/KloBraticc/Voidstrap/releases/download/*/Voidstrap.exe") {
        throw "The release download address is invalid."
    }

    Write-Step "Downloading the latest Voidstrap release..."
    Invoke-VoidstrapDownload -Uri $downloadUri.AbsoluteUri -OutFile $stagedPath
    Test-VoidstrapDownload -Path $stagedPath -ExpectedHash $expectedHash

    $running = @(Get-Process -Name "Voidstrap" -ErrorAction SilentlyContinue)
    if ($running.Count -gt 0) {
        Write-Step "Closing the running Voidstrap instance..."
        $running | Stop-Process -Force
        foreach ($process in $running) {
            try { $process.WaitForExit(10000) | Out-Null } catch {}
        }
    }

    Move-Item -LiteralPath $stagedPath -Destination $destination -Force
    $stagedPath = $null

    if (-not $NoPath.IsPresent) {
        Add-VoidstrapToPath -Directory $InstallDir
    }

    $version = [System.Diagnostics.FileVersionInfo]::GetVersionInfo($destination).FileVersion
    Write-Host "Voidstrap $version installed successfully." -ForegroundColor Green
    Write-Host "Location: $destination"

    if (-not $NoLaunch.IsPresent) {
        Write-Step "Starting Voidstrap..."
        Start-Process -FilePath $destination
    }
} catch {
    throw "Voidstrap quick install failed: $($_.Exception.Message)"
} finally {
    if ($stagedPath -and (Test-Path -LiteralPath $stagedPath)) {
        Remove-Item -LiteralPath $stagedPath -Force -ErrorAction SilentlyContinue
    }
}
