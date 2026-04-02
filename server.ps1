$ErrorActionPreference = "Stop"

$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$DataFile = Join-Path $ScriptRoot "rooms.json"
$Rooms = @{}

function New-RoomId {
  $chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".ToCharArray()
  do {
    $id = -join (1..6 | ForEach-Object { $chars[(Get-Random -Minimum 0 -Maximum $chars.Length)] })
  } while ($Rooms.ContainsKey($id))
  return $id
}

function New-PlayerId {
  return [guid]::NewGuid().ToString("N")
}

function Save-Rooms {
  @($Rooms.Values) | ConvertTo-Json -Depth 50 | Set-Content -Path $DataFile -Encoding UTF8
}

function Load-Rooms {
  if (-not (Test-Path $DataFile)) {
    return
  }

  $loaded = Get-Content -Path $DataFile -Raw
  if ([string]::IsNullOrWhiteSpace($loaded)) {
    return
  }

  foreach ($room in @($loaded | ConvertFrom-Json)) {
    $Rooms[$room.id] = $room
  }
}

function Parse-Body($BodyText) {
  if ([string]::IsNullOrWhiteSpace($BodyText)) {
    return @{}
  }
  return $BodyText | ConvertFrom-Json
}

function Get-RoomOrThrow($RoomId) {
  if (-not $Rooms.ContainsKey($RoomId)) {
    throw "Room not found"
  }
  return $Rooms[$RoomId]
}

function Get-ContentType($Path) {
  switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    ".html" { return "text/html; charset=utf-8" }
    ".css" { return "text/css; charset=utf-8" }
    ".js" { return "application/javascript; charset=utf-8" }
    ".json" { return "application/json; charset=utf-8" }
    default { return "application/octet-stream" }
  }
}

function Try-ResolveStaticFile($Root, $RequestPath) {
  if ([string]::IsNullOrWhiteSpace($RequestPath) -or $RequestPath -eq "/") {
    return $null
  }

  $relative = $RequestPath.TrimStart("/")
  if ($relative.Contains("..")) {
    return $null
  }

  $candidate = Join-Path $Root $relative
  if (-not (Test-Path $candidate -PathType Leaf)) {
    return $null
  }

  $fullRoot = [System.IO.Path]::GetFullPath($Root)
  $fullCandidate = [System.IO.Path]::GetFullPath($candidate)
  if (-not $fullCandidate.StartsWith($fullRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    return $null
  }

  return $fullCandidate
}

function Send-Response($Stream, $StatusCode, $ContentType, [byte[]]$BodyBytes) {
  $statusText = switch ($StatusCode) {
    200 { "OK" }
    400 { "Bad Request" }
    404 { "Not Found" }
    default { "OK" }
  }

  $headerText = @(
    "HTTP/1.1 $StatusCode $statusText"
    "Content-Type: $ContentType"
    "Content-Length: $($BodyBytes.Length)"
    "Connection: close"
    ""
    ""
  ) -join "`r`n"

  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headerText)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  $Stream.Write($BodyBytes, 0, $BodyBytes.Length)
  $Stream.Flush()
}

function Send-Json($Stream, $StatusCode, $Payload) {
  $json = $Payload | ConvertTo-Json -Depth 50
  $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($json)
  Send-Response $Stream $StatusCode "application/json; charset=utf-8" $bodyBytes
}

function Send-File($Stream, $Path) {
  $bytes = [System.IO.File]::ReadAllBytes($Path)
  Send-Response $Stream 200 (Get-ContentType $Path) $bytes
}

function Parse-Query($Uri) {
  $query = @{}
  if ([string]::IsNullOrEmpty($Uri.Query)) {
    return $query
  }
  foreach ($pair in $Uri.Query.TrimStart("?").Split("&")) {
    if ([string]::IsNullOrWhiteSpace($pair)) {
      continue
    }
    $parts = $pair.Split("=", 2)
    $key = [System.Uri]::UnescapeDataString($parts[0])
    $value = if ($parts.Length -gt 1) { [System.Uri]::UnescapeDataString($parts[1]) } else { "" }
    $query[$key] = $value
  }
  return $query
}

function Read-HttpRequest($Client) {
  $stream = $Client.GetStream()
  $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8, $false, 8192, $true)

  $requestLine = $reader.ReadLine()
  if ([string]::IsNullOrWhiteSpace($requestLine)) {
    throw "Invalid request"
  }

  $parts = $requestLine.Split(" ")
  $headers = @{}

  while ($true) {
    $line = $reader.ReadLine()
    if ($line -eq $null -or $line -eq "") {
      break
    }
    $headerParts = $line.Split(":", 2)
    if ($headerParts.Length -eq 2) {
      $headers[$headerParts[0].Trim()] = $headerParts[1].Trim()
    }
  }

  $bodyText = ""
  if ($headers.ContainsKey("Content-Length")) {
    $length = [int]$headers["Content-Length"]
    if ($length -gt 0) {
      $chars = New-Object char[] $length
      $null = $reader.ReadBlock($chars, 0, $length)
      $bodyText = -join $chars
    }
  }

  $uri = [System.Uri]("http://localhost:8080$($parts[1])")
  return @{
    Stream = $stream
    Method = $parts[0].ToUpperInvariant()
    Path = $uri.AbsolutePath
    Query = (Parse-Query $uri)
    BodyText = $bodyText
  }
}

Load-Rooms

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 8080)
$listener.Start()
Write-Host "UNFOLD server started: http://localhost:8080/"

while ($true) {
  $client = $listener.AcceptTcpClient()
  try {
    $request = Read-HttpRequest $client
    $stream = $request.Stream
    $method = $request.Method
    $path = $request.Path
    $body = Parse-Body $request.BodyText

    if ($method -eq "GET" -and $path -eq "/") {
      Send-File $stream (Join-Path $ScriptRoot "index.html")
      continue
    }

    if ($method -eq "GET") {
      $staticFile = Try-ResolveStaticFile $ScriptRoot $path
      if ($staticFile) {
        Send-File $stream $staticFile
        continue
      }
    }

    if ($method -eq "POST" -and $path -eq "/api/rooms/create") {
      if (-not $body.gameState) {
        throw "Initial game state is required"
      }
      $roomId = New-RoomId
      $playerId = New-PlayerId
      $room = @{
        id = $roomId
        version = 1
        createdAt = [DateTimeOffset]::UtcNow.ToString("o")
        updatedAt = [DateTimeOffset]::UtcNow.ToString("o")
        players = @{
          P1 = @{
            id = $playerId
            name = $(if ($body.name) { [string]$body.name } else { "Player 1" })
          }
          P2 = @{
            id = $null
            name = "Waiting"
          }
        }
        gameState = $body.gameState
      }
      $room.gameState.ruleMode = if ($body.ruleMode) { [string]$body.ruleMode } else { "original" }
      $Rooms[$roomId] = $room
      Save-Rooms
      Send-Json $stream 200 @{ ok = $true; room = $room; playerId = $playerId; side = "P1" }
      continue
    }

    if ($method -eq "POST" -and $path -eq "/api/rooms/join") {
      $roomId = ([string]$body.roomId).ToUpperInvariant()
      $room = Get-RoomOrThrow $roomId
      if ($room.players.P2.id) {
        throw "Room is full"
      }
      $playerId = New-PlayerId
      $room.players.P2.id = $playerId
      $room.players.P2.name = $(if ($body.name) { [string]$body.name } else { "Player 2" })
      $room.version = [int]$room.version + 1
      $room.updatedAt = [DateTimeOffset]::UtcNow.ToString("o")
      Save-Rooms
      Send-Json $stream 200 @{ ok = $true; room = $room; playerId = $playerId; side = "P2" }
      continue
    }

    if ($method -eq "GET" -and $path -match '^/api/rooms/([A-Z0-9]+)$') {
      $room = Get-RoomOrThrow $Matches[1]
      $playerId = [string]$request.Query["playerId"]
      if ($room.players.P1.id -ne $playerId -and $room.players.P2.id -ne $playerId) {
        throw "Player is not in this room"
      }
      Send-Json $stream 200 @{ ok = $true; room = $room }
      continue
    }

    if ($method -eq "POST" -and $path -match '^/api/rooms/([A-Z0-9]+)/state$') {
      $room = Get-RoomOrThrow $Matches[1]
      $playerId = [string]$body.playerId
      $side = if ($room.players.P1.id -eq $playerId) { "P1" } elseif ($room.players.P2.id -eq $playerId) { "P2" } else { $null }
      if (-not $side) {
        throw "Player is not in this room"
      }
      if ([int]$body.version -ne [int]$room.version) {
        throw "Board version mismatch. Please sync again."
      }
      if ($room.gameState.currentPlayer -ne $side) {
        throw "It is not your turn"
      }
      if (-not $body.gameState) {
        throw "Game state is required"
      }
      $room.gameState = $body.gameState
      $room.version = [int]$room.version + 1
      $room.updatedAt = [DateTimeOffset]::UtcNow.ToString("o")
      Save-Rooms
      Send-Json $stream 200 @{ ok = $true; room = $room }
      continue
    }

    Send-Json $stream 404 @{ ok = $false; error = "Endpoint not found" }
  }
  catch {
    try {
      if ($stream) {
        Send-Json $stream 400 @{ ok = $false; error = $_.Exception.Message }
      }
    }
    catch {}
  }
  finally {
    $client.Close()
  }
}
