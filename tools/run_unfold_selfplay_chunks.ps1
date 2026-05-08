param(
  [int]$Chunks = 50,
  [int]$ChunkSize = 20,
  [int]$Seed = 2026050401,
  [int]$MaxPlies = 180,
  [int]$LookaheadDepth = 1,
  [string]$Profile = "attack-defense",
  [string]$P1Strategy = "",
  [string]$P2Strategy = "",
  [string]$OutPrefix = "selfplay-chunks",
  [string[]]$Modes = @("original", "shogi"),
  [switch]$Bulk
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (!(Test-Path $chrome)) {
  $chrome = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
}
if (!(Test-Path $chrome)) {
  throw "Google Chrome was not found."
}

$soloPath = Resolve-Path (Join-Path $root "laravel-app\public\solo.html")
$soloUrl = "file:///" + (($soloPath.Path) -replace "\\", "/")
$outDir = Join-Path $root "docs\selfplay"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$runModes = @($Modes | ForEach-Object { [string]$_ -split "," } | ForEach-Object { $_.Trim() } | Where-Object { $_ -eq "original" -or $_ -eq "shogi" } | Select-Object -Unique)
if (!$runModes.Count) {
  throw "Modes must include original and/or shogi."
}

function Get-ReasonsText {
  param([object]$Reasons)
  if (!$Reasons) {
    return ""
  }
  return ($Reasons.PSObject.Properties | ForEach-Object {
    "$($_.Name):$($_.Value)"
  }) -join "; "
}

function Get-SelfPlayResult {
  param(
    [string]$Mode,
    [int]$ChunkIndex,
    [int]$RunSeed
  )

  $strategyQuery = if ($P1Strategy -or $P2Strategy) {
    "p1Strategy=$([System.Uri]::EscapeDataString($P1Strategy))&p2Strategy=$([System.Uri]::EscapeDataString($P2Strategy))"
  } elseif ($Profile -eq "attack-defense") {
    "p1Strategy=attack&p2Strategy=defense"
  } else {
    "strategy=$Profile"
  }
  $bulkQuery = if ($Bulk) { "&bulk=1" } else { "" }
  $query = "?debug=1&selfplay=$ChunkSize&seed=$RunSeed&mode=$Mode&maxPlies=$MaxPlies&$strategyQuery&fast=1&lookahead=$LookaheadDepth$bulkQuery"
  $tmp = Join-Path $env:TEMP ("unfold-{0}-{1}-{2}.html" -f $OutPrefix, $Mode, $ChunkIndex)
  $err = Join-Path $env:TEMP ("unfold-{0}-{1}-{2}.err" -f $OutPrefix, $Mode, $ChunkIndex)
  $args = @("--headless=new", "--disable-gpu", "--allow-file-access-from-files", "--dump-dom", ($soloUrl + $query))
  $process = Start-Process -FilePath $chrome -ArgumentList $args -RedirectStandardOutput $tmp -RedirectStandardError $err -NoNewWindow -Wait -PassThru
  if ($process.ExitCode -ne 0 -and !(Test-Path $tmp)) {
    throw "Chrome failed for $Mode chunk $ChunkIndex with exit code $($process.ExitCode)."
  }

  $html = [System.IO.File]::ReadAllText($tmp, [System.Text.Encoding]::UTF8)
  $match = [regex]::Match($html, '<pre id="selfplayResult">(?<json>[\s\S]*)</pre>')
  if (!$match.Success) {
    throw "selfplayResult not found for $Mode chunk $ChunkIndex"
  }
  $json = [System.Net.WebUtility]::HtmlDecode($match.Groups["json"].Value)
  $path = Join-Path $outDir ("{0}-{1}-chunk{2:D2}.json" -f $OutPrefix, $Mode, $ChunkIndex)
  [System.IO.File]::WriteAllText($path, $json, [System.Text.Encoding]::UTF8)
  return Get-Content $path -Raw | ConvertFrom-Json
}

function Convert-ToChunkSummary {
  param(
    [string]$Mode,
    [int]$ChunkIndex,
    [object]$Data
  )

  $wins = $Data.summary.wins
  $recoveries = $Data.summary.recoveryStats.pieceRecoveries + $Data.summary.recoveryStats.fragmentRecoveries
  return [ordered]@{
    mode = $Mode
    chunk = $ChunkIndex
    games = $Data.summary.games
    P1 = $wins.P1
    P2 = $wins.P2
    draw = $wins.draw
    defenderSuccess = $Data.summary.defenderResults.defenderSuccessRate
    avgTurns = $Data.summary.averageTurns
    avgPlies = $Data.summary.averagePlies
    reasons = Get-ReasonsText $Data.summary.reasons
    deckExhausted = $Data.summary.deckExhaustedGames
    bothDecksExhausted = $Data.summary.bothDecksExhaustedGames
    recoveries = $recoveries
  }
}

function Convert-ToAggregateSummary {
  param([object[]]$Games)

  $wins = [ordered]@{ P1 = 0; P2 = 0; draw = 0 }
  $reasons = @{}
  $totalTurns = 0
  $totalPlies = 0
  $totalP1Deck = 0
  $totalP2Deck = 0
  $deckExhausted = 0
  $bothDecksExhausted = 0
  $actionUsage = @{}
  $pieceRecoveries = 0
  $fragmentRecoveries = 0

  foreach ($game in $Games) {
    $winner = if ($game.winner) { [string]$game.winner } else { "draw" }
    $wins[$winner] += 1
    $reason = if ($game.reason) { [string]$game.reason } else { "draw" }
    $reasons[$reason] = 1 + ($reasons[$reason] -as [int])
    $totalTurns += [double]$game.turns
    $totalPlies += [double]$game.plies
    $p1Deck = [int]$game.final.p1Deck
    $p2Deck = [int]$game.final.p2Deck
    $totalP1Deck += $p1Deck
    $totalP2Deck += $p2Deck
    if ($p1Deck -eq 0 -or $p2Deck -eq 0) {
      $deckExhausted += 1
    }
    if ($p1Deck -eq 0 -and $p2Deck -eq 0) {
      $bothDecksExhausted += 1
    }
    foreach ($move in $game.moves) {
      $type = [string]$move.type
      $actionUsage[$type] = 1 + ($actionUsage[$type] -as [int])
      if ($type -eq "recoverPiece") {
        $pieceRecoveries += 1
      } elseif ($type -eq "recoverFragment") {
        $fragmentRecoveries += 1
      }
    }
  }

  $count = [Math]::Max(1, $Games.Count)
  return [ordered]@{
    games = $Games.Count
    wins = $wins
    reasons = $reasons
    averageTurns = [Math]::Round($totalTurns / $count, 1)
    averagePlies = [Math]::Round($totalPlies / $count, 1)
    winRates = [ordered]@{
      P1 = [Math]::Round(($wins.P1 / $count) * 100, 1)
      P2 = [Math]::Round(($wins.P2 / $count) * 100, 1)
      draw = [Math]::Round(($wins.draw / $count) * 100, 1)
    }
    defenderResults = [ordered]@{
      attackWins = $wins.P1
      defenderWins = $wins.P2
      defenderHolds = $wins.draw
      defenderSuccesses = $wins.P2 + $wins.draw
      attackWinRate = [Math]::Round(($wins.P1 / $count) * 100, 1)
      defenderSuccessRate = [Math]::Round((($wins.P2 + $wins.draw) / $count) * 100, 1)
      attackDefenseGap = [Math]::Round((($wins.P1 - $wins.P2 - $wins.draw) / $count) * 100, 1)
    }
    averageFinalDecks = [ordered]@{
      P1 = [Math]::Round($totalP1Deck / $count, 1)
      P2 = [Math]::Round($totalP2Deck / $count, 1)
    }
    deckExhaustedGames = $deckExhausted
    bothDecksExhaustedGames = $bothDecksExhausted
    actionUsage = $actionUsage
    recoveryStats = [ordered]@{
      pieceRecoveries = $pieceRecoveries
      fragmentRecoveries = $fragmentRecoveries
      totalRecoveries = $pieceRecoveries + $fragmentRecoveries
    }
  }
}

$chunkSummaries = @()
$allModeGames = @{
  original = @()
  shogi = @()
}
$summaryPath = Join-Path $outDir ("{0}-20chunk-summary.json" -f $OutPrefix)

function Save-Progress {
  [System.IO.File]::WriteAllText(
    $summaryPath,
    ($chunkSummaries | ConvertTo-Json -Depth 6),
    [System.Text.Encoding]::UTF8
  )
  foreach ($modeName in $runModes) {
    if (!$allModeGames[$modeName].Count) {
      continue
    }
    $aggregate = [ordered]@{
      generatedAt = (Get-Date).ToString("s")
      seed = $Seed
      options = @{
        chunksRequested = $Chunks
        chunksCompleted = [Math]::Floor($allModeGames[$modeName].Count / [Math]::Max(1, $ChunkSize))
        chunkSize = $ChunkSize
        games = $allModeGames[$modeName].Count
        mode = $modeName
        maxPlies = $MaxPlies
        lookaheadDepth = $LookaheadDepth
        profile = $Profile
        p1Strategy = $P1Strategy
        p2Strategy = $P2Strategy
        fast = $true
        bulk = [bool]$Bulk
      }
      summary = Convert-ToAggregateSummary -Games $allModeGames[$modeName]
      games = $allModeGames[$modeName]
    }
    $aggregatePath = Join-Path $outDir ("{0}-{1}-aggregate.json" -f $OutPrefix, $modeName)
    [System.IO.File]::WriteAllText(
      $aggregatePath,
      ($aggregate | ConvertTo-Json -Depth 80),
      [System.Text.Encoding]::UTF8
    )
  }
}

for ($chunk = 1; $chunk -le $Chunks; $chunk += 1) {
  foreach ($mode in $runModes) {
    $modeOffset = if ($mode -eq "original") { 0 } else { 500000 }
    $runSeed = $Seed + $modeOffset + ($chunk * 1000)
    $data = Get-SelfPlayResult -Mode $mode -ChunkIndex $chunk -RunSeed $runSeed
    $chunkSummaries += Convert-ToChunkSummary -Mode $mode -ChunkIndex $chunk -Data $data
    $allModeGames[$mode] += $data.games
    Save-Progress
  }
}

$chunkSummaries | Format-Table -AutoSize
Write-Output "Wrote $summaryPath"
