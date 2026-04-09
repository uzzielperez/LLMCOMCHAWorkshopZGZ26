/**
 * Viz slides: external script so Reveal markdown + CSP (no inline scripts) still work.
 * Runs once per slide when it becomes current.
 */
(function () {
  if (typeof Reveal === "undefined") return;

  function setupNgramSlide(section) {
    if (!section || section.dataset.vizNgramInit === "1") return;
    var ng = section.querySelector("#ng-svg");
    if (!ng) return;
    section.dataset.vizNgramInit = "1";

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
              fill: "#555",
              "font-family": "monospace",
            },
            w
          )
        );
        svgEl.appendChild(
          e("rect", { x: lW, y: y, width: aW, height: bH, rx: 3, fill: "#f5f5f5" })
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
      drawBars(section.querySelector("#ng-svg"), d.ng, "#534AB7");
      drawBars(section.querySelector("#tr-svg"), d.tr, "#1D9E75");
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
      if (!tw) return "#aaa";
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
            { x: 40, y: y, "font-size": 10, fill: "#aaa", "font-family": "sans-serif" },
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
            fill: isQ ? c : "#333",
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
            fill: isQ ? "#EF9F2733" : "#f5f5f5",
            stroke: isQ ? "#EF9F27" : "#ccc",
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
            fill: isQ ? "#EF9F27" : "#333",
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

  function setupVizForSlide(section) {
    if (!section) return;
    setupNgramSlide(section);
    setupAttnSlide(section);
  }

  Reveal.on("ready", function () {
    setupVizForSlide(Reveal.getCurrentSlide && Reveal.getCurrentSlide());
  });
  Reveal.on("slidechanged", function (event) {
    setupVizForSlide(event.currentSlide);
  });
})();
