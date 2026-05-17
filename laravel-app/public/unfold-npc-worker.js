(function () {
  "use strict";

  function createClassList() {
    var classes = {};
    return {
      add: function () {
        Array.prototype.forEach.call(arguments, function (name) {
          classes[name] = true;
        });
      },
      remove: function () {
        Array.prototype.forEach.call(arguments, function (name) {
          delete classes[name];
        });
      },
      toggle: function (name, force) {
        if (force === true) {
          classes[name] = true;
          return true;
        }
        if (force === false) {
          delete classes[name];
          return false;
        }
        classes[name] = !classes[name];
        return classes[name];
      },
      contains: function (name) {
        return !!classes[name];
      }
    };
  }

  function DummyElement(tagName) {
    this.tagName = (tagName || "div").toUpperCase();
    this.children = [];
    this.childNodes = this.children;
    this.style = {};
    this.dataset = {};
    this.attributes = {};
    this.classList = createClassList();
    this.hidden = false;
    this.disabled = false;
    this.checked = false;
    this.value = "";
    this.textContent = "";
    this.innerHTML = "";
    this.className = "";
  }

  DummyElement.prototype.appendChild = function (child) {
    this.children.push(child);
    return child;
  };
  DummyElement.prototype.insertBefore = function (child, referenceNode) {
    var index = this.children.indexOf(referenceNode);
    if (index < 0) {
      this.children.push(child);
    } else {
      this.children.splice(index, 0, child);
    }
    this.childNodes = this.children;
    return child;
  };
  DummyElement.prototype.prepend = function (child) {
    this.children.unshift(child);
    return child;
  };
  DummyElement.prototype.removeChild = function (child) {
    this.children = this.children.filter(function (item) { return item !== child; });
    this.childNodes = this.children;
    return child;
  };
  DummyElement.prototype.remove = function () {};
  DummyElement.prototype.replaceChildren = function () {
    this.children = Array.prototype.slice.call(arguments);
    this.childNodes = this.children;
  };
  DummyElement.prototype.addEventListener = function () {};
  DummyElement.prototype.removeEventListener = function () {};
  DummyElement.prototype.dispatchEvent = function () { return true; };
  DummyElement.prototype.setAttribute = function (name, value) {
    this.attributes[name] = String(value);
  };
  DummyElement.prototype.getAttribute = function (name) {
    return this.attributes[name] || null;
  };
  DummyElement.prototype.removeAttribute = function (name) {
    delete this.attributes[name];
  };
  DummyElement.prototype.querySelector = function () {
    return new DummyElement("div");
  };
  DummyElement.prototype.querySelectorAll = function () {
    return [];
  };
  DummyElement.prototype.closest = function () {
    return null;
  };
  DummyElement.prototype.focus = function () {};
  DummyElement.prototype.blur = function () {};
  DummyElement.prototype.scrollIntoView = function () {};
  DummyElement.prototype.getBoundingClientRect = function () {
    return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
  };
  DummyElement.prototype.cloneNode = function () {
    return new DummyElement(this.tagName);
  };
  DummyElement.prototype.getContext = function () {
    return null;
  };

  var elementCache = {};
  var documentElement = new DummyElement("html");
  var body = new DummyElement("body");

  self.window = self;
  self.__UNFOLD_NPC_WORKER__ = true;
  self.document = {
    documentElement: documentElement,
    body: body,
    head: new DummyElement("head"),
    getElementById: function (id) {
      if (!elementCache[id]) {
        elementCache[id] = new DummyElement("div");
      }
      return elementCache[id];
    },
    createElement: function (tagName) {
      return new DummyElement(tagName);
    },
    createTextNode: function (text) {
      var node = new DummyElement("#text");
      node.textContent = String(text || "");
      return node;
    },
    querySelector: function () {
      return new DummyElement("div");
    },
    querySelectorAll: function () {
      return [];
    },
    addEventListener: function () {},
    removeEventListener: function () {}
  };
  self.localStorage = {
    getItem: function () { return null; },
    setItem: function () {},
    removeItem: function () {}
  };
  try {
    if (!self.navigator) {
      self.navigator = { userAgent: "UNFOLD NPC Worker" };
    }
  } catch (error) {
    // WorkerGlobalScope.navigator is read-only in modern browsers.
  }
  self.history = self.history || { replaceState: function () {}, pushState: function () {} };
  self.requestAnimationFrame = self.requestAnimationFrame || function (callback) {
    return setTimeout(function () { callback(Date.now()); }, 16);
  };
  self.cancelAnimationFrame = self.cancelAnimationFrame || function (id) {
    clearTimeout(id);
  };
  var bootReadyPromise = Promise.resolve();

  function loadNpcBookForWorker() {
    var request;
    var book;
    var urls = [
      "api?action=npc.book.current",
      "unfold-npc-book.json?v=20260516a"
    ];
    var index;
    if (typeof XMLHttpRequest !== "function") {
      return;
    }
    if (!self.UNFOLD_NPC_ENGINE || typeof self.UNFOLD_NPC_ENGINE.applyNpcBookOverrides !== "function") {
      return;
    }
    try {
      for (index = 0; index < urls.length; index += 1) {
        try {
          request = new XMLHttpRequest();
          request.open("GET", urls[index], false);
          request.send(null);
          if (request.status >= 200 && request.status < 300 && request.responseText) {
            book = JSON.parse(request.responseText);
            if (book && book.ok && book.book) {
              book = book.book;
            }
            self.UNFOLD_NPC_ENGINE.applyNpcBookOverrides(book, urls[index]);
            return;
          }
        } catch (loadError) {
          // Try the next source.
        }
      }
    } catch (error) {
      // The embedded book remains active when the optional external book is unavailable.
    }
  }

  function postReady() {
    self.postMessage({
      type: "ready",
      wasm: self.UNFOLD_NPC_ENGINE && typeof self.UNFOLD_NPC_ENGINE.getWasmStatus === "function"
        ? self.UNFOLD_NPC_ENGINE.getWasmStatus()
        : null
    });
  }

  try {
    importScripts("app.js?v=20260517npc12");
    if (!self.UNFOLD_NPC_ENGINE || typeof self.UNFOLD_NPC_ENGINE.chooseActionForState !== "function") {
      throw new Error("NPC engine API was not exposed: " + (
        self.document.getElementById("testOutput").textContent ||
        self.document.getElementById("messageLabel").textContent ||
        "no boot diagnostics"
      ));
    }
    loadNpcBookForWorker();
    if (typeof self.UNFOLD_NPC_ENGINE.loadWasmEngine === "function") {
      bootReadyPromise = self.UNFOLD_NPC_ENGINE.loadWasmEngine()
        .catch(function () {
          return self.UNFOLD_NPC_ENGINE.getWasmStatus();
        });
    }
    bootReadyPromise.then(postReady);
  } catch (error) {
    self.postMessage({
      type: "init-error",
      error: error && error.stack ? error.stack : String(error)
    });
  }

  function handleWorkerMessage(event) {
    var data = event.data || {};
    var startedAt = Date.now();
    var result;
    if (data.type === "selfplayBatch") {
      try {
        result = self.UNFOLD_NPC_ENGINE.runNpcSelfPlayBatch(data.payload || {});
        self.postMessage({
          type: "selfplayResult",
          ok: true,
          requestId: data.requestId,
          result: result,
          thinkMs: Date.now() - startedAt
        });
      } catch (error) {
        self.postMessage({
          type: "selfplayResult",
          ok: false,
          requestId: data.requestId,
          error: error && error.stack ? error.stack : String(error),
          thinkMs: Date.now() - startedAt
        });
      }
      return;
    }
    if (data.type === "seedSearchMemory") {
      try {
        if (self.UNFOLD_NPC_ENGINE && typeof self.UNFOLD_NPC_ENGINE.importNpcSearchMemory === "function") {
          self.UNFOLD_NPC_ENGINE.importNpcSearchMemory(data.payload || {});
        }
      } catch (error) {
        // Search memory is an optimization. Ignore invalid snapshots.
      }
      return;
    }
    if (data.type !== "chooseAction") {
      return;
    }
    try {
      result = self.UNFOLD_NPC_ENGINE.chooseActionForState(data.payload || {});
      self.postMessage({
        type: "result",
        ok: true,
        requestId: data.requestId,
        turnToken: data.turnToken,
        action: result ? result.action : null,
        searchStats: result && result.searchStats ? result.searchStats : null,
        searchMemory: result && result.searchMemory ? result.searchMemory : null,
        thinkMs: Date.now() - startedAt
      });
    } catch (error) {
      self.postMessage({
        type: "result",
        ok: false,
        requestId: data.requestId,
        turnToken: data.turnToken,
        error: error && error.stack ? error.stack : String(error),
        thinkMs: Date.now() - startedAt
      });
    }
  }

  self.onmessage = function (event) {
    bootReadyPromise.then(function () {
      handleWorkerMessage(event);
    });
  };
}());
