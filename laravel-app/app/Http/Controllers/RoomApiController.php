<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;
use Throwable;

class RoomApiController extends Controller
{
    private const WAITING_ROOM_TTL = 1800;
    private const ROOM_TTL = 1800;

    public function handle(Request $request): JsonResponse
    {
        $dataFile = storage_path('app/private/rooms.json');
        $action = (string) $request->query('action', '');
        $roomId = strtoupper((string) $request->query('roomId', ''));

        try {
            $rooms = $this->cleanupRooms($this->roomsById($this->loadRooms($dataFile)));
            $body = $request->json()->all();
            if (!is_array($body)) {
                $body = [];
            }

            if ($action === 'room.create') {
                if (empty($body['gameState']) || !is_array($body['gameState'])) {
                    throw new RuntimeException('Initial game state is required');
                }

                $newRoomId = $this->newRoomId($rooms);
                $playerId = $this->newPlayerId();
                $adminKey = $this->newAdminKey();
                $gameState = $body['gameState'];
                $gameState['ruleMode'] = (string) ($body['ruleMode'] ?? ($gameState['ruleMode'] ?? 'original'));
                $roomName = trim((string) ($body['roomName'] ?? ''));
                $password = (string) ($body['password'] ?? '');

                $room = [
                    'id' => $newRoomId,
                    'name' => $roomName !== '' ? mb_substr($roomName, 0, 40) : '部屋 ' . $newRoomId,
                    'hasPassword' => $password !== '',
                    'passwordHash' => $password !== '' ? password_hash($password, PASSWORD_DEFAULT) : null,
                    'adminKey' => $adminKey,
                    'version' => 1,
                    'createdAt' => $this->nowIso(),
                    'updatedAt' => $this->nowIso(),
                    'status' => 'waiting',
                    'players' => [
                        'P1' => [
                            'id' => $playerId,
                            'name' => (string) ($body['name'] ?? 'Player 1'),
                            'lastSeenAt' => $this->nowIso(),
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
                $this->saveRooms($dataFile, $rooms);

                return $this->jsonResponse([
                    'ok' => true,
                    'room' => $this->sanitizeRoom($room, true),
                    'playerId' => $playerId,
                    'side' => 'P1',
                    'adminKey' => $adminKey,
                ]);
            }

            if ($action === 'room.list') {
                $this->saveRooms($dataFile, $rooms);
                return $this->jsonResponse([
                    'ok' => true,
                    'rooms' => array_values(array_map(function (array $room): array {
                        return $this->roomSummary($room);
                    }, $rooms)),
                ]);
            }

            if ($action === 'room.join') {
                $joinRoomId = strtoupper((string) ($body['roomId'] ?? ''));
                $room = $this->assertRoomExists($rooms, $joinRoomId);
                if (!empty($room['players']['P2']['id'])) {
                    throw new RuntimeException('Room is full');
                }
                if (!empty($room['passwordHash'])) {
                    $submittedPassword = (string) ($body['password'] ?? '');
                    if ($submittedPassword === '' || !password_verify($submittedPassword, (string) $room['passwordHash'])) {
                        throw new RuntimeException('Password is incorrect');
                    }
                }

                $playerId = $this->newPlayerId();
                $room['players']['P2']['id'] = $playerId;
                $room['players']['P2']['name'] = (string) ($body['name'] ?? 'Player 2');
                $room['players']['P2']['lastSeenAt'] = $this->nowIso();
                $room['status'] = 'playing';
                $room['waitRequest'] = null;
                $room['version'] = (int) $room['version'] + 1;
                $room = $this->touchRoom($room);
                $rooms[$joinRoomId] = $room;
                $this->saveRooms($dataFile, $rooms);

                return $this->jsonResponse(['ok' => true, 'room' => $this->sanitizeRoom($room, true), 'playerId' => $playerId, 'side' => 'P2']);
            }

            if ($action === 'room.get') {
                $playerId = (string) $request->query('playerId', '');
                $room = $this->assertRoomExists($rooms, $roomId);
                $side = $this->assertPlayer($room, $playerId);
                $room = $this->touchPlayer($room, $side);
                $rooms[$roomId] = $room;
                $this->saveRooms($dataFile, $rooms);

                return $this->jsonResponse(['ok' => true, 'room' => $this->sanitizeRoom($room, true)]);
            }

            if ($action === 'room.state') {
                $room = $this->assertRoomExists($rooms, $roomId);
                $playerId = (string) ($body['playerId'] ?? '');
                $side = $this->assertPlayer($room, $playerId);
                if ((int) ($body['version'] ?? -1) !== (int) $room['version']) {
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
                $room['version'] = (int) $room['version'] + 1;
                $room = $this->touchPlayer($room, $side);
                $rooms[$roomId] = $room;
                $this->saveRooms($dataFile, $rooms);

                return $this->jsonResponse(['ok' => true, 'room' => $this->sanitizeRoom($room, true)]);
            }

            if ($action === 'room.leave') {
                $leaveRoomId = strtoupper((string) ($body['roomId'] ?? $roomId));
                $room = $this->assertRoomExists($rooms, $leaveRoomId);
                $playerId = (string) ($body['playerId'] ?? '');
                $side = $this->assertPlayer($room, $playerId);
                $hasStarted = ((int) ($room['gameState']['turnNumber'] ?? 1) > 1) || !empty($room['gameState']['actionLog']);

                if ($side === 'P1') {
                    unset($rooms[$leaveRoomId]);
                    $this->saveRooms($dataFile, $rooms);

                    return $this->jsonResponse(['ok' => true, 'disbanded' => true, 'message' => 'Host disbanded the room']);
                }

                if ($hasStarted) {
                    unset($rooms[$leaveRoomId]);
                    $this->saveRooms($dataFile, $rooms);

                    return $this->jsonResponse(['ok' => true, 'disbanded' => true, 'message' => 'Opponent left. Room was disbanded']);
                }

                $room['players']['P2'] = [
                    'id' => null,
                    'name' => 'Waiting',
                    'lastSeenAt' => null,
                ];
                $room['status'] = 'waiting';
                $room['waitRequest'] = null;
                $room['version'] = (int) $room['version'] + 1;
                $room = $this->touchRoom($room);
                $rooms[$leaveRoomId] = $room;
                $this->closeRoomIfEmpty($rooms, $leaveRoomId);
                $this->saveRooms($dataFile, $rooms);

                    return $this->jsonResponse([
                        'ok' => true,
                        'disbanded' => false,
                        'room' => isset($rooms[$leaveRoomId]) ? $this->sanitizeRoom($rooms[$leaveRoomId], true) : null,
                        'message' => 'Left the room',
                    ]);
                }

            if ($action === 'room.disband') {
                $disbandRoomId = strtoupper((string) ($body['roomId'] ?? $roomId));
                $room = $this->assertRoomExists($rooms, $disbandRoomId);
                $playerId = (string) ($body['playerId'] ?? '');
                $side = $this->assertPlayer($room, $playerId);
                if ($side !== 'P1') {
                    throw new RuntimeException('Only the host can disband the room');
                }
                unset($rooms[$disbandRoomId]);
                $this->saveRooms($dataFile, $rooms);

                return $this->jsonResponse(['ok' => true, 'disbanded' => true, 'message' => 'Room disbanded']);
            }

            if ($action === 'room.deleteByKey') {
                $deleteRoomId = strtoupper((string) ($body['roomId'] ?? $roomId));
                $room = $this->assertRoomExists($rooms, $deleteRoomId);
                $adminKey = trim((string) ($body['adminKey'] ?? ''));
                if ($adminKey === '' || !hash_equals((string) ($room['adminKey'] ?? ''), $adminKey)) {
                    throw new RuntimeException('Admin key is incorrect');
                }
                unset($rooms[$deleteRoomId]);
                $this->saveRooms($dataFile, $rooms);

                return $this->jsonResponse(['ok' => true, 'disbanded' => true, 'message' => 'Room deleted from lobby']);
            }

            if ($action === 'room.wait.request') {
                $waitRoomId = strtoupper((string) ($body['roomId'] ?? $roomId));
                $room = $this->assertRoomExists($rooms, $waitRoomId);
                $playerId = (string) ($body['playerId'] ?? '');
                $side = $this->assertPlayer($room, $playerId);
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
                    'createdAt' => $this->nowIso(),
                ];
                $room['version'] = (int) $room['version'] + 1;
                $room = $this->touchPlayer($room, $side);
                $rooms[$waitRoomId] = $room;
                $this->saveRooms($dataFile, $rooms);

                return $this->jsonResponse(['ok' => true, 'room' => $this->sanitizeRoom($room, true)]);
            }

            if ($action === 'room.wait.respond') {
                $waitRoomId = strtoupper((string) ($body['roomId'] ?? $roomId));
                $room = $this->assertRoomExists($rooms, $waitRoomId);
                $playerId = (string) ($body['playerId'] ?? '');
                $side = $this->assertPlayer($room, $playerId);
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
                $room['version'] = (int) $room['version'] + 1;
                $room = $this->touchPlayer($room, $side);
                $rooms[$waitRoomId] = $room;
                $this->saveRooms($dataFile, $rooms);

                return $this->jsonResponse(['ok' => true, 'room' => $this->sanitizeRoom($room, true)]);
            }

            return $this->jsonResponse(['ok' => false, 'error' => 'Endpoint not found'], 404);
        } catch (Throwable $e) {
            return $this->jsonResponse(['ok' => false, 'error' => $e->getMessage()], 400);
        }
    }

    private function jsonResponse(array $payload, int $status = 200): JsonResponse
    {
        return response()->json(
            $payload,
            $status,
            [],
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );
    }

    private function loadRooms(string $dataFile): array
    {
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

    private function saveRooms(string $dataFile, array $rooms): void
    {
        $dir = dirname($dataFile);
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }

        file_put_contents(
            $dataFile,
            json_encode(array_values($rooms), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT),
            LOCK_EX
        );
    }

    private function newRoomId(array $rooms): string
    {
        $chars = str_split('ABCDEFGHJKLMNPQRSTUVWXYZ23456789');
        do {
            $id = '';
            for ($i = 0; $i < 6; $i++) {
                $id .= $chars[random_int(0, count($chars) - 1)];
            }
        } while (isset($rooms[$id]));

        return $id;
    }

    private function newPlayerId(): string
    {
        return bin2hex(random_bytes(16));
    }

    private function newAdminKey(): string
    {
        $chars = str_split('ABCDEFGHJKLMNPQRSTUVWXYZ23456789');
        $key = '';
        for ($i = 0; $i < 8; $i++) {
            $key .= $chars[random_int(0, count($chars) - 1)];
        }
        return $key;
    }

    private function nowIso(): string
    {
        return gmdate('c');
    }

    private function roomsById(array $rooms): array
    {
        $indexed = [];
        foreach ($rooms as $room) {
            if (isset($room['id'])) {
                $indexed[$room['id']] = $room;
            }
        }
        return $indexed;
    }

    private function assertRoomExists(array $rooms, string $roomId): array
    {
        if (!isset($rooms[$roomId])) {
            throw new RuntimeException('Room not found');
        }
        return $rooms[$roomId];
    }

    private function assertPlayer(array $room, string $playerId): string
    {
        if (($room['players']['P1']['id'] ?? '') === $playerId) {
            return 'P1';
        }
        if (($room['players']['P2']['id'] ?? '') === $playerId) {
            return 'P2';
        }
        throw new RuntimeException('Player is not in this room');
    }

    private function isRoomWaiting(array $room): bool
    {
        return empty($room['players']['P2']['id'])
            || (($room['gameState']['turnNumber'] ?? 1) <= 1 && empty($room['gameState']['actionLog']));
    }

    private function cleanupRooms(array $rooms): array
    {
        $now = time();
        foreach ($rooms as $id => $room) {
            $updatedAt = strtotime((string) ($room['updatedAt'] ?? '')) ?: $now;
            $age = $now - $updatedAt;
            $p1Missing = empty($room['players']['P1']['id']);
            $p2Missing = empty($room['players']['P2']['id']);
            if ($age > self::ROOM_TTL) {
                unset($rooms[$id]);
                continue;
            }
            if ($p1Missing && $p2Missing) {
                unset($rooms[$id]);
                continue;
            }
            if ($this->isRoomWaiting($room) && $age > self::WAITING_ROOM_TTL) {
                unset($rooms[$id]);
            }
        }
        return $rooms;
    }

    private function touchRoom(array $room): array
    {
        $room['updatedAt'] = $this->nowIso();
        return $room;
    }

    private function touchPlayer(array $room, string $side): array
    {
        $room['players'][$side]['lastSeenAt'] = $this->nowIso();
        return $this->touchRoom($room);
    }

    private function roomSummary(array $room): array
    {
        $updatedAt = (string) ($room['updatedAt'] ?? $this->nowIso());
        $updatedTs = strtotime($updatedAt) ?: time();
        $ttl = $this->isRoomWaiting($room) ? self::WAITING_ROOM_TTL : self::ROOM_TTL;

        return [
            'id' => (string) ($room['id'] ?? ''),
            'name' => (string) ($room['name'] ?? ('部屋 ' . ($room['id'] ?? ''))),
            'status' => (string) ($room['status'] ?? 'waiting'),
            'ruleMode' => (string) ($room['gameState']['ruleMode'] ?? 'original'),
            'hostName' => (string) ($room['players']['P1']['name'] ?? 'Player 1'),
            'guestName' => (string) ($room['players']['P2']['name'] ?? 'Waiting'),
            'hasPassword' => !empty($room['hasPassword']),
            'isFull' => !empty($room['players']['P2']['id']),
            'updatedAt' => $updatedAt,
            'expiresAt' => gmdate('c', $updatedTs + $ttl),
        ];
    }

    private function sanitizeRoom(array $room, bool $includeGameState = false): array
    {
        $payload = [
            'id' => (string) ($room['id'] ?? ''),
            'name' => (string) ($room['name'] ?? ('部屋 ' . ($room['id'] ?? ''))),
            'hasPassword' => !empty($room['hasPassword']),
            'version' => (int) ($room['version'] ?? 1),
            'createdAt' => (string) ($room['createdAt'] ?? $this->nowIso()),
            'updatedAt' => (string) ($room['updatedAt'] ?? $this->nowIso()),
            'status' => (string) ($room['status'] ?? 'waiting'),
            'players' => $room['players'] ?? [],
            'waitRequest' => $room['waitRequest'] ?? null,
        ];
        if ($includeGameState) {
            $payload['gameState'] = $room['gameState'] ?? [];
        }
        return $payload;
    }

    private function closeRoomIfEmpty(array &$rooms, string $roomId): bool
    {
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
}
