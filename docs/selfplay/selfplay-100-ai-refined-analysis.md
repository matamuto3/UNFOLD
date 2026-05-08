# UNFOLD NPC self-play analysis: AI-refined 100 games

Generated: 2026-05-03

## What changed

- Immediate-win detection now scans tactical winning moves directly, instead of only checking high-scoring candidate moves.
- When the king is threatened or an immediate loss exists, the NPC now evaluates the full legal-action set before choosing a defense.
- The evaluation function now includes a king-safety score inspired by king-relative evaluation features used in modern shogi/chess engines.
- Initial standby scoring now prefers a compact base-side enclosure, reducing the tendency to stretch fragments toward the opponent base during setup.

## Result

| Metric | Previous 100 | Refined 100 |
|---|---:|---:|
| P1 wins | 80 | 80 |
| P2 wins | 20 | 20 |
| Draw / unfinished | 0 | 0 |
| King-capture wins | 96 | 80 |
| Base-center wins | 4 | 20 |
| Average turns | 4.3 | 6.7 |
| Average plies | 11.3 | 13.7 |

## Observations

- The NPC now escapes with the king much more often. In the refined 100 games, king moves appeared 99 times: P2 used 79 of them and P1 used 20.
- The game still has a strong first-player tempo advantage. P1 wins remained at 80/100 even after defensive improvements.
- The win condition mix improved: base-center wins increased from 4 to 20, so the NPC is considering territory pressure more often instead of only racing to capture the king.
- Short tactical wins still occur often around turn 4. This suggests the next improvement should focus on opening balance and setup legality/shape, not just deeper tactical evaluation.

## Tactical lessons

Most king-capture wins still came from high-mobility or forward-pressure pieces:

| Piece | Captures |
|---|---:|
| 突撃士 | 15 |
| 界騎士 | 14 |
| 結界士 | 12 |
| 滅界者 | 11 |
| 側撃士 | 6 |
| 前衛士 | 6 |
| 攪乱士 | 5 |
| 混沌獣 | 5 |
| 騎乗士 | 4 |
| 護衛士 | 2 |

## Next recommendations

- Add a small opening-balance rule: after initial standby, consider giving the second player a defensive response bonus or restricting first-turn fragment reach.
- Make initial standby legality closer to "base enclosure" if that is the intended rule, instead of allowing long connected chains.
- Add a targeted regression test for "king in check must choose a legal escape/capture/block if one exists."
- Add a lightweight two-ply tactical map around both kings, limited to nearby actions, to avoid full-board expensive searches.
