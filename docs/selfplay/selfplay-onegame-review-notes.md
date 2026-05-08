# UNFOLD NPC one-game review notes

## 2026-05-04 shogi / lookahead 5 / seed 2026550601

- Result: P1 win, 4 turns, 11 plies, king capture.
- Opening: P1 built a gold/pawn/pawn setup, then deployed a lance with mirror hook.
- Critical sequence: P1 lance captured the P2 knight on `(5,12)`, P2 moved king from `(5,14)` to `(5,13)`, then P1 lance captured the king.
- Finding: The defender selected a king move into the attack line of an enemy lance. This means king-safety filtering was not strong enough even with 5-ply lookahead.
- Fix applied: King moves that leave the king threatened now receive a very large score penalty, and emergency fragment candidates are kept wider so blocking moves are less likely to be pruned.
