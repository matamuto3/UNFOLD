# UNFOLD Laravel Port

このフォルダは `UNFOLD` の Laravel 版移植用です。

## 現在の状態

- `public/` にゲーム画面の静的ファイルを配置済み
- `/api` は `app/Http/Controllers/RoomApiController.php` で処理
- 対戦部屋データは `storage/app/private/rooms.json` に保存
- `public/app.js` は `api.php` ではなく `/api` を呼ぶよう変更済み

## まだ必要なこと

- `.\run-composer.ps1 install`
- `.env` 作成
- `.\run-artisan.ps1 key:generate`
- Web サーバーのドキュメントルートを `public/` に向ける

## 起動イメージ

1. `.\run-composer.ps1 install --prefer-source`
2. `copy .env.example .env`
3. `.\run-artisan.ps1 key:generate`
4. `.\run-artisan.ps1 serve`

ブラウザでは `/index.html` を開きます。
