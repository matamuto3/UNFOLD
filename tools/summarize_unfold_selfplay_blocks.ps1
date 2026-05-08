param(
  [string]$Prefix,
  [string]$Mode,
  [int]$BlockSize = 20
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$path = Join-Path $root ("docs\selfplay\{0}-{1}-aggregate.json" -f $Prefix, $Mode)
if (!(Test-Path $path)) {
  throw "Aggregate file was not found: $path"
}

$data = Get-Content $path -Raw | ConvertFrom-Json
$games = @($data.games)
$blocks = @()

for ($index = 0; $index -lt $games.Count; $index += $BlockSize) {
  $slice = @($games | Select-Object -Skip $index -First $BlockSize)
  if (!$slice.Count) {
    continue
  }

  $wins = [ordered]@{ P1 = 0; P2 = 0; draw = 0 }
  $reasons = @{}
  $turns = 0
  $plies = 0
  $deckExhausted = 0
  $bothDecks = 0
  $recoveries = 0

  foreach ($game in $slice) {
    $winner = if ($game.winner) { [string]$game.winner } else { "draw" }
    $wins[$winner] += 1
    $reason = if ($game.reason) { [string]$game.reason } else { "draw" }
    $reasons[$reason] = 1 + ($reasons[$reason] -as [int])
    $turns += [double]$game.turns
    $plies += [double]$game.plies
    if ([int]$game.final.p1Deck -eq 0 -or [int]$game.final.p2Deck -eq 0) {
      $deckExhausted += 1
    }
    if ([int]$game.final.p1Deck -eq 0 -and [int]$game.final.p2Deck -eq 0) {
      $bothDecks += 1
    }
    foreach ($move in $game.moves) {
      if ($move.type -eq "recoverPiece" -or $move.type -eq "recoverFragment") {
        $recoveries += 1
      }
    }
  }

  $count = [Math]::Max(1, $slice.Count)
  $blocks += [ordered]@{
    mode = $Mode
    block = [Math]::Floor($index / $BlockSize) + 1
    games = $slice.Count
    range = ("{0}-{1}" -f ($index + 1), ($index + $slice.Count))
    P1 = $wins.P1
    P2 = $wins.P2
    draw = $wins.draw
    defenderSuccess = [Math]::Round((($wins.P2 + $wins.draw) / $count) * 100, 1)
    avgTurns = [Math]::Round($turns / $count, 1)
    avgPlies = [Math]::Round($plies / $count, 1)
    deckExhausted = $deckExhausted
    bothDecksExhausted = $bothDecks
    recoveries = $recoveries
    reasons = $reasons
  }
}

$outPath = Join-Path $root ("docs\selfplay\{0}-{1}-20block-summary.json" -f $Prefix, $Mode)
[System.IO.File]::WriteAllText($outPath, ($blocks | ConvertTo-Json -Depth 8), [System.Text.Encoding]::UTF8)
$blocks | Format-Table -AutoSize
Write-Output "Wrote $outPath"
