param(
    [string]$CacheDir = "$env:USERPROFILE\.platformio\.cache"
)

$ErrorActionPreference = 'Stop'

function Get-PackageSpec {
    param([string]$Owner, [string]$Type, [string]$Name, [string]$Version)
    [pscustomobject]@{ owner = $Owner; type = $Type; name = $Name; version = $Version }
}

$specs = @(
    (Get-PackageSpec 'espressif' 'toolchain' 'toolchain-xtensa-esp32s3' '8.4.0+2021r2-patch5'),
    (Get-PackageSpec 'espressif' 'toolchain' 'toolchain-xtensa-esp32' '8.4.0+2021r2-patch5'),
    (Get-PackageSpec 'espressif' 'toolchain' 'toolchain-riscv32-esp' '8.4.0+2021r2-patch5'),
    (Get-PackageSpec 'platformio' 'framework' 'framework-arduinoespressif32' '~3.20017.0'),
    (Get-PackageSpec 'platformio' 'uploader' 'tool-esptoolpy' '~2.41100.0'),
    (Get-PackageSpec 'platformio' 'uploader' 'tool-dfuutil-arduino' '~1.11.0'),
    (Get-PackageSpec 'espressif' 'debugger' 'tool-openocd-esp32' '~2.1100.0'),
    (Get-PackageSpec 'platformio' 'uploader' 'tool-mkspiffs' '~2.230.0'),
    (Get-PackageSpec 'platformio' 'uploader' 'tool-mklittlefs' '~1.203.0'),
    (Get-PackageSpec 'platformio' 'uploader' 'tool-mkfatfs' '~2.0.0'),
    (Get-PackageSpec 'platformio' 'tool' 'tool-cmake' '~3.30.0'),
    (Get-PackageSpec 'platformio' 'tool' 'tool-ninja' '^1.7.0')
)

function Get-VersionTriple {
    param([string]$Version)
    if ($Version -match '^(\d+)\.(\d+)\.(\d+)') {
        return [pscustomobject]@{ Major = [int]$Matches[1]; Minor = [int]$Matches[2]; Patch = [int]$Matches[3] }
    }
    return $null
}

function Test-VersionMatch {
    param([string]$Constraint, [string]$Candidate)
    $c = Get-VersionTriple $Candidate
    if (-not $c) { return $false }
    if ($Constraint -match '^~(\d+)\.(\d+)\.(\d+)') {
        $min = [pscustomobject]@{ Major = [int]$Matches[1]; Minor = [int]$Matches[2]; Patch = [int]$Matches[3] }
        if ($c.Major -ne $min.Major -or $c.Minor -ne $min.Minor -or $c.Patch -lt $min.Patch) { return $false }
        return $true
    }
    if ($Constraint -match '^\^(\d+)\.(\d+)\.(\d+)') {
        $min = [pscustomobject]@{ Major = [int]$Matches[1]; Minor = [int]$Matches[2]; Patch = [int]$Matches[3] }
        if ($c.Major -lt $min.Major) { return $false }
        if ($c.Major -eq $min.Major -and $c.Minor -lt $min.Minor) { return $false }
        if ($c.Major -eq $min.Major -and $c.Minor -eq $min.Minor -and $c.Patch -lt $min.Patch) { return $false }
        return $true
    }
    return $Constraint -eq $Candidate
}

function Get-ResolvedUrlAndChecksum {
    param([string]$Owner, [string]$Type, [string]$Name, [string]$Version)
    $metaUrl = "https://api.registry.platformio.org/v3/packages/$Owner/tool/$Name"
    $meta = Invoke-RestMethod $metaUrl -Headers @{ 'User-Agent' = 'platformio' } -TimeoutSec 30 -UseBasicParsing
    $candidates = @($meta.versions | Where-Object { Test-VersionMatch $Version $_.name })
    if ($candidates.Count -eq 0) {
        throw "no matching version for $Owner/$Name $Version"
    }
    $ver = $candidates | Sort-Object { $_.released_at } -Descending | Select-Object -First 1
    $file = @($ver.files | Where-Object { $_.system -contains 'windows_amd64' }) | Select-Object -First 1
    if (-not $file) {
        throw "no windows_amd64 file for $Owner/$Name $Version"
    }

    $headOutput = & curl.exe -sIL --max-redirs 3 $file.download_url 2>$null
    $locationLine = $headOutput | Select-String -Pattern '^location:' | Select-Object -First 1
    $finalUrl = $file.download_url
    if ($locationLine) {
        $finalUrl = $locationLine.ToString().Trim()
        $finalUrl = $finalUrl.Substring($finalUrl.IndexOf(':') + 1).Trim()
    }
    return [pscustomobject]@{
        url      = $finalUrl
        checksum = $file.checksum.sha256
        name     = $file.name
    }
}

$sha1 = [System.Security.Cryptography.SHA1]::Create()
New-Item -ItemType Directory -Path "$env:TEMP\pio-seed" -Force | Out-Null

foreach ($spec in $specs) {
    $label = "$($spec.owner)/$($spec.type)/$($spec.name)"
    Write-Output "== $label"
    $resolved = Get-ResolvedUrlAndChecksum $spec.owner $spec.type $spec.name $spec.version
    Write-Output "   file: $($resolved.name)"
    Write-Output "   url : $($resolved.url)"

    $local = Join-Path "$env:TEMP\pio-seed" $resolved.name
    if (-not (Test-Path $local)) {
        Write-Output "   downloading with curl..."
        & curl.exe -sL --retry 5 --retry-delay 2 --retry-all-errors -o $local $resolved.url
        if ($LASTEXITCODE -ne 0 -or -not (Test-Path $local)) {
            Write-Output "   FAILED to download $($resolved.name)"
            continue
        }
    }

    $hashBytes = $sha1.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($resolved.url + $resolved.checksum))
    $hash = [BitConverter]::ToString($hashBytes).Replace('-', '').ToLower()
    $dest = Join-Path $CacheDir $hash
    Copy-Item $local $dest -Force
    Write-Output "   seeded: $hash ($((Get-Item $dest).Length) bytes)"
}

Write-Output "done"
