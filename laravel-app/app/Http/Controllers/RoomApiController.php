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
        $siteDataFile = storage_path('app/private/site.json');
        $selfplayDir = storage_path('app/private/selfplay-kifu');
        $action = (string) $request->query('action', '');
        $roomId = strtoupper((string) $request->query('roomId', ''));

        try {
            $rooms = $this->cleanupRooms($this->roomsById($this->loadRooms($dataFile)));
            $body = $request->json()->all();
            if (!is_array($body)) {
                $body = [];
            }

            if ($action === 'site.visit') {
                $site = $this->loadSiteData($siteDataFile);
                $today = $this->siteDateKey();
                $site['accessCount'] = (int) ($site['accessCount'] ?? 0) + 1;
                $site['dailyAccess'] = is_array($site['dailyAccess'] ?? null) ? $site['dailyAccess'] : [];
                $site['dailyAccess'][$today] = (int) ($site['dailyAccess'][$today] ?? 0) + 1;
                $site['updatedAt'] = $this->nowIso();
                $this->saveSiteData($siteDataFile, $site);

                return $this->jsonResponse([
                    'ok' => true,
                    'stats' => $this->sanitizeSiteStats($site),
                    'feedback' => $this->sanitizeFeedbackList($site),
                ]);
            }

            if ($action === 'site.stats' || $action === 'feedback.list') {
                $site = $this->loadSiteData($siteDataFile);

                return $this->jsonResponse([
                    'ok' => true,
                    'stats' => $this->sanitizeSiteStats($site),
                    'feedback' => $this->sanitizeFeedbackList($site),
                ]);
            }

            if ($action === 'feedback.post') {
                $message = trim((string) ($body['message'] ?? ''));
                if ($message === '') {
                    throw new RuntimeException('Message is required');
                }

                $site = $this->loadSiteData($siteDataFile);
                $site['feedback'][] = [
                    'id' => bin2hex(random_bytes(6)),
                    'message' => mb_substr($message, 0, 400),
                    'createdAt' => $this->nowIso(),
                ];
                $site['feedback'] = array_slice($site['feedback'], -100);
                $site['updatedAt'] = $this->nowIso();
                $this->saveSiteData($siteDataFile, $site);

                return $this->jsonResponse([
                    'ok' => true,
                    'stats' => $this->sanitizeSiteStats($site),
                    'feedback' => $this->sanitizeFeedbackList($site),
                ]);
            }

            if ($action === 'selfplay.list') {
                return $this->jsonResponse([
                    'ok' => true,
                    'entries' => $this->sanitizeSelfplayEntries($this->loadSelfplayIndex($selfplayDir)),
                ]);
            }

            if ($action === 'selfplay.get') {
                $selfplayId = $this->sanitizeSelfplayId((string) $request->query('id', (string) ($body['id'] ?? '')));
                if ($selfplayId === '') {
                    throw new RuntimeException('Self-play id is required');
                }
                $payload = $this->loadSelfplayPayload($selfplayDir, $selfplayId);

                return $this->jsonResponse([
                    'ok' => true,
                    'payload' => $payload,
                ]);
            }

            if ($action === 'selfplay.save') {
                $payload = is_array($body['payload'] ?? null) ? $body['payload'] : $body;
                if (!$this->isValidSelfplayPayload($payload)) {
                    throw new RuntimeException('Self-play payload is required');
                }

                $entry = $this->saveSelfplayPayload($selfplayDir, $payload, [
                    'label' => (string) ($body['label'] ?? ''),
                    'source' => (string) ($body['source'] ?? 'browser-worker'),
                    'note' => (string) ($body['note'] ?? ''),
                ]);

                return $this->jsonResponse([
                    'ok' => true,
                    'entry' => $this->sanitizeSelfplayEntry($entry),
                ]);
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
                $roomType = (string) ($body['roomType'] ?? 'match');
                $roomType = $roomType === 'study' ? 'study' : 'match';
                $visibility = $this->sanitizeVisibility($body['visibility'] ?? ($roomType === 'study' ? 'invite' : 'public'));
                $studyKind = $roomType === 'study' && (string) ($body['studyKind'] ?? '') === 'branch' ? 'branch' : 'review';
                $history = is_array($gameState['history'] ?? null) ? array_values($gameState['history']) : [];
                $reviewIndex = $roomType === 'study' && $studyKind === 'review'
                    ? max(0, min(max(count($history) - 1, 0), (int) ($body['reviewIndex'] ?? (count($history) - 1))))
                    : null;
                $studyOrigin = $this->sanitizeStudyOrigin($body['studyOrigin'] ?? null);
                $studyReference = $this->sanitizeStudyReference($body['studyReference'] ?? null);
                $studyComment = mb_substr(trim((string) ($body['studyComment'] ?? '')), 0, 600);

                $room = [
                    'id' => $newRoomId,
                    'roomType' => $roomType,
                    'visibility' => $visibility,
                    'studyKind' => $roomType === 'study' ? $studyKind : 'match',
                    'studyOrigin' => $studyOrigin,
                    'studyReference' => $studyReference,
                    'studyComment' => $studyComment,
                    'name' => $roomName !== '' ? mb_substr($roomName, 0, 40) : 'Room ' . $newRoomId,
                    'hasPassword' => $password !== '',
                    'passwordHash' => $password !== '' ? password_hash($password, PASSWORD_DEFAULT) : null,
                    'adminKey' => $adminKey,
                    'ownerPlayerId' => $playerId,
                    'version' => 1,
                    'createdAt' => $this->nowIso(),
                    'updatedAt' => $this->nowIso(),
                    'status' => $roomType === 'study'
                        ? ($studyKind === 'branch' ? 'waiting' : 'review')
                        : 'waiting',
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
                    'spectators' => [],
                    'waitRequest' => null,
                    'reviewIndex' => $reviewIndex,
                    'reviewNotes' => [],
                    'reviewArrows' => [],
                    'analyticsRecorded' => false,
                    'gameState' => $gameState,
                ];

                $rooms[$newRoomId] = $room;
                $this->saveRooms($dataFile, $rooms);
                $site = $this->loadSiteData($siteDataFile);
                $site = $this->recordRoomCreateAnalytics($site, $room);
                $site['updatedAt'] = $this->nowIso();
                $this->saveSiteData($siteDataFile, $site);

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
                    }, array_filter($rooms, function (array $room): bool {
                        return ($room['visibility'] ?? 'public') === 'public';
                    }))),
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
                $room['status'] = (($room['roomType'] ?? 'match') === 'study')
                    ? ($this->getStudyKind($room) === 'branch' ? 'playing' : 'review')
                    : 'ready';
                $room['waitRequest'] = null;
                $room['version'] = (int) $room['version'] + 1;
                $room = $this->touchRoom($room);
                $rooms[$joinRoomId] = $room;
                $this->saveRooms($dataFile, $rooms);

                return $this->jsonResponse(['ok' => true, 'room' => $this->sanitizeRoom($room, true), 'playerId' => $playerId, 'side' => 'P2']);
            }

            if ($action === 'room.spectate') {
                $spectateRoomId = strtoupper((string) ($body['roomId'] ?? ''));
                $room = $this->assertRoomExists($rooms, $spectateRoomId);
                if (!empty($room['passwordHash'])) {
                    $submittedPassword = (string) ($body['password'] ?? '');
                    if ($submittedPassword === '' || !password_verify($submittedPassword, (string) $room['passwordHash'])) {
                        throw new RuntimeException('Password is incorrect');
                    }
                }

                $viewerId = $this->newPlayerId();
                $room['spectators'] = is_array($room['spectators'] ?? null) ? array_values($room['spectators']) : [];
                $room['spectators'][] = [
                    'id' => $viewerId,
                    'name' => mb_substr(trim((string) ($body['name'] ?? 'Spectator')), 0, 40),
                    'lastSeenAt' => $this->nowIso(),
                ];
                $room['version'] = (int) ($room['version'] ?? 1) + 1;
                $room = $this->touchRoom($room);
                $rooms[$spectateRoomId] = $room;
                $this->saveRooms($dataFile, $rooms);
                $site = $this->loadSiteData($siteDataFile);
                $site = $this->recordSpectatorAnalytics($site);
                $site['updatedAt'] = $this->nowIso();
                $this->saveSiteData($siteDataFile, $site);

                return $this->jsonResponse(['ok' => true, 'room' => $this->sanitizeRoom($room, true), 'viewerId' => $viewerId, 'role' => 'spectator']);
            }

            if ($action === 'room.start') {
                $startRoomId = strtoupper((string) ($body['roomId'] ?? $roomId));
                $room = $this->assertRoomExists($rooms, $startRoomId);
                $playerId = (string) ($body['playerId'] ?? '');
                $side = $this->assertPlayer($room, $playerId);
                if ($this->getOwnerPlayerId($room) !== $playerId) {
                    throw new RuntimeException('Only the host can start the match');
                }
                if (($room['roomType'] ?? 'match') === 'study') {
                    throw new RuntimeException('Study rooms do not need match start');
                }
                if (empty($room['players']['P2']['id'])) {
                    throw new RuntimeException('Another player has not joined yet');
                }
                if (($room['status'] ?? 'waiting') === 'playing') {
                    throw new RuntimeException('The match has already started');
                }

                if (random_int(0, 1) === 1) {
                    $first = $room['players']['P1'];
                    $room['players']['P1'] = $room['players']['P2'];
                    $room['players']['P2'] = $first;
                }

                $room['gameState'] = $this->activateRoomClock($room['gameState'] ?? []);
                $room['status'] = 'playing';
                $room['waitRequest'] = null;
                $room['reviewIndex'] = null;
                $room['reviewNotes'] = [];
                $room['reviewArrows'] = [];
                $room['version'] = (int) $room['version'] + 1;
                $room = $this->touchRoom($room);
                $rooms[$startRoomId] = $room;
                $this->saveRooms($dataFile, $rooms);

                return $this->jsonResponse([
                    'ok' => true,
                    'room' => $this->sanitizeRoom($room, true),
                    'side' => $this->findPlayerSide($room, $playerId),
                ]);
            }

            if ($action === 'room.get') {
                $playerId = (string) $request->query('playerId', '');
                $viewerId = (string) $request->query('viewerId', '');
                $room = $this->assertRoomExists($rooms, $roomId);
                if ($playerId !== '') {
                    $side = $this->assertPlayer($room, $playerId);
                    $room = $this->touchPlayer($room, $side);
                } elseif ($viewerId !== '') {
                    $room = $this->touchSpectator($room, $viewerId);
                } else {
                    throw new RuntimeException('Participant id is required');
                }
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
                if (($room['roomType'] ?? 'match') === 'study' && $this->getStudyKind($room) !== 'branch') {
                    throw new RuntimeException('Review study rooms do not accept turn updates');
                }
                if (($room['status'] ?? 'waiting') !== 'playing') {
                    throw new RuntimeException('The match has not started yet');
                }
                if (empty($body['gameState']) || !is_array($body['gameState'])) {
                    throw new RuntimeException('Game state is required');
                }

                $incomingState = $body['gameState'];
                $currentSide = (string) ($room['gameState']['currentPlayer'] ?? '');
                $isTimeoutUpdate = !empty($incomingState['winner']) && (string) ($incomingState['winReason'] ?? '') === '時間切れ';
                if ($currentSide !== $side) {
                    $timeoutWinner = $currentSide === 'P1' ? 'P2' : 'P1';
                    if (!$isTimeoutUpdate || (string) ($incomingState['winner'] ?? '') !== $timeoutWinner || !$this->isClockExpired($room['gameState'] ?? [], $currentSide)) {
                        throw new RuntimeException('It is not your turn');
                    }
                }

                $room['gameState'] = $incomingState;
                $room['status'] = 'playing';
                $room['waitRequest'] = null;
                $history = is_array($room['gameState']['history'] ?? null) ? array_values($room['gameState']['history']) : [];
                $room['reviewIndex'] = !empty($room['gameState']['winner']) && !empty($history) ? count($history) - 1 : null;
                if (!empty($room['gameState']['winner'])) {
                    $room['reviewNotes'] = is_array($room['reviewNotes'] ?? null) ? $room['reviewNotes'] : [];
                    $room['reviewArrows'] = is_array($room['reviewArrows'] ?? null) ? $room['reviewArrows'] : [];
                }
                if (!empty($room['gameState']['winner']) && empty($room['analyticsRecorded'])) {
                    $site = $this->loadSiteData($siteDataFile);
                    $site = $this->recordFinishedGameAnalytics($site, $room);
                    $site['updatedAt'] = $this->nowIso();
                    $this->saveSiteData($siteDataFile, $site);
                    $room['analyticsRecorded'] = true;
                }
                $room['version'] = (int) $room['version'] + 1;
                $room = $this->touchPlayer($room, $side);
                $rooms[$roomId] = $room;
                $this->saveRooms($dataFile, $rooms);

                return $this->jsonResponse(['ok' => true, 'room' => $this->sanitizeRoom($room, true)]);
            }

            if ($action === 'room.review') {
                $reviewRoomId = strtoupper((string) ($body['roomId'] ?? $roomId));
                $room = $this->assertRoomExists($rooms, $reviewRoomId);
                $playerId = (string) ($body['playerId'] ?? '');
                $side = $this->assertPlayer($room, $playerId);
                $history = is_array($room['gameState']['history'] ?? null) ? array_values($room['gameState']['history']) : [];

                if (!$this->canUseReviewTools($room)) {
                    throw new RuntimeException('Review is available only after the match ends');
                }
                if (empty($history)) {
                    throw new RuntimeException('No history is available for review');
                }

                $requestedIndex = (int) ($body['index'] ?? (count($history) - 1));
                $room['reviewIndex'] = max(0, min(count($history) - 1, $requestedIndex));
                $room['version'] = (int) $room['version'] + 1;
                $room = $this->touchPlayer($room, $side);
                $rooms[$reviewRoomId] = $room;
                $this->saveRooms($dataFile, $rooms);

                return $this->jsonResponse(['ok' => true, 'room' => $this->sanitizeRoom($room, true)]);
            }

            if ($action === 'room.review.note') {
                $reviewRoomId = strtoupper((string) ($body['roomId'] ?? $roomId));
                $room = $this->assertRoomExists($rooms, $reviewRoomId);
                $playerId = (string) ($body['playerId'] ?? '');
                $side = $this->assertPlayer($room, $playerId);
                $history = is_array($room['gameState']['history'] ?? null) ? array_values($room['gameState']['history']) : [];

                if (!$this->canUseReviewTools($room)) {
                    throw new RuntimeException('Review notes are available only after the match ends');
                }
                if (empty($history)) {
                    throw new RuntimeException('No history is available for review');
                }

                $requestedIndex = max(0, min(count($history) - 1, (int) ($body['index'] ?? 0)));
                $note = trim((string) ($body['note'] ?? ''));
                $tags = $this->sanitizeReviewNoteTags($body['tags'] ?? []);
                $reviewNotes = is_array($room['reviewNotes'] ?? null) ? $room['reviewNotes'] : [];
                if ($note === '' && empty($tags)) {
                    unset($reviewNotes[(string) $requestedIndex]);
                } else {
                    $reviewNotes[(string) $requestedIndex] = [
                        'text' => mb_substr($note, 0, 400),
                        'tags' => $tags,
                    ];
                }
                $room['reviewNotes'] = $reviewNotes;
                $room['version'] = (int) $room['version'] + 1;
                $room = $this->touchPlayer($room, $side);
                $rooms[$reviewRoomId] = $room;
                $this->saveRooms($dataFile, $rooms);

                return $this->jsonResponse(['ok' => true, 'room' => $this->sanitizeRoom($room, true)]);
            }

            if ($action === 'room.review.arrows') {
                $reviewRoomId = strtoupper((string) ($body['roomId'] ?? $roomId));
                $room = $this->assertRoomExists($rooms, $reviewRoomId);
                $playerId = (string) ($body['playerId'] ?? '');
                $side = $this->assertPlayer($room, $playerId);
                $history = is_array($room['gameState']['history'] ?? null) ? array_values($room['gameState']['history']) : [];
                $requestedIndex = max(0, min(max(count($history) - 1, 0), (int) ($body['index'] ?? 0)));
                $snapshotBoard = $history[$requestedIndex]['snapshot']['board'] ?? null;

                if (!$this->canUseReviewTools($room)) {
                    throw new RuntimeException('Review arrows are available only after the match ends');
                }
                if (empty($history) || !is_array($snapshotBoard) || empty($snapshotBoard[0]) || !is_array($snapshotBoard[0])) {
                    throw new RuntimeException('No board is available for review arrows');
                }

                $reviewArrows = is_array($room['reviewArrows'] ?? null) ? $room['reviewArrows'] : [];
                $nextArrows = $this->sanitizeReviewArrows(
                    $body['arrows'] ?? [],
                    count($snapshotBoard) - 1,
                    count($snapshotBoard[0]) - 1
                );
                if (empty($nextArrows)) {
                    unset($reviewArrows[(string) $requestedIndex]);
                } else {
                    $reviewArrows[(string) $requestedIndex] = $nextArrows;
                }
                $room['reviewArrows'] = $reviewArrows;
                $room['version'] = (int) $room['version'] + 1;
                $room = $this->touchPlayer($room, $side);
                $rooms[$reviewRoomId] = $room;
                $this->saveRooms($dataFile, $rooms);

                return $this->jsonResponse(['ok' => true, 'room' => $this->sanitizeRoom($room, true)]);
            }

            if ($action === 'room.study.meta') {
                $studyRoomId = strtoupper((string) ($body['roomId'] ?? $roomId));
                $room = $this->assertRoomExists($rooms, $studyRoomId);
                $playerId = (string) ($body['playerId'] ?? '');
                $side = $this->assertPlayer($room, $playerId);
                if (($room['roomType'] ?? 'match') !== 'study') {
                    throw new RuntimeException('Only study rooms can save study metadata');
                }

                $nextName = trim((string) ($body['roomName'] ?? ''));
                $room['name'] = $nextName !== '' ? mb_substr($nextName, 0, 40) : (string) ($room['name'] ?? ('Study Room ' . $studyRoomId));
                $room['studyComment'] = mb_substr(trim((string) ($body['studyComment'] ?? '')), 0, 600);
                $room['version'] = (int) ($room['version'] ?? 1) + 1;
                $room = $this->touchPlayer($room, $side);
                $rooms[$studyRoomId] = $room;
                $this->saveRooms($dataFile, $rooms);

                return $this->jsonResponse(['ok' => true, 'room' => $this->sanitizeRoom($room, true)]);
            }

            if ($action === 'room.leave') {
                $leaveRoomId = strtoupper((string) ($body['roomId'] ?? $roomId));
                $room = $this->assertRoomExists($rooms, $leaveRoomId);
                $playerId = (string) ($body['playerId'] ?? '');
                $viewerId = (string) ($body['viewerId'] ?? '');
                if ($viewerId !== '') {
                    $spectators = is_array($room['spectators'] ?? null) ? array_values($room['spectators']) : [];
                    $nextSpectators = array_values(array_filter($spectators, function (array $spectator) use ($viewerId): bool {
                        return (string) ($spectator['id'] ?? '') !== $viewerId;
                    }));
                    if (count($nextSpectators) === count($spectators)) {
                        throw new RuntimeException('Viewer is not in this room');
                    }
                    $room['spectators'] = $nextSpectators;
                    $room['version'] = (int) ($room['version'] ?? 1) + 1;
                    $room = $this->touchRoom($room);
                    $rooms[$leaveRoomId] = $room;
                    $this->saveRooms($dataFile, $rooms);

                    return $this->jsonResponse(['ok' => true, 'message' => 'Stopped spectating.', 'room' => $this->sanitizeRoom($room, true)]);
                }
                $side = $this->assertPlayer($room, $playerId);
                $hasStarted = ((int) ($room['gameState']['turnNumber'] ?? 1) > 1) || !empty($room['gameState']['actionLog']);

                if ($this->getOwnerPlayerId($room) === $playerId) {
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
                $room['status'] = (($room['roomType'] ?? 'match') === 'study' && $this->getStudyKind($room) !== 'branch')
                    ? 'review'
                    : 'waiting';
                $room['waitRequest'] = null;
                if (($room['roomType'] ?? 'match') === 'study' && $this->getStudyKind($room) !== 'branch') {
                    $history = is_array($room['gameState']['history'] ?? null) ? array_values($room['gameState']['history']) : [];
                    $room['reviewIndex'] = !empty($history) ? count($history) - 1 : 0;
                } else {
                    $room['reviewIndex'] = null;
                    $room['reviewNotes'] = [];
                    $room['reviewArrows'] = [];
                }
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
                if ($this->getOwnerPlayerId($room) !== $playerId) {
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
                if ($this->buildWaitRestoredState($room['gameState'], $side) === null) {
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
                    $restored = $this->buildWaitRestoredState($room['gameState'] ?? [], (string) ($request['requestedBy'] ?? ''));
                    if ($restored === null) {
                        throw new RuntimeException('No turn is available to undo');
                    }
                    $room['gameState'] = $restored;
                }

                $room['waitRequest'] = null;
                $room['reviewIndex'] = null;
                $room['reviewNotes'] = [];
                $room['reviewArrows'] = [];
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

    private function loadSiteData(string $dataFile): array
    {
        $default = [
            'accessCount' => 0,
            'dailyAccess' => [],
            'feedback' => [],
            'analytics' => [
                'roomsCreated' => 0,
                'matchesCreated' => 0,
                'studyRoomsCreated' => 0,
                'branchRoomsCreated' => 0,
                'spectatorsJoined' => 0,
                'finishedGames' => 0,
                'ruleModes' => [],
                'winReasons' => [],
                'fragmentUsage' => [],
                'pieceUsage' => [],
            ],
            'updatedAt' => $this->nowIso(),
        ];
        if (!file_exists($dataFile)) {
            return $default;
        }

        $raw = file_get_contents($dataFile);
        if ($raw === false || trim($raw) === '') {
            return $default;
        }

        $decoded = json_decode($raw, true);
        if (!is_array($decoded)) {
            return $default;
        }

        $decoded['accessCount'] = (int) ($decoded['accessCount'] ?? 0);
        $decoded['dailyAccess'] = is_array($decoded['dailyAccess'] ?? null) ? $decoded['dailyAccess'] : [];
        $decoded['feedback'] = is_array($decoded['feedback'] ?? null) ? $decoded['feedback'] : [];
        $decoded['analytics'] = is_array($decoded['analytics'] ?? null) ? $decoded['analytics'] : $default['analytics'];
        $decoded['updatedAt'] = (string) ($decoded['updatedAt'] ?? $default['updatedAt']);

        return $decoded;
    }

    private function saveSiteData(string $dataFile, array $site): void
    {
        $dir = dirname($dataFile);
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }

        file_put_contents(
            $dataFile,
            json_encode($site, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT),
            LOCK_EX
        );
    }

    private function sanitizeSiteStats(array $site): array
    {
        $today = $this->siteDateKey();
        $yesterday = $this->siteDateKey('-1 day');
        $dailyAccess = is_array($site['dailyAccess'] ?? null) ? $site['dailyAccess'] : [];

        return [
            'accessCount' => (int) ($site['accessCount'] ?? 0),
            'todayAccess' => (int) ($dailyAccess[$today] ?? 0),
            'yesterdayAccess' => (int) ($dailyAccess[$yesterday] ?? 0),
            'analytics' => is_array($site['analytics'] ?? null) ? $site['analytics'] : [],
            'updatedAt' => (string) ($site['updatedAt'] ?? ''),
        ];
    }

    private function siteDateKey(string $modify = 'now'): string
    {
        $date = new \DateTimeImmutable($modify, new \DateTimeZone('Asia/Tokyo'));
        return $date->format('Y-m-d');
    }

    private function sanitizeFeedbackList(array $site): array
    {
        $feedback = is_array($site['feedback'] ?? null) ? $site['feedback'] : [];
        $feedback = array_slice($feedback, -30);
        $feedback = array_reverse($feedback);

        return array_values(array_map(function (array $item): array {
            return [
                'id' => (string) ($item['id'] ?? ''),
                'message' => mb_substr((string) ($item['message'] ?? ''), 0, 400),
                'createdAt' => (string) ($item['createdAt'] ?? ''),
            ];
        }, $feedback));
    }

    private function isValidSelfplayPayload(mixed $payload): bool
    {
        if (!is_array($payload)) {
            return false;
        }

        return is_array($payload['games'] ?? null)
            || is_array($payload['summary'] ?? null)
            || is_array($payload['meta'] ?? null);
    }

    private function selfplayIndexFile(string $dir): string
    {
        return $dir . DIRECTORY_SEPARATOR . 'index.json';
    }

    private function ensureSelfplayDir(string $dir): void
    {
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }
    }

    private function loadSelfplayIndex(string $dir): array
    {
        $indexFile = $this->selfplayIndexFile($dir);
        if (!file_exists($indexFile)) {
            return [];
        }

        $raw = file_get_contents($indexFile);
        if ($raw === false || trim($raw) === '') {
            return [];
        }

        $decoded = json_decode($raw, true);
        return is_array($decoded) ? array_values(array_filter($decoded, 'is_array')) : [];
    }

    private function saveSelfplayIndex(string $dir, array $entries): void
    {
        $this->ensureSelfplayDir($dir);
        file_put_contents(
            $this->selfplayIndexFile($dir),
            json_encode(array_values($entries), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT),
            LOCK_EX
        );
    }

    private function saveSelfplayPayload(string $dir, array $payload, array $options = []): array
    {
        $this->ensureSelfplayDir($dir);
        $id = gmdate('Ymd-His') . '-' . bin2hex(random_bytes(4));
        $file = $id . '.json';
        $path = $dir . DIRECTORY_SEPARATOR . $file;
        $payload['savedAt'] = $payload['savedAt'] ?? $this->nowIso();

        $encoded = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        if ($encoded === false) {
            throw new RuntimeException('Failed to encode self-play payload');
        }
        file_put_contents($path, $encoded, LOCK_EX);

        $entry = $this->buildSelfplayEntry($id, $file, $payload, $options);
        $entries = $this->loadSelfplayIndex($dir);
        $entries[] = $entry;
        $this->saveSelfplayIndex($dir, $entries);

        return $entry;
    }

    private function loadSelfplayPayload(string $dir, string $id): array
    {
        $index = $this->loadSelfplayIndex($dir);
        $entry = null;
        foreach ($index as $item) {
            if (($item['id'] ?? '') === $id) {
                $entry = $item;
                break;
            }
        }
        if (!$entry) {
            throw new RuntimeException('Self-play kifu not found');
        }

        $file = basename((string) ($entry['file'] ?? ($id . '.json')));
        $path = $dir . DIRECTORY_SEPARATOR . $file;
        if (!file_exists($path)) {
            throw new RuntimeException('Self-play kifu file not found');
        }

        $raw = file_get_contents($path);
        $decoded = $raw !== false ? json_decode($raw, true) : null;
        if (!is_array($decoded)) {
            throw new RuntimeException('Self-play kifu file is broken');
        }

        return $decoded;
    }

    private function buildSelfplayEntry(string $id, string $file, array $payload, array $options): array
    {
        $meta = is_array($payload['meta'] ?? null) ? $payload['meta'] : [];
        if (!$meta && is_array($payload['options'] ?? null)) {
            $meta = $payload['options'];
        }
        $summary = is_array($payload['summary'] ?? null) ? $payload['summary'] : [];
        $wins = is_array($summary['wins'] ?? null) ? $summary['wins'] : [];
        $games = is_array($payload['games'] ?? null) ? count($payload['games']) : (int) ($summary['games'] ?? 0);
        $label = trim((string) ($options['label'] ?? ''));

        return [
            'id' => $id,
            'file' => $file,
            'label' => $label !== '' ? mb_substr($label, 0, 80) : 'Self-play ' . $id,
            'source' => mb_substr(trim((string) ($options['source'] ?? 'browser-worker')), 0, 40),
            'note' => mb_substr(trim((string) ($options['note'] ?? '')), 0, 300),
            'createdAt' => $this->nowIso(),
            'games' => $games,
            'mode' => (string) ($meta['mode'] ?? ''),
            'seed' => (int) ($meta['seed'] ?? 0),
            'maxPlies' => (int) ($meta['maxPlies'] ?? 0),
            'lookaheadDepth' => (int) ($meta['lookaheadDepth'] ?? 0),
            'strategyProfile' => (string) ($meta['strategyProfile'] ?? ''),
            'wins' => [
                'P1' => (int) ($wins['P1'] ?? 0),
                'P2' => (int) ($wins['P2'] ?? 0),
                'draw' => (int) ($wins['draw'] ?? 0),
            ],
        ];
    }

    private function sanitizeSelfplayEntries(array $entries): array
    {
        usort($entries, function (array $a, array $b): int {
            return strcmp((string) ($b['createdAt'] ?? ''), (string) ($a['createdAt'] ?? ''));
        });

        return array_values(array_map(function (array $entry): array {
            return $this->sanitizeSelfplayEntry($entry);
        }, $entries));
    }

    private function sanitizeSelfplayEntry(array $entry): array
    {
        $wins = is_array($entry['wins'] ?? null) ? $entry['wins'] : [];

        return [
            'id' => (string) ($entry['id'] ?? ''),
            'label' => mb_substr((string) ($entry['label'] ?? ''), 0, 80),
            'source' => mb_substr((string) ($entry['source'] ?? ''), 0, 40),
            'note' => mb_substr((string) ($entry['note'] ?? ''), 0, 300),
            'createdAt' => (string) ($entry['createdAt'] ?? ''),
            'games' => (int) ($entry['games'] ?? 0),
            'mode' => (string) ($entry['mode'] ?? ''),
            'seed' => (int) ($entry['seed'] ?? 0),
            'maxPlies' => (int) ($entry['maxPlies'] ?? 0),
            'lookaheadDepth' => (int) ($entry['lookaheadDepth'] ?? 0),
            'strategyProfile' => (string) ($entry['strategyProfile'] ?? ''),
            'wins' => [
                'P1' => (int) ($wins['P1'] ?? 0),
                'P2' => (int) ($wins['P2'] ?? 0),
                'draw' => (int) ($wins['draw'] ?? 0),
            ],
        ];
    }

    private function sanitizeSelfplayId(string $id): string
    {
        $id = trim($id);
        return preg_match('/^[A-Za-z0-9_-]{8,80}$/', $id) ? $id : '';
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

    private function findPlayerSide(array $room, string $playerId): ?string
    {
        foreach (['P1', 'P2'] as $side) {
            if (($room['players'][$side]['id'] ?? null) === $playerId) {
                return $side;
            }
        }

        return null;
    }

    private function sanitizeVisibility(mixed $rawVisibility): string
    {
        $visibility = trim((string) $rawVisibility);
        if ($visibility === 'invite' || $visibility === 'private') {
            return $visibility;
        }
        return 'public';
    }

    private function touchSpectator(array $room, string $viewerId): array
    {
        $spectators = is_array($room['spectators'] ?? null) ? array_values($room['spectators']) : [];
        $found = false;
        foreach ($spectators as $index => $spectator) {
            if ((string) ($spectator['id'] ?? '') === $viewerId) {
                $spectators[$index]['lastSeenAt'] = $this->nowIso();
                $found = true;
                break;
            }
        }
        if (!$found) {
            throw new RuntimeException('Viewer is not in this room');
        }
        $room['spectators'] = $spectators;
        return $this->touchRoom($room);
    }

    private function getOwnerPlayerId(array $room): ?string
    {
        $ownerPlayerId = $room['ownerPlayerId'] ?? ($room['players']['P1']['id'] ?? null);
        return is_string($ownerPlayerId) && $ownerPlayerId !== '' ? $ownerPlayerId : null;
    }

    private function getStudyKind(array $room): string
    {
        if (($room['roomType'] ?? 'match') !== 'study') {
            return 'match';
        }

        return (($room['studyKind'] ?? 'review') === 'branch') ? 'branch' : 'review';
    }

    private function canUseReviewTools(array $room): bool
    {
        return (($room['roomType'] ?? 'match') === 'study' && $this->getStudyKind($room) === 'review')
            || !empty($room['gameState']['winner']);
    }

    private function sanitizeStudyOrigin(mixed $rawOrigin): ?array
    {
        if (!is_array($rawOrigin)) {
            return null;
        }

        $playerNames = is_array($rawOrigin['playerNames'] ?? null) ? $rawOrigin['playerNames'] : [];
        $originTrail = $this->sanitizeStudyTrail($rawOrigin['originTrail'] ?? []);

        return [
            'sourceType' => mb_substr(trim((string) ($rawOrigin['sourceType'] ?? 'replay')), 0, 24),
            'roomId' => mb_substr(trim((string) ($rawOrigin['roomId'] ?? '')), 0, 16),
            'roomName' => mb_substr(trim((string) ($rawOrigin['roomName'] ?? '')), 0, 80),
            'archiveTitle' => mb_substr(trim((string) ($rawOrigin['archiveTitle'] ?? '')), 0, 80),
            'stepLabel' => mb_substr(trim((string) ($rawOrigin['stepLabel'] ?? '')), 0, 24),
            'originTrail' => $originTrail,
            'playerNames' => [
                'P1' => mb_substr(trim((string) ($playerNames['P1'] ?? '')), 0, 40),
                'P2' => mb_substr(trim((string) ($playerNames['P2'] ?? '')), 0, 40),
            ],
        ];
    }

    private function sanitizeStudyTrail(mixed $rawTrail): array
    {
        if (!is_array($rawTrail)) {
            return [];
        }

        $trail = [];
        foreach (array_slice(array_values($rawTrail), 0, 8) as $entry) {
            if (!is_array($entry)) {
                continue;
            }
            $playerNames = is_array($entry['playerNames'] ?? null) ? $entry['playerNames'] : [];
            $trail[] = [
                'sourceType' => mb_substr(trim((string) ($entry['sourceType'] ?? 'replay')), 0, 24),
                'roomId' => mb_substr(trim((string) ($entry['roomId'] ?? '')), 0, 16),
                'roomName' => mb_substr(trim((string) ($entry['roomName'] ?? '')), 0, 80),
                'archiveTitle' => mb_substr(trim((string) ($entry['archiveTitle'] ?? '')), 0, 80),
                'stepLabel' => mb_substr(trim((string) ($entry['stepLabel'] ?? '')), 0, 24),
                'playerNames' => [
                    'P1' => mb_substr(trim((string) ($playerNames['P1'] ?? '')), 0, 40),
                    'P2' => mb_substr(trim((string) ($playerNames['P2'] ?? '')), 0, 40),
                ],
            ];
        }

        return $trail;
    }

    private function sanitizeStudyReference(mixed $rawReference): ?array
    {
        if (!is_array($rawReference)) {
            return null;
        }

        $history = [];
        $rawHistory = is_array($rawReference['history'] ?? null) ? array_values($rawReference['history']) : [];
        foreach (array_slice($rawHistory, 0, 40) as $index => $entry) {
            if (!is_array($entry) || !is_array($entry['snapshot'] ?? null)) {
                continue;
            }
            $history[] = [
                'turnNumber' => (int) ($entry['turnNumber'] ?? $index),
                'currentPlayer' => (string) ($entry['currentPlayer'] ?? 'P1'),
                'label' => mb_substr(trim((string) ($entry['label'] ?? '')), 0, 80),
                'snapshot' => $entry['snapshot'],
            ];
        }

        if (empty($history)) {
            return null;
        }

        return [
            'title' => mb_substr(trim((string) ($rawReference['title'] ?? 'Replay')), 0, 80),
            'stepLabel' => mb_substr(trim((string) ($rawReference['stepLabel'] ?? '')), 0, 24),
            'history' => $history,
        ];
    }

    private function sanitizeReviewNoteTags(mixed $rawTags): array
    {
        $allowed = ['good', 'question', 'danger', 'win', 'idea'];
        if (!is_array($rawTags)) {
            return [];
        }

        $tags = [];
        foreach (array_slice(array_values($rawTags), 0, 4) as $tag) {
            $tag = trim((string) $tag);
            if ($tag !== '' && in_array($tag, $allowed, true) && !in_array($tag, $tags, true)) {
                $tags[] = $tag;
            }
        }

        return $tags;
    }

    private function sanitizeReviewNotes(mixed $rawNotes): array
    {
        if (!is_array($rawNotes)) {
            return [];
        }

        $notes = [];
        foreach ($rawNotes as $index => $entry) {
            if (is_array($entry)) {
                $text = mb_substr(trim((string) ($entry['text'] ?? '')), 0, 400);
                $tags = $this->sanitizeReviewNoteTags($entry['tags'] ?? []);
            } else {
                $text = mb_substr(trim((string) $entry), 0, 400);
                $tags = [];
            }
            if ($text === '' && empty($tags)) {
                continue;
            }
            $notes[(string) $index] = [
                'text' => $text,
                'tags' => $tags,
            ];
        }

        return $notes;
    }

    private function sanitizeSpectators(mixed $rawSpectators): array
    {
        if (!is_array($rawSpectators)) {
            return [];
        }

        return array_values(array_map(function (array $spectator): array {
            return [
                'id' => (string) ($spectator['id'] ?? ''),
                'name' => mb_substr((string) ($spectator['name'] ?? 'Spectator'), 0, 40),
                'lastSeenAt' => (string) ($spectator['lastSeenAt'] ?? ''),
            ];
        }, array_filter($rawSpectators, function ($entry): bool {
            return is_array($entry) && (string) ($entry['id'] ?? '') !== '';
        })));
    }

    private function getRoomPreviewSnapshot(array $room): ?array
    {
        if (($room['roomType'] ?? 'match') === 'study' && $this->getStudyKind($room) !== 'branch') {
            $history = is_array($room['gameState']['history'] ?? null) ? array_values($room['gameState']['history']) : [];
            $reviewIndex = max(0, min(max(count($history) - 1, 0), (int) ($room['reviewIndex'] ?? (count($history) - 1))));
            $snapshot = $history[$reviewIndex]['snapshot'] ?? null;
            return is_array($snapshot) ? $snapshot : null;
        }

        return is_array($room['gameState'] ?? null) ? ($room['gameState'] ?? null) : null;
    }

    private function activateRoomClock(array $gameState): array
    {
        if (!is_array($gameState['clock'] ?? null)) {
            return $gameState;
        }

        $clock = $gameState['clock'];
        $initialSeconds = (int) ($clock['initialSeconds'] ?? 0);
        if ($initialSeconds <= 0) {
            $clock['activeSince'] = null;
            $clock['activePlayer'] = null;
            $gameState['clock'] = $clock;
            return $gameState;
        }

        $remaining = is_array($clock['remaining'] ?? null) ? $clock['remaining'] : [];
        $remaining['P1'] = max(0, (int) ($remaining['P1'] ?? $initialSeconds));
        $remaining['P2'] = max(0, (int) ($remaining['P2'] ?? $initialSeconds));
        $clock['remaining'] = $remaining;
        $clock['activeSince'] = (int) floor(microtime(true) * 1000);
        $clock['activePlayer'] = in_array((string) ($gameState['currentPlayer'] ?? ''), ['P1', 'P2'], true)
            ? (string) $gameState['currentPlayer']
            : 'P1';
        $gameState['clock'] = $clock;

        return $gameState;
    }

    private function isClockExpired(array $gameState, string $player): bool
    {
        if (!in_array($player, ['P1', 'P2'], true) || !is_array($gameState['clock'] ?? null)) {
            return false;
        }

        $clock = $gameState['clock'];
        $initialSeconds = (int) ($clock['initialSeconds'] ?? 0);
        if ($initialSeconds <= 0) {
            return false;
        }

        $remainingSet = is_array($clock['remaining'] ?? null) ? $clock['remaining'] : [];
        $remaining = max(0, (int) ($remainingSet[$player] ?? $initialSeconds));
        $activeSince = (int) ($clock['activeSince'] ?? 0);
        $activePlayer = (string) ($clock['activePlayer'] ?? ($activeSince > 0 ? ($gameState['currentPlayer'] ?? '') : ''));
        if ((string) ($gameState['currentPlayer'] ?? '') === $player && $activePlayer === $player && $activeSince > 0) {
            $elapsed = max(0, (int) floor(((microtime(true) * 1000) - $activeSince) / 1000));
            $remaining = max(0, $remaining - $elapsed);
        }

        return $remaining <= 0;
    }

    private function bumpCounter(array &$bucket, string $key, int $delta = 1): void
    {
        $bucket[$key] = (int) ($bucket[$key] ?? 0) + $delta;
    }

    private function recordRoomCreateAnalytics(array $site, array $room): array
    {
        $analytics = is_array($site['analytics'] ?? null) ? $site['analytics'] : [];
        $analytics['roomsCreated'] = (int) ($analytics['roomsCreated'] ?? 0) + 1;
        if (($room['roomType'] ?? 'match') === 'study') {
            $analytics['studyRoomsCreated'] = (int) ($analytics['studyRoomsCreated'] ?? 0) + 1;
            if ($this->getStudyKind($room) === 'branch') {
                $analytics['branchRoomsCreated'] = (int) ($analytics['branchRoomsCreated'] ?? 0) + 1;
            }
        } else {
            $analytics['matchesCreated'] = (int) ($analytics['matchesCreated'] ?? 0) + 1;
        }
        $ruleModes = is_array($analytics['ruleModes'] ?? null) ? $analytics['ruleModes'] : [];
        $this->bumpCounter($ruleModes, (string) ($room['gameState']['ruleMode'] ?? 'original'));
        $analytics['ruleModes'] = $ruleModes;
        $site['analytics'] = $analytics;
        return $site;
    }

    private function recordSpectatorAnalytics(array $site): array
    {
        $analytics = is_array($site['analytics'] ?? null) ? $site['analytics'] : [];
        $analytics['spectatorsJoined'] = (int) ($analytics['spectatorsJoined'] ?? 0) + 1;
        $site['analytics'] = $analytics;
        return $site;
    }

    private function recordFinishedGameAnalytics(array $site, array $room): array
    {
        $analytics = is_array($site['analytics'] ?? null) ? $site['analytics'] : [];
        $analytics['finishedGames'] = (int) ($analytics['finishedGames'] ?? 0) + 1;

        $winReasons = is_array($analytics['winReasons'] ?? null) ? $analytics['winReasons'] : [];
        $this->bumpCounter($winReasons, (string) (($room['gameState']['winReason'] ?? 'unknown') ?: 'unknown'));
        $analytics['winReasons'] = $winReasons;

        $ruleModes = is_array($analytics['ruleModes'] ?? null) ? $analytics['ruleModes'] : [];
        $this->bumpCounter($ruleModes, (string) ($room['gameState']['ruleMode'] ?? 'original'));
        $analytics['ruleModes'] = $ruleModes;

        $fragmentUsage = is_array($analytics['fragmentUsage'] ?? null) ? $analytics['fragmentUsage'] : [];
        $pieceUsage = is_array($analytics['pieceUsage'] ?? null) ? $analytics['pieceUsage'] : [];
        $placements = is_array($room['gameState']['placements'] ?? null) ? $room['gameState']['placements'] : [];
        foreach ($placements as $placement) {
            if (!is_array($placement)) {
                continue;
            }
            $card = is_array($placement['card'] ?? null) ? $placement['card'] : [];
            $fragmentType = trim((string) ($card['fragmentType'] ?? ''));
            $pieceType = trim((string) ($card['pieceType'] ?? ''));
            if ($fragmentType !== '') {
                $this->bumpCounter($fragmentUsage, $fragmentType);
            }
            if ($pieceType !== '') {
                $this->bumpCounter($pieceUsage, $pieceType);
            }
        }
        $analytics['fragmentUsage'] = $fragmentUsage;
        $analytics['pieceUsage'] = $pieceUsage;
        $site['analytics'] = $analytics;
        return $site;
    }

    private function sanitizeReviewArrows(mixed $rawArrows, int $maxRow, int $maxCol): array
    {
        if (!is_array($rawArrows)) {
            return [];
        }

        $clean = [];
        $seen = [];
        foreach (array_slice(array_values($rawArrows), 0, 12) as $arrow) {
            if (!is_array($arrow)) {
                continue;
            }
            $from = is_array($arrow['from'] ?? null) ? $arrow['from'] : null;
            $to = is_array($arrow['to'] ?? null) ? $arrow['to'] : null;
            if ($from === null || $to === null) {
                continue;
            }
            $fromRow = (int) ($from['row'] ?? -1);
            $fromCol = (int) ($from['col'] ?? -1);
            $toRow = (int) ($to['row'] ?? -1);
            $toCol = (int) ($to['col'] ?? -1);
            if (
                $fromRow < 0 || $fromRow > $maxRow ||
                $toRow < 0 || $toRow > $maxRow ||
                $fromCol < 0 || $fromCol > $maxCol ||
                $toCol < 0 || $toCol > $maxCol ||
                ($fromRow === $toRow && $fromCol === $toCol)
            ) {
                continue;
            }
            $signature = $fromRow . ':' . $fromCol . '>' . $toRow . ':' . $toCol;
            if (isset($seen[$signature])) {
                continue;
            }
            $seen[$signature] = true;
            $clean[] = [
                'from' => ['row' => $fromRow, 'col' => $fromCol],
                'to' => ['row' => $toRow, 'col' => $toCol],
            ];
        }

        return $clean;
    }

    private function roomSummary(array $room): array
    {
        $updatedAt = (string) ($room['updatedAt'] ?? $this->nowIso());
        $updatedTs = strtotime($updatedAt) ?: time();
        $ttl = $this->isRoomWaiting($room) ? self::WAITING_ROOM_TTL : self::ROOM_TTL;

        return [
            'id' => (string) ($room['id'] ?? ''),
            'roomType' => (string) ($room['roomType'] ?? 'match'),
            'visibility' => $this->sanitizeVisibility($room['visibility'] ?? 'public'),
            'studyKind' => $this->getStudyKind($room),
            'name' => (string) ($room['name'] ?? ('Room ' . ($room['id'] ?? ''))),
            'status' => (string) ($room['status'] ?? 'waiting'),
            'ruleMode' => (string) ($room['gameState']['ruleMode'] ?? 'original'),
            'timeControl' => (string) ($room['gameState']['clock']['timeControl'] ?? 'none'),
            'hostName' => (string) ($room['players']['P1']['name'] ?? 'Player 1'),
            'guestName' => (string) ($room['players']['P2']['name'] ?? 'Waiting'),
            'hasPassword' => !empty($room['hasPassword']),
            'isFull' => !empty($room['players']['P2']['id']),
            'spectatorCount' => count($this->sanitizeSpectators($room['spectators'] ?? [])),
            'studyOrigin' => $this->sanitizeStudyOrigin($room['studyOrigin'] ?? null),
            'studyComment' => mb_substr((string) ($room['studyComment'] ?? ''), 0, 160),
            'previewSnapshot' => $this->getRoomPreviewSnapshot($room),
            'updatedAt' => $updatedAt,
            'expiresAt' => gmdate('c', $updatedTs + $ttl),
        ];
    }

    private function sanitizeRoom(array $room, bool $includeGameState = false): array
    {
        $payload = [
            'id' => (string) ($room['id'] ?? ''),
            'roomType' => (string) ($room['roomType'] ?? 'match'),
            'visibility' => $this->sanitizeVisibility($room['visibility'] ?? 'public'),
            'studyKind' => $this->getStudyKind($room),
            'name' => (string) ($room['name'] ?? ('Room ' . ($room['id'] ?? ''))),
            'hasPassword' => !empty($room['hasPassword']),
            'version' => (int) ($room['version'] ?? 1),
            'createdAt' => (string) ($room['createdAt'] ?? $this->nowIso()),
            'updatedAt' => (string) ($room['updatedAt'] ?? $this->nowIso()),
            'status' => (string) ($room['status'] ?? 'waiting'),
            'ownerPlayerId' => (string) ($this->getOwnerPlayerId($room) ?? ''),
            'players' => $room['players'] ?? [],
            'spectators' => $this->sanitizeSpectators($room['spectators'] ?? []),
            'waitRequest' => $room['waitRequest'] ?? null,
            'reviewIndex' => isset($room['reviewIndex']) ? (int) $room['reviewIndex'] : null,
            'reviewNotes' => $this->sanitizeReviewNotes($room['reviewNotes'] ?? null),
            'reviewArrows' => is_array($room['reviewArrows'] ?? null) ? $room['reviewArrows'] : [],
            'studyOrigin' => $this->sanitizeStudyOrigin($room['studyOrigin'] ?? null),
            'studyReference' => $this->sanitizeStudyReference($room['studyReference'] ?? null),
            'studyComment' => (string) ($room['studyComment'] ?? ''),
        ];
        if ($includeGameState) {
            $payload['gameState'] = $room['gameState'] ?? [];
        }
        return $payload;
    }

    private function getWaitRestoreHistoryIndex(array $history, string $currentPlayer): int
    {
        $count = count($history);
        if ($count <= 1) {
            return -1;
        }

        for ($index = $count - 2; $index >= 0; $index--) {
            if ((string) ($history[$index]['currentPlayer'] ?? '') === $currentPlayer) {
                return $index;
            }
        }

        return $count - 2;
    }

    private function buildWaitRestoredState(array $gameState, string $currentPlayer): ?array
    {
        $history = is_array($gameState['history'] ?? null) ? array_values($gameState['history']) : [];
        $targetIndex = $this->getWaitRestoreHistoryIndex($history, $currentPlayer);
        $snapshot = $targetIndex >= 0 ? ($history[$targetIndex]['snapshot'] ?? null) : null;

        if (!is_array($snapshot)) {
            return null;
        }

        $restored = $snapshot;
        $restored['history'] = array_slice($history, 0, $targetIndex + 1);

        return $restored;
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
