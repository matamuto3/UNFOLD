# UNFOLD NPC self-play analysis: deployment-defense 100 games

Generated: 2026-05-03

## Hypothesis

The first player advantage appears to come partly from deployment tempo: the first player can extend territory and reduce the opponent's legal fragment placements before the opponent can stabilize. Therefore, defense should value not only king safety but also "where the opponent can unfold next."

## What changed

- Added deployment-control evaluation:
  - counts legal fragment placement options from each player's current hand;
  - evaluates frontier cells adjacent to controlled territory;
  - penalizes positions where a player has very few legal fragment placements;
  - rewards actions that reduce the opponent's frontier or overwrite opponent-controlled frontier cells.
- Added a direct disruption bonus to fragment action scoring so defensive blocking placements can enter the candidate set.
- Kept the previous king-safety and forced-defense improvements.

## Result

| Metric | AI-refined 100 | Deployment-defense 100 |
|---|---:|---:|
| P1 wins | 80 | 77 |
| P2 wins | 20 | 22 |
| Draw / unfinished | 0 | 1 |
| King-capture wins | 80 | 81 |
| Base-center wins | 20 | 18 |
| Average turns | 6.7 | 8.0 |
| Average plies | 13.7 | 15.0 |

## Observations

- The first-player advantage remains large, but it softened slightly: P1 went from 80 wins to 77 wins.
- Average game length increased from 6.7 to 8.0 turns, so the new defense evaluation is delaying early collapse.
- King movement increased again: 161 king moves appeared in the 100 games, mostly by P2. This suggests the second player is spending many moves escaping pressure instead of developing.
- One game reached the ply cap and remained unfinished, which is useful as a future long-game regression case.

## Current diagnosis

Deployment defense helps, but it does not fully solve first-player tempo. The likely issue is structural: after initial standby, P1 gets the first normal action and can immediately convert the first initiative into either king pressure or territory lock.

## Next candidates

- Add a rule-level balance option: after initial standby, let P2 take the first normal turn, or give P2 a limited defensive setup bonus.
- Add opening constraints: during the first normal turn, restrict direct king-pressure moves or far-forward fragment placement.
- Add a second-player NPC bias: P2 should prioritize blocking P1 deployment lanes over pursuing king attacks in the first 2 to 3 normal actions.
- Add regression snapshots for "opponent has 0 legal fragment placements next turn" and "P2 must preserve deployment lanes."
