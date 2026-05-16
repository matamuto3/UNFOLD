(function () {
  "use strict";

  var NPC_WORKER_SCRIPT_URL = "unfold-npc-worker.js?v=20260516t";

  var els = {
    form: document.getElementById("workerForm"),
    label: document.getElementById("labelInput"),
    mode: document.getElementById("modeInput"),
    total: document.getElementById("totalInput"),
    chunk: document.getElementById("chunkInput"),
    parallel: document.getElementById("parallelInput"),
    maxPlies: document.getElementById("maxPliesInput"),
    lookahead: document.getElementById("lookaheadInput"),
    strategy: document.getElementById("strategyInput"),
    seed: document.getElementById("seedInput"),
    start: document.getElementById("startBtn"),
    stop: document.getElementById("stopBtn"),
    refresh: document.getElementById("refreshBtn"),
    status: document.getElementById("workerStatus"),
    done: document.getElementById("doneCount"),
    p1: document.getElementById("p1Wins"),
    p2: document.getElementById("p2Wins"),
    draw: document.getElementById("draws"),
    log: document.getElementById("workerLog"),
    list: document.getElementById("kifuList"),
    bookBuild: document.getElementById("bookBuildBtn"),
    bookStatus: document.getElementById("bookStatus")
  };

  var runner = {
    running: false,
    stopRequested: false,
    done: 0,
    wins: { P1: 0, P2: 0, draw: 0 },
    workerUnavailable: false,
    activeWorkers: [],
    workerPool: []
  };

  function apiUrl(action, params) {
    var url = "api?action=" + encodeURIComponent(action);
    Object.keys(params || {}).forEach(function (key) {
      if (params[key] !== null && params[key] !== undefined && params[key] !== "") {
        url += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
      }
    });
    return url;
  }

  function clampNumber(value, min, max, fallback) {
    var number = Number(value);
    if (!Number.isFinite(number)) {
      return fallback;
    }
    return Math.max(min, Math.min(max, Math.floor(number)));
  }

  function getSettings() {
    return {
      label: (els.label.value || "server-worker").trim() || "server-worker",
      mode: els.mode.value === "shogi" ? "shogi" : "original",
      total: clampNumber(els.total.value, 1, 5000, 100),
      chunk: clampNumber(els.chunk.value, 1, 20, 5),
      parallel: clampNumber(els.parallel ? els.parallel.value : 1, 1, 6, 2),
      maxPlies: clampNumber(els.maxPlies.value, 10, 300, 30),
      lookahead: clampNumber(els.lookahead.value, 1, 5, 3),
      strategy: els.strategy.value || "attack-defense",
      seed: clampNumber(els.seed.value, 1, 2147480000, 20260506)
    };
  }

  function setRunning(isRunning) {
    runner.running = isRunning;
    els.start.disabled = isRunning;
    els.stop.disabled = !isRunning;
    els.refresh.disabled = isRunning;
    if (els.parallel) {
      els.parallel.disabled = isRunning;
    }
    if (els.bookBuild) {
      els.bookBuild.disabled = isRunning;
    }
  }

  function setStatus(text) {
    els.status.textContent = text;
  }

  function setBookStatus(text) {
    if (els.bookStatus) {
      els.bookStatus.textContent = text;
    }
  }

  function updateStats() {
    els.done.textContent = String(runner.done);
    els.p1.textContent = String(runner.wins.P1 || 0);
    els.p2.textContent = String(runner.wins.P2 || 0);
    els.draw.textContent = String(runner.wins.draw || 0);
  }

  function addLog(text, isError) {
    var item = document.createElement("div");
    item.className = "worker-log-item" + (isError ? " error" : "");
    item.textContent = new Date().toLocaleTimeString() + "  " + text;
    els.log.prepend(item);
  }

  function buildSelfplayUrl(settings, chunkCount, chunkIndex) {
    var seed = settings.seed + chunkIndex * settings.chunk;
    var params = new URLSearchParams({
      debug: "1",
      selfplay: String(chunkCount),
      seed: String(seed),
      mode: settings.mode,
      maxPlies: String(settings.maxPlies),
      strategy: settings.strategy,
      lookahead: String(settings.lookahead)
    });
    return "solo.html?" + params.toString();
  }

  function readIframeResult(iframe) {
    var result = null;
    var pre = null;
    try {
      result = iframe.contentWindow && iframe.contentWindow.__UNFOLD_SELFPLAY_RESULT__;
    } catch (error) {
      result = null;
    }
    if (result) {
      return result;
    }
    try {
      pre = iframe.contentDocument && iframe.contentDocument.getElementById("selfplayResult");
      return pre ? JSON.parse(pre.textContent || "{}") : null;
    } catch (error) {
      return null;
    }
  }

  function waitForIframeResult(iframe, deadline, resolve, reject) {
    var result = readIframeResult(iframe);
    if (result && result.summary) {
      resolve(result);
      return;
    }
    if (Date.now() >= deadline) {
      reject(new Error("自動対局の完了待ちがタイムアウトしました"));
      return;
    }
    window.setTimeout(function () {
      waitForIframeResult(iframe, deadline, resolve, reject);
    }, 500);
  }

  function runChunkIframe(settings, chunkCount, chunkIndex) {
    return new Promise(function (resolve, reject) {
      var iframe = document.createElement("iframe");
      var timeoutMs = Math.max(60000, chunkCount * settings.maxPlies * 5000);
      var deadline = Date.now() + timeoutMs;
      var settled = false;

      function finish(callback, value) {
        if (settled) {
          return;
        }
        settled = true;
        iframe.remove();
        callback(value);
      }

      iframe.className = "worker-frame";
      iframe.onload = function () {
        addLog("計算ページを読み込みました。結果を待っています。");
        waitForIframeResult(iframe, deadline, function (result) {
          finish(resolve, result);
        }, function (error) {
          finish(reject, error);
        });
      };
      iframe.onerror = function () {
        finish(reject, new Error("自動対局ページを読み込めませんでした"));
      };
      iframe.src = buildSelfplayUrl(settings, chunkCount, chunkIndex);
      addLog("計算開始: " + chunkCount + "戦 / seed " + (settings.seed + chunkIndex * settings.chunk));
      document.body.appendChild(iframe);
    });
  }

  function buildSelfplayPayload(settings, chunkCount, chunkIndex) {
    return {
      count: chunkCount,
      seed: settings.seed + chunkIndex * settings.chunk,
      mode: settings.mode,
      maxPlies: settings.maxPlies,
      strategy: settings.strategy,
      lookaheadDepth: settings.lookahead
    };
  }

  function saveChunk(settings, result, chunkIndex) {
    return fetch(apiUrl("selfplay.save"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: settings.label + " #" + String(chunkIndex + 1),
        source: "browser-selfplay-worker",
        note: "mode=" + settings.mode + ", maxPlies=" + settings.maxPlies + ", lookahead=" + settings.lookahead,
        payload: result
      })
    }).then(function (response) {
      return response.text().then(function (rawText) {
        var data = rawText ? JSON.parse(rawText) : null;
        if (!response.ok || !data || !data.ok) {
          throw new Error(data && data.error ? data.error : "保存に失敗しました");
        }
        return data.entry;
      });
    });
  }

  function mergeSummary(result) {
    var summary = result && result.summary ? result.summary : {};
    var wins = summary.wins || {};
    runner.done += Number(summary.games || (result.games ? result.games.length : 0)) || 0;
    runner.wins.P1 += Number(wins.P1 || 0);
    runner.wins.P2 += Number(wins.P2 || 0);
    runner.wins.draw += Number(wins.draw || 0);
    updateStats();
  }

  function removeActiveWorker(worker) {
    runner.activeWorkers = runner.activeWorkers.filter(function (item) {
      return item !== worker;
    });
    runner.workerPool = runner.workerPool.filter(function (item) {
      return item !== worker;
    });
  }

  function terminateActiveWorkers() {
    runner.activeWorkers.splice(0).forEach(function (worker) {
      try {
        worker.terminate();
      } catch (error) {
        // The worker may already be closing.
      }
    });
    runner.workerPool = [];
  }

  function createSelfplayWorkerPoolMember(index) {
    return new Promise(function (resolve, reject) {
      var worker;
      var settled = false;
      var readyTimeout;

      function finishReady(callback, value, markUnavailable) {
        if (settled) {
          return;
        }
        settled = true;
        window.clearTimeout(readyTimeout);
        if (markUnavailable) {
          runner.workerUnavailable = true;
        }
        if (callback === reject && worker) {
          removeActiveWorker(worker);
          worker.terminate();
        }
        callback(value);
      }

      if (runner.workerUnavailable) {
        reject(new Error("Worker is unavailable"));
        return;
      }
      if (typeof Worker !== "function") {
        runner.workerUnavailable = true;
        reject(new Error("Web Worker is not supported"));
        return;
      }

      try {
        worker = new Worker(NPC_WORKER_SCRIPT_URL);
        worker.__unfoldWorkerIndex = index;
        worker.__activeJob = null;
        worker.__failed = false;
        runner.activeWorkers.push(worker);
      } catch (error) {
        runner.workerUnavailable = true;
        reject(error);
        return;
      }

      readyTimeout = window.setTimeout(function () {
        finishReady(reject, new Error("Workerの起動がタイムアウトしました"), true);
      }, 45000);

      worker.onmessage = function (event) {
        var data = event.data || {};
        var job = worker.__activeJob;
        if (data.type === "ready") {
          finishReady(resolve, worker);
          return;
        }
        if (data.type === "init-error") {
          finishReady(reject, new Error(data.error || "Worker initialization failed"), true);
          return;
        }
        if (data.type === "selfplayResult" && job && data.requestId === job.requestId) {
          window.clearTimeout(job.timeoutId);
          worker.__activeJob = null;
          if (data.ok && data.result) {
            job.resolve(data.result);
          } else {
            job.reject(new Error(data.error || "Worker selfplay failed"));
          }
        }
      };

      worker.onerror = function (error) {
        var workerError = new Error(error && error.message ? error.message : "Worker error");
        var job = worker.__activeJob;
        worker.__failed = true;
        runner.workerUnavailable = true;
        if (job) {
          window.clearTimeout(job.timeoutId);
          worker.__activeJob = null;
          job.reject(workerError);
          return;
        }
        finishReady(reject, workerError, true);
      };
    });
  }

  function createSelfplayWorkerPool(size) {
    var promises = [];
    var count = Math.max(1, Math.min(6, Number(size) || 1));
    terminateActiveWorkers();
    runner.workerUnavailable = false;
    for (var i = 0; i < count; i += 1) {
      promises.push(createSelfplayWorkerPoolMember(i + 1));
    }
    return Promise.all(promises).then(function (workers) {
      runner.workerPool = workers;
      return workers;
    }).catch(function (error) {
      terminateActiveWorkers();
      throw error;
    });
  }

  function runChunkInWorker(settings, chunkCount, chunkIndex, worker) {
    return new Promise(function (resolve, reject) {
      var requestId;
      var timeoutId;
      var timeoutMs = Math.max(60000, chunkCount * settings.maxPlies * 5000);
      if (!worker || worker.__failed) {
        reject(new Error("Worker is unavailable"));
        return;
      }
      if (worker.__activeJob) {
        reject(new Error("Worker is already calculating"));
        return;
      }
      requestId = Date.now() + ":" + chunkIndex + ":" + Math.random().toString(36).slice(2);
      timeoutId = window.setTimeout(function () {
        worker.__failed = true;
        worker.__activeJob = null;
        reject(new Error("Workerの計算がタイムアウトしました"));
      }, timeoutMs);
      worker.__activeJob = {
        requestId: requestId,
        timeoutId: timeoutId,
        resolve: resolve,
        reject: reject
      };
      addLog("Worker" + worker.__unfoldWorkerIndex + " 計算開始: " + chunkCount + "戦 / seed " + (settings.seed + chunkIndex * settings.chunk));
      worker.postMessage({
        type: "selfplayBatch",
        requestId: requestId,
        payload: buildSelfplayPayload(settings, chunkCount, chunkIndex)
      });
    });
  }

  function runChunk(settings, chunkCount, chunkIndex, worker) {
    if (!worker) {
      return runChunkIframe(settings, chunkCount, chunkIndex);
    }
    return runChunkInWorker(settings, chunkCount, chunkIndex, worker);
  }

  function runWorker(settings) {
    var chunkIndex = 0;
    var remaining = settings.total;
    var inFlight = 0;
    var completedChunks = 0;
    var availableWorkers = [];
    var effectiveParallel = 1;

    setRunning(true);
    runner.stopRequested = false;
    runner.done = 0;
    runner.wins = { P1: 0, P2: 0, draw: 0 };
    updateStats();
    setStatus("Workerを起動しています");
    addLog("開始: " + settings.total + "戦 / " + settings.mode + " / " + settings.lookahead + "手読み / 並列" + settings.parallel);

    return createSelfplayWorkerPool(settings.parallel).catch(function (error) {
      addLog("Workerを起動できませんでした。1並列でフォールバックします: " + error.message, true);
      runner.workerUnavailable = true;
      return [];
    }).then(function (workers) {
      availableWorkers = workers.slice();
      effectiveParallel = workers.length || 1;
      if (workers.length) {
        addLog("Worker起動完了: " + workers.length + "本");
      }

      return new Promise(function (resolve, reject) {
        function finishIfDone() {
          if (inFlight > 0) {
            return;
          }
          if (runner.stopRequested || remaining <= 0) {
            resolve();
          }
        }

        function launchScheduledChunk(scheduledIndex, scheduledCount, worker) {
          inFlight += 1;
          setStatus("計算中: " + runner.done + " / " + settings.total + "戦完了、" + inFlight + " / " + effectiveParallel + " 本が実行中");
          runChunk(settings, scheduledCount, scheduledIndex, worker)
            .then(function (result) {
              return saveChunk(settings, result, scheduledIndex).then(function (entry) {
                mergeSummary(result);
                completedChunks += 1;
                addLog("保存: " + entry.label + " / P1 " + entry.wins.P1 + " P2 " + entry.wins.P2 + " 未決着 " + entry.wins.draw);
              });
            })
            .then(function () {
              inFlight -= 1;
              if (worker && !worker.__failed && !runner.stopRequested) {
                availableWorkers.push(worker);
              }
              if (runner.stopRequested || remaining <= 0) {
                finishIfDone();
              } else {
                launchNext();
              }
            })
            .catch(function (error) {
              inFlight -= 1;
              runner.stopRequested = true;
              reject(error);
            });
        }

        function launchNext() {
          var currentIndex;
          var chunkCount;
          var worker;
          if (runner.stopRequested) {
            finishIfDone();
            return;
          }
          while (remaining > 0 && !runner.stopRequested) {
            if (availableWorkers.length) {
              worker = availableWorkers.shift();
            } else if (!runner.workerPool.length && inFlight < 1) {
              worker = null;
            } else {
              break;
            }
            currentIndex = chunkIndex;
            chunkCount = Math.min(settings.chunk, remaining);
            chunkIndex += 1;
            remaining -= chunkCount;
            launchScheduledChunk(currentIndex, chunkCount, worker);
          }
          finishIfDone();
        }

        launchNext();
      });
    }).then(function () {
      terminateActiveWorkers();
      setRunning(false);
      if (runner.stopRequested) {
        setStatus("停止しました。進行済みの棋譜は保存済みです");
      } else {
        setStatus("完了しました: " + completedChunks + " チャンクを保存しました");
        addLog("完了: " + runner.done + "戦");
      }
      refreshList();
    }).catch(function (error) {
      terminateActiveWorkers();
      setRunning(false);
      setStatus("失敗しました: " + error.message);
      addLog(error.message, true);
      refreshList();
    });
  }

  function downloadJson(filename, payload) {
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    window.setTimeout(function () {
      URL.revokeObjectURL(link.href);
      link.remove();
    }, 0);
  }

  function downloadEntry(entry) {
    fetch(apiUrl("selfplay.get", { id: entry.id }))
      .then(function (response) {
        return response.text().then(function (rawText) {
          var data = rawText ? JSON.parse(rawText) : null;
          if (!response.ok || !data || !data.ok) {
            throw new Error(data && data.error ? data.error : "棋譜取得に失敗しました");
          }
          downloadJson("unfold-selfplay-" + entry.id + ".json", data.payload);
        });
      })
      .catch(function (error) {
        addLog(error.message, true);
      });
  }

  function fetchSelfplayList() {
    return fetch(apiUrl("selfplay.list"))
      .then(function (response) {
        return response.text().then(function (rawText) {
          var data = rawText ? JSON.parse(rawText) : null;
          if (!response.ok || !data || !data.ok) {
            throw new Error(data && data.error ? data.error : "保存済み棋譜の一覧を取得できませんでした");
          }
          return data.entries || [];
        });
      });
  }

  function fetchSelfplayPayload(entry) {
    return fetch(apiUrl("selfplay.get", { id: entry.id }))
      .then(function (response) {
        return response.text().then(function (rawText) {
          var data = rawText ? JSON.parse(rawText) : null;
          if (!response.ok || !data || !data.ok) {
            throw new Error(data && data.error ? data.error : "棋譜を取得できませんでした");
          }
          return data.payload;
        });
      });
  }

  function createBookMetric() {
    return {
      count: 0,
      wins: { P1: 0, P2: 0, draw: 0 },
      totalPlies: 0,
      totalTurns: 0,
      samples: []
    };
  }

  function recordBookMetric(map, key, game, move, source) {
    var winner;
    var entry;
    if (!key) {
      return;
    }
    winner = game && game.winner ? game.winner : "draw";
    entry = map[key] || createBookMetric();
    entry.count += 1;
    entry.wins[winner] = (entry.wins[winner] || 0) + 1;
    entry.totalPlies += Number(game && game.plies || 0) || 0;
    entry.totalTurns += Number(game && game.turns || 0) || 0;
    if (entry.samples.length < 4) {
      entry.samples.push({
        winner: winner,
        reason: game && game.reason || "",
        ply: move && typeof move.__plyIndex === "number" ? move.__plyIndex + 1 : null,
        player: move && move.player || "",
        type: move && move.type || "",
        label: move && move.label || "",
        source: source || ""
      });
    }
    map[key] = entry;
  }

  function getFragmentBookKey(move) {
    if (!move || !move.fragment) {
      return "";
    }
    return move.fragment + "/" + (move.pieceType || "none");
  }

  function getSetupBookKey(move) {
    if (!move) {
      return "";
    }
    if (move.type === "setupPiece") {
      return "piece/" + (move.pieceType || "none");
    }
    return getFragmentBookKey(move);
  }

  function getActionBookKey(move) {
    if (!move || !move.type) {
      return "";
    }
    if (move.type === "fragment" || move.type === "setupFragment") {
      return "fragment:" + getFragmentBookKey(move);
    }
    if (move.type === "move") {
      return "move:" + (move.pieceType || "none") + (move.capture ? ":capture" : "");
    }
    if (move.type === "reserve") {
      return "reserve:" + (move.pieceType || "none");
    }
    if (move.type === "recoverPiece") {
      return "recoverPiece:" + (move.pieceType || "none");
    }
    if (move.type === "recoverFragment") {
      return "recoverFragment:" + (move.fragment || "unknown");
    }
    if (move.type === "mulligan") {
      return "mulligan";
    }
    return move.type + ":" + (move.pieceType || move.fragment || "unknown");
  }

  function getCounterActionBookKey(move) {
    if (move && move.type === "move" && move.capture) {
      return "move:" + (move.pieceType || "none") + ":capture:" + (move.capture.pieceType || "unknown");
    }
    return getActionBookKey(move);
  }

  function clampWeight(value) {
    return Math.round(Math.max(0.18, Math.min(1, value)) * 1000) / 1000;
  }

  function getMetricAveragePlies(metric) {
    return metric.count ? metric.totalPlies / metric.count : 0;
  }

  function getMetricDefenseRate(metric) {
    return metric.count ? ((metric.wins.P2 || 0) + (metric.wins.draw || 0)) / metric.count : 0;
  }

  function getMetricP1WinRate(metric) {
    return metric.count ? (metric.wins.P1 || 0) / metric.count : 0;
  }

  function scoreDangerMetric(metric) {
    var confidence = Math.min(1, Math.log(metric.count + 1) / Math.log(16));
    var speed = Math.max(0, 1 - (getMetricAveragePlies(metric) / 46));
    return clampWeight(getMetricP1WinRate(metric) * 0.72 + speed * 0.16 + confidence * 0.12);
  }

  function scoreDefenseMetric(metric) {
    var confidence = Math.min(1, Math.log(metric.count + 1) / Math.log(16));
    var holdLength = Math.min(1, getMetricAveragePlies(metric) / 36);
    return clampWeight(getMetricDefenseRate(metric) * 0.7 + holdLength * 0.14 + confidence * 0.16);
  }

  function scorePieceRoleMetric(metric) {
    var confidence = Math.min(1, Math.log(metric.count + 1) / Math.log(24));
    return clampWeight(getMetricDefenseRate(metric) * 0.75 + confidence * 0.25);
  }

  function metricMapToRankedList(map, scorer, limit) {
    return Object.keys(map).map(function (key) {
      var metric = map[key];
      var count = metric.count || 0;
      return {
        key: key,
        weight: scorer(metric),
        count: count,
        p1WinRate: count ? Math.round(getMetricP1WinRate(metric) * 1000) / 10 : 0,
        p2DefenseRate: count ? Math.round(getMetricDefenseRate(metric) * 1000) / 10 : 0,
        averagePlies: count ? Math.round(getMetricAveragePlies(metric) * 10) / 10 : 0,
        wins: metric.wins,
        samples: metric.samples
      };
    }).sort(function (a, b) {
      if (b.weight !== a.weight) {
        return b.weight - a.weight;
      }
      return b.count - a.count;
    }).slice(0, limit || 24);
  }

  function rankedListToWeights(list) {
    var weights = {};
    list.forEach(function (entry) {
      weights[entry.key] = entry.weight;
    });
    return weights;
  }

  function getLocalDateStamp() {
    var date = new Date();
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");
    return String(date.getFullYear()) + month + day;
  }

  function buildNpcBookProposal(batches) {
    var stats = {
      entries: 0,
      games: 0,
      moves: 0,
      modes: {},
      wins: { P1: 0, P2: 0, draw: 0 }
    };
    var p1Danger = {};
    var p2Setup = {};
    var p2Response = {};
    var p2Counter = {};
    var p2PieceRoles = {};

    batches.forEach(function (batch) {
      var payload = batch && batch.payload ? batch.payload : {};
      var meta = payload.meta || {};
      var mode = batch.entry && batch.entry.mode || meta.mode || "unknown";
      var games = Array.isArray(payload.games) ? payload.games : [];
      stats.entries += 1;
      stats.modes[mode] = (stats.modes[mode] || 0) + games.length;
      games.forEach(function (game) {
        var moves = Array.isArray(game.moves) ? game.moves : [];
        var winner = game.winner || "draw";
        var afterStandbyP2Actions = 0;
        stats.games += 1;
        stats.moves += moves.length;
        stats.wins[winner] = (stats.wins[winner] || 0) + 1;
        moves.forEach(function (move, plyIndex) {
          var key;
          move.__plyIndex = plyIndex;
          if (move.player === "P1" && (move.type === "setupFragment" || move.type === "fragment") && plyIndex < 12) {
            recordBookMetric(p1Danger, move.fragment, game, move, "p1-opening");
          }
          if (move.player === "P2" && (move.type === "setupFragment" || move.type === "setupPiece")) {
            recordBookMetric(p2Setup, getSetupBookKey(move), game, move, "p2-setup");
          }
          if (move.player === "P2" && move.pieceType) {
            recordBookMetric(p2PieceRoles, move.pieceType, game, move, "p2-piece");
          }
          if (move.player === "P2" && move.phase !== "standby") {
            afterStandbyP2Actions += 1;
            key = getActionBookKey(move);
            if (afterStandbyP2Actions <= 6) {
              recordBookMetric(p2Response, key, game, move, "p2-response");
            }
            if (move.type === "move" || move.type === "fragment" || move.type === "reserve" || move.type === "recoverPiece" || move.type === "recoverFragment") {
              recordBookMetric(p2Counter, getCounterActionBookKey(move), game, move, "p2-counter");
            }
          }
          delete move.__plyIndex;
        });
      });
    });

    var dangerousOpeningFragments = metricMapToRankedList(p1Danger, scoreDangerMetric, 28);
    var setupWeights = metricMapToRankedList(p2Setup, scoreDefenseMetric, 28);
    var responseWeights = metricMapToRankedList(p2Response, scoreDefenseMetric, 28);
    var counterActions = metricMapToRankedList(p2Counter, scoreDefenseMetric, 36);
    var pieceRoleWeights = metricMapToRankedList(p2PieceRoles, scorePieceRoleMetric, 24);

    return {
      version: "proposal-" + getLocalDateStamp(),
      generatedAt: new Date().toISOString(),
      source: "selfplay-worker-aggregation",
      samples: stats,
      assumptions: [
        "未決着は後手の守備成功として扱います。",
        "先手序盤の勝率が高い展開図は危険初手として加点します。",
        "後手の初期スタンバイ、序盤応答、回収、反撃を別々に集計します。"
      ],
      kifuLearnedWeights: {
        dangerousOpeningFragments: rankedListToWeights(dangerousOpeningFragments),
        kingCapturePressurePieces: rankedListToWeights(pieceRoleWeights),
        shogiKingCapturePressurePieces: rankedListToWeights(pieceRoleWeights)
      },
      openingRescueJoseki: {
        setupWeights: rankedListToWeights(setupWeights),
        responseWeights: rankedListToWeights(responseWeights)
      },
      counterattackTransitionWeights: {
        actions: rankedListToWeights(counterActions)
      },
      review: {
        dangerousOpeningFragments: dangerousOpeningFragments,
        defenderSetup: setupWeights,
        defenderResponses: responseWeights,
        counterActions: counterActions,
        pieceRoles: pieceRoleWeights
      }
    };
  }

  function saveNpcBookProposalToServer(proposal) {
    return fetch(apiUrl("npc.book.proposal.save"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: "NPC book proposal " + (proposal.version || ""),
        source: "selfplay-worker-aggregation",
        note: "games=" + (proposal.samples && proposal.samples.games || 0) + ", moves=" + (proposal.samples && proposal.samples.moves || 0),
        book: proposal
      })
    }).then(function (response) {
      return response.text().then(function (rawText) {
        var data = rawText ? JSON.parse(rawText) : null;
        if (!response.ok || !data || !data.ok) {
          throw new Error(data && data.error ? data.error : "NPC定石DB更新案をサーバーへ保存できませんでした");
        }
        return data.entry;
      });
    });
  }

  function buildBookProposalFromSavedKifu() {
    var batches = [];
    if (runner.running) {
      setBookStatus("自動対局中は集計できません。停止後に実行してください。");
      return Promise.resolve();
    }
    if (els.bookBuild) {
      els.bookBuild.disabled = true;
    }
    setBookStatus("保存済み棋譜の一覧を取得しています。");
    return fetchSelfplayList().then(function (entries) {
      var index = 0;
      if (!entries.length) {
        setBookStatus("保存済み棋譜がまだありません。まず自動対局を回してください。");
        return null;
      }

      function next() {
        var entry;
        if (index >= entries.length) {
          return Promise.resolve();
        }
        entry = entries[index];
        index += 1;
        setBookStatus("棋譜を集計中: " + index + " / " + entries.length);
        return fetchSelfplayPayload(entry)
          .then(function (payload) {
            batches.push({ entry: entry, payload: payload });
          })
          .catch(function (error) {
            addLog((entry.label || entry.id) + " の取得に失敗: " + error.message, true);
          })
          .then(next);
      }

      return next().then(function () {
        var proposal = buildNpcBookProposal(batches);
        var filename = "unfold-npc-book-proposal-" + proposal.version.replace("proposal-", "") + ".json";
        downloadJson(filename, proposal);
        setBookStatus("集計完了: " + proposal.samples.games + "局 / " + proposal.samples.moves + "手。JSON案を出力し、サーバー保存中です。");
        return saveNpcBookProposalToServer(proposal)
          .then(function (entry) {
            setBookStatus("集計完了: " + proposal.samples.games + "局 / " + proposal.samples.moves + "手。JSON出力とサーバー保存が完了しました。");
            addLog("定石DB更新案を保存: " + (entry.label || entry.id));
            return proposal;
          })
          .catch(function (error) {
            setBookStatus("JSON案は出力しました。サーバー保存だけ失敗しました: " + error.message);
            addLog(error.message, true);
            return proposal;
          });
      });
    }).catch(function (error) {
      setBookStatus("集計に失敗しました: " + error.message);
      addLog(error.message, true);
    }).then(function (result) {
      if (els.bookBuild) {
        els.bookBuild.disabled = false;
      }
      return result;
    });
  }

  function renderList(entries) {
    els.list.innerHTML = "";
    if (!entries.length) {
      var emptyClean = document.createElement("div");
      emptyClean.className = "worker-kifu-item";
      emptyClean.textContent = "保存済み棋譜はまだありません。";
      els.list.appendChild(emptyClean);
      return;
    }

    entries.forEach(function (entry) {
      var itemClean = document.createElement("article");
      var headClean = document.createElement("div");
      var titleClean = document.createElement("div");
      var metaClean = document.createElement("div");
      var buttonClean = document.createElement("button");
      itemClean.className = "worker-kifu-item";
      headClean.className = "worker-kifu-head";
      titleClean.className = "worker-kifu-title";
      metaClean.className = "worker-kifu-meta";
      titleClean.textContent = entry.label || entry.id;
      metaClean.textContent = [
        (entry.games || 0) + "局",
        entry.mode || "-",
        "P1 " + (entry.wins && entry.wins.P1 || 0),
        "P2 " + (entry.wins && entry.wins.P2 || 0),
        "未決着 " + (entry.wins && entry.wins.draw || 0)
      ].join(" / ");
      buttonClean.type = "button";
      buttonClean.textContent = "取得";
      buttonClean.addEventListener("click", function () {
        downloadEntry(entry);
      });
      headClean.appendChild(titleClean);
      headClean.appendChild(buttonClean);
      itemClean.appendChild(headClean);
      itemClean.appendChild(metaClean);
      els.list.appendChild(itemClean);
    });
    return;
    els.list.innerHTML = "";
    if (!entries.length) {
      var empty = document.createElement("div");
      empty.className = "worker-kifu-item";
      empty.textContent = "まだ保存済み棋譜はありません。";
      els.list.appendChild(empty);
      return;
    }

    entries.forEach(function (entry) {
      var item = document.createElement("article");
      var head = document.createElement("div");
      var title = document.createElement("div");
      var meta = document.createElement("div");
      var button = document.createElement("button");
      item.className = "worker-kifu-item";
      head.className = "worker-kifu-head";
      title.className = "worker-kifu-title";
      meta.className = "worker-kifu-meta";
      title.textContent = entry.label || entry.id;
      meta.textContent = [
        entry.games + "戦",
        entry.mode || "-",
        "P1 " + (entry.wins && entry.wins.P1 || 0),
        "P2 " + (entry.wins && entry.wins.P2 || 0),
        "未決着 " + (entry.wins && entry.wins.draw || 0)
      ].join(" / ");
      button.type = "button";
      button.textContent = "取得";
      button.addEventListener("click", function () {
        downloadEntry(entry);
      });
      head.appendChild(title);
      head.appendChild(button);
      item.appendChild(head);
      item.appendChild(meta);
      els.list.appendChild(item);
    });
  }

  function refreshList() {
    return fetchSelfplayList()
      .then(function (entries) {
        renderList(entries);
      })
      .catch(function (error) {
        renderList([]);
        addLog(error.message, true);
      });
    return fetch(apiUrl("selfplay.list"))
      .then(function (response) {
        return response.text().then(function (rawText) {
          var data = rawText ? JSON.parse(rawText) : null;
          if (!response.ok || !data || !data.ok) {
            throw new Error(data && data.error ? data.error : "保存済み一覧を取得できません");
          }
          renderList(data.entries || []);
        });
      })
      .catch(function (error) {
        renderList([]);
        addLog(error.message, true);
      });
  }

  els.form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (runner.running) {
      return;
    }
    runWorker(getSettings());
  });

  els.stop.addEventListener("click", function () {
    runner.stopRequested = true;
    setStatus("停止予約しました。今の保存単位が終わったら止まります。");
  });

  els.refresh.addEventListener("click", function () {
    refreshList();
  });

  if (els.bookBuild) {
    els.bookBuild.addEventListener("click", function () {
      buildBookProposalFromSavedKifu();
    });
  }

  updateStats();
  refreshList();
}());
