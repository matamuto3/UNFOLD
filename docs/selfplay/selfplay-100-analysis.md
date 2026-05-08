# UNFOLD NPC self-play 100-game analysis

Generated: 2026-05-03

Source: `docs/selfplay/unfold-selfplay-100-original.json`

## Test setup

- Mode: original pieces
- Games: 100
- Seed: 20260503
- Max plies per game: 160
- Initial standby: 3 fragments per player

## Result summary

- P1 wins: 80
- P2 wins: 20
- Draws / unfinished: 0
- Win reasons: king capture 96, base center overwrite 4
- Average turns: 4.3
- Average plies including standby: 11.3

## Important findings

- Games end too quickly. 14 games ended by turn 2, and 55 games ended by turn 4.
- King capture is overwhelmingly dominant. Base-center victory appeared only 4 times.
- The current NPC attacks well enough to find short king captures, but it does not value king safety highly enough.
- P1 has a large first-player advantage in this sample, winning 80 of 100 games.
- Initial standby now completes reliably, but no repeated setup pattern appeared more than once because the shuffled starting hands vary heavily.

## Capture pieces

- Charger / 突撃士: 22 king captures
- Realm Knight / 界騎士: 15 king captures
- Rider / 騎乗士: 14 king captures
- Vanguard / 前衛士: 12 king captures
- Destroyer / 滅界者: 8 king captures
- Barrier / 結界士: 6 king captures
- Chaos Beast / 混沌獣: 6 king captures
- Flanker / 側撃士: 5 king captures
- Disruptor / 攪乱士: 5 king captures
- Guard / 護衛士: 2 king captures
- Decoy / 誘引士: 1 king capture

## Opening observations

- First normal actions are widely distributed, so a fixed opening book is premature.
- The strongest practical opening direction is not a card name yet, but a principle: expand toward the center while keeping the king covered.
- Charger, Realm Knight, Rider, and Vanguard repeatedly become decisive attackers. NPC should treat their attack lanes toward the king as high-risk.
- The current evaluation should penalize exposing the king more than it rewards a fast but undefended expansion.

## Recommended NPC upgrades

- Add a king-safety penalty after every candidate action, especially if an enemy piece can capture the king in 1 move.
- Increase forced-defense priority when the king is capturable, not only when pressure maps are high.
- Add an opening safety heuristic: first normal placement should prefer a piece or fragment that protects own king-side lanes.
- Reduce blind rush behavior by subtracting score when a move opens a direct route to the own king.
- Treat short wins/losses from this dataset as regression tests before claiming the NPC has improved.
