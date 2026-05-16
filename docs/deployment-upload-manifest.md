# UNFOLD Upload Manifest

## Recommended server layout

Use this split layout on Sakura Rental Server.

```text
/home/unfold/
  app-unfold/      # private Laravel application files
  www/             # public document root
```

Only files inside `www` should be directly visible from the browser.

## Public upload target: `/home/unfold/www`

Upload the contents of `laravel-app/public/` to `/home/unfold/www/`.

Required root files:

```text
.htaccess
ads.txt
app.js
favicon.ico
feedback.html
feedback.js
formations.html
googlef38ffbd6010c3be3.html
guide-lightbox.js
index.html
index.php
joseki.html
kifu.html
online.html
privacy.html
robots.txt
rules.html
rules-hand-scene.html
rules-menu.html
rules-scene.html
rules-summary.html
selfplay-worker.html
selfplay-worker.js
sitemap.xml
solo.html
styles.css
three-board.js
unfold-engine.wasm
unfold-npc-book.json
unfold-npc-worker.js
```

Required public asset folders:

```text
assets/materials/marble_01_diff_1k.jpg
assets/materials/marble026_color_1k.jpg
assets/materials/ASSET_MANIFEST.md
assets/rules/
```

Optional or development-only public assets:

```text
assets/materials/downloads/
assets/sprites/unfold-pieces/raw/
assets/sprites/unfold-pieces/processed/
assets/sprites/unfold-pieces/piece-sprite-source.json
```

Do not upload the optional folders unless the current UI actually references them.

## Private upload target: `/home/unfold/app-unfold`

Upload Laravel application files here, not to `www`.

Required private folders:

```text
app/
bootstrap/
config/
database/
resources/
routes/
vendor/
```

Create writable storage folders on the server, but do not upload local runtime data unless you intentionally want to migrate it.

```text
storage/app/private/
storage/app/private/selfplay-kifu/
storage/app/private/npc-book/
storage/framework/cache/
storage/framework/sessions/
storage/framework/views/
storage/logs/
```

Do not upload local runtime files by default:

```text
storage/app/private/rooms.json
storage/app/private/site.json
storage/app/private/selfplay-kifu/*.json
storage/app/private/npc-book/*.json
storage/logs/*.log
```

Required private files:

```text
.env
.htaccess
artisan
composer.json
composer.lock
```

Development-only files that are not needed on the rental server:

```text
tests/
node_modules/
package.json
vite.config.js
phpunit.xml
README.md
README-UNFOLD.md
CHANGELOG.md
run-artisan.ps1
run-composer.ps1
```

## Production `.env` checklist

Use production values on the server.

```text
APP_ENV=production
APP_DEBUG=false
APP_URL=https://unfold.sakura.ne.jp
```

Keep `APP_KEY` secret and never place `.env` under `/home/unfold/www`.

Optional write-tool keys:

```text
UNFOLD_TOOL_WRITE_KEY=
UNFOLD_NPC_BOOK_KEY=
```

Leave `UNFOLD_TOOL_WRITE_KEY` blank on the public site unless you intentionally want browser self-play tools to save files to the server. Match rooms, feedback, room deletion by room admin key, and normal gameplay do not need this key.
