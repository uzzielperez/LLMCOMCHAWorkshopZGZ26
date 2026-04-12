/**
 * Viz slides: external script so Reveal markdown + CSP (no inline scripts) still work.
 * Runs once per slide when it becomes current.
 */
(function () {
  if (typeof Reveal === "undefined") return;

  var C_LABEL = "#c8d3f5";
  var C_TRACK = "#1a2238";
  var C_MUTED = "#8892ae";
  var C_TEXT = "#e8eaf2";

  function softmax(z) {
    var mx = Math.max.apply(null, z);
    var ex = z.map(function (t) {
      return Math.exp(t - mx);
    });
    var s = ex.reduce(function (a, b) {
      return a + b;
    }, 0);
    return ex.map(function (e) {
      return e / s;
    });
  }

  function softmaxTemp(z, temp) {
    var zz = z.map(function (x) {
      return x / temp;
    });
    return softmax(zz);
  }

  function setupSoftmaxLesson(section) {
    var root = section.querySelector("#softmax-lesson-root");
    if (!root || section.dataset.softmaxLessonInit === "1") return;
    section.dataset.softmaxLessonInit = "1";

    var n = 7;
    var logits = [-0.8, -5.0, 0.5, 1.5, 4.2, -2.3, 4.0];
    var zMax = 6;

    var board = document.createElement("div");
    board.className = "sm-lesson-board";

    var left = document.createElement("div");
    left.className = "sm-lesson-lane sm-lesson-in";
    var hdIn = document.createElement("div");
    hdIn.className = "sm-lesson-lane-hd";
    hdIn.textContent = "z (logits)";
    left.appendChild(hdIn);

    var rowsIn = [];
    var i;
    for (i = 0; i < n; i++) {
      var row = document.createElement("div");
      row.className = "sm-lesson-row";
      var lab = document.createElement("span");
      lab.className = "sm-lesson-zlab";
      lab.innerHTML = "z<sub>" + (i + 1) + "</sub>";
      var inp = document.createElement("input");
      inp.type = "range";
      inp.min = String(-zMax);
      inp.max = String(zMax);
      inp.step = "0.1";
      inp.value = String(logits[i]);
      var val = document.createElement("span");
      val.className = "sm-lesson-val";
      val.textContent = logits[i].toFixed(1);
      row.appendChild(lab);
      row.appendChild(inp);
      row.appendChild(val);
      left.appendChild(row);
      rowsIn.push({ row: row, inp: inp, val: val });
      (function (ii) {
        inp.addEventListener("input", function () {
          logits[ii] = +rowsIn[ii].inp.value;
          rowsIn[ii].val.textContent = logits[ii].toFixed(1);
          paint();
        });
      })(i);
    }

    var arrow1 = document.createElement("div");
    arrow1.className = "sm-lesson-arrow";
    arrow1.setAttribute("aria-hidden", "true");
    arrow1.textContent = "→";

    var mid = document.createElement("div");
    mid.className = "sm-lesson-lane sm-lesson-softmid";
    var box = document.createElement("div");
    box.className = "sm-lesson-softbox";
    var bt = document.createElement("span");
    bt.className = "sm-lesson-softbox-title";
    bt.textContent = "softmax";
    var eq = document.createElement("div");
    eq.className = "sm-lesson-softbox-eq";
    eq.innerHTML = "p<sub>i</sub> = exp(z<sub>i</sub>) / Σ<sub>j</sub> exp(z<sub>j</sub>)";
    box.appendChild(bt);
    box.appendChild(eq);
    mid.appendChild(box);

    var arrow2 = document.createElement("div");
    arrow2.className = "sm-lesson-arrow";
    arrow2.setAttribute("aria-hidden", "true");
    arrow2.textContent = "→";

    var right = document.createElement("div");
    right.className = "sm-lesson-lane sm-lesson-out";
    var hdOut = document.createElement("div");
    hdOut.className = "sm-lesson-lane-hd";
    hdOut.textContent = "p (probs · sum = 1)";
    right.appendChild(hdOut);

    var rowsOut = [];
    for (i = 0; i < n; i++) {
      var r2 = document.createElement("div");
      r2.className = "sm-lesson-row sm-lesson-out-row";
      var pv = document.createElement("span");
      pv.className = "sm-lesson-pval";
      var bar = document.createElement("div");
      bar.className = "sm-lesson-bar-track";
      var fill = document.createElement("div");
      fill.className = "sm-lesson-bar-fill";
      bar.appendChild(fill);
      r2.appendChild(pv);
      r2.appendChild(bar);
      right.appendChild(r2);
      rowsOut.push({ row: r2, pv: pv, fill: fill });
    }

    board.appendChild(left);
    board.appendChild(arrow1);
    board.appendChild(mid);
    board.appendChild(arrow2);
    board.appendChild(right);
    root.appendChild(board);

    function paint() {
      var p = softmax(logits);
      var maxLidx = 0;
      var maxPidx = 0;
      var k;
      for (k = 1; k < n; k++) {
        if (logits[k] > logits[maxLidx]) maxLidx = k;
        if (p[k] > p[maxPidx]) maxPidx = k;
      }
      for (k = 0; k < n; k++) {
        rowsIn[k].row.classList.toggle("sm-lesson-row-maxlogit", k === maxLidx);
        rowsOut[k].pv.textContent = p[k].toFixed(2);
        rowsOut[k].fill.style.width = Math.max(0.5, p[k] * 100) + "%";
        rowsOut[k].row.classList.toggle("sm-lesson-row-maxp", k === maxPidx);
        var t = p[k];
        rowsOut[k].fill.style.background =
          "linear-gradient(90deg, hsl(" + (48 + t * 80) + ",78%,52%), hsl(" + (22 + t * 60) + ",70%,48%))";
      }
    }

    paint();
  }

  /** Slide arc-attn-walk-5: three z sliders + prose that tracks logits / softmax. */
  function setupAttnWalkZWords(section) {
    var root = section.querySelector("#attn-walk-z-words-root");
    if (!root || section.dataset.attnWalkZWordsInit === "1") return;
    if (!section.classList.contains("attn-walk-z-words-slide")) return;
    section.dataset.attnWalkZWordsInit = "1";

    var z = [1.2, 0.4, -0.3];
    var zMax = 4;
    var ord = ["first", "second", "third"];

    var controls = document.createElement("div");
    controls.className = "attn-zw-controls";

    var sliders = [];
    var i;
    for (i = 0; i < 3; i++) {
      var row = document.createElement("div");
      row.className = "attn-zw-row";
      var lab = document.createElement("label");
      lab.className = "attn-zw-lab";
      lab.setAttribute("for", "attn-zw-z" + i);
      lab.innerHTML = "z<sub>" + (i + 1) + "</sub>";
      var inp = document.createElement("input");
      inp.id = "attn-zw-z" + i;
      inp.type = "range";
      inp.min = String(-zMax);
      inp.max = String(zMax);
      inp.step = "0.1";
      inp.value = String(z[i]);
      var val = document.createElement("span");
      val.className = "attn-zw-val";
      val.textContent = z[i].toFixed(1);
      row.appendChild(lab);
      row.appendChild(inp);
      row.appendChild(val);
      sliders.push({ inp: inp, val: val });
      (function (ii) {
        inp.addEventListener("input", function () {
          z[ii] = +sliders[ii].inp.value;
          sliders[ii].val.textContent = z[ii].toFixed(1);
          paint();
        });
      })(i);
      controls.appendChild(row);
    }

    var out = document.createElement("p");
    out.className = "attn-zw-prose";
    out.setAttribute("aria-live", "polite");

    root.appendChild(controls);
    root.appendChild(out);

    function argmax(arr) {
      var m = 0;
      var j;
      for (j = 1; j < arr.length; j++) {
        if (arr[j] > arr[m]) m = j;
      }
      return m;
    }

    function paint() {
      var p = softmax(z);
      var iz = argmax(z);
      var sortedZ = z.slice().sort(function (a, b) {
        return b - a;
      });
      var zGap = sortedZ[0] - sortedZ[1];

      var gapWord =
        zGap > 2 ? "<strong>wide</strong>" : zGap > 0.75 ? "<strong>moderate</strong>" : "<strong>tight</strong>";

      var pSorted = p.slice().sort(function (a, b) {
        return b - a;
      });
      var pmax = pSorted[0];
      var ratio = pmax > 1e-9 ? pSorted[1] / pmax : 0;
      var softWord;
      if (pmax > 0.75) softWord = "<strong>very peaked</strong>";
      else if (pmax > 0.45) softWord = "<strong>peaked</strong>";
      else if (pmax > 0.28) softWord = "<strong>spread out</strong>";
      else softWord = "<strong>nearly uniform</strong>";

      var tieNote = "";
      if (ratio > 0.85 && zGap < 0.4) {
        tieNote = " (several <strong>z</strong>s are close — softmax stays <strong>flat</strong> even without a huge logit gap)";
      }

      out.innerHTML =
        "The largest <strong>z</strong> is on the <strong>" +
        ord[iz] +
        "</strong> slot; the top-two-<strong>z</strong> gap is " +
        gapWord +
        ". After softmax the attention weights are " +
        softWord +
        " — about <strong>" +
        (pmax * 100).toFixed(0) +
        "%</strong> on that same key (argmax lines up before and after softmax)." +
        tieNote;
    }

    paint();
  }

  function setupSoftmaxEmbed(section) {
    if (!section.querySelector("#embed-softmax-root")) return;
    if (section.dataset.embedSmInit === "1") return;
    section.dataset.embedSmInit = "1";
    var root = section.querySelector("#embed-softmax-root");
    var labels = ["A", "B", "C", "D", "E"];
    var logits = [3, 2, 1, 0, -1];

    var slidersWrap = document.createElement("div");
    var barsWrap = document.createElement("div");

    function paint() {
      var p = softmax(logits);
      barsWrap.innerHTML = "";
      labels.forEach(function (lab, i) {
        var row = document.createElement("div");
        row.className = "embed-prob-row";
        row.style.cssText =
          "display:grid;grid-template-columns:22px 1fr 38px;align-items:center;gap:8px;margin:5px 0;font-size:0.62em;";
        var labEl = document.createElement("span");
        labEl.textContent = lab;
        labEl.style.color = C_LABEL;
        var wrap = document.createElement("div");
        wrap.className = "embed-bar-wrap";
        var fill = document.createElement("div");
        fill.className = "embed-bar-fill";
        fill.style.width = p[i] * 100 + "%";
        wrap.appendChild(fill);
        var pct = document.createElement("span");
        pct.textContent = (p[i] * 100).toFixed(0) + "%";
        pct.style.color = C_MUTED;
        pct.style.fontSize = "0.95em";
        row.appendChild(labEl);
        row.appendChild(wrap);
        row.appendChild(pct);
        barsWrap.appendChild(row);
      });
    }

    labels.forEach(function (lab, i) {
      var row = document.createElement("div");
      row.className = "embed-row";
      var labEl = document.createElement("span");
      labEl.textContent = lab;
      labEl.style.color = C_LABEL;
      var inp = document.createElement("input");
      inp.type = "range";
      inp.min = "-2";
      inp.max = "4";
      inp.step = "0.1";
      inp.value = String(logits[i]);
      var zv = document.createElement("span");
      zv.textContent = logits[i].toFixed(1);
      zv.style.color = C_MUTED;
      zv.style.fontSize = "0.9em";
      inp.addEventListener("input", function () {
        logits[i] = +inp.value;
        zv.textContent = logits[i].toFixed(1);
        paint();
      });
      row.appendChild(labEl);
      row.appendChild(inp);
      row.appendChild(zv);
      slidersWrap.appendChild(row);
    });

    root.appendChild(slidersWrap);
    root.appendChild(barsWrap);
    paint();
  }

  function setupTempEmbed(section) {
    if (!section.querySelector("#embed-temp-root")) return;
    if (section.dataset.embedTempInit === "1") return;
    section.dataset.embedTempInit = "1";
    var root = section.querySelector("#embed-temp-root");
    var labels = ["A", "B", "C", "D", "E"];
    var logits = [3, 2, 1, 0, -1];

    var head = document.createElement("div");
    head.className = "embed-temp-label";
    var tLab = document.createElement("span");
    tLab.textContent = "T";
    var inp = document.createElement("input");
    inp.type = "range";
    inp.min = "0.25";
    inp.max = "1.75";
    inp.step = "0.05";
    inp.value = "1";
    var tv = document.createElement("span");
    tv.className = "t-val";
    tv.textContent = "1.00";
    tv.style.minWidth = "3em";
    head.appendChild(tLab);
    head.appendChild(inp);
    head.appendChild(tv);

    var barsWrap = document.createElement("div");

    function paint() {
      var T = +inp.value;
      tv.textContent = T.toFixed(2);
      var p = softmaxTemp(logits, T);
      barsWrap.innerHTML = "";
      labels.forEach(function (lab, i) {
        var row = document.createElement("div");
        row.style.cssText =
          "display:grid;grid-template-columns:22px 1fr 38px;align-items:center;gap:8px;margin:5px 0;font-size:0.62em;";
        var labEl = document.createElement("span");
        labEl.textContent = lab;
        labEl.style.color = C_LABEL;
        var wrap = document.createElement("div");
        wrap.className = "embed-bar-wrap";
        var fill = document.createElement("div");
        fill.className = "embed-bar-fill";
        fill.style.width = p[i] * 100 + "%";
        fill.style.background = "linear-gradient(90deg, #ff6b6b, #8ab4ff)";
        wrap.appendChild(fill);
        var pct = document.createElement("span");
        pct.textContent = (p[i] * 100).toFixed(0) + "%";
        pct.style.color = C_MUTED;
        row.appendChild(labEl);
        row.appendChild(wrap);
        row.appendChild(pct);
        barsWrap.appendChild(row);
      });
    }

    inp.addEventListener("input", paint);
    root.appendChild(head);
    root.appendChild(barsWrap);
    paint();
  }

  function initStoryGen(section) {
    var root = section.querySelector("#story-gen-root");
    if (!root || section.dataset.storyGenInit === "1") return;
    section.dataset.storyGenInit = "1";

    var T_GREEDY = 0.1;
    var T_WILD = 5;

    function probsAtT(logits, T) {
      return softmax(
        logits.map(function (z) {
          return z / T;
        })
      );
    }

    function buildSteps(rows, sharp) {
      return rows.map(function (r) {
        var w = r[0];
        var lab = r[1];
        var logits = lab.map(function (l, i) {
          if (sharp) {
            return l === w ? 10 : -3;
          }
          /* Mild logits so softmax(z/5) stays multi-modal (like high-T decoding). */
          if (l === w) return 2.62;
          return 2.28 + ((i * 4 + lab.length) % 6) * 0.055;
        });
        return { w: w, labels: lab, logits: logits };
      });
    }

    var GREEDY_ROWS = [
      ["Once", ["Once", "Long", "In", "The", "Every"]],
      ["upon", ["upon", "under", "near", "after", "before"]],
      ["a", ["a", "the", "one", "another", "no"]],
      ["time,", ["time,", "day,", "night,", "year,", "moment,"]],
      ["there", ["there", "here", "then", "once", "she"]],
      ["was", ["was", "is", "came", "lived", "stood"]],
      ["a", ["a", "the", "one", "her", "this"]],
      ["little", ["little", "young", "small", "curious", "brave"]],
      ["girl", ["girl", "boy", "bear", "child", "fox"]],
      ["named", ["named", "called", "known", "with", "who"]],
      ["Goldilocks.", ["Goldilocks.", "Alice.", "Rose.", "Snow", "Red"]],
      ["One", ["One", "That", "Then", "The", "Soon"]],
      ["day,", ["day,", "morning,", "afternoon,", "evening,", "night,"]],
      ["while", ["while", "when", "as", "until", "before"]],
      ["out", ["out", "in", "up", "down", "around"]],
      ["exploring,", ["exploring,", "walking,", "wandering,", "playing,", "hiking,"]],
      ["Goldilocks", ["Goldilocks", "she", "they", "it", "someone"]],
      ["stumbled", ["stumbled", "walked", "ran", "came", "stepped"]],
      ["upon", ["upon", "on", "into", "near", "toward"]],
      ["a", ["a", "the", "another", "one", "that"]],
      ["beautiful", ["beautiful", "strange", "small", "tiny", "lonely"]],
      ["cottage", ["cottage", "house", "hut", "cabin", "castle"]],
    ];

    var WILD_ROWS = [
      ["Once", ["Once", "Long", "In", "The", "Suddenly"]],
      ["upon", ["upon", "under", "near", "above", "beyond"]],
      ["a", ["a", "the", "one", "every", "no"]],
      ["time,", ["time,", "day,", "moment,", "year,", "night,"]],
      ["there", ["there", "here", "then", "once", "nowhere"]],
      ["was", ["was", "is", "came", "stood", "lived"]],
      ["a", ["a", "the", "this", "yet", "one"]],
      ["young", ["young", "old", "brave", "lost", "wise"]],
      ["and", ["and", "but", "or", "yet", "who"]],
      ["aspiring", ["aspiring", "famous", "failed", "unknown", "retired"]],
      ["web", ["web", "folk", "street", "forest", "coffee"]],
      ["artist", ["artist", "writer", "wizard", "sailor", "chef"]],
      ["from", ["from", "in", "near", "beyond", "outside"]],
      ["South", ["South", "India", "Germany", "Oregon", "Japan", "Canada", "Poland"]],
    ];

    var stepsG = buildSteps(GREEDY_ROWS, true);
    var stepsW = buildSteps(WILD_ROWS, false);

    function createPanel(title, sub, steps, T) {
      var wrap = document.createElement("div");
      wrap.className = "story-gen-panel";

      var head = document.createElement("div");
      head.className = "story-gen-head";
      head.innerHTML =
        "<span class=\"story-gen-t\">" +
        title +
        "</span><span class=\"story-gen-sub\">" +
        sub +
        "</span>";
      wrap.appendChild(head);

      var story = document.createElement("div");
      story.className = "story-gen-story";
      story.setAttribute("aria-live", "polite");
      wrap.appendChild(story);

      var probHd = document.createElement("div");
      probHd.className = "story-gen-prob-hd";
      probHd.textContent = "P(next token) · sorted";
      wrap.appendChild(probHd);

      var bars = document.createElement("div");
      bars.className = "story-gen-bars";
      wrap.appendChild(bars);

      var hint = document.createElement("p");
      hint.className = "story-gen-hint";
      wrap.appendChild(hint);

      var rowBtn = document.createElement("div");
      rowBtn.className = "story-gen-actions";
      var nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = "story-gen-next";
      nextBtn.textContent = "Next word";
      var resetBtn = document.createElement("button");
      resetBtn.type = "button";
      resetBtn.className = "story-gen-reset";
      resetBtn.textContent = "Reset";
      rowBtn.appendChild(nextBtn);
      rowBtn.appendChild(resetBtn);
      wrap.appendChild(rowBtn);

      var idx = 0;
      var words = [];

      function paintStory() {
        story.innerHTML = "";
        if (words.length === 0) {
          var ph = document.createElement("span");
          ph.className = "story-gen-placeholder";
          ph.textContent = "…";
          story.appendChild(ph);
          return;
        }
        words.forEach(function (w, i) {
          var sp = document.createElement("span");
          sp.className = "story-gen-token";
          if (i === words.length - 1) sp.classList.add("story-gen-token-last");
          sp.textContent = w + (i < words.length - 1 ? " " : "");
          story.appendChild(sp);
        });
      }

      function paintBars() {
        bars.innerHTML = "";
        if (idx >= steps.length) {
          hint.textContent = "";
          var done = document.createElement("p");
          done.className = "story-gen-done";
          done.textContent = "End of scripted demo.";
          bars.appendChild(done);
          nextBtn.disabled = true;
          return;
        }
        nextBtn.disabled = false;
        var st = steps[idx];
        var p = probsAtT(st.logits, T);
        var order = st.labels
          .map(function (l, i) {
            return { l: l, p: p[i] };
          })
          .sort(function (a, b) {
            return b.p - a.p;
          });
        var nextW = st.w;
        hint.textContent =
          "Highlighted = token this column will add next (fixed path for the demo).";

        order.forEach(function (o) {
          var row = document.createElement("div");
          row.className = "story-gen-bar-row";
          if (o.l === nextW) row.classList.add("story-gen-bar-row-active");
          var lab = document.createElement("span");
          lab.className = "story-gen-bar-lab";
          lab.textContent = o.l;
          var track = document.createElement("div");
          track.className = "story-gen-bar-track";
          var fill = document.createElement("div");
          fill.className = "story-gen-bar-fill";
          fill.style.width = Math.max(1.5, o.p * 100) + "%";
          track.appendChild(fill);
          var pct = document.createElement("span");
          pct.className = "story-gen-bar-pct";
          pct.textContent = (o.p * 100).toFixed(0) + "%";
          row.appendChild(lab);
          row.appendChild(track);
          row.appendChild(pct);
          bars.appendChild(row);
        });
      }

      function onNext() {
        if (idx >= steps.length) return;
        words.push(steps[idx].w);
        idx++;
        paintStory();
        paintBars();
      }

      function reset() {
        words = [];
        idx = 0;
        nextBtn.disabled = false;
        paintStory();
        paintBars();
      }

      nextBtn.addEventListener("click", onNext);
      resetBtn.addEventListener("click", reset);

      paintStory();
      paintBars();

      return { el: wrap, reset: reset };
    }

    root.innerHTML = "";
    var cols = document.createElement("div");
    cols.className = "story-gen-cols";
    var pan0 = createPanel("T = 0", "softmax(z / 0.1) — almost one-hot", stepsG, T_GREEDY);
    var pan5 = createPanel("T = 5", "softmax(z / 5) — spread mass", stepsW, T_WILD);
    cols.appendChild(pan0.el);
    cols.appendChild(pan5.el);
    root.appendChild(cols);

    section._storyGenReset = function () {
      pan0.reset();
      pan5.reset();
    };
  }

  function initSamplingStrategies(section) {
    var root = section.querySelector("#samp-strat-root");
    if (!root || section.dataset.sampStratInit === "1") return;
    section.dataset.sampStratInit = "1";

    var tokens = [" the", " a", " to", " and", " .", " cat", " run", " she"];
    var logits = [2.4, 1.95, 1.5, 1.25, 1.0, 0.6, 0.35, -0.2];

    var board = document.createElement("div");
    board.className = "samp-strat-board";

    var toolbar = document.createElement("div");
    toolbar.className = "samp-strat-toolbar";
    toolbar.setAttribute("role", "tablist");
    toolbar.setAttribute("aria-label", "Sampling strategy");

    var state = { mode: "greedy", T: 1, k: 3, p: 0.9 };

    var modeBtns = [];

    function distGreedy() {
      var mx = -Infinity;
      var i;
      for (i = 0; i < logits.length; i++) {
        if (logits[i] > mx) mx = logits[i];
      }
      var out = logits.map(function () {
        return 0;
      });
      for (i = 0; i < logits.length; i++) {
        if (logits[i] === mx) {
          out[i] = 1;
          break;
        }
      }
      return out;
    }

    function distTemp(T) {
      return softmax(
        logits.map(function (z) {
          return z / T;
        })
      );
    }

    function distTopK(k) {
      var p = softmax(logits);
      var order = p
        .map(function (_, i) {
          return i;
        })
        .sort(function (a, b) {
          return p[b] - p[a];
        });
      var out = p.map(function () {
        return 0;
      });
      var s = 0;
      var j;
      for (j = 0; j < k && j < order.length; j++) {
        var ix = order[j];
        out[ix] = p[ix];
        s += p[ix];
      }
      return out.map(function (x) {
        return x / s;
      });
    }

    function distTopP(p0) {
      var p = softmax(logits);
      var order = p
        .map(function (_, i) {
          return i;
        })
        .sort(function (a, b) {
          return p[b] - p[a];
        });
      var keep = {};
      var cum = 0;
      var j;
      for (j = 0; j < order.length; j++) {
        var ix = order[j];
        keep[ix] = true;
        cum += p[ix];
        if (cum >= p0) break;
      }
      var out = p.map(function (pi, i) {
        return keep[i] ? pi : 0;
      });
      var s = out.reduce(function (a, b) {
        return a + b;
      }, 0);
      if (s <= 0) return p;
      return out.map(function (x) {
        return x / s;
      });
    }

    function effectiveDist() {
      if (state.mode === "greedy") return distGreedy();
      if (state.mode === "temp") return distTemp(state.T);
      if (state.mode === "topk") return distTopK(state.k);
      if (state.mode === "topp") return distTopP(state.p);
      return softmax(logits);
    }

    var caps = {
      greedy:
        "<strong>Greedy (argmax):</strong> all sampling mass on the single best logit — deterministic; often coherent short-term but can repeat.",
      temp:
        "<strong>Temperature:</strong> you would sample from softmax(<strong>z / T</strong>). Lower <strong>T</strong> concentrates mass; higher <strong>T</strong> spreads it (more surprise).",
      topk:
        "<strong>Top-k:</strong> zero out everything outside the <strong>k</strong> largest probabilities (from the base softmax), then renormalize — hard cap on how many tails can appear.",
      topp:
        "<strong>Top-p (nucleus):</strong> take tokens from the top down until their <em>original</em> cumulative probability reaches <strong>p</strong>, drop the rest, renormalize — adapts to how confident the model is.",
    };

    var cap = document.createElement("p");
    cap.className = "samp-strat-cap";

    var barsHost = document.createElement("div");
    barsHost.className = "samp-strat-bars";

    function paintBars() {
      var d = effectiveDist();
      barsHost.innerHTML = "";
      var order = tokens
        .map(function (_, i) {
          return i;
        })
        .sort(function (a, b) {
          return d[b] - d[a];
        });
      order.forEach(function (i) {
        var row = document.createElement("div");
        row.className = "samp-strat-row";
        if (d[i] < 0.002) row.classList.add("samp-strat-row-dim");
        var lab = document.createElement("span");
        lab.className = "samp-strat-tok";
        lab.textContent = tokens[i];
        var track = document.createElement("div");
        track.className = "samp-strat-track";
        var fill = document.createElement("div");
        fill.className = "samp-strat-fill";
        fill.style.width = Math.max(0.8, d[i] * 100) + "%";
        track.appendChild(fill);
        var pct = document.createElement("span");
        pct.className = "samp-strat-pct";
        pct.textContent = (d[i] * 100).toFixed(1) + "%";
        row.appendChild(lab);
        row.appendChild(track);
        row.appendChild(pct);
        barsHost.appendChild(row);
      });
      cap.innerHTML = caps[state.mode] || caps.greedy;
    }

    var ctrlRow = document.createElement("div");
    ctrlRow.className = "samp-strat-ctrlrow";

    var tWrap = document.createElement("div");
    tWrap.className = "samp-strat-ctrl samp-strat-t-wrap samp-strat-ctrl-hidden";
    var tLab = document.createElement("span");
    tLab.className = "samp-strat-ctrl-lab";
    tLab.textContent = "T";
    var tInp = document.createElement("input");
    tInp.type = "range";
    tInp.min = "0.35";
    tInp.max = "2";
    tInp.step = "0.05";
    tInp.value = "1";
    var tVal = document.createElement("span");
    tVal.className = "samp-strat-t-val";
    tVal.textContent = "1.00";
    tWrap.appendChild(tLab);
    tWrap.appendChild(tInp);
    tWrap.appendChild(tVal);

    var kWrap = document.createElement("div");
    kWrap.className = "samp-strat-ctrl samp-strat-k-wrap samp-strat-ctrl-hidden";
    var kLab = document.createElement("span");
    kLab.className = "samp-strat-ctrl-lab";
    kLab.textContent = "k";
    kWrap.appendChild(kLab);
    var kBtns = [];
    [2, 3, 5].forEach(function (k) {
      var kb = document.createElement("button");
      kb.type = "button";
      kb.className = "samp-strat-pill";
      kb.textContent = String(k);
      kb.dataset.k = String(k);
      kb.addEventListener("click", function () {
        state.k = k;
        kBtns.forEach(function (b) {
          b.classList.toggle("samp-strat-pill-active", +b.getAttribute("data-k") === k);
        });
        if (state.mode === "topk") paintBars();
      });
      kWrap.appendChild(kb);
      kBtns.push(kb);
    });

    var pWrap = document.createElement("div");
    pWrap.className = "samp-strat-ctrl samp-strat-p-wrap samp-strat-ctrl-hidden";
    var pLab = document.createElement("span");
    pLab.className = "samp-strat-ctrl-lab";
    pLab.textContent = "p";
    pWrap.appendChild(pLab);
    var pBtns = [];
    [0.75, 0.9, 0.95].forEach(function (pv) {
      var pb = document.createElement("button");
      pb.type = "button";
      pb.className = "samp-strat-pill";
      pb.textContent = String(pv);
      pb.dataset.p = String(pv);
      pb.addEventListener("click", function () {
        state.p = pv;
        pBtns.forEach(function (b) {
          b.classList.toggle("samp-strat-pill-active", +b.getAttribute("data-p") === pv);
        });
        if (state.mode === "topp") paintBars();
      });
      pWrap.appendChild(pb);
      pBtns.push(pb);
    });

    function syncPills() {
      kBtns.forEach(function (b) {
        b.classList.toggle("samp-strat-pill-active", +b.getAttribute("data-k") === state.k);
      });
      pBtns.forEach(function (b) {
        b.classList.toggle("samp-strat-pill-active", +b.getAttribute("data-p") === state.p);
      });
    }

    function setMode(m) {
      state.mode = m;
      modeBtns.forEach(function (b) {
        var on = b.getAttribute("data-samp-mode") === m;
        b.classList.toggle("samp-strat-tab-active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      tWrap.classList.toggle("samp-strat-ctrl-hidden", m !== "temp");
      kWrap.classList.toggle("samp-strat-ctrl-hidden", m !== "topk");
      pWrap.classList.toggle("samp-strat-ctrl-hidden", m !== "topp");
      paintBars();
    }

    [
      { id: "greedy", label: "Greedy" },
      { id: "temp", label: "Temperature" },
      { id: "topk", label: "Top-k" },
      { id: "topp", label: "Top-p" },
    ].forEach(function (spec) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "samp-strat-tab";
      b.setAttribute("data-samp-mode", spec.id);
      b.setAttribute("role", "tab");
      b.textContent = spec.label;
      b.addEventListener("click", function () {
        setMode(spec.id);
      });
      toolbar.appendChild(b);
      modeBtns.push(b);
    });

    tInp.addEventListener("input", function () {
      state.T = +tInp.value;
      tVal.textContent = state.T.toFixed(2);
      if (state.mode === "temp") paintBars();
    });

    ctrlRow.appendChild(tWrap);
    ctrlRow.appendChild(kWrap);
    ctrlRow.appendChild(pWrap);

    board.appendChild(toolbar);
    board.appendChild(ctrlRow);
    board.appendChild(cap);
    board.appendChild(barsHost);
    root.appendChild(board);

    section._sampStratReset = function () {
      state.mode = "greedy";
      state.T = 1;
      state.k = 3;
      state.p = 0.9;
      tInp.value = "1";
      tVal.textContent = "1.00";
      syncPills();
      setMode("greedy");
    };

    syncPills();
    setMode("greedy");
  }

  function setupNgramSlide(section) {
    if (!section || section.dataset.vizNgramInit === "1") return;
    var ng = section.querySelector("#ng-svg");
    if (!ng) return;
    section.dataset.vizNgramInit = "1";

    /* Same marginals for every prompt — unigram has no context channel. */
    var UG_GLOBAL = {
      words: ["the", "a", "to", "and", ".", "of", "in"],
      probs: [0.17, 0.12, 0.09, 0.08, 0.075, 0.07, 0.065],
      note:
        "Unigram: corpus-wide frequencies only — this bar chart does not change when you switch Alice, code, or salad.",
    };

    var DATA = {
      alice: {
        ctx:
          '"…she had never before seen a rabbit with either a waistcoat-pocket, or a watch… she ran across the field after it, and was just in time to see it pop down a large rabbit-hole ___"',
        ng: {
          note:
            "Bigram sees only 'hole'. Mostly sees 'hole' + '.' or 'hole' + 'in' in training.",
          words: [".", "in", "under", "and", "that", "—", "<redacted_EOS>"],
          probs: [0.31, 0.22, 0.14, 0.12, 0.08, 0.07, 0.06],
        },
        tr: {
          note:
            "Transformer reads the full passage — rabbit, curiosity — understands this is a pivotal descent.",
          words: ["under", "beneath", ".", "—", "into", "and", "<redacted_EOS>"],
          probs: [0.28, 0.21, 0.14, 0.13, 0.1, 0.08, 0.06],
        },
      },
      code: {
        ctx:
          '"def find_item(arr, val):\n    for i in range(len(arr)):\n        if arr[i] == ___"',
        ng: {
          note:
            "Bigram sees '==' — in Python that's commonly followed by True, False, None.",
          words: ["True", "None", "False", "val", "0", "1", "<redacted_EOS>"],
          probs: [0.28, 0.22, 0.18, 0.14, 0.1, 0.05, 0.03],
        },
        tr: {
          note:
            "Transformer read the signature — knows val is the target. Massively boosts P(val).",
          words: ["val", "value", "target", "None", "True", "False", "<redacted_EOS>"],
          probs: [0.51, 0.18, 0.12, 0.08, 0.05, 0.04, 0.02],
        },
      },
      salad: {
        ctx:
          '"Colorless green ideas sleep furiously beside the quantum ___"',
        ng: {
          note:
            "Bigram after rare 'quantum' — weak statistics; mass spreads to common glue words.",
          words: ["the", "a", "and", "leap", "computer", ".", "field"],
          probs: [0.24, 0.18, 0.14, 0.12, 0.11, 0.11, 0.1],
        },
        tr: {
          note:
            "Transformer still uses full nonsense context — may favor safer function words or closure.",
          words: [".", "the", "mechanics", "void", "foam", "and", "machine"],
          probs: [0.23, 0.17, 0.15, 0.14, 0.13, 0.11, 0.07],
        },
      },
    };

    var cur = "alice";

    function drawBars(svgEl, d, color) {
      svgEl.innerHTML = "";
      var ns2 = "http://www.w3.org/2000/svg";
      var bH = 22,
        gap = 6,
        lW = 52,
        pW = 30,
        aW = 300 - lW - pW - 8,
        maxP = Math.max.apply(null, d.probs);
      d.words.forEach(function (w, i) {
        var p = d.probs[i],
          y = 8 + i * (bH + gap),
          bw = Math.round((p / maxP) * aW);
        function e(tag, at, tx) {
          var el = document.createElementNS(ns2, tag);
          Object.keys(at).forEach(function (k) {
            el.setAttribute(k, at[k]);
          });
          if (tx !== undefined) el.textContent = tx;
          return el;
        }
        svgEl.appendChild(
          e(
            "text",
            {
              x: lW - 3,
              y: y + bH / 2,
              "text-anchor": "end",
              "dominant-baseline": "central",
              "font-size": 10,
              fill: C_LABEL,
              "font-family": "monospace",
            },
            w
          )
        );
        svgEl.appendChild(
          e("rect", { x: lW, y: y, width: aW, height: bH, rx: 3, fill: C_TRACK })
        );
        svgEl.appendChild(
          e("rect", {
            x: lW,
            y: y,
            width: bw,
            height: bH,
            rx: 3,
            fill: color,
            opacity: 0.15 + 0.7 * (p / maxP),
          })
        );
        svgEl.appendChild(
          e(
            "text",
            {
              x: lW + aW + 4,
              y: y + bH / 2,
              "dominant-baseline": "central",
              "font-size": 9,
              fill: color,
              "font-family": "monospace",
            },
            Math.round(p * 100) + "%"
          )
        );
      });
    }

    function renderD() {
      var d = DATA[cur];
      section.querySelector("#ctx-lbl").textContent = d.ctx;
      var ugEl = section.querySelector("#ug-svg");
      if (ugEl) {
        drawBars(ugEl, UG_GLOBAL, "#8b9dc3");
        var ugNote = section.querySelector("#ug-note");
        if (ugNote) ugNote.textContent = UG_GLOBAL.note;
      }
      drawBars(section.querySelector("#ng-svg"), d.ng, "#7c6fd9");
      drawBars(section.querySelector("#tr-svg"), d.tr, "#3dd4b8");
      section.querySelector("#ng-note").textContent = d.ng.note;
      section.querySelector("#tr-note").textContent = d.tr.note;
    }

    section.querySelectorAll(".cb").forEach(function (btn) {
      btn.addEventListener("click", function () {
        cur = btn.getAttribute("data-ctx") || "alice";
        section.querySelectorAll(".cb").forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");
        renderD();
      });
    });

    renderD();
  }

  function setupAttnSlide(section) {
    if (!section || section.dataset.vizAttnInit === "1") return;
    if (!section.querySelector("#a-svg")) return;
    section.dataset.vizAttnInit = "1";

    var TOKENS = ["Alice", "fell", "down", "the", "rabbit", "hole"];
    var HEADS = [
      { name: "Syntax", color: "#7F77DD", key: "syntax" },
      { name: "Semantic", color: "#1D9E75", key: "semantic" },
      { name: "Position", color: "#EF9F27", key: "position" },
      { name: "Reference", color: "#D85A30", key: "reference" },
    ];
    var ATTN = {
      syntax: {
        Alice: [0.6, 0.05, 0.05, 0.1, 0.1, 0.1],
        fell: [0.7, 0.1, 0.05, 0.05, 0.05, 0.05],
        down: [0.05, 0.5, 0.1, 0.1, 0.15, 0.1],
        the: [0.05, 0.05, 0.05, 0.1, 0.65, 0.1],
        rabbit: [0.05, 0.05, 0.1, 0.05, 0.1, 0.65],
        hole: [0.05, 0.05, 0.1, 0.3, 0.4, 0.1],
      },
      semantic: {
        Alice: [0.5, 0.1, 0.05, 0.05, 0.2, 0.1],
        fell: [0.25, 0.35, 0.1, 0.05, 0.1, 0.15],
        down: [0.1, 0.2, 0.3, 0.05, 0.15, 0.2],
        the: [0.1, 0.05, 0.05, 0.2, 0.45, 0.15],
        rabbit: [0.1, 0.05, 0.1, 0.1, 0.2, 0.45],
        hole: [0.2, 0.15, 0.3, 0.05, 0.15, 0.15],
      },
      position: {
        Alice: [0.6, 0.25, 0.08, 0.04, 0.02, 0.01],
        fell: [0.3, 0.45, 0.15, 0.05, 0.03, 0.02],
        down: [0.1, 0.3, 0.4, 0.12, 0.05, 0.03],
        the: [0.05, 0.1, 0.25, 0.4, 0.15, 0.05],
        rabbit: [0.02, 0.05, 0.1, 0.25, 0.45, 0.13],
        hole: [0.01, 0.03, 0.05, 0.1, 0.3, 0.51],
      },
      reference: {
        Alice: [0.7, 0.05, 0.05, 0.05, 0.1, 0.05],
        fell: [0.55, 0.2, 0.05, 0.05, 0.1, 0.05],
        down: [0.1, 0.15, 0.2, 0.05, 0.2, 0.3],
        the: [0.05, 0.05, 0.05, 0.15, 0.6, 0.1],
        rabbit: [0.1, 0.05, 0.05, 0.05, 0.4, 0.35],
        hole: [0.05, 0.05, 0.1, 0.3, 0.35, 0.15],
      },
    };

    var active = "Alice",
      heads = new Set(["syntax", "semantic"]);
    var ns = "http://www.w3.org/2000/svg";

    function weights() {
      var c = new Array(6).fill(0),
        n = 0;
      heads.forEach(function (k) {
        var w = ATTN[k][active] || ATTN[k]["Alice"];
        w.forEach(function (v, i) {
          c[i] += v;
        });
        n++;
      });
      if (!n) return c;
      c = c.map(function (v) {
        return v / n;
      });
      var s = c.reduce(function (a, b) {
        return a + b;
      }, 0);
      return s > 0
        ? c.map(function (v) {
            return v / s;
          })
        : c;
    }

    function blendColor(idx) {
      var r = 0,
        g = 0,
        b = 0,
        tw = 0;
      heads.forEach(function (k) {
        var raw = ATTN[k][active] || new Array(6).fill(1 / 6);
        var w = raw[idx] || 0;
        var h = HEADS.find(function (x) {
          return x.key === k;
        });
        var hex = h.color.replace("#", "");
        r += parseInt(hex.slice(0, 2), 16) * w;
        g += parseInt(hex.slice(2, 4), 16) * w;
        b += parseInt(hex.slice(4, 6), 16) * w;
        tw += w;
      });
      if (!tw) return C_MUTED;
      return (
        "rgb(" +
        Math.round(r / tw) +
        "," +
        Math.round(g / tw) +
        "," +
        Math.round(b / tw) +
        ")"
      );
    }

    function el(tag, attrs, txt) {
      var e = document.createElementNS(ns, tag);
      Object.keys(attrs).forEach(function (k) {
        e.setAttribute(k, attrs[k]);
      });
      if (txt !== undefined) e.textContent = txt;
      return e;
    }

    function buildTokens() {
      var row = section.querySelector("#t-row");
      row.innerHTML = "";
      TOKENS.forEach(function (t) {
        var b = document.createElement("button");
        b.className = "tb" + (t === active ? " active" : "");
        b.textContent = t;
        b.addEventListener("click", function () {
          active = t;
          render();
        });
        row.appendChild(b);
      });
    }

    function buildPills() {
      var p = section.querySelector("#h-pills");
      p.innerHTML = "";
      HEADS.forEach(function (h) {
        var s = document.createElement("span");
        s.className = "hl" + (heads.has(h.key) ? " on" : "");
        s.style.color = h.color;
        s.style.background = h.color + "22";
        s.textContent = h.name;
        s.addEventListener("click", function () {
          if (heads.has(h.key) && heads.size === 1) return;
          if (heads.has(h.key)) heads.delete(h.key);
          else heads.add(h.key);
          render();
        });
        p.appendChild(s);
      });
    }

    function drawSVG() {
      var svg = section.querySelector("#a-svg");
      svg.innerHTML = "";
      var n = 6,
        bW = 72,
        bH = 30,
        gap = (680 - 80 - n * bW) / (n - 1),
        sX = 40,
        srcY = 190,
        tgtY = 40;
      var wts = weights(),
        qIdx = TOKENS.indexOf(active);
      ["Output context", "Input tokens"].forEach(function (lbl, li) {
        var y = li === 0 ? tgtY - 10 : srcY - 10;
        svg.appendChild(
          el(
            "text",
            { x: 40, y: y, "font-size": 10, fill: C_MUTED, "font-family": "sans-serif" },
            lbl
          )
        );
      });
      TOKENS.forEach(function (tok, i) {
        var w = wts[i],
          c = blendColor(i);
        var qx = sX + qIdx * (bW + gap) + bW / 2,
          tx = sX + i * (bW + gap) + bW / 2;
        var path = el("path", {
          d:
            "M " +
            qx +
            " " +
            srcY +
            " C " +
            qx +
            " " +
            (srcY + tgtY) / 2 +
            " " +
            tx +
            " " +
            (srcY + tgtY) / 2 +
            " " +
            tx +
            " " +
            (tgtY + bH),
          fill: "none",
          stroke: c,
          "stroke-width": Math.max(0.5, w * 9),
          opacity: Math.max(0.07, w),
        });
        svg.appendChild(path);
      });
      TOKENS.forEach(function (tok, i) {
        var w = wts[i],
          c = blendColor(i),
          x = sX + i * (bW + gap),
          isQ = tok === active;
        var g = el("g", {});
        g.appendChild(
          el("rect", {
            x: x,
            y: tgtY,
            width: bW,
            height: bH,
            rx: 5,
            fill: c + (isQ ? "55" : "22"),
            stroke: c,
            "stroke-width": isQ ? 1.5 : 0.5,
          })
        );
        g.appendChild(
          el("text", {
            x: x + bW / 2,
            y: tgtY + bH / 2,
            "text-anchor": "middle",
            "dominant-baseline": "central",
            "font-size": 11,
            "font-weight": isQ ? 600 : 400,
            fill: isQ ? c : C_TEXT,
            "font-family": "sans-serif",
          }, tok)
        );
        g.appendChild(
          el("text", {
            x: x + bW / 2,
            y: tgtY + bH + 11,
            "text-anchor": "middle",
            "font-size": 9,
            fill: c,
            "font-family": "sans-serif",
          }, Math.round(w * 100) + "%")
        );
        svg.appendChild(g);
      });
      TOKENS.forEach(function (tok, i) {
        var x = sX + i * (bW + gap),
          isQ = tok === active;
        var g = el("g", { style: "cursor:pointer" });
        g.addEventListener("click", function () {
          active = tok;
          render();
        });
        g.appendChild(
          el("rect", {
            x: x,
            y: srcY,
            width: bW,
            height: bH,
            rx: 5,
            fill: isQ ? "#EF9F2733" : C_TRACK,
            stroke: isQ ? "#EF9F27" : "#2a3550",
            "stroke-width": isQ ? 1.5 : 0.5,
          })
        );
        g.appendChild(
          el("text", {
            x: x + bW / 2,
            y: srcY + bH / 2,
            "text-anchor": "middle",
            "dominant-baseline": "central",
            "font-size": 11,
            "font-weight": isQ ? 600 : 400,
            fill: isQ ? "#EF9F27" : C_TEXT,
            "font-family": "sans-serif",
          }, tok)
        );
        svg.appendChild(g);
      });
      var qx2 = sX + qIdx * (bW + gap) - 4;
      svg.appendChild(
        el(
          "text",
          {
            x: qx2,
            y: srcY + bH / 2,
            "text-anchor": "end",
            "dominant-baseline": "central",
            "font-size": 9,
            fill: "#EF9F27",
            "font-family": "sans-serif",
          },
          "Q →"
        )
      );
    }

    function buildInsight() {
      var w = weights();
      var sorted = w
        .map(function (v, i) {
          return { w: v, t: TOKENS[i] };
        })
        .sort(function (a, b) {
          return b.w - a.w;
        });
      var top = sorted
        .slice(0, 2)
        .map(function (x) {
          return '"' + x.t + '" (' + Math.round(x.w * 100) + "%)";
        })
        .join(" and ");
      var hn = Array.from(heads)
        .map(function (k) {
          return HEADS.find(function (h) {
            return h.key === k;
          }).name;
        })
        .join(" + ");
      section.querySelector("#ins").textContent =
        '"' +
        active +
        '" attends most to ' +
        top +
        ". Active: " +
        hn +
        " head" +
        (heads.size > 1 ? "s" : ".") +
        ".";
    }

    function render() {
      buildTokens();
      buildPills();
      drawSVG();
      buildInsight();
    }

    render();
  }

  function resetFlowInteractive(section) {
    if (!section) return;
    section.querySelectorAll(".flow-hit").forEach(function (el) {
      el.classList.remove("flow-is-active");
      el.setAttribute("aria-pressed", "false");
    });
    var def = section.querySelector("#flow-explainer-default");
    var body = section.querySelector("#flow-explainer-body");
    if (def) def.hidden = false;
    if (body) {
      body.setAttribute("hidden", "");
      body.innerHTML = "";
      body.classList.remove("flow-detail-shown");
    }
  }

  function elText(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function tokCompareRowTokens(parent, parts, pillClass) {
    var row = elText("div", "tc-viz-row");
    parts.forEach(function (t) {
      row.appendChild(elText("span", "tc-viz-token " + pillClass, t));
    });
    parent.appendChild(row);
  }

  function buildTokCompareViz(kind) {
    var root = elText("div", "tc-viz-root");
    var cap = elText("p", "tc-viz-caption");
    var raw = elText("p", "tc-viz-raw");
    root.appendChild(cap);
    root.appendChild(raw);

    if (kind === "word") {
      cap.textContent = "One token per word (whitespace rules vary by tokenizer).";
      raw.textContent = '"The cats play"';
      tokCompareRowTokens(root, ["The", "cats", "play"], "tc-viz-token--word");
    } else if (kind === "char") {
      cap.textContent = "One token per character (Unicode code points — simplified).";
      raw.textContent = '"Hi!"';
      tokCompareRowTokens(root, ["H", "i", "!"], "tc-viz-token--char");
    } else if (kind === "subword") {
      cap.textContent = "Long / rare words split into familiar chunks (illustrative BPE-style).";
      raw.textContent = '"tokenizing"';
      tokCompareRowTokens(root, ["token", "izing"], "tc-viz-token--sub");
    } else if (kind === "byte") {
      cap.textContent = "UTF-8 bytes — fixed 256-symbol alphabet; any script.";
      raw.textContent = '"café"';
      tokCompareRowTokens(root, ["63", "61", "66", "c3", "a9"], "tc-viz-token--byte");
      root.appendChild(
        elText("p", "tc-viz-foot", "Hex = raw bytes (99 97 102 195 169 decimal). Multi-byte for é.")
      );
    } else {
      cap.textContent = "Unknown style.";
      raw.textContent = "—";
    }
    return root;
  }

  function resetTokCompareInteractive(section) {
    if (!section) return;
    section.querySelectorAll(".tok-compare-hit").forEach(function (el) {
      el.classList.remove("tok-compare-is-active");
      el.setAttribute("aria-pressed", "false");
    });
    var def = section.querySelector("#tok-compare-explainer-default");
    var body = section.querySelector("#tok-compare-explainer-body");
    if (def) def.hidden = false;
    if (body) {
      body.setAttribute("hidden", "");
      body.innerHTML = "";
      body.classList.remove("tc-viz-detail-shown");
    }
  }

  function initTokCompareInteractive(section) {
    if (!section || section.dataset.tokCompareInteractiveInit === "1") return;
    var panel = section.querySelector("#tok-compare-explainer-panel");
    var body = section.querySelector("#tok-compare-explainer-body");
    var def = section.querySelector("#tok-compare-explainer-default");
    var hits = section.querySelectorAll(".tok-compare-hit");
    if (!panel || !body || !def || !hits.length) return;
    section.dataset.tokCompareInteractiveInit = "1";

    function setActive(key) {
      hits.forEach(function (btn) {
        var on = btn.getAttribute("data-tok") === key;
        btn.classList.toggle("tok-compare-is-active", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
      if (!key) {
        def.hidden = false;
        body.setAttribute("hidden", "");
        body.innerHTML = "";
        body.classList.remove("tc-viz-detail-shown");
        return;
      }
      def.hidden = true;
      body.innerHTML = "";
      body.appendChild(buildTokCompareViz(key));
      body.removeAttribute("hidden");
      body.classList.remove("tc-viz-detail-shown");
      void body.offsetWidth;
      body.classList.add("tc-viz-detail-shown");
    }

    hits.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var k = btn.getAttribute("data-tok");
        if (btn.classList.contains("tok-compare-is-active")) {
          setActive(null);
        } else {
          setActive(k);
        }
      });
    });
  }

  function initFlowInteractive(section) {
    if (!section || section.dataset.flowInteractiveInit === "1") return;
    var panel = section.querySelector("#flow-explainer-panel");
    var body = section.querySelector("#flow-explainer-body");
    var def = section.querySelector("#flow-explainer-default");
    var hits = section.querySelectorAll(".flow-hit");
    if (!panel || !body || !def || !hits.length) return;
    section.dataset.flowInteractiveInit = "1";

    var COPY = {
      ctx:
        "<p><strong>Tokenization</strong> turns raw text into a short list of token IDs (often via BPE). Each ID selects one row in the <strong>embedding table</strong> — that finite vocabulary is the only &ldquo;alphabet&rdquo; the stack ever sees.</p>" +
        "<p>Why it matters: how numbers and typos split, the ~50k&ndash;100k cap, and how much prompt fits are all shaped <em>before</em> the Transformer runs.</p>",
      tfm:
        "<p>This block is the <strong>engine</strong>: many layers of <strong>self-attention</strong> (which positions influence which) and <strong>feed-forward</strong> MLPs, stacked deep.</p>" +
        "<p>Most chat LLMs are <strong>decoder-only</strong> (GPT-style) — not encoder&ndash;decoder like the original translation Transformer. Other architectures exist (RNNs, state-space and hybrids), but <strong>decoder Transformers</strong> still dominate frontier LLMs today.</p>",
      out:
        "<p><strong>P(t<sub>n</sub>|context)</strong> is one distribution over the whole vocabulary — a useful mental model: <strong>glorified autocomplete</strong> in a single forward pass.</p>" +
        "<p>That shorthand isn&rsquo;t the full story: data and scale make the behavior rich — yet at inference it is still <strong>next-token prediction</strong>, one choice at a time.</p>",
    };

    function setActive(key) {
      hits.forEach(function (el) {
        var on = el.getAttribute("data-flow") === key;
        el.classList.toggle("flow-is-active", on);
        el.setAttribute("aria-pressed", on ? "true" : "false");
      });
      if (!key) {
        def.hidden = false;
        body.setAttribute("hidden", "");
        body.innerHTML = "";
        body.classList.remove("flow-detail-shown");
        return;
      }
      def.hidden = true;
      body.innerHTML = COPY[key] || "";
      body.removeAttribute("hidden");
      body.classList.remove("flow-detail-shown");
      void body.offsetWidth;
      body.classList.add("flow-detail-shown");
    }

    hits.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var k = btn.getAttribute("data-flow");
        if (btn.classList.contains("flow-is-active")) {
          setActive(null);
        } else {
          setActive(k);
        }
      });
    });
  }

  function setupVizForSlide(section) {
    if (!section) return;
    setupNgramSlide(section);
    setupAttnSlide(section);
    setupAttnWalkZWords(section);
    setupSoftmaxLesson(section);
    setupSoftmaxEmbed(section);
    setupTempEmbed(section);
  }

  function goToSlideById(id) {
    var el = document.getElementById(id);
    if (!el || typeof Reveal === "undefined") return;
    var section = el.tagName === "SECTION" ? el : el.closest("section");
    if (!section) return;
    if (typeof Reveal.getIndices === "function") {
      var ix = Reveal.getIndices(section);
      Reveal.slide(ix.h, ix.v, ix.f);
      return;
    }
    var top = document.querySelectorAll(".reveal .slides > section");
    var h = -1;
    for (var i = 0; i < top.length; i++) {
      if (top[i] === section || top[i].contains(section)) {
        h = i;
        break;
      }
    }
    if (h >= 0) Reveal.slide(h, 0);
  }

  function resetMmFrameSampling(section) {
    if (!section) return;
    var hit = section.querySelector("[data-mm-sampling-hit]");
    var panel = section.querySelector("#mm-sampling-panel");
    if (hit) {
      hit.setAttribute("aria-expanded", "false");
      hit.classList.remove("mm-sampling-active");
    }
    if (panel) {
      panel.setAttribute("hidden", "");
      panel.classList.remove("mm-sampling-shown");
    }
  }

  function initMmFrameSampling(section) {
    if (!section || section.dataset.mmFrameSamplingInit === "1") return;
    if (!section.classList.contains("mm-frame-interactive-slide")) return;
    var hit = section.querySelector("[data-mm-sampling-hit]");
    var panel = section.querySelector("#mm-sampling-panel");
    if (!hit || !panel) return;
    section.dataset.mmFrameSamplingInit = "1";

    function setOpen(open) {
      if (open) {
        panel.removeAttribute("hidden");
        hit.setAttribute("aria-expanded", "true");
        hit.classList.add("mm-sampling-active");
        panel.classList.remove("mm-sampling-shown");
        void panel.offsetWidth;
        panel.classList.add("mm-sampling-shown");
      } else {
        panel.classList.remove("mm-sampling-shown");
        hit.setAttribute("aria-expanded", "false");
        hit.classList.remove("mm-sampling-active");
        panel.setAttribute("hidden", "");
      }
    }

    function toggle() {
      var isHidden = panel.hasAttribute("hidden");
      setOpen(isHidden);
    }

    hit.addEventListener("click", function (ev) {
      ev.preventDefault();
      toggle();
    });
    hit.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        toggle();
      }
    });
  }

  function initVecGeoSlide(section) {
    if (!section || section.dataset.vecGeoInit === "1") return;
    if (!section.classList.contains("emb-geo-interactive-slide")) return;
    var board = section.querySelector(".vec-geo-hit");
    var cap = section.querySelector("#vec-geo-caption");
    var la = section.querySelector("#vec-line-a");
    var lb = section.querySelector("#vec-line-b");
    var ta = section.querySelector("#vec-text-a");
    var tb = section.querySelector("#vec-text-b");
    if (!board || !la || !lb || !ta || !tb) return;

    var Ox = 80;
    var Oy = 220;
    var L = 102;
    var PAIRS = [
      {
        a: "skip",
        b: "jump",
        degA: 34,
        degB: 28,
        ca: "#e8ecf5",
        cb: "#8ab4ff",
        cap: "Synonyms like skip / jump often end up nearby — similar meaning ≈ similar direction in embedding space.",
      },
      {
        a: "cle",
        b: "ve",
        degA: 36,
        degB: 33,
        ca: "#e8ecf5",
        cb: "#8ab4ff",
        cap: "Subword pieces from our strip (cle · ve) can sit close; the model stitches meaning across chunks.",
      },
      {
        a: "land",
        b: "forest",
        degA: 32,
        degB: 30,
        ca: "#e8ecf5",
        cb: "#8ab4ff",
        cap: "Related next-token ideas (land / forest from the P(next) toy) can land in neighboring regions — not guaranteed, but often learned.",
      },
      {
        a: "time",
        b: "was",
        degA: 24,
        degB: 48,
        ca: "#e8ecf5",
        cb: "#8ab4ff",
        cap: "Different roles (time vs was) can point farther apart; geometry is whatever minimizes loss at scale.",
      },
      {
        a: "To",
        b: "date",
        degA: 22,
        degB: 42,
        ca: "#e8ecf5",
        cb: "#8ab4ff",
        cap: "Even words from the same sentence occupy different directions — the Transformer then mixes them with attention.",
      },
    ];

    section._vecGeoIdx = 0;

    function rad(d) {
      return (d * Math.PI) / 180;
    }
    function tip(deg) {
      var r = rad(deg);
      return { x: Ox + L * Math.cos(r), y: Oy - L * Math.sin(r) };
    }
    function lab(deg) {
      var r = rad(deg);
      var LL = L + 24;
      return { x: Ox + LL * Math.cos(r), y: Oy - LL * Math.sin(r) };
    }

    function paint() {
      var i = section._vecGeoIdx % PAIRS.length;
      var p = PAIRS[i];
      var pa = tip(p.degA);
      var pb = tip(p.degB);
      la.setAttribute("x1", String(Ox));
      la.setAttribute("y1", String(Oy));
      la.setAttribute("x2", String(pa.x));
      la.setAttribute("y2", String(pa.y));
      la.setAttribute("stroke", p.ca);
      lb.setAttribute("x1", String(Ox));
      lb.setAttribute("y1", String(Oy));
      lb.setAttribute("x2", String(pb.x));
      lb.setAttribute("y2", String(pb.y));
      lb.setAttribute("stroke", p.cb);
      var laP = lab(p.degA);
      var lbP = lab(p.degB);
      ta.textContent = p.a;
      tb.textContent = p.b;
      ta.setAttribute("x", String(laP.x));
      ta.setAttribute("y", String(laP.y));
      ta.setAttribute("fill", p.ca);
      tb.setAttribute("x", String(lbP.x));
      tb.setAttribute("y", String(lbP.y));
      tb.setAttribute("fill", p.cb);
      if (cap) cap.textContent = p.cap;
    }

    function nextPair() {
      section._vecGeoIdx = (section._vecGeoIdx + 1) % PAIRS.length;
      paint();
    }

    section._vecGeoPaint = paint;
    board.addEventListener("click", function (ev) {
      ev.preventDefault();
      nextPair();
    });
    board.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        nextPair();
      }
    });

    section.dataset.vecGeoInit = "1";
    paint();
  }

  function resetVecGeoSlide(section) {
    if (!section || !section.classList.contains("emb-geo-interactive-slide")) return;
    section._vecGeoIdx = 0;
    if (typeof section._vecGeoPaint === "function") section._vecGeoPaint();
  }

  function matvizMatrix(rows, cols, toneClass) {
    var g = document.createElement("div");
    g.className = "matviz-matrix" + (toneClass ? " " + toneClass : "");
    g.style.setProperty("--mv-cols", String(cols));
    for (var i = 0; i < rows * cols; i++) {
      var c = document.createElement("div");
      c.className = "matviz-cell";
      g.appendChild(c);
    }
    return g;
  }

  function initMatvizQkv(section) {
    var root = section.querySelector("#matviz-qkv-root");
    if (!root || section.dataset.matvizQkvInit === "1") return;
    section.dataset.matvizQkvInit = "1";
    var host = root.querySelector(".matviz-qkv-rows");
    var cap = root.querySelector("#matviz-qkv-cap");
    var btns = root.querySelectorAll(".matviz-tbtn[data-qkv-i]");
    host.innerHTML = "";

    var board = document.createElement("div");
    board.className = "matviz-qkv-board";

    var left = document.createElement("div");
    left.className = "matviz-qkv-xstack";
    var lx = document.createElement("div");
    lx.className = "matviz-mlab-block";
    lx.innerHTML = "<strong>X</strong> <span class=\"matviz-dimlab\">2 × d<sub>model</sub></span>";
    left.appendChild(lx);
    left.appendChild(matvizMatrix(2, 4, "matviz-tone-x"));

    var right = document.createElement("div");
    right.className = "matviz-qkv-lines";
    var projs = [
      { key: "q", wlab: "W<sub>Q</sub>", olab: "<strong>Q</strong>", tone: "matviz-tone-q" },
      { key: "k", wlab: "W<sub>K</sub>", olab: "<strong>K</strong>", tone: "matviz-tone-k" },
      { key: "v", wlab: "W<sub>V</sub>", olab: "<strong>V</strong>", tone: "matviz-tone-v" },
    ];
    projs.forEach(function (p) {
      var line = document.createElement("div");
      line.className = "matviz-qkv-line";
      line.dataset.proj = p.key;
      var op1 = document.createElement("span");
      op1.className = "matviz-op";
      op1.textContent = "×";
      line.appendChild(op1);
      var wcol = document.createElement("div");
      wcol.className = "matviz-wcol";
      var wl = document.createElement("div");
      wl.className = "matviz-mlab-block";
      wl.innerHTML = p.wlab + " <span class=\"matviz-dimlab\">d<sub>model</sub>×d<sub>k</sub></span>";
      wcol.appendChild(wl);
      wcol.appendChild(matvizMatrix(4, 3, "matviz-tone-w"));
      line.appendChild(wcol);
      var op2 = document.createElement("span");
      op2.className = "matviz-op";
      op2.textContent = "=";
      line.appendChild(op2);
      var ocol = document.createElement("div");
      ocol.className = "matviz-outcol";
      var ol = document.createElement("div");
      ol.className = "matviz-mlab-block";
      ol.innerHTML = p.olab + " <span class=\"matviz-dimlab\">2×d<sub>k</sub></span>";
      ocol.appendChild(ol);
      ocol.appendChild(matvizMatrix(2, 3, p.tone));
      line.appendChild(ocol);
      right.appendChild(line);
      line.addEventListener("click", function () {
        var j = projs.indexOf(p) + 1;
        setStep(j);
      });
    });

    board.appendChild(left);
    board.appendChild(right);
    host.appendChild(board);

    var caps = [
      "Stacked rows of <strong>X</strong> — one row per token, <strong>d<sub>model</sub></strong> wide.",
      "<strong>Q</strong> = <strong>X W<sub>Q</sub></strong>: same <strong>X</strong>, first projection (query subspace).",
      "<strong>K</strong> = <strong>X W<sub>K</sub></strong>: keys for matching against queries.",
      "<strong>V</strong> = <strong>X W<sub>V</sub></strong>: vectors that get mixed after attention weights.",
      "All three projections in parallel — then attention uses <strong>Q</strong> & <strong>K</strong> for scores and <strong>V</strong> for the blend.",
    ];

    function setStep(i) {
      section._matvizQkvStep = i;
      btns.forEach(function (b) {
        var bi = parseInt(b.getAttribute("data-qkv-i"), 10);
        b.classList.toggle("matviz-tbtn-active", bi === i);
        b.setAttribute("aria-selected", bi === i ? "true" : "false");
      });
      left.classList.remove("matviz-dim");
      var lines = right.querySelectorAll(".matviz-qkv-line");
      lines.forEach(function (ln, j) {
        ln.classList.remove("matviz-lit", "matviz-dim");
        if (i === 0) {
          ln.classList.add("matviz-dim");
        } else if (i === 4) {
          ln.classList.add("matviz-lit");
        } else if (i === j + 1) {
          ln.classList.add("matviz-lit");
        } else {
          ln.classList.add("matviz-dim");
        }
      });
      if (cap) cap.innerHTML = caps[Math.min(i, caps.length - 1)];
    }

    section._matvizQkvSetStep = setStep;
    section._matvizQkvReset = function () {
      setStep(0);
    };

    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        setStep(parseInt(b.getAttribute("data-qkv-i"), 10));
      });
    });

    setStep(0);
  }

  function initMatvizAttn(section) {
    var root = section.querySelector("#matviz-attn-root");
    if (!root || section.dataset.matvizAttnInit === "1") return;
    section.dataset.matvizAttnInit = "1";
    var stage = root.querySelector(".matviz-attn-stage");
    var cap = root.querySelector("#matviz-attn-cap");
    var btns = root.querySelectorAll(".matviz-tbtn[data-attn-i]");
    stage.innerHTML = "";

    function mkLabeledMatrix(labelHtml, rows, cols, tone) {
      var w = document.createElement("div");
      w.className = "matviz-mblk";
      var lab = document.createElement("div");
      lab.className = "matviz-mlab-block matviz-mlab-sm";
      lab.innerHTML = labelHtml;
      w.appendChild(lab);
      w.appendChild(matvizMatrix(rows, cols, tone));
      return w;
    }

    function mkScoreGrid(vals, cls) {
      var g = document.createElement("div");
      g.className = "matviz-matrix matviz-matrix-scores " + (cls || "");
      g.style.setProperty("--mv-cols", "2");
      vals.forEach(function (v) {
        var c = document.createElement("div");
        c.className = "matviz-cell matviz-cell-num";
        c.textContent = typeof v === "number" ? v.toFixed(2) : String(v);
        g.appendChild(c);
      });
      return g;
    }

    function mkHeatGrid(vals) {
      var g = document.createElement("div");
      g.className = "matviz-matrix matviz-matrix-heat";
      g.style.setProperty("--mv-cols", "2");
      vals.forEach(function (v) {
        var c = document.createElement("div");
        c.className = "matviz-cell matviz-cell-heat";
        c.textContent = v.toFixed(2);
        var a = 0.2 + v * 0.75;
        c.style.background = "rgba(94, 233, 200, " + a + ")";
        g.appendChild(c);
      });
      return g;
    }

    var s0 = document.createElement("div");
    s0.className = "matviz-attn-panel";
    s0.dataset.attnPanel = "0";
    var row0 = document.createElement("div");
    row0.className = "matviz-attn-row3";
    row0.appendChild(mkLabeledMatrix("<strong>Q</strong> (2×d<sub>k</sub>)", 2, 3, "matviz-tone-q"));
    row0.appendChild(mkLabeledMatrix("<strong>K</strong> (2×d<sub>k</sub>)", 2, 3, "matviz-tone-k"));
    row0.appendChild(mkLabeledMatrix("<strong>V</strong> (2×d<sub>k</sub>)", 2, 3, "matviz-tone-v"));
    s0.appendChild(row0);

    var s1 = document.createElement("div");
    s1.className = "matviz-attn-panel";
    s1.dataset.attnPanel = "1";
    var r1 = document.createElement("div");
    r1.className = "matviz-attn-flow";
    r1.appendChild(mkLabeledMatrix("<strong>Q</strong>", 2, 3, "matviz-tone-q"));
    var op = document.createElement("span");
    op.className = "matviz-op-lg";
    op.innerHTML = "×";
    r1.appendChild(op);
    var kt = document.createElement("div");
    kt.className = "matviz-mblk";
    kt.innerHTML = "<div class=\"matviz-mlab-block matviz-mlab-sm\"><strong>K</strong><sup>T</sup> (d<sub>k</sub>×2)</div>";
    kt.appendChild(matvizMatrix(3, 2, "matviz-tone-k"));
    r1.appendChild(kt);
    var eq = document.createElement("span");
    eq.className = "matviz-op-lg";
    eq.textContent = "=";
    r1.appendChild(eq);
    var sc = document.createElement("div");
    sc.className = "matviz-mblk";
    sc.innerHTML = "<div class=\"matviz-mlab-block matviz-mlab-sm\">Scores (2×2)</div>";
    sc.appendChild(mkScoreGrid([1.0, 0.5, 0.5, 1.0], "matviz-tone-score"));
    r1.appendChild(sc);
    s1.appendChild(r1);

    var s2 = document.createElement("div");
    s2.className = "matviz-attn-panel";
    s2.dataset.attnPanel = "2";
    var r2a = document.createElement("div");
    r2a.className = "matviz-attn-note";
    r2a.innerHTML = "Divide by <strong>√d<sub>k</sub></strong>, then <strong>softmax</strong> <em>within each row</em> → attention weights <strong>A</strong>";
    s2.appendChild(r2a);
    var r2 = document.createElement("div");
    r2.className = "matviz-attn-flow";
    r2.appendChild(mkHeatGrid([0.62, 0.38, 0.38, 0.62]));
    s2.appendChild(r2);

    var s3 = document.createElement("div");
    s3.className = "matviz-attn-panel";
    s3.dataset.attnPanel = "3";
    var r3 = document.createElement("div");
    r3.className = "matviz-attn-flow";
    var ab = document.createElement("div");
    ab.className = "matviz-mblk";
    ab.innerHTML = "<div class=\"matviz-mlab-block matviz-mlab-sm\"><strong>A</strong></div>";
    ab.appendChild(mkHeatGrid([0.62, 0.38, 0.38, 0.62]));
    r3.appendChild(ab);
    var op3 = document.createElement("span");
    op3.className = "matviz-op-lg";
    op3.textContent = "×";
    r3.appendChild(op3);
    r3.appendChild(mkLabeledMatrix("<strong>V</strong>", 2, 3, "matviz-tone-v"));
    var eq3 = document.createElement("span");
    eq3.className = "matviz-op-lg";
    eq3.textContent = "=";
    r3.appendChild(eq3);
    r3.appendChild(mkLabeledMatrix("<strong>Z</strong> output (2×d<sub>k</sub>)", 2, 3, "matviz-tone-z"));
    s3.appendChild(r3);

    [s0, s1, s2, s3].forEach(function (p) {
      stage.appendChild(p);
    });

    var caps2 = [
      "Three projections at this head — same toy shapes as the previous slide.",
      "Multiply <strong>Q</strong> by <strong>K</strong><sup>T</sup> → raw score matrix (dot products of query rows with key columns).",
      "Scaled softmax turns each row into weights that sum to 1 (toy numbers shown).",
      "<strong>Z</strong> = <strong>A V</strong>: each output row is a mix of the two value rows.",
    ];

    function setAttnStep(i) {
      section._matvizAttnStep = i;
      btns.forEach(function (b) {
        var bi = parseInt(b.getAttribute("data-attn-i"), 10);
        b.classList.toggle("matviz-tbtn-active", bi === i);
      });
      stage.querySelectorAll(".matviz-attn-panel").forEach(function (p, j) {
        p.classList.toggle("matviz-attn-panel-active", j === i);
      });
      if (cap) cap.innerHTML = caps2[i];
    }

    section._matvizAttnSetStep = setAttnStep;
    section._matvizAttnReset = function () {
      setAttnStep(0);
    };

    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        setAttnStep(parseInt(b.getAttribute("data-attn-i"), 10));
      });
    });

    stage.querySelectorAll(".matviz-attn-panel").forEach(function (p) {
      p.addEventListener("click", function () {
        var j = parseInt(p.getAttribute("data-attn-panel"), 10);
        setAttnStep(j);
      });
    });

    setAttnStep(0);
  }

  function txfPosencWavePath(phase) {
    var seg = [];
    var i;
    for (i = 0; i <= 55; i++) {
      var x = 24 + (i / 55) * 292;
      var t = ((x - 24) / 292) * Math.PI * 5 + phase;
      var y = 58 + 20 * Math.sin(t);
      seg.push((i === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1));
    }
    return seg.join(" ");
  }

  function initTxfPosenc(section) {
    var root = section.querySelector("#txf-posenc-root");
    if (!root || section.dataset.txfPosencInit === "1") return;
    section.dataset.txfPosencInit = "1";
    var sinPath = root.querySelector(".txf-posenc-sin");
    var cosPath = root.querySelector(".txf-posenc-cos");
    var marker = root.querySelector(".txf-posenc-marker");
    var cap = root.querySelector("#txf-posenc-cap");
    var btns = root.querySelectorAll("[data-txf-pos]");
    if (sinPath) sinPath.setAttribute("d", txfPosencWavePath(0));
    if (cosPath) cosPath.setAttribute("d", txfPosencWavePath(Math.PI / 2));

    function posToX(p) {
      return 24 + (p / 5) * 292;
    }

    function setPos(p) {
      p = parseInt(p, 10);
      if (marker) {
        var x = posToX(p);
        marker.setAttribute("x1", x);
        marker.setAttribute("x2", x);
      }
      btns.forEach(function (b) {
        var on = b.getAttribute("data-txf-pos") === String(p);
        b.classList.toggle("txf-posenc-tok-active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      if (cap) {
        cap.innerHTML =
          "At position <strong>" +
          p +
          "</strong>, the added vector <strong>PE</strong> is a fixed blend of sines/cosines across channels — so the stack can distinguish early vs late tokens.";
      }
    }

    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        setPos(b.getAttribute("data-txf-pos"));
      });
    });

    section._txfPosencReset = function () {
      setPos(0);
    };
    setPos(0);
  }

  function initTxfNorm(section) {
    var root = section.querySelector("#txf-norm-root");
    if (!root || section.dataset.txfNormInit === "1") return;
    section.dataset.txfNormInit = "1";
    var cap = root.querySelector("#txf-norm-cap");
    var postflow = root.querySelector(".txf-norm-postflow");
    var preflow = root.querySelector(".txf-norm-preflow");
    var btns = root.querySelectorAll("[data-txf-norm]");
    var capsNorm = {
      post:
        "<strong>Post-LN:</strong> sublayer first, add residual, <em>then</em> LayerNorm — the ordering in the original Transformer paper.",
      pre:
        "<strong>Pre-LN:</strong> LayerNorm <em>before</em> the sublayer, then add residual — common in many LLM stacks for training depth.",
    };

    function setMode(m) {
      root.classList.toggle("txf-norm-mode-post", m === "post");
      root.classList.toggle("txf-norm-mode-pre", m === "pre");
      btns.forEach(function (b) {
        b.classList.toggle("txf-norm-tbtn-active", b.getAttribute("data-txf-norm") === m);
      });
      if (postflow) postflow.setAttribute("aria-hidden", m === "pre" ? "true" : "false");
      if (preflow) preflow.setAttribute("aria-hidden", m === "post" ? "true" : "false");
      if (cap) cap.innerHTML = capsNorm[m] || capsNorm.post;
    }

    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        setMode(b.getAttribute("data-txf-norm"));
      });
    });

    section._txfNormReset = function () {
      setMode("post");
    };
    setMode("post");
  }

  function initDecLayer(section) {
    var root = section.querySelector("#dec-layer-root");
    if (!root || section.dataset.decLayerInit === "1") return;
    section.dataset.decLayerInit = "1";
    var cap = root.querySelector("#dec-layer-cap");
    var slabs = root.querySelectorAll("[data-dec-i]");
    var enc = root.querySelector(".dec-layer-enc");
    var capsDec = [
      "<strong>Masked self-attention:</strong> each position attends only to itself and <em>earlier</em> tokens (future positions masked out). Same QKV/scaled-softmax idea as the encoder.",
      "<strong>Encoder&ndash;decoder attention:</strong> queries from the decoder; <strong>K</strong> and <strong>V</strong> from the encoder so every target position can pull information from the whole source sequence.",
      "<strong>Position-wise FFN:</strong> same role as in the encoder — nonlinear transform <em>per position</em> after attention has mixed information.",
    ];

    function setDec(i) {
      i = parseInt(i, 10);
      root.setAttribute("data-dec-focus", String(i));
      slabs.forEach(function (s) {
        s.classList.toggle("dec-layer-slab-active", s.getAttribute("data-dec-i") === String(i));
      });
      if (enc) enc.classList.toggle("dec-layer-enc-lit", i === 1);
      if (cap) cap.innerHTML = capsDec[i] || capsDec[0];
    }

    slabs.forEach(function (s) {
      s.addEventListener("click", function () {
        setDec(s.getAttribute("data-dec-i"));
      });
    });

    section._decLayerReset = function () {
      setDec(0);
    };
    setDec(0);
  }

  function initEncFfnSlots(section) {
    if (!section.classList.contains("enc-ffn-interactive-slide") || section.dataset.encFfnInit === "1") return;
    section.dataset.encFfnInit = "1";
    var slots = section.querySelectorAll(".enc-ffn-slot");
    slots.forEach(function (slot) {
      slot.addEventListener("click", function () {
        slots.forEach(function (s) {
          s.classList.remove("enc-ffn-slot-active");
        });
        slot.classList.add("enc-ffn-slot-active");
      });
    });
    section._encFfnReset = function () {
      slots.forEach(function (s) {
        s.classList.remove("enc-ffn-slot-active");
      });
    };
  }

  function initDeckJumpLinks() {
    var deck = document.querySelector(".reveal");
    if (!deck || deck.dataset.deckJumpLinksInit === "1") return;
    deck.dataset.deckJumpLinksInit = "1";
    deck.addEventListener("click", function (ev) {
      var el = ev.target.closest("[data-deck-jump]");
      if (!el || !deck.contains(el)) return;
      ev.preventDefault();
      var id = el.getAttribute("data-deck-jump");
      if (id) goToSlideById(id);
    });
  }

  function initSessionArcJumps(section) {
    if (!section || section.dataset.sessionArcJumpsInit === "1") return;
    if (!section.classList.contains("session-arc-slide")) return;
    var btns = section.querySelectorAll(".journey-jump[data-arc-jump]");
    if (!btns.length) return;
    section.dataset.sessionArcJumpsInit = "1";
    btns.forEach(function (btn) {
      btn.addEventListener("click", function (ev) {
        ev.preventDefault();
        var jumpId = btn.getAttribute("data-arc-jump");
        if (jumpId) goToSlideById(jumpId);
      });
    });
  }

  function onDeckSlide(section) {
    setupVizForSlide(section);
    if (section && section.classList.contains("session-arc-slide")) {
      initSessionArcJumps(section);
    }
    if (section && section.classList.contains("flow-interactive-slide")) {
      initFlowInteractive(section);
      resetFlowInteractive(section);
    }
    if (section && section.classList.contains("tok-compare-interactive-slide")) {
      initTokCompareInteractive(section);
      resetTokCompareInteractive(section);
    }
    if (section && section.classList.contains("mm-frame-interactive-slide")) {
      initMmFrameSampling(section);
      resetMmFrameSampling(section);
    }
    if (section && section.classList.contains("emb-geo-interactive-slide")) {
      initVecGeoSlide(section);
      resetVecGeoSlide(section);
    }
    if (section && section.classList.contains("matviz-qkv-interactive-slide")) {
      initMatvizQkv(section);
      if (section._matvizQkvReset) section._matvizQkvReset();
    }
    if (section && section.classList.contains("matviz-attn-interactive-slide")) {
      initMatvizAttn(section);
      if (section._matvizAttnReset) section._matvizAttnReset();
    }
    if (section && section.classList.contains("enc-ffn-interactive-slide")) {
      initEncFfnSlots(section);
      if (section._encFfnReset) section._encFfnReset();
    }
    if (section && section.classList.contains("txf-posenc-interactive-slide")) {
      initTxfPosenc(section);
      if (section._txfPosencReset) section._txfPosencReset();
    }
    if (section && section.classList.contains("txf-norm-interactive-slide")) {
      initTxfNorm(section);
      if (section._txfNormReset) section._txfNormReset();
    }
    if (section && section.classList.contains("dec-layer-interactive-slide")) {
      initDecLayer(section);
      if (section._decLayerReset) section._decLayerReset();
    }
    if (section && section.classList.contains("story-gen-interactive-slide")) {
      initStoryGen(section);
      if (section._storyGenReset) section._storyGenReset();
    }
    if (section && section.classList.contains("samp-strat-interactive-slide")) {
      initSamplingStrategies(section);
      if (section._sampStratReset) section._sampStratReset();
    }
  }

  Reveal.on("ready", function () {
    initDeckJumpLinks();
    onDeckSlide(Reveal.getCurrentSlide && Reveal.getCurrentSlide());
  });
  Reveal.on("slidechanged", function (event) {
    onDeckSlide(event.currentSlide);
  });
})();
