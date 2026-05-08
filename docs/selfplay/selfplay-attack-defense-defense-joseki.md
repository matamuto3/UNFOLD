# UNFOLD 自己対戦メモ: 先手攻撃NPC vs 後手守備NPC

目的:

- 先手を「勝ちに行くNPC」、後手を「守るNPC」として分ける。
- 後手の初期スタンバイ3枚から、守る定石候補を増やす。
- 山札消費は副指標。主指標は先手の攻め成功率と、後手勝ち + 未決着を合わせた守備成功率の差。

## 追加した集計

- `strategyProfile`: 自己対戦の役割。例: `P1:attack / P2:defense`
- `defenderSetupPatterns`: 後手が初期スタンバイで置いた3枚の一覧。
- `defenderSetupOutcomes`: 後手初期囲いごとの勝敗、P2勝率、平均手数、平均残山札。
- `defenderSetupProfileOutcomes`: 後手初期囲いを「堅守 / 妨害 / 反撃」の比率で集約した成績。

## 3戦スモークの暫定知見

ログ: `unfold-selfplay-3-attack-defense-outcomes.json`

- P1 2勝 / P2 1勝
- 平均15.0手
- `net03/barrier | net08/realmKnight | net10m/disruptor` は37手まで伸び、P2勝ち。
- 「堅守2 / 妨害1 / 反撃0」は1例だけだが、最も耐久した。
- 「堅守1 / 妨害1 / 反撃1」は2例とも4手で崩れた。

## 仮説

後手の初期囲いは、攻撃駒を混ぜるよりも、堅守系を2枚以上入れてから妨害駒を1枚添えるほうがよさそう。

今後100戦以上で見るべき指標:

- `defenderSetupProfileOutcomes` の「堅守2 / 妨害1 / 反撃0」が本当に耐えるか。
- 具体形では `barrier + realmKnight + disruptor` 系が再現性を持つか。
- P2勝率だけでなく、P1勝ちでも平均手数が伸びる囲いを候補に残す。
