<!-- .slide: class="deck-title" -->

# LLMs: **Inside Out**

<p class="deck-subtitle">From Transformers to Agents — A 2-Hour Deep Dive</p>
<p class="deck-author">Uzziel Perez · La Salle Campus, Barcelona</p>

---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">Agenda</div>

## Today's Agenda

<div class="slide-split">
<div>

### Hour 1 — Lecture
- How LLMs actually work
- The full training stack
- Capabilities & honest limitations
- LLMs as scientists (AI Scientist)
- Agents, RAG & MCP

</div>
<div>

### Hour 2 — Hands-On
- Feel the limits of a vanilla LLM
- Build a RAG pipeline from scratch
- Break it and fix it
- *Demo:* Fine-tuning a real model

</div>
</div>

<div class="takeaway"><strong>Goal:</strong> Leave today able to <strong>explain</strong> how LLMs work, <strong>build</strong> a RAG pipeline, and <strong>critically evaluate</strong> what LLMs can and cannot do.</div>

---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">Roadmap</div>

## Lecture roadmap

<div class="key-grid cols-2">
<div class="key-box"><span class="key-box-title">Part 1 — Overview</span><p>Tokenization, next-token prediction, loss, probability intuition</p></div>
<div class="key-box"><span class="key-box-title">Part 2 — More math</span><p>Attention step-by-step (QKV, scores, softmax); optional deep breath</p></div>
<div class="key-box"><span class="key-box-title">Part 3 — nanoGPT</span><p>A minimal GPT you can read; train on Shakespeare or your own data</p></div>
<div class="key-box"><span class="key-box-title">Part 4 — Beyond LLMs</span><p>Stack, alignment, agents, RAG, MCP, limitations</p></div>
</div>

<div class="takeaway">Part 2 is the densest block — if you need a break, take it before we open the matrices.</div>

---

<!-- .slide: class="section-slide" -->
# 01
## How LLMs Actually Work

<div class="desc">Tokens · Loss · Probability · Attention · nanoGPT · Scaling · Generation</div>

<div class="takeaway">This block is the engine room: tokens, loss, attention, a toy GPT, then how we actually generate text.</div>

---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">01 · Core</div>

## The Core Idea

<div class="slide-split">
<div>

- One objective: **P( next token | context )**
- No symbolic rules — only **gradient descent** on trillions of tokens
- Emergent capabilities appear at scale: instructions, reasoning, code
- Nobody fully understands **why** this single trick produces general abilities

</div>
<div class="split-right">

```text
"The cat sat on the ___"

Vocabulary:      P(next)
  mat            0.32  ████████
  floor          0.18  █████
  chair          0.12  ███
  bed            0.09  ██
  …              …
  ───────────────────
  sum = 1.0
```

</div>
</div>

<div class="takeaway">The whole training game is guessing the next piece of text; surprisingly, that one trick scales into assistants.</div>

---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">01 · Prediction</div>

## Next-word predictor

<div class="slide-split">
<div>

- The model is a **function**: past tokens in → probability list for **one** next token out
- "Understanding" is not programmed — it is *whatever makes the loss go down*
- Chat, tools, reasoning traces are all built **on top of** this objective later

</div>
<div class="split-right">

```text
┌────────────────────────┐
│  context tokens        │
│  [t₁, t₂, … , tₙ₋₁]  │
└──────────┬─────────────┘
           ↓
    ┌──────────────┐
    │  Transformer  │
    └──────┬───────┘
           ↓
   P( tₙ | context )
   one probability per
   vocab entry (~50k)
```

</div>
</div>

<div class="takeaway">Think of it as fancy autocomplete: past text in, a probability list for the very next token out.</div>
---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">01 · Tokens</div>

## Tokenisation

<div class="slide-split">
<div>

- Models don't see *words* — they see **tokens** (sub-word pieces)
- **BPE** learns merges from byte-pairs; vocab ≈ 50k–100k entries
- `"unbelievable"` → `["un", "believ", "able"]`
- Numbers tokenize **poorly** — `"1024"` often becomes 2–3 tokens

</div>
<div class="split-right">

```text
"Hello, world!"
       ↓ BPE tokenizer
 [9906, 11, 1917, 0]
       ↓ decode
 ["Hello", ",", " world", "!"]

Each integer = one row
in the embedding table.
```

</div>
</div>

<div class="takeaway">The model never sees “words” the way you do—only variable-length chunks from its tokenizer.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">01 · Loss</div>

## The loss function (1/3) — Cross-entropy

<div class="slide-split">
<div>

- Model outputs logits `z` over vocabulary; softmax gives `p`
- The **label** is whichever token actually comes next (one-hot)
- Cross-entropy picks the **true token’s log-prob** and penalizes low confidence

</div>
<div class="split-right">

```text
Vocab:  mat  floor chair bed  …
Logits: 3.1  1.8   0.9  0.2
           ↓ softmax
Probs:  0.42 0.22  0.11 0.05 …
                               
True next = "mat" ✓
L = -log(0.42) = 0.87

Lower L = more probability
on the right answer.
```

</div>
</div>

<div class="takeaway">Training is thousands of tiny quizzes: did you put enough probability on the token that really came next?</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">01 · Loss</div>

## The loss function (2/3) — Teacher forcing

<div class="slide-split">
<div>

- During training, inputs are the **real** previous tokens from the dataset
- The model never sees its own guesses in the forward pass
- At generation time, history is partly **model-generated** — that gap is why decoding tricks matter

</div>
<div class="split-right">

```text
TRAINING (teacher forcing):
  real tokens → [The] [cat] [sat]
  model predicts:  cat?  sat?  on?
  loss on each position

GENERATION (autoregressive):
  [The] → "cat"
  [The][cat] → "sat"
  [The][cat][sat] → "on"
   ↑ model reads its OWN output
```

</div>
</div>

<div class="takeaway">While learning, the model reads the real textbook; while chatting, it reads its own rough draft—hence decoding tricks.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">01 · Loss</div>

## The loss function (3/3) — What "learning" means

<div class="slide-split">
<div>

- **Objective:** minimize average **negative log-likelihood** across the training corpus
- Equivalently: maximize probability assigned to **actual** continuations
- Grammar, facts, reasoning are **not programmed** — only better next-token odds
- Better loss → better calibrated probabilities → better sampling (still not guaranteed truth)

</div>
<div class="split-right">

```text
L = (1/|D|) Σ -log P(tₜ | t<ₜ ; θ)
             ↑
    every position in
    the training corpus

θ = model weights

SGD nudges θ so that L
goes down a little each step.
```

</div>
</div>

<div class="takeaway">Lower loss means better next-token odds on average—not a certificate of truth or ethics.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">01 · Probability</div>

## Probability warm-up — Toy counts (Alice)

<div class="slide-split">
<div>

Illustrative mini-corpus (not real):

- 66 total tokens: **"Alice"** appears 2×, **"of"** appears 3×
- **Unigram**: `P(Alice) ≈ 2/66`, `P(of) ≈ 3/66`
- **Bigram**: `P(of | Alice)` = count("Alice of") / count("Alice")
- Real LMs use neural scores instead of raw counts — same *idea*, smoother estimator

</div>
<div class="split-right">

```text
Tiny corpus (66 tokens):
 "Alice fell down the rabbit
  hole and Alice found a ..."

Unigram table:
  Alice  → 2/66 = 3.0%
  of     → 3/66 = 4.5%
  the    → 8/66 = 12.1%

Bigram table:
  P(of | Alice)  = 1/2 = 50%
  P(fell | Alice)= 1/2 = 50%
```

</div>
</div>

<div class="takeaway">Counting n-grams is the kindergarten version of what neural nets learn smoothly at scale.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">01 · Probability</div>

## Why "word salad" can score like English

<div class="slide-split">
<div>

- A **unigram** model multiplies marginals — **any** word ordering scores the same
- A **sentence** is not “more probable” unless the model uses **context**
- Neural LMs condition on **full left context** — that breaks the bag-of-words failure

</div>
<div class="split-right">

```text
Unigram (no order):
  P("cat sat the on") =
  P("the cat sat on") =
  P(the)·P(cat)·P(sat)·P(on)
  → same score!

Bigram (order matters):
  P(the|<s>)·P(cat|the)·P(sat|cat)·P(on|sat)
  ≠
  P(cat|<s>)·P(sat|cat)·P(the|sat)·P(on|the)
  → real sentence wins
```

</div>
</div>

<div class="takeaway">If you ignore word order, any shuffle looks equally silly—context is what makes real sentences stand out.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">01 · Evaluation</div>

## Evaluating language models — Perplexity

<div class="slide-split">
<div>

- **Perplexity** ≈ `exp( average negative log-likelihood per token )` on held-out text
- Lower perplexity ⇒ better calibrated predictions (not “smarter”)
- **Scaling laws** relate model/data size to loss — useful for comparing training runs

</div>
<div class="split-right">

```text
 Perplexity
    │
 80 │ ●
    │   ●
 40 │     ●
    │       ● ●
 20 │            ● ● ●
    │                   ●●●
 10 │─────────────────
    └──────────────────
     10M  100M  1B  10B
       Model parameters
```

</div>
</div>

<div class="takeaway">Perplexity is “how surprised was the model on held-out text”; scaling laws say bigger budgets usually help until they don’t.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">01 · Attention</div>

## Self-Attention: Q, K, V

<div class="slide-split">
<div>

Predicting the next token after `"mat"` in *The cat sat on the mat* — attention might put more weight on **cat** than on distant words (illustrative).

| Token | Weight |
|-------|--------|
| cat   | **0.6** |
| the   | 0.3 |
| The   | 0.1 |

- **Q (query)** — “What am I looking for?”
- **K (key)** — “What do I advertise?”
- **V (value)** — “What vector do I add if I’m selected?”

`S = QK^T / √d_k` → **softmax** → weights **A** → mix **AV**. *Multi-head:* several patterns in parallel, concat, then one more linear.

</div>
<div class="split-right">

```text
Token IDs
    ↓ embed
 x₁ … xₙ   (vectors per position)
    ↓  W_Q, W_K, W_V
 Q    K    V   (per head)
    ↓
 scores = QK^T / √d_k
    ↓ softmax (per row)
 weights A
    ↓
 context = A · V
    ↓
 multi-head → concat → W_o
```

</div>
</div>

<div class="takeaway">Each position learns which other words to borrow meaning from before predicting what comes next.</div>

---

<!-- .slide: class="viz-slide" -->
## N-gram vs Transformer — Probability Distribution

<div class="viz-hint">Try both stories: <strong>left</strong> = bigram (only the last token matters). <strong>Right</strong> = transformer (full passage). Watch how the top guesses and the bars change.</div>

<div class="viz-wrap">
<style>
#ctx-btns { display:flex; gap:8px; margin-bottom:10px; }
.cb { border:1px solid #ccc; border-radius:6px; background:#f7f7f7; color:#555;
      padding:3px 14px; font-size:0.52em; cursor:pointer; font-family:inherit; transition:background .15s; }
.cb.active { background:#ece9ff; border-color:#6C63FF; color:#6C63FF; }
#ctx-lbl { font-family:monospace; font-size:0.48em; background:#f5f5f5; border:1px solid #e2e2e2;
           border-radius:6px; padding:6px 10px; margin-bottom:10px; color:#333; white-space:pre-wrap; line-height:1.4; }
#dist-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.dist-head { font-size:0.5em; font-weight:600; color:#555; margin:0 0 4px; }
.dist-note { font-size:0.44em; color:#888; margin:4px 0 0; line-height:1.4; }
</style>

<div id="ctx-btns">
  <button class="cb active" data-ctx="alice" type="button">Alice in Wonderland</button>
  <button class="cb" data-ctx="code" type="button">Python code</button>
</div>
<div id="ctx-lbl"></div>
<div id="dist-grid">
  <div>
    <p class="dist-head" style="color:#534AB7">N-gram model (bigram)</p>
    <svg id="ng-svg" width="100%" viewBox="0 0 300 210"></svg>
    <p class="dist-note" id="ng-note"></p>
  </div>
  <div>
    <p class="dist-head" style="color:#1D9E75">Transformer</p>
    <svg id="tr-svg" width="100%" viewBox="0 0 300 210"></svg>
    <p class="dist-note" id="tr-note"></p>
  </div>
</div>
</div>

<div class="takeaway">Same blank, two brains: the bigram only sees a sliver of history; the transformer uses the whole passage you showed it.</div>

---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">01 · Attention</div>

## h Subspaces (one per head)

<div class="slide-split">
<div>

Each head projects into its **own** low-dimensional space:

- **Head 1** might learn syntax (subject–verb links)
- **Head 2** might track position (nearby tokens)
- **Head 3** might follow co-reference (pronouns → nouns)
- Outputs get **concatenated**, then mixed by W₀

</div>
<div class="split-right">

```text
X (all tokens)
  │
  ├── head 1: Q₁ K₁ V₁ → attn₁
  ├── head 2: Q₂ K₂ V₂ → attn₂
  ├── head 3: Q₃ K₃ V₃ → attn₃
  └── head h: Qₕ Kₕ Vₕ → attnₕ
  │
  concat → W₀ → output
```

</div>
</div>

<div class="takeaway">Attention heads are parallel specialists—syntax, long range, whatever—whose outputs get stitched back together.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">01 · Math</div>

## More math (1/2) — From tokens to Q, K, V

<div class="slide-split">
<div>

- Token IDs → **embedding matrix** → vectors `xₜ ∈ ℝᵈ`
- Three learned projections create the attention inputs:

<div class="key-grid">
<div class="key-box">
<span class="key-box-title">Q (query)</span>
<p>"What am I looking for?"</p>
</div>
<div class="key-box">
<span class="key-box-title">K (key)</span>
<p>"What do I advertise?"</p>
</div>
<div class="key-box">
<span class="key-box-title">V (value)</span>
<p>"What content do I carry if selected?"</p>
</div>
</div>

</div>
<div class="split-right">

```text
token IDs: [42, 17, 88, 5]
                ↓ embed
        x₁  x₂  x₃  x₄
        │   │   │   │
        ×W_Q ×W_K ×W_V
        │   │   │
        Q    K    V
     (seq×d) (seq×d) (seq×d)
```

</div>
</div>

<div class="takeaway">Embeddings turn symbols into numbers; Q/K/V are three learned ways to ask, advertise, and carry content.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">01 · Math</div>

## More math (2/2) — Scores, scaling, softmax

<div class="slide-split">
<div>

- **Raw scores:** `S = Q Kᵀ` (seq × seq matrix)
- **Scale** by `√dₖ` so dot products don’t explode
- **Softmax** turns each row into a distribution (weights sum to 1)
- Output = weighted mix of value vectors: **A · V**

**Why softmax?** Differentiable, positive weights, competitive allocation, stable gradients.

</div>
<div class="split-right">

```text
S = Q Kᵀ        (seq × seq)
        ↓ scale
S / √dₖ
        ↓ softmax (row-wise)
A = attention weights
  ┌                   ┐
  │ .52 .30 .10 .08 │ ← row sums to 1
  │ .15 .45 .25 .15 │
  │ ...              │
  └                   ┘
        ↓
output = A · V    (seq × d)
```

</div>
</div>

<div class="takeaway">Compare every word to every word, soften with softmax, then take a weighted mix of value vectors—that mix is the update.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">01 · Attention</div>

## Multi-Head Attention

<div class="slide-split">
<div>

Heads run in parallel, then merge:

- Each head computes its own `Aᵢ = softmax(Qᵢ Kᵢᵀ / √dₖ)`
- Each head produces context: `Cᵢ = Aᵢ Vᵢ`
- All heads are **concatenated** and projected through **W₀**
- Multi-head = multiple **“views”** of the same sequence

</div>
<div class="split-right">

```text
Input X
 ├─ Head 1 → C₁ (syntax)
 ├─ Head 2 → C₂ (semantics)
 ├─ Head 3 → C₃ (position)
 └─ Head h → Cₕ (reference)
       │
 concat(C₁..Cₕ)
       │
     × W₀
       │
    output
```

</div>
</div>

<div class="takeaway">Run several attention patterns at once, concatenate, mix once more—like ensemble models inside one layer.</div>


---

<!-- .slide: class="viz-slide" -->
## Multi-Head Attention — Live

<div class="viz-hint">Pick the <strong>query</strong> word (bottom row), then toggle <strong>heads</strong>. Thicker curves = stronger attention from that query to each token; blended colors = mixing active heads.</div>

<div class="viz-wrap" id="attn-wrap">
<style>
.viz-slide { padding: 0.4em 1em !important; }
.viz-hint  { font-size:0.55em; color:#888; margin:-0.3em 0 0.4em; }
.viz-wrap  { width:100%; }
#t-row     { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px; }
.tb { border:1px solid #ccc; border-radius:6px; background:#f7f7f7;
      color:#222; padding:4px 12px; font-size:0.55em; cursor:pointer;
      transition:background .15s,border-color .15s; font-family:inherit; }
.tb.active { border-color:#6C63FF; color:#6C63FF; background:#ece9ff; }
#h-row  { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px; align-items:center; }
.hl     { border-radius:99px; padding:2px 9px; font-size:0.5em; cursor:pointer;
          border:1px solid transparent; opacity:0.45; transition:opacity .15s; }
.hl.on  { opacity:1; border-color:currentColor; }
#a-svg  { width:100%; display:block; }
#ins    { font-size:0.5em; color:#555; margin-top:6px; min-height:2em; line-height:1.5; }
.bl     { font-size:0.5em; color:#888; font-family:inherit; }
</style>
<div id="t-row"></div>
<div id="h-row">
  <span class="bl">Heads:</span>
  <div id="h-pills"></div>
</div>
<svg id="a-svg" viewBox="0 0 680 260"></svg>
<div id="ins"></div>
</div>

<div class="takeaway">There is no single “right” attention map—heads specialize; blending them shows how the model mixes their votes.</div>

---

## How To Explain These Visuals

> "In the first chart, both models predict the next token - but the transformer can use the whole context, so its probability mass moves toward meaning, not just local token frequency."
>
> "In the second chart, each colored pattern is a different attention head. Heads do not all look at the same words: some track syntax, others position or references. Their combined view becomes the context vector used to predict the next token."

<div class="takeaway">Tell the room: better context beats local counts, and multiple heads mean multiple simultaneous focuses.</div>

---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">01 · Position</div>

## Position Encodings

<div class="slide-split">
<div>

- Token embeddings say **what**; position encodings say **where**
- Added element-wise: `xₜ = embed(tokenₜ) + pos(t)`
- Without position, "dog bites man" and "man bites dog" look identical to attention

</div>
<div class="split-right">

```text
embed("cat") = [0.3, -0.1, 0.8, ...]
    +
pos(position=2) = [0.0, 0.5, -0.2, ...]
    =
x₂ = [0.3, 0.4, 0.6, ...]

Now attention knows this is
the 2nd token, not just "cat".
```

</div>
</div>

<div class="takeaway">Without position, a bag of words has no story—this term puts order back in after embedding.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">01 · Context</div>

## Context & Context Length

<div class="slide-split">
<div>

- **Context** = the sequence of tokens the model can attend to in one forward pass
- **Context length** `L` = maximum number of tokens in that window
- Exceeding `L` → oldest tokens are truncated
- Longer context helps **if** relevant info is present; extra tokens cost compute and dilute focus
- This is why **RAG** exists: retrieve relevant chunks into the window

</div>
<div class="split-right">

```text
Context window (L = 7):

[t₆][t₅][t₄][t₃][t₂][t₁][t₀]
 │   │   │   │   │   │   │
 └───┴───┴───┴───┴───┴───┘
  model attends to all of these

If input grows to L+3:
 ✘✘✘ [t₆][t₅]...[t₀]
 dropped    │── kept
```

</div>
</div>

<div class="takeaway">The model has a fixed window; older text falls off the left unless you retrieve or summarize it back in.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">01 · nanoGPT</div>

## nanoGPT — GPT in ~300 Lines

<div class="slide-split">
<div>

- Karpathy’s `nanoGPT` strips GPT-2 to its essence
- Key files: `model.py`, `train.py`, `sample.py`
- Read `model.py` end-to-end: **embeddings → blocks (attn + MLP) → logits → loss**

**Exercises**
- Train on **Tiny Shakespeare** — watch samples turn Elizabethan
- Swap data (physics notes, ROOT logs) — same code, different domain

</div>
<div class="split-right">

```python
class Block(nn.Module):
  def __init__(self, cfg):
    super().__init__()
    self.ln_1 = LayerNorm(cfg.n_embd)
    self.attn  = CausalSelfAttention(cfg)
    self.ln_2 = LayerNorm(cfg.n_embd)
    self.mlp   = MLP(cfg)

  def forward(self, x):
    x = x + self.attn(self.ln_1(x))
    x = x + self.mlp(self.ln_2(x))
    return x
```

</div>
</div>

<div class="takeaway">If you read one file end-to-end, you have seen the skeleton every large GPT still uses.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">01 · Scaling</div>

## Scaling Laws

<div class="slide-split">
<div>

- Kaplan et al. (2020) & Chinchilla (2022)
- Loss decreases as a **power law** in model size `N` and tokens `D`
- Irreducible floor `L∞`: even infinite resources can’t beat data/objective limits

```text
L(N,D) = A/N^α + B/D^β + L∞
```

</div>
<div class="split-right">

```text
  Loss
   │╲
   │ ╲
   │  ╲╲
   │    ╲╲╲
   │       ╲╲╲╲╲
   │  L∞ ────────── floor
   │
   └─────────────────
    model size N (or tokens D)

Diminishing returns:
 doubling N halves the gap,
 doesn’t halve the loss.
```

</div>
</div>

<div class="takeaway">More parameters and more tokens usually lower loss along smooth curves—until data, compute, or the objective itself caps you.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">01 · Scaling</div>

## What the terms mean

<div class="key-grid cols-2">

<div class="key-box">
<span class="key-box-title">A / N^α (model term)</span>
<p>Limited capacity — bigger models generalize better on the same data.</p>
</div>

<div class="key-box">
<span class="key-box-title">B / D^β (data term)</span>
<p>Limited signal — more tokens improve estimates even at fixed model size.</p>
</div>

<div class="key-box">
<span class="key-box-title">L∞ (floor)</span>
<p>Irreducible — driven by data noise + the next-token objective itself.</p>
</div>

<div class="key-box">
<span class="key-box-title">Key idea</span>
<p>Improvements have diminishing returns; the bottleneck shifts between N and D depending on your budget.</p>
</div>

</div>

<div class="takeaway">The equation tells you whether to buy more GPU, more data, or accept an objective floor.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">01 · Scaling</div>

## Chinchilla: compute-optimal training

<div class="slide-split">
<div>

- For a **fixed compute budget**, balance `N` and `D`
- Chinchilla rule: **D ≈ 20 × N** tokens
- Too much `N` for given `D` → under-trained
- Too much `D` for given `N` → capacity-limited
- Dataset size matters as much as architecture

</div>
<div class="split-right">

```text
Compute budget = C

 ┌────────────────────┐
 │   iso-C curves       │
 │ N │                  │
 │   │ ⭐ optimal      │
 │   │   (D≈20N)       │
 │   │                  │
 │   └───────────── D │
 └────────────────────┘
Over-parameterized → left of ⭐
Under-parameterized → right
```

</div>
</div>

<div class="takeaway">For a fixed budget, balance model size and tokens—bigger is not better if you starve it of data.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">01 · Generation</div>

## Generation, Scaling & nanoGPT

<div class="key-grid cols-2">

<div class="key-box">
<span class="key-box-title">Autoregressive loop</span>
<p>Prompt in → logits for the next token → sample or argmax → append → repeat. Training teaches one-step prediction; chatting chains those steps—early mistakes compound.</p>
</div>

<div class="key-box">
<span class="key-box-title">Decoding knobs</span>
<p><strong>Temperature</strong> reshapes how “peaked” the distribution is; <strong>top-p</strong> / <strong>top-k</strong> cap which tokens can be chosen. Same model weights, different style and risk.</p>
</div>

<div class="key-box">
<span class="key-box-title">Scaling & Chinchilla</span>
<p>Loss tends to fall with more parameters <code>N</code> and tokens <code>D</code> until a floor. Under a fixed compute budget, balance <code>N</code> and <code>D</code> instead of scaling one alone.</p>
</div>

<div class="key-box">
<span class="key-box-title">nanoGPT</span>
<p>One small, readable GPT: embeddings → transformer blocks (attention + MLP) → logits. Train on Tiny Shakespeare or your own corpus—GPT-4 is the same recipe, massively scaled.</p>
</div>

</div>

*Next slides unpack generation, logits, and training details step by step.*

<div class="takeaway">Train predicts the next token; decoding chooses how it speaks; scaling laws say how to spend budget; nanoGPT shows the whole pipeline fits in a short file.</div>

---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">01 · Generation</div>

## How generation works (1/2) — Autoregressive loop

<div class="slide-split">
<div>

- Training teaches `P(next | past)`
- Generation **chains** one-step decisions:
  - Forward pass → logits → sample one token → append → repeat
- Errors **compound**: one bad early token steers the whole continuation
- Stops at EOS token, max length, or external rule

</div>
<div class="split-right">

```text
prompt: "The cat"
           ↓
step 1:  P(next) → sample "sat"
  ctx = "The cat sat"
           ↓
step 2:  P(next) → sample "on"
  ctx = "The cat sat on"
           ↓
step 3:  P(next) → sample "the"
  ctx = "The cat sat on the"
           ↓
step 4:  P(next) → sample "mat"
  ctx = "The cat sat on the mat"
           ↓ EOS → stop
```

</div>
</div>

<div class="takeaway">You repeatedly ask “what’s next?” and append; one bad token can steer the whole rest of the answer.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">01 · Generation</div>

## How generation works (2/2) — Sampling strategies

<div class="key-grid cols-2">

<div class="key-box">
<span class="key-box-title">Greedy (argmax)</span>
<p>Always pick the highest-probability token. Deterministic but can be repetitive.</p>
</div>

<div class="key-box">
<span class="key-box-title">Stochastic (sample)</span>
<p>Roll the dice over the full distribution. More diverse but also riskier.</p>
</div>

<div class="key-box">
<span class="key-box-title">Top-k / Top-p</span>
<p>Restrict sampling to the k most likely tokens, or the smallest set covering probability p.</p>
</div>

<div class="key-box">
<span class="key-box-title">Temperature</span>
<p>Rescale logits before softmax. T&lt;1 = sharper/safer, T&gt;1 = flatter/wilder.</p>
</div>

</div>

Same model weights — different **decoding** can change tone, diversity, and failure modes.

<div class="takeaway">Weights pick tendencies; temperature and top-p pick how wild each next choice is.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">01 · Generation</div>

## Logits → probabilities (softmax)

<div class="slide-split">
<div>

- Model outputs one raw score per vocab entry (**logits**)
- `softmax` converts to a legal probability table: all positive, sums to 1
- Larger logits dominate the probability mass

`pᵢ = exp(zᵢ) / Σⱼ exp(zⱼ)`

</div>
<div class="split-right">

```text
token:  A     B     C     D     E
logit:  3.0   2.0   1.0   0.0  -1.0
           ↓ softmax
prob:   0.67  0.25  0.09  0.03  0.01
        █████ ███  ██   █    .

Highest logit → most probability.
All probs sum to 1.0.
```

</div>
</div>

<div class="takeaway">Raw scores become a legal probability table—everything positive and summing to one.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">01 · Generation</div>

## Temperature reshapes the distribution

<div class="slide-split">
<div>

- Rescale logits before softmax: `z′ = z / T`
- **T < 1** → sharper (more confident, safer)
- **T > 1** → flatter (more random, creative)
- T = 1 is the baseline (no rescaling)

</div>
<div class="split-right">

```text
logits:  3.0  2.0  1.0  0.0  -1.0

T=0.7    .79  .17  .03  .01  .00
         █████ ██

T=1.0    .67  .25  .09  .03  .01
         ████  ███  █

T=1.3    .54  .27  .13  .05  .02
         ███  ███  ██  █   .
```

</div>
</div>

<div class="takeaway">Temperature is a creativity dial on the same brain—lower is safer, higher is chattier and riskier.</div>


---

## Decoding & Sampling Knobs (temperature / top-p / top-k)

- `temperature` rescales logits (lower = more deterministic, higher = more random)
- `top-p` (nucleus) samples from the smallest set whose cumulative probability >= `p`
- `top-k` samples from the `k` most likely tokens
- Repetition penalties discourage loops like "As an AI language model..."

<div class="takeaway">These knobs shrink the candidate list before you roll the dice—cheap guardrails at inference time.</div>

---

## Beam Search vs Sampling (and practical defaults)

- Beam search: tends to be more deterministic, can reduce diversity
- Sampling: more diverse outputs, but also more variance/occasional weirdness
- Common starting points (for chat-style generation):
  - `temperature`: 0.6-0.8
  - `top-p`: 0.9-0.95
- Sampling parameters do not "fix" wrong beliefs; they mostly change the choice of tokens

<div class="takeaway">Beam search hunts safe continuations; sampling explores language—pick based on whether you want reliability or variety.</div>

---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">01 · System</div>

## Inference loop — full system

```text
[ Input text ] → tokenize → embed + pos
      → N × Transformer blocks (attn + MLP, causal mask)
      → lm_head → logits → softmax / sampling
      → next token → append → repeat
      → detokenize → [ Output text ]
```

<div class="key-grid cols-2">

<div class="key-box">
<span class="key-box-title">Training</span>
<p>Optimizes weights on a corpus with cross-entropy loss. Runs many epochs.</p>
</div>

<div class="key-box">
<span class="key-box-title">Inference</span>
<p>Reuses those weights + KV caching, batching, quantization. Same math, faster serving.</p>
</div>

</div>

<div class="takeaway">Serving is the same math as training, wrapped in tokenizers, caches, and batching so it feels instant.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">01 · Pipeline</div>

## The full pipeline — three pieces

<div class="key-grid">

<div class="key-box">
<span class="key-box-title">TRAINING (pretraining)</span>
<p>Learn next-token probabilities from data. Transformer architecture + cross-entropy loss. Optimize with SGD / Adam.</p>
</div>

<div class="key-box">
<span class="key-box-title">GENERATION (inference)</span>
<p>Input prompt → forward → logits → sample next token → repeat. Knobs: temperature, top-p, top-k, stop sequences.</p>
</div>

<div class="key-box">
<span class="key-box-title">ALIGNMENT (post-training)</span>
<p>Instruction tuning (show good examples of Q&A / tool use). Preference learning (RLHF / DPO) to match human judgments.</p>
</div>

</div>

<div class="takeaway">Train the brain on text, roll the dice to speak, then align the personality with examples and preferences.</div>


---

## Final mental model — in one quote

> **ChatGPT** is a **next-token predictor** trained with **cross-entropy**; **attention** lets it condition on long context; **sampling** turns logits into fluent text; **alignment** (instruction data + preferences) steers behavior toward helpfulness and safety — not a separate “magic” module.

<div class="takeaway">ChatGPT is still next-token prediction plus attention plus sampling—alignment layers manners on top.</div>

---

<!-- .slide: class="section-slide" -->
# 02
## The Full Training Stack

<div class="desc">Pretraining · SFT · LoRA / QLoRA · RLHF · DPO</div>

<div class="takeaway">We now move from raw weights to assistants: teach format, then teach taste.</div>

---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">02 · Stack</div>

## From Pretraining to Assistant

```text
Pretraining  →  SFT  →  RLHF / DPO  →  Assistant
(next-token)    (inst)   (preference)    (GPT-4, Claude…)
```

<div class="key-grid cols-2">

<div class="key-box">
<span class="key-box-title">Pretrain</span>
<p>Predict anything — learns language, facts, code from raw text.</p>
</div>

<div class="key-box">
<span class="key-box-title">SFT</span>
<p>Narrow to assistant format — learn Q&A shape, refusals, structure.</p>
</div>

<div class="key-box">
<span class="key-box-title">RLHF / DPO</span>
<p>Steer toward human preferences — polite, helpful, safe.</p>
</div>

<div class="key-box">
<span class="key-box-title">Result</span>
<p>Each stage <strong>shrinks the behavior space</strong> from “anything” to “helpful.”</p>
</div>

</div>

<div class="takeaway">Each stage shrinks the behavior space until the model feels helpful instead of merely fluent.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">02 · SFT</div>

## Post-training (1/2) — Instruction tuning

<div class="slide-split">
<div>

- Show the model **(prompt, ideal reply)** pairs
- Same next-token loss, but on **dialogue-style** data
- Effect: model learns format and intent — answers, refusals, formatting

> Base models complete text; **SFT** teaches the *shape* of an assistant.

</div>
<div class="split-right">

```text
TRAINING EXAMPLE:
 User:  "Summarize this paper."
 Asst:  "The paper proposes..."

WHAT CHANGES:
 Before SFT → continues any text
 After SFT  → replies in Q&A format

Same LM loss, different data
→ different behavior.
```

</div>
</div>

<div class="takeaway">Show thousands of good conversations and the model learns the assistant shape—answers, refusals, formatting.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">02 · Alignment</div>

## Post-training (2/2) — Preferences (RLHF / DPO)

<div class="slide-split">
<div>

- Collect **human rankings** of answers (or proxy labels)
- **RLHF:** reward model + RL (PPO) — powerful but complex
- **DPO:** skip reward model; optimize preference pairs directly — simpler

> This is why chat feels **human-aligned** — not because pretraining saw “helpful” more often.

</div>
<div class="split-right">

```text
RLHF path:
  pairs → reward model → PPO
  (complex, reward hacking risk)

DPO path:
  pairs → direct loss on
  (chosen vs rejected)
  (simpler, same result)

Both: nudge model toward
human-preferred answers.
```

</div>
</div>

<div class="takeaway">Humans pick preferred answers; the model nudges toward those choices without memorizing a rule book.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">02 · Adapters</div>

## Full Fine-Tuning vs. LoRA / QLoRA

<div class="slide-split">
<div>

<div class="key-grid">
<div class="key-box">
<span class="key-box-title">Full fine-tuning</span>
<p>Update <strong>all</strong> weights — best ceiling, requires full VRAM, forgetting risk.</p>
</div>
<div class="key-box">
<span class="key-box-title">LoRA</span>
<p>Freeze base W₀, add low-rank adapter: <strong>W = W₀ + BA</strong> (r ≪ d). 7B → ~10M trainable params.</p>
</div>
<div class="key-box">
<span class="key-box-title">QLoRA</span>
<p>Base in 4-bit, adapters in 16-bit. Fine-tune on a <strong>single GPU</strong>.</p>
</div>
</div>

</div>
<div class="split-right">

```python
LoraConfig(
  r=16,
  lora_alpha=32,
  target_modules=[
    "q_proj", "v_proj"
  ],
  lora_dropout=0.05,
  task_type="CAUSAL_LM"
)

# 7B params frozen
# ~10M adapter params trained
# fits on 1x 24GB GPU (QLoRA)
```

</div>
</div>

<div class="takeaway">Full updates everything; LoRA trains a thin adapter so laptops can personalize a big base model.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">02 · Alignment</div>

## RLHF vs. DPO

<div class="slide-split">
<div>

**RLHF** (InstructGPT, 2022)
- Reward model + PPO optimization
- Complex, expensive, reward hacking risk

**DPO** (Rafailov et al., 2023)
- Skip reward model entirely
- Train directly on (chosen, rejected) pairs
- Same result, far simpler

</div>
<div class="split-right">

```text
RLHF pipeline:
  data → reward model → PPO → policy
  (3 models in memory)

DPO pipeline:
  data → single loss → policy
  (1 model + reference)

DPO loss:
 L = -E[log σ(
   β·log π(y_w)/π_ref(y_w)
  -β·log π(y_l)/π_ref(y_l)
 )]
```

</div>
</div>

<div class="takeaway">Both learn from preferences—RLHF uses an explicit reward loop; DPO folds it into a simpler loss.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">02 · When to use what</div>

## Prompting vs. RAG vs. Fine-Tuning

<div class="key-grid cols-2">

<div class="key-box">
<span class="key-box-title">Prompting</span>
<p>✓ Fast, ✓ Cheap, ✗ Stale knowledge, ≈ Partial style control. Start here.</p>
</div>

<div class="key-box">
<span class="key-box-title">RAG</span>
<p>✓ Live knowledge, ✓ Private docs, ≈ Medium latency/cost. Add when model lacks facts.</p>
</div>

<div class="key-box">
<span class="key-box-title">Fine-tuning</span>
<p>✓ Custom style, ✓ Fast at inference, ✗ High cost, ✗ Leakage risk. Use when behavior can’t be prompted away.</p>
</div>

<div class="key-box">
<span class="key-box-title">Rule of thumb</span>
<p>Prompting → +RAG → +fine-tune. Escalate only when the simpler approach fails.</p>
</div>

</div>

<div class="takeaway">Prompts are free, retrieval adds facts without retraining, fine-tuning changes the weights—escalate only when needed.</div>


---

<!-- .slide: class="section-slide" -->
# 03
## Capabilities & Honest Limitations

<div class="desc">What works · What fails · Benchmarks · Stochastic parrots</div>

<div class="takeaway">Celebrate strengths, name failure modes—both belong in the same breath.</div>

---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">03 · Capabilities</div>

## What LLMs Are (and Aren’t) Good At

<div class="key-grid cols-2">

<div class="key-box" style="border-left-color: var(--accent);">
<span class="key-box-title">✓ Strengths</span>
<p>Text synthesis, summarisation, translation. Code generation & explanation. Few-shot analogical reasoning. Information extraction. Chain-of-thought on well-defined problems.</p>
</div>

<div class="key-box" style="border-left-color: var(--accent2);">
<span class="key-box-title">✗ Reliable failures</span>
<p><strong>Hallucination</strong> — confident fabrication. Arithmetic & counting. Knowledge cutoff. Long-context degradation (“lost in the middle”). Consistent multi-step planning.</p>
</div>

</div>

<div class="takeaway">Great pattern machines, shaky calculators and fact vaults—plan accordingly.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">03 · Evaluation</div>

## Benchmarks — Useful and Gameable

<div class="key-grid cols-2">

<div class="key-box">
<span class="key-box-title">MMLU</span>
<p>57 subjects, multiple choice. Tests broad knowledge.</p>
</div>

<div class="key-box">
<span class="key-box-title">HumanEval</span>
<p>Python coding problems. Tests functional correctness.</p>
</div>

<div class="key-box">
<span class="key-box-title">MATH</span>
<p>Competition maths. Tests symbolic reasoning.</p>
</div>

<div class="key-box">
<span class="key-box-title">GPQA</span>
<p>PhD-level science. Harder to overfit.</p>
</div>

</div>

> **Contamination:** benchmark data leaks into pretraining. A 90% MMLU score may mean the model **saw** the questions. Always ask: was this held out?

<div class="takeaway">Leaderboards hint at skill, but your own held-out tasks tell you if it works for you.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">03 · Debate</div>

## The Stochastic Parrot Debate

<div class="key-grid cols-2">

<div class="key-box" style="border-left-color: var(--accent2);">
<span class="key-box-title">Bender et al. (2021)</span>
<p>LLMs manipulate form without grounding in meaning. No world model — only statistical co-occurrence. Fluency ≠ understanding. Environmental & labour costs.</p>
</div>

<div class="key-box" style="border-left-color: var(--accent);">
<span class="key-box-title">Counterpoints</span>
<p>Emergent reasoning on novel problems suggests some generalisation. “Understanding” is undefined even for humans. Held-out task performance is hard to explain by copying.</p>
</div>

</div>

> Be sceptical of both *“it’s just autocomplete”* and *“it’s AGI.”*

<div class="takeaway">Stay humble—fluency is real, grounding is still argued, neither extreme tells the whole story.</div>


---

<!-- .slide: class="section-slide" -->
# 04
## LLMs as Scientists

<div class="desc">The AI Scientist · RAG as memory · Agents</div>

<div class="takeaway">Research agents are just LLMs with retrieval, code, and a loop that won’t quit until the job ends.</div>

---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">04 · Research</div>

## The AI Scientist (Lu et al., 2024)

<div class="slide-split">
<div>

- Fully autonomous: **idea → experiment → PDF paper**
- Uses **RAG** for related work retrieval
- Passed automated reviewer checks at NeurIPS-level bar
- Key: LLM backbone + tool use (code) + memory (RAG)

</div>
<div class="split-right">

```text
┌───────────────────────┐
│ Idea generation       │
└──────────┬────────────┘
           ↓
┌───────────────────────┐
│ Experiment (Python)   │
└──────────┬────────────┘
           ↓
┌───────────────────────┐
│ Analysis + RAG (refs) │
└──────────┬────────────┘
           ↓
┌───────────────────────┐
│ Paper (LaTeX) + Review│
└───────────────────────┘
         ↺ iterate
```

</div>
</div>

<div class="takeaway">Automate hypothesis to PDF by chaining tools; the novelty is orchestration, not one new equation.</div>


---

## Why RAG is the Memory Layer

- Context window ≈ 128k tokens ≈ ~300 pages
- A research corpus has **millions** of papers — you cannot fit it all in context
- RAG = **R**etrieval-**A**ugmented **G**eneration

```
Query
  → Embed query (sentence transformer)
  → Retrieve top-k chunks (vector DB)
  → Build prompt + context
  → Generate answer
```

> RAG quality is mostly a **retrieval quality** problem.
> Chunk size, overlap, embedding model, and k are your primary levers.

<div class="takeaway">Your library is bigger than any context window—retrieve slices, then generate.</div>

---

## LLMs + Tools + Memory = Agents

```
          [ Planner / Orchestrator ]
                /           \
    [ Memory (RAG) ] ← [ LLM Core ] → [ Tools (Code, APIs) ]
```

- **Memory** gives the model knowledge beyond its context window
- **Tools** let it take actions in the world — run code, call APIs
- A **planner** orchestrates multi-step reasoning loops
- The AI Scientist is exactly this architecture

> *"You're about to build the memory layer. Let's go."*

<div class="takeaway">Language model in the middle, facts on the left, APIs on the right—that triangle is modern automation.</div>

---

<!-- .slide: class="section-slide" -->
# 05
## Agents, RAG & MCP

<div class="desc">Agentic loops · RAG internals · Model Context Protocol</div>

<div class="takeaway">Agents glue models to data and actions; MCP standardizes the glue so you write integrations once.</div>

---

## Beyond LLMs: World Models (state → outcomes)

- LLMs model text; world models model cause-and-effect in the environment
- Predict future states given actions (planning/control)
- Capture object permanence, physics consistency, and long-horizon dynamics

<div class="takeaway">Language models predict text; world models aim to predict what happens next in the environment.</div>

---

## Yann LeCun's Bet: AMI Labs (world models)

- AMI Labs is a contrarian focus on world models vs scaling language alone
- Goal: learn representations of real-world dynamics well enough to reason about "what happens next"
- Language becomes an interface to interact with (and control) the world

<div class="takeaway">Some teams bet that modeling the world beats ever-larger chatbots alone.</div>

---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">05 · Agents</div>

## What is an Agent?

<div class="slide-split">
<div>

An agent is an LLM that can **observe**, **decide**, and **act** in a loop.

<div class="key-grid">
<div class="key-box">
<span class="key-box-title">Observe</span>
<p>User message, tool result, retrieved memory.</p>
</div>
<div class="key-box">
<span class="key-box-title">Think</span>
<p>LLM generates reasoning (chain-of-thought).</p>
</div>
<div class="key-box">
<span class="key-box-title">Act</span>
<p>Call a tool, search memory, or return final answer.</p>
</div>
</div>

</div>
<div class="split-right">

```text
┌───────────────────────┐
│                       │
│  Observe → Think → Act │
│     ↑               │ │
│     └─────────────┘ │
│                       │
└───────────────────────┘

Key shift:
 LLM as a *function* you call once
    →
 LLM as a *process* that runs
 until the task is done.
```

</div>
</div>

<div class="takeaway">An agent keeps acting—observe, think, tool-call—until the task is finished, not just one reply.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">05 · Patterns</div>

## Agent Patterns

<div class="key-grid cols-2">

<div class="key-box">
<span class="key-box-title">ReAct (Reason + Act)</span>
<p>Thought → Action → Observation → Thought… Most production systems use this.</p>
</div>

<div class="key-box">
<span class="key-box-title">Plan-and-Execute</span>
<p>Generate full plan first, then execute each step. Better for long multi-step tasks.</p>
</div>

<div class="key-box">
<span class="key-box-title">Reflection / Self-critique</span>
<p>Agent reviews its own output and iterates. Used in the AI Scientist’s review loop.</p>
</div>

<div class="key-box">
<span class="key-box-title">Multi-agent</span>
<p>Specialist agents (coder, researcher, critic) orchestrated by a planner. Each has own tools and memory.</p>
</div>

</div>

<div class="takeaway">Most shipped agents are ReAct-style: think a step, call a tool, read the result, repeat.</div>


---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">05 · RAG</div>

## RAG — Under the Hood

<div class="slide-split">
<div>

Three failure points and fixes:

<div class="key-grid">
<div class="key-box">
<span class="key-box-title">1. Chunking</span>
<p>Too large → irrelevant bleed. Fix: 100–200 tokens, 10–20% overlap.</p>
</div>
<div class="key-box">
<span class="key-box-title">2. Retrieval</span>
<p>Wrong chunks returned. Fix: add a <strong>reranker</strong> (cross-encoder).</p>
</div>
<div class="key-box">
<span class="key-box-title">3. Generation</span>
<p>Right chunks, wrong answer. Fix: cite sources + faithfulness check.</p>
</div>
</div>

</div>
<div class="split-right">

```text
Query
  ↓ embed (sentence-transformer)
  ↓ ANN search (vector DB)
  ↓ top-k chunks
  ↓ reranker (cross-encoder)
  ↓ prompt + context
  ↓ generate
  ↓ faithfulness check
  ↓ answer

Adding a reranker is the
single highest-leverage
RAG improvement.
```

</div>
</div>

<div class="takeaway">If retrieval fails, generation fails—chunk carefully, rerank aggressively, then ask the model.</div>


---

## RAG Variants Worth Knowing

| Variant | What it adds |
|---------|-------------|
| **Naive RAG** | Basic embed → retrieve → generate |
| **HyDE** | Generate a *hypothetical* answer first, embed that for retrieval |
| **RAG-Fusion** | Multiple query rewrites → merge ranked results |
| **Self-RAG** | Model decides *when* to retrieve, not always |
| **Agentic RAG** | Multi-hop: retrieve → reason → retrieve again |
| **GraphRAG** | Build a knowledge graph over docs; query the graph |

> For most use cases: **Naive RAG + reranker** gets you 80% of the way there.
> Only reach for exotic variants when you have a specific failure mode.

<div class="takeaway">Fancy RAG names are patches for specific misses; measure first, then adopt the variant you need.</div>

---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">05 · MCP</div>

## What is MCP?

<div class="slide-split">
<div>

**Model Context Protocol** — open standard (Anthropic, 2024) for connecting LLMs to external tools via a **uniform interface**.

Think of it as **USB-C for AI tools** — one standard, any tool.

Three primitives:
- **Tools** — functions the LLM can call
- **Resources** — data the LLM can read
- **Prompts** — reusable templates

</div>
<div class="split-right">

```text
LLM
 │
 └── MCP Client (host app)
      │
      ├── MCP Server: GitHub
      │    └ search_issues()
      │    └ open_pr()
      │
      ├── MCP Server: Postgres
      │    └ run_query()
      │
      └── MCP Server: Slack
           └ post_message()
```

</div>
</div>

<div class="takeaway">MCP is a shared plug shape for tools so hosts and models stop rewriting bespoke integrations.</div>


---

## MCP in Practice

**Popular MCP servers today**
- `filesystem` — read/write local files
- `github` — search repos, open PRs, read issues
- `postgres` — query a database in natural language
- `brave-search` — live web search
- `slack` — read channels, post messages

```
User: "Find all GitHub issues mentioning latency, summarise them"

LLM → MCP call: github.search_issues("latency")
    ← returns: [issue_1, issue_2, …]
LLM → synthesises and responds
```

> MCP turns an LLM into an agent that can interact with **your actual systems**,
> not just a chat window.

<div class="takeaway">Same protocol can hit Slack, Postgres, or GitHub—swap servers, keep the agent code.</div>

---

## Agents + RAG + MCP Together

```
User query
    ↓
[ Agent / Planner ]
    ↓              ↓
[ RAG memory ]  [ MCP tools ]
  (what it        (what it
   knows)          can do)
    ↓              ↓
[ LLM generates response ]
```

- **RAG** = long-term memory (documents, knowledge bases)
- **MCP tools** = live actions (APIs, databases, code execution)
- **Agent loop** = the glue that decides when to retrieve vs. act

> The AI Scientist uses all three:
> RAG for literature, code execution via tools, agent loop for the research cycle.

<div class="takeaway">Planner decides when to read docs versus poke an API; MCP makes those pokes portable.</div>

---

<!-- .slide: class="ref-slide" -->
<div class="deck-badge">05 · Limits</div>

## Where Agents Break Down

<div class="key-grid cols-2">

<div class="key-box" style="border-left-color: var(--accent2);">
<span class="key-box-title">Tool call hallucination</span>
<p>Calls a tool with wrong or invented arguments.</p>
</div>

<div class="key-box" style="border-left-color: var(--accent2);">
<span class="key-box-title">Infinite loops</span>
<p>Planner keeps retrying without making progress.</p>
</div>

<div class="key-box" style="border-left-color: var(--accent2);">
<span class="key-box-title">Context overflow</span>
<p>Long agentic runs fill the context window with history.</p>
</div>

<div class="key-box" style="border-left-color: var(--accent2);">
<span class="key-box-title">Error propagation</span>
<p>One bad tool result poisons all downstream reasoning.</p>
</div>

</div>

> **Practical rule:** Keep agent loops short (≤5 steps) for production. Add explicit stopping conditions and fallback paths.

<div class="takeaway">Long loops amplify small mistakes—keep steps short, watch tool errors, cap retries.</div>


---

## Resources & Next Steps

**Must-reads**
- Vaswani et al. (2017) — Attention is All You Need
- Hoffmann et al. (2022) — Chinchilla scaling
- Hu et al. (2022) — LoRA
- Rafailov et al. (2023) — DPO
- Lu et al. (2024) — The AI Scientist

**Practical resources**
- youtube.com/@AndrejKarpathy
- Hugging Face TRL docs (DPO & SFT trainers)
- simonwillison.net
- github.com/karpathy/nanoGPT
- github.com/SakanaAI/AI-Scientist
- modelcontextprotocol.io — MCP spec & server registry

<div class="takeaway">These links are your post-workshop syllabus—papers for theory, repos for practice.</div>

---

# Q&A

*your.email@institution.edu*

Colab notebook: `[link]`

<div class="takeaway">Bring questions tied to your project—deployment, retrieval, or classroom use.</div>
