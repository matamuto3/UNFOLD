<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$dataFile = __DIR__ . DIRECTORY_SEPARATOR . 'rooms.json';
$action = $_GET['action'] ?? '';
$roomId = strtoupper((string)($_GET['roomId'] ?? ''));

const WAITING_ROOM_TTL = 21600;
const ROOM_TTL = 172800;

function json_response(array $payload, int $status = 200): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function load_rooms(string $dataFile): array {
    if (!file_exists($dataFile)) {
        return [];
    }
    $raw = file_get_contents($dataFile);
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function save_rooms(string $dataFile, array $rooms): void {
    file_put_contents(
        $dataFile,
        json_encode(array_values($rooms), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT),
        LOCK_EX
    );
}

function request_body(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function new_room_id(array $rooms): string {
    $chars = str_split('ABCDEFGHJKLMNPQRSTUVWXYZ23456789');
    do {
        $id = '';
        for ($i = 0; $i < 6; $i += 1) {
            $id .= $chars[random_int(0, count($chars) - 1)];
        }
    } while (isset($rooms[$id]));
    return $id;
}

function new_player_id(): string {
    return bin2hex(random_bytes(16));
}

function now_iso(): string {
    return gmdate('c');
}

function rooms_by_id(array $rooms): array {
    $indexed = [];
    foreach ($rooms as $room) {
        if (isset($room['id'])) {
            $indexed[$room['id']] = $room;
        }
    }
    return $indexed;
}

function assert_room_exists(array $rooms, string $roomId): array {
    if (!isset($rooms[$roomId])) {
        throw new RuntimeException('Room not found');
    }
    return $rooms[$roomId];
}

function assert_player(array $room, string $playerId): string {
    if (($room['players']['P1']['id'] ?? '') === $playerId) {
        return 'P1';
    }
    if (($room['players']['P2']['id'] ?? '') === $playerId) {
        return 'P2';
    }
    throw new RuntimeException('Player is not in this room');
}

function is_room_waiting(array $room): bool {
    return empty($room['players']['P2']['id']) || (($room['gameState']['turnNumber'] ?? 1) <= 1 && empty($room['gameState']['actionLog']));
}

function cleanup_rooms(array $rooms): array {
    $now = time();
    foreach ($rooms as $id => $room) {
        $updatedAt = strtotime((string)($room['updatedAt'] ?? '')) ?: $now;
        $age = $now - $updatedAt;
        $p1Missing = empty($room['players']['P1']['id']);
        $p2Missing = empty($room['players']['P2']['id']);
        if ($age > ROOM_TTL) {
            unset($rooms[$id]);
            continue;
        }
        if ($p1Missing && $p2Missing) {
            unset($rooms[$id]);
            continue;
        }
        if (is_room_waiting($room) && $age > WAITING_ROOM_TTL) {
            unset($rooms[$id]);
        }
    }
    return $rooms;
}

function touch_room(array $room): array {
    $room['updatedAt'] = now_iso();
    return $room;
}

function touch_player(array $room, string $side): array {
    $room['players'][$side]['lastSeenAt'] = now_iso();
    return touch_room($room);
}

function close_room_if_empty(array &$rooms, string $roomId): bool {
    $room = $rooms[$roomId] ?? null;
    if (!$room) {
        return true;
    }
    $p1Missing = empty($room['players']['P1']['id']);
    $p2Missing = empty($room['players']['P2']['id']);
    if ($p1Missing && $p2Missing) {
        unset($rooms[$roomId]);
        return true;
    }
    return false;
}

try {
    $rooms = cleanup_rooms(rooms_by_id(load_rooms($dataFile)));
    $body = request_body();

    if ($action === 'room.create') {
        if (empty($body['gameState']) || !is_array($body['gameState'])) {
            throw new RuntimeException('Initial game state is required');
        }
        $newRoomId = new_room_id($rooms);
        $playerId = new_player_id();
        $gameState = $body['gameState'];
        $gameState['ruleMode'] = (string)($body['ruleMode'] ?? ($gameState['ruleMode'] ?? 'original'));

        $room = [
            'id' => $newRoomId,
            'version' => 1,
            'createdAt' => now_iso(),
            'updatedAt' => now_iso(),
            'status' => 'waiting',
            'players' => [
                'P1' => [
                    'id' => $playerId,
                    'name' => (string)($body['name'] ?? 'Player 1'),
                    'lastSeenAt' => now_iso(),
                ],
                'P2' => [
                    'id' => null,
                    'name' => 'Waiting',
                    'lastSeenAt' => null,
                ],
            ],
            'waitRequest' => null,
            'gameState' => $gameState,
        ];

        $rooms[$newRoomId] = $room;
        save_rooms($dataFile, $rooms);
        json_response(['ok' => true, 'room' => $room, 'playerId' => $playerId, 'side' => 'P1']);
    }

    if ($action === 'room.join') {
        $joinRoomId = strtoupper((string)($body['roomId'] ?? ''));
        $room = assert_room_exists($rooms, $joinRoomId);
        if (!empty($room['players']['P2']['id'])) {
            throw new RuntimeException('Room is full');
        }
        $playerId = new_player_id();
        $room['players']['P2']['id'] = $playerId;
        $room['players']['P2']['name'] = (string)($body['name'] ?? 'Player 2');
        $room['players']['P2']['lastSeenAt'] = now_iso();
        $room['status'] = 'playing';
        $room['waitRequest'] = null;
        $room['version'] = (int)$room['version'] + 1;
        $room = touch_room($room);
        $rooms[$joinRoomId] = $room;
        save_rooms($dataFile, $rooms);
        json_response(['ok' => true, 'room' => $room, 'playerId' => $playerId, 'side' => 'P2']);
    }

    if ($action === 'room.get') {
        $playerId = (string)($_GET['playerId'] ?? '');
        $room = assert_room_exists($rooms, $roomId);
        $side = assert_player($room, $playerId);
        $room = touch_player($room, $side);
        $rooms[$roomId] = $room;
        save_rooms($dataFile, $rooms);
        json_response(['ok' => true, 'room' => $room]);
    }

    if ($action === 'room.state') {
        $room = assert_room_exists($rooms, $roomId);
        $playerId = (string)($body['playerId'] ?? '');
        $side = assert_player($room, $playerId);
        if ((int)($body['version'] ?? -1) !== (int)$room['version']) {
            throw new RuntimeException('Board version mismatch. Please sync again.');
        }
        if (($room['gameState']['currentPlayer'] ?? '') !== $side) {
            throw new RuntimeException('It is not your turn');
        }
        if (empty($body['gameState']) || !is_array($body['gameState'])) {
            throw new RuntimeException('Game state is required');
        }
        $room['gameState'] = $body['gameState'];
        $room['status'] = 'playing';
        $room['waitRequest'] = null;
        $room['version'] = (int)$room['version'] + 1;
        $room = touch_player($room, $side);
        $rooms[$roomId] = $room;
        save_rooms($dataFile, $rooms);
        json_response(['ok' => true, 'room' => $room]);
    }

    if ($action === 'room.leave') {
        $leaveRoomId = strtoupper((string)($body['roomId'] ?? $roomId));
        $room = assert_room_exists($rooms, $leaveRoomId);
        $playerId = (string)($body['playerId'] ?? '');
        $side = assert_player($room, $playerId);
        $hasStarted = ((int)($room['gameState']['turnNumber'] ?? 1) > 1) || !empty($room['gameState']['actionLog']);

        if ($side === 'P1') {
            unset($rooms[$leaveRoomId]);
            save_rooms($dataFile, $rooms);
            json_response(['ok' => true, 'disbanded' => true, 'message' => 'Host disbanded the room']);
        }

        if ($hasStarted) {
            unset($rooms[$leaveRoomId]);
            save_rooms($dataFile, $rooms);
            json_response(['ok' => true, 'disbanded' => true, 'message' => 'Opponent left. Room was disbanded']);
        }

        $room['players']['P2'] = [
            'id' => null,
            'name' => 'Waiting',
            'lastSeenAt' => null,
        ];
        $room['status'] = 'waiting';
        $room['waitRequest'] = null;
        $room['version'] = (int)$room['version'] + 1;
        $room = touch_room($room);
        $rooms[$leaveRoomId] = $room;
        close_room_if_empty($rooms, $leaveRoomId);
        save_rooms($dataFile, $rooms);
        json_response(['ok' => true, 'disbanded' => false, 'room' => $rooms[$leaveRoomId] ?? null, 'message' => 'Left the room']);
    }

    if ($action === 'room.disband') {
        $disbandRoomId = strtoupper((string)($body['roomId'] ?? $roomId));
        $room = assert_room_exists($rooms, $disbandRoomId);
        $playerId = (string)($body['playerId'] ?? '');
        $side = assert_player($room, $playerId);
        if ($side !== 'P1') {
            throw new RuntimeException('Only the host can disband the room');
        }
        unset($rooms[$disbandRoomId]);
        save_rooms($dataFile, $rooms);
        json_response(['ok' => true, 'disbanded' => true, 'message' => 'Room disbanded']);
    }

    if ($action === 'room.wait.request') {
        $waitRoomId = strtoupper((string)($body['roomId'] ?? $roomId));
        $room = assert_room_exists($rooms, $waitRoomId);
        $playerId = (string)($body['playerId'] ?? '');
        $side = assert_player($room, $playerId);
        if (!empty($room['waitRequest'])) {
            throw new RuntimeException('Wait request is already pending');
        }
        if (($room['gameState']['currentPlayer'] ?? '') !== $side) {
            throw new RuntimeException('You can request wait only on your turn');
        }
        if (empty($room['gameState']['history']) || count($room['gameState']['history']) <= 1) {
            throw new RuntimeException('No turn is available to undo');
        }
        $room['waitRequest'] = [
            'requestedBy' => $side,
            'requestedTo' => $side === 'P1' ? 'P2' : 'P1',
            'createdAt' => now_iso(),
        ];
        $room['version'] = (int)$room['version'] + 1;
        $room = touch_player($room, $side);
        $rooms[$waitRoomId] = $room;
        save_rooms($dataFile, $rooms);
        json_response(['ok' => true, 'room' => $room]);
    }

    if ($action === 'room.wait.respond') {
        $waitRoomId = strtoupper((string)($body['roomId'] ?? $roomId));
        $room = assert_room_exists($rooms, $waitRoomId);
        $playerId = (string)($body['playerId'] ?? '');
        $side = assert_player($room, $playerId);
        $request = $room['waitRequest'] ?? null;
        if (!$request) {
            throw new RuntimeException('No wait request is pending');
        }
        if (($request['requestedTo'] ?? '') !== $side) {
            throw new RuntimeException('Only the opponent can respond to this wait request');
        }
        if (!empty($body['approved'])) {
            $history = $room['gameState']['history'] ?? [];
            if (count($history) <= 1) {
                throw new RuntimeException('No turn is available to undo');
            }
            $restored = $history[count($history) - 2]['snapshot'];
            $restored['history'] = array_slice($history, 0, count($history) - 1);
            $room['gameState'] = $restored;
        }
        $room['waitRequest'] = null;
        $room['version'] = (int)$room['version'] + 1;
        $room = touch_player($room, $side);
        $rooms[$waitRoomId] = $room;
        save_rooms($dataFile, $rooms);
        json_response(['ok' => true, 'room' => $room]);
    }

    json_response(['ok' => false, 'error' => 'Endpoint not found'], 404);
} catch (Throwable $e) {
    json_response(['ok' => false, 'error' => $e->getMessage()], 400);
}
