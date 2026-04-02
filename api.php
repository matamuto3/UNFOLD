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

try {
    $rooms = rooms_by_id(load_rooms($dataFile));
    $body = request_body();
    json_response(['ok' => true, 'action' => $action, 'rooms' => count($rooms)]);
} catch (Throwable $e) {
    json_response(['ok' => false, 'error' => $e->getMessage()], 400);
}
