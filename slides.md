# LLMs: **Inside Out**

From Transformers to Agents — A 2-Hour Deep Dive

*Uzziel Perez · La Salle Campus, Barcelona*

---

## Today's Agenda

**Hour 1 — Lecture**
- How LLMs actually work
- The full training stack
- Capabilities & honest limitations
- LLMs as scientists (AI Scientist)
- Agents, RAG & MCP

**Hour 2 — Hands-On**
- Feel the limits of a vanilla LLM
- Build a RAG pipeline from scratch
- Break it and fix it
- *Demo:* Fine-tuning a real model

> **Goal:** Leave today able to **explain** how LLMs work, **build** a RAG pipeline,
> and **critically evaluate** what LLMs can and cannot do.

---

<!-- .slide: class="section-slide" -->
# 01
## How LLMs Actually Work

<div class="desc">Tokenisation · Attention · nanoGPT · Scaling laws</div>

---

## The Core Idea

> **P( next token | context )**
> A single objective trained across trillions of tokens

- No symbolic rules, no hand-crafted grammar — only **gradient descent**
- Emergent capabilities appear at scale: instruction following, reasoning, code
- This objective is sufficient to learn language, facts, and reasoning patterns

> **The surprising part:** Nobody fully understands why next-token prediction
> produces such general capabilities.

---

## Tokenisation

- Models don't see *words* — they see **tokens**
- Byte-Pair Encoding (BPE): iteratively merge the most frequent byte pairs
- `"unbelievable"` → `["un", "believ", "able"]`
- Numbers tokenise poorly — `"1024"` may split into 1–3 tokens
- Vocabulary size ≈ 50k–100k tokens

```python
import tiktoken
enc = tiktoken.get_encoding("cl100k_base")
enc.encode("Hello, world!")
# [9906, 11, 1917, 0]
```

---

## Attention Intuition

Predicting the next token after `"mat"` in: *The cat sat on the mat*

| Token | Attention weight |
|-------|-----------------|
| cat   | **0.6** |
| the   | 0.3 |
| The   | 0.1 |

- **Self-attention:** every token asks "which other tokens should influence me?"
- **Multi-head attention:** run this query in parallel across *h* subspaces
- **Position encodings:** inject token order — otherwise it's a bag of tokens

---

## nanoGPT — GPT in ~300 Lines

- Andrej Karpathy's `nanoGPT` strips GPT-2 to its essence
- Key files: `model.py`, `train.py`, `sample.py`
- The entire forward pass is ~50 lines of readable PyTorch
- **Key insight:** GPT-4 is nanoGPT + 4 orders of magnitude + engineering

```python
class Block(nn.Module):
  def __init__(self, cfg):
    super().__init__()
    self.ln_1 = LayerNorm(cfg.n_embd)
    self.attn = CausalSelfAttention(cfg)
    self.ln_2 = LayerNorm(cfg.n_embd)
    self.mlp  = MLP(cfg)

  def forward(self, x):
    x = x + self.attn(self.ln_1(x))
    x = x + self.mlp(self.ln_2(x))
    return x
```

---

## Scaling Laws

- Kaplan et al. (2020) & Hoffmann et al. — Chinchilla (2022)
- Loss follows a **power law** in parameters N and tokens D
- Optimal ratio: **D ≈ 20 × N** (Chinchilla scaling)
- GPT-3 (175B params) was *under-trained* by this rule
- Implication: **data** is often the bottleneck, not compute

```
L(N,D) = A/N^α  +  B/D^β  +  L∞

irreducible loss + model-size term + data term
```

---

<!-- .slide: class="section-slide" -->
# 02
## The Full Training Stack

<div class="desc">Pretraining · SFT · LoRA / QLoRA · RLHF · DPO</div>

---

## From Pretraining to Assistant

```
Pretraining  →  SFT  →  RLHF / DPO  →  Assistant
(next-token)    (inst)   (preference)    (GPT-4, Claude…)
```

- Each stage **narrows the distribution** — from "predict anything" to "be helpful"
- Base models are *weird*: prompt with a toxic prefix and they'll complete it
- Alignment does not lobotomise the model — it redirects it

---

## Full Fine-Tuning vs. LoRA / QLoRA

**Full fine-tuning**
- Update *all* weights — best ceiling, requires full VRAM, forgetting risk

**LoRA** (Hu et al., 2022)
- Freeze base weights W₀, add low-rank adapter: **W = W₀ + BA**, r ≪ d
- 7B model: 7B params → ~10M trainable
- QLoRA: quantise base to 4-bit, train adapters in 16-bit

```python
LoraConfig(
  r=16,           # rank
  lora_alpha=32,  # scaling (typically 2×r)
  target_modules=["q_proj", "v_proj"],
  lora_dropout=0.05,
  task_type="CAUSAL_LM"
)
```

---

## RLHF vs. DPO

**RLHF** (InstructGPT, 2022)
- Train a **reward model** on human preferences, then use PPO to optimise against it
- Complex, expensive, prone to reward hacking

**DPO** (Rafailov et al., 2023)
- Skip the reward model entirely
- Train directly on `(chosen y_w, rejected y_l)` pairs
- **Same result, far simpler pipeline**

```
L = -E[ log σ( β·log π(y_w|x)/π_ref(y_w|x)
              - β·log π(y_l|x)/π_ref(y_l|x) ) ]
```

> Maximise log-ratio of policy probability for *chosen* over *rejected*,
> relative to a reference model.

---

## Prompting vs. RAG vs. Fine-Tuning

| Criterion | Prompting | RAG | Fine-tuning |
|-----------|-----------|-----|-------------|
| Knowledge freshness | Stale | **✓ Live** | Stale until retrain |
| Custom style / format | Partial | ✗ | **✓ Yes** |
| Private document corpus | ✗ | **✓ Yes** | Leakage risk |
| Latency | **✓ Fast** | Medium | **✓ Fast** |
| Cost | **✓ Low** | Medium | High |

> **Rule of thumb:** Start with prompting → add RAG when the model lacks knowledge
> → fine-tune only when behaviour cannot be prompted away.

---

<!-- .slide: class="section-slide" -->
# 03
## Capabilities & Honest Limitations

<div class="desc">What works · What fails · Benchmarks · Stochastic parrots</div>

---

## What LLMs Are (and Aren't) Good At

**✓ Strengths**
- Text synthesis, summarisation, translation
- Code generation & explanation
- Few-shot analogical reasoning
- Information extraction from unstructured text
- Chain-of-thought on well-defined problems

**✗ Reliable Failures**
- **Hallucination** — confident fabrication of facts
- Arithmetic and precise counting
- Knowledge cutoff — no live data
- Long-context degradation ("lost in the middle")
- Consistent multi-step planning

---

## Benchmarks — Useful and Gameable

- **MMLU** — 57 subjects, multiple choice; tests broad knowledge
- **HumanEval** — Python coding problems; tests functional correctness
- **MATH** — competition mathematics; tests symbolic reasoning
- **GPQA** — PhD-level science questions; harder to overfit

> **The contamination problem:** Benchmark datasets leak into pretraining corpora.
> A model scoring 90% on MMLU may have seen those questions.
> **Always ask: was this benchmark held out?**

Better signal: *held-out* evaluations on your own task, with your own data.

---

## The Stochastic Parrot Debate

**Bender et al. (2021) argue:**
- LLMs manipulate form without grounding in meaning
- No model of the world — only statistical co-occurrence
- Fluency ≠ understanding; significant environmental & labour costs

**Counterpoints:**
- Emergent reasoning on novel problems suggests some generalisation
- "Understanding" is not well-defined even for humans
- Strong performance on held-out tasks is hard to explain by copying alone

> The debate is unsettled. Be sceptical of both
> *"it's just autocomplete"* and *"it's AGI."*

---

<!-- .slide: class="section-slide" -->
# 04
## LLMs as Scientists

<div class="desc">The AI Scientist · RAG as memory · Agents</div>

---

## The AI Scientist (Lu et al., 2024)

```
Idea → Experiment → Analysis → Paper → Review
         (Python)   (RAG)      (LaTeX)   (auto) ↺
```

- Fully autonomous: idea → experiment → PDF paper, **no human in the loop**
- Uses **RAG** to retrieve related work before writing the introduction
- Produced papers that passed automated reviewer checks at a NeurIPS-level bar
- Key components: LLM backbone + tool use (code execution) + **memory (RAG)**

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

---

<!-- .slide: class="section-slide" -->
# 05
## Agents, RAG & MCP

<div class="desc">Agentic loops · RAG internals · Model Context Protocol</div>

---

## What is an Agent?

An agent is an LLM that can **observe**, **decide**, and **act** in a loop.

```
┌─────────────────────────────────────┐
│  Observe → Think → Act → Observe…  │
└─────────────────────────────────────┘
```

- **Observe** — receives input: user message, tool result, retrieved memory
- **Think** — LLM generates a reasoning step (chain-of-thought)
- **Act** — calls a tool, searches memory, or returns a final answer
- Loop continues until the task is complete

> The key shift: from LLM as a *function* you call once,
> to LLM as a *process* that runs until done.

---

## Agent Patterns

**ReAct** (Reason + Act)
- Interleave reasoning traces with tool calls
- `Thought → Action → Observation → Thought…`

**Plan-and-Execute**
- First generate a full plan, then execute each step
- Better for long multi-step tasks

**Reflection / Self-critique**
- Agent reviews its own output and iterates
- Used in the AI Scientist's review loop

**Multi-agent**
- Specialist agents (coder, researcher, critic) orchestrated by a planner
- Each agent has its own tools and memory

> Most production systems are **ReAct** under the hood.

---

## RAG — Under the Hood

Three places where RAG can go wrong — and how to fix them:

**1. Chunking** — chunks too large → irrelevant context bleeds in
- Fix: smaller chunks (100–200 tokens) with 10–20% overlap

**2. Retrieval** — wrong chunks returned despite good chunking
- Fix: reranker model (cross-encoder) scores retrieved chunks *after* retrieval

**3. Generation** — right chunks retrieved, wrong answer generated
- Fix: prompt the model to cite its sources; add a faithfulness check

```
Query → Embed → ANN search → Rerank → Prompt → Generate → Check
```

> Adding a **reranker** is the single highest-leverage RAG improvement.

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

---

## What is MCP?

**Model Context Protocol** — an open standard (Anthropic, 2024) that lets
LLMs connect to external tools and data sources through a **uniform interface**.

```
LLM ←── MCP Client ──→ MCP Server ──→ Tool / Data source
          (host app)     (plugin)       (GitHub, DB, API…)
```

- Think of it as **USB-C for AI tools** — one standard, any tool
- Tools expose three primitives:
  - **Tools** — functions the LLM can call (`search_github`, `run_query`)
  - **Resources** — data the LLM can read (files, DB rows, API responses)
  - **Prompts** — reusable prompt templates the server provides

> Before MCP: every app reimplemented tool calling from scratch.
> After MCP: write a server once, use it in any MCP-compatible host.

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

---

## Where Agents Break Down

Knowing the failure modes is as important as knowing the architecture:

- **Tool call hallucination** — calls a tool with wrong or invented arguments
- **Infinite loops** — planner keeps retrying without making progress
- **Context overflow** — long agentic runs fill the context window with history
- **Error propagation** — a bad tool result poisons all downstream reasoning
- **Latency** — every tool call adds a round trip; 10-step agents are slow

> **Practical rule:** Keep agent loops short (≤5 steps) for production.
> Add explicit stopping conditions and fallback paths.

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

---

# Q&A

*your.email@institution.edu*

Colab notebook: `[link]`
