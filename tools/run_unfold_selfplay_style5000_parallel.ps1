param(
  [int]$Seed = 2026051301,
  [int]$MaxPlies = 160,
  [int]$LookaheadDepth = 1,
  [int]$ChunksPerStyle = 25,
  [int]$ChunkSize = 20,
  [int]$MaxParallel = 5,
  [string]$OutPrefix = "selfplay-v36-style5000",
  [string[]]$Styles = @("attack-defense", "defense-attack", "balanced-balanced", "attack-attack", "defense-defense")
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $root "docs\selfplay"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$logPath = Join-Path $logDir ("{0}-parallel-run.log" -f $OutPrefix)

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

$queue = New-Object System.Collections.Queue
foreach ($style in $Styles) {
  if (!$stylePairs.ContainsKey($style)) {
    throw "Unknown style: $style"
  }
  $queue.Enqueue($style)
}

$running = @()
$styleIndex = 0
Write-RunLog "UNFOLD parallel style matrix selfplay started. prefix=$OutPrefix seed=$Seed chunksPerStyle=$ChunksPerStyle chunkSize=$ChunkSize maxPlies=$MaxPlies lookahead=$LookaheadDepth maxParallel=$MaxParallel"

while ($queue.Count -gt 0 -or $running.Count -gt 0) {
  while ($queue.Count -gt 0 -and $running.Count -lt [Math]::Max(1, $MaxParallel)) {
    $style = [string]$queue.Dequeue()
    $styleIndex += 1
    $pair = $stylePairs[$style]
    $stylePrefix = "{0}-{1}" -f $OutPrefix, $style
    $styleSeed = $Seed + ($styleIndex * 1000000)
    $stdout = Join-Path $logDir ("{0}-{1}-stdout.log" -f $OutPrefix, $style)
    $stderr = Join-Path $logDir ("{0}-{1}-stderr.log" -f $OutPrefix, $style)
    $args = @(
      "-NoProfile",
      "-ExecutionPolicy", "Bypass",
      "-File", (Join-Path $PSScriptRoot "run_unfold_selfplay_chunks.ps1"),
      "-Chunks", $ChunksPerStyle,
      "-ChunkSize", $ChunkSize,
      "-Seed", $styleSeed,
      "-MaxPlies", $MaxPlies,
      "-LookaheadDepth", $LookaheadDepth,
      "-Modes", "original,shogi",
      "-Bulk",
      "-P1Strategy", $pair[0],
      "-P2Strategy", $pair[1],
      "-OutPrefix", $stylePrefix
    )
    Write-RunLog "Starting style=$style p1=$($pair[0]) p2=$($pair[1]) seed=$styleSeed"
    $process = Start-Process -FilePath "powershell" -ArgumentList $args -RedirectStandardOutput $stdout -RedirectStandardError $stderr -WindowStyle Hidden -PassThru
    $running += [pscustomobject]@{
      Style = $style
      Process = $process
      Stdout = $stdout
      Stderr = $stderr
    }
  }

  Start-Sleep -Seconds 15
  $nextRunning = @()
  foreach ($entry in $running) {
    $entry.Process.Refresh()
    if ($entry.Process.HasExited) {
      $entry.Process.WaitForExit()
      $exitCode = $entry.Process.ExitCode
      if ($null -eq $exitCode) {
        $nextRunning += $entry
      } elseif ($exitCode -eq 0) {
        Write-RunLog "Finished style=$($entry.Style)"
      } else {
        Write-RunLog "FAILED style=$($entry.Style) exit=$exitCode stderr=$($entry.Stderr)"
        throw "Selfplay style failed: $($entry.Style)"
      }
    } else {
      $nextRunning += $entry
    }
  }
  $running = $nextRunning
}

Write-RunLog "UNFOLD parallel style matrix selfplay finished."
