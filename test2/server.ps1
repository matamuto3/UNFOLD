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

function New-EmptyHand {
  return @{
    FU = 0
    KY = 0
    KE = 0
    GI = 0
    KI = 0
    KA = 0
    HI = 0
  }
}

function New-InitialBoard {
  return @(
    @(
      @{ owner = "white"; type = "KY" }, @{ owner = "white"; type = "KE" }, @{ owner = "white"; type = "GI" }, @{ owner = "white"; type = "KI" },
      @{ owner = "white"; type = "OU" }, @{ owner = "white"; type = "KI" }, @{ owner = "white"; type = "GI" }, @{ owner = "white"; type = "KE" }, @{ owner = "white"; type = "KY" }
    ),
    @($null, @{ owner = "white"; type = "HI" }, $null, $null, $null, $null, $null, @{ owner = "white"; type = "KA" }, $null),
    @(
      @{ owner = "white"; type = "FU" }, @{ owner = "white"; type = "FU" }, @{ owner = "white"; type = "FU" }, @{ owner = "white"; type = "FU" }, @{ owner = "white"; type = "FU" },
      @{ owner = "white"; type = "FU" }, @{ owner = "white"; type = "FU" }, @{ owner = "white"; type = "FU" }, @{ owner = "white"; type = "FU" }
    ),
    @($null, $null, $null, $null, $null, $null, $null, $null, $null),
    @($null, $null, $null, $null, $null, $null, $null, $null, $null),
    @($null, $null, $null, $null, $null, $null, $null, $null, $null),
    @(
      @{ owner = "black"; type = "FU" }, @{ owner = "black"; type = "FU" }, @{ owner = "black"; type = "FU" }, @{ owner = "black"; type = "FU" }, @{ owner = "black"; type = "FU" },
      @{ owner = "black"; type = "FU" }, @{ owner = "black"; type = "FU" }, @{ owner = "black"; type = "FU" }, @{ owner = "black"; type = "FU" }
    ),
    @($null, @{ owner = "black"; type = "KA" }, $null, $null, $null, $null, $null, @{ owner = "black"; type = "HI" }, $null),
    @(
      @{ owner = "black"; type = "KY" }, @{ owner = "black"; type = "KE" }, @{ owner = "black"; type = "GI" }, @{ owner = "black"; type = "KI" },
      @{ owner = "black"; type = "OU" }, @{ owner = "black"; type = "KI" }, @{ owner = "black"; type = "GI" }, @{ owner = "black"; type = "KE" }, @{ owner = "black"; type = "KY" }
    )
  )
}

function New-GameState {
  return @{
    board = (New-InitialBoard)
    hands = @{
      black = (New-EmptyHand)
      white = (New-EmptyHand)
    }
    turn = "black"
    status = "waiting"
    winner = $null
    reason = $null
    lastMove = $null
    moveNumber = 1
  }
}

function Save-Rooms {
  @($Rooms.Values) | ConvertTo-Json -Depth 20 | Set-Content -Path $DataFile -Encoding UTF8
}

function Load-Rooms {
  if (-not (Test-Path $DataFile)) {
    return
  }

  $loaded = Get-Content -Path $DataFile -Raw | ConvertFrom-Json
  foreach ($room in @($loaded)) {
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

function Assert-PlayerInRoom($Room, $PlayerId) {
  if ($Room.players.black.id -ne $PlayerId -and $Room.players.white.id -ne $PlayerId) {
    throw "Player is not in this room"
  }
}

function Get-ContentType($Path) {
  $extension = [System.IO.Path]::GetExtension($Path).ToLowerInvariant()
  switch ($extension) {
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
  $json = $Payload | ConvertTo-Json -Depth 20
  $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($json)
  Send-Response $Stream $StatusCode "application/json; charset=utf-8" $bodyBytes
}

function Send-File($Stream, $Path) {
  if (-not (Test-Path $Path)) {
    Send-Json $Stream 404 @{ ok = $false; error = "File not found" }
    return
  }

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
  $method = $parts[0].ToUpperInvariant()
  $target = $parts[1]
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

  $uri = [System.Uri]("http://localhost:8080$target")
  return @{
    Stream = $stream
    Method = $method
    Path = $uri.AbsolutePath
    Query = (Parse-Query $uri)
    BodyText = $bodyText
  }
}

Load-Rooms

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 8080)
$listener.Start()

Write-Host "Server started: http://localhost:8080/"

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
      $roomId = New-RoomId
      $playerId = New-PlayerId
      $room = @{
        id = $roomId
        version = 1
        createdAt = [DateTimeOffset]::UtcNow.ToString("o")
        updatedAt = [DateTimeOffset]::UtcNow.ToString("o")
        players = @{
          black = @{
            id = $playerId
            name = $(if ($body.name) { [string]$body.name } else { "Black" })
          }
          white = @{
            id = $null
            name = "Waiting"
          }
        }
        gameState = (New-GameState)
        rematchVotes = @()
      }
      $Rooms[$roomId] = $room
      Save-Rooms
      Send-Json $stream 200 @{ ok = $true; room = $room; playerId = $playerId; side = "black" }
      continue
    }

    if ($method -eq "POST" -and $path -eq "/api/rooms/join") {
      $roomId = ([string]$body.roomId).ToUpperInvariant()
      $room = Get-RoomOrThrow $roomId
      if ($room.players.white.id) {
        throw "Room is full"
      }

      $playerId = New-PlayerId
      $room.players.white.id = $playerId
      $room.players.white.name = $(if ($body.name) { [string]$body.name } else { "White" })
      $room.gameState.status = "playing"
      $room.version = [int]$room.version + 1
      $room.updatedAt = [DateTimeOffset]::UtcNow.ToString("o")
      Save-Rooms
      Send-Json $stream 200 @{ ok = $true; room = $room; playerId = $playerId; side = "white" }
      continue
    }

    if ($method -eq "GET" -and $path -match '^/api/rooms/([A-Z0-9]+)$') {
      $room = Get-RoomOrThrow $Matches[1]
      Assert-PlayerInRoom $room ([string]$request.Query["playerId"])
      Send-Json $stream 200 @{ ok = $true; room = $room }
      continue
    }

    if ($method -eq "POST" -and $path -match '^/api/rooms/([A-Z0-9]+)/move$') {
      $room = Get-RoomOrThrow $Matches[1]
      $playerId = [string]$body.playerId
      Assert-PlayerInRoom $room $playerId

      if ([int]$body.version -ne [int]$room.version) {
        throw "Board version mismatch. Please sync again."
      }

      $expectedTurn = if ($room.players.black.id -eq $playerId) { "black" } else { "white" }
      if ($room.gameState.turn -ne $expectedTurn) {
        throw "It is not your turn"
      }

      $room.gameState = $body.gameState
      $room.rematchVotes = @()
      $room.version = [int]$room.version + 1
      $room.updatedAt = [DateTimeOffset]::UtcNow.ToString("o")
      Save-Rooms
      Send-Json $stream 200 @{ ok = $true; room = $room }
      continue
    }

    if ($method -eq "POST" -and $path -match '^/api/rooms/([A-Z0-9]+)/resign$') {
      $room = Get-RoomOrThrow $Matches[1]
      $playerId = [string]$body.playerId
      Assert-PlayerInRoom $room $playerId

      $room.gameState.status = "finished"
      $room.gameState.winner = $(if ($room.players.black.id -eq $playerId) { "white" } else { "black" })
      $room.gameState.reason = "Resign"
      $room.version = [int]$room.version + 1
      $room.updatedAt = [DateTimeOffset]::UtcNow.ToString("o")
      Save-Rooms
      Send-Json $stream 200 @{ ok = $true; room = $room }
      continue
    }

    if ($method -eq "POST" -and $path -match '^/api/rooms/([A-Z0-9]+)/rematch$') {
      $room = Get-RoomOrThrow $Matches[1]
      $playerId = [string]$body.playerId
      Assert-PlayerInRoom $room $playerId

      $votes = @($room.rematchVotes)
      if ($votes -notcontains $playerId) {
        $votes += $playerId
      }
      $room.rematchVotes = $votes

      if ($room.players.black.id -and $room.players.white.id -and $room.rematchVotes.Count -ge 2) {
        $room.gameState = New-GameState
        $room.gameState.status = "playing"
        $room.rematchVotes = @()
      }

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
