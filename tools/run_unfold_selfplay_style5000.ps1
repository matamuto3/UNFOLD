param(
  [int]$Seed = 2026050701,
  [int]$MaxPlies = 220,
  [int]$LookaheadDepth = 1,
  [int]$ChunksPerStyle = 5,
  [int]$ChunkSize = 100,
  [string]$OutPrefix = "selfplay-v31-style5000",
  [string[]]$Styles = @("attack-defense", "defense-attack", "balanced-balanced", "attack-attack", "defense-defense")
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $root "docs\selfplay"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$logPath = Join-Path $logDir ("{0}-run.log" -f $OutPrefix)

function Write-RunLog {
  param([string]$Message)
  $line = "[{0}] {1}" -f (Get-Date).ToString("s"), $Message
  Write-Output $line
  Add-Content -Path $logPath -Value $line -Encoding UTF8
}

$stylePairs = @{
  "attack-defense" = @("attack", "defense")
  "defense-attack" = @("defense", "attack")
  "balanced-balanced" = @("balanced", "balanced")
  "attack-attack" = @("attack", "attack")
  "defense-defense" = @("defense", "defense")
}

Write-RunLog "UNFOLD style matrix selfplay started. prefix=$OutPrefix seed=$Seed chunksPerStyle=$ChunksPerStyle chunkSize=$ChunkSize maxPlies=$MaxPlies lookahead=$LookaheadDepth"

$styleIndex = 0
foreach ($style in $Styles) {
  if (!$stylePairs.ContainsKey($style)) {
    throw "Unknown style: $style"
  }
  $styleIndex += 1
  $pair = $stylePairs[$style]
  $stylePrefix = "{0}-{1}" -f $OutPrefix, $style
  $styleSeed = $Seed + ($styleIndex * 1000000)
  Write-RunLog "Starting style=$style p1=$($pair[0]) p2=$($pair[1]) seed=$styleSeed"
  powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "run_unfold_selfplay_chunks.ps1") `
    -Chunks $ChunksPerStyle `
    -ChunkSize $ChunkSize `
    -Seed $styleSeed `
    -MaxPlies $MaxPlies `
    -LookaheadDepth $LookaheadDepth `
    -Modes original,shogi `
    -Bulk `
    -P1Strategy $pair[0] `
    -P2Strategy $pair[1] `
    -OutPrefix $stylePrefix | Tee-Object -FilePath $logPath -Append
  Write-RunLog "Finished style=$style"
}

Write-RunLog "UNFOLD style matrix selfplay finished."
