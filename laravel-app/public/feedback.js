(function () {
  var els = {
    accessCountLabel: document.getElementById("accessCountLabel"),
    accessUpdatedLabel: document.getElementById("accessUpdatedLabel"),
    feedbackInput: document.getElementById("feedbackInput"),
    submitFeedbackBtn: document.getElementById("submitFeedbackBtn"),
    refreshFeedbackBtn: document.getElementById("refreshFeedbackBtn"),
    feedbackStatus: document.getElementById("feedbackStatus"),
    feedbackList: document.getElementById("feedbackList")
  };

  function buildApiUrl(action) {
    return "api?action=" + encodeURIComponent(action);
  }

  function apiRequest(url, options) {
    return fetch(url, options).then(function (response) {
      return response.text().then(function (rawText) {
        var data = null;
        if (rawText) {
          try {
            data = JSON.parse(rawText);
          } catch (error) {
            throw new Error(rawText.slice(0, 240));
          }
        }
        if (!response.ok || !data || data.ok === false) {
          throw new Error((data && data.error) || response.statusText || "Request failed");
        }
        return data;
      });
    });
  }

  function formatSiteDate(value) {
    if (!value) {
      return "";
    }
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }
    return date.toLocaleString("ja-JP");
  }

  function renderFeedbackList(items) {
    els.feedbackList.innerHTML = "";
    if (!items || !items.length) {
      var empty = document.createElement("p");
      empty.className = "feedback-empty";
      empty.textContent = "まだ投稿はありません。最初の感想を書けます。";
      els.feedbackList.appendChild(empty);
      return;
    }
    items.forEach(function (item) {
      var article = document.createElement("article");
      article.className = "feedback-item";
      var body = document.createElement("p");
      body.textContent = item.message || "";
      var time = document.createElement("time");
      time.textContent = formatSiteDate(item.createdAt);
      article.appendChild(body);
      article.appendChild(time);
      els.feedbackList.appendChild(article);
    });
  }

  function renderSiteInfo(data) {
    var stats = data && data.stats ? data.stats : {};
    els.accessCountLabel.textContent = String(stats.accessCount || 0);
    els.accessUpdatedLabel.textContent = stats.updatedAt ? "最終更新: " + formatSiteDate(stats.updatedAt) : "";
    renderFeedbackList(data && data.feedback ? data.feedback : []);
  }

  function loadFeedback() {
    els.feedbackStatus.textContent = "読み込み中...";
    return apiRequest(buildApiUrl("site.stats"), {
      method: "GET"
    }).then(function (data) {
      renderSiteInfo(data);
      els.feedbackStatus.textContent = "掲示板を更新しました。";
    }).catch(function (error) {
      els.feedbackStatus.textContent = "掲示板の取得に失敗しました: " + error.message;
    });
  }

  function submitFeedback() {
    var message = els.feedbackInput.value.trim();
    if (!message) {
      els.feedbackStatus.textContent = "投稿内容を入力してください。";
      return Promise.resolve();
    }
    els.submitFeedbackBtn.disabled = true;
    els.feedbackStatus.textContent = "投稿中...";
    return apiRequest(buildApiUrl("feedback.post"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message })
    }).then(function (data) {
      els.feedbackInput.value = "";
      renderSiteInfo(data);
      els.feedbackStatus.textContent = "投稿しました。";
    }).catch(function (error) {
      els.feedbackStatus.textContent = "投稿に失敗しました: " + error.message;
    }).finally(function () {
      els.submitFeedbackBtn.disabled = false;
    });
  }

  els.submitFeedbackBtn.addEventListener("click", submitFeedback);
  els.refreshFeedbackBtn.addEventListener("click", loadFeedback);
  loadFeedback();
}());
