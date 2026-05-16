<?php

namespace Tests\Feature;

use Tests\TestCase;

class RoomApiTest extends TestCase
{
    private string $roomsFile;
    private string $siteFile;
    private string $npcBookDir;
    /** @var array<string, array{exists: bool, contents: string|null}> */
    private array $fileBackups = [];
    /** @var array<string, array{exists: bool, files: array<string, string>}> */
    private array $directoryBackups = [];

    protected function setUp(): void
    {
        parent::setUp();

        $this->roomsFile = storage_path('app/private/rooms.json');
        $this->siteFile = storage_path('app/private/site.json');
        $this->npcBookDir = storage_path('app/private/npc-book');

        $this->backupStorageFile($this->roomsFile);
        $this->backupStorageFile($this->siteFile);
        $this->backupStorageDirectory($this->npcBookDir);
        $this->resetStorageSandbox();
    }

    protected function tearDown(): void
    {
        $this->restoreStorageFile($this->roomsFile);
        $this->restoreStorageFile($this->siteFile);
        $this->restoreStorageDirectory($this->npcBookDir);

        parent::tearDown();
    }

    public function test_public_match_room_appears_in_room_list(): void
    {
        $createResponse = $this->api('room.create', [
            'name' => 'Host',
            'roomName' => '',
            'visibility' => 'public',
            'gameState' => $this->baseGameState(),
        ]);

        $createResponse->assertOk()
            ->assertJsonPath('ok', true);

        $roomId = (string) $createResponse->json('room.id');

        $listResponse = $this->api('room.list');

        $listResponse->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonCount(1, 'rooms')
            ->assertJsonPath('rooms.0.id', $roomId)
            ->assertJsonPath('rooms.0.name', 'Room ' . $roomId)
            ->assertJsonPath('rooms.0.visibility', 'public');
    }

    public function test_study_room_defaults_to_invite_and_stays_out_of_public_list(): void
    {
        $studyCreate = $this->api('room.create', [
            'name' => 'Analyst',
            'roomType' => 'study',
            'studyKind' => 'review',
            'roomName' => '検討室',
            'gameState' => $this->finishedGameState(),
        ]);

        $studyCreate->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('room.visibility', 'invite')
            ->assertJsonPath('room.roomType', 'study')
            ->assertJsonPath('room.studyKind', 'review');

        $this->api('room.create', [
            'name' => 'Host',
            'roomName' => '公開対局室',
            'visibility' => 'public',
            'gameState' => $this->baseGameState(),
        ])->assertOk();

        $listResponse = $this->api('room.list');

        $listResponse->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonCount(1, 'rooms')
            ->assertJsonPath('rooms.0.roomType', 'match')
            ->assertJsonMissing([
                'name' => '検討室',
            ]);
    }

    public function test_guest_can_join_and_spectator_can_enter_and_leave(): void
    {
        $createResponse = $this->api('room.create', [
            'name' => 'Host',
            'roomName' => '観戦確認室',
            'visibility' => 'public',
            'gameState' => $this->baseGameState(),
        ]);

        $roomId = (string) $createResponse->json('room.id');

        $joinResponse = $this->api('room.join', [
            'roomId' => $roomId,
            'name' => 'Guest',
        ]);

        $joinResponse->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('side', 'P2')
            ->assertJsonPath('room.status', 'ready')
            ->assertJsonPath('room.players.P2.name', 'Guest');

        $spectateResponse = $this->api('room.spectate', [
            'roomId' => $roomId,
            'name' => 'Viewer',
        ]);

        $spectateResponse->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('role', 'spectator')
            ->assertJsonCount(1, 'room.spectators')
            ->assertJsonPath('room.spectators.0.name', 'Viewer');

        $viewerId = (string) $spectateResponse->json('viewerId');

        $leaveResponse = $this->api('room.leave', [
            'roomId' => $roomId,
            'viewerId' => $viewerId,
        ]);

        $leaveResponse->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('message', 'Stopped spectating.')
            ->assertJsonCount(0, 'room.spectators');
    }

    public function test_finished_match_supports_review_notes_and_arrows(): void
    {
        $createResponse = $this->api('room.create', [
            'name' => 'Host',
            'roomName' => '感想戦テスト',
            'visibility' => 'public',
            'gameState' => $this->finishedGameState(),
        ]);

        $roomId = (string) $createResponse->json('room.id');
        $playerId = (string) $createResponse->json('playerId');

        $noteResponse = $this->api('room.review.note', [
            'roomId' => $roomId,
            'playerId' => $playerId,
            'index' => 1,
            'note' => 'ここは勝ち筋の確認局面',
            'tags' => ['win', 'idea'],
        ]);

        $noteResponse->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('room.reviewNotes.1.text', 'ここは勝ち筋の確認局面')
            ->assertJsonPath('room.reviewNotes.1.tags.0', 'win')
            ->assertJsonPath('room.reviewNotes.1.tags.1', 'idea');

        $arrowResponse = $this->api('room.review.arrows', [
            'roomId' => $roomId,
            'playerId' => $playerId,
            'index' => 1,
            'arrows' => [
                [
                    'from' => ['row' => 0, 'col' => 0],
                    'to' => ['row' => 0, 'col' => 1],
                ],
            ],
        ]);

        $arrowResponse->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('room.reviewArrows.1.0.from.row', 0)
            ->assertJsonPath('room.reviewArrows.1.0.to.col', 1);
    }

    public function test_branch_study_room_accepts_turn_updates_but_review_study_room_rejects_them(): void
    {
        $branchCreate = $this->api('room.create', [
            'name' => 'Analyst',
            'roomType' => 'study',
            'studyKind' => 'branch',
            'roomName' => '分岐検討室',
            'gameState' => $this->baseGameState(),
        ]);

        $branchRoomId = (string) $branchCreate->json('room.id');
        $branchPlayerId = (string) $branchCreate->json('playerId');

        $branchJoin = $this->api('room.join', [
            'roomId' => $branchRoomId,
            'name' => 'Partner',
        ]);

        $branchJoin->assertOk()
            ->assertJsonPath('room.status', 'playing');

        $branchVersion = (int) $branchJoin->json('room.version');
        $nextBranchState = $this->baseGameState([
            'turnNumber' => 2,
            'currentPlayer' => 'P2',
            'actionLog' => ['P1 moved'],
            'history' => [
                $this->historyEntry('開始局面', $this->snapshotState('P1', 1)),
                $this->historyEntry('第1手', $this->snapshotState('P2', 2, ['actionLog' => ['P1 moved']])),
            ],
        ]);

        $branchStateResponse = $this->api('room.state', [
            'playerId' => $branchPlayerId,
            'version' => $branchVersion,
            'gameState' => $nextBranchState,
        ], ['roomId' => $branchRoomId]);

        $branchStateResponse->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('room.status', 'playing')
            ->assertJsonPath('room.gameState.currentPlayer', 'P2')
            ->assertJsonPath('room.gameState.turnNumber', 2);

        $reviewCreate = $this->api('room.create', [
            'name' => 'Analyst',
            'roomType' => 'study',
            'studyKind' => 'review',
            'roomName' => '共有検討室',
            'gameState' => $this->finishedGameState(),
        ]);

        $reviewRoomId = (string) $reviewCreate->json('room.id');
        $reviewPlayerId = (string) $reviewCreate->json('playerId');
        $reviewVersion = (int) $reviewCreate->json('room.version');

        $reviewStateResponse = $this->api('room.state', [
            'playerId' => $reviewPlayerId,
            'version' => $reviewVersion,
            'gameState' => $this->finishedGameState(),
        ], ['roomId' => $reviewRoomId]);

        $reviewStateResponse->assertStatus(400)
            ->assertJsonPath('ok', false)
            ->assertJsonPath('error', 'Review study rooms do not accept turn updates');
    }

    public function test_wait_approval_restores_the_requesters_turn_snapshot(): void
    {
        $createResponse = $this->api('room.create', [
            'name' => 'Host',
            'roomName' => '待った確認室',
            'visibility' => 'public',
            'gameState' => $this->waitRequestGameState(),
        ]);

        $roomId = (string) $createResponse->json('room.id');
        $hostId = (string) $createResponse->json('playerId');

        $joinResponse = $this->api('room.join', [
            'roomId' => $roomId,
            'name' => 'Guest',
        ]);

        $guestId = (string) $joinResponse->json('playerId');

        $requestResponse = $this->api('room.wait.request', [
            'roomId' => $roomId,
            'playerId' => $hostId,
        ]);

        $requestResponse->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('room.waitRequest.requestedBy', 'P1')
            ->assertJsonPath('room.waitRequest.requestedTo', 'P2');

        $approveResponse = $this->api('room.wait.respond', [
            'roomId' => $roomId,
            'playerId' => $guestId,
            'approved' => true,
        ]);

        $approveResponse->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('room.waitRequest', null)
            ->assertJsonPath('room.gameState.currentPlayer', 'P1')
            ->assertJsonPath('room.gameState.turnNumber', 1)
            ->assertJsonCount(1, 'room.gameState.history');
    }

    public function test_npc_book_proposal_can_be_saved_listed_and_fetched(): void
    {
        $book = [
            'version' => 'proposal-test',
            'source' => 'feature-test',
            'samples' => [
                'entries' => 1,
                'games' => 2,
                'moves' => 8,
            ],
            'kifuLearnedWeights' => [
                'dangerousOpeningFragments' => [
                    'net04' => 0.8,
                ],
            ],
            'openingRescueJoseki' => [
                'responseWeights' => [
                    'fragment:net03/barrier' => 0.7,
                ],
            ],
            'counterattackTransitionWeights' => [
                'actions' => [
                    'move:barrier:capture:rider' => 0.6,
                ],
            ],
        ];

        $currentResponse = $this->api('npc.book.current');

        $currentResponse->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonStructure(['book']);

        $saveResponse = $this->api('npc.book.proposal.save', [
            'label' => 'proposal test',
            'source' => 'feature-test',
            'book' => $book,
        ]);

        $saveResponse->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('entry.label', 'proposal test')
            ->assertJsonPath('entry.version', 'proposal-test')
            ->assertJsonPath('entry.games', 2)
            ->assertJsonPath('entry.moves', 8);

        $bookId = (string) $saveResponse->json('entry.id');

        $listResponse = $this->api('npc.book.proposal.list');

        $listResponse->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonCount(1, 'entries')
            ->assertJsonPath('entries.0.id', $bookId);

        $getResponse = $this->api('npc.book.proposal.get', [], ['id' => $bookId]);

        $getResponse->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('book.version', 'proposal-test')
            ->assertJsonPath('book.kifuLearnedWeights.dangerousOpeningFragments.net04', 0.8);
    }

    private function api(string $action, array $payload = [], array $query = [])
    {
        $uri = '/api?' . http_build_query(array_merge(['action' => $action], $query));

        return $this->postJson($uri, $payload);
    }

    private function baseGameState(array $overrides = []): array
    {
        $state = [
            'ruleMode' => 'original',
            'currentPlayer' => 'P1',
            'turnNumber' => 1,
            'winner' => null,
            'winReason' => null,
            'actionLog' => [],
            'placements' => [],
            'players' => [
                'P1' => ['pieces' => [], 'reserve' => [], 'hand' => [], 'deck' => []],
                'P2' => ['pieces' => [], 'reserve' => [], 'hand' => [], 'deck' => []],
            ],
            'board' => $this->emptyBoard(),
            'history' => [
                $this->historyEntry('開始局面', $this->snapshotState('P1', 1)),
            ],
        ];

        return array_replace_recursive($state, $overrides);
    }

    private function finishedGameState(): array
    {
        return $this->baseGameState([
            'turnNumber' => 3,
            'winner' => 'P1',
            'winReason' => 'capture',
            'actionLog' => ['P1 wins'],
            'history' => [
                $this->historyEntry('開始局面', $this->snapshotState('P1', 1)),
                $this->historyEntry('第1手', $this->snapshotState('P2', 2, ['actionLog' => ['P1 moved']])),
                $this->historyEntry('終局', $this->snapshotState('P1', 3, [
                    'winner' => 'P1',
                    'winReason' => 'capture',
                    'actionLog' => ['P1 wins'],
                ])),
            ],
        ]);
    }

    private function waitRequestGameState(): array
    {
        return $this->baseGameState([
            'currentPlayer' => 'P1',
            'turnNumber' => 3,
            'actionLog' => ['P1 moved', 'P2 moved'],
            'history' => [
                $this->historyEntry('開始局面', $this->snapshotState('P1', 1)),
                $this->historyEntry('第1手', $this->snapshotState('P2', 2, ['actionLog' => ['P1 moved']])),
                $this->historyEntry('第2手', $this->snapshotState('P1', 3, ['actionLog' => ['P1 moved', 'P2 moved']])),
            ],
        ]);
    }

    private function historyEntry(string $label, array $snapshot): array
    {
        return [
            'label' => $label,
            'currentPlayer' => $snapshot['currentPlayer'],
            'snapshot' => $snapshot,
        ];
    }

    private function snapshotState(string $currentPlayer, int $turnNumber, array $overrides = []): array
    {
        $snapshot = [
            'ruleMode' => 'original',
            'currentPlayer' => $currentPlayer,
            'turnNumber' => $turnNumber,
            'winner' => null,
            'winReason' => null,
            'actionLog' => [],
            'placements' => [],
            'players' => [
                'P1' => ['pieces' => [], 'reserve' => [], 'hand' => [], 'deck' => []],
                'P2' => ['pieces' => [], 'reserve' => [], 'hand' => [], 'deck' => []],
            ],
            'board' => $this->emptyBoard(),
            'history' => [],
        ];

        return array_replace_recursive($snapshot, $overrides);
    }

    private function emptyBoard(): array
    {
        $board = [];
        for ($row = 0; $row < 9; $row += 1) {
            $board[$row] = [];
            for ($col = 0; $col < 15; $col += 1) {
                $board[$row][$col] = [
                    'pieceId' => null,
                    'controller' => null,
                    'stack' => [],
                ];
            }
        }

        return $board;
    }

    private function backupStorageFile(string $path): void
    {
        $this->fileBackups[$path] = [
            'exists' => is_file($path),
            'contents' => is_file($path) ? (string) file_get_contents($path) : null,
        ];
    }

    private function restoreStorageFile(string $path): void
    {
        $backup = $this->fileBackups[$path] ?? ['exists' => false, 'contents' => null];

        if ($backup['exists']) {
            $dir = dirname($path);
            if (!is_dir($dir)) {
                mkdir($dir, 0777, true);
            }
            file_put_contents($path, (string) $backup['contents']);
            return;
        }

        if (is_file($path)) {
            unlink($path);
        }
    }

    private function resetStorageSandbox(): void
    {
        $dir = dirname($this->roomsFile);
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }

        if (is_file($this->roomsFile)) {
            unlink($this->roomsFile);
        }
        if (is_file($this->siteFile)) {
            unlink($this->siteFile);
        }
        $this->deleteDirectory($this->npcBookDir);
    }

    private function backupStorageDirectory(string $path): void
    {
        $files = [];
        if (is_dir($path)) {
            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($path, \FilesystemIterator::SKIP_DOTS),
                \RecursiveIteratorIterator::SELF_FIRST
            );
            foreach ($iterator as $item) {
                if ($item->isFile()) {
                    $relativePath = substr($item->getPathname(), strlen($path) + 1);
                    $files[$relativePath] = (string) file_get_contents($item->getPathname());
                }
            }
        }

        $this->directoryBackups[$path] = [
            'exists' => is_dir($path),
            'files' => $files,
        ];
    }

    private function restoreStorageDirectory(string $path): void
    {
        $backup = $this->directoryBackups[$path] ?? ['exists' => false, 'files' => []];

        $this->deleteDirectory($path);

        if (!$backup['exists']) {
            return;
        }

        foreach ($backup['files'] as $relativePath => $contents) {
            $target = $path . DIRECTORY_SEPARATOR . $relativePath;
            $dir = dirname($target);
            if (!is_dir($dir)) {
                mkdir($dir, 0777, true);
            }
            file_put_contents($target, $contents);
        }
    }

    private function deleteDirectory(string $path): void
    {
        if (!is_dir($path)) {
            return;
        }

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($path, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::CHILD_FIRST
        );
        foreach ($iterator as $item) {
            if ($item->isDir()) {
                rmdir($item->getPathname());
            } else {
                unlink($item->getPathname());
            }
        }
        rmdir($path);
    }
}
