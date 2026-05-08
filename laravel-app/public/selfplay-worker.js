(function () {
  "use strict";

  var els = {
    form: document.getElementById("workerForm"),
    label: document.getElementById("labelInput"),
    mode: document.getElementById("modeInput"),
    total: document.getElementById("totalInput"),
    chunk: document.getElementById("chunkInput"),
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
    list: document.getElementById("kifuList")
  };

  var runner = {
    running: false,
    stopRequested: false,
    done: 0,
    wins: { P1: 0, P2: 0, draw: 0 }
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
  }

  function setStatus(text) {
    els.status.textContent = text;
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

  function runChunk(settings, chunkCount, chunkIndex) {
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

  function runWorker(settings) {
    var chunkIndex = 0;
    var remaining = settings.total;

    setRunning(true);
    runner.stopRequested = false;
    runner.done = 0;
    runner.wins = { P1: 0, P2: 0, draw: 0 };
    updateStats();
    addLog("開始: " + settings.total + "戦 / " + settings.mode + " / " + settings.lookahead + "手読み");

    function next() {
      var chunkCount;
      if (runner.stopRequested || remaining <= 0) {
        setRunning(false);
        setStatus("停止しました。保存済みの棋譜は一覧から取得できます。");
        refreshList();
        return Promise.resolve();
      }

      chunkCount = Math.min(settings.chunk, remaining);
      setStatus("実行中: " + (runner.done + 1) + "戦目から " + chunkCount + "戦を計算しています。");
      return runChunk(settings, chunkCount, chunkIndex)
        .then(function (result) {
          return saveChunk(settings, result, chunkIndex).then(function (entry) {
            mergeSummary(result);
            remaining -= chunkCount;
            addLog("保存: " + entry.label + " / P1 " + entry.wins.P1 + " P2 " + entry.wins.P2 + " 未決着 " + entry.wins.draw);
            chunkIndex += 1;
            return next();
          });
        });
    }

    return next().then(function () {
      if (!runner.stopRequested) {
        setRunning(false);
        setStatus("完了しました。");
        addLog("完了: " + runner.done + "戦");
        refreshList();
      }
    }).catch(function (error) {
      setRunning(false);
      setStatus("エラーで停止しました: " + error.message);
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

  function renderList(entries) {
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

  updateStats();
  refreshList();
}());
