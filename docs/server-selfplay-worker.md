# UNFOLD 自動対局ワーカー

Codexを使わずに棋譜を増やすための簡易運用です。

## できること

- `selfplay-worker.html` をブラウザで開きっぱなしにすると、NPC同士の対局を自動実行します。
- 対局結果は `api?action=selfplay.save` へ送信され、サーバーの `storage/app/private/selfplay-kifu` に保存されます。
- 保存済み棋譜は同じ画面の一覧からJSONとして取得できます。

## 注意点

- 現時点では、対局計算そのものはブラウザ側で行います。
- サーバーだけで完全自動実行するには、現在 `public/app.js` にあるゲームルールとNPC思考をPHP版エンジンへ移植し、Laravel Artisan command と cron を追加する必要があります。
- Sakuraレンタルサーバーでは、NodeやヘッドレスChromeが使える前提にしないほうが安全です。そのため、まずは「ブラウザで回してサーバーに保存する」方式にしています。

## 使い方

1. 変更ファイルをアップロードします。
2. `https://unfold.sakura.ne.jp/selfplay-worker.html` を開きます。
3. 対局数、最大手数、読み深さ、駒モードを選びます。
4. `開始` を押して、ブラウザを閉じずに待ちます。
5. 保存済み棋譜一覧からJSONを取得します。

## 次の拡張案

- PHP版の軽量UNFOLDエンジンを作る。
- `php artisan unfold:selfplay --games=100 --mode=original` のようなコマンドを追加する。
- Sakuraのcronから定期実行し、夜間に自動で棋譜を増やす。
